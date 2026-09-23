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
    distanceMeters: Optional[float] = None
    confidenceScore: Optional[int] = None
    confidenceLevel: Optional[str] = None
    isUserReported: Optional[bool] = False
    
    model_config = ConfigDict(populate_by_name=True)

class FacilityListResponse(BaseModel):
    data: List[FacilityResponse]
