import os
import faiss
import numpy as np
import glob
from sentence_transformers import SentenceTransformer
import logging

class RAGService:
    def __init__(self, data_dir='DATA/guidelines'):
        self.logger = logging.getLogger(__name__)
        self.data_dir = data_dir
        self.index = None
        self.documents = []
        self.model = None
        
        # Initialize model lazily to avoid startup delay if not needed immediately
        self._model_name = 'all-MiniLM-L6-v2'
        
        # Ensure data directory exists
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            
    def _load_model(self):
        if self.model is None:
            self.logger.info("Loading Embedding Model...")
            try:
                self.model = SentenceTransformer(self._model_name)
            except Exception as e:
                self.logger.error(f"Failed to load RAG model: {e}")
                
    def ingest_data(self):
        """Reads all Markdown files in data_dir, chunks them, and builds FAISS index."""
        self._load_model()
        if not self.model:
            return False
            
        params = glob.glob(os.path.join(self.data_dir, "**/*.md"), recursive=True)
        all_chunks = []
        
        self.logger.info(f"Ingesting {len(params)} documents...")
        
        for file_path in params:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Simple chunking by paragraphs for now
                    chunks = [c.strip() for c in content.split('\n\n') if len(c.strip()) > 50]
                    for chunk in chunks:
                        all_chunks.append({
                            'source': os.path.basename(file_path),
                            'content': chunk
                        })
            except Exception as e:
                self.logger.error(f"Error reading {file_path}: {e}")
                
        if not all_chunks:
            self.logger.warning("No data found to ingest.")
            return False
            
        self.documents = all_chunks
        
        # Create Embeddings
        texts = [doc['content'] for doc in self.documents]
        embeddings = self.model.encode(texts)
        
        # Build FAISS Index (L2 Distance)
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(np.array(embeddings).astype('float32'))
        
        self.logger.info(f"RAG Index built with {len(self.documents)} chunks.")
        return True

    def retrieve(self, query, k=3):
        """Retrieves top-k relevant chunks for a query."""
        if self.index is None or not self.documents:
            # Try to ingest if index is empty
            if not self.ingest_data():
                return []
        
        self._load_model()
        if not self.model:
            return []
            
        query_vector = self.model.encode([query])
        distances, indices = self.index.search(np.array(query_vector).astype('float32'), k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.documents):
                results.append(self.documents[idx])
                
        return results

# Singleton instance
rag_service = RAGService()
