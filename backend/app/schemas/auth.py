from pydantic import BaseModel, EmailStr
from typing import Optional

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "citizen"
    ward: Optional[str] = None
    department: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    title: Optional[str] = None
    ward: Optional[str] = None
    department: Optional[str] = None
