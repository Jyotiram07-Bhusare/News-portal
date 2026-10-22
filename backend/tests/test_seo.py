"""The pages search engines and social networks read: sitemap.xml, rss.xml and the link-preview page of a story."""
import json
import re
import xml.etree.ElementTree as ET

import pytest

import config
import seo

SITE = "https://www.example.org"
SM = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


@pytest.fixture(autouse=True)
def site(monkeypatch):
    monkeypatch.setattr(config, "SITE_URL", SITE)
    monkeypatch.setattr(config, "PRETTY_URLS", False)         # (these tests are about the ?post=12 addresses; test_pretty.py is about /blog/<words>)


def story(db, id, category="rajkiy", **fields):
    row = {"id": id, "category": category, "categoryLabel": "राजकीय", "title": f"बातमी {id}", "title_en": f"Story {id}",
           "excerpt": f"सारांश {id}", "excerpt_en": f"Summary {id}", "content": f"<p>मजकूर {id}</p>", "content_en": f"<p>Text {id}</p>",
           "author": "लोकमंगल प्रतिनिधी", "author_en": "Lokmangal Reporter", "date": "१३ ऑक्टोबर २०२६", "image": "assets/images/a.jpg",
           "created_at": "2026-10-13 06:24:00", "updated_at": "2026-10-14 08:00:00", **fields}
    db.articles[id] = row
    return row


def issue(db, no, **fields):
    db.weekly[no] = {"issue_no": no, "title": f"अंक शीर्षक {no}", "title_en": f"Issue headline {no}", "date": "२६ ऑगस्ट २०२६",
                     "description": "वर्णन", "description_en": "Description", "image": f"assets/weekly/{no}.jpg",
                     "created_at": "2026-10-16 07:25:53", **fields}


def ld(page):
    return json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', page, re.S).group(1))


# ---------------------------------------------------------------------------------------------------- dates
def test_dates_of_every_kind_are_understood():
    assert str(seo.parse_date("१३ ऑक्टोबर २०२६")) == "2026-10-13"
    assert str(seo.parse_date("०५ मे २०२४")) == "2024-05-05"
    assert str(seo.parse_date("13 October 2026")) == "2026-10-13"
    assert str(seo.parse_date("3 Oct. 2026")) == "2026-10-03"
    assert str(seo.parse_date("2026-10-13")) == "2026-10-13"
    assert seo.parse_date("३१ फेब्रुवारी २०२६") is None and seo.parse_date("लवकरच") is None and seo.parse_date(None) is None


# ---------------------------------------------------------------------------------------------------- sitemap
def test_sitemap_lists_home_sections_stories_and_issues(client, db):
    story(db, 1)
    story(db, 2, "samajik", categoryLabel="सामाजिक")
    story(db, 10000, "blogs", categoryLabel="ब्लॉग्स")
    issue(db, 68)
    reply = client.get("/api/sitemap.xml")
    assert reply.status_code == 200 and reply.mimetype == "application/xml"
    assert "X-Robots-Tag" not in reply.headers
    root = ET.fromstring(reply.data)                                   # (well-formed XML)
    urls = {u.find(SM + "loc").text: u for u in root.findall(SM + "url")}
    assert list(urls)[0] == SITE + "/"
    for wanted in ("/?cat=rajkiy", "/?cat=samajik", "/?cat=blogs", "/?cat=weekly", "/?post=1", "/?post=2", "/?post=10000", "/?issue=68"):
        assert SITE + wanted in urls, wanted
    assert SITE + "/?cat=review" not in urls                            # (an empty section is not listed)
    assert urls[SITE + "/?post=1"].find(SM + "lastmod").text == "2026-10-14"
    images = [i.text for i in urls[SITE + "/?post=1"].iter("{http://www.google.com/schemas/sitemap-image/1.1}loc")]
    assert images == [SITE + "/assets/images/a.jpg"]
    assert not re.search(r"<(priority|changefreq)", reply.get_data(as_text=True))      # (Google ignores them)


def test_empty_site_still_gives_a_valid_sitemap(client, db):
    root = ET.fromstring(client.get("/api/sitemap.xml").data)
    assert [u.find(SM + "loc").text for u in root.findall(SM + "url")] == [SITE + "/"]


def test_sitemap_follows_the_address_it_was_asked_on_when_no_site_is_configured(client, db, monkeypatch):
    monkeypatch.setattr(config, "SITE_URL", "")
    story(db, 1)
    text = client.get("/api/sitemap.xml", base_url="http://localhost:5000").get_data(as_text=True)
    assert "<loc>http://localhost:5000/?post=1</loc>" in text


# ---------------------------------------------------------------------------------------------------- share page
def test_share_page_has_the_preview_of_that_story(client, db):
    story(db, 7, title="मोठी बातमी", excerpt="हा सारांश आहे", image="https://media.example.org/images/x.jpg")
    reply = client.get("/api/share/7")
    page = reply.get_data(as_text=True)
    assert reply.status_code == 200 and reply.mimetype == "text/html"
    for tag in ('<meta property="og:title" content="मोठी बातमी">', '<meta property="og:description" content="हा सारांश आहे">',
                '<meta property="og:image" content="https://media.example.org/images/x.jpg">', '<meta property="og:type" content="article">',
                '<meta property="og:locale" content="mr_IN">', '<meta name="twitter:card" content="summary_large_image">',
                '<meta name="robots" content="noindex, follow">', '<html lang="mr">'):
        assert tag in page, tag
    assert f'<meta http-equiv="refresh" content="0; url={SITE}/?post=7">' in page            # people go on to the website
    assert f'location.replace("{SITE}/?post=7")' in page
    assert "<h1>मोठी बातमी</h1>" in page and "<p>मजकूर 7</p>" in page                       # the whole text is on the page
    assert "og:url" not in page and 'rel="canonical"' not in page                           # (a preview must stay on THIS page)


def test_share_page_structured_data_is_a_news_article(client, db):
    story(db, 7)
    data = ld(client.get("/api/share/7").get_data(as_text=True))
    assert data["@type"] == "NewsArticle" and data["headline"] == "बातमी 7" and data["inLanguage"] == "mr"
    assert data["mainEntityOfPage"]["@id"] == f"{SITE}/?post=7"
    assert data["image"] == [f"{SITE}/assets/images/a.jpg"]
    assert data["datePublished"] == "2026-10-13T00:00:00+05:30" and data["dateModified"] == "2026-10-14T08:00:00+05:30"
    assert data["author"] == {"@type": "Organization", "name": "लोकमंगल प्रतिनिधी"}
    assert data["publisher"]["@type"] == "NewsMediaOrganization" and data["publisher"]["logo"]["url"] == f"{SITE}/assets/logo-192.jpg"
    assert data["articleSection"] == "राजकीय"


def test_a_blog_is_a_blogposting_and_a_person_is_a_person(client, db):
    story(db, 10000, "blogs", categoryLabel="ब्लॉग्स", author="Anita Kulkarni")
    data = ld(client.get("/api/share/10000").get_data(as_text=True))
    assert data["@type"] == "BlogPosting" and data["author"] == {"@type": "Person", "name": "Anita Kulkarni"}


def test_modified_is_never_before_published(client, db):
    story(db, 7, date="१३ ऑक्टोबर २०२६", updated_at="2026-10-01 00:00:00")
    data = ld(client.get("/api/share/7").get_data(as_text=True))
    assert data["dateModified"] == data["datePublished"]


def test_english_share_page(client, db):
    story(db, 7)
    page = client.get("/api/share/7?lang=en").get_data(as_text=True)
    assert '<html lang="en">' in page and '<meta property="og:title" content="Story 7">' in page and "<p>Text 7</p>" in page
    assert '<meta property="og:locale" content="en_IN">' in page
    assert f'url={SITE}/?post=7&amp;lang=en"' in page
    assert ld(page)["inLanguage"] == "en" and ld(page)["articleSection"] == "Political"


def test_a_story_without_english_text_is_shown_in_marathi_even_when_english_is_asked(client, db):
    story(db, 7, title_en="", content_en="")
    page = client.get("/api/share/7?lang=en").get_data(as_text=True)
    assert '<html lang="mr">' in page and "<h1>बातमी 7</h1>" in page and "lang=en" not in page


def test_nothing_in_a_story_can_break_out_of_the_page(client, db):
    story(db, 7, title='</title><script>alert(1)</script> "x" & y', excerpt='<img src=x onerror=alert(1)>',
          content='<p onclick="evil()">ok</p><script>alert(2)</script>', author="</script><b>a</b>")
    page = client.get("/api/share/7").get_data(as_text=True)
    assert "<script>alert" not in page and "onerror=alert" not in page and "onclick" not in page and "<b>a</b>" not in page
    assert page.count("</script>") == 2                                    # (the data block and the redirect: nothing else)
    assert ld(page)["headline"].startswith("</title>")                     # (still the text as typed, only escaped inside the page)


def test_a_picture_apps_cannot_draw_falls_back_to_the_default_card(client, db):
    story(db, 7, image="assets/images/wide.webp")
    assert f'<meta property="og:image" content="{SITE}/assets/og-default.jpg">' in client.get("/api/share/7").get_data(as_text=True)
    story(db, 8, image="")
    assert f'content="{SITE}/assets/og-default.jpg"' in client.get("/api/share/8").get_data(as_text=True)


def test_unknown_story_is_a_404_that_is_not_indexed(client, db):
    reply = client.get("/api/share/999")
    assert reply.status_code == 404 and 'content="noindex"' in reply.get_data(as_text=True)
    assert client.get("/api/share/issue/999").status_code == 404


def test_share_page_of_a_weekly_issue(client, db):
    issue(db, 68)
    reply = client.get("/api/share/issue/68")
    page = reply.get_data(as_text=True)
    assert reply.status_code == 200
    assert '<meta property="og:title" content="लोकमंगल साप्ताहिक - अंक ६८: अंक शीर्षक 68">' in page
    assert f'<meta property="og:image" content="{SITE}/assets/weekly/68.jpg">' in page
    assert f"url={SITE}/?issue=68" in page
    data = ld(page)
    assert data["@type"] == "PublicationIssue" and data["issueNumber"] == "68" and data["datePublished"] == "2026-08-26T00:00:00+05:30"
    assert data["isPartOf"]["name"] == "लोकमंगल साप्ताहिक"
    assert "Issue 68: Issue headline 68" in client.get("/api/share/issue/68?lang=en").get_data(as_text=True)


# ---------------------------------------------------------------------------------------------------- rss
def test_rss_is_valid_and_newest_first(client, db):
    story(db, 1, date="०१ ऑक्टोबर २०२६")
    story(db, 2, "samajik", date="१३ ऑक्टोबर २०२६")
    story(db, 3, date="०५ ऑक्टोबर २०२६")
    issue(db, 68)
    reply = client.get("/api/rss.xml")
    assert reply.status_code == 200 and reply.mimetype == "application/rss+xml"
    channel = ET.fromstring(reply.data).find("channel")
    assert channel.find("language").text == "mr" and channel.find("link").text == SITE + "/"
    items = channel.findall("item")
    assert [i.find("link").text for i in items] == [f"{SITE}/?post=2", f"{SITE}/?post=3", f"{SITE}/?post=1"]      # (weekly issues are not stories)
    first = items[0]
    assert first.find("title").text == "बातमी 2" and first.find("guid").text == f"{SITE}/?post=2" and first.find("category").text == "सामाजिक"
    assert first.find("pubDate").text.startswith("Tue, 13 Oct 2026")
    assert "<p>मजकूर 2</p>" in first.find("{http://purl.org/rss/1.0/modules/content/}encoded").text


def test_rss_english_and_limits(client, db):
    for i in range(1, 40):
        story(db, i, date=f"{(i % 28) + 1:02d} ऑक्टोबर २०२६")
    root = ET.fromstring(client.get("/api/rss.xml?lang=en").data)
    assert root.find("channel/language").text == "en" and root.find("channel/title").text == "Lokmangal News Portal"
    items = root.findall("channel/item")
    assert len(items) == seo.FEED_ITEMS and items[0].find("title").text.startswith("Story ")
    assert root.find("channel/{http://www.w3.org/2005/Atom}link").get("href") == f"{SITE}/api/rss.xml?lang=en"


def test_rss_survives_text_that_would_break_xml(client, db):
    story(db, 1, title="A & B <c>", content="<p>x ]]> y</p>")
    items = ET.fromstring(client.get("/api/rss.xml").data).findall("channel/item")
    assert items[0].find("title").text == "A & B <c>"                     # (escaped in the file, the same text when read back)
    assert "x ]]&gt; y" in items[0].find("{http://purl.org/rss/1.0/modules/content/}encoded").text
    assert ET.fromstring("<x>" + seo._cdata("a ]]> b") + "</x>").text == "a ]]> b"      # (the one thing a CDATA block cannot hold, split in two)


# ---------------------------------------------------------------------------------------------------- API json
def test_json_answers_are_not_listed_by_search_engines_but_the_pages_are_not_touched(client, db):
    assert client.get("/api/articles").headers["X-Robots-Tag"] == "noindex"
    assert "X-Robots-Tag" not in client.get("/api/sitemap.xml").headers
    assert "X-Robots-Tag" not in client.get("/api/rss.xml").headers
