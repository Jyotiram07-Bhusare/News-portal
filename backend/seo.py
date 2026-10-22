"""What search engines and social networks read: a sitemap, an RSS feed and one plain page per story for link previews.

The website draws its stories with JavaScript. A link preview (WhatsApp, Facebook, X, Telegram ...) of a story would therefore show the same
card for every story, and a crawler that does not run JavaScript would find no story at all. These addresses fill that gap:

    /api/sitemap.xml         every address of the website: Home, the sections, every story, every weekly issue
    /api/rss.xml             the latest stories as a feed (?lang=en: English titles and texts)
    /api/share/<id>          one story as a plain page: its own title, summary and picture for the preview, the whole text for crawlers,
                             and a jump to the website for people (?lang=en: English)
    /api/share/issue/<no>    the same for one weekly issue
    /api/page/<kind>/<words> the PAGE of one story under its pretty address (/blog/<words>): the website's index.html with that story's title, description,
                             preview tags, structured data and text put in. The website passes /blog/... on to it (deploy.yml adds the Amplify rules), so a
                             link preview and a crawler see the story; the page then starts the website, which opens the same story.
    /api/page/<kind>         the same for a section's address (/blog, /rajkiy ...): the section's own name and description in the preview, not Home's.
    /api/og-image/<id>.jpg   the photo of a news / blog as a small JPEG (1200 px, under 300 KB) for the preview card (WhatsApp skips photos of several MB)

They live under /api/ because that is the only part of this server the production nginx lets through (deploy/docker/nginx.conf).
Nothing here writes anything and nothing needs a login. The website's own addresses are ?post=12, ?issue=42 and ?cat=rajkiy (see app.js).
"""
import hashlib
import html
import io
import json
import re
import time
import urllib.request
from datetime import date, datetime, timedelta, timezone
from email.utils import format_datetime
from typing import Any, Dict, List, Optional
from urllib.parse import quote
from xml.sax.saxutils import escape as xml_escape

from flask import Blueprint, Response, redirect, request

import config
import database
import sanitize

seo = Blueprint("seo", __name__, url_prefix="/api")

SITE_NAME = {"mr": "लोकमंगल न्यूज पोर्टल", "en": "Lokmangal News Portal"}
SITE_DESCRIPTION = {
    "mr": "लोकमंगल न्यूज पोर्टल: महाराष्ट्रातील ताज्या मराठी बातम्या, राजकीय व सामाजिक घडामोडी, लोकमंगल साप्ताहिक आवृत्ती (PDF ई-पेपर) आणि फाउंडेशनचे ब्लॉग्स - एकाच ठिकाणी.",
    "en": "Lokmangal News Portal: latest Marathi news from Maharashtra, political and social affairs, the Lokmangal weekly e-paper (PDF) and the foundation's blogs - in one place.",
}
WEEKLY_NAME = {"mr": "लोकमंगल साप्ताहिक", "en": "Lokmangal Weekly"}
SECTIONS = {   # key -> (Marathi, English): the same names the website shows
    "rajkiy": ("राजकीय", "Political"),
    "samajik": ("सामाजिक", "Social"),
    "blogs": ("ब्लॉग्स", "Blogs"),
    "review": ("रिव्ह्यू", "Reviews"),
    "weekly": ("साप्ताहिक आवृत्ती", "Weekly Edition"),
}
SECTION_PAGES = {   # key -> {language: (name, description)} of a section's own page: the same texts as SECTIONS in js/seo.js
    "rajkiy": {
        "mr": ("राजकीय बातम्या", "महाराष्ट्रातील ताज्या राजकीय बातम्या, निवडणूक व विकासकामांच्या घडामोडी - लोकमंगल न्यूज पोर्टल."),
        "en": ("Political News", "Latest political news from Maharashtra - elections, governance and development works - on Lokmangal News Portal."),
    },
    "samajik": {
        "mr": ("सामाजिक बातम्या", "समाजोपयोगी उपक्रम, शिक्षण, आरोग्य, जलसंधारण व महिला सक्षमीकरण - लोकमंगल फाउंडेशनच्या सामाजिक कार्याच्या ताज्या बातम्या."),
        "en": ("Social News", "Latest news of social work: education, health, water conservation and women's empowerment - from Lokmangal News Portal."),
    },
    "blogs": {
        "mr": ("ब्लॉग्स", "लोकमंगल फाउंडेशनचे ब्लॉग्स: अन्नपूर्णा योजना, जलसंधारण, विद्यादान, सामुदायिक विवाह आणि शिक्षकरत्न पुरस्कार यांबद्दल सविस्तर लेख."),
        "en": ("Blogs", "Blogs of the Lokmangal Foundation: in-depth articles on the Annapurna Yojana, water conservation, scholarships, community weddings and the Shikshak Ratna Award."),
    },
    "review": {
        "mr": ("रिव्ह्यू", "लोकमंगल न्यूज पोर्टलवरील ताजे रिव्ह्यू."),
        "en": ("Reviews", "Latest reviews on Lokmangal News Portal."),
    },
    "weekly": {
        "mr": ("लोकमंगल साप्ताहिक आवृत्ती - PDF ई-पेपर", "लोकमंगल साप्ताहिकाचे सर्व अंक ऑनलाइन वाचा आणि PDF म्हणून मोफत डाउनलोड करा."),
        "en": ("Lokmangal Weekly Edition - PDF E-Paper", "Read every issue of the Lokmangal weekly online and download it free as a PDF."),
    },
}
SECTION_PATH = {"rajkiy": "rajkiy", "samajik": "samajik", "blogs": "blog", "review": "review", "weekly": "weekly"}    # the first word of a pretty address
SECTION_OF_PATH = {path: key for key, path in SECTION_PATH.items()}
PAGE_KINDS = {"blog": "blogs", "rajkiy": "rajkiy", "samajik": "samajik", "review": "review"}                         # ... and the section it stands for
STORY_SECTIONS = ("rajkiy", "samajik", "blogs", "review")      # sections whose items are stories (the weekly issues are listed on their own)
DEFAULT_IMAGE = "assets/og-default.jpg"                        # the card shown when a story has no picture a preview can use
LOGO = "assets/logo-192.jpg"
IST = timezone(timedelta(hours=5, minutes=30))
FEED_ITEMS = 30
SUMMARY_CHARS = 190

_DEVANAGARI = str.maketrans("०१२३४५६७८९", "0123456789")
_MONTHS = {name: i + 1 for i, name in enumerate(
    ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"])}
_EN_MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
_MONTHS.update({name: i + 1 for i, name in enumerate(_EN_MONTHS)})
_MONTHS.update({name[:3]: i + 1 for i, name in enumerate(_EN_MONTHS)})            # (Oct, Sep ...)
_DAY_MONTH_YEAR = re.compile(r"(\d{1,2})\s+([^\s\d.,]+)[.,]?\s+(\d{4})")
_ISO_DATE = re.compile(r"(\d{4})-(\d{2})-(\d{2})")
_ORGANISATION = re.compile(r"foundation|bureau|team|desk|portal|news|फाऊंडेशन|फाउंडेशन|ब्युरो|प्रतिनिधी|टीम|पोर्टल|न्यूज|मंच", re.I)


# ---------------------------------------------------------------------------------------------------- small helpers
def site_url() -> str:
    """The public website (no trailing slash). A development PC without SITE_URL: the address this very request came to."""
    return (config.SITE_URL or request.host_url).rstrip("/")


def _lang() -> str:
    return "en" if request.args.get("lang") == "en" else "mr"


def _pick(row: Dict[str, Any], field: str, lang: str) -> str:
    """The English text when English is asked for and the row has it, otherwise the Marathi text."""
    if lang == "en":
        english = str(row.get(field + "_en") or "").strip()
        if english:
            return english
    return str(row.get(field) or "").strip()


def _dev(number: int) -> str:
    return str(number).translate(str.maketrans("0123456789", "०१२३४५६७८९"))


def parse_date(text: Any) -> Optional[date]:
    """'१३ ऑक्टोबर २०२६' / '13 October 2026' / '2026-10-13' -> a date; None when the text is something else."""
    t = str(text or "").translate(_DEVANAGARI)
    m = _DAY_MONTH_YEAR.search(t)
    if m and m.group(2).lower() in _MONTHS:
        try:
            return date(int(m.group(3)), _MONTHS[m.group(2).lower()], int(m.group(1)))
        except ValueError:
            return None
    m = _ISO_DATE.search(t)
    if m:
        try:
            return date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            return None
    return None


def _stamp(value: Any) -> Optional[datetime]:
    """A database time ('2026-10-13 06:24:00') -> datetime."""
    try:
        return datetime.strptime(str(value or "")[:19], "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return None


def absolute(src: Any, site: str) -> str:
    """'assets/images/a.jpg' -> 'https://www.example/assets/images/a.jpg'; an https:// address stays as it is."""
    text = str(src or "").strip()
    if not text:
        return ""
    if re.match(r"https?://", text, re.I):
        return text
    if text.startswith("//"):
        return "https:" + text
    return f"{site}/{text.lstrip('/')}"


def preview_image(src: Any, site: str) -> str:
    """The picture for a link preview: the story's own, unless it is a format some apps do not draw (then the site's default card)."""
    url = absolute(src, site)
    if not url or url.lower().split("?")[0].endswith((".webp", ".gif", ".svg")):
        return f"{site}/{DEFAULT_IMAGE}"
    return url


def card_image(row: Dict[str, Any], image: str) -> str:
    """The picture a link preview shows: a small copy of the story's photo (/api/og-image/<id>.jpg) when PREVIEW_IMAGES is on, else the photo itself."""
    if not config.PREVIEW_IMAGES or not row.get("id") or image.endswith("/" + DEFAULT_IMAGE):
        return image
    base = config.PUBLIC_API_URL or request.host_url.rstrip("/")
    return f"{base}/api/og-image/{row['id']}.jpg?v={hashlib.md5(image.encode()).hexdigest()[:8]}"


def plain_text(markup: Any) -> str:
    text = re.sub(r"<(script|style)\b.*?</\1>", " ", str(markup or ""), flags=re.S | re.I)
    text = html.unescape(re.sub(r"<[^>]+>", " ", text))
    return re.sub(r"\s+", " ", text).strip()


def summary_of(excerpt: str, content: str) -> str:
    text = plain_text(excerpt) or plain_text(content)
    if len(text) <= SUMMARY_CHARS:
        return text
    cut = text[:SUMMARY_CHARS].rsplit(" ", 1)[0] or text[:SUMMARY_CHARS]
    return cut.rstrip(" ,.;:-") + "…"


def _iso(day: Optional[date]) -> str:
    return datetime(day.year, day.month, day.day, tzinfo=IST).isoformat() if day else ""


def _modified_iso(row: Dict[str, Any], published: Optional[date]) -> str:
    stamp = _stamp(row.get("updated_at")) or _stamp(row.get("created_at"))
    if not stamp:
        return _iso(published)
    stamp = stamp.replace(tzinfo=IST)
    if published and stamp < datetime(published.year, published.month, published.day, tzinfo=IST):
        return _iso(published)                      # (never "modified" before it was published)
    return stamp.isoformat()


def _publisher(site: str, lang: str) -> Dict[str, Any]:
    return {"@type": "NewsMediaOrganization", "name": SITE_NAME[lang], "url": site + "/",
            "logo": {"@type": "ImageObject", "url": f"{site}/{LOGO}", "width": 192, "height": 192}}


def _json_for_script(data: Any) -> str:
    """JSON that is safe inside <script type="application/ld+json"> (no </script>, no line-separator characters)."""
    return json.dumps(data, ensure_ascii=False).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


# ---------------------------------------------------------------------------------------------------- addresses
def story_path(row: Dict[str, Any]) -> str:
    """'blog/<words>' (the pretty address), or '?post=12' while PRETTY_URLS is off or the story has no words in its address yet. No leading slash."""
    slug = str(row.get("slug") or "")
    prefix = SECTION_PATH.get(str(row.get("category")))
    if config.PRETTY_URLS and slug and prefix:
        return f"{prefix}/{quote(slug, safe='-')}"
    return f"?post={row['id']}"


def issue_path(number: Any) -> str:
    return f"weekly/{number}" if config.PRETTY_URLS else f"?issue={number}"


def section_path(section: str) -> str:
    return SECTION_PATH[section] if config.PRETTY_URLS else f"?cat={section}"


def with_lang(url: str, lang: str) -> str:
    return url + ((("&" if "?" in url else "?") + "lang=en") if lang == "en" else "")


# ---------------------------------------------------------------------------------------------------- a story as a plain description
def article_story(row: Dict[str, Any], lang: str, site: str) -> Dict[str, Any]:
    """Everything a preview / crawler page needs about one news item or blog (row of the articles table)."""
    lang = "en" if lang == "en" and str(row.get("title_en") or "").strip() else "mr"        # (a story without English text is shown in Marathi)
    section = str(row.get("category") or "")
    names = SECTIONS.get(section)
    section_name = names[0 if lang == "mr" else 1] if names else str(row.get("categoryLabel") or "")
    title = _pick(row, "title", lang)
    content = _pick(row, "content", lang)
    try:
        body = sanitize.story(content)
    except sanitize.ValidationError:
        body = "<p>" + html.escape(plain_text(content)) + "</p>"
    created = _stamp(row.get("created_at"))
    published = parse_date(row.get("date")) or (created.date() if created else None)
    author = _pick(row, "author", lang)
    canonical = f"{site}/{story_path(row)}"
    image = preview_image(row.get("image"), site)
    card = card_image(row, image)
    summary = summary_of(_pick(row, "excerpt", lang), content)
    data: Dict[str, Any] = {
        "@context": "https://schema.org",
        "@type": "BlogPosting" if section == "blogs" else "NewsArticle",
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
        "headline": title[:110],
        "description": summary,
        "image": [image],
        "inLanguage": lang,
        "articleSection": section_name,
        "publisher": _publisher(site, lang),
    }
    if published:
        data["datePublished"] = _iso(published)
        data["dateModified"] = _modified_iso(row, published)
    if author:
        data["author"] = {"@type": "Organization" if _ORGANISATION.search(author) else "Person", "name": author}
    return {"lang": lang, "title": title, "summary": summary, "image": image, "card": card, "body": body,
            "author": author, "section": section_name, "published": published, "published_iso": data.get("datePublished", ""),
            "modified_iso": data.get("dateModified", ""), "canonical": canonical,
            "target": with_lang(canonical, lang), "jsonld": data}


def issue_story(row: Dict[str, Any], lang: str, site: str) -> Dict[str, Any]:
    """The same for one weekly issue (row of the weekly_editions table)."""
    lang = "en" if lang == "en" and str(row.get("title_en") or "").strip() else "mr"
    number = int(row["issue_no"])
    label = f"अंक {_dev(number)}" if lang == "mr" else f"Issue {number}"
    headline = _pick(row, "title", lang)
    title = f"{WEEKLY_NAME[lang]} - {label}: {headline}" if headline else f"{WEEKLY_NAME[lang]} - {label}"
    description = _pick(row, "description", lang)
    created = _stamp(row.get("created_at"))
    published = parse_date(row.get("date")) or (created.date() if created else None)
    canonical = f"{site}/{issue_path(number)}"
    image = preview_image(row.get("image"), site)
    summary = summary_of(description, headline)
    data: Dict[str, Any] = {
        "@context": "https://schema.org",
        "@type": "PublicationIssue",
        "name": title,
        "issueNumber": str(number),
        "description": summary,
        "image": [image],
        "url": canonical,
        "inLanguage": lang,
        "isPartOf": {"@type": "Periodical", "name": WEEKLY_NAME[lang], "publisher": _publisher(site, lang)},
    }
    if published:
        data["datePublished"] = _iso(published)
    body = "<p>" + html.escape(description or headline) + "</p>"
    return {"lang": lang, "title": title, "summary": summary, "image": image, "body": body, "author": WEEKLY_NAME[lang],
            "section": SECTIONS["weekly"][0 if lang == "mr" else 1], "published": published, "published_iso": data.get("datePublished", ""),
            "modified_iso": data.get("datePublished", ""), "canonical": canonical,
            "target": with_lang(canonical, lang), "jsonld": data}


# ---------------------------------------------------------------------------------------------------- the share page
def share_page(story: Dict[str, Any]) -> str:
    """A small, complete HTML page: the preview tags in the head, the text in the body, people are sent on to the website."""
    lang = story["lang"]
    esc = lambda text: html.escape(str(text), quote=True)       # noqa: E731
    site_name = SITE_NAME[lang]
    target = story["target"]
    meta_line = " · ".join(part for part in (story["section"], story["author"],
                                             story["published"].isoformat() if story["published"] else "") if part)
    published = f'<meta property="article:published_time" content="{esc(story["published_iso"])}">\n' if story["published_iso"] else ""
    modified = f'<meta property="article:modified_time" content="{esc(story["modified_iso"])}">\n' if story["modified_iso"] else ""
    go = "वेबसाईटवर वाचा" if lang == "mr" else "Read it on the website"
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(story["title"])} | {esc(site_name)}</title>
<meta name="description" content="{esc(story["summary"])}">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url={esc(target)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="{esc(site_name)}">
<meta property="og:locale" content="{"mr_IN" if lang == "mr" else "en_IN"}">
<meta property="og:title" content="{esc(story["title"])}">
<meta property="og:description" content="{esc(story["summary"])}">
<meta property="og:image" content="{esc(story.get("card") or story["image"])}">
<meta property="og:image:alt" content="{esc(story["title"])}">
{published}{modified}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(story["title"])}">
<meta name="twitter:description" content="{esc(story["summary"])}">
<meta name="twitter:image" content="{esc(story.get("card") or story["image"])}">
<script type="application/ld+json">{_json_for_script(story["jsonld"])}</script>
<style>body{{margin:0;padding:24px 16px;font:17px/1.7 system-ui,"Noto Sans Devanagari",sans-serif;color:#222;background:#fff}}article{{max-width:720px;margin:0 auto}}img{{max-width:100%;height:auto}}h1{{font-size:26px;line-height:1.35}}.meta{{color:#666;font-size:14px}}table{{border-collapse:collapse}}td,th{{border:1px solid #ccc;padding:4px 8px}}</style>
</head>
<body>
<article>
<h1>{esc(story["title"])}</h1>
<p class="meta">{esc(meta_line)}</p>
<img src="{esc(story["image"])}" alt="{esc(story["title"])}">
{story["body"]}
<p><a href="{esc(target)}">{esc(go)} &rarr; {esc(site_name)}</a></p>
</article>
<script>location.replace({_json_for_script(target)});</script>
</body>
</html>
"""


def _not_found(lang: str) -> Response:
    text = "बातमी सापडली नाही" if lang == "mr" else "Story not found"
    page = (f'<!DOCTYPE html><html lang="{lang}"><head><meta charset="utf-8"><meta name="robots" content="noindex">'
            f'<title>{text}</title></head><body><p>{text}</p><p><a href="{html.escape(site_url())}/">{html.escape(SITE_NAME[lang])}</a></p></body></html>')
    return Response(page, 404, mimetype="text/html")


def _html(page: str, max_age: int = 60) -> Response:
    response = Response(page, mimetype="text/html")
    response.headers["Cache-Control"] = f"public, max-age={max_age}, stale-while-revalidate=300"
    return response


@seo.get("/share/<int:article_id>")
def share_article(article_id):
    lang = _lang()
    row = database.get_article(article_id)
    if not row:
        return _not_found(lang)
    return _html(share_page(article_story(row, lang, site_url())))


@seo.get("/share/issue/<int:issue_no>")
def share_issue(issue_no):
    lang = _lang()
    row = database.get_weekly_edition(issue_no)
    if not row:
        return _not_found(lang)
    return _html(share_page(issue_story(row, lang, site_url())))


# ---------------------------------------------------------------------------------------------------- the page of one story (/blog/<words>)
_SHELL = {"text": "", "at": 0.0}
SHELL_KEPT = 300          # seconds the website's index.html is kept after it was fetched


def shell_html() -> Optional[str]:
    """The website's own index.html: read from the frontend folder on a development PC; on the server fetched from the website (and kept 5 minutes)."""
    local = config.FRONTEND_DIR / "index.html"
    try:
        if local.is_file():
            return local.read_text(encoding="utf-8")
    except OSError:
        pass
    if _SHELL["text"] and time.time() - _SHELL["at"] < SHELL_KEPT:
        return _SHELL["text"]
    try:
        asked = urllib.request.Request(site_url() + "/index.html", headers={"User-Agent": "lokmangal-page/1"})
        with urllib.request.urlopen(asked, timeout=5) as res:
            text = res.read().decode("utf-8")
        if "<!--seo:start-->" in text and "<!--ssr:start-->" in text:
            _SHELL.update(text=text, at=time.time())
            return text
    except Exception:                                             # (the website did not answer: an older copy is better than none)
        pass
    return _SHELL["text"] or None


def _seo_head(story: Dict[str, Any], lang: str, crumbs: List[Any]) -> str:
    esc = lambda text: html.escape(str(text), quote=True)       # noqa: E731
    name = SITE_NAME[lang]
    parts = [
        f"<title>{esc(story['title'])} | {esc(name)}</title>",
        f'<meta name="description" content="{esc(story["summary"])}" />',
        f'<link rel="canonical" href="{esc(story["canonical"])}" />',
        '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
        f'<meta property="og:type" content="{esc(story.get("type", "article"))}" />',
        f'<meta property="og:site_name" content="{esc(name)}" />',
        f'<meta property="og:locale" content="{"mr_IN" if lang == "mr" else "en_IN"}" />',
        f'<meta property="og:url" content="{esc(story["canonical"])}" />',
        f'<meta property="og:title" content="{esc(story["title"])}" />',
        f'<meta property="og:description" content="{esc(story["summary"])}" />',
        f'<meta property="og:image" content="{esc(story.get("card") or story["image"])}" />',
    ]
    if story.get("image_size"):                                           # (known for the card of the website itself, not for a story's own picture)
        parts += [f'<meta property="og:image:width" content="{story["image_size"][0]}" />', f'<meta property="og:image:height" content="{story["image_size"][1]}" />']
    parts.append(f'<meta property="og:image:alt" content="{esc(story["title"])}" />')
    if story["published_iso"]:
        parts.append(f'<meta property="article:published_time" content="{esc(story["published_iso"])}" />')
    if story["modified_iso"]:
        parts.append(f'<meta property="article:modified_time" content="{esc(story["modified_iso"])}" />')
    parts += [
        '<meta name="twitter:card" content="summary_large_image" />',
        f'<meta name="twitter:title" content="{esc(story["title"])}" />',
        f'<meta name="twitter:description" content="{esc(story["summary"])}" />',
        f'<meta name="twitter:image" content="{esc(story.get("card") or story["image"])}" />',
    ]
    breadcrumb = {"@context": "https://schema.org", "@type": "BreadcrumbList",
                  "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)]}
    parts.append(f'<script type="application/ld+json" id="ld-view">{_json_for_script([story["jsonld"], breadcrumb])}</script>')
    return "\n  ".join(parts)


def _ssr_body(story: Dict[str, Any]) -> str:
    esc = lambda text: html.escape(str(text), quote=True)       # noqa: E731
    meta = " · ".join(p for p in (story["section"], story["author"], story["published"].isoformat() if story["published"] else "") if p)
    return (f'<h1 class="single-post-headline">{esc(story["title"])}</h1>\n'
            f'<p class="ssr-meta">{esc(meta)}</p>\n'
            f'<div class="single-post-media"><img src="{esc(story["image"])}" alt="{esc(story["title"])}"></div>\n'
            f'<div class="single-article-content">{story["body"]}</div>')


def render_page(template: str, head: str, body: Optional[str], lang: str) -> str:
    """The website's index.html with `head` in place of its seo region and `body` (None: the website's own) in place of its ssr region."""
    out = re.sub(r"<!--seo:start-->.*?<!--seo:end-->", lambda m: head, template, count=1, flags=re.S)
    if body is not None:
        out = re.sub(r"<!--ssr:start-->.*?<!--ssr:end-->", lambda m: body, out, count=1, flags=re.S)
    return re.sub(r'<html lang="[a-zA-Z-]+"', f'<html lang="{lang}"', out, count=1)       # (index.html has <base href="/">: its files are found from the root)


def page_response(kind: str, slug: str) -> Response:
    lang, site = _lang(), site_url()
    template = shell_html()
    story = None
    crumbs: List[Any] = []
    if kind == "weekly":
        row = database.get_weekly_edition(int(slug)) if slug.isdigit() else None
        if row:
            story = issue_story(row, lang, site)
            crumbs = [(SITE_NAME[story["lang"]], site + "/"), (story["section"], f"{site}/{section_path('weekly')}"), (story["title"], story["canonical"])]
    elif kind in PAGE_KINDS:
        row = database.get_article_by_slug(slug)
        if row and SECTION_PATH.get(str(row.get("category"))) != kind:                 # the right section's address for it
            return redirect(with_lang(f"{site}/{story_path(row)}", lang), code=301)
        if row:
            story = article_story(row, lang, site)
            crumbs = [(SITE_NAME[story["lang"]], site + "/"), (story["section"], f"{site}/{section_path(str(row['category']))}"),
                      (story["title"], story["canonical"])]
    if story is None:                                                                  # an address that is nobody's: the website itself, not listed
        if template is None:
            return _not_found(lang)
        head = f'<title>{html.escape(SITE_NAME[lang])}</title>\n  <meta name="robots" content="noindex" />'
        response = Response(render_page(template, head, "", lang), 404, mimetype="text/html")
        response.headers["Cache-Control"] = "public, max-age=60"
        return response
    if template is None:                                                               # the website did not answer: the plain page that sends people on
        return _html(share_page(story))
    return _html(render_page(template, _seo_head(story, story["lang"], crumbs), _ssr_body(story), story["lang"]))


@seo.get("/page/<kind>/<slug>")
def page(kind, slug):
    return page_response(kind, slug)


def section_story(section: str, lang: str, site: str) -> Dict[str, Any]:
    """A section's own page (/blog, /rajkiy ...) described like a story, so the same head / preview code serves it."""
    name, description = SECTION_PAGES[section][lang]
    canonical = f"{site}/{section_path(section)}"
    data = {"@context": "https://schema.org", "@type": "CollectionPage", "name": name, "description": description, "url": canonical,
            "inLanguage": lang, "isPartOf": {"@id": f"{site}/#website"}}
    return {"lang": lang, "type": "website", "title": name, "summary": description, "image": f"{site}/{DEFAULT_IMAGE}", "image_size": (1200, 630), "body": "",
            "author": "", "section": name, "published": None, "published_iso": "", "modified_iso": "", "canonical": canonical,
            "target": with_lang(canonical, lang), "jsonld": data}


def section_response(kind: str) -> Response:
    section = SECTION_OF_PATH.get(kind)
    if not section:
        return _not_found(_lang())
    lang, site = _lang(), site_url()
    story = section_story(section, lang, site)
    template = shell_html()
    if template is None:
        return _html(share_page(story))
    crumbs = [(SITE_NAME[lang], site + "/"), (story["title"], story["canonical"])]
    return _html(render_page(template, _seo_head(story, lang, crumbs), None, lang))      # (the rest of the page is the website's own)


@seo.get("/page/<kind>")
def section_page(kind):
    return section_response(kind)


# ---------------------------------------------------------------------------------------------------- the small photo of a preview card
CARD_WIDTH = 1200
CARD_BYTES = 300 * 1024
CARD_SOURCE_MAX = 40 * 1024 * 1024
_CARDS: Dict[int, Any] = {}          # article id -> (source address, JPEG bytes or None = the original is fine)
_CARDS_KEPT = 64


def _read_photo(src: str, site: str) -> bytes:
    """The bytes of a photo: a file of the frontend folder, or whatever address (http / https) the photo has."""
    text = str(src or "").strip()
    if text and not re.match(r"(https?:)?//", text, re.I):
        local = (config.FRONTEND_DIR / text.lstrip("/")).resolve()
        if local.is_file() and config.FRONTEND_DIR.resolve() in local.parents:
            return local.read_bytes()
    with urllib.request.urlopen(urllib.request.Request(absolute(src, site), headers={"User-Agent": "lokmangal-card/1"}), timeout=15) as res:
        data = res.read(CARD_SOURCE_MAX + 1)
    if len(data) > CARD_SOURCE_MAX:
        raise ValueError("photo too big")
    return data


def make_card(data: bytes) -> Optional[bytes]:
    """A JPEG of at most 1200 px width and CARD_BYTES; None when the photo is small enough already (or Pillow / the photo is not usable)."""
    try:
        from PIL import Image, ImageOps
    except ImportError:
        return None
    with Image.open(io.BytesIO(data)) as opened:
        kind = opened.format                                           # (the turned copy below no longer knows it)
        img = ImageOps.exif_transpose(opened)
        if len(data) <= CARD_BYTES and img.width <= CARD_WIDTH and kind in ("JPEG", "PNG"):
            return None
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGBA")
            flat = Image.new("RGB", img.size, (255, 255, 255))
            flat.paste(img, mask=img.getchannel("A"))
            img = flat
        else:
            img = img.convert("RGB")
        if img.width > CARD_WIDTH:
            img = img.resize((CARD_WIDTH, max(1, round(img.height * CARD_WIDTH / img.width))), Image.LANCZOS)
        for quality in (85, 78, 70, 62, 54, 46):
            out = io.BytesIO()
            img.save(out, "JPEG", quality=quality, optimize=True, progressive=True)
            if out.tell() <= CARD_BYTES:
                break
        return out.getvalue()


@seo.get("/og-image/<int:article_id>.jpg")
def og_image(article_id):
    row = database.get_article(article_id)
    if not row:
        return _not_found("mr")
    site = site_url()
    original = preview_image(row.get("image"), site)
    cached = _CARDS.get(article_id)
    if not cached or cached[0] != original:
        try:
            cached = (original, make_card(_read_photo(row.get("image"), site)))
        except Exception:                                              # (a photo that cannot be read or drawn: the preview uses it as it is; tried again next time)
            return redirect(original, code=302)
        if len(_CARDS) >= _CARDS_KEPT:
            _CARDS.pop(next(iter(_CARDS)))
        _CARDS[article_id] = cached
    if cached[1] is None:
        return redirect(original, code=302)
    response = Response(cached[1], mimetype="image/jpeg")
    response.headers["Cache-Control"] = "public, max-age=86400"
    return response


# ---------------------------------------------------------------------------------------------------- sitemap.xml
def _day(value: Any) -> str:
    stamp = _stamp(value)
    return stamp.date().isoformat() if stamp else ""


def _url_entry(loc: str, lastmod: str = "", images: Optional[List[str]] = None) -> str:
    parts = [f"<loc>{xml_escape(loc)}</loc>"]
    if lastmod:
        parts.append(f"<lastmod>{lastmod}</lastmod>")
    for image in images or []:
        if image:
            parts.append(f"<image:image><image:loc>{xml_escape(image)}</image:loc></image:image>")
    return "  <url>" + "".join(parts) + "</url>"


@seo.get("/sitemap.xml")
def sitemap():
    site = site_url()
    articles = sorted(database.get_articles(), key=lambda r: -int(r["id"]))
    issues = database.get_weekly_editions()
    newest: Dict[str, str] = {}                           # section -> the latest change inside it (for the section's own address)
    present = {str(a.get("category")) for a in articles} | ({"weekly"} if issues else set())

    def touch(section: str, day: str) -> None:
        if day and day > newest.get(section, ""):
            newest[section] = day

    entries = []
    for row in articles:
        day = _day(row.get("updated_at")) or _day(row.get("created_at"))
        touch(str(row.get("category")), day)
        entries.append(_url_entry(f"{site}/{story_path(row)}", day, [absolute(row.get("image"), site)]))
    for row in sorted(issues, key=lambda r: -int(r["issue_no"])):
        day = _day(row.get("updated_at")) or _day(row.get("created_at"))
        touch("weekly", day)
        entries.append(_url_entry(f"{site}/{issue_path(row['issue_no'])}", day, [absolute(row.get("image"), site)]))

    top = [_url_entry(site + "/", max(newest.values(), default=""))]
    for section in (*STORY_SECTIONS, "weekly"):
        if section in present:
            top.append(_url_entry(f"{site}/{section_path(section)}", newest.get(section, "")))
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
           + "\n".join(top + entries) + "\n</urlset>\n")
    response = Response(xml, mimetype="application/xml")
    response.headers["Cache-Control"] = "public, max-age=300"
    return response


# ---------------------------------------------------------------------------------------------------- rss.xml
def _cdata(markup: str) -> str:
    return "<![CDATA[" + markup.replace("]]>", "]]]]><![CDATA[>") + "]]>"


@seo.get("/rss.xml")
def rss():
    lang = _lang()
    site = site_url()
    rows = [r for r in database.get_articles() if str(r.get("category")) in STORY_SECTIONS]

    def newest_first(row):
        created = _stamp(row.get("created_at"))
        return (parse_date(row.get("date")) or (created.date() if created else date.min), int(row["id"]))

    rows.sort(key=newest_first, reverse=True)
    items = []
    for row in rows[:FEED_ITEMS]:
        story = article_story(row, lang, site)
        stamp = datetime(*(story["published"] or date.today()).timetuple()[:3], tzinfo=IST)
        picture = f'<p><img src="{html.escape(story["image"])}" alt="{html.escape(story["title"])}"></p>'
        items.append(
            "    <item>"
            f"<title>{xml_escape(story['title'])}</title>"
            f"<link>{xml_escape(story['target'])}</link>"
            f'<guid isPermaLink="true">{xml_escape(story["canonical"])}</guid>'
            f"<pubDate>{format_datetime(stamp)}</pubDate>"
            + (f"<dc:creator>{xml_escape(story['author'])}</dc:creator>" if story["author"] else "")
            + f"<category>{xml_escape(story['section'])}</category>"
            f"<description>{xml_escape(story['summary'])}</description>"
            f"<content:encoded>{_cdata(picture + story['body'])}</content:encoded>"
            f'<media:content url="{xml_escape(story["image"])}" medium="image"/>'
            "</item>")
    built = format_datetime(datetime.now(timezone.utc))
    self_url = f"{site}/api/rss.xml" + ("?lang=en" if lang == "en" else "")
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" '
           'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">\n'
           "  <channel>\n"
           f"    <title>{xml_escape(SITE_NAME[lang])}</title>\n"
           f"    <link>{xml_escape(site)}/</link>\n"
           f"    <description>{xml_escape(SITE_DESCRIPTION[lang])}</description>\n"
           f"    <language>{lang}</language>\n"
           f"    <lastBuildDate>{built}</lastBuildDate>\n"
           f'    <atom:link href="{xml_escape(self_url)}" rel="self" type="application/rss+xml"/>\n'
           f"    <image><url>{xml_escape(site)}/{LOGO}</url><title>{xml_escape(SITE_NAME[lang])}</title><link>{xml_escape(site)}/</link></image>\n"
           + "\n".join(items) + "\n  </channel>\n</rss>\n")
    response = Response(xml, mimetype="application/rss+xml")
    response.headers["Cache-Control"] = "public, max-age=300"
    return response
