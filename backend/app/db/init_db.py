from sqlalchemy.orm import Session
from app.models import Role, Permission
from app.core.database import Base, engine

INITIAL_PERMISSIONS = [
    ("asset:read", "Read asset details and inventory"),
    ("asset:write", "Create and modify asset metadata"),
    ("vulnerability:read", "View vulnerability reports"),
    ("alert:read", "View security alerts"),
    ("alert:investigate", "Investigate and triage alerts"),
    ("incident:read", "View incident timelines"),
    ("incident:manage", "Execute containment actions and manage incidents"),
    ("system:admin", "Full administrative control"),
]

INITIAL_ROLES = {
    "ADMIN": [
        "asset:read", "asset:write", "vulnerability:read",
        "alert:read", "alert:investigate", "incident:read",
        "incident:manage", "system:admin"
    ],
    "SECURITY_ANALYST": [
        "asset:read", "asset:write", "vulnerability:read",
        "alert:read", "alert:investigate", "incident:read",
        "incident:manage"
    ],
    "VIEWER": [
        "asset:read", "vulnerability:read", "alert:read", "incident:read"
    ]
}

def init_db(db: Session) -> None:
    Base.metadata.create_all(bind=engine)

    # 1. Create permissions
    permission_objs = {}
    for name, desc in INITIAL_PERMISSIONS:
        perm = db.query(Permission).filter(Permission.name == name).first()
        if not perm:
            perm = Permission(name=name, description=desc)
            db.add(perm)
            db.flush()
        permission_objs[name] = perm

    # 2. Create roles and bind permissions
    for role_name, perms in INITIAL_ROLES.items():
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            role = Role(name=role_name, description=f"{role_name.replace('_', ' ').title()} Role")
            db.add(role)
            db.flush()
        
        # Sync permissions
        current_perms = {p.name for p in role.permissions}
        for perm_name in perms:
            if perm_name not in current_perms:
                role.permissions.append(permission_objs[perm_name])
    
    db.commit()
