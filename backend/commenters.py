"""Readers who comment: who they are, and the token that keeps them signed in.

A comment is written under a signed-in name (the website's "Post Your Comment" dialog). Three ways in:
  - Google sign-in         the website gets a Google "credential"; google_profile() asks Google whether it is real and for this site
  - a code sent by e-mail  new_code() / send_code() / hash_code(); the code and its tries live in the database (database.save_email_code),
                           because the API runs as several worker processes
  - without login          name + e-mail + a small sum (new_captcha() / check_captcha())
Whichever way, the reader ends up as a row of `commenters` (e-mail, name) and gets a signed token (issue_token / verify_token). The token
is not the Admin Panel's: it has its own salt, so neither can be used in place of the other.
"""
import hashlib
import hmac
import json
import logging
import secrets
import smtplib
import ssl
import threading
import time
import urllib.parse
import urllib.request
from email.message import EmailMessage
from typing import Any, Dict, Optional, Tuple

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

import config

log = logging.getLogger("lokmangal.commenters")

_tokens = URLSafeTimedSerializer(config.SECRET_KEY, salt="lokmangal-commenter-token-v1")
_sums = URLSafeTimedSerializer(config.SECRET_KEY, salt="lokmangal-comment-sum-v1")


def issue_token(commenter_id: int) -> str:
    return _tokens.dumps({"c": int(commenter_id)})


def verify_token(token: Any) -> Optional[int]:
    """The commenter's id, or None for a missing / forged / expired token."""
    if not isinstance(token, str) or not token:
        return None
    try:
        data = _tokens.loads(token, max_age=config.COMMENTER_TTL_DAYS * 86400)
    except (BadSignature, SignatureExpired):
        return None
    return data.get("c") if isinstance(data, dict) and isinstance(data.get("c"), int) else None


# ---------------------------------------------------------------------------------------------- the small sum
SUM_SECONDS = 600
_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
_used_sums = {}                      # token -> when it was answered (per worker process: a sum is only a speed bump, not a lock)
_used_lock = threading.Lock()


def new_captcha() -> Tuple[str, str]:
    """(token, the sum to show, e.g. "6+1=") - the token holds the answer, signed, so nothing is kept on the server."""
    a, b = secrets.randbelow(9) + 1, secrets.randbelow(9) + 1
    return _sums.dumps({"a": a + b, "n": secrets.token_hex(4)}), f"{a}+{b}="


def check_captcha(token: Any, answer: Any) -> bool:
    """True once for a sum that was made lately and is answered right."""
    if not isinstance(token, str):
        return False
    try:
        data = _sums.loads(token, max_age=SUM_SECONDS)
    except (BadSignature, SignatureExpired):
        return False
    if str(answer).strip().translate(_DIGITS) != str(data.get("a")):
        return False
    now = time.time()
    with _used_lock:
        for old in [k for k, when in _used_sums.items() if now - when > SUM_SECONDS]:
            _used_sums.pop(old, None)
        if token in _used_sums:
            return False
        _used_sums[token] = now
    return True


# ---------------------------------------------------------------------------------------------- Google
GOOGLE_TOKENINFO = "https://oauth2.googleapis.com/tokeninfo?id_token="


def google_profile(credential: Any) -> Optional[Dict[str, str]]:
    """{email, name} when `credential` is a Google sign-in for THIS site (our client id) with a verified e-mail, else None."""
    if not config.GOOGLE_CLIENT_ID or not isinstance(credential, str) or not 20 <= len(credential) <= 4096:
        return None
    try:
        with urllib.request.urlopen(GOOGLE_TOKENINFO + urllib.parse.quote(credential, safe=""), timeout=6) as res:
            data = json.load(res)
    except Exception:                                            # Google unreachable, or it refused the credential
        return None
    if not isinstance(data, dict) or data.get("aud") != config.GOOGLE_CLIENT_ID:
        return None
    if data.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        return None
    if str(data.get("email_verified")).lower() != "true" or not data.get("email"):
        return None
    try:
        if float(data.get("exp", 0)) < time.time():
            return None
    except (TypeError, ValueError):
        return None
    return {"email": str(data["email"]), "name": str(data.get("name") or "")}


# ---------------------------------------------------------------------------------------------- the e-mailed code
def mail_ready() -> bool:
    return bool(config.SMTP_HOST and config.SMTP_FROM)


def email_login_available() -> bool:
    """A server needs its SMTP settings; a development PC without them prints the code instead (see shows_dev_code)."""
    return mail_ready() or not config.IS_PRODUCTION


def shows_dev_code() -> bool:
    """Only a development PC without SMTP hands the code back in the answer (so the sign-in can be tried without a mailbox)."""
    return not config.IS_PRODUCTION and not mail_ready()


def new_code() -> str:
    return f"{secrets.randbelow(10 ** 6):06d}"


def hash_code(email: str, code: str) -> str:
    return hmac.new(config.SECRET_KEY.encode(), f"{email}|{code}".encode(), hashlib.sha256).hexdigest()


def send_code(email: str, code: str) -> bool:
    """Mails the code. False when it could not be sent."""
    if not mail_ready():
        if config.IS_PRODUCTION:
            return False
        log.warning("e-mail code for %s: %s (SMTP is not set up: development only)", email, code)
        return True
    message = EmailMessage()
    message["Subject"] = "लोकमंगल: तुमचा कोड / Your Lokmangal code"
    message["From"] = config.SMTP_FROM
    message["To"] = email
    message.set_content(
        f"तुमचा लोकमंगल प्रतिक्रिया कोड: {code}\nहा कोड १० मिनिटे चालतो. तुम्ही मागितला नसेल तर हा ईमेल सोडून द्या.\n\n"
        f"Your Lokmangal comment code: {code}\nIt works for 10 minutes. If you did not ask for it, ignore this e-mail.\n")
    try:
        if config.SMTP_SSL:
            server = smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT, timeout=10, context=ssl.create_default_context())
        else:
            server = smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=10)
            server.starttls(context=ssl.create_default_context())
        with server:
            if config.SMTP_USER:
                server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.send_message(message)
        return True
    except (OSError, smtplib.SMTPException):
        log.exception("the e-mail code could not be sent")
        return False
