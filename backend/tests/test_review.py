"""The Review section (रिव्ह्यू) in the Admin Panel: the रिव्ह्यू category and the रिव्ह्यू placement box are saved like the others."""
import sanitize


def test_the_review_category_and_box_are_cleaned_like_the_others():
    clean = sanitize.article({"title": "चित्रपट", "category": "review", "is_review": "1"}, creating=True)
    assert clean["category"] == "review" and clean["categoryLabel"] == "रिव्ह्यू"
    assert clean["is_review"] == 1
    assert sanitize.article({"is_review": "0"}, creating=False) == {"is_review": 0}


def test_admin_saves_a_review_and_ticks_the_review_box(client, admin, db):
    reply = client.post("/api/articles", headers=admin, json={
        "title": "पुस्तक रिव्ह्यू", "category": "review", "is_review": 1, "image": "assets/images/a.jpg"})
    assert reply.status_code == 201, reply.get_json()
    saved = db.articles[reply.get_json()["article"]["id"]]
    assert saved["category"] == "review" and saved["categoryLabel"] == "रिव्ह्यू" and saved["is_review"] == 1

    news = db.create_article({"title": "बातमी", "category": "rajkiy"})
    reply = client.post(f"/api/articles/{news}/toggle-placement", headers=admin, json={"field": "is_review"})
    assert reply.status_code == 200 and reply.get_json()["article"]["is_review"] == 1
    reply = client.post(f"/api/articles/{news}/toggle-placement", headers=admin, json={"field": "is_review"})
    assert reply.status_code == 200 and reply.get_json()["article"]["is_review"] == 0


def test_the_review_box_needs_a_login(client, db):
    news = db.create_article({"title": "बातमी", "category": "rajkiy"})
    assert client.post(f"/api/articles/{news}/toggle-placement", json={"field": "is_review"}).status_code == 401
    assert db.articles[news].get("is_review", 0) == 0
