"""Public comments: written without a login under a news / blog / weekly issue, one level of replies, likes / dislikes, reports; the Admin Panel lists
and deletes them. The rules of the contract between the API, the website and the Admin Panel."""
import time

import pytest

import app as app_module
import commenters
import sanitize

VISITOR = "visitor-0001-aaaa"
OTHER = "visitor-0002-bbbb"


READER = {}


def token_for(db, name, email=None):
    """The token of a signed-in reader (made straight in the fake database: signing in itself is tested in test_commenters.py)."""
    return commenters.issue_token(db.sign_in_commenter(email or f"{name.lower()}@example.com", name, "email")["id"])


@pytest.fixture(autouse=True)
def fresh_hits(db):
    app_module._hits.clear()
    READER["token"] = token_for(db, "Rinku")              # every test has Rinku signed in, unless it says otherwise
    yield
    app_module._hits.clear()


def story(db, **data):
    return db.create_article({"title": "बातमी", "category": "rajkiy", **data})


def post(client, item=None, **fields):
    data = {"type": "article", "id": item, "token": READER["token"], "body": "छान बातमी", "visitor": VISITOR, **fields}
    return client.post("/api/comments", json=data)


# ---------------------------------------------------------------- cleaning
def test_name_and_body_are_cleaned_and_limited():
    assert sanitize.comment_name("  Rinku   Singh \n") == "Rinku Singh"
    assert sanitize.email_address("  Rinku.Singh@Example.COM ") == "rinku.singh@example.com"
    for bad in ("", "no-at.example.com", "a@b", "a@@b.com", "a b@c.com", "x" * 200 + "@a.com", None, 5):
        with pytest.raises(sanitize.ValidationError):
            sanitize.email_address(bad)
    assert sanitize.mobile_number("+91 98765-43210") == "9876543210" and sanitize.mobile_number(9876543210) == "9876543210"
    for bad in ("", None, True, "12345", "1234567890", "98765432", "98765432100", "+1 9876543210", "98765x3210", 0):
        with pytest.raises(sanitize.ValidationError):
            sanitize.mobile_number(bad)
    assert sanitize.comment_body("a\r\n\r\n\r\n\r\n\r\nb\x07 ") == "a\n\n\nb"
    assert sanitize.comment_body("<b>hi</b> <script>alert(1)</script>there") == "hi there"          # (plain text: no markup is kept)
    for bad in ("", "   ", None):
        with pytest.raises(sanitize.ValidationError):
            sanitize.comment_name(bad)
        with pytest.raises(sanitize.ValidationError):
            sanitize.comment_body(bad)
    assert len(sanitize.comment_name("न" * 60)) == 60 and len(sanitize.comment_body("न" * 2000)) == 2000
    with pytest.raises(sanitize.ValidationError):
        sanitize.comment_name("न" * 61)
    with pytest.raises(sanitize.ValidationError):
        sanitize.comment_body("न" * 2001)


def test_a_visitor_id_is_8_to_64_letters_digits_and_dashes():
    assert sanitize.visitor_id("abcd-1234") == "abcd-1234"
    for bad in (None, "", "short", "x" * 65, "has space 123", "ünicode-1234", 12345678):
        assert sanitize.visitor_id(bad) is None


# ---------------------------------------------------------------- writing
def test_a_visitor_comments_without_a_login(client, db):
    sid = story(db)
    reply = post(client, sid)
    assert reply.status_code == 201
    comment = reply.get_json()["comment"]
    assert comment["name"] == "Rinku" and comment["body"] == "छान बातमी" and comment["replies"] == [] and comment["parent_id"] is None
    assert set(comment) == {"id", "parent_id", "name", "body", "likes", "dislikes", "created_at", "my_vote", "replies"}


def test_a_weekly_issue_takes_comments_too(client, db):
    db.create_weekly_edition({"issue_no": 7, "title": "अंक", "date": "x", "image": "x", "pdf_filename": "x", "views": "1"})
    assert post(client, 7, type="weekly").status_code == 201
    assert client.get("/api/comments?type=weekly&id=7").get_json()["total"] == 1
    assert client.get("/api/comments?type=article&id=7").get_json()["total"] == 0


@pytest.mark.parametrize("fields", [{"type": "video"}, {"type": None}, {"id": "abc"}, {"id": True}, {"id": -1}, {"parent_id": "x"},
                                    {"body": " "}, {"body": ""}, {"body": "न" * 2001}])
def test_bad_input_is_refused(client, db, fields):
    sid = story(db)
    data = {"type": "article", "id": sid, "token": READER["token"], "body": "b", "visitor": VISITOR, **fields}
    reply = client.post("/api/comments", json=data)
    assert reply.status_code == 400 and reply.get_json()["success"] is False and reply.get_json()["error"]
    assert db.comments == {}


def test_an_unknown_story_is_404(client, db):
    assert post(client, 999).status_code == 404


@pytest.mark.parametrize("token", [None, "", "not-a-token", 5])
def test_a_comment_needs_a_signed_in_reader(client, db, token):
    sid = story(db)
    reply = post(client, sid, token=token)
    assert reply.status_code == 401 and reply.get_json()["login_required"] is True and db.comments == {}


def test_the_admin_token_does_not_sign_a_reader_in(client, db, admin):
    sid = story(db)
    assert post(client, sid, token=admin["Authorization"].split()[1]).status_code == 401


def test_the_name_under_a_comment_is_the_readers_not_the_one_in_the_request(client, db):
    sid = story(db)
    comment = post(client, sid, name="Somebody Else").get_json()["comment"]
    assert comment["name"] == "Rinku" and db.comments[comment["id"]]["commenter_id"] == 1


def test_a_reader_who_is_gone_is_signed_out(client, db):
    sid = story(db)
    db.commenters.clear()
    assert post(client, sid).status_code == 401


def test_the_hidden_field_only_a_robot_fills_in_is_told_it_worked_and_nothing_is_saved(client, db):
    sid = story(db)
    reply = post(client, sid, website="http://spam.example")
    assert reply.status_code == 201 and reply.get_json()["comment"]["body"] == "छान बातमी"
    assert db.comments == {}


def test_replies_stay_one_level_deep(client, db):
    sid = story(db)
    top = post(client, sid).get_json()["comment"]["id"]
    first = post(client, sid, parent_id=top, body="उत्तर").get_json()["comment"]
    assert first["parent_id"] == top and "replies" not in first
    second = post(client, sid, parent_id=first["id"], body="@Rinku उत्तराला उत्तर").get_json()["comment"]
    assert second["parent_id"] == top                                   # (saved under the top-level comment)
    listed = client.get(f"/api/comments?type=article&id={sid}").get_json()
    assert listed["total"] == 3 and len(listed["comments"]) == 1
    assert [r["id"] for r in listed["comments"][0]["replies"]] == [first["id"], second["id"]]       # oldest first


def test_a_parent_from_another_story_is_refused(client, db):
    one, two = story(db), story(db)
    top = post(client, one).get_json()["comment"]["id"]
    assert post(client, two, parent_id=top).status_code == 400
    assert post(client, one, parent_id=424242).status_code == 400


def test_one_address_may_write_5_comments_in_10_minutes(client, db):
    sid = story(db)
    assert [post(client, sid).status_code for _ in range(5)] == [201] * 5
    refused = post(client, sid)
    assert refused.status_code == 429 and refused.get_json()["success"] is False


def test_one_address_may_write_30_comments_a_day(client, db, monkeypatch):
    sid = story(db)
    clock = {"now": time.time()}                                          # (the readers' tokens were made at the real time)
    monkeypatch.setattr(app_module.time, "time", lambda: clock["now"])
    sent = 0
    for _ in range(8):                                                  # 8 bursts of 5, each one 11 minutes after the last
        for _ in range(5):
            sent += post(client, sid).status_code == 201
        clock["now"] += 660
    assert sent == 30 and post(client, sid).status_code == 429


# ---------------------------------------------------------------- reading
def test_the_list_is_newest_first_and_never_shows_private_fields(client, db):
    sid = story(db)
    first = post(client, sid, body="पहिली").get_json()["comment"]["id"]
    second = post(client, sid, body="दुसरी").get_json()["comment"]["id"]
    reply = client.get(f"/api/comments?type=article&id={sid}&visitor={VISITOR}")
    assert reply.headers["Cache-Control"] == "no-store"
    comments = reply.get_json()["comments"]
    assert [c["id"] for c in comments] == [second, first]
    text = reply.get_data(as_text=True)
    for private in ("visitor", "reports", "ip", "hash", VISITOR):
        assert private not in text.replace('"success"', "")


@pytest.mark.parametrize("query", ["type=x&id=1", "id=1", "type=article", "type=article&id=abc"])
def test_a_bad_list_request_is_400(client, db, query):
    reply = client.get("/api/comments?" + query)
    assert reply.status_code == 400 and reply.get_json()["success"] is False


def test_an_unknown_story_has_an_empty_list(client, db):
    assert client.get("/api/comments?type=article&id=999").get_json() == {"success": True, "total": 0, "comments": []}


def test_my_vote_belongs_to_the_visitor_who_asks(client, db):
    sid = story(db)
    cid = post(client, sid).get_json()["comment"]["id"]
    client.post(f"/api/comments/{cid}/vote", json={"vote": 1, "visitor": VISITOR})
    mine = client.get(f"/api/comments?type=article&id={sid}&visitor={VISITOR}").get_json()["comments"][0]
    other = client.get(f"/api/comments?type=article&id={sid}&visitor={OTHER}").get_json()["comments"][0]
    nobody = client.get(f"/api/comments?type=article&id={sid}&visitor=x").get_json()["comments"][0]
    assert (mine["my_vote"], other["my_vote"], nobody["my_vote"]) == (1, 0, 0)


# ---------------------------------------------------------------- votes and reports
def test_a_vote_is_set_switched_and_taken_back(client, db):
    sid = story(db)
    cid = post(client, sid).get_json()["comment"]["id"]
    vote = lambda value, who=VISITOR: client.post(f"/api/comments/{cid}/vote", json={"vote": value, "visitor": who})
    assert vote(1).get_json() == {"success": True, "likes": 1, "dislikes": 0, "my_vote": 1}
    assert vote(1).get_json()["likes"] == 1                              # (the same vote again changes nothing)
    assert vote(-1).get_json() == {"success": True, "likes": 0, "dislikes": 1, "my_vote": -1}
    assert vote(1, OTHER).get_json()["likes"] == 1
    assert vote(0).get_json() == {"success": True, "likes": 1, "dislikes": 0, "my_vote": 0}


@pytest.mark.parametrize("data", [{"vote": 2, "visitor": VISITOR}, {"vote": "1", "visitor": VISITOR}, {"vote": True, "visitor": VISITOR},
                                  {"vote": 1}, {"vote": 1, "visitor": "short"}, {"visitor": VISITOR}])
def test_a_bad_vote_is_400(client, db, data):
    cid = post(client, story(db)).get_json()["comment"]["id"]
    assert client.post(f"/api/comments/{cid}/vote", json=data).status_code == 400


def test_voting_on_an_unknown_comment_is_404(client, db):
    assert client.post("/api/comments/999/vote", json={"vote": 1, "visitor": VISITOR}).status_code == 404


def test_a_robot_gets_the_counts_and_nothing_is_stored(client, db):
    cid = post(client, story(db)).get_json()["comment"]["id"]
    reply = client.post(f"/api/comments/{cid}/vote", json={"vote": 1, "visitor": VISITOR}, headers={"User-Agent": "Googlebot/2.1"})
    assert reply.status_code == 200 and reply.get_json()["likes"] == 0 and db.comments[cid]["votes"] == {}


def test_one_address_may_vote_120_times_an_hour(client, db):
    cid = post(client, story(db)).get_json()["comment"]["id"]
    codes = [client.post(f"/api/comments/{cid}/vote", json={"vote": 1 if i % 2 else 0, "visitor": VISITOR}).status_code for i in range(121)]
    assert codes[:120] == [200] * 120 and codes[120] == 429


def test_a_report_counts_once_per_visitor(client, db):
    cid = post(client, story(db)).get_json()["comment"]["id"]
    report = lambda who: client.post(f"/api/comments/{cid}/report", json={"visitor": who})
    assert report(VISITOR).get_json() == {"success": True} and report(VISITOR).status_code == 200
    assert db.comments[cid]["reports"] == 1
    report(OTHER)
    assert db.comments[cid]["reports"] == 2
    assert report("short").status_code == 400
    assert client.post("/api/comments/999/report", json={"visitor": VISITOR}).status_code == 404


def test_one_address_may_report_20_times_an_hour(client, db):
    cid = post(client, story(db)).get_json()["comment"]["id"]
    codes = [client.post(f"/api/comments/{cid}/report", json={"visitor": VISITOR}).status_code for _ in range(21)]
    assert codes[:20] == [200] * 20 and codes[20] == 429


# ---------------------------------------------------------------- the tables are not there yet
def test_without_the_tables_the_list_is_empty_and_writes_say_503(client, db):
    sid = story(db)
    db.comment_tables = False
    assert client.get(f"/api/comments?type=article&id={sid}").get_json() == {"success": True, "total": 0, "comments": []}
    assert post(client, sid).status_code == 503
    assert client.post("/api/comments/1/vote", json={"vote": 1, "visitor": VISITOR}).status_code == 503
    assert client.post("/api/comments/1/report", json={"visitor": VISITOR}).status_code == 503


# ---------------------------------------------------------------- the browser's preflight (the website lives on another address)
def test_the_websites_preflight_passes(client):
    asked = client.options("/api/comments", headers={"Origin": "https://www.example.org", "Access-Control-Request-Method": "POST",
                                                     "Access-Control-Request-Headers": "content-type"})
    assert asked.status_code in (200, 204)
    assert asked.headers["Access-Control-Allow-Origin"] == "https://www.example.org"
    assert "content-type" in asked.headers["Access-Control-Allow-Headers"].lower()
    other = client.options("/api/comments", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert "Access-Control-Allow-Origin" not in other.headers


# ---------------------------------------------------------------- the Admin Panel
def test_the_admin_endpoints_need_the_token(client, db):
    cid = post(client, story(db)).get_json()["comment"]["id"]
    assert client.get("/api/admin/comments").status_code == 401
    assert client.delete(f"/api/admin/comments/{cid}").status_code == 401
    assert cid in db.comments


def test_the_admin_list_has_the_story_and_its_address(client, db, admin):
    sid = story(db, title="मुख्य बातमी", category="blogs", slug="mukhya-batami")
    post(client, sid, token=token_for(db, "A"))
    top = post(client, sid, token=token_for(db, "B")).get_json()["comment"]["id"]
    post(client, sid, token=token_for(db, "C"), parent_id=top)
    listed = client.get("/api/admin/comments", headers=admin).get_json()
    assert listed["total"] == 3 and listed["reported_total"] == 0
    assert [c["name"] for c in listed["comments"]] == ["C", "B", "A"]                          # newest first
    one = listed["comments"][1]
    assert one["item_type"] == "article" and one["item_title"] == "मुख्य बातमी" and one["item_category"] == "blogs"
    assert (one["email"], one["provider"], one["mobile"]) == ("b@example.com", "email", "")             # the Admin Panel sees who wrote it (the website never does)
    assert one["item_url"].endswith("/blog/mukhya-batami") and one["replies_count"] == 1 and one["reports"] == 0
    assert "item_slug" not in one and "visitor" not in str(one)


def test_the_admin_list_of_a_weekly_issue_comment(client, db, admin):
    db.create_weekly_edition({"issue_no": 7, "title": "अंक सात", "date": "x", "image": "x", "pdf_filename": "x", "views": "1"})
    post(client, 7, type="weekly")
    one = client.get("/api/admin/comments", headers=admin).get_json()["comments"][0]
    assert one["item_type"] == "weekly" and one["item_title"] == "अंक सात" and one["item_category"] is None and "weekly" in one["item_url"]


def test_the_reported_tab_lists_the_most_reported_first(client, db, admin):
    sid = story(db)
    ids = [post(client, sid).get_json()["comment"]["id"] for n in range(3)]
    for who in ("visitor-aaaa-0001", "visitor-aaaa-0002"):
        client.post(f"/api/comments/{ids[0]}/report", json={"visitor": who})
    client.post(f"/api/comments/{ids[2]}/report", json={"visitor": "visitor-aaaa-0001"})
    listed = client.get("/api/admin/comments?filter=reported", headers=admin).get_json()
    assert [c["id"] for c in listed["comments"]] == [ids[0], ids[2]] and listed["reported_total"] == 2 and listed["total"] == 3
    assert [c["reports"] for c in listed["comments"]] == [2, 1]


def test_the_admin_list_pages(client, db, admin):
    sid = story(db)
    for n in range(5):
        post(client, sid, body=str(n))
        app_module._hits.clear()
    page = client.get("/api/admin/comments?limit=2&offset=2", headers=admin).get_json()
    assert [c["body"] for c in page["comments"]] == ["2", "1"] and page["total"] == 5
    assert len(client.get("/api/admin/comments?limit=9999", headers=admin).get_json()["comments"]) == 5


def test_the_admin_deletes_a_comment_with_its_replies(client, db, admin):
    sid = story(db)
    top = post(client, sid).get_json()["comment"]["id"]
    reply = post(client, sid, parent_id=top).get_json()["comment"]["id"]
    assert client.delete(f"/api/admin/comments/{top}", headers=admin).get_json()["success"] is True
    assert top not in db.comments and reply not in db.comments
    assert client.delete(f"/api/admin/comments/{top}", headers=admin).status_code == 404
