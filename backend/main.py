from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, services
from models import User
from auth import get_password_hash
from sqlalchemy.orm import Session
from database import SessionLocal

# Create tables
# Note: In a real app, you would use Alembic migrations
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nearby Services Finder API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(services.admin_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Nearby Services Finder API"}

# Seed admin user if it doesn't exist
def seed_admin():
    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                hashed_password=get_password_hash("admin123")
            )
            db.add(admin)
            db.commit()
            print("Admin user created: admin / admin123")
    except Exception as e:
        print(f"Error seeding admin: {e}")
    finally:
        db.close()

seed_admin()
