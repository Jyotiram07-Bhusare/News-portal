"""Tell search engines at once that a page of the website is new, changed or gone: the IndexNow protocol (Bing, Yandex, Naver, Seznam ... share
what one of them receives). Google does not take IndexNow: it reads the sitemaps, which are made fresh from the database (/sitemap.xml and, for
Google News, /news-sitemap.xml).

Called by app.py after the Admin Panel saves or deletes a news / blog / weekly issue - nothing has to be done by hand. Only the live server sends
(config.INDEXNOW_KEY is set there, a development PC sends nothing). It runs in the background: saving a story never waits for it or fails because
of it.
"""
import json
import logging
import threading
import urllib.request
from typing import Any, Dict, Iterable, List, Optional
from urllib.parse import urlsplit

import config
import seo

ENDPOINT = "https://api.indexnow.org/indexnow"
log = logging.getLogger("indexnow")


def enabled() -> bool:
    return bool(config.INDEXNOW_KEY and config.SITE_URL)


def submit(addresses: Iterable[str]) -> List[str]:
    """Send these addresses of the website in the background. Returns what is sent ([] when switched off)."""
    if not enabled():
        return []
    urls = list(dict.fromkeys(u for u in addresses if u and u.startswith(config.SITE_URL + "/")))
    if urls:
        threading.Thread(target=_send, args=(urls,), daemon=True).start()
    return urls


def story_changed(*rows: Optional[Dict[str, Any]]) -> List[str]:
    """The pages that show a news / blog, as it was before and as it is now: its own address, its section's page and the Home page."""
    if not enabled():
        return []
    site, urls = config.SITE_URL, []
    for row in rows:
        if row:
            urls.append(f"{site}/{seo.story_path(row)}")
            section = str(row.get("category") or "")
            if section in seo.SECTION_PATH:
                urls.append(f"{site}/{seo.section_path(section)}")
    return submit(urls + [site + "/"]) if urls else []


def issue_changed(number: int) -> List[str]:
    """The pages of a weekly issue."""
    if not enabled():
        return []
    site = config.SITE_URL
    return submit([f"{site}/{seo.issue_path(number)}", f"{site}/{seo.section_path('weekly')}", site + "/"])


def _send(urls: List[str]) -> None:
    payload = {"host": urlsplit(config.SITE_URL).netloc, "key": config.INDEXNOW_KEY,
               "keyLocation": f"{config.SITE_URL}/{config.INDEXNOW_KEY}.txt", "urlList": urls[:100]}
    request = urllib.request.Request(ENDPOINT, data=json.dumps(payload).encode("utf-8"),
                                     headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": "lokmangal-indexnow/1"})
    try:
        with urllib.request.urlopen(request, timeout=10) as reply:
            log.info("IndexNow: %s address(es) sent, answer %s", len(urls), reply.status)
    except Exception as error:                                      # (a search engine that does not answer never matters to the Admin Panel)
        log.warning("IndexNow: %s address(es) could not be sent: %s", len(urls), error)
