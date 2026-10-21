"""Nothing that writes works without the admin login; reading the website's data stays public."""
import pytest

from conftest import PASSWORD

WRITES = [
    ("post", "/api/articles", {"title": "x"}),
    ("put", "/api/articles/10000", {"title": "x"}),
    ("post", "/api/articles/10000", {"title": "x"}),
    ("post", "/api/articles/10000/toggle-placement", {"field": "is_lead"}),
    ("delete", "/api/articles/10000", None),
    ("post", "/api/weekly", {"issue_no": 1, "title": "x"}),
    ("delete", "/api/weekly/1", None),
    ("post", "/api/videos", {"title": "x", "video_url": "https://example.org/a.mp4"}),
    ("put", "/api/videos/1", {"title": "x"}),
    ("delete", "/api/videos/1", None),
    ("post", "/api/ads", {"media_type": "image", "title": "x", "media_url": "assets/images/a.jpg"}),
    ("put", "/api/ads/1", {"title": "x"}),
    ("delete", "/api/ads/1", None),
    ("delete", "/api/upload/ad", {"url": "assets/images/ad-image_1.jpg"}),
    ("post", "/api/upload/image", None),
    ("post", "/api/upload/pdf", None),
    ("post", "/api/upload/video", None),
    ("delete", "/api/upload/video", {"url": "assets/videos/a.mp4"}),
]


@pytest.mark.parametrize("method,path,payload", WRITES)
def test_writes_need_login(client, method, path, payload):
    reply = getattr(client, method)(path, json=payload) if payload is not None else getattr(client, method)(path)
    assert reply.status_code == 401
    assert reply.get_json()["login_required"] is True


@pytest.mark.parametrize("path", ["/api/stats", "/api/media", "/api/auth/me"])
def test_admin_reads_need_login(client, path):
    assert client.get(path).status_code == 401


@pytest.mark.parametrize("path", ["/api/articles", "/api/weekly", "/api/videos", "/api/ads", "/api/health", "/api/live"])
def test_public_reads_stay_public(client, path):
    assert client.get(path).status_code == 200


def test_forged_and_garbage_tokens_are_refused(client):
    for header in ("Bearer nonsense", "Bearer ", "Basic abc", "Bearer a.b.c"):
        assert client.get("/api/stats", headers={"Authorization": header}).status_code == 401


def test_login_and_use_the_token(client):
    reply = client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD})
    assert reply.status_code == 200
    data = reply.get_json()
    assert data["success"] and data["expires_in"] > 0
    headers = {"Authorization": "Bearer " + data["token"]}
    assert client.get("/api/auth/me", headers=headers).get_json()["username"] == "admin"
    assert client.get("/api/stats", headers=headers).status_code == 200


def test_wrong_password_and_wrong_user(client):
    assert client.post("/api/auth/login", json={"username": "admin", "password": "nope"}).status_code == 401
    assert client.post("/api/auth/login", json={"username": "root", "password": PASSWORD}).status_code == 401
    assert client.post("/api/auth/login", json={}).status_code == 401


def test_too_many_wrong_passwords_lock_the_address(client):
    for _ in range(3):                                               # LOGIN_MAX_FAILURES=3 in conftest
        assert client.post("/api/auth/login", json={"username": "admin", "password": "bad"}).status_code == 401
    locked = client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD})
    assert locked.status_code == 429                                 # even the right password waits now
    assert int(locked.headers["Retry-After"]) > 0


def test_token_dies_when_the_password_changes(client, token, monkeypatch):
    import config
    from werkzeug.security import generate_password_hash
    assert client.get("/api/stats", headers={"Authorization": f"Bearer {token}"}).status_code == 200
    monkeypatch.setattr(config, "ADMIN_PASSWORD_HASH", generate_password_hash("another long password", method="pbkdf2:sha256:1000"))
    assert client.get("/api/stats", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_expired_token_is_refused(client, token, monkeypatch):
    import config
    monkeypatch.setattr(config, "TOKEN_TTL_HOURS", 0)                # nothing counts as fresh any more
    import time
    time.sleep(1.1)
    assert client.get("/api/stats", headers={"Authorization": f"Bearer {token}"}).status_code == 401


def test_login_is_refused_while_no_password_is_set(client, monkeypatch):
    import config
    monkeypatch.setattr(config, "ADMIN_PASSWORD_HASH", "")
    reply = client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD})
    assert reply.status_code == 503


def test_public_health_says_nothing_about_the_setup(client, admin):
    assert client.get("/api/health").get_json() == {"success": True}
    full = client.get("/api/health", headers=admin).get_json()
    assert full["database"] and full["storage"] == "local" and full["limits"]["video_mb"] > 0


def test_cache_headers(client, admin):
    public = client.get("/api/articles")
    assert "max-age=15" in public.headers["Cache-Control"]
    assert "Authorization" in public.headers["Vary"]
    assert client.get("/api/articles", headers=admin).headers["Cache-Control"] == "no-store"
    assert client.get("/api/stats", headers=admin).headers["Cache-Control"] == "no-store"
    assert public.headers["X-Content-Type-Options"] == "nosniff"


def test_cors_only_for_the_listed_site(client):
    ok = client.get("/api/articles", headers={"Origin": "https://www.example.org"})
    assert ok.headers.get("Access-Control-Allow-Origin") == "https://www.example.org"
    other = client.get("/api/articles", headers={"Origin": "https://evil.example.net"})
    assert "Access-Control-Allow-Origin" not in other.headers
    pre = client.options("/api/articles", headers={"Origin": "https://www.example.org", "Access-Control-Request-Method": "POST",
                                                   "Access-Control-Request-Headers": "authorization,content-type"})
    assert pre.status_code in (200, 204)
    assert "authorization" in pre.headers.get("Access-Control-Allow-Headers", "").lower()


def test_live_does_not_need_the_database(client, monkeypatch):
    """A deploy asks /api/live whether the new container started: a database that is down must not make it fail."""
    import database
    import pymysql

    def down():
        raise pymysql.err.OperationalError(2003, "no database")
    monkeypatch.setattr(database, "ping", down)
    assert client.get("/api/live").status_code == 200
    assert client.get("/api/health").status_code == 503
