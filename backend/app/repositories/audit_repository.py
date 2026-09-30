from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogCreate

class AuditRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, log_in: AuditLogCreate) -> AuditLog:
        audit_log = AuditLog(
            user_id=log_in.user_id,
            action=log_in.action,
            status=log_in.status,
            ip_address=log_in.ip_address,
            user_agent=log_in.user_agent,
            extra_metadata=log_in.extra_metadata
        )
        self.db.add(audit_log)
        self.db.commit()
        self.db.refresh(audit_log)
        return audit_log

    def list_all(self, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        return self.db.query(AuditLog).order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
