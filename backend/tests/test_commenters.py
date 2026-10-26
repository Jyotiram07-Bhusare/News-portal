"""Readers who comment sign in first: Google, a code mailed to them, or name + e-mail + a small sum. They get a token that goes with their comments;
their name and e-mail are kept (the Admin Panel sees them, the website never does)."""
import json

import pytest

import app as app_module
import commenters
import config


@pytest.fixture(autouse=True)
def fresh(monkeypatch):
    app_module._hits.clear()
    commenters._used_sums.clear()
    sent = []
    monkeypatch.setattr(commenters, "send_code", lambda email, code: sent.append((email, code)) or True)
    yield sent
    app_module._hits.clear()


def post(client, path, **data):
    return client.post(f"/api/commenters/{path}", json=data)


def sum_of(question):
    left, right = question.rstrip("=").split("+")
    return int(left) + int(right)


def guest(client, name="Sachin", email="sachin@example.com", answer=None, **extra):
    asked = client.get("/api/commenters/captcha").get_json()
    given = sum_of(asked["question"]) if answer is None else answer
    return post(client, "guest", name=name, email=email, captcha_token=asked["token"], captcha_answer=given, **extra)


def comment_with(client, db, token, body="छान"):
    sid = db.create_article({"title": "बातमी", "category": "rajkiy"})
    return client.post("/api/comments", json={"type": "article", "id": sid, "token": token, "body": body, "visitor": "visitor-0001-aaaa"})


# ---------------------------------------------------------------- which ways are offered
def test_the_options_say_what_this_server_offers(client, monkeypatch):
    monkeypatch.setattr(config, "GOOGLE_CLIENT_ID", "abc.apps.googleusercontent.com")
    got = client.get("/api/commenters/options").get_json()
    assert got == {"success": True, "google_client_id": "abc.apps.googleusercontent.com", "email": True, "guest": True}
    monkeypatch.setattr(config, "GOOGLE_CLIENT_ID", "")
    monkeypatch.setattr(config, "IS_PRODUCTION", True)                      # a server without SMTP settings offers no e-mail code
    monkeypatch.setattr(config, "SMTP_HOST", "")
    got = client.get("/api/commenters/options").get_json()
    assert (got["google_client_id"], got["email"], got["guest"]) == ("", False, True)


# ---------------------------------------------------------------- without login: name + e-mail + a small sum
def test_a_reader_signs_in_with_name_email_and_the_sum_and_comments(client, db):
    reply = guest(client, name="  Sachin   Pawar ", email="Sachin@Example.com")
    got = reply.get_json()
    assert reply.status_code == 200 and got["user"] == {"name": "Sachin Pawar", "email": "sachin@example.com", "provider": "guest"}
    assert comment_with(client, db, got["token"]).get_json()["comment"]["name"] == "Sachin Pawar"
    assert db.commenters["sachin@example.com"]["provider"] == "guest"                         # the e-mail address is kept


def test_a_wrong_or_used_sum_is_refused(client, db):
    assert guest(client, answer=99).get_json()["reason"] == "captcha"
    asked = client.get("/api/commenters/captcha").get_json()
    ok = dict(name="A", email="a@example.com", captcha_token=asked["token"], captcha_answer=sum_of(asked["question"]))
    assert post(client, "guest", **ok).status_code == 200
    assert post(client, "guest", **ok).get_json()["reason"] == "captcha"                      # a sum counts once
    assert post(client, "guest", name="A", email="a@example.com", captcha_token="forged", captcha_answer=2).status_code == 400


def test_the_sum_may_be_answered_in_devanagari_digits(client):
    asked = client.get("/api/commenters/captcha").get_json()
    devanagari = "".join("०१२३४५६७८९"[int(d)] for d in str(sum_of(asked["question"])))
    reply = post(client, "guest", name="A", email="a@example.com", captcha_token=asked["token"], captcha_answer=devanagari)
    assert reply.status_code == 200


@pytest.mark.parametrize("fields,reason", [({"name": " "}, "name"), ({"name": "न" * 61}, "name"), ({"email": "nope"}, "email"), ({"email": ""}, "email")])
def test_bad_name_or_email_is_refused(client, fields, reason):
    reply = guest(client, **fields)
    assert reply.status_code == 400 and reply.get_json()["reason"] == reason


def test_a_robot_that_fills_the_hidden_field_gets_no_token(client, db):
    reply = guest(client, website="http://spam.example")
    assert reply.status_code == 400 and "token" not in reply.get_json() and db.commenters == {}


def test_a_guest_can_not_take_the_address_of_a_signed_in_reader(client, db):
    commenter = db.sign_in_commenter("rinku@example.com", "Rinku", "google")
    reply = guest(client, name="Pretender", email="rinku@example.com")
    assert reply.status_code == 409 and reply.get_json()["reason"] == "taken"
    assert db.commenters["rinku@example.com"]["name"] == "Rinku" and commenter["provider"] == "google"


def test_signing_in_is_rate_limited(client):
    codes = [guest(client, email=f"r{n}@example.com").status_code for n in range(11)]
    assert codes[:10] == [200] * 10 and codes[10] == 429


# ---------------------------------------------------------------- a code mailed to the reader
def test_a_reader_signs_in_with_a_mailed_code(client, db, fresh):
    assert post(client, "email/start", email="Meena@Example.com").get_json() == {"success": True, "dev_code": fresh[0][1]}
    email, code = fresh[0]
    assert email == "meena@example.com" and len(code) == 6
    reply = post(client, "email/verify", email="meena@example.com", code=code, name="Meena Joshi")
    got = reply.get_json()
    assert reply.status_code == 200 and got["user"] == {"name": "Meena Joshi", "email": "meena@example.com", "provider": "email"}
    assert comment_with(client, db, got["token"]).get_json()["comment"]["name"] == "Meena Joshi"
    assert post(client, "email/verify", email="meena@example.com", code=code).get_json()["reason"] == "expired"        # a code works once


def test_without_a_name_the_reader_is_called_after_the_email(client, fresh):
    post(client, "email/start", email="rinku.singh@example.com")
    got = post(client, "email/verify", email="rinku.singh@example.com", code=fresh[0][1]).get_json()
    assert got["user"]["name"] == "Rinku Singh"


def test_a_wrong_code_is_refused_and_five_wrong_ones_lock_it(client, fresh):
    post(client, "email/start", email="a@example.com")
    code = fresh[0][1]
    wrong = "000000" if code != "000000" else "111111"
    reasons = [post(client, "email/verify", email="a@example.com", code=wrong).get_json()["reason"] for _ in range(5)]
    assert reasons == ["code"] * 5
    assert post(client, "email/verify", email="a@example.com", code=code).get_json()["reason"] == "expired"          # too many wrong tries


@pytest.mark.parametrize("code", ["", "12345", "1234567", "abcdef", None])
def test_a_code_has_six_digits(client, code):
    assert post(client, "email/verify", email="a@example.com", code=code).get_json()["reason"] == "code"


def test_an_address_gets_a_new_code_only_after_a_moment(client, db, fresh):
    assert post(client, "email/start", email="a@example.com").status_code == 200
    db.codes["a@example.com"]["wait"] = True
    again = post(client, "email/start", email="a@example.com")
    assert again.status_code == 429 and again.get_json()["reason"] == "wait" and len(fresh) == 1
    db.codes["a@example.com"].update(wait=False, sends=5)
    assert post(client, "email/start", email="a@example.com").get_json()["reason"] == "limit"


def test_a_bad_address_gets_no_code(client, fresh):
    assert post(client, "email/start", email="nope").get_json()["reason"] == "email" and fresh == []


def test_when_the_mail_cannot_be_sent_the_reader_is_told(client, monkeypatch):
    monkeypatch.setattr(commenters, "send_code", lambda email, code: False)
    reply = post(client, "email/start", email="a@example.com")
    assert reply.status_code == 503 and reply.get_json()["reason"] == "mail"


def test_a_server_without_smtp_offers_no_code_and_never_shows_it(client, monkeypatch):
    monkeypatch.setattr(config, "IS_PRODUCTION", True)
    monkeypatch.setattr(config, "SMTP_HOST", "")
    assert post(client, "email/start", email="a@example.com").status_code == 503
    monkeypatch.setattr(config, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(config, "SMTP_FROM", "news@example.com")
    assert "dev_code" not in post(client, "email/start", email="b@example.com").get_json()                           # (a real mailbox gets it)


def test_the_mail_is_made_and_sent_over_smtp(monkeypatch):
    import smtplib
    monkeypatch.undo()                                    # (the real send_code, not the fake of the other tests)
    seen = {}

    class Server:
        def __init__(self, host, port, timeout=None, **kwargs): seen["host"] = (host, port)
        def starttls(self, context=None): seen["tls"] = True
        def login(self, user, password): seen["login"] = (user, password)
        def send_message(self, message): seen["message"] = message
        def __enter__(self): return self
        def __exit__(self, *a): return False

    monkeypatch.setattr(smtplib, "SMTP", Server)
    for name, value in (("SMTP_HOST", "smtp.example.com"), ("SMTP_PORT", 587), ("SMTP_SSL", False), ("SMTP_USER", "news@example.com"),
                        ("SMTP_PASSWORD", "secret"), ("SMTP_FROM", "Lokmangal <news@example.com>")):
        monkeypatch.setattr(config, name, value)
    assert commenters.send_code("meena@example.com", "123456") is True
    message = seen["message"]
    assert seen["host"] == ("smtp.example.com", 587) and seen["tls"] and seen["login"] == ("news@example.com", "secret")
    assert message["To"] == "meena@example.com" and message["From"] == "Lokmangal <news@example.com>"
    assert "123456" in message.get_content()


def test_a_mail_server_that_fails_gives_false_not_an_exception(monkeypatch):
    import smtplib
    monkeypatch.undo()
    def down(*args, **kwargs): raise OSError("connection refused")
    monkeypatch.setattr(smtplib, "SMTP", down)
    for name, value in (("SMTP_HOST", "smtp.example.com"), ("SMTP_PORT", 587), ("SMTP_SSL", False), ("SMTP_FROM", "news@example.com")):
        monkeypatch.setattr(config, name, value)
    assert commenters.send_code("a@example.com", "123456") is False


# ---------------------------------------------------------------- Google
def google_answer(monkeypatch, **fields):
    data = {"aud": "abc.apps.googleusercontent.com", "iss": "https://accounts.google.com", "email_verified": "true", "email": "Rinku@Gmail.com",
            "name": "Rinku Singh", "exp": "99999999999", **fields}

    class Answer:
        def __enter__(self): return self
        def __exit__(self, *a): return False
        def read(self, *a): return json.dumps(data).encode()

    monkeypatch.setattr(config, "GOOGLE_CLIENT_ID", "abc.apps.googleusercontent.com")
    monkeypatch.setattr(commenters.urllib.request, "urlopen", lambda url, timeout=None: Answer())


CREDENTIAL = "x" * 40


def test_a_reader_signs_in_with_google(client, db, monkeypatch):
    google_answer(monkeypatch)
    got = post(client, "google", credential=CREDENTIAL).get_json()
    assert got["user"] == {"name": "Rinku Singh", "email": "rinku@gmail.com", "provider": "google"}
    assert comment_with(client, db, got["token"]).status_code == 201


@pytest.mark.parametrize("fields", [{"aud": "another-site.apps.googleusercontent.com"}, {"iss": "https://evil.example"}, {"email_verified": "false"},
                                    {"email": ""}, {"exp": "1"}])
def test_a_google_credential_that_is_not_for_this_site_is_refused(client, monkeypatch, fields):
    google_answer(monkeypatch, **fields)
    reply = post(client, "google", credential=CREDENTIAL)
    assert reply.status_code == 401 and reply.get_json()["reason"] == "google"


def test_google_refusing_or_unreachable_is_a_401(client, monkeypatch):
    monkeypatch.setattr(config, "GOOGLE_CLIENT_ID", "abc.apps.googleusercontent.com")
    def down(url, timeout=None): raise OSError("no network")
    monkeypatch.setattr(commenters.urllib.request, "urlopen", down)
    assert post(client, "google", credential=CREDENTIAL).status_code == 401
    assert post(client, "google", credential="short").status_code == 401


def test_google_is_off_until_a_client_id_is_set(client, monkeypatch):
    monkeypatch.setattr(config, "GOOGLE_CLIENT_ID", "")
    assert post(client, "google", credential=CREDENTIAL).status_code == 503


def test_a_google_reader_keeps_the_name_the_address_already_has(client, db, monkeypatch):
    db.sign_in_commenter("rinku@gmail.com", "Rinku (my choice)", "email")
    google_answer(monkeypatch)
    assert post(client, "google", credential=CREDENTIAL).get_json()["user"]["name"] == "Rinku (my choice)"


# ---------------------------------------------------------------- the token
def test_a_forged_or_changed_token_is_not_a_reader():
    assert commenters.verify_token(commenters.issue_token(7)) == 7
    assert commenters.verify_token(commenters.issue_token(7) + "x") is None
    assert commenters.verify_token(None) is None and commenters.verify_token("") is None and commenters.verify_token(7) is None
