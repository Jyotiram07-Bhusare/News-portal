"""The time a news / blog was published ("Published on: Nov 21, 2026, 14:05:07 IST"): stamped when it is created, changeable in the Admin Panel, India time everywhere."""
import json
import re
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta, timezone

import pytest

import config
import pubtime
import seo

SITE = "https://www.example.org"
BASE = {"title": "t", "category": "blogs", "author": "a", "excerpt": "e", "content": "<p>c</p>", "image": "assets/images/a.jpg"}
SHELL = """<!DOCTYPE html>
<html lang="mr">
<head>
  <base href="/" />
  <!--seo:start-->
  <title>Home title</title>
  <!--seo:end-->
</head>
<body><div id="main-content-container"><!--ssr:start--><h1>seed story</h1><!--ssr:end--></div></body>
</html>
"""


@pytest.fixture(autouse=True)
def site(monkeypatch):
    monkeypatch.setattr(config, "SITE_URL", SITE)
    monkeypatch.setattr(config, "PRETTY_URLS", True)
    monkeypatch.setattr(seo, "shell_html", lambda: SHELL)


def story(db, id, slug, category="blogs", **fields):
    row = {"id": id, "slug": slug, "category": category, "categoryLabel": "ब्लॉग्स", "title": f"शीर्षक {id}", "title_en": f"Title {id}", "excerpt": f"सारांश {id}",
           "excerpt_en": f"Summary {id}", "content": f"<p>मजकूर {id}</p>", "content_en": f"<p>Text {id}</p>", "author": "लोकमंगल फाऊंडेशन",
           "author_en": "Lokmangal Foundation", "date": "१३ ऑक्टोबर २०२६", "image": "assets/images/a.jpg", "created_at": "2026-10-13 06:24:00",
           "updated_at": "2026-10-14 08:00:00", **fields}
    db.articles[id] = row
    return row


def ld(page):
    return json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', page, re.S).group(1))


# ---------------------------------------------------------------------------------------------------- the helper
def test_the_time_is_read_in_every_form_a_browser_or_the_database_gives():
    assert pubtime.parse("2026-11-21 14:05:07") == datetime(2026, 11, 21, 14, 5, 7)
    assert pubtime.parse("2026-11-21T14:05") == datetime(2026, 11, 21, 14, 5, 0)              # (a browser's date-and-time box: no seconds)
    assert pubtime.parse("  2026-11-21T14:05:07 ") == datetime(2026, 11, 21, 14, 5, 7)
    assert pubtime.parse(datetime(2026, 11, 21, 14, 5, 7, 999)) == datetime(2026, 11, 21, 14, 5, 7)


@pytest.mark.parametrize("bad", [None, "", "yesterday", "2026-11-21", "2026-13-01 10:00", "2026-11-31 10:00", "2026-11-21 24:00", "2026-11-21 10:61",
                                 "1999-12-31 23:59", "2100-01-01 00:00", "21/11/2026 14:05", "2026-11-21T14:05Z", "2026-11-21T14:05:07+05:30", "<b>2026-11-21 14:05</b>"])
def test_text_that_is_not_a_time(bad):
    assert pubtime.parse(bad) is None


def test_the_texts_made_from_a_time():
    moment = datetime(2026, 11, 21, 14, 5, 7)
    assert pubtime.stamp_text(moment) == "2026-11-21 14:05:07"
    assert pubtime.date_text(moment) == "२१ नोव्हेंबर २०२६" and pubtime.date_text(datetime(2026, 3, 5)) == "५ मार्च २०२६"
    assert pubtime.iso(moment) == "2026-11-21T14:05:07+05:30"
    assert pubtime.published_line(moment, None, "en") == "Published on: Nov 21, 2026, 14:05:07 IST"        # (the same words as Hindustan Times)
    assert pubtime.published_line(moment, None, "mr") == "प्रकाशित: २१ नोव्हेंबर २०२६, १४:०५:०७ IST"
    assert pubtime.published_line(datetime(2026, 3, 5, 9, 0, 0), None, "en") == "Published on: Mar 5, 2026, 09:00:00 IST"
    assert pubtime.published_line(None, date(2026, 10, 13), "en") == "Published on: Oct 13, 2026"        # (an older story: the date, no invented time)
    assert pubtime.published_line(None, date(2026, 10, 13), "mr") == "प्रकाशित: १३ ऑक्टोबर २०२६"
    assert pubtime.published_line(None, None, "en") == "" and pubtime.published_line(None, None, "mr") == ""


def test_now_is_india_time_whatever_the_zone_of_the_server():
    india = (datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)).replace(tzinfo=None)
    assert abs((pubtime.now() - india).total_seconds()) < 5


# ---------------------------------------------------------------------------------------------------- the API
def test_a_new_story_is_stamped_with_the_current_india_time(client, admin, db):
    before = pubtime.now()
    reply = client.post("/api/articles", headers=admin, json=BASE)
    after = pubtime.now()
    assert reply.status_code == 201
    article = reply.get_json()["article"]
    assert before <= pubtime.parse(article["published_at"]) <= after
    assert article["date"] == pubtime.date_text(pubtime.parse(article["published_at"]))        # the date the lists show is made from it


def test_an_empty_time_or_date_also_means_published_now(client, admin, db):
    for empty in ({"date": ""}, {"date": "   "}, {"published_at": ""}, {"published_at": None, "date": ""}, {"published_at": "  "}):
        article = client.post("/api/articles", headers=admin, json={**BASE, **empty}).get_json()["article"]
        assert pubtime.parse(article["published_at"]) is not None and article["date"], empty


def test_the_editor_can_choose_the_time(client, admin, db):
    made = client.post("/api/articles", headers=admin, json={**BASE, "published_at": "2026-11-21T14:05", "date": "१ जानेवारी २००१"})
    article = made.get_json()["article"]
    assert article["published_at"] == "2026-11-21 14:05:00" and article["date"] == "२१ नोव्हेंबर २०२६"      # (a date sent along is ignored: the time rules)
    changed = client.put(f"/api/articles/{article['id']}", headers=admin, json={"published_at": "2026-12-01 09:30:15"}).get_json()["article"]
    assert changed["published_at"] == "2026-12-01 09:30:15" and changed["date"] == "१ डिसेंबर २०२६"


def test_an_update_without_a_time_leaves_it_alone(client, admin, db):
    article_id = client.post("/api/articles", headers=admin, json={**BASE, "published_at": "2026-11-21 14:05:07"}).get_json()["article"]["id"]
    for body in ({"title": "one"}, {"title": "two", "published_at": ""}, {"title": "three", "published_at": None}, {"title": "four", "date": "५ मे २०२०"}):
        client.put(f"/api/articles/{article_id}", headers=admin, json=body)
        assert db.articles[article_id]["published_at"] == "2026-11-21 14:05:07", body
    assert db.articles[article_id]["date"] == "५ मे २०२०"            # (a request that talks only about the date still changes the date text, as before)


def test_a_request_with_only_a_date_stays_date_only(client, admin, db):
    article = client.post("/api/articles", headers=admin, json={**BASE, "date": "१३ ऑक्टोबर २०२६"}).get_json()["article"]
    assert article["date"] == "१३ ऑक्टोबर २०२६" and not article.get("published_at")


@pytest.mark.parametrize("bad", ["yesterday", "2026-13-01 10:00", "2026-11-31 10:00", "2026-11-21 25:00", "1999-01-01 00:00", "21-11-2026 14:05", "<b>x</b>"])
def test_a_time_that_is_not_a_time_is_refused(client, admin, db, bad):
    assert client.post("/api/articles", headers=admin, json={**BASE, "published_at": bad}).status_code == 400
    article_id = client.post("/api/articles", headers=admin, json=BASE).get_json()["article"]["id"]
    assert client.put(f"/api/articles/{article_id}", headers=admin, json={"published_at": bad}).status_code == 400


def test_only_the_admin_can_set_the_time(client, db):
    assert client.post("/api/articles", json={**BASE, "published_at": "2026-11-21 14:05"}).status_code == 401


# ---------------------------------------------------------------------------------------------------- search engines, link previews, the page of a story
def test_structured_data_and_preview_tags_carry_the_exact_time(client, db):
    story(db, 7, "first-blog", published_at="2026-11-21 14:05:07", updated_at="2026-11-22 10:00:00")
    page = client.get("/api/share/7").get_data(as_text=True)
    data = ld(page)
    assert data["datePublished"] == "2026-11-21T14:05:07+05:30" and data["dateModified"] == "2026-11-22T15:30:00+05:30"
    assert '<meta property="article:published_time" content="2026-11-21T14:05:07+05:30">' in page
    assert "प्रकाशित: २१ नोव्हेंबर २०२६, १४:०५:०७ IST" in page


def test_modified_is_never_before_the_exact_time(client, db):
    story(db, 7, "first-blog", published_at="2026-11-21 14:05:07", updated_at="2026-11-21 08:00:00")      # (13:30 India time: before publishing)
    data = ld(client.get("/api/share/7").get_data(as_text=True))
    assert data["dateModified"] == data["datePublished"] == "2026-11-21T14:05:07+05:30"


def test_the_page_of_a_story_has_the_line_right_under_the_headline(client, db):
    story(db, 7, "first-blog", published_at="2026-11-21 14:05:07")
    page = client.get("/api/page/blog/first-blog").get_data(as_text=True)
    assert ('<h1 class="single-post-headline">शीर्षक 7</h1>\n'
            '<div class="post-published" data-no-i18n><time datetime="2026-11-21T14:05:07+05:30">प्रकाशित: २१ नोव्हेंबर २०२६, १४:०५:०७ IST</time></div>\n') in page
    english = client.get("/api/page/blog/first-blog?lang=en").get_data(as_text=True)
    assert '<time datetime="2026-11-21T14:05:07+05:30">Published on: Nov 21, 2026, 14:05:07 IST</time>' in english
    assert page.index("post-published") < page.index("single-post-media")                      # (above the photo, like Hindustan Times)


def test_an_older_story_shows_only_its_date(client, db):
    story(db, 7, "first-blog")                                              # no published_at: written before the time was kept
    page = client.get("/api/page/blog/first-blog").get_data(as_text=True)
    assert '<time datetime="2026-10-13">प्रकाशित: १३ ऑक्टोबर २०२६</time>' in page
    assert "IST" not in page.split("post-published", 1)[1].split("</div>", 1)[0]                # (no invented time)
    assert ld(client.get("/api/share/7").get_data(as_text=True))["datePublished"] == "2026-10-13T00:00:00+05:30"


def test_the_feed_has_the_exact_time_and_lists_the_newest_first(client, db):
    story(db, 1, "first", date="२१ नोव्हेंबर २०२६", published_at="2026-11-21 09:00:00")
    story(db, 2, "second", date="२१ नोव्हेंबर २०२६", published_at="2026-11-21 18:30:00")
    story(db, 3, "third", date="२० नोव्हेंबर २०२६", published_at="2026-11-20 23:59:59")
    items = ET.fromstring(client.get("/api/rss.xml").data).findall("channel/item")
    assert [i.find("title").text for i in items] == ["शीर्षक 2", "शीर्षक 1", "शीर्षक 3"]
    assert items[0].find("pubDate").text == "Sat, 21 Nov 2026 18:30:00 +0530"
