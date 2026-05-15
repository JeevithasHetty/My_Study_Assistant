from fastapi import FastAPI
from app.core.database import Base, engine
from app.api.routes import auth, users
from app.models import user
from app.api.routes import (
    auth,
    users,
    tasks,
    exams,
    dashboard,
      study_sessions,
      documents

)
from app.models import (
    user,
    task,
    exam,
    study_session,
    uploaded_document
)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudentOS AI API",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(exams.router)
app.include_router(dashboard.router)
app.include_router(study_sessions.router)
app.include_router(documents.router)

@app.get("/")
def root():
    return {
        "message": "StudentOS AI backend running"
    }