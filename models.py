from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(100), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'patient', 'doctor', 'admin'
    phone = db.Column(db.String(20))
    location = db.Column(db.String(200))
    
    # Doctor specific fields
    specialist = db.Column(db.String(50))
    clinic_name = db.Column(db.String(100))
    available = db.Column(db.Boolean, default=True)
    
    # Lab specific fields
    lab_license = db.Column(db.String(50))

    # Patient/General Extended fields
    dob = db.Column(db.String(20))
    gender = db.Column(db.String(20))
    language = db.Column(db.String(20), default='English')
    timezone = db.Column(db.String(50), default='UTC')
    
    # Notifications
    notif_email = db.Column(db.Boolean, default=True)
    notif_sms = db.Column(db.Boolean, default=False)
    notif_appointments = db.Column(db.Boolean, default=True)
    notif_reports = db.Column(db.Boolean, default=True)
    
    # Emergency Contact
    emergency_contact_name = db.Column(db.String(100))
    emergency_contact_phone = db.Column(db.String(20))
    emergency_contact_relationship = db.Column(db.String(50))
    
    # Security
    two_factor_enabled = db.Column(db.Boolean, default=False)

    # Relationships
    predictions_as_patient = db.relationship('Prediction', foreign_keys='Prediction.patient_id', backref='patient', lazy=True)
    predictions_as_lab = db.relationship('Prediction', foreign_keys='Prediction.lab_id', backref='lab', lazy=True)
    predictions_as_doctor = db.relationship('Prediction', foreign_keys='Prediction.doctor_id', backref='doctor', lazy=True)
    
    appointments_as_doctor = db.relationship('Appointment', foreign_keys='Appointment.doctor_id', backref='doctor', lazy=True)
    appointments_as_patient = db.relationship('Appointment', foreign_keys='Appointment.patient_id', backref='patient', lazy=True)
    
    # Lab Appointment Relationships
    lab_bookings_as_lab = db.relationship('LabBooking', foreign_keys='LabBooking.lab_id', backref='lab', lazy=True)
    lab_bookings_as_patient = db.relationship('LabBooking', foreign_keys='LabBooking.patient_id', backref='patient_booking_user', lazy=True) # Renamed backref slightly to avoid any potential collision, though usually fine.
    
    documents = db.relationship('Document', backref='patient', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    lab_id = db.Column(db.Integer, db.ForeignKey('user.id')) # Which lab ran this?
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id')) # Which doctor is this for?
    
    image_path = db.Column(db.String(200), nullable=False)
    heatmap_path = db.Column(db.String(200))  # Path to GradCAM heatmap visualization
    predicted_class = db.Column(db.String(50), nullable=False)
    explanation = db.Column(db.Text)
    recommendation = db.Column(db.Text)
    uncertainty = db.Column(db.Float) # Added for Uncertainty Quantification
    
    is_visible_to_patient = db.Column(db.Boolean, default=False) # Control patient visibility
    annotation_data = db.Column(db.Text) # JSON string for coordinates: {"x": 10, "y": 20, "width": 50, "height": 50}
    annotated_image_path = db.Column(db.String(200)) # Path to the image with drawn annotations
    doctor_notes = db.Column(db.Text) # Notes from the doctor
    
    # Industrial Lab Fields
    confidence = db.Column(db.Float)
    image_quality = db.Column(db.String(20), default='Good') # Good, Adequate, Poor
    lab_verified = db.Column(db.Boolean, default=False) # Quality Gate
    is_archived = db.Column(db.Boolean, default=False)
    test_type = db.Column(db.String(20), default='Fundus') # Fundus, OCT, VF
    
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'accepted', 'rejected'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(200), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # OCR fields
    extracted_text = db.Column(db.Text, nullable=True)  # Extracted text from OCR
    ocr_confidence = db.Column(db.Float, nullable=True)  # OCR confidence score (0-100)

class LabBooking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    lab_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Now optional, assigned by admin
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, confirmed, completed, cancelled
    
    # Request Details
    test_type = db.Column(db.String(50), default='General Checkup')
    priority = db.Column(db.String(20), default='Normal') # Normal, Urgent
    
    # New Patient Info Fields
    time_slot = db.Column(db.String(20))  # morning, afternoon, evening
    visit_reason = db.Column(db.String(100))  # Why patient is visiting
    wears_glasses = db.Column(db.String(50))  # Yes Glasses, Yes Contacts, Both, No
    known_conditions = db.Column(db.Text)  # Family history, conditions
    additional_notes = db.Column(db.Text)  # Any other concerns
    
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    target_id = db.Column(db.Integer) # ID of user/entity changed
    target_type = db.Column(db.String(50)) # e.g. 'User', 'Prediction'
    action = db.Column(db.String(50), nullable=False) # 'UPDATE', 'DELETE'
    details = db.Column(db.Text) # Description of change
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    admin = db.relationship('User', foreign_keys='AuditLog.admin_id')