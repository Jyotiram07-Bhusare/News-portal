"""A production server that is not safe does not start."""
import importlib.util
from pathlib import Path

import pytest

CONFIG_FILE = Path(__file__).resolve().parent.parent / "config.py"

SAFE = {
    "APP_ENV": "production",
    "SECRET_KEY": "x" * 40,
    "ADMIN_PASSWORD_HASH": "pbkdf2:sha256:1000$salt$hash",
    "CORS_ORIGINS": "https://www.lokmangal.in",
    "DB_HOST": "lokmangal.abc123.ap-south-1.rds.amazonaws.com",
    "DB_USER": "lokmangal_app",
    "DB_PASSWORD": "a-real-password",
    "DB_SSL_CA": "/etc/ssl/certs/rds-global-bundle.pem",
    "SERVE_FRONTEND": "false",
    "STORAGE_BACKEND": "s3",
    "S3_BUCKET": "lokmangal-media",
    "MEDIA_BASE_URL": "https://media.lokmangal.in",
}
EVERY_SETTING = set(SAFE) | {"TRUSTED_PROXIES", "DB_SSL", "S3_PREFIX", "S3_REGION", "ADMIN_USERNAME", "UPLOAD_TMP_DIR"}


def fresh_config(monkeypatch, **overrides):
    """A separate copy of config.py read with the given environment (the config the other tests use is not touched)."""
    for key in EVERY_SETTING:
        monkeypatch.delenv(key, raising=False)
    for key, value in {**SAFE, **overrides}.items():
        if value is not None:
            monkeypatch.setenv(key, value)
    import dotenv
    monkeypatch.setattr(dotenv, "load_dotenv", lambda *a, **k: False)       # a developer's own backend/.env must not leak in
    spec = importlib.util.spec_from_file_location("config_under_test", CONFIG_FILE)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_a_correct_production_setup_has_no_problems(monkeypatch):
    assert fresh_config(monkeypatch).problems() == []


@pytest.mark.parametrize("override,words", [
    ({"SECRET_KEY": "short"}, "SECRET_KEY"),
    ({"SECRET_KEY": None}, "SECRET_KEY"),
    ({"ADMIN_PASSWORD_HASH": None}, "ADMIN_PASSWORD_HASH"),
    ({"CORS_ORIGINS": "*"}, "CORS_ORIGINS"),
    ({"CORS_ORIGINS": "http://www.lokmangal.in"}, "https"),
    ({"DB_USER": "root"}, "dedicated MySQL user"),
    ({"DB_PASSWORD": "change-me"}, "dedicated MySQL user"),
    ({"DB_SSL_CA": None}, "encrypted"),
    ({"SERVE_FRONTEND": "true"}, "SERVE_FRONTEND"),
    ({"S3_BUCKET": None}, "S3_BUCKET"),
    ({"MEDIA_BASE_URL": "http://insecure.example"}, "MEDIA_BASE_URL"),
    ({"STORAGE_BACKEND": "dropbox"}, "STORAGE_BACKEND"),
])
def test_each_unsafe_setting_is_reported(monkeypatch, override, words):
    found = fresh_config(monkeypatch, **override).problems()
    assert any(words in line for line in found), found


def test_the_app_refuses_to_start_when_production_is_unsafe(monkeypatch):
    import app as app_module
    monkeypatch.setattr(app_module, "config", fresh_config(monkeypatch, SECRET_KEY="short"))
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        app_module.create_app()


def test_development_is_not_strict(monkeypatch):
    cfg = fresh_config(monkeypatch, APP_ENV="development", SECRET_KEY=None, CORS_ORIGINS="*", DB_USER="root",
                       STORAGE_BACKEND="local", DB_SSL_CA=None, DB_HOST="localhost", SERVE_FRONTEND=None)
    assert cfg.IS_PRODUCTION is False and cfg.problems() == []
    assert cfg.SERVE_FRONTEND is True                       # (a development PC serves the website too)


def test_a_random_secret_is_made_when_none_is_given(monkeypatch):
    cfg = fresh_config(monkeypatch, APP_ENV="development", SECRET_KEY=None)
    assert len(cfg.SECRET_KEY) >= 32 and cfg.SECRET_KEY_GIVEN is False
