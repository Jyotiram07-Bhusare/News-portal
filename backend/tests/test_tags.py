"""Tags (topics) of a news / blog: cleaned, saved, changed, and told to search engines and the feed."""
import json
import re
import xml.etree.ElementTree as ET

import pytest

import config
import sanitize
import seo

BASE = {"title": "t", "category": "blogs", "author": "a", "excerpt": "e", "content": "<p>c</p>", "image": "assets/images/a.jpg"}


@pytest.fixture(autouse=True)
def site(monkeypatch):
    monkeypatch.setattr(config, "SITE_URL", "https://www.example.org")
    monkeypatch.setattr(config, "PRETTY_URLS", False)


def test_tags_are_cleaned():
    assert sanitize.tags(" भाजप ,#सोलापूर,,  विधानसभा   निवडणूक , भाजप ") == "भाजप, सोलापूर, विधानसभा निवडणूक"
    assert sanitize.tags("BJP, bjp, Bjp") == "BJP"                                          # (upper / lower case is the same tag)
    assert sanitize.tags(["एक", "दोन, तीन", None, ""]) == "एक, दोन, तीन"
    assert sanitize.tags('<b>ठळक</b>, <script>alert(1)</script>x, "q" & y') == 'ठळक, x, "q" & y'
    assert sanitize.tags(None) == "" and sanitize.tags("") == "" and sanitize.tags("#, ,") == ""


@pytest.mark.parametrize("bad", ["x" * 41, ",".join(f"t{i}" for i in range(16))])
def test_too_long_or_too_many_tags_are_refused(client, admin, db, bad):
    with pytest.raises(sanitize.ValidationError):
        sanitize.tags(bad)
    assert client.post("/api/articles", headers=admin, json={**BASE, "tags": bad}).status_code == 400


def test_the_admin_adds_changes_and_removes_tags(client, admin, db):
    made = client.post("/api/articles", headers=admin, json={**BASE, "tags": "भाजप, #सोलापूर", "tags_en": ["BJP", "Solapur"]})
    article = made.get_json()["article"]
    assert article["tags"] == "भाजप, सोलापूर" and article["tags_en"] == "BJP, Solapur"
    changed = client.put(f"/api/articles/{article['id']}", headers=admin, json={"tags": "सोलापूर, शेती"}).get_json()["article"]
    assert changed["tags"] == "सोलापूर, शेती" and changed["tags_en"] == "BJP, Solapur"          # (only what was sent changes)
    cleared = client.put(f"/api/articles/{article['id']}", headers=admin, json={"tags": "", "tags_en": ""}).get_json()["article"]
    assert cleared["tags"] == "" and cleared["tags_en"] == ""


def story(db, id, **fields):
    db.articles[id] = {"id": id, "category": "rajkiy", "categoryLabel": "राजकीय", "title": "बातमी", "title_en": "Story", "excerpt": "s", "content": "<p>c</p>",
                       "author": "a", "date": "१३ ऑक्टोबर २०२६", "image": "assets/images/a.jpg", "created_at": "2026-10-13 06:24:00",
                       "tags": "भाजप, सोलापूर \"दक्षिण\"", "tags_en": "BJP, Solapur South", **fields}


def test_search_engines_previews_and_the_feed_get_the_tags(client, db):
    story(db, 7)
    page = client.get("/api/share/7").get_data(as_text=True)
    data = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', page, re.S).group(1))
    assert data["keywords"] == ["भाजप", 'सोलापूर "दक्षिण"']
    assert '<meta property="article:tag" content="भाजप">' in page and '<meta property="article:tag" content="सोलापूर &quot;दक्षिण&quot;">' in page
    english = client.get("/api/share/7?lang=en").get_data(as_text=True)
    assert '<meta property="article:tag" content="Solapur South">' in english
    categories = [c.text for c in ET.fromstring(client.get("/api/rss.xml").data).findall("channel/item/category")]
    assert categories == ["राजकीय", "भाजप", 'सोलापूर "दक्षिण"']


def test_the_page_of_a_story_links_its_tags(client, db, monkeypatch):
    monkeypatch.setattr(config, "PRETTY_URLS", True)
    monkeypatch.setattr(seo, "shell_html", lambda: "<html lang=\"mr\"><head><!--seo:start--><!--seo:end--></head><body><!--ssr:start--><!--ssr:end--></body></html>")
    story(db, 7, slug="a-b")
    page = client.get("/api/page/rajkiy/a-b").get_data(as_text=True)
    assert '<a class="tag-link" href="/?tag=%E0%A4%AD%E0%A4%BE%E0%A4%9C%E0%A4%AA">#भाजप</a>' in page
    assert '<meta property="article:tag" content="भाजप" />' in page


def test_a_story_without_tags_has_none_of_it(client, db):
    story(db, 7, tags="", tags_en="")
    page = client.get("/api/share/7").get_data(as_text=True)
    assert "article:tag" not in page and "keywords" not in page
