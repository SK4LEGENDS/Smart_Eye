
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db, User, Prediction
from chat_service import ChatService
from flask_login import login_user

def test_clinical_rag():
    print("🚀 Starting Clinical RAG Verification...")
    
    with app.app_context():
        # Setup Patient
        patient = User.query.filter_by(email='test_rag_patient@example.com').first()
        if not patient:
            patient = User(email='test_rag_patient@example.com', name='RAG Test Patient', user_type='patient')
            patient.set_password('password')
            db.session.add(patient)
            db.session.commit()
            
        # 1. Simulate High Uncertainty Prediction
        Prediction.query.filter_by(patient_id=patient.id).delete()
        bad_pred = Prediction(
            patient_id=patient.id,
            image_path='test_bad.jpg',
            predicted_class='Diabetic Retinopathy',
            uncertainty=0.5, # 50% Uncertainty (High)
            timestamp=db.func.now()
        )
        db.session.add(bad_pred)
        db.session.commit()
        
        # Test 1: Query should be BLOCKED
        print("\n--- Test 1: High Uncertainty Block ---")
        with app.test_request_context():
            login_user(patient)
            service = ChatService()
            
            # This logic mimics process_message calling _classify_intent -> _check_clinical_confidence
            # Since we can't easily mock the LLM call in a simple script without credentials/network,
            # We will test the helper methods directly to ensure the *logic* works.
            # But process_message calls them, so let's call process_message and hope for the "return early" block.
            # If logic works, it returns BEFORE calling LLM.
            
            response = service.process_message(patient, "What is my diagnosis?")
            print(f"Response: {response['response']}")
            
            if "Uncertainty Alert" in response['response']:
                print("✅ Test 1 Success: Blocked High Uncertainty")
            else:
                print("❌ Test 1 Failed: Did not block")

        # 2. Simulate Low Uncertainty Prediction
        bad_pred.uncertainty = 0.05 # 5% Uncertainty (Low)
        db.session.commit()
        
        # Test 2: Query should be ALLOWED (Context Injected)
        print("\n--- Test 2: Low Uncertainty Allow ---")
        with app.test_request_context():
            login_user(patient)
            service = ChatService()
            
            # Here, process_message proceeds to call LLM.
            # Since we might not want to actually hit the API (cost/latency),
            # we can check if _check_clinical_confidence returns safe=True.
            
            conf_check = service._check_clinical_confidence(patient)
            print(f"Confidence Check: {conf_check}")
            
            if conf_check['safe'] and conf_check['confidence'] > 90:
                print("✅ Test 2 Success: Allowed Low Uncertainty")
            else:
                 print("❌ Test 2 Failed: Did not allow")

        # Clean up
        db.session.delete(bad_pred)
        db.session.delete(patient)
        db.session.commit()
        print("\n✨ Verification Complete")

if __name__ == "__main__":
    test_clinical_rag()
