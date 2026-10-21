"""Cleaning and checking everything the Admin Panel (or anybody who talks to the API) sends in.

The website puts the news texts into its pages as HTML, so the rule is: what is saved must already be safe.
 - plain fields (title, author, date ...)  -> text only; every tag is removed
 - story fields (content, content_en)      -> a small list of formatting tags is kept (p, strong, a ...), scripts / handlers / javascript: links are removed
 - pictures / files                         -> only an uploaded file of this site or an https:// address; nothing that could leave an attribute
"""
import html
import re
from typing import Any, Dict, Optional

import nh3


class ValidationError(ValueError):
    """The request cannot be saved. The text is an English sentence for the Admin Panel."""


# ---- text ----
def plain(value: Any, max_len: int = 500, label: str = "Text") -> str:
    """Text without any markup. `&`, quotes and Marathi text stay as typed; < and > never survive."""
    text = "" if value is None else str(value)
    text = nh3.clean(text, tags=set())          # removes tags (and the content of <script> / <style>)
    text = html.unescape(text)                  # (nh3 writes & as &amp; - the database keeps the characters themselves)
    text = text.replace("<", "").replace(">", "").replace("\x00", "")
    text = text.strip()
    if len(text) > max_len:
        raise ValidationError(f"{label} is too long (at most {max_len} characters).")
    return text


STORY_TAGS = {"p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "h2", "h3", "h4", "hr",
              "a", "img", "figure", "figcaption", "span"}
STORY_ATTRIBUTES = {
    "a": {"href", "title"},
    "img": {"src", "alt", "title", "width", "height"},
}


def story(value: Any, max_len: int = 400_000, label: str = "The story") -> str:
    """The text of a news item: formatting tags are kept, everything that can run code is removed."""
    text = "" if value is None else str(value)
    text = nh3.clean(
        text,
        tags=STORY_TAGS,
        attributes=STORY_ATTRIBUTES,
        url_schemes={"http", "https", "mailto"},
        link_rel="noopener noreferrer nofollow",
        set_tag_attribute_values={"a": {"target": "_blank"}},
    ).replace("\x00", "").strip()
    if len(text) > max_len:
        raise ValidationError(f"{label} is too long.")
    return text


# ---- addresses ----
_SITE_FILE = re.compile(r"assets/[\w][\w.\-/]*")                 # a file of the website (assets/images/x.jpg)
_WEB_URL = re.compile(r"https://[^\s\"'<>\\`]+")


def _web_url(text: str) -> bool:
    return bool(_WEB_URL.fullmatch(text)) and len(text) <= 1000


def site_file(text: str) -> bool:
    return bool(_SITE_FILE.fullmatch(text)) and ".." not in text.split("/")


def picture(value: Any, default: str = "", label: str = "The picture") -> str:
    """A picture address: a file of the website (assets/...) or an https:// address. Nothing else (no javascript:, no quotes)."""
    text = "" if value is None else str(value).strip()
    if not text:
        return default
    if text.startswith("../"):
        text = text[3:]
    if text.startswith("/"):
        text = text[1:]
    if site_file(text) or _web_url(text):
        return text
    raise ValidationError(f"{label} must be an uploaded picture or an https:// address.")


_ANY_WEB_URL = re.compile(r"https?://[^\s\"'<>\\`]+")
_VIDEO_ADDRESS = re.compile(r"(https?://[^\s\"'<>\\`]+)|(assets/videos/[\w][\w.\-]*)")


def video_address(value: Any) -> str:
    text = "" if value is None else str(value).strip()
    if not _VIDEO_ADDRESS.fullmatch(text) or len(text) > 1000:
        raise ValidationError("A video file is required (upload it first)")
    return text


_PDF_NAME = re.compile(r"[\w][\w.\-]{0,200}\.pdf", re.I)


def pdf_reference(value: Any, default: str) -> str:
    """The `pdf_filename` of an issue: a file name (lokmangal-weekly-30.pdf) or the https:// address of the PDF."""
    text = "" if value is None else str(value).strip()
    if not text:
        return default
    if _PDF_NAME.fullmatch(text) or (_web_url(text) and len(text) <= 255):
        return text
    raise ValidationError("The PDF must be an uploaded PDF file.")


# ---- numbers / flags ----
def whole_number(value: Any, label: str, minimum: int = 0, maximum: Optional[int] = None) -> int:
    try:
        number = int(round(float(str(value).strip())))
    except (TypeError, ValueError, OverflowError):
        raise ValidationError(f"{label} must be a number")
    if number < minimum:
        raise ValidationError(f"{label} must be {minimum} or more" if minimum > 0 else f"{label} must not be negative")
    if maximum is not None and number > maximum:
        raise ValidationError(f"{label} is too large")
    return number


# ---- whole records ----
CATEGORIES = ("rajkiy", "samajik", "blogs", "review", "reviews", "weekly")
CATEGORY_LABELS = {
    "rajkiy": "राजकीय",
    "samajik": "सामाजिक",
    "blogs": "ब्लॉग्स",
    "review": "रिव्ह्यू",        # the website's name for this section (#cat-review)
    "reviews": "रिव्ह्यू",       # older spelling, still accepted
    "weekly": "साप्ताहिक आवृत्ती",
}
FLAG_FIELDS = ("is_lead", "is_popular", "is_random", "is_latest")


def article(data: Dict[str, Any], creating: bool) -> Dict[str, Any]:
    """The article fields of a request, cleaned. Only the keys that were sent come back (so an update never blanks a field by accident).
    Raises ValidationError with a sentence the Admin Panel can show."""
    out: Dict[str, Any] = {}
    if creating or "title" in data:
        title = plain(data.get("title"), 500, "The headline")
        if not title:
            raise ValidationError("Headline/Title is required")
        out["title"] = title
    if creating or "category" in data:
        category = str(data.get("category") or "rajkiy").strip()
        if category not in CATEGORIES:
            raise ValidationError("Unknown category")
        out["category"] = category
        out["categoryLabel"] = CATEGORY_LABELS[category]        # (never taken from the client)
    for key, limit, label in (("author", 200, "The reporter name"), ("author_en", 200, "The English reporter name"),
                              ("date", 100, "The date"), ("title_en", 500, "The English headline")):
        if key in data:
            out[key] = plain(data.get(key), limit, label)
    if "views" in data:
        out["views"] = plain(data.get("views"), 20, "The readers text")
    for key, limit, label in (("excerpt", 10_000, "The summary"), ("excerpt_en", 10_000, "The English summary")):
        if key in data:
            out[key] = plain(data.get(key), limit, label)
    for key, label in (("content", "The story"), ("content_en", "The English story")):
        if key in data:
            out[key] = story(data.get(key), label=label)
    if "image" in data:
        out["image"] = picture(data.get("image"), label="The news picture")
    for key in FLAG_FIELDS:
        if key in data:
            out[key] = 1 if str(data.get(key)) in ("1", "true", "True", "on") else 0
    return out


def weekly(data: Dict[str, Any]) -> Dict[str, Any]:
    """A weekly issue (always a whole record: saving an issue number replaces that issue)."""
    try:
        issue_no = int(data.get("issue_no"))
    except (TypeError, ValueError):
        raise ValidationError("Issue number must be a number")
    if issue_no < 1:
        raise ValidationError("Issue number must be 1 or more")
    if issue_no > 99_999:
        raise ValidationError("Issue number is too large")
    title = plain(data.get("title"), 500, "The title")
    if not title:
        raise ValidationError("Issue number and title are required")
    return {
        "issue_no": issue_no,
        "title": title,
        "date": plain(data.get("date"), 100, "The date"),
        "image": picture(data.get("image"), label="The cover"),
        "pdf_filename": pdf_reference(data.get("pdf_filename"), f"lokmangal-weekly-{issue_no}.pdf"),
        "views": plain(data.get("views"), 20, "The readers text"),
        "description": plain(data.get("description"), 10_000, "The introduction"),
        "title_en": plain(data.get("title_en"), 500, "The English title"),
        "description_en": plain(data.get("description_en"), 10_000, "The English introduction"),
    }


def video(data: Dict[str, Any], creating: bool) -> Dict[str, Any]:
    """A video request (only the keys that were sent). Numbers are made whole numbers."""
    out: Dict[str, Any] = {}
    if creating or "title" in data:
        title = plain(data.get("title"), 500, "The video title")
        if not title:
            raise ValidationError("Video title is required")
        out["title"] = title
    if "title_en" in data:
        out["title_en"] = plain(data.get("title_en"), 500, "The English video title")
    for key in ("description", "description_en"):
        if key in data:
            out[key] = plain(data.get(key), 10_000, "The video description")
    if creating or "video_url" in data:
        out["video_url"] = video_address(data.get("video_url"))
    if "thumbnail" in data:
        thumb = str(data.get("thumbnail") or "").strip()
        out["thumbnail"] = picture(thumb, label="The thumbnail") if thumb else ""
    for key in ("duration_sec", "size_bytes"):
        if key in data and str(data[key] if data[key] is not None else "").strip() != "":
            out[key] = whole_number(data[key], key, 0, 2**40)
        elif key in data:
            out[key] = None
    if "sort_order" in data and str(data["sort_order"] if data["sort_order"] is not None else "").strip() != "":
        out["sort_order"] = whole_number(data["sort_order"], "sort_order", 1, 100_000)
    return out


def link_address(value: Any, label: str = "The click link") -> str:
    """The address an ad opens when it is clicked: http:// or https:// only (no javascript: / data: addresses, no quotes)."""
    text = "" if value is None else str(value).strip()
    if not text:
        return ""
    if len(text) > 1000 or not _ANY_WEB_URL.fullmatch(text):
        raise ValidationError(f"{label} must start with http:// or https://")
    return text


AD_TYPES = ("image", "video")


def ad(data: Dict[str, Any], creating: bool) -> Dict[str, Any]:
    """An advertisement of the website's ad slider: a photo or a video (only the keys that were sent)."""
    out: Dict[str, Any] = {}
    kind = str(data.get("media_type") or "").strip()
    if creating or "media_type" in data:
        if kind not in AD_TYPES:
            raise ValidationError("The ad must be a photo or a video")
        out["media_type"] = kind
    if creating or "title" in data:
        title = plain(data.get("title"), 300, "The ad title")
        if not title:
            raise ValidationError("Ad title is required")
        out["title"] = title
    if "title_en" in data:
        out["title_en"] = plain(data.get("title_en"), 300, "The English ad title")
    if creating or "media_url" in data:
        try:
            out["media_url"] = picture(data.get("media_url"), label="The photo") if kind == "image" else video_address(data.get("media_url"))
            if not out["media_url"]:
                raise ValidationError("")
        except ValidationError:
            raise ValidationError("A photo or a video is required (upload it first)")
    if "thumbnail" in data:
        thumb = str(data.get("thumbnail") or "").strip()
        out["thumbnail"] = picture(thumb, label="The thumbnail") if thumb else ""
    if "link_url" in data:
        out["link_url"] = link_address(data.get("link_url"))
    for key in ("duration_sec", "size_bytes"):
        if key in data and str(data[key] if data[key] is not None else "").strip() != "":
            out[key] = whole_number(data[key], key, 0, 2**40)
        elif key in data:
            out[key] = None
    if "sort_order" in data and str(data["sort_order"] if data["sort_order"] is not None else "").strip() != "":
        out["sort_order"] = whole_number(data["sort_order"], "sort_order", 1, 100_000)
    return out
