from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
from app.schemas.ticket import TicketResponse
from app.db.database import db
from app.core.config import settings
from bson import ObjectId

router = APIRouter()

def get_db():
    return db.client[settings.MONGODB_DATABASE]

class TicketStatusUpdate(BaseModel):
    status: str
    resolutionNotes: Optional[str] = None
    resolvedImageUrl: Optional[str] = None

@router.get("/", response_model=List[TicketResponse])
async def list_tickets(status: Optional[str] = None, limit: int = 50):
    database = get_db()
    query = {}
    if status and status != 'all':
        query["status"] = status
        
    cursor = database.tickets.find(query).sort("createdAt", -1).limit(limit)
    tickets = await cursor.to_list(length=limit)
    
    result = []
    for t in tickets:
        t["_id"] = str(t["_id"])
        try:
            facility = await database.facilities.find_one({"_id": ObjectId(t["facilityId"])})
            if facility:
                t["facilityName"] = facility.get("name")
        except:
            pass
        try:
            local_body = await database.local_bodies.find_one({"_id": ObjectId(t["localBodyId"])})
            if local_body:
                t["localBodyName"] = local_body.get("name")
                t["localBodyWard"] = local_body.get("ward")
        except:
            pass
        result.append(TicketResponse(**t))
    return result

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

@router.patch("/{ticket_number}/status", response_model=TicketResponse)
async def update_ticket_status(ticket_number: str, update: TicketStatusUpdate):
    database = get_db()
    ticket = await database.tickets.find_one({"ticketNumber": ticket_number.upper()})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    now_iso = datetime.now(timezone.utc).isoformat()
    update_data = {
        "status": update.status,
        "updatedAt": now_iso,
    }
    if update.resolutionNotes:
        update_data["resolutionNotes"] = update.resolutionNotes
    if update.resolvedImageUrl:
        update_data["resolvedImageUrl"] = update.resolvedImageUrl
        
    await database.tickets.update_one({"_id": ticket["_id"]}, {"$set": update_data})
    
    # If resolved, update facility condition to clean
    if update.status == "resolved" and ticket.get("facilityId"):
        try:
            await database.facilities.update_one(
                {"_id": ObjectId(ticket["facilityId"])},
                {"$set": {"condition": "clean", "lastUpdated": now_iso}}
            )
        except:
            pass
            
    return await get_ticket(ticket_number)
