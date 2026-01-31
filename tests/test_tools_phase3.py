import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db, User, Document
from chat_service import ChatService
from werkzeug.security import generate_password_hash
from flask_login import login_user

def test_phase3_rag():
    print("🚀 Starting Phase 3 (RAG & Lab Tools) Verification...")
    
    with app.app_context():
        # Setup Patient
        patient = User.query.filter_by(email='test_patient_rag@example.com').first()
        if not patient:
            patient = User(email='test_patient_rag@example.com', name='RAG Patient', user_type='patient')
            patient.set_password('password')
            db.session.add(patient)
            db.session.commit()
            
        # Create Dummy Document
        Document.query.filter_by(patient_id=patient.id).delete()
        doc = Document(
            patient_id=patient.id,
            filename='report_2024.pdf',
            file_path='/tmp/report_2024.pdf',
            extracted_text="The patient shows signs of mild diabetic retinopathy. Intraocular pressure is 15 mmHg. Recommended follow-up in 6 months."
        )
        db.session.add(doc)
        db.session.commit()
        
        # Test Search Tool
        print("\n--- Test 1: Search Documents (RAG) ---")
        
        # Mock current_user (Flask-Login relies on request context usually, but we can hack it or pass user if tool supported it)
        # However, _tool_search_documents uses current_user directly.
        # We need to use test_request_context and login_user
        
        with app.test_request_context():
            login_user(patient)
            from flask_login import current_user
            print(f"DEBUG: Test Context - User: {current_user}, Authenticated: {current_user.is_authenticated}, ID: {current_user.id}")
            
            service = ChatService()
            
            # Query 1: Exact match
            result1 = service._tool_search_documents("pressure")
            print(f"Query 'pressure':\n{result1}\n")
            
            if "15 mmHg" in result1:
                print("✅ RAG Test 1: Success (Found pressure)")
            else:
                print("❌ RAG Test 1: Failed")
                
            # Query 2: No match
            result2 = service._tool_search_documents("glaucoma")
            # print(f"Query 'glaucoma':\n{result2}\n")
            if "couldn't find relevant information" in result2.lower():
                 print("✅ RAG Test 2: Success (Correctly handled no match)")
            else:
                 print("❌ RAG Test 2: Failed")

            # --- Test 2: Lab Booking Tool ---
            print("\n--- Test 2: Book Lab Test ---")
            
            # Test valid booking
            result_lab = service._tool_book_lab_test("2026-12-25", "morning", "Routine checkup")
            print(f"Lab Booking Result: {result_lab}")
            
            if "submitted" in result_lab and "ID: #" in result_lab:
                 print("✅ Lab Booking: Success")
            else:
                 print("❌ Lab Booking: Failed")

        # Clean up
        from models import LabBooking
        LabBooking.query.filter_by(patient_id=patient.id).delete()
        db.session.delete(doc)
        db.session.delete(patient)
        db.session.commit()
        print("\n✨ Verification Complete")

if __name__ == "__main__":
    test_phase3_rag()
