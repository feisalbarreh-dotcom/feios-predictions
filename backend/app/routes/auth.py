"""
Auth routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..models.base import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.get("/")
async def get_all(db: Session = Depends(get_db)):
    """Get all auth."""
    return {"message": "Get all auth"}

@router.get("/{item_id}")
async def get_one(item_id: int, db: Session = Depends(get_db)):
    """Get a single auth item."""
    return {"message": f"Get auth item {item_id}"}

@router.post("/")
async def create_item(data: dict, db: Session = Depends(get_db)):
    """Create a new auth item."""
    return {"message": "Create auth item", "data": data}

@router.put("/{item_id}")
async def update_item(item_id: int, data: dict, db: Session = Depends(get_db)):
    """Update a auth item."""
    return {"message": f"Update auth item {item_id}", "data": data}

@router.delete("/{item_id}")
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a auth item."""
    return {"message": f"Delete auth item {item_id}"}
