/*
 * LOKMANGAL - search engines and link previews.
 *
 * The website is one page that draws its views with JavaScript. Google runs that JavaScript and then reads the page, so for every view this file
 * sets what Google (and a pasted link) should read: the title, the description, the canonical address, the Open Graph / Twitter card tags and the
 * structured data (JSON-LD). Every view has its own address - ?post=12, ?issue=42, ?cat=rajkiy (the router in app.js) - and all of them are
 * listed in the sitemap (backend/seo.py).
 *
 *   LokmangalSEO.apply({ kind: "home" | "section" | "post" | "issue", section, article, path })
 *   LokmangalSEO.setContact({ address, phone, email })     the office details of the footer, added to the organisation's structured data
 *
 * ORIGIN is the address that search engines should list. It is also written in index.html, robots.txt, sitemap.xml and backend/config.py
 * (SITE_URL): change all of them together when the website moves to another address.
 *
 * (A copy of the site that runs somewhere else - a PC, a Vercel / Amplify preview address - is told NOT to be listed: it would only compete
 *  with the real site. Its canonical address still points to ORIGIN.)
 */
(function () {
  "use strict";

  const ORIGIN = "https://www.lokmangal.info";
  const DEFAULT_IMAGE = ORIGIN + "/assets/og-default.jpg";
  const LOGO = ORIGIN + "/assets/logo-192.jpg";
  const ORGANIZATION_ID = ORIGIN + "/#organization";
  const SUMMARY_CHARS = 190;
  const OFFSET = "+05:30";                 // India: the editorial dates have no time of day
  const PREVIEW_HOST = /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|\[::1\])$|\.(vercel\.app|amplifyapp\.com|local)$/i;
  const ROBOTS_LISTED = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const ROBOTS_HIDDEN = "noindex, nofollow";

  const SITE = { mr: "लोकमंगल न्यूज पोर्टल", en: "Lokmangal News Portal" };
  const WEEKLY = { mr: "लोकमंगल साप्ताहिक", en: "Lokmangal Weekly" };
  const HOME = {
    mr: {
      title: "लोकमंगल न्यूज पोर्टल - ताज्या मराठी बातम्या, राजकीय व सामाजिक घडामोडी",
      description: "लोकमंगल न्यूज पोर्टल: महाराष्ट्रातील ताज्या मराठी बातम्या, राजकीय व सामाजिक घडामोडी, लोकमंगल साप्ताहिक आवृत्ती (PDF ई-पेपर) आणि फाउंडेशनचे ब्लॉग्स - एकाच ठिकाणी.",
    },
    en: {
      title: "Lokmangal News Portal - Latest Marathi News, Political & Social Affairs",
      description: "Lokmangal News Portal: latest Marathi news from Maharashtra, political and social affairs, the Lokmangal weekly e-paper (PDF) and the foundation's blogs - in one place.",
    },
  };
  // the section pages: [name, description]
  const SECTIONS = {
    rajkiy: {
      mr: ["राजकीय बातम्या", "महाराष्ट्रातील ताज्या राजकीय बातम्या, निवडणूक व विकासकामांच्या घडामोडी - लोकमंगल न्यूज पोर्टल."],
      en: ["Political News", "Latest political news from Maharashtra - elections, governance and development works - on Lokmangal News Portal."],
    },
    samajik: {
      mr: ["सामाजिक बातम्या", "समाजोपयोगी उपक्रम, शिक्षण, आरोग्य, जलसंधारण व महिला सक्षमीकरण - लोकमंगल फाउंडेशनच्या सामाजिक कार्याच्या ताज्या बातम्या."],
      en: ["Social News", "Latest news of social work: education, health, water conservation and women's empowerment - from Lokmangal News Portal."],
    },
    blogs: {
      mr: ["ब्लॉग्स", "लोकमंगल फाउंडेशनचे ब्लॉग्स: अन्नपूर्णा योजना, जलसंधारण, विद्यादान, सामुदायिक विवाह आणि शिक्षकरत्न पुरस्कार यांबद्दल सविस्तर लेख."],
      en: ["Blogs", "Blogs of the Lokmangal Foundation: in-depth articles on the Annapurna Yojana, water conservation, scholarships, community weddings and the Shikshak Ratna Award."],
    },
    review: {
      mr: ["रिव्ह्यू", "लोकमंगल न्यूज पोर्टलवरील ताजे रिव्ह्यू."],
      en: ["Reviews", "Latest reviews on Lokmangal News Portal."],
    },
    weekly: {
      mr: ["लोकमंगल साप्ताहिक आवृत्ती - PDF ई-पेपर", "लोकमंगल साप्ताहिकाचे सर्व अंक ऑनलाइन वाचा आणि PDF म्हणून मोफत डाउनलोड करा."],
      en: ["Lokmangal Weekly Edition - PDF E-Paper", "Read every issue of the Lokmangal weekly online and download it free as a PDF."],
    },
  };

  const language = () => (typeof window.getLang === "function" && window.getLang() === "en" ? "en" : "mr");

  // ---------------------------------------------------------------------------------------------------- small helpers
  const plain = (markup) => {
    try {
      return (new DOMParser().parseFromString(String(markup || ""), "text/html").body.textContent || "").replace(/\s+/g, " ").trim();
    } catch (e) { return ""; }                         // (nothing is run or loaded: a parsed document is inert)
  };

  const summaryOf = (excerpt, content) => {
    const text = plain(excerpt) || plain(content);
    if (text.length <= SUMMARY_CHARS) return text;
    const cut = text.slice(0, SUMMARY_CHARS).replace(/\s+\S*$/, "") || text.slice(0, SUMMARY_CHARS);
    return cut.replace(/[\s,.;:-]+$/, "") + "…";
  };

  const absolute = (src) => {
    try { return src ? new URL(String(src), ORIGIN + "/").href : ""; } catch (e) { return ""; }
  };

  // the picture of a link preview: the story's own, unless it is a format some apps do not draw
  const previewImage = (src) => {
    const url = absolute(src);
    return !url || /\.(webp|gif|svg)(\?|$)/i.test(url) ? DEFAULT_IMAGE : url;
  };

  const MONTHS = {};
  ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"].forEach((name, i) => { MONTHS[name] = i + 1; });
  ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"].forEach((name, i) => {
    MONTHS[name] = i + 1;
    MONTHS[name.slice(0, 3)] = i + 1;
  });
  const pad = (n, width) => String(n).padStart(width || 2, "0");

  // "१३ ऑक्टोबर २०२६" / "13 October 2026" / "2026-10-13" -> "2026-10-13" ("" when it is none of them)
  const isoDay = (text) => {
    const t = String(text || "").replace(/[०-९]/g, (d) => "०१२३४५६७८९".indexOf(d));
    let m = t.match(/(\d{1,2})\s+([^\s\d.,]+)[.,]?\s+(\d{4})/);
    if (m && MONTHS[m[2].toLowerCase()]) {
      const y = +m[3], mo = MONTHS[m[2].toLowerCase()], d = +m[1];
      const check = new Date(Date.UTC(y, mo - 1, d));
      return check.getUTCMonth() === mo - 1 && check.getUTCDate() === d ? `${pad(y, 4)}-${pad(mo)}-${pad(d)}` : "";
    }
    m = t.match(/(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[0] : "";
  };

  // ---------------------------------------------------------------------------------------------------- the head
  const head = document.head;

  function setMeta(attribute, key, value) {
    let el = head.querySelector(`meta[${attribute}="${key}"]`);
    if (!value) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attribute, key);
      head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  function setLink(rel, href) {
    let el = head.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      head.appendChild(el);
    }
    el.setAttribute("href", href);
  }

  function setStructuredData(list) {
    let el = document.getElementById("ld-view");
    if (!list.length) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = "ld-view";
      head.appendChild(el);
    }
    el.textContent = JSON.stringify(list);             // (a script's text is never parsed as HTML: nothing in the data can end the block)
  }

  const publisher = (lang) => ({ "@type": "NewsMediaOrganization", "@id": ORGANIZATION_ID, name: SITE[lang], url: ORIGIN + "/", logo: { "@type": "ImageObject", url: LOGO, width: 192, height: 192 } });

  const breadcrumb = (items) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it[0], item: ORIGIN + "/" + it[1] })),
  });

  // ---------------------------------------------------------------------------------------------------- the views
  function describe(view, lang) {
    const a = view.article;
    if (view.kind === "post" && a) {
      const section = SECTIONS[a.category];
      const title = String(a.title || "").trim();
      const summary = summaryOf(a.excerpt, a.content);
      const image = previewImage(a.image);
      const published = isoDay(a._mr_date || a.date);
      const stamp = String(a.updated_at || "").match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})/);
      let modified = stamp ? `${stamp[1]}T${stamp[2]}${OFFSET}` : "";
      if (published && (!modified || modified < `${published}T00:00:00${OFFSET}`)) modified = `${published}T00:00:00${OFFSET}`;
      const author = String(a.author || "").trim();
      const canonical = ORIGIN + "/" + view.path;
      const blog = a.category === "blogs";
      const ld = {
        "@context": "https://schema.org",
        "@type": blog ? "BlogPosting" : "NewsArticle",
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        headline: title.slice(0, 110),
        description: summary,
        image: [image],
        inLanguage: lang,
        articleSection: section ? section[lang][0] : String(a.categoryLabel || ""),
        publisher: publisher(lang),
      };
      if (published) { ld.datePublished = `${published}T00:00:00${OFFSET}`; ld.dateModified = modified; }
      if (author) ld.author = { "@type": /foundation|bureau|team|desk|portal|news|फाऊंडेशन|फाउंडेशन|ब्युरो|प्रतिनिधी|टीम|पोर्टल|न्यूज|मंच/i.test(author) ? "Organization" : "Person", name: author };
      return {
        title: `${title} | ${SITE[lang]}`, description: summary, image, type: "article", published: ld.datePublished, modified: ld.dateModified,
        section: ld.articleSection, structured: [ld, breadcrumb([[SITE[lang], ""], [ld.articleSection, view.sectionPath || `?cat=${a.category}`], [title, view.path]])],
      };
    }
    if (view.kind === "issue" && a) {
      const label = lang === "mr" ? `अंक ${String(a.issue).replace(/\d/g, (d) => "०१२३४५६७८९"[d])}` : `Issue ${a.issue}`;
      const headline = String(a.title || "").trim();
      const name = headline ? `${WEEKLY[lang]} - ${label}: ${headline}` : `${WEEKLY[lang]} - ${label}`;
      const summary = summaryOf(a.excerpt, headline) || SECTIONS.weekly[lang][1];
      const image = previewImage(a.image);
      const published = isoDay(a._mr_date || a.date);
      const ld = {
        "@context": "https://schema.org",
        "@type": "PublicationIssue",
        name,
        issueNumber: String(a.issue),
        description: summary,
        image: [image],
        url: ORIGIN + "/" + view.path,
        inLanguage: lang,
        isPartOf: { "@type": "Periodical", name: WEEKLY[lang], publisher: publisher(lang) },
      };
      if (published) ld.datePublished = `${published}T00:00:00${OFFSET}`;
      return {
        title: `${name} | ${SITE[lang]}`, description: summary, image, type: "article", published: ld.datePublished, modified: "", section: SECTIONS.weekly[lang][0],
        structured: [ld, breadcrumb([[SITE[lang], ""], [SECTIONS.weekly[lang][0], view.sectionPath || "?cat=weekly"], [name, view.path]])],
      };
    }
    if (view.kind === "section" && SECTIONS[view.section]) {
      const [name, description] = SECTIONS[view.section][lang];
      const url = ORIGIN + "/" + view.path;
      return {
        title: `${name} | ${SITE[lang]}`, description, image: DEFAULT_IMAGE, type: "website",
        structured: [
          { "@context": "https://schema.org", "@type": "CollectionPage", name, description, url, inLanguage: lang, isPartOf: { "@id": ORIGIN + "/#website" } },
          breadcrumb([[SITE[lang], ""], [name, view.path]]),
        ],
      };
    }
    return { title: HOME[lang].title, description: HOME[lang].description, image: DEFAULT_IMAGE, type: "website", structured: [] };
  }

  function apply(view) {
    try {
      const lang = language();
      view = view || { kind: "home", path: "" };
      view.path = view.path || "";
      const page = describe(view, lang);
      const canonical = ORIGIN + "/" + view.path;
      document.title = page.title;
      setMeta("name", "description", page.description);
      setLink("canonical", canonical);
      setMeta("name", "robots", PREVIEW_HOST.test(location.hostname) ? ROBOTS_HIDDEN : ROBOTS_LISTED);
      setMeta("property", "og:type", page.type);
      setMeta("property", "og:site_name", SITE[lang]);
      setMeta("property", "og:locale", lang === "en" ? "en_IN" : "mr_IN");
      setMeta("property", "og:locale:alternate", lang === "en" ? "mr_IN" : "en_IN");
      setMeta("property", "og:url", canonical);
      setMeta("property", "og:title", page.title.replace(/ \| [^|]+$/, ""));
      setMeta("property", "og:description", page.description);
      setMeta("property", "og:image", page.image);
      setMeta("property", "og:image:width", page.image === DEFAULT_IMAGE ? "1200" : "");     // (the size of a story's own picture is not known here)
      setMeta("property", "og:image:height", page.image === DEFAULT_IMAGE ? "630" : "");
      setMeta("property", "og:image:alt", page.title.replace(/ \| [^|]+$/, ""));
      setMeta("property", "article:published_time", page.published || "");
      setMeta("property", "article:modified_time", page.modified || "");
      setMeta("property", "article:section", page.section || "");
      setMeta("name", "twitter:card", "summary_large_image");
      setMeta("name", "twitter:title", page.title.replace(/ \| [^|]+$/, ""));
      setMeta("name", "twitter:description", page.description);
      setMeta("name", "twitter:image", page.image);
      setStructuredData(page.structured);
    } catch (e) { /* the page works without it */ }
  }

  // The office details of the footer (Admin Panel > Footer) belong to the organisation's structured data too.
  function setContact(contact) {
    try {
      const el = document.getElementById("ld-site");
      if (!el) return;
      const data = JSON.parse(el.textContent);
      const organization = (data["@graph"] || []).filter((node) => node["@type"] === "NewsMediaOrganization")[0];
      if (!organization) return;
      delete organization.address; delete organization.telephone; delete organization.email;
      if (contact && contact.address) organization.address = contact.address;
      if (contact && contact.phone) organization.telephone = contact.phone;
      if (contact && contact.email) organization.email = contact.email;
      el.textContent = JSON.stringify(data);
    } catch (e) { /* leave it as it is */ }
  }

  // The page's own h1 (a visually hidden line on Home and in the sections, see pageHeading in app.js): Home = the site, a section = its name.
  function heading(kind, section) {
    const lang = language();
    if (kind === "section" && SECTIONS[section]) return SECTIONS[section][lang][0];
    return lang === "en" ? "Lokmangal News Portal - Latest Marathi News" : "लोकमंगल न्यूज पोर्टल - ताज्या मराठी बातम्या";
  }

  window.LokmangalSEO = { ORIGIN: ORIGIN, apply: apply, setContact: setContact, isoDay: isoDay, heading: heading };
})();
