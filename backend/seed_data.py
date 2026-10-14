"""Load the sample content (seed/articles.json and seed/weekly.json) into MySQL.

    python seed_data.py            only into tables that are still empty
    python seed_data.py --force    also overwrite rows that have the same id / issue number
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load the sample articles and weekly issues into MySQL.")
    parser.add_argument("--force", action="store_true", help="overwrite rows that already exist")
    seed(parser.parse_args().force)
