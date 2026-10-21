"""Small admin tool for the backend.

    python manage.py set-admin-password      choose the Admin Panel password (saves its hash in backend/.env)
    python manage.py gen-secret              print a new SECRET_KEY
    python manage.py check                   test the settings, MySQL, the file storage (S3) and the admin login
"""
import argparse
import getpass
import re
import secrets
import sys

from werkzeug.security import generate_password_hash

import config

ENV_FILE = config.BASE_DIR / ".env"


def _write_env(name, value):
    """Put NAME='value' into backend/.env (replace the line when it exists, else add it)."""
    line = f"{name}='{value}'"
    text = ENV_FILE.read_text(encoding="utf-8") if ENV_FILE.is_file() else ""
    pattern = re.compile(rf"^\s*{re.escape(name)}\s*=.*$", re.M)
    if pattern.search(text):
        text = pattern.sub(lambda _m: line, text, count=1)
    else:
        text = text.rstrip("\n") + ("\n" if text else "") + line + "\n"
    ENV_FILE.write_text(text, encoding="utf-8")


def set_admin_password(args):
    password = args.password or getpass.getpass("New Admin Panel password (at least 10 characters): ")
    if len(password) < 10:
        sys.exit("Too short: use at least 10 characters (a few words together are easy to remember and hard to guess).")
    if not args.password and getpass.getpass("Type it again: ") != password:
        sys.exit("The two passwords are not the same. Nothing was changed.")
    hashed = generate_password_hash(password)
    if args.print_only:
        print(f"ADMIN_PASSWORD_HASH='{hashed}'")
        return
    _write_env("ADMIN_PASSWORD_HASH", hashed)
    if not config.SECRET_KEY_GIVEN and not re.search(r"^\s*SECRET_KEY\s*=\s*\S", ENV_FILE.read_text(encoding="utf-8"), re.M):
        _write_env("SECRET_KEY", secrets.token_urlsafe(48))
        print("A SECRET_KEY was made and saved too (it signs the logins).")
    print(f"Saved in {ENV_FILE}. Restart the backend; sign in as '{config.ADMIN_USERNAME}' with the new password.")
    print("(Everybody who was signed in is signed out now.)")


def gen_secret(_args):
    print(secrets.token_urlsafe(48))


def check(_args):
    import database
    import storage
    bad = 0

    def line(good, text):
        nonlocal bad
        print(("  OK    " if good else "  FAIL  ") + text)
        bad += 0 if good else 1

    print(f"Environment: {config.APP_ENV}")
    for problem in config.problems():
        line(False, problem)
    line(bool(config.ADMIN_PASSWORD_HASH), "admin login is set up" if config.ADMIN_PASSWORD_HASH else "no admin login yet (python manage.py set-admin-password)")
    try:
        database.ping()
        line(True, f"MySQL {config.DB_USER}@{config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}" + (" (encrypted)" if config.DB_SSL else ""))
        line(database.has_english(), "English columns exist" if database.has_english() else "English columns missing (python init_db.py)")
    except Exception as e:                                           # pymysql errors, a missing CA file ...
        line(False, f"MySQL: {e}")
    try:
        line(True, "files: " + storage.get().check())
    except Exception as e:
        line(False, f"files ({config.STORAGE_BACKEND}): {e}")
    print("\nAll good." if not bad else f"\n{bad} problem(s) to fix.")
    sys.exit(1 if bad else 0)


def main():
    parser = argparse.ArgumentParser(description="Lokmangal backend tools.")
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("set-admin-password", help="choose the Admin Panel password")
    p.add_argument("--password", help="give the password on the command line (it stays in the shell history - prefer the prompt)")
    p.add_argument("--print-only", action="store_true", help="only print the ADMIN_PASSWORD_HASH line, do not touch .env")
    p.set_defaults(run=set_admin_password)
    sub.add_parser("gen-secret", help="print a new SECRET_KEY").set_defaults(run=gen_secret)
    sub.add_parser("check", help="test settings, MySQL, S3 and the login").set_defaults(run=check)
    args = parser.parse_args()
    args.run(args)


if __name__ == "__main__":
    main()
