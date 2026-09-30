from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserOut
from app.schemas.response import StandardResponse
from app.repositories.user_repository import UserRepository
from app.api.v1.deps import require_permission, get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=StandardResponse[List[UserOut]])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_permission("system:admin")),
    db: Session = Depends(get_db)
):
    repo = UserRepository(db)
    users = repo.list_all(skip=skip, limit=limit)
    users_out = [UserOut.model_validate(u) for u in users]
    return StandardResponse(
        success=True,
        data=users_out,
        message="Users list retrieved successfully."
    )
