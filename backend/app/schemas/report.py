from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    facilityId: str
    condition: str
    description: Optional[str] = None
    imageUrl: Optional[str] = None

class ReportResponse(BaseModel):
    id: str = Field(alias="_id")
    facilityId: str
    condition: str
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    createdAt: str
    status: str
    anonymous: bool
    ticketId: str
    localBodyId: str
    department: str
    priority: str
    idempotencyKey: Optional[str] = None
