/**
 * LOKMANGAL ADMIN PANEL — VIDEOS
 * Sidebar > "व्हिडिओ अपलोड": the owner uploads a video file together with its title. The website's "Featured Videos" widget lists it
 * (newest first) and PLAYS THE FILE ITSELF.
 *
 * Uses the helpers of admin.js (apiFetch, API_BASE, appState, showToast, escapeHtml, msg, setFormLang, updateLangDots, formatAssetUrl).
 *  - The file is chosen in the form and uploaded when the form is saved (with a progress bar), so cancelling leaves nothing behind.
 *  - While it is chosen the browser reads the length of the video and takes one picture from it: that picture is the thumbnail of the
 *    website's card (uploaded as a normal image, assets/images/video-poster_<time>.jpg).
 *  - Page texts are translated by admin-i18n.js; texts that are not page text (confirm dialogs) use msg(marathi, english).
 */

const VIDEO_EXTENSIONS = ['mp4', 'm4v', 'mov', 'webm', 'ogv'];
const VIDEO_DEV_DIGITS = '०१२३४५६७८९';
const VIDEO_MONTHS_MR = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];

// the working state of the open form
const videoForm = {
  file: null,        // the File chosen in this form (a new video, or the replacement of the saved one)
  url: '',           // blob: address of that file (preview), released when it is replaced or the form closes
  duration: null,    // seconds, null = the browser could not tell
  poster: null,      // JPEG Blob taken from the video, null = none
  broken: false,     // the browser cannot play the file
  saving: false,
  cancelled: false,  // the owner closed the form while it was saving: nothing more is saved
  probing: null,     // the promise of the file being read (length, picture) while that is still going on
  link: null,        // { url, yt, thumb } while the link field holds a link the website can play (a link instead of a file)
  xhr: null,         // the running upload (cancel = abort)
  run: 0             // counts the chosen files: the late answer for an older file is ignored
};

const videoEl = (id) => document.getElementById(id);

function videoSize(bytes) {
  const b = Number(bytes);
  if (!isFinite(b) || b <= 0) return '—';
  return b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
}

function videoLength(sec) {
  if (sec === null || sec === undefined || sec === '' || !isFinite(Number(sec))) return '—';
  const s = Math.max(0, Math.round(Number(sec)));
  const two = (n) => String(n).padStart(2, '0');
  const h = Math.floor(s / 3600);
  return h ? `${h}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}` : `${two(Math.floor(s / 60))}:${two(s % 60)}`;
}

// "२६ ऑगस्ट २०२६" from the database's UTC time (admin-i18n.js shows it as "26 August 2026" in English)
function videoDate(createdAt) {
  const d = createdAt ? new Date(String(createdAt).replace(' ', 'T') + 'Z') : null;
  if (!d || isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${VIDEO_MONTHS_MR[d.getMonth()]} ${d.getFullYear()}`.replace(/\d/g, (x) => VIDEO_DEV_DIGITS[x]);
}

// ------------------------------------------------------------------------------------------------ the list
async function fetchVideos() {
  try {
    const res = await apiFetch('/api/videos');
    const data = await res.json();
    if (data.success && Array.isArray(data.videos)) {
      appState.videos = data.videos;
      appState.videosLoaded = true;
      appState.videosFailed = false;
    } else {
      appState.videosFailed = true;
    }
  } catch (err) {
    console.error('Error fetching videos:', err);
    appState.videosFailed = true;
  }
  renderVideosTable();
  updateBadgeCounts();
}

function renderVideosTable() {
  const tbody = videoEl('videos-table-body');
  if (!tbody) return;

  if (!appState.videosLoaded) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">${appState.videosFailed
      ? 'व्हिडिओंची यादी लोड झाली नाही — बॅकएंड तपासा आणि "पुन्हा तपासा" दाबा.' : 'लोड होत आहे...'}</td></tr>`;
    return;
  }
  const list = appState.videos || [];
  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 36px; color: var(--text-muted);">
          <i class="fa-solid fa-film" style="font-size: 1.8rem; margin-bottom: 8px; display: block;"></i>
          अजून एकही व्हिडिओ अपलोड केलेला नाही.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = list.map((v, i) => {
    const file = escapeHtml(formatAssetUrl(v.video_url));
    const thumb = v.thumbnail
      ? `<img src="${escapeHtml(formatAssetUrl(v.thumbnail))}" class="table-thumb video-table-thumb" alt="" data-no-i18n>`
      : '<div class="table-thumb video-table-thumb video-thumb-empty"><i class="fa-solid fa-film"></i></div>';
    const desc = v.description ? (v.description.length > 75 ? v.description.slice(0, 75) + '…' : v.description) : '';
    return `
      <tr>
        <td><div class="video-thumb-wrap">${thumb}<span class="video-order-badge" title="क्रम क्रमांक">${v.sort_order || i + 1}</span><span class="video-thumb-play"><i class="fa-solid fa-play"></i></span></div></td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);" data-no-i18n>${escapeHtml(v.title)}${v.title_en ? ' <span class="lang-badge" title="English आवृत्ती आहे">EN</span>' : ''}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);" data-no-i18n>${escapeHtml(desc)}</div>
        </td>
        <td style="font-size: 0.85rem;">${videoLength(v.duration_sec)}</td>
        <td style="font-size: 0.85rem;">${videoSize(v.size_bytes)}</td>
        <td style="font-size: 0.85rem;">${videoDate(v.created_at)}</td>
        <td>
          <div class="table-actions">
            <a href="${file}" target="_blank" rel="noopener" class="action-btn" title="व्हिडिओ पहा">
              <i class="fa-solid fa-play"></i>
            </a>
            <button class="action-btn" title="व्हिडिओ संपादित करा" onclick="openEditVideoModal(${v.id})">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-btn delete-btn" title="व्हिडिओ हटवा" onclick="confirmDeleteVideo(${v.id})">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ------------------------------------------------------------------------------------------------ the form
function setVideoFormMode(id) {
  appState.editingVideoId = id;
  const editing = id !== null;
  setFormLang('video-modal', 'mr');
  videoEl('video-modal-title').innerHTML = editing
    ? '<i class="fa-solid fa-pen-to-square"></i> व्हिडिओ संपादित करा'
    : '<i class="fa-solid fa-film"></i> नवीन व्हिडिओ अपलोड करा';
  videoEl('btn-save-video').innerHTML = videoSaveButtonHTML();
}

function videoSaveButtonHTML() {
  return appState.editingVideoId !== null
    ? '<i class="fa-solid fa-check"></i> बदल जतन करा'
    : '<i class="fa-solid fa-cloud-arrow-up"></i> व्हिडिओ जतन व प्रकाशित करा';
}

function releaseVideoUrl() {
  if (videoForm.url) {
    try { URL.revokeObjectURL(videoForm.url); } catch (e) { /* nothing to free */ }
    videoForm.url = '';
  }
}

// the picker back to "nothing chosen"
function resetVideoPicker() {
  videoForm.run++;
  releaseVideoUrl();
  videoForm.file = null;
  videoForm.duration = null;
  videoForm.poster = null;
  videoForm.broken = false;
  videoForm.probing = null;
  const player = videoEl('video-preview');
  player.pause();
  player.removeAttribute('src');
  player.load();
  videoEl('video-preview-wrap').hidden = true;
  videoEl('video-form-meta').textContent = '';
  videoEl('video-form-warn').hidden = true;
  videoEl('video-filename-display').textContent = 'व्हिडिओ फाईल निवडा किंवा ड्रॅग करा';
  videoEl('video-limit-note').textContent = `MP4 किंवा WebM • कमाल मर्यादा ${appState.maxVideoMb} MB`;
  videoEl('video-progress').hidden = true;
  videoEl('video-progress-bar').style.width = '0%';
}

function openNewVideoModal() {
  // Without the list the backend is not reachable: say so now, not after a 100 MB file was chosen and sent
  if (!appState.videosLoaded) {
    showToast('व्हिडिओंची यादी अजून लोड झाली नाही — बॅकएंड तपासा आणि "पुन्हा तपासा" दाबा.', 'error');
    return;
  }
  setVideoFormMode(null);
  resetVideoPicker();
  clearVideoLink();
  ['form-video-title', 'form-video-title-en', 'form-video-desc', 'form-video-desc-en'].forEach((id) => { videoEl(id).value = ''; });
  videoEl('form-video-order').value = 1;                 // a new video goes to the top unless another place is typed
  updateLangDots(videoEl('video-modal'));
  videoEl('video-modal').classList.add('open');
}

// Edit a video that is already published: the form opens with its title / text, the player shows the saved file.
function openEditVideoModal(id) {
  const v = (appState.videos || []).find((x) => Number(x.id) === Number(id));
  if (!v) return;
  setVideoFormMode(v.id);
  resetVideoPicker();
  clearVideoLink();
  videoEl('form-video-title').value = v.title || '';
  videoEl('form-video-title-en').value = v.title_en || '';
  videoEl('form-video-desc').value = v.description || '';
  videoEl('form-video-desc-en').value = v.description_en || '';
  videoEl('form-video-order').value = v.sort_order || ((appState.videos || []).indexOf(v) + 1) || 1;
  updateLangDots(videoEl('video-modal'));

  if (/^https?:\/\//i.test(v.video_url || '')) {         // a video that is a link: the link field shows it
    videoEl('form-video-link').value = v.video_url;
    handleVideoLinkInput();
  } else {
    videoEl('video-preview').src = formatAssetUrl(v.video_url);
    videoEl('video-preview-wrap').hidden = false;
    videoEl('video-form-meta').textContent = [videoLength(v.duration_sec), videoSize(v.size_bytes)].filter((t) => t !== '—').join(' • ');
    const name = String(v.video_url || '').split('/').pop();
    videoEl('video-filename-display').innerHTML =
      `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> <span data-no-i18n>${escapeHtml(name)}</span> — <span>सध्याची फाईल (बदलायची असेल तरच नवीन फाईल निवडा)</span>`;
  }
  videoEl('video-modal').classList.add('open');
}

function closeVideoModal() {
  if (videoForm.saving && !confirm(msg('व्हिडिओ अजून अपलोड होत आहे. थांबवायचे का?', 'The video is still uploading. Stop it?'))) return;
  if (videoForm.saving) videoForm.cancelled = true;
  if (videoForm.xhr) {
    try { videoForm.xhr.abort(); } catch (e) { /* already finished */ }
  }
  resetVideoPicker();
  clearVideoLink();
  videoEl('video-modal').classList.remove('open');
}

// ---- choosing the file --------------------------------------------------------------------------------------------
// ---- a link instead of a file ---------------------------------------------------------------------------------------------
// A YouTube link (watch?v=, youtu.be/, /embed/, /shorts/, /live/) or the direct link of a video file (.mp4 .webm ...). Nothing is
// uploaded: the website plays the video from there (YouTube in its own player, a file in the browser's player). The picture of the
// website's card is YouTube's own thumbnail.
const YOUTUBE_RE = /^https?:\/\/(?:www\.|m\.|music\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#\s]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})(?![\w-])/i;
const VIDEO_FILE_LINK_RE = /^https?:\/\/\S+\.(?:mp4|m4v|mov|webm|ogv)(?:[?#]\S*)?$/i;

// what the link field holds: { url, yt, thumb } for a link the website can play, null for anything else
function readVideoLink(text) {
  const url = String(text || '').trim();
  const m = YOUTUBE_RE.exec(url);
  if (m) return { url: `https://www.youtube.com/watch?v=${m[1]}`, yt: m[1], thumb: `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` };
  if (VIDEO_FILE_LINK_RE.test(url)) return { url, yt: '', thumb: '' };
  return null;
}

function clearVideoLink() {
  videoForm.link = null;
  videoEl('form-video-link').value = '';
  videoEl('video-link-preview').hidden = true;
}

// the link field was typed in / pasted into: show what it is (YouTube picture, or a note), or say that it is not understood
function handleVideoLinkInput() {
  const text = videoEl('form-video-link').value.trim();
  const box = videoEl('video-link-preview'), img = videoEl('video-link-thumb');
  const note = videoEl('video-link-note'), warn = videoEl('video-link-warn');
  videoForm.link = null;
  img.hidden = true;
  warn.hidden = true;
  note.textContent = '';
  box.hidden = !text;
  if (!text) return;
  if (videoForm.file) resetVideoPicker();              // a link replaces the file that was chosen
  const link = readVideoLink(text);
  if (!link) {
    warn.textContent = 'ही लिंक ओळखली नाही — YouTube लिंक किंवा .mp4 / .webm ची थेट लिंक द्या.';
    warn.hidden = false;
    return;
  }
  videoForm.link = link;
  note.textContent = link.yt ? 'YouTube व्हिडिओ — वेबसाईटवर तिथेच प्ले होईल.' : 'थेट व्हिडिओ फाईलची लिंक — वेबसाईटवर तिथेच प्ले होईल.';
  if (link.yt) {
    img.onerror = () => {
      if (videoForm.link !== link) return;
      img.hidden = true;
      warn.textContent = 'ही YouTube लिंक चालत नाही (व्हिडिओ सापडला नाही).';
      warn.hidden = false;
    };
    img.src = link.thumb;
    img.hidden = false;
  }
}

async function handleVideoFileChosen(input) {
  const file = input.files && input.files[0];
  input.value = '';                      // the same file can be chosen again
  if (file) await setVideoFile(file);
}

(function initVideoDrop() {
  const area = videoEl('video-drop-area');
  if (!area) return;
  ['dragenter', 'dragover'].forEach((ev) => area.addEventListener(ev, (e) => { e.preventDefault(); area.classList.add('is-dragover'); }));
  ['dragleave', 'drop'].forEach((ev) => area.addEventListener(ev, (e) => { e.preventDefault(); area.classList.remove('is-dragover'); }));
  area.addEventListener('drop', (e) => {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && !videoForm.saving) setVideoFile(file);
  });
  area.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); videoEl('video-file-input').click(); }
  });
})();

async function setVideoFile(file) {
  if (videoForm.saving) return;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!VIDEO_EXTENSIONS.includes(ext)) {
    showToast('हा व्हिडिओ प्रकार चालणार नाही. MP4 किंवा WebM फाईल निवडा.', 'error');
    return;
  }
  if (file.size > appState.maxVideoMb * 1048576) {
    showToast(`फाईल खूप मोठी आहे (${videoSize(file.size)}). कमाल मर्यादा ${appState.maxVideoMb} MB आहे.`, 'error');
    return;
  }

  clearVideoLink();                                      // a file replaces a link
  const run = ++videoForm.run;
  releaseVideoUrl();
  videoForm.file = file;
  videoForm.duration = null;
  videoForm.poster = null;
  videoForm.broken = false;
  videoForm.url = URL.createObjectURL(file);

  videoEl('video-filename-display').innerHTML =
    `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> <span data-no-i18n>${escapeHtml(file.name)} (${videoSize(file.size)})</span>`;
  const player = videoEl('video-preview');
  player.src = videoForm.url;
  videoEl('video-preview-wrap').hidden = false;
  videoEl('video-form-warn').hidden = true;
  videoEl('video-form-meta').textContent = videoSize(file.size);

  const probing = probeVideo(videoForm.url);
  videoForm.probing = probing;
  const info = await probing;
  if (videoForm.probing === probing) videoForm.probing = null;
  if (run !== videoForm.run || videoForm.file !== file) return;          // another file was chosen / the form was closed meanwhile
  videoForm.broken = !info.ok;
  videoForm.duration = info.ok ? info.duration : null;
  videoForm.poster = info.poster || null;
  videoEl('video-form-meta').textContent = [
    info.ok && info.duration ? `⏱ ${videoLength(info.duration)}` : '',
    videoSize(file.size),
    info.ok && info.width ? `${info.width}×${info.height}` : ''
  ].filter(Boolean).join(' • ');
  videoEl('video-form-warn').hidden = !videoForm.broken;
}

// Opens the file in a hidden <video>: its length, its size in pixels and one picture. { ok:false } = the browser says it cannot play it
// (an error, or a file without a picture). A browser that simply does not answer (some phones load nothing before the first tap) is
// "unknown", not "broken": the video is accepted, with no length / picture.
function probeVideo(url) {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.muted = true;
    v.setAttribute('playsinline', '');
    v.preload = 'auto';
    const info = { ok: true, duration: null, poster: null, width: 0, height: 0 };
    let finished = false;
    const finish = (result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      v.onerror = v.onloadedmetadata = v.onloadeddata = v.onseeked = v.ondurationchange = null;
      v.removeAttribute('src');
      v.load();
      resolve(result);
    };
    const timer = setTimeout(() => finish(info.width ? info : { ok: true, duration: null, poster: null, width: 0, height: 0 }), 15000);

    const draw = () => {
      try {
        const w = v.videoWidth, h = v.videoHeight;
        if (w && h) {
          const k = Math.min(1, 800 / w);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(w * k);
          canvas.height = Math.round(h * k);
          canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => { info.poster = blob; finish(info); }, 'image/jpeg', 0.82);
          return;
        }
      } catch (e) { /* the picture is a nice extra: the video is still fine */ }
      finish(info);
    };
    // a moment after the start (the very first frame is often black); a short clip: a tenth of it
    const grab = () => {
      const at = info.duration ? Math.min(1, info.duration / 10) : 0;
      if (Math.abs(v.currentTime - at) < 0.05) {
        if (v.readyState >= 2) draw(); else v.onloadeddata = draw;
      } else {
        v.onseeked = draw;
        v.currentTime = at;
      }
    };

    v.onerror = () => finish({ ok: false });
    v.onloadedmetadata = () => {
      info.width = v.videoWidth;
      info.height = v.videoHeight;
      if (!info.width) { finish({ ok: false }); return; }                // sound only / a video format this browser does not decode
      if (isFinite(v.duration) && v.duration > 0) { info.duration = v.duration; grab(); return; }
      // A file without a length in its header (recorded in a browser, some screen recorders): seek far beyond the end - the browser
      // then finds the end and knows the length.
      v.ondurationchange = () => {
        if (isFinite(v.duration) && v.duration > 0) { v.ondurationchange = null; info.duration = v.duration; grab(); }
      };
      v.currentTime = 1e101;
      setTimeout(() => { if (!finished && info.duration === null) { v.ondurationchange = null; grab(); } }, 6000);
    };
    v.src = url;
  });
}

// ---- saving ---------------------------------------------------------------------------------------------------------
function setVideoProgress(label, loaded, total) {
  videoEl('video-progress').hidden = false;
  videoEl('video-progress-label').textContent = label;
  const pct = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
  videoEl('video-progress-bar').style.width = pct + '%';
  videoEl('video-progress-pct').textContent = total ? `${pct}% • ${videoSize(loaded)} / ${videoSize(total)}` : '';
}

// POST the file with a progress bar (fetch cannot report how much of an upload is sent)
function uploadVideoFile(file) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    videoForm.xhr = xhr;
    xhr.open('POST', API_BASE + '/api/upload/video');
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      if (e.loaded >= e.total) setVideoProgress('सर्व्हरवर जतन होत आहे...', e.total, e.total);
      else setVideoProgress('व्हिडिओ अपलोड होत आहे...', e.loaded, e.total);
    };
    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch (e) { /* not JSON */ }
      if (xhr.status >= 200 && xhr.status < 300 && data && data.success) resolve(data);
      else reject(new Error((data && data.error) || `HTTP ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('network'));
    xhr.onabort = () => reject(new Error('aborted'));
    const form = new FormData();
    form.append('file', file);
    setVideoProgress('व्हिडिओ अपलोड होत आहे...', 0, file.size);
    xhr.send(form);
  });
}

async function uploadVideoPoster(blob) {
  const form = new FormData();
  form.append('file', blob, 'video-poster.jpg');
  const res = await apiFetch('/api/upload/image', { method: 'POST', body: form });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'poster upload failed');
  return data.url;
}

// a file that was uploaded but never got into a video (the save failed afterwards) is not left behind
async function discardUploadedVideo(url) {
  try {
    await apiFetch('/api/upload/video', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
  } catch (e) { /* the file stays in assets/videos: harmless */ }
}

async function handleVideoFormSubmit(e) {
  e.preventDefault();
  if (videoForm.saving) return;
  // The file is still being read (its length, the picture for the website): wait for that, so the video is saved together with them
  if (videoForm.probing) {
    const wait = videoEl('btn-save-video');
    wait.disabled = true;
    wait.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> व्हिडिओ तपासत आहे...';
    try { await videoForm.probing; } finally { wait.disabled = false; wait.innerHTML = videoSaveButtonHTML(); }
    if (!videoEl('video-modal').classList.contains('open')) return;          // the form was closed meanwhile
  }
  const editingId = appState.editingVideoId;
  const editing = editingId !== null;
  const saved = editing ? (appState.videos || []).find((x) => Number(x.id) === Number(editingId)) : null;
  if (editing && !saved) return;

  const title = videoEl('form-video-title').value.trim();
  if (!title) {
    setFormLang('video-modal', 'mr');
    showToast('व्हिडिओचे शीर्षक लिहा.', 'error');
    return;
  }
  if (videoEl('form-video-link').value.trim() && !videoForm.file && !videoForm.link) {
    showToast('ही लिंक ओळखली नाही — YouTube लिंक किंवा .mp4 / .webm ची थेट लिंक द्या.', 'error');
    return;
  }
  if (!editing && !videoForm.file && !videoForm.link) {
    showToast('आधी व्हिडिओ फाईल निवडा किंवा लिंक द्या.', 'error');
    return;
  }
  if (videoForm.file && videoForm.broken && !confirm(msg(
    'हा व्हिडिओ या ब्राउझरमध्ये चालत नाही, त्यामुळे वेबसाईटवरही चालणार नाही.\n\nतरीही जतन करायचा का?\n\n(MP4 (H.264) मध्ये convert करून पुन्हा निवडणे चांगले.)',
    'This browser cannot play this video, so it will not play on the website either.\n\nSave it anyway?\n\n(It is better to convert it to MP4 (H.264) and choose it again.)'))) return;

  const payload = {
    title,
    title_en: videoEl('form-video-title-en').value.trim(),
    description: videoEl('form-video-desc').value.trim(),
    description_en: videoEl('form-video-desc-en').value.trim(),
    sort_order: Math.max(1, parseInt(videoEl('form-video-order').value, 10) || 1)      // the place on the website (1 = first)
  };
  if (videoForm.link && !videoForm.file) {              // a link: nothing to upload; a YouTube link brings its own picture
    Object.assign(payload, { video_url: videoForm.link.url, thumbnail: videoForm.link.thumb, duration_sec: null, size_bytes: null });
  }

  const btn = videoEl('btn-save-video');
  videoForm.saving = true;
  videoForm.cancelled = false;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> अपलोड होत आहे...';
  let uploadedUrl = '';
  try {
    if (videoForm.file) {
      const up = await uploadVideoFile(videoForm.file);
      uploadedUrl = up.url;
      payload.video_url = up.url;
      payload.size_bytes = up.size;
      payload.duration_sec = videoForm.duration === null ? null : Math.round(videoForm.duration);
      payload.thumbnail = '';                            // (a replaced video must not keep the old video's picture)
      if (videoForm.poster) {
        try { payload.thumbnail = await uploadVideoPoster(videoForm.poster); } catch (err) { console.warn('Thumbnail upload failed:', err); }
      }
    }
    if (videoForm.cancelled) throw new Error('aborted');
    setVideoProgress('सर्व्हरवर जतन होत आहे...', 1, 1);
    const res = await apiFetch(editing ? `/api/videos/${editingId}` : '/api/videos', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      videoForm.xhr = null;
      videoForm.saving = false;
      showToast(editing ? 'व्हिडिओतील बदल जतन झाले!' : 'व्हिडिओ यशस्वीरीत्या प्रकाशित झाला!', 'success');
      closeVideoModal();
      await fetchVideos();
    } else {
      if (uploadedUrl) await discardUploadedVideo(uploadedUrl);
      showToast(data.error || 'त्रुटी आली.', 'error');
    }
  } catch (err) {
    if (uploadedUrl) await discardUploadedVideo(uploadedUrl);
    if (err && err.message === 'aborted') return;        // the owner stopped the upload
    const refused = !!(err && err.message && err.message !== 'network' && !/^HTTP \d+$/.test(err.message));   // the server said why (a file it does not accept)
    (refused ? console.warn : console.error)('Error saving video:', err);
    showToast(refused ? err.message : 'सर्व्हर त्रुटी: व्हिडिओ जतन होऊ शकला नाही.', 'error');
  } finally {
    videoForm.xhr = null;
    videoForm.saving = false;
    btn.disabled = false;
    btn.innerHTML = videoSaveButtonHTML();
    if (!videoEl('video-modal').classList.contains('open')) videoEl('video-progress').hidden = true;
  }
}

// ---- deleting -------------------------------------------------------------------------------------------------------
async function confirmDeleteVideo(id) {
  const v = (appState.videos || []).find((x) => Number(x.id) === Number(id));
  if (!v) return;
  if (!confirm(msg(`हा व्हिडिओ हटवायचा आहे का?\n\n"${v.title}"\n\nतो वेबसाईटवरूनही निघून जाईल आणि व्हिडिओ फाईल कायमची डिलीट होईल.`,
                   `Delete this video?\n\n"${v.title}"\n\nIt will also disappear from the website and the video file will be deleted for good.`))) return;
  try {
    const res = await apiFetch(`/api/videos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('व्हिडिओ हटवला!', 'success');
      await fetchVideos();
    } else {
      showToast(data.error || 'हटवणे अयशस्वी.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('सर्व्हर त्रुटी: व्हिडिओ हटवता आला नाही.', 'error');
  }
}
