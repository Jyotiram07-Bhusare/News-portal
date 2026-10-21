"""Uploads: the file CONTENT is checked (not just the name), the right address comes back, and S3 behaves like the local folders."""
import io
import os

import pytest

import config
import storage
from conftest import JPEG, MP4, PDF, PNG


def send(client, admin, path, name, data, **fields):
    return client.post(path, headers=admin, data={"file": (io.BytesIO(data), name), **fields}, content_type="multipart/form-data")


# ---- local folders ----
def test_image_upload_is_stored_and_listed(client, admin, local_storage):
    reply = send(client, admin, "/api/upload/image", "Photo One.png", PNG)
    assert reply.status_code == 200
    data = reply.get_json()
    assert data["url"].startswith("assets/images/Photo_One_") and data["url"].endswith(".png")
    assert (local_storage / "images" / data["filename"]).read_bytes() == PNG
    listed = client.get("/api/media", headers=admin).get_json()
    assert [i["filename"] for i in listed["images"]] == [data["filename"]]


def test_two_uploads_of_the_same_name_never_overwrite_each_other(client, admin, local_storage):
    first = send(client, admin, "/api/upload/image", "same.jpg", JPEG).get_json()["filename"]
    second = send(client, admin, "/api/upload/image", "same.jpg", JPEG).get_json()["filename"]
    assert first != second and len(list((local_storage / "images").iterdir())) == 2


def test_image_with_the_wrong_content_is_refused(client, admin, local_storage):
    assert send(client, admin, "/api/upload/image", "evil.jpg", b"<html><script>alert(1)</script></html>").status_code == 400
    assert send(client, admin, "/api/upload/image", "evil.svg", b"<svg onload=alert(1)>").status_code == 400
    assert send(client, admin, "/api/upload/image", "empty.png", b"").status_code == 400
    assert not (local_storage / "images").exists() or not list((local_storage / "images").iterdir())


def test_image_name_follows_the_real_type(client, admin):
    data = send(client, admin, "/api/upload/image", "really_a_png.jpg", PNG).get_json()
    assert data["filename"].endswith(".png")


def test_pdf_upload_uses_the_issue_number(client, admin, local_storage):
    data = send(client, admin, "/api/upload/pdf", "Lokmangal Saptahik 02 September 2026.pdf", PDF, issue_no="69").get_json()
    assert data["url"] == "assets/pdf/lokmangal-weekly-69.pdf"
    assert (local_storage / "pdf" / "lokmangal-weekly-69.pdf").read_bytes() == PDF


def test_pdf_upload_replaces_the_old_file_only_when_the_new_one_is_a_pdf(client, admin, local_storage):
    send(client, admin, "/api/upload/pdf", "a.pdf", PDF, issue_no="7")
    assert send(client, admin, "/api/upload/pdf", "b.pdf", b"not a pdf at all", issue_no="7").status_code == 400
    assert (local_storage / "pdf" / "lokmangal-weekly-7.pdf").read_bytes() == PDF


def test_pdf_wrong_extension(client, admin):
    assert send(client, admin, "/api/upload/pdf", "a.exe", PDF).status_code == 400


def test_video_upload_and_delete(client, admin, local_storage, db):
    data = send(client, admin, "/api/upload/video", "clip.mp4", MP4).get_json()
    assert data["url"].startswith("assets/videos/clip_")
    assert (local_storage / "videos" / data["filename"]).exists()
    created = client.post("/api/videos", headers=admin, json={"title": "क्लिप", "video_url": data["url"]})
    assert created.status_code == 201
    video_id = created.get_json()["video"]["id"]
    deleted = client.delete(f"/api/videos/{video_id}", headers=admin).get_json()
    assert deleted["files_removed"] == 1 and not (local_storage / "videos" / data["filename"]).exists()


def test_fake_video_is_refused(client, admin):
    assert send(client, admin, "/api/upload/video", "clip.mp4", b"just some text, not a video").status_code == 400
    assert send(client, admin, "/api/upload/video", "clip.exe", MP4).status_code == 400


def test_discard_only_removes_a_video_nobody_uses(client, admin, local_storage, db):
    url = send(client, admin, "/api/upload/video", "keep.mp4", MP4).get_json()["url"]
    client.post("/api/videos", headers=admin, json={"title": "t", "video_url": url})
    assert client.delete("/api/upload/video", headers=admin, json={"url": url}).get_json()["removed"] is False
    free = send(client, admin, "/api/upload/video", "free.mp4", MP4).get_json()["url"]
    assert client.delete("/api/upload/video", headers=admin, json={"url": free}).get_json()["removed"] is True
    assert client.delete("/api/upload/video", headers=admin, json={"url": "assets/images/x.jpg"}).status_code == 400
    assert client.delete("/api/upload/video", headers=admin, json={"url": "assets/videos/../../x"}).status_code == 400


def test_only_our_own_files_are_ever_deleted(client, admin, local_storage, db):
    other = local_storage / "images"
    other.mkdir(parents=True)
    (other / "important_photo.jpg").write_bytes(JPEG)
    poster = send(client, admin, "/api/upload/image", "video-poster.jpg", JPEG).get_json()["url"]
    created = client.post("/api/videos", headers=admin, json={"title": "t", "video_url": "https://www.youtube.com/watch?v=abcdefghijk",
                                                              "thumbnail": poster})
    video_id = created.get_json()["video"]["id"]
    client.put(f"/api/videos/{video_id}", headers=admin, json={"thumbnail": "assets/images/important_photo.jpg"})
    assert (other / "important_photo.jpg").exists()                  # a normal news picture is never deleted
    client.delete(f"/api/videos/{video_id}", headers=admin)
    assert (other / "important_photo.jpg").exists()


def test_the_size_limit(client, admin, monkeypatch):
    monkeypatch.setattr(config, "MAX_UPLOAD_MB", 1)
    reply = send(client, admin, "/api/upload/image", "big.png", PNG + b"0" * (2 * 1024 * 1024))
    assert reply.status_code == 413 and "limit" in reply.get_json()["error"]


# ---- S3 (moto plays Amazon) ----
@pytest.fixture
def s3(monkeypatch):
    boto3 = pytest.importorskip("boto3")
    moto = pytest.importorskip("moto")
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "test")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "test")
    monkeypatch.setenv("AWS_DEFAULT_REGION", "ap-south-1")
    monkeypatch.setenv("AWS_SHARED_CREDENTIALS_FILE", os.devnull)       # (a developer's own ~/.aws files play no part in the test)
    monkeypatch.setenv("AWS_CONFIG_FILE", os.devnull)
    with moto.mock_aws():
        client = boto3.client("s3", region_name="ap-south-1")
        client.create_bucket(Bucket="lokmangal-test", CreateBucketConfiguration={"LocationConstraint": "ap-south-1"})
        monkeypatch.setattr(config, "STORAGE_BACKEND", "s3")
        monkeypatch.setattr(config, "S3_BUCKET", "lokmangal-test")
        monkeypatch.setattr(config, "S3_REGION", "ap-south-1")
        monkeypatch.setattr(config, "S3_PREFIX", "")
        monkeypatch.setattr(config, "MEDIA_BASE_URL", "https://media.example.org")
        storage.reset()
        yield client
        storage.reset()


def test_s3_image_goes_to_the_bucket_and_the_cdn_address_comes_back(client, admin, s3):
    data = send(client, admin, "/api/upload/image", "photo.png", PNG).get_json()
    assert data["url"] == f"https://media.example.org/images/{data['filename']}"
    stored = s3.get_object(Bucket="lokmangal-test", Key=f"images/{data['filename']}")
    assert stored["Body"].read() == PNG
    assert stored["ContentType"] == "image/png" and "immutable" in stored["CacheControl"]
    assert [i["url"] for i in client.get("/api/media", headers=admin).get_json()["images"]] == [data["url"]]


def test_s3_pdf_keeps_the_fixed_name_and_a_short_cache(client, admin, s3):
    data = send(client, admin, "/api/upload/pdf", "x.pdf", PDF, issue_no="12").get_json()
    assert data["url"] == "https://media.example.org/pdf/lokmangal-weekly-12.pdf"
    stored = s3.get_object(Bucket="lokmangal-test", Key="pdf/lokmangal-weekly-12.pdf")
    assert stored["ContentType"] == "application/pdf" and stored["CacheControl"] == "public, max-age=300"


def test_s3_video_delete_removes_the_object(client, admin, s3, db):
    data = send(client, admin, "/api/upload/video", "clip.mp4", MP4).get_json()
    assert data["url"].startswith("https://media.example.org/videos/")
    video_id = client.post("/api/videos", headers=admin, json={"title": "t", "video_url": data["url"]}).get_json()["video"]["id"]
    assert client.delete(f"/api/videos/{video_id}", headers=admin).get_json()["files_removed"] == 1
    keys = [o["Key"] for o in s3.list_objects_v2(Bucket="lokmangal-test").get("Contents", [])]
    assert keys == []


def test_s3_never_deletes_foreign_addresses(client, admin, s3, db):
    s3.put_object(Bucket="lokmangal-test", Key="images/news_photo.jpg", Body=JPEG)
    store = storage.get()
    assert store.parse("https://media.example.org/images/news_photo.jpg") == ("image", "news_photo.jpg")
    assert store.parse("https://elsewhere.example.com/images/news_photo.jpg") is None
    assert store.parse("https://media.example.org/other/news_photo.jpg") is None
    assert store.parse("https://media.example.org/images/../secret") is None
    video_id = client.post("/api/videos", headers=admin, json={"title": "t", "video_url": "https://www.youtube.com/watch?v=abcdefghijk",
                                                               "thumbnail": "https://media.example.org/images/news_photo.jpg"}).get_json()["video"]["id"]
    client.delete(f"/api/videos/{video_id}", headers=admin)
    assert s3.head_object(Bucket="lokmangal-test", Key="images/news_photo.jpg")      # a normal picture stays


def test_s3_check_reaches_the_bucket(s3):
    assert "lokmangal-test" in storage.get().check()
