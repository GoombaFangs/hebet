/* =====================================================================
   מחולל מארז — קובץ עצמאי ומלא (כותרת + לוגואים + קוביות + סגירה).
   אין תלות בקוד/קלאסים של js/manhalan/app.js מעבר לרכיב הצבע הכללי
   שנחשף בתור window.HebetColor (ראו js/manhalan/app.js, בלוק "כללי").
   ===================================================================== */
(function () {
  const STORAGE_KEY = 'hebet-pack';
  const PACK_BOOTSTRAP_ID = 'hebet-pack-bootstrap';
  const PACK_BOOTSTRAP_VERSION = 1;
  const PACK_EXPORT_FILENAME = 'גרסת-לקוח-מארז.html';
  const HEIGHT_MIN = 72;
  const HEIGHT_MAX = 320;
  const FREE_HEIGHT_MIN = 240;
  const FREE_HEIGHT_MAX = 1200;
  const CLOSING_HEIGHT_MIN = 64;
  const CLOSING_HEIGHT_MAX = 400;
  const DEFAULT_HEADER_COLOR = '#3d403c';
  const DEFAULT_CARD_COLOR = '#3d403c';
  const DEFAULT_SITE_FONT = "'NarkisBlockCondensedMF', 'Heebo', sans-serif";
  const DEFAULT_THEME = {
    siteBgColor: '#ffffff',
    siteBgImage: '',
    siteFont: DEFAULT_SITE_FONT,
  };
  const MAX_IMAGE_BYTES = 1.8 * 1024 * 1024;
  const ICON_GLYPHS = ['🎓', '▶', '🖥', '⬇', '🖨', '📄', '⚙', '★', '📷', '🧭', '📊', '🔧'];
  const ACTION_DEFAULT_GLYPH = { view: '▶', download: '⬇', print: '🖨' };
  const ACTION_LABELS = { view: 'צפייה', download: 'הורדה', print: 'הדפסה' };
  const ACTION_DEFAULT_POS = {
    view: { x: 36, y: 118 },
    download: { x: 50, y: 118 },
    print: { x: 64, y: 118 },
  };
  const CLOSING_ICON_SIZE_MIN = 8;
  const CLOSING_ICON_SIZE_MAX = 240;
  const CARD_ICON_SIZE_MIN = 12;
  const CARD_ICON_SIZE_MAX = 160;
  const CARD_OVERLAY_POS_MIN = -60;
  const CARD_OVERLAY_POS_MAX = 160;
  const CARD_SNAP_PX = 7;

  const DEFAULT_STATE = {
    header: {
      mode: 'color', // 'transparent' | 'color' | 'image'
      color: DEFAULT_HEADER_COLOR,
      image: '',
      opacity: 100,
      height: 108,
      hidden: false,
      textFreeform: true,
      title: { text: '', size: 30, color: '#ffffff', align: 'center', x: 50, y: 40, freePlaced: false, hidden: false },
      subtitle: { text: '', size: 15, color: '#ffffff', align: 'center', x: 50, y: 68, freePlaced: false, hidden: false },
      logos: [],
    },
    cards: {
      perRow: 4,
      gap: 16,
      freeform: true,
      freeHeight: 420,
      items: [],
    },
    closing: {
      enabled: false,
      hidden: false,
      label: 'צוות פיתוח',
      href: '',
      color: '#3d403c',
      textColor: '#ffffff',
      size: 100,
      radius: 12,
      image: '',
      x: 88,
      y: 50,
      height: 78,
      icons: [],
    },
    theme: {
      siteBgColor: '#ffffff',
      siteBgImage: '',
      siteFont: DEFAULT_SITE_FONT,
    },
  };

  let state = cloneState(DEFAULT_STATE);
  let snapshotJSON = null;
  let saveTimer = 0;
  let bound = false;
  let uid = 1;

  /* ---------- כלים כלליים ---------- */

  function nextId(prefix) {
    uid += 1;
    return prefix + '-' + Date.now().toString(36) + '-' + uid;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function clamp(n, min, max, fallback) {
    const value = Number(n);
    if (!Number.isFinite(value)) return fallback != null ? fallback : min;
    return Math.min(max, Math.max(min, Math.round(value)));
  }

  function clampOpacity(n) {
    return clamp(n, 0, 100, 100);
  }

  function clampHeight(n) {
    return clamp(n, HEIGHT_MIN, HEIGHT_MAX, 108);
  }

  function clampFreeHeight(n) {
    return clamp(n, FREE_HEIGHT_MIN, FREE_HEIGHT_MAX, 420);
  }

  function clampFreeWidth(n) {
    return clamp(n, 10, 28, 18);
  }

  function cssUrl(value) {
    if (!value) return 'none';
    return 'url(' + JSON.stringify(value) + ')';
  }

  function cloneState(src) {
    return JSON.parse(JSON.stringify(src || {}));
  }

  function normalizeTheme(raw, fallback) {
    const src = raw && typeof raw === 'object' ? raw : (fallback && typeof fallback === 'object' ? fallback : {});
    const font = typeof src.siteFont === 'string' && src.siteFont.trim()
      ? src.siteFont
      : DEFAULT_SITE_FONT;
    return {
      siteBgColor: typeof src.siteBgColor === 'string' && src.siteBgColor ? src.siteBgColor : DEFAULT_THEME.siteBgColor,
      siteBgImage: typeof src.siteBgImage === 'string' ? src.siteBgImage : '',
      siteFont: String(font).replace(/"/g, "'"),
    };
  }

  function normalizeAlign(value) {
    return value === 'start' || value === 'end' ? value : 'center';
  }

  function normalizeText(header) {
    const t = header && header.title && typeof header.title === 'object' ? header.title : {};
    const s = header && header.subtitle && typeof header.subtitle === 'object' ? header.subtitle : {};
    return {
      title: {
        text: typeof t.text === 'string' ? t.text.slice(0, 90) : '',
        size: clamp(t.size, 14, 72, 30),
        color: t.color || '#ffffff',
        align: normalizeAlign(t.align),
        x: clamp(t.x, 0, 100, 50),
        y: clamp(t.y, 0, 100, 40),
        freePlaced: !!t.freePlaced,
        hidden: !!t.hidden,
      },
      subtitle: {
        text: typeof s.text === 'string' ? s.text.slice(0, 140) : '',
        size: clamp(s.size, 10, 40, 15),
        color: s.color || '#ffffff',
        align: normalizeAlign(s.align),
        x: clamp(s.x, 0, 100, 50),
        y: clamp(s.y, 0, 100, 68),
        freePlaced: !!s.freePlaced,
        hidden: !!s.hidden,
      },
    };
  }

  function normalizeLogo(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      id: src.id || nextId('logo'),
      src: typeof src.src === 'string' ? src.src : '',
      x: clamp(src.x, 0, 100, 15),
      y: clamp(src.y, 0, 100, 50),
      size: clamp(src.size, 20, 220, 56),
    };
  }

  function normalizeHeader(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const text = normalizeText(src);
    const mode = src.mode === 'image' ? 'image' : (src.mode === 'transparent' ? 'transparent' : 'color');
    return {
      mode: mode,
      color: src.color || DEFAULT_HEADER_COLOR,
      image: typeof src.image === 'string' ? src.image : '',
      opacity: clampOpacity(src.opacity),
      height: clampHeight(src.height),
      hidden: !!(src.hidden || (src.title && src.title.hidden)),
      textFreeform: true,
      title: text.title,
      subtitle: text.subtitle,
      logos: Array.isArray(src.logos) ? src.logos.map(normalizeLogo).filter(function (l) { return !!l.src; }) : [],
    };
  }

  function normalizeActionIcon(raw, kind) {
    const src = raw && typeof raw === 'object' ? raw : {};
    if (src.type === 'image' && src.value) {
      return { type: 'image', value: String(src.value) };
    }
    return { type: 'glyph', value: ACTION_DEFAULT_GLYPH[kind] || '●' };
  }

  function normalizeAction(raw, kind) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const pos = ACTION_DEFAULT_POS[kind] || ACTION_DEFAULT_POS.download;
    return {
      enabled: !!src.enabled,
      href: typeof src.href === 'string' ? src.href.slice(0, 600) : '',
      icon: normalizeActionIcon(src.icon, kind),
      x: clamp(src.x, CARD_OVERLAY_POS_MIN, CARD_OVERLAY_POS_MAX, pos.x),
      y: clamp(src.y, CARD_OVERLAY_POS_MIN, CARD_OVERLAY_POS_MAX, pos.y),
    };
  }

  function normalizeCardIcon(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    if (src.type === 'image' && src.value) {
      return { type: 'image', value: String(src.value) };
    }
    return { type: 'glyph', value: ICON_GLYPHS.indexOf(src.value) !== -1 ? src.value : ICON_GLYPHS[0] };
  }

  function clampCardIconSize(n) {
    return clamp(n, CARD_ICON_SIZE_MIN, CARD_ICON_SIZE_MAX, 36);
  }

  function normalizeDecorIcon(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const isImage = src.type === 'image' && src.value;
    return {
      id: src.id || nextId('cico'),
      type: isImage ? 'image' : 'glyph',
      value: isImage
        ? String(src.value)
        : (typeof src.value === 'string' && src.value.trim()
          ? src.value.slice(0, 8)
          : ICON_GLYPHS[0]),
      x: clamp(src.x, CARD_OVERLAY_POS_MIN, CARD_OVERLAY_POS_MAX, 50),
      y: clamp(src.y, CARD_OVERLAY_POS_MIN, CARD_OVERLAY_POS_MAX, 14),
      size: clampCardIconSize(src.size),
    };
  }

  function normalizeCardIcons(src) {
    if (Array.isArray(src.icons)) return src.icons.map(normalizeDecorIcon);
    if (src.icon) return [normalizeDecorIcon(normalizeCardIcon(src.icon))];
    return [];
  }

  function normalizeCardBgMode(value) {
    return value === 'image' ? 'image' : 'color';
  }

  function normalizeCard(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      id: src.id || nextId('card'),
      icons: normalizeCardIcons(src),
      title: typeof src.title === 'string' ? src.title.slice(0, 40) : 'קובייה חדשה',
      titleSize: clamp(src.titleSize, 12, 34, 16),
      titleColor: src.titleColor || '#ffffff',
      desc: typeof src.desc === 'string' ? src.desc.slice(0, 140) : '',
      descSize: clamp(src.descSize, 10, 22, 13),
      descColor: src.descColor || '#ffffff',
      titleHidden: !!src.titleHidden,
      descHidden: !!src.descHidden,
      comingSoon: !!src.comingSoon,
      bgMode: normalizeCardBgMode(src.bgMode),
      color: src.color || DEFAULT_CARD_COLOR,
      image: typeof src.image === 'string' ? src.image : '',
      actions: {
        view: normalizeAction(src.actions && src.actions.view, 'view'),
        download: normalizeAction(src.actions && src.actions.download, 'download'),
        print: normalizeAction(src.actions && src.actions.print, 'print'),
      },
      x: clamp(src.x, 0, 100, 50),
      y: clamp(src.y, 0, 100, 50),
      w: clampFreeWidth(src.w),
      freePlaced: !!src.freePlaced,
    };
  }

  function normalizeCards(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      perRow: clamp(src.perRow, 2, 6, 4),
      gap: clamp(src.gap, 0, 48, 16),
      freeform: src.freeform == null ? true : !!src.freeform,
      freeHeight: clampFreeHeight(src.freeHeight),
      items: Array.isArray(src.items) ? src.items.map(normalizeCard) : [],
    };
  }

  function normalizeClosingIcon(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    if (src.kind === 'text' || src.type === 'text') {
      return {
        id: src.id || nextId('ctext'),
        kind: 'text',
        value: typeof src.value === 'string' && src.value.trim() ? src.value.slice(0, 80) : 'טקסט',
        href: typeof src.href === 'string' ? src.href.slice(0, 600) : '',
        x: clamp(src.x, 0, 100, 18),
        y: clamp(src.y, 0, 100, 50),
        size: clamp(src.size, 10, 72, 18),
        color: src.color || '#222222',
      };
    }
    const isImage = src.type === 'image' && src.value;
    return {
      id: src.id || nextId('cicon'),
      kind: 'icon',
      type: isImage ? 'image' : 'glyph',
      value: isImage
        ? String(src.value)
        : (typeof src.value === 'string' && src.value.trim()
          ? src.value.slice(0, 8)
          : ICON_GLYPHS[0]),
      href: typeof src.href === 'string' ? src.href.slice(0, 600) : '',
      x: clamp(src.x, 0, 100, 18),
      y: clamp(src.y, 0, 100, 50),
      size: clampClosingIconSize(src.size),
    };
  }

  function clampClosingHeight(n) {
    return clamp(n, CLOSING_HEIGHT_MIN, CLOSING_HEIGHT_MAX, 78);
  }

  function clampClosingIconSize(n) {
    return clamp(n, CLOSING_ICON_SIZE_MIN, CLOSING_ICON_SIZE_MAX, 40);
  }

  function clampDevTeamSize(n) {
    return clamp(n, 70, 180, 100);
  }

  function clampDevTeamRadius(n) {
    return clamp(n, 0, 40, 12);
  }

  function isClosingHidden() {
    return !!(state.closing && state.closing.hidden);
  }

  function normalizeClosing(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      enabled: !!src.enabled,
      hidden: !!src.hidden,
      label: typeof src.label === 'string' && src.label.trim() ? src.label.slice(0, 40) : 'צוות פיתוח',
      labelSize: clamp(src.labelSize, 12, 28, 14),
      href: typeof src.href === 'string' ? src.href.slice(0, 600) : '',
      color: src.color || '#3d403c',
      textColor: src.textColor || '#ffffff',
      size: clampDevTeamSize(src.size),
      radius: clampDevTeamRadius(src.radius),
      image: typeof src.image === 'string' ? src.image : '',
      x: clamp(src.x, 0, 100, 88),
      y: clamp(src.y, 0, 100, 50),
      height: clampClosingHeight(src.height),
      icons: Array.isArray(src.icons) ? src.icons.map(normalizeClosingIcon) : [],
    };
  }

  function normalizeState(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      header: normalizeHeader(src.header),
      cards: normalizeCards(src.cards),
      closing: normalizeClosing(src.closing),
      theme: normalizeTheme(src.theme),
    };
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      state = saved ? normalizeState(JSON.parse(saved)) : cloneState(DEFAULT_STATE);
    } catch (_) {
      state = cloneState(DEFAULT_STATE);
    }
  }

  function persistNow() {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
      alert('אין מספיק מקום לשמירה. נסו תמונה קטנה יותר.');
      return false;
    }
    return true;
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistNow, 200);
  }

  function applyPackThemeToDom() {
    const theme = normalizeTheme(state && state.theme, DEFAULT_THEME);
    if (window.HebetChrome && typeof window.HebetChrome.applyTheme === 'function') {
      window.HebetChrome.applyTheme(theme);
      return;
    }
    document.body.style.setProperty('--site-bg-color', theme.siteBgColor);
    document.body.style.setProperty(
      '--site-bg-image',
      theme.siteBgImage ? 'url(' + JSON.stringify(theme.siteBgImage) + ')' : 'none'
    );
    document.body.style.setProperty('--site-font', theme.siteFont);
  }

  function applyThemePatch(patch) {
    state.theme = normalizeTheme(Object.assign({}, state.theme, patch || {}));
    if (!persistNow()) return false;
    applyPackThemeToDom();
    return true;
  }

  function syncSharedEditMode(want) {
    const on = !!want && !isUserMode();
    document.body.classList.toggle('page-edit-mode', on);
    const btn = document.getElementById('btnEdit');
    if (btn) {
      btn.textContent = on ? 'סיום עריכה' : 'עריכה';
      btn.classList.toggle('active', on);
    }
  }

  function restorePackChrome() {
    applyPackThemeToDom();
    const want = window.HebetShell && typeof window.HebetShell.getSavedEditMode === 'function'
      ? window.HebetShell.getSavedEditMode('pack')
      : false;
    syncSharedEditMode(want);
    syncEditUi();
  }

  /* ---------- מצב עריכה ---------- */

  function isUserMode() {
    return document.body.classList.contains('user-mode') ||
      document.body.getAttribute('data-app-mode') === 'user';
  }

  function isPageEditMode() {
    return !isUserMode() && document.body.classList.contains('page-edit-mode');
  }

  function isPackActive() {
    return document.body.getAttribute('data-generator') === 'pack';
  }

  /* ---------- אלמנטים ---------- */

  function els() {
    return {
      header: document.getElementById('packHeader'),
      headerTitle: document.getElementById('packHeaderTitle'),
      headerSubtitle: document.getElementById('packHeaderSubtitle'),
      headerLogos: document.getElementById('packHeaderLogos'),
      headerEditBtn: document.getElementById('packHeaderEdit'),
      headerResize: document.getElementById('packHeaderResize'),
      headerDrop: document.getElementById('packHeaderDrop'),

      cardsSection: document.getElementById('packCards'),
      cardsGrid: document.getElementById('packCardsGrid'),
      cardsEditBtn: document.getElementById('packCardsEdit'),
      cardsAddBtn: document.getElementById('btnPackNew'),
      cardsResize: document.getElementById('packCardsResize'),

      closingSection: document.getElementById('packClosing'),
      closingEditBtn: document.getElementById('packClosingEdit'),
      closingItems: document.getElementById('packClosingItems'),
      closingResize: document.getElementById('packClosingResize'),
      devTeamBtn: document.getElementById('packDevTeamBtn'),
      devTeamLabel: document.getElementById('packDevTeamLabel'),

      editOverlay: document.getElementById('packEditOverlay'),
      editTitle: document.getElementById('packEditTitle'),
      editHint: document.getElementById('packEditHint'),
      editFields: document.getElementById('packEditFields'),
      editForm: document.getElementById('packEditForm'),
      editClose: document.getElementById('packEditClose'),
      editCancel: document.getElementById('packEditCancel'),
    };
  }

  /* ---------- רינדור: כותרת (רקע) ---------- */

  function renderHeaderBg() {
    const ui = els();
    const header = state.header;
    if (!ui.header) return;
    ui.header.style.setProperty('--pack-header-height', header.height + 'px');
    ui.header.style.setProperty('--pack-header-color', header.color || DEFAULT_HEADER_COLOR);
    ui.header.style.setProperty('--pack-header-image', cssUrl(header.image));
    ui.header.style.setProperty('--pack-header-opacity', String(clampOpacity(header.opacity) / 100));
    ui.header.classList.toggle('is-image', header.mode === 'image' && !!header.image);
    ui.header.classList.toggle('is-awaiting-image', header.mode === 'image' && !header.image);
    ui.header.classList.toggle('is-transparent', header.mode === 'transparent');
    ui.header.classList.toggle('is-hidden', isHeaderHidden());
    if (ui.headerResize) ui.headerResize.hidden = !isPageEditMode() || isHeaderHidden();
  }

  function isHeaderHidden() {
    return !!(state.header && state.header.hidden);
  }

  function defaultTextX(align) {
    if (align === 'start') return 78;
    if (align === 'end') return 22;
    return 50;
  }

  function seedTextFreePosition(item, yDefault) {
    if (!item || item.freePlaced) return;
    item.x = defaultTextX((item.align || (state.header.title && state.header.title.align)) || 'center');
    item.y = clamp(item.y, 0, 100, yDefault);
    item.freePlaced = true;
  }

  function ensureTextFreeformPositions() {
    seedTextFreePosition(state.header.title, 40);
    seedTextFreePosition(state.header.subtitle, 68);
  }

  function applyTextFreePosition(el, item) {
    if (!el || !item) return;
    el.style.setProperty('--tx', item.x + '%');
    el.style.setProperty('--ty', item.y + '%');
  }

  function isHeaderTextHidden(kind) {
    const item = state.header && state.header[kind];
    return !!(item && item.hidden);
  }

  function setHeaderTextHidden(kind, hidden) {
    const item = state.header && state.header[kind];
    if (!item) return;
    item.hidden = !!hidden;
    if (item.hidden && activePackText && activePackText.role === (kind === 'title' ? 'header-title' : 'header-subtitle')) {
      activePackText = null;
      syncPackToolbar();
    }
    renderHeaderText();
  }

  function renderHeaderText() {
    const ui = els();
    const header = state.header;
    const headerHidden = isHeaderHidden();
    const titleHidden = headerHidden || isHeaderTextHidden('title');
    const subtitleHidden = headerHidden || isHeaderTextHidden('subtitle');
    ensureTextFreeformPositions();
    if (ui.header) ui.header.classList.toggle('is-text-freeform', !headerHidden);
    if (ui.headerTitle) {
      if (titleHidden && document.activeElement === ui.headerTitle) ui.headerTitle.blur();
      if (document.activeElement !== ui.headerTitle) ui.headerTitle.textContent = header.title.text;
      ui.headerTitle.style.setProperty('--pack-title-size', header.title.size + 'px');
      ui.headerTitle.style.color = header.title.color;
      applyTextFreePosition(ui.headerTitle, header.title);
      ui.headerTitle.hidden = titleHidden;
      ui.headerTitle.setAttribute(
        'contenteditable',
        isPageEditMode() && !titleHidden ? 'true' : 'false'
      );
    }
    if (ui.headerSubtitle) {
      if (subtitleHidden && document.activeElement === ui.headerSubtitle) ui.headerSubtitle.blur();
      if (document.activeElement !== ui.headerSubtitle) ui.headerSubtitle.textContent = header.subtitle.text;
      ui.headerSubtitle.style.setProperty('--pack-subtitle-size', header.subtitle.size + 'px');
      ui.headerSubtitle.style.color = header.subtitle.color;
      applyTextFreePosition(ui.headerSubtitle, header.subtitle);
      ui.headerSubtitle.hidden = subtitleHidden;
      ui.headerSubtitle.setAttribute(
        'contenteditable',
        isPageEditMode() && !subtitleHidden ? 'true' : 'false'
      );
    }
    const textWrap = document.getElementById('packHeaderText');
    if (textWrap) {
      const align = header.title.align;
      textWrap.style.setProperty('--pack-title-align', align);
      textWrap.style.setProperty('--pack-title-items', align);
    }
  }

  function renderHeaderLogos() {
    const ui = els();
    if (!ui.headerLogos) return;
    ui.headerLogos.innerHTML = state.header.logos.map(function (logo) {
      return '<img class="pack-header-logo" data-logo-id="' + escapeHtml(logo.id) + '" src="' + escapeHtml(logo.src) + '"' +
        ' style="--lx:' + logo.x + '%;--ly:' + logo.y + '%;--lsize:' + logo.size + 'px;" alt="">';
    }).join('');
  }

  function renderHeader() {
    renderHeaderBg();
    renderHeaderText();
    renderHeaderLogos();
  }

  /* ---------- רינדור: קוביות ---------- */

  function actionIconInnerHtml(action) {
    if (action.icon && action.icon.type === 'image' && action.icon.value) {
      return '<img src="' + escapeHtml(action.icon.value) + '" alt="">';
    }
    return escapeHtml(action.icon ? action.icon.value : '');
  }

  function actionButtonHtml(card, kind) {
    const action = card.actions[kind];
    if (!action || !action.enabled) return '';
    const title = ACTION_LABELS[kind];
    const hasImage = action.icon && action.icon.type === 'image' && action.icon.value;
    const iconHtml = actionIconInnerHtml(action);
    const cls = 'pack-card-action' + (hasImage ? ' has-icon-image' : '');
    const posStyle = '--ax:' + action.x + '%;--ay:' + action.y + '%;';
    const kindAttr = ' data-action-kind="' + kind + '"';
    const soonAttr = card.comingSoon ? ' aria-disabled="true" tabindex="-1"' : '';
    if (kind === 'print') {
      return '<button type="button" class="' + cls + '"' + kindAttr + ' data-print-href="' + escapeHtml(action.href || '') + '" style="' + posStyle + '" title="' + title + '" aria-label="' + title + '"' + soonAttr + '>' + iconHtml + '</button>';
    }
    const href = escapeHtml(action.href || '#');
    const downloadAttr = kind === 'download' && !card.comingSoon ? ' download' : '';
    return '<a class="' + cls + '"' + kindAttr + ' href="' + href + '" target="_blank" rel="noopener noreferrer"' + downloadAttr + ' data-has-href="' + (action.href && !card.comingSoon ? '1' : '0') + '" style="' + posStyle + '" title="' + title + '" aria-label="' + title + '"' + soonAttr + '>' + iconHtml + '</a>';
  }

  function cardIconInnerHtml(icon) {
    if (icon.type === 'image' && icon.value) {
      return '<img src="' + escapeHtml(icon.value) + '" alt="">';
    }
    return escapeHtml(icon.value);
  }

  function cardIconsHtml(card) {
    const icons = Array.isArray(card.icons) ? card.icons : [];
    return icons.map(function (icon) {
      return (
        '<span class="pack-card-icon" data-card-icon-id="' + escapeHtml(icon.id) + '"' +
          ' style="--ix:' + icon.x + '%;--iy:' + icon.y + '%;--isize:' + icon.size + 'px;"' +
          '>' + cardIconInnerHtml(icon) + '</span>'
      );
    }).join('');
  }

  function defaultFreeWidth() {
    return 18;
  }

  function assignFreePosition(card, index) {
    const cols = clamp(state.cards.perRow, 2, 6, 4);
    const col = index % cols;
    const row = Math.floor(index / cols);
    card.x = clamp(((cols - col - 0.5) / cols) * 100, 8, 92, 50);
    card.y = clamp(18 + row * 28, 12, 88, 24);
    card.w = defaultFreeWidth();
    card.freePlaced = true;
  }

  function ensureFreeformPositions() {
    if (!state.cards.freeform) return;
    state.cards.items.forEach(function (card, index) {
      if (!card.freePlaced) assignFreePosition(card, index);
    });
  }

  function isCardsFreeform() {
    return !!state.cards.freeform;
  }

  function cardHtml(card) {
    const actionsHtml = ['view', 'download', 'print'].map(function (k) { return actionButtonHtml(card, k); }).join('');
    const editing = isPageEditMode();
    const editableAttr = editing ? ' contenteditable="true" spellcheck="false"' : '';
    const titleStyle = 'font-size:' + card.titleSize + 'px;color:' + escapeHtml(card.titleColor) + ';';
    const descStyle = 'font-size:' + card.descSize + 'px;color:' + escapeHtml(card.descColor) + ';';
    const showTitle = !card.titleHidden && (!!card.title || editing);
    const showDesc = !card.descHidden && (!!card.desc || editing);
    const useImage = card.bgMode === 'image' && !!card.image;
    const awaitingImage = card.bgMode === 'image' && !card.image;
    const editingClass = editingCardId && editingCardId === card.id ? ' is-editing' : '';
    const imageClass = useImage ? ' is-image' : (awaitingImage ? ' is-awaiting-image' : '');
    const soonClass = card.comingSoon ? ' is-coming-soon' : '';
    const photoHtml = useImage
      ? '<img class="pack-card-photo" src="' + escapeHtml(card.image) + '" alt="">'
      : '';
    const soonHtml = card.comingSoon
      ? '<div class="pack-card-soon" role="status" aria-label="בקרוב"><span class="pack-card-soon-badge">בקרוב</span></div>'
      : '';
    return (
      '<div class="pack-card' + editingClass + imageClass + soonClass + '" data-id="' + escapeHtml(card.id) + '"' +
        (card.comingSoon ? ' aria-disabled="true"' : '') +
        ' style="--pack-card-color:' + escapeHtml(card.color) +
        ';--cx:' + card.x + '%;--cy:' + card.y + '%;--cw:' + card.w + '%;">' +
        photoHtml +
        '<button type="button" class="pack-card-edit" data-card-edit="' + escapeHtml(card.id) + '" title="עריכת קובייה" aria-label="עריכת קובייה">✎</button>' +
        '<button type="button" class="pack-card-delete" data-card-delete="' + escapeHtml(card.id) + '" title="הסרת קובייה" aria-label="הסרת קובייה">×</button>' +
        cardIconsHtml(card) +
        '<div class="pack-card-copy">' +
          (showTitle ? '<h3 class="pack-card-title" data-card-text="title" data-card-id="' + escapeHtml(card.id) + '" style="' + titleStyle + '"' + editableAttr + '>' + escapeHtml(card.title) + '</h3>' : '') +
          (showDesc ? '<p class="pack-card-desc" data-card-text="desc" data-card-id="' + escapeHtml(card.id) + '" style="' + descStyle + '"' + editableAttr + '>' + escapeHtml(card.desc) + '</p>' : '') +
        '</div>' +
        actionsHtml +
        soonHtml +
      '</div>'
    );
  }

  function renderCards() {
    const ui = els();
    if (!ui.cardsGrid) return;
    const section = ui.cardsSection || document.getElementById('packCards');
    const freeform = isCardsFreeform();
    if (freeform) ensureFreeformPositions();
    if (section) {
      section.classList.toggle('is-freeform', freeform);
      section.style.setProperty('--pack-cards-per-row', state.cards.perRow);
      section.style.setProperty('--pack-cards-gap', state.cards.gap + 'px');
      section.style.setProperty('--pack-cards-free-height', clampFreeHeight(state.cards.freeHeight) + 'px');
    }
    if (ui.cardsResize) ui.cardsResize.hidden = !isPageEditMode() || !freeform;
    ui.cardsGrid.innerHTML = state.cards.items.map(cardHtml).join('');
  }

  /* ---------- רינדור: סגירה ---------- */

  function closingIconInnerHtml(icon) {
    if (icon.kind === 'text') return escapeHtml(icon.value);
    if (icon.type === 'image' && icon.value) {
      return '<img src="' + escapeHtml(icon.value) + '" alt="">';
    }
    return escapeHtml(icon.value);
  }

  function closingIconHtml(icon) {
    if (icon.kind === 'text') {
      const hasHref = !!icon.href;
      const editing = isPageEditMode() && !isClosingHidden();
      return (
        '<div class="pack-closing-text" data-icon-id="' + escapeHtml(icon.id) + '" data-kind="text" data-has-href="' + (hasHref ? '1' : '0') + '"' +
          (hasHref ? ' data-href="' + escapeHtml(icon.href) + '"' : '') +
          ' style="--cx:' + icon.x + '%;--cy:' + icon.y + '%;--csize:' + icon.size + 'px;--ccolor:' + escapeHtml(icon.color) + ';">' +
          '<span class="pack-closing-text-label" spellcheck="false"' + (editing ? ' contenteditable="true"' : '') + '>' +
            escapeHtml(icon.value) +
          '</span>' +
        '</div>'
      );
    }
    const hasHref = !!icon.href;
    return (
      '<a class="pack-closing-icon" data-icon-id="' + escapeHtml(icon.id) + '" data-kind="icon" data-has-href="' + (hasHref ? '1' : '0') + '"' +
        ' href="' + escapeHtml(icon.href || '#') + '" target="_blank" rel="noopener noreferrer"' +
        ' style="--cx:' + icon.x + '%;--cy:' + icon.y + '%;--csize:' + icon.size + 'px;"' +
        (hasHref ? '' : ' aria-disabled="true"') + '>' +
        closingIconInnerHtml(icon) +
      '</a>'
    );
  }

  function renderClosingIcons() {
    const ui = els();
    if (!ui.closingItems) return;
    ui.closingItems.innerHTML = state.closing.icons.map(closingIconHtml).join('');
  }

  function renderClosing() {
    const ui = els();
    const closing = state.closing;
    const hidden = isClosingHidden();
    if (ui.closingSection) {
      ui.closingSection.style.setProperty('--pack-closing-height', clampClosingHeight(closing.height) + 'px');
      ui.closingSection.classList.toggle('is-hidden', hidden);
    }
    if (ui.closingResize) ui.closingResize.hidden = !isPageEditMode() || hidden;
    if (ui.devTeamBtn) {
      ui.devTeamBtn.hidden = hidden || !closing.enabled;
      ui.devTeamBtn.classList.toggle('has-image', !!closing.image);
      ui.devTeamBtn.style.setProperty('--pack-dev-team-color', closing.color);
      ui.devTeamBtn.style.setProperty('--pack-dev-team-text', closing.textColor);
      ui.devTeamBtn.style.setProperty('--pack-dev-team-scale', String(clampDevTeamSize(closing.size) / 100));
      ui.devTeamBtn.style.setProperty('--pack-dev-team-radius', clampDevTeamRadius(closing.radius) + 'px');
      ui.devTeamBtn.style.setProperty('--pack-dev-team-image', closing.image ? cssUrl(closing.image) : 'none');
      ui.devTeamBtn.style.setProperty('--cx', closing.x + '%');
      ui.devTeamBtn.style.setProperty('--cy', closing.y + '%');
      if (closing.href) {
        ui.devTeamBtn.href = closing.href;
        ui.devTeamBtn.classList.remove('is-disabled');
        ui.devTeamBtn.removeAttribute('aria-disabled');
      } else {
        ui.devTeamBtn.removeAttribute('href');
        ui.devTeamBtn.classList.add('is-disabled');
        ui.devTeamBtn.setAttribute('aria-disabled', 'true');
      }
    }
    if (ui.devTeamLabel) {
      if (document.activeElement !== ui.devTeamLabel) ui.devTeamLabel.textContent = closing.label;
      ui.devTeamLabel.style.fontSize = closing.labelSize + 'px';
      ui.devTeamLabel.style.color = closing.textColor;
    }
    renderClosingIcons();
  }

  function renderAll() {
    renderHeader();
    renderCards();
    renderClosing();
  }

  /* ---------- מנוע חלונית העריכה הכללי ---------- */

  let editorOpen = false;
  let editingCardId = null;

  function isEditorOpen() {
    return editorOpen;
  }

  function highlightEditingCard() {
    const ui = els();
    if (!ui.cardsGrid) return;
    const cards = ui.cardsGrid.querySelectorAll('.pack-card');
    for (let i = 0; i < cards.length; i++) {
      const id = cards[i].getAttribute('data-id');
      cards[i].classList.toggle('is-editing', !!(editingCardId && id === editingCardId));
    }
  }

  function closeHslaPopover() {
    const pop = document.getElementById('hslaPopover');
    if (pop && !pop.hidden) pop.hidden = true;
  }

  function openEditor(config) {
    if (!isPageEditMode()) return;
    const ui = els();
    if (!ui.editOverlay) return;
    snapshotJSON = JSON.stringify(state);
    editorOpen = true;
    editingCardId = config.cardId || null;
    ui.editTitle.textContent = config.title || 'עריכה';
    if (ui.editHint) {
      ui.editHint.hidden = !config.hint;
      ui.editHint.textContent = config.hint || '';
    }
    ui.editFields.innerHTML = config.fieldsHtml || '';
    if (typeof config.bind === 'function') config.bind(ui.editFields);
    ui.editOverlay.hidden = false;
    highlightEditingCard();
  }

  function closeEditor(revert) {
    const ui = els();
    editingCardId = null;
    if (revert && snapshotJSON) {
      try { state = normalizeState(JSON.parse(snapshotJSON)); } catch (_) { /* ignore */ }
      renderAll();
    } else {
      highlightEditingCard();
    }
    snapshotJSON = null;
    editorOpen = false;
    if (ui.editOverlay) ui.editOverlay.hidden = true;
    closeHslaPopover();
  }

  function saveEditor() {
    if (!persistNow()) return false;
    closeEditor(false);
    return true;
  }

  /* ---------- שדות עזר משותפים לבניית HTML של חלוניות ---------- */

  function colorFieldHtml(id, label, value) {
    return (
      '<div class="pack-color-field hsla-field" id="' + id + 'Wrap" data-hsla-for="' + id + 'Value">' +
        '<span>' + escapeHtml(label) + '</span>' +
        '<button type="button" class="hsla-swatch" id="' + id + 'Swatch" title="' + escapeHtml(label) + '" aria-label="' + escapeHtml(label) + '"></button>' +
        '<span class="color-hex" id="' + id + 'Hex">' + escapeHtml(value) + '</span>' +
        '<input type="hidden" id="' + id + 'Value" value="' + escapeHtml(value) + '">' +
      '</div>'
    );
  }

  function bindColorField(root, id, onChange) {
    const field = root.querySelector('#' + id + 'Wrap');
    if (!field || !window.HebetColor) return;
    window.HebetColor.setupHslaField(field, onChange);
  }

  function rangeRowHtml(id, label, value, min, max, unit) {
    return (
      '<div class="pack-range-row">' +
        '<span>' + escapeHtml(label) + '</span>' +
        '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="1" value="' + value + '">' +
        '<input type="number" id="' + id + 'Num" min="' + min + '" max="' + max + '" step="1" value="' + value + '" inputmode="numeric">' +
        '<span class="pack-unit">' + escapeHtml(unit) + '</span>' +
      '</div>'
    );
  }

  function bindRangeRow(root, id, onChange) {
    const range = root.querySelector('#' + id);
    const num = root.querySelector('#' + id + 'Num');
    if (range) range.addEventListener('input', function () { onChange(range.value); if (num) num.value = range.value; });
    if (num) num.addEventListener('input', function () { onChange(num.value); if (range) range.value = num.value; });
  }

  /* ================================================================
     עורך הכותרת: רקע + טקסטים + לוגואים
     ================================================================ */

  function isFileDrag(e) {
    const types = e.dataTransfer && e.dataTransfer.types;
    if (!types) return false;
    return Array.prototype.indexOf.call(types, 'Files') !== -1;
  }

  function readImageAsDataUrl(file, cb) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) {
      alert('יש לבחור קובץ תמונה.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert('התמונה גדולה מדי. נסו קובץ קטן יותר.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function () { cb(String(reader.result || '')); };
    reader.onerror = function () { alert('לא ניתן לקרוא את התמונה.'); };
    reader.readAsDataURL(file);
  }

  function headerEditorFieldsHtml() {
    const h = state.header;
    function segHtml(name, current, options) {
      return '<div class="pack-seg" role="radiogroup">' + options.map(function (opt) {
        return '<label class="pack-seg-btn">' +
          '<input type="radio" name="' + name + '" value="' + opt.value + '"' + (current === opt.value ? ' checked' : '') + '>' +
          '<span>' + escapeHtml(opt.label) + '</span>' +
        '</label>';
      }).join('') + '</div>';
    }
    return (
      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">כותרת</div>' +
        '<label class="pack-check-row">' +
          '<input type="checkbox" id="packHeaderHidden"' + (h.hidden ? ' checked' : '') + '>' +
          '<span>הסתרת הכותרת לגמרי</span>' +
        '</label>' +
        '<p class="pack-field-sub" id="packHeaderHiddenHint"' + (h.hidden ? '' : ' hidden') + '>כל אזור הכותרת לא יוצג במארז. אפשר להחזיר אותו בכל עת ממצב עריכה.</p>' +
      '</section>' +

      '<div id="packHeaderContentsControls"' + (h.hidden ? ' hidden' : '') + '>' +
      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">רקע הכותרת</div>' +
        segHtml('packHeaderMode', h.mode, [
          { value: 'transparent', label: 'שקוף' },
          { value: 'color', label: 'צבע' },
          { value: 'image', label: 'תמונה' },
        ]) +
        colorFieldHtml('packHeaderColor', 'צבע כותרת', h.color) +
        '<label class="pack-upload" for="packHeaderImageInput" style="margin-top:10px;display:flex;">' +
          '<input type="file" id="packHeaderImageInput" accept="image/*" hidden>' +
          '<span>העלאת תמונה / החלפה</span>' +
        '</label>' +
        '<img class="pack-preview' + (h.image ? ' is-visible' : '') + '" id="packHeaderImagePreview" src="' + escapeHtml(h.image) + '" alt="">' +
        (h.image ? '<button type="button" class="pack-clear-btn" id="packHeaderImageClear">הסרת תמונה</button>' : '') +
        rangeRowHtml('packHeaderOpacity', 'שקיפות', h.opacity, 0, 100, '%') +
        rangeRowHtml('packHeaderHeight', 'גובה', h.height, HEIGHT_MIN, HEIGHT_MAX, 'px') +
        '<p class="pack-field-sub">אפשר לגרור את הפס בתחתית הכותרת (במסך) לשינוי גובה מהיר.</p>' +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">טקסטים</div>' +
        '<label class="pack-check-row">' +
          '<input type="checkbox" id="packTitleEnabled"' + (h.title.hidden ? '' : ' checked') + '>' +
          '<span>טקסט ראשי</span>' +
        '</label>' +
        '<label class="pack-check-row">' +
          '<input type="checkbox" id="packSubtitleEnabled"' + (h.subtitle.hidden ? '' : ' checked') + '>' +
          '<span>טקסט משני</span>' +
        '</label>' +
        '<p class="pack-field-sub">לחצו על הטקסט בכותרת כדי לערוך, וגררו למיקום חופשי. גודל וצבע בסרגל הכלים.</p>' +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head" id="packEditLogosHead">לוגואים (' + h.logos.length + ')</div>' +
        '<p class="pack-field-sub">ניתן לגרור לוגו ישירות על הכותרת כדי לשנות מיקום. כאן קובעים גודל (סליידר או מספר) או מוסיפים/מסירים.</p>' +
        '<div id="packEditLogoList">' + logosListHtml() + '</div>' +
        '<label class="pack-add-logo-btn" for="packAddLogoFile">+ הוספת לוגו</label>' +
        '<input type="file" id="packAddLogoFile" accept="image/*" hidden>' +
      '</section>' +
      '</div>'
    );
  }

  function logosListHtml() {
    return state.header.logos.map(function (logo) {
      const id = escapeHtml(logo.id);
      return (
        '<div class="pack-logo-row" data-logo-id="' + id + '">' +
          '<img class="pack-logo-thumb" src="' + escapeHtml(logo.src) + '" alt="">' +
          '<input type="range" min="20" max="220" step="1" value="' + logo.size + '" data-logo-size="' + id + '" title="גודל" aria-label="גודל לוגו">' +
          '<input type="number" min="20" max="220" step="1" value="' + logo.size + '" inputmode="numeric" dir="ltr" data-logo-size="' + id + '" aria-label="גודל לוגו בפיקסלים">' +
          '<span class="pack-unit">px</span>' +
          '<button type="button" class="pack-logo-remove" data-logo-remove="' + id + '" title="הסרה" aria-label="הסרה">×</button>' +
        '</div>'
      );
    }).join('') || '<p class="pack-field-sub">אין עדיין לוגואים.</p>';
  }

  function refreshLogosList() {
    const list = document.getElementById('packEditLogoList');
    if (list) list.innerHTML = logosListHtml();
  }

  function bindHeaderEditorFields(root) {
    // רקע
    root.querySelectorAll('input[name="packHeaderMode"]').forEach(function (input) {
      input.addEventListener('change', function () {
        if (!input.checked) return;
        state.header.mode = input.value;
        renderHeader();
      });
    });
    bindColorField(root, 'packHeaderColor', function (hex) {
      state.header.color = hex;
      if (state.header.mode === 'transparent') {
        // בחירת צבע משנה אוטומטית למצב "צבע"
        state.header.mode = 'color';
        const modeColor = root.querySelector('input[name="packHeaderMode"][value="color"]');
        if (modeColor) modeColor.checked = true;
      }
      renderHeader();
    });
    const imageInput = root.querySelector('#packHeaderImageInput');
    if (imageInput) {
      imageInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        readImageAsDataUrl(file, function (dataUrl) {
          state.header.image = dataUrl;
          state.header.mode = 'image';
          renderHeader();
          openEditorRefresh();
        });
        e.target.value = '';
      });
    }
    const imageClear = root.querySelector('#packHeaderImageClear');
    if (imageClear) {
      imageClear.addEventListener('click', function () {
        state.header.image = '';
        state.header.mode = 'color';
        renderHeader();
        openEditorRefresh();
      });
    }
    bindRangeRow(root, 'packHeaderOpacity', function (v) { state.header.opacity = clampOpacity(v); renderHeader(); });
    bindRangeRow(root, 'packHeaderHeight', function (v) { state.header.height = clampHeight(v); renderHeader(); });

    const headerHiddenCheck = root.querySelector('#packHeaderHidden');
    const headerHiddenHint = root.querySelector('#packHeaderHiddenHint');
    const headerContents = root.querySelector('#packHeaderContentsControls');
    if (headerHiddenCheck) {
      headerHiddenCheck.addEventListener('change', function () {
        state.header.hidden = headerHiddenCheck.checked;
        if (headerHiddenHint) headerHiddenHint.hidden = !headerHiddenCheck.checked;
        if (headerContents) headerContents.hidden = headerHiddenCheck.checked;
        renderHeader();
        syncEditUi();
      });
    }
    const titleEnabled = root.querySelector('#packTitleEnabled');
    if (titleEnabled) {
      titleEnabled.addEventListener('change', function () {
        setHeaderTextHidden('title', !titleEnabled.checked);
      });
    }
    const subtitleEnabled = root.querySelector('#packSubtitleEnabled');
    if (subtitleEnabled) {
      subtitleEnabled.addEventListener('change', function () {
        setHeaderTextHidden('subtitle', !subtitleEnabled.checked);
      });
    }

    // לוגואים
    const logoList = root.querySelector('#packEditLogoList');
    if (logoList) {
      logoList.addEventListener('input', function (e) {
        const id = e.target.getAttribute('data-logo-size');
        if (!id) return;
        const logo = state.header.logos.find(function (l) { return l.id === id; });
        if (!logo) return;
        const row = e.target.closest ? e.target.closest('.pack-logo-row') : null;
        const range = row ? row.querySelector('input[type="range"][data-logo-size="' + id + '"]') : null;
        const num = row ? row.querySelector('input[type="number"][data-logo-size="' + id + '"]') : null;
        const isNumberField = e.target === num;

        if (isNumberField) {
          const typed = Number(e.target.value);
          if (!Number.isFinite(typed)) return;
          if (typed < 20 || typed > 220) return;
          logo.size = typed;
          if (range) range.value = String(typed);
          renderHeaderLogos();
          return;
        }

        logo.size = clamp(e.target.value, 20, 220, 56);
        if (range) range.value = String(logo.size);
        if (num) num.value = String(logo.size);
        renderHeaderLogos();
      });
      logoList.addEventListener('focusout', function (e) {
        const id = e.target.getAttribute && e.target.getAttribute('data-logo-size');
        if (!id || e.target.type !== 'number') return;
        const logo = state.header.logos.find(function (l) { return l.id === id; });
        if (!logo) return;
        logo.size = clamp(e.target.value, 20, 220, 56);
        e.target.value = String(logo.size);
        const row = e.target.closest ? e.target.closest('.pack-logo-row') : null;
        const range = row ? row.querySelector('input[type="range"][data-logo-size="' + id + '"]') : null;
        if (range) range.value = String(logo.size);
        renderHeaderLogos();
      });
      logoList.addEventListener('click', function (e) {
        const id = e.target.getAttribute('data-logo-remove');
        if (!id) return;
        state.header.logos = state.header.logos.filter(function (l) { return l.id !== id; });
        renderHeaderLogos();
        refreshLogosList();
        openEditorRefreshTitle();
      });
    }
    const addLogoFile = root.querySelector('#packAddLogoFile');
    if (addLogoFile) {
      addLogoFile.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        readImageAsDataUrl(file, function (dataUrl) {
          state.header.logos.push(normalizeLogo({
            src: dataUrl,
            x: 12 + Math.round(Math.random() * 10),
            y: 50,
            size: 56,
          }));
          renderHeaderLogos();
          refreshLogosList();
          openEditorRefreshTitle();
        });
        e.target.value = '';
      });
    }
  }

  function openEditorRefresh() {
    const ui = els();
    if (!ui.editFields) return;
    const preview = ui.editFields.querySelector('#packHeaderImagePreview');
    if (preview) {
      preview.src = state.header.image || '';
      preview.classList.toggle('is-visible', !!state.header.image);
    }
    const modeRadios = ui.editFields.querySelectorAll('input[name="packHeaderMode"]');
    modeRadios.forEach(function (r) { r.checked = r.value === state.header.mode; });
    const clearBtn = ui.editFields.querySelector('#packHeaderImageClear');
    if (clearBtn) clearBtn.hidden = !state.header.image;
  }

  function openEditorRefreshTitle() {
    const head = document.getElementById('packEditLogosHead');
    if (head) head.textContent = 'לוגואים (' + state.header.logos.length + ')';
  }

  function openHeaderEditor() {
    openEditor({
      title: 'עריכת כותרת',
      hint: 'כאן מגדירים את אזור הכותרת. גודל וצבע של הטקסטים נקבעים בסרגל הכלים.',
      fieldsHtml: headerEditorFieldsHtml(),
      bind: bindHeaderEditorFields,
    });
  }

  /* ================================================================
     עורך אזור הקוביות (הגדרות פריסה)
     ================================================================ */

  function cardsSectionEditorHint() {
    return isCardsFreeform()
      ? 'גררו כל קובייה עם העכבר לכל מקום באזור. קו ורוד מופיע כשקוביות מתיישרות. גובה האזור ניתן לשינוי כאן או בידית בתחתית.'
      : 'קובעים כמה קוביות בשורה ואת המרווח ביניהן. תוכן כל קובייה נערך בלחיצה על העט שעליה.';
  }

  function cardsSectionEditorFieldsHtml() {
    const c = state.cards;
    const freeform = !!c.freeform;
    return (
      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">פריסת קוביות</div>' +
        '<label class="pack-check-row">' +
          '<input type="checkbox" id="packCardsFreeform"' + (freeform ? ' checked' : '') + '>' +
          '<span>קוביות חופשיות</span>' +
        '</label>' +
        '<div id="packCardsMatrixControls"' + (freeform ? ' hidden' : '') + '>' +
          rangeRowHtml('packCardsPerRow', 'בשורה', c.perRow, 2, 6, '') +
          rangeRowHtml('packCardsGap', 'מרווח', c.gap, 0, 48, 'px') +
        '</div>' +
        '<div id="packCardsFreeControls"' + (freeform ? '' : ' hidden') + '>' +
          rangeRowHtml('packCardsFreeHeight', 'גובה אזור', clampFreeHeight(c.freeHeight), FREE_HEIGHT_MIN, FREE_HEIGHT_MAX, 'px') +
          '<p class="pack-field-sub">גררו את הקוביות עם העכבר בתוך האזור המקווקו. קווי יישור ורודים מופיעים כשהן באותו גובה או על אותו ציר.</p>' +
        '</div>' +
      '</section>'
    );
  }

  function syncCardsEditorMode(root) {
    const freeform = isCardsFreeform();
    const matrix = root.querySelector('#packCardsMatrixControls');
    const free = root.querySelector('#packCardsFreeControls');
    if (matrix) matrix.hidden = freeform;
    if (free) free.hidden = !freeform;
    const ui = els();
    if (ui.editHint) ui.editHint.textContent = cardsSectionEditorHint();
  }

  function bindCardsSectionEditorFields(root) {
    const freeform = root.querySelector('#packCardsFreeform');
    if (freeform) {
      freeform.addEventListener('change', function () {
        state.cards.freeform = freeform.checked;
        if (state.cards.freeform) ensureFreeformPositions();
        syncCardsEditorMode(root);
        renderCards();
      });
    }
    bindRangeRow(root, 'packCardsPerRow', function (v) { state.cards.perRow = clamp(v, 2, 6, 4); renderCards(); });
    bindRangeRow(root, 'packCardsGap', function (v) { state.cards.gap = clamp(v, 0, 48, 16); renderCards(); });
    bindRangeRow(root, 'packCardsFreeHeight', function (v) {
      state.cards.freeHeight = clampFreeHeight(v);
      renderCards();
    });
  }

  function openCardsSectionEditor() {
    openEditor({
      title: 'עריכת אזור הקוביות',
      hint: cardsSectionEditorHint(),
      fieldsHtml: cardsSectionEditorFieldsHtml(),
      bind: bindCardsSectionEditorFields,
    });
  }

  /* ================================================================
     עורך קובייה בודדת
     ================================================================ */

  function nextCardIconPos(card) {
    const used = (card.icons || []).map(function (icon) { return icon.x; });
    let x = 50;
    while (used.some(function (u) { return Math.abs(u - x) < 10; }) && x < 88) x += 12;
    return { x: x, y: 16 };
  }

  function cardIconsListHtml(card) {
    if (!card.icons.length) {
      return '<p class="pack-field-sub">אין עדיין אייקונים. העלו תמונה, ואז גררו בתוך הקובייה.</p>';
    }
    return card.icons.map(function (icon) {
      const id = escapeHtml(icon.id);
      const thumb = icon.type === 'image' && icon.value
        ? '<img class="pack-logo-thumb" src="' + escapeHtml(icon.value) + '" alt="">'
        : '<span class="pack-logo-thumb pack-closing-icon-thumb" aria-hidden="true">' + escapeHtml(icon.value) + '</span>';
      return (
        '<div class="pack-logo-row pack-closing-icon-row" data-card-icon-id="' + id + '">' +
          '<div class="pack-closing-icon-row-head">' +
            thumb +
            '<button type="button" class="pack-logo-remove" data-card-icon-remove="' + id + '" title="הסרה" aria-label="הסרה">×</button>' +
          '</div>' +
          '<div class="pack-range-row pack-closing-icon-size">' +
            '<span>גודל</span>' +
            '<input type="range" min="' + CARD_ICON_SIZE_MIN + '" max="' + CARD_ICON_SIZE_MAX + '" step="1" value="' + icon.size + '" data-card-icon-size="' + id + '" aria-label="גודל אייקון">' +
            '<input type="number" min="' + CARD_ICON_SIZE_MIN + '" max="' + CARD_ICON_SIZE_MAX + '" step="1" value="' + icon.size + '" inputmode="numeric" dir="ltr" data-card-icon-size="' + id + '" aria-label="גודל אייקון בפיקסלים">' +
            '<span class="pack-unit">px</span>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  function refreshCardIconsList(root, card) {
    const list = root.querySelector('#packEditCardIconList');
    if (list) list.innerHTML = cardIconsListHtml(card);
    const head = root.querySelector('#packEditCardIconsHead');
    if (head) head.textContent = 'אייקונים (' + card.icons.length + ')';
  }

  function actionRowHtml(kind, label, action) {
    const hasImage = action.icon && action.icon.type === 'image' && action.icon.value;
    return (
      '<div class="pack-action-row" data-action-kind="' + kind + '">' +
        '<label>' +
          '<input type="checkbox" data-action-enabled="' + kind + '"' + (action.enabled ? ' checked' : '') + '>' +
          '<span>' + escapeHtml(label) + '</span>' +
        '</label>' +
        '<input type="url" dir="ltr" placeholder="קישור (אופציונלי)" data-action-href="' + kind + '" value="' + escapeHtml(action.href) + '">' +
      '</div>' +
      '<div class="pack-action-icon-row" data-action-icon-row="' + kind + '">' +
        '<span class="pack-action-icon-preview' + (hasImage ? ' is-visible' : '') + '" data-action-icon-preview="' + kind + '">' +
          actionIconInnerHtml(action) +
        '</span>' +
        '<label class="pack-upload pack-upload--sm" for="packActionIcon_' + kind + '">' +
          '<input type="file" id="packActionIcon_' + kind + '" accept="image/*" data-action-icon-input="' + kind + '" hidden>' +
          '<span>העלאת אייקון מותאם</span>' +
        '</label>' +
        '<button type="button" class="pack-clear-btn pack-clear-btn--sm" data-action-icon-clear="' + kind + '"' + (hasImage ? '' : ' hidden') + '>לברירת מחדל</button>' +
      '</div>'
    );
  }

  function cardEditorFieldsHtml(card) {
    return (
      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">סטטוס</div>' +
        '<label class="pack-check-row">' +
          '<input type="checkbox" id="packCardComingSoon"' + (card.comingSoon ? ' checked' : '') + '>' +
          '<span>בקרוב</span>' +
        '</label>' +
        '<p class="pack-field-sub">כשמסומן, הקובייה מוצגת כלא פעילה עם חותמת "בקרוב", וכפתורי הפעולה חסומים.</p>' +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">תוכן</div>' +
        '<label class="pack-check-row">' +
          '<input type="checkbox" id="packCardTitleEnabled"' + (card.titleHidden ? '' : ' checked') + '>' +
          '<span>כותרת</span>' +
        '</label>' +
        '<label class="pack-check-row">' +
          '<input type="checkbox" id="packCardDescEnabled"' + (card.descHidden ? '' : ' checked') + '>' +
          '<span>תיאור</span>' +
        '</label>' +
        '<p class="pack-field-sub">לחצו על הטקסט בקובייה כדי לערוך. גודל וצבע בסרגל הכלים.</p>' +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">רקע הקובייה</div>' +
        '<div class="pack-seg" role="radiogroup">' +
          '<label class="pack-seg-btn">' +
            '<input type="radio" name="packCardBgMode" value="color"' + (card.bgMode !== 'image' ? ' checked' : '') + '>' +
            '<span>צבע</span>' +
          '</label>' +
          '<label class="pack-seg-btn">' +
            '<input type="radio" name="packCardBgMode" value="image"' + (card.bgMode === 'image' ? ' checked' : '') + '>' +
            '<span>תמונה</span>' +
          '</label>' +
        '</div>' +
        '<div id="packCardBgColorWrap"' + (card.bgMode === 'image' ? ' hidden' : '') + '>' +
          colorFieldHtml('packCardColor', 'צבע קובייה', card.color) +
        '</div>' +
        '<div id="packCardBgImageWrap"' + (card.bgMode === 'image' ? '' : ' hidden') + '>' +
          '<p class="pack-field-sub">אפשר להעלות PNG עם רקע שקוף — כך מתקבלת צורת קובייה חופשית (משיכת מכחול וכו׳). הצבע נעלם עד שהתמונה נטענת.</p>' +
          '<label class="pack-upload" for="packCardBgImage" style="margin-top:10px;display:flex;">' +
            '<input type="file" id="packCardBgImage" accept="image/*" hidden>' +
            '<span>' + (card.image ? 'החלפת תמונה' : 'העלאת תמונה') + '</span>' +
          '</label>' +
          '<img class="pack-preview' + (card.image ? ' is-visible' : '') + '" id="packCardBgPreview" src="' + escapeHtml(card.image || '') + '" alt="">' +
          '<button type="button" class="pack-clear-btn" id="packCardBgClear"' + (card.image ? '' : ' hidden') + '>הסרת תמונה</button>' +
        '</div>' +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head" id="packEditCardIconsHead">אייקונים (' + card.icons.length + ')</div>' +
        '<p class="pack-field-sub">העלו אייקון מהמחשב. במצב עריכה גררו אותו על הקובייה או מחוץ למסגרת. קו ורוד מופיע כשהיישור תואם לאייקון או כפתור אחר.</p>' +
        '<div id="packEditCardIconList">' + cardIconsListHtml(card) + '</div>' +
        '<label class="pack-add-logo-btn" for="packCardIconImage">+ הוסף אייקון</label>' +
        '<input type="file" id="packCardIconImage" accept="image/*" hidden>' +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">כפתורי פעולה</div>' +
        '<p class="pack-field-sub">במצב עריכה גררו את הכפתורים סביב הקובייה. כשהם באותו גובה או על אותו ציר מופיע קו יישור ורוד.</p>' +
        actionRowHtml('view', 'צפייה', card.actions.view) +
        actionRowHtml('download', 'הורדה', card.actions.download) +
        actionRowHtml('print', 'הדפסה', card.actions.print) +
      '</section>'
    );
  }

  function bindCardEditorFields(root, cardId) {
    function getCard() {
      return state.cards.items.find(function (c) { return c.id === cardId; });
    }
    const comingSoon = root.querySelector('#packCardComingSoon');
    if (comingSoon) {
      comingSoon.addEventListener('change', function () {
        const card = getCard();
        if (!card) return;
        card.comingSoon = comingSoon.checked;
        renderCards();
      });
    }
    const titleEnabled = root.querySelector('#packCardTitleEnabled');
    if (titleEnabled) {
      titleEnabled.addEventListener('change', function () {
        const card = getCard();
        if (!card) return;
        card.titleHidden = !titleEnabled.checked;
        if (card.titleHidden && activePackText && activePackText.cardId === cardId && activePackText.role === 'card-title') {
          activePackText = null;
          syncPackToolbar();
        }
        renderCards();
      });
    }
    const descEnabled = root.querySelector('#packCardDescEnabled');
    if (descEnabled) {
      descEnabled.addEventListener('change', function () {
        const card = getCard();
        if (!card) return;
        card.descHidden = !descEnabled.checked;
        if (card.descHidden && activePackText && activePackText.cardId === cardId && activePackText.role === 'card-desc') {
          activePackText = null;
          syncPackToolbar();
        }
        renderCards();
      });
    }
    root.querySelectorAll('input[name="packCardBgMode"]').forEach(function (input) {
      input.addEventListener('change', function () {
        if (!input.checked) return;
        const card = getCard();
        if (!card) return;
        card.bgMode = normalizeCardBgMode(input.value);
        const colorWrap = root.querySelector('#packCardBgColorWrap');
        const imageWrap = root.querySelector('#packCardBgImageWrap');
        if (colorWrap) colorWrap.hidden = card.bgMode !== 'color';
        if (imageWrap) imageWrap.hidden = card.bgMode !== 'image';
        renderCards();
        if (card.bgMode === 'image') {
          const fileInput = root.querySelector('#packCardBgImage');
          if (fileInput) fileInput.click();
        }
      });
    });
    bindColorField(root, 'packCardColor', function (hex) {
      const card = getCard();
      if (card) { card.color = hex; renderCards(); }
    });
    const bgImage = root.querySelector('#packCardBgImage');
    if (bgImage) {
      bgImage.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        readImageAsDataUrl(file, function (dataUrl) {
          const card = getCard();
          if (!card) return;
          card.image = dataUrl;
          card.bgMode = 'image';
          const preview = root.querySelector('#packCardBgPreview');
          if (preview) {
            preview.src = dataUrl;
            preview.classList.add('is-visible');
          }
          const clearBtn = root.querySelector('#packCardBgClear');
          if (clearBtn) clearBtn.hidden = false;
          const label = root.querySelector('label[for="packCardBgImage"] span');
          if (label) label.textContent = 'החלפת תמונה';
          renderCards();
        });
        e.target.value = '';
      });
    }
    const bgClear = root.querySelector('#packCardBgClear');
    if (bgClear) {
      bgClear.addEventListener('click', function () {
        const card = getCard();
        if (!card) return;
        card.image = '';
        const preview = root.querySelector('#packCardBgPreview');
        if (preview) {
          preview.src = '';
          preview.classList.remove('is-visible');
        }
        bgClear.hidden = true;
        const label = root.querySelector('label[for="packCardBgImage"] span');
        if (label) label.textContent = 'העלאת תמונה';
        renderCards();
      });
    }

    function addCardIcon(icon) {
      const card = getCard();
      if (!card) return;
      const pos = nextCardIconPos(card);
      card.icons.push(normalizeDecorIcon(Object.assign({}, icon, { x: pos.x, y: pos.y })));
      refreshCardIconsList(root, card);
      renderCards();
    }

    function applyCardIconSize(card, icon, sizeEl) {
      icon.size = clampCardIconSize(sizeEl.type === 'number' ? sizeEl.value : sizeEl.value);
      const row = sizeEl.closest ? sizeEl.closest('[data-card-icon-id]') : null;
      if (row) {
        row.querySelectorAll('[data-card-icon-size="' + icon.id + '"]').forEach(function (el) {
          if (el !== sizeEl) el.value = String(icon.size);
        });
      }
      const cardEl = document.querySelector('.pack-card[data-id="' + card.id + '"]');
      const iconEl = cardEl && cardEl.querySelector('[data-card-icon-id="' + icon.id + '"]');
      if (iconEl) iconEl.style.setProperty('--isize', icon.size + 'px');
    }
    const iconImage = root.querySelector('#packCardIconImage');
    if (iconImage) {
      iconImage.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        readImageAsDataUrl(file, function (dataUrl) {
          addCardIcon({ type: 'image', value: dataUrl });
        });
        e.target.value = '';
      });
    }
    const iconList = root.querySelector('#packEditCardIconList');
    if (iconList) {
      iconList.addEventListener('input', function (e) {
        const sizeId = e.target.getAttribute && e.target.getAttribute('data-card-icon-size');
        if (!sizeId) return;
        const card = getCard();
        if (!card) return;
        const icon = card.icons.find(function (item) { return item.id === sizeId; });
        if (!icon) return;
        const row = e.target.closest ? e.target.closest('[data-card-icon-id]') : null;
        const range = row ? row.querySelector('input[type="range"][data-card-icon-size="' + sizeId + '"]') : null;
        const num = row ? row.querySelector('input[type="number"][data-card-icon-size="' + sizeId + '"]') : null;
        const isNumberField = e.target === num;

        if (isNumberField) {
          const typed = Number(e.target.value);
          if (!Number.isFinite(typed)) return;
          if (typed < CARD_ICON_SIZE_MIN || typed > CARD_ICON_SIZE_MAX) return;
          icon.size = typed;
          if (range) range.value = String(typed);
          const cardEl = document.querySelector('.pack-card[data-id="' + card.id + '"]');
          const iconEl = cardEl && cardEl.querySelector('[data-card-icon-id="' + icon.id + '"]');
          if (iconEl) iconEl.style.setProperty('--isize', icon.size + 'px');
          return;
        }

        applyCardIconSize(card, icon, e.target);
      });
      iconList.addEventListener('focusout', function (e) {
        const sizeId = e.target.getAttribute && e.target.getAttribute('data-card-icon-size');
        if (!sizeId || e.target.type !== 'number') return;
        const card = getCard();
        if (!card) return;
        const icon = card.icons.find(function (item) { return item.id === sizeId; });
        if (!icon) return;
        icon.size = clampCardIconSize(e.target.value);
        e.target.value = String(icon.size);
        const row = e.target.closest ? e.target.closest('[data-card-icon-id]') : null;
        const range = row ? row.querySelector('input[type="range"][data-card-icon-size="' + sizeId + '"]') : null;
        if (range) range.value = String(icon.size);
        const cardEl = document.querySelector('.pack-card[data-id="' + card.id + '"]');
        const iconEl = cardEl && cardEl.querySelector('[data-card-icon-id="' + icon.id + '"]');
        if (iconEl) iconEl.style.setProperty('--isize', icon.size + 'px');
      });
      iconList.addEventListener('click', function (e) {
        const btn = e.target.closest ? e.target.closest('[data-card-icon-remove]') : null;
        if (!btn) return;
        const card = getCard();
        if (!card) return;
        const id = btn.getAttribute('data-card-icon-remove');
        card.icons = card.icons.filter(function (item) { return item.id !== id; });
        refreshCardIconsList(root, card);
        renderCards();
      });
    }
    ['view', 'download', 'print'].forEach(function (kind) {
      const check = root.querySelector('[data-action-enabled="' + kind + '"]');
      const href = root.querySelector('[data-action-href="' + kind + '"]');
      const iconInput = root.querySelector('[data-action-icon-input="' + kind + '"]');
      const iconPreview = root.querySelector('[data-action-icon-preview="' + kind + '"]');
      const iconClear = root.querySelector('[data-action-icon-clear="' + kind + '"]');
      if (check) {
        check.addEventListener('change', function () {
          const card = getCard();
          if (card) { card.actions[kind].enabled = check.checked; renderCards(); }
        });
      }
      if (href) {
        href.addEventListener('input', function () {
          const card = getCard();
          if (card) { card.actions[kind].href = href.value.slice(0, 600); renderCards(); }
        });
      }
      function refreshIconUi(action) {
        if (iconPreview) {
          const hasImage = action.icon.type === 'image' && !!action.icon.value;
          iconPreview.classList.toggle('is-visible', hasImage);
          iconPreview.innerHTML = actionIconInnerHtml(action);
        }
        if (iconClear) iconClear.hidden = !(action.icon.type === 'image' && action.icon.value);
      }
      if (iconInput) {
        iconInput.addEventListener('change', function (e) {
          const file = e.target.files && e.target.files[0];
          if (!file) { return; }
          readImageAsDataUrl(file, function (dataUrl) {
            const card = getCard();
            if (card) {
              card.actions[kind].icon = { type: 'image', value: dataUrl };
              renderCards();
              refreshIconUi(card.actions[kind]);
            }
          });
          e.target.value = '';
        });
      }
      if (iconClear) {
        iconClear.addEventListener('click', function () {
          const card = getCard();
          if (card) {
            card.actions[kind].icon = { type: 'glyph', value: ACTION_DEFAULT_GLYPH[kind] };
            renderCards();
            refreshIconUi(card.actions[kind]);
          }
        });
      }
    });
  }

  function openCardEditor(cardId) {
    const card = state.cards.items.find(function (c) { return c.id === cardId; });
    if (!card) return;
    openEditor({
      title: 'עריכת קובייה',
      cardId: cardId,
      hint: 'את הטקסט עורכים ישירות על הקובייה. כאן קובעים אם להציג כותרת ותיאור, ואת הרקע והפעולות.',
      fieldsHtml: cardEditorFieldsHtml(card),
      bind: function (root) { bindCardEditorFields(root, cardId); },
    });
  }

  function ensureEditMode() {
    if (isPageEditMode()) return;
    const btnEdit = document.getElementById('btnEdit');
    if (btnEdit) btnEdit.click();
  }

  function addCard() {
    if (isUserMode() || !isPackActive()) return;
    ensureEditMode();
    const card = normalizeCard({ title: 'קובייה חדשה', color: DEFAULT_CARD_COLOR });
    if (isCardsFreeform()) assignFreePosition(card, state.cards.items.length);
    state.cards.items.push(card);
    renderCards();
    persistNow();
    openCardEditor(card.id);
  }

  function removeCard(cardId) {
    if (!window.confirm('להסיר את הקובייה?')) return;
    state.cards.items = state.cards.items.filter(function (c) { return c.id !== cardId; });
    renderCards();
    persistNow();
  }

  /* ================================================================
     עורך הסגירה (צוות פיתוח + אלמנטים)
     ================================================================ */

  function closingIconsListHtml() {
    if (!state.closing.icons.length) {
      return '<p class="pack-field-sub">אין עדיין אלמנטים. הוסיפו אייקון או טקסט.</p>';
    }
    return state.closing.icons.map(function (icon) {
      const id = escapeHtml(icon.id);
      if (icon.kind === 'text') {
        const preview = icon.value.trim() ? icon.value.slice(0, 28) : 'טקסט';
        return (
          '<div class="pack-logo-row pack-closing-icon-row" data-icon-id="' + id + '">' +
            '<div class="pack-closing-icon-row-head">' +
              '<span class="pack-logo-thumb pack-closing-icon-thumb" aria-hidden="true">Aa</span>' +
              '<button type="button" class="pack-logo-remove" data-icon-remove="' + id + '" title="הסרה" aria-label="הסרה">×</button>' +
            '</div>' +
            '<p class="pack-field-sub">«' + escapeHtml(preview) + '» — ערכו את הטקסט באזור התחתון. צבע וגודל מסרגל הכלים.</p>' +
            '<input type="url" dir="ltr" class="pack-closing-icon-href" placeholder="קישור (אופציונלי)" data-icon-href="' + id + '" value="' + escapeHtml(icon.href) + '">' +
          '</div>'
        );
      }
      const thumb = icon.type === 'image' && icon.value
        ? '<img class="pack-logo-thumb" src="' + escapeHtml(icon.value) + '" alt="">'
        : '<span class="pack-logo-thumb pack-closing-icon-thumb" aria-hidden="true">' + escapeHtml(icon.value) + '</span>';
      return (
        '<div class="pack-logo-row pack-closing-icon-row" data-icon-id="' + id + '">' +
          '<div class="pack-closing-icon-row-head">' +
            thumb +
            '<button type="button" class="pack-logo-remove" data-icon-remove="' + id + '" title="הסרה" aria-label="הסרה">×</button>' +
          '</div>' +
          '<div class="pack-range-row pack-closing-icon-size">' +
            '<span>גודל</span>' +
            '<input type="range" min="' + CLOSING_ICON_SIZE_MIN + '" max="' + CLOSING_ICON_SIZE_MAX + '" step="1" value="' + icon.size + '" data-icon-size="' + id + '" aria-label="גודל אייקון">' +
            '<input type="number" min="' + CLOSING_ICON_SIZE_MIN + '" max="' + CLOSING_ICON_SIZE_MAX + '" step="1" value="' + icon.size + '" inputmode="numeric" dir="ltr" data-icon-size="' + id + '" aria-label="גודל אייקון בפיקסלים">' +
            '<span class="pack-unit">px</span>' +
          '</div>' +
          '<input type="url" dir="ltr" class="pack-closing-icon-href" placeholder="קישור (אופציונלי)" data-icon-href="' + id + '" value="' + escapeHtml(icon.href) + '">' +
        '</div>'
      );
    }).join('');
  }

  function refreshClosingIconsList() {
    const list = document.getElementById('packEditClosingIconList');
    if (list) list.innerHTML = closingIconsListHtml();
    const head = document.getElementById('packEditClosingIconsHead');
    if (head) head.textContent = 'אלמנטים (' + state.closing.icons.length + ')';
  }

  function nextClosingIconX() {
    const used = state.closing.icons.map(function (icon) { return icon.x; });
    let x = 16;
    while (used.some(function (u) { return Math.abs(u - x) < 8; }) && x < 70) x += 10;
    return x;
  }

  function addClosingIcon(dataUrl) {
    state.closing.icons.push(normalizeClosingIcon({
      type: 'image',
      value: dataUrl,
      x: nextClosingIconX(),
      y: 50,
      size: 40,
    }));
    renderClosingIcons();
    refreshClosingIconsList();
  }

  function addClosingText() {
    state.closing.icons.push(normalizeClosingIcon({
      kind: 'text',
      value: 'טקסט',
      x: nextClosingIconX(),
      y: 50,
      size: 18,
      color: '#222222',
    }));
    renderClosingIcons();
    refreshClosingIconsList();
  }

  function closingEditorFieldsHtml() {
    const c = state.closing;
    return (
      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">אזור תחתון</div>' +
        '<label class="pack-check-row">' +
          '<input type="checkbox" id="packClosingHidden"' + (c.hidden ? ' checked' : '') + '>' +
          '<span>הסתרת האזור התחתון לגמרי</span>' +
        '</label>' +
        '<p class="pack-field-sub" id="packClosingHiddenHint"' + (c.hidden ? '' : ' hidden') + '>כל האזור התחתון לא יוצג במארז. אפשר להחזיר אותו בכל עת ממצב עריכה.</p>' +
      '</section>' +

      '<div id="packClosingContentsControls"' + (c.hidden ? ' hidden' : '') + '>' +
      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">גובה האזור</div>' +
        '<p class="pack-field-sub">אפשר גם לגרור את הפס בתחתית המסגרת לשינוי גובה מהיר.</p>' +
        rangeRowHtml('packClosingHeight', 'גובה', clampClosingHeight(c.height), CLOSING_HEIGHT_MIN, CLOSING_HEIGHT_MAX, 'px') +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">כפתור צוות פיתוח</div>' +
        '<p class="pack-field-sub">במצב עריכה גררו את הכפתור לכל מקום במסגרת האזור התחתון.</p>' +
        '<label class="pack-action-row" style="margin-bottom:12px;">' +
          '<label style="margin:0;">' +
            '<input type="checkbox" id="packClosingEnabled"' + (c.enabled ? ' checked' : '') + '>' +
            '<span>הצגת כפתור "צוות פיתוח"</span>' +
          '</label>' +
        '</label>' +
        '<div class="pack-field">' +
          '<label for="packClosingLabel">טקסט הכפתור</label>' +
          '<input type="text" id="packClosingLabel" maxlength="40" value="' + escapeHtml(c.label) + '">' +
        '</div>' +
        '<div class="pack-field">' +
          '<label for="packClosingHref">קישור (אופציונלי)</label>' +
          '<input type="url" id="packClosingHref" dir="ltr" placeholder="https://..." value="' + escapeHtml(c.href) + '">' +
        '</div>' +
        rangeRowHtml('packClosingSize', 'גודל', clampDevTeamSize(c.size), 70, 180, '%') +
        rangeRowHtml('packClosingRadius', 'חידוד הפינות', clampDevTeamRadius(c.radius), 0, 40, 'px') +
        '<div id="packClosingFillColor"' + (c.image ? ' hidden' : '') + '>' +
          colorFieldHtml('packClosingColor', 'צבע רקע', c.color) +
        '</div>' +
        '<label class="pack-upload" id="packClosingImageUpload" for="packClosingImageInput"' + (c.image ? ' hidden' : '') + '>' +
          '<input type="file" id="packClosingImageInput" accept="image/*" hidden>' +
          '<span>העלאת תמונה לכפתור</span>' +
        '</label>' +
        '<img class="pack-preview' + (c.image ? ' is-visible' : '') + '" id="packClosingImagePreview" src="' + escapeHtml(c.image) + '" alt="">' +
        '<button type="button" class="pack-clear-btn" id="packClosingImageClear"' + (c.image ? '' : ' hidden') + '>הסרת תמונה (חזרה לצבע)</button>' +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head" id="packEditClosingIconsHead">אלמנטים (' + c.icons.length + ')</div>' +
        '<p class="pack-field-sub">הוסיפו אייקון או טקסט. אפשר לגרור כל אלמנט לאורך האזור התחתון. צבע וגודל של טקסט נשלטים מסרגל הכלים.</p>' +
        '<div id="packEditClosingIconList">' + closingIconsListHtml() + '</div>' +
        '<div class="pack-closing-add-row">' +
          '<label class="pack-add-logo-btn" for="packAddClosingIconFile">+ הוסף אייקון</label>' +
          '<button type="button" class="pack-add-logo-btn" id="packAddClosingText">+ הוסף טקסט</button>' +
        '</div>' +
        '<input type="file" id="packAddClosingIconFile" accept="image/*" hidden>' +
      '</section>' +
      '</div>'
    );
  }

  function bindClosingEditorFields(root) {
    const closingHiddenCheck = root.querySelector('#packClosingHidden');
    const closingHiddenHint = root.querySelector('#packClosingHiddenHint');
    const closingContents = root.querySelector('#packClosingContentsControls');
    if (closingHiddenCheck) {
      closingHiddenCheck.addEventListener('change', function () {
        state.closing.hidden = closingHiddenCheck.checked;
        if (closingHiddenHint) closingHiddenHint.hidden = !closingHiddenCheck.checked;
        if (closingContents) closingContents.hidden = closingHiddenCheck.checked;
        if (closingHiddenCheck.checked && activePackText &&
            (activePackText.role === 'closing-label' || activePackText.role === 'closing-text')) {
          activePackText = null;
          syncPackToolbar();
        }
        renderClosing();
        syncEditUi();
      });
    }
    const enabled = root.querySelector('#packClosingEnabled');
    if (enabled) {
      enabled.addEventListener('change', function () {
        state.closing.enabled = enabled.checked;
        renderClosing();
      });
    }
    const label = root.querySelector('#packClosingLabel');
    if (label) {
      label.addEventListener('input', function () {
        state.closing.label = label.value.slice(0, 40) || 'צוות פיתוח';
        renderClosing();
      });
    }
    const href = root.querySelector('#packClosingHref');
    if (href) {
      href.addEventListener('input', function () {
        state.closing.href = href.value.slice(0, 600);
        renderClosing();
      });
    }
    bindColorField(root, 'packClosingColor', function (hex) {
      state.closing.color = hex;
      if (state.closing.image) {
        state.closing.image = '';
        refreshClosingFillUi();
      }
      renderClosing();
    });
    bindRangeRow(root, 'packClosingHeight', function (v) {
      state.closing.height = clampClosingHeight(v);
      renderClosing();
    });
    bindRangeRow(root, 'packClosingSize', function (v) {
      state.closing.size = clampDevTeamSize(v);
      renderClosing();
    });
    bindRangeRow(root, 'packClosingRadius', function (v) {
      state.closing.radius = clampDevTeamRadius(v);
      renderClosing();
    });

    function refreshClosingFillUi() {
      const hasImage = !!(state.closing.image);
      const colorWrap = root.querySelector('#packClosingFillColor');
      const upload = root.querySelector('#packClosingImageUpload');
      const preview = root.querySelector('#packClosingImagePreview');
      const clearBtn = root.querySelector('#packClosingImageClear');
      if (colorWrap) colorWrap.hidden = hasImage;
      if (upload) upload.hidden = hasImage;
      if (preview) {
        preview.src = state.closing.image || '';
        preview.classList.toggle('is-visible', hasImage);
      }
      if (clearBtn) clearBtn.hidden = !hasImage;
    }

    const imageInput = root.querySelector('#packClosingImageInput');
    if (imageInput) {
      imageInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        readImageAsDataUrl(file, function (dataUrl) {
          state.closing.image = dataUrl;
          renderClosing();
          refreshClosingFillUi();
        });
        e.target.value = '';
      });
    }
    const imageClear = root.querySelector('#packClosingImageClear');
    if (imageClear) {
      imageClear.addEventListener('click', function () {
        state.closing.image = '';
        renderClosing();
        refreshClosingFillUi();
      });
    }

    const list = root.querySelector('#packEditClosingIconList');
    if (list) {
      list.addEventListener('input', function (e) {
        const sizeId = e.target.getAttribute('data-icon-size');
        if (sizeId) {
          const icon = state.closing.icons.find(function (item) { return item.id === sizeId; });
          if (!icon || icon.kind === 'text') return;
          const row = e.target.closest ? e.target.closest('.pack-closing-icon-row') : null;
          const range = row ? row.querySelector('input[type="range"][data-icon-size="' + sizeId + '"]') : null;
          const num = row ? row.querySelector('input[type="number"][data-icon-size="' + sizeId + '"]') : null;
          const isNumberField = e.target === num;

          if (isNumberField) {
            const typed = Number(e.target.value);
            if (!Number.isFinite(typed)) return;
            if (typed < CLOSING_ICON_SIZE_MIN || typed > CLOSING_ICON_SIZE_MAX) return;
            icon.size = typed;
            if (range) range.value = String(typed);
            renderClosingIcons();
            return;
          }

          icon.size = clampClosingIconSize(e.target.value);
          if (range) range.value = String(icon.size);
          if (num) num.value = String(icon.size);
          renderClosingIcons();
          return;
        }
        const hrefId = e.target.getAttribute('data-icon-href');
        if (hrefId) {
          const icon = state.closing.icons.find(function (item) { return item.id === hrefId; });
          if (!icon) return;
          icon.href = e.target.value.slice(0, 600);
          renderClosingIcons();
        }
      });
      list.addEventListener('focusout', function (e) {
        const sizeId = e.target.getAttribute && e.target.getAttribute('data-icon-size');
        if (!sizeId || e.target.type !== 'number') return;
        const icon = state.closing.icons.find(function (item) { return item.id === sizeId; });
        if (!icon || icon.kind === 'text') return;
        icon.size = clampClosingIconSize(e.target.value);
        e.target.value = String(icon.size);
        const row = e.target.closest ? e.target.closest('.pack-closing-icon-row') : null;
        const range = row ? row.querySelector('input[type="range"][data-icon-size="' + sizeId + '"]') : null;
        if (range) range.value = String(icon.size);
        renderClosingIcons();
      });
      list.addEventListener('click', function (e) {
        const btn = e.target.closest ? e.target.closest('[data-icon-remove]') : null;
        if (!btn) return;
        const id = btn.getAttribute('data-icon-remove');
        state.closing.icons = state.closing.icons.filter(function (item) { return item.id !== id; });
        renderClosingIcons();
        refreshClosingIconsList();
      });
    }

    const addFile = root.querySelector('#packAddClosingIconFile');
    if (addFile) {
      addFile.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        readImageAsDataUrl(file, function (dataUrl) {
          addClosingIcon(dataUrl);
        });
        e.target.value = '';
      });
    }
    const addText = root.querySelector('#packAddClosingText');
    if (addText) {
      addText.addEventListener('click', function () {
        addClosingText();
      });
    }
  }

  function openClosingEditor() {
    openEditor({
      title: 'עריכת אזור תחתון',
      hint: 'גררו את כפתור צוות הפיתוח ואת האלמנטים ישירות בתוך מסגרת האזור התחתון.',
      fieldsHtml: closingEditorFieldsHtml(),
      bind: bindClosingEditorFields,
    });
  }

  /* ---------- עריכה ישירה (inline) של כותרת/כותרת משנה ---------- */

  function commitInlineText(el, path) {
    const value = String(el.textContent || '').trim();
    if (path === 'title') state.header.title.text = value.slice(0, 90);
    else state.header.subtitle.text = value.slice(0, 140);
    persist();
    // טקסט הכותרת נערך ישירות על הבד ומתמיד גם אם חלונית הסגנון פתוחה —
    // מרעננים את "תמונת המצב" של הפעלת העריכה כדי שכפתור "ביטול" לא ימחק אותו.
    if (isEditorOpen()) snapshotJSON = JSON.stringify(state);
  }

  function bindInlineHeaderText() {
    const ui = els();
    [
      { el: ui.headerTitle, path: 'title', role: 'header-title' },
      { el: ui.headerSubtitle, path: 'subtitle', role: 'header-subtitle' },
    ].forEach(function (row) {
      if (!row.el || row.el.dataset.packInlineBound === '1') return;
      row.el.dataset.packInlineBound = '1';
      row.el.addEventListener('focus', function () {
        activePackText = { el: row.el, role: row.role, cardId: null };
        syncPackToolbar();
      });
      row.el.addEventListener('blur', function () {
        commitInlineText(row.el, row.path);
        scheduleClearActivePackText(row.el);
      });
      row.el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); row.el.blur(); }
        if (e.key === 'Escape') { e.preventDefault(); renderHeaderText(); row.el.blur(); }
      });
    });
  }

  /* ================================================================
     עריכה ישירה + סרגל הכלים המשותף (גודל/צבע) — לכל טקסט במארז:
     כותרת/כותרת משנה, כותרת/תיאור של קובייה, וטקסט כפתור צוות הפיתוח.
     המנגנון מתחבר לרכיבי "צבע טקסט" ו"גודל טקסט" בסרגל הכלים הכללי,
     בדיוק כמו שקורה במחולל מנהלן (ראו js/manhalan/app.js -> window.HebetPackText).
     ================================================================ */

  let activePackText = null; // { el, role, cardId }

  function isToolbarOrPopoverEl(node) {
    return !!(node && node.closest && node.closest('#siteToolbar, .hsla-popover'));
  }

  function hasActivePackText() {
    return isPackActive() && !!activePackText && !!activePackText.el && activePackText.el.isConnected;
  }

  function findCardById(cardId) {
    return state.cards.items.find(function (c) { return c.id === cardId; });
  }

  function getPackTextRefs(target) {
    if (!target) return null;
    switch (target.role) {
      case 'header-title':
        return {
          min: 14, max: 72,
          getSize: function () { return state.header.title.size; },
          setSize: function (v) { state.header.title.size = clamp(v, 14, 72, 30); return state.header.title.size; },
          getColor: function () { return state.header.title.color; },
          setColor: function (hex) { state.header.title.color = hex; },
        };
      case 'header-subtitle':
        return {
          min: 10, max: 40,
          getSize: function () { return state.header.subtitle.size; },
          setSize: function (v) { state.header.subtitle.size = clamp(v, 10, 40, 15); return state.header.subtitle.size; },
          getColor: function () { return state.header.subtitle.color; },
          setColor: function (hex) { state.header.subtitle.color = hex; },
        };
      case 'card-title': {
        const card = findCardById(target.cardId);
        if (!card) return null;
        return {
          min: 12, max: 34,
          getSize: function () { return card.titleSize; },
          setSize: function (v) { card.titleSize = clamp(v, 12, 34, 16); return card.titleSize; },
          getColor: function () { return card.titleColor; },
          setColor: function (hex) { card.titleColor = hex; },
        };
      }
      case 'card-desc': {
        const card = findCardById(target.cardId);
        if (!card) return null;
        return {
          min: 10, max: 22,
          getSize: function () { return card.descSize; },
          setSize: function (v) { card.descSize = clamp(v, 10, 22, 13); return card.descSize; },
          getColor: function () { return card.descColor; },
          setColor: function (hex) { card.descColor = hex; },
        };
      }
      case 'closing-label':
        return {
          min: 12, max: 28,
          getSize: function () { return state.closing.labelSize; },
          setSize: function (v) { state.closing.labelSize = clamp(v, 12, 28, 14); return state.closing.labelSize; },
          getColor: function () { return state.closing.textColor; },
          setColor: function (hex) { state.closing.textColor = hex; },
        };
      case 'closing-text': {
        const item = state.closing.icons.find(function (i) { return i.id === target.itemId; });
        if (!item || item.kind !== 'text') return null;
        return {
          min: 10, max: 72,
          getSize: function () { return item.size; },
          setSize: function (v) { item.size = clamp(v, 10, 72, 18); return item.size; },
          getColor: function () { return item.color; },
          setColor: function (hex) { item.color = hex; },
        };
      }
      default:
        return null;
    }
  }

  function applyPackTextLiveStyle(target, size, color) {
    if (!target || !target.el) return;
    if (target.role === 'header-title') {
      if (size != null) target.el.style.setProperty('--pack-title-size', size + 'px');
      if (color != null) target.el.style.color = color;
    } else if (target.role === 'header-subtitle') {
      if (size != null) target.el.style.setProperty('--pack-subtitle-size', size + 'px');
      if (color != null) target.el.style.color = color;
    } else {
      if (size != null) {
        target.el.style.fontSize = size + 'px';
        if (target.role === 'closing-text') {
          const wrap = target.el.closest ? target.el.closest('.pack-closing-text') : null;
          if (wrap) wrap.style.setProperty('--csize', size + 'px');
        }
      }
      if (color != null) {
        target.el.style.color = color;
        if (target.role === 'closing-text') {
          const wrap = target.el.closest ? target.el.closest('.pack-closing-text') : null;
          if (wrap) wrap.style.setProperty('--ccolor', color);
        }
      }
    }
  }

  function syncPackToolbar() {
    if (!isPackActive()) return;
    const colorField = document.getElementById('inlineTextColorPicker');
    const sizeControl = document.getElementById('inlineTextSizeControl');
    const sizeRange = document.getElementById('inlineTextSize');
    const sizeNum = document.getElementById('inlineTextSizeNum');
    const refs = hasActivePackText() ? getPackTextRefs(activePackText) : null;

    if (colorField) {
      colorField.classList.toggle('is-disabled', !refs);
      const swatch = colorField.querySelector('.hsla-swatch');
      if (swatch) swatch.setAttribute('aria-disabled', refs ? 'false' : 'true');
      if (refs && window.HebetColor) window.HebetColor.setHslaFieldValue('inlineTextColor', refs.getColor());
    }
    if (sizeControl && sizeRange) {
      sizeControl.classList.toggle('is-disabled', !refs);
      sizeRange.disabled = !refs;
      if (sizeNum) sizeNum.disabled = !refs;
      if (refs) {
        sizeRange.min = String(refs.min);
        sizeRange.max = String(refs.max);
        if (sizeNum) {
          sizeNum.min = String(refs.min);
          sizeNum.max = String(refs.max);
        }
        const size = refs.getSize();
        sizeRange.value = String(size);
        if (sizeNum) sizeNum.value = String(size);
      }
    }
  }

  function applyPackInlineColor(hex) {
    if (!hasActivePackText()) return;
    const refs = getPackTextRefs(activePackText);
    if (!refs) return;
    refs.setColor(hex);
    applyPackTextLiveStyle(activePackText, null, hex);
    persist();
    if (isEditorOpen()) snapshotJSON = JSON.stringify(state);
    if (window.HebetColor) window.HebetColor.setHslaFieldValue('inlineTextColor', hex);
  }

  function applyPackInlineSize(rawSize) {
    if (!hasActivePackText()) return;
    const refs = getPackTextRefs(activePackText);
    if (!refs) return;
    const size = refs.setSize(rawSize);
    applyPackTextLiveStyle(activePackText, size, null);
    persist();
    if (isEditorOpen()) snapshotJSON = JSON.stringify(state);
    const sizeRange = document.getElementById('inlineTextSize');
    const sizeNum = document.getElementById('inlineTextSizeNum');
    if (sizeRange) sizeRange.value = String(size);
    if (sizeNum) sizeNum.value = String(size);
  }

  function scheduleClearActivePackText(el) {
    window.setTimeout(function () {
      if (!activePackText || activePackText.el !== el) return;
      if (isToolbarOrPopoverEl(document.activeElement)) return;
      if (document.activeElement === el) return;
      activePackText = null;
      syncPackToolbar();
    }, 0);
  }

  function bindHslaPopoverObserver() {
    const pop = document.getElementById('hslaPopover');
    if (!pop || pop.dataset.packPopoverBound === '1') return;
    pop.dataset.packPopoverBound = '1';
    new MutationObserver(function () {
      if (pop.hidden && activePackText && document.activeElement !== activePackText.el) {
        activePackText = null;
        syncPackToolbar();
      }
    }).observe(pop, { attributes: true, attributeFilter: ['hidden'] });
  }

  window.HebetPackText = {
    hasActiveText: hasActivePackText,
    applyColor: applyPackInlineColor,
    applySize: applyPackInlineSize,
    syncToolbar: syncPackToolbar,
  };

  /* ---------- עריכה ישירה: כותרת/תיאור של קובייה ---------- */

  function commitCardInlineText(el) {
    const cardId = el.getAttribute('data-card-id');
    const field = el.getAttribute('data-card-text');
    const card = findCardById(cardId);
    if (!card) return;
    const value = String(el.textContent || '').trim();
    if (field === 'title') card.title = value.slice(0, 40) || 'קובייה חדשה';
    else card.desc = value.slice(0, 140);
    persist();
    if (isEditorOpen()) snapshotJSON = JSON.stringify(state);
  }

  function bindInlineCardText() {
    const ui = els();
    if (!ui.cardsGrid || ui.cardsGrid.dataset.textBound === '1') return;
    ui.cardsGrid.dataset.textBound = '1';

    function targetOf(e) {
      const el = e.target;
      if (!el || !el.getAttribute) return null;
      const field = el.getAttribute('data-card-text');
      if (field !== 'title' && field !== 'desc') return null;
      return { el: el, field: field, cardId: el.getAttribute('data-card-id') };
    }

    ui.cardsGrid.addEventListener('focusin', function (e) {
      const t = targetOf(e);
      if (!t || !isPageEditMode()) return;
      activePackText = { el: t.el, role: t.field === 'title' ? 'card-title' : 'card-desc', cardId: t.cardId };
      syncPackToolbar();
    });
    ui.cardsGrid.addEventListener('focusout', function (e) {
      const t = targetOf(e);
      if (!t) return;
      commitCardInlineText(t.el);
      scheduleClearActivePackText(t.el);
    });
    ui.cardsGrid.addEventListener('keydown', function (e) {
      const t = targetOf(e);
      if (!t) return;
      if (e.key === 'Enter') { e.preventDefault(); t.el.blur(); }
      if (e.key === 'Escape') {
        e.preventDefault();
        const card = findCardById(t.cardId);
        if (card) t.el.textContent = t.field === 'title' ? card.title : card.desc;
        t.el.blur();
      }
    });
  }

  /* ---------- עריכה ישירה: טקסט כפתור צוות הפיתוח ---------- */

  function commitClosingInlineText() {
    const ui = els();
    if (!ui.devTeamLabel) return;
    const value = String(ui.devTeamLabel.textContent || '').trim();
    state.closing.label = value.slice(0, 40) || 'צוות פיתוח';
    persist();
    if (isEditorOpen()) snapshotJSON = JSON.stringify(state);
  }

  function commitClosingElementText(label) {
    const wrap = label && label.closest ? label.closest('.pack-closing-text') : null;
    const id = wrap && wrap.getAttribute('data-icon-id');
    const item = id ? state.closing.icons.find(function (i) { return i.id === id; }) : null;
    if (!item || item.kind !== 'text') return;
    item.value = String(label.textContent || '').trim().slice(0, 80) || 'טקסט';
    if (document.activeElement !== label) label.textContent = item.value;
    persist();
    if (isEditorOpen()) {
      snapshotJSON = JSON.stringify(state);
      refreshClosingIconsList();
    }
  }

  function bindInlineClosingText() {
    const ui = els();
    if (!ui.closingSection || ui.closingSection.dataset.textBound === '1') return;
    ui.closingSection.dataset.textBound = '1';

    ui.closingSection.addEventListener('focusin', function (e) {
      if (!isPageEditMode() || isClosingHidden()) return;
      if (ui.devTeamLabel && e.target === ui.devTeamLabel) {
        activePackText = { el: ui.devTeamLabel, role: 'closing-label', cardId: null };
        syncPackToolbar();
        return;
      }
      const label = e.target.closest ? e.target.closest('.pack-closing-text-label') : null;
      if (!label || !ui.closingSection.contains(label)) return;
      const wrap = label.closest('.pack-closing-text');
      const id = wrap && wrap.getAttribute('data-icon-id');
      if (!id) return;
      activePackText = { el: label, role: 'closing-text', cardId: null, itemId: id };
      syncPackToolbar();
    });
    ui.closingSection.addEventListener('focusout', function (e) {
      if (ui.devTeamLabel && e.target === ui.devTeamLabel) {
        commitClosingInlineText();
        scheduleClearActivePackText(ui.devTeamLabel);
        return;
      }
      const label = e.target.classList && e.target.classList.contains('pack-closing-text-label') ? e.target : null;
      if (!label) return;
      commitClosingElementText(label);
      scheduleClearActivePackText(label);
    });
    ui.closingSection.addEventListener('keydown', function (e) {
      if (ui.devTeamLabel && e.target === ui.devTeamLabel) {
        if (e.key === 'Enter') { e.preventDefault(); ui.devTeamLabel.blur(); }
        if (e.key === 'Escape') { e.preventDefault(); ui.devTeamLabel.textContent = state.closing.label; ui.devTeamLabel.blur(); }
        return;
      }
      const label = e.target.classList && e.target.classList.contains('pack-closing-text-label') ? e.target : null;
      if (!label) return;
      if (e.key === 'Enter') { e.preventDefault(); label.blur(); }
      if (e.key === 'Escape') {
        e.preventDefault();
        const wrap = label.closest('.pack-closing-text');
        const id = wrap && wrap.getAttribute('data-icon-id');
        const item = id ? state.closing.icons.find(function (i) { return i.id === id; }) : null;
        if (item) label.textContent = item.value;
        label.blur();
      }
    });
  }

  /* ---------- גרירה חופשית: לוגואים בכותרת ---------- */

  function bindLogoDragging() {
    const ui = els();
    if (!ui.headerLogos || ui.headerLogos.dataset.bound === '1') return;
    ui.headerLogos.dataset.bound = '1';

    ui.headerLogos.addEventListener('pointerdown', function (e) {
      const img = e.target.closest ? e.target.closest('.pack-header-logo') : null;
      if (!img || !isPageEditMode()) return;
      const id = img.getAttribute('data-logo-id');
      const logo = state.header.logos.find(function (l) { return l.id === id; });
      if (!logo) return;
      e.preventDefault();
      const canvas = ui.header;
      const rect = canvas.getBoundingClientRect();
      img.classList.add('is-dragging');
      img.setPointerCapture(e.pointerId);

      function onMove(ev) {
        const x = ((ev.clientX - rect.left) / rect.width) * 100;
        const y = ((ev.clientY - rect.top) / rect.height) * 100;
        logo.x = clamp(x, 0, 100, logo.x);
        logo.y = clamp(y, 0, 100, logo.y);
        img.style.setProperty('--lx', logo.x + '%');
        img.style.setProperty('--ly', logo.y + '%');
      }
      function onUp(ev) {
        img.classList.remove('is-dragging');
        try { img.releasePointerCapture(ev.pointerId); } catch (_) {}
        img.removeEventListener('pointermove', onMove);
        img.removeEventListener('pointerup', onUp);
        img.removeEventListener('pointercancel', onUp);
        if (!isEditorOpen()) persist();
      }
      img.addEventListener('pointermove', onMove);
      img.addEventListener('pointerup', onUp);
      img.addEventListener('pointercancel', onUp);
    });
  }

  /* ---------- גרירה חופשית: טקסטים בכותרת ---------- */

  function bindHeaderTextDragging() {
    const ui = els();
    if (!ui.header || ui.header.dataset.textDragBound === '1') return;
    ui.header.dataset.textDragBound = '1';

    ui.header.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode() || isHeaderHidden()) return;
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest && e.target.closest('.pack-section-edit, .pack-header-resize, .pack-header-logo, .pack-header-drop')) return;
      const el = e.target.closest ? e.target.closest('#packHeaderTitle, #packHeaderSubtitle') : null;
      if (!el || el.hidden) return;
      if (document.activeElement === el) return;

      const item = el.id === 'packHeaderTitle' ? state.header.title : state.header.subtitle;
      if (!item || item.hidden) return;

      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;
      const rect = ui.header.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      el.classList.add('is-dragging');
      try { el.setPointerCapture(e.pointerId); } catch (_) {}

      function onMove(ev) {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) moved = true;
        if (!moved) return;
        const padX = Math.min(45, Math.max(4, (el.offsetWidth / 2 / rect.width) * 100));
        const padY = Math.min(45, Math.max(6, (el.offsetHeight / 2 / rect.height) * 100));
        item.x = clamp(((ev.clientX - rect.left) / rect.width) * 100, padX, 100 - padX, item.x);
        item.y = clamp(((ev.clientY - rect.top) / rect.height) * 100, padY, 100 - padY, item.y);
        item.freePlaced = true;
        el.style.setProperty('--tx', item.x + '%');
        el.style.setProperty('--ty', item.y + '%');
      }
      function onUp(ev) {
        el.classList.remove('is-dragging');
        try { el.releasePointerCapture(ev.pointerId); } catch (_) {}
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        if (!moved) el.focus();
        if (!isEditorOpen()) persist();
      }
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    });
  }

  /* ---------- גרירה חופשית: כפתור צוות פיתוח ואלמנטים באזור התחתון ---------- */

  function clampDragPercent(value, pad, fallback) {
    const maxPad = Math.min(Math.ceil(pad), 49);
    return clamp(value, maxPad, 100 - maxPad, fallback);
  }

  /* מאפשר לאייקון ולכפתור פעולה לשבת גם מחוץ לקובייה (פינה / מתחת לצורה). */
  function clampCardIconDragPercent(value, iconSizePx, axisPx, fallback) {
    const overflowPx = Math.min(160, Math.max(96, iconSizePx + 36));
    const padPx = iconSizePx / 2 - overflowPx;
    const pad = axisPx ? (padPx / axisPx) * 100 : 0;
    const min = Math.max(CARD_OVERLAY_POS_MIN, pad);
    const max = Math.min(CARD_OVERLAY_POS_MAX, 100 - pad);
    return clamp(value, min, max, fallback);
  }

  function cardOverlayPeers(card, skipPos) {
    const peers = [];
    (card.icons || []).forEach(function (icon) {
      if (icon !== skipPos) peers.push(icon);
    });
    ['view', 'download', 'print'].forEach(function (kind) {
      const action = card.actions && card.actions[kind];
      if (action && action.enabled && action !== skipPos) peers.push(action);
    });
    return peers;
  }

  function nearestSnap(value, axes, threshold) {
    let best = null;
    let bestDist = threshold;
    for (let i = 0; i < axes.length; i++) {
      const dist = Math.abs(value - axes[i]);
      if (dist <= bestDist) {
        bestDist = dist;
        best = axes[i];
      }
    }
    return best;
  }

  function nearestSnapEntry(value, entries, threshold) {
    let best = null;
    let bestDist = threshold;
    for (let i = 0; i < entries.length; i++) {
      const dist = Math.abs(value - entries[i].value);
      if (dist <= bestDist) {
        bestDist = dist;
        best = entries[i];
      }
    }
    return best;
  }

  function freeformSnapEntries(skipCard, dragEl, canvasRect) {
    const dragHw = canvasRect.width ? (dragEl.offsetWidth / 2 / canvasRect.width) * 100 : 0;
    const dragHh = canvasRect.height ? (dragEl.offsetHeight / 2 / canvasRect.height) * 100 : 0;
    const xs = [{ value: 50, line: 50 }];
    const ys = [{ value: 50, line: 50 }];
    state.cards.items.forEach(function (item) {
      if (item.id === skipCard.id) return;
      const el = document.querySelector('.pack-card[data-id="' + item.id + '"]');
      const hw = el && canvasRect.width ? (el.offsetWidth / 2 / canvasRect.width) * 100 : 0;
      const hh = el && canvasRect.height ? (el.offsetHeight / 2 / canvasRect.height) * 100 : 0;
      xs.push({ value: item.x, line: item.x });
      ys.push({ value: item.y, line: item.y });
      xs.push({ value: item.x - hw + dragHw, line: item.x - hw });
      xs.push({ value: item.x + hw - dragHw, line: item.x + hw });
      ys.push({ value: item.y - hh + dragHh, line: item.y - hh });
      ys.push({ value: item.y + hh - dragHh, line: item.y + hh });
    });
    return { xs: xs, ys: ys };
  }

  function guideSpan(values) {
    if (!values.length || values.length === 1) return { start: 0, size: 100 };
    const min = Math.min.apply(null, values);
    const max = Math.max.apply(null, values);
    const pad = 3;
    return { start: min - pad, size: Math.max(max - min + pad * 2, 0.8) };
  }

  function ensureCardGuides(host) {
    let box = host.querySelector(':scope > .pack-card-guides');
    if (!box) {
      box = document.createElement('div');
      box.className = 'pack-card-guides';
      box.setAttribute('aria-hidden', 'true');
      host.appendChild(box);
    }
    return box;
  }

  function renderCardGuides(host, snapX, snapY, xSpan, ySpan) {
    const box = ensureCardGuides(host);
    box.innerHTML = '';
    if (snapY != null) {
      const line = document.createElement('div');
      line.className = 'pack-card-guide pack-card-guide--h';
      line.style.top = snapY + '%';
      line.style.left = xSpan.start + '%';
      line.style.width = xSpan.size + '%';
      box.appendChild(line);
    }
    if (snapX != null) {
      const line = document.createElement('div');
      line.className = 'pack-card-guide pack-card-guide--v';
      line.style.left = snapX + '%';
      line.style.top = ySpan.start + '%';
      line.style.height = ySpan.size + '%';
      box.appendChild(line);
    }
  }

  function clearCardGuides(host) {
    const box = host.querySelector(':scope > .pack-card-guides');
    if (box) box.remove();
  }

  function bindClosingDragging() {
    const ui = els();
    const section = ui.closingSection;
    if (!section || section.dataset.dragBound === '1') return;
    section.dataset.dragBound = '1';

    section.addEventListener('click', function (e) {
      const item = e.target.closest ? e.target.closest('.pack-dev-team-btn, .pack-closing-icon, .pack-closing-text') : null;
      if (!item) return;
      if (isPageEditMode()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (item.classList.contains('pack-dev-team-btn') && !state.closing.href) {
        e.preventDefault();
        return;
      }
      if (item.classList.contains('pack-closing-icon') && item.getAttribute('data-has-href') !== '1') {
        e.preventDefault();
        return;
      }
      if (item.classList.contains('pack-closing-text') && item.getAttribute('data-has-href') === '1') {
        const href = item.getAttribute('data-href');
        if (href) window.open(href, '_blank', 'noopener,noreferrer');
      }
    });

    section.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode() || isClosingHidden()) return;
      if (e.target.closest && e.target.closest('.pack-section-edit, .pack-closing-resize')) return;
      if (e.target.id === 'packDevTeamLabel') return; // אפשרו לחיצה לעריכת הטקסט במקום גרירה
      const focusedText = e.target.closest && e.target.closest('.pack-closing-text-label');
      if (focusedText && document.activeElement === focusedText) return;
      if (e.button != null && e.button !== 0) return;
      const btn = e.target.closest ? e.target.closest('.pack-dev-team-btn') : null;
      const iconEl = e.target.closest ? e.target.closest('.pack-closing-icon, .pack-closing-text') : null;
      if (!btn && !iconEl) return;

      const el = btn || iconEl;
      let pos;
      if (btn) {
        pos = state.closing;
      } else {
        const id = iconEl.getAttribute('data-icon-id');
        pos = state.closing.icons.find(function (item) { return item.id === id; });
      }
      if (!pos) return;

      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;
      const rect = section.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      el.classList.add('is-dragging');
      try { el.setPointerCapture(e.pointerId); } catch (_) {}

      function onMove(ev) {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) moved = true;
        const padX = (el.offsetWidth / 2 / rect.width) * 100;
        const padY = (el.offsetHeight / 2 / rect.height) * 100;
        pos.x = clampDragPercent(((ev.clientX - rect.left) / rect.width) * 100, padX, pos.x);
        pos.y = clampDragPercent(((ev.clientY - rect.top) / rect.height) * 100, padY, pos.y);
        el.style.setProperty('--cx', pos.x + '%');
        el.style.setProperty('--cy', pos.y + '%');
      }
      function onUp(ev) {
        el.classList.remove('is-dragging');
        try { el.releasePointerCapture(ev.pointerId); } catch (_) {}
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);
        if (!moved && el.classList.contains('pack-closing-text')) {
          const label = el.querySelector('.pack-closing-text-label');
          if (label) label.focus();
        }
        if (!isEditorOpen()) persist();
      }
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    });
  }

  /* ---------- גרירה חופשית: אייקונים וכפתורי פעולה בתוך קובייה ---------- */

  function bindCardIconDragging() {
    const ui = els();
    if (!ui.cardsGrid || ui.cardsGrid.dataset.iconDragBound === '1') return;
    ui.cardsGrid.dataset.iconDragBound = '1';

    ui.cardsGrid.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode()) return;
      if (e.button != null && e.button !== 0) return;
      const cardEl = e.target.closest ? e.target.closest('.pack-card') : null;
      if (!cardEl) return;
      const card = state.cards.items.find(function (item) { return item.id === cardEl.getAttribute('data-id'); });
      if (!card) return;

      const iconEl = e.target.closest ? e.target.closest('.pack-card-icon') : null;
      const actionEl = !iconEl && e.target.closest ? e.target.closest('.pack-card-action') : null;
      const dragEl = iconEl || actionEl;
      if (!dragEl) return;

      let pos;
      let xVar;
      let yVar;
      if (iconEl) {
        const iconId = iconEl.getAttribute('data-card-icon-id');
        pos = (card.icons || []).find(function (item) { return item.id === iconId; });
        xVar = '--ix';
        yVar = '--iy';
      } else {
        const kind = actionEl.getAttribute('data-action-kind');
        pos = kind && card.actions ? card.actions[kind] : null;
        xVar = '--ax';
        yVar = '--ay';
      }
      if (!pos) return;

      e.preventDefault();
      e.stopPropagation();
      const rect = cardEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dragEl.classList.add('is-dragging');
      try { dragEl.setPointerCapture(e.pointerId); } catch (_) {}
      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;

      function onMove(ev) {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) moved = true;
        let x = clampCardIconDragPercent(
          ((ev.clientX - rect.left) / rect.width) * 100,
          dragEl.offsetWidth,
          rect.width,
          pos.x
        );
        let y = clampCardIconDragPercent(
          ((ev.clientY - rect.top) / rect.height) * 100,
          dragEl.offsetHeight,
          rect.height,
          pos.y
        );
        const peers = cardOverlayPeers(card, pos);
        const xs = [0, 50, 100].concat(peers.map(function (item) { return item.x; }));
        const ys = [0, 50, 100].concat(peers.map(function (item) { return item.y; }));
        const snapX = nearestSnap(x, xs, (CARD_SNAP_PX / rect.width) * 100);
        const snapY = nearestSnap(y, ys, (CARD_SNAP_PX / rect.height) * 100);
        if (snapX != null) x = snapX;
        if (snapY != null) y = snapY;
        pos.x = x;
        pos.y = y;
        dragEl.style.setProperty(xVar, pos.x + '%');
        dragEl.style.setProperty(yVar, pos.y + '%');

        const xPeers = [x].concat(peers.filter(function (item) { return snapY != null && Math.abs(item.y - snapY) < 0.05; }).map(function (item) { return item.x; }));
        const yPeers = [y].concat(peers.filter(function (item) { return snapX != null && Math.abs(item.x - snapX) < 0.05; }).map(function (item) { return item.y; }));
        renderCardGuides(
          cardEl,
          snapX,
          snapY,
          guideSpan(snapY != null ? xPeers : []),
          guideSpan(snapX != null ? yPeers : [])
        );
      }
      function onUp(ev) {
        dragEl.classList.remove('is-dragging');
        clearCardGuides(cardEl);
        try { dragEl.releasePointerCapture(ev.pointerId); } catch (_) {}
        dragEl.removeEventListener('pointermove', onMove);
        dragEl.removeEventListener('pointerup', onUp);
        dragEl.removeEventListener('pointercancel', onUp);
        if (moved) {
          function suppressClick(clickEv) {
            clickEv.preventDefault();
            clickEv.stopPropagation();
            dragEl.removeEventListener('click', suppressClick, true);
          }
          dragEl.addEventListener('click', suppressClick, true);
        }
        if (!isEditorOpen()) persist();
      }
      dragEl.addEventListener('pointermove', onMove);
      dragEl.addEventListener('pointerup', onUp);
      dragEl.addEventListener('pointercancel', onUp);
    }, true);
  }

  /* ---------- שינוי גובה כותרת בגרירה ---------- */

  function bindResize() {
    const ui = els();
    if (!ui.headerResize || ui.headerResize.dataset.bound === '1') return;
    ui.headerResize.dataset.bound = '1';

    ui.headerResize.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode() || isHeaderHidden()) return;
      e.preventDefault();
      e.stopPropagation();
      const startY = e.clientY;
      const startH = state.header.height;
      ui.headerResize.classList.add('is-dragging');
      ui.header.classList.add('is-dragging');
      ui.headerResize.setPointerCapture(e.pointerId);

      function onMove(ev) {
        state.header.height = clampHeight(startH + (ev.clientY - startY));
        renderHeaderBg();
      }
      function onUp(ev) {
        ui.headerResize.classList.remove('is-dragging');
        ui.header.classList.remove('is-dragging');
        try { ui.headerResize.releasePointerCapture(ev.pointerId); } catch (_) {}
        ui.headerResize.removeEventListener('pointermove', onMove);
        ui.headerResize.removeEventListener('pointerup', onUp);
        ui.headerResize.removeEventListener('pointercancel', onUp);
        if (!isEditorOpen()) persist();
        else openEditorRefreshRange('packHeaderHeight', state.header.height);
      }
      ui.headerResize.addEventListener('pointermove', onMove);
      ui.headerResize.addEventListener('pointerup', onUp);
      ui.headerResize.addEventListener('pointercancel', onUp);
    });
  }

  function bindCardsFreeformDrag() {
    const ui = els();
    if (!ui.cardsGrid || ui.cardsGrid.dataset.dragBound === '1') return;
    ui.cardsGrid.dataset.dragBound = '1';

    ui.cardsGrid.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode() || !isCardsFreeform()) return;
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest && e.target.closest('[data-card-edit], [data-card-delete], .pack-card-action, button, .pack-cards-resize, [data-card-text], .pack-card-icon')) {
        return; // אפשרו לחיצה לעריכת טקסט הקובייה (כותרת/תיאור) במקום גרירה
      }
      const cardEl = e.target.closest ? e.target.closest('.pack-card') : null;
      if (!cardEl) return;
      const card = state.cards.items.find(function (item) { return item.id === cardEl.getAttribute('data-id'); });
      if (!card) return;

      e.preventDefault();
      const canvas = ui.cardsGrid;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const padX = Math.min(45, Math.max(6, (cardEl.offsetWidth / 2 / rect.width) * 100));
      const padY = Math.min(45, Math.max(8, (cardEl.offsetHeight / 2 / rect.height) * 100));
      cardEl.classList.add('is-dragging');
      cardEl.setPointerCapture(e.pointerId);

      function onMove(ev) {
        let x = clamp(((ev.clientX - rect.left) / rect.width) * 100, padX, 100 - padX, card.x);
        let y = clamp(((ev.clientY - rect.top) / rect.height) * 100, padY, 100 - padY, card.y);
        const entries = freeformSnapEntries(card, cardEl, rect);
        const thX = (12 / rect.width) * 100;
        const thY = (12 / rect.height) * 100;
        const hitX = nearestSnapEntry(x, entries.xs, thX);
        const hitY = nearestSnapEntry(y, entries.ys, thY);
        let lineX = null;
        let lineY = null;
        if (hitX && hitX.value >= padX && hitX.value <= 100 - padX) {
          x = hitX.value;
          lineX = hitX.line;
        }
        if (hitY && hitY.value >= padY && hitY.value <= 100 - padY) {
          y = hitY.value;
          lineY = hitY.line;
        }
        card.x = x;
        card.y = y;
        cardEl.style.setProperty('--cx', card.x + '%');
        cardEl.style.setProperty('--cy', card.y + '%');

        const xPeers = [x].concat(state.cards.items.filter(function (item) {
          return item.id !== card.id && lineY != null && Math.abs(item.y - y) < 0.05;
        }).map(function (item) { return item.x; }));
        const yPeers = [y].concat(state.cards.items.filter(function (item) {
          return item.id !== card.id && lineX != null && Math.abs(item.x - x) < 0.05;
        }).map(function (item) { return item.y; }));
        renderCardGuides(
          canvas,
          lineX,
          lineY,
          guideSpan(lineY != null ? xPeers : []),
          guideSpan(lineX != null ? yPeers : [])
        );
      }
      function onUp(ev) {
        cardEl.classList.remove('is-dragging');
        clearCardGuides(canvas);
        try { cardEl.releasePointerCapture(ev.pointerId); } catch (_) {}
        cardEl.removeEventListener('pointermove', onMove);
        cardEl.removeEventListener('pointerup', onUp);
        cardEl.removeEventListener('pointercancel', onUp);
        if (!isEditorOpen()) persist();
      }
      cardEl.addEventListener('pointermove', onMove);
      cardEl.addEventListener('pointerup', onUp);
      cardEl.addEventListener('pointercancel', onUp);
    });
  }

  function bindCardsHeightResize() {
    const ui = els();
    if (!ui.cardsResize || ui.cardsResize.dataset.bound === '1') return;
    ui.cardsResize.dataset.bound = '1';

    ui.cardsResize.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode() || !isCardsFreeform()) return;
      e.preventDefault();
      e.stopPropagation();
      const startY = e.clientY;
      const startH = clampFreeHeight(state.cards.freeHeight);
      ui.cardsResize.classList.add('is-dragging');
      ui.cardsResize.setPointerCapture(e.pointerId);

      function onMove(ev) {
        state.cards.freeHeight = clampFreeHeight(startH + (ev.clientY - startY));
        if (ui.cardsSection) {
          ui.cardsSection.style.setProperty('--pack-cards-free-height', state.cards.freeHeight + 'px');
        }
        openEditorRefreshRange('packCardsFreeHeight', state.cards.freeHeight);
      }
      function onUp(ev) {
        ui.cardsResize.classList.remove('is-dragging');
        try { ui.cardsResize.releasePointerCapture(ev.pointerId); } catch (_) {}
        ui.cardsResize.removeEventListener('pointermove', onMove);
        ui.cardsResize.removeEventListener('pointerup', onUp);
        ui.cardsResize.removeEventListener('pointercancel', onUp);
        if (!isEditorOpen()) persist();
      }
      ui.cardsResize.addEventListener('pointermove', onMove);
      ui.cardsResize.addEventListener('pointerup', onUp);
      ui.cardsResize.addEventListener('pointercancel', onUp);
    });
  }

  function bindClosingHeightResize() {
    const ui = els();
    if (!ui.closingResize || ui.closingResize.dataset.bound === '1') return;
    ui.closingResize.dataset.bound = '1';

    ui.closingResize.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode() || isClosingHidden()) return;
      e.preventDefault();
      e.stopPropagation();
      const startY = e.clientY;
      const startH = clampClosingHeight(state.closing.height);
      ui.closingResize.classList.add('is-dragging');
      if (ui.closingSection) ui.closingSection.classList.add('is-resizing');
      ui.closingResize.setPointerCapture(e.pointerId);

      function onMove(ev) {
        state.closing.height = clampClosingHeight(startH + (ev.clientY - startY));
        if (ui.closingSection) {
          ui.closingSection.style.setProperty('--pack-closing-height', state.closing.height + 'px');
        }
        openEditorRefreshRange('packClosingHeight', state.closing.height);
      }
      function onUp(ev) {
        ui.closingResize.classList.remove('is-dragging');
        if (ui.closingSection) ui.closingSection.classList.remove('is-resizing');
        try { ui.closingResize.releasePointerCapture(ev.pointerId); } catch (_) {}
        ui.closingResize.removeEventListener('pointermove', onMove);
        ui.closingResize.removeEventListener('pointerup', onUp);
        ui.closingResize.removeEventListener('pointercancel', onUp);
        if (!isEditorOpen()) persist();
      }
      ui.closingResize.addEventListener('pointermove', onMove);
      ui.closingResize.addEventListener('pointerup', onUp);
      ui.closingResize.addEventListener('pointercancel', onUp);
    });
  }

  function openEditorRefreshRange(id, value) {
    const ui = els();
    if (!ui.editFields) return;
    const range = ui.editFields.querySelector('#' + id);
    const num = ui.editFields.querySelector('#' + id + 'Num');
    if (range) range.value = String(value);
    if (num) num.value = String(value);
  }

  /* ---------- גרירה/שחרור תמונה על הכותרת ---------- */

  function bindHeaderImageDrop() {
    const ui = els();
    if (!ui.header || ui.header.dataset.dropBound === '1') return;
    ui.header.dataset.dropBound = '1';

    function activeForDrop() {
      return isEditorOpen();
    }

    ui.header.addEventListener('dragenter', function (e) {
      if (!activeForDrop() || !isFileDrag(e)) return;
      e.preventDefault();
      ui.header.classList.add('is-drop-target');
      if (ui.headerDrop) ui.headerDrop.hidden = false;
    });
    ui.header.addEventListener('dragover', function (e) {
      if (!activeForDrop() || !isFileDrag(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      ui.header.classList.add('is-drop-target');
      if (ui.headerDrop) ui.headerDrop.hidden = false;
    });
    ui.header.addEventListener('dragleave', function (e) {
      if (ui.header.contains(e.relatedTarget)) return;
      ui.header.classList.remove('is-drop-target');
      if (ui.headerDrop) ui.headerDrop.hidden = true;
    });
    ui.header.addEventListener('drop', function (e) {
      if (!activeForDrop() || !isFileDrag(e)) return;
      e.preventDefault();
      ui.header.classList.remove('is-drop-target');
      if (ui.headerDrop) ui.headerDrop.hidden = true;
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      readImageAsDataUrl(file, function (dataUrl) {
        state.header.image = dataUrl;
        state.header.mode = 'image';
        renderHeader();
        openEditorRefresh();
      });
    });
  }

  /* ---------- סנכרון תצוגת כפתורי עריכה עם מצב עריכה ---------- */

  let lastPackEditingState = null;

  function commitActivePackInlineText() {
    if (!activePackText || !activePackText.el) return;
    const el = activePackText.el;
    const role = activePackText.role;
    if (role === 'header-title') commitInlineText(el, 'title');
    else if (role === 'header-subtitle') commitInlineText(el, 'subtitle');
    else if (role === 'card-title' || role === 'card-desc') commitCardInlineText(el);
    else if (role === 'closing-label') commitClosingInlineText();
    else if (role === 'closing-text') commitClosingElementText(el);
  }

  function commitPendingEdits() {
    commitActivePackInlineText();
    if (isEditorOpen()) return saveEditor();
    return persistNow();
  }

  function syncEditUi() {
    const ui = els();
    const editing = isPageEditMode();
    if (ui.headerEditBtn) ui.headerEditBtn.hidden = !editing;
    if (ui.headerResize) ui.headerResize.hidden = !editing || isHeaderHidden();
    if (ui.cardsEditBtn) ui.cardsEditBtn.hidden = !editing;
    if (ui.cardsResize) ui.cardsResize.hidden = !editing || !isCardsFreeform();
    if (ui.closingEditBtn) ui.closingEditBtn.hidden = !editing;
    if (ui.closingResize) ui.closingResize.hidden = !editing || isClosingHidden();
    if (ui.headerTitle) {
      ui.headerTitle.hidden = isHeaderHidden() || isHeaderTextHidden('title');
      ui.headerTitle.setAttribute('contenteditable', editing && !ui.headerTitle.hidden ? 'true' : 'false');
    }
    if (ui.headerSubtitle) {
      ui.headerSubtitle.hidden = isHeaderHidden() || isHeaderTextHidden('subtitle');
      ui.headerSubtitle.setAttribute('contenteditable', editing && !ui.headerSubtitle.hidden ? 'true' : 'false');
    }
    if (ui.devTeamLabel) ui.devTeamLabel.setAttribute('contenteditable', editing && !isClosingHidden() ? 'true' : 'false');
    document.querySelectorAll('.pack-closing-text-label').forEach(function (el) {
      el.setAttribute('contenteditable', editing && !isClosingHidden() ? 'true' : 'false');
    });
    // הקוביות בנויות מ-HTML שנוצר מחדש ותלוי במצב העריכה (contenteditable + הצגת
    // תיאור ריק) — רק כשהמצב באמת משתנה מרעננים אותן, כדי לא לפגוע בפוקוס באמצע עריכה.
    if (lastPackEditingState !== editing) {
      if (lastPackEditingState === true && !editing) {
        commitPendingEdits();
      }
      lastPackEditingState = editing;
      renderCards();
      renderClosingIcons();
    }
    if (!editing) {
      if (activePackText) { activePackText = null; syncPackToolbar(); }
    }
  }

  /* ---------- חיווט אירועים כללי ---------- */

  function handleCardsGridClick(e) {
    const editBtn = e.target.closest ? e.target.closest('[data-card-edit]') : null;
    if (editBtn) { openCardEditor(editBtn.getAttribute('data-card-edit')); return; }
    const delBtn = e.target.closest ? e.target.closest('[data-card-delete]') : null;
    if (delBtn) { e.preventDefault(); removeCard(delBtn.getAttribute('data-card-delete')); return; }
    if (!isPageEditMode()) return;
    const action = e.target.closest ? e.target.closest('.pack-card-action') : null;
    if (action) { e.preventDefault(); return; }
  }

  function handleCardsGridClickReadMode(e) {
    if (isPageEditMode()) return;
    const soonCard = e.target.closest ? e.target.closest('.pack-card.is-coming-soon') : null;
    if (soonCard) {
      e.preventDefault();
      return;
    }
    const printBtn = e.target.closest ? e.target.closest('[data-print-href]') : null;
    if (printBtn) {
      e.preventDefault();
      const href = printBtn.getAttribute('data-print-href');
      if (href) window.open(href, '_blank', 'noopener,noreferrer');
      else window.print();
      return;
    }
    const link = e.target.closest ? e.target.closest('a.pack-card-action') : null;
    if (link && link.getAttribute('data-has-href') !== '1') e.preventDefault();
  }

  function bindEvents() {
    if (bound) return;
    bound = true;
    const ui = els();
    if (!ui.header) return;

    if (ui.headerEditBtn) {
      ui.headerEditBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (isEditorOpen()) closeEditor(true);
        else openHeaderEditor();
      });
    }
    if (ui.cardsEditBtn) {
      ui.cardsEditBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (isEditorOpen()) closeEditor(true);
        else openCardsSectionEditor();
      });
    }
    if (ui.cardsAddBtn) {
      ui.cardsAddBtn.addEventListener('click', function (e) {
        e.preventDefault();
        addCard();
      });
    }
    if (ui.closingEditBtn) {
      ui.closingEditBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (isEditorOpen()) closeEditor(true);
        else openClosingEditor();
      });
    }
    if (ui.cardsGrid) {
      ui.cardsGrid.addEventListener('click', handleCardsGridClick);
      ui.cardsGrid.addEventListener('click', handleCardsGridClickReadMode);
    }
    if (ui.editClose) ui.editClose.addEventListener('click', function () { saveEditor(); });
    if (ui.editCancel) ui.editCancel.addEventListener('click', function () { closeEditor(true); });
    if (ui.editForm) {
      ui.editForm.addEventListener('submit', function (e) {
        e.preventDefault();
        saveEditor();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isEditorOpen()) return;
      if (!isPackActive()) return;
      const active = document.activeElement;
      if (active && (active.id === 'packHeaderTitle' || active.id === 'packHeaderSubtitle')) return;
      e.preventDefault();
      closeEditor(true);
    });

    bindResize();
    bindCardsFreeformDrag();
    bindCardIconDragging();
    bindCardsHeightResize();
    bindClosingHeightResize();
    bindLogoDragging();
    bindHeaderTextDragging();
    bindClosingDragging();
    bindHeaderImageDrop();
    bindInlineHeaderText();
    bindInlineCardText();
    bindInlineClosingText();
    bindHslaPopoverObserver();

    const btnEdit = document.getElementById('btnEdit');
    if (btnEdit) {
      btnEdit.addEventListener('click', function () {
        window.setTimeout(syncEditUi, 0);
      });
    }
    new MutationObserver(function () {
      if (!isPackActive() && activePackText) {
        activePackText = null;
        syncPackToolbar();
      }
      syncEditUi();
      bindInlineHeaderText();
    }).observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-app-mode', 'data-generator'],
    });
  }

  /* ---------- הגדרות: טעינה / איפוס / ייצוא ---------- */

  const PROJECT_STYLES = [
    'css/shared/shell.css',
    'css/manhalan/style.css',
    'css/pack/pack.css',
  ];
  const PROJECT_SCRIPTS = [
    'js/shared/shell.js',
    'js/manhalan/app.js',
    'js/pack/pack.js',
  ];

  function closePackSettingsMenu() {
    const menu = document.getElementById('settingsMenu');
    const btn = document.getElementById('btnSettings');
    if (menu) menu.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        const result = String(reader.result || '');
        const comma = result.indexOf(',');
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = function () { reject(reader.error || new Error('שגיאה בקריאת קובץ')); };
      reader.readAsDataURL(blob);
    });
  }

  function serializeBootstrapJson(data) {
    return JSON.stringify(data)
      .replace(/</g, '\\u003c')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }

  function escapeForInlineScript(text) {
    return String(text || '').replace(/<\/script/gi, '<\\/script');
  }

  function collectSiteTheme() {
    return normalizeTheme(state && state.theme, DEFAULT_THEME);
  }

  function collectPackSnapshot() {
    persistNow();
    return {
      version: PACK_BOOTSTRAP_VERSION,
      exportedAt: new Date().toISOString(),
      mode: 'user',
      generator: 'pack',
      pack: cloneState(state),
      theme: collectSiteTheme(),
    };
  }

  function importPackSnapshot(snapshot) {
    if (!snapshot || !snapshot.pack || typeof snapshot.pack !== 'object') {
      throw new Error('קובץ לא תקין או חסרים בו נתוני מארז');
    }
    const next = normalizeState(snapshot.pack);
    if ((!snapshot.pack.theme || typeof snapshot.pack.theme !== 'object') && snapshot.theme) {
      next.theme = normalizeTheme(snapshot.theme);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (_) {
      throw new Error('אין מספיק מקום לשמירה. נסו תמונה קטנה יותר.');
    }
    state = next;
  }

  function bootstrapFromEmbeddedIfPresent() {
    const el = document.getElementById(PACK_BOOTSTRAP_ID);
    if (!el || !String(el.textContent || '').trim()) return;
    try {
      const snapshot = JSON.parse(el.textContent);
      importPackSnapshot(snapshot);
    } catch (err) {
      console.warn('Pack bootstrap failed', err);
    }
  }

  function buildExportedPackHtml(snapshot, indexHtml, cssText, jsText, assetDataUrls) {
    const urls = assetDataUrls || {};
    let out = String(indexHtml || '');
    if (window.HebetShell && typeof window.HebetShell.applyClientExportShell === 'function') {
      out = window.HebetShell.applyClientExportShell(out, 'pack');
    } else {
      out = out.replace(
        /<body\b[^>]*>/i,
        '<body data-app-mode="user" class="user-mode is-pack" data-generator="pack">'
      );
    }
    out = out.replace(/<link rel="stylesheet" href="css\/(?:shared\/shell|manhalan\/style|pack\/pack|style)\.css(?:\?[^"]*)?">\s*/g, '');
    out = out.replace('</head>', '<style>\n' + cssText + '\n</style>\n</head>');

    if (urls.gateBg) {
      out = out.replace(/src="assets\/gate-bg\.jpg(?:\?[^"]*)?"/, 'src="' + urls.gateBg + '"');
    }
    if (urls.logo) {
      out = out.replace(/src="assets\/hebet-logo\.png(?:\?[^"]*)?"/, 'src="' + urls.logo + '"');
    }

    const bootstrapTag =
      '<script id="' + PACK_BOOTSTRAP_ID + '" type="application/json">' +
      serializeBootstrapJson(snapshot) +
      '</script>\n';

    out = out.replace(/<script src="js\/(?:shared\/shell|manhalan\/app|pack\/pack|app)\.js(?:\?[^"]*)?"><\/script>\s*/g, '');
    out = out.replace('</body>', bootstrapTag + '<script>\n' + escapeForInlineScript(jsText) + '\n</script>\n</body>');

    return out;
  }

  async function fetchProjectAsset(path) {
    if (window.HebetShell && typeof window.HebetShell.readProjectText === 'function') {
      return window.HebetShell.readProjectText(path);
    }
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error('לא ניתן לקרוא ' + path);
    return res.text();
  }

  async function exportPackUserModeHtml() {
    if (isUserMode()) return;
    closePackSettingsMenu();

    const picker = window.HebetShell && typeof window.HebetShell.pickClientHtmlSave === 'function'
      ? window.HebetShell.pickClientHtmlSave
      : null;
    const writer = window.HebetShell && typeof window.HebetShell.writeClientHtml === 'function'
      ? window.HebetShell.writeClientHtml
      : null;
    const saveTarget = picker ? await picker(PACK_EXPORT_FILENAME) : 'download';
    if (!saveTarget) return;

    commitPendingEdits();

    let snapshot;
    try {
      snapshot = collectPackSnapshot();
    } catch (err) {
      console.error(err);
      alert('שגיאה באיסוף הנתונים לייצוא.');
      return;
    }

    let html = '';
    try {
      const indexHtml = await fetchProjectAsset('index.html');
      const cssText = (await Promise.all(PROJECT_STYLES.map(fetchProjectAsset))).join('\n\n');
      const jsText = (await Promise.all(PROJECT_SCRIPTS.map(fetchProjectAsset))).join('\n\n');
      const assetDataUrls = {};
      try {
        const imgRes = await fetch('assets/gate-bg.jpg', { cache: 'no-store' });
        if (imgRes.ok) {
          const imgBlob = await imgRes.blob();
          const b64 = await blobToBase64(imgBlob);
          assetDataUrls.gateBg = 'data:' + (imgBlob.type || 'image/jpeg') + ';base64,' + b64;
        }
      } catch (imgErr) {
        console.warn('Gate image was not inlined into pack export', imgErr);
      }
      try {
        const logoRes = await fetch('assets/hebet-logo.png', { cache: 'no-store' });
        if (logoRes.ok) {
          const logoBlob = await logoRes.blob();
          const b64 = await blobToBase64(logoBlob);
          assetDataUrls.logo = 'data:' + (logoBlob.type || 'image/png') + ';base64,' + b64;
        }
      } catch (logoErr) {
        console.warn('Gate logo was not inlined into pack export', logoErr);
      }
      html = buildExportedPackHtml(snapshot, indexHtml, cssText, jsText, assetDataUrls);
    } catch (err) {
      console.warn('Full pack export failed, using live snapshot', err);
      if (!window.HebetShell || typeof window.HebetShell.buildLiveClientHtml !== 'function') {
        alert('לא ניתן לייצא כרגע. נסו שוב.');
        return;
      }
      try {
        html = await window.HebetShell.buildLiveClientHtml('pack', snapshot);
      } catch (snapErr) {
        console.error(snapErr);
        alert('לא ניתן לייצא כרגע. נסו שוב.');
        return;
      }
    }

    if (writer) {
      await writer(saveTarget, html, PACK_EXPORT_FILENAME);
      return;
    }

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = PACK_EXPORT_FILENAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function parsePackSnapshotFromHtmlText(htmlText) {
    const doc = new DOMParser().parseFromString(String(htmlText || ''), 'text/html');
    const bootstrapEl = doc.getElementById(PACK_BOOTSTRAP_ID);
    if (!bootstrapEl || !String(bootstrapEl.textContent || '').trim()) {
      throw new Error('לא נמצאו נתוני מארז בקובץ שנבחר');
    }
    return JSON.parse(bootstrapEl.textContent);
  }

  async function loadPackFromHtmlFile(file) {
    if (!file) return;
    closePackSettingsMenu();
    try {
      const htmlText = await file.text();
      const snapshot = parsePackSnapshotFromHtmlText(htmlText);
      importPackSnapshot(snapshot);
      if (window.HebetShell && typeof window.HebetShell.setResumeGenerator === 'function') {
        window.HebetShell.setResumeGenerator('pack');
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert((err && err.message) ? err.message : 'לא הצלחנו לטעון את הקובץ');
    }
  }

  function resetPackToDefaults() {
    if (isUserMode()) return;
    const ok = window.confirm(
      'לאפס את המארז ולהתחיל מהתחלה?\n\n' +
      'הכותרת, הקוביות והאזור התחתון יימחקו. לא ניתן לבטל.'
    );
    if (!ok) return;

    closePackSettingsMenu();
    if (isEditorOpen()) closeEditor(true);
    clearTimeout(saveTimer);
    state = cloneState(DEFAULT_STATE);
    persistNow();
    if (window.HebetShell && typeof window.HebetShell.setSavedEditMode === 'function') {
      window.HebetShell.setSavedEditMode('pack', false);
    }
    syncSharedEditMode(false);
    applyPackThemeToDom();
    renderAll();
    syncEditUi();
  }

  window.HebetPack = {
    reset: resetPackToDefaults,
    exportHtml: exportPackUserModeHtml,
    loadFromFile: loadPackFromHtmlFile,
    importSnapshot: importPackSnapshot,
    commitPendingEdits: commitPendingEdits,
    applyThemePatch: applyThemePatch,
    getTheme: collectSiteTheme,
  };

  /* ---------- אתחול ---------- */

  function initPackWorkspace() {
    const workspace = document.getElementById('packWorkspace');
    if (!workspace) return;
    loadState();
    bindEvents();
    renderAll();
    syncEditUi();
    bindInlineHeaderText();
  }

  bootstrapFromEmbeddedIfPresent();

  document.addEventListener('hebet:generator-enter', function (event) {
    const generator = event && event.detail && event.detail.generator;
    if (generator !== 'pack') return;
    initPackWorkspace();
    restorePackChrome();
  });

  document.addEventListener('hebet:generator-exit', function (event) {
    const leaving = event && event.detail && event.detail.generator;
    closePackSettingsMenu();
    if (leaving === 'pack') {
      commitPendingEdits();
    } else if (isEditorOpen()) {
      closeEditor(true);
    }
    closeHslaPopover();
  });

  if (document.body.getAttribute('data-generator') === 'pack') {
    initPackWorkspace();
    restorePackChrome();
  }

  if (window.HebetShell && typeof window.HebetShell.consumeResumeGenerator === 'function') {
    window.HebetShell.consumeResumeGenerator();
  }
})();
