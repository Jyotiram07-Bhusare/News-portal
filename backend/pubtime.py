"""The time a news / blog was published - "Published on: Nov 21, 2026, 14:05:07 IST" (the line under the headline on the website).

`articles.published_at` is a plain DATETIME that holds INDIA time (IST = UTC+05:30, no daylight saving): what is typed in the Admin Panel is what is
stored and what the website prints, so no layer (the MySQL session, the server's clock zone, the reader's browser) can shift it.
The old text column `date` ("२१ नोव्हेंबर २०२६") stays and is made from this time, so every list that only shows the date keeps working.
A story without a `published_at` (everything written before it existed) only has its date: it is shown without a time, never with an invented one.
"""
import re
from datetime import date, datetime, timedelta, timezone
from typing import Any, Optional

IST = timezone(timedelta(hours=5, minutes=30))
FIRST_YEAR, LAST_YEAR = 2000, 2099

MONTHS_MR = ("जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर")
MONTHS_EN = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
_DEVANAGARI_DIGITS = str.maketrans("0123456789", "०१२३४५६७८९")
# "2026-11-21 14:05:07" (the database), "2026-11-21T14:05:07" / "2026-11-21T14:05" (a browser's date-and-time box); the seconds are optional
_STAMP = re.compile(r"(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?")


def now() -> datetime:
    """The current India time, to the second (no zone attached: see above)."""
    return datetime.now(IST).replace(tzinfo=None, microsecond=0)


def parse(value: Any) -> Optional[datetime]:
    """'2026-11-21 14:05:07' / '2026-11-21T14:05' -> a datetime; None when the text is anything else (or a year outside 2000-2099)."""
    if isinstance(value, datetime):
        return value.replace(tzinfo=None, microsecond=0)
    match = _STAMP.fullmatch(str(value or "").strip())
    if not match:
        return None
    year, month, day, hour, minute, second = (int(part) if part else 0 for part in match.groups())
    if not FIRST_YEAR <= year <= LAST_YEAR:
        return None
    try:
        return datetime(year, month, day, hour, minute, second)
    except ValueError:
        return None


def stamp_text(moment: datetime) -> str:
    """The form the database and the API use: '2026-11-21 14:05:07'."""
    return moment.strftime("%Y-%m-%d %H:%M:%S")


def date_text(moment: datetime) -> str:
    """The Marathi date text kept in articles.date and shown in the lists: '२१ नोव्हेंबर २०२६'."""
    return f"{moment.day} {MONTHS_MR[moment.month - 1]} {moment.year}".translate(_DEVANAGARI_DIGITS)


def iso(moment: datetime) -> str:
    """'2026-11-21T14:05:07+05:30' (structured data, <time datetime>, the feed)."""
    return moment.replace(tzinfo=IST).isoformat()


def published_line(moment: Optional[datetime], day: Optional[date], lang: str) -> str:
    """'Published on: Nov 21, 2026, 14:05:07 IST' (English) / 'प्रकाशित: २१ नोव्हेंबर २०२६, १४:०५:०७ IST' (Marathi). With only a date (a story that has no
    time) just the date; '' when there is nothing to show. The website's js/app.js (publishedLineHTML) writes exactly the same text."""
    when = moment.date() if moment else day
    if when is None:
        return ""
    if lang == "en":
        text = f"Published on: {MONTHS_EN[when.month - 1]} {when.day}, {when.year}"
        return f"{text}, {moment:%H:%M:%S} IST" if moment else text
    text = f"प्रकाशित: {when.day} {MONTHS_MR[when.month - 1]} {when.year}"
    if moment:
        text += f", {moment:%H:%M:%S} IST"
    return text.translate(_DEVANAGARI_DIGITS)
