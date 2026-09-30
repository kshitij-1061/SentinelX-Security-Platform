from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_role_by_name(self, role_name: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.name == role_name).first()

    def create(self, email: str, hashed_password: str, full_name: str, role_id: str) -> User:
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            role_id=role_id
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def list_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.db.query(User).offset(skip).limit(limit).all()
