"""MySQL data layer: articles and weekly editions.

Port of the old SQLite module (data/database.py): same functions, same results, MySQL underneath.
Each call borrows its own connection from a small pool (never shared between threads), so it is thread-safe.
"""
import queue
from contextlib import contextmanager
from datetime import datetime
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


# -------------------------------------------------------------
# Connection
# -------------------------------------------------------------
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
    )


POOL_SIZE = 5
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

    column = {"lead": "is_lead", "popular": "is_popular", "random": "is_random"}.get(placement or "")
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

    with connection() as conn:
        cur = conn.cursor()
        if is_lead:
            cur.execute("UPDATE articles SET is_lead = 0")     # only one Lead Story at a time
        cur.execute(
            """INSERT INTO articles
                   (title, category, categoryLabel, author, `date`, image, excerpt, content, views,
                    is_lead, is_popular, is_random)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
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
                *PLACEMENT_FIELDS):
        if key in data:
            fields.append(f"`{key}` = %s")
            values.append(_flag(data[key]) if key in PLACEMENT_FIELDS else data[key])
    if not fields:
        return False

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
    if field not in PLACEMENT_FIELDS:
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
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(
            """REPLACE INTO weekly_editions (issue_no, `date`, title, image, pdf_filename, views, description)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (
                issue_no,
                _text(data, "date"),
                _text(data, "title"),
                _text(data, "image", DEFAULT_IMAGE),
                pdf_filename,
                _text(data, "views", "12K"),
                _text(data, "description"),
            ),
        )
        return cur.lastrowid


def delete_weekly_edition(issue_no: int) -> bool:
    with connection() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM weekly_editions WHERE issue_no = %s", (issue_no,))
        return cur.rowcount > 0


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
    return _import("articles", ARTICLE_COLUMNS, rows)


def import_weekly(rows: Iterable[Dict[str, Any]]) -> int:
    return _import("weekly_editions", WEEKLY_COLUMNS, rows)


def count_rows(table: str) -> int:
    if table not in ("articles", "weekly_editions"):
        raise ValueError(f"unknown table: {table}")
    with connection() as conn:
        cur = conn.cursor()
        cur.execute(f"SELECT COUNT(*) AS n FROM {table}")
        return cur.fetchone()["n"]
