/**
 * LOKMANGAL ADMIN PANEL — ADVERTISEMENTS
 * Sidebar > "जाहिरात": the owner uploads a PHOTO or a VIDEO (or gives the link of a video file) with a title. The website's "जाहिरात" widget shows
 * the ads one after the other: a photo for a few seconds, a video plays by itself (muted, it is an ad). A click link is optional.
 *
 * Uses the helpers of admin.js (apiFetch, API_BASE, appState, showToast, escapeHtml, msg, setFormLang, updateLangDots, formatAssetUrl) and of
 * admin-videos.js (probeVideo, videoSize, videoLength, videoDate, VIDEO_EXTENSIONS, VIDEO_FILE_LINK_RE) - this file is loaded after both.
 *  - The file is chosen in the form and uploaded when the form is saved (with a progress bar), so cancelling leaves nothing behind.
 *  - A big photo (a phone / camera picture is often 5-10 MB) is made smaller in the browser first: the website stays fast.
 *  - A video is read by the browser (its length and one picture, which becomes the video's poster) exactly like in the Videos section.
 *  - Page texts are translated by admin-i18n.js; texts that are not page text (confirm dialogs) use msg(marathi, english).
 */

const AD_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
const AD_IMAGE_MAX_SIDE = 1600;                 // a photo with a longer side than this is made smaller before it is uploaded
const AD_IMAGE_KEEP_BYTES = 1.2 * 1048576;      // ... and so is a photo that is heavier than this

// the working state of the open form
const adForm = {
  type: 'image',     // 'image' | 'video': which of the two the form is about
  imageBlob: null,   // what is uploaded for a photo (the chosen file, or the smaller JPEG made from it); null = nothing chosen
  imageExt: 'jpg',
  imageUrl: '',      // blob: address of it (preview), released when it is replaced or the form closes
  imageRun: 0,       // counts the chosen photos: the late answer for an older one is ignored
  videoFile: null,   // the video File chosen in this form
  videoUrl: '',      // blob: address of it (preview)
  duration: null,    // seconds, null = the browser could not tell
  poster: null,      // JPEG Blob taken from the video, null = none
  broken: false,     // the browser cannot play the video
  probing: null,     // the promise of the video being read while that is still going on
  videoRun: 0,
  link: '',          // a direct video link given instead of a file ('' = none)
  saving: false,
  cancelled: false,  // the owner closed the form while it was saving: nothing more is saved
  xhr: null          // the running upload (cancel = abort)
};

const adEl = (id) => document.getElementById(id);

// ------------------------------------------------------------------------------------------------ the list
async function fetchAds() {
  try {
    const res = await apiFetch('/api/ads');
    const data = await res.json();
    if (data.success && Array.isArray(data.ads)) {
      appState.ads = data.ads;
      appState.adsLoaded = true;
      appState.adsFailed = false;
    } else {
      appState.adsFailed = true;
    }
  } catch (err) {
    console.error('Error fetching ads:', err);
    appState.adsFailed = true;
  }
  renderAdsTable();
  updateBadgeCounts();
}

function renderAdsTable() {
  const tbody = adEl('ads-table-body');
  if (!tbody) return;

  if (!appState.adsLoaded) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">${appState.adsFailed
      ? 'जाहिरातींची यादी लोड झाली नाही — बॅकएंड तपासा आणि "पुन्हा तपासा" दाबा.' : 'लोड होत आहे...'}</td></tr>`;
    return;
  }
  const list = appState.ads || [];
  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 36px; color: var(--text-muted);">
          <i class="fa-solid fa-rectangle-ad" style="font-size: 1.8rem; margin-bottom: 8px; display: block;"></i>
          अजून एकही जाहिरात नाही.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = list.map((a, i) => {
    const isVideo = a.media_type === 'video';
    const file = escapeHtml(formatAssetUrl(a.media_url));
    const pic = isVideo ? a.thumbnail : a.media_url;
    const thumb = pic
      ? `<img src="${escapeHtml(formatAssetUrl(pic))}" class="table-thumb ad-table-thumb" alt="" data-no-i18n>`
      : '<div class="table-thumb ad-table-thumb video-thumb-empty"><i class="fa-solid fa-film"></i></div>';
    const link = a.link_url
      ? ` <a class="ad-link-chip" href="${escapeHtml(a.link_url)}" target="_blank" rel="noopener noreferrer" title="क्लिक लिंक"><i class="fa-solid fa-link"></i></a>`
      : '';
    return `
      <tr>
        <td><div class="ad-thumb-wrap">${thumb}<span class="video-order-badge" title="क्रम क्रमांक">${a.sort_order || i + 1}</span>${isVideo ? '<span class="video-thumb-play"><i class="fa-solid fa-play"></i></span>' : ''}</div></td>
        <td><div style="font-weight: 600; color: var(--text-primary);" data-no-i18n>${escapeHtml(a.title)}${a.title_en ? ' <span class="lang-badge" title="English आवृत्ती आहे">EN</span>' : ''}${link}</div></td>
        <td><span class="ad-type-badge${isVideo ? ' is-video' : ''}"><i class="${isVideo ? 'fa-solid fa-film' : 'fa-regular fa-image'}"></i> <span>${isVideo ? 'व्हिडिओ' : 'फोटो'}</span></span></td>
        <td style="font-size: 0.85rem;">${videoSize(a.size_bytes)}</td>
        <td style="font-size: 0.85rem;">${videoDate(a.created_at)}</td>
        <td>
          <div class="table-actions">
            <a href="${file}" target="_blank" rel="noopener" class="action-btn" title="जाहिरात पहा">
              <i class="fa-regular fa-eye"></i>
            </a>
            <button class="action-btn" title="जाहिरात संपादित करा" onclick="openEditAdModal(${a.id})">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-btn delete-btn" title="जाहिरात हटवा" onclick="confirmDeleteAd(${a.id})">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ------------------------------------------------------------------------------------------------ the form
function setAdFormMode(id) {
  appState.editingAdId = id;
  setFormLang('ad-modal', 'mr');
  adEl('ad-modal-title').innerHTML = id !== null
    ? '<i class="fa-solid fa-pen-to-square"></i> जाहिरात संपादित करा'
    : '<i class="fa-solid fa-rectangle-ad"></i> नवीन जाहिरात अपलोड करा';
  adEl('btn-save-ad').innerHTML = adSaveButtonHTML();
}

function adSaveButtonHTML() {
  return appState.editingAdId !== null
    ? '<i class="fa-solid fa-check"></i> बदल जतन करा'
    : '<i class="fa-solid fa-cloud-arrow-up"></i> जाहिरात जतन व प्रकाशित करा';
}

// photo or video: shows the matching half of the form
function setAdType(type) {
  adForm.type = type === 'video' ? 'video' : 'image';
  document.querySelectorAll('#ad-modal .ad-type-opt').forEach((b) => {
    const on = b.dataset.type === adForm.type;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  adEl('ad-pane-image').hidden = adForm.type !== 'image';
  adEl('ad-pane-video').hidden = adForm.type !== 'video';
  if (adForm.type !== 'video') adEl('ad-video-preview').pause();
}

function releaseAdImageUrl() {
  if (adForm.imageUrl) {
    try { URL.revokeObjectURL(adForm.imageUrl); } catch (e) { /* nothing to free */ }
    adForm.imageUrl = '';
  }
}

function releaseAdVideoUrl() {
  if (adForm.videoUrl) {
    try { URL.revokeObjectURL(adForm.videoUrl); } catch (e) { /* nothing to free */ }
    adForm.videoUrl = '';
  }
}

function resetAdImage() {
  adForm.imageRun++;
  releaseAdImageUrl();
  adForm.imageBlob = null;
  adForm.imageExt = 'jpg';
  adEl('ad-image-preview').removeAttribute('src');
  adEl('ad-image-preview-wrap').hidden = true;
  adEl('ad-image-meta').textContent = '';
  adEl('ad-image-name').textContent = 'फोटो निवडा किंवा ड्रॅग करा';
}

function resetAdVideo() {
  adForm.videoRun++;
  releaseAdVideoUrl();
  adForm.videoFile = null;
  adForm.duration = null;
  adForm.poster = null;
  adForm.broken = false;
  adForm.probing = null;
  const player = adEl('ad-video-preview');
  player.pause();
  player.removeAttribute('src');
  player.load();
  adEl('ad-video-preview-wrap').hidden = true;
  adEl('ad-video-meta').textContent = '';
  adEl('ad-video-warn').hidden = true;
  adEl('ad-video-name').textContent = 'व्हिडिओ फाईल निवडा किंवा ड्रॅग करा';
  adEl('ad-video-limit').textContent = `MP4 किंवा WebM • कमाल मर्यादा ${appState.maxVideoMb} MB`;
}

function clearAdVideoLink() {
  adForm.link = '';
  adEl('ad-video-link').value = '';
  adEl('ad-video-link-warn').hidden = true;
}

function resetAdForm() {
  resetAdImage();
  resetAdVideo();
  clearAdVideoLink();
  adEl('ad-progress').hidden = true;
  adEl('ad-progress-bar').style.width = '0%';
}

function openNewAdModal() {
  // Without the list the backend is not reachable: say so now, not after a big file was chosen and sent
  if (!appState.adsLoaded) {
    showToast('जाहिरातींची यादी अजून लोड झाली नाही — बॅकएंड तपासा आणि "पुन्हा तपासा" दाबा.', 'error');
    return;
  }
  setAdFormMode(null);
  resetAdForm();
  setAdType('image');
  ['form-ad-title', 'form-ad-title-en', 'form-ad-link'].forEach((id) => { adEl(id).value = ''; });
  adEl('form-ad-order').value = 1;                       // a new ad goes first unless another place is typed
  updateLangDots(adEl('ad-modal'));
  adEl('ad-modal').classList.add('open');
}

// Edit an ad that is already published: the form opens with its title / link, the preview shows the saved photo / video.
function openEditAdModal(id) {
  const a = (appState.ads || []).find((x) => Number(x.id) === Number(id));
  if (!a) return;
  setAdFormMode(a.id);
  resetAdForm();
  setAdType(a.media_type);
  adEl('form-ad-title').value = a.title || '';
  adEl('form-ad-title-en').value = a.title_en || '';
  adEl('form-ad-link').value = a.link_url || '';
  adEl('form-ad-order').value = a.sort_order || ((appState.ads || []).indexOf(a) + 1) || 1;
  updateLangDots(adEl('ad-modal'));

  const keep = (name) => `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> <span data-no-i18n>${escapeHtml(name)}</span> — <span>सध्याची फाईल (बदलायची असेल तरच नवीन फाईल निवडा)</span>`;
  if (a.media_type === 'video') {
    if (/^https?:\/\//i.test(a.media_url || '')) {         // a video that is a link: the link field shows it
      adEl('ad-video-link').value = a.media_url;
      handleAdVideoLinkInput();
    } else {
      adEl('ad-video-preview').src = formatAssetUrl(a.media_url);
      adEl('ad-video-preview-wrap').hidden = false;
      adEl('ad-video-meta').textContent = [videoLength(a.duration_sec), videoSize(a.size_bytes)].filter((t) => t !== '—').join(' • ');
      adEl('ad-video-name').innerHTML = keep(String(a.media_url || '').split('/').pop());
    }
  } else {
    adEl('ad-image-preview').src = formatAssetUrl(a.media_url);
    adEl('ad-image-preview-wrap').hidden = false;
    adEl('ad-image-meta').textContent = a.size_bytes ? videoSize(a.size_bytes) : '';
    adEl('ad-image-name').innerHTML = keep(String(a.media_url || '').split('/').pop());
  }
  adEl('ad-modal').classList.add('open');
}

function closeAdModal() {
  if (adForm.saving && !confirm(msg('जाहिरात अजून अपलोड होत आहे. थांबवायचे का?', 'The advertisement is still uploading. Stop it?'))) return;
  if (adForm.saving) adForm.cancelled = true;
  if (adForm.xhr) {
    try { adForm.xhr.abort(); } catch (e) { /* already finished */ }
  }
  resetAdForm();
  adEl('ad-modal').classList.remove('open');
}

// ---- choosing a photo ---------------------------------------------------------------------------------------------------
async function handleAdImageChosen(input) {
  const file = input.files && input.files[0];
  input.value = '';                      // the same file can be chosen again
  if (file) await setAdImage(file);
}

// Opens the photo, and - when it is big - draws it smaller on a canvas and keeps that JPEG instead. null = the browser cannot open it.
function prepareAdImage(file, ext) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h) { resolve(null); return; }
      const same = { blob: file, ext, width: w, height: h, original: file.size, smaller: false };
      if (ext === 'gif' || (Math.max(w, h) <= AD_IMAGE_MAX_SIDE && file.size <= AD_IMAGE_KEEP_BYTES)) { resolve(same); return; }
      const k = Math.min(1, AD_IMAGE_MAX_SIDE / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(w * k));
      canvas.height = Math.max(1, Math.round(h * k));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';                                   // (a transparent PNG becomes a JPEG on white)
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(blob && blob.size < file.size
          ? { blob, ext: 'jpg', width: canvas.width, height: canvas.height, original: file.size, smaller: true }
          : same);
      }, 'image/jpeg', 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

async function setAdImage(file) {
  if (adForm.saving) return;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!AD_IMAGE_EXTENSIONS.includes(ext)) {
    showToast('हा फोटो प्रकार चालणार नाही. JPG, PNG, WebP किंवा GIF निवडा.', 'error');
    return;
  }
  if (ext === 'gif' && file.size > appState.maxUploadMb * 1048576) {
    showToast(`फाईल खूप मोठी आहे (${videoSize(file.size)}). कमाल मर्यादा ${appState.maxUploadMb} MB आहे.`, 'error');
    return;
  }
  const run = ++adForm.imageRun;
  adEl('ad-image-name').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>फोटो तयार होत आहे...</span>';
  const result = await prepareAdImage(file, ext);
  if (run !== adForm.imageRun) return;                           // another photo was chosen / the form was closed meanwhile
  if (!result) {
    resetAdImage();
    showToast('हा फोटो उघडता आला नाही.', 'error');
    return;
  }
  if (result.blob.size > appState.maxUploadMb * 1048576) {
    resetAdImage();
    showToast(`फाईल खूप मोठी आहे (${videoSize(result.blob.size)}). कमाल मर्यादा ${appState.maxUploadMb} MB आहे.`, 'error');
    return;
  }
  releaseAdImageUrl();
  adForm.imageBlob = result.blob;
  adForm.imageExt = result.ext;
  adForm.imageUrl = URL.createObjectURL(result.blob);
  adEl('ad-image-preview').src = adForm.imageUrl;
  adEl('ad-image-preview-wrap').hidden = false;
  adEl('ad-image-name').innerHTML =
    `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> <span data-no-i18n>${escapeHtml(file.name)}</span>`;
  adEl('ad-image-meta').textContent = `${result.width}×${result.height} • ${videoSize(result.blob.size)}` +
    (result.smaller ? ` • ${msg('लहान केला (मूळ', 'made smaller (original')} ${videoSize(result.original)})` : '');
}

// ---- choosing a video ---------------------------------------------------------------------------------------------------
async function handleAdVideoChosen(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (file) await setAdVideo(file);
}

async function setAdVideo(file) {
  if (adForm.saving) return;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!VIDEO_EXTENSIONS.includes(ext)) {
    showToast('हा व्हिडिओ प्रकार चालणार नाही. MP4 किंवा WebM फाईल निवडा.', 'error');
    return;
  }
  if (file.size > appState.maxVideoMb * 1048576) {
    showToast(`फाईल खूप मोठी आहे (${videoSize(file.size)}). कमाल मर्यादा ${appState.maxVideoMb} MB आहे.`, 'error');
    return;
  }

  clearAdVideoLink();                                    // a file replaces a link
  const run = ++adForm.videoRun;
  releaseAdVideoUrl();
  adForm.videoFile = file;
  adForm.duration = null;
  adForm.poster = null;
  adForm.broken = false;
  adForm.videoUrl = URL.createObjectURL(file);

  adEl('ad-video-name').innerHTML =
    `<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i> <span data-no-i18n>${escapeHtml(file.name)} (${videoSize(file.size)})</span>`;
  adEl('ad-video-preview').src = adForm.videoUrl;
  adEl('ad-video-preview-wrap').hidden = false;
  adEl('ad-video-warn').hidden = true;
  adEl('ad-video-meta').textContent = videoSize(file.size);

  const probing = probeVideo(adForm.videoUrl);
  adForm.probing = probing;
  const info = await probing;
  if (adForm.probing === probing) adForm.probing = null;
  if (run !== adForm.videoRun || adForm.videoFile !== file) return;          // another file was chosen / the form was closed meanwhile
  adForm.broken = !info.ok;
  adForm.duration = info.ok ? info.duration : null;
  adForm.poster = info.poster || null;
  adEl('ad-video-meta').textContent = [
    info.ok && info.duration ? `⏱ ${videoLength(info.duration)}` : '',
    videoSize(file.size),
    info.ok && info.width ? `${info.width}×${info.height}` : ''
  ].filter(Boolean).join(' • ');
  adEl('ad-video-warn').hidden = !adForm.broken;
}

// the link field was typed in / pasted into: a direct link of a video file is previewed, anything else is said to be not understood
function handleAdVideoLinkInput() {
  const text = adEl('ad-video-link').value.trim();
  const warn = adEl('ad-video-link-warn');
  adForm.link = '';
  warn.hidden = true;
  if (!text) {
    if (!adForm.videoFile) { adEl('ad-video-preview').removeAttribute('src'); adEl('ad-video-preview-wrap').hidden = true; }
    return;
  }
  if (adForm.videoFile) resetAdVideo();                  // a link replaces the file that was chosen
  if (!VIDEO_FILE_LINK_RE.test(text)) {
    adEl('ad-video-preview-wrap').hidden = true;
    warn.textContent = 'ही लिंक ओळखली नाही — .mp4 / .webm ची थेट लिंक द्या.';
    warn.hidden = false;
    return;
  }
  adForm.link = text;
  adEl('ad-video-preview').src = text;
  adEl('ad-video-preview-wrap').hidden = false;
  adEl('ad-video-warn').hidden = true;
  adEl('ad-video-meta').textContent = '';
}

(function initAdDrop() {
  const wire = (areaId, inputId, choose) => {
    const area = adEl(areaId);
    if (!area) return;
    ['dragenter', 'dragover'].forEach((ev) => area.addEventListener(ev, (e) => { e.preventDefault(); area.classList.add('is-dragover'); }));
    ['dragleave', 'drop'].forEach((ev) => area.addEventListener(ev, (e) => { e.preventDefault(); area.classList.remove('is-dragover'); }));
    area.addEventListener('drop', (e) => {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && !adForm.saving) choose(file);
    });
    area.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); adEl(inputId).click(); }
    });
  };
  wire('ad-image-drop', 'ad-image-input', setAdImage);
  wire('ad-video-drop', 'ad-video-input', setAdVideo);
})();

// ---- saving ---------------------------------------------------------------------------------------------------------
function setAdProgress(label, loaded, total) {
  adEl('ad-progress').hidden = false;
  adEl('ad-progress-label').textContent = label;
  const pct = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
  adEl('ad-progress-bar').style.width = pct + '%';
  adEl('ad-progress-pct').textContent = total ? `${pct}% • ${videoSize(loaded)} / ${videoSize(total)}` : '';
}

// POST a file (a photo, a video, a video's picture) with a progress bar (fetch cannot report how much of an upload is sent)
function uploadAdFile(path, blob, filename, label) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    adForm.xhr = xhr;
    xhr.open('POST', API_BASE + path);
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      if (e.loaded >= e.total) setAdProgress('सर्व्हरवर जतन होत आहे...', e.total, e.total);
      else setAdProgress(label, e.loaded, e.total);
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
    form.append('file', blob, filename);
    setAdProgress(label, 0, blob.size);
    xhr.send(form);
  });
}

// files that were uploaded but never got into an ad (the save failed afterwards) are not left behind
async function discardAdUploads(uploaded) {
  for (const item of uploaded) {
    try {
      await apiFetch(item.video ? '/api/upload/video' : '/api/upload/ad', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: item.url })
      });
    } catch (e) { /* the file stays in assets/: harmless */ }
  }
}

async function handleAdFormSubmit(e) {
  e.preventDefault();
  if (adForm.saving) return;
  // The video is still being read (its length, its picture): wait for that, so the ad is saved together with them
  if (adForm.probing) {
    const wait = adEl('btn-save-ad');
    wait.disabled = true;
    wait.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> व्हिडिओ तपासत आहे...';
    try { await adForm.probing; } finally { wait.disabled = false; wait.innerHTML = adSaveButtonHTML(); }
    if (!adEl('ad-modal').classList.contains('open')) return;          // the form was closed meanwhile
  }
  const editingId = appState.editingAdId;
  const editing = editingId !== null;
  const saved = editing ? (appState.ads || []).find((x) => Number(x.id) === Number(editingId)) : null;
  if (editing && !saved) return;

  const title = adEl('form-ad-title').value.trim();
  if (!title) {
    setFormLang('ad-modal', 'mr');
    showToast('जाहिरातीचे शीर्षक लिहा.', 'error');
    return;
  }
  const click = adEl('form-ad-link').value.trim();
  if (click && !/^https?:\/\/\S+$/i.test(click)) {
    showToast('क्लिक लिंक http:// किंवा https:// ने सुरू व्हायला हवी', 'error');
    return;
  }

  const type = adForm.type;
  const newMediaNeeded = !editing || saved.media_type !== type;      // a new ad, or an ad that changes from photo to video (or back)
  if (type === 'image') {
    if (newMediaNeeded && !adForm.imageBlob) {
      showToast('आधी फोटो निवडा.', 'error');
      return;
    }
  } else {
    if (adEl('ad-video-link').value.trim() && !adForm.videoFile && !adForm.link) {
      showToast('ही लिंक ओळखली नाही — .mp4 / .webm ची थेट लिंक द्या.', 'error');
      return;
    }
    if (newMediaNeeded && !adForm.videoFile && !adForm.link) {
      showToast('आधी व्हिडिओ फाईल निवडा किंवा लिंक द्या.', 'error');
      return;
    }
    if (adForm.videoFile && adForm.broken && !confirm(msg(
      'हा व्हिडिओ या ब्राउझरमध्ये चालत नाही, त्यामुळे वेबसाईटवरही चालणार नाही.\n\nतरीही जतन करायचा का?\n\n(MP4 (H.264) मध्ये convert करून पुन्हा निवडणे चांगले.)',
      'This browser cannot play this video, so it will not play on the website either.\n\nSave it anyway?\n\n(It is better to convert it to MP4 (H.264) and choose it again.)'))) return;
  }

  const payload = {
    media_type: type,
    title,
    title_en: adEl('form-ad-title-en').value.trim(),
    link_url: click,
    sort_order: Math.max(1, parseInt(adEl('form-ad-order').value, 10) || 1)      // the place in the slider (1 = first)
  };

  const btn = adEl('btn-save-ad');
  adForm.saving = true;
  adForm.cancelled = false;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> अपलोड होत आहे...';
  const uploaded = [];
  try {
    if (type === 'image' && adForm.imageBlob) {
      const up = await uploadAdFile('/api/upload/image', adForm.imageBlob, `ad-image.${adForm.imageExt}`, 'फोटो अपलोड होत आहे...');
      uploaded.push({ url: up.url });
      Object.assign(payload, { media_url: up.url, size_bytes: up.size, duration_sec: null, thumbnail: '' });
    } else if (type === 'video' && adForm.videoFile) {
      const up = await uploadAdFile('/api/upload/video', adForm.videoFile, adForm.videoFile.name, 'व्हिडिओ अपलोड होत आहे...');
      uploaded.push({ url: up.url, video: true });
      Object.assign(payload, {
        media_url: up.url, size_bytes: up.size, thumbnail: '',
        duration_sec: adForm.duration === null ? null : Math.round(adForm.duration)
      });
      if (adForm.poster) {
        try {
          const pic = await uploadAdFile('/api/upload/image', adForm.poster, 'ad-poster.jpg', 'फोटो अपलोड होत आहे...');
          uploaded.push({ url: pic.url });
          payload.thumbnail = pic.url;
        } catch (err) { console.warn('Poster upload failed:', err); }
      }
    } else if (type === 'video' && adForm.link) {            // a link: nothing to upload
      Object.assign(payload, { media_url: adForm.link, size_bytes: null, duration_sec: null, thumbnail: '' });
    }
    if (adForm.cancelled) throw new Error('aborted');
    setAdProgress('सर्व्हरवर जतन होत आहे...', 1, 1);
    const res = await apiFetch(editing ? `/api/ads/${editingId}` : '/api/ads', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      adForm.xhr = null;
      adForm.saving = false;
      showToast(editing ? 'जाहिरातीतील बदल जतन झाले!' : 'जाहिरात यशस्वीरीत्या प्रकाशित झाली!', 'success');
      closeAdModal();
      await fetchAds();
    } else {
      await discardAdUploads(uploaded);
      showToast(data.error || 'त्रुटी आली.', 'error');
    }
  } catch (err) {
    await discardAdUploads(uploaded);
    if (err && err.message === 'aborted') return;           // the owner stopped the upload
    const refused = !!(err && err.message && err.message !== 'network' && !/^HTTP \d+$/.test(err.message));   // the server said why (a file it does not accept)
    (refused ? console.warn : console.error)('Error saving ad:', err);
    showToast(refused ? err.message : 'सर्व्हर त्रुटी: जाहिरात जतन होऊ शकली नाही.', 'error');
  } finally {
    adForm.xhr = null;
    adForm.saving = false;
    btn.disabled = false;
    btn.innerHTML = adSaveButtonHTML();
    if (!adEl('ad-modal').classList.contains('open')) adEl('ad-progress').hidden = true;
  }
}

// ---- deleting -------------------------------------------------------------------------------------------------------
async function confirmDeleteAd(id) {
  const a = (appState.ads || []).find((x) => Number(x.id) === Number(id));
  if (!a) return;
  if (!confirm(msg(`ही जाहिरात हटवायची आहे का?\n\n"${a.title}"\n\nती वेबसाईटवरूनही निघून जाईल आणि अपलोड केलेली फाईल कायमची डिलीट होईल.`,
                   `Delete this advertisement?\n\n"${a.title}"\n\nIt will also disappear from the website and the uploaded file will be deleted for good.`))) return;
  try {
    const res = await apiFetch(`/api/ads/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('जाहिरात हटवली!', 'success');
      await fetchAds();
    } else {
      showToast(data.error || 'हटवणे अयशस्वी.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('सर्व्हर त्रुटी: जाहिरात हटवता आली नाही.', 'error');
  }
}
