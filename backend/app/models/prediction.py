"""
prediction.py - Prediction Model with Result Tracking
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Date
from sqlalchemy.sql import func
from ..database import Base

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(String(50), unique=True, index=True)
    home_team = Column(String(100))
    away_team = Column(String(100))
    match_date = Column(DateTime)
    match_date_only = Column(Date)
    best_bet = Column(String(50))
    odds = Column(Float)
    probability = Column(Float)
    confidence = Column(String(20))
    home_win_prob = Column(Float)
    draw_prob = Column(Float)
    away_win_prob = Column(Float)
    
    # Result tracking
    result = Column(String(20), nullable=True)  # 'home_win', 'draw', 'away_win'
    home_score = Column(Integer, nullable=True)
    away_score = Column(Integer, nullable=True)
    is_settled = Column(Boolean, default=False)
    won = Column(Boolean, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
