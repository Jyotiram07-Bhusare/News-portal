/*
 * LOKMANGAL - language of the website: मराठी / English.
 *
 * The page is written in Marathi (index.html, js/app.js). This file makes it show ONE language at a time:
 *   - a dictionary (ENTRIES / PATTERNS below) of every short piece of interface text, Marathi <-> English;
 *   - a translator that goes through the page text (text, placeholder, title, aria-label, alt) and replaces what the
 *     dictionary knows, once at load and again whenever the page changes (MutationObserver);
 *   - dates ("२६ ऑगस्ट २०२६" <-> "26 August 2026") and digits (Devanagari <-> 0-9 in English);
 *   - the choice (the मराठी | EN switch in the header) is kept in localStorage ("lokmangal-lang").
 * News text is not touched here: a news item / issue shows its English title and text when the Admin Panel has them
 * (title_en ...), otherwise its Marathi text (see applyDataLanguage in app.js).
 *
 * To translate a new piece of text: add a line to ENTRIES (exact text) or PATTERNS (text with {n} number, {v} number like
 * 34.8K, {x} any text). Marathi first, English second; "aliases" are older spellings that must also be understood.
 */
(function () {
  "use strict";

  var STORE = "lokmangal-lang";
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
  // [Marathi, English, [aliases: other spellings of the same thing found in the page]]
  var ENTRIES = [
    // ---- header, menu, footer
    ["होम", "Home", ["होम (Home)"]],
    ["साप्ताहिक आवृत्ती", "Weekly Publication", ["Weekly publication", "साप्ताहिक आवृत्ती (Weekly)", "साप्ताहिक आवृत्ती (Weekly Publication)"]],
    ["बातम्या", "News"],
    ["ब्लॉग्स", "Blogs", ["ब्लॉग्स (Blogs)"]],
    ["सामाजिक", "Social", ["Samajik", "Samajik (सामाजिक)", "सामाजिक (Samajik)", "सामाजिक (Social)"]],
    ["राजकीय", "Political", ["Rajkiy", "Rajkiy (राजकीय)", "राजकीय (Rajkiy)", "राजकीय (Political)"]],
    ["रिव्ह्यू", "Reviews", ["Reviews (रिव्ह्यू)", "रिव्ह्यू (Reviews)"]],
    ["अपडेट्स", "Updates"],
    ["विशेष", "Special"],
    ["मेनू", "Menu"],
    ["मेनू उघडा", "Open menu"],
    ["मेनू बंद करा", "Close menu"],
    ["मुख्य मेनू", "Main menu"],
    ["शोधा", "Search", ["Search"]],
    ["डार्क/लाईट मोड बदला", "Switch dark / light mode"],
    ["थीम", "Theme", ["Theme"]],
    ["भाषा", "Language", ["भाषा / Language"]],
    ["वर जा", "Back to top"],
    ["बंद करा", "Close", ["Close"]],
    ["लोकमंगल न्यूज पोर्टल", "Lokmangal News Portal", ["लोकमंगल न्यूज पोर्टल (Lokmangal News Portal)", "लोकमंगल न्यूज पोर्टल | Lokmangal News Portal"]],
    [". सर्व हक्क राखीव.", ". All rights reserved."],
    ["लोकमंगल वृत्तांत", "Lokmangal Vruttant"],
    ["लोकमंगल न्यूज पोर्टल - राजकीय, सामाजिक घडामोडी, साप्ताहिक आवृत्ती आणि ब्लॉग्ससाठी विश्वासार्ह डिजिटल व्यासपीठ.",
      "Lokmangal News Portal - a trusted digital platform for political and social news, the weekly publication and blogs.",
      ["लोकमंगल न्यूज पोर्टल (Lokmangal News Portal) - राजकीय, सामाजिक घडामोडी, साप्ताहिक आवृत्ती आणि ब्लॉग्ससाठी विश्वासार्ह डिजिटल व्यासपीठ."]],
    // ---- home
    ["ताज्या बातम्या", "Latest News"],
    ["सर्व", "All"],
    ["सर्व बातम्या", "All News", ["सर्व बातम्या (All)"]],
    ["अधिक बातम्या", "More news"],
    ["प्रमुख बातमी", "Lead Story", ["प्रमुख बातमी (Lead Story)"]],
    ["पुढे वाचा", "Read More", ["Read More"]],
    ["लोकप्रिय बातम्या", "Popular Posts", ["Popular Posts"]],
    ["लोकप्रिय", "Popular Items", ["Popular Items"]],
    ["यादृच्छिक बातम्या", "Random Posts", ["Random Posts"]],
    ["ताजे रिव्ह्यू", "Latest Reviews", ["Latest Reviews"]],
    ["जाहिरात", "Advertisement", ["Responsive Ads"]],
    ["विभाग", "Sections", ["Labels"]],
    ["आम्हाला फॉलो करा", "Follow Us", ["Follow Us"]],
    ["ताज्या बातम्यांसाठी लोकमंगलशी जोडले राहा", "Stay connected with Lokmangal for the latest news"],
    ["फॉलो करा", "Follow"],
    ["सबस्क्राईब", "Subscribe"],
    ["जॉईन करा", "Join"],
    ["निवडक व्हिडिओ", "Featured Videos", ["Featured Videos"]],
    ["बातम्यांचा विभाग", "News section"],
    ["लोकमंगल पतसंस्था — सोने खरेदी कर्ज", "Lokmangal Patsanstha — gold purchase loan"],
    ["लोकमंगल बँक — दसरा दिवाळी, नवी सुरुवात", "Lokmangal Bank — Dasara Diwali, a new beginning"],
    ["लोकमंगल पोर्टलवर बातम्या शोधा (उदा. राजकीय, सामाजिक, निवडणूक)...", "Search news on the Lokmangal portal (e.g. political, social, election)..."],
    ["बातमी सापडली नाही. कृपया दुसरा शब्द शोधा.", "No story found. Please try another word."],
    ["बातमी लिंक कॉपी केली!", "Story link copied!"],
    // ---- share
    ["शेअर करा", "Share"],
    ["शेअर करा:", "Share:"],
    ["कॉपी लिंक", "Copy link"],
    ["Facebook वर शेअर करा", "Share on Facebook"],
    ["X (Twitter) वर शेअर करा", "Share on X (Twitter)"],
    ["WhatsApp वर शेअर करा", "Share on WhatsApp"],
    ["Pinterest वर शेअर करा", "Share on Pinterest"],
    ["ईमेलद्वारे शेअर करा", "Share by email", ["Email द्वारे शेअर करा"]],
    ["अधिक पर्याय", "More options"],
    ["अधिक शेअर बटणे", "More share buttons", ["More share buttons"]],
    // ---- weekly publication
    ["नवीनतम अंक", "Latest Issue"],
    ["PDF ऑनलाईन वाचा", "Read PDF online"],
    ["अंकाचे पान", "Issue page"],
    ["ई-पेपर", "E-paper"],
    ["साप्ताहिक", "Weekly"],
    ["वाचा", "Read"],
    ["PDF ई-पेपर", "PDF E-paper"],
    ["अधिक वाचा", "Show more"],
    ["डाउनलोड", "Download"],
    ["PDF डाउनलोड", "Download PDF"],
    ["PDF डाउनलोड करा", "Download the PDF"],
    ["PDF नवीन टॅबमध्ये उघडा", "Open PDF in a new tab"],
    ["नवीन टॅब", "New tab"],
    ["नवीन टॅबमध्ये उघडा", "Open in a new tab"],
    ["तारीख, महिना किंवा विषय शोधा (उदा. ऑगस्ट २०२६, विमानसेवा, शेतकरी)...", "Search by date, month or topic (e.g. August 2026, flights, farmers)..."],
    ["वर्षानुसार अंक", "Issues by year"],
    ["असा अंक सापडला नाही. दुसरा शब्द, महिना किंवा तारीख शोधा.", "No issue found. Try another word, month or date."],
    ["ऑनलाईन वाचा", "Read online"],
    ["ई-पेपर (PDF) — मोफत वाचा व डाउनलोड करा", "E-paper (PDF) — read and download for free"],
    ["PDF ई-पेपर वाचा", "Read the PDF e-paper"],
    ["संपादकीय मंडळ", "Editorial Board"],
    ["इतर अंक", "Other issues"],
    ["सर्व साप्ताहिक अंकांकडे परत", "Back to all weekly issues"],
    ["लोकमंगल डिजिटल वाचक", "Lokmangal Digital Reader"],
    ["PDF लोड होत आहे…", "Loading the PDF…"],
    ["कनेक्शन हळू आहे — थोडा वेळ लागू शकतो.", "The connection is slow — this may take a moment."],
    ["PDF उघडता आले नाही", "The PDF could not be opened"],
    ["पान", "Page"],
    ["झूम", "Zoom"],
    ["लहान करा (-)", "Zoom out (-)"],
    ["लहान करा", "Zoom out"],
    ["मोठे करा (+)", "Zoom in (+)"],
    ["मोठे करा", "Zoom in"],
    ["या अंकाचा PDF लवकरच उपलब्ध होईल.", "The PDF of this issue will be available soon."],
    // ---- article, comments
    ["पुढील बातमी", "Next story"],
    ["इतर संबंधित बातम्या", "Related stories"],
    ["इतर ताज्या बातम्या", "Other latest news"],
    ["वाचकांच्या प्रतिक्रिया", "Readers' comments", ["वाचकांच्या प्रतिक्रिया (Comments)"]],
    ["लोकमंगल वाचक", "Lokmangal reader"],
    ["आत्ताच", "Just now"],
    ["उत्तर द्या", "Reply"],
    ["तुमची प्रतिक्रिया नोंदवा", "Leave your comment"],
    ["प्रतिक्रिया पाठवा", "Post comment"],
    ["तुमचे नाव (उदा. सचिन पवार)", "Your name (e.g. Sachin Pawar)"],
    ["या बातमीवर आपले मत किंवा प्रतिक्रिया येथे लिहा...", "Write your opinion or comment on this story here..."],
    ["विशेष राजकीय प्रतिनिधी", "Special Political Correspondent"],
    // ---- text that every article page carries
    ["\"सत्य आणि निःपक्षपाती पत्रकारिता हाच लोकशाहीचा खरा आधारस्तंभ आहे. लोकमंगल न्यूज पोर्टल वाचकांच्या प्रत्येक विश्वासास पात्र ठरण्यासाठी कटिबद्ध आहे.\"",
      "\"Truthful and impartial journalism is the true pillar of democracy. Lokmangal News Portal is committed to being worthy of every reader's trust.\""],
    ["या संदर्भातील पुढील ताज्या घडामोडी आणि विशेष विश्लेषणासाठी लोकमंगल न्यूज पोर्टलशी जोडलेले राहा. आपल्या परिसरातील बातम्या आमच्या प्रतिनिधींना कळवा.",
      "Stay connected with Lokmangal News Portal for further updates and special analysis on this. Report news from your area to our correspondents."],
    ["लोकमंगल न्यूज पोर्टलचे अधिकृत पत्रकार व विश्लेषक. सत्य, पारदर्शक आणि वस्तुनिष्ठ पत्रकारितेसाठी कटिबद्ध.",
      "Official journalist and analyst of Lokmangal News Portal. Committed to truthful, transparent and objective journalism."],
    ["साप्ताहिक ई-पेपर (PDF)",
      "Weekly E-paper (PDF)"],
    // ---- toasts and short messages
    ["डार्क मोड सुरू केला", "Dark mode on"],
    ["लाईट मोड सुरू केला", "Light mode on"],
    ["व्हिडिओ प्लेबॅक सक्रिय", "Video playback active"],
    ["व्हिडिओ प्लेलिस्टमध्ये सेव्ह केला", "Video saved to playlist"],
    ["व्हिडिओ लिंक कॉपी केली!", "Video link copied!"],
    ["बातमी सापडली नाही.", "No story found."],
    ["लोड होत आहे…", "Loading…"],
    ["अंकाची लिंक कॉपी केली!", "Issue link copied!"],
    ["कृपया तुमची प्रतिक्रिया लिहा.", "Please write your comment."],
    ["तुमची प्रतिक्रिया यशस्वीरीत्या प्रसिद्ध झाली!", "Your comment was published successfully!"],
    ["ऑडिओ वाचन उपलब्ध नाही.", "Audio reading is not available."],
    ["🔊 बातमी वाचन सुरू झाले...", "🔊 Reading the story aloud..."],
    ["सध्या एकही अंक उपलब्ध नाही", "No issue available at the moment"],
    ["लोकमंगल साप्ताहिकाचे नवीन अंक लवकरच येथे ऑनलाईन वाचता येतील व मोफत डाउनलोड करता येतील. तोपर्यंत ताज्या बातम्या वाचा.", "New issues of Lokmangal Weekly will soon be readable online and free to download here. Until then, read the latest news."],
    ["लोकमंगल साप्ताहिकाचे नवीन अंक लवकरच येथे प्रकाशित होतील. तोपर्यंत ताज्या बातम्या वाचा.", "New issues of Lokmangal Weekly will be published here soon. Until then, read the latest news."],
    ["ताज्या बातम्या वाचा", "Read the latest news"],
    ["नवीनतम साप्ताहिक अंक", "Latest weekly issue"],
    ["मागील अंक", "Previous issue"],
    ["पुढील अंक", "Next issue"],
    ["मागील बातमी", "Previous story"],
    ["कमी पर्याय", "Fewer options"],
    ["साप्ताहिक ई-पेपर", "Weekly E-paper"],
    ["ई-पेपर वाचा", "Read the e-paper"],
    ["या विभागात बातम्या लवकरच जोडल्या जातील.", "News will be added to this section soon."],
    ["या विभागात इतर बातम्या लवकरच जोडल्या जातील.", "Other stories will be added to this section soon."],
    ["अद्याप कोणतीही प्रतिक्रिया आलेली नाही. पहिली प्रतिक्रिया तुम्ही नोंदवा!", "No comments yet. Be the first to comment!"],
    ["या अंकाचा PDF अजून उपलब्ध नाही.", "The PDF of this issue is not available yet."],
    ["तो लवकरच जोडला जाईल.", "It will be added soon."],
    ["ही फाईल PDF म्हणून उघडता आली नाही.", "This file could not be opened as a PDF."],
    ["PDF येथे दाखवता आला नाही.", "The PDF could not be shown here."],
    ["फाईल खराब असू शकते. किंवा PDF नवीन टॅबमध्ये उघडा / डाउनलोड करा.", "The file may be damaged. Or open / download the PDF in a new tab."],
    ["इंटरनेट तपासा आणि पुन्हा प्रयत्न करा. किंवा PDF नवीन टॅबमध्ये उघडा / डाउनलोड करा.", "Check your internet and try again. Or open / download the PDF in a new tab."],
    ["पुन्हा प्रयत्न करा", "Try again"],
    // ---- the demo comments that come with the site
    ["छान बातमी! लोकमंगल न्यूज पोर्टलच्या नियमित वार्तांकनामुळे ताज्या घडामोडी समजतात.",
      "Great story! Thanks to Lokmangal News Portal's regular reporting we stay up to date with current events."],
    ["रविंद्र गायकवाड (कार्यकर्ता)", "Ravindra Gaikwad (Activist)"],
    ["सोलापूर दक्षिण मतदारसंघात बापूंचा विजय अपेक्षितच होता! केलेल्या प्रामाणिक विकासकामांची ही जनतेने दिलेली पावती आहे.",
      "Bapu's victory in the Solapur South constituency was expected! It is the people's reward for the honest development work he has done."],
    ["सुप्रिया पाटील", "Supriya Patil"],
    ["हार्दिक अभिनंदन बापू! ७७ हजारांचे विक्रमी मताधिक्य म्हणजे जनतेचा अथांग विश्वास आहे.",
      "Heartfelt congratulations Bapu! A record margin of 77 thousand shows the people's boundless trust."],
    ["विकास जाधव (शेतकरी)", "Vikas Jadhav (Farmer)"],
    ["गरिबांच्या डोक्यावरील कर्जाचा बोजा हलका करणारा हा अत्यंत स्तुत्य उपक्रम आहे. लोकमंगल फाऊंडेशनचे मनापासून आभार!",
      "This is a highly commendable initiative that lightens the burden of debt on the poor. Heartfelt thanks to Lokmangal Foundation!"],
    ["सचिन शिंदे", "Sachin Shinde"],
    ["सर्वधर्मीय सामुदायिक विवाह सोहळा ही समाजाला एकत्र आणणारी खरी समाजसेवा आहे. लोकमंगलचे अभिनंदन!",
      "The inter-faith community wedding ceremony is true social service that brings society together. Congratulations to Lokmangal!"],
    ["अमित जोशी (भाजप पदाधिकारी)", "Amit Joshi (BJP office-bearer)"],
    ["बापूंच्या प्रदीर्घ अनुभवाचा आगामी महापालिका व स्थानिक निवडणुकांमध्ये पक्षाला नक्कीच मोठा फायदा होईल.",
      "Bapu's long experience will certainly be of great benefit to the party in the upcoming municipal and local body elections."],
    ["दत्तात्रय पवार (ज्येष्ठ नागरिक)", "Dattatray Pawar (senior citizen)"],
    ["वृद्ध आणि निराधार लोकांना वेळेवर सात्त्विक जेवणाचा डबा पोहोचवणे म्हणजे ईश्वरसेवाच! लोकमंगल अन्नपूर्णा योजनेला सलाम.",
      "Delivering a wholesome meal box on time to the elderly and the destitute is itself service to God! Salute to the Lokmangal Annapurna scheme."],
    ["संजय देशमुख (सहकार अभ्यासक)", "Sanjay Deshmukh (cooperative sector scholar)"],
    ["जिल्हा मध्यवर्ती बँकेत पारदर्शकता आणण्यासाठी सुभाष देशमुखांची भूमिका अत्यंत निर्णायक ठरेल. शेतकऱ्यांना न्याय मिळाला पाहिजे.",
      "Subhash Deshmukh's role will be extremely decisive in bringing transparency to the District Central Bank. Farmers must get justice."],
    ["आनंद मोहिते", "Anand Mohite"],
    ["आमच्या गावात नाला खोलीकरण आणि सिमेंट बंधारा झाल्यामुळे विहिरीला भरपूर पाणी आले आहे. शेती जगली!",
      "After the stream deepening and the cement dam in our village, the well has plenty of water. Farming has come alive!"],
    ["अ‍ॅड. निलेश सावंत", "Adv. Nilesh Sawant"],
    ["नितीन गडकरी आणि सुभाष देशमुख यांच्या भेटीमुळे सोलापूर रिंग रोड व रस्त्यांच्या कामाला प्रचंड गती मिळेल.",
      "The meeting of Nitin Gadkari and Subhash Deshmukh will give tremendous speed to the Solapur Ring Road and road works."],
    ["डॉ. प्रज्ञा कुलकर्णी", "Dr. Pradnya Kulkarni"],
    ["मोफत तपासणी आणि मोतीबिंदू शस्त्रक्रिया यामुळे हजारो ग्रामीण वृद्धांना नवी दृष्टी लाभली आहे. उत्तम उपक्रम!",
      "Free check-ups and cataract surgeries have given new vision to thousands of rural elderly. An excellent initiative!"],
    // ---- video
    ["व्हिडिओ पाहा", "Watch video"],
    ["नंतर पाहा", "Watch later"],
    ["लोकमंगल व्हिडिओ विशेष", "Lokmangal video special"],
    ["राजकीय व्हिडिओ", "Political video"],
    ["सामाजिक व्हिडिओ", "Social video"],
    ["कृषी व्हिडिओ", "Agriculture video"],
    ["सोलापूर दक्षिण ऐतिहासिक विजयोत्सव: आमदार सुभाष बापू देशमुख यांचे जाहीर आभार व कार्यकर्त्यांना संबोधन",
      "Solapur South historic victory celebration: MLA Subhash Bapu Deshmukh's public thanks and address to the workers"],
    ["थेट ग्राऊंड रिपोर्ट: लोकमंगल जलक्रांती - दुष्काळी भागात सिमेंट बंधारे व नाला खोलीकरणाचा प्रत्यक्ष आढावा",
      "Live ground report: Lokmangal Jalkranti — a first-hand look at cement dams and stream deepening in the drought-hit area"],
    ["आनंदाचा मंगलक्षण: लोकमंगल फाऊंडेशन सर्वधर्मीय सामुदायिक विवाह सोहळा विशेष माहितीपट",
      "A moment of joy: Lokmangal Foundation's inter-faith community wedding ceremony — special documentary"],
    ["शेतकरी संवाद: आधुनिक ऊस शेती तंत्रज्ञान व ठिबक सिंचन - लोकमंगल कृषी मेळावा विशेष वार्ता",
      "Farmer dialogue: modern sugarcane farming technology and drip irrigation — Lokmangal Agriculture Fair special report"],
    ["लोकमंगल राजकीय विशेष", "Lokmangal Political Special"],
    ["ग्रामीण ब्युरो", "Rural Bureau"],
    ["लोकमंगल वार्ता", "Lokmangal Varta"],
    ["अ‍ॅग्रो टेक", "Agro Tech"],
    ["सोलापूर दक्षिण विधानसभा निवडणुकीत प्रचंड मताधिक्याने विजय मिळवल्यानंतर आमदार सुभाष बापू देशमुख यांनी मतदारांचे आणि कार्यकर्त्यांचे मानले मनःपूर्वक आभार.",
      "After winning the Solapur South assembly election by a huge margin, MLA Subhash Bapu Deshmukh sincerely thanked the voters and the workers."],
    ["लोकमंगलच्या वतीने दुष्काळी भागात राबवण्यात आलेल्या जलसंधारण कामांमुळे विहिरींच्या पाणीपातळीत झालेली वाढ आणि शेतकऱ्यांचे मनोगत.",
      "The rise in well water levels due to the water-conservation works carried out by Lokmangal in the drought-hit area, and the farmers' feelings."],
    ["आर्थिक दुर्बल घटकांतील शेकडो कुटुंबांना मोफत संसारोपयोगी साहित्य, मंगळसूत्र व मानाचा आहेर देऊन विवाह संपन्न करणाऱ्या सोहळ्याचा विशेष माहितीपट.",
      "A special documentary on the ceremony that married hundreds of economically weaker families by giving free household items, a mangalsutra and a gift of honour."],
    ["एकरी १०० टन ऊस उत्पादनाचे ध्येय गाठण्यासाठी कृषी विद्यापीठातील शास्त्रज्ञ व लोकमंगल कृषी तज्ज्ञांनी केलेले मार्गदर्शन.",
      "Guidance by agricultural university scientists and Lokmangal agriculture experts on reaching the goal of 100 tonnes of sugarcane per acre."]
  ];

  // text with {n} (a whole number), {v} (a number like 34.8K) and {x} (any text); {n1}, {n2} ... for several of one kind
  var PATTERNS = [
    ["सर्व {n} बातम्या दाखवल्या आहेत", "All {n} stories shown"],
    ["सर्व {n} अंक दाखवले आहेत", "All {n} issues shown"],
    ["सर्व {n} अंक व PDF पहा", "See all {n} issues and PDFs"],
    ["📥 साप्ताहिक आवृत्ती ({x}) PDF डाऊनलोड होत आहे...", "📥 Weekly Publication ({x}) PDF is downloading..."],
    ["सर्व {n} अंक पहा", "See all {n} issues"],
    ["{x} विशेष अहवाल:", "{x} special report:"],
    ["{n} अंक", "{n} issues"],
    ["{v} वाचक", "{v} views"],
    ["{v} व्ह्यूज • {x}", "{v} views • {x}"],
    ["{v} व्ह्यूज •", "{v} views •"],
    ["{v} व्ह्यूज", "{v} views"],
    ["{n} प्रतिक्रिया", "{n} comments"],
    ["{n} तास आधी", "{n} hours ago"],
    ["{n} मिनिटे आधी", "{n} minutes ago"],
    ["{n} दिवसांपूर्वी", "{n} days ago"],
    ["पसंत ({n})", "Like ({n})"],
    ["मागील अंक ({x})", "Previous issue ({x})"],
    ["पुढील अंक ({x})", "Next issue ({x})"],
    ["{x} • लोकमंगल साप्ताहिक", "{x} • Lokmangal Weekly"],
    ["{x} • साप्ताहिक ई-पेपर", "{x} • Weekly E-paper"],
    ["{x} • साप्ताहिक आवृत्ती", "{x} • Weekly Publication"],
    ["{x} विभागाकडे परत", "Back to {x}"],
    ["पान {n1} / {n2}", "Page {n1} / {n2}"],
    ["HD व्हिडिओ स्ट्रीम उपलब्ध ({x})", "HD video stream available ({x})"],
    ["ताज्या घडामोडी • {x}", "Latest • {x}"],
    ["लोकमंगल साप्ताहिक आवृत्ती (अंक {n}) - डिजिटल ई-पेपर (PDF) उपलब्ध! येथे क्लिक करा",
      "Lokmangal Weekly (issue {n}) — digital e-paper (PDF) available! Click here"]
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
    if (!v || v.length > 260 || !/\S/.test(v) || skipped(node)) return;
    var t = translateText(v);
    if (t !== v) node.nodeValue = t;
  }

  function doAttrs(el) {
    if (el.nodeType !== 1 || el.hasAttribute("data-no-i18n")) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (v && v.length <= 260) {
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

  // title + description of the page
  function doHead() {
    document.title = translateText(document.title);
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", translateText(d.getAttribute("content") || ""));
  }

  function syncSwitch() {
    document.querySelectorAll(".lang-opt").forEach(function (b) {
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
      if (typeof window.onLanguageChange === "function") window.onLanguageChange(lang);   // app.js draws its views again
      doTree(document.body);
      doHead();
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

  window.LOKMANGAL_I18N = { entries: ENTRIES, patterns: PATTERNS };      // for the test / coverage tools
  window.getLang = function () { return LANG; };
  window.setLanguage = setLanguage;
  window.trUI = translateText;
  window.localizeDates = localizeDates;
})();
