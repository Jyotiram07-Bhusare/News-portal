/*
 * LOKMANGAL ADMIN - the writing boxes with formatting tools (no library, works without internet).
 *
 * Every long text box of the Admin Panel gets a toolbar; what is written is seen formatted at once (no tags, no ** signs):
 *   full   - the story of a news / blog (Marathi and English): bold, italic, underline, H1 / H2 / H3 headings, normal text, bullet and numbered list,
 *            remove formatting, undo / redo;
 *   inline - the short texts (summary, weekly introduction, video description), which are shown inside one paragraph: bold, italic, underline.
 *
 * The <textarea> stays in the form (hidden) and keeps working like before for the rest of the code: reading .value gives the HTML to save and setting
 * .value shows it in the box. A text that was opened and not changed is given back exactly as it was saved.
 * The story's headline is the page's one H1 (search engines), so the buttons H1 / H2 / H3 are saved as <h2> / <h3> / <h4>.
 * What is saved is cleaned here and again by the backend (sanitize.py).
 */
(function () {
  'use strict';

  const BOXES = [
    ['form-article-excerpt', 'inline'], ['form-article-excerpt-en', 'inline'],
    ['form-article-content', 'full'], ['form-article-content-en', 'full'],
    ['form-weekly-desc', 'inline'], ['form-weekly-desc-en', 'inline'],
    ['form-video-desc', 'inline'], ['form-video-desc-en', 'inline']
  ];

  // ------------------------------------------------------------------------------------------------ cleaning (the same allow-list as sanitize.py)
  const REMOVE = /^(script|style|meta|link|title|head|noscript|iframe|object|embed|svg|math|form|input|button|select|option|textarea|template|audio|video|source|canvas)$/;
  const RENAME = { b: 'strong', i: 'em', strike: 's', del: 's', h1: 'h2', h5: 'h4', h6: 'h4' };
  const FULL = /^(p|br|strong|em|u|s|ul|ol|li|blockquote|h2|h3|h4|hr|a|img|figure|figcaption|table|thead|tbody|tr|th|td)$/;
  const INLINE = /^(strong|em|u|br)$/;
  const BLOCKLIKE = /^(p|div|h[1-6]|li|ul|ol|blockquote|table|figure|figcaption|hr|section|article|header|footer|nav|aside|main|center|pre|tr|thead|tbody|dl|dt|dd|address)$/;
  const ATTRIBUTES = { a: ['href', 'title'], img: ['src', 'alt', 'title', 'width', 'height'] };
  const BLOCKS = /^(P|H2|H3|H4|UL|OL|LI|BLOCKQUOTE|HR|FIGURE|TABLE|DIV|X-BLOCK)$/;

  const parse = (html) => new DOMParser().parseFromString(`<body>${String(html || '')}</body>`, 'text/html');     // (inert: nothing runs or loads)
  const escapeText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // bold / italic / underline written as a style (text pasted from Word or Google Docs)
  function styleWrappers(el) {
    const st = el.style || {};
    const out = [];
    const weight = String(st.fontWeight || '');
    if (weight === 'bold' || weight === 'bolder' || Number(weight) >= 600) out.push('strong');
    if (st.fontStyle === 'italic') out.push('em');
    if (/underline/.test(String(st.textDecoration || st.textDecorationLine || ''))) out.push('u');
    return out;
  }

  // Copies `node`'s children into `target`, keeping only what may be saved.
  function copy(node, target, mode, doc) {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) { target.appendChild(doc.createTextNode(n.nodeValue.replace(/ /g, ' '))); return; }
      if (n.nodeType !== 1) return;                                        // comments and the like
      const original = n.tagName.toLowerCase();
      if (REMOVE.test(original) || original.includes(':')) return;         // (<o:p> of Word included)
      let tag = RENAME[original] || original;
      const weight = String((n.style && n.style.fontWeight) || '');
      if ((original === 'b' || original === 'strong') && (weight === 'normal' || weight === '400')) tag = 'span';      // Google Docs wraps everything in such a <b>
      const wraps = styleWrappers(n).filter((w) => w !== tag);

      let into = target;
      if (mode === 'inline') {
        if (tag === 'br') { into.appendChild(doc.createElement('br')); return; }
        const block = BLOCKLIKE.test(original);
        if (block && target.textContent && target.lastChild && target.lastChild.nodeName !== 'BR') target.appendChild(doc.createElement('br'));
        if (INLINE.test(tag)) into = target.appendChild(doc.createElement(tag));
        wraps.forEach((w) => { into = into.appendChild(doc.createElement(w)); });
        copy(n, into, mode, doc);
        if (block && target.lastChild && target.lastChild.nodeName !== 'BR') target.appendChild(doc.createElement('br'));
        return;
      }

      if (tag === 'div' && n.classList.contains('article-table-wrap')) {
        into = target.appendChild(doc.createElement('div'));
        into.className = 'article-table-wrap';
      } else if (tag === 'div' || (BLOCKLIKE.test(original) && !FULL.test(tag))) {
        into = target.appendChild(doc.createElement('x-block'));            // (a pasted <div>, <section> ...: a paragraph of its own, see blocks())
      } else if (FULL.test(tag)) {
        const el = doc.createElement(tag);
        (ATTRIBUTES[tag] || []).forEach((name) => {
          const value = n.getAttribute(name);
          if (value != null && !/^\s*(javascript|data|vbscript):/i.test(value.replace(/[\u0000-\u001f]/g, ''))) el.setAttribute(name, value);
        });
        if (tag === 'img' && !el.getAttribute('src')) return;               // (a photo pasted as data from Word: it cannot be saved)
        if (tag === 'a' && !el.getAttribute('href')) into = target;
        else into = target.appendChild(el);
      }
      wraps.forEach((w) => { into = into.appendChild(doc.createElement(w)); });
      copy(n, into, mode, doc);
    });
  }

  const isEmpty = (el) => !el.textContent.trim() && !el.querySelector('img, table, hr');

  function trimBreaks(el) {
    const blank = (n) => n && (n.nodeName === 'BR' || (n.nodeType === 3 && !n.nodeValue.trim()));
    while (blank(el.firstChild)) el.firstChild.remove();
    while (blank(el.lastChild)) el.lastChild.remove();
  }

  // A list holds only <li>; an item holds text and, perhaps, a list inside it.
  function fixList(list, doc) {
    const out = doc.createElement(list.tagName.toLowerCase());
    [...list.childNodes].forEach((n) => {
      if (n.nodeName === 'UL' || n.nodeName === 'OL') {                      // a list placed directly in a list (an indent): into the item before it
        const inner = fixList(n, doc);
        if (!inner) return;
        if (out.lastElementChild) out.lastElementChild.appendChild(inner);
        else [...inner.children].forEach((li) => out.appendChild(li));
        return;
      }
      if (n.nodeType === 3 && !n.nodeValue.trim()) return;
      const item = doc.createElement('li');
      const source = n.nodeName === 'LI' ? [...n.childNodes] : [n];
      source.forEach((c) => {
        if (c.nodeName === 'UL' || c.nodeName === 'OL') { const inner = fixList(c, doc); if (inner) item.appendChild(inner); }
        else if (/^(P|H2|H3|H4|X-BLOCK|BLOCKQUOTE|DIV)$/.test(c.nodeName)) {
          if (item.textContent.trim()) item.appendChild(doc.createElement('br'));
          while (c.firstChild) item.appendChild(c.firstChild);
        } else item.appendChild(c);
      });
      trimBreaks(item);
      if (!isEmpty(item)) out.appendChild(item);
    });
    return out.children.length ? out : null;
  }

  // The top level of a story: blocks only. Loose text becomes a paragraph, a list or heading that ended up inside a paragraph is taken out of it.
  function blocks(parent, wrap, doc) {
    const out = [];
    let run = null;
    const close = () => { if (run) { trimBreaks(run); if (!isEmpty(run)) out.push(run); } run = null; };
    [...parent.childNodes].forEach((n) => {
      if (n.nodeType === 1 && BLOCKS.test(n.tagName)) {
        close();
        if (n.tagName === 'X-BLOCK') out.push(...blocks(n, 'p', doc));
        else if (/^(P|H2|H3|H4)$/.test(n.tagName)) out.push(...blocks(n, n.tagName.toLowerCase(), doc));
        else if (n.tagName === 'UL' || n.tagName === 'OL') { const list = fixList(n, doc); if (list) out.push(list); }
        else if (n.tagName === 'LI') { const holder = doc.createElement('ul'); holder.appendChild(n); const list = fixList(holder, doc); if (list) out.push(list); }
        else if (n.tagName === 'BLOCKQUOTE') {
          const inner = blocks(n, 'p', doc);
          if (!inner.length) return;
          n.replaceChildren(...(inner.length === 1 && inner[0].tagName === 'P' ? [...inner[0].childNodes] : inner));
          out.push(n);
        } else out.push(n);                                                   // a line, a figure, a table: as it is
        return;
      }
      if (!run) {
        if ((n.nodeType === 3 && !n.nodeValue.trim()) || n.nodeName === 'BR') return;
        run = doc.createElement(wrap);
      }
      run.appendChild(n);
    });
    close();
    return out;
  }

  // The HTML of a full story / of a short text as it is shown in the box (and, for a story, saved).
  function cleanMarkup(html, mode) {
    const doc = parse(html);
    const box = doc.createElement('div');
    copy(doc.body, box, mode, doc);
    if (mode === 'full') return blocks(box, 'p', doc).map((el) => el.outerHTML).join('\n');
    box.querySelectorAll('strong, em, u').forEach((el) => { if (!el.textContent) el.remove(); });
    trimBreaks(box);
    return box.innerHTML.replace(/(<br>\s*){3,}/g, '<br><br>');
  }

  // What a box saves. A short text without any formatting stays ordinary text, as it always was.
  function saved(html, mode) {
    const markup = cleanMarkup(html, mode);
    if (mode === 'full') return markup;
    if (/<[a-z]/i.test(markup)) return markup;
    return parse(markup).body.textContent.trim();
  }

  // Ordinary text -> what the box shows: a blank line starts a paragraph, ** ** is bold (how the box was written before).
  function textToMarkup(text, mode) {
    const line = (t) => escapeText(t).replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>').replace(/\r?\n/g, '<br>');
    if (mode === 'inline') return line(String(text).trim());
    return String(text).split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${line(p)}</p>`).join('\n');
  }

  const looksLikeHtml = (s) => /<\/?[a-z][a-z0-9]*(\s[^<>]*)?\/?>/i.test(s);

  // The words of a formatted text, without any tag (the lists of the Admin Panel)
  const plain = (html) => parse(String(html || '').replace(/<br\s*\/?>|<\/(p|h[1-6]|li)>/gi, ' ')).body.textContent.replace(/\s+/g, ' ').trim();

  // ------------------------------------------------------------------------------------------------ the box on the page
  const editors = [];
  const BUTTONS = {
    bold: ['<i class="fa-solid fa-bold"></i>', 'ठळक (Ctrl+B)'],
    italic: ['<i class="fa-solid fa-italic"></i>', 'तिरके (Ctrl+I)'],
    underline: ['<i class="fa-solid fa-underline"></i>', 'अधोरेखित (Ctrl+U)'],
    h2: ['H1', 'मोठे शीर्षक (H1)'],
    h3: ['H2', 'मध्यम शीर्षक (H2)'],
    h4: ['H3', 'लहान शीर्षक (H3)'],
    p: ['<i class="fa-solid fa-paragraph"></i>', 'साधा मजकूर'],
    ul: ['<i class="fa-solid fa-list-ul"></i>', 'बुलेट यादी'],
    ol: ['<i class="fa-solid fa-list-ol"></i>', 'क्रमांक यादी'],
    clear: ['<i class="fa-solid fa-text-slash"></i>', 'फॉरमॅटिंग काढा'],
    undo: ['<i class="fa-solid fa-rotate-left"></i>', 'मागे घ्या (Ctrl+Z)'],
    redo: ['<i class="fa-solid fa-rotate-right"></i>', 'पुन्हा करा (Ctrl+Y)']
  };
  const TOOLBAR = {
    full: ['bold', 'italic', 'underline', '|', 'h2', 'h3', 'h4', 'p', '|', 'ul', 'ol', '|', 'clear', 'undo', 'redo'],
    inline: ['bold', 'italic', 'underline', '|', 'clear', 'undo', 'redo']
  };

  const run = (command, value) => document.execCommand(command, false, value);

  // the block (paragraph, heading, list item ...) the cursor is in, or null
  function currentBlock(ed) {
    const sel = window.getSelection();
    let node = sel && sel.rangeCount ? sel.anchorNode : null;
    if (!node || !ed.area.contains(node)) return null;
    for (; node && node !== ed.area; node = node.parentNode) if (/^(P|H2|H3|H4|LI|BLOCKQUOTE|DIV)$/.test(node.nodeName)) return node;
    return null;
  }
  const currentList = (ed) => {
    const block = currentBlock(ed);
    const list = block && block.closest('ul, ol');
    return list && ed.area.contains(list) ? list : null;
  };

  function command(ed, name) {
    ed.area.focus();
    run('styleWithCSS', false);
    if (name === 'bold' || name === 'italic' || name === 'underline' || name === 'undo' || name === 'redo') run(name);
    else if (name === 'ul' || name === 'ol') {
      const block = currentBlock(ed);
      if (block && /^H[234]$/.test(block.nodeName)) run('formatBlock', '<p>');       // a heading becomes an ordinary line first
      run(name === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
    } else {                                                                          // h2 / h3 / h4 / p / clear
      const list = currentList(ed);
      if (list) run(list.nodeName === 'UL' ? 'insertUnorderedList' : 'insertOrderedList');   // out of the list first
      if (name === 'clear') { run('removeFormat'); run('unlink'); }
      if (ed.mode === 'full') {
        const block = currentBlock(ed);
        const same = block && block.nodeName.toLowerCase() === name;                   // pressing the same heading again = ordinary text
        run('formatBlock', `<${name === 'clear' || same ? 'p' : name}>`);
      }
    }
    changed(ed);
    showState(ed);
  }

  function showState(ed) {
    const block = currentBlock(ed);
    const list = currentList(ed);
    ed.buttons.forEach((b) => {
      const name = b.dataset.cmd;
      let on = false;
      if (block) {
        if (name === 'bold' || name === 'italic' || name === 'underline') on = document.queryCommandState(name);
        else if (name === 'ul' || name === 'ol') on = !!list && list.nodeName.toLowerCase() === name;
        else if (/^h[234]$/.test(name)) on = block.nodeName.toLowerCase() === name;
      }
      b.classList.toggle('is-on', !!on);
      if (!/^(clear|undo|redo|p)$/.test(name)) b.setAttribute('aria-pressed', String(!!on));
    });
  }

  function changed(ed) {
    ed.wrap.classList.toggle('is-empty', !ed.area.textContent.trim() && !ed.area.querySelector('img, table, hr, li, h2, h3, h4'));
  }

  function setValue(ed, value) {
    const text = String(value == null ? '' : value);
    const markup = !text.trim() ? '' : looksLikeHtml(text) ? cleanMarkup(text, ed.mode) : textToMarkup(text, ed.mode);
    ed.area.innerHTML = markup.replace(/>\n</g, '><');
    ed.loadedValue = text;
    ed.loadedMarkup = ed.area.innerHTML;
    changed(ed);
  }

  function getValue(ed) {
    if (ed.area.innerHTML === ed.loadedMarkup) return ed.loadedValue;      // not changed: exactly what was saved before
    return saved(ed.area.innerHTML, ed.mode);
  }

  // Pasted text is cleaned on the way in: formatting that may be saved stays, colours / fonts / sizes of the other page do not come along.
  function paste(ed, e) {
    const data = e.clipboardData;
    if (!data) return;
    e.preventDefault();
    const html = data.getData('text/html');
    const text = data.getData('text/plain') || '';
    let markup = '';
    if (html) markup = cleanMarkup(html, ed.mode);
    else if (looksLikeHtml(text)) markup = cleanMarkup(text, ed.mode);                 // HTML source pasted as text
    else if (/\*\*[^*\n]+\*\*/.test(text) || (ed.mode === 'full' && /\n\s*\n/.test(text))) markup = textToMarkup(text, ed.mode);
    if (markup) run('insertHTML', markup);
    else if (text) run('insertText', text);
    changed(ed);
  }

  function build(textarea, mode) {
    const doc = document;
    const wrap = doc.createElement('div');
    wrap.className = `re re-${mode}`;
    const bar = doc.createElement('div');
    bar.className = 're-toolbar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'मजकूर साधने');
    TOOLBAR[mode].forEach((name) => {
      if (name === '|') { const sep = bar.appendChild(doc.createElement('span')); sep.className = 're-sep'; return; }
      const b = bar.appendChild(doc.createElement('button'));
      b.type = 'button';
      b.className = 're-btn';
      b.dataset.cmd = name;
      b.innerHTML = BUTTONS[name][0];
      b.title = BUTTONS[name][1];
      b.setAttribute('aria-label', BUTTONS[name][1]);
    });
    const body = doc.createElement('div');
    body.className = 're-body';
    const area = body.appendChild(doc.createElement('div'));
    area.className = 're-area';
    area.id = `${textarea.id}-editor`;
    area.contentEditable = 'true';
    area.setAttribute('role', 'textbox');
    area.setAttribute('aria-multiline', 'true');
    area.setAttribute('data-no-i18n', '');                                  // the words are the owner's: never translated
    const label = doc.querySelector(`label[for="${textarea.id}"]`);
    if (label) { label.id = label.id || `${textarea.id}-label`; area.setAttribute('aria-labelledby', label.id); }
    const hint = body.appendChild(doc.createElement('div'));
    hint.className = 're-placeholder';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = textarea.getAttribute('placeholder') || '';
    if (textarea.hasAttribute('data-no-i18n')) hint.setAttribute('data-no-i18n', '');
    wrap.append(bar, body);

    const ed = { textarea, mode, wrap, area, buttons: [...bar.querySelectorAll('.re-btn')], loadedValue: '', loadedMarkup: '' };
    const first = textarea.value;
    textarea.after(wrap);
    textarea.hidden = true;
    textarea.required = false;                                              // (a hidden box cannot be "required" by the browser: admin.js checks it)
    Object.defineProperty(textarea, 'value', { configurable: true, get: () => getValue(ed), set: (v) => setValue(ed, v) });
    textarea.focus = () => area.focus();
    if (label) label.addEventListener('click', (e) => { e.preventDefault(); area.focus(); });
    setValue(ed, first);

    bar.addEventListener('mousedown', (e) => e.preventDefault());            // (the selection stays in the text while a button is pressed)
    bar.addEventListener('click', (e) => { const b = e.target.closest('.re-btn'); if (b) command(ed, b.dataset.cmd); });
    area.addEventListener('focus', () => {
      run('defaultParagraphSeparator', 'p');                                 // Enter starts a new paragraph (<p>)
      if (ed.mode === 'full' && !area.firstChild) {                          // the first line is a paragraph too
        const untouched = area.innerHTML === ed.loadedMarkup;
        area.innerHTML = '<p><br></p>';
        if (untouched) ed.loadedMarkup = area.innerHTML;
        const range = doc.createRange();
        range.setStart(area.firstChild, 0);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
    area.addEventListener('input', () => changed(ed));
    area.addEventListener('paste', (e) => paste(ed, e));
    area.addEventListener('drop', (e) => { if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) e.preventDefault(); });   // (a dropped photo is not text)
    area.addEventListener('keydown', (e) => {
      // Ctrl / Cmd + B, I, U - also on a Marathi keyboard layout (e.code names the key, whatever letter it writes)
      const key = { KeyB: 'bold', KeyI: 'italic', KeyU: 'underline' }[e.code];
      if (key && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey) { e.preventDefault(); command(ed, key); return; }
      if (ed.mode === 'inline' && e.key === 'Enter' && !e.isComposing) { e.preventDefault(); run('insertLineBreak'); changed(ed); }
    });
    editors.push(ed);
    return ed;
  }

  function init() {
    BOXES.forEach(([id, mode]) => {
      const textarea = document.getElementById(id);
      if (textarea && textarea.tagName === 'TEXTAREA') build(textarea, mode);
    });
    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      const node = sel && sel.anchorNode;
      const ed = node && editors.find((x) => x.area.contains(node));
      if (ed) showState(ed);
    });
  }

  window.RichEditor = { plain, saved, isEmpty: (value) => !plain(value) && !/<(img|table)\b/i.test(String(value || '')) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
