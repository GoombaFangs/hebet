/* =====================================================================
   מחולל מארז — קובץ עצמאי ומלא (כותרת + לוגואים + קוביות + אלמנטים חופשיים).
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
  const PACK_OVERLAY_POS_MIN = -40;
  const PACK_OVERLAY_POS_MAX = 140;
  const PACK_SNAP_PX = 8;
  const IMAGE_SCALE_MIN = 20;
  const IMAGE_SCALE_MAX = 300;
  const LOGO_SIZE_MIN = 20;
  const LOGO_SIZE_MAX = 220;
  const CARD_BOX_W_MIN = 6;
  const CARD_BOX_W_MAX = 80;
  const CARD_BOX_H_MIN = 80;
  const CARD_BOX_H_MAX = 720;
  const CARD_BOX_BASE_PX = 320;

  const DEFAULT_STATE = {
    header: {
      mode: 'color', // 'transparent' | 'color' | 'image'
      color: DEFAULT_HEADER_COLOR,
      image: '',
      imageScale: 100,
      imageScaleY: 100,
      imageX: 50,
      imageY: 50,
      keepRatio: true,
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
      hidden: true,
      label: 'צוות פיתוח',
      href: '',
      color: '#3d403c',
      textColor: '#ffffff',
      size: 100,
      sizeY: 100,
      keepRatio: true,
      boxW: 0,
      boxH: 0,
      radius: 12,
      image: '',
      packAnchored: true,
      x: 88,
      y: 90,
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
  let activePackText = null; // { el, role, cardId, itemId }
  let cardPreviewObserver = null;
  let cardPreviewObservedEl = null;

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
    return clamp(n, CARD_BOX_W_MIN, CARD_BOX_W_MAX, 18);
  }

  function clampCardBoxHeight(n) {
    return clamp(n, CARD_BOX_H_MIN, CARD_BOX_H_MAX, 150);
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

  function normalizeHref(raw) {
    return typeof raw === 'string' ? raw.trim().slice(0, 600) : '';
  }

  function normalizeLogo(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      id: src.id || nextId('logo'),
      src: typeof src.src === 'string' ? src.src : '',
      href: normalizeHref(src.href),
      x: clamp(src.x, 0, 100, 15),
      y: clamp(src.y, 0, 100, 50),
      size: clampLogoSize(src.size),
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
      imageScale: clampImageScale(src.imageScale),
      imageScaleY: clampImageScale(src.imageScaleY != null ? src.imageScaleY : src.imageScale),
      imageX: clampImagePos(src.imageX),
      imageY: clampImagePos(src.imageY),
      keepRatio: src.keepRatio !== false,
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

  function normalizeActionHoverIcon(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    if (src.type === 'image' && src.value) {
      return { type: 'image', value: String(src.value) };
    }
    return null;
  }

  function actionHasCustomIcon(action) {
    return !!(action && action.icon && action.icon.type === 'image' && action.icon.value);
  }

  function actionHoverSrc(action) {
    return (action && action.hoverIcon && action.hoverIcon.type === 'image' && action.hoverIcon.value)
      ? action.hoverIcon.value
      : '';
  }

  function actionHasCustomHover(action) {
    return !!actionHoverSrc(action);
  }

  function actionGlyph(action, kind) {
    if (action && action.icon && action.icon.type !== 'image' && action.icon.value) {
      return action.icon.value;
    }
    return ACTION_DEFAULT_GLYPH[kind] || '●';
  }

  function normalizeAction(raw, kind) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const pos = ACTION_DEFAULT_POS[kind] || ACTION_DEFAULT_POS.download;
    return {
      enabled: !!src.enabled,
      href: typeof src.href === 'string' ? src.href.slice(0, 600) : '',
      icon: normalizeActionIcon(src.icon, kind),
      hoverIcon: normalizeActionHoverIcon(src.hoverIcon),
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
    const bgMode = normalizeCardBgMode(src.bgMode);
    let imageScale = clampImageScale(src.imageScale);
    let imageScaleY = clampImageScale(src.imageScaleY != null ? src.imageScaleY : src.imageScale);
    let w = clampFreeWidth(src.w);
    let h = src.h == null || src.h === '' ? 0 : clampCardBoxHeight(src.h);
    const legacyImageLayout = bgMode === 'image' && src.image && src.imageX == null && src.imageY == null;
    if (legacyImageLayout) {
      w = clampFreeWidth((imageScale / 100) * 18);
      if (!h) h = clampCardBoxHeight(CARD_BOX_BASE_PX * (imageScaleY / 100));
      imageScale = 100;
      imageScaleY = 100;
    }
    return {
      id: src.id || nextId('card'),
      icons: [],
      title: typeof src.title === 'string' ? src.title.slice(0, 40) : 'קובייה חדשה',
      titleSize: clamp(src.titleSize, 12, 34, 16),
      titleColor: src.titleColor || '#ffffff',
      desc: typeof src.desc === 'string' ? src.desc.slice(0, 140) : '',
      descSize: clamp(src.descSize, 10, 22, 13),
      descColor: src.descColor || '#ffffff',
      titleHidden: !!src.titleHidden,
      descHidden: !!src.descHidden,
      comingSoon: !!src.comingSoon,
      comingSoonLabel: typeof src.comingSoonLabel === 'string' ? src.comingSoonLabel : '',
      bgMode: bgMode,
      color: src.color || DEFAULT_CARD_COLOR,
      image: typeof src.image === 'string' ? src.image : '',
      imageScale: imageScale,
      imageScaleY: imageScaleY,
      imageX: clampImagePos(src.imageX),
      imageY: clampImagePos(src.imageY),
      keepRatio: src.keepRatio !== false,
      actions: {
        view: normalizeAction(src.actions && src.actions.view, 'view'),
        download: normalizeAction(src.actions && src.actions.download, 'download'),
        print: normalizeAction(src.actions && src.actions.print, 'print'),
      },
      x: clamp(src.x, 0, 100, 50),
      y: clamp(src.y, 0, 100, 50),
      w: w,
      h: h,
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
    const packAnchored = src.packAnchored !== false && !!src.packAnchored;
    if (src.kind === 'text' || src.type === 'text') {
      return {
        id: src.id || nextId('ctext'),
        kind: 'text',
        value: typeof src.value === 'string' && src.value.trim() ? src.value.slice(0, 80) : 'טקסט',
        href: typeof src.href === 'string' ? src.href.slice(0, 600) : '',
        packAnchored: packAnchored,
        x: packAnchored ? clampPackOverlayPos(src.x, 18) : clamp(src.x, 0, 100, 18),
        y: packAnchored ? clampPackOverlayPos(src.y, 58) : clamp(src.y, 0, 100, 50),
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
      packAnchored: packAnchored,
      x: packAnchored ? clampPackOverlayPos(src.x, 18) : clamp(src.x, 0, 100, 18),
      y: packAnchored ? clampPackOverlayPos(src.y, 58) : clamp(src.y, 0, 100, 50),
      size: clampClosingIconSize(src.size),
      sizeY: clampClosingIconSize(src.sizeY != null ? src.sizeY : src.size),
      keepRatio: src.keepRatio !== false,
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

  function clampDevTeamBox(n, fallback) {
    return clamp(n, 36, 720, fallback == null ? 80 : fallback);
  }

  function overlayIconKeepsRatio(item) {
    return !item || item.keepRatio !== false;
  }

  function devTeamKeepsRatio() {
    return !state.closing || state.closing.keepRatio !== false;
  }

  function clampDevTeamRadius(n) {
    return clamp(n, 0, 40, 12);
  }

  function applyOverlayIconSizeStyle(item, el) {
    if (!item || !el || item.kind === 'text') return;
    const keep = overlayIconKeepsRatio(item);
    const w = clampClosingIconSize(item.size);
    const h = keep ? w : clampClosingIconSize(item.sizeY != null ? item.sizeY : item.size);
    el.style.setProperty('--csize', w + 'px');
    el.style.setProperty('--csize-y', h + 'px');
    el.classList.toggle('is-free-scale', !keep);
  }

  function applyDevTeamScaleStyle(btn) {
    const c = state.closing;
    if (!btn || !c) return;
    const keep = devTeamKeepsRatio();
    btn.classList.toggle('is-free-scale', !keep);
    btn.style.setProperty('--pack-dev-team-scale', String(clampDevTeamSize(c.size) / 100));
    btn.style.setProperty('--pack-dev-team-scale-y', String(clampDevTeamSize(c.sizeY != null ? c.sizeY : c.size) / 100));
    if (!keep && c.boxW && c.boxH) {
      btn.style.setProperty('--pack-dev-team-w', clampDevTeamBox(c.boxW) + 'px');
      btn.style.setProperty('--pack-dev-team-h', clampDevTeamBox(c.boxH) + 'px');
    } else {
      btn.style.removeProperty('--pack-dev-team-w');
      btn.style.removeProperty('--pack-dev-team-h');
    }
  }

  function setOverlayIconKeepRatio(item, el, keep) {
    if (!item || item.kind === 'text') return;
    if (keep) {
      item.keepRatio = true;
      item.sizeY = clampClosingIconSize(item.size);
    } else {
      item.keepRatio = false;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width) item.size = clampClosingIconSize(rect.width);
        if (rect.height) item.sizeY = clampClosingIconSize(rect.height);
      } else if (item.sizeY == null) {
        item.sizeY = item.size;
      }
    }
    applyOverlayIconSizeStyle(item, el);
    syncOverlayResizeHandles(el);
  }

  function setDevTeamKeepRatio(el, keep) {
    const c = state.closing;
    if (!c) return;
    if (keep) {
      c.keepRatio = true;
      c.sizeY = c.size;
      c.boxW = 0;
      c.boxH = 0;
    } else {
      c.keepRatio = false;
      if (el) {
        const rect = el.getBoundingClientRect();
        c.boxW = clampDevTeamBox(rect.width, 148);
        c.boxH = clampDevTeamBox(rect.height, 42);
        c.size = clampDevTeamSize((c.boxW / 148) * 100);
        c.sizeY = clampDevTeamSize((c.boxH / 42) * 100);
      } else if (c.sizeY == null) {
        c.sizeY = c.size;
      }
    }
    applyDevTeamScaleStyle(el);
    syncOverlayResizeHandles(el);
  }

  function syncOpenKeepRatioInput(id, keep) {
    const input = document.getElementById(id);
    if (input) input.checked = !!keep;
  }

  function clampImageScale(n) {
    return clamp(n, IMAGE_SCALE_MIN, IMAGE_SCALE_MAX, 100);
  }

  function cardKeepsRatio(card) {
    return !card || card.keepRatio !== false;
  }

  function cardImageScaleY(card) {
    return clampImageScale(card && card.imageScaleY != null ? card.imageScaleY : (card && card.imageScale));
  }

  function applyCardImageVars(el, card) {
    if (!el || !card) return;
    el.style.setProperty('--pack-card-image', card.image ? cssUrl(card.image) : 'none');
    el.style.setProperty('--pack-card-img-scale', String(clampImageScale(card.imageScale) / 100));
    el.style.setProperty('--pack-card-img-scale-y', String(cardImageScaleY(card) / 100));
    el.style.setProperty('--pack-card-img-x', clampImagePos(card.imageX) + '%');
    el.style.setProperty('--pack-card-img-y', clampImagePos(card.imageY) + '%');
    el.classList.toggle('is-free-scale', card.bgMode === 'image' && !!card.image && !cardKeepsRatio(card));
  }

  function applyCardImageScaleStyle(card, cardEl) {
    applyCardImageVars(cardEl, card);
    if (card && isEditorOpen() && editingCardId === card.id) syncCardImagePreview(card.id);
  }

  function fillCardImage(card) {
    if (!card) return;
    card.imageScale = 100;
    card.imageScaleY = 100;
    card.imageX = 50;
    card.imageY = 50;
  }

  function ensureCardImageBox(card, cardEl) {
    if (!card || card.bgMode !== 'image' || !card.image || card.h) return;
    const liveH = cardEl && cardEl.clientHeight;
    card.h = clampCardBoxHeight(Math.max(liveH || 0, 150));
    if (cardEl) cardEl.style.setProperty('--ch', card.h + 'px');
  }

  function captureCardBoxHeight(card) {
    if (!card || card.h) return;
    const el = cardLiveEl(card.id);
    if (!el) return;
    card.h = clampCardBoxHeight(Math.max(el.getBoundingClientRect().height, 150));
  }

  function setCardKeepRatio(card, cardEl, keep) {
    if (!card) return;
    if (keep) {
      card.keepRatio = true;
      card.imageScaleY = clampImageScale(card.imageScale);
    } else {
      card.keepRatio = false;
      if (card.imageScaleY == null) card.imageScaleY = clampImageScale(card.imageScale);
    }
    applyCardImageScaleStyle(card, cardEl);
    if (isEditorOpen() && editingCardId === card.id) {
      const wrap = document.getElementById('packCardImagePreviewWrap');
      const ratioInput = document.getElementById('packCardKeepRatio');
      if (wrap) wrap.classList.toggle('is-free-scale', !cardKeepsRatio(card));
      if (ratioInput) ratioInput.checked = cardKeepsRatio(card);
    }
  }

  function clampImagePos(n) {
    return clamp(n, 0, 100, 50);
  }

  function clampLogoSize(n) {
    return clamp(n, LOGO_SIZE_MIN, LOGO_SIZE_MAX, 56);
  }

  function isPackImageRole(role) {
    return role === 'header-image' || role === 'card-image' || role === 'header-logo' || role === 'card-icon' || role === 'overlay-icon';
  }

  function isPackTextRole(role) {
    return role === 'header-title' || role === 'header-subtitle' || role === 'card-title' ||
      role === 'card-desc' || role === 'closing-label' || role === 'closing-text';
  }

  function clampPackOverlayPos(n, fallback) {
    return clamp(n, PACK_OVERLAY_POS_MIN, PACK_OVERLAY_POS_MAX, fallback);
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
      sizeY: clampDevTeamSize(src.sizeY != null ? src.sizeY : src.size),
      keepRatio: src.keepRatio !== false,
      boxW: src.boxW ? clampDevTeamBox(src.boxW) : 0,
      boxH: src.boxH ? clampDevTeamBox(src.boxH) : 0,
      radius: clampDevTeamRadius(src.radius),
      image: typeof src.image === 'string' ? src.image : '',
      packAnchored: !!src.packAnchored,
      x: src.packAnchored ? clampPackOverlayPos(src.x, 88) : clamp(src.x, 0, 100, 88),
      y: src.packAnchored ? clampPackOverlayPos(src.y, 90) : clamp(src.y, 0, 100, 50),
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
    if (isUserMode()) return true;
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
    const headerTitle = state && state.header && state.header.title && state.header.title.text;
    if (isUserMode() && headerTitle) document.title = headerTitle;
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
      cardsAddBtn: document.getElementById('btnPackNew'),
      cardsResize: document.getElementById('packCardsResize'),

      workspace: document.getElementById('packWorkspace'),
      overlayItems: document.getElementById('packOverlayItems') || document.getElementById('packClosingItems'),
      closingSection: document.getElementById('packClosing'),
      closingEditBtn: document.getElementById('packClosingEdit'),
      closingItems: document.getElementById('packOverlayItems') || document.getElementById('packClosingItems'),
      closingResize: document.getElementById('packClosingResize'),
      overlayIconFile: document.getElementById('packAddOverlayIconFile'),
      addWrap: document.getElementById('packAddWrap'),
      addBtn: document.getElementById('btnPackNew'),
      addMenu: document.getElementById('packAddMenu'),
      addDevTeamItem: document.getElementById('packAddDevTeam'),
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

  function headerKeepsRatio() {
    return !state.header || state.header.keepRatio !== false;
  }

  function headerImageScaleY() {
    const h = state.header;
    return clampImageScale(h && h.imageScaleY != null ? h.imageScaleY : (h && h.imageScale));
  }

  function applyHeaderImageVars(el) {
    if (!el) return;
    const h = state.header;
    el.style.setProperty('--pack-header-image', cssUrl(h.image));
    el.style.setProperty('--pack-header-image-scale', String(clampImageScale(h.imageScale) / 100));
    el.style.setProperty('--pack-header-image-scale-y', String(headerImageScaleY() / 100));
    el.style.setProperty('--pack-header-image-x', clampImagePos(h.imageX) + '%');
    el.style.setProperty('--pack-header-image-y', clampImagePos(h.imageY) + '%');
  }

  function fillHeaderImage() {
    state.header.imageScale = 100;
    state.header.imageScaleY = 100;
    state.header.imageX = 50;
    state.header.imageY = 50;
  }

  function setHeaderKeepRatio(keep) {
    if (keep) {
      state.header.keepRatio = true;
      state.header.imageScaleY = clampImageScale(state.header.imageScale);
    } else {
      state.header.keepRatio = false;
      if (state.header.imageScaleY == null) state.header.imageScaleY = clampImageScale(state.header.imageScale);
    }
    renderHeaderBg();
    if (activePackText && activePackText.role === 'header-image') syncPackToolbar();
  }

  function syncHeaderImagePreview() {
    const wrap = document.getElementById('packHeaderImagePreviewWrap');
    if (!wrap) return;
    const has = state.header.mode === 'image' && !!state.header.image;
    wrap.hidden = !has;
    wrap.classList.toggle('is-free-scale', has && !headerKeepsRatio());
    const actions = wrap.parentElement && wrap.parentElement.querySelector('.pack-header-image-actions');
    const ratioWrap = document.getElementById('packHeaderKeepRatioWrap');
    const clearBtn = document.getElementById('packHeaderImageClear');
    const resetBtn = document.getElementById('packHeaderImageReset');
    const ratioInput = document.getElementById('packHeaderKeepRatio');
    if (actions) actions.hidden = !has;
    if (ratioWrap) ratioWrap.hidden = !has;
    if (clearBtn) clearBtn.hidden = !has;
    if (resetBtn) resetBtn.hidden = !has;
    if (ratioInput) ratioInput.checked = headerKeepsRatio();
    if (!has) return;
    applyHeaderImageVars(wrap);
    const stage = document.getElementById('packHeaderImagePreviewStage');
    if (stage) applyHeaderImageVars(stage);
    syncHeaderPreviewFrame();
    window.requestAnimationFrame(syncHeaderPreviewFrame);
  }

  function headerLiveSize() {
    const header = document.getElementById('packHeader');
    const liveW = header ? header.clientWidth : 0;
    const liveH = header ? header.clientHeight : 0;
    return {
      width: liveW || window.innerWidth || 1200,
      height: liveH || clampHeight(state.header && state.header.height),
    };
  }

  function syncHeaderPreviewFrame() {
    const stage = document.getElementById('packHeaderImagePreviewStage');
    const wrap = document.getElementById('packHeaderImagePreviewWrap');
    if (!stage || !wrap || wrap.hidden) return;
    const live = headerLiveSize();
    if (!live.width || !live.height) return;
    const ratio = live.width / live.height;
    stage.style.setProperty('--pack-header-preview-ratio', String(ratio));
    const stageW = stage.clientWidth;
    if (stageW) stage.style.height = Math.max(1, stageW / ratio) + 'px';
  }

  function bindHeaderPreviewFrameSync() {
    const header = document.getElementById('packHeader');
    if (!header || header.dataset.previewFrameBound === '1') return;
    header.dataset.previewFrameBound = '1';
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncHeaderImagePreview);
      return;
    }
    const observer = new ResizeObserver(function () { syncHeaderImagePreview(); });
    observer.observe(header);
  }

  function cardLiveEl(cardId) {
    if (!cardId) return null;
    return document.querySelector('.pack-card[data-id="' + cardId + '"]');
  }

  function syncCardPreviewFrame(cardId) {
    const stage = document.getElementById('packCardImagePreviewStage');
    const wrap = document.getElementById('packCardImagePreviewWrap');
    if (!stage || !wrap || wrap.hidden) return;
    const cardEl = cardLiveEl(cardId);
    const w = (cardEl && cardEl.clientWidth) || CARD_BOX_BASE_PX;
    const h = (cardEl && cardEl.clientHeight) || 180;
    if (!w || !h) return;
    const ratio = w / h;
    stage.style.setProperty('--pack-card-preview-ratio', String(ratio));
    const stageW = stage.clientWidth;
    if (stageW) stage.style.height = Math.max(1, stageW / ratio) + 'px';
  }

  function bindCardPreviewFrameSync(cardId) {
    const cardEl = cardLiveEl(cardId);
    if (!cardEl) return;
    if (typeof ResizeObserver === 'undefined') return;
    if (cardPreviewObservedEl === cardEl) return;
    if (cardPreviewObserver) cardPreviewObserver.disconnect();
    cardPreviewObserver = new ResizeObserver(function () { syncCardImagePreview(cardId); });
    cardPreviewObserver.observe(cardEl);
    cardPreviewObservedEl = cardEl;
  }

  function syncCardImagePreview(cardId) {
    const card = findCardById(cardId);
    const wrap = document.getElementById('packCardImagePreviewWrap');
    if (!wrap || !card) return;
    const has = card.bgMode === 'image' && !!card.image;
    wrap.hidden = !has;
    wrap.classList.toggle('is-free-scale', has && !cardKeepsRatio(card));
    const actions = wrap.parentElement && wrap.parentElement.querySelector('.pack-card-image-actions');
    const ratioWrap = document.getElementById('packCardKeepRatioWrap');
    const clearBtn = document.getElementById('packCardImageClear');
    const resetBtn = document.getElementById('packCardImageReset');
    const ratioInput = document.getElementById('packCardKeepRatio');
    const label = document.querySelector('label[for="packCardBgImage"] span');
    if (actions) actions.hidden = !has;
    if (ratioWrap) ratioWrap.hidden = !has;
    if (clearBtn) clearBtn.hidden = !has;
    if (resetBtn) resetBtn.hidden = !has;
    if (ratioInput) ratioInput.checked = cardKeepsRatio(card);
    if (label) label.textContent = has ? 'החלפת תמונה' : 'העלאת תמונה';
    if (!has) return;
    applyCardImageVars(wrap, card);
    const stage = document.getElementById('packCardImagePreviewStage');
    if (stage) applyCardImageVars(stage, card);
    const live = cardLiveEl(card.id);
    if (live) applyCardImageVars(live, card);
    syncCardPreviewFrame(card.id);
    bindCardPreviewFrameSync(card.id);
    window.requestAnimationFrame(function () { syncCardPreviewFrame(card.id); });
  }

  /* ---------- רינדור: כותרת (רקע) ---------- */

  function renderHeaderBg() {
    const ui = els();
    const header = state.header;
    if (!ui.header) return;
    ui.header.style.setProperty('--pack-header-height', header.height + 'px');
    ui.header.style.setProperty('--pack-header-color', header.color || DEFAULT_HEADER_COLOR);
    applyHeaderImageVars(ui.header);
    ui.header.style.setProperty('--pack-header-opacity', String(clampOpacity(header.opacity) / 100));
    ui.header.classList.toggle('is-image', header.mode === 'image' && !!header.image);
    ui.header.classList.toggle('is-awaiting-image', header.mode === 'image' && !header.image);
    ui.header.classList.toggle('is-transparent', header.mode === 'transparent');
    ui.header.classList.toggle('is-hidden', isHeaderHidden());
    ui.header.classList.toggle('is-free-scale', header.mode === 'image' && !!header.image && !headerKeepsRatio());
    if (ui.headerResize) ui.headerResize.hidden = !isPageEditMode() || isHeaderHidden();
    syncHeaderImagePreview();
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
      setActivePackTarget(null);
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
      const href = normalizeHref(logo.href);
      const hasHref = !!href;
      const open = hasHref
        ? '<a class="pack-header-logo" data-logo-id="' + escapeHtml(logo.id) + '" href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer" data-has-href="1"'
        : '<span class="pack-header-logo" data-logo-id="' + escapeHtml(logo.id) + '" data-has-href="0"';
      const close = hasHref ? '</a>' : '</span>';
      return open +
        ' style="--lx:' + logo.x + '%;--ly:' + logo.y + '%;--lsize:' + logo.size + 'px;">' +
        '<img src="' + escapeHtml(logo.src) + '" alt="" draggable="false">' +
        close;
    }).join('');
    restoreActivePackTargetEl();
  }

  function renderHeader() {
    renderHeaderBg();
    renderHeaderText();
    renderHeaderLogos();
  }

  /* ---------- רינדור: קוביות ---------- */

  function actionIconInnerHtml(action) {
    if (actionHasCustomIcon(action)) {
      return '<img class="pack-action-normal" src="' + escapeHtml(action.icon.value) + '" alt="">';
    }
    return '<span class="pack-action-normal">' + escapeHtml(action.icon ? action.icon.value : '') + '</span>';
  }

  function actionHoverInnerHtml(action, kind) {
    const src = actionHoverSrc(action);
    if (src) {
      return '<img class="pack-action-hover" src="' + escapeHtml(src) + '" alt="">';
    }
    if (actionHasCustomIcon(action)) {
      return '<span class="pack-action-hover pack-action-hover--default pack-action-hover--tint" aria-hidden="true"></span>';
    }
    return '<span class="pack-action-hover pack-action-hover--default">' + escapeHtml(actionGlyph(action, kind)) + '</span>';
  }

  function actionHoverPreviewInnerHtml(action, kind) {
    const src = actionHoverSrc(action);
    if (src) return '<img src="' + escapeHtml(src) + '" alt="">';
    if (actionHasCustomIcon(action)) {
      return '<img src="' + escapeHtml(action.icon.value) + '" alt="">';
    }
    return '<span class="pack-default-hover-thumb">' + escapeHtml(actionGlyph(action, kind)) + '</span>';
  }

  function actionButtonHtml(card, kind) {
    const action = card.actions[kind];
    if (!action || !action.enabled) return '';
    const title = ACTION_LABELS[kind];
    const hasImage = actionHasCustomIcon(action);
    const hasCustomHover = actionHasCustomHover(action);
    const iconHtml = actionIconInnerHtml(action) + actionHoverInnerHtml(action, kind);
    const cls = 'pack-card-action has-rollover'
      + (hasImage ? ' has-icon-image' : '')
      + (hasCustomHover ? ' has-custom-rollover' : '');
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

  function cardSoonLabelSrc(card) {
    return card && typeof card.comingSoonLabel === 'string' ? card.comingSoonLabel : '';
  }

  function comingSoonBadgeHtml() {
    return (
      '<span class="pack-card-soon-badge">' +
        '<span class="pack-card-soon-rule" aria-hidden="true"></span>' +
        '<span class="pack-card-soon-text">בקרוב</span>' +
        '<span class="pack-card-soon-rule" aria-hidden="true"></span>' +
      '</span>'
    );
  }

  function comingSoonLabelImgHtml(src) {
    if (!src) return '';
    return '<img class="pack-card-soon-label" src="' + escapeHtml(src) + '" alt="בקרוב">';
  }

  function comingSoonOverlayHtml(card) {
    const labelSrc = cardSoonLabelSrc(card);
    const labelImg = comingSoonLabelImgHtml(labelSrc);
    if (!card.comingSoon) {
      return labelImg ? '<div class="pack-card-soon-store" hidden>' + labelImg + '</div>' : '';
    }
    const customClass = labelSrc ? ' has-custom-label' : '';
    const inner = labelSrc ? labelImg : comingSoonBadgeHtml();
    return (
      '<div class="pack-card-soon' + customClass + '" role="status" aria-label="בקרוב">' +
        inner +
      '</div>'
    );
  }

  function soonLabelPreviewHtml(card) {
    const labelSrc = cardSoonLabelSrc(card);
    if (labelSrc) return comingSoonLabelImgHtml(labelSrc);
    return '<span class="pack-soon-label-fallback">בקרוב</span>';
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
      ? '<div class="pack-card-fill" aria-hidden="true"><div class="pack-card-photo" title="לחצו לבחירה · גודל בסרגל הכלים"></div></div>'
      : '';
    const imageScale = clampImageScale(card.imageScale);
    const imageScaleY = clampImageScale(card.imageScaleY != null ? card.imageScaleY : imageScale);
    const keepRatio = card.keepRatio !== false;
    const freeScaleClass = useImage && !keepRatio ? ' is-free-scale' : '';
    const soonHtml = comingSoonOverlayHtml(card);
    const resizeHtml = editing
      ? '<span class="pack-card-resize" data-card-resize="nw" title="גררו לשינוי גודל"></span>' +
        '<span class="pack-card-resize" data-card-resize="n" title="גררו לשינוי גובה"></span>' +
        '<span class="pack-card-resize" data-card-resize="ne" title="גררו לשינוי גודל"></span>' +
        '<span class="pack-card-resize" data-card-resize="w" title="גררו לשינוי רוחב"></span>' +
        '<span class="pack-card-resize" data-card-resize="e" title="גררו לשינוי רוחב"></span>' +
        '<span class="pack-card-resize" data-card-resize="sw" title="גררו לשינוי גודל"></span>' +
        '<span class="pack-card-resize" data-card-resize="s" title="גררו לשינוי גובה"></span>' +
        '<span class="pack-card-resize" data-card-resize="se" title="גררו לשינוי גודל"></span>'
      : '';
    return (
      '<div class="pack-card' + editingClass + imageClass + soonClass + freeScaleClass + '" data-id="' + escapeHtml(card.id) + '"' +
        (card.comingSoon ? ' aria-disabled="true"' : '') +
        ' style="--pack-card-color:' + escapeHtml(card.color) +
        ';--cx:' + card.x + '%;--cy:' + card.y + '%;--cw:' + card.w +
        ';--ch:' + (card.h ? clampCardBoxHeight(card.h) + 'px' : 'auto') +
        ';--pack-card-img-scale:' + (imageScale / 100) +
        ';--pack-card-img-scale-y:' + (imageScaleY / 100) +
        ';--pack-card-img-x:' + clampImagePos(card.imageX) + '%' +
        ';--pack-card-img-y:' + clampImagePos(card.imageY) + '%;">' +
        photoHtml +
        resizeHtml +
        '<button type="button" class="pack-card-dup" data-card-dup="' + escapeHtml(card.id) + '" title="שכפול קובייה" aria-label="שכפול קובייה">' +
          '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">' +
            '<rect x="1.5" y="1.5" width="9" height="9" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.7"/>' +
            '<rect x="5.5" y="5.5" width="9" height="9" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.7"/>' +
          '</svg>' +
        '</button>' +
        '<button type="button" class="pack-card-delete" data-card-delete="' + escapeHtml(card.id) + '" title="הסרת קובייה" aria-label="הסרת קובייה">×</button>' +
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
    syncCardsFreeformToggle();
    ui.cardsGrid.innerHTML = state.cards.items.map(cardHtml).join('');
    state.cards.items.forEach(function (card) {
      const cardEl = ui.cardsGrid.querySelector('.pack-card[data-id="' + card.id + '"]');
      if (!cardEl) return;
      applyCardImageVars(cardEl, card);
      ensureCardImageBox(card, cardEl);
    });
    restoreActivePackTargetEl();
    if (isEditorOpen() && editingCardId) syncCardImagePreview(editingCardId);
  }

  /* ---------- רינדור: סגירה ---------- */

  function closingIconInnerHtml(icon) {
    if (icon.kind === 'text') return escapeHtml(icon.value);
    if (icon.type === 'image' && icon.value) {
      return '<img src="' + escapeHtml(icon.value) + '" alt="">';
    }
    return escapeHtml(icon.value);
  }

  function overlayDeleteHtml(id) {
    if (!isPageEditMode()) return '';
    return (
      '<button type="button" class="pack-overlay-delete" data-overlay-delete="' + escapeHtml(id) + '"' +
        ' title="הסרה" aria-label="הסרה">×</button>'
    );
  }

  function overlayResizeHtml() {
    if (!isPageEditMode()) return '';
    return (
      '<span class="pack-card-resize pack-overlay-resize" data-overlay-resize="nw" title="גררו לשינוי גודל"></span>' +
      '<span class="pack-card-resize pack-overlay-resize" data-overlay-resize="n" title="גררו לשינוי גובה"></span>' +
      '<span class="pack-card-resize pack-overlay-resize" data-overlay-resize="ne" title="גררו לשינוי גודל"></span>' +
      '<span class="pack-card-resize pack-overlay-resize" data-overlay-resize="w" title="גררו לשינוי רוחב"></span>' +
      '<span class="pack-card-resize pack-overlay-resize" data-overlay-resize="e" title="גררו לשינוי רוחב"></span>' +
      '<span class="pack-card-resize pack-overlay-resize" data-overlay-resize="sw" title="גררו לשינוי גודל"></span>' +
      '<span class="pack-card-resize pack-overlay-resize" data-overlay-resize="s" title="גררו לשינוי גובה"></span>' +
      '<span class="pack-card-resize pack-overlay-resize" data-overlay-resize="se" title="גררו לשינוי גודל"></span>'
    );
  }

  function syncOverlayResizeHandles(host) {
    if (!host) return;
    const existing = host.querySelectorAll(':scope > [data-overlay-resize]');
    if (!isPageEditMode() || host.hidden) {
      for (let i = 0; i < existing.length; i++) existing[i].remove();
      return;
    }
    if (existing.length === 8) return;
    for (let i = 0; i < existing.length; i++) existing[i].remove();
    host.insertAdjacentHTML('beforeend', overlayResizeHtml());
  }

  function closingIconHtml(icon) {
    const editingClass = editingOverlayId && editingOverlayId === icon.id ? ' is-editing' : '';
    if (icon.kind === 'text') {
      const hasHref = !!icon.href;
      const editing = isPageEditMode();
      return (
        '<div class="pack-closing-text' + editingClass + '" data-icon-id="' + escapeHtml(icon.id) + '" data-kind="text" data-has-href="' + (hasHref ? '1' : '0') + '"' +
          (hasHref ? ' data-href="' + escapeHtml(icon.href) + '"' : '') +
          ' style="--cx:' + icon.x + '%;--cy:' + icon.y + '%;--csize:' + icon.size + 'px;--ccolor:' + escapeHtml(icon.color) + ';">' +
          '<span class="pack-closing-text-label" spellcheck="false"' + (editing ? ' contenteditable="true"' : '') + '>' +
            escapeHtml(icon.value) +
          '</span>' +
          overlayDeleteHtml(icon.id) +
        '</div>'
      );
    }
    const keep = overlayIconKeepsRatio(icon);
    const sizeW = clampClosingIconSize(icon.size);
    const sizeH = keep ? sizeW : clampClosingIconSize(icon.sizeY != null ? icon.sizeY : icon.size);
    const hasHref = !!icon.href;
    return (
      '<a class="pack-closing-icon' + editingClass + (keep ? '' : ' is-free-scale') + '" data-icon-id="' + escapeHtml(icon.id) + '" data-kind="icon" data-has-href="' + (hasHref ? '1' : '0') + '"' +
        ' href="' + escapeHtml(icon.href || '#') + '" target="_blank" rel="noopener noreferrer"' +
        ' style="--cx:' + icon.x + '%;--cy:' + icon.y + '%;--csize:' + sizeW + 'px;--csize-y:' + sizeH + 'px;"' +
        (hasHref ? '' : ' aria-disabled="true"') + '>' +
        closingIconInnerHtml(icon) +
        overlayDeleteHtml(icon.id) +
        overlayResizeHtml() +
      '</a>'
    );
  }

  function renderClosingIcons() {
    const ui = els();
    const host = ui.overlayItems || ui.closingItems;
    if (!host) return;
    ensureOverlayHost();
    host.innerHTML = state.closing.icons.map(closingIconHtml).join('');
    restoreActivePackTargetEl();
  }

  function ensureOverlayHost() {
    const ui = els();
    const host = ui.overlayItems || ui.closingItems;
    if (!ui.workspace || !host) return;
    if (host.parentElement !== ui.workspace) ui.workspace.appendChild(host);
  }

  function ensureOverlayIconsPackAnchor() {
    const ui = els();
    if (!ui.workspace) return;
    const wr = ui.workspace.getBoundingClientRect();
    if (!wr.width || !wr.height) return;
    const closingH = clampClosingHeight(state.closing && state.closing.height);
    const stripTop = Math.max(0, wr.height - closingH);
    let changed = false;
    state.closing.icons.forEach(function (icon) {
      if (icon.packAnchored) return;
      const px = (icon.x / 100) * wr.width;
      const py = stripTop + (icon.y / 100) * closingH;
      icon.x = clampPackOverlayPos((px / wr.width) * 100, 18);
      icon.y = clampPackOverlayPos((py / wr.height) * 100, 88);
      icon.packAnchored = true;
      changed = true;
    });
    if (changed && !isEditorOpen()) persist();
  }

  function ensureDevTeamHost() {
    const ui = els();
    if (!ui.workspace || !ui.devTeamBtn) return;
    if (ui.devTeamBtn.parentElement !== ui.workspace) ui.workspace.appendChild(ui.devTeamBtn);
  }

  function ensureDevTeamPackAnchor() {
    if (state.closing.packAnchored) return;
    const ui = els();
    if (!ui.workspace) return;
    const wr = ui.workspace.getBoundingClientRect();
    if (!wr.width || !wr.height) return;
    let px = null;
    let py = null;
    if (ui.closingSection && !isClosingHidden()) {
      const cr = ui.closingSection.getBoundingClientRect();
      if (cr.width && cr.height) {
        px = cr.left - wr.left + (state.closing.x / 100) * cr.width;
        py = cr.top - wr.top + (state.closing.y / 100) * cr.height;
      }
    }
    if (px == null || py == null) {
      px = (state.closing.x / 100) * wr.width;
      py = wr.height * 0.9;
    }
    state.closing.x = clampPackOverlayPos((px / wr.width) * 100, 88);
    state.closing.y = clampPackOverlayPos((py / wr.height) * 100, 90);
    state.closing.packAnchored = true;
  }

  function renderClosing() {
    const ui = els();
    const closing = state.closing;
    ensureOverlayHost();
    ensureDevTeamHost();
    ensureDevTeamPackAnchor();
    ensureOverlayIconsPackAnchor();
    if (ui.closingSection) ui.closingSection.hidden = true;
    if (ui.closingResize) ui.closingResize.hidden = true;
    if (ui.closingEditBtn) ui.closingEditBtn.hidden = true;
    if (ui.devTeamBtn) {
      ui.devTeamBtn.hidden = !closing.enabled;
      ui.devTeamBtn.classList.toggle('has-image', !!closing.image);
      ui.devTeamBtn.style.setProperty('--pack-dev-team-color', closing.color);
      ui.devTeamBtn.style.setProperty('--pack-dev-team-text', closing.textColor);
      ui.devTeamBtn.style.setProperty('--pack-dev-team-radius', clampDevTeamRadius(closing.radius) + 'px');
      ui.devTeamBtn.style.setProperty('--pack-dev-team-image', closing.image ? cssUrl(closing.image) : 'none');
      ui.devTeamBtn.style.setProperty('--cx', closing.x + '%');
      ui.devTeamBtn.style.setProperty('--cy', closing.y + '%');
      applyDevTeamScaleStyle(ui.devTeamBtn);
      ui.devTeamBtn.classList.toggle('is-editing', editingOverlayId === OVERLAY_DEVTEAM_ID);
      if (closing.href) {
        ui.devTeamBtn.href = closing.href;
        ui.devTeamBtn.classList.remove('is-disabled');
        ui.devTeamBtn.removeAttribute('aria-disabled');
      } else {
        ui.devTeamBtn.removeAttribute('href');
        ui.devTeamBtn.classList.add('is-disabled');
        ui.devTeamBtn.setAttribute('aria-disabled', 'true');
      }
      const del = ui.devTeamBtn.querySelector('[data-overlay-delete="devteam"]');
      if (del) del.hidden = !isPageEditMode() || !closing.enabled;
      syncOverlayResizeHandles(ui.devTeamBtn);
    }
    if (ui.devTeamLabel) {
      if (document.activeElement !== ui.devTeamLabel) ui.devTeamLabel.textContent = closing.label;
      ui.devTeamLabel.style.fontSize = closing.labelSize + 'px';
      ui.devTeamLabel.style.color = closing.textColor;
    }
    renderClosingIcons();
    syncPackAddMenu();
  }

  function renderAll() {
    renderHeader();
    renderCards();
    renderClosing();
  }

  /* ---------- מנוע חלונית העריכה הכללי ---------- */

  const OVERLAY_DEVTEAM_ID = 'devteam';

  let editorOpen = false;
  let editingCardId = null;
  let editingOverlayId = null;

  function isEditorOpen() {
    return editorOpen;
  }

  function findOverlayItemEl(id) {
    if (!id) return null;
    if (id === OVERLAY_DEVTEAM_ID) {
      const ui = els();
      return ui.devTeamBtn || document.getElementById('packDevTeamBtn');
    }
    return document.querySelector(
      '.pack-closing-icon[data-icon-id="' + id + '"], .pack-closing-text[data-icon-id="' + id + '"]'
    );
  }

  function editorDockTargetEl() {
    if (editingCardId) return document.querySelector('.pack-card[data-id="' + editingCardId + '"]');
    if (editingOverlayId) return findOverlayItemEl(editingOverlayId);
    return null;
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

  function highlightEditingOverlay() {
    const ui = els();
    if (ui.devTeamBtn) {
      ui.devTeamBtn.classList.toggle('is-editing', editingOverlayId === OVERLAY_DEVTEAM_ID);
    }
    document.querySelectorAll('.pack-closing-icon, .pack-closing-text').forEach(function (el) {
      const id = el.getAttribute('data-icon-id');
      el.classList.toggle('is-editing', !!(editingOverlayId && id === editingOverlayId));
    });
  }

  function highlightEditingTarget() {
    highlightEditingCard();
    highlightEditingOverlay();
  }

  function closeHslaPopover() {
    const pop = document.getElementById('hslaPopover');
    if (pop && !pop.hidden) pop.hidden = true;
  }

  function isCompactEditorLayout() {
    return !!(window.matchMedia && window.matchMedia('(max-width: 760px)').matches);
  }

  function prefersReducedPackMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function editorDockSide(opts) {
    const el = editorDockTargetEl();
    if (!el) return 'left';
    const rect = el.getBoundingClientRect();
    const centerX = (rect.left + rect.right) / 2;
    const mid = window.innerWidth / 2;
    if (opts && opts.hysteresis) {
      const ui = els();
      const currentlyRight = !!(ui.editOverlay && ui.editOverlay.classList.contains('is-side-right'));
      const slack = 32;
      if (currentlyRight) return centerX < mid + slack ? 'right' : 'left';
      return centerX < mid - slack ? 'right' : 'left';
    }
    return centerX < mid ? 'right' : 'left';
  }

  function editorDockTranslateX(overlay, modal, side) {
    if (side !== 'right' || !overlay || !modal || isCompactEditorLayout()) return 0;
    return Math.max(0, overlay.clientWidth - modal.offsetWidth - 32);
  }

  function syncEditorDockSide(opts) {
    const ui = els();
    if (!ui.editOverlay) return;
    const modal = ui.editOverlay.querySelector('.pack-edit-modal');
    const side = editorDockSide({ hysteresis: !!(opts && opts.live) });
    const x = editorDockTranslateX(ui.editOverlay, modal, side);
    const next = x + 'px';
    const wasRight = ui.editOverlay.classList.contains('is-side-right');
    const prev = ui.editOverlay.style.getPropertyValue('--pack-edit-x');
    if (wasRight === (side === 'right') && prev === next) return;

    const instant = !!(opts && opts.instant) || prefersReducedPackMotion();
    if (instant) ui.editOverlay.classList.add('is-dock-instant');
    ui.editOverlay.classList.toggle('is-side-right', side === 'right');
    ui.editOverlay.style.setProperty('--pack-edit-x', next);
    if (instant) {
      if (modal) void modal.offsetWidth;
      ui.editOverlay.classList.remove('is-dock-instant');
    }
  }

  function bindEditorDock() {
    if (document.body.dataset.packEditDockBound === '1') return;
    document.body.dataset.packEditDockBound = '1';
    window.addEventListener('resize', function () {
      if (!isEditorOpen()) return;
      syncEditorDockSide({ instant: true });
    });
  }

  function openEditor(config) {
    if (!isPageEditMode()) return;
    const ui = els();
    if (!ui.editOverlay) return;
    closeHslaPopover();
    snapshotJSON = JSON.stringify(state);
    editorOpen = true;
    editingCardId = config.cardId || null;
    editingOverlayId = config.overlayId || null;
    ui.editTitle.textContent = config.title || 'עריכה';
    if (ui.editHint) {
      ui.editHint.hidden = !config.hint;
      ui.editHint.textContent = config.hint || '';
    }
    ui.editFields.innerHTML = config.fieldsHtml || '';
    if (typeof config.bind === 'function') config.bind(ui.editFields);
    const wasHidden = ui.editOverlay.hidden;
    ui.editOverlay.hidden = false;
    highlightEditingTarget();
    syncEditorDockSide({ instant: wasHidden });
  }

  function closeEditor(revert) {
    const ui = els();
    editingCardId = null;
    editingOverlayId = null;
    if (revert && snapshotJSON) {
      try { state = normalizeState(JSON.parse(snapshotJSON)); } catch (_) { /* ignore */ }
      renderAll();
    } else {
      highlightEditingTarget();
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

  function keepRatioCheckHtml(id, checked) {
    return (
      '<label class="pack-check-row">' +
        '<input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '>' +
        '<span>שמירת פרופורציות</span>' +
      '</label>' +
      '<p class="pack-field-sub">כשהסימון פעיל, גובה ורוחב משתנים יחד. בביטול אפשר למתוח כל ציר בנפרד מפינות האלמנט.</p>'
    );
  }

  function bindRangeRow(root, id, onChange) {
    const range = root.querySelector('#' + id);
    const num = root.querySelector('#' + id + 'Num');
    if (range) range.addEventListener('input', function () { onChange(range.value); if (num) num.value = range.value; });
    if (num) num.addEventListener('input', function () { onChange(num.value); if (range) range.value = num.value; });
  }

  /* ================================================================
     עורך הכותרת: רקע + טקסטים
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
        '<div id="packHeaderColorFields"' + (h.mode === 'color' ? '' : ' hidden') + '>' +
          colorFieldHtml('packHeaderColor', 'צבע כותרת', h.color) +
        '</div>' +
        '<div id="packHeaderImageFields"' + (h.mode === 'image' ? '' : ' hidden') + '>' +
          '<label class="pack-upload" for="packHeaderImageInput">' +
            '<input type="file" id="packHeaderImageInput" accept="image/*" hidden>' +
            '<span>העלאת תמונה / החלפה</span>' +
          '</label>' +
          '<div class="pack-header-preview" id="packHeaderImagePreviewWrap"' + (h.image ? '' : ' hidden') + '>' +
            '<div class="pack-header-preview-stage" id="packHeaderImagePreviewStage">' +
              '<div class="pack-header-preview-clip">' +
                '<div class="pack-header-preview-img" id="packHeaderImagePreview" title="גררו להזזה · פינות לשינוי גודל"></div>' +
              '</div>' +
              '<div class="pack-header-preview-handles" aria-hidden="true">' +
                '<span class="pack-card-resize pack-header-preview-resize" data-header-preview-resize="nw" title="גררו לשינוי גודל"></span>' +
                '<span class="pack-card-resize pack-header-preview-resize" data-header-preview-resize="n" title="גררו לשינוי גובה"></span>' +
                '<span class="pack-card-resize pack-header-preview-resize" data-header-preview-resize="ne" title="גררו לשינוי גודל"></span>' +
                '<span class="pack-card-resize pack-header-preview-resize" data-header-preview-resize="w" title="גררו לשינוי רוחב"></span>' +
                '<span class="pack-card-resize pack-header-preview-resize" data-header-preview-resize="e" title="גררו לשינוי רוחב"></span>' +
                '<span class="pack-card-resize pack-header-preview-resize" data-header-preview-resize="sw" title="גררו לשינוי גודל"></span>' +
                '<span class="pack-card-resize pack-header-preview-resize" data-header-preview-resize="s" title="גררו לשינוי גובה"></span>' +
                '<span class="pack-card-resize pack-header-preview-resize" data-header-preview-resize="se" title="גררו לשינוי גודל"></span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div id="packHeaderKeepRatioWrap"' + (h.image ? '' : ' hidden') + '>' +
            '<label class="pack-check-row">' +
              '<input type="checkbox" id="packHeaderKeepRatio"' + (h.keepRatio !== false ? ' checked' : '') + '>' +
              '<span>פרופורציות</span>' +
            '</label>' +
            '<p class="pack-field-sub">כשהסימון פעיל, גובה ורוחב משתנים יחד. בביטול מופיעות ידיות גם בצלעות, ואפשר למתוח כל ציר בנפרד.</p>' +
          '</div>' +
          '<div class="pack-header-image-actions"' + (h.image ? '' : ' hidden') + '>' +
            '<button type="button" class="pack-clear-btn" id="packHeaderImageClear"' + (h.image ? '' : ' hidden') + '>הסרת תמונה</button>' +
            '<button type="button" class="pack-reset-btn" id="packHeaderImageReset"' + (h.image ? '' : ' hidden') + '>איפוס תמונה</button>' +
          '</div>' +
          '<p class="pack-field-sub">התצוגה המקדימה היא העתק מוקטן של הכותרת באתר — אותו יחס ואותו חיתוך. גררו את התמונה כדי להזיז אותה, ואת הקוביות האדומות כדי לשנות גודל. איפוס ממלא את כל שטח הכותרת.</p>' +
        '</div>' +
        '<div id="packHeaderOpacityFields"' + (h.mode === 'transparent' ? '' : ' hidden') + '>' +
          rangeRowHtml('packHeaderOpacity', 'שקיפות', h.opacity, 0, 100, '%') +
        '</div>' +
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
        '<p class="pack-field-sub">לחצו על הטקסט בכותרת כדי לערוך, וגררו למיקום חופשי. גודל וצבע בסרגל הכלים. גודל התמונה משתנה בפינות התצוגה המקדימה.</p>' +
      '</section>' +
      '</div>'
    );
  }

  function syncHeaderBgModeFields(root) {
    if (!root) return;
    const mode = state.header.mode;
    const colorFields = root.querySelector('#packHeaderColorFields');
    const imageFields = root.querySelector('#packHeaderImageFields');
    const opacityFields = root.querySelector('#packHeaderOpacityFields');
    if (colorFields) colorFields.hidden = mode !== 'color';
    if (imageFields) imageFields.hidden = mode !== 'image';
    if (opacityFields) opacityFields.hidden = mode !== 'transparent';
    if (mode !== 'color') closeHslaPopover();
  }

  function bindHeaderEditorFields(root) {
    // רקע
    root.querySelectorAll('input[name="packHeaderMode"]').forEach(function (input) {
      input.addEventListener('change', function () {
        if (!input.checked) return;
        state.header.mode = input.value;
        if (input.value !== 'image' && activePackText && activePackText.role === 'header-image') {
          setActivePackTarget(null);
        }
        syncHeaderBgModeFields(root);
        renderHeader();
      });
    });
    bindColorField(root, 'packHeaderColor', function (hex) {
      state.header.color = hex;
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
          fillHeaderImage();
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
        if (activePackText && activePackText.role === 'header-image') setActivePackTarget(null);
        renderHeader();
        openEditorRefresh();
      });
    }
    const imageReset = root.querySelector('#packHeaderImageReset');
    if (imageReset) {
      imageReset.addEventListener('click', function () {
        if (!state.header.image) return;
        fillHeaderImage();
        renderHeader();
        if (activePackText && activePackText.role === 'header-image') syncPackToolbar();
        openEditorRefresh();
      });
    }
    const ratioInput = root.querySelector('#packHeaderKeepRatio');
    if (ratioInput) {
      ratioInput.addEventListener('change', function () {
        setHeaderKeepRatio(!!ratioInput.checked);
      });
    }
    bindHeaderPreviewResize(root);
    syncHeaderImagePreview();
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
        if (headerHiddenCheck.checked && activePackText &&
            (activePackText.role === 'header-image' || activePackText.role === 'header-logo' ||
             activePackText.role === 'header-title' || activePackText.role === 'header-subtitle')) {
          setActivePackTarget(null);
        }
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
  }

  function bindHeaderPreviewResize(root) {
    if (!root || root.dataset.headerPreviewResizeBound === '1') return;
    root.dataset.headerPreviewResizeBound = '1';
    root.addEventListener('pointerdown', function (e) {
      const from = eventEl(e.target);
      if (!from || !from.closest) return;
      if (state.header.mode !== 'image' || !state.header.image) return;
      if (e.button != null && e.button !== 0) return;
      const handle = from.closest('[data-header-preview-resize]');
      const img = from.closest('#packHeaderImagePreview');
      if (!handle && !img) return;
      const stage = document.getElementById('packHeaderImagePreviewStage');
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      e.preventDefault();
      e.stopPropagation();

      if (handle) {
        startHeaderPreviewResize(e, handle, rect);
        return;
      }
      startHeaderImagePan(e, img, rect);
    });
  }

  function startHeaderPreviewResize(e, handle, rect) {
    const corner = handle.getAttribute('data-header-preview-resize') || 'se';
    const xSign = corner.indexOf('e') >= 0 ? 1 : (corner.indexOf('w') >= 0 ? -1 : 0);
    const ySign = corner.indexOf('s') >= 0 ? 1 : (corner.indexOf('n') >= 0 ? -1 : 0);
    const startW = (clampImageScale(state.header.imageScale) / 100) * rect.width;
    const startH = (headerImageScaleY() / 100) * rect.height;
    const startCx = (clampImagePos(state.header.imageX) / 100) * rect.width;
    const startCy = (clampImagePos(state.header.imageY) / 100) * rect.height;
    const startLeft = startCx - startW / 2;
    const startTop = startCy - startH / 2;
    const fixedX = xSign > 0 ? startLeft : (xSign < 0 ? startLeft + startW : startCx);
    const fixedY = ySign > 0 ? startTop : (ySign < 0 ? startTop + startH : startCy);
    const minW = (IMAGE_SCALE_MIN / 100) * rect.width;
    const maxW = (IMAGE_SCALE_MAX / 100) * rect.width;
    const minH = (IMAGE_SCALE_MIN / 100) * rect.height;
    const maxH = (IMAGE_SCALE_MAX / 100) * rect.height;
    try { handle.setPointerCapture(e.pointerId); } catch (_) {}

    function sizeFromPointer(ev) {
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;
      let w = xSign ? Math.abs(px - fixedX) : startW;
      let h = ySign ? Math.abs(py - fixedY) : startH;
      const keep = headerKeepsRatio() && xSign && ySign;
      if (keep) {
        const factor = Math.max(w / Math.max(startW, 1), h / Math.max(startH, 1));
        w = startW * factor;
        h = startH * factor;
      } else if (headerKeepsRatio() && (xSign || ySign)) {
        setHeaderKeepRatio(false);
      }
      w = Math.min(maxW, Math.max(minW, w));
      h = Math.min(maxH, Math.max(minH, h));
      if (keep) {
        const factor = Math.min(w / Math.max(startW, 1), h / Math.max(startH, 1));
        w = Math.min(maxW, Math.max(minW, startW * factor));
        h = startH * (w / Math.max(startW, 1));
        if (h > maxH) { h = maxH; w = startW * (h / Math.max(startH, 1)); }
        if (h < minH) { h = minH; w = startW * (h / Math.max(startH, 1)); }
      }
      const left = xSign ? (xSign > 0 ? fixedX : fixedX - w) : startLeft;
      const top = ySign ? (ySign > 0 ? fixedY : fixedY - h) : startTop;
      state.header.imageScale = clampImageScale((w / rect.width) * 100);
      state.header.imageScaleY = clampImageScale((h / rect.height) * 100);
      state.header.imageX = clampImagePos(((left + w / 2) / rect.width) * 100);
      state.header.imageY = clampImagePos(((top + h / 2) / rect.height) * 100);
      renderHeaderBg();
      if (activePackText && activePackText.role === 'header-image') syncPackToolbar();
    }
    function onMove(ev) { sizeFromPointer(ev); }
    function onUp(ev) {
      try { handle.releasePointerCapture(ev.pointerId); } catch (_) {}
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
    }
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  }

  function startHeaderImagePan(e, img, rect) {
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = clampImagePos(state.header.imageX);
    const origY = clampImagePos(state.header.imageY);
    let moved = false;
    try { img.setPointerCapture(e.pointerId); } catch (_) {}
    img.classList.add('is-dragging');

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      moved = true;
      state.header.imageX = clampImagePos(origX + (dx / rect.width) * 100);
      state.header.imageY = clampImagePos(origY + (dy / rect.height) * 100);
      applyHeaderImagePosLive();
    }
    function onUp(ev) {
      img.classList.remove('is-dragging');
      try { img.releasePointerCapture(ev.pointerId); } catch (_) {}
      img.removeEventListener('pointermove', onMove);
      img.removeEventListener('pointerup', onUp);
      img.removeEventListener('pointercancel', onUp);
      if (moved && !isEditorOpen()) persist();
    }
    img.addEventListener('pointermove', onMove);
    img.addEventListener('pointerup', onUp);
    img.addEventListener('pointercancel', onUp);
  }

  function bindCardPreviewResize(root, cardId) {
    if (!root || root.dataset.cardPreviewResizeBound === '1') return;
    root.dataset.cardPreviewResizeBound = '1';
    root.addEventListener('pointerdown', function (e) {
      const from = eventEl(e.target);
      if (!from || !from.closest) return;
      const card = findCardById(cardId);
      if (!card || card.bgMode !== 'image' || !card.image) return;
      if (e.button != null && e.button !== 0) return;
      const handle = from.closest('[data-card-preview-resize]');
      const img = from.closest('#packCardImagePreview');
      if (!handle && !img) return;
      const stage = document.getElementById('packCardImagePreviewStage');
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      e.preventDefault();
      e.stopPropagation();
      if (handle) {
        startCardPreviewResize(e, handle, rect, card);
        return;
      }
      startCardPreviewPan(e, img, rect, card);
    });
  }

  function startCardPreviewResize(e, handle, rect, card) {
    const corner = handle.getAttribute('data-card-preview-resize') || 'se';
    const xSign = corner.indexOf('e') >= 0 ? 1 : (corner.indexOf('w') >= 0 ? -1 : 0);
    const ySign = corner.indexOf('s') >= 0 ? 1 : (corner.indexOf('n') >= 0 ? -1 : 0);
    const startW = (clampImageScale(card.imageScale) / 100) * rect.width;
    const startH = (cardImageScaleY(card) / 100) * rect.height;
    const startCx = (clampImagePos(card.imageX) / 100) * rect.width;
    const startCy = (clampImagePos(card.imageY) / 100) * rect.height;
    const startLeft = startCx - startW / 2;
    const startTop = startCy - startH / 2;
    const fixedX = xSign > 0 ? startLeft : (xSign < 0 ? startLeft + startW : startCx);
    const fixedY = ySign > 0 ? startTop : (ySign < 0 ? startTop + startH : startCy);
    const minW = (IMAGE_SCALE_MIN / 100) * rect.width;
    const maxW = (IMAGE_SCALE_MAX / 100) * rect.width;
    const minH = (IMAGE_SCALE_MIN / 100) * rect.height;
    const maxH = (IMAGE_SCALE_MAX / 100) * rect.height;
    try { handle.setPointerCapture(e.pointerId); } catch (_) {}

    function sizeFromPointer(ev) {
      const px = ev.clientX - rect.left;
      const py = ev.clientY - rect.top;
      let w = xSign ? Math.abs(px - fixedX) : startW;
      let h = ySign ? Math.abs(py - fixedY) : startH;
      const keep = cardKeepsRatio(card) && xSign && ySign;
      if (keep) {
        const factor = Math.max(w / Math.max(startW, 1), h / Math.max(startH, 1));
        w = startW * factor;
        h = startH * factor;
      } else if (cardKeepsRatio(card) && (xSign || ySign)) {
        setCardKeepRatio(card, cardLiveEl(card.id), false);
      }
      w = Math.min(maxW, Math.max(minW, w));
      h = Math.min(maxH, Math.max(minH, h));
      if (keep) {
        const factor = Math.min(w / Math.max(startW, 1), h / Math.max(startH, 1));
        w = Math.min(maxW, Math.max(minW, startW * factor));
        h = startH * (w / Math.max(startW, 1));
        if (h > maxH) { h = maxH; w = startW * (h / Math.max(startH, 1)); }
        if (h < minH) { h = minH; w = startW * (h / Math.max(startH, 1)); }
      }
      const left = xSign ? (xSign > 0 ? fixedX : fixedX - w) : startLeft;
      const top = ySign ? (ySign > 0 ? fixedY : fixedY - h) : startTop;
      card.imageScale = clampImageScale((w / rect.width) * 100);
      card.imageScaleY = clampImageScale((h / rect.height) * 100);
      card.imageX = clampImagePos(((left + w / 2) / rect.width) * 100);
      card.imageY = clampImagePos(((top + h / 2) / rect.height) * 100);
      applyCardImageScaleStyle(card, cardLiveEl(card.id));
      if (activePackText && activePackText.role === 'card-image' && activePackText.cardId === card.id) {
        syncPackToolbar();
      }
    }
    function onMove(ev) { sizeFromPointer(ev); }
    function onUp(ev) {
      try { handle.releasePointerCapture(ev.pointerId); } catch (_) {}
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
    }
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  }

  function startCardPreviewPan(e, img, rect, card) {
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = clampImagePos(card.imageX);
    const origY = clampImagePos(card.imageY);
    let moved = false;
    try { img.setPointerCapture(e.pointerId); } catch (_) {}
    img.classList.add('is-dragging');

    function onMove(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      moved = true;
      card.imageX = clampImagePos(origX + (dx / rect.width) * 100);
      card.imageY = clampImagePos(origY + (dy / rect.height) * 100);
      applyCardImagePosLive(card);
    }
    function onUp(ev) {
      img.classList.remove('is-dragging');
      try { img.releasePointerCapture(ev.pointerId); } catch (_) {}
      img.removeEventListener('pointermove', onMove);
      img.removeEventListener('pointerup', onUp);
      img.removeEventListener('pointercancel', onUp);
    }
    img.addEventListener('pointermove', onMove);
    img.addEventListener('pointerup', onUp);
    img.addEventListener('pointercancel', onUp);
  }

  function applyCardImagePosLive(card) {
    const cardEl = card && cardLiveEl(card.id);
    if (cardEl) applyCardImageVars(cardEl, card);
    const wrap = document.getElementById('packCardImagePreviewWrap');
    if (wrap) applyCardImageVars(wrap, card);
    const stage = document.getElementById('packCardImagePreviewStage');
    if (stage) applyCardImageVars(stage, card);
  }

  function openEditorRefresh() {
    const ui = els();
    if (!ui.editFields) return;
    const modeRadios = ui.editFields.querySelectorAll('input[name="packHeaderMode"]');
    modeRadios.forEach(function (r) { r.checked = r.value === state.header.mode; });
    syncHeaderBgModeFields(ui.editFields);
    syncHeaderImagePreview();
    if (editingCardId) syncCardImagePreview(editingCardId);
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
     פריסת קוביות — צ'קבוקס בסרגל הכלים
     ================================================================ */

  function syncCardsFreeformToggle() {
    const input = document.getElementById('packCardsFreeform');
    if (input) input.checked = isCardsFreeform();
  }

  function setCardsFreeform(on) {
    state.cards.freeform = !!on;
    if (state.cards.freeform) ensureFreeformPositions();
    renderCards();
    persist();
  }

  function bindCardsFreeformToggle() {
    const input = document.getElementById('packCardsFreeform');
    if (!input || input.dataset.packFreeformBound === '1') return;
    input.dataset.packFreeformBound = '1';
    input.addEventListener('change', function () {
      setCardsFreeform(input.checked);
    });
  }

  /* ================================================================
     עורך קובייה בודדת
     ================================================================ */

  function actionRowHtml(kind, label, action) {
    const hasImage = actionHasCustomIcon(action);
    const hasCustomHover = actionHasCustomHover(action);
    return (
      '<div class="pack-action-block" data-action-kind="' + kind + '">' +
        '<div class="pack-action-row">' +
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
        '</div>' +
        '<div class="pack-action-icon-row pack-action-hover-row" data-action-hover-row="' + kind + '">' +
          '<span class="pack-action-icon-preview is-visible' + (hasCustomHover ? '' : ' is-default-hover') + '" data-action-hover-preview="' + kind + '">' +
            actionHoverPreviewInnerHtml(action, kind) +
          '</span>' +
          '<label class="pack-upload pack-upload--sm" for="packActionHover_' + kind + '">' +
            '<input type="file" id="packActionHover_' + kind + '" accept="image/*" data-action-hover-input="' + kind + '" hidden>' +
            '<span>העלאת רולאובר מותאם</span>' +
          '</label>' +
          '<button type="button" class="pack-clear-btn pack-clear-btn--sm" data-action-hover-clear="' + kind + '"' + (hasCustomHover ? '' : ' hidden') + '>חזרה לברירת מחדל</button>' +
        '</div>' +
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
        '<div class="pack-soon-label-wrap" id="packCardSoonLabelWrap"' + (card.comingSoon ? '' : ' hidden') + '>' +
          '<div class="pack-soon-label-row">' +
            '<span class="pack-soon-label-preview' + (cardSoonLabelSrc(card) ? ' is-custom' : '') + '" id="packCardSoonLabelPreview">' +
              soonLabelPreviewHtml(card) +
            '</span>' +
            '<label class="pack-upload pack-upload--sm" for="packCardSoonLabel">' +
              '<input type="file" id="packCardSoonLabel" accept="image/*" hidden>' +
              '<span id="packCardSoonLabelBtnText">' + (cardSoonLabelSrc(card) ? 'החלפת תווית' : 'העלאת תווית') + '</span>' +
            '</label>' +
            '<button type="button" class="pack-clear-btn pack-clear-btn--sm" id="packCardSoonLabelClear"' +
              (cardSoonLabelSrc(card) ? '' : ' hidden') + '>לברירת מחדל</button>' +
          '</div>' +
          '<p class="pack-field-sub">העלו תמונת תווית משלכם במקום החותמת. מומלץ PNG עם רקע שקוף.</p>' +
        '</div>' +
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
        '<p class="pack-field-sub">לחצו על הטקסט בקובייה כדי לערוך. גודל וצבע בסרגל הכלים. גודל התמונה משתנה בפינות התצוגה המקדימה.</p>' +
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
          '<label class="pack-upload" for="packCardBgImage" style="margin-top:10px;display:flex;">' +
            '<input type="file" id="packCardBgImage" accept="image/*" hidden>' +
            '<span>' + (card.image ? 'החלפת תמונה' : 'העלאת תמונה') + '</span>' +
          '</label>' +
          '<div class="pack-card-preview" id="packCardImagePreviewWrap"' + (card.image ? '' : ' hidden') + '>' +
            '<div class="pack-card-preview-stage" id="packCardImagePreviewStage">' +
              '<div class="pack-card-preview-clip">' +
                '<div class="pack-card-preview-img" id="packCardImagePreview" title="גררו להזזה · פינות לשינוי גודל"></div>' +
              '</div>' +
              '<div class="pack-card-preview-handles" aria-hidden="true">' +
                '<span class="pack-card-resize pack-card-preview-resize" data-card-preview-resize="nw" title="גררו לשינוי גודל"></span>' +
                '<span class="pack-card-resize pack-card-preview-resize" data-card-preview-resize="n" title="גררו לשינוי גובה"></span>' +
                '<span class="pack-card-resize pack-card-preview-resize" data-card-preview-resize="ne" title="גררו לשינוי גודל"></span>' +
                '<span class="pack-card-resize pack-card-preview-resize" data-card-preview-resize="w" title="גררו לשינוי רוחב"></span>' +
                '<span class="pack-card-resize pack-card-preview-resize" data-card-preview-resize="e" title="גררו לשינוי רוחב"></span>' +
                '<span class="pack-card-resize pack-card-preview-resize" data-card-preview-resize="sw" title="גררו לשינוי גודל"></span>' +
                '<span class="pack-card-resize pack-card-preview-resize" data-card-preview-resize="s" title="גררו לשינוי גובה"></span>' +
                '<span class="pack-card-resize pack-card-preview-resize" data-card-preview-resize="se" title="גררו לשינוי גודל"></span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div id="packCardKeepRatioWrap"' + (card.image ? '' : ' hidden') + '>' +
            '<label class="pack-check-row">' +
              '<input type="checkbox" id="packCardKeepRatio"' + (card.keepRatio !== false ? ' checked' : '') + '>' +
              '<span>פרופורציות</span>' +
            '</label>' +
            '<p class="pack-field-sub">כשהסימון פעיל, גובה ורוחב משתנים יחד. בביטול מופיעות ידיות גם בצלעות, ואפשר למתוח כל ציר בנפרד.</p>' +
          '</div>' +
          '<div class="pack-card-image-actions pack-header-image-actions"' + (card.image ? '' : ' hidden') + '>' +
            '<button type="button" class="pack-clear-btn" id="packCardImageClear"' + (card.image ? '' : ' hidden') + '>הסרת תמונה</button>' +
            '<button type="button" class="pack-reset-btn" id="packCardImageReset"' + (card.image ? '' : ' hidden') + '>איפוס תמונה</button>' +
          '</div>' +
          '<p class="pack-field-sub">התצוגה המקדימה היא העתק מוקטן של הקובייה באתר — אותו יחס ואותו חיתוך. גררו את התמונה כדי להזיז אותה, ואת הקוביות האדומות כדי לשנות גודל. איפוס ממלא את כל שטח הקובייה.</p>' +
        '</div>' +
      '</section>' +

      '<section class="pack-edit-section">' +
        '<div class="pack-edit-section-head">כפתורי פעולה</div>' +
        '<p class="pack-field-sub">במצב עריכה גררו את הכפתורים סביב הקובייה. לכל כפתור יש רולאובר ברירת מחדל במעבר עכבר, ואפשר להעלות רולאובר מותאם במקומו.</p>' +
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
    const soonLabelWrap = root.querySelector('#packCardSoonLabelWrap');
    const soonLabelInput = root.querySelector('#packCardSoonLabel');
    const soonLabelPreview = root.querySelector('#packCardSoonLabelPreview');
    const soonLabelBtnText = root.querySelector('#packCardSoonLabelBtnText');
    const soonLabelClear = root.querySelector('#packCardSoonLabelClear');
    function refreshSoonLabelUi(card) {
      const hasCustom = !!cardSoonLabelSrc(card);
      if (soonLabelWrap) soonLabelWrap.hidden = !(card && card.comingSoon);
      if (soonLabelPreview) {
        soonLabelPreview.classList.toggle('is-custom', hasCustom);
        soonLabelPreview.innerHTML = soonLabelPreviewHtml(card);
      }
      if (soonLabelBtnText) soonLabelBtnText.textContent = hasCustom ? 'החלפת תווית' : 'העלאת תווית';
      if (soonLabelClear) soonLabelClear.hidden = !hasCustom;
    }
    if (comingSoon) {
      comingSoon.addEventListener('change', function () {
        const card = getCard();
        if (!card) return;
        card.comingSoon = comingSoon.checked;
        refreshSoonLabelUi(card);
        renderCards();
      });
    }
    if (soonLabelInput) {
      soonLabelInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        readImageAsDataUrl(file, function (dataUrl) {
          const card = getCard();
          if (!card) return;
          card.comingSoon = true;
          card.comingSoonLabel = dataUrl;
          if (comingSoon) comingSoon.checked = true;
          refreshSoonLabelUi(card);
          renderCards();
        });
        e.target.value = '';
      });
    }
    if (soonLabelClear) {
      soonLabelClear.addEventListener('click', function () {
        const card = getCard();
        if (!card) return;
        card.comingSoonLabel = '';
        refreshSoonLabelUi(card);
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
          setActivePackTarget(null);
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
          setActivePackTarget(null);
        }
        renderCards();
      });
    }
    root.querySelectorAll('input[name="packCardBgMode"]').forEach(function (input) {
      input.addEventListener('change', function () {
        if (!input.checked) return;
        const card = getCard();
        if (!card) return;
        if (input.value === 'image') captureCardBoxHeight(card);
        card.bgMode = normalizeCardBgMode(input.value);
        const colorWrap = root.querySelector('#packCardBgColorWrap');
        const imageWrap = root.querySelector('#packCardBgImageWrap');
        if (colorWrap) colorWrap.hidden = card.bgMode !== 'color';
        if (imageWrap) imageWrap.hidden = card.bgMode !== 'image';
        if (card.bgMode !== 'image' && activePackText && activePackText.role === 'card-image' && activePackText.cardId === cardId) {
          setActivePackTarget(null);
        }
        renderCards();
        if (card.bgMode === 'image') {
          if (card.image) {
            ensureCardImageBox(card, cardLiveEl(card.id));
            syncCardImagePreview(card.id);
          } else {
            const fileInput = root.querySelector('#packCardBgImage');
            if (fileInput) fileInput.click();
          }
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
          captureCardBoxHeight(card);
          card.image = dataUrl;
          card.bgMode = 'image';
          fillCardImage(card);
          renderCards();
          ensureCardImageBox(card, cardLiveEl(card.id));
          syncCardImagePreview(card.id);
        });
        e.target.value = '';
      });
    }
    const bgClear = root.querySelector('#packCardImageClear');
    if (bgClear) {
      bgClear.addEventListener('click', function () {
        const card = getCard();
        if (!card) return;
        card.image = '';
        if (activePackText && activePackText.role === 'card-image' && activePackText.cardId === cardId) {
          setActivePackTarget(null);
        }
        renderCards();
        syncCardImagePreview(cardId);
      });
    }
    const bgReset = root.querySelector('#packCardImageReset');
    if (bgReset) {
      bgReset.addEventListener('click', function () {
        const card = getCard();
        if (!card || !card.image) return;
        fillCardImage(card);
        renderCards();
        if (activePackText && activePackText.role === 'card-image' && activePackText.cardId === cardId) {
          syncPackToolbar();
        }
        syncCardImagePreview(cardId);
      });
    }
    const ratioInput = root.querySelector('#packCardKeepRatio');
    if (ratioInput) {
      ratioInput.addEventListener('change', function () {
        const card = getCard();
        if (!card) return;
        setCardKeepRatio(card, cardLiveEl(card.id), !!ratioInput.checked);
        if (activePackText && activePackText.role === 'card-image' && activePackText.cardId === cardId) {
          syncPackToolbar();
        }
      });
    }
    bindCardPreviewResize(root, cardId);
    syncCardImagePreview(cardId);

    ['view', 'download', 'print'].forEach(function (kind) {
      const check = root.querySelector('[data-action-enabled="' + kind + '"]');
      const href = root.querySelector('[data-action-href="' + kind + '"]');
      const iconInput = root.querySelector('[data-action-icon-input="' + kind + '"]');
      const iconPreview = root.querySelector('[data-action-icon-preview="' + kind + '"]');
      const iconClear = root.querySelector('[data-action-icon-clear="' + kind + '"]');
      const hoverInput = root.querySelector('[data-action-hover-input="' + kind + '"]');
      const hoverPreview = root.querySelector('[data-action-hover-preview="' + kind + '"]');
      const hoverClear = root.querySelector('[data-action-hover-clear="' + kind + '"]');
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
        const hasImage = actionHasCustomIcon(action);
        const hasCustomHover = actionHasCustomHover(action);
        if (iconPreview) {
          iconPreview.classList.toggle('is-visible', hasImage);
          iconPreview.innerHTML = actionIconInnerHtml(action);
        }
        if (iconClear) iconClear.hidden = !hasImage;
        if (hoverPreview) {
          hoverPreview.classList.add('is-visible');
          hoverPreview.classList.toggle('is-default-hover', !hasCustomHover);
          hoverPreview.innerHTML = actionHoverPreviewInnerHtml(action, kind);
        }
        if (hoverClear) hoverClear.hidden = !hasCustomHover;
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
      if (hoverInput) {
        hoverInput.addEventListener('change', function (e) {
          const file = e.target.files && e.target.files[0];
          if (!file) { return; }
          readImageAsDataUrl(file, function (dataUrl) {
            const card = getCard();
            if (card) {
              card.actions[kind].hoverIcon = { type: 'image', value: dataUrl };
              renderCards();
              refreshIconUi(card.actions[kind]);
            }
          });
          e.target.value = '';
        });
      }
      if (hoverClear) {
        hoverClear.addEventListener('click', function () {
          const card = getCard();
          if (card) {
            card.actions[kind].hoverIcon = null;
            renderCards();
            refreshIconUi(card.actions[kind]);
          }
        });
      }
    });
  }

  function cardEditorTitle(card) {
    const title = card && String(card.title || '').trim();
    return title || 'קובייה חדשה';
  }

  function syncOpenCardEditorTitle(cardId, liveTitle) {
    if (!cardId || editingCardId !== cardId) return;
    const ui = els();
    if (!ui.editTitle) return;
    const text = liveTitle != null ? String(liveTitle).trim() : '';
    ui.editTitle.textContent = text || 'קובייה חדשה';
  }

  function openCardEditor(cardId) {
    const card = state.cards.items.find(function (c) { return c.id === cardId; });
    if (!card) return;
    document.querySelectorAll('#packCardsGrid [data-card-text]').forEach(function (el) {
      commitCardInlineText(el);
    });
    openEditor({
      title: cardEditorTitle(card),
      cardId: cardId,
      hint: 'את הטקסט עורכים ישירות על הקובייה. כאן קובעים אם להציג כותרת ותיאור, ואת הרקע והפעולות.',
      fieldsHtml: cardEditorFieldsHtml(card),
      bind: function (root) { bindCardEditorFields(root, cardId); },
    });
  }

  function ensureCardEditor(cardId) {
    if (!cardId || !isPageEditMode()) return;
    if (isEditorOpen() && editingCardId === cardId) return;
    openCardEditor(cardId);
  }

  function bindCardEditorAutoOpen() {
    const ui = els();
    if (!ui.cardsGrid || ui.cardsGrid.dataset.autoEditBound === '1') return;
    ui.cardsGrid.dataset.autoEditBound = '1';
    ui.cardsGrid.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode()) return;
      if (e.button != null && e.button !== 0) return;
      const from = eventEl(e.target);
      if (!from || !from.closest) return;
      if (from.closest('[data-card-delete], [data-card-dup]')) return;
      const cardEl = from.closest('.pack-card');
      if (!cardEl) return;
      ensureCardEditor(cardEl.getAttribute('data-id'));
    }, true);
  }

  function isDockedEditorHostEl(el) {
    return !!(el && el.closest && el.closest(
      '.pack-card, .pack-closing-icon, .pack-closing-text, .pack-dev-team-btn'
    ));
  }

  function isHeaderEditorOpen() {
    return isEditorOpen() && !editingCardId && !editingOverlayId;
  }

  function ensureHeaderEditor() {
    if (!isPageEditMode()) return;
    if (isHeaderEditorOpen()) return;
    openHeaderEditor();
  }

  function isHeaderEditorHostEl(el) {
    return !!(el && el.closest && el.closest('#packHeader') &&
      !el.closest('.pack-header-resize, .pack-header-drop'));
  }

  function bindHeaderEditorAutoOpen() {
    const ui = els();
    if (!ui.header || ui.header.dataset.autoEditBound === '1') return;
    ui.header.dataset.autoEditBound = '1';
    ui.header.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode()) return;
      if (e.button != null && e.button !== 0) return;
      const from = eventEl(e.target);
      if (!from || !from.closest) return;
      if (from.closest('.pack-header-resize, .pack-header-drop')) return;
      ensureHeaderEditor();
    }, true);
  }

  function bindDockedEditorDismiss() {
    if (document.body.dataset.packDockedEditorDismissBound === '1') return;
    document.body.dataset.packDockedEditorDismissBound = '1';
    document.addEventListener('pointerdown', function (e) {
      if (!isPackActive() || !isPageEditMode()) return;
      if (!isEditorOpen()) return;
      if (e.button != null && e.button !== 0) return;
      const el = eventEl(e.target);
      if (!el || !el.closest) return;
      if (isToolbarOrPopoverEl(el)) return;
      if (el.closest('#packEditOverlay, .pack-edit-overlay, #hslaPopover, .hsla-popover')) return;
      if (el.closest('.pack-header-resize')) return;
      if (editingCardId || editingOverlayId) {
        if (isDockedEditorHostEl(el)) return;
      } else if (isHeaderEditorHostEl(el)) {
        return;
      }
      saveEditor();
    }, true);
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

  function cardTitleBase(title) {
    const text = String(title || '').trim() || 'קובייה חדשה';
    const match = text.match(/^(.*)\s*\((\d+)\)\s*$/);
    const base = match ? match[1].trim() : text;
    return base || 'קובייה חדשה';
  }

  function nextDuplicateTitle(sourceTitle) {
    const base = cardTitleBase(sourceTitle);
    let max = 0;
    state.cards.items.forEach(function (card) {
      const title = String(card.title || '').trim();
      if (title === base) return;
      const match = title.match(/^(.*)\s*\((\d+)\)\s*$/);
      if (!match || match[1].trim() !== base) return;
      const n = parseInt(match[2], 10);
      if (Number.isFinite(n) && n > max) max = n;
    });
    const suffix = ' (' + (max + 1) + ')';
    const room = Math.max(1, 40 - suffix.length);
    return (base.slice(0, room) + suffix).slice(0, 40);
  }

  function duplicateCard(cardId) {
    if (isUserMode() || !isPackActive()) return;
    const index = state.cards.items.findIndex(function (c) { return c.id === cardId; });
    if (index < 0) return;
    ensureEditMode();
    const source = state.cards.items[index];
    const raw = cloneState(source);
    delete raw.id;
    raw.title = nextDuplicateTitle(source.title);
    if (isCardsFreeform()) {
      raw.x = clamp(source.x + 4, 0, 100, source.x);
      raw.y = clamp(source.y + 5, 0, 100, source.y);
      raw.freePlaced = true;
    }
    const copy = normalizeCard(raw);
    state.cards.items.splice(index + 1, 0, copy);
    renderCards();
    persistNow();
    openCardEditor(copy.id);
  }

  function removeCard(cardId) {
    if (!window.confirm('להסיר את הקובייה?')) return;
    const wasEditing = editingCardId === cardId;
    state.cards.items = state.cards.items.filter(function (c) { return c.id !== cardId; });
    if (activePackText && activePackText.cardId === cardId) setActivePackTarget(null);
    renderCards();
    persistNow();
    if (wasEditing) closeEditor(false);
  }

  /* ================================================================
     עורך אלמנט חופשי — כפתור / אייקון / טקסט, כל אחד בחלונית משלו
     (כמו קובייה: כותרת = שם הפריט, דוק לפי מיקום, סגירה בלחיצה על המסך)
     ================================================================ */

  function overlayItemById(id) {
    return state.closing.icons.find(function (icon) { return icon.id === id; });
  }

  function overlayEditorTitleText(value, fallback) {
    const text = value != null ? String(value).trim() : '';
    return text || fallback;
  }

  function devTeamEditorTitle() {
    return overlayEditorTitleText(state.closing.label, 'צוות פיתוח');
  }

  function overlayItemEditorTitle(item) {
    if (!item) return 'אלמנט';
    if (item.kind === 'text') return overlayEditorTitleText(item.value, 'טקסט');
    return 'אייקון';
  }

  function syncOpenDevTeamEditorTitle(liveTitle) {
    if (editingOverlayId !== OVERLAY_DEVTEAM_ID) return;
    const ui = els();
    if (ui.editTitle) ui.editTitle.textContent = overlayEditorTitleText(liveTitle, 'צוות פיתוח');
  }

  function syncOpenOverlayItemEditorTitle(itemId, liveTitle) {
    if (!itemId || editingOverlayId !== itemId) return;
    const ui = els();
    if (ui.editTitle) ui.editTitle.textContent = overlayEditorTitleText(liveTitle, 'טקסט');
  }

  function nextOverlayPos() {
    const used = state.closing.icons.map(function (icon) { return icon.x; });
    let x = 18;
    while (used.some(function (u) { return Math.abs(u - x) < 8; }) && x < 80) x += 10;
    return { x: x, y: 58 };
  }

  function addOverlayIcon(dataUrl) {
    const pos = nextOverlayPos();
    const icon = normalizeClosingIcon({
      type: 'image',
      value: dataUrl,
      packAnchored: true,
      x: pos.x,
      y: pos.y,
      size: 48,
    });
    state.closing.icons.push(icon);
    renderClosingIcons();
    persistNow();
    window.setTimeout(function () {
      const el = findOverlayItemEl(icon.id);
      if (el) setActivePackTarget({ el: el, role: 'overlay-icon', itemId: icon.id });
      openOverlayItemEditor(icon.id);
    }, 0);
    return icon;
  }

  function addOverlayText() {
    const pos = nextOverlayPos();
    const icon = normalizeClosingIcon({
      kind: 'text',
      value: 'טקסט',
      packAnchored: true,
      x: pos.x,
      y: pos.y,
      size: 18,
      color: '#222222',
    });
    state.closing.icons.push(icon);
    renderClosingIcons();
    persistNow();
    window.setTimeout(function () {
      openOverlayItemEditor(icon.id);
      const wrap = findOverlayItemEl(icon.id);
      const label = wrap && wrap.querySelector('.pack-closing-text-label');
      if (label) {
        label.focus();
        setActivePackTarget({ el: label, role: 'closing-text', cardId: null, itemId: icon.id });
      }
    }, 0);
    return icon;
  }

  function addDevTeam() {
    if (state.closing.enabled) return;
    ensureEditMode();
    state.closing.enabled = true;
    if (!state.closing.packAnchored) {
      state.closing.x = 88;
      state.closing.y = 78;
      state.closing.packAnchored = true;
    }
    renderClosing();
    persistNow();
    openDevTeamEditor();
  }

  function removeOverlayItem(id) {
    const editingThis = editingOverlayId === id;
    if (id === OVERLAY_DEVTEAM_ID) {
      if (!window.confirm('להסיר את כפתור צוות הפיתוח?')) return;
      state.closing.enabled = false;
      renderClosing();
      persistNow();
      if (editingThis) closeEditor(false);
      return;
    }
    const item = overlayItemById(id);
    if (!item) return;
    const label = item.kind === 'text' ? 'להסיר את הטקסט?' : 'להסיר את האייקון?';
    if (!window.confirm(label)) return;
    state.closing.icons = state.closing.icons.filter(function (icon) { return icon.id !== id; });
    if (activePackText && activePackText.itemId === id) setActivePackTarget(null);
    renderClosingIcons();
    persistNow();
    if (editingThis) closeEditor(false);
  }

  function addClosingIcon(dataUrl) {
    addOverlayIcon(dataUrl);
  }

  function addClosingText() {
    addOverlayText();
  }

  function overlayHrefFieldHtml(id, value) {
    return (
      '<div class="pack-field">' +
        '<label for="' + id + '">קישור (אופציונלי)</label>' +
        '<input type="url" id="' + id + '" dir="ltr" placeholder="https://..." value="' + escapeHtml(value || '') + '">' +
      '</div>'
    );
  }

  function overlayItemEditorFieldsHtml(item) {
    if (item.kind === 'text') {
      return (
        '<section class="pack-edit-section">' +
          overlayHrefFieldHtml('packOverlayItemHref', item.href) +
        '</section>'
      );
    }
    const thumb = item.type === 'image' && item.value
      ? '<img class="pack-logo-thumb" src="' + escapeHtml(item.value) + '" alt="">'
      : '<span class="pack-logo-thumb pack-closing-icon-thumb" aria-hidden="true">' + escapeHtml(item.value) + '</span>';
    return (
      '<section class="pack-edit-section">' +
        '<div class="pack-logo-row pack-closing-icon-row">' +
          '<div class="pack-closing-icon-row-head">' + thumb + '</div>' +
        '</div>' +
        overlayHrefFieldHtml('packOverlayItemHref', item.href) +
        keepRatioCheckHtml('packOverlayKeepRatio', overlayIconKeepsRatio(item)) +
      '</section>'
    );
  }

  function bindOverlayItemEditorFields(root, itemId) {
    const href = root.querySelector('#packOverlayItemHref');
    if (href) {
      href.addEventListener('input', function () {
        const item = overlayItemById(itemId);
        if (!item) return;
        item.href = href.value.slice(0, 600);
        renderClosingIcons();
      });
    }
    const keepInput = root.querySelector('#packOverlayKeepRatio');
    if (keepInput) {
      keepInput.addEventListener('change', function () {
        const item = overlayItemById(itemId);
        if (!item) return;
        setOverlayIconKeepRatio(item, findOverlayItemEl(itemId), !!keepInput.checked);
        persist();
        if (isEditorOpen()) snapshotJSON = JSON.stringify(state);
      });
    }
  }

  function openOverlayItemEditor(itemId) {
    const item = overlayItemById(itemId);
    if (!item) return;
    const isText = item.kind === 'text';
    openEditor({
      title: overlayItemEditorTitle(item),
      overlayId: itemId,
      hint: isText
        ? 'את הטקסט עורכים ישירות על המסך. כאן מוסיפים קישור. צבע וגודל בסרגל הכלים.'
        : 'אפשר לגרור את האייקון לכל מקום במסך, ואת הפינות לשינוי גודל. קו ורוד מופיע כשהיישור תואם לקובייה או לאלמנט אחר.',
      fieldsHtml: overlayItemEditorFieldsHtml(item),
      bind: function (root) { bindOverlayItemEditorFields(root, itemId); },
    });
  }

  function ensureOverlayItemEditor(itemId) {
    if (!itemId || !isPageEditMode()) return;
    if (isEditorOpen() && editingOverlayId === itemId) return;
    openOverlayItemEditor(itemId);
  }

  function devTeamEditorFieldsHtml() {
    const c = state.closing;
    return (
      '<section class="pack-edit-section">' +
        '<div class="pack-field">' +
          '<label for="packClosingLabel">טקסט הכפתור</label>' +
          '<input type="text" id="packClosingLabel" maxlength="40" value="' + escapeHtml(c.label) + '">' +
        '</div>' +
        overlayHrefFieldHtml('packClosingHref', c.href) +
        keepRatioCheckHtml('packDevTeamKeepRatio', devTeamKeepsRatio()) +
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
      '</section>'
    );
  }

  function bindDevTeamEditorFields(root) {
    const label = root.querySelector('#packClosingLabel');
    if (label) {
      label.addEventListener('input', function () {
        state.closing.label = label.value.slice(0, 40) || 'צוות פיתוח';
        renderClosing();
        syncOpenDevTeamEditorTitle(state.closing.label);
      });
    }
    const href = root.querySelector('#packClosingHref');
    if (href) {
      href.addEventListener('input', function () {
        state.closing.href = href.value.slice(0, 600);
        renderClosing();
      });
    }
    const keepInput = root.querySelector('#packDevTeamKeepRatio');
    if (keepInput) {
      keepInput.addEventListener('change', function () {
        const ui = els();
        setDevTeamKeepRatio(ui.devTeamBtn, !!keepInput.checked);
        persist();
        if (isEditorOpen()) snapshotJSON = JSON.stringify(state);
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
  }

  function openDevTeamEditor() {
    if (!state.closing.enabled) return;
    openEditor({
      title: devTeamEditorTitle(),
      overlayId: OVERLAY_DEVTEAM_ID,
      hint: 'אפשר לגרור את הכפתור לכל מקום במסך, ואת הפינות לשינוי גודל. קו ורוד מופיע כשהיישור תואם לקובייה או לאלמנט אחר.',
      fieldsHtml: devTeamEditorFieldsHtml(),
      bind: bindDevTeamEditorFields,
    });
  }

  function ensureDevTeamEditor() {
    if (!isPageEditMode() || !state.closing.enabled) return;
    if (isEditorOpen() && editingOverlayId === OVERLAY_DEVTEAM_ID) return;
    openDevTeamEditor();
  }

  function bindOverlayEditorAutoOpen() {
    if (document.body.dataset.packOverlayEditorBound === '1') return;
    document.body.dataset.packOverlayEditorBound = '1';
    document.addEventListener('pointerdown', function (e) {
      if (!isPackActive() || !isPageEditMode()) return;
      if (e.button != null && e.button !== 0) return;
      const el = eventEl(e.target);
      if (!el || !el.closest) return;
      if (el.closest('[data-overlay-delete]')) return;
      if (el.closest('#packEditOverlay, .pack-edit-overlay')) return;
      const devBtn = el.closest('.pack-dev-team-btn');
      if (devBtn) {
        ensureDevTeamEditor();
        return;
      }
      const item = el.closest('.pack-closing-icon, .pack-closing-text');
      if (!item) return;
      const id = item.getAttribute('data-icon-id');
      if (id) ensureOverlayItemEditor(id);
    }, true);
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
        ensureHeaderEditor();
        setActivePackTarget({ el: row.el, role: row.role, cardId: null });
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
     עריכה ישירה + סרגל הכלים המשותף (גודל/צבע) — לטקסטים ולתמונות במארז.
     כותרת/כותרת משנה, כותרת/תיאור של קובייה, טקסט כפתור צוות הפיתוח,
     ותמונות (רקע כותרת, לוגואים, תמונת קובייה, אייקוני תמונה).
     גודל (ולטקסט גם צבע) נקבעים מסרגל הכלים אחרי לחיצה על הטקסט או התמונה.
     בחירת טקסט נשארת פעילה גם אחרי שהפוקוס עובר לסליידר.
     ================================================================ */

  function eventEl(node) {
    if (!node) return null;
    return node.nodeType === 1 ? node : (node.parentElement || null);
  }

  function isToolbarOrPopoverEl(node) {
    const el = eventEl(node);
    return !!(el && el.closest && el.closest('#siteToolbar, .hsla-popover, #hslaPopover'));
  }

  function packSelectedMarkEl(target) {
    if (!target || !target.el) return null;
    if (target.role === 'closing-text') {
      return (target.el.closest && target.el.closest('.pack-closing-text')) || target.el;
    }
    return target.el;
  }

  function markActivePackTarget() {
    if (!activePackText || !activePackText.el) return;
    const mark = packSelectedMarkEl(activePackText);
    if (mark) mark.classList.add('is-selected');
    if (activePackText.role === 'header-image') {
      const header = document.getElementById('packHeader');
      if (header) header.classList.add('is-image-selected');
    }
  }

  function clearPackImageSelectionClass() {
    const header = document.getElementById('packHeader');
    if (header) header.classList.remove('is-image-selected');
    document.querySelectorAll(
      '.pack-header-logo.is-selected, .pack-header-image.is-selected, .pack-card-photo.is-selected, .pack-card-icon.is-selected, .pack-closing-icon.is-selected, .pack-header-title.is-selected, .pack-header-subtitle.is-selected, .pack-card-title.is-selected, .pack-card-desc.is-selected, .pack-closing-text.is-selected, #packDevTeamLabel.is-selected'
    ).forEach(function (el) {
      el.classList.remove('is-selected');
    });
  }

  function setActivePackTarget(next) {
    clearPackImageSelectionClass();
    activePackText = next && next.el ? next : null;
    markActivePackTarget();
    syncPackToolbar();
  }

  function findElForPackTarget(target) {
    if (!target) return null;
    if (target.role === 'header-title') return document.getElementById('packHeaderTitle');
    if (target.role === 'header-subtitle') return document.getElementById('packHeaderSubtitle');
    if (target.role === 'closing-label') return document.getElementById('packDevTeamLabel');
    if (target.role === 'closing-text' && target.itemId) {
      const wrap = document.querySelector('.pack-closing-text[data-icon-id="' + target.itemId + '"]');
      return wrap ? wrap.querySelector('.pack-closing-text-label') : null;
    }
    if ((target.role === 'card-title' || target.role === 'card-desc') && target.cardId) {
      const field = target.role === 'card-title' ? 'title' : 'desc';
      return document.querySelector('[data-card-text="' + field + '"][data-card-id="' + target.cardId + '"]');
    }
    if (target.role === 'header-image') return document.getElementById('packHeaderImage');
    if (target.role === 'header-logo' && target.itemId) {
      return document.querySelector('.pack-header-logo[data-logo-id="' + target.itemId + '"]');
    }
    if (target.role === 'card-image' && target.cardId) {
      const cardEl = document.querySelector('.pack-card[data-id="' + target.cardId + '"]');
      return cardEl ? cardEl.querySelector('.pack-card-photo') : null;
    }
    if (target.role === 'card-icon' && target.cardId && target.itemId) {
      const cardEl = document.querySelector('.pack-card[data-id="' + target.cardId + '"]');
      return cardEl ? cardEl.querySelector('.pack-card-icon[data-card-icon-id="' + target.itemId + '"]') : null;
    }
    if (target.role === 'overlay-icon' && target.itemId) {
      return document.querySelector('.pack-closing-icon[data-icon-id="' + target.itemId + '"]');
    }
    return target.el && target.el.isConnected ? target.el : null;
  }

  function restoreActivePackTargetEl() {
    if (!activePackText) return;
    const el = findElForPackTarget(activePackText);
    if (!el) {
      setActivePackTarget(null);
      return;
    }
    activePackText.el = el;
    clearPackImageSelectionClass();
    markActivePackTarget();
    syncPackToolbar();
  }

  function hasActivePackText() {
    if (!isPackActive() || !activePackText) return false;
    if (activePackText.el && activePackText.el.isConnected) return true;
    const el = findElForPackTarget(activePackText);
    if (!el) return false;
    activePackText.el = el;
    return true;
  }

  function hasActivePackColor() {
    if (!hasActivePackText()) return false;
    const refs = getPackTextRefs(activePackText);
    return !!(refs && refs.getColor);
  }

  function findCardById(cardId) {
    return state.cards.items.find(function (c) { return c.id === cardId; });
  }

  function syncOpenEditorAttrInputs(attr, id, value) {
    const ui = els();
    if (!ui.editFields || !id) return;
    ui.editFields.querySelectorAll('[' + attr + '="' + id + '"]').forEach(function (el) {
      el.value = String(value);
    });
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
      case 'header-image':
        return {
          min: IMAGE_SCALE_MIN, max: IMAGE_SCALE_MAX,
          getSize: function () { return clampImageScale(state.header.imageScale); },
          setSize: function (v) {
            state.header.imageScale = clampImageScale(v);
            if (headerKeepsRatio()) state.header.imageScaleY = state.header.imageScale;
            return state.header.imageScale;
          },
        };
      case 'card-image': {
        const card = findCardById(target.cardId);
        if (!card) return null;
        return {
          min: IMAGE_SCALE_MIN, max: IMAGE_SCALE_MAX,
          getSize: function () { return clampImageScale(card.imageScale); },
          setSize: function (v) {
            card.imageScale = clampImageScale(v);
            if (cardKeepsRatio(card)) card.imageScaleY = card.imageScale;
            return card.imageScale;
          },
        };
      }
      case 'header-logo': {
        const logo = state.header.logos.find(function (l) { return l.id === target.itemId; });
        if (!logo) return null;
        return {
          min: LOGO_SIZE_MIN, max: LOGO_SIZE_MAX,
          getSize: function () { return clampLogoSize(logo.size); },
          setSize: function (v) { logo.size = clampLogoSize(v); return logo.size; },
        };
      }
      case 'card-icon': {
        const card = findCardById(target.cardId);
        const icon = card && (card.icons || []).find(function (i) { return i.id === target.itemId; });
        if (!icon) return null;
        return {
          min: CARD_ICON_SIZE_MIN, max: CARD_ICON_SIZE_MAX,
          getSize: function () { return clampCardIconSize(icon.size); },
          setSize: function (v) { icon.size = clampCardIconSize(v); return icon.size; },
        };
      }
      case 'overlay-icon': {
        const item = state.closing.icons.find(function (i) { return i.id === target.itemId; });
        if (!item || item.kind === 'text') return null;
        return {
          min: CLOSING_ICON_SIZE_MIN, max: CLOSING_ICON_SIZE_MAX,
          getSize: function () { return clampClosingIconSize(item.size); },
          setSize: function (v) {
            item.size = clampClosingIconSize(v);
            if (overlayIconKeepsRatio(item)) item.sizeY = item.size;
            return item.size;
          },
        };
      }
      default:
        return null;
    }
  }

  function applyPackTextLiveStyle(target, size, color) {
    if (!target || !target.el) return;
    if (target.role === 'header-image') {
      const header = document.getElementById('packHeader');
      if (header && size != null) {
        header.style.setProperty('--pack-header-image-scale', String(size / 100));
        header.style.setProperty('--pack-header-image-scale-y', String(headerImageScaleY() / 100));
      }
      syncHeaderImagePreview();
      return;
    }
    if (target.role === 'card-image') {
      const card = findCardById(target.cardId);
      const cardEl = target.el && target.el.closest ? target.el.closest('.pack-card') : document.querySelector('.pack-card[data-id="' + target.cardId + '"]');
      if (card && cardEl) applyCardImageScaleStyle(card, cardEl);
      return;
    }
    if (target.role === 'header-logo') {
      if (size != null) {
        target.el.style.setProperty('--lsize', size + 'px');
        syncOpenEditorAttrInputs('data-logo-size', target.itemId, size);
      }
      return;
    }
    if (target.role === 'card-icon') {
      if (size != null) {
        target.el.style.setProperty('--isize', size + 'px');
        syncOpenEditorAttrInputs('data-card-icon-size', target.itemId, size);
      }
      return;
    }
    if (target.role === 'overlay-icon') {
      if (size != null) {
        const item = overlayItemById(target.itemId);
        if (item) applyOverlayIconSizeStyle(item, target.el);
        else target.el.style.setProperty('--csize', size + 'px');
        syncOpenEditorAttrInputs('data-icon-size', target.itemId, size);
      }
      return;
    }
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
    const lockWrap = document.getElementById('packScaleLockWrap');
    const lockInput = document.getElementById('packScaleLock');
    const sizeControl = document.getElementById('inlineTextSizeControl');
    if (!isPackActive()) {
      if (sizeControl) sizeControl.classList.remove('is-visual-scale');
      if (lockWrap) lockWrap.hidden = true;
      return;
    }
    const colorField = document.getElementById('inlineTextColorPicker');
    const sizeRange = document.getElementById('inlineTextSize');
    const sizeNum = document.getElementById('inlineTextSizeNum');
    const refs = hasActivePackText() ? getPackTextRefs(activePackText) : null;
    const canColor = !!(refs && refs.getColor);
    const canSize = !!refs;
    const visual = !!(activePackText && isPackImageRole(activePackText.role));
    const cardImage = !!(activePackText && activePackText.role === 'card-image' && activePackText.cardId);
    const card = cardImage && isPageEditMode() ? findCardById(activePackText.cardId) : null;

    if (colorField) {
      colorField.classList.toggle('is-disabled', !canColor);
      const swatch = colorField.querySelector('.hsla-swatch');
      if (swatch) swatch.setAttribute('aria-disabled', canColor ? 'false' : 'true');
      if (canColor && window.HebetColor) window.HebetColor.setHslaFieldValue('inlineTextColor', refs.getColor());
    }
    if (sizeControl && sizeRange) {
      sizeControl.classList.toggle('is-disabled', !canSize);
      sizeControl.classList.toggle('is-visual-scale', visual);
      sizeRange.disabled = !canSize;
      if (sizeNum) sizeNum.disabled = !canSize;
      sizeControl.title = visual
        ? 'גודל התמונה שנבחרה'
        : (activePackText && isPackTextRole(activePackText.role) ? 'גודל הטקסט שנבחר' : 'גודל טקסט או תמונה שנבחרו');
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
    if (lockWrap) {
      lockWrap.hidden = !card;
      if (lockInput && card) lockInput.checked = cardKeepsRatio(card);
    }
  }

  function applyPackInlineColor(hex) {
    if (activePackText && (!activePackText.el || !activePackText.el.isConnected)) restoreActivePackTargetEl();
    if (!hasActivePackText()) return;
    const refs = getPackTextRefs(activePackText);
    if (!refs || !refs.setColor) return;
    refs.setColor(hex);
    applyPackTextLiveStyle(activePackText, null, hex);
    persist();
    if (isEditorOpen()) snapshotJSON = JSON.stringify(state);
    if (window.HebetColor) window.HebetColor.setHslaFieldValue('inlineTextColor', hex);
  }

  function applyPackInlineSize(rawSize) {
    if (activePackText && (!activePackText.el || !activePackText.el.isConnected)) restoreActivePackTargetEl();
    if (!hasActivePackText()) return;
    const refs = getPackTextRefs(activePackText);
    if (!refs) return;
    const sizeRange = document.getElementById('inlineTextSize');
    const sizeNum = document.getElementById('inlineTextSizeNum');
    const numFocused = !!(sizeNum && document.activeElement === sizeNum);
    if (numFocused) {
      const typed = Number(rawSize);
      if (!Number.isFinite(typed) || typed < refs.min || typed > refs.max) return;
    }
    const size = refs.setSize(rawSize);
    applyPackTextLiveStyle(activePackText, size, null);
    persist();
    if (isEditorOpen()) snapshotJSON = JSON.stringify(state);
    if (sizeRange) sizeRange.value = String(size);
    if (sizeNum) sizeNum.value = String(size);
  }

  function scheduleClearActivePackText() {
    // בחירת טקסט נשארת אחרי blur כדי שהסליידר ישפיע על הטקסט שנלחץ.
  }

  function bindHslaPopoverObserver() {
    const pop = document.getElementById('hslaPopover');
    if (!pop || pop.dataset.packPopoverBound === '1') return;
    pop.dataset.packPopoverBound = '1';
  }

  window.HebetPackText = {
    hasActiveText: hasActivePackText,
    hasActiveColor: hasActivePackColor,
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
    if (field === 'title') {
      card.title = value.slice(0, 40) || 'קובייה חדשה';
      syncOpenCardEditorTitle(cardId, card.title);
    } else {
      card.desc = value.slice(0, 140);
    }
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
      ensureCardEditor(t.cardId);
      setActivePackTarget({ el: t.el, role: t.field === 'title' ? 'card-title' : 'card-desc', cardId: t.cardId });
    });
    ui.cardsGrid.addEventListener('input', function (e) {
      const t = targetOf(e);
      if (!t || t.field !== 'title') return;
      syncOpenCardEditorTitle(t.cardId, String(t.el.textContent || '').slice(0, 40));
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
    if (isEditorOpen()) {
      snapshotJSON = JSON.stringify(state);
      syncOpenDevTeamEditorTitle(state.closing.label);
      const input = document.getElementById('packClosingLabel');
      if (input && document.activeElement !== input) input.value = state.closing.label;
    }
  }

  function commitClosingElementText(label) {
    const wrap = label && label.closest ? label.closest('.pack-closing-text') : null;
    const id = wrap && wrap.getAttribute('data-icon-id');
    const item = id ? overlayItemById(id) : null;
    if (!item || item.kind !== 'text') return;
    item.value = String(label.textContent || '').trim().slice(0, 80) || 'טקסט';
    if (document.activeElement !== label) label.textContent = item.value;
    persist();
    if (isEditorOpen()) {
      snapshotJSON = JSON.stringify(state);
      syncOpenOverlayItemEditorTitle(id, item.value);
    }
  }

  function bindInlineClosingText() {
    const ui = els();
    bindInlineDevTeamText();
    const host = ui.overlayItems || ui.closingItems || ui.workspace;
    if (!host || host.dataset.textBound === '1') return;
    host.dataset.textBound = '1';

    host.addEventListener('focusin', function (e) {
      if (!isPageEditMode()) return;
      const label = e.target.closest ? e.target.closest('.pack-closing-text-label') : null;
      if (!label || !host.contains(label)) return;
      const wrap = label.closest('.pack-closing-text');
      const id = wrap && wrap.getAttribute('data-icon-id');
      if (!id) return;
      ensureOverlayItemEditor(id);
      setActivePackTarget({ el: label, role: 'closing-text', cardId: null, itemId: id });
    });
    host.addEventListener('input', function (e) {
      const label = e.target.classList && e.target.classList.contains('pack-closing-text-label') ? e.target : null;
      if (!label) return;
      const wrap = label.closest('.pack-closing-text');
      const id = wrap && wrap.getAttribute('data-icon-id');
      if (id) syncOpenOverlayItemEditorTitle(id, String(label.textContent || '').slice(0, 80));
    });
    host.addEventListener('focusout', function (e) {
      const label = e.target.classList && e.target.classList.contains('pack-closing-text-label') ? e.target : null;
      if (!label) return;
      commitClosingElementText(label);
      scheduleClearActivePackText(label);
    });
    host.addEventListener('keydown', function (e) {
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

  function bindInlineDevTeamText() {
    const ui = els();
    if (!ui.devTeamLabel || ui.devTeamLabel.dataset.packInlineBound === '1') return;
    ui.devTeamLabel.dataset.packInlineBound = '1';
    ui.devTeamLabel.addEventListener('focus', function () {
      if (!isPageEditMode() || !state.closing.enabled) return;
      ensureDevTeamEditor();
      setActivePackTarget({ el: ui.devTeamLabel, role: 'closing-label', cardId: null });
    });
    ui.devTeamLabel.addEventListener('input', function () {
      const text = String(ui.devTeamLabel.textContent || '').slice(0, 40);
      syncOpenDevTeamEditorTitle(text);
      const input = document.getElementById('packClosingLabel');
      if (input && document.activeElement !== input) input.value = text;
    });
    ui.devTeamLabel.addEventListener('blur', function () {
      commitClosingInlineText();
      scheduleClearActivePackText(ui.devTeamLabel);
    });
    ui.devTeamLabel.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); ui.devTeamLabel.blur(); }
      if (e.key === 'Escape') { e.preventDefault(); ui.devTeamLabel.textContent = state.closing.label; ui.devTeamLabel.blur(); }
    });
  }

  /* ---------- גרירה חופשית: לוגואים בכותרת ---------- */

  function bindLogoDragging() {
    const ui = els();
    if (!ui.headerLogos || ui.headerLogos.dataset.bound === '1') return;
    ui.headerLogos.dataset.bound = '1';

    ui.headerLogos.addEventListener('click', function (e) {
      const el = eventEl(e.target);
      const logo = el && el.closest ? el.closest('.pack-header-logo') : null;
      if (!logo) return;
      if (isPageEditMode() || logo.getAttribute('data-has-href') !== '1') {
        e.preventDefault();
      }
    });

    ui.headerLogos.addEventListener('pointerdown', function (e) {
      const from = eventEl(e.target);
      const img = from && from.closest ? from.closest('.pack-header-logo') : null;
      if (!img || !isPageEditMode()) return;
      const id = img.getAttribute('data-logo-id');
      const logo = state.header.logos.find(function (l) { return l.id === id; });
      if (!logo) return;
      e.preventDefault();
      const canvas = ui.header;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      img.classList.add('is-dragging');
      img.setPointerCapture(e.pointerId);

      function onMove(ev) {
        let x = clamp(((ev.clientX - rect.left) / rect.width) * 100, 0, 100, logo.x);
        let y = clamp(((ev.clientY - rect.top) / rect.height) * 100, 0, 100, logo.y);
        const entries = logoSnapEntries(logo, img, rect);
        const thX = (12 / rect.width) * 100;
        const thY = (12 / rect.height) * 100;
        const hitX = nearestSnapEntry(x, entries.xs, thX);
        const hitY = nearestSnapEntry(y, entries.ys, thY);
        let lineX = null;
        let lineY = null;
        if (hitX && hitX.value >= 0 && hitX.value <= 100) {
          x = hitX.value;
          lineX = hitX.line;
        }
        if (hitY && hitY.value >= 0 && hitY.value <= 100) {
          y = hitY.value;
          lineY = hitY.line;
        }
        logo.x = x;
        logo.y = y;
        img.style.setProperty('--lx', logo.x + '%');
        img.style.setProperty('--ly', logo.y + '%');

        const xPeers = [x].concat(state.header.logos.filter(function (item) {
          return item.id !== logo.id && lineY != null && Math.abs(item.y - y) < 0.05;
        }).map(function (item) { return item.x; }));
        const yPeers = [y].concat(state.header.logos.filter(function (item) {
          return item.id !== logo.id && lineX != null && Math.abs(item.x - x) < 0.05;
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
        img.classList.remove('is-dragging');
        clearCardGuides(canvas);
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
      const from = eventEl(e.target);
      if (!from || !from.closest) return;
      if (from.closest('.pack-section-edit, .pack-header-resize, .pack-header-logo, .pack-header-drop')) return;
      const el = from.closest('#packHeaderTitle, #packHeaderSubtitle');
      if (!el || el.hidden) return;
      setActivePackTarget({
        el: el,
        role: el.id === 'packHeaderTitle' ? 'header-title' : 'header-subtitle',
        cardId: null,
      });
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

  function logoSnapEntries(skipLogo, dragEl, canvasRect) {
    const dragHw = canvasRect.width ? (dragEl.offsetWidth / 2 / canvasRect.width) * 100 : 0;
    const dragHh = canvasRect.height ? (dragEl.offsetHeight / 2 / canvasRect.height) * 100 : 0;
    const xs = [{ value: 50, line: 50 }];
    const ys = [{ value: 50, line: 50 }];
    state.header.logos.forEach(function (item) {
      if (item.id === skipLogo.id) return;
      const el = document.querySelector('.pack-header-logo[data-logo-id="' + item.id + '"]');
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
    const host = ui.overlayItems || ui.closingItems;
    const workspace = ui.workspace;
    if (!host || !workspace || host.dataset.dragBound === '1') return;
    host.dataset.dragBound = '1';

    host.addEventListener('click', function (e) {
      const del = e.target.closest ? e.target.closest('[data-overlay-delete]') : null;
      if (del) {
        e.preventDefault();
        e.stopPropagation();
        removeOverlayItem(del.getAttribute('data-overlay-delete'));
        return;
      }
      const item = e.target.closest ? e.target.closest('.pack-closing-icon, .pack-closing-text') : null;
      if (!item) return;
      if (isPageEditMode()) {
        e.preventDefault();
        e.stopPropagation();
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

    host.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode()) return;
      if (e.target.closest && e.target.closest('[data-overlay-delete], [data-overlay-resize]')) return;
      const focusedText = e.target.closest && e.target.closest('.pack-closing-text-label');
      if (focusedText && document.activeElement === focusedText) return;
      if (e.button != null && e.button !== 0) return;
      const iconEl = e.target.closest ? e.target.closest('.pack-closing-icon, .pack-closing-text') : null;
      if (!iconEl) return;
      const id = iconEl.getAttribute('data-icon-id');
      const pos = state.closing.icons.find(function (item) { return item.id === id; });
      if (!pos) return;
      if (iconEl.classList.contains('pack-closing-text')) {
        const label = iconEl.querySelector('.pack-closing-text-label');
        if (label) setActivePackTarget({ el: label, role: 'closing-text', cardId: null, itemId: id });
      }

      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;
      const rect = workspace.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      iconEl.classList.add('is-dragging');
      try { iconEl.setPointerCapture(e.pointerId); } catch (_) {}

      function onMove(ev) {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) moved = true;
        if (!moved) return;
        let x = clampPackOverlayDragPercent(
          ((ev.clientX - rect.left) / rect.width) * 100,
          iconEl.offsetWidth,
          rect.width,
          pos.x
        );
        let y = clampPackOverlayDragPercent(
          ((ev.clientY - rect.top) / rect.height) * 100,
          iconEl.offsetHeight,
          rect.height,
          pos.y
        );
        const entries = packOverlaySnapEntries(iconEl, iconEl, rect);
        const thX = (PACK_SNAP_PX / rect.width) * 100;
        const thY = (PACK_SNAP_PX / rect.height) * 100;
        const hitX = nearestSnapEntry(x, entries.xs, thX);
        const hitY = nearestSnapEntry(y, entries.ys, thY);
        let lineX = null;
        let lineY = null;
        if (hitX) {
          x = hitX.value;
          lineX = hitX.line;
        }
        if (hitY) {
          y = hitY.value;
          lineY = hitY.line;
        }
        pos.x = x;
        pos.y = y;
        pos.packAnchored = true;
        iconEl.style.setProperty('--cx', pos.x + '%');
        iconEl.style.setProperty('--cy', pos.y + '%');
        if (isEditorOpen() && editingOverlayId === id) syncEditorDockSide({ live: true });
        renderCardGuides(
          workspace,
          lineX,
          lineY,
          { start: -8, size: 116 },
          { start: -8, size: 116 }
        );
      }
      function onUp(ev) {
        iconEl.classList.remove('is-dragging');
        clearCardGuides(workspace);
        try { iconEl.releasePointerCapture(ev.pointerId); } catch (_) {}
        iconEl.removeEventListener('pointermove', onMove);
        iconEl.removeEventListener('pointerup', onUp);
        iconEl.removeEventListener('pointercancel', onUp);
        if (!moved && iconEl.classList.contains('pack-closing-text')) {
          const label = iconEl.querySelector('.pack-closing-text-label');
          if (label) label.focus();
        }
        if (!moved && iconEl.classList.contains('pack-closing-icon')) {
          setActivePackTarget({ el: iconEl, role: 'overlay-icon', itemId: id });
        }
        if (!isEditorOpen()) persist();
        else if (editingOverlayId === id) syncEditorDockSide();
      }
      iconEl.addEventListener('pointermove', onMove);
      iconEl.addEventListener('pointerup', onUp);
      iconEl.addEventListener('pointercancel', onUp);
    });
  }

  function clampPackOverlayDragPercent(value, elSizePx, axisPx, fallback) {
    const overflowPx = Math.min(220, Math.max(80, elSizePx * 0.55));
    const padPx = elSizePx / 2 - overflowPx;
    const pad = axisPx ? (padPx / axisPx) * 100 : 0;
    const min = Math.max(PACK_OVERLAY_POS_MIN, pad);
    const max = Math.min(PACK_OVERLAY_POS_MAX, 100 - pad);
    return clamp(value, min, max, fallback);
  }

  function packOverlaySnapEntries(skipEl, dragEl, workspaceRect) {
    const dragHw = workspaceRect.width ? (dragEl.offsetWidth / 2 / workspaceRect.width) * 100 : 0;
    const dragHh = workspaceRect.height ? (dragEl.offsetHeight / 2 / workspaceRect.height) * 100 : 0;
    const xs = [
      { value: 0, line: 0 },
      { value: 50, line: 50 },
      { value: 100, line: 100 },
    ];
    const ys = [
      { value: 0, line: 0 },
      { value: 50, line: 50 },
      { value: 100, line: 100 },
    ];

    function addEl(el) {
      if (!el || el === skipEl || el.hidden) return;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      const cx = ((r.left + r.width / 2 - workspaceRect.left) / workspaceRect.width) * 100;
      const cy = ((r.top + r.height / 2 - workspaceRect.top) / workspaceRect.height) * 100;
      const left = ((r.left - workspaceRect.left) / workspaceRect.width) * 100;
      const right = ((r.right - workspaceRect.left) / workspaceRect.width) * 100;
      const top = ((r.top - workspaceRect.top) / workspaceRect.height) * 100;
      const bottom = ((r.bottom - workspaceRect.top) / workspaceRect.height) * 100;
      xs.push({ value: cx, line: cx });
      ys.push({ value: cy, line: cy });
      xs.push({ value: left + dragHw, line: left });
      xs.push({ value: right - dragHw, line: right });
      ys.push({ value: top + dragHh, line: top });
      ys.push({ value: bottom - dragHh, line: bottom });
    }

    const nodes = document.querySelectorAll(
      '.pack-card, .pack-closing-icon, .pack-closing-text, .pack-header-title, .pack-header-subtitle, .pack-header-logo, .pack-dev-team-btn'
    );
    for (let i = 0; i < nodes.length; i++) addEl(nodes[i]);
    return { xs: xs, ys: ys };
  }

  function bindDevTeamDragging() {
    const ui = els();
    const btn = ui.devTeamBtn;
    const workspace = ui.workspace;
    if (!btn || !workspace || btn.dataset.dragBound === '1') return;
    btn.dataset.dragBound = '1';

    btn.addEventListener('click', function (e) {
      const del = e.target.closest ? e.target.closest('[data-overlay-delete]') : null;
      if (del) {
        e.preventDefault();
        e.stopPropagation();
        removeOverlayItem(del.getAttribute('data-overlay-delete'));
        return;
      }
      if (isPageEditMode()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (!state.closing.href) e.preventDefault();
    });

    btn.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode() || !state.closing.enabled) return;
      if (e.target.id === 'packDevTeamLabel') return;
      if (e.target.closest && e.target.closest('[data-overlay-delete], [data-overlay-resize]')) return;
      if (e.button != null && e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      let moved = false;
      const rect = workspace.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      ensureDevTeamPackAnchor();
      btn.classList.add('is-dragging');
      try { btn.setPointerCapture(e.pointerId); } catch (_) {}

      function onMove(ev) {
        if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) moved = true;
        if (!moved) return;
        let x = clampPackOverlayDragPercent(
          ((ev.clientX - rect.left) / rect.width) * 100,
          btn.offsetWidth,
          rect.width,
          state.closing.x
        );
        let y = clampPackOverlayDragPercent(
          ((ev.clientY - rect.top) / rect.height) * 100,
          btn.offsetHeight,
          rect.height,
          state.closing.y
        );
        const entries = packOverlaySnapEntries(btn, btn, rect);
        const thX = (PACK_SNAP_PX / rect.width) * 100;
        const thY = (PACK_SNAP_PX / rect.height) * 100;
        const hitX = nearestSnapEntry(x, entries.xs, thX);
        const hitY = nearestSnapEntry(y, entries.ys, thY);
        let lineX = null;
        let lineY = null;
        if (hitX) {
          x = hitX.value;
          lineX = hitX.line;
        }
        if (hitY) {
          y = hitY.value;
          lineY = hitY.line;
        }
        state.closing.x = x;
        state.closing.y = y;
        state.closing.packAnchored = true;
        btn.style.setProperty('--cx', state.closing.x + '%');
        btn.style.setProperty('--cy', state.closing.y + '%');
        if (isEditorOpen() && editingOverlayId === OVERLAY_DEVTEAM_ID) syncEditorDockSide({ live: true });

        renderCardGuides(
          workspace,
          lineX,
          lineY,
          { start: -8, size: 116 },
          { start: -8, size: 116 }
        );
      }
      function onUp(ev) {
        btn.classList.remove('is-dragging');
        clearCardGuides(workspace);
        try { btn.releasePointerCapture(ev.pointerId); } catch (_) {}
        btn.removeEventListener('pointermove', onMove);
        btn.removeEventListener('pointerup', onUp);
        btn.removeEventListener('pointercancel', onUp);
        if (!isEditorOpen()) persist();
        else if (editingOverlayId === OVERLAY_DEVTEAM_ID) syncEditorDockSide();
      }
      btn.addEventListener('pointermove', onMove);
      btn.addEventListener('pointerup', onUp);
      btn.addEventListener('pointercancel', onUp);
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
      const from = eventEl(e.target);
      if (!from || !from.closest) return;
      const cardEl = from.closest('.pack-card');
      if (!cardEl) return;
      const card = state.cards.items.find(function (item) { return item.id === cardEl.getAttribute('data-id'); });
      if (!card) return;

      const iconEl = from.closest('.pack-card-icon');
      const actionEl = !iconEl ? from.closest('.pack-card-action') : null;
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

  function bindCardCornerResize() {
    const ui = els();
    if (!ui.cardsGrid || ui.cardsGrid.dataset.cardResizeBound === '1') return;
    ui.cardsGrid.dataset.cardResizeBound = '1';

    ui.cardsGrid.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode() || !isCardsFreeform()) return;
      if (e.button != null && e.button !== 0) return;
      const from = eventEl(e.target);
      const handle = from && from.closest ? from.closest('[data-card-resize]') : null;
      if (!handle) return;
      const cardEl = handle.closest('.pack-card');
      if (!cardEl) return;
      const card = state.cards.items.find(function (item) { return item.id === cardEl.getAttribute('data-id'); });
      if (!card) return;

      e.preventDefault();
      e.stopPropagation();

      const corner = handle.getAttribute('data-card-resize') || 'se';
      const rect = cardEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const xSign = corner.indexOf('e') >= 0 ? 1 : (corner.indexOf('w') >= 0 ? -1 : 0);
      const ySign = corner.indexOf('s') >= 0 ? 1 : (corner.indexOf('n') >= 0 ? -1 : 0);

      cardEl.classList.add('is-resizing');
      try { handle.setPointerCapture(e.pointerId); } catch (_) {}
      if (card.bgMode === 'image' && card.image) {
        const photo = cardEl.querySelector('.pack-card-photo');
        if (photo) setActivePackTarget({ el: photo, role: 'card-image', cardId: card.id });
      }

      function sizeFromPointer(ev) {
        if (xSign) {
          const widthPx = Math.max(40, Math.max(24, xSign * (ev.clientX - cx)) * 2);
          card.w = clampFreeWidth((widthPx / CARD_BOX_BASE_PX) * 18);
          cardEl.style.setProperty('--cw', String(card.w));
        }
        if (ySign) {
          const heightPx = Math.max(CARD_BOX_H_MIN, Math.max(24, ySign * (ev.clientY - cy)) * 2);
          card.h = clampCardBoxHeight(heightPx);
          cardEl.style.setProperty('--ch', card.h + 'px');
        }
        if (isEditorOpen() && editingCardId === card.id) {
          syncCardPreviewFrame(card.id);
          syncEditorDockSide({ live: true });
        }
      }

      function onMove(ev) { sizeFromPointer(ev); }
      function onUp(ev) {
        cardEl.classList.remove('is-resizing');
        try { handle.releasePointerCapture(ev.pointerId); } catch (_) {}
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
        if (!isEditorOpen()) persist();
        else if (editingCardId === card.id) syncEditorDockSide();
      }
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    }, true);
  }

  function bindOverlayCornerResize() {
    if (document.body.dataset.packOverlayResizeBound === '1') return;
    document.body.dataset.packOverlayResizeBound = '1';
    document.addEventListener('pointerdown', function (e) {
      if (!isPackActive() || !isPageEditMode()) return;
      if (e.button != null && e.button !== 0) return;
      const from = eventEl(e.target);
      const handle = from && from.closest ? from.closest('[data-overlay-resize]') : null;
      if (!handle) return;
      const iconEl = handle.closest('.pack-closing-icon');
      const btnEl = handle.closest('.pack-dev-team-btn');
      const host = iconEl || btnEl;
      if (!host) return;

      e.preventDefault();
      e.stopPropagation();

      const corner = handle.getAttribute('data-overlay-resize') || 'se';
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const xSign = corner.indexOf('e') >= 0 ? 1 : (corner.indexOf('w') >= 0 ? -1 : 0);
      const ySign = corner.indexOf('s') >= 0 ? 1 : (corner.indexOf('n') >= 0 ? -1 : 0);
      const startW = rect.width;
      const startH = rect.height;
      const startRatio = startH ? startW / startH : 1;

      let iconItem = null;
      let overlayId = OVERLAY_DEVTEAM_ID;
      let startSize;
      if (iconEl) {
        overlayId = iconEl.getAttribute('data-icon-id');
        iconItem = overlayItemById(overlayId);
        if (!iconItem || iconItem.kind === 'text') return;
        startSize = clampClosingIconSize(iconItem.size);
        setActivePackTarget({ el: iconEl, role: 'overlay-icon', itemId: overlayId });
      } else {
        if (!state.closing.enabled) return;
        startSize = clampDevTeamSize(state.closing.size);
      }

      host.classList.add('is-resizing');
      try { handle.setPointerCapture(e.pointerId); } catch (_) {}

      function sizeFromPointer(ev) {
        const keep = iconItem ? overlayIconKeepsRatio(iconItem) : devTeamKeepsRatio();
        const lockRatio = keep && xSign && ySign;
        if (!lockRatio && keep) {
          if (iconItem) {
            setOverlayIconKeepRatio(iconItem, host, false);
            syncOpenKeepRatioInput('packOverlayKeepRatio', false);
          } else {
            setDevTeamKeepRatio(host, false);
            syncOpenKeepRatioInput('packDevTeamKeepRatio', false);
          }
        }

        if (iconItem) {
          if (lockRatio) {
            const fromX = Math.max(4, xSign * (ev.clientX - cx)) * 2;
            const fromY = Math.max(4, ySign * (ev.clientY - cy)) * 2 * startRatio;
            const dim = Math.max(fromX, fromY);
            iconItem.size = clampClosingIconSize(dim);
            iconItem.sizeY = iconItem.size;
          } else {
            if (xSign) {
              iconItem.size = clampClosingIconSize(Math.max(4, xSign * (ev.clientX - cx)) * 2);
            }
            if (ySign) {
              iconItem.sizeY = clampClosingIconSize(Math.max(4, ySign * (ev.clientY - cy)) * 2);
            }
          }
          applyOverlayIconSizeStyle(iconItem, host);
          if (activePackText && activePackText.role === 'overlay-icon' && activePackText.itemId === iconItem.id) {
            syncPackToolbar();
          }
        } else {
          if (lockRatio) {
            const fromX = Math.max(4, xSign * (ev.clientX - cx)) * 2;
            const fromY = Math.max(4, ySign * (ev.clientY - cy)) * 2;
            const dim = Math.max(fromX, fromY);
            state.closing.size = clampDevTeamSize((dim / startW) * startSize);
            state.closing.sizeY = state.closing.size;
          } else {
            if (xSign) {
              const widthPx = Math.max(36, xSign * (ev.clientX - cx) * 2);
              state.closing.boxW = clampDevTeamBox(widthPx, startW);
              state.closing.size = clampDevTeamSize((state.closing.boxW / 148) * 100);
            }
            if (ySign) {
              const heightPx = Math.max(24, ySign * (ev.clientY - cy) * 2);
              state.closing.boxH = clampDevTeamBox(heightPx, startH);
              state.closing.sizeY = clampDevTeamSize((state.closing.boxH / 42) * 100);
            }
          }
          applyDevTeamScaleStyle(host);
        }
        if (isEditorOpen() && editingOverlayId === overlayId) syncEditorDockSide({ live: true });
      }

      function onMove(ev) { sizeFromPointer(ev); }
      function onUp(ev) {
        host.classList.remove('is-resizing');
        try { handle.releasePointerCapture(ev.pointerId); } catch (_) {}
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
        if (!isEditorOpen()) persist();
        else if (editingOverlayId === overlayId) syncEditorDockSide();
      }
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    }, true);
  }

  function bindCardsFreeformDrag() {
    const ui = els();
    if (!ui.cardsGrid || ui.cardsGrid.dataset.dragBound === '1') return;
    ui.cardsGrid.dataset.dragBound = '1';

    ui.cardsGrid.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode() || !isCardsFreeform()) return;
      if (e.button != null && e.button !== 0) return;
      const from = eventEl(e.target);
      if (!from || !from.closest) return;
      if (from.closest('[data-card-dup], [data-card-delete], .pack-card-action, button, .pack-cards-resize, [data-card-text], .pack-card-icon, [data-card-resize]')) {
        return; // אפשרו לחיצה לעריכת טקסט הקובייה (כותרת/תיאור) במקום גרירה
      }
      const cardEl = from.closest('.pack-card');
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
        if (isEditorOpen() && editingCardId === card.id) syncEditorDockSide({ live: true });

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
        else if (editingCardId === card.id) syncEditorDockSide();
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

  /* ---------- גרירה של תמונת הכותרת (מיקום) + זום מסרגל הכלים ---------- */

  function applyHeaderImagePosLive() {
    const header = document.getElementById('packHeader');
    if (header) {
      header.style.setProperty('--pack-header-image-x', clampImagePos(state.header.imageX) + '%');
      header.style.setProperty('--pack-header-image-y', clampImagePos(state.header.imageY) + '%');
    }
    syncHeaderImagePreview();
  }

  function bindHeaderImagePan() {
    const img = document.getElementById('packHeaderImage');
    if (!img || img.dataset.panBound === '1') return;
    img.dataset.panBound = '1';
    img.setAttribute('title', 'לחצו לבחירה · גררו להזזה · גודל בסרגל הכלים');

    img.addEventListener('pointerdown', function (e) {
      if (!isPackActive() || !isPageEditMode()) return;
      if (e.button != null && e.button !== 0) return;
      if (state.header.mode !== 'image' || !state.header.image || isHeaderHidden()) return;
      const header = document.getElementById('packHeader');
      const rect = header && header.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const origX = clampImagePos(state.header.imageX);
      const origY = clampImagePos(state.header.imageY);
      let moved = false;

      try { img.setPointerCapture(e.pointerId); } catch (_) {}
      img.classList.add('is-dragging');

      function onMove(ev) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
        moved = true;
        state.header.imageX = clampImagePos(origX + (dx / rect.width) * 100);
        state.header.imageY = clampImagePos(origY + (dy / rect.height) * 100);
        applyHeaderImagePosLive();
      }
      function onUp(ev) {
        img.classList.remove('is-dragging');
        try { img.releasePointerCapture(ev.pointerId); } catch (_) {}
        img.removeEventListener('pointermove', onMove);
        img.removeEventListener('pointerup', onUp);
        img.removeEventListener('pointercancel', onUp);
        if (moved && !isEditorOpen()) persist();
      }
      img.addEventListener('pointermove', onMove);
      img.addEventListener('pointerup', onUp);
      img.addEventListener('pointercancel', onUp);
    });
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
        fillHeaderImage();
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
    if (ui.headerEditBtn) ui.headerEditBtn.hidden = true;
    if (ui.headerResize) ui.headerResize.hidden = !editing || isHeaderHidden();
    if (ui.cardsResize) ui.cardsResize.hidden = !editing || !isCardsFreeform();
    if (ui.closingEditBtn) ui.closingEditBtn.hidden = true;
    if (ui.closingResize) ui.closingResize.hidden = true;
    if (ui.closingSection) ui.closingSection.hidden = true;
    if (ui.headerTitle) {
      ui.headerTitle.hidden = isHeaderHidden() || isHeaderTextHidden('title');
      ui.headerTitle.setAttribute('contenteditable', editing && !ui.headerTitle.hidden ? 'true' : 'false');
    }
    if (ui.headerSubtitle) {
      ui.headerSubtitle.hidden = isHeaderHidden() || isHeaderTextHidden('subtitle');
      ui.headerSubtitle.setAttribute('contenteditable', editing && !ui.headerSubtitle.hidden ? 'true' : 'false');
    }
    if (ui.devTeamLabel) ui.devTeamLabel.setAttribute('contenteditable', editing && !!state.closing.enabled ? 'true' : 'false');
    document.querySelectorAll('.pack-closing-text-label').forEach(function (el) {
      el.setAttribute('contenteditable', editing ? 'true' : 'false');
    });
    document.querySelectorAll('.pack-overlay-delete').forEach(function (el) {
      if (el.getAttribute('data-overlay-delete') === 'devteam') {
        el.hidden = !editing || !state.closing.enabled;
      }
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
      if (ui.devTeamBtn) syncOverlayResizeHandles(ui.devTeamBtn);
    }
    syncPackAddMenu();
    if (!editing) {
      if (activePackText) setActivePackTarget(null);
      closePackAddMenu();
    }
  }

  /* ---------- סימון תמונות על הבד (גודל מסרגל הכלים) ---------- */

  function isPackTextEl(node) {
    const el = eventEl(node);
    if (!el || !el.closest) return false;
    return !!el.closest('#packHeaderTitle, #packHeaderSubtitle, [data-card-text], #packDevTeamLabel, .pack-closing-text, .pack-closing-text-label');
  }

  function findPackTextTarget(node) {
    node = eventEl(node);
    if (!node || !node.closest) return null;
    if (node.closest('[data-overlay-delete], [data-overlay-resize], [data-card-resize], [data-card-dup], [data-card-delete]')) return null;

    const wrap = node.closest('.pack-closing-text');
    if (wrap) {
      const id = wrap.getAttribute('data-icon-id');
      const label = wrap.querySelector('.pack-closing-text-label');
      if (label && id) return { el: label, role: 'closing-text', itemId: id };
    }

    const devLabel = node.closest('#packDevTeamLabel');
    if (devLabel) return { el: devLabel, role: 'closing-label' };

    const title = node.closest('#packHeaderTitle');
    if (title && !title.hidden) return { el: title, role: 'header-title' };

    const subtitle = node.closest('#packHeaderSubtitle');
    if (subtitle && !subtitle.hidden) return { el: subtitle, role: 'header-subtitle' };

    const cardText = node.closest('[data-card-text]');
    if (cardText) {
      const field = cardText.getAttribute('data-card-text');
      const cardId = cardText.getAttribute('data-card-id');
      if ((field === 'title' || field === 'desc') && cardId) {
        return { el: cardText, role: field === 'title' ? 'card-title' : 'card-desc', cardId: cardId };
      }
    }
    return null;
  }

  function findPackImageTarget(node) {
    node = eventEl(node);
    if (!node || !node.closest) return null;
    if (isPackTextEl(node)) return null;
    if (node.closest('[data-card-resize], [data-overlay-resize], [data-overlay-delete]')) return null;

    const logo = node.closest('.pack-header-logo');
    if (logo && logo.getAttribute('data-logo-id')) {
      return { el: logo, role: 'header-logo', itemId: logo.getAttribute('data-logo-id') };
    }

    const overlayIcon = node.closest('.pack-closing-icon');
    if (overlayIcon) {
      const iconId = overlayIcon.getAttribute('data-icon-id');
      const iconData = state.closing.icons.find(function (item) { return item.id === iconId; });
      if (iconData && iconData.kind !== 'text') {
        return { el: overlayIcon, role: 'overlay-icon', itemId: iconId };
      }
    }

    const icon = node.closest('.pack-card-icon');
    if (icon) {
      const cardEl = icon.closest('.pack-card');
      const cardId = cardEl && cardEl.getAttribute('data-id');
      const card = findCardById(cardId);
      const iconId = icon.getAttribute('data-card-icon-id');
      const iconData = card && (card.icons || []).find(function (item) { return item.id === iconId; });
      if (iconData) {
        return { el: icon, role: 'card-icon', cardId: cardId, itemId: iconId };
      }
      return null;
    }

    const headerImg = node.closest('#packHeaderImage, .pack-header-image');
    if (headerImg && state.header.mode === 'image' && state.header.image && !isHeaderHidden()) {
      return { el: document.getElementById('packHeaderImage') || headerImg, role: 'header-image' };
    }

    if (node.closest('#packHeader') &&
        !node.closest('.pack-section-edit, .pack-header-resize, .pack-header-drop, .pack-header-logo, .pack-header-hidden-note')) {
      if (state.header.mode === 'image' && state.header.image && !isHeaderHidden()) {
        const imgEl = document.getElementById('packHeaderImage');
        if (imgEl) return { el: imgEl, role: 'header-image' };
      }
    }

    const cardEl = node.closest('.pack-card');
    if (cardEl && !node.closest('[data-card-dup], [data-card-delete], .pack-card-action, .pack-card-icon, [data-card-text]')) {
      const card = findCardById(cardEl.getAttribute('data-id'));
      if (card && card.bgMode === 'image' && card.image) {
        const photo = cardEl.querySelector('.pack-card-photo');
        if (photo) return { el: photo, role: 'card-image', cardId: card.id };
      }
    }

    return null;
  }

  function bindPackImageSelection() {
    if (document.body.dataset.packImageSelectBound === '1') return;
    document.body.dataset.packImageSelectBound = '1';

    const sizeNum = document.getElementById('inlineTextSizeNum');
    if (sizeNum && sizeNum.dataset.packSizeCommitBound !== '1') {
      sizeNum.dataset.packSizeCommitBound = '1';
      sizeNum.addEventListener('focusout', function () {
        if (!hasActivePackText()) return;
        applyPackInlineSize(sizeNum.value);
      });
    }

    const lockInput = document.getElementById('packScaleLock');
    if (lockInput && lockInput.dataset.packScaleLockBound !== '1') {
      lockInput.dataset.packScaleLockBound = '1';
      lockInput.addEventListener('change', function () {
        if (!activePackText || activePackText.role !== 'card-image') return;
        const card = findCardById(activePackText.cardId);
        if (!card) return;
        const cardEl = document.querySelector('.pack-card[data-id="' + card.id + '"]');
        setCardKeepRatio(card, cardEl, !!lockInput.checked);
        persist();
        if (isEditorOpen()) snapshotJSON = JSON.stringify(state);
        syncPackToolbar();
      });
    }

    document.addEventListener('pointerdown', function (e) {
      if (!isPackActive() || !isPageEditMode()) return;
      if (e.button != null && e.button !== 0) return;
      const el = eventEl(e.target);
      if (!el) return;
      if (isToolbarOrPopoverEl(el)) return;
      if (el.closest('#packEditOverlay, .pack-edit-overlay')) return;

      const del = el.closest('[data-overlay-delete]');
      if (del) return;

      const textTarget = findPackTextTarget(el);
      if (textTarget) {
        setActivePackTarget(textTarget);
        return;
      }
      const target = findPackImageTarget(el);
      if (target) {
        setActivePackTarget(target);
        return;
      }
      if (el.closest('.pack-section-edit, .pack-header-resize, .pack-cards-resize, .pack-closing-resize, .pack-header-hidden-note, .pack-closing-hidden-note, [data-card-dup], [data-card-delete], [data-overlay-delete], [data-overlay-resize], .pack-card-action, .pack-card-icon, .pack-closing-icon, .pack-closing-text, .pack-dev-team-btn, [data-card-resize]')) return;
      if (activePackText) {
        setActivePackTarget(null);
      }
    }, true);
  }

  /* ---------- חיווט אירועים כללי ---------- */

  function handleCardsGridClick(e) {
    const el = eventEl(e.target);
    if (!el || !el.closest) return;
    const delBtn = el.closest('[data-card-delete]');
    if (delBtn) { e.preventDefault(); removeCard(delBtn.getAttribute('data-card-delete')); return; }
    const dupBtn = el.closest('[data-card-dup]');
    if (dupBtn) { e.preventDefault(); duplicateCard(dupBtn.getAttribute('data-card-dup')); return; }
    if (!isPageEditMode()) return;
    const cardEl = el.closest('.pack-card');
    if (cardEl) ensureCardEditor(cardEl.getAttribute('data-id'));
    const action = el.closest('.pack-card-action');
    if (action) { e.preventDefault(); return; }
  }

  function handleCardsGridClickReadMode(e) {
    if (isPageEditMode()) return;
    const el = eventEl(e.target);
    if (!el || !el.closest) return;
    const soonCard = el.closest('.pack-card.is-coming-soon');
    if (soonCard) {
      e.preventDefault();
      return;
    }
    const printBtn = el.closest('[data-print-href]');
    if (printBtn) {
      e.preventDefault();
      const href = printBtn.getAttribute('data-print-href');
      if (href) window.open(href, '_blank', 'noopener,noreferrer');
      else window.print();
      return;
    }
    const link = el.closest('a.pack-card-action');
    if (link && link.getAttribute('data-has-href') !== '1') e.preventDefault();
  }

  function bindEvents() {
    if (bound) return;
    bound = true;
    const ui = els();
    if (!ui.header) return;

    bindCardsFreeformToggle();
    bindPackAddMenu();
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
      if (e.key !== 'Escape' || !isPackActive()) return;
      if (isPackAddMenuOpen()) {
        e.preventDefault();
        closePackAddMenu();
        return;
      }
      if (isEditorOpen()) {
        const active = document.activeElement;
        if (active && (active.id === 'packHeaderTitle' || active.id === 'packHeaderSubtitle')) return;
        e.preventDefault();
        closeEditor(true);
        return;
      }
      if (activePackText) {
        e.preventDefault();
        setActivePackTarget(null);
      }
    });

    bindResize();
    bindCardsFreeformDrag();
    bindCardCornerResize();
    bindOverlayCornerResize();
    bindCardIconDragging();
    bindCardsHeightResize();
    bindClosingHeightResize();
    bindLogoDragging();
    bindHeaderTextDragging();
    bindClosingDragging();
    bindDevTeamDragging();
    bindHeaderImageDrop();
    bindHeaderImagePan();
    bindHeaderPreviewFrameSync();
    bindPackImageSelection();
    bindInlineHeaderText();
    bindInlineCardText();
    bindHeaderEditorAutoOpen();
    bindCardEditorAutoOpen();
    bindOverlayEditorAutoOpen();
    bindDockedEditorDismiss();
    bindEditorDock();
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
        setActivePackTarget(null);
      }
      if (isPackActive() && state.closing && state.closing.icons.some(function (icon) { return !icon.packAnchored; })) {
        ensureOverlayIconsPackAnchor();
        renderClosingIcons();
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

  function isPackAddMenuOpen() {
    const menu = document.getElementById('packAddMenu');
    return !!(menu && !menu.hidden);
  }

  function closePackAddMenu() {
    const ui = els();
    if (ui.addMenu) ui.addMenu.hidden = true;
    if (ui.addBtn) ui.addBtn.setAttribute('aria-expanded', 'false');
  }

  function openPackAddMenu() {
    const ui = els();
    if (!ui.addMenu || !ui.addBtn) return;
    closePackSettingsMenu();
    syncPackAddMenu();
    ui.addMenu.hidden = false;
    ui.addBtn.setAttribute('aria-expanded', 'true');
  }

  function syncPackAddMenu() {
    const item = document.getElementById('packAddDevTeam');
    if (!item) return;
    const taken = !!(state.closing && state.closing.enabled);
    item.disabled = taken;
    item.setAttribute('aria-disabled', taken ? 'true' : 'false');
    item.title = taken ? 'כבר יש כפתור צוות פיתוח במסך. מחקו אותו כדי להוסיף מחדש.' : '';
  }

  function handlePackAdd(kind) {
    closePackAddMenu();
    if (isUserMode() || !isPackActive()) return;
    if (kind === 'card') {
      addCard();
      return;
    }
    ensureEditMode();
    if (kind === 'icon') {
      const input = document.getElementById('packAddOverlayIconFile');
      if (input) input.click();
      return;
    }
    if (kind === 'text') {
      addOverlayText();
      return;
    }
    if (kind === 'devteam') {
      if (state.closing.enabled) return;
      addDevTeam();
    }
  }

  function bindPackAddMenu() {
    const ui = els();
    if (ui.addBtn && ui.addBtn.dataset.packAddBound !== '1') {
      ui.addBtn.dataset.packAddBound = '1';
      ui.addBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!isPackActive() || isUserMode()) return;
        if (isPackAddMenuOpen()) closePackAddMenu();
        else openPackAddMenu();
      });
    }
    if (ui.addMenu && ui.addMenu.dataset.packAddBound !== '1') {
      ui.addMenu.dataset.packAddBound = '1';
      ui.addMenu.addEventListener('click', function (e) {
        const btn = e.target.closest ? e.target.closest('[data-pack-add]') : null;
        if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
        e.preventDefault();
        handlePackAdd(btn.getAttribute('data-pack-add'));
      });
    }
    if (ui.overlayIconFile && ui.overlayIconFile.dataset.packAddBound !== '1') {
      ui.overlayIconFile.dataset.packAddBound = '1';
      ui.overlayIconFile.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file) return;
        readImageAsDataUrl(file, function (dataUrl) {
          ensureEditMode();
          addOverlayIcon(dataUrl);
        });
      });
    }
    if (document.body.dataset.packAddDocBound === '1') return;
    document.body.dataset.packAddDocBound = '1';
    document.addEventListener('click', function (e) {
      if (!isPackAddMenuOpen()) return;
      const wrap = document.getElementById('packAddWrap');
      if (wrap && wrap.contains(e.target)) return;
      closePackAddMenu();
    });
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

  function captureLivePackWorkspaceHtml() {
    const ws = document.getElementById('packWorkspace');
    if (!ws) return '';
    const clone = ws.cloneNode(true);
    const strip = clone.querySelectorAll(
      '.pack-section-edit, .pack-header-edit, .pack-header-resize, .pack-header-drop, .pack-cards-resize, .pack-closing-resize, .pack-card-dup, .pack-card-delete, .pack-card-resize'
    );
    for (let i = 0; i < strip.length; i++) {
      if (strip[i].parentNode) strip[i].parentNode.removeChild(strip[i]);
    }
    const editable = clone.querySelectorAll('[contenteditable]');
    for (let i = 0; i < editable.length; i++) {
      editable[i].removeAttribute('contenteditable');
      editable[i].removeAttribute('spellcheck');
    }
    return clone.innerHTML;
  }

  function flushLivePackIntoState() {
    commitPendingEdits();
    const titleEl = document.getElementById('packHeaderTitle');
    if (titleEl) commitInlineText(titleEl, 'title');
    const subEl = document.getElementById('packHeaderSubtitle');
    if (subEl) commitInlineText(subEl, 'subtitle');
    document.querySelectorAll('#packCardsGrid [data-card-text]').forEach(function (el) {
      commitCardInlineText(el);
    });
    try { commitClosingInlineText(); } catch (_) {}
    const fromDom = snapshotFromClientDoc(document);
    if (fromDom && fromDom.pack) {
      const live = normalizeState(fromDom.pack);
      const mem = cloneState(state);
      if (live.header.image) mem.header.image = live.header.image;
      mem.header.mode = live.header.mode || mem.header.mode;
      mem.header.color = live.header.color || mem.header.color;
      mem.header.height = live.header.height || mem.header.height;
      mem.header.imageScale = live.header.imageScale;
      mem.header.imageScaleY = live.header.imageScaleY;
      mem.header.imageX = live.header.imageX;
      mem.header.imageY = live.header.imageY;
      mem.header.keepRatio = live.header.keepRatio;
      mem.header.opacity = live.header.opacity;
      mem.header.hidden = live.header.hidden;
      if (live.header.logos && live.header.logos.length) mem.header.logos = live.header.logos;
      if (live.header.title && (live.header.title.text || mem.header.title.text)) {
        mem.header.title = live.header.title.text ? live.header.title : mem.header.title;
      }
      if (live.header.subtitle && (live.header.subtitle.text || mem.header.subtitle.text)) {
        mem.header.subtitle = live.header.subtitle.text ? live.header.subtitle : mem.header.subtitle;
      }
      if (live.cards && live.cards.items && live.cards.items.length) mem.cards = live.cards;
      mem.closing = live.closing;
      if (live.theme) mem.theme = live.theme;
      state = normalizeState(mem);
    }
    persistNow();
  }

  function importPackSnapshot(snapshot, opts) {
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
      if (!(opts && opts.fromExport) && !isUserMode()) {
        throw new Error('אין מספיק מקום לשמירה. נסו תמונה קטנה יותר.');
      }
    }
    state = next;
  }

  let packBootstrappedFromExport = false;

  function bootstrapFromEmbeddedIfPresent() {
    const el = document.getElementById(PACK_BOOTSTRAP_ID);
    if (!el || !String(el.textContent || '').trim()) return false;
    try {
      const snapshot = JSON.parse(el.textContent);
      importPackSnapshot(snapshot, { fromExport: true });
      packBootstrappedFromExport = true;
      return true;
    } catch (err) {
      console.warn('Pack bootstrap failed', err);
      return false;
    }
  }

  function buildExportedPackHtml(snapshot, indexHtml, cssText, jsText, assetDataUrls) {
    if (window.HebetShell && typeof window.HebetShell.assembleClientHtml === 'function') {
      return window.HebetShell.assembleClientHtml({
        generator: 'pack',
        indexHtml: indexHtml,
        css: cssText,
        js: jsText,
        snapshot: snapshot,
        bootstrapId: PACK_BOOTSTRAP_ID,
        assetDataUrls: assetDataUrls,
        liveWorkspaceHtml: captureLivePackWorkspaceHtml(),
      });
    }
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
    out = out.replace(/<link\b[^>]*href="css\/[^"]+"[^>]*>\s*/gi, '');
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

    out = out.replace(/<script\b[^>]*src="js\/[^"]+"[^>]*><\/script>\s*/gi, '');
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

    try {
      flushLivePackIntoState();
    } catch (err) {
      console.error(err);
      alert('שגיאה בשמירת הנתונים לפני הייצוא.');
      return;
    }

    const picker = window.HebetShell && typeof window.HebetShell.pickClientHtmlSave === 'function'
      ? window.HebetShell.pickClientHtmlSave
      : null;
    const writer = window.HebetShell && typeof window.HebetShell.writeClientHtml === 'function'
      ? window.HebetShell.writeClientHtml
      : null;
    const saveTarget = picker ? await picker(PACK_EXPORT_FILENAME) : 'download';
    if (!saveTarget) return;

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
      let sources = null;
      if (window.HebetShell && typeof window.HebetShell.collectExportSources === 'function') {
        sources = await window.HebetShell.collectExportSources('pack');
      } else {
        sources = {
          indexHtml: await fetchProjectAsset('index.html'),
          css: (await Promise.all(PROJECT_STYLES.map(fetchProjectAsset))).join('\n\n'),
          js: (await Promise.all(['js/shared/shell.js', 'js/pack/pack.js'].map(fetchProjectAsset))).join('\n\n'),
        };
      }
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
      html = buildExportedPackHtml(snapshot, sources.indexHtml, sources.css, sources.js, assetDataUrls);
    } catch (err) {
      console.warn('Full pack export failed, using live snapshot', err);
      if (!window.HebetShell || typeof window.HebetShell.buildLiveClientHtml !== 'function') {
        alert('לא ניתן לייצא כרגע. פתחו את index.html מתיקיית הפרויקט (Hebet/hebet) ורעננו עם Ctrl+F5.');
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

  function styleAttrProp(el, prop) {
    if (!el) return '';
    const style = el.getAttribute('style') || '';
    const re = new RegExp('(?:^|;)\\s*' + String(prop).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*:\\s*([^;]+)', 'i');
    const m = style.match(re);
    return m ? m[1].trim() : '';
  }

  function parseCssUrl(value) {
    const v = String(value || '').trim();
    if (!v || v === 'none') return '';
    const m = v.match(/^url\(\s*(['"]?)([\s\S]*?)\1\s*\)$/i);
    if (!m) return v.indexOf('data:') === 0 || v.indexOf('blob:') === 0 ? v : '';
    return String(m[2] || '').trim();
  }

  function parseColorValue(value, fallback) {
    const v = String(value || '').trim();
    if (!v || v === 'transparent' || v === 'rgba(0, 0, 0, 0)') return fallback;
    if (v.charAt(0) === '#' || v.indexOf('hsl') === 0 || v.indexOf('var(') === 0) return v;
    const m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (!m) return fallback || v;
    function hex(n) { return ('0' + Number(n).toString(16)).slice(-2); }
    return '#' + hex(m[1]) + hex(m[2]) + hex(m[3]);
  }

  function parsePctValue(value, fallback) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function parsePxValue(value, fallback) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function elHidden(el) {
    if (!el) return true;
    if (el.hidden) return true;
    return styleAttrProp(el, 'display') === 'none';
  }

  function snapshotFromClientDoc(doc) {
    if (!doc || !doc.getElementById) return null;
    const packApp = doc.getElementById('packApp');
    const cardNodes = doc.querySelectorAll('#packCardsGrid .pack-card[data-id], .pack-card[data-id]');
    if (!packApp && !cardNodes.length) return null;

    const headerEl = doc.getElementById('packHeader');
    const titleEl = doc.getElementById('packHeaderTitle');
    const subtitleEl = doc.getElementById('packHeaderSubtitle');
    const cardsSection = doc.getElementById('packCards');
    const closingEl = doc.getElementById('packClosing');
    const body = doc.body;

    const headerMode = headerEl && headerEl.classList.contains('is-transparent')
      ? 'transparent'
      : (headerEl && headerEl.classList.contains('is-image') ? 'image' : 'color');
    const headerOpacityRaw = styleAttrProp(headerEl, '--pack-header-opacity');
    const headerOpacityNum = parseFloat(headerOpacityRaw);
    const headerOpacity = Number.isFinite(headerOpacityNum)
      ? (headerOpacityNum <= 1 ? Math.round(headerOpacityNum * 100) : headerOpacityNum)
      : 100;

    const logos = [];
    const logoNodes = doc.querySelectorAll('.pack-header-logo[data-logo-id], .pack-header-logo');
    for (let i = 0; i < logoNodes.length; i++) {
      const logoEl = logoNodes[i];
      const imgEl = logoEl.tagName === 'IMG' ? logoEl : logoEl.querySelector('img');
      const src = (imgEl && (imgEl.getAttribute('src') || imgEl.src)) || logoEl.getAttribute('src') || '';
      if (!src) continue;
      const href = logoEl.getAttribute('data-has-href') === '1'
        ? (logoEl.getAttribute('href') || logoEl.getAttribute('data-href') || '')
        : '';
      logos.push({
        id: logoEl.getAttribute('data-logo-id') || '',
        src: src,
        href: href,
        x: parsePctValue(styleAttrProp(logoEl, '--lx'), 15),
        y: parsePctValue(styleAttrProp(logoEl, '--ly'), 50),
        size: parsePxValue(styleAttrProp(logoEl, '--lsize'), 56),
      });
    }

    const titleAlign = styleAttrProp(titleEl, '--pack-title-align') || 'center';
    const header = {
      mode: headerMode,
      color: parseColorValue(styleAttrProp(headerEl, '--pack-header-color'), DEFAULT_HEADER_COLOR),
      image: parseCssUrl(styleAttrProp(headerEl, '--pack-header-image')),
      imageScale: Math.round((parseFloat(styleAttrProp(headerEl, '--pack-header-image-scale')) || 1) * 100),
      imageScaleY: Math.round((parseFloat(styleAttrProp(headerEl, '--pack-header-image-scale-y')) || parseFloat(styleAttrProp(headerEl, '--pack-header-image-scale')) || 1) * 100),
      imageX: parsePctValue(styleAttrProp(headerEl, '--pack-header-image-x'), 50),
      imageY: parsePctValue(styleAttrProp(headerEl, '--pack-header-image-y'), 50),
      keepRatio: !(headerEl && headerEl.classList.contains('is-free-scale')),
      opacity: headerOpacity,
      height: parsePxValue(styleAttrProp(headerEl, '--pack-header-height') || styleAttrProp(headerEl, 'block-size'), 108),
      hidden: !!(headerEl && headerEl.classList.contains('is-hidden')),
      title: {
        text: titleEl ? String(titleEl.textContent || '').trim() : '',
        size: parsePxValue(styleAttrProp(titleEl, '--pack-title-size') || styleAttrProp(titleEl, 'font-size'), 30),
        color: parseColorValue(styleAttrProp(titleEl, 'color'), '#ffffff'),
        align: titleAlign,
        x: parsePctValue(styleAttrProp(titleEl, '--tx'), 50),
        y: parsePctValue(styleAttrProp(titleEl, '--ty'), 40),
        freePlaced: true,
        hidden: elHidden(titleEl),
      },
      subtitle: {
        text: subtitleEl ? String(subtitleEl.textContent || '').trim() : '',
        size: parsePxValue(styleAttrProp(subtitleEl, '--pack-subtitle-size') || styleAttrProp(subtitleEl, 'font-size'), 15),
        color: parseColorValue(styleAttrProp(subtitleEl, 'color'), '#ffffff'),
        align: styleAttrProp(subtitleEl, '--pack-subtitle-align') || titleAlign,
        x: parsePctValue(styleAttrProp(subtitleEl, '--tx'), 50),
        y: parsePctValue(styleAttrProp(subtitleEl, '--ty'), 68),
        freePlaced: true,
        hidden: elHidden(subtitleEl),
      },
      logos: logos,
    };

    const items = [];
    for (let i = 0; i < cardNodes.length; i++) {
      const cardEl = cardNodes[i];
      const id = cardEl.getAttribute('data-id') || '';
      const titleNode = cardEl.querySelector('.pack-card-title');
      const descNode = cardEl.querySelector('.pack-card-desc');
      const photo = cardEl.querySelector('.pack-card-photo');
      const imageSrc = parseCssUrl(styleAttrProp(cardEl, '--pack-card-image')) || (photo && photo.getAttribute('src')) || '';
      const actions = { view: {}, download: {}, print: {} };
      const actionNodes = cardEl.querySelectorAll('[data-action-kind]');
      for (let a = 0; a < actionNodes.length; a++) {
        const actEl = actionNodes[a];
        const kind = actEl.getAttribute('data-action-kind');
        if (!actions[kind]) continue;
        const normalEl = actEl.querySelector('.pack-action-normal');
        const normalImg = (normalEl && normalEl.tagName === 'IMG')
          ? normalEl
          : actEl.querySelector('img.pack-action-normal');
        const hoverImg = actEl.querySelector('img.pack-action-hover:not(.pack-action-hover--default)');
        const fallbackImg = (!normalImg && !hoverImg) ? actEl.querySelector('img') : null;
        const iconImg = normalImg || fallbackImg;
        actions[kind] = {
          enabled: true,
          href: actEl.getAttribute('data-print-href') || actEl.getAttribute('href') || '',
          icon: iconImg && iconImg.getAttribute('src')
            ? { type: 'image', value: iconImg.getAttribute('src') }
            : { type: 'glyph', value: (normalEl ? String(normalEl.textContent || '').trim() : String(actEl.textContent || '').trim()) || ACTION_DEFAULT_GLYPH[kind] },
          hoverIcon: hoverImg && hoverImg.getAttribute('src')
            ? { type: 'image', value: hoverImg.getAttribute('src') }
            : null,
          x: parsePctValue(styleAttrProp(actEl, '--ax'), 50),
          y: parsePctValue(styleAttrProp(actEl, '--ay'), 50),
        };
      }
      const icons = [];
      const iconNodes = cardEl.querySelectorAll('.pack-card-icon');
      for (let k = 0; k < iconNodes.length; k++) {
        const iconEl = iconNodes[k];
        const img = iconEl.querySelector('img');
        icons.push({
          id: iconEl.getAttribute('data-card-icon-id') || '',
          type: img && img.getAttribute('src') ? 'image' : 'glyph',
          value: img && img.getAttribute('src') ? img.getAttribute('src') : String(iconEl.textContent || '').trim(),
          x: parsePctValue(styleAttrProp(iconEl, '--ix'), 50),
          y: parsePctValue(styleAttrProp(iconEl, '--iy'), 14),
          size: parsePxValue(styleAttrProp(iconEl, '--isize'), 36),
        });
      }
      items.push({
        id: id,
        title: titleNode ? String(titleNode.textContent || '').trim() : '',
        titleSize: parsePxValue(titleNode && (styleAttrProp(titleNode, 'font-size')), 16),
        titleColor: parseColorValue(titleNode && styleAttrProp(titleNode, 'color'), '#ffffff'),
        desc: descNode ? String(descNode.textContent || '').trim() : '',
        descSize: parsePxValue(descNode && (styleAttrProp(descNode, 'font-size')), 13),
        descColor: parseColorValue(descNode && styleAttrProp(descNode, 'color'), '#ffffff'),
        titleHidden: !titleNode || elHidden(titleNode),
        descHidden: !descNode || elHidden(descNode),
        comingSoon: cardEl.classList.contains('is-coming-soon'),
        comingSoonLabel: (function () {
          const labelImg = cardEl.querySelector('.pack-card-soon-label');
          return labelImg && labelImg.getAttribute('src') ? labelImg.getAttribute('src') : '';
        })(),
        bgMode: imageSrc || cardEl.classList.contains('is-image') ? 'image' : 'color',
        color: parseColorValue(styleAttrProp(cardEl, '--pack-card-color') || styleAttrProp(cardEl, 'background-color'), DEFAULT_CARD_COLOR),
        image: imageSrc,
        imageScale: Math.round((parseFloat(styleAttrProp(cardEl, '--pack-card-img-scale')) || 1) * 100),
        imageScaleY: Math.round((parseFloat(styleAttrProp(cardEl, '--pack-card-img-scale-y')) || parseFloat(styleAttrProp(cardEl, '--pack-card-img-scale')) || 1) * 100),
        imageX: parsePctValue(styleAttrProp(cardEl, '--pack-card-img-x'), 50),
        imageY: parsePctValue(styleAttrProp(cardEl, '--pack-card-img-y'), 50),
        keepRatio: !cardEl.classList.contains('is-free-scale'),
        actions: actions,
        icons: icons,
        x: parsePctValue(styleAttrProp(cardEl, '--cx'), 50),
        y: parsePctValue(styleAttrProp(cardEl, '--cy'), 50),
        w: parsePctValue(styleAttrProp(cardEl, '--cw'), 18),
        h: parsePxValue(styleAttrProp(cardEl, '--ch'), 0),
        freePlaced: true,
      });
    }

    const closingIcons = [];
    const closingIconNodes = doc.querySelectorAll(
      '#packOverlayItems [data-icon-id], #packClosingItems [data-icon-id], .pack-workspace > .pack-closing-icon, .pack-workspace > .pack-closing-text'
    );
    for (let i = 0; i < closingIconNodes.length; i++) {
      const iconEl = closingIconNodes[i];
      const kind = iconEl.getAttribute('data-kind') === 'text' ? 'text' : 'icon';
      const img = iconEl.querySelector('img');
      const label = iconEl.querySelector('.pack-closing-text-label');
      closingIcons.push({
        id: iconEl.getAttribute('data-icon-id') || '',
        kind: kind,
        type: img && img.getAttribute('src') ? 'image' : 'glyph',
        value: kind === 'text'
          ? String((label && label.textContent) || iconEl.textContent || '').trim()
          : (img && img.getAttribute('src') ? img.getAttribute('src') : String(iconEl.textContent || '').trim()),
        href: iconEl.getAttribute('data-href') || (iconEl.getAttribute('href') && iconEl.getAttribute('href') !== '#' ? iconEl.getAttribute('href') : ''),
        packAnchored: true,
        x: parsePctValue(styleAttrProp(iconEl, '--cx'), 18),
        y: parsePctValue(styleAttrProp(iconEl, '--cy'), 58),
        size: parsePxValue(styleAttrProp(iconEl, '--csize'), kind === 'text' ? 18 : 40),
        sizeY: parsePxValue(styleAttrProp(iconEl, '--csize-y'), parsePxValue(styleAttrProp(iconEl, '--csize'), kind === 'text' ? 18 : 40)),
        keepRatio: kind === 'text' || !iconEl.classList.contains('is-free-scale'),
        color: parseColorValue(styleAttrProp(iconEl, '--ccolor') || styleAttrProp(iconEl, 'color'), '#222222'),
      });
    }

    const devBtn = doc.getElementById('packDevTeamBtn');
    const devLabel = doc.getElementById('packDevTeamLabel');
    const closing = {
      enabled: !!(devBtn && !elHidden(devBtn)),
      hidden: true,
      label: devLabel ? String(devLabel.textContent || '').trim() : 'צוות פיתוח',
      labelSize: parsePxValue(devLabel && styleAttrProp(devLabel, 'font-size'), 14),
      href: devBtn && devBtn.getAttribute('href') && devBtn.getAttribute('href') !== '#' ? devBtn.getAttribute('href') : '',
      color: parseColorValue(styleAttrProp(devBtn, '--pack-dev-team-color'), DEFAULT_CARD_COLOR),
      textColor: parseColorValue(styleAttrProp(devBtn, '--pack-dev-team-text') || (devLabel && styleAttrProp(devLabel, 'color')), '#ffffff'),
      size: Math.round((parseFloat(styleAttrProp(devBtn, '--pack-dev-team-scale')) || 1) * 100),
      sizeY: Math.round((parseFloat(styleAttrProp(devBtn, '--pack-dev-team-scale-y')) || parseFloat(styleAttrProp(devBtn, '--pack-dev-team-scale')) || 1) * 100),
      keepRatio: !(devBtn && devBtn.classList.contains('is-free-scale')),
      boxW: parsePxValue(styleAttrProp(devBtn, '--pack-dev-team-w'), 0),
      boxH: parsePxValue(styleAttrProp(devBtn, '--pack-dev-team-h'), 0),
      radius: parsePxValue(styleAttrProp(devBtn, '--pack-dev-team-radius'), 12),
      image: parseCssUrl(styleAttrProp(devBtn, '--pack-dev-team-image')),
      packAnchored: !!(devBtn && !devBtn.closest('#packClosing')),
      x: parsePctValue(styleAttrProp(devBtn, '--cx'), 88),
      y: parsePctValue(styleAttrProp(devBtn, '--cy'), devBtn && !devBtn.closest('#packClosing') ? 90 : 50),
      height: parsePxValue(styleAttrProp(closingEl, '--pack-closing-height') || styleAttrProp(closingEl, 'block-size'), 78),
      icons: closingIcons,
    };

    const theme = {
      siteBgColor: parseColorValue(styleAttrProp(body, '--site-bg-color') || styleAttrProp(body, 'background-color'), '#ffffff'),
      siteBgImage: parseCssUrl(styleAttrProp(body, '--site-bg-image')),
      siteFont: styleAttrProp(body, '--site-font') || styleAttrProp(body, 'font-family') || DEFAULT_SITE_FONT,
    };

    const pack = normalizeState({
      header: header,
      cards: {
        perRow: parsePctValue(styleAttrProp(cardsSection, '--pack-cards-per-row') || styleAttrProp(closingEl, '--pack-cards-per-row'), 4),
        gap: parsePxValue(styleAttrProp(cardsSection, '--pack-cards-gap'), 16),
        freeform: !!(cardsSection && cardsSection.classList.contains('is-freeform')),
        freeHeight: parsePxValue(styleAttrProp(cardsSection, '--pack-cards-free-height') || styleAttrProp(cardsSection, 'block-size'), 420),
        items: items,
      },
      closing: closing,
      theme: theme,
    });

    return {
      version: PACK_BOOTSTRAP_VERSION,
      exportedAt: new Date().toISOString(),
      mode: 'user',
      generator: 'pack',
      pack: pack,
      theme: pack.theme,
    };
  }

  function parsePackSnapshotFromHtmlText(htmlText) {
    const doc = new DOMParser().parseFromString(String(htmlText || ''), 'text/html');
    const bootstrapEl = doc.getElementById(PACK_BOOTSTRAP_ID);
    if (bootstrapEl && String(bootstrapEl.textContent || '').trim()) {
      return JSON.parse(bootstrapEl.textContent);
    }
    const fromDom = snapshotFromClientDoc(doc);
    if (fromDom) return fromDom;
    throw new Error('לא נמצאו נתוני מארז בקובץ שנבחר');
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
      'הכותרת, הקוביות והאלמנטים יימחקו. לא ניתן לבטל.'
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
    snapshotFromClientDoc: snapshotFromClientDoc,
    commitPendingEdits: commitPendingEdits,
    applyThemePatch: applyThemePatch,
    getTheme: collectSiteTheme,
  };

  /* ---------- אתחול ---------- */

  function initPackWorkspace() {
    const workspace = document.getElementById('packWorkspace');
    if (!workspace) return;
    if (!packBootstrappedFromExport) loadState();
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
