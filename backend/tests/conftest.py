"""Test set-up: the API runs for real (Flask test client), the MySQL layer is replaced by a small in-memory fake, files go to temp folders.

    cd backend
    pip install pytest "moto[s3]"
    python -m pytest -q
"""
import os
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

# settings must be in place BEFORE config.py is imported
_tmp = Path(tempfile.mkdtemp(prefix="lokmangal_test_"))
os.environ.update({
    "APP_ENV": "development",
    "SECRET_KEY": "test-secret-key-test-secret-key-test-secret-key",
    "ADMIN_USERNAME": "admin",
    "STORAGE_BACKEND": "local",
    "FRONTEND_DIR": str(_tmp / "frontend"),
    "UPLOAD_TMP_DIR": str(_tmp / "tmp"),
    "SERVE_FRONTEND": "false",
    "CORS_ORIGINS": "https://www.example.org",
    "LOGIN_MAX_FAILURES": "3",
})
os.environ.pop("ADMIN_PASSWORD_HASH", None)
os.environ.pop("DB_SSL_CA", None)

import pytest  # noqa: E402
from werkzeug.security import generate_password_hash  # noqa: E402

import config  # noqa: E402

PASSWORD = "correct horse battery staple"
config.ADMIN_PASSWORD_HASH = generate_password_hash(PASSWORD, method="pbkdf2:sha256:1000")   # (fast for tests)

import database  # noqa: E402

database.ensure_latest_column = lambda: True          # no MySQL in the tests
database.ensure_order_column = lambda: True
database.ensure_slug_column = lambda: False          # (no MySQL: nothing to fill in)

import app as app_module  # noqa: E402
import auth  # noqa: E402
import storage  # noqa: E402


class FakeDB:
    """Just enough of database.py for the API: rows live in dicts."""

    def __init__(self):
        self.articles, self.weekly, self.videos, self.ads = {}, {}, {}, {}
        self.next_article, self.next_video, self.next_ad = 10000, 1, 1

    # ---- articles
    def get_articles(self, category=None, search=None, limit=None, placement=None):
        rows = sorted(self.articles.values(), key=lambda r: -r["id"])
        return [r for r in rows if not category or r["category"] == category][: limit or None]

    def get_article(self, article_id):
        return self.articles.get(article_id)

    def create_article(self, data):
        new_id, self.next_article = self.next_article, self.next_article + 1
        self.articles[new_id] = {"id": new_id, "author": "लोकमंगल प्रतिनिधी", "views": "1.2K", "is_latest": 1, **data}
        return new_id

    def update_article(self, article_id, data):
        if not data or article_id not in self.articles:
            return False
        self.articles[article_id].update(data)
        return True

    def toggle_placement(self, article_id, field, value=None):
        if field not in ("is_lead", "is_popular", "is_random", "is_latest") or article_id not in self.articles:
            return None
        self.articles[article_id][field] = 0 if self.articles[article_id].get(field) else 1
        return self.articles[article_id]

    def delete_article(self, article_id):
        return self.articles.pop(article_id, None) is not None

    def get_article_by_slug(self, slug):
        return next((r for r in self.articles.values() if r.get("slug") == slug), None)

    # ---- weekly
    def get_weekly_editions(self, limit=None):
        return sorted(self.weekly.values(), key=lambda r: -r["issue_no"])[: limit or None]

    def get_weekly_edition(self, issue_no):
        return self.weekly.get(issue_no)

    def create_weekly_edition(self, data):
        self.weekly[data["issue_no"]] = dict(data)
        return 1

    def delete_weekly_edition(self, issue_no):
        return self.weekly.pop(issue_no, None) is not None

    # ---- videos
    def get_videos(self, limit=None):
        return sorted(self.videos.values(), key=lambda r: r.get("sort_order", 0))[: limit or None]

    def get_video(self, video_id):
        return self.videos.get(video_id)

    def create_video(self, data):
        new_id, self.next_video = self.next_video, self.next_video + 1
        self.videos[new_id] = {"id": new_id, "title_en": "", "description": "", "description_en": "", "thumbnail": "",
                               "duration_sec": None, "size_bytes": None, "sort_order": new_id, **data}
        return new_id

    def update_video(self, video_id, data):
        if video_id not in self.videos or not data:
            return False
        self.videos[video_id].update(data)
        return True

    def delete_video(self, video_id):
        return self.videos.pop(video_id, None)

    def upload_in_use(self, url, except_video=None, except_ad=None):
        return (any(v["id"] != except_video and url in (v["video_url"], v["thumbnail"]) for v in self.videos.values())
                or any(a["id"] != except_ad and url in (a["media_url"], a["thumbnail"]) for a in self.ads.values()))

    # ---- ads
    def get_ads(self, limit=None):
        return sorted(self.ads.values(), key=lambda r: r.get("sort_order", 0))[: limit or None]

    def get_ad(self, ad_id):
        return self.ads.get(ad_id)

    def create_ad(self, data):
        new_id, self.next_ad = self.next_ad, self.next_ad + 1
        self.ads[new_id] = {"id": new_id, "title_en": "", "thumbnail": "", "link_url": "", "duration_sec": None, "size_bytes": None,
                            "sort_order": new_id, **data}
        return new_id

    def update_ad(self, ad_id, data):
        if ad_id not in self.ads or not data:
            return False
        self.ads[ad_id].update(data)
        return True

    def delete_ad(self, ad_id):
        return self.ads.pop(ad_id, None)


@pytest.fixture
def db(monkeypatch):
    fake = FakeDB()
    for name in ("get_articles", "get_article", "get_article_by_slug", "create_article", "update_article", "toggle_placement", "delete_article",
                 "get_weekly_editions", "get_weekly_edition", "create_weekly_edition", "delete_weekly_edition",
                 "get_videos", "get_video", "create_video", "update_video", "delete_video", "upload_in_use",
                 "get_ads", "get_ad", "create_ad", "update_ad", "delete_ad"):
        monkeypatch.setattr(database, name, getattr(fake, name))
    monkeypatch.setattr(database, "ping", lambda: True)
    monkeypatch.setattr(database, "has_english", lambda: True)
    monkeypatch.setattr(database, "publish_videos_file", lambda: False)
    monkeypatch.setattr(database, "publish_ads_file", lambda: False)
    monkeypatch.setattr(database, "get_stats", lambda: {"total_articles": len(fake.articles)})
    return fake


@pytest.fixture
def local_storage(monkeypatch):
    base = Path(tempfile.mkdtemp(prefix="lokmangal_files_"))
    monkeypatch.setattr(config, "STORAGE_BACKEND", "local")
    monkeypatch.setattr(config, "IMAGES_DIR", base / "images")
    monkeypatch.setattr(config, "PDF_DIR", base / "pdf")
    monkeypatch.setattr(config, "VIDEO_DIR", base / "videos")
    storage.reset()
    yield base
    storage.reset()


@pytest.fixture
def client(db, local_storage):
    auth._failures.clear()
    return app_module.app.test_client()


@pytest.fixture
def token(client):
    reply = client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD})
    assert reply.status_code == 200, reply.get_json()
    return reply.get_json()["token"]


@pytest.fixture
def admin(token):
    return {"Authorization": f"Bearer {token}"}


# a few real file headers
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 64
PDF = b"%PDF-1.4\n" + b"0" * 64 + b"\n%%EOF\n"
MP4 = b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 64
