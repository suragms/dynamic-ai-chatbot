import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of backend
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# Load .env file from project root or backend folder
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BASE_DIR / ".env")

class Config:
    PROJECT_ROOT = PROJECT_ROOT
    BASE_DIR = BASE_DIR
    # Security & Key management
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_in_production")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
    MAX_MESSAGE_LENGTH = int(os.getenv("MAX_MESSAGE_LENGTH", 4000))

    # Server Settings
    PORT = int(os.getenv("PORT", 5000))
    HOST = os.getenv("HOST", "0.0.0.0")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")

    # Database Settings
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'chatbot.db'}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # NLP & ML Thresholds
    INTENT_CONFIDENCE_THRESHOLD = float(os.getenv("INTENT_CONFIDENCE_THRESHOLD", 0.60))
    MAX_CONTEXT_MESSAGES = int(os.getenv("MAX_CONTEXT_MESSAGES", 20))

    # Model Artifact Paths
    MODEL_DIR = PROJECT_ROOT / "models"
    MODEL_PATH = MODEL_DIR / "intent_model.pkl"
    METRICS_PATH = MODEL_DIR / "intent_model_metrics.json"

    # Ensure directories exist
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

config = Config()
