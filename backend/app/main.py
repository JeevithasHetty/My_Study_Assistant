from fastapi import FastAPI
from app.core.database import Base, engine

# ROUTES
from app.api.routes import (
    auth,
    users,
    tasks,
    exams,
    dashboard,
    study_sessions,
    documents,
    planner,
    resume as resume_routes,
    resources,
    placement,
    analytics
)

# MODELS
from app.models import (
    user,
    task,
    exam,
    study_session,
    uploaded_document,
    document_chunk,
    study_plan,
    resume,
    resume_chunk
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
app.include_router(planner.router)
app.include_router(resume_routes.router)
app.include_router(resources.router)
app.include_router(placement.router)
app.include_router(
    analytics.router
)


@app.get("/")
def root():
    return {
        "message": "StudentOS AI backend running"
    }