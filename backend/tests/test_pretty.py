"""Pretty addresses: the words of a title in the address (/blog/<words>), the page the server makes for such an address, the sitemap / feed that use them."""
import json
import re
import xml.etree.ElementTree as ET

import pytest

import config
import database
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


# ---------------------------------------------------------------------------------------------------- the words of an address
def test_slugify():
    assert database.slugify("Solapur South: MLA Wins!") == "solapur-south-mla-wins"
    assert database.slugify("  --Hello,   World--  ") == "hello-world"
    assert database.slugify("एक पाऊल, एका कुटुंबाचा आनंद!") == "एक-पाऊल-एका-कुटुंबाचा-आनंद"
    assert database.slugify("लोकमंगल Annapurna योजना") == "लोकमंगल-annapurna-योजना"
    assert database.slugify("१९ ते २५ ऑगस्ट २०२६") == "१९-ते-२५-ऑगस्ट-२०२६"
    assert database.slugify("!!!") == "story" and database.slugify("") == "story" and database.slugify(None) == "story"
    assert database.slugify("<script>alert(1)</script>") == "script-alert-1-script"
    long = database.slugify("word " * 60)
    assert len(long) <= database.SLUG_LIMIT and not long.endswith("-") and long.startswith("word-word")


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
