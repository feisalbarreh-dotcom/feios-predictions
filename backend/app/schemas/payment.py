from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    user_id: int
    amount: int
    transaction_id: str
    status: str

class Payment(PaymentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
