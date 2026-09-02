/* =====================================================================
   מחולל מארז — קובץ עצמאי ומלא (כותרת + לוגואים + קוביות + סגירה).
   אין תלות בקוד/קלאסים של js/manhalan/app.js מעבר לרכיב הצבע הכללי
   שנחשף בתור window.HebetColor (ראו js/manhalan/app.js, בלוק "כללי").
   ===================================================================== */
(function () {
  const STORAGE_KEY = 'hebet-pack';
  const HEIGHT_MIN = 72;
  const HEIGHT_MAX = 320;
  const FREE_HEIGHT_MIN = 240;
  const FREE_HEIGHT_MAX = 1200;
  const CLOSING_HEIGHT_MIN = 64;
  const CLOSING_HEIGHT_MAX = 400;
  const DEFAULT_HEADER_COLOR = '#3d403c';
  const DEFAULT_CARD_COLOR = '#3d403c';
  const MAX_IMAGE_BYTES = 1.8 * 1024 * 1024;
  const ICON_GLYPHS = ['🎓', '▶', '🖥', '⬇', '🖨', '📄', '⚙', '★', '📷', '🧭', '📊', '🔧'];
  const ACTION_DEFAULT_GLYPH = { view: '▶', download: '⬇', print: '🖨' };
  const ACTION_LABELS = { view: 'צפייה', download: 'הורדה', print: 'הדפסה' };
  const CLOSING_ICON_SIZE_MIN = 8;
  const CLOSING_ICON_SIZE_MAX = 240;

  const DEFAULT_STATE = {
    header: {
      mode: 'color', // 'transparent' | 'color' | 'image'
      color: DEFAULT_HEADER_COLOR,
      image: '',
      opacity: 100,
      height: 108,
      title: { text: '', size: 30, color: '#ffffff', align: 'center' },
      subtitle: { text: '', size: 15, color: '#ffffff', align: 'center' },
      logos: [],
    },
    cards: {
      perRow: 4,
      gap: 16,
      freeform: false,
      freeHeight: 420,
      items: [],
    },
    closing: {
      enabled: false,
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
      },
      subtitle: {
        text: typeof s.text === 'string' ? s.text.slice(0, 140) : '',
        size: clamp(s.size, 10, 40, 15),
        color: s.color || '#ffffff',
        align: normalizeAlign(s.align),
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
    return {
      enabled: !!src.enabled,
      href: typeof src.href === 'string' ? src.href.slice(0, 600) : '',
      icon: normalizeActionIcon(src.icon, kind),
    };
  }

  function normalizeCardIcon(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    if (src.type === 'image' && src.value) {
      return { type: 'image', value: String(src.value) };
    }
    return { type: 'glyph', value: ICON_GLYPHS.indexOf(src.value) !== -1 ? src.value : ICON_GLYPHS[0] };
  }

  function normalizeCard(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      id: src.id || nextId('card'),
      icon: normalizeCardIcon(src.icon),
      title: typeof src.title === 'string' ? src.title.slice(0, 40) : 'קובייה חדשה',
      titleSize: clamp(src.titleSize, 12, 34, 16),
      titleColor: src.titleColor || '#ffffff',
      desc: typeof src.desc === 'string' ? src.desc.slice(0, 140) : '',
      descSize: clamp(src.descSize, 10, 22, 13),
      descColor: src.descColor || '#ffffff',
      color: src.color || DEFAULT_CARD_COLOR,
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
      freeform: !!src.freeform,
      freeHeight: clampFreeHeight(src.freeHeight),
      items: Array.isArray(src.items) ? src.items.map(normalizeCard) : [],
    };
  }

  function normalizeClosingIcon(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const isImage = src.type === 'image' && src.value;
    return {
      id: src.id || nextId('cicon'),
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

  function normalizeClosing(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      enabled: !!src.enabled,
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
  }

  function renderHeaderText() {
    const ui = els();
    const header = state.header;
    if (ui.headerTitle) {
      if (document.activeElement !== ui.headerTitle) ui.headerTitle.textContent = header.title.text;
      ui.headerTitle.style.setProperty('--pack-title-size', header.title.size + 'px');
      ui.headerTitle.style.color = header.title.color;
    }
    if (ui.headerSubtitle) {
      if (document.activeElement !== ui.headerSubtitle) ui.headerSubtitle.textContent = header.subtitle.text;
      ui.headerSubtitle.style.setProperty('--pack-subtitle-size', header.subtitle.size + 'px');
      ui.headerSubtitle.style.color = header.subtitle.color;
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
    if (kind === 'print') {
      return '<button type="button" class="' + cls + '" data-print-href="' + escapeHtml(action.href || '') + '" title="' + title + '" aria-label="' + title + '">' + iconHtml + '</button>';
    }
    const href = escapeHtml(action.href || '#');
    const downloadAttr = kind === 'download' ? ' download' : '';
    return '<a class="' + cls + '" href="' + href + '" target="_blank" rel="noopener noreferrer"' + downloadAttr + ' data-has-href="' + (action.href ? '1' : '0') + '" title="' + title + '" aria-label="' + title + '">' + iconHtml + '</a>';
  }

  function cardBadgeHtml(card) {
    if (card.icon.type === 'image' && card.icon.value) {
      return '<span class="pack-card-badge"><img src="' + escapeHtml(card.icon.value) + '" alt=""></span>';
    }
    return '<span class="pack-card-badge">' + escapeHtml(card.icon.value) + '</span>';
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
    const showDesc = !!card.desc || editing;
    return (
      '<div class="pack-card' + (editingCardId && editingCardId === card.id ? ' is-editing' : '') + '" data-id="' + escapeHtml(card.id) + '"' +
        ' style="--pack-card-color:' + escapeHtml(card.color) +
        ';--cx:' + card.x + '%;--cy:' + card.y + '%;--cw:' + card.w + '%;">' +
        '<button type="button" class="pack-card-edit" data-card-edit="' + escapeHtml(card.id) + '" title="עריכת קובייה" aria-label="עריכת קובייה">✎</button>' +
        '<button type="button" class="pack-card-delete" data-card-delete="' + escapeHtml(card.id) + '" title="הסרת קובייה" aria-label="הסרת קובייה">×</button>' +
        cardBadgeHtml(card) +
        '<h3 class="pack-card-title" data-card-text="title" data-card-id="' + escapeHtml(card.id) + '" style="' + titleStyle + '"' + editableAttr + '>' + escapeHtml(card.title) + '</h3>' +
        (showDesc ? '<p class="pack-card-desc" data-card-text="desc" data-card-id="' + escapeHtml(card.id) + '" style="' + descStyle + '"' + editableAttr + '>' + escapeHtml(card.desc) + '</p>' : '') +
        (actionsHtml ? '<div class="pack-card-actions">' + actionsHtml + '</div>' : '') +
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
    if (icon.type === 'image' && icon.value) {
      return '<img src="' + escapeHtml(icon.value) + '" alt="">';
    }
    return escapeHtml(icon.value);
  }

  function closingIconHtml(icon) {
    const hasHref = !!icon.href;
    return (
      '<a class="pack-closing-icon" data-icon-id="' + escapeHtml(icon.id) + '" data-has-href="' + (hasHref ? '1' : '0') + '"' +
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
    if (ui.closingSection) {
      ui.closingSection.style.setProperty('--pack-closing-height', clampClosingHeight(closing.height) + 'px');
    }
    if (ui.devTeamBtn) {
      ui.devTeamBtn.hidden = !closing.enabled;
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
    const alignLabels = { start: 'ימין', center: 'מרכז', end: 'שמאל' };
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
        '<div class="pack-edit-section-head">כותרת</div>' +
        '<p class="pack-field-sub">לחצו ישירות על הטקסט בכותרת כדי לערוך אותו. כאן קובעים גודל, צבע ומיקום.</p>' +
        rangeRowHtml('packTitleSize', 'גודל', h.title.size, 14, 72, 'px') +
        colorFieldHtml('packTitleColor', 'צבע', h.title.color) +
        segHtml('packTitleAlign', h.title.align, [
          { value: 'start', label: alignLabels.start },
          { value: 'center', label: alignLabels.center },
          { value: 'end', label: alignLabels.end },
        ]) +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">כותרת משנה</div>' +
        rangeRowHtml('packSubtitleSize', 'גודל', h.subtitle.size, 10, 40, 'px') +
        colorFieldHtml('packSubtitleColor', 'צבע', h.subtitle.color) +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head" id="packEditLogosHead">לוגואים (' + h.logos.length + ')</div>' +
        '<p class="pack-field-sub">ניתן לגרור לוגו ישירות על הכותרת כדי לשנות מיקום. כאן קובעים גודל או מוסיפים/מסירים.</p>' +
        '<div id="packEditLogoList">' + logosListHtml() + '</div>' +
        '<label class="pack-add-logo-btn" for="packAddLogoFile">+ הוספת לוגו</label>' +
        '<input type="file" id="packAddLogoFile" accept="image/*" hidden>' +
      '</section>'
    );
  }

  function logosListHtml() {
    return state.header.logos.map(function (logo) {
      return (
        '<div class="pack-logo-row" data-logo-id="' + escapeHtml(logo.id) + '">' +
          '<img class="pack-logo-thumb" src="' + escapeHtml(logo.src) + '" alt="">' +
          '<input type="range" min="20" max="220" step="1" value="' + logo.size + '" data-logo-size="' + escapeHtml(logo.id) + '" title="גודל">' +
          '<button type="button" class="pack-logo-remove" data-logo-remove="' + escapeHtml(logo.id) + '" title="הסרה" aria-label="הסרה">×</button>' +
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

    // כותרת
    bindRangeRow(root, 'packTitleSize', function (v) { state.header.title.size = clamp(v, 14, 72, 30); renderHeaderText(); });
    bindColorField(root, 'packTitleColor', function (hex) { state.header.title.color = hex; renderHeaderText(); });
    root.querySelectorAll('input[name="packTitleAlign"]').forEach(function (input) {
      input.addEventListener('change', function () {
        if (!input.checked) return;
        state.header.title.align = input.value;
        state.header.subtitle.align = input.value;
        renderHeaderText();
      });
    });

    // כותרת משנה
    bindRangeRow(root, 'packSubtitleSize', function (v) { state.header.subtitle.size = clamp(v, 10, 40, 15); renderHeaderText(); });
    bindColorField(root, 'packSubtitleColor', function (hex) { state.header.subtitle.color = hex; renderHeaderText(); });

    // לוגואים
    const logoList = root.querySelector('#packEditLogoList');
    if (logoList) {
      logoList.addEventListener('input', function (e) {
        const id = e.target.getAttribute('data-logo-size');
        if (!id) return;
        const logo = state.header.logos.find(function (l) { return l.id === id; });
        if (!logo) return;
        logo.size = clamp(e.target.value, 20, 220, 56);
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
      hint: 'כאן מגדירים רקע, טקסטים ולוגואים של הכותרת. את הטקסט עצמו ניתן לערוך גם ישירות על הכותרת.',
      fieldsHtml: headerEditorFieldsHtml(),
      bind: bindHeaderEditorFields,
    });
  }

  /* ================================================================
     עורך אזור הקוביות (הגדרות פריסה)
     ================================================================ */

  function cardsSectionEditorHint() {
    return isCardsFreeform()
      ? 'גררו כל קובייה עם העכבר לכל מקום באזור. גובה האזור ניתן לשינוי כאן או בידית בתחתית.'
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
          '<p class="pack-field-sub">גררו את הקוביות עם העכבר בתוך האזור המקווקו.</p>' +
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

  function iconGridHtml(card) {
    return '<div class="pack-icon-grid">' + ICON_GLYPHS.map(function (glyph) {
      const checked = card.icon.type === 'glyph' && card.icon.value === glyph;
      return '<label class="pack-icon-btn">' +
        '<input type="radio" name="packCardIcon" value="' + escapeHtml(glyph) + '"' + (checked ? ' checked' : '') + '>' +
        '<span>' + escapeHtml(glyph) + '</span>' +
      '</label>';
    }).join('') + '</div>';
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
        '<div class="pack-edit-section-head">תוכן</div>' +
        '<div class="pack-field">' +
          '<label for="packCardTitle">כותרת</label>' +
          '<input type="text" id="packCardTitle" maxlength="40" value="' + escapeHtml(card.title) + '">' +
        '</div>' +
        '<div class="pack-field">' +
          '<label for="packCardDesc">תיאור</label>' +
          '<textarea id="packCardDesc" maxlength="140">' + escapeHtml(card.desc) + '</textarea>' +
        '</div>' +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">אייקון וצבע</div>' +
        iconGridHtml(card) +
        '<label class="pack-upload" for="packCardIconImage" style="display:flex;">' +
          '<input type="file" id="packCardIconImage" accept="image/*" hidden>' +
          '<span>או העלאת תמונת אייקון</span>' +
        '</label>' +
        colorFieldHtml('packCardColor', 'צבע קובייה', card.color) +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">כפתורי פעולה</div>' +
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
    const titleInput = root.querySelector('#packCardTitle');
    if (titleInput) {
      titleInput.addEventListener('input', function () {
        const card = getCard();
        if (card) { card.title = titleInput.value.slice(0, 40); renderCards(); }
      });
    }
    const descInput = root.querySelector('#packCardDesc');
    if (descInput) {
      descInput.addEventListener('input', function () {
        const card = getCard();
        if (card) { card.desc = descInput.value.slice(0, 140); renderCards(); }
      });
    }
    root.querySelectorAll('input[name="packCardIcon"]').forEach(function (input) {
      input.addEventListener('change', function () {
        if (!input.checked) return;
        const card = getCard();
        if (card) { card.icon = { type: 'glyph', value: input.value }; renderCards(); }
      });
    });
    const iconImage = root.querySelector('#packCardIconImage');
    if (iconImage) {
      iconImage.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        readImageAsDataUrl(file, function (dataUrl) {
          const card = getCard();
          if (card) { card.icon = { type: 'image', value: dataUrl }; renderCards(); }
        });
        e.target.value = '';
      });
    }
    bindColorField(root, 'packCardColor', function (hex) {
      const card = getCard();
      if (card) { card.color = hex; renderCards(); }
    });
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
     עורך הסגירה (צוות פיתוח + אייקונים)
     ================================================================ */

  function closingIconsListHtml() {
    if (!state.closing.icons.length) {
      return '<p class="pack-field-sub">אין עדיין אייקונים. לחצו על «הוסף אייקון» כדי להעלות תמונה.</p>';
    }
    return state.closing.icons.map(function (icon) {
      const id = escapeHtml(icon.id);
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
    if (head) head.textContent = 'אייקונים (' + state.closing.icons.length + ')';
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

  function closingEditorFieldsHtml() {
    const c = state.closing;
    return (
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
        colorFieldHtml('packClosingColor', 'צבע רקע', c.color) +
        colorFieldHtml('packClosingTextColor', 'צבע טקסט', c.textColor) +
        '<label class="pack-upload" for="packClosingImageInput" style="margin-top:10px;display:flex;">' +
          '<input type="file" id="packClosingImageInput" accept="image/*" hidden>' +
          '<span>העלאת תמונה לכפתור</span>' +
        '</label>' +
        '<img class="pack-preview' + (c.image ? ' is-visible' : '') + '" id="packClosingImagePreview" src="' + escapeHtml(c.image) + '" alt="">' +
        '<button type="button" class="pack-clear-btn" id="packClosingImageClear"' + (c.image ? '' : ' hidden') + '>הסרת תמונה</button>' +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head" id="packEditClosingIconsHead">אייקונים (' + c.icons.length + ')</div>' +
        '<p class="pack-field-sub">העלו תמונת אייקון. אפשר לגרור כל אייקון לאורך האזור התחתון, ולשנות את הגודל כאן.</p>' +
        '<div id="packEditClosingIconList">' + closingIconsListHtml() + '</div>' +
        '<label class="pack-add-logo-btn" for="packAddClosingIconFile">+ הוסף אייקון</label>' +
        '<input type="file" id="packAddClosingIconFile" accept="image/*" hidden>' +
      '</section>'
    );
  }

  function bindClosingEditorFields(root) {
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
    bindColorField(root, 'packClosingColor', function (hex) { state.closing.color = hex; renderClosing(); });
    bindColorField(root, 'packClosingTextColor', function (hex) { state.closing.textColor = hex; renderClosing(); });
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

    function refreshClosingImageUi() {
      const preview = root.querySelector('#packClosingImagePreview');
      const clearBtn = root.querySelector('#packClosingImageClear');
      const image = state.closing.image || '';
      if (preview) {
        preview.src = image;
        preview.classList.toggle('is-visible', !!image);
      }
      if (clearBtn) clearBtn.hidden = !image;
    }

    const imageInput = root.querySelector('#packClosingImageInput');
    if (imageInput) {
      imageInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        readImageAsDataUrl(file, function (dataUrl) {
          state.closing.image = dataUrl;
          renderClosing();
          refreshClosingImageUi();
        });
        e.target.value = '';
      });
    }
    const imageClear = root.querySelector('#packClosingImageClear');
    if (imageClear) {
      imageClear.addEventListener('click', function () {
        state.closing.image = '';
        renderClosing();
        refreshClosingImageUi();
      });
    }

    const list = root.querySelector('#packEditClosingIconList');
    if (list) {
      list.addEventListener('input', function (e) {
        const sizeId = e.target.getAttribute('data-icon-size');
        if (sizeId) {
          const icon = state.closing.icons.find(function (item) { return item.id === sizeId; });
          if (!icon) return;
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
        if (!icon) return;
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
  }

  function openClosingEditor() {
    openEditor({
      title: 'עריכת אזור תחתון',
      hint: 'גררו את כפתור צוות הפיתוח ואת האייקונים ישירות בתוך מסגרת האזור התחתון.',
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
      if (size != null) target.el.style.fontSize = size + 'px';
      if (color != null) target.el.style.color = color;
    }
  }

  function syncPackToolbar() {
    const colorField = document.getElementById('inlineTextColorPicker');
    const sizeControl = document.getElementById('inlineTextSizeControl');
    const sizeRange = document.getElementById('inlineTextSize');
    const sizeValueEl = document.getElementById('inlineTextSizeValue');
    const refs = hasActivePackText() ? getPackTextRefs(activePackText) : null;

    if (colorField) {
      colorField.classList.toggle('is-disabled', !refs);
      const swatch = colorField.querySelector('.hsla-swatch');
      if (swatch) swatch.setAttribute('aria-disabled', refs ? 'false' : 'true');
      if (refs && window.HebetColor) window.HebetColor.setHslaFieldValue('inlineTextColor', refs.getColor());
    }
    if (sizeControl && sizeRange && sizeValueEl) {
      sizeControl.classList.toggle('is-disabled', !refs);
      sizeRange.disabled = !refs;
      if (refs) {
        sizeRange.min = String(refs.min);
        sizeRange.max = String(refs.max);
        const size = refs.getSize();
        sizeRange.value = String(size);
        sizeValueEl.textContent = String(size);
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
    const sizeValueEl = document.getElementById('inlineTextSizeValue');
    if (sizeValueEl) sizeValueEl.textContent = String(size);
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

  function bindInlineClosingText() {
    const ui = els();
    if (!ui.closingSection || !ui.devTeamLabel || ui.closingSection.dataset.textBound === '1') return;
    ui.closingSection.dataset.textBound = '1';

    ui.closingSection.addEventListener('focusin', function (e) {
      if (e.target !== ui.devTeamLabel || !isPageEditMode()) return;
      activePackText = { el: ui.devTeamLabel, role: 'closing-label', cardId: null };
      syncPackToolbar();
    });
    ui.closingSection.addEventListener('focusout', function (e) {
      if (e.target !== ui.devTeamLabel) return;
      commitClosingInlineText();
      scheduleClearActivePackText(ui.devTeamLabel);
    });
    ui.closingSection.addEventListener('keydown', function (e) {
      if (e.target !== ui.devTeamLabel) return;
      if (e.key === 'Enter') { e.preventDefault(); ui.devTeamLabel.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); ui.devTeamLabel.textContent = state.closing.label; ui.devTeamLabel.blur(); }
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

  /* ---------- גרירה חופשית: כפתור צוות פיתוח ואייקונים באזור התחתון ---------- */

  function clampDragPercent(value, pad, fallback) {
    const maxPad = Math.min(Math.ceil(pad), 49);
    return clamp(value, maxPad, 100 - maxPad, fallback);
  }

  function bindClosingDragging() {
    const ui = els();
    const section = ui.closingSection;
    if (!section || section.dataset.dragBound === '1') return;
    section.dataset.dragBound = '1';

    section.addEventListener('click', function (e) {
      const item = e.target.closest ? e.target.closest('.pack-dev-team-btn, .pack-closing-icon') : null;
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
      }
    });

    section.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode()) return;
      if (e.target.closest && e.target.closest('.pack-section-edit, .pack-closing-resize')) return;
      if (e.target.id === 'packDevTeamLabel') return; // אפשרו לחיצה לעריכת הטקסט במקום גרירה
      if (e.button != null && e.button !== 0) return;
      const btn = e.target.closest ? e.target.closest('.pack-dev-team-btn') : null;
      const iconEl = e.target.closest ? e.target.closest('.pack-closing-icon') : null;
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
      const rect = section.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      el.classList.add('is-dragging');
      try { el.setPointerCapture(e.pointerId); } catch (_) {}

      function onMove(ev) {
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
        if (!isEditorOpen()) persist();
      }
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    });
  }

  /* ---------- שינוי גובה כותרת בגרירה ---------- */

  function bindResize() {
    const ui = els();
    if (!ui.headerResize || ui.headerResize.dataset.bound === '1') return;
    ui.headerResize.dataset.bound = '1';

    ui.headerResize.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode()) return;
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
      if (e.target.closest && e.target.closest('[data-card-edit], [data-card-delete], a.pack-card-action, button, .pack-cards-resize, [data-card-text]')) {
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
        const x = ((ev.clientX - rect.left) / rect.width) * 100;
        const y = ((ev.clientY - rect.top) / rect.height) * 100;
        card.x = clamp(x, padX, 100 - padX, card.x);
        card.y = clamp(y, padY, 100 - padY, card.y);
        cardEl.style.setProperty('--cx', card.x + '%');
        cardEl.style.setProperty('--cy', card.y + '%');
      }
      function onUp(ev) {
        cardEl.classList.remove('is-dragging');
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
      if (!isPageEditMode()) return;
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

  function syncEditUi() {
    const ui = els();
    const editing = isPageEditMode();
    if (ui.headerEditBtn) ui.headerEditBtn.hidden = !editing;
    if (ui.headerResize) ui.headerResize.hidden = !editing;
    if (ui.cardsEditBtn) ui.cardsEditBtn.hidden = !editing;
    if (ui.cardsResize) ui.cardsResize.hidden = !editing || !isCardsFreeform();
    if (ui.closingEditBtn) ui.closingEditBtn.hidden = !editing;
    if (ui.closingResize) ui.closingResize.hidden = !editing;
    if (ui.headerTitle) ui.headerTitle.setAttribute('contenteditable', editing ? 'true' : 'false');
    if (ui.headerSubtitle) ui.headerSubtitle.setAttribute('contenteditable', editing ? 'true' : 'false');
    if (ui.devTeamLabel) ui.devTeamLabel.setAttribute('contenteditable', editing ? 'true' : 'false');
    // הקוביות בנויות מ-HTML שנוצר מחדש ותלוי במצב העריכה (contenteditable + הצגת
    // תיאור ריק) — רק כשהמצב באמת משתנה מרעננים אותן, כדי לא לפגוע בפוקוס באמצע עריכה.
    if (lastPackEditingState !== editing) {
      lastPackEditingState = editing;
      renderCards();
    }
    if (!editing) {
      if (activePackText) { activePackText = null; syncPackToolbar(); }
    }
    if (!editing && isEditorOpen()) closeEditor(true);
  }

  /* ---------- חיווט אירועים כללי ---------- */

  function handleCardsGridClick(e) {
    const editBtn = e.target.closest ? e.target.closest('[data-card-edit]') : null;
    if (editBtn) { openCardEditor(editBtn.getAttribute('data-card-edit')); return; }
    const delBtn = e.target.closest ? e.target.closest('[data-card-delete]') : null;
    if (delBtn) { e.preventDefault(); removeCard(delBtn.getAttribute('data-card-delete')); return; }
    if (!isPageEditMode()) return;
    const printBtn = e.target.closest ? e.target.closest('[data-print-href]') : null;
    if (printBtn) { e.preventDefault(); return; }
    const link = e.target.closest ? e.target.closest('a.pack-card-action') : null;
    if (link && link.getAttribute('data-has-href') !== '1') e.preventDefault();
  }

  function handleCardsGridClickReadMode(e) {
    if (isPageEditMode()) return;
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
    if (ui.editClose) ui.editClose.addEventListener('click', function () { closeEditor(true); });
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
    bindCardsHeightResize();
    bindClosingHeightResize();
    bindLogoDragging();
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

  document.addEventListener('hebet:generator-enter', function (event) {
    const generator = event && event.detail && event.detail.generator;
    if (generator !== 'pack') return;
    initPackWorkspace();
  });

  if (document.body.getAttribute('data-generator') === 'pack') {
    initPackWorkspace();
  }
})();
