from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.schemas.report import ReportCreate, ReportResponse
from app.schemas.ticket import TicketCreationResponse
from app.db.database import db
from app.core.config import settings
from bson import ObjectId
from datetime import datetime, timezone, timedelta

router = APIRouter()

def get_db():
    return db.client[settings.MONGODB_DATABASE]

def determine_priority(condition: str) -> str:
    if condition in ["broken", "no_water"]:
        return "high" if condition == "broken" else "medium"
    if condition == "locked":
        return "medium"
    return "low"

def generate_ticket_number(reports_collection) -> str:
    # A simple sequential ticket generator for the hackathon
    count = 1042 # Starting offset
    # Note: In production use a more robust sequence generator
    return f"CF-{count}" # In a real app we would increment this

@router.post("/", response_model=TicketCreationResponse)
async def create_report(
    report: ReportCreate,
    x_idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key")
):
    database = get_db()
    
    # User must be logged in to report a problem
    if not report.userEmail:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: You must be logged in to report a problem."
        )
    
    # 0. Idempotency Check
    if x_idempotency_key:
        existing_report = await database.reports.find_one({"idempotencyKey": x_idempotency_key})
        if existing_report:
            # Report already exists, just fetch the ticket and return it
            ticket = await database.tickets.find_one({"reportId": str(existing_report["_id"])})
            if ticket:
                if report.userEmail and not ticket.get("userEmail"):
                    await database.tickets.update_one(
                        {"_id": ticket["_id"]},
                        {"$set": {"userEmail": report.userEmail.strip().lower()}}
                    )
                return TicketCreationResponse(
                    reportId=str(existing_report["_id"]),
                    ticketNumber=ticket["ticketNumber"],
                    status=ticket["status"],
                    priority=ticket["priority"],
                    imageUrl=ticket.get("imageUrl"),
                    localBody=ticket.get("localBodyId", "Municipal Body"),
                    department=ticket.get("department", "Public Works"),
                    expectedResponse=ticket.get("expectedResponse", "Within 24 hours"),
                    userEmail=ticket.get("userEmail") or (report.userEmail.strip().lower() if report.userEmail else None),
                    userId=ticket.get("userId")
                )

    # 1. Validate facility exists
    try:
        facility_id = ObjectId(report.facilityId)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid facility ID format")
        
    facility = await database.facilities.find_one({"_id": facility_id})
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")

    # 2. Duplicate detection
    two_hours_ago = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    recent_duplicate = await database.reports.find_one({
        "facilityId": report.facilityId,
        "condition": report.condition,
        "createdAt": {"$gte": two_hours_ago}
    })
    
    if recent_duplicate:
        # If it's a duplicate, just return the existing ticket details
        ticket = await database.tickets.find_one({"reportId": str(recent_duplicate["_id"])})
        if ticket:
            if report.userEmail and not ticket.get("userEmail"):
                await database.tickets.update_one(
                    {"_id": ticket["_id"]},
                    {"$set": {"userEmail": report.userEmail.strip().lower()}}
                )
            return TicketCreationResponse(
                reportId=str(recent_duplicate["_id"]),
                ticketNumber=ticket["ticketNumber"],
                status=ticket["status"],
                priority=ticket["priority"],
                imageUrl=ticket.get("imageUrl"),
                localBody=ticket.get("localBodyId", "Municipal Body"),
                department=ticket.get("department", "Public Works"),
                expectedResponse=ticket.get("expectedResponse", "Within 24 hours"),
                userEmail=ticket.get("userEmail") or (report.userEmail.strip().lower() if report.userEmail else None),
                userId=ticket.get("userId")
            )

    # 3. Routing (Find Local Body and Department)
    local_body_id = facility.get("localBodyId")
    if not local_body_id:
        raise HTTPException(status_code=500, detail="Facility is not mapped to a local body")
        
    try:
        lb_obj_id = ObjectId(local_body_id)
        local_body = await database.local_bodies.find_one({"_id": lb_obj_id})
    except:
        local_body = None
        
    if not local_body:
        raise HTTPException(status_code=500, detail="Mapped local body not found")

    department_name = "General Department"
    for dept in local_body.get("departments", []):
        if report.condition in dept.get("handles", []) or facility.get("type") in dept.get("handles", []):
            department_name = dept["name"]
            break

    priority = determine_priority(report.condition)
    
    # Generate simple ticket number based on total tickets count
    ticket_count = await database.tickets.count_documents({})
    ticket_number = f"CF-{1042 + ticket_count}"
    
    now_iso = datetime.now(timezone.utc).isoformat()

    # 4. Create Report
    report_doc = {
        "facilityId": report.facilityId,
        "condition": report.condition,
        "description": report.description,
        "imageUrl": report.imageUrl,
        "createdAt": now_iso,
        "status": "submitted",
        "anonymous": report.userEmail is None,
        "userEmail": report.userEmail.strip().lower() if report.userEmail else None,
        "userId": report.userId,
        "ticketId": "", # Will update after ticket creation
        "localBodyId": str(local_body_id),
        "department": department_name,
        "priority": priority,
        "idempotencyKey": x_idempotency_key
    }
    
    report_res = await database.reports.insert_one(report_doc)
    report_id = str(report_res.inserted_id)
    
    # 5. Create Ticket
    ticket_doc = {
        "ticketNumber": ticket_number,
        "reportId": report_id,
        "facilityId": report.facilityId,
        "localBodyId": str(local_body_id),
        "department": department_name,
        "issueType": report.condition,
        "priority": priority,
        "status": "submitted",
        "imageUrl": report.imageUrl,
        "userEmail": report.userEmail.strip().lower() if report.userEmail else None,
        "userId": report.userId,
        "createdAt": now_iso,
        "expectedResponse": f"Within {local_body.get('responseTimeHours', 24)} hours",
        "updatedAt": now_iso
    }
    
    ticket_res = await database.tickets.insert_one(ticket_doc)
    
    # 6. Update Report with Ticket ID
    await database.reports.update_one(
        {"_id": report_res.inserted_id},
        {"$set": {"ticketId": str(ticket_res.inserted_id)}}
    )
    
    # Return response
    return TicketCreationResponse(
        reportId=report_id,
        ticketNumber=ticket_number,
        status="submitted",
        priority=priority,
        imageUrl=ticket_doc.get("imageUrl"),
        localBody=local_body.get("name", "Unknown"),
        department=department_name,
        expectedResponse=ticket_doc["expectedResponse"],
        userEmail=ticket_doc.get("userEmail"),
        userId=ticket_doc.get("userId")
    )

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    database = get_db()
    try:
        obj_id = ObjectId(report_id)
    except:
        raise HTTPException(status_code=422, detail="Invalid report ID format")
        
    doc = await database.reports.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Report not found")
        
    doc["_id"] = str(doc["_id"])
    return ReportResponse(**doc)
