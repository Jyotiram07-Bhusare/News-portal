"""Admin login: one admin account (ADMIN_USERNAME + ADMIN_PASSWORD_HASH from backend/.env) and signed, expiring tokens.

The Admin Panel signs in with POST /api/auth/login, keeps the token in the browser tab and sends it as
"Authorization: Bearer <token>" with every request. Reading the website's data (news, issues, videos) needs no login; everything that
writes - and the admin-only reads (stats, media) - does.
"""
import hashlib
import hmac
import threading
import time
from functools import wraps

from flask import jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash

import config

_serializer = URLSafeTimedSerializer(config.SECRET_KEY, salt="lokmangal-admin-token-v1")

# Checking a password for an unknown user name must take as long as for the real one (no way to find out which names exist).
_DUMMY_HASH = "scrypt:32768:8:1$lokmangal$" + "0" * 128


def login_configured():
    return bool(config.ADMIN_PASSWORD_HASH)


def _password_fingerprint():
    """Part of every token: changing the password invalidates every token that was issued before."""
    return hashlib.sha256(config.ADMIN_PASSWORD_HASH.encode()).hexdigest()[:12]


def check_credentials(username, password):
    given = str(username or "")
    known = hmac.compare_digest(given.encode(), config.ADMIN_USERNAME.encode())
    try:
        valid = check_password_hash(config.ADMIN_PASSWORD_HASH or _DUMMY_HASH, str(password or ""))
    except (ValueError, TypeError):
        valid = False
    return known and valid and login_configured()


def issue_token(username):
    """(token, seconds until it expires)"""
    token = _serializer.dumps({"u": username, "f": _password_fingerprint()})
    return token, config.TOKEN_TTL_HOURS * 3600


def verify_token(token):
    """The admin's user name, or None for a missing / forged / expired / outdated token."""
    if not token or not login_configured():
        return None
    try:
        data = _serializer.loads(token, max_age=config.TOKEN_TTL_HOURS * 3600)
    except (BadSignature, SignatureExpired):
        return None
    if not isinstance(data, dict) or data.get("f") != _password_fingerprint():
        return None
    return data.get("u")


def bearer_token():
    header = request.headers.get("Authorization", "")
    scheme, _, value = header.partition(" ")
    return value.strip() if scheme.lower() == "bearer" else ""


def current_admin():
    return verify_token(bearer_token())


def admin_required(view):
    """The request must carry a valid admin token."""
    @wraps(view)
    def guarded(*args, **kwargs):
        if current_admin() is None:
            response = jsonify({"success": False, "error": "Please sign in.", "login_required": True})
            response.headers["WWW-Authenticate"] = 'Bearer realm="lokmangal-admin"'
            return response, 401
        return view(*args, **kwargs)
    return guarded


# ---- slowing down password guessing ----
_failures = {}                      # client address -> [times of recent wrong passwords]
_lock = threading.Lock()


def client_address():
    return request.remote_addr or "unknown"


def locked_for(address):
    """Seconds this address must still wait (0 = may try)."""
    now = time.time()
    window = config.LOGIN_LOCK_MINUTES * 60
    with _lock:
        recent = [t for t in _failures.get(address, []) if now - t < window]
        if recent:
            _failures[address] = recent
        else:
            _failures.pop(address, None)
        if len(recent) >= config.LOGIN_MAX_FAILURES:
            return int(window - (now - recent[0])) + 1
    return 0


def record_failure(address):
    with _lock:
        _failures.setdefault(address, []).append(time.time())
        if len(_failures) > 5000:           # never grow without a limit
            oldest = sorted(_failures, key=lambda a: _failures[a][-1])[:1000]
            for a in oldest:
                _failures.pop(a, None)


def record_success(address):
    with _lock:
        _failures.pop(address, None)
