"""Create the MySQL database and its tables. Safe to run again - nothing is dropped or overwritten.

    python init_db.py            create the database + tables
    python init_db.py --seed     ... and load the sample content (seed/*.json) when the tables are empty
"""
import argparse
import sys

import pymysql

import config
import database


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
    sql = config.SCHEMA_FILE.read_text(encoding="utf-8")
    sql = "\n".join(line for line in sql.splitlines() if not line.strip().startswith("--"))
    with database.connection() as conn:
        cur = conn.cursor()
        for statement in (s.strip() for s in sql.split(";")):
            if statement:
                cur.execute(statement)


def main():
    parser = argparse.ArgumentParser(description="Create the Lokmangal MySQL database and tables.")
    parser.add_argument("--seed", action="store_true", help="also load the sample content when the tables are empty")
    args = parser.parse_args()

    print(f"MySQL  {config.DB_USER}@{config.DB_HOST}:{config.DB_PORT}  database '{config.DB_NAME}'")
    try:
        create_database()
        create_tables()
    except pymysql.MySQLError as e:
        print(f"\nFAILED: {e}\nCheck that the MySQL service is running and that DB_* in backend/.env are correct.")
        sys.exit(1)
    print("Database and tables are ready.")

    if args.seed:
        import seed_data
        seed_data.seed()


if __name__ == "__main__":
    main()
