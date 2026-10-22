"""Settings for the backend. Values come from environment variables or from backend/.env (see .env.example)."""
import os
import secrets
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


# ---- Environment ----
# "production" turns on the strict start-up checks below (see problems()). Everything else is a development machine.
APP_ENV = _text("APP_ENV", "development").lower()
IS_PRODUCTION = APP_ENV == "production"

# ---- MySQL (local MySQL, or Amazon RDS) ----
DB_HOST = _text("DB_HOST", "localhost")
DB_PORT = _int("DB_PORT", 3306)
DB_USER = _text("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")      # may legitimately be empty
DB_NAME = _text("DB_NAME", "lokmangal_news_portal")
# RDS: encrypt the connection. DB_SSL_CA = path of the RDS CA bundle (https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem);
# with a CA file the server certificate is verified too.
DB_SSL_CA = _text("DB_SSL_CA")
DB_SSL = _flag("DB_SSL", bool(DB_SSL_CA))
# Idle connections kept ready per worker process (a shared RDS has a limited number of connections: keep it small there)
DB_POOL_SIZE = max(1, _int("DB_POOL_SIZE", 5))

# ---- Web server ----
HOST = _text("HOST", "0.0.0.0")
PORT = _int("PORT", 5000)
SERVE_FRONTEND = _flag("SERVE_FRONTEND", not IS_PRODUCTION)
CORS_ORIGINS = [o.strip().rstrip("/") for o in _text("CORS_ORIGINS", "*").split(",") if o.strip()]
# The public website's address: the sitemap, the RSS feed and the link-preview pages (seo.py) point to it. Production: the live website
# unless SITE_URL says otherwise. A development PC leaves it empty: those pages then point to the address they were asked on.
SITE_URL = _text("SITE_URL", "" if not IS_PRODUCTION else "https://www.lokmangal.info").rstrip("/")
MAX_UPLOAD_MB = _int("MAX_UPLOAD_MB", 50)       # images and weekly PDFs
MAX_VIDEO_MB = _int("MAX_VIDEO_MB", 200)        # videos (Admin Panel > Videos)
# How many reverse proxies (nginx, a load balancer) stand in front of the app: their X-Forwarded-* headers are then trusted.
TRUSTED_PROXIES = _int("TRUSTED_PROXIES", 0)

# ---- Admin login ----
# SECRET_KEY signs the login tokens. ADMIN_PASSWORD_HASH comes from `python manage.py set-admin-password`.
# (Without a SECRET_KEY a random one is made at every start: fine for a development PC, but every login ends when the server restarts.)
_secret = os.getenv("SECRET_KEY", "").strip()
SECRET_KEY_GIVEN = bool(_secret)
SECRET_KEY = _secret or secrets.token_urlsafe(48)
ADMIN_USERNAME = _text("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = _text("ADMIN_PASSWORD_HASH")
TOKEN_TTL_HOURS = max(1, _int("TOKEN_TTL_HOURS", 12))
LOGIN_MAX_FAILURES = max(1, _int("LOGIN_MAX_FAILURES", 5))      # wrong passwords from one address ...
LOGIN_LOCK_MINUTES = max(1, _int("LOGIN_LOCK_MINUTES", 15))     # ... block that address for this long

# ---- Files: local disk (development) or Amazon S3 (production) ----
STORAGE_BACKEND = _text("STORAGE_BACKEND", "local").lower()      # local | s3
FRONTEND_DIR = _path("FRONTEND_DIR", PROJECT_DIR / "frontend")
IMAGES_DIR = _path("IMAGES_DIR", FRONTEND_DIR / "assets" / "images")
PDF_DIR = _path("PDF_DIR", FRONTEND_DIR / "assets" / "pdf")
VIDEO_DIR = _path("VIDEO_DIR", FRONTEND_DIR / "assets" / "videos")
S3_BUCKET = _text("S3_BUCKET")
S3_REGION = _text("S3_REGION", _text("AWS_REGION", _text("AWS_DEFAULT_REGION", "ap-south-1")))
S3_PREFIX = _text("S3_PREFIX").strip("/")                          # optional folder inside the bucket
# The public address the browser uses for the uploaded files: the CloudFront domain in front of the bucket (https://dxxxx.cloudfront.net
# or https://media.lokmangal.in). Files are never read from S3 directly.
MEDIA_BASE_URL = _text("MEDIA_BASE_URL").rstrip("/")
# Uploads are written here first, checked, and only then stored. Point it at a disk folder (not a RAM disk) for big videos.
UPLOAD_TMP_DIR = _path("UPLOAD_TMP_DIR", BASE_DIR / "tmp_uploads")
# The backend keeps frontend/js/videos-data.js equal to the videos table (a static host shows the videos from it). Only useful on a PC
# where the frontend folder is the live site; on a server it would just dirty the git checkout.
PUBLISH_VIDEOS_FILE = _flag("PUBLISH_VIDEOS_FILE", SERVE_FRONTEND)

SEED_DIR = BASE_DIR / "seed"
SCHEMA_FILE = BASE_DIR / "schema.sql"
LEGACY_SQLITE = BASE_DIR / "legacy" / "portal.db"


def uses_s3():
    return STORAGE_BACKEND == "s3"


def problems():
    """What is wrong with the settings for the chosen environment (a list of short sentences, empty = fine).
    app.py refuses to start in production while this list is not empty: a half-secured server must not go live by accident."""
    found = []
    if STORAGE_BACKEND not in ("local", "s3"):
        found.append(f"STORAGE_BACKEND must be 'local' or 's3' (it is '{STORAGE_BACKEND}').")
    if uses_s3():
        if not S3_BUCKET:
            found.append("STORAGE_BACKEND=s3 needs S3_BUCKET.")
        if not MEDIA_BASE_URL.startswith("https://"):
            found.append("STORAGE_BACKEND=s3 needs MEDIA_BASE_URL (the https:// address of the CloudFront distribution).")
    if not IS_PRODUCTION:
        return found
    if len(os.getenv("SECRET_KEY", "").strip()) < 32:
        found.append("SECRET_KEY is missing or shorter than 32 characters (make one: python manage.py gen-secret).")
    if not ADMIN_PASSWORD_HASH:
        found.append("ADMIN_PASSWORD_HASH is missing (run: python manage.py set-admin-password).")
    if "*" in CORS_ORIGINS or not CORS_ORIGINS:
        found.append("CORS_ORIGINS must list the website address(es), e.g. https://www.lokmangal.in - not '*'.")
    elif any(not o.startswith("https://") for o in CORS_ORIGINS):
        found.append("CORS_ORIGINS must use https:// addresses in production.")
    if DB_PASSWORD in ("", "change-me") or DB_USER == "root":
        found.append("Use a dedicated MySQL user with a real password (DB_USER / DB_PASSWORD), not root / an empty password.")
    if DB_HOST not in ("localhost", "127.0.0.1") and not DB_SSL:
        found.append("The database is on another machine: set DB_SSL_CA (RDS CA bundle) so the connection is encrypted.")
    if SERVE_FRONTEND:
        found.append("SERVE_FRONTEND should be false in production (the website is hosted on Amplify; this server is the API only).")
    return found
