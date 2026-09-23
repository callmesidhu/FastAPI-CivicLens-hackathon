from fastapi import APIRouter, HTTPException
from app.schemas.ticket import TicketResponse
from app.db.database import db
from app.core.config import settings
from bson import ObjectId

router = APIRouter()

def get_db():
    return db.client[settings.MONGODB_DATABASE]

@router.get("/{ticket_number}", response_model=TicketResponse)
async def get_ticket(ticket_number: str):
    database = get_db()
    
    ticket = await database.tickets.find_one({"ticketNumber": ticket_number.upper()})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    ticket["_id"] = str(ticket["_id"])
    
    # Enrich with facility name
    try:
        facility = await database.facilities.find_one({"_id": ObjectId(ticket["facilityId"])})
        if facility:
            ticket["facilityName"] = facility.get("name")
    except:
        pass
        
    # Enrich with local body name
    try:
        local_body = await database.local_bodies.find_one({"_id": ObjectId(ticket["localBodyId"])})
        if local_body:
            ticket["localBodyName"] = local_body.get("name")
            ticket["localBodyWard"] = local_body.get("ward")
    except:
        pass
        
    return TicketResponse(**ticket)
