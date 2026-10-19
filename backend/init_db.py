"""Create the MySQL database and its tables. Safe to run again - nothing is dropped or overwritten.

    python init_db.py            create the database + tables (articles, weekly_editions, videos; an older database also gets the English columns
                                 and updated_at, and the sample news / issues that exist get their English text - only where it is still empty)
    python init_db.py --seed     ... and load the sample content (seed/*.json) when the tables are empty
"""
import argparse
import sys

import pymysql

import config
import database
import seed_data


def create_database():
    conn = database.connect(with_database=False)
    try:
        name = config.DB_NAME.replace("`", "``")
        conn.cursor().execute(
            f"CREATE DATABASE IF NOT EXISTS `{name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
        conn.commit()
    finally:
        conn.close()


def create_tables():
    with database.connection() as conn:
        cur = conn.cursor()
        for statement in database.schema_statements():
            cur.execute(statement)


def add_missing_columns():
    """An older database lacks the English columns / updated_at: add them (nothing is dropped or changed). Returns the names added."""
    added = []
    with database.connection() as conn:
        cur = conn.cursor()
        for spec in (database.ENGLISH_COLUMNS, database.UPDATED_COLUMNS):
            for table, columns in spec.items():
                cur.execute("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s",
                            (config.DB_NAME, table))
                have = {r["COLUMN_NAME"] for r in cur.fetchall()}
                for name, ddl in columns:
                    if name not in have:
                        cur.execute(f"ALTER TABLE `{table}` ADD COLUMN `{name}` {ddl}")
                        added.append(f"{table}.{name}")
    database._english_state.update(ok=False, checked=0.0)        # a running backend in this process looks again
    database._updated_state.update(ok=False, checked=0.0)
    return added


def main():
    parser = argparse.ArgumentParser(description="Create the Lokmangal MySQL database and tables.")
    parser.add_argument("--seed", action="store_true", help="also load the sample content when the tables are empty")
    args = parser.parse_args()

    print(f"MySQL  {config.DB_USER}@{config.DB_HOST}:{config.DB_PORT}  database '{config.DB_NAME}'")
    try:
        create_database()
        create_tables()
        added = add_missing_columns()
    except pymysql.MySQLError as e:
        print(f"\nFAILED: {e}\nCheck that the MySQL service is running and that DB_* in backend/.env are correct.")
        sys.exit(1)
    print("Database and tables are ready.")
    if added:
        print("Columns added: " + ", ".join(added))
    try:
        filled = seed_data.fill_english()       # the sample news / issues that exist get their English text (empty English fields only)
    except pymysql.MySQLError as e:
        print(f"English text of the sample content could not be added: {e}")
    else:
        if filled["articles"] or filled["weekly_editions"]:
            print(f"English text added to {filled['articles']} news items and {filled['weekly_editions']} weekly issues")

    if args.seed:
        seed_data.seed()


if __name__ == "__main__":
    main()
