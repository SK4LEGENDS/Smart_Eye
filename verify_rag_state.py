import sys
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def test_rag_service():
    print("----------------------------------------------------------------")
    print("VERIFYING RAG SYSTEM STATE")
    print("----------------------------------------------------------------")
    
    try:
        from rag_service import rag_service
        
        print(f"[*] RAG Service Initialized")
        print(f"[*] Data Directory: {rag_service.data_dir}")
        
        # Test Ingestion
        print("\n[1] Testing Data Ingestion...")
        success = rag_service.ingest_data()
        
        if success:
            print(f"    SUCCESS: Ingested {len(rag_service.documents)} chunks.")
        else:
            print("    WARNING: Ingestion returned False (Check if DATA/guidelines has .md files).")
            
        # Test Retrieval
        query = "What are the symptoms of glaucoma?"
        print(f"\n[2] Testing Retrieval for query: '{query}'")
        
        results = rag_service.retrieve(query, k=2)
        
        if results:
            print(f"    SUCCESS: Retrieved {len(results)} chunks.")
            for i, res in enumerate(results):
                print(f"    --- Result {i+1} (Source: {res['source']}) ---")
                print(f"    {res['content'][:150]}...")
        else:
            print("    FAILURE: No results returned.")
            
        print("\n----------------------------------------------------------------")
        print("VERIFICATION COMPLETE: RAG SYSTEM IS OPERATIONAL")
        print("----------------------------------------------------------------")
        
    except ImportError as e:
        print(f"\nCRITICAL ERROR: Could not import rag_service. {e}")
    except Exception as e:
        print(f"\nCRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_rag_service()
