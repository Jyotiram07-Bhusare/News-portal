"""The place number ("क्रम क्रमांक") of a news / blog: cleaned like every other field, empty = not placed by hand.
(The database then gives a NEW blog number 1 by itself: see the _place_for tests at the end.)"""
import pytest

import database

BASE = {"title": "t", "category": "blogs", "author": "a", "date": "d", "excerpt": "e", "content": "<p>c</p>", "image": "assets/images/a.jpg"}


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


# ---- the Blogs section numbers itself: the newest blog is 1, the one before it 2 ...
def test_a_new_blog_is_number_one_unless_a_number_was_typed():
    assert database._place_for("blogs", None) == 1
    assert database._place_for("blogs", 3) == 3
    assert database._place_for("rajkiy", None) is None              # (news: listed by recency unless placed by hand)
    assert database._place_for("rajkiy", 2) == 2


def test_an_edited_blog_keeps_its_number_and_one_moved_into_blogs_is_number_one():
    assert database._place_for("blogs", None, current=4, arriving=False) == 4
    assert database._place_for("blogs", None, current=None, arriving=False) is None
    assert database._place_for("blogs", None, current=7, arriving=True) == 1
    assert database._place_for("blogs", 2, current=7, arriving=False) == 2
