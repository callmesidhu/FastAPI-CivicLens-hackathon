from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List
from app.schemas.facility import FacilityListResponse, FacilityResponse
from app.db.database import db
from app.core.config import settings
from app.utils.scoring import calculate_freshness_and_confidence
from bson import ObjectId

router = APIRouter()

def get_collection():
    return db.client[settings.MONGODB_DATABASE].facilities

def format_facility(doc: dict, distance_meters: Optional[float] = None) -> dict:
    last_updated = doc.get("lastUpdated", "")
    scoring = calculate_freshness_and_confidence(last_updated)
    
    # Check if there is a recent report in the doc (we'll join this in the queries)
    recent_report = doc.get("recentReport")
    
    is_user_reported = False
    condition = doc.get("condition", "")
    last_updated_time = last_updated
    
    if recent_report:
        is_user_reported = True
        condition = recent_report.get("condition", condition)
        last_updated_time = recent_report.get("createdAt", last_updated)
        scoring = calculate_freshness_and_confidence(last_updated_time)
        # Decay confidence by 20% for unverified user reports
        scoring["confidenceScore"] = max(0, scoring["confidenceScore"] - 20)
        scoring["confidenceLevel"] = "moderate" if scoring["confidenceScore"] >= 50 else "low"

    result = {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "type": doc.get("type", ""),
        "latitude": doc.get("location", {}).get("coordinates", [0, 0])[1],
        "longitude": doc.get("location", {}).get("coordinates", [0, 0])[0],
        "address": doc.get("address", ""),
        "accessibility": doc.get("accessibility", {"wheelchairAccessible": False}),
        "availability": doc.get("availability", ""),
        "condition": condition,
        "lastUpdated": last_updated_time,
        "confidenceScore": scoring["confidenceScore"],
        "confidenceLevel": scoring["confidenceLevel"],
        "isUserReported": is_user_reported
    }
    
    if distance_meters is not None:
        result["distanceMeters"] = distance_meters
        
    return result

@router.get("/", response_model=FacilityListResponse)
async def get_facilities(
    type: Optional[str] = Query(None, description="Filter by facility type"),
    condition: Optional[str] = Query(None, description="Filter by condition"),
    wheelchairAccessible: Optional[bool] = Query(None, description="Filter by wheelchair accessibility"),
    availability: Optional[str] = Query(None, description="Filter by availability")
):
    collection = get_collection()
    query = {}
    
    if type:
        query["type"] = "drinking_water" if type == "water" else type
    if condition:
        query["condition"] = condition
    if availability:
        query["availability"] = availability
    if wheelchairAccessible is not None:
        query["accessibility.wheelchairAccessible"] = wheelchairAccessible

    cursor = collection.find(query)
    facilities = []
    async for doc in cursor:
        # Get recent report for this facility
        recent_report = await db.client[settings.MONGODB_DATABASE].reports.find_one(
            {"facilityId": str(doc["_id"])},
            sort=[("createdAt", -1)]
        )
        if recent_report:
            doc["recentReport"] = recent_report
        facilities.append(format_facility(doc))
        
    return {"data": facilities}

@router.get("/nearby", response_model=FacilityListResponse)
async def get_nearby_facilities(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: int = Query(1000, description="Radius in meters"),
    type: Optional[str] = Query(None, description="Filter by facility type"),
    condition: Optional[str] = Query(None, description="Filter by condition"),
    wheelchairAccessible: Optional[bool] = Query(None, description="Filter by wheelchair accessibility"),
    availability: Optional[str] = Query(None, description="Filter by availability")
):
    collection = get_collection()
    
    match_query = {}
    if type:
        match_query["type"] = "drinking_water" if type == "water" else type
    if condition:
        match_query["condition"] = condition
    if availability:
        match_query["availability"] = availability
    if wheelchairAccessible is not None:
        match_query["accessibility.wheelchairAccessible"] = wheelchairAccessible
        
    pipeline = [
        {
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "distanceField": "distance",
                "maxDistance": radius,
                "spherical": True,
                "query": match_query
            }
        }
    ]
    
    cursor = collection.aggregate(pipeline)
    facilities = []
    async for doc in cursor:
        recent_report = await db.client[settings.MONGODB_DATABASE].reports.find_one(
            {"facilityId": str(doc["_id"])},
            sort=[("createdAt", -1)]
        )
        if recent_report:
            doc["recentReport"] = recent_report
        facilities.append(format_facility(doc, distance_meters=doc.get("distance")))
        
    return {"data": facilities}

@router.get("/search", response_model=FacilityListResponse)
async def search_facilities(
    q: str = Query(..., description="Search query")
):
    collection = get_collection()
    cursor = collection.find({"$text": {"$search": q}})
    
    facilities = []
    async for doc in cursor:
        recent_report = await db.client[settings.MONGODB_DATABASE].reports.find_one(
            {"facilityId": str(doc["_id"])},
            sort=[("createdAt", -1)]
        )
        if recent_report:
            doc["recentReport"] = recent_report
        facilities.append(format_facility(doc))
        
    return {"data": facilities}

@router.get("/{facility_id}", response_model=FacilityResponse)
async def get_facility(facility_id: str):
    collection = get_collection()
    try:
        obj_id = ObjectId(facility_id)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid facility ID format")

    doc = await collection.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Facility not found")
        
    recent_report = await db.client[settings.MONGODB_DATABASE].reports.find_one(
        {"facilityId": str(doc["_id"])},
        sort=[("createdAt", -1)]
    )
    if recent_report:
        doc["recentReport"] = recent_report
        
    return format_facility(doc)
