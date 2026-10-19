"""Settings for the backend. Values come from environment variables or from backend/.env (see .env.example)."""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent      # .../backend
PROJECT_DIR = BASE_DIR.parent                   # project root (holds backend/ and frontend/)

load_dotenv(BASE_DIR / ".env")


def _text(name, default=""):
    value = os.getenv(name)
    return default if value is None or value.strip() == "" else value.strip()


def _int(name, default):
    try:
        return int(_text(name, str(default)))
    except ValueError:
        return default


def _flag(name, default):
    value = os.getenv(name)
    if value is None or value.strip() == "":
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


def _path(name, default):
    value = os.getenv(name)
    path = Path(value.strip()).expanduser() if value and value.strip() else Path(default)
    if not path.is_absolute():
        path = BASE_DIR / path
    return path.resolve()


# ---- MySQL ----
DB_HOST = _text("DB_HOST", "localhost")
DB_PORT = _int("DB_PORT", 3306)
DB_USER = _text("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")      # may legitimately be empty
DB_NAME = _text("DB_NAME", "lokmangal_news_portal")

# ---- Web server ----
HOST = _text("HOST", "0.0.0.0")
PORT = _int("PORT", 5000)
SERVE_FRONTEND = _flag("SERVE_FRONTEND", True)
CORS_ORIGINS = [o.strip() for o in _text("CORS_ORIGINS", "*").split(",") if o.strip()]
MAX_UPLOAD_MB = _int("MAX_UPLOAD_MB", 50)       # images and weekly PDFs
MAX_VIDEO_MB = _int("MAX_VIDEO_MB", 200)        # videos (Admin Panel > Videos)

# ---- Files ----
FRONTEND_DIR = _path("FRONTEND_DIR", PROJECT_DIR / "frontend")
IMAGES_DIR = _path("IMAGES_DIR", FRONTEND_DIR / "assets" / "images")
PDF_DIR = _path("PDF_DIR", FRONTEND_DIR / "assets" / "pdf")
VIDEO_DIR = _path("VIDEO_DIR", FRONTEND_DIR / "assets" / "videos")
SEED_DIR = BASE_DIR / "seed"
SCHEMA_FILE = BASE_DIR / "schema.sql"
LEGACY_SQLITE = BASE_DIR / "legacy" / "portal.db"
