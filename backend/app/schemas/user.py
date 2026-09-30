from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class PermissionOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class RoleOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    permissions: List[PermissionOut] = []
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role_name: Optional[str] = "SECURITY_ANALYST"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    is_active: bool
    role: RoleOut
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
