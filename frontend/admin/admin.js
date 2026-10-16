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
  editingArticleId: null
};

// Where the Python backend lives (js/config.js). "" = same address as this page.
const API_BASE = (window.LOKMANGAL_CONFIG && window.LOKMANGAL_CONFIG.API_BASE) || '';
const apiFetch = (path, options) => fetch(API_BASE + path, options);

// URL Helpers for consistent assets
function formatAssetUrl(url) {
  if (!url) return '/assets/images/lokmangal_what_we_do.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return url;
  if (url.startsWith('../')) return '/' + url.replace(/^\.\.\//, '');
  return '/' + url;
}

function formatPdfUrl(filename) {
  if (!filename) return '#';
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
  if (filename.startsWith('/')) return filename;
  if (filename.startsWith('../')) return '/' + filename.replace(/^\.\.\//, '');
  if (filename.startsWith('assets/pdf/')) return '/' + filename;
  return '/assets/pdf/' + filename;
}

// -------------------------------------------------------------
// Initialization on DOMContentLoaded
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initDateDisplay();
  loadAllData();
});

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

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Sidebar collapse toggle
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // URL Hash routing
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'articles') switchTab('tab-articles');
    else if (hash === 'weekly') switchTab('tab-weekly');
    else if (hash === 'media') switchTab('tab-media');
    else switchTab('tab-dashboard');
  });

  if (window.location.hash) {
    const h = window.location.hash.replace('#', '');
    if (h === 'articles') switchTab('tab-articles');
    else if (h === 'weekly') switchTab('tab-weekly');
    else if (h === 'media') switchTab('tab-media');
  }
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
    'tab-media': 'मीडिया लायब्ररी (Media)'
  };
  if (breadcrumb) breadcrumb.textContent = names[tabId] || 'डॅशबोर्ड';

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');

  // Trigger loads if needed
  if (tabId === 'tab-media') {
    loadMediaData();
  }
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
// Sidebar footer: the real state of the backend (address + MySQL), asked from /api/health
async function checkServerStatus() {
  const dot = document.getElementById('server-status-dot');
  const text = document.getElementById('server-status-text');
  const box = document.getElementById('server-status');
  if (!dot || !text) return;
  let where = window.location.host;
  try { if (API_BASE) where = new URL(API_BASE).host; } catch (e) { /* keep the page's own address */ }
  const show = (state, label, tip) => {
    dot.className = 'status-indicator-dot ' + state;
    text.textContent = `${where} • ${label}`;
    if (box) box.title = tip || '';
  };
  try {
    const res = await apiFetch('/api/health');
    const data = await res.json();
    if (res.ok && data.success) show('online', 'सुरू', 'MySQL database: ' + data.database);
    else show('offline', 'MySQL बंद', data.error || '');
  } catch (err) {
    show('offline', 'बंद (बॅकएंड चालू नाही)', String(err));
  }
}

async function loadAllData() {
  await Promise.all([
    checkServerStatus(),
    fetchStats(),
    fetchArticles(),
    fetchWeekly()
  ]);
}

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
      renderWeeklyTable();
      renderRecentWeekly();
      updateBadgeCounts();
    }
  } catch (err) {
    console.error('Error fetching weekly:', err);
  }
}

function updateBadgeCounts() {
  const aCount = document.getElementById('sidebar-articles-count');
  if (aCount) aCount.textContent = appState.articles.length;

  const wCount = document.getElementById('sidebar-weekly-count');
  if (wCount) wCount.textContent = appState.weekly.length;
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
      leadEl.innerHTML = `<i class="fa-solid fa-star" style="color:#eab308; margin-right:4px;"></i> ${escapeHtml(s.current_lead.title)}`;
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
      <img src="${formatAssetUrl(a.image)}" class="recent-thumb" alt="${a.title}">
      <div class="recent-body">
        <h4 class="recent-title">${a.title}</h4>
        <div class="recent-meta">
          <span class="category-pill pill-${a.category}">${a.categoryLabel || a.category}</span>
          <span><i class="fa-regular fa-calendar"></i> ${a.date}</span>
          <span><i class="fa-regular fa-eye"></i> ${a.views}</span>
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
      <img src="${formatAssetUrl(w.image)}" class="recent-thumb" alt="अंक ${w.issue_no}">
      <div class="recent-body">
        <h4 class="recent-title">${w.title}</h4>
        <div class="recent-meta">
          <span class="category-pill pill-weekly">अंक ${w.issue_no}</span>
          <span><i class="fa-regular fa-calendar"></i> ${w.date}</span>
          <span><i class="fa-regular fa-eye"></i> ${w.views}</span>
        </div>
      </div>
      <a href="${formatPdfUrl(w.pdf_filename)}" target="_blank" class="action-btn" title="PDF पहा">
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
      <td style="font-weight: 700; color: var(--text-muted);">${a.id}</td>
      <td>
        <img src="${formatAssetUrl(a.image)}" class="table-thumb" alt="${escapeHtml(a.title)}">
      </td>
      <td>
        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 3px;">${escapeHtml(a.title)}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">by ${escapeHtml(a.author || 'प्रतिनिधी')}</div>
      </td>
      <td>
        <span class="category-pill pill-${a.category}">${a.categoryLabel || a.category}</span>
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
          <button class="action-btn delete-btn" title="हटवा" onclick="confirmDeleteArticle(${a.id}, '${escapeHtml(a.title)}')">
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

  document.getElementById('form-article-author').value = 'विशेष बातमीदार';
  document.getElementById('form-article-views').value = '1.8K';
  document.getElementById('form-article-image').value = 'assets/images/bapu_portrait_lead.jpg';
  updateArticleImgPreview('assets/images/bapu_portrait_lead.jpg');
  document.getElementById('form-article-excerpt').value = '';
  document.getElementById('form-article-content').value = '<p><strong>सोलापूर:</strong> बातमीचा सविस्तर मजकूर येथे लिहा...</p>';
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

  document.getElementById('form-article-author').value = a.author || 'प्रतिनिधी';
  document.getElementById('form-article-date').value = a.date || '';
  document.getElementById('form-article-views').value = a.views || '1.5K';
  document.getElementById('form-article-image').value = a.image || '';
  updateArticleImgPreview(a.image);
  document.getElementById('form-article-excerpt').value = a.excerpt || '';
  document.getElementById('form-article-content').value = a.content || '';
  document.getElementById('btn-save-article').innerHTML = '<i class="fa-solid fa-check"></i> बदल जतन करा';

  document.getElementById('article-modal').classList.add('open');
}

function closeArticleModal() {
  document.getElementById('article-modal').classList.remove('open');
}

function updateArticleImgPreview(url) {
  const img = document.getElementById('article-img-preview');
  if (img) {
    img.src = formatAssetUrl(url);
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

// Auto set category label
function autoSetCategoryLabel() {
  const cat = document.getElementById('form-article-category').value;
  const imgInput = document.getElementById('form-article-image');
  if (!imgInput.value || imgInput.value.includes('unsplash')) {
    if (cat === 'rajkiy') {
      imgInput.value = 'assets/images/bapu_portrait_lead.jpg';
    } else if (cat === 'samajik') {
      imgInput.value = 'assets/images/lokmangal_vivah_01.jpg';
    }
    updateArticleImgPreview(imgInput.value);
  }
}

// Rich Content Helper Tags
function insertContentTag(tag) {
  const textarea = document.getElementById('form-article-content');
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end) || 'येथे मजकूर लिहा';
  const openTag = `<${tag}>`;
  const closeTag = `</${tag}>`;
  const replacement = `${openTag}${selected}${closeTag}`;

  textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
  textarea.focus();
  textarea.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
}

// The content box takes HTML. If the editor typed plain text (no tags at all), turn it into paragraphs so the website
// does not show it as one block: a blank line starts a new paragraph, a single line break becomes <br>.
// Text that already contains HTML tags is kept exactly as typed.
function plainTextToParagraphs(text) {
  if (!text || /<[a-z!\/][^>]*>/i.test(text)) return text;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return text.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\r?\n/g, '<br>')}</p>`).join('\n');
}

// Form Submit: Create or Update Article
async function handleArticleFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('form-article-title').value.trim();
  const category = document.getElementById('form-article-category').value;
  const author = document.getElementById('form-article-author').value.trim();
  const date = document.getElementById('form-article-date').value.trim();
  const views = document.getElementById('form-article-views').value.trim() || '1.5K';
  const image = document.getElementById('form-article-image').value.trim() || 'assets/images/lokmangal_what_we_do.jpg';
  const excerpt = document.getElementById('form-article-excerpt').value.trim();
  const content = plainTextToParagraphs(document.getElementById('form-article-content').value.trim());

  // Placement checkbox states
  const is_lead = document.getElementById('form-article-is-lead')?.checked ? 1 : 0;
  const is_popular = document.getElementById('form-article-is-popular')?.checked ? 1 : 0;
  const is_random = document.getElementById('form-article-is-random')?.checked ? 1 : 0;

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
    author,
    date,
    views,
    image,
    excerpt,
    content
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

// Delete Article with confirmation
async function confirmDeleteArticle(articleId, title) {
  if (!confirm(`तुम्हाला खात्री आहे की ही बातमी हटवायची आहे?\n\n"${title}"`)) {
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
  img.src = (a.image && a.image.startsWith('assets/')) ? `../${a.image}` : a.image;
  
  document.getElementById('prev-content').innerHTML = a.content || `<p>${a.excerpt}</p>`;
  document.getElementById('preview-modal').classList.add('open');
}

function previewArticleBeforeSubmit() {
  const title = document.getElementById('form-article-title').value.trim() || 'नमुना शीर्षक';
  const cat = document.getElementById('form-article-category').value;
  const author = document.getElementById('form-article-author').value.trim() || 'प्रतिनिधी';
  const date = document.getElementById('form-article-date').value.trim() || 'आज';
  const image = document.getElementById('form-article-image').value.trim() || 'assets/images/bapu_portrait_lead.jpg';
  const content = plainTextToParagraphs(document.getElementById('form-article-content').value.trim()) || '<p>बातमी मजकूर...</p>';

  document.getElementById('prev-badge').textContent = cat;
  document.getElementById('prev-title').textContent = title;
  document.getElementById('prev-author').textContent = author;
  document.getElementById('prev-date').textContent = date;
  document.getElementById('prev-views').textContent = '१.२K वाचक';

  const img = document.getElementById('prev-img');
  img.src = formatAssetUrl(image);

  document.getElementById('prev-content').innerHTML = content;
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
    const pdfUrl = formatPdfUrl(w.pdf_filename);
    return `
      <tr>
        <td style="font-weight: 800; color: var(--brand-orange);">अंक ${w.issue_no}</td>
        <td>
          <img src="${formatAssetUrl(w.image)}" class="table-thumb" alt="अंक ${w.issue_no}">
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${w.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${w.description ? w.description.slice(0, 75) + '...' : ''}</div>
        </td>
        <td style="font-size: 0.85rem;">${w.date}</td>
        <td>
          <a href="${pdfUrl}" target="_blank" class="btn btn-sm btn-outline" style="color: #ea580c;">
            <i class="fa-solid fa-file-pdf"></i> ${w.pdf_filename}
          </a>
        </td>
        <td style="font-weight: 600;">${w.views || '15K'}</td>
        <td>
          <div class="table-actions">
            <a href="${pdfUrl}" target="_blank" class="action-btn" title="PDF पहा">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
            <button class="action-btn delete-btn" title="अंक हटवा" onclick="confirmDeleteWeekly(${w.issue_no})">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openNewWeeklyModal() {
  // Suggest next issue number (the first issue of an empty Weekly publication is number 1)
  const maxIssue = appState.weekly && appState.weekly.length ? Math.max(...appState.weekly.map(w => w.issue_no)) : 0;
  const nextIssue = maxIssue + 1;

  document.getElementById('form-weekly-no').value = nextIssue;
  document.getElementById('form-weekly-title').value = `लोकमंगल साप्ताहिक विशेषांक (अंक ${nextIssue}): '...'`;
  document.getElementById('form-weekly-image').value = 'assets/images/lokmangal_what_we_do.jpg';
  document.getElementById('form-weekly-pdffilename').value = `lokmangal-weekly-${nextIssue}.pdf`;
  document.getElementById('weekly-pdf-filename-display').innerHTML = `PDF फाईल निवडा किंवा ड्रॅग करा (lokmangal-weekly-${nextIssue}.pdf)`;
  document.getElementById('form-weekly-desc').value = 'शेतकरी समृद्धी, आधुनिक तंत्रज्ञान आणि स्थानिक घडामोडींचा विशेष डिजिटल ई-पेपर.';

  initDateDisplay();
  document.getElementById('weekly-modal').classList.add('open');
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
      document.getElementById('form-weekly-pdffilename').value = data.filename;
      document.getElementById('weekly-pdf-filename-display').innerHTML = `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> ${data.filename} (${Math.round(data.size / 1024)} KB)`;
      showToast('PDF यशस्वीरीत्या अपलोड झाली!', 'success');
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
      document.getElementById('form-weekly-image').value = data.url;
      showToast('मुखपृष्ठ फोटो अपलोड झाला!', 'success');
    }
  } catch (e) {
    console.error(e);
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

  const payload = {
    issue_no,
    date,
    title,
    image,
    pdf_filename,
    views: '16.5K',
    description
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
      showToast('साप्ताहिक अंक यशस्वीरीत्या प्रकाशित झाला!', 'success');
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
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> अंक जतन व प्रकाशित करा';
  }
}

// Delete Weekly Issue
async function confirmDeleteWeekly(issueNo) {
  if (!confirm(`तुम्हाला खात्री आहे की अंक ${issueNo} हटवायचा आहे?`)) return;

  try {
    const res = await apiFetch(`/api/weekly/${issueNo}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast(`अंक ${issueNo} हटवला!`, 'success');
      await fetchWeekly();
      await fetchStats();
    }
  } catch (err) {
    console.error(err);
  }
}

// -------------------------------------------------------------
// Media Library
// -------------------------------------------------------------
async function loadMediaData() {
  try {
    const res = await apiFetch('/api/media');
    const data = await res.json();
    if (data.success) {
      renderMedia(data.images, data.pdfs);
    }
  } catch (err) {
    console.error('Error loading media:', err);
  }
}

function renderMedia(images, pdfs) {
  const imgCount = document.getElementById('media-images-count');
  if (imgCount) imgCount.textContent = images.length;

  const pdfCount = document.getElementById('media-pdfs-count');
  if (pdfCount) pdfCount.textContent = pdfs.length;

  const imgGrid = document.getElementById('media-images-grid');
  if (imgGrid) {
    imgGrid.innerHTML = images.map(img => `
      <div class="media-card">
        <img src="${formatAssetUrl(img.url)}" class="media-card-img" alt="${img.filename}">
        <div class="media-card-body">
          <div class="media-card-name" title="${img.filename}">${img.filename}</div>
          <div class="media-card-size">${Math.round(img.size / 1024)} KB</div>
          <div class="media-card-actions">
            <button class="btn btn-sm btn-outline" onclick="copyToClipboard('${img.url}')" title="URL कॉपी करा">
              <i class="fa-regular fa-copy"></i> कॉपी मार्ग
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  const pdfGrid = document.getElementById('media-pdfs-grid');
  if (pdfGrid) {
    pdfGrid.innerHTML = pdfs.map(pdf => `
      <div class="media-card">
        <div class="media-card-pdf">
          <i class="fa-solid fa-file-pdf"></i>
          <span style="font-weight: 700; font-size: 0.8rem;">PDF दस्तऐवज</span>
        </div>
        <div class="media-card-body">
          <div class="media-card-name" title="${pdf.filename}">${pdf.filename}</div>
          <div class="media-card-size">${Math.round(pdf.size / 1024)} KB</div>
          <div class="media-card-actions">
            <a href="${formatPdfUrl(pdf.url)}" target="_blank" class="btn btn-sm btn-outline">
              <i class="fa-regular fa-eye"></i> उघडा
            </a>
            <button class="btn btn-sm btn-outline" onclick="copyToClipboard('${pdf.url}')" title="URL कॉपी करा">
              <i class="fa-regular fa-copy"></i> कॉपी
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function toggleMediaTab(type) {
  const btnImgs = document.getElementById('btn-show-images');
  const btnPdfs = document.getElementById('btn-show-pdfs');
  const gridImgs = document.getElementById('media-images-grid');
  const gridPdfs = document.getElementById('media-pdfs-grid');

  if (type === 'images') {
    btnImgs.classList.add('active');
    btnPdfs.classList.remove('active');
    gridImgs.style.display = 'grid';
    gridPdfs.style.display = 'none';
  } else {
    btnPdfs.classList.add('active');
    btnImgs.classList.remove('active');
    gridPdfs.style.display = 'grid';
    gridImgs.style.display = 'none';
  }
}

async function handleMediaQuickUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const isPdf = file.name.toLowerCase().endsWith('.pdf');
  const endpoint = isPdf ? '/api/upload/pdf' : '/api/upload/image';

  const formData = new FormData();
  formData.append('file', file);

  showToast('फाईल अपलोड होत आहे...', 'info');

  try {
    const res = await apiFetch(endpoint, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      showToast('फाईल यशस्वीरीत्या अपलोड झाली!', 'success');
      loadMediaData();
    } else {
      showToast(data.error || 'अपलोड अयशस्वी.', 'error');
    }
  } catch (err) {
    showToast('अपलोड त्रुटी.', 'error');
  }
}

// -------------------------------------------------------------
// Utilities: Toast & Clipboard
// -------------------------------------------------------------
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`मार्ग कॉपी झाला: ${text}`, 'success');
  }).catch(() => {
    showToast('कॉपी करणे अयशस्वी.', 'error');
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle');
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
