from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token
from app.services.dashboard_service import get_dashboard_overview
from app.schemas.dashboard import DashboardOverviewResponse

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/overview",
    response_model=DashboardOverviewResponse
)
def dashboard_overview(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    data = get_dashboard_overview(email, db)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return data