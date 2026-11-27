"""The writing tools of the Admin Panel: headings and lists in a story, bold / italic / underline in the short texts (summary, introductions)."""
import sanitize


def test_a_story_keeps_the_headings_lists_and_underline_of_the_toolbar():
    story = "<h2>मोठे</h2>\n<h3>मध्यम</h3>\n<h4>लहान</h4>\n<ul><li><strong>एक</strong></li></ul>\n<ol><li><em>दोन</em></li></ol>\n<p><u>ओळ</u><br>पुढे</p>"
    assert sanitize.story(story) == story


def test_a_short_text_keeps_only_bold_italic_underline_and_line_breaks():
    dirty = '<h2 onclick="x()">शीर्षक</h2> <strong style="color:red">ठळक</strong> <em>तिरके</em> <u>रेघ</u><br> <img src=x onerror=1><script>1</script><a href="javascript:1">दुवा</a>'
    assert sanitize.inline(dirty) == "शीर्षक <strong>ठळक</strong> <em>तिरके</em> <u>रेघ</u><br> दुवा"


def test_a_short_text_without_formatting_stays_plain_text():
    assert sanitize.inline("A & B, लोकमंगल") == "A & B, लोकमंगल"
    assert sanitize.inline("  साधा <span>मजकूर</span>  ") == "साधा मजकूर"
    assert sanitize.inline(None) == "" and sanitize.inline("<br><br>") == "" and sanitize.inline("<strong> </strong>") == ""


def test_the_admin_api_saves_formatted_short_texts(client, admin, db):
    made = client.post("/api/articles", headers=admin, json={"title": "t", "category": "blogs", "author": "a", "image": "assets/images/a.jpg",
                       "excerpt": "<strong>ठळक</strong> सारांश", "excerpt_en": "<u>Summary</u>", "content": "<h2>H</h2><ol><li>x</li></ol>"})
    article = made.get_json()["article"]
    assert article["excerpt"] == "<strong>ठळक</strong> सारांश" and article["excerpt_en"] == "<u>Summary</u>"
    assert article["content"] == "<h2>H</h2><ol><li>x</li></ol>"
    weekly = sanitize.weekly({"issue_no": 5, "title": "t", "description": "<em>परिचय</em>", "image": "assets/weekly/5.jpg"})
    assert weekly["description"] == "<em>परिचय</em>"
    video = sanitize.video({"title": "t", "video_url": "https://x/y.mp4", "description": "<u>व्हिडिओ</u><div>x</div>"}, creating=True)
    assert video["description"] == "<u>व्हिडिओ</u>x"


def test_the_page_of_a_weekly_issue_shows_only_the_words_of_its_introduction(client, db):
    db.weekly[68] = {"issue_no": 68, "title": "अंक", "title_en": "", "date": "२६ ऑगस्ट २०२६", "description": "<strong>ठळक</strong> परिचय",
                     "image": "assets/weekly/68.jpg", "created_at": "2026-10-16 07:25:53"}
    page = client.get("/api/share/issue/68").get_data(as_text=True)
    assert "<p>ठळक परिचय</p>" in page and "&lt;strong&gt;" not in page
