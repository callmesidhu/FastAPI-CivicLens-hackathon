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
    officerName: Optional[str] = None
    department: Optional[str] = None
    resolvedBy: Optional[str] = "admin@civiclens.com"

async def enrich_ticket_doc(database, t: dict) -> dict:
    t["_id"] = str(t["_id"])
    
    # Normalize legacy or alternate fields
    if "assignedDepartment" in t and not t.get("department"):
        t["department"] = t["assignedDepartment"]
    if "condition" in t and not t.get("issueType"):
        t["issueType"] = t["condition"]
    if "notes" in t and not t.get("resolutionNotes"):
        t["resolutionNotes"] = t["notes"]
    if "status" in t:
        t["status"] = str(t["status"]).lower()
    if not t.get("updatedAt"):
        t["updatedAt"] = t.get("createdAt") or datetime.now(timezone.utc).isoformat()
    if not t.get("priority"):
        t["priority"] = "medium"
    if not t.get("expectedResponse"):
        t["expectedResponse"] = "Within 24 hours"
    if t.get("status") == "resolved" and not t.get("resolvedBy"):
        t["resolvedBy"] = "admin@civiclens.com"
        t["resolvedByName"] = "Municipal Authority Admin"

    # Facility enrichment
    if not t.get("facilityName") and t.get("facilityId"):
        try:
            facility = await database.facilities.find_one({"_id": ObjectId(t["facilityId"])})
            if facility:
                t["facilityName"] = facility.get("name")
        except Exception:
            pass

    # Local body enrichment
    if t.get("localBodyId"):
        try:
            local_body = await database.local_bodies.find_one({"_id": ObjectId(t["localBodyId"])})
            if local_body:
                t["localBodyName"] = local_body.get("name")
                t["localBodyWard"] = local_body.get("ward")
        except Exception:
            pass

    return t

@router.get("", response_model=List[TicketResponse], include_in_schema=False)
@router.get("/", response_model=List[TicketResponse])
async def list_tickets(
    status: Optional[str] = None,
    userEmail: Optional[str] = None,
    ticketNumbers: Optional[str] = None,
    limit: int = 50
):
    database = get_db()
    query = {}
    
    if status and status != 'all':
        clean_status = status.strip().lower()
        if clean_status in ['open', 'submitted', 'pending']:
            query["status"] = {"$in": ["open", "submitted", "pending", "OPEN", "SUBMITTED", "PENDING"]}
        elif clean_status in ['in_progress', 'dispatched']:
            query["status"] = {"$in": ["in_progress", "IN_PROGRESS", "dispatched", "DISPATCHED"]}
        elif clean_status == 'resolved':
            query["status"] = {"$in": ["resolved", "RESOLVED"]}
        else:
            query["status"] = {"$regex": f"^{clean_status}$", "$options": "i"}

    if userEmail:
        query["userEmail"] = userEmail.strip().lower()

    if ticketNumbers:
        numbers_list = [num.strip().upper() for num in ticketNumbers.split(",") if num.strip()]
        if numbers_list:
            if "userEmail" in query:
                # Match either the user's email or explicit ticket numbers list
                query = {
                    "$or": [
                        {"userEmail": userEmail.strip().lower()},
                        {"ticketNumber": {"$in": numbers_list}}
                    ]
                }
            else:
                query["ticketNumber"] = {"$in": numbers_list}
        
    cursor = database.tickets.find(query).sort("createdAt", -1).limit(limit)
    tickets = await cursor.to_list(length=limit)
    
    result = []
    for t in tickets:
        enriched = await enrich_ticket_doc(database, t)
        result.append(TicketResponse(**enriched))
    return result

@router.get("/{ticket_number}", response_model=TicketResponse)
async def get_ticket(ticket_number: str):
    database = get_db()
    
    ticket = await database.tickets.find_one({"ticketNumber": ticket_number.upper()})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    enriched = await enrich_ticket_doc(database, ticket)
    return TicketResponse(**enriched)

@router.patch("/{ticket_number}/status", response_model=TicketResponse)
async def update_ticket_status(ticket_number: str, update: TicketStatusUpdate):
    database = get_db()
    ticket = await database.tickets.find_one({"ticketNumber": ticket_number.upper()})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    now_iso = datetime.now(timezone.utc).isoformat()
    clean_status = update.status.strip().lower()
    
    update_data = {
        "status": clean_status,
        "updatedAt": now_iso,
    }
    if update.resolutionNotes:
        update_data["resolutionNotes"] = update.resolutionNotes
    if update.resolvedImageUrl:
        update_data["resolvedImageUrl"] = update.resolvedImageUrl
    if clean_status == "resolved":
        resolved_email = update.resolvedBy or "admin@civiclens.com"
        resolved_name = update.officerName or "Municipal Authority Admin"
        update_data["resolvedAt"] = now_iso
        update_data["resolvedBy"] = resolved_email
        update_data["resolvedByName"] = resolved_name
        
    await database.tickets.update_one({"_id": ticket["_id"]}, {"$set": update_data})
    
    # Sync with reports collection
    report_sync_data = {
        "status": clean_status,
        "updatedAt": now_iso,
    }
    if update.resolutionNotes:
        report_sync_data["resolutionNotes"] = update.resolutionNotes
    if update.resolvedImageUrl:
        report_sync_data["resolvedImageUrl"] = update.resolvedImageUrl
    if clean_status == "resolved":
        report_sync_data["resolvedAt"] = now_iso
        report_sync_data["resolvedBy"] = resolved_email
        report_sync_data["resolvedByName"] = resolved_name

    try:
        if ticket.get("reportId"):
            try:
                await database.reports.update_one(
                    {"_id": ObjectId(ticket["reportId"])},
                    {"$set": report_sync_data}
                )
            except Exception:
                await database.reports.update_one(
                    {"_id": ticket["reportId"]},
                    {"$set": report_sync_data}
                )
        await database.reports.update_one(
            {"ticketNumber": ticket_number.upper()},
            {"$set": report_sync_data}
        )
    except Exception as e:
        print("Warning: failed to sync report update:", e)
    
    # If resolved, update facility condition to clean
    if clean_status == "resolved" and ticket.get("facilityId"):
        try:
            await database.facilities.update_one(
                {"_id": ObjectId(ticket["facilityId"])},
                {"$set": {"condition": "clean", "lastUpdated": now_iso}}
            )
        except Exception:
            pass
            
    return await get_ticket(ticket_number)

class TicketClaimRequest(BaseModel):
    userEmail: str

@router.post("/{ticket_number}/claim", response_model=TicketResponse)
async def claim_ticket(ticket_number: str, req: TicketClaimRequest):
    database = get_db()
    ticket = await database.tickets.find_one({"ticketNumber": ticket_number.upper()})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    await database.tickets.update_one(
        {"_id": ticket["_id"]},
        {"$set": {"userEmail": req.userEmail.strip().lower()}}
    )
    
    return await get_ticket(ticket_number)

