from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.repositories.audit_repository import AuditRepository
from app.schemas.audit_log import AuditLogCreate, AuditLogOut

class AuditService:
    def __init__(self, db: Session):
        self.repo = AuditRepository(db)

    def log_event(
        self,
        action: str,
        status: str = "SUCCESS",
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        extra_metadata: Optional[Dict[str, Any]] = None
    ):
        payload = AuditLogCreate(
            user_id=user_id,
            action=action,
            status=status,
            ip_address=ip_address,
            user_agent=user_agent,
            extra_metadata=extra_metadata
        )
        return self.repo.create(payload)

    def get_logs(self, skip: int = 0, limit: int = 100) -> List[AuditLogOut]:
        logs = self.repo.list_all(skip=skip, limit=limit)
        return [AuditLogOut.model_validate(log) for log in logs]
