"""Load the sample content (seed/articles.json and seed/weekly.json) into MySQL.

    python seed_data.py            only into tables that are still empty
    python seed_data.py --force    also overwrite rows that have the same id / issue number
    python seed_data.py --english  only give the sample rows that are already in the database their English text (where it is empty)
"""
import argparse
import json

import config
import database


def _load(name):
    return json.loads((config.SEED_DIR / name).read_text(encoding="utf-8"))


def seed(force=False):
    jobs = (
        ("articles", "articles.json", database.import_articles),
        ("weekly_editions", "weekly.json", database.import_weekly),
    )
    for table, filename, import_rows in jobs:
        existing = database.count_rows(table)
        if existing and not force:
            print(f"{table}: already holds {existing} rows - skipped (use --force to overwrite)")
            continue
        print(f"{table}: {import_rows(_load(filename))} rows loaded")


def fill_english():
    """The sample news / issues that are already in the database get the English text of seed/*.json (empty English fields only)."""
    return database.fill_english(_load("articles.json"), _load("weekly.json"))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load the sample articles and weekly issues into MySQL.")
    parser.add_argument("--force", action="store_true", help="overwrite rows that already exist")
    parser.add_argument("--english", action="store_true", help="only add the English text to the sample rows that already exist")
    args = parser.parse_args()
    if args.english:
        done = fill_english()
        print(f"English text added to {done['articles']} news items and {done['weekly_editions']} weekly issues")
    else:
        seed(args.force)
