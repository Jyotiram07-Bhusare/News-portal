"""Automatic SEO of what the Admin Panel publishes: the live sitemaps (Google News too) and the IndexNow notice to search engines."""
import re
import xml.etree.ElementTree as ET
from datetime import timedelta

import pytest

import config
import database
import indexnow
import pubtime

SITE = "https://www.example.org"
SM = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
NEWS = "{http://www.google.com/schemas/sitemap-news/0.9}"
BASE = {"title": "नवी बातमी", "title_en": "Fresh story", "category": "rajkiy", "author": "a", "excerpt": "e", "content": "<p>c</p>", "image": "assets/images/a.jpg"}


@pytest.fixture(autouse=True)
def site(monkeypatch):
    monkeypatch.setattr(config, "SITE_URL", SITE)
    monkeypatch.setattr(config, "PRETTY_URLS", True)
    monkeypatch.setattr(config, "INDEXNOW_KEY", "")


def story(db, id, hours_ago, category="rajkiy", **fields):
    moment = pubtime.now() - timedelta(hours=hours_ago)
    db.articles[id] = {"id": id, "category": category, "slug": f"story-{id}", "title": f"बातमी {id} & \"नवीन\"", "excerpt": "e", "content": "<p>c</p>",
                       "date": pubtime.date_text(moment), "published_at": pubtime.stamp_text(moment), "image": "assets/images/a.jpg",
                       "created_at": "2026-10-13 06:24:00", "updated_at": "2026-10-14 08:00:00", **fields}


# ---------------------------------------------------------------------------------------------------- Google News sitemap, text sitemap
def test_news_sitemap_has_the_news_of_the_last_two_days(client, db):
    story(db, 1, 30)
    story(db, 2, 1, "samajik")
    story(db, 3, 50)                                        # too old
    story(db, 4, 2, "blogs")                                # a blog is not news
    story(db, 5, -24)                                       # published "tomorrow"
    story(db, 6, 3, published_at=None)                      # no time: not told
    reply = client.get("/api/news-sitemap.xml")
    assert reply.status_code == 200 and reply.mimetype == "application/xml" and "X-Robots-Tag" not in reply.headers
    urls = ET.fromstring(reply.data).findall(SM + "url")
    assert [u.find(SM + "loc").text for u in urls] == [f"{SITE}/samajik/story-2", f"{SITE}/rajkiy/story-1"]          # newest first
    news = urls[0].find(NEWS + "news")
    assert news.find(f"{NEWS}publication/{NEWS}name").text == "लोकमंगल न्यूज पोर्टल" and news.find(f"{NEWS}publication/{NEWS}language").text == "mr"
    assert news.find(NEWS + "title").text == 'बातमी 2 & "नवीन"'
    assert news.find(NEWS + "publication_date").text == pubtime.iso(pubtime.parse(db.articles[2]["published_at"]))


def test_news_sitemap_with_nothing_new_is_still_valid(client, db):
    story(db, 1, 100)
    assert ET.fromstring(client.get("/api/news-sitemap.xml").data).findall(SM + "url") == []


def test_a_new_story_is_in_every_sitemap_at_once(client, admin, db):
    article = client.post("/api/articles", headers=admin, json=BASE).get_json()["article"]
    db.articles[article["id"]]["slug"] = "fresh-story"
    for path in ("/api/sitemap.xml", "/api/news-sitemap.xml", "/api/sitemap.txt", "/api/rss.xml"):
        assert f"{SITE}/rajkiy/fresh-story" in client.get(path).get_data(as_text=True), path


def test_text_sitemap_lists_the_same_addresses(client, db):
    story(db, 1, 1)
    xml = client.get("/api/sitemap.xml").get_data(as_text=True)
    reply = client.get("/api/sitemap.txt")
    assert reply.status_code == 200 and reply.mimetype == "text/plain"
    assert reply.get_data(as_text=True).split() == re.findall(r"<loc>([^<]*)</loc>", xml)


# ---------------------------------------------------------------------------------------------------- IndexNow
@pytest.fixture
def sent(monkeypatch):
    """IndexNow switched on, the notices recorded instead of sent."""
    calls = []

    class Now:                                              # runs the "background" job at once
        def __init__(self, target, args, daemon):
            self.job = lambda: target(*args)

        def start(self):
            self.job()

    monkeypatch.setattr(config, "INDEXNOW_KEY", "k" * 32)
    monkeypatch.setattr(indexnow.threading, "Thread", Now)
    monkeypatch.setattr(indexnow, "_send", calls.append)
    return calls


def test_nothing_is_sent_unless_switched_on(client, admin, db, monkeypatch):
    monkeypatch.setattr(indexnow, "_send", lambda urls: pytest.fail("sent while switched off"))
    assert client.post("/api/articles", headers=admin, json=BASE).status_code == 201
    assert indexnow.submit([f"{SITE}/x"]) == []


def test_publishing_changing_and_deleting_a_story_is_told(client, admin, db, sent, monkeypatch):
    # (like MySQL, every read gives a fresh copy: "before the change" must not change with it)
    monkeypatch.setattr(database, "get_article", lambda article_id: dict(db.articles[article_id]) if article_id in db.articles else None)
    article = client.post("/api/articles", headers=admin, json=BASE).get_json()["article"]
    page = f"{SITE}/?post={article['id']}"                  # (the test database gives no slug)
    assert sent[-1] == [page, f"{SITE}/rajkiy", f"{SITE}/"]
    client.put(f"/api/articles/{article['id']}", headers=admin, json={"category": "samajik"})
    assert sent[-1] == [page, f"{SITE}/rajkiy", f"{SITE}/samajik", f"{SITE}/"]      # the old section and the new one
    assert client.delete(f"/api/articles/{article['id']}", headers=admin).status_code == 200
    assert sent[-1] == [page, f"{SITE}/samajik", f"{SITE}/"]


def test_weekly_issues_are_told_too(client, admin, db, sent):
    client.post("/api/weekly", headers=admin, json={"issue_no": 69, "title": "अंक", "image": "assets/weekly/69.jpg"})
    assert sent[-1] == [f"{SITE}/weekly/69", f"{SITE}/weekly", f"{SITE}/"]
    client.delete("/api/weekly/69", headers=admin)
    assert len(sent) == 2


def test_only_this_websites_addresses_are_sent(sent):
    assert indexnow.submit([f"{SITE}/a", f"{SITE}/a", "https://other.example/x", ""]) == [f"{SITE}/a"]


def test_a_search_engine_that_does_not_answer_changes_nothing(monkeypatch):
    monkeypatch.setattr(config, "INDEXNOW_KEY", "k" * 32)
    asked = []

    def broken(request, timeout):
        asked.append(request)
        raise OSError("no network")

    monkeypatch.setattr(indexnow.urllib.request, "urlopen", broken)
    indexnow._send([f"{SITE}/a"])                           # no exception
    body = asked[0].data.decode()
    assert asked[0].full_url == "https://api.indexnow.org/indexnow" and '"host": "www.example.org"' in body
    assert f'"keyLocation": "{SITE}/{"k" * 32}.txt"' in body


def test_the_key_file_of_the_website_matches_the_live_servers_key():
    root = config.PROJECT_DIR / "frontend"
    key = re.search(r'"INDEXNOW_KEY", "([0-9a-f]{32})"', (config.BASE_DIR / "config.py").read_text(encoding="utf-8")).group(1)
    assert (root / f"{key}.txt").read_text(encoding="utf-8").strip() == key
