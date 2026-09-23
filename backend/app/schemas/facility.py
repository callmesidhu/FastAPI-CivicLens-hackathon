from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class Location(BaseModel):
    type: str = "Point"
    coordinates: List[float] # [longitude, latitude]

class Accessibility(BaseModel):
    wheelchairAccessible: bool

class FacilityBase(BaseModel):
    name: str
    type: str
    location: Location
    address: str
    accessibility: Accessibility
    availability: str
    condition: str
    lastUpdated: str
    localBodyId: Optional[str] = None
    status: str = "active"
    submittedBy: Optional[str] = None
    verifications: Optional[List[str]] = Field(default_factory=list)

class FacilityCreate(FacilityBase):
    pass

class FacilityResponse(BaseModel):
    id: str = Field(alias="id")
    name: str
    type: str
    latitude: float
    longitude: float
    address: str
    accessibility: Accessibility
    availability: str
    condition: str
    lastUpdated: str
    status: str
    submittedBy: Optional[str] = None
    verifications: Optional[List[str]] = Field(default_factory=list)
    distanceMeters: Optional[float] = None
    confidenceScore: Optional[int] = None
    confidenceLevel: Optional[str] = None
    recommendationScore: Optional[float] = None
    isUserReported: Optional[bool] = False
    
    model_config = ConfigDict(populate_by_name=True)

class FacilityListResponse(BaseModel):
    data: List[FacilityResponse]

class RouteSearchRequest(BaseModel):
    path: List[List[float]] = Field(..., description="List of [longitude, latitude] coordinates forming the route")
    maxDistance: int = Field(1000, description="Radius in meters from the route")
    type: Optional[str] = None
    condition: Optional[str] = None
    wheelchairAccessible: Optional[bool] = None
    availability: Optional[str] = None
