"""The advertisements of the website's ad slider (Admin Panel > Advertisements): login, cleaning, and files are removed only when they are ours."""
import io

from conftest import JPEG, MP4


def upload(client, admin, path, name, data):
    return client.post(path, headers=admin, data={"file": (io.BytesIO(data), name)}, content_type="multipart/form-data").get_json()


def test_photo_ad_roundtrip(client, admin, db):
    pic = upload(client, admin, "/api/upload/image", "ad-image.jpg", JPEG)
    assert pic["url"].startswith("assets/images/ad-image_")
    made = client.post("/api/ads", headers=admin, json={"media_type": "image", "title": "<b>Sale</b> 50%", "media_url": pic["url"],
                                                        "link_url": "https://example.org/offer"})
    assert made.status_code == 201
    ad = made.get_json()["ad"]
    assert ad["title"] == "Sale 50%" and ad["link_url"] == "https://example.org/offer"
    assert client.get("/api/ads").get_json()["count"] == 1                          # (public)
    assert client.put(f"/api/ads/{ad['id']}", headers=admin, json={"title": "New title"}).status_code == 200
    assert db.ads[ad["id"]]["title"] == "New title"


def test_bad_ads_are_refused(client, admin):
    good = {"media_type": "image", "title": "t", "media_url": "assets/images/a.jpg"}
    for change in ({"media_type": "audio"}, {"title": " "}, {"media_url": "javascript:alert(1)"}, {"media_url": ""},
                   {"link_url": "javascript:alert(1)"}, {"link_url": 'https://x/"onclick="1'}, {"thumbnail": "data:text/html,x"},
                   {"title": "x" * 301}, {"sort_order": "0"}):
        assert client.post("/api/ads", headers=admin, json={**good, **change}).status_code == 400, change
    video = {"media_type": "video", "title": "t", "media_url": "https://www.youtube.com/watch?v=abcdefghijk"}
    assert client.post("/api/ads", headers=admin, json=video).status_code == 201
    assert client.post("/api/ads", headers=admin, json={**video, "media_url": "assets/videos/../x.mp4"}).status_code == 400


def test_deleting_an_ad_removes_only_the_files_it_made(client, admin, local_storage):
    mine = upload(client, admin, "/api/upload/image", "ad-image.jpg", JPEG)
    video = upload(client, admin, "/api/upload/video", "spot.mp4", MP4)
    poster = upload(client, admin, "/api/upload/image", "ad-poster.jpg", JPEG)
    ordinary = upload(client, admin, "/api/upload/image", "family-photo.jpg", JPEG)          # an ordinary picture, not made for an ad
    ids = []
    for kind, url, thumb in (("image", mine["url"], ""), ("video", video["url"], poster["url"]), ("image", ordinary["url"], "")):
        made = client.post("/api/ads", headers=admin, json={"media_type": kind, "title": "t", "media_url": url, "thumbnail": thumb})
        ids.append(made.get_json()["ad"]["id"])
    for ad_id in ids:
        client.delete(f"/api/ads/{ad_id}", headers=admin)
    files = {p.name for folder in ("images", "videos") for p in (local_storage / folder).iterdir()}
    assert mine["filename"] not in files and video["filename"] not in files and poster["filename"] not in files
    assert ordinary["filename"] in files                                                         # kept: not an ad-image_ / ad-poster_ file


def test_a_picture_used_by_another_ad_stays(client, admin, local_storage):
    pic = upload(client, admin, "/api/upload/image", "ad-image.jpg", JPEG)
    first = client.post("/api/ads", headers=admin, json={"media_type": "image", "title": "a", "media_url": pic["url"]}).get_json()["ad"]["id"]
    client.post("/api/ads", headers=admin, json={"media_type": "image", "title": "b", "media_url": pic["url"]})
    assert client.delete(f"/api/ads/{first}", headers=admin).get_json()["files_removed"] == 0
    assert (local_storage / "images" / pic["filename"]).exists()


def test_the_built_in_ads_are_never_deleted(client, admin, db, local_storage):
    folder = local_storage / "images"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "ad-image_legacy.jpg").write_bytes(JPEG)
    db.ads[1] = {"id": 1, "media_type": "image", "title": "built-in", "media_url": "assets/ad-1.jpg", "thumbnail": "", "sort_order": 1}
    assert client.delete("/api/ads/1", headers=admin).get_json()["files_removed"] == 0
    assert (folder / "ad-image_legacy.jpg").exists()


def test_taking_back_an_uploaded_ad_picture(client, admin, local_storage):
    pic = upload(client, admin, "/api/upload/image", "ad-image.jpg", JPEG)
    other = upload(client, admin, "/api/upload/image", "news.jpg", JPEG)
    assert client.delete("/api/upload/ad", headers=admin, json={"url": other["url"]}).status_code == 400
    assert client.delete("/api/upload/ad", headers=admin, json={"url": pic["url"]}).get_json()["removed"] is True
    assert (local_storage / "images" / other["filename"]).exists()
