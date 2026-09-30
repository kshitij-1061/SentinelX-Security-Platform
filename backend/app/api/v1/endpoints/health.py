from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.schemas.response import StandardResponse

router = APIRouter()

@router.get("/health", response_model=StandardResponse[dict])
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return StandardResponse(
        success=True,
        data={
            "status": "online",
            "database": db_status,
            "service": "Enterprise Cyber Defense & Attack Path Intelligence Platform Backend",
            "version": "1.0.0"
        },
        message="System health check successful"
    )
