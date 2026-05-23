from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token

from app.services.placement_ai_service import (
    generate_readiness_report
)

router = APIRouter(
    prefix="/placement",
    tags=["Placement"]
)


@router.get("/readiness")
def placement_readiness(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    return generate_readiness_report(
        email,
        db
    )