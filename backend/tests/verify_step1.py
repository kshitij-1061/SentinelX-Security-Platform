import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, Base, engine
from app.db.init_db import init_db
from app.models import Role, Permission

def verify():
    print("[+] Initializing database engine and tables...")
    db = SessionLocal()
    init_db(db)
    
    roles = db.query(Role).all()
    permissions = db.query(Permission).all()

    print(f"[OK] Created {len(roles)} default roles:")
    for role in roles:
        perm_names = [p.name for p in role.permissions]
        print(f"  - {role.name}: {perm_names}")

    print(f"[OK] Created {len(permissions)} default permissions.")
    db.close()
    print("[OK] Step 1 & DB Verification Successful!")

if __name__ == "__main__":
    verify()
