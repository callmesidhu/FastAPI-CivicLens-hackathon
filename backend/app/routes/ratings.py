from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import datetime, timezone
from app.schemas.rating import RatingCreate, RatingResponse
from app.db.database import db
from app.core.config import settings
from bson import ObjectId

router = APIRouter()

def get_collection():
    return db.client[settings.MONGODB_DATABASE].ratings

def format_rating(doc: dict) -> dict:
    return {
        "_id": str(doc["_id"]),
        "facilityId": doc.get("facilityId", ""),
        "rating": doc.get("rating", 0),
        "feedback": doc.get("feedback"),
        "userId": doc.get("userId", ""),
        "userEmail": doc.get("userEmail"),
        "createdAt": doc.get("createdAt", "")
    }

@router.post("/", response_model=RatingResponse)
async def create_rating(rating: RatingCreate):
    collection = get_collection()
    
    # Check if facility exists
    try:
        facility_obj_id = ObjectId(rating.facilityId)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid facility ID format")
        
    facility = await db.client[settings.MONGODB_DATABASE].facilities.find_one({"_id": facility_obj_id})
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")

    # Check if user already rated
    existing_rating = await collection.find_one({
        "facilityId": rating.facilityId,
        "userId": rating.userId
    })
    
    if existing_rating:
        raise HTTPException(status_code=400, detail="User has already rated this facility")

    now_iso = datetime.now(timezone.utc).isoformat()
    doc = rating.model_dump()
    doc["createdAt"] = now_iso
    
    res = await collection.insert_one(doc)
    doc["_id"] = res.inserted_id
    
    # Also update facility's average rating/count asynchronously
    # For now, it will just insert the rating
    
    return format_rating(doc)

@router.get("/{facility_id}", response_model=List[RatingResponse])
async def get_ratings(facility_id: str):
    collection = get_collection()
    cursor = collection.find({"facilityId": facility_id}).sort("createdAt", -1)
    
    ratings = []
    async for doc in cursor:
        ratings.append(format_rating(doc))
        
    return ratings
