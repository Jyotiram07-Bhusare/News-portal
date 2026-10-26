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


def wrong(client):
    return client.post("/api/auth/login", json={"username": "admin", "password": "bad"}).status_code


def test_the_lock_lasts_an_hour_and_then_the_address_has_its_tries_again(client, monkeypatch):
    import time
    for _ in range(3):
        assert wrong(client) == 401
    locked = client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD})
    assert locked.status_code == 429 and 3500 < int(locked.headers["Retry-After"]) <= 3601 and "60 minute" in locked.get_json()["error"]
    real = time.time
    monkeypatch.setattr(time, "time", lambda: real() + 59 * 60)                 # 59 minutes later: still locked
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}).status_code == 429
    monkeypatch.setattr(time, "time", lambda: real() + 61 * 60)                 # after the hour: 3 tries again (LOGIN_MAX_FAILURES=3 here)
    assert [wrong(client) for _ in range(3)] == [401, 401, 401]
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}).status_code == 429


def test_a_right_password_starts_the_count_again(client):
    assert [wrong(client), wrong(client)] == [401, 401]
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}).status_code == 200
    assert [wrong(client), wrong(client)] == [401, 401]                          # (not locked: the two before were forgotten)
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}).status_code == 200


def test_another_address_is_not_locked(client):
    import auth
    for _ in range(3):
        wrong(client)
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}).status_code == 429
    other = client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}, environ_overrides={"REMOTE_ADDR": "203.0.113.9"})
    assert other.status_code == 200


def test_the_count_is_the_databases_so_every_worker_process_sees_it(client):
    import auth
    for _ in range(3):
        wrong(client)
        auth._failures.clear()                                                    # (a request that another worker answered: this one's memory knows nothing)
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}).status_code == 429


def test_when_the_database_cannot_be_asked_a_workers_memory_still_locks(client, db, monkeypatch):
    import pymysql
    import database

    def down(*args, **kwargs):
        raise pymysql.err.OperationalError(2003, "no database")
    for name in ("login_locked_for", "login_failed", "login_succeeded"):
        monkeypatch.setattr(database, name, down)
    for _ in range(3):
        assert wrong(client) == 401
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}).status_code == 429


def test_an_ipv6_address_stands_for_its_whole_64(client):
    where = lambda addr: {"environ_overrides": {"REMOTE_ADDR": addr}}
    bad = lambda addr: client.post("/api/auth/login", json={"username": "admin", "password": "bad"}, **where(addr)).status_code
    assert [bad("2001:db8:abcd:12::1"), bad("2001:db8:abcd:12:ffff::5"), bad("2001:db8:abcd:12:1:2:3:4")] == [401, 401, 401]     # three addresses, one /64
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}, **where("2001:db8:abcd:12::99")).status_code == 429
    assert client.post("/api/auth/login", json={"username": "admin", "password": PASSWORD}, **where("2001:db8:abcd:13::1")).status_code == 200   # another /64


def test_the_public_writes_take_only_a_small_body(client, db):
    big = "x" * 100_000
    for path, data in (("/api/auth/login", {"username": "admin", "password": big}), ("/api/comments", {"type": "article", "id": 1, "body": big}),
                       ("/api/commenters/guest", {"name": big})):
        reply = client.post(path, json=data)
        assert reply.status_code == 413 and reply.get_json()["success"] is False and "too large" in reply.get_json()["error"]


def test_the_admins_answers_are_never_cached(client, token):
    for path in ("/api/auth/me", "/api/stats", "/api/admin/comments"):
        assert client.get(path, headers={"Authorization": f"Bearer {token}"}).headers["Cache-Control"] == "no-store"


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
