from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token

from app.services.analytics_service import (
    generate_dashboard
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/dashboard")
def analytics_dashboard(
    email: str = Depends(
        verify_token
    ),
    db: Session = Depends(
        get_db
    )
):
    return generate_dashboard(
        email,
        db
    )