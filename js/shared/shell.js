/* ===== כללי — שער כניסה + מעבר בין מחוללים + סרגל כלים ===== */
(function (global) {
  const GENERATOR_MANHALAN = 'manhalan';
  const GENERATOR_PACK = 'pack';
  const EDIT_SESSION_KEY = 'hebet-edit-mode';
  const RESUME_GENERATOR_KEY = 'hebet-resume-generator';
  const MANHALAN_BOOTSTRAP_ID = 'hebet-bootstrap';
  const PACK_BOOTSTRAP_ID = 'hebet-pack-bootstrap';

  const enterListeners = [];

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  }

  function isGateOpen() {
    const gate = document.getElementById('siteGate');
    return !!(gate && !gate.hidden && document.body.classList.contains('gate-open'));
  }

  function getGenerator() {
    return String(document.body.getAttribute('data-generator') || '');
  }

  function isUserMode() {
    return document.body.classList.contains('user-mode') ||
      document.body.getAttribute('data-app-mode') === 'user';
  }

  function loadEditSession() {
    try {
      const parsed = JSON.parse(localStorage.getItem(EDIT_SESSION_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveEditSession(map) {
    try {
      localStorage.setItem(EDIT_SESSION_KEY, JSON.stringify(map));
    } catch (_) {}
  }

  function getSavedEditMode(generator) {
    if (!generator) return false;
    return !!loadEditSession()[generator];
  }

  function setSavedEditMode(generator, value) {
    if (!generator || isUserMode()) return;
    const map = loadEditSession();
    map[generator] = !!value;
    saveEditSession(map);
  }

  function captureEditMode() {
    const generator = getGenerator();
    if (!generator || isGateOpen() || isUserMode()) return;
    setSavedEditMode(generator, document.body.classList.contains('page-edit-mode'));
  }

  function clearEditModeVisual() {
    document.body.classList.remove('page-edit-mode');
    const btn = document.getElementById('btnEdit');
    if (btn) {
      btn.classList.remove('active');
      btn.textContent = 'עריכה';
    }
  }

  function applyGenerator(name) {
    const generator = name === GENERATOR_PACK ? GENERATOR_PACK : GENERATOR_MANHALAN;
    document.body.setAttribute('data-generator', generator);
    document.body.classList.toggle('is-manhalan', generator === GENERATOR_MANHALAN);
    document.body.classList.toggle('is-pack', generator === GENERATOR_PACK);

    const manhalan = document.getElementById('manhalanApp');
    const pack = document.getElementById('packApp');
    if (manhalan) manhalan.hidden = generator !== GENERATOR_MANHALAN;
    if (pack) pack.hidden = generator !== GENERATOR_PACK;

    const toolbar = document.getElementById('siteToolbar');
    const userMode = document.body.classList.contains('user-mode') ||
      document.body.getAttribute('data-app-mode') === 'user';
    if (toolbar && !userMode) toolbar.hidden = false;
    syncToolbarBrand(generator);
  }

  function syncToolbarBrand(generator) {
    const brand = document.getElementById('siteToolbarBrand');
    if (!brand) return;
    brand.textContent = generator === GENERATOR_PACK ? 'מחולל מארזים' : 'מחולל מנהלנים';
  }

  function notifyEnter(name) {
    enterListeners.slice().forEach(function (fn) {
      try { fn(name); } catch (err) { console.warn(err); }
    });
    document.dispatchEvent(new CustomEvent('hebet:generator-enter', {
      detail: { generator: name },
    }));
  }

  function onEnter(fn) {
    if (typeof fn === 'function') enterListeners.push(fn);
  }

  function dismissGate(onDone) {
    const gate = document.getElementById('siteGate');
    const finish = function () {
      document.body.classList.remove('gate-open', 'gate-leaving');
      if (gate) gate.hidden = true;
      if (typeof onDone === 'function') onDone();
    };

    if (!isGateOpen()) {
      finish();
      return;
    }

    if (!gate || prefersReducedMotion()) {
      finish();
      return;
    }

    document.body.classList.add('gate-leaving');
    let done = false;
    const once = function () {
      if (done) return;
      done = true;
      finish();
    };
    gate.addEventListener('transitionend', once);
    setTimeout(once, 420);
  }

  function enterGenerator(name) {
    const generator = name === GENERATOR_PACK ? GENERATOR_PACK : GENERATOR_MANHALAN;
    dismissGate(function () {
      applyGenerator(generator);
      notifyEnter(generator);
    });
  }

  function replayGateEntrance() {
    const inner = document.querySelector('.site-gate-inner');
    if (!inner) return;
    inner.style.animation = 'none';
    void inner.offsetWidth;
    inner.style.animation = '';
  }

  function showGate() {
    if (isUserMode()) return;
    if (isGateOpen()) return;
    const gate = document.getElementById('siteGate');
    if (!gate) return;

    captureEditMode();
    document.dispatchEvent(new CustomEvent('hebet:generator-exit', {
      detail: { generator: getGenerator() },
    }));
    clearEditModeVisual();

    const toolbar = document.getElementById('siteToolbar');
    if (toolbar) toolbar.hidden = true;

    gate.hidden = false;
    document.body.classList.remove('gate-leaving');
    document.body.classList.add('gate-open');
    replayGateEntrance();

    const manhalanBtn = document.getElementById('siteGateEnter');
    try { if (manhalanBtn) manhalanBtn.focus(); } catch (_) {}
  }

  function bindGate() {
    const manhalanBtn = document.getElementById('siteGateEnter');
    const packBtn = document.getElementById('siteGatePack');
    if (manhalanBtn) {
      manhalanBtn.addEventListener('click', function () {
        enterGenerator(GENERATOR_MANHALAN);
      });
    }
    if (packBtn) {
      packBtn.addEventListener('click', function () {
        enterGenerator(GENERATOR_PACK);
      });
    }
    if (isGateOpen() && manhalanBtn) {
      try { manhalanBtn.focus(); } catch (_) {}
    }
  }

  bindGate();

  if (isUserMode()) {
    const gate = document.getElementById('siteGate');
    if (gate) gate.hidden = true;
    document.body.classList.remove('gate-open', 'gate-leaving');
    const name = getGenerator() === GENERATOR_PACK ? GENERATOR_PACK : GENERATOR_MANHALAN;
    applyGenerator(name);
  } else if (!isGateOpen()) {
    const name = getGenerator() === GENERATOR_PACK ? GENERATOR_PACK : GENERATOR_MANHALAN;
    applyGenerator(name);
  }

  function setResumeGenerator(generator) {
    const name = generator === GENERATOR_PACK ? GENERATOR_PACK : GENERATOR_MANHALAN;
    try { sessionStorage.setItem(RESUME_GENERATOR_KEY, name); } catch (_) {}
  }

  function consumeResumeGenerator() {
    if (isUserMode()) return;
    let resume = '';
    try {
      resume = sessionStorage.getItem(RESUME_GENERATOR_KEY) || '';
      if (resume) sessionStorage.removeItem(RESUME_GENERATOR_KEY);
    } catch (_) {
      return;
    }
    if (resume !== GENERATOR_PACK && resume !== GENERATOR_MANHALAN) return;
    enterGenerator(resume);
  }

  async function pickClientHtmlOpen() {
    if (typeof window.showOpenFilePicker === 'function') {
      try {
        const handles = await window.showOpenFilePicker({
          multiple: false,
          types: [{
            description: 'גרסת לקוח (HTML)',
            accept: { 'text/html': ['.html', '.htm'] },
          }],
        });
        const handle = handles && handles[0];
        if (!handle) return null;
        return await handle.getFile();
      } catch (err) {
        if (err && err.name === 'AbortError') return null;
        console.warn('showOpenFilePicker failed, falling back to file input', err);
      }
    }
    return 'input';
  }

  function serializeBootstrapJson(data) {
    return JSON.stringify(data)
      .replace(/</g, '\\u003c')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }

  function parseJsonScript(doc, id) {
    const el = doc.getElementById(id);
    if (!el) return null;
    const text = String(el.textContent || '').trim();
    if (!text) return null;
    return JSON.parse(text);
  }

  function parseClientExportHtml(htmlText) {
    const html = String(htmlText || '');
    if (!html.trim()) throw new Error('הקובץ ריק');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let manhalan = null;
    let pack = null;
    try {
      manhalan = parseJsonScript(doc, MANHALAN_BOOTSTRAP_ID);
    } catch (_) {
      throw new Error('נתוני המנהלן בקובץ פגומים');
    }
    try {
      pack = parseJsonScript(doc, PACK_BOOTSTRAP_ID);
    } catch (_) {
      throw new Error('נתוני המארז בקובץ פגומים');
    }

    const bodyGen = doc.body ? String(doc.body.getAttribute('data-generator') || '') : '';
    if (bodyGen === GENERATOR_PACK && pack && pack.pack) {
      return { generator: GENERATOR_PACK, snapshot: pack };
    }
    if (bodyGen === GENERATOR_MANHALAN && manhalan && manhalan.home) {
      return { generator: GENERATOR_MANHALAN, snapshot: manhalan };
    }
    if (pack && pack.pack) return { generator: GENERATOR_PACK, snapshot: pack };
    if (manhalan && manhalan.home && Array.isArray(manhalan.cards)) {
      return { generator: GENERATOR_MANHALAN, snapshot: manhalan };
    }

    throw new Error(
      'לא נמצאו נתוני עריכה בקובץ גרסת הלקוח.\n' +
      'ייצאו שוב מהמחולל ואז טענו את הקובץ החדש.'
    );
  }

  async function pickClientHtmlSave(suggestedName) {
    if (!window.showSaveFilePicker) return 'download';
    try {
      return await window.showSaveFilePicker({
        suggestedName: suggestedName,
        startIn: 'documents',
        types: [{
          description: 'גרסת לקוח (HTML)',
          accept: { 'text/html': ['.html'] },
        }],
      });
    } catch (err) {
      if (err && err.name === 'AbortError') return null;
      console.warn('showSaveFilePicker failed, falling back to download', err);
      return 'download';
    }
  }

  async function writeClientHtml(target, html, suggestedName) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    if (target && target !== 'download' && typeof target.createWritable === 'function') {
      const writable = await target.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName || 'גרסת-לקוח.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  }

  function applyClientExportShell(html, generator) {
    const gen = generator === GENERATOR_PACK ? GENERATOR_PACK : GENERATOR_MANHALAN;
    let out = String(html || '');
    out = out.replace(
      /<body\b[^>]*>/i,
      '<body data-app-mode="user" class="user-mode is-' + gen + '" data-generator="' + gen + '">'
    );
    out = out.replace(
      '<div class="site-gate" id="siteGate"',
      '<div class="site-gate" id="siteGate" hidden'
    );
    out = out.replace(
      '<div class="site-toolbar-shell" id="siteToolbar">',
      '<div class="site-toolbar-shell" id="siteToolbar" hidden>'
    );
    return out;
  }

  function cssTextFromLoadedSheets() {
    const chunks = [];
    const styles = document.querySelectorAll('style');
    for (let i = 0; i < styles.length; i++) chunks.push(styles[i].textContent || '');
    const sheets = document.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        const parts = [];
        for (let j = 0; j < rules.length; j++) parts.push(rules[j].cssText);
        if (parts.length) chunks.push(parts.join('\n'));
      } catch (_) {}
    }
    return chunks.join('\n\n').trim();
  }

  async function readProjectText(path) {
    const candidates = [path];
    try { candidates.push(new URL(path, location.href).href); } catch (_) {}
    let lastErr = null;
    for (let i = 0; i < candidates.length; i++) {
      try {
        const res = await fetch(candidates[i], { cache: 'no-store' });
        if (res.ok) return await res.text();
        lastErr = new Error('לא ניתן לקרוא ' + path);
      } catch (err) {
        lastErr = err;
      }
    }
    if (/\.css(\?|$)/i.test(path) || String(path).indexOf('.css') !== -1) {
      const loaded = cssTextFromLoadedSheets();
      if (loaded) return loaded;
    }
    throw lastErr || new Error('לא ניתן לקרוא ' + path);
  }

  async function blobToDataUrl(url) {
    if (!url || String(url).indexOf('blob:') !== 0) return url;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.onload = function () { resolve(String(reader.result || '')); };
        reader.onerror = function () { reject(reader.error); };
        reader.readAsDataURL(blob);
      });
    } catch (_) {
      return url;
    }
  }

  async function rewriteBlobUrlsInText(text) {
    const src = String(text || '');
    const re = /blob:[a-zA-Z0-9+._\-:/?%=&]+/g;
    const found = src.match(re) || [];
    const unique = [];
    for (let i = 0; i < found.length; i++) {
      if (unique.indexOf(found[i]) === -1) unique.push(found[i]);
    }
    let out = src;
    for (let i = 0; i < unique.length; i++) {
      const data = await blobToDataUrl(unique[i]);
      out = out.split(unique[i]).join(data);
    }
    return out;
  }

  async function inlineBlobMedia(root) {
    const nodes = root.querySelectorAll('img, source, video, audio');
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      if (el.src) el.src = await blobToDataUrl(el.src);
      if (el.poster) el.poster = await blobToDataUrl(el.poster);
    }
    const styled = root.querySelectorAll('[style]');
    for (let i = 0; i < styled.length; i++) {
      const css = styled[i].getAttribute('style');
      if (css && css.indexOf('blob:') !== -1) {
        styled[i].setAttribute('style', await rewriteBlobUrlsInText(css));
      }
    }
  }

  function stripEditorUi(root) {
    const selectors = [
      '#siteToolbar', '#siteGate', '#hslaPopover',
      '#homeEditOverlay', '#detailOverlay', '#modalOverlay', '#packEditOverlay',
      '.home-section-edit', '.home-section-dup', '.home-section-delete', '.home-section-restore',
      '.home-resize-handle', '.float-menu-edit', '.cards-layout-bar', '.cards-editor-mount',
      '.pack-section-edit', '.pack-header-resize', '.pack-cards-resize', '.pack-closing-resize',
      '.pack-header-drop', '.pack-card-edit', '.pack-card-delete', '.card-edit',
    ];
    const found = root.querySelectorAll(selectors.join(','));
    for (let i = 0; i < found.length; i++) {
      if (found[i] && found[i].parentNode) found[i].parentNode.removeChild(found[i]);
    }
    const editable = root.querySelectorAll('[contenteditable]');
    for (let i = 0; i < editable.length; i++) {
      editable[i].removeAttribute('contenteditable');
      editable[i].removeAttribute('spellcheck');
    }
  }

  function copyComputedStyles(fromRoot, toRoot) {
    if (!fromRoot || !toRoot) return;
    const from = [fromRoot].concat(Array.prototype.slice.call(fromRoot.querySelectorAll('*')));
    const to = [toRoot].concat(Array.prototype.slice.call(toRoot.querySelectorAll('*')));
    const n = Math.min(from.length, to.length);
    for (let i = 0; i < n; i++) {
      const cs = window.getComputedStyle(from[i]);
      let css = '';
      for (let j = 0; j < cs.length; j++) {
        const prop = cs[j];
        if (prop.indexOf('-webkit-') === 0) continue;
        css += prop + ':' + cs.getPropertyValue(prop) + ';';
      }
      if (css) to[i].setAttribute('style', css);
    }
  }

  async function buildLiveClientHtml(generator, snapshot) {
    const gen = generator === GENERATOR_PACK ? GENERATOR_PACK : GENERATOR_MANHALAN;
    const appId = gen === GENERATOR_PACK ? 'packApp' : 'manhalanApp';
    const otherId = gen === GENERATOR_PACK ? 'manhalanApp' : 'packApp';
    const prevClass = document.body.className;
    const prevMode = document.body.getAttribute('data-app-mode');

    document.body.classList.add('user-mode');
    document.body.classList.remove('page-edit-mode', 'gate-open', 'gate-leaving');
    document.body.setAttribute('data-app-mode', 'user');
    void document.body.offsetHeight;

    let clone;
    let cssText = '';
    try {
      clone = document.documentElement.cloneNode(true);
      cssText = cssTextFromLoadedSheets();
      if (!cssText) {
        const cloneBody = clone.querySelector('body');
        if (cloneBody) copyComputedStyles(document.body, cloneBody);
      }
    } finally {
      document.body.className = prevClass;
      if (prevMode == null) document.body.removeAttribute('data-app-mode');
      else document.body.setAttribute('data-app-mode', prevMode);
    }

    const scripts = clone.querySelectorAll('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].parentNode) scripts[i].parentNode.removeChild(scripts[i]);
    }

    const localLinks = clone.querySelectorAll('link[rel="stylesheet"]');
    for (let i = 0; i < localLinks.length; i++) {
      const href = String(localLinks[i].getAttribute('href') || '');
      if (/^https?:/i.test(href)) continue;
      if (localLinks[i].parentNode) localLinks[i].parentNode.removeChild(localLinks[i]);
    }

    const cloneApp = clone.querySelector('#' + appId);

    stripEditorUi(clone);
    await inlineBlobMedia(clone);

    if (cloneApp) cloneApp.removeAttribute('hidden');
    const other = clone.querySelector('#' + otherId);
    if (other && other.parentNode) other.parentNode.removeChild(other);

    const head = clone.querySelector('head') || clone;
    if (cssText) {
      cssText = await rewriteBlobUrlsInText(cssText);
      const style = document.createElement('style');
      style.textContent = cssText +
        '\nbody.user-mode .site-toolbar-shell,#siteToolbar,.home-section-edit,.pack-section-edit{display:none!important}';
      head.appendChild(style);
    }

    const body = clone.querySelector('body');
    if (body) {
      body.setAttribute('data-app-mode', 'user');
      body.setAttribute('data-generator', gen);
      body.className = 'user-mode is-' + gen;
      if (cssText) {
        const liveCss = document.body.style.cssText;
        if (liveCss) body.style.cssText = await rewriteBlobUrlsInText(liveCss);
      }
    }

    if (snapshot && typeof snapshot === 'object') {
      const boot = document.createElement('script');
      boot.id = gen === GENERATOR_PACK ? PACK_BOOTSTRAP_ID : MANHALAN_BOOTSTRAP_ID;
      boot.type = 'application/json';
      boot.textContent = serializeBootstrapJson(snapshot);
      if (body) body.appendChild(boot);
      else clone.appendChild(boot);
    }

    const clientJs = document.createElement('script');
    clientJs.textContent =
      'document.addEventListener("click",function(e){' +
      'var b=e.target&&e.target.closest&&e.target.closest("[data-print-href]");' +
      'if(!b)return;e.preventDefault();var h=b.getAttribute("data-print-href");' +
      'if(h)window.open(h,"_blank","noopener,noreferrer");else window.print();});';
    if (body) body.appendChild(clientJs);
    else clone.appendChild(clientJs);

    return '<!DOCTYPE html>\n' + clone.outerHTML;
  }

  global.HebetShell = {
    MANHALAN: GENERATOR_MANHALAN,
    PACK: GENERATOR_PACK,
    isGateOpen: isGateOpen,
    getGenerator: getGenerator,
    enterGenerator: enterGenerator,
    applyGenerator: applyGenerator,
    showGate: showGate,
    onEnter: onEnter,
    getSavedEditMode: getSavedEditMode,
    setSavedEditMode: setSavedEditMode,
    captureEditMode: captureEditMode,
    pickClientHtmlSave: pickClientHtmlSave,
    pickClientHtmlOpen: pickClientHtmlOpen,
    writeClientHtml: writeClientHtml,
    applyClientExportShell: applyClientExportShell,
    parseClientExportHtml: parseClientExportHtml,
    setResumeGenerator: setResumeGenerator,
    consumeResumeGenerator: consumeResumeGenerator,
    readProjectText: readProjectText,
    buildLiveClientHtml: buildLiveClientHtml,
  };
})(window);
