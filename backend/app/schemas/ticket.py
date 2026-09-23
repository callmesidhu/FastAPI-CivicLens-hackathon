from pydantic import BaseModel, Field
from typing import Optional

class TicketResponse(BaseModel):
    id: str = Field(alias="_id")
    ticketNumber: str
    reportId: Optional[str] = None
    facilityId: Optional[str] = None
    localBodyId: Optional[str] = None
    department: Optional[str] = "Municipal Works"
    issueType: Optional[str] = "Maintenance"
    priority: Optional[str] = "medium"
    status: str
    imageUrl: Optional[str] = None
    createdAt: Optional[str] = None
    expectedResponse: Optional[str] = "Within 24 hours"
    updatedAt: Optional[str] = None
    resolvedAt: Optional[str] = None
    
    # These fields are enriched when returning to the client
    facilityName: Optional[str] = None
    localBodyName: Optional[str] = None
    localBodyWard: Optional[str] = None
    resolutionNotes: Optional[str] = None
    resolvedImageUrl: Optional[str] = None
    resolvedBy: Optional[str] = None
    resolvedByName: Optional[str] = None
    userEmail: Optional[str] = None
    userId: Optional[str] = None

class TicketCreationResponse(BaseModel):
    reportId: str
    ticketNumber: str
    status: str
    priority: str
    imageUrl: Optional[str] = None
    localBody: str
    department: str
    expectedResponse: str
    userEmail: Optional[str] = None
    userId: Optional[str] = None
