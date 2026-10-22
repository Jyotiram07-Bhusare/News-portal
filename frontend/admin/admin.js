/**
 * LOKMANGAL NEWS PORTAL — ADMIN DASHBOARD JAVASCRIPT ENGINE
 * Handles REST API interactions, tab navigation, uploads, and data rendering
 */

// Application State
let appState = {
  articles: [],
  weekly: [],
  stats: {},
  currentTab: 'tab-dashboard',
  searchQuery: '',
  categoryFilter: 'all',
  placementFilter: 'all',
  editingArticleId: null,
  editingWeeklyNo: null,         // issue number while the weekly form edits an existing issue (null = a new issue)
  articlesLoaded: false,         // true once the list really came from the backend (an empty list that failed to load is not "no news")
  weeklyLoaded: false,
  weeklyPdfChosen: false,        // a PDF was uploaded in the open weekly form (an issue being edited already has its PDF)
  storyOnOpen: null,             // the saved HTML of the story + the plain text the box showed on opening (see storyHtml)
  dbEnglish: true,               // false while the database has no English columns yet (python init_db.py adds them)
  videos: [],                    // the Videos section (admin-videos.js)
  videosLoaded: false,           // true once the list really came from the backend
  videosFailed: false,           // the backend answered the other lists but not this one (an old backend without /api/videos, a dropped connection)
  editingVideoId: null,          // id while the video form edits an existing video (null = a new video)
  maxVideoMb: 200,               // the backend's limit for one video file (/api/health tells it)
  maxUploadMb: 50,               // ... and for one photo
  ads: [],                       // the Advertisements section (admin-ads.js)
  adsLoaded: false,              // true once the list really came from the backend
  adsFailed: false,
  editingAdId: null,             // id while the ad form edits an existing ad (null = a new ad)
  settings: {},                  // the Footer section (admin-settings.js): office address, phone, e-mail
  settingsLoaded: false,         // true once the details really came from the backend
  settingsFailed: false
};

// Where the Python backend lives (js/config.js). "" = same address as this page.
const API_BASE = (window.LOKMANGAL_CONFIG && window.LOKMANGAL_CONFIG.API_BASE) || '';
// Where the PUBLIC website lives (js/config.js). The Admin Panel runs on its own subdomain and has none of the site's pictures / PDFs:
// relative addresses (assets/images/x.jpg) are read from the website. "" = the same address as this page (local development).
const SITE_BASE = String((window.LOKMANGAL_CONFIG && window.LOKMANGAL_CONFIG.SITE_BASE) || '').replace(/\/+$/, '');

// A message that is not page text (a confirm dialog, the backend banner): the Marathi or the English one, by the language chosen in the
// sidebar (admin-i18n.js). Page text itself is translated by admin-i18n.js's dictionary.
function msg(mr, en) {
  return typeof window.tx === 'function' ? window.tx(mr, en) : mr;
}
// ---- sign-in ------------------------------------------------------------------------------------------------------------
// The backend gives a login token (POST /api/auth/login). It lives in this browser TAB only (sessionStorage): closing the tab signs out.
const TOKEN_KEY = 'lokmangal_admin_token';
let memoryToken = '';
function getToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || memoryToken; } catch (e) { return memoryToken; }
}
function setToken(token) {
  memoryToken = token || '';
  try { if (token) sessionStorage.setItem(TOKEN_KEY, token); else sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage blocked: the token stays in memory */ }
}

// Every request carries the token. A 401 answer means the login ended (or never was): the sign-in screen comes back.
// Reading is repeated once when the connection is dropped (a hiccup must not leave an empty list behind);
// writing is never repeated by itself.
const apiFetch = async (path, options) => {
  const method = String((options && options.method) || 'GET').toUpperCase();
  const token = getToken();
  const opts = token ? { ...(options || {}), headers: { ...((options && options.headers) || {}), Authorization: 'Bearer ' + token } } : options;
  let res;
  try {
    res = await fetch(API_BASE + path, opts);
  } catch (err) {
    if (method !== 'GET') throw err;
    await new Promise((resolve) => setTimeout(resolve, 500));
    res = await fetch(API_BASE + path, opts);
  }
  if (res.status === 401 && token) signedOut(msg('तुमचे लॉगिन संपले आहे. पुन्हा लॉगिन करा.', 'Your login has ended. Please sign in again.'));
  return res;
};

// URL Helpers for consistent assets
function formatAssetUrl(url) {
  if (!url) return SITE_BASE + '/assets/images/lokmangal_what_we_do.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return SITE_BASE + url;
  if (url.startsWith('../')) return SITE_BASE + '/' + url.replace(/^\.\.\//, '');
  return SITE_BASE + '/' + url;
}

// Where the weekly PDFs are read from: the S3 / CloudFront address from js/config.js, or this site's own assets/pdf/ folder
function formatPdfUrl(filename) {
  if (!filename) return '#';
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
  if (filename.startsWith('/')) return SITE_BASE + filename;
  if (filename.startsWith('../')) return SITE_BASE + '/' + filename.replace(/^\.\.\//, '');
  if (filename.startsWith('assets/pdf/')) return SITE_BASE + '/' + filename;
  const base = String((window.LOKMANGAL_CONFIG && window.LOKMANGAL_CONFIG.PDF_BASE) || '').trim();
  return (/^https:\/\//.test(base) ? base.replace(/\/*$/, '/') : SITE_BASE + '/assets/pdf/') + filename;
}

// The same addresses, ready to be written into a src="..." / href="..." of a template
const attrUrl = (url) => escapeHtml(formatAssetUrl(url));
const attrPdf = (name) => escapeHtml(formatPdfUrl(name));

// -------------------------------------------------------------
// Initialization on DOMContentLoaded
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // "Live site" opens the public website (it is another address than this one when the Admin Panel has its own subdomain)
  const liveSite = document.querySelector('a.nav-item-external');
  if (liveSite) { liveSite.href = SITE_BASE ? SITE_BASE + '/' : '/'; liveSite.rel = 'noopener'; }
  initTheme();
  initNavigation();
  initDateDisplay();
  initSignIn();
  bootAdmin();
});

// -------------------------------------------------------------
// Sign-in screen
// -------------------------------------------------------------
// Start: the backend must answer; then a valid login opens the panel, anything else shows the sign-in screen.
async function bootAdmin() {
  const state = await checkServerStatus();                 // (the public /api/health: online | database | down)
  if (state !== 'online') { showLogin('', state); return; }
  if (getToken()) {
    try {
      const res = await fetch(API_BASE + '/api/auth/me', { headers: { Authorization: 'Bearer ' + getToken() } });
      await res.text();                                    // (read to the end: an unread answer keeps the request "open")
      if (res.ok) { hideLogin(); loadAllData(); return; }
    } catch (err) { /* the sign-in screen below says what is wrong */ }
    setToken('');
  }
  showLogin();
}

function showLogin(note, problemState) {
  const overlay = document.getElementById('login-overlay');
  if (!overlay) return;
  const problem = document.getElementById('login-problem');
  const form = document.getElementById('login-form');
  const retry = document.getElementById('login-retry');
  const broken = !!problemState && problemState !== 'online';
  if (problem) {
    problem.hidden = !broken;
    if (broken) { const p = backendProblem(problemState); problem.textContent = `${p.title} — ${p.text}`; }
  }
  form.querySelectorAll('.form-group, #login-submit').forEach((el) => { el.hidden = broken; });
  if (retry) retry.hidden = !broken;
  const error = document.getElementById('login-error');
  if (error) { error.textContent = note || ''; error.hidden = !note; }
  overlay.hidden = false;
  document.body.classList.add('login-open');
  if (!broken) setTimeout(() => { const f = document.getElementById(document.getElementById('login-user').value ? 'login-pass' : 'login-user'); if (f) f.focus(); }, 50);
}

function hideLogin() {
  const overlay = document.getElementById('login-overlay');
  if (overlay) overlay.hidden = true;
  document.body.classList.remove('login-open');
  const pass = document.getElementById('login-pass');
  if (pass) pass.value = '';
}

// the token was refused (expired, password changed ...) or the user chose "Sign out"
function signedOut(note) {
  setToken('');
  showLogin(note);
}

function initSignIn() {
  const form = document.getElementById('login-form');
  if (form) form.addEventListener('submit', handleLoginSubmit);
  const retry = document.getElementById('login-retry');
  if (retry) retry.addEventListener('click', () => { bootAdmin(); });
  const out = document.getElementById('signout-btn');
  if (out) out.addEventListener('click', () => { signedOut(''); });
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  const error = document.getElementById('login-error');
  const button = document.getElementById('login-submit');
  const fail = (text) => { error.textContent = text; error.hidden = false; };
  error.hidden = true;
  if (!user || !pass) { fail(msg('वापरकर्ता नाव आणि पासवर्ड लिहा.', 'Enter the user name and the password.')); return; }
  button.disabled = true;
  try {
    const res = await fetch(API_BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data && data.success && data.token) {
      setToken(data.token);
      hideLogin();
      await loadAllData();
    } else {
      fail((data && data.error) || msg('लॉगिन होऊ शकले नाही.', 'Could not sign in.'));
    }
  } catch (err) {
    fail(msg('सर्व्हरशी संपर्क होत नाही. इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.', 'Cannot reach the server. Check the internet and try again.'));
  } finally {
    button.disabled = false;
  }
}

// -------------------------------------------------------------
// Theme Management
// -------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('lokmangal_admin_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    updateThemeIcon(true);
  }

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('lokmangal_admin_theme', isDark ? 'dark' : 'light');
      updateThemeIcon(isDark);
    });
  }
}

function updateThemeIcon(isDark) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  }
}

// -------------------------------------------------------------
// Navigation & Tabs
// -------------------------------------------------------------
function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Phones / tablets: the sidebar is a drawer (menu button opens it; the dim backdrop, Esc, a menu entry or the "<" button close it)
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.setAttribute('aria-controls', 'sidebar');
    mobileToggle.setAttribute('aria-label', 'मेनू');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.addEventListener('click', () => setSidebarOpen(!sidebar.classList.contains('mobile-open')));
  }
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.addEventListener('click', () => setSidebarOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setSidebarOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 992) setSidebarOpen(false); });

  // Sidebar collapse toggle (desktop: narrow / wide; on a phone the same button closes the drawer)
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      if (window.innerWidth <= 992) setSidebarOpen(false);
      else sidebar.classList.toggle('collapsed');
    });
  }

  // URL Hash routing
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'articles') switchTab('tab-articles');
    else if (hash === 'weekly') switchTab('tab-weekly');
    else if (hash === 'videos') switchTab('tab-videos');
    else if (hash === 'ads') switchTab('tab-ads');
    else if (hash === 'footer') switchTab('tab-footer');
    else switchTab('tab-dashboard');
  });

  if (window.location.hash) {
    const h = window.location.hash.replace('#', '');
    if (h === 'articles') switchTab('tab-articles');
    else if (h === 'weekly') switchTab('tab-weekly');
    else if (h === 'videos') switchTab('tab-videos');
    else if (h === 'ads') switchTab('tab-ads');
    else if (h === 'footer') switchTab('tab-footer');
  }
}

// ---- Marathi / English tabs of the news form and the weekly form ----------------------------------------------------
// Fields that belong to one language carry data-lang-field="mr" | "en"; the rest (category, date, photo ...) is shared.
function setFormLang(modalId, lang) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.dataset.lang = lang;
  modal.querySelectorAll('[data-lang-field]').forEach((el) => { el.hidden = el.dataset.langField !== lang; });
  modal.querySelectorAll('.lang-tab').forEach((b) => {
    const on = b.dataset.lang === lang;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });
  updateLangDots(modal);
}

// the dot on the English tab is green when some English text has been typed
function updateLangDots(modal) {
  const has = [...modal.querySelectorAll('[data-lang-field="en"] input, [data-lang-field="en"] textarea')].some((f) => f.value.trim());
  const dot = modal.querySelector('.lang-tab[data-lang="en"] .lang-dot');
  if (dot) dot.classList.toggle('on', has);
}

document.addEventListener('input', (e) => {
  const modal = e.target.closest && e.target.closest('.admin-modal-backdrop');
  if (modal && e.target.closest('[data-lang-field="en"]')) updateLangDots(modal);
});

// a required Marathi field that is hidden behind the English tab must not block the save silently: show it
document.addEventListener('invalid', (e) => {
  const field = e.target.closest && e.target.closest('[data-lang-field]');
  if (field && field.hidden) setFormLang(field.closest('.admin-modal-backdrop').id, field.dataset.langField);
}, true);

// the answer of a save says when the English text could not be kept (the database has no English columns yet)
function warnIfEnglishNotSaved(data) {
  if (data && Array.isArray(data.warnings) && data.warnings.includes('english_not_saved')) {
    showToast('मराठी जतन झाले, पण English जतन झाले नाही — backend फोल्डरमध्ये "python init_db.py" एकदा चालवा.', 'error');
  }
}

function setSidebarOpen(open) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('mobile-open', open);
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.classList.toggle('show', open);
  document.body.classList.toggle('sidebar-open', open);
  const btn = document.getElementById('mobile-menu-toggle');
  if (btn) btn.setAttribute('aria-expanded', String(open));
}

function switchTab(tabId) {
  appState.currentTab = tabId;

  // Toggle active class on nav links
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
    if (el.getAttribute('data-tab') === tabId) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // Toggle active class on tab sections
  document.querySelectorAll('.admin-tab').forEach(sec => {
    if (sec.id === tabId) {
      sec.classList.add('active');
    } else {
      sec.classList.remove('active');
    }
  });

  // Update Breadcrumb text
  const breadcrumb = document.getElementById('breadcrumb-current');
  const names = {
    'tab-dashboard': 'डॅशबोर्ड (Dashboard)',
    'tab-articles': 'बातम्या व्यवस्थापन (News Manager)',
    'tab-weekly': 'साप्ताहिक ई-पेपर (Weekly PDF)',
    'tab-videos': 'व्हिडिओ अपलोड (Videos)',
    'tab-ads': 'जाहिरात (Advertisements)',
    'tab-footer': 'फूटर माहिती (Footer)'
  };
  if (breadcrumb) breadcrumb.textContent = names[tabId] || 'डॅशबोर्ड';

  // Close mobile sidebar if open
  setSidebarOpen(false);

}

function initDateDisplay() {
  const marathiMonths = [
    "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
    "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"
  ];
  const devDigits = ["०","१","२","३","४","५","६","७","८","९"];
  const toDev = (n) => String(n).replace(/\d/g, d => devDigits[d]);

  const now = new Date();
  const d = toDev(now.getDate());
  const m = marathiMonths[now.getMonth()];
  const y = toDev(now.getFullYear());
  const formatted = `${d} ${m} ${y}`;

  const el = document.getElementById('current-date-text');
  if (el) el.textContent = formatted;

  // Default date for new article form
  const formDate = document.getElementById('form-article-date');
  if (formDate && !formDate.value) formDate.value = formatted;

  const formWeeklyDate = document.getElementById('form-weekly-date');
  if (formWeeklyDate && !formWeeklyDate.value) formWeeklyDate.value = formatted;
}

// -------------------------------------------------------------
// Data Fetching: REST API Calls
// -------------------------------------------------------------
// The real state of the backend, asked from /api/health (it also brings the upload limits and whether the database has the English columns).
// Answers 'online', 'database' (the backend answers, MySQL does not) or 'down' (nobody answers: no backend at this address).
// (The status box of the sidebar was removed: show() only fills it when a page still has one.)
async function checkServerStatus() {
  const dot = document.getElementById('server-status-dot');
  const text = document.getElementById('server-status-text');
  const box = document.getElementById('server-status');
  let where = window.location.host;
  try { if (API_BASE) where = new URL(API_BASE).host; } catch (e) { /* keep the page's own address */ }
  const show = (state, label, tip) => {
    if (!dot || !text) return;
    dot.className = 'status-indicator-dot ' + state;
    text.textContent = `${where} • ${label}`;
    if (box) box.title = tip || '';
  };
  try {
    const res = await apiFetch('/api/health');
    const data = await res.json();
    if (res.ok && data.success) {
      show('online', 'सुरू', 'MySQL database: ' + data.database);
      appState.dbEnglish = data.english !== false;
      if (data.limits && Number(data.limits.video_mb) > 0) appState.maxVideoMb = Number(data.limits.video_mb);
      if (data.limits && Number(data.limits.upload_mb) > 0) appState.maxUploadMb = Number(data.limits.upload_mb);
      return 'online';
    }
    show('offline', 'MySQL बंद', data.error || '');
    return 'database';
  } catch (err) {
    show('offline', 'बंद (बॅकएंड चालू नाही)', String(err));
    return 'down';
  }
}

async function loadAllData() {
  const [state] = await Promise.all([
    checkServerStatus(),
    fetchStats(),
    fetchArticles(),
    fetchWeekly(),
    fetchVideos(),
    fetchAds(),
    fetchSettings()
  ]);
  // the backend answers but a list did not arrive (a dropped connection): say so, never show a silent empty list
  showBackendBanner(state === 'online' && !(appState.articlesLoaded && appState.weeklyLoaded) ? 'partial' : state);
}

// The numbers of the dashboard start as "…" (not as made-up numbers): a number that never arrives becomes "—", never a wrong "0".
const LIVE_COUNTERS = ['sidebar-articles-count', 'sidebar-weekly-count', 'sidebar-videos-count', 'sidebar-ads-count', 'stat-total-articles', 'stat-total-weekly',
                       'stat-total-rajkiy', 'stat-total-samajik', 'stat-total-popular', 'stat-total-random'];

function backendProblem(state) {
  const host = window.location.hostname;
  const local = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
  if (state === 'partial') {
    return {
      title: msg('बातम्यांची / अंकांची यादी पूर्ण लोड झाली नाही', 'The list of news / issues did not load completely'),
      text: msg('बॅकएंड सुरू आहे, पण कनेक्शन तुटल्यामुळे काही माहिती मिळाली नाही — रिकामी दिसणारी यादी म्हणजे बातम्या / अंक नाहीत असे नाही. "पुन्हा तपासा" दाबा.',
                'The backend is running, but some data did not arrive because the connection dropped — an empty list does not mean there are no news / issues. Press “Check again”.')
    };
  }
  if (state === 'database') {
    return {
      title: msg('बॅकएंड सुरू आहे, पण MySQL डेटाबेसशी जोडणी नाही', 'The backend is running, but it cannot connect to the MySQL database'),
      text: msg('MySQL सेवा चालू आहे का ते तपासा आणि backend/.env मधील DB_* मूल्ये बरोबर आहेत का पाहा. डेटाबेस नवीन असेल तर backend फोल्डरमध्ये "python init_db.py --seed" चालवा. (बातम्या / अंक हरवलेले नाहीत.)',
                'Check that the MySQL service is running and that the DB_* values in backend/.env are correct. If the database is new, run "python init_db.py --seed" in the backend folder. (No news / issues are lost.)')
    };
  }
  if (window.location.protocol === 'file:') {
    return {
      title: msg('हे पान फाईल म्हणून उघडले आहे', 'This page was opened as a file'),
      text: msg('प्रशासकीय कक्षाला बॅकएंड लागतो. backend फोल्डरमध्ये "python app.py" चालवा आणि हा पत्ता उघडा:',
                'The Admin Panel needs the backend. Run "python app.py" in the backend folder and open this address:'),
      link: 'http://localhost:5000/admin/'
    };
  }
  if (local) {
    return {
      title: msg('बॅकएंड (Python + MySQL) चालू नाही', 'The backend (Python + MySQL) is not running'),
      text: msg('प्रशासकीय कक्षाला सर्व माहिती बॅकएंडकडूनच मिळते, म्हणून सध्या आकडे व याद्या रिकाम्या दिसतात — बातम्या / अंक हरवलेले नाहीत. backend फोल्डरमध्ये "python app.py" चालवा आणि "पुन्हा तपासा" दाबा.',
                'The Admin Panel gets all its data from the backend, so the numbers and lists look empty right now — no news / issues are lost. Run "python app.py" in the backend folder and press “Check again”.')
    };
  }
  if (API_BASE) {
    return {
      title: msg('बॅकएंडला पोहोचता आले नाही', 'The backend could not be reached'),
      text: msg(`${API_BASE} वरील बॅकएंड चालू नाही, किंवा त्याच्या CORS_ORIGINS मध्ये ही साईट नाही (backend/.env). बॅकएंड सुरू करून "पुन्हा तपासा" दाबा.`,
                `The backend at ${API_BASE} is not running, or this site is not in its CORS_ORIGINS (backend/.env). Start the backend and press “Check again”.`)
    };
  }
  return {
    title: msg('या पत्त्यावर बॅकएंड नाही', 'There is no backend at this address'),
    text: msg(`"${window.location.host}" वर फक्त वेबसाईट (static फाईल्स) ठेवली आहे; Python + MySQL बॅकएंड तिथे चालत नाही. म्हणून प्रशासकीय कक्ष काहीही वाचू किंवा जतन करू शकत नाही आणि आकडे रिकामे दिसतात — बातम्या व अंक हरवलेले नाहीत, साईटवर ते जसेच्या तसे आहेत. अंक / बातम्या व्यवस्थापित करण्यासाठी बॅकएंड असलेला Admin उघडा. तुमच्या PC वर:`,
              `Only the website (static files) is hosted at "${window.location.host}"; the Python + MySQL backend does not run there. So the Admin Panel can neither read nor save anything and the numbers look empty — no news or issues are lost, they are on the site exactly as before. To manage issues / news open the Admin that has a backend. On your PC:`),
    link: 'http://localhost:5000/admin/',
    tail: msg('बॅकएंड इंटरनेटवर ठेवल्यावर frontend/js/config.js मध्ये त्याचा पत्ता द्या (README: "इंटरनेटवर ठेवताना").',
              'When the backend is hosted on the internet, put its address in frontend/js/config.js (README: “Hosting on the internet”).')
  };
}

function showBackendBanner(state) {
  appState.bannerState = state;          // (drawn again in the other language when the language switch is used)
  LIVE_COUNTERS.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.textContent.trim() === '…') el.textContent = '—';
  });
  const lead = document.getElementById('dash-current-lead-title');
  if (lead && /लोड होत आहे/.test(lead.textContent)) lead.textContent = 'माहिती मिळाली नाही.';

  const banner = document.getElementById('backend-banner');
  if (!banner) return;
  if (state === 'online') { banner.hidden = true; return; }
  const msg = backendProblem(state);
  document.getElementById('backend-banner-title').textContent = msg.title;
  const text = document.getElementById('backend-banner-text');
  text.textContent = msg.text;
  if (msg.link) {
    const a = document.createElement('a');
    a.href = msg.link;
    a.textContent = msg.link;
    text.append(' ', a);
  }
  if (msg.tail) text.append(' ', msg.tail);
  banner.hidden = false;
}

// admin-i18n.js calls this after the language was switched: the backend banner is made of messages (not page text), so it is drawn again
window.onAdminLanguageChange = function () {
  if (appState.bannerState && appState.bannerState !== 'online') showBackendBanner(appState.bannerState);
};

async function refreshDashboardData() {
  showToast('माहिती रीलोड होत आहे...', 'info');
  await loadAllData();
  showToast('डॅशबोर्ड अद्यतनित झाला!', 'success');
}

async function fetchStats() {
  try {
    const res = await apiFetch('/api/stats');
    const data = await res.json();
    if (data.success) {
      appState.stats = data.stats;
      renderDashboardStats();
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

async function fetchArticles() {
  try {
    const res = await apiFetch('/api/articles');
    const data = await res.json();
    if (data.success) {
      appState.articles = data.articles;
      appState.articlesLoaded = true;
      renderArticlesTable();
      renderRecentArticles();
      updateBadgeCounts();
    }
  } catch (err) {
    console.error('Error fetching articles:', err);
  }
}

async function fetchWeekly() {
  try {
    const res = await apiFetch('/api/weekly');
    const data = await res.json();
    if (data.success) {
      appState.weekly = data.issues;
      appState.weeklyLoaded = true;
      renderWeeklyTable();
      renderRecentWeekly();
      updateBadgeCounts();
    }
  } catch (err) {
    console.error('Error fetching weekly:', err);
  }
}

// The numbers in the sidebar: a list that did not load is not "0" - its badge stays as it is ("…", then "—" when the backend is down).
function updateBadgeCounts() {
  const aCount = document.getElementById('sidebar-articles-count');
  if (aCount && appState.articlesLoaded) aCount.textContent = appState.articles.length;

  const wCount = document.getElementById('sidebar-weekly-count');
  if (wCount && appState.weeklyLoaded) wCount.textContent = appState.weekly.length;

  const vCount = document.getElementById('sidebar-videos-count');
  if (vCount && appState.videosLoaded) vCount.textContent = appState.videos.length;

  const adCount = document.getElementById('sidebar-ads-count');
  if (adCount && appState.adsLoaded) adCount.textContent = appState.ads.length;
}

// -------------------------------------------------------------
// Render: Dashboard Stats & Recent Lists
// -------------------------------------------------------------
function renderDashboardStats() {
  const s = appState.stats;
  if (!s) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val !== undefined ? val : 0;
  };

  setVal('stat-total-articles', s.total_articles);
  setVal('stat-total-weekly', s.total_weekly);
  setVal('stat-total-rajkiy', s.total_rajkiy);
  setVal('stat-total-samajik', s.total_samajik);
  setVal('stat-total-popular', s.total_popular);
  setVal('stat-total-random', s.total_random);

  const leadEl = document.getElementById('dash-current-lead-title');
  if (leadEl) {
    if (s.current_lead && s.current_lead.title) {
      leadEl.innerHTML = `<i class="fa-solid fa-star" style="color:#eab308; margin-right:4px;"></i> <span data-no-i18n>${escapeHtml(s.current_lead.title)}</span>`;
    } else {
      leadEl.textContent = 'कोणतीही बातमी लीड म्हणून सेट केलेली नाही.';
    }
  }
}

function renderRecentArticles() {
  const container = document.getElementById('dash-recent-articles');
  if (!container) return;

  const recents = (appState.articles || []).slice(0, 5);
  if (!recents.length) {
    container.innerHTML = '<div style="padding: 16px; color: var(--text-muted);">कोणतीही बातमी उपलब्ध नाही.</div>';
    return;
  }

  container.innerHTML = recents.map(a => `
    <div class="recent-item" onclick="openEditArticleModal(${a.id})" style="cursor: pointer;">
      <img src="${attrUrl(a.image)}" class="recent-thumb" alt="${escapeHtml(a.title)}" data-no-i18n>
      <div class="recent-body">
        <h4 class="recent-title" data-no-i18n>${escapeHtml(a.title)}</h4>
        <div class="recent-meta">
          <span class="category-pill pill-${escapeHtml(a.category)}">${escapeHtml(a.categoryLabel || a.category)}</span>
          <span><i class="fa-regular fa-calendar"></i> ${escapeHtml(a.date)}</span>
          <span><i class="fa-regular fa-eye"></i> ${escapeHtml(a.views)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderRecentWeekly() {
  const container = document.getElementById('dash-recent-weekly');
  if (!container) return;

  const recents = (appState.weekly || []).slice(0, 5);
  if (!recents.length) {
    container.innerHTML = '<div style="padding: 16px; color: var(--text-muted);">कोणताही अंक उपलब्ध नाही.</div>';
    return;
  }

  container.innerHTML = recents.map(w => `
    <div class="recent-item">
      <img src="${attrUrl(w.image)}" class="recent-thumb table-thumb-cover" alt="अंक ${w.issue_no}">
      <div class="recent-body">
        <h4 class="recent-title" data-no-i18n>${escapeHtml(w.title)}</h4>
        <div class="recent-meta">
          <span class="category-pill pill-weekly">अंक ${w.issue_no}</span>
          <span><i class="fa-regular fa-calendar"></i> ${escapeHtml(w.date)}</span>
          ${w.views && w.views !== '—' ? `<span><i class="fa-regular fa-eye"></i> ${escapeHtml(w.views)}</span>` : ''}
        </div>
      </div>
      <a href="${attrPdf(w.pdf_filename)}" target="_blank" rel="noopener" class="action-btn" title="PDF पहा">
        <i class="fa-solid fa-file-pdf"></i>
      </a>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// Render: Articles Table & Filters
// -------------------------------------------------------------
function renderArticlesTable() {
  const tbody = document.getElementById('articles-table-body');
  if (!tbody) return;

  let list = appState.articles || [];

  // Filter by category
  if (appState.categoryFilter && appState.categoryFilter !== 'all') {
    list = list.filter(a => a.category === appState.categoryFilter);
  }

  // Filter by section placement
  if (appState.placementFilter && appState.placementFilter !== 'all') {
    if (appState.placementFilter === 'lead') {
      list = list.filter(a => Number(a.is_lead) === 1);
    } else if (appState.placementFilter === 'popular') {
      list = list.filter(a => Number(a.is_popular) === 1);
    } else if (appState.placementFilter === 'random') {
      list = list.filter(a => Number(a.is_random) === 1);
    } else if (appState.placementFilter === 'latest') {
      list = list.filter(a => a.is_latest === undefined || Number(a.is_latest) === 1);
    }
  }

  // Filter by search query
  if (appState.searchQuery) {
    const q = appState.searchQuery.toLowerCase();
    list = list.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
      (a.author && a.author.toLowerCase().includes(q))
    );
  }

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 1.8rem; margin-bottom: 8px; display: block;"></i>
          कोणतीही बातमी सापडली नाही.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(a => `
    <tr>
      <td style="font-weight: 700; color: var(--text-muted);">${a.id}${a.sort_order ? `<div class="article-order-badge" title="क्रम क्रमांक">#${a.sort_order}</div>` : ''}</td>
      <td>
        <img src="${attrUrl(a.image)}" class="table-thumb" alt="${escapeHtml(a.title)}" data-no-i18n>
      </td>
      <td>
        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 3px;" data-no-i18n>${escapeHtml(a.title)}${a.title_en ? ' <span class="lang-badge" title="English आवृत्ती आहे">EN</span>' : ''}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted);"><span>by</span> <span data-no-i18n>${escapeHtml(a.author || 'प्रतिनिधी')}</span></div>
      </td>
      <td>
        <span class="category-pill pill-${escapeHtml(a.category)}">${escapeHtml(a.categoryLabel || a.category)}</span>
      </td>
      <td>
        <div class="placement-badges-cell">
          <button type="button" class="placement-btn ${Number(a.is_lead) === 1 ? 'is-active-lead' : ''}" 
                  onclick="toggleArticlePlacement(${a.id}, 'is_lead')" 
                  title="${Number(a.is_lead) === 1 ? 'मुख्य बातमी म्हणून सेट आहे (काढण्यासाठी क्लिक करा)' : 'या बातमीला मुख्य बातमी (Lead Story) बनवा'}">
            <i class="fa-solid fa-star"></i> Lead
          </button>
          <button type="button" class="placement-btn ${Number(a.is_popular) === 1 ? 'is-active-popular' : ''}" 
                  onclick="toggleArticlePlacement(${a.id}, 'is_popular')" 
                  title="${Number(a.is_popular) === 1 ? 'लोकप्रिय मधून काढा' : 'लोकप्रिय बातम्यांमध्ये जोडा'}">
            <i class="fa-solid fa-fire"></i> Popular
          </button>
          <button type="button" class="placement-btn ${Number(a.is_random) === 1 ? 'is-active-random' : ''}" 
                  onclick="toggleArticlePlacement(${a.id}, 'is_random')" 
                  title="${Number(a.is_random) === 1 ? 'यादृच्छिक मधून काढा' : 'यादृच्छिक बातम्यांमध्ये जोडा'}">
            <i class="fa-solid fa-shuffle"></i> Random
          </button>
          <button type="button" class="placement-btn ${a.is_latest === undefined || Number(a.is_latest) === 1 ? 'is-active-latest' : ''}" 
                  onclick="toggleArticlePlacement(${a.id}, 'is_latest')" 
                  title="${a.is_latest === undefined || Number(a.is_latest) === 1 ? 'ताज्या बातम्यांमधून काढा' : 'ताज्या बातम्यांमध्ये जोडा'}">
            <i class="fa-regular fa-newspaper"></i> Latest
          </button>
        </div>
      </td>
      <td style="font-size: 0.85rem; color: var(--text-secondary);">${escapeHtml(a.date)}</td>
      <td style="font-weight: 600;">${escapeHtml(a.views || '1.2K')}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn" title="पूर्वावलोकन" onclick="openPreviewArticle(${a.id})">
            <i class="fa-regular fa-eye"></i>
          </button>
          <button class="action-btn" title="संपादित करा" onclick="openEditArticleModal(${a.id})">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="action-btn delete-btn" title="हटवा" onclick="confirmDeleteArticle(${a.id})">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function handleArticleSearch() {
  const input = document.getElementById('article-search-input');
  appState.searchQuery = input ? input.value.trim() : '';
  renderArticlesTable();
}

function filterArticlesByCategory() {
  const sel = document.getElementById('article-category-filter');
  appState.categoryFilter = sel ? sel.value : 'all';
  renderArticlesTable();
}

function filterArticlesByPlacement() {
  const sel = document.getElementById('article-placement-filter');
  appState.placementFilter = sel ? sel.value : 'all';
  renderArticlesTable();
}

async function toggleArticlePlacement(articleId, field) {
  try {
    const res = await apiFetch(`/api/articles/${articleId}/toggle-placement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      await fetchArticles();
      await fetchStats();
    } else {
      showToast(data.error || 'अपडेट अयशस्वी', 'error');
    }
  } catch (err) {
    console.error('Error toggling placement:', err);
    showToast('सर्व्हर त्रुटी: विभाग स्थान बदलता आले नाही.', 'error');
  }
}

// -------------------------------------------------------------
// Articles: Add / Edit / Delete Modals & Handlers
// -------------------------------------------------------------
function openNewArticleModal() {
  appState.editingArticleId = null;
  document.getElementById('article-modal-title').innerHTML = '<i class="fa-solid fa-plus-circle"></i> नवीन बातमी तयार करा';
  document.getElementById('form-article-id').value = '';
  document.getElementById('form-article-title').value = '';
  document.getElementById('form-article-category').value = 'rajkiy';

  // Section placements
  const leadChk = document.getElementById('form-article-is-lead');
  if (leadChk) leadChk.checked = false;
  const popChk = document.getElementById('form-article-is-popular');
  if (popChk) popChk.checked = false;
  const rndChk = document.getElementById('form-article-is-random');
  if (rndChk) rndChk.checked = false;
  const latestChk = document.getElementById('form-article-is-latest');
  if (latestChk) latestChk.checked = true;                 // a new news is listed in Latest News unless it is un-ticked

  document.getElementById('form-article-author').value = 'विशेष बातमीदार';
  document.getElementById('form-article-views').value = '1.8K';
  document.getElementById('form-article-order').value = '';               // (no number: listed by recency; a number puts it at that place of its list)
  document.getElementById('form-article-image').value = '';                 // (no photo is suggested: the editor chooses one)
  updateArticleImgPreview('');
  document.getElementById('form-article-excerpt').value = '';
  document.getElementById('form-article-content').value = '';
  appState.storyOnOpen = null;
  ['title', 'author', 'excerpt', 'content'].forEach((f) => { document.getElementById('form-article-' + f + '-en').value = ''; });
  setFormLang('article-modal', 'mr');
  document.getElementById('btn-save-article').innerHTML = '<i class="fa-solid fa-check"></i> बातमी प्रकाशित करा';

  initDateDisplay();
  document.getElementById('article-modal').classList.add('open');
}

function openEditArticleModal(articleId) {
  const a = appState.articles.find(item => item.id === articleId);
  if (!a) return;

  appState.editingArticleId = articleId;
  document.getElementById('article-modal-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> बातमी संपादित करा (ID: ${a.id})`;
  document.getElementById('form-article-id').value = a.id;
  document.getElementById('form-article-title').value = a.title || '';
  document.getElementById('form-article-category').value = a.category || 'rajkiy';

  // Section placements
  const leadChk = document.getElementById('form-article-is-lead');
  if (leadChk) leadChk.checked = Number(a.is_lead) === 1;
  const popChk = document.getElementById('form-article-is-popular');
  if (popChk) popChk.checked = Number(a.is_popular) === 1;
  const rndChk = document.getElementById('form-article-is-random');
  if (rndChk) rndChk.checked = Number(a.is_random) === 1;
  const latestChk = document.getElementById('form-article-is-latest');
  if (latestChk) latestChk.checked = a.is_latest === undefined || Number(a.is_latest) === 1;

  document.getElementById('form-article-author').value = a.author || 'प्रतिनिधी';
  document.getElementById('form-article-date').value = a.date || '';
  document.getElementById('form-article-views').value = a.views || '1.5K';
  document.getElementById('form-article-order').value = a.sort_order || '';
  document.getElementById('form-article-image').value = a.image || '';
  updateArticleImgPreview(a.image);
  document.getElementById('form-article-excerpt').value = a.excerpt || '';
  // the story boxes show plain text (no tags); what they showed is remembered, so an untouched story is saved back as it was
  const plain = htmlToPlainText(a.content), plainEn = htmlToPlainText(a.content_en);
  appState.storyOnOpen = { content: { html: a.content || '', plain }, content_en: { html: a.content_en || '', plain: plainEn } };
  document.getElementById('form-article-content').value = plain;
  document.getElementById('form-article-title-en').value = a.title_en || '';
  document.getElementById('form-article-author-en').value = a.author_en || '';
  document.getElementById('form-article-excerpt-en').value = a.excerpt_en || '';
  document.getElementById('form-article-content-en').value = plainEn;
  setFormLang('article-modal', 'mr');
  document.getElementById('btn-save-article').innerHTML = '<i class="fa-solid fa-check"></i> बदल जतन करा';

  document.getElementById('article-modal').classList.add('open');
}

function closeArticleModal() {
  document.getElementById('article-modal').classList.remove('open');
}

function updateArticleImgPreview(url) {
  const img = document.getElementById('article-img-preview');
  const wrap = document.getElementById('article-img-preview-wrap');
  const has = !!String(url || '').trim();
  if (wrap) wrap.classList.toggle('is-empty', !has);           // no photo yet: an empty box with a picture icon
  if (img) {
    img.hidden = !has;
    if (has) img.src = formatAssetUrl(url);
    else img.removeAttribute('src');
  }
}

// Handle Image Upload via Drag/Drop or Input
async function handleArticleImageUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);

  showToast('फोटो अपलोड होत आहे...', 'info');

  try {
    const res = await apiFetch('/api/upload/image', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('form-article-image').value = data.url;
      updateArticleImgPreview(data.url);
      showToast('फोटो यशस्वीरीत्या अपलोड झाला!', 'success');
    } else {
      showToast(data.error || 'अपलोड अयशस्वी.', 'error');
    }
  } catch (err) {
    console.error('Error uploading image:', err);
    showToast('सर्व्हर त्रुटी: फोटो अपलोड होऊ शकला नाही.', 'error');
  }
}

// The story box is a PLAIN text box: the editor writes normal text, a blank line starts a new paragraph, no HTML tags are needed.
// The website gets the text as paragraphs (<p>…</p>, a single line break becomes <br>, & < > are escaped). Text that the editor
// pastes WITH HTML tags in it is kept exactly as typed.
function plainTextToParagraphs(text) {
  if (!text || /<[a-z!\/][^>]*>/i.test(text)) return text;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return text.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>').replace(/\r?\n/g, '<br>')}</p>`).join('\n');   // (**bold** = Ctrl+B in the story box)
}

// HTML for a preview: parsed in an inert document, then scripts / frames / event handlers / javascript: addresses are taken out.
// (The backend cleans every story before it is saved; this protects the preview of older rows and of text still being typed.)
function safeHtml(html) {
  const body = new DOMParser().parseFromString(`<body>${String(html || '')}</body>`, 'text/html').body;
  body.querySelectorAll('script, style, iframe, object, embed, link, meta, base, form, svg, math').forEach((el) => el.remove());
  body.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.replace(/[\u0000- ]+/g, '').toLowerCase();
      if (name.startsWith('on') || ((name === 'href' || name === 'src' || name === 'xlink:href' || name === 'action') && /^(javascript|data|vbscript):/.test(value))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return body.innerHTML;
}

// The saved HTML of a story -> the plain text the editor sees in the box (paragraphs separated by a blank line, no tags,
// &amp; & co. turned back into characters).
function htmlToPlainText(html) {
  // (parsed in an inert document: an <img onerror=...> inside a saved story must not run just because the story is opened)
  const box = new DOMParser().parseFromString(`<body>${String(html || '')}</body>`, 'text/html').body;
  const blocks = [];
  let line = '';
  const flush = () => { const t = line.replace(/[ \t]*\n[ \t]*/g, '\n').trim(); if (t) blocks.push(t); line = ''; };
  const walk = (node) => {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) line += n.nodeValue.replace(/\s+/g, ' ');
      else if (n.nodeType === 1) {
        if (n.tagName === 'BR') line += '\n';
        else if (n.tagName === 'STRONG' || n.tagName === 'B') {      // bold text is shown between ** ** (what Ctrl+B writes), so editing a story keeps its bold
          const at = line.length;
          line += '**';
          walk(n);
          if (line.slice(at, at + 2) === '**' && line.slice(at + 2).trim()) line += '**';
          else if (line.slice(at, at + 2) === '**') line = line.slice(0, at) + line.slice(at + 2);
        }
        else if (/^(P|DIV|H[1-6]|BLOCKQUOTE|UL|OL|LI|TABLE|TR|HR|FIGURE)$/.test(n.tagName)) { flush(); walk(n); flush(); }
        else walk(n);
      }
    });
  };
  walk(box);
  flush();
  return blocks.join('\n\n');
}

// What goes to the database for one story box: the text the editor sees is made into paragraphs; but when it was NOT changed
// (the box still holds exactly what it showed on opening), the saved HTML stays as it was (an old story keeps its bold dateline etc.).
function storyHtml(fieldId, key) {
  const typed = document.getElementById(fieldId).value.trim();
  const open = appState.storyOnOpen && appState.storyOnOpen[key];
  if (open && open.html && typed === open.plain) return open.html;
  return plainTextToParagraphs(typed);
}

// Form Submit: Create or Update Article
async function handleArticleFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('form-article-title').value.trim();
  const category = document.getElementById('form-article-category').value;
  const author = document.getElementById('form-article-author').value.trim();
  const date = document.getElementById('form-article-date').value.trim();
  const views = document.getElementById('form-article-views').value.trim() || '1.5K';
  const image = document.getElementById('form-article-image').value.trim();
  if (!image) {
    showToast('आधी बातमीचा फोटो निवडा किंवा त्याचा URL द्या.', 'error');
    document.getElementById('form-article-image').focus();
    return;
  }
  const excerpt = document.getElementById('form-article-excerpt').value.trim();
  const content = storyHtml('form-article-content', 'content');
  const title_en = document.getElementById('form-article-title-en').value.trim();
  const author_en = document.getElementById('form-article-author-en').value.trim();
  const excerpt_en = document.getElementById('form-article-excerpt-en').value.trim();
  const content_en = storyHtml('form-article-content-en', 'content_en');

  // Placement checkbox states
  const is_lead = document.getElementById('form-article-is-lead')?.checked ? 1 : 0;
  const is_popular = document.getElementById('form-article-is-popular')?.checked ? 1 : 0;
  const is_random = document.getElementById('form-article-is-random')?.checked ? 1 : 0;
  const is_latest = document.getElementById('form-article-is-latest')?.checked ? 1 : 0;

  const labels = {
    rajkiy: 'राजकीय',
    samajik: 'सामाजिक',
    blogs: 'ब्लॉग्स',
    review: 'रिव्ह्यू'          // the website calls this section "review" (#cat-review) - same word here
  };

  const payload = {
    title,
    category,
    categoryLabel: labels[category] || 'ताज्या घडामोडी',
    is_lead,
    is_popular,
    is_random,
    is_latest,
    sort_order: parseInt(document.getElementById('form-article-order').value, 10) || null,     // (empty = not placed by hand)
    author,
    date,
    views,
    image,
    excerpt,
    content,
    title_en,
    author_en,
    excerpt_en,
    content_en
  };

  const saveBtn = document.getElementById('btn-save-article');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> जतन होत आहे...';

  try {
    let res;
    if (appState.editingArticleId) {
      res = await apiFetch(`/api/articles/${appState.editingArticleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await apiFetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'बातमी जतन झाली!', 'success');
      warnIfEnglishNotSaved(data);
      closeArticleModal();
      await fetchArticles();
      await fetchStats();
    } else {
      showToast(data.error || 'त्रुटी आली.', 'error');
    }
  } catch (err) {
    console.error('Error saving article:', err);
    showToast('सर्व्हर त्रुटी: बातमी जतन होऊ शकली नाही.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> बातमी प्रकाशित करा';
  }
}

// Delete Article with confirmation (the title for the question is looked up here, so no title has to travel through an onclick="...")
async function confirmDeleteArticle(articleId, title) {
  if (title === undefined) {
    const known = (appState.articles || []).find((a) => a.id === articleId);
    title = known ? known.title : '';
  }
  if (!confirm(`${msg('तुम्हाला खात्री आहे की ही बातमी हटवायची आहे?', 'Are you sure you want to delete this article?')}\n\n"${title}"`)) {
    return;
  }

  showToast('बातमी हटवत आहे...', 'info');

  try {
    const res = await apiFetch(`/api/articles/${articleId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('बातमी यशस्वीरीत्या हटवली!', 'success');
      await fetchArticles();
      await fetchStats();
    } else {
      showToast(data.error || 'हटवणे अयशस्वी.', 'error');
    }
  } catch (err) {
    console.error('Error deleting article:', err);
    showToast('सर्व्हर त्रुटी: बातमी हटवता आली नाही.', 'error');
  }
}

// -------------------------------------------------------------
// Preview Modal
// -------------------------------------------------------------
function openPreviewArticle(articleId) {
  const a = appState.articles.find(item => item.id === articleId);
  if (!a) return;

  document.getElementById('prev-badge').textContent = a.categoryLabel || a.category;
  document.getElementById('prev-title').textContent = a.title;
  document.getElementById('prev-author').textContent = a.author || 'प्रतिनिधी';
  document.getElementById('prev-date').textContent = a.date || '';
  document.getElementById('prev-views').textContent = `${a.views || '1.5K'} वाचक`;
  
  const img = document.getElementById('prev-img');
  img.src = formatAssetUrl(a.image);
  
  document.getElementById('prev-content').innerHTML = safeHtml(a.content) || `<p>${escapeHtml(a.excerpt)}</p>`;
  document.getElementById('preview-modal').classList.add('open');
}

function previewArticleBeforeSubmit() {
  const title = document.getElementById('form-article-title').value.trim() || 'नमुना शीर्षक';
  const cat = document.getElementById('form-article-category').value;
  const author = document.getElementById('form-article-author').value.trim() || 'प्रतिनिधी';
  const date = document.getElementById('form-article-date').value.trim() || 'आज';
  const image = document.getElementById('form-article-image').value.trim();
  const content = plainTextToParagraphs(document.getElementById('form-article-content').value.trim()) || '<p>बातमी मजकूर...</p>';

  document.getElementById('prev-badge').textContent = cat;
  document.getElementById('prev-title').textContent = title;
  document.getElementById('prev-author').textContent = author;
  document.getElementById('prev-date').textContent = date;
  document.getElementById('prev-views').textContent = '१.२K वाचक';

  const img = document.getElementById('prev-img');
  img.hidden = !image;
  if (image) img.src = formatAssetUrl(image);
  else img.removeAttribute('src');

  document.getElementById('prev-content').innerHTML = safeHtml(content);
  document.getElementById('preview-modal').classList.add('open');
}

function closePreviewModal() {
  document.getElementById('preview-modal').classList.remove('open');
}

// -------------------------------------------------------------
// Render: Weekly E-Paper Table & Modals
// -------------------------------------------------------------
function renderWeeklyTable() {
  const tbody = document.getElementById('weekly-table-body');
  if (!tbody) return;

  const list = appState.weekly || [];
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">कोणताही अंक उपलब्ध नाही.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(w => {
    const pdfUrl = attrPdf(w.pdf_filename);
    return `
      <tr>
        <td style="font-weight: 800; color: var(--brand-orange);">अंक ${w.issue_no}</td>
        <td>
          <img src="${attrUrl(w.image)}" class="table-thumb table-thumb-cover" alt="अंक ${w.issue_no}">
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);" data-no-i18n>${escapeHtml(w.title)}${w.title_en ? ' <span class="lang-badge" title="English आवृत्ती आहे">EN</span>' : ''}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);" data-no-i18n>${w.description ? escapeHtml(w.description.length > 75 ? w.description.slice(0, 75) + '…' : w.description) : ''}</div>
        </td>
        <td style="font-size: 0.85rem;">${escapeHtml(w.date)}</td>
        <td>
          <a href="${pdfUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-outline" style="color: #ea580c;">
            <i class="fa-solid fa-file-pdf"></i> ${escapeHtml(String(w.pdf_filename || '').split('/').pop())}
          </a>
        </td>
        <td style="font-weight: 600;">${w.views && w.views !== '—' ? escapeHtml(w.views) : '—'}</td>
        <td>
          <div class="table-actions">
            <a href="${pdfUrl}" target="_blank" rel="noopener" class="action-btn" title="PDF पहा">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
            <button class="action-btn" title="अंक संपादित करा" onclick="openEditWeeklyModal(${w.issue_no})">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-btn delete-btn" title="अंक हटवा" onclick="confirmDeleteWeekly(${w.issue_no})">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// The weekly form is used for a NEW issue and for EDITING one: the title, the number field and the save button follow the mode
function setWeeklyFormMode(issueNo) {
  appState.editingWeeklyNo = issueNo;
  const editing = issueNo !== null;
  appState.weeklyPdfChosen = editing;
  setFormLang('weekly-modal', 'mr');
  document.getElementById('weekly-modal-title').innerHTML = editing
    ? `<i class="fa-solid fa-pen-to-square"></i> साप्ताहिक अंक संपादित करा (क्र. ${issueNo})`
    : '<i class="fa-solid fa-file-pdf"></i> साप्ताहिक ई-पेपर व PDF अपलोड';
  document.getElementById('form-weekly-no').readOnly = editing;      // the number is the key of the issue (its PDF is lokmangal-weekly-<no>.pdf)
  document.getElementById('form-weekly-no-hint').innerHTML = editing
    ? 'संपादन करताना क्रमांक बदलता येत नाही (PDF चे नाव त्यावर अवलंबून आहे). दुसरा क्रमांक हवा असेल तर नवीन अंक जोडा.'
    : 'पुढचा क्रमांक आपोआप येतो. साईटवर क्रमांक दिसत नाही, तारीख दिसते — सर्वात नवीन तारीख असलेला अंक "नवीनतम अंक" होतो.';
  document.getElementById('btn-save-weekly').innerHTML = editing
    ? '<i class="fa-solid fa-check"></i> बदल जतन करा'
    : '<i class="fa-solid fa-cloud-arrow-up"></i> अंक जतन व प्रकाशित करा';
}

// Edit an issue that is already published: the form opens filled with what is saved (number, date, headline, cover, PDF, text).
// Saving replaces that issue (same number) - the website shows the change at once.
function openEditWeeklyModal(issueNo) {
  const w = (appState.weekly || []).find((x) => Number(x.issue_no) === Number(issueNo));
  if (!w) return;
  setWeeklyFormMode(w.issue_no);
  document.getElementById('form-weekly-no').value = w.issue_no;
  const dateField = document.getElementById('form-weekly-date');
  const imgField = document.getElementById('form-weekly-image');
  dateField.value = w.date || '';
  document.getElementById('form-weekly-title').value = w.title || '';
  imgField.value = w.image || '';
  document.getElementById('form-weekly-pdffilename').value = w.pdf_filename || `lokmangal-weekly-${w.issue_no}.pdf`;
  document.getElementById('weekly-pdf-filename-display').innerHTML =
    `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> ${escapeHtml(String(w.pdf_filename || '').split('/').pop())} — सध्याची फाईल (बदलायची असेल तरच नवीन PDF निवडा)`;
  document.getElementById('form-weekly-desc').value = w.description || '';
  document.getElementById('form-weekly-title-en').value = w.title_en || '';
  document.getElementById('form-weekly-desc-en').value = w.description_en || '';
  // what is saved is real: a PDF chosen now must not silently replace the date or the cover
  dateField.dataset.auto = '';
  imgField.dataset.auto = '';
  imgField.oninput = () => { imgField.dataset.auto = ''; showWeeklyCoverPreview(imgField.value); };
  dateField.oninput = () => { dateField.dataset.auto = ''; };
  showWeeklyCoverPreview(w.image || '');
  document.getElementById('weekly-modal').classList.add('open');
}

function openNewWeeklyModal() {
  // The next number is worked out from the issues that are saved. Without that list it would be "1" - and saving
  // "1" replaces the real first issue. So the form does not open until the list has really been loaded.
  if (!appState.weeklyLoaded) {
    showToast('अंकांची यादी अजून लोड झाली नाही — बॅकएंड तपासा आणि "पुन्हा तपासा" दाबा, मग नवीन अंक जोडा.', 'error');
    return;
  }
  setWeeklyFormMode(null);
  // Suggest next issue number (the first issue of an empty Weekly Edition is number 1)
  const maxIssue = appState.weekly && appState.weekly.length ? Math.max(...appState.weekly.map(w => w.issue_no)) : 0;
  const nextIssue = maxIssue + 1;

  document.getElementById('form-weekly-no').value = nextIssue;
  document.getElementById('form-weekly-title').value = '';   // the headline of the issue is written for each issue
  const imgField = document.getElementById('form-weekly-image');
  const dateField = document.getElementById('form-weekly-date');
  imgField.value = 'assets/images/lokmangal_what_we_do.jpg';
  document.getElementById('form-weekly-pdffilename').value = `lokmangal-weekly-${nextIssue}.pdf`;
  document.getElementById('weekly-pdf-filename-display').innerHTML = `PDF फाईल निवडा किंवा ड्रॅग करा (lokmangal-weekly-${nextIssue}.pdf)`;
  document.getElementById('form-weekly-desc').value = '';   // no ready-made text: the introduction is written for each issue
  document.getElementById('form-weekly-title-en').value = '';
  document.getElementById('form-weekly-desc-en').value = '';

  dateField.value = '';          // an empty field is filled with today's date by initDateDisplay
  initDateDisplay();
  // the cover and the date are SUGGESTIONS until the owner types / chooses them: the PDF then fills them in (see handleWeeklyPdfUpload)
  imgField.dataset.auto = '1';
  dateField.dataset.auto = '1';
  imgField.oninput = () => { imgField.dataset.auto = ''; showWeeklyCoverPreview(imgField.value); };
  dateField.oninput = () => { dateField.dataset.auto = ''; };
  showWeeklyCoverPreview('');    // the default picture is a placeholder: no preview until a real cover exists
  document.getElementById('weekly-modal').classList.add('open');
}

// ---- the DATE and the COVER of an issue come from its PDF ---------------------------------------------------------
// The date is read from the file name ("Lokmangal Saptahik 26 August 2026.pdf" -> "२६ ऑगस्ट २०२६"); the cover is the first
// page of the PDF, drawn with pdf.js (the library the website's reader uses), saved as a JPEG and uploaded like any image.
const WEEKLY_MONTHS_EN = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKLY_MONTHS_MR = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
const ADMIN_PDFJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
let adminPdfjsPromise = null;

function weeklyDateFromFileName(fileName) {
  const m = String(fileName || '').match(/(\d{1,2})\s*([A-Za-z]+)\.?\s*(\d{4})/);
  if (!m) return '';
  const month = WEEKLY_MONTHS_EN.indexOf(m[2].slice(0, 3).toLowerCase());
  const day = Number(m[1]), year = Number(m[3]);
  if (month < 0 || day < 1 || day > 31) return '';
  if (new Date(year, month, day).getMonth() !== month) return '';          // 31 February is not a date
  const dev = (n) => String(n).replace(/\d/g, (d) => '०१२३४५६७८९'[d]);
  return `${dev(String(day).padStart(2, '0'))} ${WEEKLY_MONTHS_MR[month]} ${dev(year)}`;
}

function loadAdminPdfjs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!adminPdfjsPromise) {
    adminPdfjsPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = ADMIN_PDFJS_BASE + 'pdf.min.js';
      s.integrity = 'sha512-q+4liFwdPC/bNdhUpZx6aXDx/h77yEQtn4I1slHydcbZK34nLaR3cAeYSJshoxIOq3mjEf7xJE8YWIUHMn+oCQ==';   // (the same file the website's reader uses)
      s.crossOrigin = 'anonymous';
      s.referrerPolicy = 'no-referrer';
      s.onload = () => {
        if (!window.pdfjsLib) { adminPdfjsPromise = null; reject(new Error('pdfjs')); return; }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = ADMIN_PDFJS_BASE + 'pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      s.onerror = () => { adminPdfjsPromise = null; reject(new Error('pdfjs-load')); };
      document.head.appendChild(s);
    });
  }
  return adminPdfjsPromise;
}

// first page of a PDF file -> a JPEG File, 800 px wide
async function coverFileFromPdf(pdfFile, name) {
  const pdfjs = await loadAdminPdfjs();
  const pdf = await pdfjs.getDocument({ data: await pdfFile.arrayBuffer() }).promise;
  try {
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 800 / page.getViewport({ scale: 1 }).width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob) throw new Error('canvas');
    return new File([blob], name, { type: 'image/jpeg' });
  } finally {
    pdf.destroy();
  }
}

// small picture of the chosen cover under the cover field
function showWeeklyCoverPreview(url) {
  const img = document.getElementById('weekly-cover-preview');
  if (!img) return;
  const real = url && !/lokmangal_what_we_do\.jpg$/.test(url);
  img.hidden = !real;
  if (real) img.src = formatAssetUrl(url);
}

function closeWeeklyModal() {
  document.getElementById('weekly-modal').classList.remove('open');
}

// Upload Weekly PDF
async function handleWeeklyPdfUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const issueNo = document.getElementById('form-weekly-no').value;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('issue_no', issueNo);

  showToast('PDF फाईल अपलोड होत आहे...', 'info');

  try {
    const res = await apiFetch('/api/upload/pdf', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      appState.weeklyPdfChosen = true;
      // local folder: the file name (the website finds it in assets/pdf/); S3: the full https address of the file
      document.getElementById('form-weekly-pdffilename').value = /^https:\/\//.test(data.url || '') ? data.url : data.filename;
      document.getElementById('weekly-pdf-filename-display').innerHTML = `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> ${escapeHtml(data.filename)} (${Math.round(Number(data.size) / 1024)} KB)`;
      showToast('PDF यशस्वीरीत्या अपलोड झाली!', 'success');

      // the date from the file name and the cover from the first page - unless they were already typed / chosen by hand
      const dateField = document.getElementById('form-weekly-date');
      const fileDate = weeklyDateFromFileName(file.name);
      if (fileDate && dateField.dataset.auto === '1') {
        dateField.value = fileDate;
        dateField.dataset.auto = '1';
        showToast(`तारीख फाईलच्या नावावरून भरली: ${fileDate} (हवी तर बदला)`, 'info');
      }
      const imgField = document.getElementById('form-weekly-image');
      // a new issue: the cover comes from the PDF unless it was chosen by hand; an issue that is being edited already has a real cover: ask first
      let makeCover = imgField.dataset.auto === '1';
      if (!makeCover && appState.editingWeeklyNo !== null &&
          confirm(msg('मुखपृष्ठ नव्या PDF च्या पहिल्या पानावरून बदलायचे का?\n\n(रद्द केल्यास आधीचे मुखपृष्ठ तसेच राहील.)',
                      'Replace the cover with the first page of the new PDF?\n\n(If you cancel, the old cover stays.)'))) {
        makeCover = true;
      }
      if (makeCover) {
        const saveBtn = document.getElementById('btn-save-weekly');
        if (saveBtn) saveBtn.disabled = true;                 // not before the cover is ready, or the issue is saved without it
        try {
          const cover = await coverFileFromPdf(file, `weekly-${issueNo}.jpg`);
          const coverForm = new FormData();
          coverForm.append('file', cover);
          const coverRes = await apiFetch('/api/upload/image', { method: 'POST', body: coverForm });
          const coverData = await coverRes.json();
          if (coverData.success) {
            imgField.value = coverData.url;
            imgField.dataset.auto = '1';
            showWeeklyCoverPreview(coverData.url);
            showToast('मुखपृष्ठ PDF च्या पहिल्या पानावरून तयार केले!', 'success');
          }
        } catch (coverErr) {
          console.warn('Cover from the PDF failed:', coverErr);
          showToast('मुखपृष्ठ आपोआप तयार करता आले नाही — "फोटो निवडा" ने मुखपृष्ठ द्या.', 'info');
        } finally {
          if (saveBtn) saveBtn.disabled = false;
        }
      }
    } else {
      showToast(data.error || 'PDF अपलोड अयशस्वी.', 'error');
    }
  } catch (err) {
    console.error('Error uploading PDF:', err);
    showToast('सर्व्हर त्रुटी: PDF अपलोड होऊ शकली नाही.', 'error');
  }
}

// Upload Weekly Cover
async function handleWeeklyCoverUpload(input) {
  if (!input.files || !input.files[0]) return;
  const formData = new FormData();
  formData.append('file', input.files[0]);

  try {
    const res = await apiFetch('/api/upload/image', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      const imgField = document.getElementById('form-weekly-image');
      imgField.value = data.url;
      imgField.dataset.auto = '';            // chosen by hand: a PDF uploaded later must not replace it
      showWeeklyCoverPreview(data.url);
      showToast('मुखपृष्ठ फोटो अपलोड झाला!', 'success');
    } else {
      showToast(data.error || 'फोटो अपलोड अयशस्वी.', 'error');
    }
  } catch (e) {
    console.error(e);
    showToast('सर्व्हर त्रुटी: फोटो अपलोड होऊ शकला नाही.', 'error');
  }
}

// Submit Weekly Issue
async function handleWeeklyFormSubmit(e) {
  e.preventDefault();

  const issue_no = parseInt(document.getElementById('form-weekly-no').value, 10);
  const date = document.getElementById('form-weekly-date').value.trim();
  const title = document.getElementById('form-weekly-title').value.trim();
  const image = document.getElementById('form-weekly-image').value.trim() || 'assets/images/lokmangal_what_we_do.jpg';
  const pdf_filename = document.getElementById('form-weekly-pdffilename').value.trim() || `lokmangal-weekly-${issue_no}.pdf`;
  const description = document.getElementById('form-weekly-desc').value.trim();

  // A new issue with a number that is already published would REPLACE that issue: ask first
  const existing = appState.editingWeeklyNo === null && (appState.weekly || []).find((x) => Number(x.issue_no) === issue_no);
  if (existing && !confirm(msg(`अंक ${issue_no} (${existing.date}) आधीच प्रकाशित आहे.\n\nहा नवीन अंक त्याच्या जागी ठेवायचा का? (जुना अंक बदलला जाईल.)\n\nवेगळा अंक जोडायचा असेल तर "रद्द करा" दाबा आणि क्रमांक बदला.`,
                               `Issue ${issue_no} (${existing.date}) is already published.\n\nShould this new issue take its place? (The old issue will be replaced.)\n\nTo add a different issue, press "Cancel" and change the number.`))) return;

  // No PDF chosen: the issue is saved, but the website can only say "the PDF will be available soon": ask, so it is not forgotten
  if (!appState.weeklyPdfChosen && !confirm(msg('PDF फाईल निवडलेली नाही.\n\nअंक PDF शिवाय प्रकाशित होईल — वेबसाईटवर "या अंकाचा PDF लवकरच उपलब्ध होईल" असे दिसेल. तरी जतन करायचे का?\n\n(PDF नंतर जोडायची असेल तर: अंकाच्या ओळीतील ✏️ संपादन बटण → PDF निवडा.)',
                                                'No PDF file has been chosen.\n\nThe issue will be published without a PDF — the website will say "the PDF of this issue will be available soon". Save anyway?\n\n(To add the PDF later: the ✏️ edit button in the issue\'s row → choose the PDF.)'))) return;

  const payload = {
    issue_no,
    date,
    title,
    image,
    pdf_filename,
    views: '—',            // nothing counts the readers of a PDF; the website shows no number for it
    description,
    title_en: document.getElementById('form-weekly-title-en').value.trim(),
    description_en: document.getElementById('form-weekly-desc-en').value.trim()
  };

  const btn = document.getElementById('btn-save-weekly');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> अपलोड होत आहे...';

  try {
    const res = await apiFetch('/api/weekly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(appState.editingWeeklyNo !== null ? 'अंकातील बदल जतन झाले!' : 'साप्ताहिक अंक यशस्वीरीत्या प्रकाशित झाला!', 'success');
      warnIfEnglishNotSaved(data);
      closeWeeklyModal();
      await fetchWeekly();
      await fetchStats();
    } else {
      showToast(data.error || 'त्रुटी आली.', 'error');
    }
  } catch (err) {
    console.error('Error saving weekly:', err);
    showToast('सर्व्हर त्रुटी: अंक जतन होऊ शकला नाही.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = appState.editingWeeklyNo !== null
      ? '<i class="fa-solid fa-check"></i> बदल जतन करा'
      : '<i class="fa-solid fa-cloud-arrow-up"></i> अंक जतन व प्रकाशित करा';
  }
}

// Delete Weekly Issue
async function confirmDeleteWeekly(issueNo) {
  const known = (appState.weekly || []).find((x) => Number(x.issue_no) === Number(issueNo));
  const what = known && known.date ? `अंक ${issueNo} (${known.date})` : `अंक ${issueNo}`;
  const whatEn = known && known.date ? `issue ${issueNo} (${typeof window.trUI === 'function' ? window.trUI(known.date) : known.date})` : `issue ${issueNo}`;
  if (!confirm(msg(`तुम्हाला खात्री आहे की ${what} हटवायचा आहे?\n\nहा अंक वेबसाईटवरूनही निघून जाईल. (त्याची PDF फाईल व मुखपृष्ठ फोटो assets फोल्डरमध्ये तसेच राहतात.)`,
                   `Are you sure you want to delete ${whatEn}?\n\nThe issue will also disappear from the website. (Its PDF file and cover photo stay in the assets folder.)`))) return;

  try {
    const res = await apiFetch(`/api/weekly/${issueNo}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`अंक ${issueNo} हटवला!`, 'success');
      await fetchWeekly();
      await fetchStats();
    } else {
      showToast(data.error || 'हटवणे अयशस्वी.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('सर्व्हर त्रुटी: अंक हटवता आला नाही.', 'error');
  }
}

// -------------------------------------------------------------
// Utilities: Toast
// -------------------------------------------------------------
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle');
  const iconEl = document.createElement('i');
  iconEl.className = `fa-solid ${icon}`;
  const text = document.createElement('span');
  text.textContent = String(message == null ? '' : message);          // (a message may carry text from the server: never as HTML)
  toast.append(iconEl, text);

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Text for HTML (element content and attribute values): & < > " ' become entities, so a title like  'लोकमंगल' & "विवाह" <b>  shows as typed
// ---- Ctrl + B in a story box: the selected words (or lines) become bold ---------------------------------------------------------------------
// The story boxes are plain text; bold is written between ** **. Ctrl+B puts them around the selection (every line of it on its own), or takes them
// off again when the selection is already bold; with nothing selected the word at the cursor is used. The ** become <strong> when the story is saved.
function toggleBoldInStoryBox(box) {
  let start = box.selectionStart, end = box.selectionEnd;
  const text = box.value;
  if (start === end) {                                            // nothing selected: the word under the cursor
    while (start > 0 && !/\s/.test(text[start - 1])) start--;
    while (end < text.length && !/\s/.test(text[end])) end++;
    if (start === end) return;
  }
  if (text.slice(start - 2, start) === '**' && text.slice(end, end + 2) === '**') { start -= 2; end += 2; }   // the ** right around the selection belong to it
  const lines = text.slice(start, end).split('\n');
  const filled = lines.filter((l) => l.trim());
  const allBold = filled.length > 0 && filled.every((l) => /^\s*\*\*[^*]+\*\*\s*$/.test(l));
  const changed = lines.map((l) => {
    if (!l.trim()) return l;
    const m = l.match(/^(\s*)([\s\S]*?)(\s*)$/);                  // the spaces stay outside the **
    return allBold ? m[1] + m[2].replace(/^\*\*|\*\*$/g, '') + m[3] : m[1] + '**' + m[2].replace(/\*\*/g, '') + '**' + m[3];
  }).join('\n');
  box.focus();
  box.setSelectionRange(start, end);
  if (!document.execCommand || !document.execCommand('insertText', false, changed)) box.setRangeText(changed, start, end, 'select');   // (insertText keeps Ctrl+Z working)
  box.setSelectionRange(start, start + changed.length);
  box.dispatchEvent(new Event('input', { bubbles: true }));
}

document.addEventListener('keydown', (e) => {
  const isB = (e.key || '').toLowerCase() === 'b' || e.code === 'KeyB';                    // (a Marathi keyboard layout sends another letter as e.key)
  if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && isB && /^form-article-content(-en)?$/.test((e.target && e.target.id) || '')) {
    e.preventDefault();
    toggleBoldInStoryBox(e.target);
  }
});

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
