from app import app
from models import db, User

def check_status():
    with app.app_context():
        # Using a broad filter to avoid spelling issues
        u = User.query.filter(User.name.ilike('%Mark%')).first()
        if u:
            print(f"DEBUG: Found User {u.name} (ID: {u.id})")
            print(f"DEBUG: User Type: {u.user_type}")
            print(f"DEBUG: Available: {u.available}")
        else:
            print("DEBUG: No doctor found with 'Mark' in name.")

if __name__ == "__main__":
    check_status()
