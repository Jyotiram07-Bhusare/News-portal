// =====================================================================================================================
// Admin Panel > Comments (प्रतिक्रिया): what readers write under news, blogs and weekly issues.
// Read them (all, or only the ones readers reported), open the story they are under, delete the bad ones.
// A reply is listed like any comment; deleting a comment deletes its replies, their likes / dislikes and their reports.
// =====================================================================================================================
const COMMENTS_PAGE = 50;            // rows asked from the API at a time (it allows up to 100)
const COMMENTS_FRESH_MS = 60000;     // the section is not loaded again when it is opened within this time
let commentsBusy = false;
let commentsLoadedAt = 0;

const commentEl = (id) => document.getElementById(id);

// "26 Oct 2026, 4:18 pm" in the panel's language (the API sends UTC)
function commentWhen(iso) {
  const at = new Date(iso);
  if (isNaN(at.getTime())) return '';
  return at.toLocaleString(msg('mr-IN', 'en-IN'), { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// how the reader signed in (the e-mail address of a Google / e-mailed-code reader is proven, a guest's is only what was typed)
function commentProvider(c) {
  if (c.provider === 'google') return 'Google';
  if (c.provider === 'email') return msg('ईमेल कोड', 'Email code');
  if (c.provider === 'guest') return msg('साइन इन न करता', 'No login');
  return '';
}

// what the comment is under, in words
function commentItemKind(c) {
  if (c.item_type === 'weekly') return msg('साप्ताहिक अंक', 'Weekly issue');
  if (c.item_category === 'blogs') return msg('ब्लॉग', 'Blog');
  if (c.item_category === 'review') return msg('रिव्ह्यू', 'Review');
  return msg('बातमी', 'News');
}

// one page of the list: `more` adds the next page to the rows already there, `size` asks for that many rows from the start
async function fetchComments(more, size) {
  if (commentsBusy) return;
  commentsBusy = true;
  const loaded = appState.comments.length;
  const offset = more ? loaded : 0;
  const limit = Math.min(100, size || COMMENTS_PAGE);
  try {
    const res = await apiFetch(`/api/admin/comments?filter=${appState.commentsFilter}&limit=${limit}&offset=${offset}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.comments)) {
      appState.comments = more ? appState.comments.concat(data.comments) : data.comments;
      appState.commentsTotal = data.total;
      appState.commentsReported = data.reported_total;
      appState.commentsLoaded = true;
      appState.commentsFailed = false;
      commentsLoadedAt = Date.now();
    } else if (res.status !== 401) {
      appState.commentsFailed = true;
    }
  } catch (err) {
    console.error('Error fetching comments:', err);
    appState.commentsFailed = true;
  }
  commentsBusy = false;
  renderCommentsTable();
}

function renderCommentsTable() {
  const tbody = commentEl('comments-table-body');
  if (!tbody) return;

  const badge = commentEl('sidebar-comments-count');
  if (badge && appState.commentsLoaded) badge.textContent = appState.commentsTotal;
  const reported = commentEl('comments-reported-count');
  if (reported && appState.commentsLoaded) reported.textContent = appState.commentsReported;

  const more = commentEl('comments-more');
  const list = appState.comments || [];
  const shownOf = appState.commentsFilter === 'reported' ? appState.commentsReported : appState.commentsTotal;
  if (more) more.hidden = !(appState.commentsLoaded && list.length < shownOf);

  if (!appState.commentsLoaded) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 30px;">${appState.commentsFailed
      ? 'प्रतिक्रिया लोड झाल्या नाहीत — बॅकएंड तपासा आणि "रिफ्रेश करा" दाबा.' : 'लोड होत आहे...'}</td></tr>`;
    return;
  }
  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 36px; color: var(--text-muted);">
          <i class="fa-regular fa-comments" style="font-size: 1.8rem; margin-bottom: 8px; display: block;"></i>
          ${appState.commentsFilter === 'reported' ? 'तक्रार आलेली एकही प्रतिक्रिया नाही.' : 'अजून एकही प्रतिक्रिया नाही.'}
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = list.map((c) => `
      <tr class="${c.reports > 0 ? 'comment-row-reported' : ''}">
        <td>
          <div class="comment-who">
            <strong data-no-i18n>${escapeHtml(c.name)}</strong>
            ${c.email ? `<a class="comment-email" href="mailto:${escapeHtml(c.email)}" data-no-i18n>${escapeHtml(c.email)}</a>` : ''}
            ${c.provider ? `<span class="comment-tag${c.provider === 'guest' ? ' is-guest' : ''}" data-no-i18n>${escapeHtml(commentProvider(c))}</span>` : ''}
            ${c.parent_id ? '<span class="comment-tag">उत्तर</span>' : ''}
            <span class="comment-time" data-no-i18n>${escapeHtml(commentWhen(c.created_at))}</span>
          </div>
          <div class="comment-body" data-no-i18n>${escapeHtml(c.body)}</div>
        </td>
        <td>
          <div class="comment-item-title" data-no-i18n>${escapeHtml(c.item_title || '—')}</div>
          <div class="comment-item-meta">
            <span class="comment-tag">${commentItemKind(c)}</span>
            ${c.item_url ? `<a href="${escapeHtml(c.item_url)}" target="_blank" rel="noopener noreferrer" class="comment-open">पाहा <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
          </div>
        </td>
        <td>
          <div class="comment-stats">
            <span title="आवडले"><i class="fa-regular fa-thumbs-up"></i> ${c.likes}</span>
            <span title="आवडले नाही"><i class="fa-regular fa-thumbs-down"></i> ${c.dislikes}</span>
            ${c.parent_id ? '' : `<span title="उत्तरे"><i class="fa-regular fa-comment"></i> ${c.replies_count || 0}</span>`}
            <span class="comment-reports${c.reports > 0 ? ' is-hot' : ''}" title="तक्रारी"><i class="fa-regular fa-flag"></i> ${c.reports}</span>
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="action-btn delete-btn" title="प्रतिक्रिया हटवा" aria-label="प्रतिक्रिया हटवा" onclick="confirmDeleteComment(${c.id})">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>`).join('');
}

// ---- the buttons of the section -------------------------------------------------------------------------------------
function commentsTabOpened() {
  if (!appState.commentsLoaded || Date.now() - commentsLoadedAt > COMMENTS_FRESH_MS) fetchComments(false);
}

function setCommentsFilter(filter) {
  appState.commentsFilter = filter === 'reported' ? 'reported' : 'all';
  document.querySelectorAll('.comment-tab').forEach((tab) => {
    const on = tab.dataset.filter === appState.commentsFilter;
    tab.classList.toggle('active', on);
    tab.setAttribute('aria-selected', String(on));
  });
  appState.comments = [];
  appState.commentsLoaded = false;
  renderCommentsTable();
  fetchComments(false);
}

function refreshComments() {
  fetchComments(false, Math.max(COMMENTS_PAGE, appState.comments.length));
}

function loadMoreComments() {
  fetchComments(true);
}

async function confirmDeleteComment(id) {
  const c = (appState.comments || []).find((x) => Number(x.id) === Number(id));
  if (!c) return;
  if (!confirm(msg('ही प्रतिक्रिया व तिची सर्व उत्तरे कायमची हटवायची?', 'Delete this comment and all its replies for good?') + `\n\n${c.name}: "${c.body.length > 160 ? c.body.slice(0, 160) + '…' : c.body}"`)) return;
  try {
    const res = await apiFetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('प्रतिक्रिया हटवली!', 'success');
      appState.comments = appState.comments.filter((x) => x.id !== c.id && x.parent_id !== c.id);
      commentsBusy = false;
      await fetchComments(false, Math.max(COMMENTS_PAGE, appState.comments.length));      // the rows and the numbers, as the server has them now
    } else if (res.status !== 401) {
      showToast(data.error || 'हटवणे अयशस्वी.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('सर्व्हर त्रुटी: प्रतिक्रिया हटवता आली नाही.', 'error');
  }
}
