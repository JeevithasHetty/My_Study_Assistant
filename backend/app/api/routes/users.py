from fastapi import APIRouter, Depends
from app.core.security import verify_token

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_current_user(
    email: str = Depends(verify_token)
):
    return {
        "message": "JWT authentication working",
        "email": email
    }