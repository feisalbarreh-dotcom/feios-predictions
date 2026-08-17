from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PredictionBase(BaseModel):
    match_id: str
    home_team: str
    away_team: str
    match_date: datetime
    best_bet: str
    odds: float
    probability: float
    confidence: str

class Prediction(PredictionBase):
    id: int
    result: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
