"""The words of an address (/blog/<words>, /video/<words>): short, in English letters, easy to read and to share.

An English headline is used when there is one. A Marathi headline is written the way people type Marathi in English letters
('सोलापूर जिल्हा बँकेच्या संचालकपदी ...' -> 'solapur-jilha-bankechya-sanchalakpadi-...'), because Marathi letters in an address turn into long
%E0%A4... codes as soon as the link is copied or shared. Only the first few words are kept.

    make(title_en, title)   the words for a story / video ('story' when the headline has no letter or digit at all)

The spelling is meant to be read, not to be exact: words that are usually written their own way (English words in Marathi letters, a few names)
are listed in _STEMS. A change here only affects addresses made from then on - an address that exists is never made again (database.py).
"""
import re
import unicodedata
from typing import List

LIMIT = 60              # characters, at most
WORDS = 6               # words, at most
ENOUGH_WORDS = 4        # the first part of a headline ("...; ...", "...! ...") is enough by itself when it gives this many words

_VOWELS = {"अ": "a", "आ": "a", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u", "ऋ": "ru", "ॠ": "ru", "ऌ": "lu", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au",
           "ऍ": "e", "ऎ": "e", "ऑ": "o", "ऒ": "o", "ॲ": "a"}
_MATRAS = {"ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ru", "ॄ": "ru", "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॅ": "a", "ॆ": "e", "ॉ": "o", "ॊ": "o"}
_CONSONANTS = {"क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "n", "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n", "ट": "t", "ठ": "th", "ड": "d",
               "ढ": "dh", "ण": "n", "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n", "ऩ": "n", "प": "p", "फ": "f", "ब": "b", "भ": "bh", "म": "m",
               "य": "y", "र": "r", "ऱ": "r", "ल": "l", "ळ": "l", "ऴ": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h",
               "क़": "k", "ख़": "kh", "ग़": "g", "ज़": "z", "ड़": "d", "ढ़": "dh", "फ़": "f", "य़": "y"}
_VIRAMA, _ANUSVARA, _CHANDRABINDU, _VISARGA, _NUKTA = "्", "ं", "ँ", "ः", "़"
_LIPS = ("p", "ph", "f", "b", "bh", "m", "v")           # an anusvara before these is said "m" (संविधान -> samvidhan)

# Words that have their own usual spelling. The Marathi beginning of a word -> its English letters; endings (-ची, -ला, -ातून ...) follow as usual.
_STEMS = {
    "लोकमंगल": "lokmangal", "फाउंडेशन": "foundation", "फाऊंडेशन": "foundation", "शेतकर": "shetkar", "शेतकऱ": "shetkar", "गणपत": "ganpat",
    "छत्रपत": "chhatrapat", "सरपंच": "sarpanch", "जलसंधारण": "jalsandharan", "योजन": "yojan", "दिवाळी": "diwali", "भाजप": "bjp",
    "आयटीआय": "iti", "नर्सिंग": "nursing", "कॉलेज": "college", "स्कूल": "school", "हॉस्पिटल": "hospital", "डॉक्टर": "doctor", "पॅनल": "panel",
    "पॅनेल": "panel", "लोटस": "lotus", "सोसायटी": "society", "ऑपरेटिव्ह": "operative", "अर्बन": "urban", "मल्टी": "multi", "ट्रस्ट": "trust",
    "पोलीस": "police", "पोलिस": "police", "कंपनी": "company", "प्रोजेक्ट": "project", "क्लब": "club", "कॅम्प": "camp", "मॅरेथॉन": "marathon",
    "जानेवारी": "january", "फेब्रुवारी": "february", "मार्च": "march", "एप्रिल": "april", "ऑगस्ट": "august", "सप्टेंबर": "september",
    "ऑक्टोबर": "october", "नोव्हेंबर": "november", "डिसेंबर": "december", "भारतीय": "bharatiya", "भारत": "bharat", "सोहळ": "sohal", "आंबेडकर": "ambedkar", "करमाळ": "karmal",
    "व्हिडिओ": "video", "व्हिडीओ": "video", "फोटो": "photo", "ऑनलाइन": "online", "ऑनलाईन": "online", "ऑफिस": "office", "न्यूज": "news", "टीम": "team",
    "सेंटर": "center", "स्पोर्ट्स": "sports", "कार्ड": "card", "कॅन्सर": "cancer", "लाइव्ह": "live", "लाईव्ह": "live", "रोटरी": "rotary", "लायन्स": "lions",
    "ग्रुप": "group", "मार्केट": "market", "फेस्टिव्हल": "festival", "वेबसाईट": "website", "वेबसाइट": "website", "मोबाईल": "mobile", "मोबाइल": "mobile",
}
_STEM_ORDER = sorted(_STEMS, key=len, reverse=True)
_WHOLE_WORDS = {"डॉ": "dr"}
# Endings written as words of their own: the word before them is spelled as if it stood alone (संचालक + पदी -> sanchalak + padi)
_ENDINGS = ("पर्यंत", "बद्दल", "मध्ये", "मधील", "मधून", "साठी", "कडून", "तर्फे", "वरील", "पदी", "च्या")

_SMALL_WORDS = {   # left out of an address (when enough other words are there)
    "व", "आणि", "अन", "एक", "हा", "ही", "हे", "या", "ते", "तो", "ती", "की", "तर", "म्हणून", "तसेच", "आहे", "आहेत",
    "यांचा", "यांची", "यांचे", "यांच्या", "यांना", "यांनी", "यांचं",
    "a", "an", "the", "of", "in", "on", "at", "to", "for", "and", "or", "is", "are", "was", "were", "be", "with", "by", "from", "as", "that",
    "this", "its", "it", "will", "has", "have", "into", "their", "his", "her",
}
_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
_BREAKS = re.compile(r"[;:!?|।॥\u2026\u2013\u2014]+|\.{2,}|\s-\s")          # where one part of a headline ends
_TOKEN = re.compile(r"[a-z0-9]+|[\u0900-\u0963\u0971-\u097f\u200c\u200d]+")


def _aksharas(word: str) -> List[dict]:
    """A Marathi word as its syllables: onset (the consonants), vowel (None = none), schwa (the unwritten 'a'), nasal / visarga after it."""
    out: List[dict] = []
    onset: List[str] = []
    i = 0
    while i < len(word):
        ch = word[i]
        i += 1
        if ch in _CONSONANTS:
            sound = _CONSONANTS[ch]
            if ch == "व" and onset and onset[-1] in ("sh", "s") and i >= 2 and word[i - 2] == _VIRAMA:
                sound = "w"                                       # श्व -> shw, स्व -> sw
            onset.append(sound)
            while i < len(word) and word[i] in (_NUKTA, "\u200c", "\u200d"):
                i += 1
            if i < len(word) and word[i] == _VIRAMA:
                i += 1
                if i < len(word):
                    continue                                      # joined to the next consonant
                out.append({"onset": onset, "vowel": None, "schwa": False, "tail": ""})
                onset = []
                continue
            if i < len(word) and word[i] in _MATRAS:
                out.append({"onset": onset, "vowel": _MATRAS[word[i]], "schwa": False, "tail": ""})
                i += 1
            else:
                out.append({"onset": onset, "vowel": "a", "schwa": True, "tail": ""})
            onset = []
        elif ch in _VOWELS:
            out.append({"onset": [], "vowel": _VOWELS[ch], "schwa": False, "tail": ""})
        elif ch in (_ANUSVARA, _CHANDRABINDU) and out:
            out[-1]["tail"] += "~"                                # n or m: decided by what follows
        elif ch == _VISARGA and out:
            out[-1]["tail"] += "h"
        elif ch in _MATRAS and out:                               # a vowel sign right after a word of _STEMS (योजन + ा)
            out[-1].update(vowel=_MATRAS[ch], schwa=False)
    return out


def _drop_silent_a(syllables: List[dict], whole: bool) -> None:
    """Marathi does not say every unwritten 'a': देशमुख is Deshmukh, not Deshamukha. `whole` = the letters are a word of their own."""
    if not syllables or (whole and len(syllables) < 2):
        return
    last = syllables[-1]
    if last["schwa"] and not last["tail"] and len(last["onset"]) == 1:
        keeps = last["onset"] == ["y"] and len(syllables) > 1 and syllables[-2]["vowel"] == "i"          # भारतीय -> bharatiya
        if not keeps:
            last["vowel"] = None
    for i in range(1, len(syllables) - 1):
        here, before, after = syllables[i], syllables[i - 1], syllables[i + 1]
        if not here["schwa"] or here["tail"] or len(here["onset"]) != 1:
            continue
        if before["vowel"] is None or before["tail"] or (i == 1 and before["schwa"]):                 # सहकार -> sahakar
            continue
        spoken_next = after["vowel"] is not None and (not after["schwa"] or after["tail"])
        if len(after["onset"]) == 1 and after["onset"] != ["y"] and spoken_next:
            here["vowel"] = None


def _spell(syllables: List[dict], rest: str = "") -> str:
    parts: List[str] = []
    for i, s in enumerate(syllables):
        parts.append("".join(s["onset"]))
        parts.append(s["vowel"] or "")
        for mark in s["tail"]:
            if mark != "~":
                parts.append(mark)
                continue
            following = syllables[i + 1]["onset"][0] if i + 1 < len(syllables) and syllables[i + 1]["onset"] else rest
            if following:
                parts.append("m" if following.startswith(_LIPS) else "n")
    return "".join(parts)


def _letters(word: str, whole: bool = True, following: str = "") -> str:
    syllables = _aksharas(word)
    _drop_silent_a(syllables, whole)
    return _spell(syllables, following)


def romanize(word: str, following: str = "") -> str:
    """One Marathi word in English letters ('देशमुख' -> 'deshmukh'). `following` = the first sound of the ending written after it."""
    word = unicodedata.normalize("NFC", word).replace("\u200c", "").replace("\u200d", "").replace("ज्ञ", "द्न्य")
    if word in _WHOLE_WORDS:
        return _WHOLE_WORDS[word]
    for ending in _ENDINGS:
        stem = word[:-len(ending)]
        if word.endswith(ending) and len(_aksharas(stem)) >= 2:
            return romanize(stem, _CONSONANTS[ending[0]]) + _letters(ending)
    for stem in _STEM_ORDER:
        if word.startswith(stem):
            spelled, rest = _STEMS[stem], word[len(stem):]
            if rest[:1] in _MATRAS:                                          # योजन + ा, बँक + े ...
                spelled, rest = spelled + _MATRAS[rest[0]], rest[1:]
            elif rest[:1] == _VIRAMA:                                        # शेतकऱ + ्यां
                rest = rest[1:]
            elif rest[:1] in (_ANUSVARA, _CHANDRABINDU):
                spelled, rest = spelled + "n", rest[1:]
            return spelled + (_letters(rest, whole=False, following=following) if rest else "")
    return _letters(word, following=following)


def _parts(title: str) -> List[List[tuple]]:
    """A headline as its parts, each a list of (the word as written, the word in English letters)."""
    text = unicodedata.normalize("NFC", str(title or "")).translate(_DIGITS).lower()
    text = re.sub(r"(?<=[a-z])['\u2019]s\b", "", text)                       # "family's" -> "family"
    text = re.sub(r"['\u2018\u2019]", "", text)                              # "don't" -> "dont"
    text = re.sub(r"(?<=\d),(?=\d)", "", text)                               # "50,000" -> "50000"
    text = "".join(c for c in unicodedata.normalize("NFD", text) if not "\u0300" <= c <= "\u036f")          # é -> e
    text = unicodedata.normalize("NFC", text)
    out = []
    for part in _BREAKS.split(text):
        words = []
        for token in _TOKEN.findall(part):
            spelled = token if token.isascii() else romanize(token)
            if spelled:
                words.append((token, spelled))
        if words:
            out.append(words)
    return out


def _from_title(title: str) -> str:
    parts = _parts(title)
    kept: List[str] = []
    for words in parts:
        kept += [spelled for written, spelled in words if written not in _SMALL_WORDS]
        if len(kept) >= ENOUGH_WORDS:
            break
    if len(kept) < 2:                                                        # (a headline of small words only: they are the headline)
        kept = [spelled for words in parts for _, spelled in words]
    slug = ""
    for word in kept[:WORDS]:
        longer = f"{slug}-{word}" if slug else word[:LIMIT]
        if len(longer) > LIMIT:
            break
        slug = longer
    return slug


def make(title_en: str = "", title: str = "", fallback: str = "story") -> str:
    """The words of an address: from the English headline when there is one, else from the Marathi one. Never empty."""
    return _from_title(title_en) or _from_title(title) or fallback
