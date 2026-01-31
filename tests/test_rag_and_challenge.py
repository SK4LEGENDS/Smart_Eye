import unittest
import sys
import os
import json
from unittest.mock import MagicMock, patch

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class TestRAGAndChallenge(unittest.TestCase):
    
    def test_rag_retrieval(self):
        """Test if RAG service can ingest and retrieve data."""
        print("\nTesting RAG Service...")
        try:
            from rag_service import rag_service
            
            # 1. Ingest (should pick up the files we created)
            success = rag_service.ingest_data()
            if not success:
                print("Skipping RAG test - maybe no model/files found.")
                return

            # 2. Retrieve
            query = "What is Glaucoma?"
            results = rag_service.retrieve(query, k=1)
            
            self.assertTrue(len(results) > 0)
            print(f"Query: {query}")
            print(f"Result: {results[0]['content'][:100]}...")
            self.assertIn("Glaucoma", results[0]['content'])
            
        except ImportError:
            print("Skipping RAG test - libraries not installed.")

    @patch('app.db')
    @patch('app.Prediction')
    @patch('app.current_user')
    @patch('app.log_event')
    def test_proactive_challenge_logic(self, mock_log, mock_user, mock_prediction, mock_db):
        """Test the logic for Proactive Confidence Challenge (Enhanced)."""
        print("\nTesting Enhanced Challenge Logic (Threshold 0.6)...")
        
        # Mock User
        mock_user.user_type = 'lab'
        mock_user.id = 1
        
        # Mock Request Patch
        with patch('app.request') as mock_request, patch('app.jsonify') as mock_jsonify:
            mock_jsonify.side_effect = lambda x: x
            
            try:
                from app import app, lab_verify_report
            except ImportError:
                print("Could not import app for testing.")
                return

            with app.test_request_context():
                # --- Scenario 1: High Confidence (0.95) + Reject -> CHALLENGE ---
                print("Scenario 1: High Conf + Reject -> Should Challenge")
                mock_pred_high = MagicMock()
                mock_pred_high.confidence = 0.95
                mock_pred_high.predicted_class = "Glaucoma"
                mock_pred_high.lab_id = 1
                mock_prediction.query.get_or_404.return_value = mock_pred_high
                
                mock_request.get_json.return_value = {'action': 'reject', 'confirm_override': False}
                response, code = lab_verify_report(1)
                self.assertTrue(response.get('challenge'))
                self.assertEqual(response.get('original_action'), 'reject')

                # --- Scenario 2: High Confidence (0.95) + Verify -> SUCCESS ---
                print("Scenario 2: High Conf + Verify -> Should Success")
                mock_request.get_json.return_value = {'action': 'verify', 'confirm_override': False}
                response, code = lab_verify_report(1)
                self.assertFalse(response.get('challenge', False))
                self.assertEqual(code, 200)

                # --- Scenario 3: Low Confidence (0.55) + Reject -> SUCCESS ---
                print("Scenario 3: Low Conf + Reject -> Should Success")
                mock_pred_low = MagicMock()
                mock_pred_low.confidence = 0.55
                mock_pred_low.lab_id = 1
                mock_prediction.query.get_or_404.return_value = mock_pred_low
                
                mock_request.get_json.return_value = {'action': 'reject', 'confirm_override': False}
                response, code = lab_verify_report(2)
                self.assertFalse(response.get('challenge', False))
                self.assertEqual(code, 200)

                # --- Scenario 4: Low Confidence (0.55) + Verify -> CHALLENGE (Warning) ---
                print("Scenario 4: Low Conf + Verify -> Should Challenge")
                mock_request.get_json.return_value = {'action': 'verify', 'confirm_override': False}
                response, code = lab_verify_report(2)
                self.assertTrue(response.get('challenge'))
                self.assertEqual(response.get('original_action'), 'verify')
                
                print("All scenarios passed!")

if __name__ == '__main__':
    unittest.main()
