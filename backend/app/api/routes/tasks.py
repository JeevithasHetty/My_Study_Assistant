from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    new_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        estimated_hours=task.estimated_hours,
        due_date=task.due_date,
        user_id=user.id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@router.get("/", response_model=list[TaskResponse])
def get_tasks(
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == email
    ).first()

    return db.query(Task).filter(
        Task.user_id == user.id
    ).all()


@router.patch("/{task_id}/complete")
def complete_task(
    task_id: int,
    email: str = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == email
    ).first()

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.completed = True

    db.commit()

    return {
        "message": "Task marked completed"
    }