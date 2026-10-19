"""Lokmangal News Portal - backend: REST API (Flask) on top of MySQL.

    python app.py

With SERVE_FRONTEND=true (default) this server also delivers ../frontend:
the website on "/" and the admin panel on "/admin/". Set it to false when the frontend is hosted elsewhere.
"""
import os
import re
import socket
import sys
import time
from pathlib import Path

import pymysql
from flask import Blueprint, Flask, Response, jsonify, redirect, request, send_from_directory
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from werkzeug.utils import secure_filename

import config
import database

ALLOWED_IMG_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "m4v", "mov", "webm", "ogv"}
MB = 1024 * 1024

api = Blueprint("api", __name__, url_prefix="/api")


def ok(**payload):
    return jsonify({"success": True, **payload})


def fail(message, status):
    return jsonify({"success": False, "error": message}), status


def body():
    """The request's JSON body, or its form fields, as a dict."""
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) and data else request.form.to_dict()


def _english_warning(ignored):
    """English text came with the request but the database has no English columns yet: the Marathi part IS saved."""
    return {"warnings": ["english_not_saved"]} if ignored else {}


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
def create_article():
    data = body()
    if not data or not str(data.get("title") or "").strip():
        return fail("Headline/Title is required", 400)
    ignored = database.english_ignored(data)
    new_id = database.create_article(data)
    return jsonify({"success": True, "message": "बातमी यशस्वीरीत्या प्रकाशित झाली!",
                    "article": database.get_article(new_id), **_english_warning(ignored)}), 201


@api.route("/articles/<int:article_id>", methods=["PUT", "POST"])
def update_article(article_id):
    data = body()
    if not data:
        return fail("No update data provided", 400)
    if not database.update_article(article_id, data):
        return fail("Failed to update article or article not found", 404)
    return ok(message="बातमी अद्यतनित करण्यात आली!", article=database.get_article(article_id),
              **_english_warning(database.english_ignored(data)))


@api.post("/articles/<int:article_id>/toggle-placement")
def toggle_article_placement(article_id):
    data = body()
    field = data.get("field")
    if not field:
        return fail("Placement field is required (is_lead, is_popular, is_random)", 400)
    updated = database.toggle_placement(article_id, field, data.get("value"))
    if not updated:
        return fail("Article not found or invalid placement field", 404)
    return ok(message="सेक्शन स्थान अद्यतनित केले!", article=updated)


@api.delete("/articles/<int:article_id>")
def delete_article(article_id):
    if not database.delete_article(article_id):
        return fail("Article not found", 404)
    return ok(message="बातमी यशस्वीरीत्या हटवली!")


# -------------------------------------------------------------
# REST API: Weekly issues
# -------------------------------------------------------------
@api.get("/weekly")
def get_weekly():
    issues = database.get_weekly_editions(limit=request.args.get("limit", type=int))
    return ok(count=len(issues), issues=issues)


@api.post("/weekly")
def create_weekly():
    data = body()
    if not data or not data.get("issue_no") or not data.get("title"):
        return fail("Issue number and title are required", 400)
    try:
        issue_no = int(data["issue_no"])
    except (TypeError, ValueError):
        return fail("Issue number must be a number", 400)
    if issue_no < 1:
        return fail("Issue number must be 1 or more", 400)
    data["issue_no"] = issue_no
    ignored = database.english_ignored(data)
    database.create_weekly_edition(data)
    return jsonify({"success": True, "message": "साप्ताहिक अंक यशस्वीरीत्या जोडला!",
                    "issue": database.get_weekly_edition(issue_no), **_english_warning(ignored)}), 201


@api.delete("/weekly/<int:issue_no>")
def delete_weekly(issue_no):
    if not database.delete_weekly_edition(issue_no):
        return fail("Weekly issue not found", 404)
    return ok(message="साप्ताहिक अंक यशस्वीरीत्या हटवला!")


# -------------------------------------------------------------
# REST API: Videos (the file comes from POST /upload/video, the row from POST /videos)
# -------------------------------------------------------------
def _video_problem(data, creating):
    """Why this request cannot be saved (an English sentence for the Admin Panel), or None. Numbers are normalised in place."""
    if creating or "title" in data:
        if not str(data.get("title") or "").strip():
            return "Video title is required"
    if creating or "video_url" in data:
        url = str(data.get("video_url") or "").strip()
        # a file this server saved (assets/videos/<name>) or a direct link to a video file on another host - nothing else
        # (no javascript: / data: addresses, no ../ paths)
        if not re.fullmatch(r"assets/videos/\w[\w.\-]*", url) and not re.fullmatch(r"https?://\S+", url):
            return "A video file is required (upload it first)"
    thumb = str(data.get("thumbnail") or "").strip()
    if thumb and not re.fullmatch(r"assets/images/\w[\w.\-]*", thumb) and not re.fullmatch(r"https?://\S+", thumb):
        return "The thumbnail must be an uploaded image"
    for key in database.VIDEO_NUMBERS:
        if key in data and str(data[key] if data[key] is not None else "").strip() != "":
            try:
                number = int(round(float(data[key])))
            except (TypeError, ValueError, OverflowError):
                return f"{key} must be a number"
            if number < 0:
                return f"{key} must not be negative"
            data[key] = number
    if "sort_order" in data and str(data["sort_order"] if data["sort_order"] is not None else "").strip() != "":
        try:
            place = int(round(float(data["sort_order"])))
        except (TypeError, ValueError, OverflowError):
            return "sort_order must be a number"
        if place < 1:
            return "sort_order must be 1 or more"
        data["sort_order"] = place
    return None


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
def create_video():
    data = body()
    problem = _video_problem(data, creating=True)
    if problem:
        return fail(problem, 400)
    new_id = database.create_video(data)
    database.publish_videos_file()
    return jsonify({"success": True, "message": "व्हिडिओ यशस्वीरीत्या प्रकाशित झाला!", "video": database.get_video(new_id)}), 201


@api.route("/videos/<int:video_id>", methods=["PUT", "POST"])
def update_video(video_id):
    data = body()
    if not data:
        return fail("No update data provided", 400)
    problem = _video_problem(data, creating=False)
    if problem:
        return fail(problem, 400)
    before = database.get_video(video_id)
    if not before:
        return fail("Video not found", 404)
    if not database.update_video(video_id, data):
        return fail("No update data provided", 400)
    after = database.get_video(video_id)
    # a replaced video file / thumbnail is not kept on the disk
    removed = [_remove_upload(before[k], video_id) for k in ("video_url", "thumbnail") if before[k] != after[k]]
    database.publish_videos_file()
    return ok(message="व्हिडिओ अद्यतनित करण्यात आला!", video=after, files_removed=sum(removed))


@api.delete("/videos/<int:video_id>")
def delete_video(video_id):
    row = database.delete_video(video_id)
    if not row:
        return fail("Video not found", 404)
    removed = [_remove_upload(row[k], video_id) for k in ("video_url", "thumbnail")]
    database.publish_videos_file()
    return ok(message="व्हिडिओ यशस्वीरीत्या हटवला!", files_removed=sum(removed))


def _remove_upload(url, video_id):
    """Delete the file of a video / thumbnail that was saved by this server (assets/videos/<name>, assets/images/video-poster_<...>).
    Nothing else is ever deleted: other hosts, other folders, a picture that does not carry the video-poster_ prefix, a file another video uses."""
    for prefix, folder, name_start in (("assets/videos/", config.VIDEO_DIR, ""), ("assets/images/", config.IMAGES_DIR, "video-poster_")):
        if not url or not url.startswith(prefix):
            continue
        name = url[len(prefix):]
        if not name or "/" in name or "\\" in name or name.startswith(".") or not name.startswith(name_start):
            return False
        if database.video_file_in_use(url, video_id):
            return False
        path = folder / name
        try:
            if path.is_file() and path.resolve().parent == folder.resolve():
                path.unlink()
                return True
        except OSError:                   # e.g. Windows: the file is open in a player right now - it stays, the row is gone
            pass
        return False
    return False


# -------------------------------------------------------------
# REST API: File uploads (image & PDF)
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


@api.post("/upload/image")
def upload_image():
    file, error = _uploaded_file()
    if error:
        return error
    ext = _extension(file.filename)
    if ext not in ALLOWED_IMG_EXTENSIONS:
        return fail("Invalid image format. Allowed: png, jpg, jpeg, webp, gif", 400)

    base_name = secure_filename(file.filename.rsplit(".", 1)[0]) or "image"
    name = f"{base_name}_{int(time.time())}.{ext}"
    config.IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    path = config.IMAGES_DIR / name
    file.save(path)
    return ok(url=f"assets/images/{name}", filename=name, size=path.stat().st_size)


@api.post("/upload/pdf")
def upload_pdf():
    file, error = _uploaded_file()
    if error:
        return error
    if _extension(file.filename) != "pdf":
        return fail("Invalid file format. Allowed: pdf", 400)

    issue_no = request.form.get("issue_no", "")
    if issue_no.isascii() and issue_no.isdigit() and int(issue_no) > 0:
        name = f"lokmangal-weekly-{int(issue_no)}.pdf"      # the name the website looks for
    else:
        name = f"{secure_filename(Path(file.filename).stem) or 'weekly'}.pdf"

    config.PDF_DIR.mkdir(parents=True, exist_ok=True)
    path = config.PDF_DIR / name
    temp = path.with_name(name + ".part")
    file.save(temp)                       # a half-finished upload must never replace a good file
    try:
        with open(temp, "rb") as fh:
            is_pdf = fh.read(5) == b"%PDF-"
        if not is_pdf:
            temp.unlink(missing_ok=True)
            return fail("This is not a valid PDF file", 400)
        os.replace(temp, path)
    except OSError:
        temp.unlink(missing_ok=True)
        return fail("The PDF could not be saved (is the old file open somewhere?). Try again.", 409)
    return ok(url=f"assets/pdf/{name}", filename=name, size=path.stat().st_size)


def _looks_like_video(path, ext):
    """The first bytes must be those of the format the file name claims: a text file / PDF renamed to .mp4 is refused."""
    with open(path, "rb") as fh:
        head = fh.read(12)
    if ext in ("mp4", "m4v", "mov"):          # ISO media / QuickTime: [size][type], the type is "ftyp" (or an older QuickTime atom)
        return len(head) >= 8 and head[4:8] in (b"ftyp", b"moov", b"mdat", b"free", b"wide", b"skip", b"pnot")
    if ext == "webm":
        return head[:4] == b"\x1a\x45\xdf\xa3"
    if ext == "ogv":
        return head[:4] == b"OggS"
    return False


@api.post("/upload/video")
def upload_video():
    file, error = _uploaded_file()
    if error:
        return error
    ext = _extension(file.filename)
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        return fail("Invalid video format. Allowed: mp4, webm, mov, m4v, ogv", 400)

    base_name = (secure_filename(file.filename.rsplit(".", 1)[0]) or "video")[:60]
    name = f"{base_name}_{int(time.time() * 1000)}.{ext}"
    config.VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    path = config.VIDEO_DIR / name
    temp = path.with_name(name + ".part")
    file.save(temp)                       # a half-finished upload must never be listed or played
    try:
        if not _looks_like_video(temp, ext):
            temp.unlink(missing_ok=True)
            return fail("This is not a valid video file", 400)
        os.replace(temp, path)
    except OSError:
        temp.unlink(missing_ok=True)
        return fail("The video could not be saved. Try again.", 409)
    return ok(url=f"assets/videos/{name}", filename=name, size=path.stat().st_size)


@api.delete("/upload/video")
def discard_uploaded_video():
    """The Admin Panel takes back a file it uploaded but could not save a video for. Only a file no video points to is deleted."""
    url = str(body().get("url") or "")
    if not re.fullmatch(r"assets/videos/\w[\w.\-]*", url):
        return fail("Not an uploaded video", 400)
    return ok(removed=_remove_upload(url, None))


# -------------------------------------------------------------
# REST API: Stats, media library, health
# -------------------------------------------------------------
@api.get("/stats")
def get_stats():
    return ok(stats=database.get_stats())


def _list_files(folder, url_prefix, newest_first=False):
    if not folder.is_dir():
        return []
    names = sorted((p.name for p in folder.iterdir() if p.is_file() and not p.name.endswith(".part")),
                   reverse=newest_first)
    return [{"filename": n, "url": f"{url_prefix}/{n}", "size": (folder / n).stat().st_size} for n in names]


@api.get("/media")
def get_media():
    return ok(images=_list_files(config.IMAGES_DIR, "assets/images", newest_first=True),
              pdfs=_list_files(config.PDF_DIR, "assets/pdf"))


@api.get("/health")
def health():
    database.ping()                       # raises -> handled below as "database not available"
    return ok(database=config.DB_NAME, english=database.has_english(),
              limits={"upload_mb": config.MAX_UPLOAD_MB, "video_mb": config.MAX_VIDEO_MB})


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
            detail = e.args[1] if len(e.args) > 1 else str(e)
            return fail(f"The database did not accept this data: {detail}", 400)
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
    app = Flask(__name__, static_folder=None)
    app.config["MAX_CONTENT_LENGTH"] = max(config.MAX_UPLOAD_MB, config.MAX_VIDEO_MB) * MB     # (images / PDFs are held to their own limit by the check above)
    app.json.ensure_ascii = False         # Marathi text stays readable (and half the size) in API answers
    CORS(app, resources={r"/api/*": {"origins": config.CORS_ORIGINS}})
    app.register_blueprint(api)
    register_errors(app)
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
    print(f" API:          {base}/api/health")
    if config.SERVE_FRONTEND:
        print(f" Website:      {base}/")
        print(f" Admin panel:  {base}/admin/")
    print("=" * 62)
    try:
        database.ping()
    except pymysql.MySQLError as e:
        print(f" WARNING: cannot use MySQL yet -> {e}")
        print("          Start the MySQL service, check backend/.env, then run: python init_db.py\n")
    app.run(host=config.HOST, port=config.PORT, debug=False, threaded=True)
