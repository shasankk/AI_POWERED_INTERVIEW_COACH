from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class InterviewCreate(BaseModel):
    cv_text: Optional[str] = None
    jd_text: Optional[str] = None

class InterviewResponse(BaseModel):
    id: int
    user_id: int
    started_at: datetime
    status: str
    match_score: Optional[float] = None
    
    class Config:
        from_attributes = True
