from typing import Optional
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import APIException
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.schemas.response import StandardResponse
from app.services.auth_service import AuthService
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=StandardResponse[UserOut], status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    auth_service = AuthService(db)
    try:
        user_out = auth_service.register_user(user_in, client_ip=client_ip, user_agent=user_agent)
        return StandardResponse(
            success=True,
            data=user_out,
            message="User registered successfully."
        )
    except ValueError as e:
        raise APIException(code="REGISTRATION_FAILED", message=str(e), status_code=status.HTTP_400_BAD_REQUEST)

@router.post("/login", response_model=StandardResponse[Token])
def login(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    auth_service = AuthService(db)
    try:
        token = auth_service.authenticate_user(credentials, client_ip=client_ip, user_agent=user_agent)
        return StandardResponse(
            success=True,
            data=token,
            message="Authentication successful."
        )
    except ValueError as e:
        raise APIException(code="INVALID_CREDENTIALS", message=str(e), status_code=status.HTTP_401_UNAUTHORIZED)

@router.post("/logout", response_model=StandardResponse[dict])
def logout(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    auth_service = AuthService(db)
    auth_service.logout_user(current_user.id, client_ip=client_ip, user_agent=user_agent)
    
    return StandardResponse(
        success=True,
        data={"user_id": current_user.id},
        message="Logout successful."
    )

@router.get("/me", response_model=StandardResponse[UserOut])
def get_me(current_user: User = Depends(get_current_user)):
    return StandardResponse(
        success=True,
        data=UserOut.model_validate(current_user),
        message="Current user profile retrieved."
    )
