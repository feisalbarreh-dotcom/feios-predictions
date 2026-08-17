from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    transaction_id = Column(String(100), unique=True)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, server_default=func.now())
    
    user = relationship("User", back_populates="payments")
