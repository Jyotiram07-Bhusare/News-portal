"""What an editor (or an attacker) sends is cleaned before it is saved; the right data is saved exactly."""
import pytest

import sanitize
from sanitize import ValidationError


# ---- the cleaning functions ----
def test_plain_removes_markup_but_keeps_text():
    assert sanitize.plain("<b>सोलापूर</b> बातमी") == "सोलापूर बातमी"
    assert sanitize.plain("A & B") == "A & B"
    assert sanitize.plain("  लोकमंगल  ") == "लोकमंगल"
    assert sanitize.plain('x <img src=x onerror=alert(1)> y') == "x  y"
    assert sanitize.plain("<script>alert(1)</script>ok") == "ok"
    assert "<" not in sanitize.plain("a < b > c <") and ">" not in sanitize.plain("a < b > c <")
    assert sanitize.plain(None) == ""


def test_plain_has_a_length_limit():
    with pytest.raises(ValidationError):
        sanitize.plain("x" * 501, 500, "The headline")


def test_story_keeps_formatting_and_drops_dangerous_parts():
    html = '<p>पहिला <strong>ठळक</strong></p><script>alert(1)</script><p onclick="x()">दुसरा</p>' \
           '<a href="javascript:alert(1)">bad</a><a href="https://example.org/a">good</a>' \
           '<img src="x" onerror="alert(1)"><iframe src="https://evil"></iframe>'
    cleaned = sanitize.story(html)
    assert "<p>पहिला <strong>ठळक</strong></p>" in cleaned
    for bad in ("script", "onclick", "onerror", "javascript:", "iframe", "alert"):
        assert bad not in cleaned
    assert 'href="https://example.org/a"' in cleaned and "noopener" in cleaned


def test_story_keeps_a_table_with_its_scroll_wrapper_and_nothing_else_on_a_div():
    table = ('<div class="article-table-wrap"><table><thead><tr><th>Details</th><th>Amount</th></tr></thead>'
             '<tbody><tr><td>Monthly cost</td><td>₹1,500</td></tr></tbody></table></div>')
    assert sanitize.story(table) == table
    cleaned = sanitize.story(table + '<div class="evil" onclick="x()">t</div><table onclick="x()"><tr><td style="color:red">c</td></tr></table>')
    for bad in ('class="evil"', "onclick", "style"):
        assert bad not in cleaned
    assert "<td>c</td>" in cleaned and cleaned.startswith(table)


def test_story_keeps_the_existing_seed_formatting():
    seed = "<p><strong>सोलापूर:</strong> लोकमंगल फाउंडेशन</p>\n<p>दुसरा परिच्छेद</p>"
    assert sanitize.story(seed) == seed


@pytest.mark.parametrize("value", ["assets/images/a.jpg", "https://images.unsplash.com/photo-1?auto=format&fit=crop&w=800&q=80",
                                   "https://d1234.cloudfront.net/images/a_1_ab12.png"])
def test_picture_accepts_site_files_and_https(value):
    assert sanitize.picture(value) == value


@pytest.mark.parametrize("value", ["javascript:alert(1)", "data:text/html,<script>", "http://insecure.example/a.jpg",
                                   'https://x/"onerror="alert(1)', "assets/../../etc/passwd", "ftp://x/y.jpg", "//evil.example/a.jpg",
                                   "https://x/a b.jpg", "assets/images/a'.jpg"])
def test_picture_refuses_everything_else(value):
    with pytest.raises(ValidationError):
        sanitize.picture(value)


def test_picture_tidies_relative_prefixes_and_defaults():
    assert sanitize.picture("../assets/images/a.jpg") == "assets/images/a.jpg"
    assert sanitize.picture("/assets/images/a.jpg") == "assets/images/a.jpg"
    assert sanitize.picture("", default="assets/images/d.jpg") == "assets/images/d.jpg"


def test_pdf_reference():
    assert sanitize.pdf_reference("lokmangal-weekly-30.pdf", "x") == "lokmangal-weekly-30.pdf"
    assert sanitize.pdf_reference("https://cdn.example.org/pdf/lokmangal-weekly-30.pdf", "x").startswith("https://")
    assert sanitize.pdf_reference("", "lokmangal-weekly-5.pdf") == "lokmangal-weekly-5.pdf"
    for bad in ("../secret.pdf", "a/b.pdf", "evil.exe", 'x".pdf', "javascript:alert(1).pdf"):
        with pytest.raises(ValidationError):
            sanitize.pdf_reference(bad, "x")


# ---- whole records ----
def test_article_create_cleans_every_field():
    clean = sanitize.article({
        "title": "<b>शीर्षक</b>", "category": "samajik", "categoryLabel": "<script>x</script>", "author": "<i>बातमीदार</i>",
        "date": "२ सप्टेंबर २०२६", "image": "assets/images/a.jpg", "excerpt": "सारांश <img src=x onerror=1>",
        "content": "<p>मजकूर</p><script>1</script>", "views": "1.2K", "is_lead": "1", "is_popular": 0, "title_en": "Title <b>x</b>",
    }, creating=True)
    assert clean["title"] == "शीर्षक"
    assert clean["categoryLabel"] == "सामाजिक"                        # never taken from the client
    assert clean["author"] == "बातमीदार" and clean["excerpt"] == "सारांश"
    assert clean["content"] == "<p>मजकूर</p>"
    assert clean["is_lead"] == 1 and clean["is_popular"] == 0
    assert clean["title_en"] == "Title x"


def test_article_update_only_returns_what_was_sent():
    assert sanitize.article({"author": "नवीन"}, creating=False) == {"author": "नवीन"}


def test_article_needs_a_title_and_a_known_category():
    with pytest.raises(ValidationError, match="Headline"):
        sanitize.article({"title": "  <b></b> "}, creating=True)
    with pytest.raises(ValidationError, match="category"):
        sanitize.article({"title": "x", "category": "<script>"}, creating=True)
    with pytest.raises(ValidationError):
        sanitize.article({"title": "x", "image": "javascript:alert(1)"}, creating=True)


def test_weekly_record():
    clean = sanitize.weekly({"issue_no": "69", "title": "<b>हेडलाईन</b>", "date": "०२ सप्टेंबर २०२६", "image": "assets/weekly/69.jpg",
                             "description": "परिचय <script>1</script>", "pdf_filename": "", "views": "—"})
    assert clean["issue_no"] == 69 and clean["title"] == "हेडलाईन"
    assert clean["pdf_filename"] == "lokmangal-weekly-69.pdf" and clean["description"] == "परिचय"
    for bad in ({"issue_no": "x", "title": "t"}, {"issue_no": 0, "title": "t"}, {"issue_no": 5, "title": ""}, {"issue_no": 10**7, "title": "t"}):
        with pytest.raises(ValidationError):
            sanitize.weekly(bad)


def test_video_record():
    clean = sanitize.video({"title": "<b>व्हिडिओ</b>", "video_url": "https://www.youtube.com/watch?v=abcdefghijk",
                            "thumbnail": "https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg", "duration_sec": "61.4",
                            "size_bytes": "", "sort_order": "2"}, creating=True)
    assert clean["title"] == "व्हिडिओ" and clean["duration_sec"] == 61 and clean["size_bytes"] is None and clean["sort_order"] == 2
    for bad in ({"title": "t", "video_url": "javascript:alert(1)"}, {"title": "t", "video_url": "assets/videos/../x.mp4"},
                {"title": "t", "video_url": "ftp://x/y.mp4"}, {"title": "", "video_url": "https://x/y.mp4"},
                {"title": "t", "video_url": "https://x/y.mp4", "duration_sec": "-3"},
                {"title": "t", "video_url": "https://x/y.mp4", "sort_order": "0"},
                {"title": "t", "video_url": "https://x/y.mp4", "thumbnail": "javascript:1"}):
        with pytest.raises(ValidationError):
            sanitize.video(bad, creating=True)


# ---- through the API ----
def test_api_stores_cleaned_data(client, admin, db):
    reply = client.post("/api/articles", headers=admin, json={
        "title": "<img src=x onerror=alert(1)>बातमी", "category": "rajkiy", "content": "<p>ok</p><script>alert(1)</script>",
        "image": "assets/images/a.jpg", "categoryLabel": "<script>"})
    assert reply.status_code == 201
    row = db.articles[reply.get_json()["article"]["id"]]
    assert row["title"] == "बातमी" and row["content"] == "<p>ok</p>" and row["categoryLabel"] == "राजकीय"


def test_api_refuses_a_bad_picture_and_a_missing_title(client, admin):
    assert client.post("/api/articles", headers=admin, json={"title": "x", "image": "javascript:alert(1)"}).status_code == 400
    assert client.post("/api/articles", headers=admin, json={"title": ""}).status_code == 400
    assert client.post("/api/articles", headers=admin, json={}).status_code == 400


def test_api_update_and_delete(client, admin, db):
    new_id = client.post("/api/articles", headers=admin, json={"title": "पहिली"}).get_json()["article"]["id"]
    assert client.put(f"/api/articles/{new_id}", headers=admin, json={"title": "<u>बदललेली</u>"}).status_code == 200
    assert db.articles[new_id]["title"] == "बदललेली"
    assert client.put("/api/articles/424242", headers=admin, json={"title": "x"}).status_code == 404
    assert client.put(f"/api/articles/{new_id}", headers=admin, json={}).status_code == 400
    assert client.delete(f"/api/articles/{new_id}", headers=admin).status_code == 200
    assert client.delete(f"/api/articles/{new_id}", headers=admin).status_code == 404


def test_api_weekly_roundtrip(client, admin, db):
    reply = client.post("/api/weekly", headers=admin, json={"issue_no": 69, "title": "अंक", "date": "x", "image": "assets/weekly/69.jpg"})
    assert reply.status_code == 201 and db.weekly[69]["pdf_filename"] == "lokmangal-weekly-69.pdf"
    assert client.post("/api/weekly", headers=admin, json={"issue_no": "abc", "title": "x"}).status_code == 400
    assert client.delete("/api/weekly/69", headers=admin).status_code == 200


def test_api_never_leaks_database_details(client, admin, monkeypatch):
    import database
    import pymysql

    def boom(*_a, **_k):
        raise pymysql.err.IntegrityError(1062, "Duplicate entry 'secret-table-name' for key 'uq_internal'")
    monkeypatch.setattr(database, "create_article", boom)
    reply = client.post("/api/articles", headers=admin, json={"title": "x"})
    assert reply.status_code == 400
    assert "secret-table-name" not in reply.get_data(as_text=True)
