/*
 * LOKMANGAL ADMIN - the tags (topics) of a news / blog.
 *
 * A box of chips: write a tag and press Enter (or a comma); × removes one, a click on a tag puts it back into the box to change it, and below it are
 * the tags already used in other stories (a click adds one). The hidden input #form-article-tags keeps "tag one, tag two": admin.js reads and sets
 * its .value like any other field. The limits are the same as in the backend (sanitize.py).
 */
(function () {
  'use strict';

  const BOXES = [['form-article-tags', 'tags'], ['form-article-tags-en', 'tags_en']];
  const MAX_TAGS = 15;
  const TAG_LENGTH = 40;
  const SUGGESTED = 12;

  // "भाजप, #सोलापूर " -> ['भाजप', 'सोलापूर']
  const split = (text) => String(text == null ? '' : text).split(',')
    .map((t) => t.replace(/\s+/g, ' ').trim().replace(/^#+/, '').trim()).filter(Boolean);
  const key = (t) => t.normalize('NFC').toLowerCase();                 // (upper / lower case is the same tag)
  const unique = (tags) => tags.filter((t, i) => tags.findIndex((x) => key(x) === key(t)) === i);

  // Adds the tags of `text`; a tag that is too long (or one too many) stays in the entry box to be put right.
  function add(box, text) {
    const left = [];
    let why = '';
    split(text).forEach((tag) => {
      if (box.tags.some((t) => key(t) === key(tag))) return;
      if (tag.length > TAG_LENGTH) why = 'एक टॅग जास्तीत जास्त ४० अक्षरांचा.';
      else if (box.tags.length >= MAX_TAGS) why = 'एका बातमीला जास्तीत जास्त १५ टॅग.';
      else { box.tags.push(tag); return; }
      left.push(tag);
    });
    box.entry.value = left.join(', ');
    if (why) showToast(why, 'error');
    draw(box);
  }

  const button = (className, title) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    if (title) { b.title = title; b.setAttribute('aria-label', title); }
    return b;
  };
  const words = (text) => {                                            // the owner's words: never translated
    const span = document.createElement('span');
    span.setAttribute('data-no-i18n', '');
    span.textContent = text;
    return span;
  };

  // tags of other stories (the most used first) that match what is being written and are not in the box yet
  function suggestions(box) {
    const used = new Map();
    ((typeof appState !== 'undefined' && appState.articles) || []).forEach((a) => split(a[box.field]).forEach((t) => {
      const known = used.get(key(t));
      used.set(key(t), { tag: known ? known.tag : t, count: (known ? known.count : 0) + 1 });
    }));
    const typed = key(box.entry.value.trim().replace(/^#+/, ''));
    return [...used.values()]
      .filter((s) => !box.tags.some((t) => key(t) === key(s.tag)) && (!typed || key(s.tag).includes(typed)))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, SUGGESTED)
      .map((s) => s.tag);
  }

  function drawSuggestions(box) {
    const list = suggestions(box);
    box.suggestList.textContent = '';
    list.forEach((tag) => {
      const b = box.suggestList.appendChild(button('tag-suggestion'));
      b.dataset.tag = tag;
      b.append('+ ', words(tag));
    });
    box.suggest.hidden = !list.length;
  }

  function draw(box) {
    box.list.textContent = '';
    box.tags.forEach((tag, i) => {
      const chip = box.list.appendChild(document.createElement('span'));
      chip.className = 'tag-chip';
      const edit = chip.appendChild(button('tag-chip-text', 'टॅग बदला'));
      edit.dataset.index = i;
      edit.appendChild(words(tag));
      const remove = chip.appendChild(button('tag-chip-remove', 'टॅग काढा'));
      remove.dataset.index = i;
      remove.textContent = '×';
    });
    drawSuggestions(box);
  }

  function build(input, field) {
    const wrap = document.createElement('div');
    wrap.className = 'tag-box';
    const line = wrap.appendChild(document.createElement('div'));
    line.className = 'tag-line';
    const list = line.appendChild(document.createElement('span'));
    list.className = 'tag-list';
    const entry = line.appendChild(document.createElement('input'));
    entry.type = 'text';
    entry.id = `${input.id}-input`;                                    // (the field's <label for="...-input">)
    entry.className = 'tag-entry';
    entry.autocomplete = 'off';
    entry.maxLength = 300;
    entry.setAttribute('enterkeyhint', 'done');
    entry.placeholder = input.dataset.placeholder || '';
    const suggest = wrap.appendChild(document.createElement('div'));
    suggest.className = 'tag-suggest';
    const label = suggest.appendChild(document.createElement('span'));
    label.className = 'tag-suggest-label';
    label.textContent = 'वापरलेले टॅग:';
    const suggestList = suggest.appendChild(document.createElement('span'));
    suggestList.className = 'tag-suggest-list';
    input.after(wrap);

    const box = { input, field, tags: [], wrap, list, entry, suggest, suggestList };
    Object.defineProperty(input, 'value', {
      configurable: true,
      get: () => unique([...box.tags, ...split(entry.value)]).join(', '),           // (a tag still being written counts too)
      set: (v) => { box.tags = unique(split(v)); entry.value = ''; draw(box); }
    });

    wrap.addEventListener('mousedown', (e) => { if (e.target.closest('button')) e.preventDefault(); });      // (the entry box keeps its text and cursor)
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) { entry.focus(); return; }
      if (b.classList.contains('tag-suggestion')) { entry.value = ''; add(box, b.dataset.tag); }
      else {
        const [tag] = box.tags.splice(Number(b.dataset.index), 1);
        if (b.classList.contains('tag-chip-text')) {                        // change it: what was being written is kept as a tag first
          const pending = entry.value;
          if (pending.trim()) add(box, pending);
          entry.value = tag;
        }
        draw(box);
      }
      entry.focus();
    });
    entry.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ',') && !e.isComposing) { e.preventDefault(); add(box, entry.value); }     // (Enter must not save the form)
      else if (e.key === 'Backspace' && !entry.value && box.tags.length) { box.tags.pop(); draw(box); }
    });
    entry.addEventListener('input', () => { if (entry.value.includes(',')) add(box, entry.value); else drawSuggestions(box); });    // (a pasted list)
    entry.addEventListener('blur', () => { if (entry.value.trim()) add(box, entry.value); });
    draw(box);
    boxes.push(box);
  }

  const boxes = [];

  function init() {
    BOXES.forEach(([id, field]) => {
      const input = document.getElementById(id);
      if (input) build(input, field);
    });
  }

  window.TagBox = { split };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
