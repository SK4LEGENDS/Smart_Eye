import os
import json
import torch
import torchvision.transforms as transforms
import torchvision.models as models
import torch.nn as nn
from PIL import Image
import numpy as np

import pandas as pd
from io import BytesIO
import base64
import logging
logging.basicConfig(filename='flask_debug.log', level=logging.DEBUG, 
                    format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin # Import CORS
from config import Config
from models import db, User, Prediction, Appointment, Document, LabBooking, AuditLog
from model.architectures import get_model, predict_with_uncertainty # Re-enable imports
from ocr_service import get_ocr_service  # OCR for document text extraction
from chat_service import ChatService # Import ChatService
from scipy.ndimage import zoom
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False
    print("Warning: requests module not available. DuckDNS updates will be disabled.")
import socket
import threading
import time

app = Flask(__name__)
# Enable CORS for all domains, supporting credentials (cookies) for session auth
# Enable CORS with specific configuration for Credentials
@app.errorhandler(500)
def handle_500(e):
    import traceback
    error_details = traceback.format_exc()
    app.logger.error(f"Internal Server Error: {error_details}")
    return jsonify({
        'error': 'Internal Server Error',
        'details': str(e),
        'traceback': error_details
    }), 500

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    """Endpoint for the Agentic Chatbot (works for both logged-in and anonymous users)"""
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message required'}), 400
        
    user_message = data['message']
    history = data.get('history', [])
    
    # Get current user if logged in, otherwise None
    user = current_user if current_user.is_authenticated else None
    
    chat_service = ChatService()
    result = chat_service.process_message(user, user_message, history)
    
    return jsonify(result), 200

# CORS setup
# Allow credentials (cookies) to be shared between frontend (3000) and backend (5000)
CORS(app, 
     resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
     supports_credentials=True)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized', 'message': 'Please log in to access this resource'}), 401

def log_event(action, target_type, target_id, details, user_id=None):
    try:
        # Use provided user_id, otherwise fall back to current_user if authenticated
        actor_id = user_id
        if actor_id is None:
            try:
                if current_user and current_user.is_authenticated:
                    actor_id = current_user.id
            except:
                pass
            
        if actor_id is None:
            # Fallback to system admin (ID 1) if no user authenticated
            # This avoids IntegrityError if the database was created with nullable=False
            actor_id = 1
            
        log = AuditLog(
            admin_id=actor_id,
            target_id=target_id,
            target_type=target_type,
            action=action,
            details=details
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Error logging event: {e}")
        db.session.rollback()

# Create database tables
with app.app_context():
    db.create_all()
    
    # Migration: Add heatmap_path column if it doesn't exist
    try:
        # Check if prediction table exists and if heatmap_path column exists
        with db.engine.connect() as conn:
            # Get table info
            result = conn.execute(db.text("PRAGMA table_info(prediction)"))
            columns = [row[1] for row in result]
            
            if 'heatmap_path' not in columns:
                # Add the column
                conn.execute(db.text('ALTER TABLE prediction ADD COLUMN heatmap_path VARCHAR(200)'))
                conn.commit()
                print("Migration: Added heatmap_path column to prediction table")
            else:
                print("Migration: heatmap_path column already exists")

            # Migration: Add uncertainty column
            if 'uncertainty' not in columns:
                conn.execute(db.text('ALTER TABLE prediction ADD COLUMN uncertainty FLOAT'))
                conn.commit()
                print("Migration: Added uncertainty column to prediction table")
            else:
                 print("Migration: uncertainty column already exists")
    except Exception as e:
        # Table might not exist yet (will be created by create_all with new column)
        if 'no such table' not in str(e).lower():
            print(f"Migration note: {e}")

    try:
        with db.engine.connect() as conn:
            # Check for Lab License in User table
            result = conn.execute(db.text("PRAGMA table_info(user)"))
            columns = [row[1] for row in result]
            if 'lab_license' not in columns:
                conn.execute(db.text('ALTER TABLE user ADD COLUMN lab_license VARCHAR(50)'))
                conn.commit()
                print("Migration: Added lab_license to user table")
            
            # Check for Lab fields in Prediction table
            result = conn.execute(db.text("PRAGMA table_info(prediction)"))
            columns = [row[1] for row in result]
            
            if 'lab_id' not in columns:
                conn.execute(db.text('ALTER TABLE prediction ADD COLUMN lab_id INTEGER REFERENCES user(id)'))
                conn.commit()
                print("Migration: Added lab_id to prediction table")
            
            if 'doctor_id' not in columns:
                conn.execute(db.text('ALTER TABLE prediction ADD COLUMN doctor_id INTEGER REFERENCES user(id)'))
                conn.commit()
                print("Migration: Added doctor_id to prediction table")
                
            if 'is_visible_to_patient' not in columns:
                conn.execute(db.text('ALTER TABLE prediction ADD COLUMN is_visible_to_patient BOOLEAN DEFAULT 0'))
                conn.commit()
                print("Migration: Added is_visible_to_patient to prediction table")
            
            if 'annotated_image_path' not in columns:
                conn.execute(db.text('ALTER TABLE prediction ADD COLUMN annotated_image_path VARCHAR(200)'))
                conn.commit()
                print("Migration: Added annotated_image_path to prediction table")
            
            if 'doctor_notes' not in columns:
                conn.execute(db.text('ALTER TABLE prediction ADD COLUMN doctor_notes TEXT'))
                conn.commit()
                print("Migration: Added doctor_notes to prediction table")
        
        # Check for AuditLog table
        inspector = db.inspect(db.engine)
        if 'audit_log' not in inspector.get_table_names():
            db.create_all() # This should assign it if not exists, but let's be safe or rely on create_all
            print("Migration: Verified/Created AuditLog table")
                
    except Exception as e:
        print(f"Migration error (Lab fields): {e}")
    
    # Create admin user if not exists
    admin = User.query.filter_by(email='admin@smarteyecare.com').first()
    if not admin:
        admin = User(
            email='admin@smarteyecare.com',
            name='Admin',
            user_type='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()

# Load Ensemble Models
loaded_models = {}
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_ensemble_models():
    """Loads all available models for ensemble prediction"""
    models_dict = {}
    
    # 1. Load Primary Model (AlexNet) - This MUST exist for legacy support
    print("Loading Primary Model (AlexNet)...")
    try:
        alexnet = models.alexnet(pretrained=False)
        alexnet.classifier[6] = nn.Linear(alexnet.classifier[6].in_features, 6)
        alexnet.load_state_dict(torch.load('model/retina_alexnet_state.pth', map_location=device))
        alexnet.eval()
        alexnet.to(device)
        models_dict['alexnet'] = alexnet
    except Exception as e:
        print(f"CRITICAL ERROR: Could not load AlexNet: {e}")
        
    # 2. Check for ResNet50 (The new research model)
    if os.path.exists('model/resnet50_best.pth'):
        print("Found ResNet50! Loading for Ensemble...")
        try:
            resnet = get_model('resnet50', num_classes=6, pretrained=False)
            resnet.load_state_dict(torch.load('model/resnet50_best.pth', map_location=device))
            resnet.eval()
            resnet.to(device)
            models_dict['resnet50'] = resnet
        except Exception as e:
            print(f"Warning: Failed to load ResNet50: {e}")
            
    print(f"Ensemble loaded with {len(models_dict)} models: {list(models_dict.keys())}")
    return models_dict

# Initialize Ensemble
ensemble_models = load_ensemble_models()
# Keep 'model' variable pointing to AlexNet for GradCAM compatibility
model = ensemble_models.get('alexnet')

# Class names
class_names = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal', 'redness', 'wrinkles']

# Disease information
disease_info = {
    'cataract': {
        'explanation': 'A cataract is a clouding of the lens in the eye which leads to a decrease in vision. Cataracts often develop slowly and can affect one or both eyes.',
        'recommendation': 'Consult an ophthalmologist for proper diagnosis. Treatment may include stronger lighting, eyeglasses, or surgery if the cataract progresses and significantly affects vision.'
    },
    'diabetic_retinopathy': {
        'explanation': 'Diabetic retinopathy is a diabetes complication that affects eyes. It\'s caused by damage to the blood vessels of the light-sensitive tissue at the back of the eye (retina).',
        'recommendation': 'Control blood sugar levels, blood pressure, and cholesterol. Regular eye exams are crucial. Treatment may include laser treatment, injections, or surgery depending on the severity.'
    },
    'glaucoma': {
        'explanation': 'Glaucoma is a group of eye conditions that damage the optic nerve, the health of which is vital for good vision. This damage is often caused by abnormally high pressure in your eye.',
        'recommendation': 'Regular eye exams are important for early detection. Treatment may include prescription eye drops, oral medications, laser treatment, or surgery to lower eye pressure.'
    },
    'normal': {
        'explanation': 'Your eye appears to be normal with no signs of the conditions we screen for. Continue to maintain regular eye check-ups.',
        'recommendation': 'Continue with regular eye examinations every 1-2 years, or as recommended by your eye care professional. Maintain a healthy lifestyle to protect your vision.'
    },
    'redness': {
        'explanation': 'Eye redness can be caused by many conditions, including dry eyes, allergies, infections, or eye strain. It occurs when tiny blood vessels on the surface of the eye become swollen.',
        'recommendation': 'Try over-the-counter artificial tears. Avoid rubbing your eyes. If redness persists or is accompanied by pain or vision changes, consult an eye care professional.'
    },
    'wrinkles': {
        'explanation': 'Wrinkles around the eyes are a natural part of aging. They can also be caused by sun exposure, smoking, and repeated facial expressions.',
        'recommendation': 'Protect your eyes from sun exposure with sunglasses. Use moisturizers and consider treatments like retinoids. For cosmetic concerns, consult a dermatologist.'
    }
}

# Image transforms
transform = transforms.Compose([
    transforms.Resize((227, 227)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# Transform for visualization (without normalization)
transform_vis = transforms.Compose([
    transforms.Resize((227, 227)),
    transforms.ToTensor(),
])

# GradCAM generation helper
def generate_gradcam(model, image_path, target_class_idx, device):
    
    # Load and preprocess image
    img = Image.open(image_path).convert('RGB')
    original_img = np.array(img)
    img_tensor = transform(img).unsqueeze(0).to(device)
    img_tensor.requires_grad = True
    
    # Get the last convolutional layer (features[12] in AlexNet)
    # AlexNet structure: features[0-11] are conv layers, features[12] is the last conv
    target_layer = model.features[12]  # Last conv layer before pooling
    
    # Hook to capture activations and gradients
    activations = []
    gradients = []
    
    def forward_hook(module, input, output):
        activations.append(output.detach())
    
    def backward_hook(module, grad_input, grad_output):
        if grad_output[0] is not None:
            gradients.append(grad_output[0])
    
    hook_forward = target_layer.register_forward_hook(forward_hook)
    hook_backward = target_layer.register_full_backward_hook(backward_hook)
    
    try:
        # Forward pass
        output = model(img_tensor)
        model.zero_grad()
        
        # Backward pass
        target_class_score = output[0, target_class_idx]
        target_class_score.backward()
        
        # Check if gradients were captured
        if len(gradients) == 0 or len(activations) == 0:
            raise ValueError("Failed to capture gradients or activations")
        
        # Get gradients and activations
        grad = gradients[0]
        act = activations[0]
        
        # Global Average Pooling of gradients
        weights = torch.mean(grad, dim=(2, 3), keepdim=True)
        
        # Weighted combination of activation maps
        gradcam = torch.sum(weights * act, dim=1, keepdim=True)
        gradcam = torch.relu(gradcam)
        
        # Normalize
        gradcam_np = gradcam.squeeze().cpu().detach().numpy()
        if gradcam_np.max() - gradcam_np.min() > 1e-8:
            gradcam_np = (gradcam_np - gradcam_np.min()) / (gradcam_np.max() - gradcam_np.min())
        
        # Resize to original image size
        if len(gradcam_np.shape) == 2:
            zoom_factors = (original_img.shape[0] / gradcam_np.shape[0], 
                           original_img.shape[1] / gradcam_np.shape[1])
            gradcam_resized = zoom(gradcam_np, zoom_factors)
        else:
            gradcam_resized = gradcam_np
        
        # Create heatmap overlay
        heatmap = plt.cm.jet(gradcam_resized)[:, :, :3]  # RGB
        heatmap = (heatmap * 255).astype(np.uint8)
        
        # Ensure original_img and heatmap have same dimensions
        if original_img.shape[:2] != heatmap.shape[:2]:
            # Resize heatmap to match original image
            from PIL import Image as PILImage
            heatmap_pil = PILImage.fromarray(heatmap)
            heatmap_pil = heatmap_pil.resize((original_img.shape[1], original_img.shape[0]))
            heatmap = np.array(heatmap_pil)
        
        # Overlay heatmap on original image
        overlay = (0.4 * original_img + 0.6 * heatmap).astype(np.uint8)
        
        # Create side-by-side visualization
        fig, axes = plt.subplots(1, 3, figsize=(15, 5))
        
        axes[0].imshow(original_img)
        axes[0].set_title('Original Image', fontsize=12)
        axes[0].axis('off')
        
        axes[1].imshow(gradcam_resized, cmap='jet')
        axes[1].set_title('GradCAM Heatmap', fontsize=12)
        axes[1].axis('off')
        
        axes[2].imshow(overlay)
        axes[2].set_title('Overlay Visualization', fontsize=12)
        axes[2].axis('off')
        
        plt.tight_layout()
        
        # Save to BytesIO
        img_buffer = BytesIO()
        plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
        img_buffer.seek(0)
        plt.close()
        
        return img_buffer
        
    except Exception as e:
        print(f"Error generating GradCAM: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        hook_forward.remove()
        hook_backward.remove()
        # Restore model to eval mode
        model.eval()


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return redirect(app.config.get('FRONTEND_URL', 'http://localhost:3000'))

@app.route('/me', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email,
                'user_type': current_user.user_type,
                'phone': current_user.phone,
                'location': current_user.location,
                'dob': current_user.dob,
                'gender': current_user.gender,
                'language': current_user.language,
                'timezone': current_user.timezone,
                'notif_email': current_user.notif_email,
                'notif_sms': current_user.notif_sms,
                'notif_appointments': current_user.notif_appointments,
                'notif_reports': current_user.notif_reports,
                'emergency_contact_name': current_user.emergency_contact_name,
                'emergency_contact_phone': current_user.emergency_contact_phone,
                'emergency_contact_relationship': current_user.emergency_contact_relationship,
                'two_factor_enabled': current_user.two_factor_enabled
            }
        }), 200
    return jsonify({'authenticated': False}), 200

@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400
        
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    location = data.get('location')
    
    # Check email duplicate if changed
    if email and email != current_user.email:
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        current_user.email = email
        
    if name: current_user.name = name
    if phone: current_user.phone = phone
    if location: current_user.location = location
    
    # New patient settings
    if 'dob' in data: current_user.dob = data['dob']
    if 'gender' in data: current_user.gender = data['gender']
    if 'language' in data: current_user.language = data['language']
    if 'timezone' in data: current_user.timezone = data['timezone']
    if 'notif_email' in data: current_user.notif_email = data['notif_email']
    if 'notif_sms' in data: current_user.notif_sms = data['notif_sms']
    if 'notif_appointments' in data: current_user.notif_appointments = data['notif_appointments']
    if 'notif_reports' in data: current_user.notif_reports = data['notif_reports']
    if 'emergency_contact_name' in data: current_user.emergency_contact_name = data['emergency_contact_name']
    if 'emergency_contact_phone' in data: current_user.emergency_contact_phone = data['emergency_contact_phone']
    if 'emergency_contact_relationship' in data: current_user.emergency_contact_relationship = data['emergency_contact_relationship']
    if 'two_factor_enabled' in data: current_user.two_factor_enabled = data['two_factor_enabled']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email,
                'user_type': current_user.user_type,
                'phone': current_user.phone,
                'location': current_user.location,
                'dob': current_user.dob,
                'gender': current_user.gender,
                'language': current_user.language,
                'timezone': current_user.timezone,
                'notif_email': current_user.notif_email,
                'notif_sms': current_user.notif_sms,
                'notif_appointments': current_user.notif_appointments,
                'notif_reports': current_user.notif_reports,
                'emergency_contact_name': current_user.emergency_contact_name,
                'emergency_contact_phone': current_user.emergency_contact_phone,
                'emergency_contact_relationship': current_user.emergency_contact_relationship,
                'two_factor_enabled': current_user.two_factor_enabled
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return jsonify({'message': 'Please login via POST'}), 200
        
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        login_user(user)
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'user_type': user.user_type
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing JSON body'}), 400
        
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    location = data.get('location')
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    new_user = User(
        name=name,
        email=email,
        phone=phone,
        location=location,
        user_type='patient'
    )
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()
    
    log_event('REGISTER', 'User', new_user.id, f"New patient registration: {name} ({email})", user_id=new_user.id)
    
    return jsonify({'message': 'Registration successful'}), 201

@app.route('/register_doctor', methods=['POST'])
def register_doctor():
    return jsonify({
        'error': 'Forbidden', 
        'message': 'Self-registration for Doctors is disabled. Please contact the administrator for account setup.'
    }), 403

@app.route('/register_lab', methods=['POST'])
def register_lab():
    return jsonify({
        'error': 'Forbidden', 
        'message': 'Self-registration for Labs is disabled. Please contact the administrator for account setup.'
    }), 403

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

# Patient routes


@app.route('/patient/dashboard', methods=['GET'])
@login_required
def patient_dashboard():
    if current_user.user_type != 'patient':
        return jsonify({'error': 'Access denied'}), 403
    
    # Get recent predictions (Only shared ones)
    recent_predictions = Prediction.query.filter_by(patient_id=current_user.id, is_visible_to_patient=True).order_by(Prediction.timestamp.desc()).limit(3).all()
    
    # Get upcoming lab bookings
    upcoming_bookings = LabBooking.query.filter_by(
        patient_id=current_user.id
    ).filter(
        LabBooking.date >= datetime.now().date(),
        LabBooking.status.notin_(['completed', 'cancelled', 'rejected'])
    ).order_by(LabBooking.date).all()
    
    # Pass current date to the template
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    # Process predictions safely
    predictions_data = []
    for p in recent_predictions:
        lab_name = "System"
        if p.lab:
            if hasattr(p.lab, 'clinic_name') and p.lab.clinic_name:
                lab_name = p.lab.clinic_name
            else:
                lab_name = p.lab.name
                
        predictions_data.append({
            'id': p.id,
            'predicted_class': p.predicted_class,
            'timestamp': p.timestamp.isoformat(),
            'lab_verified': p.lab_verified,
            'image_path': p.image_path,
            'lab': lab_name
        })

    # Process bookings safely
    bookings_data = []
    for b in upcoming_bookings:
        lab_name = "Awaiting Assignment"
        if b.lab:
            if hasattr(b.lab, 'clinic_name') and b.lab.clinic_name:
                lab_name = b.lab.clinic_name
            elif b.lab.name:
                lab_name = b.lab.name
                
        bookings_data.append({
            'id': b.id,
            'test_type': b.test_type,
            'date': b.date.isoformat(),
            'lab': lab_name,
            'status': b.status
        })

    return jsonify({
        'recent_predictions': predictions_data,
        'upcoming_bookings': bookings_data,
        'current_date': current_date
    }), 200





@app.route('/patient/prediction', methods=['GET', 'POST'])
@login_required
def patient_prediction():
    if current_user.user_type != 'patient':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    flash('Self-diagnosis is disabled. Please visit a registered Lab for analysis.', 'info')
    return redirect(url_for('patient_dashboard'))

@app.route('/patient/insights')
@login_required
def patient_insights():
    if current_user.user_type != 'patient':
         return jsonify({'error': 'Access denied'}), 403
    return jsonify({'message': 'Insights feature coming soon'}), 200

@app.route('/patient/prediction_history', methods=['GET'])
@login_required
def patient_prediction_history():
    if current_user.user_type != 'patient':
        return jsonify({'error': 'Access denied'}), 403
    
    predictions = Prediction.query.filter_by(patient_id=current_user.id, is_visible_to_patient=True).order_by(Prediction.timestamp.desc()).all()
    
    return jsonify({
        'predictions': [{
            'id': p.id,
            'predicted_class': p.predicted_class,
            'timestamp': p.timestamp.isoformat(),
            'lab_verified': p.lab_verified,
            'image_path': p.image_path,
            'explanation': p.explanation,
            'doctor': p.doctor.name if p.doctor else "Not Assigned",
            'lab': p.lab.clinic_name if (p.lab and hasattr(p.lab, 'clinic_name')) else (p.lab.name if p.lab else "System")
        } for p in predictions]
    }), 200

@app.route('/patient/doctors', methods=['GET'])
@login_required
def patient_doctors():
    if current_user.user_type != 'patient':
        return jsonify({'error': 'Access denied'}), 403
    
    doctors = User.query.filter_by(user_type='doctor').all()
    return jsonify({
        'doctors': [{
            'id': d.id,
            'name': d.name,
            'specialist': d.specialist,
            'clinic_name': d.clinic_name,
            'available': d.available,
            'location': d.location
        } for d in doctors]
    }), 200



@app.route('/patient/book_appointment/<int:doctor_id>', methods=['GET', 'POST'])
@login_required
def patient_book_appointment(doctor_id):
    if current_user.user_type != 'patient':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    doctor = User.query.get_or_404(doctor_id)
    if doctor.user_type != 'doctor':
        flash('Invalid doctor', 'danger')
        return redirect(url_for('patient_doctors'))
    
    if request.method == 'POST':
        date_str = request.form.get('date')
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
        
        # Check if appointment already exists
        existing_appointment = Appointment.query.filter_by(
            patient_id=current_user.id,
            doctor_id=doctor_id,
            date=date
        ).first()
        
        if existing_appointment:
            flash('You already have an appointment with this doctor on this date', 'warning')
        else:
            appointment = Appointment(
                patient_id=current_user.id,
                doctor_id=doctor_id,
                date=date
            )
            db.session.add(appointment)
            db.session.commit()
            flash('Appointment request sent successfully', 'success')
            return redirect(url_for('patient_appointments'))
    
    # Pass current date to the template
    current_date = datetime.now().strftime('%Y-%m-%d')
    return render_template('patient/book_appointment.html', doctor=doctor, current_date=current_date)

@app.route('/patient/book_lab_test', methods=['GET', 'POST'])
@login_required
def patient_book_lab_test():
    if current_user.user_type != 'patient':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        lab_id = request.form.get('lab_id')
        date_str = request.form.get('date')
        
        if not lab_id or not date_str:
             flash('Please select a Lab and a Date', 'warning')
        else:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            booking = LabBooking(
                patient_id=current_user.id,
                lab_id=lab_id,
                date=date,
                status='confirmed' # Auto-confirm for now
            )
            db.session.add(booking)
            db.session.commit()
            flash('Lab test scheduled successfully', 'success')
            return redirect(url_for('patient_dashboard'))

    labs = User.query.filter_by(user_type='lab').all()
    current_date = datetime.now().strftime('%Y-%m-%d')
    return render_template('patient/book_lab.html', labs=labs, current_date=current_date)

# New JSON API endpoint for React frontend
print("DEBUG: Registering /patient/book_lab endpoint...")
@app.route('/patient/book_lab', methods=['POST'])
@login_required
def patient_book_lab_api():
    try:
        app.logger.info(f"DEBUG: book_lab called by user: {current_user.email if current_user.is_authenticated else 'Not authenticated'}")
        
        if not current_user.is_authenticated:
            app.logger.error("DEBUG: User not authenticated inside function (unexpected)")
            return jsonify({'error': 'Not authenticated'}), 401

        app.logger.info(f"DEBUG: User type: '{current_user.user_type}'")
        
        if current_user.user_type != 'patient':
            app.logger.warning(f"DEBUG: Access denied - user type is '{current_user.user_type}'")
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        print(f"DEBUG: Received data: {data}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        date_str = data.get('date')
        time_slot = data.get('time_slot')
        visit_reason = data.get('visit_reason')
        
        print(f"DEBUG: date={date_str}, time_slot={time_slot}, visit_reason={visit_reason}")
        
        if not date_str or not time_slot or not visit_reason:
            return jsonify({'error': 'Date, time slot, and reason for visit are required'}), 400
        
        booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        print(f"DEBUG: Parsed date: {booking_date}")
        
        booking = LabBooking(
            patient_id=current_user.id,
            lab_id=None,
            date=booking_date,
            status='pending',
            time_slot=time_slot,
            visit_reason=visit_reason,
            wears_glasses=data.get('wears_glasses', ''),
            known_conditions=data.get('known_conditions', ''),
            additional_notes=data.get('additional_notes', '')
        )
        print(f"DEBUG: Created booking object")
        
        db.session.add(booking)
        print(f"DEBUG: Added to session")
        
        db.session.commit()
        print(f"DEBUG: Committed to database, booking ID: {booking.id}")
        
        log_event('CREATE', 'LabBooking', booking.id, f"Patient {current_user.name} requested eye examination for {date_str}")
        print(f"DEBUG: Logged event")
        
        return jsonify({'message': 'Appointment request submitted successfully', 'booking_id': booking.id}), 201
        
    except Exception as e:
        print(f"DEBUG: ERROR OCCURRED: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Verify route was registered
print("✓ /patient/book_lab endpoint registered successfully")

@app.route('/patient/appointments')
@login_required
def patient_appointments():
    if current_user.user_type != 'patient':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    appointments = Appointment.query.filter_by(patient_id=current_user.id).order_by(Appointment.date.desc()).all()
    current_date = datetime.now().date()
    return render_template('patient/appointments.html', appointments=appointments, current_date=current_date)





@app.route('/patient/documents', methods=['GET', 'POST'])
@login_required
def patient_documents():
    if current_user.user_type != 'patient':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        if 'document' not in request.files:
            flash('No file part', 'danger')
            return redirect(request.url)
        
        file = request.files['document']
        if file.filename == '':
            flash('No file selected', 'danger')
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{timestamp}_{filename}"
            
            # Create directory if it doesn't exist
            documents_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'documents')
            os.makedirs(documents_dir, exist_ok=True)
            
            # Save the full path in the database
            filepath = os.path.join('documents', filename)
            full_filepath = os.path.join(app.config['UPLOAD_FOLDER'], filepath)
            file.save(full_filepath)
            
            document = Document(
                patient_id=current_user.id,
                filename=filename,
                file_path=filepath  # Save relative path
            )
            db.session.add(document)
            db.session.commit()
            
            flash('Document uploaded successfully', 'success')
        else:
            flash('Invalid file type', 'danger')
    
    documents = Document.query.filter_by(patient_id=current_user.id).order_by(Document.timestamp.desc()).all()
    
    # Return JSON for React frontend
    if request.headers.get('Accept') == 'application/json' or request.is_json or request.method in ['GET', 'POST']:
        return jsonify({
            'documents': [{
                'id': doc.id,
                'filename': doc.filename,
                'file_path': doc.file_path,
                'timestamp': doc.timestamp.isoformat(),
                'extracted_text': doc.extracted_text,
                'ocr_confidence': doc.ocr_confidence
            } for doc in documents]
        })
    
    # Fallback to HTML template if needed
    return render_template('patient/documents.html', documents=documents)


@app.route('/patient/documents/<int:document_id>', methods=['DELETE'])
@login_required
def delete_patient_document(document_id):
    if current_user.user_type != 'patient':
        return jsonify({'error': 'Access denied'}), 403

    document = Document.query.get(document_id)
    if not document:
        return jsonify({'error': 'Document not found'}), 404

    # Ensure the document belongs to the current user
    if document.patient_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403

    try:
        # Delete physical file
        upload_folder = app.config['UPLOAD_FOLDER']
        full_filepath = os.path.join(upload_folder, document.file_path)
        if os.path.exists(full_filepath):
            os.remove(full_filepath)
        
        # Delete database record
        db.session.delete(document)
        db.session.commit()
        
        log_event('DELETE', 'Document', document_id, f"Patient {current_user.name} deleted document {document.filename}")
        
        return jsonify({'message': 'Document deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete document: {str(e)}'}), 500


@app.route('/patient/documents/extract/<int:document_id>', methods=['GET', 'POST'])
@login_required
def extract_document_text(document_id):
    """Extract text from uploaded document using OCR"""
    try:
        # Get document and verify ownership
        document = Document.query.get_or_404(document_id)
        
        if current_user.user_type != 'patient' or document.patient_id != current_user.id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Check if already extracted
        if request.method == 'GET' and document.extracted_text:
            return jsonify({
                'success': True,
                'text': document.extracted_text,
                'confidence': document.ocr_confidence,
                'cached': True,
                'message': 'Text retrieved from cache'
            })
        
        # Get file path
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], document.file_path)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'Document file not found'}), 404
        
        # Perform OCR
        print(f"Extracting text from document: {document.filename}")
        ocr_service = get_ocr_service()
        result = ocr_service.extract_text_from_image(file_path)
        
        if not result.get('success'):
            return jsonify({
                'error': result.get('error', 'OCR extraction failed'),
                'success': False
            }), 500
        
        # Store extracted text in database
        document.extracted_text = result.get('text', '')
        document.ocr_confidence = result.get('confidence', 0.0)
        db.session.commit()
        
        print(f"✓ Text extracted successfully (confidence: {result.get('confidence')}%)")
        
        return jsonify({
            'success': True,
            'text': result.get('text', ''),
            'confidence': result.get('confidence', 0.0),
            'lines_detected': result.get('lines_detected', 0),
            'cached': False,
            'message': 'Text extracted successfully'
        })
        
    except Exception as e:
        print(f"Error in OCR extraction: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e), 'success': False}), 500




@app.route('/patient/prediction_detail/<int:prediction_id>')
@login_required
def patient_prediction_detail(prediction_id):
    try:
        app.logger.debug(f"Patient View Request: Prediction {prediction_id} by User {current_user.id}")
        if current_user.user_type != 'patient':
            app.logger.warning(f"Access denied: User {current_user.id} is not a patient")
            return jsonify({'error': 'Access denied'}), 403
        
        prediction = Prediction.query.get_or_404(prediction_id)
        
        # Verify ownership
        if prediction.patient_id != current_user.id:
            app.logger.warning(f"Unauthorized: Prediction {prediction_id} belongs to patient {prediction.patient_id}, requested by {current_user.id}")
            return jsonify({'error': 'Unauthorized access'}), 403
        
        # Verify visibility
        if not prediction.is_visible_to_patient and current_user.user_type != 'admin':
            app.logger.warning(f"Visibility restricted: Prediction {prediction_id} is not shared yet")
            return jsonify({'error': 'Report not yet shared by doctor'}), 403

        # Safely extract names
        patient_name = prediction.patient.name if prediction.patient else "Unknown Patient"
        doctor_name = prediction.doctor.name if prediction.doctor else "Not Assigned"
        lab_name = prediction.lab.clinic_name if (prediction.lab and hasattr(prediction.lab, 'clinic_name')) else (prediction.lab.name if prediction.lab else "System")

        report_data = {
            'id': prediction.id,
            'patient_name': patient_name,
            'predicted_class': prediction.predicted_class,
            'confidence': float(prediction.confidence) if prediction.confidence is not None else 0.0,
            'image_path': prediction.image_path,
            'heatmap_path': prediction.heatmap_path,
            'annotated_image_path': prediction.annotated_image_path,
            'explanation': prediction.explanation,
            'recommendation': prediction.recommendation,
            'image_quality': prediction.image_quality,
            'lab_verified': prediction.lab_verified,
            'timestamp': prediction.timestamp.isoformat() if prediction.timestamp else None,
            'doctor_notes': prediction.doctor_notes or "",
            'doctor_name': doctor_name,
            'lab_name': lab_name,
            'status': 'Finalized' if prediction.is_visible_to_patient else 'Pending'
        }
        
        app.logger.debug(f"Successfully constructed report data for ID {prediction_id}")
        return jsonify({'report': report_data}), 200

    except Exception as e:
        import traceback
        app.logger.error(f"Error in patient_prediction_detail: {str(e)}\n{traceback.format_exc()}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500


@app.route('/patient/3d-eye')
@login_required
def patient_3d_eye():
    return jsonify({'message': '3D Eye feature not yet migrated'}), 501

@app.route('/patient/simulator')
@login_required
def patient_simulator():
    return jsonify({'message': 'Simulator feature not yet migrated'}), 501

@app.route('/api/patient/book_lab/<int:lab_id>', methods=['POST'])
@login_required
def book_lab_appointment(lab_id):
    """Book a lab appointment for the current patient"""
    if current_user.user_type != 'patient':
        return jsonify({'error': 'Access denied'}), 403
    
    try:
        # Verify lab exists
        lab = User.query.get(lab_id)
        if not lab or lab.user_type != 'lab':
            return jsonify({'error': 'Lab not found'}), 404
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing JSON body'}), 400
        
        # Validate required fields
        date_str = data.get('date')
        if not date_str:
            return jsonify({'error': 'Date is required'}), 400
        
        # Parse date
        try:
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Create lab booking
        booking = LabBooking(
            patient_id=current_user.id,
            lab_id=lab_id,
            date=appointment_date,
            status='pending',
            test_type=data.get('test_type', 'General Checkup'),
            priority=data.get('priority', 'Normal'),
            time_slot=data.get('time_slot'),
            visit_reason=data.get('visit_reason'),
            wears_glasses=data.get('wears_glasses'),
            known_conditions=data.get('known_conditions'),
            additional_notes=data.get('additional_notes')
        )
        
        db.session.add(booking)
        db.session.commit()
        
        log_event('CREATE', 'LabBooking', booking.id, 
                 f"Patient {current_user.name} booked lab appointment with {lab.name} for {appointment_date}")
        
        return jsonify({
            'message': 'Lab appointment booked successfully',
            'booking': {
                'id': booking.id,
                'lab_name': lab.name,
                'date': booking.date.isoformat(),
                'status': booking.status,
                'test_type': booking.test_type,
                'time_slot': booking.time_slot
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error booking lab appointment: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to book appointment: {str(e)}'}), 500


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    directory = os.path.join(app.config['UPLOAD_FOLDER'], os.path.dirname(filename))
    return send_from_directory(directory, os.path.basename(filename))

# Doctor routes
@app.route('/doctor/dashboard', methods=['GET'])
@login_required
def doctor_dashboard():
    if current_user.user_type != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    # Get recent lab reports assigned to this doctor
    recent_reports = Prediction.query.filter_by(doctor_id=current_user.id).order_by(Prediction.timestamp.desc()).limit(10).all()
    
    # "Pending Reviews" replaces "Today's Appointments" since system is report-based
    pending_reviews_count = Prediction.query.filter_by(
        doctor_id=current_user.id,
        is_visible_to_patient=False
    ).count()

    completed_reviews_count = Prediction.query.filter_by(
        doctor_id=current_user.id,
        is_visible_to_patient=True
    ).count()
    # Count patients who have at least one report assigned to this doctor
    patient_count = User.query.join(Prediction, User.id == Prediction.patient_id)\
        .filter(Prediction.doctor_id == current_user.id)\
        .distinct().count()
    
    return jsonify({
        'recent_reports': [{
            'id': r.id,
            'patient_name': r.patient.name,
            'patient_id': r.patient.id,
            'predicted_class': r.predicted_class,
            'timestamp': r.timestamp.isoformat(),
            'lab': r.lab.clinic_name if r.lab else 'System',
            'is_visible_to_patient': r.is_visible_to_patient,
            'image_path': r.image_path
        } for r in recent_reports],
        'pending_reviews_count': pending_reviews_count,
        'completed_reviews_count': completed_reviews_count,
        'total_reports_count': pending_reviews_count + completed_reviews_count,
        'patient_count': patient_count,
        'availability': User.query.get(current_user.id).available  # Fresh DB query
    }), 200

@app.route('/doctor/share_report/<int:prediction_id>', methods=['POST'])
@login_required
def doctor_share_report(prediction_id):
    if current_user.user_type != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    prediction = Prediction.query.get_or_404(prediction_id)
    
    # Verify this report is assigned to this doctor
    if prediction.doctor_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    # Toggle visibility
    prediction.is_visible_to_patient = True # Only enabling makes sense for "share"
    db.session.commit()
    
    return jsonify({'message': 'Report shared successfully'}), 200

@app.route('/doctor/report/<int:prediction_id>', methods=['GET'])
@login_required
def doctor_report_detail(prediction_id):
    if current_user.user_type != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    prediction = Prediction.query.get_or_404(prediction_id)
    
    # Verify this report is assigned to this doctor
    if prediction.doctor_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    return jsonify({
        'report': {
            'id': prediction.id,
            'patient_name': prediction.patient.name,
            'patient_id': prediction.patient_id,
            'predicted_class': prediction.predicted_class,
            'confidence': prediction.confidence,
            'image_path': prediction.image_path,
            'heatmap_path': prediction.heatmap_path,
            'explanation': prediction.explanation,
            'recommendation': prediction.recommendation,
            'image_quality': prediction.image_quality,
            'lab_verified': prediction.lab_verified,
            'is_visible_to_patient': prediction.is_visible_to_patient,
            'created_at': prediction.timestamp.isoformat(),
            'doctor_notes': prediction.doctor_notes,
            'lab_name': prediction.lab.clinic_name if prediction.lab else 'System',
            'annotated_image_path': prediction.annotated_image_path,
            'status': 'Shared' if prediction.is_visible_to_patient else 'Pending'
        }
    }), 200

@app.route('/doctor/report/<int:prediction_id>/notes', methods=['POST'])
@login_required
def doctor_add_notes(prediction_id):
    if current_user.user_type != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    prediction = Prediction.query.get_or_404(prediction_id)
    
    # Verify this report is assigned to this doctor
    if prediction.doctor_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    data = request.get_json()
    notes = data.get('notes', '')
    
    prediction.doctor_notes = notes
    db.session.commit()
    
    log_event('UPDATE', 'Prediction', prediction.id, f"Doctor {current_user.name} updated notes for patient {prediction.patient.name}")
    
    return jsonify({'message': 'Notes saved successfully', 'notes': notes}), 200

@app.route('/doctor/report/<int:prediction_id>/save_all', methods=['POST'])
@login_required
def doctor_save_report_all(prediction_id):
    if current_user.user_type != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    prediction = Prediction.query.get_or_404(prediction_id)
    
    # Verify this report is assigned to this doctor
    if prediction.doctor_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403
    
    data = request.get_json()
    app.logger.info(f"Save All Request for Prediction {prediction_id}")
    
    # Save doctor notes
    prediction.doctor_notes = data.get('notes', '')
    
    # Save annotation image if provided
    annotation_base64 = data.get('annotation_image')
    if annotation_base64:
        app.logger.info(f"Received annotation data. Length: {len(annotation_base64)}")
        if annotation_base64.startswith('data:image'):
            try:
                import base64
                import time
                
                # Extract base64 data (remove data:image/png;base64, prefix)
                image_data = annotation_base64.split(',')[1]
                image_bytes = base64.b64decode(image_data)
                
                # Generate unique filename
                filename = f"annotation_{prediction.id}_{int(time.time())}.png"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                
                # Save file
                with open(filepath, 'wb') as f:
                    f.write(image_bytes)
                
                prediction.annotated_image_path = filename
                app.logger.info(f"Saved annotation to {filename}")
            except Exception as e:
                app.logger.error(f"Failed to save annotation image: {e}")
        else:
            app.logger.warning("Annotation data does not start with data:image")
    else:
        app.logger.info("No annotation_image in request data")
    
    # Update visibility (share with patient or save as draft)
    prediction.is_visible_to_patient = data.get('share_with_patient', False)
    
    db.session.commit()
    
    log_event('UPDATE', 'Prediction', prediction.id, f"Doctor {current_user.name} saved report details for patient {prediction.patient.name}")
    
    return jsonify({
        'message': 'Report saved successfully',
        'shared': prediction.is_visible_to_patient,
        'annotated_image_path': prediction.annotated_image_path
    }), 200

@app.route('/doctor/patients', methods=['GET'])
@login_required
def doctor_patients():
    if current_user.user_type != 'doctor':
         return jsonify({'error': 'Access denied'}), 403
    
    # Filter patients who have at least one report assigned to this doctor
    patients = User.query.join(Prediction, User.id == Prediction.patient_id)\
        .filter(Prediction.doctor_id == current_user.id)\
        .distinct().all()
        
    return jsonify({
        'patients': [{
            'id': p.id,
            'name': p.name,
            'email': p.email,
            'location': p.location,
            'last_report_date': p.predictions_as_patient[-1].timestamp.isoformat() if p.predictions_as_patient else None
        } for p in patients]
    }), 200

@app.route('/doctor/reports', methods=['GET'])
@login_required
def doctor_reports():
    if current_user.user_type != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    # Optional filtering
    status_filter = request.args.get('status')
    
    query = Prediction.query.filter_by(doctor_id=current_user.id)
    
    if status_filter == 'pending':
        query = query.filter_by(is_visible_to_patient=False)
    elif status_filter == 'finalized':
        query = query.filter_by(is_visible_to_patient=True)
        
    reports = query.order_by(Prediction.timestamp.desc()).all()
    
    return jsonify({
        'reports': [{
            'id': r.id,
            'patient_name': r.patient.name,
            'patient_id': r.patient.id,
            'predicted_class': r.predicted_class,
            'timestamp': r.timestamp.isoformat(),
            'lab': r.lab.clinic_name if r.lab else 'System',
            'is_visible_to_patient': r.is_visible_to_patient,
            'image_path': r.image_path,
            'doctor_notes': r.doctor_notes
        } for r in reports]
    }), 200

@app.route('/doctor/patient_details/<int:patient_id>', methods=['GET'])
@login_required
def doctor_patient_details(patient_id):
    if current_user.user_type != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    patient = User.query.get_or_404(patient_id)
    
    predictions = Prediction.query.filter_by(patient_id=patient_id).order_by(Prediction.timestamp.desc()).all()
    
    return jsonify({
        'patient': {
            'id': patient.id,
            'name': patient.name,
            'email': patient.email,
            'location': patient.location,
            'phone': patient.phone
        },
        'predictions': [{
            'id': p.id,
            'predicted_class': p.predicted_class,
            'timestamp': p.timestamp.isoformat(),
            'lab_verified': p.lab_verified,
            'image_path': p.image_path,
            'explanation': p.explanation,
            'is_visible_to_patient': p.is_visible_to_patient,
            'lab': p.lab.clinic_name if p.lab else 'System'
        } for p in predictions]
    }), 200

@app.route('/doctor/appointments')
@login_required
def doctor_appointments():
    if current_user.user_type != 'doctor':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    appointments = Appointment.query.filter_by(doctor_id=current_user.id).order_by(Appointment.date.desc()).all()
    
    # Logic to find "Waiting" patients (Assigned by Lab but no Appointment booked)
    # 1. Get all patients assigned to this doctor via Predictions
    assigned_predictions = Prediction.query.filter_by(doctor_id=current_user.id).all()
    assigned_patient_ids = {p.patient_id for p in assigned_predictions}
    
    # 2. Get all patients who ALREADY have an appointment with this doctor
    booked_appointments = Appointment.query.filter_by(doctor_id=current_user.id).all()
    booked_patient_ids = {a.patient_id for a in booked_appointments}
    
    # 3. Find difference
    waiting_patient_ids = assigned_patient_ids - booked_patient_ids
    
    # 4. Fetch User objects
    waiting_patients = []
    if waiting_patient_ids:
        waiting_patients = User.query.filter(User.id.in_(waiting_patient_ids)).all()
        
    # Return JSON for waiting patients instead of template
    return jsonify({
        'appointments': [{'id': a.id, 'date': a.date.isoformat(), 'status': a.status, 'patient_name': a.patient.name} for a in appointments],
        'waiting_patients': [{'id': u.id, 'name': u.name} for u in waiting_patients]
    }), 200

@app.route('/doctor/update_appointment/<int:appointment_id>/<string:status>')
@login_required
def doctor_update_appointment(appointment_id, status):
    if current_user.user_type != 'doctor':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    appointment = Appointment.query.get_or_404(appointment_id)
    if appointment.doctor_id != current_user.id:
        flash('Access denied', 'danger')
        return redirect(url_for('doctor_appointments'))
    
    if status in ['accepted', 'rejected']:
        appointment.status = status
        db.session.commit()
        flash(f'Appointment {status}', 'success')
    
    return redirect(url_for('doctor_appointments'))

@app.route('/doctor/availability', methods=['POST'])
@login_required
def doctor_availability():
    if current_user.user_type != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    if not data or 'available' not in data:
         return jsonify({'error': 'Missing status'}), 400

    current_user.available = data['available']
    db.session.commit()
    
    log_event('STATUS', 'User', current_user.id, f"Doctor {current_user.name} changed status to {'Available' if current_user.available else 'Away'}")
    
    return jsonify({
        'message': 'Availability updated',
        'available': current_user.available
    }), 200

@app.route('/admin/log_event', methods=['POST'])
@login_required
def api_log_event():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    action = data.get('action')
    target_type = data.get('target_type', 'System')
    target_id = data.get('target_id', 0)
    details = data.get('details', '')
    
    if not action:
        return jsonify({'error': 'Action is required'}), 400
        
    log_event(action, target_type, target_id, details)
    return jsonify({'success': True}), 200



@app.route('/doctor/patient_predictions/<int:patient_id>')
@login_required
def doctor_patient_predictions(patient_id):
    if current_user.user_type != 'doctor':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    patient = User.query.get_or_404(patient_id)
    if patient.user_type != 'patient':
        flash('Invalid patient', 'danger')
        return redirect(url_for('doctor_patients'))
    
    predictions = Prediction.query.filter_by(patient_id=patient_id).order_by(Prediction.timestamp.desc()).all()
    documents = Document.query.filter_by(patient_id=patient_id).order_by(Document.timestamp.desc()).all()
    
    # Check if this doctor has any accepted appointment with this patient
    has_accepted_appointment = Appointment.query.filter_by(
        doctor_id=current_user.id,
        patient_id=patient_id,
        status='accepted'
    ).first() is not None
    
    return jsonify({
        'patient': {'id': patient.id, 'name': patient.name},
        'predictions': [{'id': p.id, 'predicted_class': p.predicted_class} for p in predictions],
        'has_accepted_appointment': has_accepted_appointment
    }), 200

@app.route('/doctor/save_annotation/<int:prediction_id>', methods=['POST'])
@login_required
def save_annotation(prediction_id):
    if current_user.user_type != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
        
    prediction = Prediction.query.get_or_404(prediction_id)
    
    # Ensure this doctor is assigned to this prediction OR has an appointment with the patient
    # For now, simplistic check: if they can see it, they can annotate it (if they are a doctor)
    
    data = request.json
    if not data:
         return jsonify({'error': 'No data provided'}), 400

    # 1. Save Annotation Data (JSON for editable state if needed later, though for now we focus on image)
    # 1. Save Annotation Data (JSON for editable state if needed later, though for now we focus on image)
    if 'json_data' in data:
         prediction.annotation_data = json.dumps(data['json_data'])
         
    if 'notes' in data:
        prediction.doctor_notes = data['notes']
    
    # 2. Save Annotated Image (Base64 -> PNG)
    if 'image' in data:
        try:
            image_data = data['image']
            # Remove header if present (e.g., "data:image/png;base64,")
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode
            image_bytes = base64.b64decode(image_data)
            
            # Generate filename
            filename = f"annotation_{prediction.id}_{int(time.time())}.png"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Save to disk
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
                
            # Update DB
            prediction.annotated_image_path = filename
            
        except Exception as e:
            print(f"Error saving annotation image: {e}")
            return jsonify({'error': str(e)}), 500

    db.session.commit()
    log_event('UPDATE', 'Prediction', prediction.id, f"Doctor {current_user.name} saved image annotations for patient {prediction.patient.name}")
    return jsonify({'success': True, 'filename': prediction.annotated_image_path})
    
    return render_template('doctor/patient_predictions.html', patient=patient, predictions=predictions)



@app.route('/doctor/prediction_detail/<int:prediction_id>')
@login_required
def doctor_prediction_detail(prediction_id):
    if current_user.user_type != 'doctor':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    prediction = Prediction.query.get_or_404(prediction_id)
    
    return jsonify({
        'prediction': {'id': prediction.id, 'predicted_class': prediction.predicted_class, 'explanation': prediction.explanation}
    }), 200





# Admin routes
@app.route('/admin/dashboard', methods=['GET', 'OPTIONS'])
@cross_origin(supports_credentials=True)
@login_required
def admin_dashboard():
    # Security check enabled
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    # Get statistics
    patient_count = User.query.filter_by(user_type='patient').count()
    doctor_count = User.query.filter_by(user_type='doctor').count()
    lab_count = User.query.filter_by(user_type='lab').count()
    prediction_count = Prediction.query.count()
    appointment_count = Appointment.query.count()
    
    # Get recent predictions
    recent_predictions = Prediction.query.order_by(Prediction.timestamp.desc()).limit(5).all()
    
    return jsonify({
        'stats': {
            'patient_count': patient_count,
            'doctor_count': doctor_count,
            'lab_count': lab_count,
            'prediction_count': prediction_count,
            'appointment_count': appointment_count
        },
        'recent_predictions': [{
            'id': p.id,
            'patient_name': p.patient.name,
            'predicted_class': p.predicted_class,
            'timestamp': p.timestamp.isoformat(),
            'lab': p.lab.clinic_name if p.lab else 'System',
            'lab_verified': p.lab_verified
        } for p in recent_predictions]
    }), 200

@app.route('/admin/patients', methods=['GET'])
@login_required
def admin_patients():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    patients = User.query.filter_by(user_type='patient').all()
    return jsonify({
        'patients': [{
            'id': p.id,
            'name': p.name,
            'email': p.email,
            'location': p.location,
            'phone': p.phone
        } for p in patients]
    }), 200

@app.route('/admin/doctors', methods=['GET'])
@login_required
def admin_doctors():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    doctors = User.query.filter_by(user_type='doctor').all()
    return jsonify({
        'doctors': [{
            'id': d.id,
            'name': d.name,
            'email': d.email,
            'specialist': d.specialist,
            'clinic_name': d.clinic_name,
            'location': d.location,
            'available': d.available
        } for d in doctors]
    }), 200

@app.route('/admin/predictions', methods=['GET'])
@login_required
def admin_predictions():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    predictions = Prediction.query.order_by(Prediction.timestamp.desc()).all()
    return jsonify({
        'predictions': [{
            'id': p.id,
            'patient_name': p.patient.name,
            'predicted_class': p.predicted_class,
            'confidence': p.confidence,
            'timestamp': p.timestamp.isoformat(),
            'lab_verified': p.lab_verified,
            'lab': p.lab.clinic_name if p.lab else 'System'
        } for p in predictions]
    }), 200

@app.route('/admin/reports', methods=['GET'])
@login_required
def admin_reports():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    # Filtering logic (Same as Lab, but Global)
    status_filter = request.args.get('status', 'all')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    search_query = request.args.get('search')
    
    query = Prediction.query
    
    if status_filter == 'verified':
        query = query.filter_by(lab_verified=True)
    elif status_filter == 'pending':
        query = query.filter_by(lab_verified=False)
        
    if date_from:
        try:
            start_date = datetime.strptime(date_from, '%Y-%m-%d')
            query = query.filter(Prediction.timestamp >= start_date)
        except ValueError: pass
    if date_to:
        try:
            end_date = datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1)
            query = query.filter(Prediction.timestamp < end_date)
        except ValueError: pass
        
    if search_query:
        query = query.join(User, Prediction.patient_id == User.id).filter(User.name.ilike(f'%{search_query}%'))
        
    predictions = query.order_by(Prediction.timestamp.desc()).all()
    
    return jsonify({
        'predictions': [{
            'id': p.id,
            'patient_name': p.patient.name,
            'predicted_class': p.predicted_class,
            'confidence': p.confidence,
            'timestamp': p.timestamp.isoformat(),
            'lab_verified': p.lab_verified,
            'lab': p.lab.clinic_name if p.lab else 'System',
            'doctor_name': p.doctor.name if p.doctor else 'Not Assigned',
            'doctor_notes': p.doctor_notes if p.doctor_notes else 'No clinical notes provided'
        } for p in predictions]
    }), 200

@app.route('/admin/report/delete/<int:prediction_id>', methods=['POST'])
@login_required
def admin_delete_report(prediction_id):
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
        
    report = Prediction.query.get_or_404(prediction_id)
    patient_name = report.patient.name if report.patient else "Unknown"
    
    # File cleanup
    files_to_delete = [report.image_path, report.heatmap_path, report.annotated_image_path]
    for file_path in files_to_delete:
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error deleting file {file_path}: {e}")
                
    db.session.delete(report)
    db.session.commit()
    
    log_event('DELETE', 'Prediction', prediction_id, f"Deleted report for patient {patient_name}")
    
    return jsonify({'message': 'Report deleted successfully'}), 200

@app.route('/admin/reports/delete_all', methods=['POST'])
@login_required
def admin_delete_all_reports():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
        
    reports = Prediction.query.all()
    count = len(reports)
    
    for report in reports:
        # File cleanup
        files_to_delete = [report.image_path, report.heatmap_path, report.annotated_image_path]
        for file_path in files_to_delete:
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Error deleting file {file_path}: {e}")
        db.session.delete(report)
        
    db.session.commit()
    
    log_event('DELETE_ALL', 'Prediction', 0, f"Deleted all {count} reports from the system")
    
    return jsonify({'message': f'Successfully deleted {count} reports'}), 200

@app.route('/admin/analytics', methods=['GET'])

@login_required
def admin_analytics():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    # Disease distribution
    disease_counts = db.session.query(
        Prediction.predicted_class, 
        db.func.count(Prediction.id)
    ).group_by(Prediction.predicted_class).all()
    
    disease_labels = [item[0] for item in disease_counts]
    disease_values = [item[1] for item in disease_counts]
    
    # Patient location distribution
    location_counts = db.session.query(
        User.location, 
        db.func.count(User.id)
    ).filter_by(user_type='patient').group_by(User.location).all()
    
    location_labels = [item[0] for item in location_counts if item[0]]
    location_values = [item[1] for item in location_counts if item[0]]
    
    return jsonify({
        'disease_distribution': {
            'labels': disease_labels,
            'values': disease_values
        },
        'location_distribution': {
            'labels': location_labels,
            'values': location_values
        }
    }), 200



@app.route('/admin/patient_details/<int:patient_id>')
@login_required
def admin_patient_details(patient_id):
    if current_user.user_type != 'admin':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    patient = User.query.get_or_404(patient_id)
    if patient.user_type != 'patient':
        flash('Invalid patient', 'danger')
        return redirect(url_for('admin_patients'))
    
    predictions = Prediction.query.filter_by(patient_id=patient_id).order_by(Prediction.timestamp.desc()).all()
    documents = Document.query.filter_by(patient_id=patient_id).order_by(Document.timestamp.desc()).all()
    
    return render_template('admin/patient_details.html',
                          patient=patient,
                          predictions=predictions,
                          documents=documents)



@app.route('/admin/doctor_details/<int:doctor_id>')
@login_required
def admin_doctor_details(doctor_id):
    if current_user.user_type != 'admin':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    doctor = User.query.get_or_404(doctor_id)
    if doctor.user_type != 'doctor':
        flash('Invalid doctor', 'danger')
        return redirect(url_for('admin_doctors'))
    
    # Get appointments for this doctor
    appointments = Appointment.query.filter_by(doctor_id=doctor_id).order_by(Appointment.date.desc()).all()
    
    return render_template('admin/doctor_details.html',
                          doctor=doctor,
                          appointments=appointments)

@app.route('/admin/labs')
@login_required
def admin_labs():
    if current_user.user_type != 'admin':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    labs = User.query.filter_by(user_type='lab').all()
    return render_template('admin/labs.html', labs=labs)

@app.route('/admin/lab/<int:user_id>')
@login_required
def admin_lab_details(user_id):
    if current_user.user_type != 'admin':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
        
    lab = User.query.get_or_404(user_id)
    if lab.user_type != 'lab':
        flash('User is not a lab', 'warning')
        return redirect(url_for('admin_dashboard'))
        
    # Get Lab History
    predictions = Prediction.query.filter_by(lab_id=lab.id).order_by(Prediction.timestamp.desc()).all()
    
    return render_template('admin/lab_details.html', lab=lab, predictions=predictions)



    return render_template('admin/doctor_details.html',
                          doctor=doctor,
                          appointments=appointments)

@app.route('/admin/user/edit/<int:user_id>', methods=['POST'])
@login_required
def admin_edit_user(user_id):
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    user = User.query.get_or_404(user_id)
    data = request.form
    
    changes = []
    
    # Update Basic Fields
    if 'name' in data and data['name'] != user.name:
        changes.append(f"Name: {user.name} -> {data['name']}")
        user.name = data['name']
        
    if 'email' in data and data['email'] != user.email:
        changes.append(f"Email: {user.email} -> {data['email']}")
        user.email = data['email']
        
    if 'phone' in data and data['phone'] != user.phone:
        changes.append(f"Phone: {user.phone} -> {data['phone']}")
        user.phone = data['phone']
        
    if 'location' in data and data['location'] != user.location:
        changes.append(f"Location: {user.location} -> {data['location']}")
        user.location = data['location']
    
    # Update Role specific
    if user.user_type == 'doctor':
        if 'specialist' in data and data['specialist'] != user.specialist:
             changes.append(f"Specialist: {user.specialist} -> {data['specialist']}")
             user.specialist = data['specialist']
             
    if changes:
        db.session.commit()
        log_event('UPDATE', 'User', user.id, f"Updated fields: {', '.join(changes)}")
        flash('User details updated successfully.', 'success')
    else:
        flash('No changes detected.', 'info')
        
    # Redirect back to where we came from
    if user.user_type == 'doctor':
        return redirect(url_for('admin_doctor_details', doctor_id=user.id))
    elif user.user_type == 'patient':
        return redirect(url_for('admin_patient_details', patient_id=user.id))
    else:
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/user/delete/<int:user_id>', methods=['POST'])
@login_required
def admin_delete_user(user_id):
    if current_user.user_type != 'admin':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
        
    user = User.query.get_or_404(user_id)
    name = user.name
    type_ = user.user_type
    
    # We might want to Soft Delete usually, but for this "Control Panel" feel let's hard delete 
    # OR implement soft delete if an is_active flag existed. 
    # For now, let's just log it and Delete.
    
    try:
        # SUPER NUCLEAR OPTION: Pure SQL, No ORM Loading
        # We fetch details as a tuple only, so the ORM never tracks a 'User' object.
        # This guarantees SQLAlchemy cannot trigger "UPDATE appointment SET doctor_id=NULL".
        
        # 1. Get info for logging (Read-only, no tracking)
        user_info = db.session.execute(
            db.text("SELECT name, user_type FROM user WHERE id = :uid"), 
            {'uid': user_id}
        ).first()
        
        if not user_info:
            flash('User not found.', 'danger')
            return redirect(url_for('admin_dashboard'))
            
        name, type_ = user_info[0], user_info[1]
        
        # 2. Delete Dependencies (Raw SQL)
        if type_ == 'doctor':
            db.session.execute(db.text("DELETE FROM appointment WHERE doctor_id = :uid"), {'uid': user_id})
            db.session.execute(db.text("UPDATE prediction SET doctor_id = NULL WHERE doctor_id = :uid"), {'uid': user_id})
            
        elif type_ == 'patient':
            db.session.execute(db.text("DELETE FROM appointment WHERE patient_id = :uid"), {'uid': user_id})
            db.session.execute(db.text("DELETE FROM prediction WHERE patient_id = :uid"), {'uid': user_id})
            db.session.execute(db.text("DELETE FROM document WHERE patient_id = :uid"), {'uid': user_id})
            db.session.execute(db.text("DELETE FROM lab_booking WHERE patient_id = :uid"), {'uid': user_id})

        # 3. Delete the User (Raw SQL)
        db.session.execute(db.text("DELETE FROM user WHERE id = :uid"), {'uid': user_id})
        
        # 4. Commit everything
        db.session.commit()
        
        log_event('DELETE', 'User', user_id, f"Deleted {type_} account: {name} (Force)")
        flash(f'{type_.title()} {name} has been permanently deleted.', 'success')
        
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting user: {str(e)}', 'danger')
        
    if type_ == 'doctor':
        return redirect(url_for('admin_doctors'))
    return redirect(url_for('admin_patients'))

@app.route('/admin/user/create', methods=['GET', 'POST'])
@login_required
def admin_create_user():
    if current_user.user_type != 'admin':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role') # 'patient' or 'doctor'
        
        # Check if exists
        if User.query.filter_by(email=email).first():
            flash('Email already registered.', 'danger')
            return redirect(url_for('admin_create_user'))
            
        try:
            new_user = User(
                name=name,
                email=email,
                user_type=role,
                location=request.form.get('location', 'N/A')
            )
            new_user.set_password(password)
            
            if role == 'doctor':
                new_user.specialist = request.form.get('specialist', 'general_ophthalmologist')
                new_user.available = True
            elif role == 'lab':
                new_user.lab_license = request.form.get('license', 'PENDING')
                new_user.location = request.form.get('location', 'Unknown')
                
            db.session.add(new_user)
            db.session.commit()
            
            log_event('CREATE', 'User', new_user.id, f"Created new {role}: {name} ({email})")
            flash(f'New {role} created successfully!', 'success')
            
            if role == 'doctor':
                return jsonify({'message': 'Doctor created', 'id': new_user.id}), 201
            elif role == 'lab':
                return jsonify({'message': 'Lab created', 'id': new_user.id}), 201
            else:
                 return jsonify({'message': 'Patient created', 'id': new_user.id}), 201
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            
    return jsonify({'message': 'Create User endpoint ready'}), 200

@app.route('/admin/logs')
@login_required
def admin_logs():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
        
    # Get last 100 logs with admin details
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    
    return jsonify({
        'logs': [{
            'id': l.id, 
            'action': l.action, 
            'target_type': l.target_type, 
            'target_id': l.target_id,
            'details': l.details, 
            'timestamp': l.timestamp.isoformat(),
            'actor_name': l.admin.name if l.admin else 'System'
        } for l in logs]
    }), 200

@app.route('/admin/bookings')
@login_required
def admin_bookings():
    if current_user.user_type != 'admin':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    bookings = LabBooking.query.order_by(LabBooking.date.desc()).all()
    return jsonify({'bookings': [{'id': b.id, 'date': b.date.isoformat(), 'status': b.status} for b in bookings]}), 200

@app.route('/admin/prediction_detail/<int:prediction_id>')
@login_required
def admin_prediction_detail(prediction_id):
    if current_user.user_type != 'admin':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    prediction = Prediction.query.get_or_404(prediction_id)
    
    return jsonify({'prediction': {'id': prediction.id, 'class': prediction.predicted_class}}), 200

def get_local_ip():
    """Get local IP address"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def get_public_ip():
    """Get public IP address"""
    if not REQUESTS_AVAILABLE:
        return None
    try:
        response = requests.get('https://api.ipify.org', timeout=5)
        return response.text.strip()
    except:
        return None

def update_duckdns(token, domain):
    """Update DuckDNS with current IP address"""
    if not REQUESTS_AVAILABLE:
        return False
    try:
        url = f"https://www.duckdns.org/update?domains={domain}&token={token}&ip="
        response = requests.get(url, timeout=10)
        if response.text.strip() == "OK":
            return True
        else:
            print(f"DuckDNS update failed: {response.text}")
            return False
    except Exception as e:
        print(f"Error updating DuckDNS: {e}")
        return False

def periodic_duckdns_update(token, domain, interval=1800):  # 30 minutes
    """Periodically update DuckDNS IP"""
    while True:
        time.sleep(interval)
        if update_duckdns(token, domain):
            print(f"[{datetime.now().strftime('%H:%M:%S')}] ✓ DuckDNS IP updated")

# Lab Routes
@app.route('/lab/dashboard', methods=['GET'])
@login_required
def lab_dashboard():
    if current_user.user_type != 'lab':
        return jsonify({'error': 'Access denied'}), 403
    
    # Get recent analyses (Exclude archived)
    recent_predictions = Prediction.query.filter_by(lab_id=current_user.id, is_archived=False).order_by(Prediction.timestamp.desc()).limit(10).all()
    
    # Calculate Reports Released (Today)
    today = datetime.now().date()
    released_today = Prediction.query.filter(
        Prediction.lab_id == current_user.id,
        Prediction.lab_verified == True,
        db.func.date(Prediction.timestamp) == today
    ).count()

    # Get upcoming bookings (ONLY active ones)
    bookings = LabBooking.query.filter(
        db.or_(LabBooking.lab_id == current_user.id, LabBooking.lab_id == None),
        LabBooking.status.notin_(['completed', 'cancelled'])
    ).order_by(LabBooking.date).all()
    
    return jsonify({
        'recent_predictions': [{
            'id': p.id,
            'patient_name': p.patient.name,
            'predicted_class': p.predicted_class,
            'confidence': p.confidence,
            'timestamp': p.timestamp.isoformat(),
            'lab_verified': p.lab_verified,
            'image_quality': p.image_quality
        } for p in recent_predictions],
        'bookings': [{
            'id': b.id,
            'patient_id': b.patient_id,
            'patient_name': b.patient_booking_user.name if b.patient_booking_user else "Unknown",
            'test_type': b.test_type,
            'date': b.date.isoformat(),
            'status': b.status
        } for b in bookings],
        'released_today': released_today
    }), 200

@app.route('/lab/clear_history', methods=['POST'])
@login_required
def lab_clear_history():
    if current_user.user_type != 'lab':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
        
    try:
        # Archive all VERIFIED predictions for this lab (Soft Delete from Dashboard)
        num_archived = Prediction.query.filter_by(lab_id=current_user.id, lab_verified=True).update({Prediction.is_archived: True})
        db.session.commit()
        flash(f'Successfully cleared {num_archived} verified reports from dashboard.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error clearing history: {str(e)}', 'danger')
        
    return redirect(url_for('lab_dashboard'))

@app.route('/lab/history')
@login_required
def lab_history():
    if current_user.user_type != 'lab':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    # Base query for this lab's predictions
    query = Prediction.query.filter_by(lab_id=current_user.id)
    
    # 1. Status Filter
    status_filter = request.args.get('status', 'all')
    if status_filter == 'verified':
        query = query.filter(Prediction.lab_verified == True)
    elif status_filter == 'pending':
        query = query.filter(Prediction.lab_verified == False)
        
    # 2. Date Range Filter
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    if date_from:
        try:
             start_date = datetime.strptime(date_from, '%Y-%m-%d')
             query = query.filter(Prediction.timestamp >= start_date)
        except ValueError:
            pass
    if date_to:
        try:
             # Add one day to include the end date fully (since timestamps have times)
             end_date = datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1)
             query = query.filter(Prediction.timestamp < end_date)
        except ValueError:
            pass
            
    # 3. Patient Name Search (Requires Join)
    search_query = request.args.get('search')
    if search_query:
        # Join with User table to search patient names
        query = query.join(User, Prediction.patient_id == User.id)\
                     .filter(User.name.ilike(f'%{search_query}%'))
    
    # Execute Query (Newest first)
    predictions = query.order_by(Prediction.timestamp.desc()).all()
    
    # Pass filters back to template to keep state
    filters = {
        'status': status_filter,
        'date_from': date_from or '',
        'date_to': date_to or '',
        'search': search_query or ''
    }
    
    # CALCULATE ANALYTICS (Only if NOT 'verified' mode, i.e., research mode)
    analytics_data = None
    if status_filter != 'verified':
        # 1. Disease Distribution
        disease_counts = {}
        # 2. Average Confidence
        confidence_sums = {}
        confidence_counts = {}
        # 3. Timeline (Simple daily count)
        timeline_counts = {}
        
        for p in predictions:
             # Disease
             cls = p.predicted_class
             disease_counts[cls] = disease_counts.get(cls, 0) + 1
             
             # Confidence
             if p.confidence:
                 confidence_sums[cls] = confidence_sums.get(cls, 0) + p.confidence
                 confidence_counts[cls] = confidence_counts.get(cls, 0) + 1
            
             # Timeline
             date_str = p.timestamp.strftime('%Y-%m-%d')
             timeline_counts[date_str] = timeline_counts.get(date_str, 0) + 1
             
        # Format for Chart.js
        # Disease Pie Chart
        analytics_data = {
            'disease_labels': list(disease_counts.keys()),
            'disease_values': list(disease_counts.values()),
            'confidence_labels': [],
            'confidence_values': [],
            'timeline_labels': sorted(list(timeline_counts.keys())),
            'timeline_values': [timeline_counts[d] for d in sorted(list(timeline_counts.keys()))]
        }
        
        for cls in confidence_sums:
            avg = (confidence_sums[cls] / confidence_counts[cls]) * 100
            analytics_data['confidence_labels'].append(cls)
            analytics_data['confidence_values'].append(round(avg, 1))
    
    return render_template('lab/history.html', predictions=predictions, filters=filters, analytics=analytics_data)

@app.route('/lab/verify_report/<int:prediction_id>', methods=['POST'])
@login_required
def lab_verify_report(prediction_id):
    if current_user.user_type != 'lab':
         return jsonify({'error': 'Access denied'}), 403
    
    prediction = Prediction.query.get_or_404(prediction_id)
    if prediction.lab_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403
        
    data = request.get_json()
    action = data.get('action')
    
    CONFIDENCE_THRESHOLD = 0.6
    confirm_override = data.get('confirm_override', False)
    
    if action == 'verify':
        # --- LOW CONFIDENCE VERIFICATION WARNING ---
        # If AI is uncertain (<60%) but human verifies, warn them to check image quality.
        if prediction.confidence and prediction.confidence < CONFIDENCE_THRESHOLD and not confirm_override:
            confidence_pct = int(prediction.confidence * 100)
            return jsonify({
                'challenge': True,
                'message': f"⚠️ **Low Confidence Alert**\n\nThe AI is only **{confidence_pct}% confident** in this result.\n\nMedical guidelines suggest checking for **Image Quality** (Blur/Darkness) before finalizing.\n\nAre you sure you want to verify this?",
                'requires_override': True,
                'original_action': 'verify'
            }), 200

        prediction.lab_verified = True
        prediction.image_quality = data.get('image_quality', 'Good')
        
        # New: Support assignment during verification
        doctor_id = data.get('doctor_id')
        if doctor_id:
            prediction.doctor_id = doctor_id
            log_event('ASSIGN', 'Prediction', prediction.id, f"Report assigned to doctor ID {doctor_id} during verification")
            
        db.session.commit()
        log_event('VERIFY', 'Prediction', prediction.id, f"Report verified by lab {current_user.name} for patient {prediction.patient.name}")
        return jsonify({'message': 'Report verified and assigned', 'id': prediction.id}), 200
        
    elif action == 'reject':
        # --- HIGH CONFIDENCE REJECTION CHALLENGE ---
        # If AI is confident (>60%) but human rejects, challenge them.
        if prediction.confidence and prediction.confidence >= CONFIDENCE_THRESHOLD and not confirm_override:
            confidence_pct = int(prediction.confidence * 100)
            return jsonify({
                'challenge': True,
                'message': f"Wait a second! 🛑\n\nThe AI is **{confidence_pct}% confident** that this is **{prediction.predicted_class}**.\n\nAre you sure you want to reject this report? Usually, high-confidence predictions are accurate.",
                'requires_override': True,
                'original_action': 'reject'
            }), 200
            
        # If confirmed or low confidence, proceed to delete
        db.session.delete(prediction)
        db.session.commit()
        return jsonify({'message': 'Report rejected and deleted'}), 200
        
    return jsonify({'error': 'Invalid action'}), 400

@app.route('/lab/analyze', methods=['GET', 'POST'])
@login_required
def lab_analyze():
    if current_user.user_type != 'lab':
        flash('Access denied', 'danger')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        patient_id = request.form.get('patient_id')
        
        if 'image' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
            
        if not patient_id:
             return jsonify({'error': 'Please select a Patient'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{timestamp}_{filename}"
            
            # Create directory if it doesn't exist
            predictions_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'predictions')
            os.makedirs(predictions_dir, exist_ok=True)
            
            # Save the full path in the database
            filepath = os.path.join('predictions', filename)
            full_filepath = os.path.join(app.config['UPLOAD_FOLDER'], filepath)
            file.save(full_filepath)
            
            # Make prediction (Ensemble)
            try:
                image = Image.open(full_filepath).convert('RGB')
                input_tensor = transform(image).unsqueeze(0).to(device)
                
                # --- ENSEMBLE LOGIC ---
                ensemble_probs = []
                weights = []
                
                with torch.no_grad():
                    for model_name, m in ensemble_models.items():
                        outputs = m(input_tensor)
                        probs = torch.nn.functional.softmax(outputs, dim=1)
                        if model_name == 'alexnet':
                            weight = 0.7
                        else:
                            weight = 0.3
                        ensemble_probs.append(probs * weight)
                        weights.append(weight)
                
                if len(ensemble_probs) > 0:
                    stacked_probs = torch.stack(ensemble_probs)
                    sum_probs = torch.sum(stacked_probs, dim=0)
                    total_weight = sum(weights)
                    avg_probs = sum_probs / total_weight
                else:
                    raise RuntimeError("No models available")
    
                confidence = torch.max(avg_probs).item()
                _, predicted = torch.max(avg_probs, 1)
                predicted_idx = predicted.item()
                predicted_class = class_names[predicted_idx]
                
                # Uncertainty
                uncertainty_value = None
                if len(ensemble_models) > 1:
                    raw_probs_list = []
                    with torch.no_grad():
                         for m in ensemble_models.values():
                             p = torch.nn.functional.softmax(m(input_tensor), dim=1)
                             raw_probs_list.append(p)
                    stacked_raw_probs = torch.stack(raw_probs_list)
                    variance = torch.var(stacked_raw_probs, dim=0)
                    uncertainty_value = torch.mean(variance).item()
                
                # GradCAM
                heatmap_path = None
                try:
                    heatmaps_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'heatmaps')
                    os.makedirs(heatmaps_dir, exist_ok=True)
                    heatmap_buffer = generate_gradcam(model, full_filepath, predicted_idx, device)
                    if heatmap_buffer:
                        heatmap_filename = f"heatmap_{timestamp}_{filename.rsplit('.', 1)[0]}.png"
                        heatmap_filepath = os.path.join('heatmaps', heatmap_filename)
                        heatmap_fullpath = os.path.join(app.config['UPLOAD_FOLDER'], heatmap_filepath)
                        with open(heatmap_fullpath, 'wb') as f:
                            f.write(heatmap_buffer.getvalue())
                        heatmap_path = heatmap_filepath
                except Exception as e:
                    print(f"Error generating heatmap: {e}")
                
                # Save prediction
                prediction = Prediction(
                    patient_id=patient_id,
                    lab_id=current_user.id,
                    doctor_id=None, # No specific doctor assigned initially
                    image_path=filepath,
                    heatmap_path=heatmap_path,
                    predicted_class=predicted_class,
                    explanation=disease_info[predicted_class]['explanation'],
                    recommendation=disease_info[predicted_class]['recommendation'],
                    uncertainty=uncertainty_value,
                    confidence=confidence, # Save confidence score
                    lab_verified=False, # Wait for manual verification
                    is_visible_to_patient=False  # Patient cannot see it yet
                )
                db.session.add(prediction)
            
                # Update booking status if booking_id is present
                booking_id = request.form.get('booking_id')
                if booking_id:
                    booking = LabBooking.query.get(booking_id)
                    if booking:
                        booking.status = 'completed'
                        
                db.session.commit()
                
                log_event('ANALYSIS', 'Prediction', prediction.id, f"Lab analysis completed for patient {prediction.patient.name}")
                
                return jsonify({
                    'message': 'Analysis Completed',
                    'prediction': {
                        'id': prediction.id,
                        'class': predicted_class,
                        'confidence': confidence,
                        'heatmap': heatmap_path
                    }
                }), 200
                
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        else:
             return jsonify({'error': 'Invalid file type'}), 400

    # GET Request: Load patients for the form
    print("--- DEBUG: /lab/analyze GET ---")
    print(f"DB URI in App Context: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    patients = User.query.filter_by(user_type='patient').all()
    print(f"DEBUG: Found {len(patients)} patients")
    for p in patients:
        print(f"DEBUG: Patient: {p.name} ({p.id})")
        
    selected_patient_id = request.args.get('patient_id')
    booking_id = request.args.get('booking_id')
    
    return jsonify({
        'patients': [{'id': p.id, 'name': p.name, 'email': p.email} for p in patients],
        'selected_patient_id': selected_patient_id,
        'booking_id': booking_id
    }), 200

@app.route('/lab/report/<int:prediction_id>', methods=['GET'])
@login_required
def lab_report_detail(prediction_id):
    if current_user.user_type != 'lab':
         return jsonify({'error': 'Access denied'}), 403
    
    prediction = Prediction.query.get_or_404(prediction_id)
    if prediction.lab_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    # Get recommended doctors based on specialty
    recommended_doctors = []
    
    if prediction.predicted_class in ['cataract', 'diabetic_retinopathy', 'glaucoma']:
        recommended_doctors = User.query.filter_by(
            user_type='doctor', 
            specialist=prediction.predicted_class,
            available=True
        ).all()
        
    all_doctors = User.query.filter_by(user_type='doctor', available=True).all()
    recommended_ids = [d.id for d in recommended_doctors]
    other_doctors = [d for d in all_doctors if d.id not in recommended_ids]

    return jsonify({
        'prediction': {
            'id': prediction.id,
            'predicted_class': prediction.predicted_class,
            'confidence': prediction.confidence,
            'lab_verified': prediction.lab_verified,
            'image_quality': prediction.image_quality,
            'image_path': prediction.image_path,
            'patient_name': prediction.patient.name,
            'patient_id': prediction.patient_id,
            'explanation': prediction.explanation,
            'recommendation': prediction.recommendation,
            'doctor_id': prediction.doctor_id
        },
        'recommended_doctors': [{'id': d.id, 'name': d.name, 'specialist': d.specialist} for d in recommended_doctors],
        'other_doctors': [{'id': d.id, 'name': d.name, 'specialist': d.specialist} for d in other_doctors]
    }), 200

@app.route('/lab/assign/<int:prediction_id>/<int:doctor_id>', methods=['POST'])
@login_required
def lab_assign_doctor(prediction_id, doctor_id):
    if current_user.user_type != 'lab':
        return jsonify({'error': 'Access denied'}), 403
        
    prediction = Prediction.query.get_or_404(prediction_id)
    if prediction.lab_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
        
    doctor = User.query.get_or_404(doctor_id)
    if doctor.user_type != 'doctor':
         return jsonify({'error': 'Invalid doctor'}), 400
        
    prediction.doctor_id = doctor.id
    db.session.commit()
    
    return jsonify({
        'message': f'Report assigned to Dr. {doctor.name}',
        'doctor_name': doctor.name
    }), 200

@app.route('/lab/all_reports', methods=['GET'])
@login_required
def lab_all_reports():
    if current_user.user_type != 'lab':
        return jsonify({'error': 'Access denied'}), 403
    
    # Get all predictions associated with this lab
    predictions = Prediction.query.filter_by(lab_id=current_user.id).order_by(Prediction.timestamp.desc()).all()
    
    reports = []
    for p in predictions:
        doctor_name = None
        if p.doctor_id:
            doctor = User.query.get(p.doctor_id)
            doctor_name = doctor.name if doctor else None
        
        reports.append({
            'id': p.id,
            'patient_id': p.patient_id,
            'patient_name': p.patient.name if p.patient else 'Unknown',
            'predicted_class': p.predicted_class,
            'confidence': p.confidence,
            'image_path': p.image_path,
            'lab_verified': p.lab_verified,
            'timestamp': p.timestamp.isoformat(),
            'doctor_id': p.doctor_id,
            'doctor_name': doctor_name,
            'doctor_notes': p.doctor_notes,
            'annotated_image_path': p.annotated_image_path,
            'is_visible_to_patient': p.is_visible_to_patient
        })
    
    return jsonify({'reports': reports}), 200

@app.route('/admin/all_users', methods=['GET'])
@login_required
def admin_all_users():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
        
    users = User.query.all()
    user_list = []
    for u in users:
        user_list.append({
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'user_type': u.user_type,
            'phone': u.phone,
            'location': u.location,
            'specialist': u.specialist if u.user_type == 'doctor' else None,
            'lab_license': u.lab_license if u.user_type == 'lab' else None,
            'clinic_name': u.clinic_name if u.user_type in ['doctor', 'lab'] else None
        })
        
    return jsonify({'users': user_list}), 200

@app.route('/admin/user/save', methods=['POST'])
@login_required
def admin_save_user():
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    user_id = data.get('id')
    
    try:
        if user_id:
            # Edit existing
            user = User.query.get_or_404(user_id)
            old_data = {
                'name': user.name, 
                'email': user.email, 
                'user_type': user.user_type,
                'phone': user.phone,
                'location': user.location
            }
            
            user.name = data.get('name', user.name)
            user.email = data.get('email', user.email)
            user.user_type = data.get('user_type', user.user_type)
            user.phone = data.get('phone', user.phone)
            user.location = data.get('location', user.location)
            
            if user.user_type in ['doctor', 'lab']:
                user.clinic_name = data.get('clinic_name', user.clinic_name)
            
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            if user.user_type == 'doctor':
                user.specialist = data.get('specialist', user.specialist)
            if user.user_type == 'lab':
                user.lab_license = data.get('lab_license', user.lab_license)
                
            db.session.commit()
            log_event('UPDATE', 'User', user.id, f"Modified user {user.name} ({user.email}). Previous: {old_data}")
            return jsonify({'message': 'User updated successfully'}), 200
        else:
            # Create new
            email = data.get('email')
            if User.query.filter_by(email=email).first():
                return jsonify({'error': 'Email already exists'}), 400
                
            new_user = User(
                name=data.get('name'),
                email=email,
                user_type=data.get('user_type', 'patient'),
                phone=data.get('phone'),
                location=data.get('location')
            )
            new_user.set_password(data.get('password', 'password123'))
            
            if new_user.user_type == 'doctor':
                new_user.specialist = data.get('specialist', 'general')
                new_user.available = True
            if new_user.user_type == 'lab':
                new_user.lab_license = data.get('lab_license', 'LICENSE-123')
                
            db.session.add(new_user)
            db.session.commit()
            log_event('CREATE', 'User', new_user.id, f"Created new {new_user.user_type}: {new_user.name} ({new_user.email})")
            return jsonify({'message': 'User created successfully', 'id': new_user.id}), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/admin/user/delete/<int:user_id>', methods=['DELETE'])
@login_required
def admin_nuclear_delete_user(user_id):
    if current_user.user_type != 'admin':
        return jsonify({'error': 'Access denied'}), 403
        
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        name, email, role = user.name, user.email, user.user_type
        
        # Consolidate Nuclear logic here for JSON response
        if role == 'doctor':
            db.session.execute(db.text("DELETE FROM appointment WHERE doctor_id = :uid"), {'uid': user_id})
            db.session.execute(db.text("UPDATE prediction SET doctor_id = NULL WHERE doctor_id = :uid"), {'uid': user_id})
        elif role == 'patient':
            db.session.execute(db.text("DELETE FROM appointment WHERE patient_id = :uid"), {'uid': user_id})
            db.session.execute(db.text("DELETE FROM prediction WHERE patient_id = :uid"), {'uid': user_id})
            db.session.execute(db.text("DELETE FROM document WHERE patient_id = :uid"), {'uid': user_id})
            db.session.execute(db.text("DELETE FROM lab_booking WHERE patient_id = :uid"), {'uid': user_id})
            
        db.session.delete(user)
        db.session.commit()
        
        log_event('DELETE', 'User', user_id, f"NUCLEAR DELETE: Removed {role} {name} ({email}) and all related records.")
        return jsonify({'message': f'User {name} and all associated data permanently removed.'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/lab/report_view/<int:prediction_id>', methods=['GET'])
@login_required
def lab_report_view(prediction_id):
    if current_user.user_type not in ['lab', 'admin']:
        return jsonify({'error': 'Access denied'}), 403
    
    prediction = Prediction.query.get_or_404(prediction_id)
    
    # Ensure this lab owns this prediction or it's visible to them (Skip check for admin)
    if current_user.user_type == 'lab' and prediction.lab_id != current_user.id:
        return jsonify({'error': 'Unauthorized access'}), 403
        
    doctor_name = None
    if prediction.doctor_id:
        doctor = User.query.get(prediction.doctor_id)
        doctor_name = doctor.name if doctor else None
        
    return jsonify({
        'report': {
            'id': prediction.id,
            'patient_id': prediction.patient_id,
            'patient_name': prediction.patient.name if prediction.patient else 'Unknown',
            'predicted_class': prediction.predicted_class,
            'confidence': prediction.confidence,
            'image_path': prediction.image_path,
            'heatmap_path': prediction.heatmap_path,
            'explanation': prediction.explanation,
            'recommendation': prediction.recommendation,
            'image_quality': prediction.image_quality,
            'lab_verified': prediction.lab_verified,
            'doctor_id': prediction.doctor_id,
            'doctor_name': doctor_name,
            'doctor_notes': prediction.doctor_notes,
            'annotated_image_path': prediction.annotated_image_path,
            'is_visible_to_patient': prediction.is_visible_to_patient,
            'created_at': prediction.timestamp.isoformat()
        }
    }), 200

if __name__ == '__main__':
    # Get DuckDNS configuration
    duckdns_token = app.config.get('DUCKDNS_TOKEN')
    duckdns_domain = app.config.get('DUCKDNS_DOMAIN')
    
    # Update DuckDNS IP
    if duckdns_token and duckdns_domain and duckdns_token != 'YOUR_DUCKDNS_TOKEN_HERE':
        print("\n" + "="*60)
        print("[*] Updating DuckDNS...")
        if update_duckdns(duckdns_token, duckdns_domain):
            print("[v] DuckDNS updated successfully!")
            
            # Start periodic updates in background thread
            update_thread = threading.Thread(
                target=periodic_duckdns_update,
                args=(duckdns_token, duckdns_domain),
                daemon=True
            )
            update_thread.start()
            print("[v] Periodic DuckDNS updates enabled (every 30 minutes)")
        else:
            print("[!] DuckDNS update failed, but continuing...")
        print("="*60 + "\n")
    
    # Get local IP and public IP
    local_ip = get_local_ip()
    public_ip = get_public_ip()
    
    # Display access URLs
    print("\n" + "="*60)
    print(">>> Smart Eye Care Application Starting...")
    print("="*60)
    print(f"[+] On THIS computer:  http://127.0.0.1:5000")
    print(f"[+] Same Wi-Fi:        http://{local_ip}:5000")
    
    if public_ip:
        print(f"[+] Your Public IP:    {public_ip}")
    
    if duckdns_domain and duckdns_domain != 'yourdomain':
        permanent_url = f"http://{duckdns_domain}.duckdns.org:5000"
        print(f"\n[+] External Access (DuckDNS): {permanent_url}")
        print(f"\n[!] PORT FORWARDING REQUIRED for external access!")
        print(f"   For DuckDNS URL to work from other networks:")
        print(f"   1. Open your router settings (usually 192.168.1.1)")
        print(f"   2. Go to Port Forwarding / Virtual Server")
        print(f"   3. Forward External Port 5000 → Internal IP {local_ip}:5000")
        print(f"   4. Protocol: TCP")
        print(f"   5. Save and restart router if needed")
        print(f"\n   After port forwarding, share: {permanent_url}")
        print(f"\n💡 EASIER OPTION: Use ngrok for instant access (no port forwarding)")
        print(f"   Install: pip install pyngrok")
        print(f"   Then uncomment ngrok code in app.py\n")
    
    if duckdns_token == 'YOUR_DUCKDNS_TOKEN_HERE':
        print("[!] WARNING: DuckDNS token not configured!")
        print("   Add your token in config.py to enable permanent URL\n")
    
    # Optional: Start ngrok for easy external access (no port forwarding needed)
    ngrok_url = None
    try:
        from pyngrok import ngrok
        print("\n" + "="*60)
        print("[*] Starting ngrok tunnel (NO PORT FORWARDING NEEDED)...")
        try:
            ngrok_tunnel = ngrok.connect(5000)
            ngrok_url = ngrok_tunnel.public_url
            print("="*60)
            print(f"[v] ngrok Public URL: {ngrok_url}")
            print("="*60)
            print(f"[^] SHARE THIS URL WITH YOUR FRIEND - WORKS IMMEDIATELY!")
            print(f"   {ngrok_url}")
            print(f"\n[!] Note: Free ngrok URLs change each time you restart")
            print(f"   (For permanent URL, use port forwarding + DuckDNS)\n")
        except Exception as e:
            print(f"[!] ngrok connection error: {e}")
            print("   You may need to sign up at https://ngrok.com (free)\n")
    except ImportError:
        print("\n[i] Install ngrok for instant external access:")
        print("   Run: pip install pyngrok")
        print("   Then restart the app\n")
    
    print("="*60 + "\n")
    
    # Run the app with reloader enabled for development sync
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=True)