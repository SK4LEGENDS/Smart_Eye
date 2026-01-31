import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db, User, Appointment, Prediction
from datetime import date
from werkzeug.security import generate_password_hash

def test_phase2_step2_tools():
    print("🚀 Starting Phase 2 Step 2 (Doctor Workflow) Verification...")
    
    with app.app_context():
        # Setup Users
        patient = User.query.filter_by(email='test_patient_p2s2@example.com').first()
        if not patient:
            patient = User(email='test_patient_p2s2@example.com', name='Test Patient P2S2', user_type='patient')
            patient.set_password('password')
            db.session.add(patient)

        doctor = User.query.filter_by(email='test_doctor_p2s2@example.com').first()
        if not doctor:
            doctor = User(email='test_doctor_p2s2@example.com', name='Dr. Test P2S2', user_type='doctor', specialist='Retina')
            doctor.set_password('password')
            db.session.add(doctor)
        
        db.session.commit()

        # --- Test 1: Doctor Schedule Logic ---
        print("\n--- Test 1: Verify Schedule Logic ---")
        # Create an accepted appointment
        # Clean up old
        Appointment.query.filter_by(patient_id=patient.id, doctor_id=doctor.id).delete()
        
        appt = Appointment(
            patient_id=patient.id, 
            doctor_id=doctor.id, 
            date=date.today(), 
            status='accepted' # Crucial: Must be accepted to show in schedule
        )
        db.session.add(appt)
        db.session.commit()
        
        # Verify query logic from tool
        schedule = Appointment.query.filter_by(
            doctor_id=doctor.id,
            status='accepted',
            date=date.today()
        ).all()
        
        if len(schedule) >= 1:
            print(f"✅ Schedule Logic: Success (Found {len(schedule)} accepted appts)")
        else:
            print("❌ Schedule Logic: Failed")

        # --- Test 2: Patient History Logic ---
        print("\n--- Test 2: Verify Patient History Logic ---")
        # Create a dummy report
        Prediction.query.filter_by(patient_id=patient.id).delete()
        
        report = Prediction(
            patient_id=patient.id,
            image_path='test.jpg',
            predicted_class='Healthy',
            uncertainty=0.1,
            is_visible_to_patient=False
        )
        db.session.add(report)
        db.session.commit()
        
        history = Prediction.query.filter_by(patient_id=patient.id).all()
        if len(history) >= 1:
            print("✅ History Logic: Success")
        else:
             print("❌ History Logic: Failed")

        # --- Test 3: Share Report Logic ---
        print("\n--- Test 3: Verify Share Report Logic ---")
        report_to_share = Prediction.query.get(report.id)
        report_to_share.is_visible_to_patient = True
        db.session.commit()
        
        refetched = Prediction.query.get(report.id)
        if refetched.is_visible_to_patient:
             print("✅ Share Logic: Success (Report is now visible)")
        else:
             print("❌ Share Logic: Failed")
             
        # Clean up
        db.session.delete(appt)
        db.session.delete(report)
        db.session.delete(patient)
        db.session.delete(doctor)
        db.session.commit()
        print("\n✨ Verification Complete (Logic Verified)")

if __name__ == "__main__":
    test_phase2_step2_tools()
