"""Test set-up: the API runs for real (Flask test client), the MySQL layer is replaced by a small in-memory fake, files go to temp folders.

    cd backend
    pip install pytest "moto[s3]"
    python -m pytest -q
"""
import os
import sys
import tempfile
import time
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
    # no real MySQL in the tests, on a PC that runs one too (as in CI): a call that slips past the fakes fails at once instead of
    # reading or changing the developer's own database
    "DB_HOST": "127.0.0.1",
    "DB_PORT": "1",
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
database.ensure_clicks_column = lambda: True
database.ensure_review_column = lambda: True
database.renumber_all_by_date = lambda: None
database.ensure_placement_order_columns = lambda: True
database.number_placements = lambda: None
database.ensure_comment_tables = lambda: True

import app as app_module  # noqa: E402
import auth  # noqa: E402
import storage  # noqa: E402


class FakeDB:
    """Just enough of database.py for the API: rows live in dicts."""

    def __init__(self):
        self.articles, self.weekly, self.videos, self.ads = {}, {}, {}, {}
        self.next_article, self.next_video, self.next_ad = 10000, 1, 1
        self.comments, self.next_comment, self.comment_tables = {}, 1, True
        self.commenters, self.codes, self.login_rows = {}, {}, {}

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
        if field not in ("is_lead", "is_popular", "is_random", "is_latest", "is_review") or article_id not in self.articles:
            return None
        self.articles[article_id][field] = 0 if self.articles[article_id].get(field) else 1
        return self.articles[article_id]

    def delete_article(self, article_id):
        return self.articles.pop(article_id, None) is not None

    def get_article_by_slug(self, slug):
        return next((r for r in self.articles.values() if r.get("slug") == slug), None)

    def count_click(self, article_id):
        if article_id not in self.articles:
            return False
        self.articles[article_id]["clicks"] = self.articles[article_id].get("clicks", 0) + 1
        return True

    # ---- the admin login lock (the same rules as database.py)
    def login_locked_for(self, address):
        row = self.login_rows.get(address)
        return int(row["locked_until"] - time.time()) + 1 if row and row["locked_until"] and row["locked_until"] > time.time() else 0

    def login_failed(self, address):
        now, row = time.time(), self.login_rows.get(address)
        if row and row["locked_until"] and row["locked_until"] > now:
            return
        fresh = row is None or row["failures"] >= config.LOGIN_MAX_FAILURES or now - row["first_at"] >= config.LOGIN_LOCK_MINUTES * 60
        failures = 1 if fresh else row["failures"] + 1
        self.login_rows[address] = {"failures": failures, "first_at": now if fresh else row["first_at"],
                                    "locked_until": now + config.LOGIN_LOCK_MINUTES * 60 if failures >= config.LOGIN_MAX_FAILURES else None}

    def login_succeeded(self, address):
        self.login_rows.pop(address, None)

    # ---- comments (the same rules as database.py, kept simple: rows are dicts)
    def has_comments(self):
        return self.comment_tables

    def _comment_item_exists(self, item_type, item_id):
        return (item_id in self.articles) if item_type == "article" else (item_id in self.weekly)

    def get_comments(self, item_type, item_id, visitor=None):
        mine = [c for c in self.comments.values() if c["item_type"] == item_type and c["item_id"] == item_id]
        view = lambda c: {k: c[k] for k in ("id", "parent_id", "name", "body", "likes", "dislikes", "created_at")} | {"my_vote": c["votes"].get(visitor, 0)}
        tops = sorted((c for c in mine if c["parent_id"] is None), key=lambda c: -c["id"])
        return {"total": len(mine), "comments": [view(c) | {"replies": [view(r) for r in sorted(mine, key=lambda r: r["id"]) if r["parent_id"] == c["id"]]}
                                                  for c in tops]}

    def sign_in_commenter(self, email, name, provider, mobile=None):
        known = self.commenters.get(email)
        if known is None:
            known = self.commenters[email] = {"id": len(self.commenters) + 1, "email": email, "name": name, "provider": provider, "mobile": mobile}
        elif provider == "guest" and known["provider"] != "guest":
            return None
        elif provider != "guest" and known["provider"] == "guest":
            known.update(name=name, provider=provider)
        elif provider == "guest":
            known["name"] = name
        if provider == "guest" and mobile:
            known["mobile"] = mobile
        return dict(known)

    def get_commenter(self, commenter_id):
        return next((dict(c) for c in self.commenters.values() if c["id"] == commenter_id), None)

    def save_email_code(self, email, code_hash):
        row = self.codes.get(email)
        if row and row["wait"]:
            return "wait"
        if row and row["sends"] >= 5:
            return "limit"
        self.codes[email] = {"hash": code_hash, "tries": 0, "sends": (row["sends"] if row else 0) + 1, "wait": False, "used": False}
        return "ok"

    def check_email_code(self, email, code_hash):
        row = self.codes.get(email)
        if not row or row["used"] or row["tries"] >= 5:
            return "expired"
        if row["hash"] == code_hash:
            row["used"] = True
            return "ok"
        row["tries"] += 1
        return "wrong"

    def add_comment(self, item_type, item_id, parent_id, commenter_id, name, body):
        if not self._comment_item_exists(item_type, item_id):
            return None, "item"
        if parent_id is not None:
            parent = self.comments.get(parent_id)
            if not parent or (parent["item_type"], parent["item_id"]) != (item_type, item_id):
                return None, "parent"
            parent_id = parent["parent_id"] or parent["id"]
        new_id, self.next_comment = self.next_comment, self.next_comment + 1
        row = {"id": new_id, "item_type": item_type, "item_id": item_id, "parent_id": parent_id, "commenter_id": commenter_id, "name": name, "body": body, "likes": 0, "dislikes": 0,
               "reports": 0, "created_at": "2026-10-24T10:48:21Z", "votes": {}, "reporters": set()}
        self.comments[new_id] = row
        out = {k: row[k] for k in ("id", "parent_id", "name", "body", "likes", "dislikes", "created_at")} | {"my_vote": 0}
        return (out | {"replies": []}) if parent_id is None else out, None

    def vote_comment(self, comment_id, visitor, vote=None):
        row = self.comments.get(comment_id)
        if row is None:
            return None
        if vote is not None:
            if vote == 0:
                row["votes"].pop(visitor, None)
            else:
                row["votes"][visitor] = vote
            row["likes"] = sum(1 for v in row["votes"].values() if v == 1)
            row["dislikes"] = sum(1 for v in row["votes"].values() if v == -1)
        return {"likes": row["likes"], "dislikes": row["dislikes"], "my_vote": row["votes"].get(visitor, 0)}

    def report_comment(self, comment_id, visitor):
        row = self.comments.get(comment_id)
        if row is None:
            return False
        if visitor not in row["reporters"]:
            row["reporters"].add(visitor)
            row["reports"] += 1
        return True

    def admin_comments(self, only_reported=False, limit=50, offset=0):
        rows = [c for c in self.comments.values() if c["reports"] > 0 or not only_reported]
        rows.sort(key=(lambda c: (-c["reports"], -c["id"])) if only_reported else (lambda c: -c["id"]))
        out = []
        for c in rows[offset: offset + limit]:
            item = self.articles.get(c["item_id"]) if c["item_type"] == "article" else self.weekly.get(c["item_id"])
            out.append({"id": c["id"], "parent_id": c["parent_id"], "name": c["name"], "body": c["body"], "likes": c["likes"], "dislikes": c["dislikes"],
                        "created_at": c["created_at"], "item_type": c["item_type"], "item_id": c["item_id"], "item_title": (item or {}).get("title", ""),
                        "item_category": (item or {}).get("category") if c["item_type"] == "article" else None, "item_slug": (item or {}).get("slug"),
                        "reports": c["reports"], "replies_count": sum(1 for r in self.comments.values() if r["parent_id"] == c["id"]),
                        "email": (self.get_commenter(c["commenter_id"]) or {}).get("email", ""), "provider": (self.get_commenter(c["commenter_id"]) or {}).get("provider", ""),
                        "mobile": (self.get_commenter(c["commenter_id"]) or {}).get("mobile") or ""})
        return {"total": len(self.comments), "reported_total": sum(1 for c in self.comments.values() if c["reports"] > 0), "comments": out}

    def delete_comment(self, comment_id):
        if comment_id not in self.comments:
            return False
        for gone in [comment_id] + [c["id"] for c in self.comments.values() if c["parent_id"] == comment_id]:
            self.comments.pop(gone, None)
        return True

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
    for name in ("get_articles", "get_article", "get_article_by_slug", "create_article", "update_article", "toggle_placement", "delete_article", "count_click",
                 "get_weekly_editions", "get_weekly_edition", "create_weekly_edition", "delete_weekly_edition",
                 "get_videos", "get_video", "create_video", "update_video", "delete_video", "upload_in_use",
                 "get_ads", "get_ad", "create_ad", "update_ad", "delete_ad",
                 "login_locked_for", "login_failed", "login_succeeded", "has_comments", "sign_in_commenter", "get_commenter", "save_email_code", "check_email_code", "get_comments", "add_comment", "vote_comment", "report_comment", "admin_comments", "delete_comment"):
        monkeypatch.setattr(database, name, getattr(fake, name))
    monkeypatch.setattr(database, "ping", lambda: True)
    monkeypatch.setattr(database, "has_english", lambda: True)
    monkeypatch.setattr(database, "publish_videos_file", lambda: False)
    monkeypatch.setattr(database, "publish_ads_file", lambda: False)
    monkeypatch.setattr(database, "get_stats", lambda: {"total_articles": len(fake.articles)})
    monkeypatch.setattr(database, "settle_if_unplaced", lambda article_id, before: False)     # (it reads the real table)
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
