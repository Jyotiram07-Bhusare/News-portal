"""Pretty addresses: the words of a title in the address (/blog/<words>), the page the server makes for such an address, the sitemap / feed that use them."""
import json
import re
import xml.etree.ElementTree as ET

import pytest

import config
import database
import indexnow
import seo

SITE = "https://www.example.org"
SM = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
SHELL = """<!DOCTYPE html>
<html lang="mr" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <base href="/" />
  <!--seo:start-->
  <title>Home title</title>
  <meta name="description" content="Home description" />
  <script>var canonical = "home";</script>
  <!--seo:end-->
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <div id="main-content-container"><!--ssr:start--><h1>seed story</h1><!--ssr:end--></div>
  <script src="js/app.js"></script>
</body>
</html>
"""


@pytest.fixture(autouse=True)
def pretty(monkeypatch):
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


# ---------------------------------------------------------------------------------------------------- the addresses (the words in them: test_slugs.py)
def test_addresses_follow_the_setting(monkeypatch):
    row = {"id": 7, "slug": "a-b", "category": "blogs"}
    assert seo.story_path(row) == "blog/a-b"
    assert seo.story_path({**row, "category": "rajkiy"}) == "rajkiy/a-b" and seo.story_path({**row, "category": "samajik"}) == "samajik/a-b"
    assert seo.story_path({**row, "slug": ""}) == "?post=7"                      # (no words yet)
    assert seo.issue_path(68) == "weekly/68" and seo.section_path("blogs") == "blog" and seo.section_path("weekly") == "weekly"
    assert seo.story_path({**row, "slug": "एक-दोन"}) == "blog/%E0%A4%8F%E0%A4%95-%E0%A4%A6%E0%A5%8B%E0%A4%A8"      # (percent-encoded, like a browser sends it)
    monkeypatch.setattr(config, "PRETTY_URLS", False)
    assert seo.story_path(row) == "?post=7" and seo.issue_path(68) == "?issue=68" and seo.section_path("blogs") == "?cat=blogs"


# ---------------------------------------------------------------------------------------------------- sitemap, feed, preview page
def test_sitemap_and_feed_use_the_pretty_addresses(client, db):
    story(db, 1, "first-blog")
    story(db, 2, "first-news", "rajkiy", categoryLabel="राजकीय")
    story(db, 3, "", "blogs")                                                     # (no words yet: the old form)
    db.weekly[68] = {"issue_no": 68, "title": "अंक", "title_en": "Issue", "date": "२६ ऑगस्ट २०२६", "description": "d", "image": "assets/weekly/68.jpg",
                     "created_at": "2026-10-16 07:25:53"}
    locs = [u.find(SM + "loc").text for u in ET.fromstring(client.get("/api/sitemap.xml").data).findall(SM + "url")]
    for wanted in ("/", "/blog", "/rajkiy", "/weekly", "/blog/first-blog", "/rajkiy/first-news", "/?post=3", "/weekly/68"):
        assert SITE + wanted in locs, wanted
    links = [i.find("link").text for i in ET.fromstring(client.get("/api/rss.xml").data).findall("channel/item")]
    assert f"{SITE}/blog/first-blog" in links and f"{SITE}/rajkiy/first-news" in links
    page = client.get("/api/share/1").get_data(as_text=True)
    assert f'url={SITE}/blog/first-blog"' in page and f'location.replace("{SITE}/blog/first-blog")' in page


# ---------------------------------------------------------------------------------------------------- the page of a story
def test_page_of_a_story_is_the_website_with_that_story_in_it(client, db):
    story(db, 7, "first-blog", title="मोठी बातमी", excerpt="हा सारांश आहे", image="https://media.example.org/x.jpg")
    reply = client.get("/api/page/blog/first-blog")
    page = reply.get_data(as_text=True)
    assert reply.status_code == 200 and reply.mimetype == "text/html"
    assert page.count("<title>") == 1 and "<title>मोठी बातमी | लोकमंगल न्यूज पोर्टल</title>" in page and "Home title" not in page
    assert '<link rel="canonical" href="https://www.example.org/blog/first-blog" />' in page and 'var canonical = "home"' not in page
    assert '<meta property="og:title" content="मोठी बातमी" />' in page and '<meta property="og:image" content="https://media.example.org/x.jpg" />' in page
    assert '<meta property="og:url" content="https://www.example.org/blog/first-blog" />' in page and 'content="हा सारांश आहे"' in page
    assert page.count("<base") == 1 and page.index("<base") < page.index("css/style.css")                  # (the files are found from the root)
    assert '<html lang="mr"' in page
    assert "<h1 class=\"single-post-headline\">मोठी बातमी</h1>" in page and "<p>मजकूर 7</p>" in page and "seed story" not in page   # (the text is in the page)
    data = json.loads(re.search(r'id="ld-view">(.*?)</script>', page, re.S).group(1))
    assert [d["@type"] for d in data] == ["NewsArticle" if False else "BlogPosting", "BreadcrumbList"]
    assert data[0]["mainEntityOfPage"]["@id"] == f"{SITE}/blog/first-blog"
    assert [i["item"] for i in data[1]["itemListElement"]] == [f"{SITE}/", f"{SITE}/blog", f"{SITE}/blog/first-blog"]


def test_page_in_english_and_for_a_marathi_address(client, db):
    story(db, 7, "first-blog")
    page = client.get("/api/page/blog/first-blog?lang=en").get_data(as_text=True)
    assert '<html lang="en"' in page and "<title>Title 7 | Lokmangal News Portal</title>" in page and "<p>Text 7</p>" in page
    story(db, 8, "एक-दोन", "samajik", categoryLabel="सामाजिक")
    reply = client.get("/api/page/samajik/%E0%A4%8F%E0%A4%95-%E0%A4%A6%E0%A5%8B%E0%A4%A8")           # (what a browser sends)
    assert reply.status_code == 200 and "मजकूर 8" in reply.get_data(as_text=True)
    assert 'href="https://www.example.org/samajik/%E0%A4%8F%E0%A4%95-%E0%A4%A6%E0%A5%8B%E0%A4%A8"' in reply.get_data(as_text=True)


def test_page_of_a_story_under_the_wrong_section_goes_to_the_right_one(client, db):
    story(db, 7, "first-blog")
    reply = client.get("/api/page/rajkiy/first-blog")
    assert reply.status_code == 301 and reply.headers["Location"] == f"{SITE}/blog/first-blog"


def test_page_of_a_weekly_issue(client, db):
    db.weekly[68] = {"issue_no": 68, "title": "अंक शीर्षक", "title_en": "Issue headline", "date": "२६ ऑगस्ट २०२६", "description": "वर्णन",
                     "description_en": "Description", "image": "assets/weekly/68.jpg", "created_at": "2026-10-16 07:25:53"}
    reply = client.get("/api/page/weekly/68")
    page = reply.get_data(as_text=True)
    assert reply.status_code == 200 and "लोकमंगल साप्ताहिक - अंक ६८: अंक शीर्षक" in page and f'href="{SITE}/weekly/68"' in page and "वर्णन" in page
    assert client.get("/api/page/weekly/999").status_code == 404 and client.get("/api/page/weekly/abc").status_code == 404


def test_unknown_address_is_the_website_itself_and_not_listed(client, db):
    for path in ("/api/page/blog/nothing-here", "/api/page/nonsense/x", "/api/page/rajkiy/%3Cscript%3E"):
        reply = client.get(path)
        page = reply.get_data(as_text=True)
        assert reply.status_code == 404 and '<meta name="robots" content="noindex" />' in page and "seed story" not in page and "css/style.css" in page


def test_nothing_in_a_story_can_break_out_of_the_page(client, db):
    story(db, 7, "x", title='</title><script>alert(1)</script> "q" & y', excerpt='<img src=x onerror=alert(1)>',
          content='<p onclick="evil()">ok</p><script>alert(2)</script>', author="</script><b>a</b>")
    page = client.get("/api/page/blog/x").get_data(as_text=True)
    assert "<script>alert" not in page and "onerror=alert" not in page and "onclick" not in page and "<b>a</b>" not in page
    assert page.count("<title>") == 1


def test_without_the_website_the_plain_preview_page_is_given(client, db, monkeypatch):
    monkeypatch.setattr(seo, "shell_html", lambda: None)
    story(db, 7, "first-blog")
    page = client.get("/api/page/blog/first-blog").get_data(as_text=True)
    assert "og:title" in page and "Text 7" not in page and "मजकूर 7" in page and f'url={SITE}/blog/first-blog' in page
    assert client.get("/api/page/blog/nothing").status_code == 404


class _Cur:
    """A cursor over a few news rows: just enough SQL for backfill_slugs and shorten_slugs."""

    def __init__(self, rows):
        self.rows, self.result, self.updates = rows, [], 0

    def execute(self, sql, params=()):
        if sql.startswith("SELECT id, title,"):
            self.result = [r for r in self.rows if not r["slug"]]
        elif sql.startswith("SELECT id, slug, old_slugs"):
            self.result = [dict(r) for r in self.rows if r["slug"] and (len(r["slug"]) > params[0] or not r["slug"].isascii())]
        elif sql.startswith("SELECT id FROM articles WHERE (slug"):
            self.result = [r for r in self.rows if params[0] in (r["slug"], *str(r["old_slugs"] or "").split(",")) and r["id"] != params[2]][:1]
        elif sql.startswith("UPDATE articles SET slug = %s, old_slugs"):
            next(r for r in self.rows if r["id"] == params[2]).update(slug=params[0], old_slugs=params[1])
            self.updates += 1
        elif sql.startswith("UPDATE articles SET slug"):
            next(r for r in self.rows if r["id"] == params[1])["slug"] = params[0]
        else:
            raise AssertionError(sql)

    def fetchall(self):
        return self.result

    def fetchone(self):
        return self.result[0] if self.result else None


def _fake_database(monkeypatch, rows, old_column=True):
    from contextlib import contextmanager
    cur = _Cur(rows)

    @contextmanager
    def fake_connection():
        yield type("Conn", (), {"cursor": lambda self: cur})()

    monkeypatch.setattr(database, "connection", fake_connection)
    monkeypatch.setattr(database, "has_slug", lambda: True)
    monkeypatch.setattr(database, "has_old_slugs", lambda: old_column)
    monkeypatch.setattr(database, "has_english", lambda: True)
    return cur


def news(id, title, title_en="", slug="", old_slugs=None):
    return {"id": id, "title": title, "title_en": title_en, "slug": slug, "old_slugs": old_slugs}


LONG_MARATHI = "सोलापूर-जिल्हा-बँकेच्या-संचालकपदी-मनिष-देशमुख-विजयी"
LONG_ENGLISH = "one-step-one-familys-joy-lokmangal-foundations-49th-sarvadharmiya-community-marriage"


def test_long_and_marathi_addresses_get_short_ones_and_keep_the_old(monkeypatch):
    rows = [news(1, "सोलापूर जिल्हा बँकेच्या संचालकपदी मनिष देशमुख विजयी!", slug=LONG_MARATHI),
            news(2, "x", "One Step, One Family's Joy! Lokmangal Foundation's 49th Sarvadharmiya Community Marriage", slug=LONG_ENGLISH),
            news(3, "x", "A short one", slug="my-own-words"),                                          # short and in English letters: it stays
            news(4, "नवी बातमी", slug="नवी-बातमी", old_slugs="an-even-older-one")]
    cur = _fake_database(monkeypatch, rows)
    assert database.shorten_slugs() == 3
    assert [r["slug"] for r in rows] == ["solapur-jilha-bankechya-sanchalakpadi-manish-deshmukh", "one-step-one-family-joy", "my-own-words", "navi-batmi"]
    assert [r["old_slugs"] for r in rows] == [LONG_MARATHI, LONG_ENGLISH, None, "an-even-older-one,नवी-बातमी"]
    assert database.shorten_slugs() == 0 and cur.updates == 3                                          # a second start changes nothing


def test_two_stories_never_share_an_address_old_ones_included(monkeypatch):
    rows = [news(1, "x", "Same headline", slug="same-headline"),
            news(2, "x", "Other", slug="other", old_slugs="same-headline-2"),                          # (story 2 had these words once: they stay its own)
            news(3, "x", "Same headline", slug="same-headline-" + "x" * 60),
            news(4, "x", "Same headline")]
    _fake_database(monkeypatch, rows)
    assert database.backfill_slugs() == 1 and database.shorten_slugs() == 1
    assert [r["slug"] for r in rows] == ["same-headline", "other", "same-headline-4", "same-headline-3"]


def test_no_address_is_changed_while_the_old_one_could_not_be_kept(monkeypatch):
    rows = [news(1, "नवी बातमी", slug="नवी-बातमी")]
    _fake_database(monkeypatch, rows, old_column=False)
    assert database.shorten_slugs() == 0 and rows[0]["slug"] == "नवी-बातमी"


def test_an_address_a_story_had_before_goes_to_the_one_it_has_now(client, db):
    story(db, 7, "solapur-bank-winner", "rajkiy", categoryLabel="राजकीय", old_slugs=f"{LONG_MARATHI},older-words")
    for old in ("%E0%A4%B8%E0%A5%8B%E0%A4%B2%E0%A4%BE%E0%A4%AA%E0%A5%82%E0%A4%B0-%E0%A4%9C%E0%A4%BF%E0%A4%B2%E0%A5%8D%E0%A4%B9%E0%A4%BE-"
                "%E0%A4%AC%E0%A4%81%E0%A4%95%E0%A5%87%E0%A4%9A%E0%A5%8D%E0%A4%AF%E0%A4%BE-%E0%A4%B8%E0%A4%82%E0%A4%9A%E0%A4%BE%E0%A4%B2%E0%A4%95%E0%A4%AA%E0%A4%A6%E0%A5%80-"
                "%E0%A4%AE%E0%A4%A8%E0%A4%BF%E0%A4%B7-%E0%A4%A6%E0%A5%87%E0%A4%B6%E0%A4%AE%E0%A5%81%E0%A4%96-%E0%A4%B5%E0%A4%BF%E0%A4%9C%E0%A4%AF%E0%A5%80", "older-words"):
        reply = client.get(f"/api/page/rajkiy/{old}")
        assert reply.status_code == 301 and reply.headers["Location"] == f"{SITE}/rajkiy/solapur-bank-winner", old
    reply = client.get("/api/page/blog/older-words?lang=en")                                           # (the wrong section too: one step to the right page)
    assert reply.status_code == 301 and reply.headers["Location"] == f"{SITE}/rajkiy/solapur-bank-winner?lang=en"
    assert client.get("/api/page/rajkiy/solapur-bank-winner").status_code == 200


# ---------------------------------------------------------------------------------------------------- the page of a video
def video(db, id, slug, **fields):
    row = {"id": id, "slug": slug, "title": f"व्हिडिओ {id}", "title_en": f"Video {id}", "description": "<b>पाण्यासाठी</b> काम", "description_en": "Work for water",
           "video_url": "https://media.example.org/videos/a_1790000000_abc123.mp4", "thumbnail": "https://media.example.org/images/p.jpg", "duration_sec": 95,
           "sort_order": id, "created_at": "2026-10-13 06:24:00", **fields}
    db.videos[id] = row
    return row


def test_page_of_a_video_has_its_title_picture_and_player(client, db):
    video(db, 3, "jalsandharan")
    reply = client.get("/api/page/video/jalsandharan")
    page = reply.get_data(as_text=True)
    assert reply.status_code == 200 and "<title>व्हिडिओ 3 | लोकमंगल न्यूज पोर्टल</title>" in page and "Home title" not in page and "seed story" not in page
    assert f'<link rel="canonical" href="{SITE}/video/jalsandharan" />' in page and '<meta property="og:type" content="video.other" />' in page
    assert '<meta property="og:image" content="https://media.example.org/images/p.jpg" />' in page and 'content="पाण्यासाठी काम"' in page
    assert '<video controls preload="none" poster="https://media.example.org/images/p.jpg" src="https://media.example.org/videos/a_1790000000_abc123.mp4">' in page
    data = json.loads(re.search(r'id="ld-view">(.*?)</script>', page, re.S).group(1))[0]
    assert data["@type"] == "VideoObject" and data["contentUrl"].endswith(".mp4") and data["duration"] == "PT1M35S"
    assert data["uploadDate"] == "2026-10-13T11:54:00+05:30" and data["thumbnailUrl"] == ["https://media.example.org/images/p.jpg"]
    english = client.get("/api/page/video/jalsandharan?lang=en").get_data(as_text=True)
    assert "<title>Video 3 | Lokmangal News Portal</title>" in english and "Work for water" in english


def test_page_of_a_youtube_video(client, db):
    video(db, 4, "on-youtube", video_url="https://youtu.be/abcdefghijk", thumbnail="", description="", duration_sec=None)
    page = client.get("/api/page/video/on-youtube").get_data(as_text=True)
    assert '<iframe src="https://www.youtube-nocookie.com/embed/abcdefghijk"' in page
    assert '<meta property="og:image" content="https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg" />' in page
    data = json.loads(re.search(r'id="ld-view">(.*?)</script>', page, re.S).group(1))[0]
    assert data["embedUrl"] == "https://www.youtube.com/embed/abcdefghijk" and "duration" not in data and "contentUrl" not in data


def test_unknown_and_wrongly_written_video_addresses(client, db):
    video(db, 3, "jalsandharan")
    reply = client.get("/api/page/video/Jalsandharan")
    assert reply.status_code == 301 and reply.headers["Location"] == f"{SITE}/video/jalsandharan"
    reply = client.get("/api/page/video/nothing")
    assert reply.status_code == 404 and '<meta name="robots" content="noindex" />' in reply.get_data(as_text=True)


def test_nothing_in_a_video_can_break_out_of_the_page(client, db):
    video(db, 3, "x", title='</title><script>alert(1)</script>"', description='<img src=x onerror=alert(2)>', video_url='https://e.example/a.mp4?"><script>alert(3)</script>')
    page = client.get("/api/page/video/x").get_data(as_text=True)
    assert "<script>alert" not in page and "onerror=alert" not in page and page.count("<title>") == 1


def test_videos_are_in_the_sitemap(client, db):
    video(db, 3, "jalsandharan")
    video(db, 4, "")                                                                                   # (no words yet: not listed)
    xml = client.get("/api/sitemap.xml").data
    locs = [u.find(SM + "loc").text for u in ET.fromstring(xml).findall(SM + "url")]
    assert [u for u in locs if "/video/" in u] == [f"{SITE}/video/jalsandharan"]


def test_a_saved_video_is_told_to_the_search_engines(client, admin, db, monkeypatch):
    told = []
    monkeypatch.setattr(config, "INDEXNOW_KEY", "k" * 32)
    monkeypatch.setattr(indexnow, "submit", lambda urls: told.append(list(urls)) or list(urls))
    new = client.post("/api/videos", headers=admin, json={"title": "नवा व्हिडिओ", "video_url": "https://youtu.be/abcdefghijk"}).get_json()["video"]
    db.videos[new["id"]]["slug"] = "nava-video"
    client.put(f"/api/videos/{new['id']}", headers=admin, json={"title": "बदल"})
    assert told[-1] == [f"{SITE}/video/nava-video", f"{SITE}/"]
    client.delete(f"/api/videos/{new['id']}", headers=admin)
    assert told[-1] == [f"{SITE}/video/nava-video", f"{SITE}/"]


def test_page_of_a_section_has_its_own_preview(client, db):
    reply = client.get("/api/page/blog")
    page = reply.get_data(as_text=True)
    assert reply.status_code == 200
    assert "<title>ब्लॉग्स | लोकमंगल न्यूज पोर्टल</title>" in page and "Home title" not in page
    assert f'<link rel="canonical" href="{SITE}/blog" />' in page and f'<meta property="og:url" content="{SITE}/blog" />' in page
    assert '<meta property="og:title" content="ब्लॉग्स" />' in page and '<meta property="og:type" content="website" />' in page
    assert f'<meta property="og:image" content="{SITE}/assets/og-default.jpg" />' in page and 'og:image:width" content="1200"' in page
    assert '"@type": "CollectionPage"' in page and '"@type": "BreadcrumbList"' in page
    assert "css/style.css" in page and "seed story" in page and '<base href="/"' in page          # (the rest is the website's own, it draws the section)
    for kind, name in (("rajkiy", "राजकीय बातम्या"), ("samajik", "सामाजिक बातम्या"), ("review", "रिव्ह्यू"), ("weekly", "लोकमंगल साप्ताहिक आवृत्ती - PDF ई-पेपर")):
        page = client.get(f"/api/page/{kind}").get_data(as_text=True)
        assert f"<title>{name} | " in page and f'rel="canonical" href="{SITE}/{kind}"' in page
    assert client.get("/api/page/nonsense").status_code == 404


def test_section_page_in_english(client, db):
    page = client.get("/api/page/rajkiy?lang=en").get_data(as_text=True)
    assert '<html lang="en"' in page and "<title>Political News | Lokmangal News Portal</title>" in page and "Latest political news from Maharashtra" in page


def test_section_page_without_the_website_is_the_plain_preview_page(client, db, monkeypatch):
    monkeypatch.setattr(seo, "shell_html", lambda: None)
    page = client.get("/api/page/blog").get_data(as_text=True)
    assert "og:title" in page and "ब्लॉग्स" in page and f"url={SITE}/blog" in page


# ---------------------------------------------------------------------------------------------------- the small photo of a preview card
def _photo(width, height, fmt="PNG"):
    import os
    from PIL import Image
    img = Image.frombytes("RGB", (width, height), os.urandom(width * height * 3))              # (noise: the biggest file for its size)
    out = __import__("io").BytesIO()
    img.save(out, fmt)
    return out.getvalue()


@pytest.fixture
def cards(monkeypatch):
    pytest.importorskip("PIL")
    seo._CARDS.clear()
    monkeypatch.setattr(config, "PREVIEW_IMAGES", True)
    monkeypatch.setattr(config, "PUBLIC_API_URL", "https://api.example.org")


def test_a_big_photo_is_given_to_the_preview_as_a_small_jpeg(client, db, cards, monkeypatch):
    from PIL import Image
    import io
    story(db, 7, "big-photo", image="https://media.example.org/images/big.png")
    big = _photo(3000, 2000)
    assert len(big) > 5_000_000
    monkeypatch.setattr(seo, "_read_photo", lambda src, site: big)
    page = client.get("/api/page/blog/big-photo").get_data(as_text=True)
    assert re.search(r'<meta property="og:image" content="https://api\.example\.org/api/og-image/7\.jpg\?v=[0-9a-f]{8}" />', page)
    assert re.search(r'<meta name="twitter:image" content="https://api\.example\.org/api/og-image/7\.jpg\?v=', page)
    assert '"image": ["https://media.example.org/images/big.png"]' in page                       # (the structured data keeps the full photo)
    reply = client.get("/api/og-image/7.jpg")
    assert reply.status_code == 200 and reply.mimetype == "image/jpeg" and len(reply.data) <= 300 * 1024
    img = Image.open(io.BytesIO(reply.data))
    assert img.format == "JPEG" and img.width == 1200 and img.height == 800
    assert "max-age" in reply.headers["Cache-Control"]
    monkeypatch.setattr(seo, "_read_photo", lambda src, site: (_ for _ in ()).throw(AssertionError("read again")))
    assert client.get("/api/og-image/7.jpg").status_code == 200                                    # (kept: the photo is not fetched a second time)


def test_a_small_photo_or_a_failure_sends_the_preview_to_the_original(client, db, cards, monkeypatch):
    story(db, 8, "small-photo", image="https://media.example.org/images/small.png")
    monkeypatch.setattr(seo, "_read_photo", lambda src, site: _photo(300, 200))
    reply = client.get("/api/og-image/8.jpg")
    assert reply.status_code == 302 and reply.headers["Location"] == "https://media.example.org/images/small.png"
    seo._CARDS.clear()

    def broken(src, site):
        raise OSError("down")
    monkeypatch.setattr(seo, "_read_photo", broken)
    reply = client.get("/api/og-image/8.jpg")
    assert reply.status_code == 302 and reply.headers["Location"] == "https://media.example.org/images/small.png"
    assert 8 not in seo._CARDS                                                                    # (a failure is not remembered)
    assert client.get("/api/og-image/999.jpg").status_code == 404


def test_the_default_card_and_the_setting_off_keep_the_photo_as_it_is(client, db, monkeypatch):
    story(db, 9, "plain", image="https://media.example.org/images/x.jpg")
    page = client.get("/api/page/blog/plain").get_data(as_text=True)
    assert '<meta property="og:image" content="https://media.example.org/images/x.jpg" />' in page             # (PREVIEW_IMAGES is off in the tests)
    monkeypatch.setattr(config, "PREVIEW_IMAGES", True)
    story(db, 10, "none", image="")
    assert f'<meta property="og:image" content="{SITE}/assets/og-default.jpg" />' in client.get("/api/page/blog/none").get_data(as_text=True)
