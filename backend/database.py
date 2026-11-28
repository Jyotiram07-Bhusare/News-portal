"""MySQL data layer: articles and weekly editions.

Port of the old SQLite module (data/database.py): same functions, same results, MySQL underneath.
Each call borrows its own connection from a small pool (never shared between threads), so it is thread-safe.
"""
import hashlib
import hmac
import json
import os
import queue
import re
import threading
import time
from contextlib import contextmanager
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Optional

import pymysql
from pymysql.constants import CLIENT
from pymysql.cursors import DictCursor

import config
import slugs

PLACEMENT_FIELDS = ("is_lead", "is_popular", "is_random")
TRUE_VALUES = ("1", "true", "True")

CATEGORY_LABELS = {
    "rajkiy": "राजकीय",
    "samajik": "सामाजिक",
    "blogs": "ब्लॉग्स",
    "review": "रिव्ह्यू",        # the website's name for this section (#cat-review)
    "reviews": "रिव्ह्यू",       # older spelling, still accepted
    "weekly": "साप्ताहिक आवृत्ती",
}
DEFAULT_CATEGORY_LABEL = "ताज्या घडामोडी"
DEFAULT_IMAGE = "assets/images/lokmangal_what_we_do.jpg"

ARTICLE_COLUMNS = ("id", "title", "category", "categoryLabel", "author", "date", "image", "excerpt",
                   "content", "views", "created_at", "is_lead", "is_popular", "is_random")
WEEKLY_COLUMNS = ("id", "issue_no", "date", "title", "image", "pdf_filename", "views", "description", "created_at")
VIDEO_TEXT = ("title", "title_en", "description", "description_en", "video_url", "thumbnail")
VIDEO_NUMBERS = ("duration_sec", "size_bytes")
AD_TEXT = ("media_type", "title", "title_en", "media_url", "thumbnail", "link_url")
AD_NUMBERS = ("duration_sec", "size_bytes")
AD_TYPES = ("image", "video")
# The three ads the website always showed (frontend/assets/ad-1..3.jpg). A NEW `ads` table starts with them, so the Admin Panel can
# reorder / replace / delete them like any other ad. (title, English title, picture)
# The website's footer details (Admin Panel > Footer). These are the placeholder details the footer started with.
SETTINGS_FIELDS = ("office_address", "office_address_en", "office_phone", "office_email")
BUILT_IN_SETTINGS = {
    "office_address": "लोकमंगल भवन, मुख्य रस्ता, सोलापूर, महाराष्ट्र – ४१३ ००१",
    "office_address_en": "Lokmangal Bhavan, Main Road, Solapur, Maharashtra – 413 001",
    "office_phone": "+91 98765 43210",
    "office_email": "info@lokmangal.example",
}
BUILT_IN_ADS = (
    ("लोकमंगल पतसंस्था — सोने खरेदी कर्ज", "Lokmangal Patsanstha — gold purchase loan", "assets/ad-1.jpg"),
    ("लोकमंगल बँक — दसरा दिवाळी, नवी सुरुवात", "Lokmangal Bank — Dasara Diwali, a new beginning", "assets/ad-2.jpg"),
    ("लोकमंगल फाउंडेशन — अन्नपूर्णा योजना", "Lokmangal Foundation — Annapurna Yojana", "assets/ad-3.jpg"),
)

# The English version of a news item / weekly issue (typed in the Admin Panel's "English" tab).
ARTICLE_EN = ("title_en", "author_en", "excerpt_en", "content_en")
WEEKLY_EN = ("title_en", "description_en")
# schema.sql creates these columns in a new database; init_db.add_missing_columns() adds them to an older one.
ENGLISH_COLUMNS = {
    "articles": (("title_en", "VARCHAR(500) NOT NULL DEFAULT ''"), ("author_en", "VARCHAR(200) NOT NULL DEFAULT ''"),
                 ("excerpt_en", "TEXT NULL"), ("content_en", "MEDIUMTEXT NULL")),
    "weekly_editions": (("title_en", "VARCHAR(500) NOT NULL DEFAULT ''"), ("description_en", "TEXT NULL")),
}
# The website lists the most recently UPDATED news first (edited, moved to another section, marked Popular / Random / Lead).
# update_article() / toggle_placement() stamp updated_at (never the client). Rows that exist when the column is added all get the same
# stamp, so nothing is reordered until something is edited.
UPDATED_COLUMNS = {
    "articles": (("updated_at", "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"),),
}
# The 4th placement: is_latest = 1 -> the news is listed in the Home page's "ताज्या बातम्या" (Latest News) section. Every news is 1 until the
# Admin Panel un-ticks it (so an older database looks the same after the column is added).
LATEST_COLUMNS = {
    "articles": (("is_latest", "TINYINT(1) NOT NULL DEFAULT 1"),),
}
# The 5th placement: is_review = 1 -> the news / blog is listed in the website's Review section (रिव्ह्यू), before the most viewed news and
# blogs that fill the section up. Every news is 0 until the Admin Panel ticks it.
REVIEW_COLUMNS = {
    "articles": (("is_review", "TINYINT(1) NOT NULL DEFAULT 0"),),
}
# The places inside the Popular and Random widgets (Admin Panel: "लोकप्रिय क्रम" / "यादृच्छिक क्रम", 1 = the top), apart from the section's
# date order: a story put into Popular / Random becomes number 1 there and the others move down one place; taken out, its place closes up.
PLACEMENT_ORDER_COLUMNS = {
    "articles": (("popular_order", "INT NULL"), ("random_order", "INT NULL")),
}
PLACEMENT_ORDERS = {"is_popular": "popular_order", "is_random": "random_order"}
# The place a news / blog is given in the Admin Panel ("क्रम क्रमांक", 1 = first). NULL = not placed by hand: it is listed by recency as before. The
# numbers are kept 1..K inside a group by _renumber_articles; the website lists the numbered ones first, in number order (newerFirst in app.js).
ORDER_COLUMNS = {
    "articles": (("sort_order", "INT NULL"),),
}
ORDER_GROUPS = {"rajkiy": ("rajkiy", "samajik"), "samajik": ("rajkiy", "samajik")}     # the two news sections are one list; every other section is its own
# Sections numbered by their publication date, like the weekly issues: the story with the newest date ("प्रकाशन तारीख") is number 1 of its
# list (the big story of its section), the one before it 2 ... Every save renumbers the list, so a new story lands in its place by itself.
AUTO_NUMBERED = ("rajkiy", "samajik", "blogs")
# The words of a news / blog's address (/blog/<slug>): short and in English letters (slugs.py; the English headline when there is one, else the Marathi one).
# Made once when it is created and never changed by an edit, so a link that was shared keeps working. NULL only until backfill_slugs() has run (at start-up).
SLUG_COLUMNS = {
    "articles": (("slug", "VARCHAR(190) NULL"),),
}
# Addresses a story had before (made before the short English ones: long, in Marathi letters), with commas between them: the website sends such a link on
# to the story's address of today (seo.py). Filled by shorten_slugs().
OLD_SLUG_COLUMNS = {
    "articles": (("old_slugs", "VARCHAR(1000) NULL"),),
}
# The same words for a video's own address (/video/<slug>). A `videos` table made earlier gets the column in ensure_videos_table().
VIDEO_SLUG_COLUMNS = {
    "videos": (("slug", "VARCHAR(190) NULL"),),
}
# How often readers opened a news / blog (the website calls POST /api/articles/<id>/read). The website adds it to the views typed in the Admin
# Panel; its Review section (रिव्ह्यू) lists the most viewed news and blogs. Only the counter changes: updated_at stays, so no other list is
# reordered by a click.
CLICK_COLUMNS = {
    "articles": (("clicks", "INT UNSIGNED NOT NULL DEFAULT 0"),),
}

# The time a news / blog was published, in INDIA time (see pubtime.py): "Published on: Nov 21, 2026, 14:05:07 IST" on the website. Stamped with the current
# time when a story is created (the Admin Panel can change it); NULL = an older story that only has its date text, which is shown without a time.
PUBLISHED_COLUMNS = {
    "articles": (("published_at", "DATETIME NULL"),),
}
# The tags (topics) of a news / blog, Marathi and English: "tag one, tag two" (sanitize.tags). The website shows them under the story; a tag opens
# all the stories that carry it.
TAG_COLUMNS = {
    "articles": (("tags", "VARCHAR(1000) NOT NULL DEFAULT ''"), ("tags_en", "VARCHAR(1000) NOT NULL DEFAULT ''")),
}


# -------------------------------------------------------------
# Connection
# -------------------------------------------------------------
def _ssl_options():
    """RDS: an encrypted connection. With the RDS CA bundle (DB_SSL_CA) the server's certificate AND its host name are verified."""
    if not config.DB_SSL:
        return {}
    if config.DB_SSL_CA:
        return {"ssl_ca": config.DB_SSL_CA, "ssl_verify_cert": True, "ssl_verify_identity": True}
    return {"ssl": {"check_hostname": False, "verify_mode": "none"}}      # encrypted, but the server is not verified


def connect(with_database: bool = True):
    return pymysql.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME if with_database else None,
        charset="utf8mb4",
        cursorclass=DictCursor,
        client_flag=CLIENT.FOUND_ROWS,              # rowcount = rows matched (as SQLite reported), not only rows changed
        init_command="SET time_zone = '+00:00'",    # created_at is kept in UTC, like the old CURRENT_TIMESTAMP
        connect_timeout=5,
        read_timeout=30,
        write_timeout=30,
        **_ssl_options(),
    )


POOL_SIZE = config.DB_POOL_SIZE
_idle = queue.LifoQueue(maxsize=POOL_SIZE)      # open connections waiting for the next request


def _close(conn):
    try:
        conn.close()
    except Exception:
        pass


def _checkout():
    """A ready connection: a pooled one when possible (a MySQL login costs ~70 ms, a query ~1 ms)."""
    while True:
        try:
            conn = _idle.get_nowait()
        except queue.Empty:
            return connect()
        try:
            conn.ping(reconnect=False)          # MySQL may have dropped it while it sat idle
            return conn
        except Exception:
            _close(conn)


def _release(conn):
    if not conn.open:
        return
    try:
        _idle.put_nowait(conn)
    except queue.Full:
        _close(conn)


def close_pool():
    while True:
        try:
            _close(_idle.get_nowait())
        except queue.Empty:
            return


@contextmanager
def connection():
    """Borrow a connection; commit when the block succeeds, roll back when it raises."""
    conn = _checkout()
    try:
        yield conn
        conn.commit()
    except BaseException:
        try:
            conn.rollback()
        except Exception:
            _close(conn)                        # broken connection: do not hand it out again
        raise
    finally:
        _release(conn)                          # (a closed connection is simply not kept)


def ping() -> bool:
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT 1 AS ok")
        return cur.fetchone()["ok"] == 1


def schema_statements() -> List[str]:
    """The statements of schema.sql, one by one (comment lines removed)."""
    sql = config.SCHEMA_FILE.read_text(encoding="utf-8")
    sql = "\n".join(line for line in sql.splitlines() if not line.strip().startswith("--"))
    return [s.strip() for s in sql.split(";") if s.strip()]


_videos_state = {"ok": False, "slug": False}


def ensure_videos_table() -> None:
    """The `videos` table was added after the first two: a database made before that gets it here, the first time videos are used
    (CREATE TABLE IF NOT EXISTS from schema.sql - nothing that exists is touched). `python init_db.py` creates it too.
    A complete table is only READ about, so the website's MySQL user needs no CREATE / ALTER right in production."""
    if _videos_state["ok"]:
        return
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'videos'", (config.DB_NAME,))
        have = {r["COLUMN_NAME"] for r in cur.fetchall()}
        if not have:
            for statement in schema_statements():
                if re.match(r"CREATE TABLE IF NOT EXISTS\s+videos\b", statement, re.I):
                    cur.execute(statement)
        elif "sort_order" not in have:
            cur.execute("ALTER TABLE videos ADD COLUMN sort_order INT NULL")          # a videos table made before the order numbers existed
        has_words = not have or "slug" in have
        if not has_words:                                      # a videos table made before a video had its own address
            try:
                cur.execute("ALTER TABLE videos ADD COLUMN slug VARCHAR(190) NULL")
                has_words = True
            except pymysql.MySQLError as e:                     # 1060 = another process was first. No right to ALTER: init_db.py adds it; videos work without
                has_words = bool(e.args) and e.args[0] == 1060
        cur.execute("SELECT COUNT(*) AS n FROM videos WHERE sort_order IS NULL")
        if cur.fetchone()["n"]:
            _renumber_videos(cur)                                                    # old rows get 1..N, newest first
        if has_words:
            cur.execute("SELECT id, title, title_en FROM videos WHERE slug IS NULL OR slug = '' ORDER BY id")
            for row in cur.fetchall():
                words = _free_slug(cur, slugs.make(row["title_en"], row["title"], "video"), row["id"], table="videos")
                cur.execute("UPDATE videos SET slug = %s WHERE id = %s", (words, row["id"]))
    _videos_state.update(ok=True, slug=has_words)


_settings_state = {"ok": False}
_settings_lock = threading.Lock()


def ensure_settings_table() -> None:
    """The `site_settings` table (Admin Panel > Footer) is created here the first time it is needed, with its ONE row (id = 1). On a development PC
    the row holds the placeholder details the footer started with (BUILT_IN_SETTINGS); on the LIVE server (APP_ENV=production) it starts EMPTY, so
    no placeholder phone / e-mail is ever shown on the public website: the owner types the real ones in the Admin Panel. Only a NEW table is
    filled: a detail the owner clears stays cleared. (init_db.py calls this too.)"""
    if _settings_state["ok"]:
        return
    with _settings_lock:
        if _settings_state["ok"]:
            return
        with connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'site_settings'", (config.DB_NAME,))
            is_new = not cur.fetchone()["n"]
            if is_new:
                for statement in schema_statements():
                    if re.match(r"CREATE TABLE IF NOT EXISTS\s+site_settings\b", statement, re.I):
                        cur.execute(statement)
                cur.execute("INSERT INTO site_settings (id, office_address, office_address_en, office_phone, office_email) VALUES (1, %s, %s, %s, %s)",
                            tuple("" if config.IS_PRODUCTION else BUILT_IN_SETTINGS[f] for f in SETTINGS_FIELDS))
        _settings_state["ok"] = True
    if is_new:
        publish_settings_file()


_ads_state = {"ok": False}
_ads_lock = threading.Lock()


def ensure_ads_table() -> None:
    """The `ads` table (Admin Panel > Advertisements) is created here the first time ads are used, and a NEW table is filled with the three
    ads the website already showed (BUILT_IN_ADS) - once: an owner who deletes them all does not get them back. (init_db.py calls this too.)"""
    if _ads_state["ok"]:
        return
    with _ads_lock:
        if _ads_state["ok"]:
            return
        with connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'ads'", (config.DB_NAME,))
            is_new = not cur.fetchone()["n"]
            if is_new:
                for statement in schema_statements():
                    if re.match(r"CREATE TABLE IF NOT EXISTS\s+ads\b", statement, re.I):
                        cur.execute(statement)
                for place, (title, title_en, url) in enumerate(BUILT_IN_ADS, start=1):
                    cur.execute("INSERT INTO ads (media_type, title, title_en, media_url, sort_order) VALUES ('image', %s, %s, %s, %s)",
                                (title, title_en, url, place))
        _ads_state["ok"] = True
    if is_new:
        publish_ads_file()


_english_state = {"ok": False, "checked": 0.0}
_updated_state = {"ok": False, "checked": 0.0}
_latest_state = {"ok": False, "checked": 0.0}
_review_state = {"ok": False, "checked": 0.0}
_placement_order_state = {"ok": False, "checked": 0.0}
_order_state = {"ok": False, "checked": 0.0}
_slug_state = {"ok": False, "checked": 0.0}
_old_slug_state = {"ok": False, "checked": 0.0}
_clicks_state = {"ok": False, "checked": 0.0}
_published_state = {"ok": False, "checked": 0.0}
_tags_state = {"ok": False, "checked": 0.0}


def _has_columns(spec: Dict[str, Any], state: Dict[str, Any]) -> bool:
    """True when every table of `spec` has all its columns. A "no" is looked up again every 10 seconds, a "yes" is kept."""
    if state["ok"] or time.time() - state["checked"] < 10:
        return state["ok"]
    state["checked"] = time.time()
    with connection() as conn:
        cur = conn.cursor()
        ok = True
        for table, columns in spec.items():
            cur.execute("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s",
                        (config.DB_NAME, table))
            have = {r["COLUMN_NAME"] for r in cur.fetchall()}
            ok = ok and all(name in have for name, _ in columns)
    state["ok"] = ok
    return ok


def has_english() -> bool:
    """True when both tables have their English columns. An older database gets them from `python init_db.py`; until then
    the API keeps working without English text (and says so)."""
    return _has_columns(ENGLISH_COLUMNS, _english_state)


def has_updated() -> bool:
    """True when `articles` has updated_at (an older database gets it from `python init_db.py`; until then nothing is stamped)."""
    return _has_columns(UPDATED_COLUMNS, _updated_state)


def has_latest() -> bool:
    """True when `articles` has is_latest."""
    return _has_columns(LATEST_COLUMNS, _latest_state)


def ensure_latest_column() -> bool:
    """An older database gets articles.is_latest here (once, at start-up; every existing news = 1). Returns whether the column is there."""
    if has_latest():
        return True
    try:
        with connection() as conn:
            conn.cursor().execute("ALTER TABLE articles ADD COLUMN is_latest TINYINT(1) NOT NULL DEFAULT 1")
    except pymysql.err.OperationalError as e:
        if not (e.args and e.args[0] == 1060):                  # 1060 = the column exists already (another process was first)
            raise
    _latest_state.update(ok=False, checked=0.0)
    return has_latest()


def has_review() -> bool:
    """True when `articles` has is_review."""
    return _has_columns(REVIEW_COLUMNS, _review_state)


def ensure_review_column() -> bool:
    """An older database gets articles.is_review here (once, at start-up; every existing news = 0). Returns whether the column is there."""
    if has_review():
        return True
    try:
        with connection() as conn:
            conn.cursor().execute("ALTER TABLE articles ADD COLUMN is_review TINYINT(1) NOT NULL DEFAULT 0")
    except pymysql.err.OperationalError as e:
        if not (e.args and e.args[0] == 1060):                  # 1060 = the column exists already (another process was first)
            raise
    _review_state.update(ok=False, checked=0.0)
    return has_review()


def has_placement_order() -> bool:
    """True when `articles` has popular_order and random_order (the places inside the Popular and Random widgets)."""
    return _has_columns(PLACEMENT_ORDER_COLUMNS, _placement_order_state)


def ensure_placement_order_columns() -> bool:
    """An older database gets articles.popular_order / random_order here (once, at start-up). Returns whether the columns are there."""
    if has_placement_order():
        return True
    for name, ddl in PLACEMENT_ORDER_COLUMNS["articles"]:
        try:
            with connection() as conn:
                conn.cursor().execute(f"ALTER TABLE articles ADD COLUMN {name} {ddl}")
        except pymysql.err.OperationalError as e:
            if not (e.args and e.args[0] == 1060):              # 1060 = the column exists already (another process was first)
                raise
    _placement_order_state.update(ok=False, checked=0.0)
    return has_placement_order()


def _optional_flags() -> tuple:
    """The placements that came after Lead / Popular / Random (is_latest, is_review), as far as this database has their columns."""
    return (*(("is_latest",) if has_latest() else ()), *(("is_review",) if has_review() else ()))


def has_order() -> bool:
    """True when `articles` has sort_order (the place number)."""
    return _has_columns(ORDER_COLUMNS, _order_state)


def ensure_order_column() -> bool:
    """An older database gets articles.sort_order here (once, at start-up; every existing news = NULL: listed by recency as before)."""
    if has_order():
        return True
    try:
        with connection() as conn:
            conn.cursor().execute("ALTER TABLE articles ADD COLUMN sort_order INT NULL")
    except pymysql.err.OperationalError as e:
        if not (e.args and e.args[0] == 1060):                  # 1060 = the column exists already (another process was first)
            raise
    _order_state.update(ok=False, checked=0.0)
    return has_order()


def has_slug() -> bool:
    """True when `articles` has slug (the words of the address)."""
    return _has_columns(SLUG_COLUMNS, _slug_state)


def ensure_slug_column() -> bool:
    """An older database gets articles.slug here (once, at start-up). Returns whether the column is there."""
    if has_slug():
        return True
    try:
        with connection() as conn:
            conn.cursor().execute("ALTER TABLE articles ADD COLUMN slug VARCHAR(190) NULL")
    except pymysql.err.OperationalError as e:
        if not (e.args and e.args[0] == 1060):                  # 1060 = the column exists already (another process was first)
            raise
    _slug_state.update(ok=False, checked=0.0)
    return has_slug()


def has_old_slugs() -> bool:
    """True when `articles` has old_slugs (the addresses a story had before)."""
    return _has_columns(OLD_SLUG_COLUMNS, _old_slug_state)


def ensure_old_slugs_column() -> bool:
    """An older database gets articles.old_slugs here (once, at start-up). Returns whether the column is there."""
    if has_old_slugs():
        return True
    try:
        with connection() as conn:
            conn.cursor().execute("ALTER TABLE articles ADD COLUMN old_slugs VARCHAR(1000) NULL")
    except pymysql.err.OperationalError as e:
        if not (e.args and e.args[0] == 1060):                  # 1060 = the column exists already (another process was first)
            raise
    _old_slug_state.update(ok=False, checked=0.0)
    return has_old_slugs()


def has_clicks() -> bool:
    """True when `articles` has clicks (how often readers opened a news / blog)."""
    return _has_columns(CLICK_COLUMNS, _clicks_state)


def ensure_clicks_column() -> bool:
    """An older database gets articles.clicks here (once, at start-up; every existing news starts at 0). Returns whether the column is there."""
    if has_clicks():
        return True
    try:
        with connection() as conn:
            conn.cursor().execute("ALTER TABLE articles ADD COLUMN clicks INT UNSIGNED NOT NULL DEFAULT 0")
    except pymysql.err.OperationalError as e:
        if not (e.args and e.args[0] == 1060):                  # 1060 = the column exists already (another process was first)
            raise
    _clicks_state.update(ok=False, checked=0.0)
    return has_clicks()


def has_published() -> bool:
    """True when `articles` has published_at (the time of publishing)."""
    return _has_columns(PUBLISHED_COLUMNS, _published_state)


def ensure_published_column() -> bool:
    """An older database gets articles.published_at here (once, at start-up; every existing story = NULL: it keeps showing its date). Returns whether the column is there."""
    if has_published():
        return True
    try:
        with connection() as conn:
            conn.cursor().execute("ALTER TABLE articles ADD COLUMN published_at DATETIME NULL")
    except pymysql.err.OperationalError as e:
        if not (e.args and e.args[0] == 1060):                  # 1060 = the column exists already (another process was first)
            raise
    _published_state.update(ok=False, checked=0.0)
    return has_published()


def has_tags() -> bool:
    """True when `articles` has tags and tags_en."""
    return _has_columns(TAG_COLUMNS, _tags_state)


def ensure_tag_columns() -> bool:
    """An older database gets articles.tags / tags_en here (once, at start-up; every existing story has no tags). Returns whether the columns are there."""
    if has_tags():
        return True
    for name, ddl in TAG_COLUMNS["articles"]:
        try:
            with connection() as conn:
                conn.cursor().execute(f"ALTER TABLE articles ADD COLUMN {name} {ddl}")
        except pymysql.err.OperationalError as e:
            if not (e.args and e.args[0] == 1060):              # 1060 = the column exists already (another process was first)
                raise
    _tags_state.update(ok=False, checked=0.0)
    return has_tags()


def backfill_published() -> int:
    """Give every story that has only a date (published_at NULL) a time (start-up): its own date at the time of day - India time - the record was
    created (created_at is UTC), so the website can show "Published on: Oct 13, 2026, 11:54:00 IST" on every story. A story that has a time is never
    touched, a date that cannot be read is skipped. The Admin Panel can change any of these times. Returns how many stories were given one."""
    if not has_published():
        return 0
    from seo import parse_date                                  # (seo imports this module)
    done = 0
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, `date`, created_at FROM articles WHERE published_at IS NULL")
        for row in cur.fetchall():
            day, created = parse_date(row["date"]), row["created_at"]
            if day is None or not isinstance(created, datetime):
                continue
            clock = (created + timedelta(hours=5, minutes=30)).time()
            moment = datetime(day.year, day.month, day.day, clock.hour, clock.minute, clock.second)
            cur.execute("UPDATE articles SET published_at = %s WHERE id = %s AND published_at IS NULL", (moment.strftime("%Y-%m-%d %H:%M:%S"), row["id"]))
            done += cur.rowcount
    return done


def _free_slug(cur, base: str, row_id: int = 0, old: bool = False, table: str = "articles") -> str:
    """`base`, or base-2, base-3 ... when another row of `table` (articles / videos - always a constant) already has it, or (`old`) another story
    had it before: an address that was shared once never starts to mean a different story."""
    slug, n = base, 1
    while True:
        if old:
            cur.execute("SELECT id FROM articles WHERE (slug = %s OR FIND_IN_SET(%s, old_slugs)) AND id != %s LIMIT 1", (slug, slug, row_id))
        else:
            cur.execute(f"SELECT id FROM {table} WHERE slug = %s AND id != %s LIMIT 1", (slug, row_id))
        if cur.fetchone() is None:
            return slug
        n += 1
        slug = f"{base[:slugs.LIMIT - len(str(n)) - 1].rstrip('-')}-{n}"


def backfill_slugs() -> int:
    """Give every news without words in its address one (start-up). Returns how many were given."""
    if not has_slug():
        return 0
    english, old = "title_en" if has_english() else "'' AS title_en", has_old_slugs()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(f"SELECT id, title, {english} FROM articles WHERE slug IS NULL OR slug = '' ORDER BY id")
        rows = cur.fetchall()
        for row in rows:
            slug = _free_slug(cur, slugs.make(row["title_en"], row["title"]), row["id"], old)
            cur.execute("UPDATE articles SET slug = %s WHERE id = %s", (slug, row["id"]))
        return len(rows)


def shorten_slugs() -> int:
    """Addresses made before the short English ones (long, or in Marathi letters) get a new one (start-up). The one they had is kept in old_slugs, so a
    link that was shared keeps working: the website sends it on to the new address. Nothing else of a story changes (its place in the lists neither), and
    a second run finds nothing to do. Returns how many addresses were made short."""
    if not (has_slug() and has_old_slugs()):              # (never without keeping the old address)
        return 0
    english = "title_en" if has_english() else "'' AS title_en"
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(f"SELECT id, slug, old_slugs, title, {english} FROM articles "
                    "WHERE slug != '' AND (CHAR_LENGTH(slug) > %s OR LENGTH(slug) != CHAR_LENGTH(slug)) ORDER BY id", (slugs.LIMIT,))
        rows = cur.fetchall()
        for row in rows:
            before = [s for s in str(row["old_slugs"] or "").split(",") if s]
            new = _free_slug(cur, slugs.make(row["title_en"], row["title"]), row["id"], True)
            cur.execute("UPDATE articles SET slug = %s, old_slugs = %s WHERE id = %s", (new, ",".join(dict.fromkeys(before + [row["slug"]])), row["id"]))
        return len(rows)


def english_ignored(data: Dict[str, Any]) -> bool:
    """True when a request brought English text that this database cannot keep yet (the English columns are missing)."""
    sent = any(str(data.get(f) or "").strip() for f in {*ARTICLE_EN, *WEEKLY_EN})
    return sent and not has_english()


# -------------------------------------------------------------
# Small helpers
# -------------------------------------------------------------
def _row(row: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """MySQL row -> plain dict. Datetimes become 'YYYY-MM-DD HH:MM:SS' text, as SQLite used to return."""
    if row is None:
        return None
    return {k: (v.strftime("%Y-%m-%d %H:%M:%S") if isinstance(v, datetime) else v) for k, v in row.items()}


def _flag(value: Any) -> int:
    return 1 if str(value) in TRUE_VALUES else 0


def _text(data: Dict[str, Any], key: str, default: str = "") -> str:
    value = data.get(key)
    return default if value is None else str(value).strip()


def _like(term: str) -> str:
    """Search text -> LIKE pattern in which % _ and backslash typed by the user are ordinary characters."""
    return "%" + term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"


# -------------------------------------------------------------
# Articles CRUD
# -------------------------------------------------------------
def get_articles(category: Optional[str] = None, search: Optional[str] = None,
                 limit: Optional[int] = None, placement: Optional[str] = None) -> List[Dict[str, Any]]:
    sql = "SELECT * FROM articles WHERE 1=1"
    params: List[Any] = []

    if category and category != "all":
        sql += " AND category = %s"
        params.append(category)

    column = {"lead": "is_lead", "popular": "is_popular", "random": "is_random", "latest": "is_latest" if has_latest() else None,
              "review": "is_review" if has_review() else None}.get(placement or "")
    if column:
        sql += f" AND {column} = 1"

    if search:
        columns = ("title", "excerpt", "content", "author", *(("tags", "tags_en") if has_tags() else ()))
        sql += " AND (" + " OR ".join(f"{c} LIKE %s" for c in columns) + ")"
        params.extend([_like(search)] * len(columns))

    sql += " ORDER BY id DESC"
    if limit and limit > 0:
        sql += " LIMIT %s"
        params.append(limit)

    with connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        return [_row(r) for r in cur.fetchall()]


def publish_articles_file() -> bool:
    """Keep frontend/js/articles-data.js equal to the articles table. A static host (Vercel) has no backend, so the website gets the news
    the owner changed in the Admin Panel (edited, Popular / Lead / Random / Latest, new, deleted) from this file there; with a backend the
    website asks /api/articles instead. Written only when something changed. Returns True when it was rewritten."""
    return _write_js_data(
        "articles-data.js", "window.ARTICLES_DATA", get_articles(),
        "// Written by the backend (Admin Panel > News) after every change - do not edit by hand.\n"
        "// The website shows these news where it has no backend (a static host); with a backend it asks /api/articles instead.\n")


def get_article_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    """The story with these words in its address - or the one that had them before (its "slug" is then another one: seo.py sends the visitor there)."""
    if not has_slug():
        return None
    old = has_old_slugs()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM articles WHERE slug = %s LIMIT 1", (slug,))
        row = cur.fetchone()
        if row is None and old:
            cur.execute("SELECT * FROM articles WHERE FIND_IN_SET(%s, old_slugs) LIMIT 1", (slug,))
            row = cur.fetchone()
        return _row(row)


def get_article(article_id: int) -> Optional[Dict[str, Any]]:
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM articles WHERE id = %s", (article_id,))
        return _row(cur.fetchone())


def _order_group(category: Any) -> tuple:
    return ORDER_GROUPS.get(str(category), (str(category),))


def _renumber_articles(cur, categories: tuple, move_id: Optional[int] = None, position: Optional[int] = None) -> None:
    """Keep the place numbers of one group (blogs / news / reviews) 1..K without gaps or doubles. `move_id` takes `position` (1 = the very top; a number
    beyond the end = the last place) and the others move over; with `position` None it is taken out of the numbering (listed by recency again)."""
    marks = ", ".join(["%s"] * len(categories))
    cur.execute(f"SELECT id FROM articles WHERE category IN ({marks}) AND sort_order IS NOT NULL ORDER BY sort_order, id DESC", tuple(categories))
    ids = [r["id"] for r in cur.fetchall()]
    if move_id is not None:
        if move_id in ids:
            ids.remove(move_id)
        if position is None:
            cur.execute("UPDATE articles SET sort_order = NULL WHERE id = %s", (move_id,))
        else:
            ids.insert(max(0, min(len(ids), int(position) - 1)), move_id)
    for number, row_id in enumerate(ids, start=1):
        cur.execute("UPDATE articles SET sort_order = %s WHERE id = %s AND (sort_order IS NULL OR sort_order != %s)", (number, row_id, number))


def _date_order(rows: List[Dict[str, Any]]) -> List[int]:
    """Ids newest first by the publication date ("२४ ऑक्टोबर २०२६"); a date that cannot be read counts as the day the story was added
    (or, without that, as the newest - a fresh story never disappears at the bottom). Same date: the later published TIME (published_at) first,
    then the later added."""
    from seo import parse_date                                  # (seo imports this module)

    def key(row):
        day = parse_date(row.get("date"))
        if day is None:
            added = row.get("created_at")
            day = added.date() if isinstance(added, datetime) else (parse_date(str(added or "")[:10]) or date.max)
        return (day, row.get("published_at") or datetime.min, int(row["id"]))        # (same day: the later TIME first, then the later added)
    return [r["id"] for r in sorted(rows, key=key, reverse=True)]


def _renumber_by_date(cur, categories: tuple) -> None:
    """Number one AUTO_NUMBERED list 1..K by publication date (only the numbers that change are written)."""
    marks = ", ".join(["%s"] * len(categories))
    published = ", published_at" if has_published() else ""
    cur.execute(f"SELECT id, `date`, created_at, sort_order{published} FROM articles WHERE category IN ({marks})", tuple(categories))
    rows = cur.fetchall()
    now = {r["id"]: r["sort_order"] for r in rows}
    for number, row_id in enumerate(_date_order(rows), start=1):
        if now[row_id] != number:
            cur.execute("UPDATE articles SET sort_order = %s WHERE id = %s", (number, row_id))


def renumber_all_by_date() -> None:
    """Every AUTO_NUMBERED list numbered by date (at start-up: a database numbered the older ways is put right once)."""
    if not has_order():
        return
    with connection() as conn:
        cur = conn.cursor()
        for group in {_order_group(c) for c in AUTO_NUMBERED}:
            _renumber_by_date(cur, group)


def _moved(ids: List[int], move_id: int, position: int) -> List[int]:
    """`ids` in order with `move_id` put at `position` (1 = the top; past the end = the last place)."""
    rest = [i for i in ids if i != move_id]
    rest.insert(max(0, min(len(rest), int(position) - 1)), move_id)
    return rest


def _renumber_placement(cur, flag: str, move_id: Optional[int] = None, position: Optional[int] = None) -> None:
    """Keep the places inside one widget (flag "is_popular" or "is_random") 1..K: the stories with the flag on, the numbered ones first in
    number order, then any without a number (the most recently updated first). `move_id` takes `position`. A story with the flag off
    keeps no place. Only the numbers that change are written."""
    col = PLACEMENT_ORDERS[flag]
    cur.execute(f"UPDATE articles SET `{col}` = NULL WHERE `{flag}` = 0 AND `{col}` IS NOT NULL")
    recent = "updated_at DESC, " if has_updated() else ""
    cur.execute(f"SELECT id, `{col}` AS place FROM articles WHERE `{flag}` = 1 ORDER BY (`{col}` IS NULL), `{col}`, {recent}id DESC")
    rows = cur.fetchall()
    now = {r["id"]: r["place"] for r in rows}
    ids = [r["id"] for r in rows]
    if move_id is not None and move_id in now and position is not None:
        ids = _moved(ids, move_id, position)
    for number, row_id in enumerate(ids, start=1):
        if now[row_id] != number:
            cur.execute(f"UPDATE articles SET `{col}` = %s WHERE id = %s", (number, row_id))


def number_placements() -> None:
    """The Popular and Random widgets numbered 1..K (at start-up: a story marked before the numbers existed gets one, the most recently
    marked first)."""
    if not has_placement_order():
        return
    with connection() as conn:
        cur = conn.cursor()
        for flag in PLACEMENT_ORDERS:
            _renumber_placement(cur, flag)


def create_article(data: Dict[str, Any]) -> int:
    category = _text(data, "category", "rajkiy")
    category_label = _text(data, "categoryLabel") or CATEGORY_LABELS.get(category, DEFAULT_CATEGORY_LABEL)
    is_lead, is_popular, is_random = (_flag(data.get(f, 0)) for f in PLACEMENT_FIELDS)
    english = ARTICLE_EN if has_english() else ()
    flags = _optional_flags()
    published = ("published_at",) if has_published() and data.get("published_at") else ()      # (an older story / a request with only a date: NULL)
    tag_columns = ("tags", "tags_en") if has_tags() else ()

    with connection() as conn:
        cur = conn.cursor()
        if is_lead:
            cur.execute("UPDATE articles SET is_lead = 0")     # only one Lead Story at a time
        cur.execute(
            f"""INSERT INTO articles
                   (title, category, categoryLabel, author, `date`, image, excerpt, content, views,
                    is_lead, is_popular, is_random{"".join(f", {c}" for c in (*english, *flags, *published, *tag_columns))})
               VALUES ({", ".join(["%s"] * (12 + len(english) + len(flags) + len(published) + len(tag_columns)))})""",
            (
                _text(data, "title"),
                category,
                category_label,
                _text(data, "author", "लोकमंगल प्रतिनिधी"),
                _text(data, "date"),
                _text(data, "image", DEFAULT_IMAGE),
                _text(data, "excerpt"),
                _text(data, "content"),
                _text(data, "views", "1.2K"),
                is_lead,
                is_popular,
                is_random,
                *(_text(data, c) for c in english),
                *(_flag(data.get(f, 1 if f == "is_latest" else 0)) for f in flags),     # (listed in Latest News unless the form says no)
                *((data["published_at"],) if published else ()),                 # (India time, 'YYYY-MM-DD HH:MM:SS' - see pubtime.py)
                *(_text(data, c) for c in tag_columns),
            ),
        )
        new_id = cur.lastrowid
        if has_slug():
            words = _free_slug(cur, slugs.make(data.get("title_en"), data.get("title")), new_id, has_old_slugs())
            cur.execute("UPDATE articles SET slug = %s WHERE id = %s", (words, new_id))
        if has_order():
            if category in AUTO_NUMBERED:
                _renumber_by_date(cur, _order_group(category))                 # its date decides its place; the others move over
            elif data.get("sort_order") is not None:
                _renumber_articles(cur, _order_group(category), new_id, data["sort_order"])      # given a place by hand: the others move over
        if has_placement_order():
            for flag, col in PLACEMENT_ORDERS.items():
                if _flag(data.get(flag, 0)):
                    _renumber_placement(cur, flag, new_id, data.get(col) or 1)     # put into Popular / Random: number 1 unless a place is typed
        return new_id


def update_article(article_id: int, data: Dict[str, Any]) -> bool:
    data = dict(data)
    if data.get("category") and not data.get("categoryLabel"):
        data["categoryLabel"] = CATEGORY_LABELS.get(data["category"], DEFAULT_CATEGORY_LABEL)

    fields: List[str] = []
    values: List[Any] = []
    for key in ("title", "category", "categoryLabel", "author", "date", "image", "excerpt", "content", "views",
                *PLACEMENT_FIELDS, *_optional_flags(), *(("published_at",) if has_published() else ()),
                *(("tags", "tags_en") if has_tags() else ()), *(ARTICLE_EN if has_english() else ())):
        if key in data:
            fields.append(f"`{key}` = %s")
            values.append(_flag(data[key]) if key in (*PLACEMENT_FIELDS, "is_latest", "is_review") else data[key])
    place = has_order() and ("sort_order" in data or "date" in data or "category" in data)    # (the place can change: a number, a new date or section)
    orders = has_placement_order() and any(k in data for k in (*PLACEMENT_ORDERS, *PLACEMENT_ORDERS.values()))   # (Popular / Random and their places)
    if not fields and not place and not orders:
        return False
    if fields and has_updated():
        fields.append("`updated_at` = CURRENT_TIMESTAMP")       # saved = the newest: the website lists it first (unless it has a place number)

    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, category, is_popular, is_random" + (", sort_order" if place else "")
                    + (", popular_order, random_order" if orders else "") + " FROM articles WHERE id = %s", (article_id,))
        before = cur.fetchone()
        if before is None:
            return False                                        # nothing is touched for an unknown id
        if _flag(data.get("is_lead", "")):
            cur.execute("UPDATE articles SET is_lead = 0 WHERE id != %s", (article_id,))
        if fields:
            cur.execute(f"UPDATE articles SET {', '.join(fields)} WHERE id = %s", values + [article_id])
        if place:
            category = data.get("category") or before["category"]
            group = _order_group(category)
            moved = _order_group(before["category"]) != group
            if category in AUTO_NUMBERED:
                _renumber_by_date(cur, group)                   # numbered by date: a number typed by hand does not count here
            elif "sort_order" in data:
                position = data.get("sort_order")
                if position is not None or before.get("sort_order") is not None:
                    _renumber_articles(cur, group, article_id, position)
            if moved:                                           # moved to another section: the place it leaves behind is closed up
                if before["category"] in AUTO_NUMBERED:
                    _renumber_by_date(cur, _order_group(before["category"]))
                else:
                    _renumber_articles(cur, _order_group(before["category"]))
        if orders:
            for flag, col in PLACEMENT_ORDERS.items():
                was_on = bool(before[flag])
                is_on = bool(_flag(data[flag])) if flag in data else was_on
                if is_on and not was_on:
                    _renumber_placement(cur, flag, article_id, data.get(col) or 1)     # just put in: number 1 unless a place is typed
                elif is_on and data.get(col) is not None and data[col] != before.get(col):
                    _renumber_placement(cur, flag, article_id, data[col])            # given another place in the Admin Panel
                elif was_on and not is_on:
                    _renumber_placement(cur, flag)                                   # taken out: its place closes up
        return True


def toggle_placement(article_id: int, field: str, value: Any = None) -> Optional[Dict[str, Any]]:
    """Turn one placement flag (is_lead / is_popular / is_random / is_latest / is_review) on or off; returns the updated article."""
    if field not in (*PLACEMENT_FIELDS, *_optional_flags()):
        return None
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(f"SELECT `{field}` AS current_value FROM articles WHERE id = %s", (article_id,))
        row = cur.fetchone()
        if row is None:
            return None
        new_value = (0 if row["current_value"] else 1) if value is None else _flag(value)
        if field == "is_lead" and new_value == 1:
            # ONE statement: this article becomes the Lead Story and every other one stops being it
            cur.execute("UPDATE articles SET is_lead = (id = %s)", (article_id,))
        else:
            cur.execute(f"UPDATE articles SET `{field}` = %s WHERE id = %s", (new_value, article_id))
        if new_value == 1 and has_updated():
            # marked Lead / Popular / Random: it is the newest there. (Turning a flag OFF, or another article becoming the Lead, stamps nothing.)
            cur.execute("UPDATE articles SET `updated_at` = CURRENT_TIMESTAMP WHERE id = %s", (article_id,))
        if field in PLACEMENT_ORDERS and has_placement_order() and new_value != (1 if row["current_value"] else 0):
            if new_value:
                _renumber_placement(cur, field, article_id, 1)      # put into Popular / Random: number 1 there, the others move down
            else:
                _renumber_placement(cur, field)                     # taken out: its place closes up
        cur.execute("SELECT * FROM articles WHERE id = %s", (article_id,))
        article = cur.fetchone()
        if article is None:                                     # deleted by someone else in the meantime
            conn.rollback()
            return None
        return _row(article)


# What the Home page's "ताज्या बातम्या" list shows (NEWS_CATEGORIES in js/app.js) and how many it shows on its first page (the big story + 7 rows).
LATEST_CATEGORIES = ("samajik", "rajkiy")
LATEST_SLOT = 8


def settle_if_unplaced(article_id: int, before: Optional[Dict[str, Any]]) -> bool:
    """A news taken out of Popular / Random (`before` = how it was just before) that is now in NO placement (not Lead, Popular, Random or Review) is not
    left in no section: it is ticked under "ताज्या बातम्या" and goes to the LATEST_SLOT-th place of that list (the last row of its first page),
    whatever its stamp was. Returns True when it was moved. Only the stamps `updated_at` decide the order of the website's lists, so the news gets
    the stamp that has exactly LATEST_SLOT - 1 news above it; when two stamps are too close to fit it in, the news below are moved down 2 seconds
    together (their order among themselves does not change)."""
    if not before or not (before.get("is_popular") or before.get("is_random")) or not has_updated():
        return False
    with connection() as conn:
        cur = conn.cursor()
        review_column = ", is_review" if has_review() else ""
        cur.execute(f"SELECT id, category, is_lead, is_popular, is_random{review_column} FROM articles WHERE id = %s", (article_id,))
        me = cur.fetchone()
        if not me or me["category"] not in LATEST_CATEGORIES or me["is_lead"] or me["is_popular"] or me["is_random"] or me.get("is_review"):
            return False
        marks = ", ".join(["%s"] * len(LATEST_CATEGORIES))
        latest_column = ", is_latest" if has_latest() else ", 1 AS is_latest"
        cur.execute(f"SELECT id, category, is_lead{latest_column}, updated_at FROM articles WHERE id != %s AND category IN ({marks}) "
                    "ORDER BY updated_at DESC, id DESC", (article_id, *LATEST_CATEGORIES))
        rows = cur.fetchall()
        # the big Home story is not in the list: the Lead Story, or without one the newest Rajkiy
        lead = next((r["id"] for r in rows if r["is_lead"]), None) or next((r["id"] for r in rows if r["category"] == "rajkiy"), None)
        listed = [r for r in rows if r["id"] != lead and r["is_latest"]]
        if has_latest():
            cur.execute("UPDATE articles SET is_latest = 1 WHERE id = %s", (article_id,))
        step = timedelta(seconds=1)
        if len(listed) < LATEST_SLOT - 1:                              # fewer than 7 others: it simply goes last
            if listed:
                stamp = listed[-1]["updated_at"] - step
            else:
                cur.execute("SELECT UTC_TIMESTAMP() AS now")
                stamp = cur.fetchone()["now"]
        else:
            above, below = listed[LATEST_SLOT - 2], listed[LATEST_SLOT - 1]       # the 7th and the 8th now
            if above["updated_at"] - below["updated_at"] >= 2 * step:
                stamp = below["updated_at"] + step                    # room between them
            else:
                ids = [r["id"] for r in listed[LATEST_SLOT - 1:]]
                cur.execute(f"UPDATE articles SET updated_at = updated_at - INTERVAL 2 SECOND WHERE id IN ({', '.join(['%s'] * len(ids))})", ids)
                stamp = below["updated_at"] - step
        cur.execute("UPDATE articles SET updated_at = %s WHERE id = %s", (stamp, article_id))
        return True


def delete_article(article_id: int) -> bool:
    with connection() as conn:
        cur = conn.cursor()
        before = None
        if has_order():
            cur.execute("SELECT category, sort_order FROM articles WHERE id = %s", (article_id,))
            before = cur.fetchone()
        cur.execute("DELETE FROM articles WHERE id = %s", (article_id,))
        deleted = cur.rowcount > 0
        if deleted:
            _delete_item_comments(cur, "article", article_id)
        if deleted and before and before.get("sort_order") is not None:
            _renumber_articles(cur, _order_group(before["category"]))       # the place it leaves is closed up
        if deleted and has_placement_order():
            for flag in PLACEMENT_ORDERS:
                _renumber_placement(cur, flag)                                # (and its place in Popular / Random)
        return deleted


def count_click(article_id: int) -> bool:
    """A reader opened this news / blog: one more click (one more view on the website, which ranks its Review section by views). Nothing else of the
    row changes. Returns whether a news was counted (False: no such news, or a database without the clicks column yet)."""
    if not has_clicks():
        return False
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("UPDATE articles SET clicks = clicks + 1 WHERE id = %s", (article_id,))
        return cur.rowcount > 0


# -------------------------------------------------------------
# Public comments (website: under every news / blog / weekly issue - Admin Panel > Comments)
# -------------------------------------------------------------
# The mobile number a reader gives when he goes on without signing in (the Admin Panel shows it with his name and e-mail). The commenters table
# was made before it: init_db.py adds the column to a database that has the table already.
COMMENTER_COLUMNS = {
    "commenters": (("mobile", "VARCHAR(15) NULL"),),
}
COMMENT_TABLES = {"comments": (("id", ""), ("reports", ""), ("commenter_id", "")), "comment_votes": (("comment_id", ""),), "comment_reports": (("comment_id", ""),),
                  "commenters": (("email", ""), ("mobile", "")), "commenter_codes": (("code_hash", ""),)}
COMMENT_ITEMS = {"article": ("articles", "id"), "weekly": ("weekly_editions", "issue_no")}
COMMENT_LIST_MAX = 500                  # the most recent top-level comments one answer carries (their replies come with them)
_comments_state = {"ok": False, "checked": 0.0}


def has_comments() -> bool:
    """True when the three comment tables exist (python init_db.py creates them: every deploy runs it). Until then the website shows no comments."""
    return _has_columns(COMMENT_TABLES, _comments_state)


def ensure_comment_tables() -> bool:
    """A development PC gets the comment tables (and the table of the admin login lock) here (CREATE TABLE IF NOT EXISTS from schema.sql). On the server the deploy's init_db.py does it:
    the web application's own database user has no CREATE right, so a refusal here is not an error. Returns whether the tables are there."""
    try:
        with connection() as conn:
            cur = conn.cursor()
            for statement in schema_statements():
                if re.match(r"CREATE TABLE IF NOT EXISTS\s+(comment|login_failures)", statement, re.I):
                    cur.execute(statement)
            for table, columns in COMMENTER_COLUMNS.items():                # (a table made before a column was added)
                cur.execute("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s", (config.DB_NAME, table))
                have = {r["COLUMN_NAME"] for r in cur.fetchall()}
                for name, ddl in columns:
                    if name not in have:
                        cur.execute(f"ALTER TABLE `{table}` ADD COLUMN `{name}` {ddl}")
    except pymysql.err.Error:
        return False
    _comments_state.update(ok=False, checked=0.0)
    return has_comments()


COMMENT_CODE_TRIES = 5                 # wrong tries one mailed code allows
COMMENT_CODE_GAP = 45                  # seconds before the same address may ask for another code
COMMENT_CODES_PER_HOUR = 5


def sign_in_commenter(email: str, name: str, provider: str, mobile: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Finds or makes the reader with this e-mail address and returns {id, email, name, provider}. provider = google | email | guest.
    A proven address (google / email) keeps the name it has and a guest who later proves the address takes over (with the proven name).
    A guest can never be the owner of a proven address: that gives None. `mobile` (a guest's) is kept when given."""
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM commenters WHERE email = %s FOR UPDATE", (email,))
        row = cur.fetchone()
        if row is None:
            cur.execute("INSERT INTO commenters (email, name, provider, mobile, created_at, last_login_at) VALUES (%s, %s, %s, %s, UTC_TIMESTAMP(), UTC_TIMESTAMP())",
                        (email, name, provider, mobile))
            return {"id": cur.lastrowid, "email": email, "name": name, "provider": provider}
        if provider == "guest" and row["provider"] != "guest":
            return None
        if provider != "guest" and row["provider"] == "guest":
            row["name"], row["provider"] = name, provider                     # the guest proved the address
        elif provider == "guest":
            row["name"] = name                                                 # a guest may write under another name each time
        cur.execute("UPDATE commenters SET name = %s, provider = %s, mobile = %s, last_login_at = UTC_TIMESTAMP() WHERE id = %s",
                    (row["name"], row["provider"], mobile or row.get("mobile"), row["id"]))
        return {"id": row["id"], "email": email, "name": row["name"], "provider": row["provider"]}


def get_commenter(commenter_id: Optional[int]) -> Optional[Dict[str, Any]]:
    if not commenter_id:
        return None
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, email, name, provider FROM commenters WHERE id = %s", (commenter_id,))
        return cur.fetchone()


def save_email_code(email: str, code_hash: str) -> str:
    """Keeps the hash of a code just mailed to `email` (10 minutes). Returns "ok", or "wait" (a code went out a moment ago) or "limit" (too many lately)."""
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT sends, TIMESTAMPDIFF(SECOND, sent_at, UTC_TIMESTAMP()) AS ago, TIMESTAMPDIFF(MINUTE, window_start, UTC_TIMESTAMP()) AS minutes "
                    "FROM commenter_codes WHERE email = %s FOR UPDATE", (email,))
        row = cur.fetchone()
        if row is None:
            cur.execute("INSERT INTO commenter_codes (email, code_hash, expires_at, tries, sent_at, sends, window_start) "
                        "VALUES (%s, %s, UTC_TIMESTAMP() + INTERVAL 10 MINUTE, 0, UTC_TIMESTAMP(), 1, UTC_TIMESTAMP())", (email, code_hash))
            return "ok"
        if row["ago"] < COMMENT_CODE_GAP:
            return "wait"
        fresh = row["minutes"] >= 60
        if not fresh and row["sends"] >= COMMENT_CODES_PER_HOUR:
            return "limit"
        cur.execute("UPDATE commenter_codes SET code_hash = %s, expires_at = UTC_TIMESTAMP() + INTERVAL 10 MINUTE, tries = 0, sent_at = UTC_TIMESTAMP(), "
                    "sends = %s, window_start = IF(%s, UTC_TIMESTAMP(), window_start) WHERE email = %s",
                    (code_hash, 1 if fresh else row["sends"] + 1, 1 if fresh else 0, email))
        return "ok"


def check_email_code(email: str, code_hash: str) -> str:
    """"ok" (the code is used up now), "wrong" (one try spent), or "expired" (no code, too old, or too many wrong tries)."""
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT code_hash, tries, expires_at > UTC_TIMESTAMP() AS live FROM commenter_codes WHERE email = %s FOR UPDATE", (email,))
        row = cur.fetchone()
        if row is None or not row["live"] or row["tries"] >= COMMENT_CODE_TRIES:
            return "expired"
        if hmac.compare_digest(row["code_hash"], code_hash):
            cur.execute("UPDATE commenter_codes SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 SECOND WHERE email = %s", (email,))
            return "ok"
        cur.execute("UPDATE commenter_codes SET tries = tries + 1 WHERE email = %s", (email,))
        return "wrong"


def _visitor_hash(visitor: str) -> str:
    """Only this is kept of a visitor's random id (the website sends the id, never the address or a name)."""
    return hashlib.sha256((config.SECRET_KEY + visitor).encode("utf-8")).hexdigest()


def _comment_json(row: Dict[str, Any], my_vote: int = 0) -> Dict[str, Any]:
    created = row["created_at"]
    return {"id": row["id"], "parent_id": row["parent_id"], "name": row["name"], "body": row["body"], "likes": row["likes"],
            "dislikes": row["dislikes"], "created_at": created.strftime("%Y-%m-%dT%H:%M:%SZ") if isinstance(created, datetime) else str(created),
            "my_vote": my_vote}


def _item_exists(cur, item_type: str, item_id: int) -> bool:
    table, key = COMMENT_ITEMS[item_type]
    cur.execute(f"SELECT 1 AS found FROM {table} WHERE {key} = %s", (item_id,))
    return cur.fetchone() is not None


def get_comments(item_type: str, item_id: int, visitor: Optional[str] = None) -> Dict[str, Any]:
    """The comments of one news / blog / issue: the top-level ones newest first, each with its replies oldest first. `visitor` fills my_vote."""
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM comments WHERE item_type = %s AND item_id = %s AND parent_id IS NULL ORDER BY id DESC LIMIT %s",
                    (item_type, item_id, COMMENT_LIST_MAX))
        tops = cur.fetchall()
        cur.execute("SELECT COUNT(*) AS n FROM comments WHERE item_type = %s AND item_id = %s", (item_type, item_id))
        total = cur.fetchone()["n"]
        replies: Dict[int, List[Dict[str, Any]]] = {}
        votes: Dict[int, int] = {}
        if tops:
            marks = ", ".join(["%s"] * len(tops))
            ids = [r["id"] for r in tops]
            cur.execute(f"SELECT * FROM comments WHERE parent_id IN ({marks}) ORDER BY id ASC", ids)
            for r in cur.fetchall():
                replies.setdefault(r["parent_id"], []).append(r)
            if visitor:
                every = ids + [r["id"] for rs in replies.values() for r in rs]
                cur.execute(f"SELECT comment_id, vote FROM comment_votes WHERE visitor_hash = %s AND comment_id IN ({', '.join(['%s'] * len(every))})",
                            (_visitor_hash(visitor), *every))
                votes = {v["comment_id"]: v["vote"] for v in cur.fetchall()}
    comments = []
    for top in tops:
        one = _comment_json(top, votes.get(top["id"], 0))
        one["replies"] = [_comment_json(r, votes.get(r["id"], 0)) for r in replies.get(top["id"], [])]
        comments.append(one)
    return {"total": total, "comments": comments}


def add_comment(item_type: str, item_id: int, parent_id: Optional[int], commenter_id: int, name: str, body: str):
    """Saves one comment of a signed-in reader (`name` is theirs at this moment). Returns (comment, None), or (None, "item") when there is no such news / issue, or (None, "parent") when `parent_id`
    is not a comment of the same item. A reply to a reply is saved under that reply's top-level comment (replies are one level deep)."""
    with connection() as conn:
        cur = conn.cursor()
        if not _item_exists(cur, item_type, item_id):
            return None, "item"
        if parent_id is not None:
            cur.execute("SELECT id, parent_id, item_type, item_id FROM comments WHERE id = %s", (parent_id,))
            parent = cur.fetchone()
            if not parent or parent["item_type"] != item_type or parent["item_id"] != item_id:
                return None, "parent"
            parent_id = parent["parent_id"] or parent["id"]
        cur.execute("INSERT INTO comments (item_type, item_id, parent_id, commenter_id, name, body, created_at) VALUES (%s, %s, %s, %s, %s, %s, UTC_TIMESTAMP())",
                    (item_type, item_id, parent_id, commenter_id, name, body))
        cur.execute("SELECT * FROM comments WHERE id = %s", (cur.lastrowid,))
        comment = _comment_json(cur.fetchone())
        if parent_id is None:
            comment["replies"] = []
        return comment, None


def vote_comment(comment_id: int, visitor: str, vote: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """This visitor's vote on a comment: 1 like, -1 dislike, 0 takes it back, None only reads the counts. likes / dislikes change in the same
    transaction as the vote row. Returns {likes, dislikes, my_vote}, or None when there is no such comment."""
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT likes, dislikes FROM comments WHERE id = %s FOR UPDATE", (comment_id,))
        row = cur.fetchone()
        if row is None:
            return None
        who = _visitor_hash(visitor)
        cur.execute("SELECT vote FROM comment_votes WHERE comment_id = %s AND visitor_hash = %s FOR UPDATE", (comment_id, who))
        had = cur.fetchone()
        old = had["vote"] if had else 0
        likes, dislikes = row["likes"], row["dislikes"]
        if vote is not None and vote != old:
            if vote == 0:
                cur.execute("DELETE FROM comment_votes WHERE comment_id = %s AND visitor_hash = %s", (comment_id, who))
            elif had:
                cur.execute("UPDATE comment_votes SET vote = %s WHERE comment_id = %s AND visitor_hash = %s", (vote, comment_id, who))
            else:
                cur.execute("INSERT INTO comment_votes (comment_id, visitor_hash, vote) VALUES (%s, %s, %s)", (comment_id, who, vote))
            likes = max(0, likes + (vote == 1) - (old == 1))
            dislikes = max(0, dislikes + (vote == -1) - (old == -1))
            cur.execute("UPDATE comments SET likes = %s, dislikes = %s WHERE id = %s", (likes, dislikes, comment_id))
            old = vote
        return {"likes": likes, "dislikes": dislikes, "my_vote": old}


def report_comment(comment_id: int, visitor: str) -> bool:
    """Counts one report of a comment, once per visitor. Returns False when there is no such comment."""
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM comments WHERE id = %s FOR UPDATE", (comment_id,))
        if cur.fetchone() is None:
            return False
        cur.execute("INSERT IGNORE INTO comment_reports (comment_id, visitor_hash, created_at) VALUES (%s, %s, UTC_TIMESTAMP())",
                    (comment_id, _visitor_hash(visitor)))
        if cur.rowcount:
            cur.execute("UPDATE comments SET reports = reports + 1 WHERE id = %s", (comment_id,))
        return True


def admin_comments(only_reported: bool = False, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
    """The Admin Panel's list: every comment (and reply) with the news / issue it is under. Newest first, or - reported only - the most reported first."""
    slug = ", a.slug AS item_slug" if has_slug() else ""
    where = "WHERE c.reports > 0" if only_reported else ""
    order = "c.reports DESC, c.id DESC" if only_reported else "c.id DESC"
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(f"SELECT c.*, (SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.id) AS replies_count, "
                    f"IF(c.item_type = 'weekly', w.title, a.title) AS item_title, a.category AS item_category, u.email AS email, u.provider AS provider, u.mobile AS mobile{slug} "
                    "FROM comments c LEFT JOIN articles a ON c.item_type = 'article' AND a.id = c.item_id "
                    "LEFT JOIN weekly_editions w ON c.item_type = 'weekly' AND w.issue_no = c.item_id LEFT JOIN commenters u ON u.id = c.commenter_id "
                    f"{where} ORDER BY {order} LIMIT %s OFFSET %s", (limit, offset))
        rows = cur.fetchall()
        cur.execute("SELECT COUNT(*) AS total, COALESCE(SUM(reports > 0), 0) AS reported FROM comments")
        counts = cur.fetchone()
    comments = []
    for r in rows:
        one = _comment_json(r)
        one.pop("my_vote")
        one.update(item_type=r["item_type"], item_id=r["item_id"], item_title=r["item_title"] or "", item_category=r["item_category"],
                   item_slug=r.get("item_slug"), reports=r["reports"], replies_count=r["replies_count"], email=r["email"] or "", provider=r["provider"] or "", mobile=r["mobile"] or "")
        comments.append(one)
    return {"total": counts["total"], "reported_total": int(counts["reported"]), "comments": comments}


# -------------------------------------------------------------
# Admin login: wrong passwords per client address (shared by every worker process, and kept over a restart)
# -------------------------------------------------------------
def login_locked_for(address: str) -> int:
    """Seconds this address must still wait before it may try the admin password again (0 = it may)."""
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), locked_until) AS wait FROM login_failures WHERE address = %s", (address,))
        row = cur.fetchone()
    return max(0, int(row["wait"])) + 1 if row and row["wait"] is not None and row["wait"] >= 0 else 0


def login_failed(address: str) -> None:
    """One more wrong password from this address. The LOGIN_MAX_FAILURES-th wrong one locks it for LOGIN_LOCK_MINUTES; once the lock is over (or the
    count is older than that) the counting starts again from 1."""
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM login_failures WHERE first_at < UTC_TIMESTAMP() - INTERVAL 2 DAY AND (locked_until IS NULL OR locked_until < UTC_TIMESTAMP())")
        cur.execute("SELECT failures, TIMESTAMPDIFF(MINUTE, first_at, UTC_TIMESTAMP()) AS minutes, locked_until > UTC_TIMESTAMP() AS locked "
                    "FROM login_failures WHERE address = %s FOR UPDATE", (address,))
        row = cur.fetchone()
        if row and row["locked"]:
            return                                                    # (already locked: nothing is counted)
        fresh = row is None or row["failures"] >= config.LOGIN_MAX_FAILURES or row["minutes"] >= config.LOGIN_LOCK_MINUTES
        failures = 1 if fresh else row["failures"] + 1
        cur.execute("INSERT INTO login_failures (address, failures, first_at, locked_until) VALUES (%s, %s, UTC_TIMESTAMP(), NULL) "
                    "ON DUPLICATE KEY UPDATE failures = VALUES(failures), first_at = IF(%s, UTC_TIMESTAMP(), first_at), locked_until = NULL",
                    (address, failures, 1 if fresh else 0))
        if failures >= config.LOGIN_MAX_FAILURES:
            cur.execute("UPDATE login_failures SET locked_until = UTC_TIMESTAMP() + INTERVAL %s MINUTE WHERE address = %s", (config.LOGIN_LOCK_MINUTES, address))


def login_succeeded(address: str) -> None:
    with connection() as conn:
        conn.cursor().execute("DELETE FROM login_failures WHERE address = %s", (address,))


def login_unlock_all() -> int:
    """Lets every locked address try again (python manage.py unlock-login). Returns how many rows were cleared."""
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM login_failures")
        return cur.rowcount


def delete_comment(comment_id: int) -> bool:
    """Deletes a comment with its replies, their votes and their reports (the schema has no foreign keys: this is the cascade)."""
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM comments WHERE id = %s", (comment_id,))
        if cur.fetchone() is None:
            return False
        _delete_comment_rows(cur, "(c.id = %s OR c.parent_id = %s)", (comment_id, comment_id))
        return True


def _delete_comment_rows(cur, where: str, params: tuple) -> None:
    """The comments `c` that match `where` and everything that hangs on them: their reports, their votes, then the comments themselves.
    A reply goes with its top-level comment (one level only), so `where` names the top-level ones and their replies."""
    cur.execute(f"DELETE x FROM comment_reports x JOIN comments c ON c.id = x.comment_id WHERE {where}", params)
    cur.execute(f"DELETE x FROM comment_votes x JOIN comments c ON c.id = x.comment_id WHERE {where}", params)
    cur.execute(f"DELETE c FROM comments c WHERE {where}", params)


def _delete_item_comments(cur, item_type: str, item_id: int) -> None:
    """A news / blog / issue that is deleted takes its comments with it (same transaction)."""
    if has_comments():
        _delete_comment_rows(cur, "c.item_type = %s AND c.item_id = %s", (item_type, item_id))


# -------------------------------------------------------------
# Weekly editions CRUD
# -------------------------------------------------------------
def get_weekly_editions(limit: Optional[int] = None) -> List[Dict[str, Any]]:
    sql = "SELECT * FROM weekly_editions ORDER BY issue_no DESC"
    params: List[Any] = []
    if limit and limit > 0:
        sql += " LIMIT %s"
        params.append(limit)
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        return [_row(r) for r in cur.fetchall()]


def get_weekly_edition(issue_no: int) -> Optional[Dict[str, Any]]:
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM weekly_editions WHERE issue_no = %s", (issue_no,))
        return _row(cur.fetchone())


def create_weekly_edition(data: Dict[str, Any]) -> int:
    """Add an issue; saving an issue number that already exists replaces that issue."""
    issue_no = int(data.get("issue_no", 0))
    pdf_filename = _text(data, "pdf_filename") or f"lokmangal-weekly-{issue_no}.pdf"
    english = WEEKLY_EN if has_english() else ()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(
            f"""REPLACE INTO weekly_editions (issue_no, `date`, title, image, pdf_filename, views, description{"".join(f", {c}" for c in english)})
               VALUES ({", ".join(["%s"] * (7 + len(english)))})""",
            (
                issue_no,
                _text(data, "date"),
                _text(data, "title"),
                _text(data, "image", DEFAULT_IMAGE),
                pdf_filename,
                _text(data, "views", "12K"),
                _text(data, "description"),
                *(_text(data, c) for c in english),
            ),
        )
        return cur.lastrowid


def delete_weekly_edition(issue_no: int) -> bool:
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM weekly_editions WHERE issue_no = %s", (issue_no,))
        deleted = cur.rowcount > 0
        if deleted:
            _delete_item_comments(cur, "weekly", issue_no)
        return deleted


# -------------------------------------------------------------
# Videos (Admin Panel > Videos -> the website's "Featured Videos" widget)
# -------------------------------------------------------------
def _video_number(value: Any) -> Optional[int]:
    """'' / None -> NULL (not known); otherwise a whole number."""
    return None if value is None or str(value).strip() == "" else int(value)


def _renumber(cur, table: str, move_id: Optional[int] = None, position: Optional[int] = None) -> None:
    """Number the rows of `table` (videos / ads) 1..N in their current order (numbered ones by their number, the rest newest first).
    `move_id` is first put at `position` (1 = the very top; a number beyond the end = the last place). `table` is always a constant."""
    cur.execute(f"SELECT id FROM {table} ORDER BY (sort_order IS NULL), sort_order, id DESC")
    ids = [r["id"] for r in cur.fetchall()]
    if move_id is not None and move_id in ids:
        ids.remove(move_id)
        ids.insert(max(0, min(len(ids), (position or 1) - 1)), move_id)
    for number, row_id in enumerate(ids, start=1):
        cur.execute(f"UPDATE {table} SET sort_order = %s WHERE id = %s AND (sort_order IS NULL OR sort_order != %s)", (number, row_id, number))


def _renumber_videos(cur, move_id: Optional[int] = None, position: Optional[int] = None) -> None:
    _renumber(cur, "videos", move_id, position)


def get_videos(limit: Optional[int] = None) -> List[Dict[str, Any]]:
    ensure_videos_table()
    sql = "SELECT * FROM videos ORDER BY (sort_order IS NULL), sort_order, id DESC"
    params: List[Any] = []
    if limit and limit > 0:
        sql += " LIMIT %s"
        params.append(limit)
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        return [_row(r) for r in cur.fetchall()]


def get_video(video_id: int) -> Optional[Dict[str, Any]]:
    ensure_videos_table()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM videos WHERE id = %s", (video_id,))
        return _row(cur.fetchone())


def get_video_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    ensure_videos_table()
    if not _videos_state["slug"]:
        return None
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM videos WHERE slug = %s LIMIT 1", (slug,))
        return _row(cur.fetchone())


def create_video(data: Dict[str, Any]) -> int:
    ensure_videos_table()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO videos (title, title_en, description, description_en, video_url, thumbnail, duration_sec, size_bytes)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (*(_text(data, c) for c in VIDEO_TEXT), *(_video_number(data.get(c)) for c in VIDEO_NUMBERS)),
        )
        new_id = cur.lastrowid
        if _videos_state["slug"]:                                    # the words of its own address, from the title it is uploaded with
            words = _free_slug(cur, slugs.make(data.get("title_en"), data.get("title"), "video"), new_id, table="videos")
            cur.execute("UPDATE videos SET slug = %s WHERE id = %s", (words, new_id))
        _renumber_videos(cur, new_id, _video_number(data.get("sort_order")) or 1)      # a new video goes to the top unless a place is given
        return new_id


def update_video(video_id: int, data: Dict[str, Any]) -> bool:
    """Change the fields that came with the request (a video file is replaced by sending a new video_url)."""
    ensure_videos_table()
    fields: List[str] = []
    values: List[Any] = []
    for key in (*VIDEO_TEXT, *VIDEO_NUMBERS):
        if key in data:
            fields.append(f"`{key}` = %s")
            values.append(_video_number(data[key]) if key in VIDEO_NUMBERS else _text(data, key))
    position = _video_number(data.get("sort_order"))
    if not fields and position is None:
        return False
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM videos WHERE id = %s", (video_id,))
        if cur.fetchone() is None:
            return False
        if fields:
            cur.execute(f"UPDATE videos SET {', '.join(fields)} WHERE id = %s", values + [video_id])
        if position is not None:
            _renumber_videos(cur, video_id, position)          # the video takes that place, the others move over
        return True


def delete_video(video_id: int) -> Optional[Dict[str, Any]]:
    """Remove the row; returns it (the caller deletes the files it pointed to), or None when there is no such video."""
    ensure_videos_table()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM videos WHERE id = %s", (video_id,))
        row = _row(cur.fetchone())
        if row is None:
            return None
        cur.execute("DELETE FROM videos WHERE id = %s", (video_id,))
        _renumber_videos(cur)                                   # no gap is left in the numbers
        return row


VIDEOS_DATA_FIELDS = ("id", "title", "title_en", "description", "description_en", "video_url", "thumbnail", "duration_sec", "size_bytes",
                      "sort_order", "created_at", "slug")


def publish_videos_file() -> bool:
    """Keep frontend/js/videos-data.js equal to the videos table. A static host has no backend, so the website shows the videos
    from this file there; with a backend the website asks /api/videos instead. Only videos that are LINKS (YouTube / the https address of
    a file) go in. Written only when something changed (and only when PUBLISH_VIDEOS_FILE is on - a development PC). Returns True when it was rewritten."""
    if not config.PUBLISH_VIDEOS_FILE:
        return False
    rows = [{k: v.get(k) for k in VIDEOS_DATA_FIELDS} for v in get_videos() if re.match(r"https?://", v["video_url"] or "")]
    return _write_js_data(
        "videos-data.js", "window.VIDEOS_DATA", rows,
        "// Written by the backend (Admin Panel > Videos) after every change - do not edit by hand.\n"
        "// The website shows these videos where it has no backend (a static host); with a backend it asks /api/videos instead.\n")


def _write_js_data(filename: str, variable: str, rows: Any, header: str) -> bool:
    """Write frontend/js/<filename> = `variable = rows;` (rows: a list, or one dict; only when the text changed). True when it was rewritten."""
    text = header + variable + " = " + json.dumps(rows, ensure_ascii=False, indent=2) + ";\n"
    path = config.FRONTEND_DIR / "js" / filename
    try:
        if path.is_file() and path.read_text(encoding="utf-8") == text:
            return False
        temp = path.with_name(path.name + ".part")
        temp.write_text(text, encoding="utf-8", newline="\n")
        os.replace(temp, path)
        return True
    except OSError:                                     # a read-only / missing frontend folder (API-only hosting): nothing to keep in step
        return False


def upload_in_use(url: str, except_video: Optional[int] = None, except_ad: Optional[int] = None) -> bool:
    """True when a video or an ad (other than the one being changed) still points to this file / picture (then the file must stay)."""
    ensure_videos_table()
    ensure_ads_table()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS n FROM videos WHERE (video_url = %s OR thumbnail = %s) AND id != %s",
                    (url, url, -1 if except_video is None else except_video))
        if cur.fetchone()["n"]:
            return True
        cur.execute("SELECT COUNT(*) AS n FROM ads WHERE (media_url = %s OR thumbnail = %s) AND id != %s",
                    (url, url, -1 if except_ad is None else except_ad))
        return cur.fetchone()["n"] > 0


# -------------------------------------------------------------
# Ads (Admin Panel > Advertisements -> the website's "जाहिरात" slider: a photo or a video, one after the other)
# -------------------------------------------------------------
def get_ads(limit: Optional[int] = None) -> List[Dict[str, Any]]:
    ensure_ads_table()
    sql = "SELECT * FROM ads ORDER BY (sort_order IS NULL), sort_order, id DESC"
    params: List[Any] = []
    if limit and limit > 0:
        sql += " LIMIT %s"
        params.append(limit)
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        return [_row(r) for r in cur.fetchall()]


def get_ad(ad_id: int) -> Optional[Dict[str, Any]]:
    ensure_ads_table()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM ads WHERE id = %s", (ad_id,))
        return _row(cur.fetchone())


def create_ad(data: Dict[str, Any]) -> int:
    ensure_ads_table()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO ads (media_type, title, title_en, media_url, thumbnail, link_url, duration_sec, size_bytes)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (*(_text(data, c) for c in AD_TEXT), *(_video_number(data.get(c)) for c in AD_NUMBERS)),
        )
        new_id = cur.lastrowid
        _renumber(cur, "ads", new_id, _video_number(data.get("sort_order")) or 1)       # a new ad goes first unless a place is given
        return new_id


def update_ad(ad_id: int, data: Dict[str, Any]) -> bool:
    """Change the fields that came with the request (a file is replaced by sending a new media_url)."""
    ensure_ads_table()
    fields: List[str] = []
    values: List[Any] = []
    for key in (*AD_TEXT, *AD_NUMBERS):
        if key in data:
            fields.append(f"`{key}` = %s")
            values.append(_video_number(data[key]) if key in AD_NUMBERS else _text(data, key))
    position = _video_number(data.get("sort_order"))
    if not fields and position is None:
        return False
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM ads WHERE id = %s", (ad_id,))
        if cur.fetchone() is None:
            return False
        if fields:
            cur.execute(f"UPDATE ads SET {', '.join(fields)} WHERE id = %s", values + [ad_id])
        if position is not None:
            _renumber(cur, "ads", ad_id, position)
        return True


def delete_ad(ad_id: int) -> Optional[Dict[str, Any]]:
    """Remove the row; returns it (the caller deletes the files it pointed to), or None when there is no such ad."""
    ensure_ads_table()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM ads WHERE id = %s", (ad_id,))
        row = _row(cur.fetchone())
        if row is None:
            return None
        cur.execute("DELETE FROM ads WHERE id = %s", (ad_id,))
        _renumber(cur, "ads")
        return row


ADS_DATA_FIELDS = ("id", "media_type", "title", "title_en", "media_url", "thumbnail", "link_url", "duration_sec", "sort_order", "created_at")


def publish_ads_file() -> bool:
    """Keep frontend/js/ads-data.js equal to the ads table (the website shows the ads from it where it has no backend - a static host).
    A video that was uploaded here is a file of this server, not of the static host: only photos and video LINKS go in."""
    if not config.PUBLISH_VIDEOS_FILE:                  # (only a development PC keeps the frontend folder in step)
        return False
    rows = [{k: a[k] for k in ADS_DATA_FIELDS} for a in get_ads()
            if a["media_type"] == "image" or re.match(r"https?://", a["media_url"] or "")]
    return _write_js_data(
        "ads-data.js", "window.ADS_DATA", rows,
        "// Written by the backend (Admin Panel > Advertisements) after every change - do not edit by hand.\n"
        "// The website shows these ads where it has no backend (a static host); with a backend it asks /api/ads instead.\n")


# -------------------------------------------------------------
# Site settings (Admin Panel > Footer -> the website's footer "कार्यालय संपर्क": address, phone, e-mail)
# -------------------------------------------------------------
def get_settings() -> Dict[str, Any]:
    ensure_settings_table()
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(f"SELECT {', '.join(SETTINGS_FIELDS)}, updated_at FROM site_settings WHERE id = 1")
        row = _row(cur.fetchone())
    return row or {**{f: "" for f in SETTINGS_FIELDS}, "updated_at": None}


def update_settings(data: Dict[str, Any]) -> Dict[str, Any]:
    """Change the fields that came with the request (an empty text clears that detail: the website then does not show it)."""
    ensure_settings_table()
    fields = [f for f in SETTINGS_FIELDS if f in data]
    if fields:
        with connection() as conn:
            cur = conn.cursor()
            cur.execute("INSERT IGNORE INTO site_settings (id) VALUES (1)")               # (the row was deleted by hand: it is made again)
            cur.execute(f"UPDATE site_settings SET {', '.join(f'`{f}` = %s' for f in fields)} WHERE id = 1", [_text(data, f) for f in fields])
    return get_settings()


def publish_settings_file() -> bool:
    """Keep frontend/js/settings-data.js equal to the site_settings row (the website shows the footer details from it where it has no backend -
    a static host; with a backend it asks /api/settings instead). Written only when something changed."""
    current = get_settings()
    return _write_js_data(
        "settings-data.js", "window.SITE_SETTINGS", {f: current[f] for f in SETTINGS_FIELDS},
        "// Written by the backend (Admin Panel > Footer) after every change - do not edit by hand.\n"
        "// The website shows these footer details where it has no backend (a static host); with a backend it asks /api/settings instead.\n")


# -------------------------------------------------------------
# Dashboard statistics
# -------------------------------------------------------------
def get_stats() -> Dict[str, Any]:
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """SELECT COUNT(*) AS total_articles,
                      COUNT(CASE WHEN category = 'rajkiy'  THEN 1 END) AS total_rajkiy,
                      COUNT(CASE WHEN category = 'samajik' THEN 1 END) AS total_samajik,
                      COUNT(CASE WHEN category = 'blogs'   THEN 1 END) AS total_blogs,
                      COUNT(CASE WHEN category IN ('review', 'reviews') THEN 1 END) AS total_reviews,
                      COUNT(CASE WHEN is_popular = 1       THEN 1 END) AS total_popular,
                      COUNT(CASE WHEN is_random = 1        THEN 1 END) AS total_random
               FROM articles"""
        )
        stats = cur.fetchone()

        cur.execute("SELECT COUNT(*) AS n FROM weekly_editions")
        stats["total_weekly"] = cur.fetchone()["n"]

        cur.execute("SELECT id, title, image, categoryLabel FROM articles WHERE is_lead = 1 ORDER BY id DESC LIMIT 1")
        stats["current_lead"] = _row(cur.fetchone())

        cur.execute("""SELECT id, title, category, categoryLabel, `date`, views, image, is_lead, is_popular, is_random
                       FROM articles ORDER BY id DESC LIMIT 5""")
        stats["recent_articles"] = [_row(r) for r in cur.fetchall()]

        cur.execute("""SELECT issue_no, `date`, title, views, image, pdf_filename
                       FROM weekly_editions ORDER BY issue_no DESC LIMIT 5""")
        stats["recent_weekly"] = [_row(r) for r in cur.fetchall()]
        return stats


# -------------------------------------------------------------
# Bulk import (used by seed_data.py and migrate_sqlite_to_mysql.py)
# -------------------------------------------------------------
def _import(table: str, columns: Iterable[str], rows: Iterable[Dict[str, Any]]) -> int:
    """REPLACE every row into `table`, keeping its id and created_at. Missing text values become ''."""
    nullable = {"description", "created_at", "id"}
    count = 0
    with connection() as conn:
        cur = conn.cursor()
        for row in rows:
            values = {}
            for col in columns:
                val = row.get(col)
                if val is None and col not in nullable and not col.startswith("is_"):
                    val = ""
                if val is not None:
                    values[col] = val
            names = ", ".join(f"`{c}`" for c in values)
            marks = ", ".join(["%s"] * len(values))
            cur.execute(f"REPLACE INTO {table} ({names}) VALUES ({marks})", list(values.values()))
            count += 1
    return count


def import_articles(rows: Iterable[Dict[str, Any]]) -> int:
    columns = ARTICLE_COLUMNS + (ARTICLE_EN if has_english() else ())       # (English text comes along when the columns exist)
    rows = list(rows)
    if has_updated():
        # one common stamp for the whole import: the rows keep the order they were given (a second boundary must not reorder them)
        stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        rows = [{"updated_at": stamp, **row} for row in rows]
        columns += ("updated_at",)
    return _import("articles", columns, rows)


def import_weekly(rows: Iterable[Dict[str, Any]]) -> int:
    return _import("weekly_editions", WEEKLY_COLUMNS + (WEEKLY_EN if has_english() else ()), rows)


def fill_english(articles: Iterable[Dict[str, Any]], weekly: Iterable[Dict[str, Any]]) -> Dict[str, int]:
    """Give rows that ALREADY exist their English text (the sample data in seed/*.json has it): matched by id / issue number, and
    only English fields that are still EMPTY are filled - nothing typed in the Admin Panel is overwritten, no row is added.
    Returns how many news items / issues got English text (0 / 0 when the English columns are missing)."""
    done = {"articles": 0, "weekly_editions": 0}
    if not has_english():
        return done
    jobs = (("articles", "id", ARTICLE_EN, articles), ("weekly_editions", "issue_no", WEEKLY_EN, weekly))
    with connection() as conn:
        cur = conn.cursor()
        for table, key, columns, rows in jobs:
            cur.execute(f"SELECT `{key}`, {', '.join(f'`{c}`' for c in columns)} FROM {table}")
            current = {r[key]: r for r in cur.fetchall()}
            for row in rows:
                have = current.get(row.get(key))
                if have is None:
                    continue
                fill = {c: row[c] for c in columns if str(row.get(c) or "").strip() and not str(have.get(c) or "").strip()}
                if fill:
                    cur.execute(f"UPDATE {table} SET {', '.join(f'`{c}` = %s' for c in fill)} WHERE `{key}` = %s", [*fill.values(), row[key]])
                    done[table] += 1
    return done


def count_rows(table: str) -> int:
    if table not in ("articles", "weekly_editions"):
        raise ValueError(f"unknown table: {table}")
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) AS n FROM {table}")
        return cur.fetchone()["n"]
