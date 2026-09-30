from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.audit_log import AuditLogOut
from app.schemas.response import StandardResponse
from app.services.audit_service import AuditService
from app.api.v1.deps import require_permission
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=StandardResponse[List[AuditLogOut]])
def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_permission("system:admin")),
    db: Session = Depends(get_db)
):
    audit_service = AuditService(db)
    logs = audit_service.get_logs(skip=skip, limit=limit)
    return StandardResponse(
        success=True,
        data=logs,
        message="Audit logs retrieved successfully."
    )
