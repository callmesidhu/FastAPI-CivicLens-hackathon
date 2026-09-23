from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

class RatingCreate(BaseModel):
    facilityId: str
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    feedback: Optional[str] = None
    userId: str
    userEmail: Optional[str] = None

class RatingResponse(BaseModel):
    id: str = Field(alias="_id")
    facilityId: str
    rating: int
    feedback: Optional[str]
    userId: str
    userEmail: Optional[str]
    createdAt: str
