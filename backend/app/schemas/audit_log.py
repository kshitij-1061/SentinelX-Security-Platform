from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict

class AuditLogCreate(BaseModel):
    user_id: Optional[str] = None
    action: str
    status: str = "SUCCESS"
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    extra_metadata: Optional[Dict[str, Any]] = None

class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    status: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)
