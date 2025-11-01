from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, ForeignKey, Text, text
import os
import time
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Prefer environment variable provided by Docker Compose; fallback to default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@db:5432/learning_style_db")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    responses = relationship("Response", back_populates="user")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # visual, auditory, reading, kinesthetic
    created_at = Column(DateTime, default=datetime.utcnow)

class Response(Base):
    __tablename__ = "responses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    answer = Column(Integer, nullable=False)  # 1-5 scale
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="responses")
    question = relationship("Question")

class LearningStyleResult(Base):
    __tablename__ = "learning_style_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    visual_score = Column(Integer, default=0)
    auditory_score = Column(Integer, default=0)
    reading_score = Column(Integer, default=0)
    kinesthetic_score = Column(Integer, default=0)
    dominant_style = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User")

def wait_for_db(max_attempts: int = 30, delay_seconds: float = 1.0) -> None:
    """Block until the database is ready to accept connections."""
    attempts = 0
    while attempts < max_attempts:
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                return
        except Exception:
            attempts += 1
            time.sleep(delay_seconds)
    # Last attempt; raise for visibility
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))


def create_tables():
    wait_for_db()
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
