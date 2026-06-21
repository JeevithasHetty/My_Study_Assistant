from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.router import api_router
from app.core.database import create_tables
from app.core.config import settings

app = FastAPI(
    title="StudentOS AI API",
    description="AI-powered Academic & Career Success Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ==================================================
# DEBUG MIDDLEWARE
# ==================================================

@app.middleware("http")
async def debug_middleware(request, call_next):
    print("================================")
    print("METHOD:", request.method)
    print("PATH:", request.url.path)
    print("ORIGIN:", request.headers.get("origin"))
    print(
        "HEADERS:",
        request.headers.get("access-control-request-headers")
    )
    print("================================")

    response = await call_next(request)
    return response

# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporary for debugging
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================================
# API ROUTES
# ==================================================

app.include_router(api_router)

# ==================================================
# STATIC FILES
# ==================================================

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RESUME_UPLOAD_DIR, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="uploads",
)

app.mount(
    "/resume-uploads",
    StaticFiles(directory=settings.RESUME_UPLOAD_DIR),
    name="resume-uploads",
)

# ==================================================
# STARTUP
# ==================================================

@app.on_event("startup")
def startup_event():
    create_tables()
    print("✅ StudentOS AI backend started — PostgreSQL connected")

# ==================================================
# ROOT
# ==================================================

@app.get("/")
def root():
    return {
        "name": "StudentOS AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.get("/test")
def test():
    return {
        "message": "new deployment working"
    }