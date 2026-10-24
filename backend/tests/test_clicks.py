"""The clicks of the Review section: a reader opening a news / blog is counted without a login; crawlers and endless repeats are not."""
import pytest

import app as app_module


@pytest.fixture(autouse=True)
def fresh_reads():
    app_module._reads.clear()
    yield
    app_module._reads.clear()


def story(db, **data):
    return db.create_article({"title": "बातमी", "category": "rajkiy", **data})


def test_a_reader_opening_a_story_is_counted_without_a_login(client, db):
    sid = story(db)
    reply = client.post(f"/api/articles/{sid}/read")
    assert reply.status_code == 200 and reply.get_json()["success"] is True
    assert db.articles[sid]["clicks"] == 1
    listed = client.get("/api/articles").get_json()["articles"]
    assert next(a for a in listed if a["id"] == sid)["clicks"] == 1          # (the website ranks the Review section by it)


def test_an_unknown_story_gets_the_same_answer_and_nothing_is_counted(client, db):
    assert client.post("/api/articles/424242/read").status_code == 200
    assert db.articles == {}


@pytest.mark.parametrize("agent", ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                                   "facebookexternalhit/1.1", "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0 Safari/537.36"])
def test_crawlers_are_not_counted(client, db, agent):
    sid = story(db)
    assert client.post(f"/api/articles/{sid}/read", headers={"User-Agent": agent}).status_code == 200
    assert db.articles[sid].get("clicks", 0) == 0


def test_one_address_counts_a_story_a_limited_number_of_times(client, db, monkeypatch):
    first, second = story(db), story(db)
    for _ in range(app_module.READ_LIMIT + 5):
        client.post(f"/api/articles/{first}/read")
    assert db.articles[first]["clicks"] == app_module.READ_LIMIT
    client.post(f"/api/articles/{second}/read")                                # (another story still counts)
    assert db.articles[second]["clicks"] == 1
    later = app_module.time.time() + app_module.READ_WINDOW + 1                 # the next window
    monkeypatch.setattr(app_module.time, "time", lambda: later)
    client.post(f"/api/articles/{first}/read")
    assert db.articles[first]["clicks"] == app_module.READ_LIMIT + 1


def test_counting_opens_no_other_write(client, db):
    sid = story(db)
    assert client.post(f"/api/articles/{sid}/toggle-placement", json={"field": "is_lead"}).status_code == 401
    assert client.put(f"/api/articles/{sid}", json={"title": "x"}).status_code == 401
    assert client.delete(f"/api/articles/{sid}").status_code == 401
