import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'smart_eye_care_secret_key'
    # Point to the instance folder where the DB actually resides
    # Point to the instance folder where the DB actually resides
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'instance', 'smart_eye_care.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session / Cookie Settings for Cross-Origin (Localhost)
    SESSION_COOKIE_SAMESITE = 'Lax'  # Better for localhost:3000 -> localhost:5000
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_PATH = '/'
    SESSION_COOKIE_DOMAIN = None  # Allow localhost
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = 3600  # 1 hour
    
    UPLOAD_FOLDER = 'static/uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'docx'}
    
    # DuckDNS Configuration
    DUCKDNS_TOKEN = os.environ.get('DUCKDNS_TOKEN') or '56b773ea-01c7-4989-9669-fee274cca3d4'  # Replace with your actual token
    DUCKDNS_DOMAIN = os.environ.get('DUCKDNS_DOMAIN') or 'care4eyes'  # Domain name without .duckdns.org

    # Frontend Configuration
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000'

    # LLM/Chatbot Configuration
    GROQ_API_KEY = os.environ.get('HF_TOKEN') or 'YOUR_HF_TOKEN_HERE'
    LLM_API_URL = "https://router.huggingface.co/v1/chat/completions"  # HuggingFace Router
    LLM_MODEL = 'meta-llama/Llama-3.1-8B-Instruct'  # Free via HuggingFace