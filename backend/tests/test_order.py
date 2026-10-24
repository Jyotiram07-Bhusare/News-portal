"""The place number ("क्रम क्रमांक"): cleaned like every other field, empty = not placed by hand (a Review story).
News and blogs are numbered by their publication date instead, newest first: see the _date_order tests at the end."""
import pytest

import database

BASE = {"title": "t", "category": "review", "author": "a", "date": "d", "excerpt": "e", "content": "<p>c</p>", "image": "assets/images/a.jpg"}


def test_place_number_is_kept_as_a_number(client, admin, db):
    made = client.post("/api/articles", headers=admin, json={**BASE, "sort_order": "3"})
    assert made.status_code == 201 and made.get_json()["article"]["sort_order"] == 3
    article_id = made.get_json()["article"]["id"]
    assert client.put(f"/api/articles/{article_id}", headers=admin, json={"sort_order": 1}).get_json()["article"]["sort_order"] == 1


def test_empty_place_number_means_not_placed_by_hand(client, admin, db):
    for empty in ("", None, "  "):
        made = client.post("/api/articles", headers=admin, json={**BASE, "sort_order": empty})
        assert made.status_code == 201 and made.get_json()["article"]["sort_order"] is None
    article_id = client.post("/api/articles", headers=admin, json={**BASE, "sort_order": 2}).get_json()["article"]["id"]
    cleared = client.put(f"/api/articles/{article_id}", headers=admin, json={"sort_order": ""})
    assert cleared.get_json()["article"]["sort_order"] is None


def test_an_update_without_the_number_leaves_it_alone(client, admin, db):
    article_id = client.post("/api/articles", headers=admin, json={**BASE, "sort_order": 4}).get_json()["article"]["id"]
    client.put(f"/api/articles/{article_id}", headers=admin, json={"title": "new title"})
    assert db.articles[article_id]["sort_order"] == 4 and db.articles[article_id]["title"] == "new title"


@pytest.mark.parametrize("bad", ["abc", "0", "-1", "10000", "1.5", "<b>1</b>"])
def test_bad_place_numbers_are_refused(client, admin, bad):
    assert client.post("/api/articles", headers=admin, json={**BASE, "sort_order": bad}).status_code == 400


# ---- news and blogs are numbered by their publication date, newest first (like the weekly issues)
def test_news_and_blogs_are_numbered_by_date():
    assert set(database.AUTO_NUMBERED) == {"rajkiy", "samajik", "blogs"}


def test_the_newest_date_comes_first_and_the_same_date_the_later_added():
    rows = [
        {"id": 1, "date": "०९ ऑक्टोबर २०२६", "created_at": "2026-10-09 10:00:00"},
        {"id": 2, "date": "24 October 2026", "created_at": "2026-10-01 10:00:00"},     # (added earlier, for a newer day)
        {"id": 3, "date": "१२ ऑक्टोबर २०२६", "created_at": "2026-10-12 10:00:00"},
        {"id": 4, "date": "१२ ऑक्टोबर २०२६", "created_at": "2026-10-12 11:00:00"},
    ]
    assert database._date_order(rows) == [2, 4, 3, 1]


def test_an_unreadable_date_counts_as_the_day_the_story_was_added():
    rows = [
        {"id": 1, "date": "१० ऑक्टोबर २०२६", "created_at": "2026-10-10 09:00:00"},
        {"id": 2, "date": "आज", "created_at": "2026-10-11 09:00:00"},
        {"id": 3, "date": "", "created_at": None},                                       # (nothing to go by: on top, never lost at the bottom)
    ]
    assert database._date_order(rows) == [3, 2, 1]
