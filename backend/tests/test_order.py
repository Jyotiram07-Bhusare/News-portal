"""The place number ("क्रम क्रमांक"): cleaned like every other field, empty = not placed by hand (a Review story).
News and blogs are numbered by their publication date instead, newest first: see the _date_order tests at the end."""
import pytest

import database
import sanitize
from sanitize import ValidationError

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


# ---- the places inside the Popular / Random widgets: a story put in is number 1, a place typed in the Admin Panel moves it
def test_a_story_put_in_goes_to_the_top_and_a_typed_place_moves_it():
    assert database._moved([10, 11, 12], 13, 1) == [13, 10, 11, 12]       # newly put into Popular: the top, the others one place down
    assert database._moved([10, 11, 12], 12, 1) == [12, 10, 11]           # moved up by hand
    assert database._moved([10, 11, 12], 10, 2) == [11, 10, 12]           # moved down by hand
    assert database._moved([10, 11, 12], 11, 99) == [10, 12, 11]          # (past the end: the last place)


@pytest.mark.parametrize("key", ["popular_order", "random_order"])
def test_the_widget_places_are_cleaned_like_the_place_number(key):
    assert sanitize.article({key: "2"}, creating=False) == {key: 2}
    assert sanitize.article({key: ""}, creating=False) == {key: None}
    with pytest.raises(ValidationError):
        sanitize.article({key: "abc"}, creating=False)


def test_the_admin_panel_can_give_a_popular_story_its_place(client, admin, db):
    article_id = client.post("/api/articles", headers=admin, json={**BASE, "category": "blogs", "is_popular": 1}).get_json()["article"]["id"]
    reply = client.put(f"/api/articles/{article_id}", headers=admin, json={"popular_order": "3"})
    assert reply.status_code == 200 and db.articles[article_id]["popular_order"] == 3
    assert client.put(f"/api/articles/{article_id}", headers=admin, json={"random_order": "0"}).status_code == 400
