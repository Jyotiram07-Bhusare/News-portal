"""One-time copy of the old SQLite database (legacy/portal.db) into MySQL.

    python migrate_sqlite_to_mysql.py                  copy legacy/portal.db
    python migrate_sqlite_to_mysql.py --sqlite FILE    copy another SQLite file

Rows keep their id, issue number and created_at. Running it twice is harmless:
rows are replaced, nothing else is deleted. Run "python init_db.py" first.
"""
import argparse
import sqlite3
import sys
from pathlib import Path

import pymysql

import config
import database


def _read(conn, table, columns):
    present = [r[1] for r in conn.execute(f"PRAGMA table_info({table})")]
    cols = [c for c in columns if c in present]
    return [dict(zip(cols, r)) for r in conn.execute(f"SELECT {', '.join(cols)} FROM {table}")]


def main():
    parser = argparse.ArgumentParser(description="Copy the old SQLite database into MySQL.")
    parser.add_argument("--sqlite", type=Path, default=config.LEGACY_SQLITE, help="SQLite file to read")
    args = parser.parse_args()

    if not args.sqlite.is_file():
        sys.exit(f"SQLite file not found: {args.sqlite}")

    source = sqlite3.connect(f"{args.sqlite.resolve().as_uri()}?mode=ro", uri=True)    # read-only
    try:
        articles = _read(source, "articles", database.ARTICLE_COLUMNS)
        weekly = _read(source, "weekly_editions", database.WEEKLY_COLUMNS)
    finally:
        source.close()
    print(f"Read from {args.sqlite.name}: {len(articles)} articles, {len(weekly)} weekly issues")

    try:
        database.import_articles(articles)
        database.import_weekly(weekly)
        print(f"MySQL '{config.DB_NAME}' now holds: {database.count_rows('articles')} articles, "
              f"{database.count_rows('weekly_editions')} weekly issues")
    except pymysql.MySQLError as e:
        sys.exit(f"FAILED: {e}\nDid you run 'python init_db.py' first?")


if __name__ == "__main__":
    main()
