from pydantic import BaseModel, Field
from typing import Optional

class TicketResponse(BaseModel):
    id: str = Field(alias="_id")
    ticketNumber: str
    reportId: str
    facilityId: str
    localBodyId: str
    department: str
    issueType: str
    priority: str
    status: str
    imageUrl: Optional[str] = None
    createdAt: str
    expectedResponse: str
    updatedAt: str
    
    # These fields are enriched when returning to the client
    facilityName: Optional[str] = None
    localBodyName: Optional[str] = None
    localBodyWard: Optional[str] = None
    resolutionNotes: Optional[str] = None
    resolvedImageUrl: Optional[str] = None

class TicketCreationResponse(BaseModel):
    reportId: str
    ticketNumber: str
    status: str
    priority: str
    imageUrl: Optional[str] = None
    localBody: str
    department: str
    expectedResponse: str
