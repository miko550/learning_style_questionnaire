from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    text: str
    category: str

class Question(QuestionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ResponseBase(BaseModel):
    question_id: int
    answer: int

class ResponseCreate(ResponseBase):
    pass

class Response(ResponseBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class LearningStyleResult(BaseModel):
    id: int
    user_id: int
    visual_score: int
    auditory_score: int
    reading_score: int
    kinesthetic_score: int
    dominant_style: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Admin view: response joined with question details
class ResponseWithQuestion(BaseModel):
    question_id: int
    question_text: str
    category: str
    answer: int
    created_at: datetime

    class Config:
        from_attributes = True
