from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from datetime import datetime, timezone
from app.schemas.auth import UserLogin, UserRegister, UserResponse
from app.db.database import db
from app.core.config import settings
from bson import ObjectId

router = APIRouter()

def get_db():
    return db.client[settings.MONGODB_DATABASE]

@router.post("/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    database = get_db()
    email_clean = credentials.email.strip().lower()
    
    user = await database.users.find_one({"email": email_clean})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Plain text password comparison as requested for hackathon
    if user.get("password") != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user.get("name", "User"),
        role=user.get("role", "citizen"),
        title=user.get("title", "Active Citizen"),
        ward=user.get("ward"),
        department=user.get("department")
    )

@router.post("/register", response_model=UserResponse)
async def register(data: UserRegister):
    database = get_db()
    email_clean = data.email.strip().lower()
    
    existing = await database.users.find_one({"email": email_clean})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    now_iso = datetime.now(timezone.utc).isoformat()
    new_user = {
        "email": email_clean,
        "password": data.password,
        "name": data.name.strip(),
        "role": data.role or "citizen",
        "title": "Municipal Officer" if data.role == "admin" else "Active Citizen Reporter",
        "ward": data.ward,
        "department": data.department,
        "createdAt": now_iso
    }
    
    res = await database.users.insert_one(new_user)
    
    return UserResponse(
        id=str(res.inserted_id),
        email=email_clean,
        name=new_user["name"],
        role=new_user["role"],
        title=new_user["title"],
        ward=new_user.get("ward"),
        department=new_user.get("department")
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user(email: str = Query(...)):
    database = get_db()
    user = await database.users.find_one({"email": email.strip().lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        name=user.get("name", "User"),
        role=user.get("role", "citizen"),
        title=user.get("title", "Active Citizen"),
        ward=user.get("ward"),
        department=user.get("department")
    )

@router.get("/accounts", response_model=List[UserResponse])
async def list_available_accounts():
    """Returns available accounts for quick hackathon login."""
    database = get_db()
    users = await database.users.find({}).to_list(length=20)
    result = []
    for u in users:
        result.append(UserResponse(
            id=str(u["_id"]),
            email=u["email"],
            name=u.get("name", "User"),
            role=u.get("role", "citizen"),
            title=u.get("title", "Active Citizen"),
            ward=u.get("ward"),
            department=u.get("department")
        ))
    return result
