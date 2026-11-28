"""The words of an address (slugs.py): short, in English letters, made from the headline."""
import re

import pytest

import slugs


@pytest.mark.parametrize("headline, words", [
    ("सोलापूर जिल्हा बँकेच्या संचालकपदी मनिष देशमुख विजयी!", "solapur-jilha-bankechya-sanchalakpadi-manish-deshmukh"),
    ("समृद्ध गाव अभियानाच्या प्रयत्नांना यश; सोलापूर जिल्ह्यातील तीन ग्रामपंचायतींचा गौरव", "samruddha-gav-abhiyanachya-prayatnanna-yash"),      # the first part is enough
    ("सहकार विकास पॅनलला राजेंद्र गंगदे यांचा जाहीर पाठिंबा!", "sahakar-vikas-panella-rajendra-gangade-jahir"),
    ("लोकमंगल फाउंडेशनच्या लोटस योजनेतून १२ विद्यार्थ्यांना शिष्यवृत्ती", "lokmangal-foundationchya-lotus-yojanetun-12-vidyarthyanna"),
    ("लोटस उपक्रम: गरजू विद्यार्थ्यांच्या शिक्षणाला आधार", "lotus-upakram-garaju-vidyarthyanchya-shikshanala-adhar"),                       # two words are not enough
    ("१९ ते २५ ऑगस्ट २०२६", "19-25-august-2026"),
])
def test_a_marathi_headline_is_written_in_english_letters(headline, words):
    assert slugs.make("", headline) == words


@pytest.mark.parametrize("word, spelled", [
    ("देशमुख", "deshmukh"), ("लोकमंगलचा", "lokmangalcha"), ("महाराष्ट्र", "maharashtra"), ("सहकार", "sahakar"), ("ग्रामपंचायत", "grampanchayat"),
    ("विद्यार्थ्यांच्या", "vidyarthyanchya"), ("शेतकऱ्यांसाठी", "shetkaryansathi"), ("निवडणूक", "nivadnuk"), ("आमदार", "amdar"), ("सोहळा", "sohala"),
    ("सर्वधर्मीय", "sarvadharmiya"), ("भारतीय", "bharatiya"), ("सिद्धेश्वर", "siddheshwar"), ("ज्ञान", "dnyan"), ("विजयी", "vijayi"), ("संविधान", "samvidhan"),
    ("पाठिंबा", "pathimba"), ("बँकेच्या", "bankechya"), ("आयटीआयच्या", "itichya"), ("मित्र", "mitra"), ("व", "va"),
])
def test_how_words_are_spelled(word, spelled):
    assert slugs.romanize(word) == spelled


def test_an_english_headline_is_used_when_there_is_one():
    assert slugs.make("One Step, One Family's Joy! Lokmangal Foundation's 49th Community Marriage", "एक पाऊल") == "one-step-one-family-joy"
    assert slugs.make("Solapur South: MLA Wins!", "x") == "solapur-south-mla-wins"
    assert slugs.make("  --Hello,   World--  ") == "hello-world"
    assert slugs.make("Don’t wait") == "dont-wait"
    assert slugs.make("Café opens: 50,000 guests") == "cafe-opens-50000-guests"
    assert slugs.make("   ", "नवी बातमी") == "navi-batmi" and slugs.make("!!!", "नवी बातमी") == "navi-batmi"            # an empty English headline


def test_small_words_are_left_out_unless_there_is_nothing_else():
    assert slugs.make("The story of a village and its people") == "story-village-people"
    assert slugs.make("", "यांचा") == "yancha" and slugs.make("On and on") == "on-and-on"


def test_never_empty_never_long_never_odd():
    assert slugs.make("", "") == "story" and slugs.make(None, None) == "story" and slugs.make("!!!", "…") == "story"
    assert slugs.make("", "", "video") == "video"
    assert slugs.make("<script>alert(1)</script>") == "script-alert-1-script"
    for title in ("word " * 60, "x" * 200, "विद्यार्थ्यांच्या कल्पकतेतून साकारले छत्रपती शिवरायांचे गड-किल्ले; लोकमंगल फाऊंडेशनच्या स्पर्धेचा समारंभ " * 3,
                  "Antidisestablishmentarianism " * 9, "a/b?c=d&e#f %20 'g' \"h\" ,i, 😀 中文 اردو"):
        made = slugs.make("", title)
        assert re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", made) and len(made) <= slugs.LIMIT and made.count("-") < slugs.WORDS, (title[:30], made)


def test_every_marathi_letter_can_be_spelled():
    for code in range(0x0900, 0x0980):
        for word in (chr(code), "क" + chr(code), "क" + chr(code) + "म", chr(code) * 3):
            assert re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", slugs.make("", word)), (hex(code), word)
