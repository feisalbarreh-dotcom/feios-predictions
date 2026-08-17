"""
database.py - Database Configuration
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

# Database URL - using SQLite for development
DATABASE_URL = "sqlite:///./feios_predictions.db"

# For PostgreSQL in production:
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/feios_predictions")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}  # Only needed for SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
