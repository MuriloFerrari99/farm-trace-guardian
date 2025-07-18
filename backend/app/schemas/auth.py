
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    name: str
    role: Optional[UserRole] = UserRole.OPERATOR

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileResponse(BaseModel):
    id: UUID
    name: str
    avatar_url: Optional[str] = None
    role: UserRole
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: UUID
    email: str
    is_active: bool
    created_at: datetime
    profile: Optional[ProfileResponse] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
