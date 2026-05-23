from pydantic_settings import BaseSettings, SettingsConfigDict
import logging


logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    # API Keys
    GROQ_API_KEY: str
    YOUTUBE_API_KEY: str

    # AI/ML Configuration
    EMBEDDER_MODEL: str = "all-MiniLM-L6-v2"
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    CHUNK_SIZE: int = 500
    FAISS_SEARCH_RESULTS: int = 10
    AI_TEMPERATURE: float = 0.2
    MAX_AI_TOKENS_RESUME: int = 1500
    MAX_AI_TOKENS_PLACEMENT: int = 800
    MAX_AI_TOKENS_PLANNER_DAILY: int = 1200
    MAX_AI_TOKENS_PLANNER_WEEKLY: int = 1500
    MAX_AI_TOKENS_RESOURCES: int = 500

    # File Upload Configuration
    UPLOAD_DIR: str = "uploads"
    RESUME_UPLOAD_DIR: str = "resume_uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_DOCUMENT_EXTENSIONS: list = [".pdf", ".docx", ".pptx"]
    ALLOWED_RESUME_EXTENSIONS: list = [".pdf", ".docx"]

    # Logging
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
