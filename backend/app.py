"""Lokmangal News Portal - backend: REST API (Flask) on top of MySQL.

    python app.py                                   development
    gunicorn -c gunicorn.conf.py app:app            production (see deploy/ and DEPLOY.md)

With SERVE_FRONTEND=true (default on a development PC) this server also delivers ../frontend:
the website on "/" and the admin panel on "/admin/". In production the website is hosted elsewhere (Amplify) and this is the API only.
Reading news / issues / videos is public; everything that writes needs the admin login (see auth.py).
"""
import math
import os
import secrets
import socket
import sys
import tempfile
import time
from pathlib import Path

import pymysql
from flask import Blueprint, Flask, Response, current_app, jsonify, make_response, redirect, request, send_from_directory
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.utils import secure_filename

import auth
import config
import database
import sanitize
import storage

ALLOWED_IMG_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "m4v", "mov", "webm", "ogv"}
VIDEO_CONTENT_TYPES = {"mp4": "video/mp4", "m4v": "video/x-m4v", "mov": "video/quicktime", "webm": "video/webm", "ogv": "video/ogg"}
MB = 1024 * 1024
# the pictures this program makes for videos and ads (named after the Admin Panel's upload): only these may be deleted again
OWN_PICTURE_PREFIXES = ("video-poster_", "ad-image_", "ad-poster_")

api = Blueprint("api", __name__, url_prefix="/api")


def ok(**payload):
    return jsonify({"success": True, **payload})


def fail(message, status, **extra):
    return jsonify({"success": False, "error": message, **extra}), status


def body():
    """The request's JSON body, or its form fields, as a dict."""
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) and data else request.form.to_dict()


def _english_warning(ignored):
    """English text came with the request but the database has no English columns yet: the Marathi part IS saved."""
    return {"warnings": ["english_not_saved"]} if ignored else {}


# -------------------------------------------------------------
# Login: nothing that writes works without it
# -------------------------------------------------------------
PUBLIC_WRITE_ENDPOINTS = {"api.login"}


@api.before_request
def require_login_for_writes():
    """A safety net on top of the per-route @admin_required: any request that is not a plain read needs the admin token."""
    if request.method in ("GET", "HEAD", "OPTIONS") or request.endpoint in PUBLIC_WRITE_ENDPOINTS:
        return None
    if auth.current_admin() is None:
        return fail("Please sign in.", 401, login_required=True)
    return None


@api.post("/auth/login")
def login():
    if not auth.login_configured():
        return fail("The admin login is not set up on this server yet. Run: python manage.py set-admin-password", 503)
    address = auth.client_address()
    wait = auth.locked_for(address)
    if wait:
        response = make_response(*fail(f"Too many wrong passwords. Try again in {math.ceil(wait / 60)} minute(s).", 429))
        response.headers["Retry-After"] = str(wait)
        return response
    data = body()
    if not auth.check_credentials(data.get("username"), data.get("password")):
        auth.record_failure(address)
        current_app.logger.warning("Failed admin login from %s", address)
        return fail("Wrong user name or password.", 401)
    auth.record_success(address)
    token, expires_in = auth.issue_token(config.ADMIN_USERNAME)
    return ok(token=token, expires_in=expires_in, username=config.ADMIN_USERNAME)


@api.get("/auth/me")
@auth.admin_required
def whoami():
    return ok(username=auth.current_admin())


# -------------------------------------------------------------
# REST API: Articles
# -------------------------------------------------------------
@api.get("/articles")
def get_articles():
    articles = database.get_articles(
        category=request.args.get("category"),
        search=request.args.get("search"),
        limit=request.args.get("limit", type=int),
        placement=request.args.get("placement"),
    )
    return ok(count=len(articles), articles=articles)


@api.get("/articles/<int:article_id>")
def get_article(article_id):
    article = database.get_article(article_id)
    if not article:
        return fail("Article not found", 404)
    return ok(article=article)


@api.post("/articles")
@auth.admin_required
def create_article():
    data = body()
    try:
        clean = sanitize.article(data, creating=True)
    except sanitize.ValidationError as e:
        return fail(str(e), 400)
    ignored = database.english_ignored(clean)
    new_id = database.create_article(clean)
    database.publish_articles_file()
    return jsonify({"success": True, "message": "बातमी यशस्वीरीत्या प्रकाशित झाली!",
                    "article": database.get_article(new_id), **_english_warning(ignored)}), 201


@api.route("/articles/<int:article_id>", methods=["PUT", "POST"])
@auth.admin_required
def update_article(article_id):
    data = body()
    if not data:
        return fail("No update data provided", 400)
    try:
        clean = sanitize.article(data, creating=False)
    except sanitize.ValidationError as e:
        return fail(str(e), 400)
    before = database.get_article(article_id)
    if not before:
        return fail("Article not found", 404)
    if not database.update_article(article_id, clean):
        return fail("No update data provided", 400)
    database.settle_if_unplaced(article_id, before)       # taken out of Popular / Random and in no section now: it goes to place 8 of the latest news
    database.publish_articles_file()
    return ok(message="बातमी अद्यतनित करण्यात आली!", article=database.get_article(article_id),
              **_english_warning(database.english_ignored(clean)))


@api.post("/articles/<int:article_id>/toggle-placement")
@auth.admin_required
def toggle_article_placement(article_id):
    data = body()
    field = data.get("field")
    if not field:
        return fail("Placement field is required (is_lead, is_popular, is_random)", 400)
    before = database.get_article(article_id)
    updated = database.toggle_placement(article_id, field, data.get("value"))
    if not updated:
        return fail("Article not found or invalid placement field", 404)
    if database.settle_if_unplaced(article_id, before):    # taken out of Popular / Random and in no section now: it goes to place 8 of the latest news
        updated = database.get_article(article_id)
    database.publish_articles_file()
    return ok(message="सेक्शन स्थान अद्यतनित केले!", article=updated)


@api.delete("/articles/<int:article_id>")
@auth.admin_required
def delete_article(article_id):
    if not database.delete_article(article_id):
        return fail("Article not found", 404)
    database.publish_articles_file()
    return ok(message="बातमी यशस्वीरीत्या हटवली!")


# -------------------------------------------------------------
# REST API: Weekly issues
# -------------------------------------------------------------
@api.get("/weekly")
def get_weekly():
    issues = database.get_weekly_editions(limit=request.args.get("limit", type=int))
    return ok(count=len(issues), issues=issues)


@api.post("/weekly")
@auth.admin_required
def create_weekly():
    try:
        clean = sanitize.weekly(body())
    except sanitize.ValidationError as e:
        return fail(str(e), 400)
    ignored = database.english_ignored(clean)
    database.create_weekly_edition(clean)
    return jsonify({"success": True, "message": "साप्ताहिक अंक यशस्वीरीत्या जोडला!",
                    "issue": database.get_weekly_edition(clean["issue_no"]), **_english_warning(ignored)}), 201


@api.delete("/weekly/<int:issue_no>")
@auth.admin_required
def delete_weekly(issue_no):
    if not database.delete_weekly_edition(issue_no):
        return fail("Weekly issue not found", 404)
    return ok(message="साप्ताहिक अंक यशस्वीरीत्या हटवला!")


# -------------------------------------------------------------
# REST API: Videos (the file comes from POST /upload/video, the row from POST /videos)
# -------------------------------------------------------------
@api.get("/videos")
def get_videos():
    videos = database.get_videos(limit=request.args.get("limit", type=int))
    return ok(count=len(videos), videos=videos)


@api.get("/videos/<int:video_id>")
def get_video(video_id):
    video = database.get_video(video_id)
    if not video:
        return fail("Video not found", 404)
    return ok(video=video)


@api.post("/videos")
@auth.admin_required
def create_video():
    try:
        clean = sanitize.video(body(), creating=True)
    except sanitize.ValidationError as e:
        return fail(str(e), 400)
    new_id = database.create_video(clean)
    database.publish_videos_file()
    return jsonify({"success": True, "message": "व्हिडिओ यशस्वीरीत्या प्रकाशित झाला!", "video": database.get_video(new_id)}), 201


@api.route("/videos/<int:video_id>", methods=["PUT", "POST"])
@auth.admin_required
def update_video(video_id):
    data = body()
    if not data:
        return fail("No update data provided", 400)
    try:
        clean = sanitize.video(data, creating=False)
    except sanitize.ValidationError as e:
        return fail(str(e), 400)
    before = database.get_video(video_id)
    if not before:
        return fail("Video not found", 404)
    if not database.update_video(video_id, clean):
        return fail("No update data provided", 400)
    after = database.get_video(video_id)
    # a replaced video file / thumbnail is not kept in the storage
    removed = [_remove_upload(before[k], video_id) for k in ("video_url", "thumbnail") if before[k] != after[k]]
    database.publish_videos_file()
    return ok(message="व्हिडिओ अद्यतनित करण्यात आला!", video=after, files_removed=sum(removed))


@api.delete("/videos/<int:video_id>")
@auth.admin_required
def delete_video(video_id):
    row = database.delete_video(video_id)
    if not row:
        return fail("Video not found", 404)
    removed = [_remove_upload(row[k], video_id) for k in ("video_url", "thumbnail")]
    database.publish_videos_file()
    return ok(message="व्हिडिओ यशस्वीरीत्या हटवला!", files_removed=sum(removed))


def _remove_upload(url, video_id=None, ad_id=None):
    """Delete the stored file of a video / ad / thumbnail that was uploaded through this server (a video file, or a picture named
    video-poster_<...> / ad-image_<...> / ad-poster_<...>). Nothing else is ever deleted: other hosts, other folders, any other picture
    (the built-in ads assets/ad-1.jpg ... included), a file another video / ad uses."""
    parsed = storage.get().parse(url or "")
    if not parsed:
        return False
    kind, name = parsed
    if not (kind == "video" or (kind == "image" and name.startswith(OWN_PICTURE_PREFIXES))):
        return False
    if database.upload_in_use(url, video_id, ad_id):
        return False
    return storage.get().delete(kind, name)


# -------------------------------------------------------------
# REST API: Ads (the photo / video comes from POST /upload/image or /upload/video, the row from POST /ads)
# -------------------------------------------------------------
@api.get("/ads")
def get_ads():
    ads = database.get_ads(limit=request.args.get("limit", type=int))
    return ok(count=len(ads), ads=ads)


@api.get("/ads/<int:ad_id>")
def get_ad(ad_id):
    ad = database.get_ad(ad_id)
    if not ad:
        return fail("Ad not found", 404)
    return ok(ad=ad)


@api.post("/ads")
@auth.admin_required
def create_ad():
    try:
        clean = sanitize.ad(body(), creating=True)
    except sanitize.ValidationError as e:
        return fail(str(e), 400)
    new_id = database.create_ad(clean)
    database.publish_ads_file()
    return jsonify({"success": True, "message": "जाहिरात यशस्वीरीत्या प्रकाशित झाली!", "ad": database.get_ad(new_id)}), 201


@api.route("/ads/<int:ad_id>", methods=["PUT", "POST"])
@auth.admin_required
def update_ad(ad_id):
    data = body()
    if not data:
        return fail("No update data provided", 400)
    try:
        clean = sanitize.ad(data, creating=False)
    except sanitize.ValidationError as e:
        return fail(str(e), 400)
    before = database.get_ad(ad_id)
    if not before:
        return fail("Ad not found", 404)
    if not database.update_ad(ad_id, clean):
        return fail("No update data provided", 400)
    after = database.get_ad(ad_id)
    removed = [_remove_upload(before[k], None, ad_id) for k in ("media_url", "thumbnail") if before[k] != after[k]]    # a replaced file is not kept
    database.publish_ads_file()
    return ok(message="जाहिरात अद्यतनित करण्यात आली!", ad=after, files_removed=sum(removed))


@api.delete("/ads/<int:ad_id>")
@auth.admin_required
def delete_ad(ad_id):
    row = database.delete_ad(ad_id)
    if not row:
        return fail("Ad not found", 404)
    removed = [_remove_upload(row[k], None, ad_id) for k in ("media_url", "thumbnail")]
    database.publish_ads_file()
    return ok(message="जाहिरात यशस्वीरीत्या हटवली!", files_removed=sum(removed))


@api.delete("/upload/ad")
@auth.admin_required
def discard_uploaded_ad_image():
    """The Admin Panel takes back a photo / poster it uploaded for an ad but could not save the ad for. Only a file no video / ad points to is deleted."""
    url = str(body().get("url") or "")
    parsed = storage.get().parse(url)
    if not parsed or parsed[0] != "image" or not parsed[1].startswith(("ad-image_", "ad-poster_")):
        return fail("Not an uploaded ad picture", 400)
    return ok(removed=_remove_upload(url))


# -------------------------------------------------------------
# REST API: Site settings (the footer's office address, phone and e-mail)
# -------------------------------------------------------------
def _settings_problem(data):
    """Why these footer details cannot be saved (an English sentence for the Admin Panel), or None. Texts are trimmed in place."""
    for key in database.SETTINGS_FIELDS:
        if key in data:
            data[key] = str(data[key] if data[key] is not None else "").strip()
    for key in ("office_address", "office_address_en"):
        if len(data.get(key, "")) > 400:
            return "The address is too long (400 characters at most)"
    phone = data.get("office_phone", "")
    if phone:
        digits = re.sub(r"\D", "", phone)
        if not re.fullmatch(r"[+()\d\s-]{1,40}", phone) or not 6 <= len(digits) <= 15:
            return "The phone number may only have digits, spaces, + - ( ) and 6 to 15 digits"
    email = data.get("office_email", "")
    if email and (len(email) > 160 or not re.fullmatch(r"[^@\s<>\"']+@[^@\s<>\"']+\.[^@\s<>\"']+", email)):
        return "This is not a valid e-mail address"
    return None


@api.get("/settings")
def get_settings():
    return ok(settings=database.get_settings())


@api.route("/settings", methods=["PUT", "POST"])
@auth.admin_required
def update_settings():
    data = body()
    if not any(key in data for key in database.SETTINGS_FIELDS):
        return fail("No update data provided", 400)
    problem = _settings_problem(data)
    if problem:
        return fail(problem, 400)
    settings = database.update_settings(data)
    database.publish_settings_file()
    return ok(message="फूटर माहिती जतन झाली!", settings=settings)


# REST API: File uploads (image, PDF, video)
# -------------------------------------------------------------
def _upload_limit_mb(path):
    """Images and weekly PDFs may be MAX_UPLOAD_MB, a video MAX_VIDEO_MB."""
    return config.MAX_VIDEO_MB if path.rstrip("/").endswith("/upload/video") else config.MAX_UPLOAD_MB


@api.before_request
def refuse_too_large_request():
    """The server-wide cap is the video limit; everything else (images, PDFs, JSON) is still held to MAX_UPLOAD_MB."""
    if request.method in ("POST", "PUT") and request.content_length:
        limit = _upload_limit_mb(request.path)
        if request.content_length > limit * MB:
            return fail(f"File too large. The limit is {limit} MB.", 413)


def _uploaded_file():
    """(file, error response). The admin panel sends the file in the form field 'file'."""
    if "file" not in request.files:
        return None, fail("No file part", 400)
    file = request.files["file"]
    if file.filename == "":
        return None, fail("No selected file", 400)
    return file, None


def _extension(filename):
    return filename.rsplit(".", 1)[1].lower() if "." in filename else ""


def _stash(file):
    """The upload, written to a temporary file (UPLOAD_TMP_DIR). It is looked at there and only then stored - a refused or half-finished
    upload never reaches the website's files or the bucket."""
    config.UPLOAD_TMP_DIR.mkdir(parents=True, exist_ok=True)
    handle, name = tempfile.mkstemp(prefix="upload_", suffix=".part", dir=config.UPLOAD_TMP_DIR)
    os.close(handle)
    path = Path(name)
    try:
        file.save(path)
    except BaseException:
        path.unlink(missing_ok=True)
        raise
    return path


def _head(path, count=16):
    with open(path, "rb") as fh:
        return fh.read(count)


def _unique_name(base, ext, stamp_ms=False):
    stamp = int(time.time() * 1000) if stamp_ms else int(time.time())
    return f"{base}_{stamp}_{secrets.token_hex(3)}.{ext}"


def _store(kind, name, path, content_type):
    """Hand a checked temporary file to the storage. Answers with the JSON the Admin Panel expects."""
    try:
        stored = storage.get().put(kind, name, path, content_type)
    except Exception:                                  # OSError, a refused S3 call ...: the file is not stored
        path.unlink(missing_ok=True)
        current_app.logger.exception("Storing %s failed", name)
        return fail("The file could not be saved. Try again.", 502)
    return ok(**stored)


def _image_type(head):
    """(extension, content type) of the picture the first bytes describe, or None. The file NAME is not trusted."""
    if head[:3] == b"\xff\xd8\xff":
        return "jpg", "image/jpeg"
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        return "png", "image/png"
    if head[:6] in (b"GIF87a", b"GIF89a"):
        return "gif", "image/gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp", "image/webp"
    return None


@api.post("/upload/image")
@auth.admin_required
def upload_image():
    file, error = _uploaded_file()
    if error:
        return error
    if _extension(file.filename) not in ALLOWED_IMG_EXTENSIONS:
        return fail("Invalid image format. Allowed: png, jpg, jpeg, webp, gif", 400)

    path = _stash(file)
    kind = _image_type(_head(path))
    if kind is None:
        path.unlink(missing_ok=True)
        return fail("This is not a valid image file", 400)
    ext, content_type = kind
    base_name = (secure_filename(file.filename.rsplit(".", 1)[0]) or "image")[:60]
    return _store("image", _unique_name(base_name, ext), path, content_type)


@api.post("/upload/pdf")
@auth.admin_required
def upload_pdf():
    file, error = _uploaded_file()
    if error:
        return error
    if _extension(file.filename) != "pdf":
        return fail("Invalid file format. Allowed: pdf", 400)

    issue_no = request.form.get("issue_no", "")
    if issue_no.isascii() and issue_no.isdigit() and 0 < int(issue_no) <= 99_999:
        name = f"lokmangal-weekly-{int(issue_no)}.pdf"      # the name the website looks for
    else:
        name = f"{(secure_filename(Path(file.filename).stem) or 'weekly')[:100]}.pdf"

    path = _stash(file)
    if _head(path, 5) != b"%PDF-":
        path.unlink(missing_ok=True)
        return fail("This is not a valid PDF file", 400)
    return _store("pdf", name, path, "application/pdf")


def _looks_like_video(path, ext):
    """The first bytes must be those of the format the file name claims: a text file / PDF renamed to .mp4 is refused."""
    head = _head(path, 12)
    if ext in ("mp4", "m4v", "mov"):          # ISO media / QuickTime: [size][type], the type is "ftyp" (or an older QuickTime atom)
        return len(head) >= 8 and head[4:8] in (b"ftyp", b"moov", b"mdat", b"free", b"wide", b"skip", b"pnot")
    if ext == "webm":
        return head[:4] == b"\x1a\x45\xdf\xa3"
    if ext == "ogv":
        return head[:4] == b"OggS"
    return False


@api.post("/upload/video")
@auth.admin_required
def upload_video():
    file, error = _uploaded_file()
    if error:
        return error
    ext = _extension(file.filename)
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        return fail("Invalid video format. Allowed: mp4, webm, mov, m4v, ogv", 400)

    path = _stash(file)
    if not _looks_like_video(path, ext):
        path.unlink(missing_ok=True)
        return fail("This is not a valid video file", 400)
    base_name = (secure_filename(file.filename.rsplit(".", 1)[0]) or "video")[:60]
    return _store("video", _unique_name(base_name, ext, stamp_ms=True), path, VIDEO_CONTENT_TYPES[ext])


@api.delete("/upload/video")
@auth.admin_required
def discard_uploaded_video():
    """The Admin Panel takes back a file it uploaded but could not save a video for. Only a file no video points to is deleted."""
    url = str(body().get("url") or "")
    parsed = storage.get().parse(url)
    if not parsed or parsed[0] != "video":
        return fail("Not an uploaded video", 400)
    return ok(removed=_remove_upload(url, None))


# -------------------------------------------------------------
# REST API: Stats, media library, health
# -------------------------------------------------------------
@api.get("/stats")
@auth.admin_required
def get_stats():
    return ok(stats=database.get_stats())


@api.get("/media")
@auth.admin_required
def get_media():
    store = storage.get()
    return ok(images=store.list("image", newest_first=True), pdfs=store.list("pdf"))


@api.get("/live")
def live():
    """The program itself is up (no database call). A deploy asks THIS to decide whether the new container started: a database that is
    briefly unavailable (RDS maintenance / fail-over) must not make a good new version roll back."""
    return ok()


@api.get("/health")
def health():
    database.ping()                       # raises -> handled below as "database not available"
    if auth.current_admin() is None:      # (the public answer says nothing about the set-up)
        return ok()
    return ok(database=config.DB_NAME, english=database.has_english(), storage=storage.get().name,
              limits={"upload_mb": config.MAX_UPLOAD_MB, "video_mb": config.MAX_VIDEO_MB})


# Reads that every visitor makes may be kept by browsers / CloudFront for a few seconds; the Admin Panel always sends its token and so
# always gets fresh data (Vary: Authorization keeps the two apart).
PUBLIC_CACHEABLE = {"api.get_articles", "api.get_article", "api.get_weekly", "api.get_videos", "api.get_video", "api.get_ads", "api.get_ad"}


@api.after_request
def api_cache_headers(response):
    if (request.method == "GET" and response.status_code == 200 and request.endpoint in PUBLIC_CACHEABLE
            and not auth.bearer_token()):
        response.headers["Cache-Control"] = "public, max-age=15, stale-while-revalidate=60, stale-if-error=3600"
    else:
        response.headers["Cache-Control"] = "no-store"
    response.headers.add("Vary", "Authorization")
    return response


# -------------------------------------------------------------
# Website + admin panel (only when SERVE_FRONTEND=true)
# -------------------------------------------------------------
def register_frontend(app):
    root = config.FRONTEND_DIR

    @app.get("/")
    def site_home():
        return send_from_directory(root, "index.html")

    @app.get("/js/config.js")
    def site_config():
        # The page comes from THIS server, so the API is on the very same address - whatever PORT says.
        # That is the only thing decided here; every other setting (WEEKLY_PDF ...) still comes from
        # frontend/js/config.js, which follows right after.
        prefix = ('(function () {\n'
                  '  var c = (window.LOKMANGAL_CONFIG = window.LOKMANGAL_CONFIG || {});\n'
                  '  if (typeof c.API_BASE !== "string") c.API_BASE = "";\n'
                  '})();\n')
        try:
            settings = (root / "js" / "config.js").read_text(encoding="utf-8")
        except OSError:
            settings = ""
        return Response(prefix + settings, mimetype="text/javascript", headers={"Cache-Control": "no-cache"})

    @app.get("/admin")
    def admin_redirect():
        return redirect("/admin/", code=302)

    @app.get("/admin/")
    def admin_home():
        return send_from_directory(root / "admin", "index.html")

    @app.get("/<path:filename>")
    def site_file(filename):              # css/, js/, assets/, admin/... : plain files of the frontend folder
        return send_from_directory(root, filename)


# -------------------------------------------------------------
# Errors: the API always answers in JSON
# -------------------------------------------------------------
def register_errors(app):
    @app.errorhandler(pymysql.MySQLError)
    def database_error(e):
        app.logger.error("MySQL error: %s", e)
        code = e.args[0] if e.args and isinstance(e.args[0], int) else 0
        if isinstance(e, (pymysql.err.DataError, pymysql.err.IntegrityError)):
            return fail("The database did not accept this data. Check the texts (too long?) and try again.", 400)
        if code in (1049, 1146):          # unknown database / table
            return fail("The database is not set up yet. Run: python init_db.py", 503)
        if code in (1205, 1213):          # lock wait timeout / deadlock: two people saved at the same moment
            return fail("The database was busy. Please try again.", 503)
        return fail("The database is not available. Check that MySQL is running and the DB_* values in backend/.env.", 503)

    @app.errorhandler(HTTPException)
    def http_error(e):
        if not request.path.startswith("/api/"):
            return e
        if e.code == 413:
            return fail(f"File too large. The limit is {_upload_limit_mb(request.path)} MB.", 413)
        return fail(e.description, e.code)

    @app.errorhandler(Exception)
    def unexpected_error(e):
        app.logger.exception("Unhandled error")
        return fail("Server error", 500)


def create_app():
    problems = config.problems()
    if problems and config.IS_PRODUCTION:
        raise RuntimeError("Not starting: the production settings are unsafe.\n  - " + "\n  - ".join(problems) +
                           "\nFix backend/.env (see .env.example and DEPLOY.md).")
    app = Flask(__name__, static_folder=None)
    if config.TRUSTED_PROXIES:
        # only the visitor's ADDRESS is taken from the proxies (not their idea of the host name / protocol)
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=config.TRUSTED_PROXIES)
    app.config["MAX_CONTENT_LENGTH"] = max(config.MAX_UPLOAD_MB, config.MAX_VIDEO_MB) * MB     # (images / PDFs are held to their own limit by the check above)
    app.json.ensure_ascii = False         # Marathi text stays readable (and half the size) in API answers
    CORS(app, resources={r"/api/*": {"origins": config.CORS_ORIGINS}}, max_age=600)
    app.register_blueprint(api)
    register_errors(app)

    @app.after_request
    def security_headers(response):
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        if request.path.startswith("/api/"):
            response.headers.setdefault("X-Frame-Options", "DENY")
        if config.IS_PRODUCTION:              # (the production API is only reachable over https)
            response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        return response

    for line in problems:                 # (development: only a warning)
        app.logger.warning("Setting: %s", line)
    try:
        database.ensure_latest_column()      # an older database gets articles.is_latest (the Latest News placement) once, here
    except pymysql.MySQLError:
        pass                                 # MySQL is down / not set up yet: the next start does it
    if config.SERVE_FRONTEND:
        register_frontend(app)
    return app


app = create_app()


def port_in_use(port):
    """True when something already listens on this port. (Windows lets a second server bind a taken port without
    an error, and then two programs answer at random - so check first and stop with a clear message.)"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.settimeout(0.5)
        return probe.connect_ex(("127.0.0.1", port)) == 0


if __name__ == "__main__":
    if port_in_use(config.PORT):
        sys.exit(f"Port {config.PORT} is already in use - is the backend already running, or is another program using it?\n"
                 f"Stop that program, or set a different PORT in backend/.env.")
    host = "localhost" if config.HOST in ("0.0.0.0", "::") else config.HOST
    base = f"http://{host}:{config.PORT}"
    print("=" * 62)
    print(" Lokmangal News Portal - backend")
    print(f" MySQL:        {config.DB_USER}@{config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}")
    print(f" Files:        {config.STORAGE_BACKEND}")
    print(f" API:          {base}/api/health")
    if config.SERVE_FRONTEND:
        print(f" Website:      {base}/")
        print(f" Admin panel:  {base}/admin/")
    print("=" * 62)
    if not auth.login_configured():
        print(" NOTE: no admin login yet - the Admin Panel cannot sign in. Run: python manage.py set-admin-password\n")
    try:
        database.ping()
    except pymysql.MySQLError as e:
        print(f" WARNING: cannot use MySQL yet -> {e}")
        print("          Start the MySQL service, check backend/.env, then run: python init_db.py\n")
    app.run(host=config.HOST, port=config.PORT, debug=False, threaded=True)
