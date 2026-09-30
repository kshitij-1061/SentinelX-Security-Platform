from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.services.audit_service import AuditService
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.user import UserCreate, UserLogin, UserOut, Token

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.audit_service = AuditService(db)

    def register_user(self, user_in: UserCreate, client_ip: Optional[str] = None, user_agent: Optional[str] = None) -> UserOut:
        existing = self.user_repo.get_by_email(user_in.email)
        if existing:
            self.audit_service.log_event(
                action="USER_REGISTER_FAILED",
                status="FAILURE",
                ip_address=client_ip,
                user_agent=user_agent,
                extra_metadata={"email": user_in.email, "reason": "Email already registered"}
            )
            raise ValueError("User with this email already exists.")

        role_name = user_in.role_name or "SECURITY_ANALYST"
        role = self.user_repo.get_role_by_name(role_name)
        if not role:
            raise ValueError(f"Role '{role_name}' does not exist.")

        hashed_password = get_password_hash(user_in.password)
        user = self.user_repo.create(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            role_id=role.id
        )

        self.audit_service.log_event(
            action="USER_REGISTER",
            status="SUCCESS",
            user_id=user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            extra_metadata={"email": user.email, "role": role.name}
        )

        return UserOut.model_validate(user)

    def authenticate_user(self, credentials: UserLogin, client_ip: Optional[str] = None, user_agent: Optional[str] = None) -> Token:
        user = self.user_repo.get_by_email(credentials.email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            self.audit_service.log_event(
                action="FAILED_LOGIN",
                status="FAILURE",
                user_id=user.id if user else None,
                ip_address=client_ip,
                user_agent=user_agent,
                extra_metadata={"email": credentials.email}
            )
            raise ValueError("Invalid email or password.")

        if not user.is_active:
            raise ValueError("User account is disabled.")

        access_token = create_access_token(subject=user.id, role=user.role.name)

        self.audit_service.log_event(
            action="USER_LOGIN",
            status="SUCCESS",
            user_id=user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            extra_metadata={"email": user.email}
        )

        user_out = UserOut.model_validate(user)
        return Token(access_token=access_token, token_type="bearer", user=user_out)

    def logout_user(self, user_id: str, client_ip: Optional[str] = None, user_agent: Optional[str] = None):
        self.audit_service.log_event(
            action="USER_LOGOUT",
            status="SUCCESS",
            user_id=user_id,
            ip_address=client_ip,
            user_agent=user_agent
        )
