/*
 * LOKMANGAL - language of the ADMIN PANEL: मराठी / English.
 *
 * The Admin Panel is written in Marathi (index.html, admin.js; many labels still carry an English word in brackets,
 * e.g. "बातम्या व्यवस्थापन (News)"). This file makes it show ONE language at a time:
 *   - a dictionary (ENTRIES / PATTERNS below) of the interface text, Marathi <-> English; the old "Marathi (English)" spelling of a label
 *     is an alias of its entry, so both languages show clean, single-language text;
 *   - a translator that goes through the page text (text, placeholder, title, aria-label, alt) and replaces what the dictionary knows,
 *     once at load and again whenever the page changes (MutationObserver);
 *   - dates ("२६ ऑगस्ट २०२६" <-> "26 August 2026") and digits;
 *   - the choice (the मराठी | English buttons in the sidebar) is kept in localStorage ("lokmangal-admin-lang").
 * The news / issue texts themselves are DATA and are never translated here: mark such elements with data-no-i18n.
 * (Confirm dialogs and the backend banner are not page text: admin.js picks their language with tx(marathi, english).)
 *
 * To translate a new piece of text: add a line to ENTRIES (exact text) or PATTERNS (text with {n} number, {v} number like 34.8K,
 * {x} any text). Marathi first, English second.
 */
(function () {
  "use strict";

  var STORE = "lokmangal-admin-lang";
  var LANG = "mr";
  try {
    var asked = new URLSearchParams(location.search).get("lang") || localStorage.getItem(STORE);
    if (asked === "en" || asked === "mr") LANG = asked;
  } catch (e) { /* private mode: Marathi */ }
  document.documentElement.lang = LANG;

  // ------------------------------------------------------------------------------------------------ digits and dates
  var DEV = "०१२३४५६७८९";
  var toLatin = function (s) { return String(s).replace(/[०-९]/g, function (d) { return DEV.indexOf(d); }); };
  var toDev = function (s) { return String(s).replace(/\d/g, function (d) { return DEV.charAt(d); }); };
  var MONTHS_MR = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];
  var MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MONTH_RE = new RegExp("(\\d{1,2}|[०-९]{1,2})\\s+(" + MONTHS_MR.concat(MONTHS_EN, MONTHS_EN.map(function (m) { return m.slice(0, 3); })).join("|") + ")\\.?\\s+(\\d{4}|[०-९]{4})", "gi");

  function monthIndex(name) {
    var i = MONTHS_MR.indexOf(name);
    if (i >= 0) return i;
    var k = name.slice(0, 3).toLowerCase();
    for (var j = 0; j < 12; j++) if (MONTHS_EN[j].slice(0, 3).toLowerCase() === k) return j;
    return -1;
  }

  // every "26 ऑगस्ट 2026" / "26 Aug 2026" inside a text -> the current language
  function localizeDates(text) {
    return String(text).replace(MONTH_RE, function (all, d, m, y) {
      var i = monthIndex(m);
      if (i < 0) return all;
      return LANG === "en" ? toLatin(d) + " " + MONTHS_EN[i] + " " + toLatin(y) : toDev(d) + " " + MONTHS_MR[i] + " " + toDev(y);
    });
  }

  // ------------------------------------------------------------------------------------------------ the dictionary
  // E(marathi, english, "English word that used to follow the Marathi in brackets", [other spellings found in the page])
  function E(mr, en, paren, aliases) {
    var al = (aliases || []).slice();
    if (paren) al.push(mr + " (" + paren + ")");
    return [mr, en, al];
  }

  var ENTRIES = [
    // ---- page, sidebar, top bar
    E("लोकमंगल न्यूज पोर्टल | प्रशासकीय कक्ष", "Lokmangal News Portal | Admin Dashboard", "", ["लोकमंगल न्यूज पोर्टल | Admin Dashboard (प्रशासकीय कक्ष)"]),
    E("लोकमंगल", "Lokmangal"),
    E("ॲडमिन पॅनेल", "ADMIN PANEL"),
    E("मेनू छोटा करा", "Collapse the menu"),
    E("मेनू", "Menu"),
    E("मुख्य मेनू", "Main menu"),
    E("डॅशबोर्ड", "Dashboard", "Dashboard"),
    E("बातम्या व्यवस्थापन", "News manager", "News", ["बातम्या व्यवस्थापन (News Manager)"]),
    E("साप्ताहिक ई-पेपर", "Weekly PDF", "Weekly PDF"),
    E("थेट पोर्टल", "Live portal"),
    E("थेट वेबसाईट पहा", "View the live site", "Live Site"),
    E("तपासत आहे…", "Checking…"),
    E("प्रशासकीय कक्ष", "Admin panel"),
    E("थीम बदला", "Change theme"),
    E("नवीन बातमी", "New article"),
    E("PDF अपलोड", "Upload PDF"),
    E("पुन्हा तपासा", "Check again"),

    // ---- dashboard
    E("लोकमंगल न्यूज पोर्टल — डॅशबोर्ड", "Lokmangal News Portal — Dashboard"),
    E("ताज्या बातम्या, साप्ताहिक ई-पेपर व आकडेवारीचे थेट नियंत्रण", "Live control of the latest news, the weekly e-paper and the figures"),
    E("रिफ्रेश करा", "Refresh"),
    E("एकूण बातम्या", "Total articles", "Articles"),
    E("सर्व श्रेणींमध्ये प्रकाशित", "Published in all categories"),
    E("साप्ताहिक PDF अंक", "Weekly PDF issues", "Weekly"),
    E("ई-पेपर संग्रह उपलब्ध", "E-paper archive available"),
    E("राजकीय बातम्या", "Political news", "Rajkiy"),
    E("आमदार सुभाष बापू देशमुख", "MLA Subhash Bapu Deshmukh"),
    E("सामाजिक बातम्या", "Social news", "Samajik"),
    E("लोकमंगल फाऊंडेशन प्रकल्प", "Lokmangal Foundation projects"),
    E("प्रमुख बातमी", "Lead story", "Lead Story"),
    E("लोड होत आहे...", "Loading..."),
    E("माहिती मिळाली नाही.", "No information received."),
    E("लोकप्रिय बातम्या", "Popular posts", "Popular Posts"),
    E("यादृच्छिक बातम्या", "Random posts", "Random Posts"),
    E("बातम्या निवडल्या आहेत", "posts selected"),
    E("वेबसाईटवर ताज्या ३ दिसतात — नवीन निवडलेली वर येते, सर्वात जुनी जागा सोडते.", "The website shows the latest 3 — a newly selected one goes to the top, the oldest makes room."),
    E("वेबसाईटवर ताज्या ४ दिसतात — नवीन निवडलेली वर येते, सर्वात जुनी जागा सोडते.", "The website shows the latest 4 — a newly selected one goes to the top, the oldest makes room."),
    E("नुकत्याच प्रकाशित बातम्या", "Recently published news"),
    E("नुकतेच साप्ताहिक अंक", "Recent weekly issues"),
    E("सर्व पहा →", "View all →"),
    E("कोणतीही बातमी लीड म्हणून सेट केलेली नाही.", "No article is set as the lead story."),
    E("कोणतीही बातमी उपलब्ध नाही.", "No article available."),
    E("कोणताही अंक उपलब्ध नाही.", "No issue available."),

    // ---- news list
    E("शीर्षक, प्रतिनिधी किंवा मजकूर शोधा...", "Search headline, reporter or text..."),
    E("सर्व श्रेणी", "All categories", "All Categories"),
    E("राजकीय", "Political", "Rajkiy"),
    E("सामाजिक", "Social", "Samajik"),
    E("ब्लॉग्स", "Blogs", "Blogs"),
    E("परीक्षण", "Reviews", "Reviews"),
    E("रिव्ह्यू", "Review"),
    E("परीक्षण / रिव्ह्यू", "Review"),
    E("सर्व विभाग स्थान", "All placements", "All Placements"),
    E("⭐ मुख्य बातमी", "⭐ Lead story", "Lead Story"),
    E("🔥 लोकप्रिय", "🔥 Popular posts", "Popular Posts"),
    E("🎲 यादृच्छिक", "🎲 Random posts", "Random Posts"),
    E("नवीन बातमी जोडा", "Add new article"),
    E("फोटो", "Photo"),
    E("शीर्षक", "Headline", "Headline"),
    E("श्रेणी", "Category"),
    E("विभाग स्थान", "Placements", "Section Placements"),
    E("तारीख", "Date"),
    E("वाचक", "Views"),
    E("कृती", "Actions", "Actions"),
    E("बातमीदार:", "by", "", ["by"]),
    E("मुख्य", "Lead", "", ["Lead"]),
    E("लोकप्रिय", "Popular", "", ["Popular"]),
    E("यादृच्छिक", "Random", "", ["Random"]),
    E("ताज्या बातम्या", "Latest news", "Latest News"),
    E("📰 ताज्या बातम्या", "📰 Latest news", "Latest News"),
    E("ताज्या बातम्यांमधून काढा", "Remove from Latest news"),
    E("ताज्या बातम्यांमध्ये जोडा", "Add to Latest news"),
    E("मुख्य बातमी म्हणून सेट आहे (काढण्यासाठी क्लिक करा)", "Set as the lead story (click to remove)"),
    E("या बातमीला मुख्य बातमी बनवा", "Make this the lead story", "", ["या बातमीला मुख्य बातमी (Lead Story) बनवा"]),
    E("लोकप्रिय मधून काढा", "Remove from Popular"),
    E("लोकप्रिय बातम्यांमध्ये जोडा", "Add to Popular posts"),
    E("यादृच्छिक मधून काढा", "Remove from Random"),
    E("यादृच्छिक बातम्यांमध्ये जोडा", "Add to Random posts"),
    E("पूर्वावलोकन", "Preview", "Preview"),
    E("संपादित करा", "Edit"),
    E("हटवा", "Delete"),
    E("English आवृत्ती आहे", "English version available"),
    E("कोणतीही बातमी सापडली नाही.", "No news found."),

    // ---- weekly list
    E("साप्ताहिक ई-पेपर व PDF व्यवस्थापन", "Weekly e-paper & PDF manager"),
    E("लोकमंगल साप्ताहिक अंकांचे मुखपृष्ठ, तारीख, तपशील आणि थेट PDF फाईल्स अपलोड करा.", "Upload the cover, date, details and PDF files of the Lokmangal weekly issues."),
    E("नवीन अंक अपलोड करा", "Upload new issue"),
    E("अंक क्र.", "Issue no."),
    E("कव्हर", "Cover"),
    E("अंकाचे नाव व शीर्षक", "Issue name and headline"),
    E("प्रकाशन तारीख", "Publish date"),
    E("PDF फाईल", "PDF file"),
    E("PDF पहा", "View PDF"),
    E("अंक संपादित करा", "Edit issue"),
    E("अंक हटवा", "Delete issue"),

    // ---- news form
    E("नवीन बातमी तयार करा", "Create a new article"),
    E("भाषा", "Language", "", ["भाषा / Language"]),
    E("मराठी", "Marathi"),
    E("इंग्रजी", "English", "", ["English"]),
    E("बातमीचे मुख्य शीर्षक", "Main headline", "Headline"),
    E("बातमीचे शीर्षक (इंग्रजी)", "News headline (English)"),
    E("बातमीची श्रेणी", "Category", "Category"),
    E("पोर्टलवरील स्थान व विभाग व्यवस्थापन", "Section placements", "Section Placements"),
    E("मुख्य प्रमुख बातमी", "Lead story", "Lead Story"),
    E("बातमीदार / प्रतिनिधी", "Reporter / author"),
    E("बातमीदार / प्रतिनिधी (इंग्रजी)", "Reporter / author (English)"),
    E("वाचक संख्या", "View count", "Views"),
    E("बातमीचा फोटो", "Article photo", "Image"),
    E("संगणकातून फोटो निवडा", "Choose a photo from your computer", "Upload Image"),
    E("किंवा थेट URL / मार्ग टाका:", "Or enter a URL / path directly:"),
    E("assets/images/... किंवा https://...", "assets/images/... or https://..."),
    E("assets/images/... किंवा थेट URL", "assets/images/... or a direct URL"),
    E("थोडक्यात सारांश", "Short summary", "Excerpt / Lead Summary"),
    E("थोडक्यात सारांश (इंग्रजी)", "Short summary (English)"),
    E("सविस्तर बातमी मजकूर", "Full story", "Full Content / HTML"),
    E("सविस्तर मजकूर (इंग्रजी)", "Full story (English)"),
    E("बातमीचा सविस्तर मजकूर येथे लिहा… (नवा परिच्छेद सुरू करण्यासाठी एक ओळ सोडा)", "Write the full story here… (leave a blank line to start a new paragraph)"),
    E("संपूर्ण बातमी इंग्रजीत येथे लिहा… (नवा परिच्छेद सुरू करण्यासाठी एक ओळ सोडा)", "Write the full story in English here… (leave a blank line to start a new paragraph)"),
    E("रद्द करा", "Cancel"),
    E("बातमी प्रकाशित करा", "Publish article"),
    E("बदल जतन करा", "Save changes"),
    E("जतन होत आहे...", "Saving..."),
    E("बातमी पूर्वावलोकन", "Article preview", "Live Preview"),
    E("बंद करा", "Close"),

    // ---- weekly form
    E("साप्ताहिक ई-पेपर व PDF अपलोड", "Upload weekly e-paper & PDF"),
    E("क्रम क्रमांक (तारखेनुसार)", "Sequence number (by date)"),
    E("पुढचा क्रमांक आपोआप येतो. साईटवर क्रमांक दिसत नाही, तारीख दिसते — सर्वात नवीन तारीख असलेला अंक \"नवीनतम अंक\" होतो.",
      "The next number is filled in automatically. The site shows the date, not the number — the issue with the newest date becomes the “Latest issue”."),
    E("संपादन करताना क्रमांक बदलता येत नाही (PDF चे नाव त्यावर अवलंबून आहे). दुसरा क्रमांक हवा असेल तर नवीन अंक जोडा.",
      "The number cannot be changed while editing (the PDF's name depends on it). To use another number, add a new issue."),
    E("अंकांचा क्रम या तारखेवरून ठरतो (सर्वात नवीन वर). \"२ सप्टेंबर २०२६\", \"2 September 2026\", \"02-09-2026\" किंवा \"2026-09-02\" असे लिहा — इतर पद्धतीची तारीख वाचता आली नाही तर तो अंक सर्वात वर येतो.",
      "The order of the issues is decided by this date (newest first). Write it like “2 September 2026”, “02-09-2026” or “2026-09-02” — if a date in another format cannot be read, that issue goes to the top."),
    E("अंकाचे शीर्षक (पहिल्या पानावरची मुख्य हेडलाईन)", "Issue headline (the main headline on the front page)"),
    E("अंकाचे शीर्षक (इंग्रजी) — पहिल्या पानावरची मुख्य हेडलाईन", "Issue headline (English) - the main headline of the front page"),
    E("PDF ई-पेपर फाईल", "PDF e-paper file"),
    E("PDF फाईल निवडा किंवा ड्रॅग करा", "Choose a PDF file or drag it here", "Upload PDF"),
    E("कमाल मर्यादा ५० MB • आपोआप assets/pdf/ मध्ये जतन होईल", "Maximum size 50 MB • saved automatically in assets/pdf/"),
    E("मुखपृष्ठ फोटो — PDF चे पहिले पान", "Cover photo — the first page of the PDF", "", ["मुखपृष्ठ फोटो (Cover Image) — PDF चे पहिले पान"]),
    E("फोटो निवडा", "Choose photo"),
    E("PDF निवडल्यावर मुखपृष्ठ (PDF चे पहिले पान) आणि तारीख (फाईलच्या नावावरून, उदा. \"Lokmangal Saptahik 26 August 2026.pdf\") आपोआप भरली जाते; हवे तर बदला.",
      "After you choose the PDF, the cover (the first page of the PDF) and the date (from the file name, e.g. “Lokmangal Saptahik 26 August 2026.pdf”) are filled in automatically; change them if you want."),
    E("मुखपृष्ठ", "Cover"),
    E("अंकाचा थोडक्यात परिचय / वर्णन", "Short introduction / description of the issue"),
    E("अंकाचा थोडक्यात परिचय (इंग्रजी)", "Short introduction (English)"),
    E("अंक जतन व प्रकाशित करा", "Save and publish the issue"),

    // ---- messages (toasts), buttons that change while working
    E("मराठी जतन झाले, पण English जतन झाले नाही — backend फोल्डरमध्ये \"python init_db.py\" एकदा चालवा.", "Marathi was saved, but English was not — run \"python init_db.py\" once in the backend folder."),
    E("माहिती रीलोड होत आहे...", "Reloading the data..."),
    E("डॅशबोर्ड अद्यतनित झाला!", "Dashboard updated!"),
    E("अपडेट अयशस्वी", "Update failed"),
    E("सर्व्हर त्रुटी: विभाग स्थान बदलता आले नाही.", "Server error: the placement could not be changed."),
    E("फोटो अपलोड होत आहे...", "Uploading the photo..."),
    E("फोटो यशस्वीरीत्या अपलोड झाला!", "Photo uploaded successfully!"),
    E("अपलोड अयशस्वी.", "Upload failed."),
    E("सर्व्हर त्रुटी: फोटो अपलोड होऊ शकला नाही.", "Server error: the photo could not be uploaded."),
    E("बातमी जतन झाली!", "Article saved!"),
    E("त्रुटी आली.", "An error occurred."),
    E("सर्व्हर त्रुटी: बातमी जतन होऊ शकली नाही.", "Server error: the article could not be saved."),
    E("बातमी हटवत आहे...", "Deleting the article..."),
    E("बातमी यशस्वीरीत्या हटवली!", "Article deleted successfully!"),
    E("हटवणे अयशस्वी.", "Delete failed."),
    E("सर्व्हर त्रुटी: बातमी हटवता आली नाही.", "Server error: the article could not be deleted."),
    E("अंकांची यादी अजून लोड झाली नाही — बॅकएंड तपासा आणि \"पुन्हा तपासा\" दाबा, मग नवीन अंक जोडा.", "The list of issues has not loaded yet — check the backend and press “Check again”, then add the new issue."),
    E("PDF फाईल अपलोड होत आहे...", "Uploading the PDF file..."),
    E("PDF यशस्वीरीत्या अपलोड झाली!", "PDF uploaded successfully!"),
    E("मुखपृष्ठ PDF च्या पहिल्या पानावरून तयार केले!", "The cover was created from the first page of the PDF!"),
    E("मुखपृष्ठ आपोआप तयार करता आले नाही — \"फोटो निवडा\" ने मुखपृष्ठ द्या.", "The cover could not be created automatically — give a cover with “Choose photo”."),
    E("PDF अपलोड अयशस्वी.", "PDF upload failed."),
    E("सर्व्हर त्रुटी: PDF अपलोड होऊ शकली नाही.", "Server error: the PDF could not be uploaded."),
    E("मुखपृष्ठ फोटो अपलोड झाला!", "Cover photo uploaded!"),
    E("फोटो अपलोड अयशस्वी.", "Photo upload failed."),
    E("अपलोड होत आहे...", "Uploading..."),
    E("अंकातील बदल जतन झाले!", "The changes to the issue were saved!"),
    E("साप्ताहिक अंक यशस्वीरीत्या प्रकाशित झाला!", "Weekly issue published successfully!"),
    E("सर्व्हर त्रुटी: अंक जतन होऊ शकला नाही.", "Server error: the issue could not be saved."),
    E("सर्व्हर त्रुटी: अंक हटवता आला नाही.", "Server error: the issue could not be deleted."),

    // ---- videos (sidebar > Videos)
    E("व्हिडिओ अपलोड", "Video upload", "Videos"),
    E("व्हिडिओ अपलोड व व्यवस्थापन", "Video upload & management"),
    E("येथे अपलोड केलेला व्हिडिओ आणि त्याचे शीर्षक वेबसाईटवरील \"निवडक व्हिडिओ\" मध्ये दिसते आणि तिथेच प्ले होते.",
      "A video uploaded here, with its title, appears in the website's “Featured Videos” and plays right there."),
    E("नवीन व्हिडिओ अपलोड करा", "Upload a new video"),
    E("व्हिडिओ", "Video"),
    E("व्हिडिओचे शीर्षक", "Video title"),
    E("कालावधी", "Length"),
    E("आकार", "Size"),
    E("अपलोड तारीख", "Upload date"),
    E("व्हिडिओंची यादी लोड झाली नाही — बॅकएंड तपासा आणि \"पुन्हा तपासा\" दाबा.", "The list of videos did not load — check the backend and press “Check again”."),
    E("अजून एकही व्हिडिओ अपलोड केलेला नाही.", "No video has been uploaded yet."),
    E("व्हिडिओ पहा", "Watch video"),
    E("व्हिडिओ संपादित करा", "Edit video"),
    E("व्हिडिओ हटवा", "Delete video"),
    E("व्हिडिओ फाईल", "Video file"),
    E("व्हिडिओ फाईल निवडा किंवा ड्रॅग करा", "Choose a video file or drag it here"),
    E("सध्याची फाईल (बदलायची असेल तरच नवीन फाईल निवडा)", "the current file (choose a new file only if you want to change it)"),
    E("हा व्हिडिओ या ब्राउझरमध्ये चालत नाही — वेबसाईटवरही चालणार नाही. MP4 (H.264) मध्ये convert करून पुन्हा निवडा.",
      "This browser cannot play this video — it will not play on the website either. Convert it to MP4 (H.264) and choose it again."),
    E("व्हिडिओचे शीर्षक (इंग्रजी)", "Video title (English)"),
    E("थोडक्यात वर्णन", "Short description"),
    E("थोडक्यात वर्णन (इंग्रजी)", "Short description (English)"),
    E("व्हिडिओ जतन व प्रकाशित करा", "Save and publish the video"),
    E("व्हिडिओ अपलोड होत आहे...", "Uploading the video..."),
    E("व्हिडिओ तपासत आहे...", "Checking the video..."),
    E("क्रम क्रमांक (१ = सर्वात वर)", "Order number (1 = at the very top)"),
    E("क्रम क्रमांक", "Order number"),
    E("व्हिडिओ (फाईल अपलोड करा किंवा लिंक द्या)", "Video (upload a file or give a link)"),
    E("किंवा YouTube / .mp4 लिंक येथे paste करा (https://...)", "Or paste a YouTube / .mp4 link here (https://...)"),
    E("YouTube व्हिडिओ — वेबसाईटवर तिथेच प्ले होईल.", "YouTube video — it will play right on the website."),
    E("थेट व्हिडिओ फाईलची लिंक — वेबसाईटवर तिथेच प्ले होईल.", "A direct video file link — it will play right on the website."),
    E("ही लिंक ओळखली नाही — YouTube लिंक किंवा .mp4 / .webm ची थेट लिंक द्या.", "This link was not recognised — give a YouTube link or a direct .mp4 / .webm link."),
    E("ही YouTube लिंक चालत नाही (व्हिडिओ सापडला नाही).", "This YouTube link does not work (video not found)."),
    E("आधी व्हिडिओ फाईल निवडा किंवा लिंक द्या.", "Choose a video file or give a link first."),
    E("सर्व्हरवर जतन होत आहे...", "Saving on the server..."),
    E("व्हिडिओंची यादी अजून लोड झाली नाही — बॅकएंड तपासा आणि \"पुन्हा तपासा\" दाबा.", "The list of videos has not loaded yet — check the backend and press “Check again”."),
    E("हा व्हिडिओ प्रकार चालणार नाही. MP4 किंवा WebM फाईल निवडा.", "This video type will not work. Choose an MP4 or WebM file."),
    E("व्हिडिओचे शीर्षक लिहा.", "Write the video title."),
    E("आधी व्हिडिओ फाईल निवडा.", "Choose the video file first."),
    E("व्हिडिओ यशस्वीरीत्या प्रकाशित झाला!", "Video published successfully!"),
    E("व्हिडिओतील बदल जतन झाले!", "The changes to the video were saved!"),
    E("व्हिडिओ हटवला!", "Video deleted!"),
    E("सर्व्हर त्रुटी: व्हिडिओ जतन होऊ शकला नाही.", "Server error: the video could not be saved."),
    E("सर्व्हर त्रुटी: व्हिडिओ हटवता आला नाही.", "Server error: the video could not be deleted."),
    // (answers of the backend, English as the server writes them)
    E("हा वैध व्हिडिओ नाही (फाईलचा प्रकार चुकीचा आहे).", "This is not a valid video file"),
    E("हा व्हिडिओ प्रकार चालत नाही. फक्त mp4, webm, mov, m4v, ogv चालतात.", "Invalid video format. Allowed: mp4, webm, mov, m4v, ogv"),
    E("व्हिडिओ जतन करता आला नाही. पुन्हा प्रयत्न करा.", "The video could not be saved. Try again."),
  ];

  // text with a number {n}, a number like 34.8K {v} or any text {x}: [Marathi, English]
  var PATTERNS = [
    ["MySQL डेटाबेस: {x}", "MySQL database: {x}"],
    ["{x} • सुरू", "{x} • Online"],
    ["{x} • MySQL बंद", "{x} • MySQL is down"],
    ["{x} • बंद (बॅकएंड चालू नाही)", "{x} • Offline (the backend is not running)"],
    ["अंक {n}", "Issue {n}"],
    ["बातमी संपादित करा (ID: {n})", "Edit article (ID: {n})"],
    ["साप्ताहिक अंक संपादित करा (क्र. {n})", "Edit weekly issue (no. {n})"],
    ["अंक {n} हटवला!", "Issue {n} deleted!"],
    ["{v} वाचक", "{v} views"],
    ["उदा. {x}", "e.g. {x}"],
    ["तारीख फाईलच्या नावावरून भरली: {x} (हवी तर बदला)", "The date was filled in from the file name: {x} (change it if you want)"],
    ["PDF फाईल निवडा किंवा ड्रॅग करा ({x})", "Choose a PDF file or drag it here ({x})"],
    ["{x} — सध्याची फाईल (बदलायची असेल तरच नवीन PDF निवडा)", "{x} — the current file (choose a new PDF only if you want to change it)"],
    ["MP4 किंवा WebM • कमाल मर्यादा {n} MB", "MP4 or WebM • maximum size {n} MB"],
    ["फाईल खूप मोठी आहे ({x}). कमाल मर्यादा {n} MB आहे.", "The file is too large ({x}). The maximum is {n} MB."],
    ["फाईल खूप मोठी आहे. कमाल मर्यादा {n} MB आहे.", "File too large. The limit is {n} MB."]
  ];

  // ------------------------------------------------------------------------------------------------ lookup tables
  var norm = function (s) { return String(s).replace(/\s+/g, " ").trim(); };
  var exact = Object.create(null);     // normalised text (either language, or an alias) -> entry
  ENTRIES.forEach(function (e) {
    [e[0], e[1]].concat(e[2] || []).forEach(function (k) { exact[norm(k)] = e; });
  });

  var escapeRe = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };
  function compile(tpl) {
    var names = [], re = "^";
    tpl.split(/(\{[nvx]\d*\})/).forEach(function (part) {
      var m = /^\{([nvx])(\d*)\}$/.exec(part);
      if (!m) { re += escapeRe(part); return; }
      names.push(m[1] + m[2]);
      re += m[1] === "n" ? "([\\d०-९]+)" : m[1] === "v" ? "([\\d०-९][\\d०-९.,]*[KkMm]?)" : "(.+?)";
    });
    return { re: new RegExp(re + "$"), names: names };
  }
  var patterns = PATTERNS.map(function (p) { return { mr: compile(p[0]), en: compile(p[1]), tpl: p }; });

  function fill(tpl, names, caps) {
    var vars = {};
    names.forEach(function (n, i) { vars[n] = caps[i + 1]; });
    return tpl.replace(/\{([nvx]\d*)\}/g, function (all, n) {
      var v = vars[n];
      if (v === undefined) return all;
      return n.charAt(0) === "x" ? translateText(v) : (LANG === "en" ? toLatin(v) : v);
    });
  }

  // one piece of text -> the current language (text the dictionary does not know stays as it is)
  function translateText(text) {
    var raw = String(text);
    var n = norm(raw);
    if (!n) return raw;
    var lead = raw.match(/^\s*/)[0], tail = raw.match(/\s*$/)[0];
    var out = null;
    var hit = exact[n];
    if (hit) {
      out = hit[LANG === "en" ? 1 : 0];
    } else {
      for (var i = 0; i < patterns.length && out === null; i++) {
        var p = patterns[i];
        var side = p.mr, m = side.re.exec(n);
        if (!m) { side = p.en; m = side.re.exec(n); }
        if (m) out = fill(p.tpl[LANG === "en" ? 1 : 0], side.names, m);
      }
    }
    if (out === null) out = n;
    out = localizeDates(out);
    if (LANG === "en" && !/[ऀ-ॿ]/.test(out.replace(/[०-९]/g, ""))) out = toLatin(out);   // fully English text: 0-9 digits
    return out === n ? raw : lead + out + tail;
  }

  // ------------------------------------------------------------------------------------------------ the page
  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE)$/;

  function skipped(node) {
    for (var e = node.nodeType === 1 ? node : node.parentElement; e; e = e.parentElement) {
      if (SKIP.test(e.tagName) || e.hasAttribute("data-no-i18n")) return true;
    }
    return false;
  }

  function doTextNode(node) {
    var v = node.nodeValue;
    if (!v || v.length > 700 || !/\S/.test(v) || skipped(node)) return;
    var t = translateText(v);
    if (t !== v) node.nodeValue = t;
  }

  function doAttrs(el) {
    if (el.nodeType !== 1 || el.hasAttribute("data-no-i18n")) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (v && v.length <= 700) {
        var t = translateText(v);
        if (t !== v) el.setAttribute(a, t);
      }
    }
  }

  function doTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { doTextNode(root); return; }
    if (root.nodeType !== 1) return;
    doAttrs(root);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = walker.nextNode())) {
      if (n.nodeType === 3) doTextNode(n);       // (doTextNode leaves <textarea>, <code> ... alone)
      else doAttrs(n);
    }
  }

  var observer = new MutationObserver(function (records) {
    observer.disconnect();                                       // our own edits are not looked at again
    try {
      records.forEach(function (r) {
        if (r.type === "childList") r.addedNodes.forEach(doTree);
        else if (r.type === "characterData") doTextNode(r.target);
        else if (r.type === "attributes") doAttrs(r.target);
      });
    } finally { watch(); }
  });
  function watch() {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function doHead() { document.title = translateText(document.title); }

  function syncSwitch() {
    document.querySelectorAll(".admin-lang-opt").forEach(function (b) {
      var on = b.getAttribute("data-lang") === LANG;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  function setLanguage(lang) {
    if ((lang !== "en" && lang !== "mr") || lang === LANG) return;
    LANG = lang;
    try { localStorage.setItem(STORE, lang); } catch (e) { /* ignore */ }
    document.documentElement.lang = lang;
    syncSwitch();
    observer.disconnect();
    try {
      doTree(document.body);
      doHead();
      if (typeof window.onAdminLanguageChange === "function") window.onAdminLanguageChange(lang);   // admin.js draws its banner again
      doTree(document.body);
    } finally { watch(); }
  }

  function init() {
    syncSwitch();
    doHead();
    doTree(document.body);
    watch();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.LOKMANGAL_ADMIN_I18N = { entries: ENTRIES, patterns: PATTERNS };      // for the test / coverage tools
  window.getLang = function () { return LANG; };
  window.setLanguage = setLanguage;
  window.trUI = translateText;
  window.tx = function (mr, en) { return LANG === "en" ? en : mr; };            // a message that is not page text (confirm dialogs ...)
})();
