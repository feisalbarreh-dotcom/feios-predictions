"""
Users routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models.base import get_db

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
async def get_all(db: Session = Depends(get_db)):
    """Get all users."""
    return {"message": "Get all users"}

@router.get("/{item_id}")
async def get_one(item_id: int, db: Session = Depends(get_db)):
    """Get a single users item."""
    return {"message": f"Get users item {item_id}"}

@router.post("/")
async def create_item(data: dict, db: Session = Depends(get_db)):
    """Create a new users item."""
    return {"message": "Create users item", "data": data}

@router.put("/{item_id}")
async def update_item(item_id: int, data: dict, db: Session = Depends(get_db)):
    """Update a users item."""
    return {"message": f"Update users item {item_id}", "data": data}

@router.delete("/{item_id}")
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a users item."""
    return {"message": f"Delete users item {item_id}"}
