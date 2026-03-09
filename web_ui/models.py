from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    interviews = relationship("InterviewSession", back_populates="user")

class InterviewSession(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    cv_text = Column(Text, nullable=True)
    jd_text = Column(Text, nullable=True)
    match_score = Column(Float, nullable=True)

    status = Column(String, default="setup") # setup, in_progress, completed
    final_score = Column(Float, nullable=True)
    violation_count = Column(Integer, default=0)
    report_json = Column(Text, nullable=True)

    user = relationship("User", back_populates="interviews")
