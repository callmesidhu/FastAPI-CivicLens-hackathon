from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List
from app.schemas.facility import FacilityListResponse, FacilityResponse, RouteSearchRequest
from app.db.database import db
from app.core.config import settings
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
try:
    from ai.inference import predict_confidence, predict_recommendation_score
except ImportError:
    predict_confidence = None
    predict_recommendation_score = None
from bson import ObjectId

router = APIRouter()

def get_collection():
    return db.client[settings.MONGODB_DATABASE].facilities

def format_facility(doc: dict, distance_meters: Optional[float] = None) -> dict:
    last_updated = doc.get("lastUpdated", "")
    recent_report = doc.get("recentReport")
    
    is_user_reported = False
    condition = doc.get("condition", "")
    last_updated_time = last_updated
    
    if recent_report:
        is_user_reported = True
        condition = recent_report.get("condition", condition)
        last_updated_time = recent_report.get("createdAt", last_updated)

    # ML Inference for Confidence
    inference_input = {
        "reportsCount": doc.get("reportsCount", 1),
        "upvotes": doc.get("upvotes", 0),
        "downvotes": doc.get("downvotes", 0),
        "lastUpdated": last_updated_time,
        "condition": condition
    }
    
    if predict_confidence:
        scoring = predict_confidence(inference_input)
    else:
        scoring = {"confidenceScore": 50, "confidenceLevel": "moderate", "confidenceProb": 0.5}
        
    if is_user_reported and not doc.get("verified"):
        scoring["confidenceScore"] = max(0, scoring["confidenceScore"] - 10)
        scoring["confidenceLevel"] = "moderate" if scoring["confidenceScore"] >= 50 else "low"
        
    rec_score = 0.0
    if predict_recommendation_score and distance_meters is not None:
        rec_score = predict_recommendation_score(distance_meters, condition, scoring.get("confidenceProb", 0.5))

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
        "recommendationScore": rec_score,
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
        
    # Sort by ML Recommendation Score (descending)
    facilities.sort(key=lambda x: x.get("recommendationScore", 0.0), reverse=True)
        
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

import math

def point_to_segment_distance_meters(px, py, ax, ay, bx, by):
    # Rough approximation: 1 degree latitude = 111,320 meters
    # 1 degree longitude = 111,320 * cos(latitude) meters
    lat_mid = math.radians((ay + by) / 2)
    m_per_deg_lat = 111320
    m_per_deg_lng = 111320 * math.cos(lat_mid)
    
    # Convert to meters relative to A
    px_m = (px - ax) * m_per_deg_lng
    py_m = (py - ay) * m_per_deg_lat
    bx_m = (bx - ax) * m_per_deg_lng
    by_m = (by - ay) * m_per_deg_lat
    
    # Vector AB
    ab2 = bx_m * bx_m + by_m * by_m
    if ab2 == 0:
        return math.sqrt(px_m * px_m + py_m * py_m)
        
    # Project point P onto AB
    t = (px_m * bx_m + py_m * by_m) / ab2
    t = max(0, min(1, t))
    
    proj_x = t * bx_m
    proj_y = t * by_m
    
    # Distance from P to projection
    dx = px_m - proj_x
    dy = py_m - proj_y
    return math.sqrt(dx * dx + dy * dy)

@router.post("/route", response_model=FacilityListResponse)
async def search_facilities_along_route(req: RouteSearchRequest):
    collection = get_collection()
    
    match_query = {}
    if req.type:
        match_query["type"] = "drinking_water" if req.type == "water" else req.type
    if req.condition:
        match_query["condition"] = req.condition
    if req.availability:
        match_query["availability"] = req.availability
    if req.wheelchairAccessible is not None:
        match_query["accessibility.wheelchairAccessible"] = req.wheelchairAccessible
        
    if len(req.path) < 2:
        raise HTTPException(status_code=400, detail="Path must contain at least 2 points for a route.")
        
    # Since dataset is small (~60 items), fetch all matching filters and calculate distance in memory.
    cursor = collection.find(match_query)
    
    facilities = []
    async for doc in cursor:
        lat = doc.get("location", {}).get("coordinates", [0, 0])[1]
        lng = doc.get("location", {}).get("coordinates", [0, 0])[0]
        
        # Calculate min distance to any segment in the path
        min_dist = float('inf')
        for i in range(len(req.path) - 1):
            ax, ay = req.path[i]
            bx, by = req.path[i+1]
            dist = point_to_segment_distance_meters(lng, lat, ax, ay, bx, by)
            if dist < min_dist:
                min_dist = dist
                
        if min_dist <= req.maxDistance:
            recent_report = await db.client[settings.MONGODB_DATABASE].reports.find_one(
                {"facilityId": str(doc["_id"])},
                sort=[("createdAt", -1)]
            )
            if recent_report:
                doc["recentReport"] = recent_report
                
            facilities.append(format_facility(doc, distance_meters=min_dist))
        
    # Sort by ML Recommendation Score (descending)
    facilities.sort(key=lambda x: x.get("recommendationScore", 0.0), reverse=True)
        
    return {"data": facilities}
