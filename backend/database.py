"""MySQL data layer: articles and weekly editions.

Port of the old SQLite module (data/database.py): same functions, same results, MySQL underneath.
Each call borrows its own connection from a small pool (never shared between threads), so it is thread-safe.
"""
import json
import os
import queue
import re
import threading
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional

import pymysql
from pymysql.constants import CLIENT
from pymysql.cursors import DictCursor

import config

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


_videos_state = {"ok": False}


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
        cur.execute("SELECT COUNT(*) AS n FROM videos WHERE sort_order IS NULL")
        if cur.fetchone()["n"]:
            _renumber_videos(cur)                                                    # old rows get 1..N, newest first
    _videos_state["ok"] = True


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

    column = {"lead": "is_lead", "popular": "is_popular", "random": "is_random", "latest": "is_latest" if has_latest() else None}.get(placement or "")
    if column:
        sql += f" AND {column} = 1"

    if search:
        sql += " AND (title LIKE %s OR excerpt LIKE %s OR content LIKE %s OR author LIKE %s)"
        params.extend([_like(search)] * 4)

    sql += " ORDER BY id DESC"
    if limit and limit > 0:
        sql += " LIMIT %s"
        params.append(limit)

    with connection() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        return [_row(r) for r in cur.fetchall()]


def get_article(article_id: int) -> Optional[Dict[str, Any]]:
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM articles WHERE id = %s", (article_id,))
        return _row(cur.fetchone())


def create_article(data: Dict[str, Any]) -> int:
    category = _text(data, "category", "rajkiy")
    category_label = _text(data, "categoryLabel") or CATEGORY_LABELS.get(category, DEFAULT_CATEGORY_LABEL)
    is_lead, is_popular, is_random = (_flag(data.get(f, 0)) for f in PLACEMENT_FIELDS)
    english = ARTICLE_EN if has_english() else ()
    latest = ("is_latest",) if has_latest() else ()

    with connection() as conn:
        cur = conn.cursor()
        if is_lead:
            cur.execute("UPDATE articles SET is_lead = 0")     # only one Lead Story at a time
        cur.execute(
            f"""INSERT INTO articles
                   (title, category, categoryLabel, author, `date`, image, excerpt, content, views,
                    is_lead, is_popular, is_random{"".join(f", {c}" for c in (*english, *latest))})
               VALUES ({", ".join(["%s"] * (12 + len(english) + len(latest)))})""",
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
                *((_flag(data.get("is_latest", 1)),) if latest else ()),        # (listed in Latest News unless the form says no)
            ),
        )
        return cur.lastrowid


def update_article(article_id: int, data: Dict[str, Any]) -> bool:
    data = dict(data)
    if data.get("category") and not data.get("categoryLabel"):
        data["categoryLabel"] = CATEGORY_LABELS.get(data["category"], DEFAULT_CATEGORY_LABEL)

    fields: List[str] = []
    values: List[Any] = []
    for key in ("title", "category", "categoryLabel", "author", "date", "image", "excerpt", "content", "views",
                *PLACEMENT_FIELDS, *(("is_latest",) if has_latest() else ()), *(ARTICLE_EN if has_english() else ())):
        if key in data:
            fields.append(f"`{key}` = %s")
            values.append(_flag(data[key]) if key in (*PLACEMENT_FIELDS, "is_latest") else data[key])
    if not fields:
        return False
    if has_updated():
        fields.append("`updated_at` = CURRENT_TIMESTAMP")       # saved = the newest: the website lists it first

    with connection() as conn:
        cur = conn.cursor()
        cur.execute("SELECT id FROM articles WHERE id = %s", (article_id,))
        if cur.fetchone() is None:
            return False                                        # nothing is touched for an unknown id
        if _flag(data.get("is_lead", "")):
            cur.execute("UPDATE articles SET is_lead = 0 WHERE id != %s", (article_id,))
        cur.execute(f"UPDATE articles SET {', '.join(fields)} WHERE id = %s", values + [article_id])
        return True


def toggle_placement(article_id: int, field: str, value: Any = None) -> Optional[Dict[str, Any]]:
    """Turn one placement flag (is_lead / is_popular / is_random) on or off; returns the updated article."""
    if field not in (*PLACEMENT_FIELDS, *(("is_latest",) if has_latest() else ())):
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
        cur.execute("SELECT * FROM articles WHERE id = %s", (article_id,))
        article = cur.fetchone()
        if article is None:                                     # deleted by someone else in the meantime
            conn.rollback()
            return None
        return _row(article)


def delete_article(article_id: int) -> bool:
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM articles WHERE id = %s", (article_id,))
        return cur.rowcount > 0


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
        return cur.rowcount > 0


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
                      "sort_order", "created_at")


def publish_videos_file() -> bool:
    """Keep frontend/js/videos-data.js equal to the videos table. A static host has no backend, so the website shows the videos
    from this file there; with a backend the website asks /api/videos instead. Only videos that are LINKS (YouTube / the https address of
    a file) go in. Written only when something changed (and only when PUBLISH_VIDEOS_FILE is on - a development PC). Returns True when it was rewritten."""
    if not config.PUBLISH_VIDEOS_FILE:
        return False
    rows = [{k: v[k] for k in VIDEOS_DATA_FIELDS} for v in get_videos() if re.match(r"https?://", v["video_url"] or "")]
    return _write_js_data(
        "videos-data.js", "window.VIDEOS_DATA", rows,
        "// Written by the backend (Admin Panel > Videos) after every change - do not edit by hand.\n"
        "// The website shows these videos where it has no backend (a static host); with a backend it asks /api/videos instead.\n")


def _write_js_data(filename: str, variable: str, rows: List[Dict[str, Any]], header: str) -> bool:
    """Write frontend/js/<filename> = `variable = rows;` (only when the text changed). True when it was rewritten."""
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
