const STORAGE_KEY = 'hebet-cards';
const HOME_STORAGE_KEY = 'hebet-home';
const FONTS_DB_NAME = 'hebet-fonts';
const FONTS_STORE = 'fonts';

const BUILTIN_FONTS = [
  { value: "'Segoe UI', Tahoma, Arial, sans-serif", label: 'Segoe UI' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma' },
  { value: 'Gisha, Arial, sans-serif', label: 'Gisha' },
  { value: "David, 'Times New Roman', serif", label: 'David' },
  { value: 'Miriam, Arial, sans-serif', label: 'Miriam' },
  { value: 'Narkisim, Arial, sans-serif', label: 'Narkisim' },
  { value: "'Times New Roman', Times, serif", label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Courier New', Courier, monospace", label: 'Courier New' },
];

let customFontsCache = [];
const registeredFontFamilies = {};
const MAX_FONT_BYTES = 8 * 1024 * 1024;
const FONT_FILE_RE = /\.(ttf|otf|woff2?)$/i;

let pageEntranceDone = false;
let pendingCardPopId = null;

const DEFAULT_HOME = {
  title: 'פורטל תוכן',
  header: {
    height: 180,
    bgOpacity: 100,
    bgImage: '',
    items: [
      { id: 'hdr-title', type: 'title', text: 'פורטל תוכן', x: 50, y: 45, align: 'center' },
    ],
  },
  subtitle: 'צפייה מהנה',
  subtitleSize: 20,
  subtitleColor: '#ffffff',
  introText: 'ברוכים הבאים לפורטל התוכן. כאן תמצאו מצגות, לומדות וסרטים.',
  introTextSize: 16,
  introTextColor: '#ffffff',
  introImage: '',
  introVideo: '',
  introMediaType: 'bg',
  introBgOpacity: 100,
  introSizeAuto: true,
  introHeight: 280,
  introVideoFit: 'cover',
  introVideoZoom: 100,
  introVideoPosX: 50,
  introVideoPosY: 50,
  introVideoBgMode: 'transparent',
  introVideoBgColor: '#2f5a28',
  hasIntro2: false,
  intro2Subtitle: '',
  intro2SubtitleSize: 20,
  intro2SubtitleColor: '#ffffff',
  intro2Text: '',
  intro2TextSize: 16,
  intro2TextColor: '#ffffff',
  intro2Image: '',
  intro2Video: '',
  intro2MediaType: 'bg',
  intro2BgOpacity: 100,
  intro2SizeAuto: true,
  intro2Height: 280,
  intro2VideoFit: 'cover',
  intro2VideoZoom: 100,
  intro2VideoPosX: 50,
  intro2VideoPosY: 50,
  intro2VideoBgMode: 'transparent',
  intro2VideoBgColor: '#2f5a28',
  closingText: 'תודה שביקרתם. נשתמע בפעם הבאה.',
  closingTextSize: 17,
  closingTextColor: '#ffffff',
  closingImage: '',
  closingVideo: '',
  closingMediaType: 'bg',
  closingBgOpacity: 100,
  closingSizeAuto: true,
  closingHeight: 280,
  closingVideoFit: 'cover',
  closingVideoZoom: 100,
  closingVideoPosX: 50,
  closingVideoPosY: 50,
  closingVideoBgMode: 'transparent',
  closingVideoBgColor: '#2f5a28',
  closingDevTeam: false,
  closingDevTeamImage: '',
  closingDevTeamLink: '',
  closingDevTeamFontSize: 16,
  closingDevTeamColor: '#ffffff',
  closingDevTeamSize: 100,
  closingDevTeamBgColor: '#4a7c3f',
  closingDevTeamBorderColor: '#ffffff',
  closingDevTeamBorderWidth: 2,
  closingDevTeamGlow: false,
  closingDevTeamSlant: false,
  closingDevTeamX: 50,
  closingDevTeamY: 78,
  hasClosing2: false,
  closing2Text: '',
  closing2TextSize: 17,
  closing2TextColor: '#ffffff',
  closing2Image: '',
  closing2Video: '',
  closing2MediaType: 'bg',
  closing2BgOpacity: 100,
  closing2SizeAuto: true,
  closing2Height: 280,
  closing2VideoFit: 'cover',
  closing2VideoZoom: 100,
  closing2VideoPosX: 50,
  closing2VideoPosY: 50,
  closing2VideoBgMode: 'transparent',
  closing2VideoBgColor: '#2f5a28',
  closing2DevTeam: false,
  closing2DevTeamImage: '',
  closing2DevTeamLink: '',
  closing2DevTeamFontSize: 16,
  closing2DevTeamColor: '#ffffff',
  closing2DevTeamSize: 100,
  closing2DevTeamBgColor: '#4a7c3f',
  closing2DevTeamBorderColor: '#ffffff',
  closing2DevTeamBorderWidth: 2,
  closing2DevTeamGlow: false,
  closing2DevTeamSlant: false,
  closing2DevTeamX: 50,
  closing2DevTeamY: 78,
  siteBgColor: '#F3EEE4',
  siteBgImage: '',
  siteSecondaryColor: '#4a7c3f',
  colorCards: false,
  siteFont: "'Segoe UI', Tahoma, Arial, sans-serif",
  cardsPerRow: 5,
  cardsGap: 16,
  cardsLayoutMode: 'matrix',
  categories: [],
  cardsFreeHeight: 420,
  cardsFreeSize: 18,
  cardPositions: {},
  cardsBgImage: '',
  cardsBgFullBleed: true,
  cardsSearchEnabled: false,
};

const GRADIENTS = [
  'linear-gradient(135deg, #1a3a5c, #2d6a9f)',
  'linear-gradient(135deg, #3d2b1f, #8b5e3c)',
  'linear-gradient(135deg, #1f3d2b, #3c8b5e)',
  'linear-gradient(135deg, #3d1f2b, #8b3c5e)',
  'linear-gradient(135deg, #2b1f3d, #5e3c8b)',
  'linear-gradient(135deg, #1f2b3d, #3c5e8b)',
  'linear-gradient(135deg, #3d3d1f, #8b8b3c)',
  'linear-gradient(135deg, #1f3d3d, #3c8b8b)',
  'linear-gradient(135deg, #3d1f1f, #8b3c3c)',
  'linear-gradient(135deg, #2b3d1f, #5e8b3c)',
];

const DEFAULT_CARDS = [
  { id: 'card-1', title: 'כותרת 1', description: 'תיאור קצר של התוכן שמופיע בכרטיס זה. לחצו לצפייה.', link: 'pages/page1.html', gradient: GRADIENTS[0], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f' },
  { id: 'card-2', title: 'כותרת 2', description: 'תיאור קצר של התוכן שמופיע בכרטיס זה. לחצו לצפייה.', link: 'pages/page2.html', gradient: GRADIENTS[1], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f' },
  { id: 'card-3', title: 'כותרת 3', description: 'תיאור קצר של התוכן שמופיע בכרטיס זה. לחצו לצפייה.', link: 'pages/page3.html', gradient: GRADIENTS[2], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f' },
  { id: 'card-4', title: 'כותרת 4', description: 'תיאור קצר של התוכן שמופיע בכרטיס זה. לחצו לצפייה.', link: 'pages/page4.html', gradient: GRADIENTS[3], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f' },
  { id: 'card-5', title: 'כותרת 5', description: 'תיאור קצר של התוכן שמופיע בכרטיס זה. לחצו לצפייה.', link: 'pages/page5.html', gradient: GRADIENTS[4], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f' },
  { id: 'card-6', title: 'כותרת 6', description: 'תיאור קצר של התוכן שמופיע בכרטיס זה. לחצו לצפייה.', link: 'pages/page6.html', gradient: GRADIENTS[5], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f' },
  { id: 'card-7', title: 'כותרת 7', description: 'תיאור קצר של התוכן שמופיע בכרטיס זה. לחצו לצפייה.', link: 'pages/page7.html', gradient: GRADIENTS[6], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f' },
  { id: 'card-8', title: 'כותרת 8', description: 'תיאור קצר של התוכן שמופיע בכרטיס זה. לחצו לצפייה.', link: 'pages/page8.html', gradient: GRADIENTS[7], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f' },
  { id: 'card-9', title: 'כותרת 9', description: 'תיאור קצר של התוכן שמופיע בכרטיס זה. לחצו לצפייה.', link: 'pages/page9.html', gradient: GRADIENTS[8], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f' },
  { id: 'card-10', title: 'כותרת 10', description: 'תיאור קצר של התוכן שמופיע בכרטיס זה. לחצו לצפייה.', link: 'pages/page10.html', gradient: GRADIENTS[9], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f' },
];

const cardsGrid = document.getElementById('cardsGrid');
const btnNew = document.getElementById('btnNew');
const btnEdit = document.getElementById('btnEdit');
const modalOverlay = document.getElementById('modalOverlay');
const wizardForm = document.getElementById('wizardForm');
const btnCancel = document.getElementById('btnCancel');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnFinish = document.getElementById('btnFinish');
const livePreview = document.getElementById('livePreview');
const wizardError = document.getElementById('wizardError');
const navHint = document.getElementById('navHint');

let editMode = false;
let draggedElement = null;
let currentStep = 1;
let editingCardId = null;
let cardsSearchQuery = '';
const TOTAL_STEPS = 3;

function createEmptyWizardData() {
  return {
    pageName: '',
    unitName: '',
    notes: '',
    date: '',
    status: '',
    classification: '',
    projectType: '',
    enabledActions: ['צפייה'],
    actionLinks: { 'צפייה': '', 'הורדה': '', 'הדפסה': '' },
    mainImage: '',
    extraImages: [],
    logo: '',
    primaryColor: '#e87722',
    secondaryColor: '#4a7c3f',
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
    useImageBg: true,
  };
}

const wizardData = createEmptyWizardData();

const PROJECT_TYPE_PRESETS = ['מצגת', 'לומדה', 'סרט'];

function isProjectTypeOtherSelected() {
  const select = document.getElementById('projectType');
  return !!(select && select.value === '__other__');
}

function syncProjectTypeCustomVisibility() {
  const select = document.getElementById('projectType');
  const customInput = document.getElementById('projectTypeCustom');
  if (!select || !customInput) return;
  const isOther = select.value === '__other__';
  customInput.hidden = !isOther;
  if (!isOther) customInput.value = '';
}

function getWizardProjectTypeValue() {
  const select = document.getElementById('projectType');
  if (!select) return '';
  if (select.value === '__other__') {
    const custom = document.getElementById('projectTypeCustom');
    return custom ? custom.value.trim().slice(0, 10) : '';
  }
  return select.value;
}

function setWizardProjectTypeValue(type) {
  const select = document.getElementById('projectType');
  const customInput = document.getElementById('projectTypeCustom');
  if (!select || !customInput) return;
  const value = String(type || '').trim().slice(0, 10);
  if (value && PROJECT_TYPE_PRESETS.indexOf(value) === -1) {
    select.value = '__other__';
    customInput.value = value;
    customInput.hidden = false;
  } else {
    select.value = value;
    customInput.value = '';
    customInput.hidden = true;
  }
}

function resetWizardData() {
  Object.assign(wizardData, createEmptyWizardData());
}

/* ===== אחסון ===== */

function loadCards() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [...DEFAULT_CARDS];
    }
  }
  return [...DEFAULT_CARDS];
}

function saveCards(cards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    return true;
  } catch (err) {
    console.error('שגיאת שמירה:', err);
    return false;
  }
}

function normalizeProjectLink(link) {
  const trimmed = (link || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return 'https://' + trimmed;
}

function createCardId() {
  return 'card-' + Date.now();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function clampNumber(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

function hexToRgb(hex) {
  let h = String(hex || '').trim().replace('#', '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length === 6 || h.length === 8) {
    return {
      r: parseInt(h.slice(0, 2), 16) || 0,
      g: parseInt(h.slice(2, 4), 16) || 0,
      b: parseInt(h.slice(4, 6), 16) || 0,
      a: h.length === 8 ? (parseInt(h.slice(6, 8), 16) || 0) / 255 : 1,
    };
  }
  return { r: 74, g: 124, b: 63, a: 1 };
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hueToRgb(p, q, t) {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToRgb(h, s, l) {
  const hh = (((h % 360) + 360) % 360) / 360;
  const ss = clampNumber(s, 0, 100) / 100;
  const ll = clampNumber(l, 0, 100) / 100;
  if (ss === 0) {
    const v = Math.round(ll * 255);
    return { r: v, g: v, b: v };
  }
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  return {
    r: Math.round(hueToRgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hh) * 255),
    b: Math.round(hueToRgb(p, q, hh - 1 / 3) * 255),
  };
}

function parseColorToHsla(input) {
  const raw = String(input || '').trim();
  const hslaMatch = raw.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (hslaMatch) {
    return {
      h: clampNumber(hslaMatch[1], 0, 360),
      s: clampNumber(hslaMatch[2], 0, 100),
      l: clampNumber(hslaMatch[3], 0, 100),
      a: hslaMatch[4] == null ? 1 : clampNumber(hslaMatch[4], 0, 1),
    };
  }
  const rgbaMatch = raw.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (rgbaMatch) {
    const hsl = rgbToHsl(
      clampNumber(rgbaMatch[1], 0, 255),
      clampNumber(rgbaMatch[2], 0, 255),
      clampNumber(rgbaMatch[3], 0, 255)
    );
    return {
      h: hsl.h,
      s: hsl.s,
      l: hsl.l,
      a: rgbaMatch[4] == null ? 1 : clampNumber(rgbaMatch[4], 0, 1),
    };
  }
  const rgb = hexToRgb(raw);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { h: hsl.h, s: hsl.s, l: hsl.l, a: rgb.a };
}

function hslaToCss(h, s, l, a) {
  const alpha = Math.round(clampNumber(a, 0, 1) * 1000) / 1000;
  return 'hsla(' + Math.round(h) + ', ' + Math.round(s) + '%, ' + Math.round(l) + '%, ' + alpha + ')';
}

function hslaToHex(h, s, l, a) {
  const rgb = hslToRgb(h, s, l);
  return rgbaToHex(rgb.r, rgb.g, rgb.b, a);
}

function rgbaToHex(r, g, b, a) {
  const toHex = function (n) {
    return clampNumber(n, 0, 255).toString(16).padStart(2, '0');
  };
  const alpha = clampNumber(a, 0, 1);
  const base = '#' + toHex(r) + toHex(g) + toHex(b);
  if (alpha >= 0.999) return base;
  return base + toHex(Math.round(alpha * 255));
}

function rgbToHsv(r, g, b) {
  const rr = clampNumber(r, 0, 255) / 255;
  const gg = clampNumber(g, 0, 255) / 255;
  const bb = clampNumber(b, 0, 255) / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  const sat = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case rr: h = (gg - bb) / d + (gg < bb ? 6 : 0); break;
      case gg: h = (bb - rr) / d + 2; break;
      default: h = (rr - gg) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(sat * 100),
    v: Math.round(v * 100),
  };
}

function hsvToRgb(h, s, v) {
  const hh = (((Number(h) % 360) + 360) % 360) / 360;
  const ss = clampNumber(s, 0, 100) / 100;
  const vv = clampNumber(v, 0, 100) / 100;
  const i = Math.floor(hh * 6);
  const f = hh * 6 - i;
  const p = vv * (1 - ss);
  const q = vv * (1 - f * ss);
  const t = vv * (1 - (1 - f) * ss);
  let rr;
  let gg;
  let bb;
  switch (i % 6) {
    case 0: rr = vv; gg = t; bb = p; break;
    case 1: rr = q; gg = vv; bb = p; break;
    case 2: rr = p; gg = vv; bb = t; break;
    case 3: rr = p; gg = q; bb = vv; break;
    case 4: rr = t; gg = p; bb = vv; break;
    default: rr = vv; gg = p; bb = q; break;
  }
  return {
    r: Math.round(rr * 255),
    g: Math.round(gg * 255),
    b: Math.round(bb * 255),
  };
}

function colorToCss(input) {
  const c = parseColorToHsla(input);
  return hslaToCss(c.h, c.s, c.l, c.a);
}

function colorToDisplayHex(input) {
  const c = parseColorToHsla(input);
  return hslaToHex(c.h, c.s, c.l, c.a);
}

function parseColorToRgba(input) {
  const hsla = parseColorToHsla(input);
  const rgb = hslToRgb(hsla.h, hsla.s, hsla.l);
  return { r: rgb.r, g: rgb.g, b: rgb.b, a: hsla.a };
}

let activeHslaTarget = null;
let colorPickerTab = 'rgba';
let colorPickerState = { r: 74, g: 124, b: 63, a: 1 };
let colorPickerSyncing = false;

function getHslaPopoverEls() {
  return {
    popover: document.getElementById('hslaPopover'),
    preview: document.getElementById('hslaPreview'),
    eyedropper: document.getElementById('colorEyedropper'),
    hex: document.getElementById('colorHexInput'),
    tabRgba: document.getElementById('colorTabRgba'),
    tabHsva: document.getElementById('colorTabHsva'),
    rRange: document.getElementById('colorRRange'),
    gRange: document.getElementById('colorGRange'),
    bRange: document.getElementById('colorBRange'),
    aRangeRgba: document.getElementById('colorARangeRgba'),
    rNum: document.getElementById('colorRNum'),
    gNum: document.getElementById('colorGNum'),
    bNum: document.getElementById('colorBNum'),
    aNumRgba: document.getElementById('colorANumRgba'),
    hRange: document.getElementById('colorHRange'),
    sRange: document.getElementById('colorSRange'),
    vRange: document.getElementById('colorVRange'),
    aRangeHsva: document.getElementById('colorARangeHsva'),
    hNum: document.getElementById('colorHNum'),
    sNum: document.getElementById('colorSNum'),
    vNum: document.getElementById('colorVNum'),
    aNumHsva: document.getElementById('colorANumHsva'),
  };
}

function updateHslaSwatch(field) {
  if (!field) return;
  const input = field.querySelector('input[type="hidden"]');
  const swatch = field.querySelector('.hsla-swatch');
  const hexLabel = field.querySelector('.color-hex');
  if (!input || !swatch) return;
  const css = colorToCss(input.value);
  swatch.style.setProperty('--swatch-color', css);
  if (hexLabel) hexLabel.textContent = colorToDisplayHex(input.value);
}

function setColorPickerTab(tab) {
  colorPickerTab = tab === 'hsva' ? 'hsva' : 'rgba';
  const els = getHslaPopoverEls();
  if (!els.popover) return;
  if (els.tabRgba) els.tabRgba.hidden = colorPickerTab !== 'rgba';
  if (els.tabHsva) els.tabHsva.hidden = colorPickerTab !== 'hsva';
  els.popover.querySelectorAll('.color-tab').forEach(function (btn) {
    const active = btn.dataset.colorTab === colorPickerTab;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  syncColorPickerUiFromState();
}

function syncColorPickerUiFromState() {
  const els = getHslaPopoverEls();
  if (!els.popover) return;
  colorPickerSyncing = true;

  const state = colorPickerState;
  const hsv = rgbToHsv(state.r, state.g, state.b);
  const alphaPct = Math.round(clampNumber(state.a, 0, 1) * 100);
  const hex = rgbaToHex(state.r, state.g, state.b, state.a);
  const css = 'rgba(' + state.r + ', ' + state.g + ', ' + state.b + ', ' + (Math.round(state.a * 1000) / 1000) + ')';

  if (els.preview) els.preview.style.setProperty('--preview-color', css);
  if (els.hex) els.hex.value = hex;

  if (els.rRange) els.rRange.value = String(state.r);
  if (els.gRange) els.gRange.value = String(state.g);
  if (els.bRange) els.bRange.value = String(state.b);
  if (els.aRangeRgba) els.aRangeRgba.value = String(alphaPct);
  if (els.rNum) els.rNum.value = String(state.r);
  if (els.gNum) els.gNum.value = String(state.g);
  if (els.bNum) els.bNum.value = String(state.b);
  if (els.aNumRgba) els.aNumRgba.value = String(alphaPct);

  if (els.hRange) els.hRange.value = String(hsv.h);
  if (els.sRange) els.sRange.value = String(hsv.s);
  if (els.vRange) els.vRange.value = String(hsv.v);
  if (els.aRangeHsva) els.aRangeHsva.value = String(alphaPct);
  if (els.hNum) els.hNum.value = String(hsv.h);
  if (els.sNum) els.sNum.value = String(hsv.s);
  if (els.vNum) els.vNum.value = String(hsv.v);
  if (els.aNumHsva) els.aNumHsva.value = String(alphaPct);

  const hue = hsv.h;
  if (els.sRange) {
    els.sRange.style.background =
      'linear-gradient(to left, hsl(' + hue + ', 0%, ' + Math.max(18, hsv.v * 0.5) + '%), hsl(' + hue + ', 100%, 50%))';
  }
  if (els.vRange) {
    els.vRange.style.background =
      'linear-gradient(to left, #000, hsl(' + hue + ', ' + hsv.s + '%, 50%))';
  }
  if (els.aRangeRgba) {
    els.aRangeRgba.style.background =
      'linear-gradient(to left, transparent, rgb(' + state.r + ', ' + state.g + ', ' + state.b + ')),' +
      'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 12px 12px';
  }
  if (els.aRangeHsva) {
    els.aRangeHsva.style.background =
      'linear-gradient(to left, transparent, rgb(' + state.r + ', ' + state.g + ', ' + state.b + ')),' +
      'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 12px 12px';
  }

  colorPickerSyncing = false;
}

function applyColorPickerState(commit) {
  if (!activeHslaTarget) return;
  const hex = rgbaToHex(colorPickerState.r, colorPickerState.g, colorPickerState.b, colorPickerState.a);
  activeHslaTarget.input.value = hex;
  updateHslaSwatch(activeHslaTarget.field);
  syncColorPickerUiFromState();
  if (typeof activeHslaTarget.onChange === 'function') {
    activeHslaTarget.onChange(hex, commit);
  }
}

function updateColorFromRgbaFields(source) {
  if (colorPickerSyncing) return;
  const els = getHslaPopoverEls();
  const useNum = source === 'num';
  colorPickerState = {
    r: clampNumber(useNum ? els.rNum.value : els.rRange.value, 0, 255),
    g: clampNumber(useNum ? els.gNum.value : els.gRange.value, 0, 255),
    b: clampNumber(useNum ? els.bNum.value : els.bRange.value, 0, 255),
    a: clampNumber(useNum ? els.aNumRgba.value : els.aRangeRgba.value, 0, 100) / 100,
  };
  applyColorPickerState(false);
}

function updateColorFromHsvaFields(source) {
  if (colorPickerSyncing) return;
  const els = getHslaPopoverEls();
  const useNum = source === 'num';
  const rgb = hsvToRgb(
    useNum ? els.hNum.value : els.hRange.value,
    useNum ? els.sNum.value : els.sRange.value,
    useNum ? els.vNum.value : els.vRange.value
  );
  colorPickerState = {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    a: clampNumber(useNum ? els.aNumHsva.value : els.aRangeHsva.value, 0, 100) / 100,
  };
  applyColorPickerState(false);
}

function updateColorFromHexInput(commit) {
  if (colorPickerSyncing) return;
  const els = getHslaPopoverEls();
  let raw = String(els.hex.value || '').trim();
  if (!raw) return;
  if (raw[0] !== '#') raw = '#' + raw;
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) {
    if (commit) syncColorPickerUiFromState();
    return;
  }
  colorPickerState = parseColorToRgba(raw);
  applyColorPickerState(!!commit);
}

function positionHslaPopover(anchor) {
  const els = getHslaPopoverEls();
  if (!els.popover || !anchor) return;
  const pad = 8;
  const width = els.popover.offsetWidth || 300;
  const height = els.popover.offsetHeight || 360;
  const rect = anchor.getBoundingClientRect();
  let left = rect.left;
  let top = rect.bottom + pad;
  if (left + width > window.innerWidth - pad) {
    left = Math.max(pad, window.innerWidth - width - pad);
  }
  if (top + height > window.innerHeight - pad) {
    top = Math.max(pad, rect.top - height - pad);
  }
  els.popover.style.left = left + 'px';
  els.popover.style.top = top + 'px';
}

function closeHslaPopover() {
  const els = getHslaPopoverEls();
  if (els.popover) els.popover.hidden = true;
  activeHslaTarget = null;
}

function openHslaPopover(field, onChange) {
  const input = field.querySelector('input[type="hidden"]');
  const swatch = field.querySelector('.hsla-swatch');
  const els = getHslaPopoverEls();
  if (!input || !swatch || !els.popover) return;

  activeHslaTarget = { field: field, input: input, onChange: onChange };
  colorPickerState = parseColorToRgba(input.value);
  setColorPickerTab(colorPickerTab || 'rgba');
  els.popover.hidden = false;
  positionHslaPopover(swatch);
}

async function pickColorFromScreen() {
  if (!window.EyeDropper) {
    alert('בחירת צבע מהמסך לא נתמכת בדפדפן הזה. נסו Chrome או Edge.');
    return;
  }
  try {
    const result = await new window.EyeDropper().open();
    if (!result || !result.sRGBHex) return;
    colorPickerState = parseColorToRgba(result.sRGBHex);
    applyColorPickerState(true);
  } catch (_) {
    // המשתמש ביטל
  }
}

function bindPair(rangeEl, numEl, onInput, onCommit) {
  if (!rangeEl || !numEl) return;
  rangeEl.addEventListener('input', function () { onInput('range'); });
  rangeEl.addEventListener('change', function () { onCommit(); });
  numEl.addEventListener('input', function () {
    if (numEl.value === '' || numEl.value === '-') return;
    onInput('num');
  });
  numEl.addEventListener('change', function () { onCommit(); });
  numEl.addEventListener('blur', function () { onCommit(); });
}

function bindHslaPickers() {
  const els = getHslaPopoverEls();
  if (!els.popover || els.popover.dataset.bound === '1') return;
  els.popover.dataset.bound = '1';

  els.popover.querySelectorAll('.color-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setColorPickerTab(btn.dataset.colorTab);
    });
  });

  if (els.eyedropper) {
    els.eyedropper.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      pickColorFromScreen();
    });
  }

  bindPair(els.rRange, els.rNum, updateColorFromRgbaFields, function () {
    updateColorFromRgbaFields('range');
    applyColorPickerState(true);
  });
  bindPair(els.gRange, els.gNum, updateColorFromRgbaFields, function () {
    updateColorFromRgbaFields('range');
    applyColorPickerState(true);
  });
  bindPair(els.bRange, els.bNum, updateColorFromRgbaFields, function () {
    updateColorFromRgbaFields('range');
    applyColorPickerState(true);
  });
  bindPair(els.aRangeRgba, els.aNumRgba, updateColorFromRgbaFields, function () {
    updateColorFromRgbaFields('range');
    applyColorPickerState(true);
  });

  bindPair(els.hRange, els.hNum, updateColorFromHsvaFields, function () {
    updateColorFromHsvaFields('range');
    applyColorPickerState(true);
  });
  bindPair(els.sRange, els.sNum, updateColorFromHsvaFields, function () {
    updateColorFromHsvaFields('range');
    applyColorPickerState(true);
  });
  bindPair(els.vRange, els.vNum, updateColorFromHsvaFields, function () {
    updateColorFromHsvaFields('range');
    applyColorPickerState(true);
  });
  bindPair(els.aRangeHsva, els.aNumHsva, updateColorFromHsvaFields, function () {
    updateColorFromHsvaFields('range');
    applyColorPickerState(true);
  });

  if (els.hex) {
    els.hex.addEventListener('input', function () { updateColorFromHexInput(false); });
    els.hex.addEventListener('change', function () { updateColorFromHexInput(true); });
    els.hex.addEventListener('blur', function () { updateColorFromHexInput(true); });
  }

  document.addEventListener('click', function (e) {
    if (els.popover.hidden) return;
    if (els.popover.contains(e.target)) return;
    if (e.target.closest && e.target.closest('.hsla-swatch')) return;
    closeHslaPopover();
  });

  window.addEventListener('resize', function () {
    if (els.popover.hidden || !activeHslaTarget) return;
    positionHslaPopover(activeHslaTarget.field.querySelector('.hsla-swatch'));
  });
}

function setupHslaField(field, onChange) {
  if (!field || field.dataset.hslaReady === '1') return;
  field.dataset.hslaReady = '1';
  updateHslaSwatch(field);
  const swatch = field.querySelector('.hsla-swatch');
  if (!swatch) return;
  swatch.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const pop = getHslaPopoverEls();
    if (!pop.popover.hidden && activeHslaTarget && activeHslaTarget.field === field) {
      closeHslaPopover();
      return;
    }
    openHslaPopover(field, onChange);
  });
}

function setHslaFieldValue(fieldOrInputId, value) {
  const field = typeof fieldOrInputId === 'string'
    ? document.querySelector('[data-hsla-for="' + fieldOrInputId + '"]')
    : fieldOrInputId;
  if (!field) return;
  const input = field.querySelector('input[type="hidden"]');
  if (!input) return;
  input.value = colorToDisplayHex(value);
  updateHslaSwatch(field);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

/* ===== רינדור כרטיסים ברשת ===== */

function formatNotesHtml(notes) {
  const text = (notes || '').slice(0, 30);
  if (!text) return '';
  if (text.length <= 15) return highlightSearchHtml(text);
  return highlightSearchHtml(text.slice(0, 15)) + '<br>' + highlightSearchHtml(text.slice(15));
}

function getActiveCardsSearchQuery() {
  if (!loadHome().cardsSearchEnabled) return '';
  return String(cardsSearchQuery || '').trim();
}

function highlightSearchHtml(text) {
  const raw = text == null ? '' : String(text);
  const query = getActiveCardsSearchQuery();
  if (!query) return escapeHtml(raw);

  const lower = raw.toLowerCase();
  const q = query.toLowerCase();
  let result = '';
  let i = 0;
  while (i < raw.length) {
    const idx = lower.indexOf(q, i);
    if (idx === -1) {
      result += escapeHtml(raw.slice(i));
      break;
    }
    result += escapeHtml(raw.slice(i, idx));
    result += '<mark class="card-search-mark">' + escapeHtml(raw.slice(idx, idx + query.length)) + '</mark>';
    i = idx + query.length;
  }
  return result;
}

function cardMatchesSearch(card) {
  const query = getActiveCardsSearchQuery();
  if (!query) return true;
  const hay = [
    card.title,
    card.unitName,
    card.notes,
    card.description,
    card.projectType,
    card.classification,
    card.status,
  ].join('\n').toLowerCase();
  return hay.indexOf(query.toLowerCase()) !== -1;
}

function getCardSearchMissClass(card) {
  return getActiveCardsSearchQuery() && !cardMatchesSearch(card) ? ' card--search-miss' : '';
}

function getColorBlend(primary, secondary) {
  const p = colorToCss(primary || '#e87722');
  const s = colorToCss(secondary || '#4a7c3f');
  return 'linear-gradient(135deg, ' + p + ' 0%, ' + s + ' 100%)';
}

function shouldShowImageBg(card) {
  return card.useImageBg !== false && !!card.mainImage;
}

function getCardImageStyle(card) {
  if (shouldShowImageBg(card)) {
    return 'background-color: #222;';
  }
  return 'background-image: ' + getColorBlend(card.primaryColor, card.secondaryColor) + ';';
}

function getCardBgPhotoHtml(card) {
  if (!shouldShowImageBg(card)) return '';
  return (
    '<img class="card-bg-photo" src="' + card.mainImage + '" alt="">' +
    '<span class="card-bg-shade" aria-hidden="true"></span>'
  );
}

function getCardThemeStyle(card) {
  const primary = colorToCss(card.primaryColor || '#e87722');
  const secondary = colorToCss(card.secondaryColor || '#4a7c3f');
  // מרכאות בודדות — כדי לא לשבור את מאפיין style ב-HTML
  const font = (card.fontFamily || "'Segoe UI', Tahoma, Arial, sans-serif").replace(/"/g, "'");
  return (
    'font-family: ' + font + ';' +
    '--card-primary:' + primary + ';' +
    '--card-secondary:' + secondary + ';'
  );
}

function getButtonAction(card) {
  return card.buttonAction || 'צפייה';
}

function getCardActions(card) {
  if (card.enabledActions && card.enabledActions.length && card.actionLinks) {
    return card.enabledActions.map(function (action) {
      return {
        action: action,
        link: card.actionLinks[action] || '',
      };
    }).filter(function (item) {
      return !!item.link;
    });
  }

  // תאימות לאחור לכרטיסים ישנים
  const legacyLink = card.projectLink || card.link || '';
  const legacyAction = card.buttonAction || 'צפייה';
  if (!legacyLink) return [];
  return [{ action: legacyAction, link: legacyLink }];
}

function getFileNameFromUrl(link) {
  try {
    const path = new URL(link).pathname;
    const name = path.split('/').pop();
    return decodeURIComponent(name || 'file') || 'file';
  } catch {
    return 'file';
  }
}

function handleCardAction(link, action) {
  if (!link) {
    alert('אין קישור לפעולה זו');
    return;
  }

  const normalized = normalizeProjectLink(link);

  if (action === 'הורדה') {
    downloadFromLink(normalized);
    return;
  }

  if (action === 'הדפסה') {
    printFromLink(normalized);
    return;
  }

  window.open(normalized, '_blank', 'noopener');
}

function downloadFromLink(link) {
  const fileName = getFileNameFromUrl(link);

  // ניסיון הורדה דרך fetch (עובד טוב יותר ל-PDF מאותו מקור / CORS פתוח)
  fetch(link)
    .then(function (res) {
      if (!res.ok) throw new Error('fetch failed');
      return res.blob();
    })
    .then(function (blob) {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(blobUrl); }, 1000);
    })
    .catch(function () {
      // נפילה חזרה — פתיחה עם download
      const a = document.createElement('a');
      a.href = link;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
}

function printFromLink(link) {
  // iframe מוסתר — עובד טוב יותר להדפסת PDF בדפדפן
  const existing = document.getElementById('printFrame');
  if (existing) existing.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'printFrame';
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;';
  iframe.src = link;
  document.body.appendChild(iframe);

  let printed = false;
  const doPrint = function () {
    if (printed) return;
    printed = true;
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      // אם נחסם (CORS) — פותחים בחלון ומדפיסים משם
      const w = window.open(link, '_blank', 'noopener');
      if (w) {
        setTimeout(function () {
          try { w.print(); } catch (e) {}
        }, 800);
      }
    }
  };

  iframe.addEventListener('load', function () {
    setTimeout(doPrint, 600);
  });

  // גיבוי אם load לא נורה (PDF viewer)
  setTimeout(doPrint, 1800);
}

function buildActionButtonsHtml(card) {
  const primary = colorToCss(card.primaryColor || '#e87722');
  const actions = getCardActions(card);

  if (!actions.length) {
    return '<span class="btn-primary btn-view" style="background-color:' + primary + ';opacity:0.5;">אין קישור</span>';
  }

  return (
    '<div class="card-actions">' +
      actions.map(function (item) {
        return (
          '<button type="button" class="btn-primary btn-view" ' +
            'data-link="' + escapeHtml(item.link) + '" ' +
            'data-action="' + escapeHtml(item.action) + '" ' +
            'style="background-color:' + primary + ';">' +
            escapeHtml(item.action) +
          '</button>'
        );
      }).join('') +
    '</div>'
  );
}

function buildCardInner(card) {
  const typeTag = card.projectType || 'מצגת';
  const classTag = card.classification || 'שמור';
  const secondary = colorToCss(card.secondaryColor || '#4a7c3f');
  const logoHtml = card.logo
    ? '<img class="card-logo" src="' + card.logo + '" alt="">'
    : '';
  const titleRaw = (card.title || '').slice(0, 10);
  const unitRaw = (card.unitName || '').slice(0, 10);
  const unitLine = unitRaw
    ? '<p class="card-unit" style="color:' + secondary + ';">' + highlightSearchHtml(unitRaw) + '</p>'
    : '';
  const desc = card.notes || card.description || '';

  return (
    '<div class="card-image' + (shouldShowImageBg(card) ? ' card-image--photo' : '') + '" style="' + getCardImageStyle(card) + '">' +
      getCardBgPhotoHtml(card) +
      logoHtml +
      '<div class="card-image-tags">' +
        '<span class="card-overlay-tag" style="border-color:' + secondary + ';">' + highlightSearchHtml(typeTag) + '</span>' +
        '<span class="card-overlay-tag" style="border-color:' + secondary + ';">' + highlightSearchHtml(classTag) + '</span>' +
      '</div>' +
      '<span class="card-title">' + highlightSearchHtml(titleRaw) + '</span>' +
    '</div>' +
    '<div class="card-body">' +
      unitLine +
      '<p class="card-notes">' + formatNotesHtml(desc) + '</p>' +
    '</div>' +
    '<div class="card-footer">' +
      buildActionButtonsHtml(card) +
    '</div>'
  );
}

/* ===== קטגוריות כרטיסים ===== */

function createCategoryId() {
  return 'cat-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

function normalizeCategories(categories, cards) {
  const cardIds = new Set((cards || []).map(function (c) { return c.id; }));
  const seen = new Set();
  return (Array.isArray(categories) ? categories : []).map(function (cat) {
    const ids = (cat.cardIds || []).filter(function (id) {
      if (!cardIds.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return {
      id: cat.id || createCategoryId(),
      title: String(cat.title || 'קטגוריה').slice(0, 40),
      cardIds: ids,
      fontSize: clampFontSize(cat.fontSize, 22),
      color: normalizeTextColor(cat.color, '#2a3a2f'),
    };
  });
}

function getCategoryTitleStyle(cat) {
  const size = clampFontSize(cat && cat.fontSize, 22);
  const color = colorToCss(normalizeTextColor(cat && cat.color, '#2a3a2f'));
  return 'font-size:' + size + 'px;color:' + color + ';';
}

function getCardsByIds(cards, ids) {
  const map = Object.fromEntries(cards.map(function (c) { return [c.id, c]; }));
  return (ids || []).map(function (id) { return map[id]; }).filter(Boolean);
}

function getUncategorizedCards(cards, categories) {
  const assigned = new Set();
  (categories || []).forEach(function (cat) {
    (cat.cardIds || []).forEach(function (id) { assigned.add(id); });
  });
  return cards.filter(function (c) { return !assigned.has(c.id); });
}

function getCardsLayoutMode(home) {
  home = home || loadHome();
  if (home.cardsLayoutMode === 'matrix' || home.cardsLayoutMode === 'categories' || home.cardsLayoutMode === 'freeform') {
    return home.cardsLayoutMode;
  }
  if (home.categoriesEnabled) return 'categories';
  return 'matrix';
}

function clampCardsFreeHeight(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 420;
  return Math.min(1800, Math.max(240, Math.round(num)));
}

function clampCardFreeWidth(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 18;
  return Math.min(40, Math.max(8, Math.round(num)));
}

function syncCategoriesToolbar(home) {
  home = home || loadHome();
  const mode = getCardsLayoutMode(home);
  const modeSelect = document.getElementById('cardsLayoutMode');
  const addBtn = document.getElementById('addCategoryBtn');
  const perRowControl = document.getElementById('cardsPerRowControl');
  const gapControl = document.getElementById('cardsGapControl');
  const freeHeightControl = document.getElementById('cardsFreeHeightControl');
  const freeSizeControl = document.getElementById('cardsFreeSizeControl');
  const freeHeightInput = document.getElementById('cardsFreeHeight');
  const freeSizeInput = document.getElementById('cardsFreeSize');
  const freeHeightValue = document.getElementById('cardsFreeHeightValue');
  const freeSizeValue = document.getElementById('cardsFreeSizeValue');

  if (modeSelect) modeSelect.value = mode;
  if (addBtn) addBtn.hidden = true;
  if (perRowControl) perRowControl.hidden = mode === 'freeform';
  if (gapControl) gapControl.hidden = mode === 'freeform';
  if (freeHeightControl) freeHeightControl.hidden = mode !== 'freeform';
  if (freeSizeControl) freeSizeControl.hidden = mode !== 'freeform';

  const height = clampCardsFreeHeight(home.cardsFreeHeight);
  const size = clampCardFreeWidth(home.cardsFreeSize);
  if (freeHeightInput) freeHeightInput.value = String(height);
  if (freeSizeInput) freeSizeInput.value = String(size);
  if (freeHeightValue) freeHeightValue.textContent = height + 'px';
  if (freeSizeValue) freeSizeValue.textContent = size + '%';

  const searchCheck = document.getElementById('cardsSearchEnabled');
  const searchBar = document.getElementById('cardsSearchBar');
  const searchInput = document.getElementById('cardsSearchInput');
  if (searchCheck) searchCheck.checked = !!home.cardsSearchEnabled;
  if (searchBar) searchBar.hidden = !home.cardsSearchEnabled;
  if (searchInput && document.activeElement !== searchInput) {
    searchInput.value = cardsSearchQuery;
  }
}

function removeCardFromCategories(cardId) {
  const home = loadHome();
  if (!Array.isArray(home.categories) || !home.categories.length) return;
  let changed = false;
  home.categories = home.categories.map(function (cat) {
    const nextIds = (cat.cardIds || []).filter(function (id) { return id !== cardId; });
    if (nextIds.length !== (cat.cardIds || []).length) changed = true;
    return Object.assign({}, cat, { cardIds: nextIds });
  });
  if (changed) saveHome(home);
}

function placeCardIdAfterSource(home, sourceId, newId) {
  if (!home || !Array.isArray(home.categories)) return false;
  for (let i = 0; i < home.categories.length; i++) {
    const ids = home.categories[i].cardIds || [];
    const idx = ids.indexOf(sourceId);
    if (idx === -1) continue;
    ids.splice(idx + 1, 0, newId);
    home.categories[i].cardIds = ids;
    return true;
  }
  return false;
}

function buildCardElementHtml(card, index, options) {
  options = options || {};
  const popClass = pendingCardPopId === card.id ? ' card-pop-in' : '';
  const missClass = getCardSearchMissClass(card);
  if (editMode) {
    return (
      '<div class="card card--editing' + popClass + missClass + '" draggable="' + (options.draggable === false ? 'false' : 'true') + '" data-id="' + card.id + '" style="animation-delay: ' + (index % 3) * 0.08 + 's; ' + getCardThemeStyle(card) + '">' +
        '<button type="button" class="card-edit" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
        '<button type="button" class="card-duplicate" data-id="' + card.id + '" aria-label="שיכפול כרטיס" title="שיכפול">⧉</button>' +
        '<button type="button" class="card-delete" data-id="' + card.id + '" aria-label="מחיקת כרטיס">×</button>' +
        buildCardInner(card) +
      '</div>'
    );
  }
  return (
    '<div class="card card--clickable' + popClass + missClass + '" data-id="' + card.id + '" role="button" tabindex="0" style="' + getCardThemeStyle(card) + '">' +
      '<button type="button" class="card-edit card-edit--quiet" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
      buildCardInner(card) +
    '</div>'
  );
}

function getCardPositionMap(home) {
  return home.cardPositions && typeof home.cardPositions === 'object' ? home.cardPositions : {};
}

function ensureCardPositions(home, cards) {
  const positions = Object.assign({}, getCardPositionMap(home));
  const defaultW = clampCardFreeWidth(home.cardsFreeSize);
  const missing = cards.filter(function (card) { return !positions[card.id]; });
  if (missing.length) {
    const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(cards.length || 1))));
    cards.forEach(function (card, index) {
      if (positions[card.id]) return;
      const col = index % cols;
      const row = Math.floor(index / cols);
      positions[card.id] = {
        x: clampPercent(((col + 0.5) / cols) * 100, 50),
        y: clampPercent(Math.min(88, 16 + row * 26), 20),
        w: defaultW,
      };
    });
  }
  home.cardPositions = positions;
  return positions;
}

function normalizeCardPosition(pos, fallbackW) {
  pos = pos || {};
  return {
    x: clampPercent(pos.x, 50),
    y: clampPercent(pos.y, 50),
    w: clampCardFreeWidth(pos.w != null ? pos.w : fallbackW),
  };
}

function buildFreeformCardHtml(card, pos, index) {
  const popClass = pendingCardPopId === card.id ? ' card-pop-in' : '';
  const missClass = getCardSearchMissClass(card);
  const style =
    '--cx:' + pos.x + '%;--cy:' + pos.y + '%;--cw:' + pos.w + '%;' +
    'animation-delay:' + (index % 3) * 0.08 + 's;';
  const resizeHandle = editMode
    ? '<span class="card-free-resize" data-id="' + card.id + '" title="שנה גודל כרטיס" aria-label="שנה גודל כרטיס"></span>'
    : '';
  const cardHtml = editMode
    ? (
      '<div class="card card--editing' + popClass + missClass + '" data-id="' + card.id + '" style="' + getCardThemeStyle(card) + '">' +
        '<button type="button" class="card-edit" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
        '<button type="button" class="card-duplicate" data-id="' + card.id + '" aria-label="שיכפול כרטיס" title="שיכפול">⧉</button>' +
        '<button type="button" class="card-delete" data-id="' + card.id + '" aria-label="מחיקת כרטיס">×</button>' +
        buildCardInner(card) +
      '</div>'
    )
    : (
      '<div class="card card--clickable' + popClass + missClass + '" data-id="' + card.id + '" role="button" tabindex="0" style="' + getCardThemeStyle(card) + '">' +
        '<button type="button" class="card-edit card-edit--quiet" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
        buildCardInner(card) +
      '</div>'
    );

  return (
    '<div class="card-free-wrap' + (editMode ? ' is-editable' : '') + (missClass ? ' is-search-miss' : '') + '" data-id="' + card.id + '" style="' + style + '">' +
      cardHtml +
      resizeHandle +
    '</div>'
  );
}

function renderFreeformCards(cards, home) {
  const height = clampCardsFreeHeight(home.cardsFreeHeight);
  const defaultW = clampCardFreeWidth(home.cardsFreeSize);
  let positions = ensureCardPositions(home, cards);
  let changed = false;
  Object.keys(positions).forEach(function (id) {
    if (!cards.some(function (c) { return c.id === id; })) {
      delete positions[id];
      changed = true;
    }
  });
  cards.forEach(function (card) {
    const next = normalizeCardPosition(positions[card.id], defaultW);
    const prev = positions[card.id] || {};
    if (prev.x !== next.x || prev.y !== next.y || prev.w !== next.w) changed = true;
    positions[card.id] = next;
  });
  home.cardPositions = positions;
  home.cardsFreeHeight = height;
  home.cardsFreeSize = defaultW;
  if (changed) saveHome(home);

  const cardsHtml = cards.map(function (card, index) {
    return buildFreeformCardHtml(card, positions[card.id], index);
  }).join('');

  cardsGrid.innerHTML =
    '<div class="cards-freeform-canvas" id="cardsFreeformCanvas" style="--cards-free-height:' + height + 'px;">' +
      cardsHtml +
      (editMode
        ? '<div class="home-resize-handle cards-free-resize-handle" id="cardsFreeResizeHandle" title="גררו לשינוי גובה המרחב">' +
            '<span class="home-resize-grip"></span>' +
          '</div>'
        : '') +
    '</div>';
}

function buildCategoryBlockHtml(cat, cards, options) {
  options = options || {};
  const isLoose = !!options.isLoose;
  const catId = cat.id || '';
  const titleStyle = getCategoryTitleStyle(cat);
  const fontSize = clampFontSize(cat.fontSize, 22);
  const color = normalizeTextColor(cat.color, '#2a3a2f');
  const colorFieldId = 'catColor_' + catId;

  if (!editMode && !cards.length) return '';

  let headerHtml;
  if (editMode && !isLoose) {
    headerHtml =
      '<header class="category-header">' +
        '<input type="text" class="category-title-input" data-category-id="' + escapeHtml(catId) + '" value="' + escapeHtml(cat.title || 'קטגוריה') + '" maxlength="40" aria-label="שם קטגוריה" style="' + titleStyle + '">' +
        '<div class="category-style-controls">' +
          '<label class="category-size-control" title="גודל גופן">' +
            '<span>גודל</span>' +
            '<input type="range" class="category-font-size" min="10" max="56" step="1" value="' + fontSize + '" data-category-id="' + escapeHtml(catId) + '" aria-label="גודל גופן לקטגוריה">' +
            '<strong class="category-font-size-value">' + fontSize + '</strong>' +
          '</label>' +
          '<div class="hsla-field category-color-field" id="' + colorFieldId + 'Picker" data-hsla-for="' + colorFieldId + '" data-category-id="' + escapeHtml(catId) + '">' +
            '<button type="button" class="hsla-swatch" title="צבע גופן" aria-label="צבע גופן לקטגוריה"></button>' +
            '<input type="hidden" id="' + colorFieldId + '" class="category-color-input" value="' + escapeHtml(color) + '">' +
          '</div>' +
        '</div>' +
        '<div class="category-header-actions">' +
          '<button type="button" class="category-add" data-category-id="' + escapeHtml(catId) + '" aria-label="הוספת קטגוריה מתחת" title="הוספת קטגוריה מתחת">+</button>' +
          '<button type="button" class="category-delete" data-category-id="' + escapeHtml(catId) + '" aria-label="מחיקת קטגוריה" title="מחק קטגוריה">×</button>' +
        '</div>' +
      '</header>';
  } else if (isLoose) {
    headerHtml = editMode
      ? (
        '<header class="category-header category-header--loose">' +
          '<span class="category-loose-label">ללא קטגוריה</span>' +
          '<div class="category-header-actions">' +
            '<button type="button" class="category-add" data-category-id="" aria-label="הוספת קטגוריה" title="הוספת קטגוריה">+</button>' +
          '</div>' +
        '</header>'
      )
      : '<header class="category-header category-header--loose" aria-hidden="true"></header>';
  } else {
    headerHtml =
      '<header class="category-header">' +
        '<h3 class="category-title" style="' + titleStyle + '">' + escapeHtml(cat.title || 'קטגוריה') + '</h3>' +
      '</header>';
  }

  const cardsHtml = cards.map(function (card, index) {
    return buildCardElementHtml(card, index);
  }).join('');
  const emptyHtml = editMode && !cards.length
    ? '<div class="category-empty">גררו כרטיסים לכאן</div>'
    : '';

  return (
    '<section class="category-block' + (isLoose ? ' category-block--loose' : '') + '" data-category-id="' + escapeHtml(catId) + '">' +
      headerHtml +
      '<div class="category-cards" data-category-drop="' + escapeHtml(catId) + '">' +
        cardsHtml +
        emptyHtml +
      '</div>' +
    '</section>'
  );
}

function renderCards(cards) {
  const home = loadHome();
  const mode = getCardsLayoutMode(home);
  cardsGrid.classList.toggle('has-categories', mode === 'categories');
  cardsGrid.classList.toggle('is-freeform', mode === 'freeform');
  cardsGrid.classList.toggle('edit-mode', editMode);
  syncCategoriesToolbar(home);

  if (mode === 'freeform') {
    renderFreeformCards(cards, home);
  } else if (mode === 'categories') {
    const categories = normalizeCategories(home.categories, cards);
    let html = '';
    categories.forEach(function (cat) {
      html += buildCategoryBlockHtml(cat, getCardsByIds(cards, cat.cardIds), { isLoose: false });
    });
    const loose = getUncategorizedCards(cards, categories);
    if (editMode || loose.length) {
      html += buildCategoryBlockHtml(
        { id: '', title: 'ללא קטגוריה' },
        loose,
        { isLoose: true }
      );
    }
    if (!html) {
      cardsGrid.classList.remove('has-categories');
      html = cards.map(function (card, index) {
        return buildCardElementHtml(card, index);
      }).join('');
    }
    cardsGrid.innerHTML = html;
  } else {
    cardsGrid.innerHTML = cards.map(function (card, index) {
      return buildCardElementHtml(card, index);
    }).join('');
  }

  if (editMode) {
    if (mode === 'freeform') {
      setupFreeformCardInteractions();
      setupDeleteButtons();
      setupEditButtons();
      setupDuplicateButtons();
    } else {
      setupDragAndDrop();
      setupDeleteButtons();
      setupEditButtons();
      setupDuplicateButtons();
      if (mode === 'categories') setupCategoryControls();
    }
  } else {
    setupCardClicks();
    setupEditButtons();
  }
  pendingCardPopId = null;
}

/* ===== מצב עריכה / גרירה / מחיקה ===== */

function saveOrderFromDom() {
  const home = loadHome();
  const cards = loadCards();
  const cardMap = Object.fromEntries(cards.map(function (c) { return [c.id, c]; }));
  const mode = getCardsLayoutMode(home);

  if (mode !== 'categories') {
    if (mode === 'freeform') return;
    const ids = [...cardsGrid.querySelectorAll('.card')].map(function (el) {
      return el.dataset.id;
    });
    saveCards(ids.map(function (id) { return cardMap[id]; }).filter(Boolean));
    return;
  }

  const allIds = [];
  const categories = [];

  cardsGrid.querySelectorAll('.category-block').forEach(function (block) {
    const catId = block.dataset.categoryId || '';
    const ids = [...block.querySelectorAll('.card')].map(function (el) {
      return el.dataset.id;
    });
    allIds.push.apply(allIds, ids);
    if (!catId) return;
    const titleInput = block.querySelector('.category-title-input');
    const title = titleInput
      ? String(titleInput.value || '').trim().slice(0, 40) || 'קטגוריה'
      : 'קטגוריה';
    const sizeEl = block.querySelector('.category-font-size');
    const colorEl = block.querySelector('.category-color-input');
    categories.push({
      id: catId,
      title: title,
      cardIds: ids,
      fontSize: clampFontSize(sizeEl ? sizeEl.value : 22, 22),
      color: normalizeTextColor(colorEl ? colorEl.value : '#2a3a2f', '#2a3a2f'),
    });
  });

  home.categories = categories;
  saveHome(home);
  saveCards(allIds.map(function (id) { return cardMap[id]; }).filter(Boolean));
}

function getCardDropContainer(el) {
  if (!el) return cardsGrid;
  const categoryCards = el.closest('.category-cards');
  if (categoryCards) return categoryCards;
  return cardsGrid.classList.contains('has-categories') ? null : cardsGrid;
}

function clearCategoryEmptyPlaceholders(container) {
  if (!container) return;
  container.querySelectorAll('.category-empty').forEach(function (el) {
    el.remove();
  });
}

function ensureCategoryEmptyPlaceholder(container) {
  if (!container || !editMode) return;
  if (container.querySelector('.card')) return;
  if (container.querySelector('.category-empty')) return;
  const empty = document.createElement('div');
  empty.className = 'category-empty';
  empty.textContent = 'גררו כרטיסים לכאן';
  container.appendChild(empty);
}

function setupDragAndDrop() {
  const cardElements = cardsGrid.querySelectorAll('.card--editing');

  cardElements.forEach(function (card) {
    card.addEventListener('dragstart', function (e) {
      draggedElement = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.id);
    });

    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
      cardsGrid.querySelectorAll('.category-cards.is-drop-target').forEach(function (el) {
        el.classList.remove('is-drop-target');
      });
      cardsGrid.querySelectorAll('.category-cards').forEach(ensureCategoryEmptyPlaceholder);
      draggedElement = null;
      saveOrderFromDom();
    });

    card.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!draggedElement || draggedElement === card) return;

      const container = getCardDropContainer(card);
      if (!container) return;
      clearCategoryEmptyPlaceholders(container);

      const rect = card.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const midY = rect.top + rect.height / 2;
      const after = e.clientY > midY || (Math.abs(e.clientY - midY) < rect.height / 4 && e.clientX > midX);

      if (after) {
        container.insertBefore(draggedElement, card.nextSibling);
      } else {
        container.insertBefore(draggedElement, card);
      }
    });
  });

  cardsGrid.querySelectorAll('.category-cards').forEach(function (container) {
    container.addEventListener('dragover', function (e) {
      e.preventDefault();
      if (!draggedElement) return;
      container.classList.add('is-drop-target');
      if (e.target.closest && e.target.closest('.card') && e.target.closest('.card') !== draggedElement) {
        return;
      }
      clearCategoryEmptyPlaceholders(container);
      const siblings = [...container.querySelectorAll('.card:not(.dragging)')];
      if (!siblings.length) {
        container.appendChild(draggedElement);
        return;
      }
      let insertBefore = null;
      for (let i = 0; i < siblings.length; i++) {
        const rect = siblings[i].getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2
          || (Math.abs(e.clientY - (rect.top + rect.height / 2)) < rect.height / 4 && e.clientX > rect.left + rect.width / 2);
        if (!after) {
          insertBefore = siblings[i];
          break;
        }
      }
      if (insertBefore) container.insertBefore(draggedElement, insertBefore);
      else container.appendChild(draggedElement);
    });

    container.addEventListener('dragleave', function (e) {
      if (!container.contains(e.relatedTarget)) {
        container.classList.remove('is-drop-target');
      }
    });

    container.addEventListener('drop', function (e) {
      e.preventDefault();
      container.classList.remove('is-drop-target');
    });
  });
}

function setupCategoryControls() {
  cardsGrid.querySelectorAll('.category-title-input').forEach(function (input) {
    input.addEventListener('click', function (e) {
      e.stopPropagation();
    });
    input.addEventListener('change', function () {
      saveOrderFromDom();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
      }
    });
  });

  cardsGrid.querySelectorAll('.category-delete').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      deleteCategory(btn.dataset.categoryId);
    });
  });

  cardsGrid.querySelectorAll('.category-add').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      addCategoryAfter(btn.dataset.categoryId || '');
    });
  });

  cardsGrid.querySelectorAll('.category-font-size').forEach(function (range) {
    const block = range.closest('.category-block');
    const valueEl = block && block.querySelector('.category-font-size-value');
    const titleInput = block && block.querySelector('.category-title-input');

    function applySize(raw) {
      const size = clampFontSize(raw, 22);
      range.value = String(size);
      if (valueEl) valueEl.textContent = String(size);
      if (titleInput) titleInput.style.fontSize = size + 'px';
      saveOrderFromDom();
    }

    range.addEventListener('input', function () {
      applySize(range.value);
    });
    range.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  });

  cardsGrid.querySelectorAll('.category-color-field').forEach(function (field) {
    field.dataset.hslaReady = '';
    setupHslaField(field, function (hex) {
      const block = field.closest('.category-block');
      const titleInput = block && block.querySelector('.category-title-input');
      if (titleInput) titleInput.style.color = colorToCss(hex);
      saveOrderFromDom();
    });
  });
}

function addCategory() {
  addCategoryAfter('');
}

function addCategoryAfter(afterCategoryId) {
  const home = loadHome();
  const cards = loadCards();
  home.cardsLayoutMode = 'categories';
  home.categoriesEnabled = true;
  home.categories = normalizeCategories(home.categories, cards);
  const newCat = {
    id: createCategoryId(),
    title: 'קטגוריה חדשה',
    cardIds: [],
    fontSize: 22,
    color: '#2a3a2f',
  };
  if (afterCategoryId) {
    const idx = home.categories.findIndex(function (cat) { return cat.id === afterCategoryId; });
    if (idx >= 0) home.categories.splice(idx + 1, 0, newCat);
    else home.categories.push(newCat);
  } else {
    home.categories.push(newCat);
  }
  if (!saveHome(home)) {
    alert('אין מספיק מקום לשמירה.');
    return;
  }
  syncCategoriesToolbar(home);
  renderCards(cards);
}

function deleteCategory(categoryId) {
  if (!categoryId) return;
  if (!confirm('למחוק את הקטגוריה? הכרטיסים יישארו בלי קטגוריה.')) return;
  const home = loadHome();
  const cards = loadCards();
  home.categories = normalizeCategories(home.categories, cards).filter(function (cat) {
    return cat.id !== categoryId;
  });
  saveHome(home);
  renderCards(cards);
}

function saveCardFreePosition(cardId, x, y, w) {
  const home = loadHome();
  const positions = Object.assign({}, getCardPositionMap(home));
  const prev = normalizeCardPosition(positions[cardId], home.cardsFreeSize);
  positions[cardId] = {
    x: clampPercent(x, prev.x),
    y: clampPercent(y, prev.y),
    w: typeof w === 'number' ? clampCardFreeWidth(w) : prev.w,
  };
  home.cardPositions = positions;
  saveHome(home);
}

function removeCardPosition(cardId) {
  const home = loadHome();
  const positions = Object.assign({}, getCardPositionMap(home));
  if (!positions[cardId]) return;
  delete positions[cardId];
  home.cardPositions = positions;
  saveHome(home);
}

function placeFreeformCopyNearSource(home, sourceId, newId) {
  const positions = Object.assign({}, getCardPositionMap(home));
  const src = positions[sourceId];
  if (!src) return false;
  positions[newId] = {
    x: clampPercent(Number(src.x) + 4, src.x),
    y: clampPercent(Number(src.y) + 4, src.y),
    w: clampCardFreeWidth(src.w != null ? src.w : home.cardsFreeSize),
  };
  home.cardPositions = positions;
  return true;
}

function applyCardsFreeHeight(height) {
  const canvas = document.getElementById('cardsFreeformCanvas');
  if (canvas) canvas.style.setProperty('--cards-free-height', clampCardsFreeHeight(height) + 'px');
  const valueEl = document.getElementById('cardsFreeHeightValue');
  if (valueEl) valueEl.textContent = clampCardsFreeHeight(height) + 'px';
}

function applyCardsFreeSizeToDom(size) {
  const w = clampCardFreeWidth(size);
  cardsGrid.querySelectorAll('.card-free-wrap').forEach(function (wrap) {
    wrap.style.setProperty('--cw', w + '%');
  });
  const valueEl = document.getElementById('cardsFreeSizeValue');
  if (valueEl) valueEl.textContent = w + '%';
}

function setupFreeformCardInteractions() {
  const canvas = document.getElementById('cardsFreeformCanvas');
  if (!canvas) return;

  cardsGrid.querySelectorAll('.card-free-wrap.is-editable').forEach(function (wrap) {
    wrap.addEventListener('pointerdown', function (e) {
      if (!editMode) return;
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest('.card-edit, .card-duplicate, .card-delete, .card-free-resize, .btn-view, a, button')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const cardId = wrap.dataset.id;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      wrap.classList.add('is-dragging');
      wrap.setPointerCapture(e.pointerId);

      function onMove(ev) {
        const x = ((ev.clientX - rect.left) / rect.width) * 100;
        const y = ((ev.clientY - rect.top) / rect.height) * 100;
        wrap.style.setProperty('--cx', clampPercent(x, 50) + '%');
        wrap.style.setProperty('--cy', clampPercent(y, 50) + '%');
      }

      function onUp(ev) {
        wrap.classList.remove('is-dragging');
        try { wrap.releasePointerCapture(ev.pointerId); } catch (_) {}
        wrap.removeEventListener('pointermove', onMove);
        wrap.removeEventListener('pointerup', onUp);
        wrap.removeEventListener('pointercancel', onUp);

        const x = parseFloat(String(wrap.style.getPropertyValue('--cx')));
        const y = parseFloat(String(wrap.style.getPropertyValue('--cy')));
        saveCardFreePosition(cardId, x, y);
      }

      wrap.addEventListener('pointermove', onMove);
      wrap.addEventListener('pointerup', onUp);
      wrap.addEventListener('pointercancel', onUp);
    });
  });

  cardsGrid.querySelectorAll('.card-free-resize').forEach(function (handle) {
    handle.addEventListener('pointerdown', function (e) {
      if (!editMode) return;
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const wrap = handle.closest('.card-free-wrap');
      if (!wrap) return;
      const cardId = wrap.dataset.id;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;

      const startX = e.clientX;
      const startW = parseFloat(String(wrap.style.getPropertyValue('--cw'))) || clampCardFreeWidth(loadHome().cardsFreeSize);
      handle.classList.add('is-resizing');
      wrap.classList.add('is-resizing');
      handle.setPointerCapture(e.pointerId);

      function onMove(ev) {
        // RTL: dragging left (smaller clientX) grows width visually toward the left edge
        const deltaPct = ((startX - ev.clientX) / rect.width) * 100;
        const next = clampCardFreeWidth(startW + deltaPct);
        wrap.style.setProperty('--cw', next + '%');
      }

      function onUp(ev) {
        handle.classList.remove('is-resizing');
        wrap.classList.remove('is-resizing');
        try { handle.releasePointerCapture(ev.pointerId); } catch (_) {}
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);

        const w = parseFloat(String(wrap.style.getPropertyValue('--cw')));
        const x = parseFloat(String(wrap.style.getPropertyValue('--cx')));
        const y = parseFloat(String(wrap.style.getPropertyValue('--cy')));
        saveCardFreePosition(cardId, x, y, w);
      }

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  });

  const heightHandle = document.getElementById('cardsFreeResizeHandle');
  if (heightHandle && heightHandle.dataset.bound !== '1') {
    heightHandle.dataset.bound = '1';
    heightHandle.addEventListener('pointerdown', function (e) {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();

      const startY = e.clientY;
      const startH = clampCardsFreeHeight(loadHome().cardsFreeHeight);
      heightHandle.classList.add('is-dragging');
      heightHandle.setPointerCapture(e.pointerId);

      function onMove(ev) {
        const next = clampCardsFreeHeight(startH + (ev.clientY - startY));
        applyCardsFreeHeight(next);
        const input = document.getElementById('cardsFreeHeight');
        if (input) input.value = String(next);
      }

      function onUp(ev) {
        heightHandle.classList.remove('is-dragging');
        try { heightHandle.releasePointerCapture(ev.pointerId); } catch (_) {}
        heightHandle.removeEventListener('pointermove', onMove);
        heightHandle.removeEventListener('pointerup', onUp);
        heightHandle.removeEventListener('pointercancel', onUp);

        const canvasEl = document.getElementById('cardsFreeformCanvas');
        const fromCss = canvasEl ? parseFloat(canvasEl.style.getPropertyValue('--cards-free-height')) : NaN;
        const height = clampCardsFreeHeight(Number.isFinite(fromCss) ? fromCss : loadHome().cardsFreeHeight);
        updateHomeField({ cardsFreeHeight: height });
      }

      heightHandle.addEventListener('pointermove', onMove);
      heightHandle.addEventListener('pointerup', onUp);
      heightHandle.addEventListener('pointercancel', onUp);
    });
  }
}

function setupDeleteButtons() {
  cardsGrid.querySelectorAll('.card-delete').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      deleteCard(btn.dataset.id);
    });
  });
}

function setupEditButtons() {
  cardsGrid.querySelectorAll('.card-edit').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      openWizardForEdit(btn.dataset.id);
    });
  });
}

function setupDuplicateButtons() {
  cardsGrid.querySelectorAll('.card-duplicate').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      duplicateCard(btn.dataset.id);
    });
  });
}

function duplicateCard(id) {
  const cards = loadCards();
  const source = cards.find(function (c) { return c.id === id; });
  if (!source) return;

  const copy = JSON.parse(JSON.stringify(source));
  copy.id = createCardId();
  copy.title = ((source.title || '') + ' ע').slice(0, 10);

  const index = cards.findIndex(function (c) { return c.id === id; });
  cards.splice(index + 1, 0, copy);

  if (!saveCards(cards)) {
    alert('אין מספיק מקום לשמירת השיכפול. נסו למחוק כרטיס או להקטין תמונות.');
    return;
  }

  const home = loadHome();
  if (getCardsLayoutMode(home) === 'categories' && placeCardIdAfterSource(home, id, copy.id)) {
    saveHome(home);
  } else if (getCardsLayoutMode(home) === 'freeform' && placeFreeformCopyNearSource(home, id, copy.id)) {
    saveHome(home);
  }

  pendingCardPopId = copy.id;
  renderCards(cards);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function wait(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

async function animateElementOut(el) {
  if (!el || prefersReducedMotion()) return;
  el.classList.add('is-removing');
  await wait(180);
}

function setupCardClicks() {
  cardsGrid.querySelectorAll('.card--clickable').forEach(function (cardEl) {
    cardEl.addEventListener('click', function (e) {
      if (e.target.closest('.btn-view') || e.target.closest('.card-edit') || e.target.closest('.card-duplicate')) return;
      openCardDetail(cardEl.dataset.id, cardEl);
    });

    cardEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCardDetail(cardEl.dataset.id, cardEl);
      }
    });
  });

  cardsGrid.querySelectorAll('.btn-view').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      handleCardAction(btn.dataset.link, btn.dataset.action || 'צפייה');
    });
  });
}

/* ===== תצוגת פרטים עם אנימציה ===== */

const detailOverlay = document.getElementById('detailOverlay');
const detailFly = document.getElementById('detailFly');
const detailFront = document.getElementById('detailFront');
const detailContent = document.getElementById('detailContent');
const detailClose = document.getElementById('detailClose');

let detailOriginRect = null;
let floatTimer = null;

function buildDetailHtml(card) {
  const notes = card.notes || card.description || '—';

  const extras = (card.extraImages || []).map(function (src) {
    return '<img src="' + src + '" alt="">';
  }).join('');

  const logoBlock = card.logo
    ? '<div class="detail-logo-wrap"><img src="' + card.logo + '" alt="לוגו"></div>'
    : '';

  return (
    '<div class="detail-hero' + (shouldShowImageBg(card) ? ' detail-hero--photo' : '') + '" style="' + getCardImageStyle(card) + '">' +
      getCardBgPhotoHtml(card) +
      logoBlock +
      '<h2 class="detail-title">' + escapeHtml(card.title) + '</h2>' +
    '</div>' +
    '<div class="detail-body">' +
      '<div class="detail-grid">' +
        row('שם היחידה', card.unitName || '—') +
        row('סיווג', card.classification || '—') +
        row('סוג פרויקט', card.projectType || '—') +
        row('הערות', notes) +
      '</div>' +
      (extras ? '<div class="detail-extras"><h4>תמונות נוספות</h4><div class="detail-extras-grid">' + extras + '</div></div>' : '') +
      (function () {
        const actions = getCardActions(card);
        if (!actions.length) return '';
        return (
          '<div class="detail-actions">' +
            actions.map(function (item) {
              return (
                '<button type="button" class="detail-open-link" data-link="' + escapeHtml(item.link) + '" data-action="' + escapeHtml(item.action) + '">' +
                  escapeHtml(item.action) + ' ←' +
                '</button>'
              );
            }).join('') +
          '</div>'
        );
      })() +
      '<button type="button" class="detail-edit-btn" data-id="' + card.id + '">✎ עריכת כרטיס</button>' +
    '</div>'
  );
}

function row(label, value) {
  return (
    '<div class="detail-row">' +
      '<span class="detail-label">' + escapeHtml(label) + '</span>' +
      '<span class="detail-value">' + escapeHtml(value) + '</span>' +
    '</div>'
  );
}

function getDetailTargetRect() {
  const width = Math.min(520, window.innerWidth - 32);
  const height = Math.min(window.innerHeight * 0.88, 720);
  return {
    top: (window.innerHeight - height) / 2,
    left: (window.innerWidth - width) / 2,
    width: width,
    height: height,
  };
}

function openCardDetail(id, cardEl) {
  const card = loadCards().find(function (c) { return c.id === id; });
  if (!card) return;

  if (floatTimer) {
    clearTimeout(floatTimer);
    floatTimer = null;
  }

  detailOriginRect = cardEl.getBoundingClientRect();
  const target = getDetailTargetRect();

  detailFront.innerHTML = '<div class="card" style="' + getCardThemeStyle(card) + '">' + buildCardInner(card) + '</div>';
  detailContent.innerHTML = buildDetailHtml(card);
  detailFly.style.setProperty('--card-primary', colorToCss(card.primaryColor || '#e87722'));
  detailFly.style.setProperty('--card-secondary', colorToCss(card.secondaryColor || '#4a7c3f'));

  const detailEditBtn = detailContent.querySelector('.detail-edit-btn');
  if (detailEditBtn) {
    detailEditBtn.addEventListener('click', function () {
      const id = card.id;
      closeCardDetail(true);
      openWizardForEdit(id);
    });
  }

  const detailActionBtns = detailContent.querySelectorAll('.detail-open-link');
  detailActionBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      handleCardAction(btn.dataset.link, btn.dataset.action || 'צפייה');
    });
  });

  detailOverlay.hidden = false;
  detailFly.classList.remove('is-flipped', 'is-closing', 'is-floating');

  detailFly.style.transition = 'none';
  detailFly.style.top = detailOriginRect.top + 'px';
  detailFly.style.left = detailOriginRect.left + 'px';
  detailFly.style.width = detailOriginRect.width + 'px';
  detailFly.style.height = detailOriginRect.height + 'px';
  detailFly.style.transform = 'none';

  cardEl.classList.add('card--ghost');

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      detailFly.style.transition = '';
      detailFly.style.top = target.top + 'px';
      detailFly.style.left = target.left + 'px';
      detailFly.style.width = target.width + 'px';
      detailFly.style.height = target.height + 'px';
      detailFly.classList.add('is-flipped');

      floatTimer = setTimeout(function () {
        detailFly.classList.add('is-floating');
        floatTimer = null;
      }, 880);
    });
  });
}

function closeCardDetail(instant) {
  if (detailOverlay.hidden) return;

  if (floatTimer) {
    clearTimeout(floatTimer);
    floatTimer = null;
  }

  const ghost = document.querySelector('.card--ghost');

  function resetDetail() {
    detailOverlay.hidden = true;
    detailFly.classList.remove('is-flipped', 'is-closing', 'is-floating');
    detailFly.style.top = '';
    detailFly.style.left = '';
    detailFly.style.width = '';
    detailFly.style.height = '';
    detailFly.style.transform = '';
    detailFly.style.transition = '';
    if (ghost) ghost.classList.remove('card--ghost');
    detailOriginRect = null;
  }

  if (instant) {
    detailFly.style.transition = 'none';
    resetDetail();
    return;
  }

  detailFly.classList.remove('is-floating');
  detailFly.style.transform = 'none';
  detailFly.classList.add('is-closing');
  detailFly.classList.remove('is-flipped');

  if (detailOriginRect) {
    detailFly.style.top = detailOriginRect.top + 'px';
    detailFly.style.left = detailOriginRect.left + 'px';
    detailFly.style.width = detailOriginRect.width + 'px';
    detailFly.style.height = detailOriginRect.height + 'px';
  }

  setTimeout(resetDetail, 880);
}

async function deleteCard(id) {
  const card = loadCards().find(function (c) { return c.id === id; });
  const name = card ? card.title : 'כרטיס זה';
  if (!confirm('למחוק את "' + name + '"?')) return;

  const el = cardsGrid.querySelector('.card[data-id="' + id + '"]');
  await animateElementOut(el);

  const cards = loadCards().filter(function (c) { return c.id !== id; });
  saveCards(cards);
  removeCardFromCategories(id);
  removeCardPosition(id);
  renderCards(cards);
}

function toggleEditMode() {
  editMode = !editMode;
  btnEdit.textContent = editMode ? 'סיום עריכה' : 'עריכה';
  btnEdit.classList.toggle('active', editMode);
  cardsGrid.classList.toggle('edit-mode', editMode);
  document.body.classList.toggle('page-edit-mode', editMode);
  if (!editMode && editingHomeSection === 'cards') {
    homeEditCommitted = true;
    closeHomeEditor();
  }
  unmountCardsLayoutBarFromEditor();
  const home = loadHome();
  syncHomeSectionControls(home);
  syncCategoriesToolbar(home);
  syncResizeHandlesVisibility();
  renderHomeHeader(home);
  renderCards(loadCards());
  renderClosingDevTeam('closing', home);
  if (home.hasClosing2) renderClosingDevTeam('closing2', home);
}

/* ===== תצוגה מקדימה חיה ===== */

function buildPreviewCard() {
  const previewCard = {
    title: wizardData.pageName || 'שם הדף',
    unitName: wizardData.unitName,
    notes: wizardData.notes || 'התיאור יופיע כאן...',
    description: wizardData.notes || 'התיאור יופיע כאן...',
    projectType: wizardData.projectType || 'סוג',
    classification: wizardData.classification || 'סיווג',
    primaryColor: wizardData.primaryColor || '#e87722',
    secondaryColor: wizardData.secondaryColor || '#4a7c3f',
    mainImage: wizardData.mainImage,
    logo: wizardData.logo,
    fontFamily: wizardData.fontFamily,
    useImageBg: wizardData.useImageBg,
    enabledActions: wizardData.enabledActions.slice(),
    actionLinks: Object.assign({}, wizardData.actionLinks),
  };

  // בתצוגה המקדימה מציגים כפתורים גם בלי קישורים מלאים
  const previewLinks = {};
  wizardData.enabledActions.forEach(function (action) {
    previewLinks[action] = wizardData.actionLinks[action] || '#';
  });
  previewCard.actionLinks = previewLinks;

  const metaBits = [];
  const metaHtml = metaBits.length
    ? '<p class="card-meta">' + escapeHtml(metaBits.join(' · ')) + '</p>'
    : '';

  let inner = buildCardInner(previewCard);
  if (metaHtml) {
    inner = inner.replace('</div><div class="card-footer">', metaHtml + '</div><div class="card-footer">');
  }

  return '<div class="card card--preview" style="' + getCardThemeStyle(previewCard) + '">' + inner + '</div>';
}

function updateLivePreview() {
  livePreview.innerHTML = buildPreviewCard();
}

/* ===== ניהול שלבים ===== */

function showError(msg) {
  wizardError.textContent = msg;
  wizardError.hidden = !msg;
}

function updateStepUI() {
  document.querySelectorAll('.wizard-step').forEach(function (el) {
    const step = Number(el.dataset.step);
    el.classList.toggle('active', step === currentStep);
    el.classList.toggle('done', step < currentStep);
    const circle = el.querySelector('.step-circle');
    circle.textContent = step < currentStep ? '✓' : String(step);
  });

  document.querySelectorAll('.wizard-panel').forEach(function (panel) {
    panel.hidden = Number(panel.dataset.panel) !== currentStep;
  });

  btnPrev.hidden = currentStep === 1;
  btnNext.hidden = currentStep === TOTAL_STEPS;
  btnFinish.hidden = currentStep !== TOTAL_STEPS;

  const hints = {
    1: 'הזינו את הפרטים הכלליים',
    2: 'בחרו סוג והעלו תמונות',
    3: 'לא שכחתם כלום? בואו נסיים',
  };
  navHint.textContent = hints[currentStep];

  showError('');
  updateLivePreview();
}

function validateStep(step) {
  if (step === 1) {
    if (!wizardData.pageName.trim()) return 'שם הדף הוא שדה חובה';
    if (!wizardData.classification) return 'סיווג הוא שדה חובה';
  }

  if (step === 2) {
    if (isProjectTypeOtherSelected() && !getWizardProjectTypeValue()) {
      return 'יש להזין סוג פרויקט מותאם (עד 10 תווים)';
    }
    if (!wizardData.projectType) return 'סוג פרויקט הוא שדה חובה';
    if (!wizardData.enabledActions.length) return 'יש לבחור לפחות פעולת כפתור אחת';

    for (let i = 0; i < wizardData.enabledActions.length; i++) {
      const action = wizardData.enabledActions[i];
      const link = (wizardData.actionLinks[action] || '').trim();
      if (!link) return 'יש להזין קישור עבור "' + action + '"';
      try {
        const url = new URL(normalizeProjectLink(link));
        if (!/^https?:$/.test(url.protocol)) return 'הקישור ל"' + action + '" אינו תקין';
      } catch {
        return 'הקישור ל"' + action + '" אינו תקין';
      }
    }

    if (!wizardData.mainImage) return 'תמונה מייצגת היא שדה חובה';
  }

  return '';
}

function goToStep(step) {
  currentStep = step;
  updateStepUI();
}

/* ===== קריאת קבצים ===== */

function readFileAsDataURL(file, maxWidth, aspectRatio, keepTransparency) {
  maxWidth = maxWidth || 900;
  aspectRatio = aspectRatio || null;

  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        let srcX = 0;
        let srcY = 0;
        let srcW = img.width;
        let srcH = img.height;

        if (aspectRatio) {
          const imgRatio = img.width / img.height;
          if (imgRatio > aspectRatio) {
            srcW = Math.round(img.height * aspectRatio);
            srcX = Math.round((img.width - srcW) / 2);
          } else {
            srcH = Math.round(img.width / aspectRatio);
            srcY = Math.round((img.height - srcH) / 2);
          }
        }

        let width = srcW;
        let height = srcH;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (keepTransparency) {
          ctx.clearRect(0, 0, width, height);
        }
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, width, height);
        resolve(canvas.toDataURL(keepTransparency ? 'image/png' : 'image/jpeg', keepTransparency ? undefined : 0.82));
      };
      img.onerror = function () { resolve(reader.result); };
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function syncFormToData() {
  wizardData.pageName = document.getElementById('pageName').value.slice(0, 10);
  wizardData.unitName = document.getElementById('unitName').value.slice(0, 10);
  wizardData.notes = document.getElementById('notes').value.slice(0, 30);
  wizardData.date = '';
  wizardData.status = '';
  wizardData.classification = document.getElementById('classification').value;
  wizardData.projectType = getWizardProjectTypeValue();
  wizardData.primaryColor = document.getElementById('primaryColor').value;
  wizardData.secondaryColor = document.getElementById('secondaryColor').value;
  wizardData.fontFamily = document.getElementById('cardFont').value;
  wizardData.useImageBg = document.getElementById('useImageBg').checked;

  const enabled = [];
  if (document.getElementById('actionView').checked) enabled.push('צפייה');
  if (document.getElementById('actionDownload').checked) enabled.push('הורדה');
  if (document.getElementById('actionPrint').checked) enabled.push('הדפסה');
  wizardData.enabledActions = enabled;

  ['צפייה', 'הורדה', 'הדפסה'].forEach(function (action) {
    const input = document.getElementById('link-' + action);
    if (input) {
      wizardData.actionLinks[action] = input.value;
    }
  });

  document.getElementById('primaryColorHex').textContent = colorToDisplayHex(wizardData.primaryColor);
  document.getElementById('secondaryColorHex').textContent = colorToDisplayHex(wizardData.secondaryColor);
}

function renderActionLinkFields() {
  const container = document.getElementById('actionLinkFields');
  const enabled = wizardData.enabledActions || [];

  if (!enabled.length) {
    container.innerHTML = '<p class="field-subhint">בחרו לפחות פעולה אחת כדי להזין קישורים</p>';
    return;
  }

  container.innerHTML = enabled.map(function (action) {
    const value = wizardData.actionLinks[action] || '';
    return (
      '<div class="form-field form-field--full action-link-field">' +
        '<label for="link-' + action + '">קישור ל' + action + ' <span class="req">*</span></label>' +
        '<input type="url" id="link-' + action + '" value="' + escapeHtml(value) + '" placeholder="https://..." required>' +
      '</div>'
    );
  }).join('');

  enabled.forEach(function (action) {
    const input = document.getElementById('link-' + action);
    if (!input) return;
    input.addEventListener('input', function () {
      wizardData.actionLinks[action] = input.value;
      updateLivePreview();
    });
    input.addEventListener('change', function () {
      wizardData.actionLinks[action] = input.value;
      updateLivePreview();
    });
  });
}

function onActionCheckboxChange() {
  const view = document.getElementById('actionView');
  const download = document.getElementById('actionDownload');
  const print = document.getElementById('actionPrint');

  // אסור לבטל את האחרון שנשאר
  const checkedCount = [view, download, print].filter(function (el) { return el.checked; }).length;
  if (checkedCount === 0) {
    // מחזירים את זה שנלחץ
    const last = document.activeElement;
    if (last && last.type === 'checkbox') last.checked = true;
    else view.checked = true;
  }

  syncFormToData();
  renderActionLinkFields();
  updateLivePreview();
}

function bindLiveInputs() {
  const liveIds = [
    'pageName', 'unitName', 'notes',
    'classification', 'projectType',
    'cardFont', 'useImageBg',
  ];

  liveIds.forEach(function (id) {
    const el = document.getElementById(id);
    el.addEventListener('input', function () {
      if (id === 'projectType') syncProjectTypeCustomVisibility();
      syncFormToData();
      updateLivePreview();
    });
    el.addEventListener('change', function () {
      if (id === 'projectType') syncProjectTypeCustomVisibility();
      syncFormToData();
      updateLivePreview();
    });
  });

  const projectTypeCustom = document.getElementById('projectTypeCustom');
  if (projectTypeCustom) {
    projectTypeCustom.addEventListener('input', function () {
      projectTypeCustom.value = projectTypeCustom.value.slice(0, 10);
      syncFormToData();
      updateLivePreview();
    });
  }

  setupHslaField(document.getElementById('primaryColorPicker'), function (hex) {
    wizardData.primaryColor = hex;
    document.getElementById('primaryColorHex').textContent = colorToDisplayHex(hex);
    updateLivePreview();
  });

  setupHslaField(document.getElementById('secondaryColorPicker'), function (hex) {
    wizardData.secondaryColor = hex;
    document.getElementById('secondaryColorHex').textContent = colorToDisplayHex(hex);
    updateLivePreview();
  });

  ['actionView', 'actionDownload', 'actionPrint'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', onActionCheckboxChange);
  });

  document.getElementById('mainImage').addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    wizardData.mainImage = await readFileAsDataURL(file, 1000, 16 / 10);
    document.getElementById('mainImageText').hidden = true;
    const preview = document.getElementById('mainImagePreview');
    preview.src = wizardData.mainImage;
    preview.hidden = false;
    updateLivePreview();
  });

  document.getElementById('logoImage').addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    wizardData.logo = await readFileAsDataURL(file, 300, null, true);
    document.getElementById('logoImageText').hidden = true;
    const preview = document.getElementById('logoImagePreview');
    preview.src = wizardData.logo;
    preview.hidden = false;
    updateLivePreview();
  });

  document.getElementById('extraImages').addEventListener('change', async function (e) {
    const files = [...e.target.files];
    if (!files.length) return;
    wizardData.extraImages = await Promise.all(files.map(function (file) {
      return readFileAsDataURL(file, 600);
    }));
    document.getElementById('extraImagesText').textContent =
      files.length === 1 ? 'תמונה אחת הועלתה' : files.length + ' תמונות הועלו';
    const thumbs = document.getElementById('extraThumbs');
    thumbs.innerHTML = wizardData.extraImages.map(function (src) {
      return '<img src="' + src + '" alt="">';
    }).join('');
  });
}

/* ===== פתיחה / סגירה / שמירה ===== */

function fillMediaPreviews() {
  if (wizardData.mainImage) {
    document.getElementById('mainImageText').hidden = true;
    const preview = document.getElementById('mainImagePreview');
    preview.src = wizardData.mainImage;
    preview.hidden = false;
  } else {
    document.getElementById('mainImageText').hidden = false;
    document.getElementById('mainImagePreview').hidden = true;
    document.getElementById('mainImagePreview').src = '';
  }

  if (wizardData.logo) {
    document.getElementById('logoImageText').hidden = true;
    const preview = document.getElementById('logoImagePreview');
    preview.src = wizardData.logo;
    preview.hidden = false;
  } else {
    document.getElementById('logoImageText').hidden = false;
    document.getElementById('logoImagePreview').hidden = true;
    document.getElementById('logoImagePreview').src = '';
  }

  if (wizardData.extraImages && wizardData.extraImages.length) {
    document.getElementById('extraImagesText').textContent =
      wizardData.extraImages.length === 1
        ? 'תמונה אחת הועלתה'
        : wizardData.extraImages.length + ' תמונות הועלו';
    document.getElementById('extraThumbs').innerHTML = wizardData.extraImages.map(function (src) {
      return '<img src="' + src + '" alt="">';
    }).join('');
  } else {
    document.getElementById('extraImagesText').textContent = 'העלאה (אופציונלי)';
    document.getElementById('extraThumbs').innerHTML = '';
  }
}

function applyWizardDataToForm() {
  document.getElementById('pageName').value = wizardData.pageName || '';
  document.getElementById('unitName').value = wizardData.unitName || '';
  document.getElementById('notes').value = wizardData.notes || '';
  document.getElementById('classification').value = wizardData.classification || '';
  setWizardProjectTypeValue(wizardData.projectType || '');
  document.getElementById('primaryColor').value = wizardData.primaryColor || '#e87722';
  document.getElementById('secondaryColor').value = wizardData.secondaryColor || '#4a7c3f';
  setHslaFieldValue('primaryColor', wizardData.primaryColor || '#e87722');
  setHslaFieldValue('secondaryColor', wizardData.secondaryColor || '#4a7c3f');
  document.getElementById('primaryColorHex').textContent = colorToDisplayHex(wizardData.primaryColor || '#e87722');
  document.getElementById('secondaryColorHex').textContent = colorToDisplayHex(wizardData.secondaryColor || '#4a7c3f');
  setFontSelectValue(
    document.getElementById('cardFont'),
    wizardData.fontFamily || "'Segoe UI', Tahoma, Arial, sans-serif"
  );
  document.getElementById('useImageBg').checked = wizardData.useImageBg !== false;

  const enabled = wizardData.enabledActions || ['צפייה'];
  document.getElementById('actionView').checked = enabled.indexOf('צפייה') !== -1;
  document.getElementById('actionDownload').checked = enabled.indexOf('הורדה') !== -1;
  document.getElementById('actionPrint').checked = enabled.indexOf('הדפסה') !== -1;

  fillMediaPreviews();
  renderActionLinkFields();
}

function buildCardFromWizard(id) {
  const actionLinks = {};
  wizardData.enabledActions.forEach(function (action) {
    actionLinks[action] = normalizeProjectLink(wizardData.actionLinks[action] || '');
  });

  const firstLink = actionLinks[wizardData.enabledActions[0]] || '';

  return {
    id: id,
    title: wizardData.pageName.trim().slice(0, 10),
    unitName: wizardData.unitName.trim().slice(0, 10),
    description: wizardData.notes.trim() || 'כרטיס חדש',
    notes: wizardData.notes.trim().slice(0, 30),
    date: '',
    status: '',
    classification: wizardData.classification,
    projectType: wizardData.projectType,
    enabledActions: wizardData.enabledActions.slice(),
    actionLinks: actionLinks,
    projectLink: firstLink,
    link: firstLink,
    mainImage: wizardData.mainImage,
    extraImages: wizardData.extraImages.slice(),
    logo: wizardData.logo,
    primaryColor: wizardData.primaryColor,
    secondaryColor: wizardData.secondaryColor,
    fontFamily: wizardData.fontFamily,
    useImageBg: wizardData.useImageBg,
    gradient: getColorBlend(wizardData.primaryColor, wizardData.secondaryColor),
  };
}

function trySaveCards(cards, card, index) {
  let saved = saveCards(cards);

  if (!saved && card.extraImages.length) {
    card.extraImages = [];
    cards[index] = card;
    saved = saveCards(cards);
  }

  if (!saved && card.logo) {
    card.logo = '';
    cards[index] = card;
    saved = saveCards(cards);
  }

  return saved;
}

function updateWizardChrome() {
  const isEdit = !!editingCardId;
  document.getElementById('wizardTitle').textContent = isEdit ? 'עריכת כרטיס' : 'יצירת כרטיס חדש';
  btnFinish.textContent = isEdit ? '✓ שמירת שינויים' : '✓ שמירה';
}

function openWizard() {
  editingCardId = null;
  resetWizardData();
  wizardForm.reset();
  currentStep = 1;

  wizardData.date = '';
  wizardData.status = '';
  wizardData.useImageBg = true;
  wizardData.enabledActions = ['צפייה'];
  wizardData.actionLinks = { 'צפייה': '', 'הורדה': '', 'הדפסה': '' };
  wizardData.primaryColor = '#e87722';
  wizardData.secondaryColor = '#4a7c3f';
  wizardData.fontFamily = "'Segoe UI', Tahoma, Arial, sans-serif";

  applyWizardDataToForm();
  updateWizardChrome();

  modalOverlay.hidden = false;
  updateStepUI();
  document.getElementById('pageName').focus();
}

function openWizardForEdit(cardId) {
  const card = loadCards().find(function (c) { return c.id === cardId; });
  if (!card) {
    alert('הכרטיס לא נמצא');
    return;
  }

  editingCardId = cardId;
  resetWizardData();
  wizardForm.reset();
  currentStep = 1;

  wizardData.pageName = card.title || '';
  wizardData.unitName = card.unitName || '';
  wizardData.notes = card.notes || card.description || '';
  wizardData.date = '';
  wizardData.status = '';
  wizardData.classification = card.classification || '';
  wizardData.projectType = card.projectType || '';
  wizardData.mainImage = card.mainImage || '';
  wizardData.extraImages = (card.extraImages || []).slice();
  wizardData.logo = card.logo || '';
  wizardData.primaryColor = card.primaryColor || '#e87722';
  wizardData.secondaryColor = card.secondaryColor || '#4a7c3f';
  wizardData.fontFamily = card.fontFamily || "'Segoe UI', Tahoma, Arial, sans-serif";
  wizardData.useImageBg = card.useImageBg !== false;

  if (card.enabledActions && card.enabledActions.length) {
    wizardData.enabledActions = card.enabledActions.slice();
    wizardData.actionLinks = Object.assign(
      { 'צפייה': '', 'הורדה': '', 'הדפסה': '' },
      card.actionLinks || {}
    );
  } else {
    // תאימות לאחור
    const legacyAction = card.buttonAction || 'צפייה';
    const legacyLink = card.projectLink || card.link || '';
    wizardData.enabledActions = [legacyAction];
    wizardData.actionLinks = { 'צפייה': '', 'הורדה': '', 'הדפסה': '' };
    wizardData.actionLinks[legacyAction] = legacyLink;
  }

  applyWizardDataToForm();
  updateWizardChrome();

  modalOverlay.hidden = false;
  updateStepUI();
  document.getElementById('pageName').focus();
}

function closeWizard() {
  modalOverlay.hidden = true;
  editingCardId = null;
  showError('');
}

function finishWizard() {
  syncFormToData();

  for (let step = 1; step <= TOTAL_STEPS; step++) {
    const err = validateStep(step);
    if (err) {
      goToStep(step);
      showError(err);
      return;
    }
  }

  const cards = loadCards();

  if (editingCardId) {
    const index = cards.findIndex(function (c) { return c.id === editingCardId; });
    if (index === -1) {
      showError('הכרטיס לעריכה לא נמצא');
      return;
    }

    const updated = buildCardFromWizard(editingCardId);
    cards[index] = updated;

    if (!trySaveCards(cards, updated, index)) {
      showError('אין מספיק מקום לשמירה. נסו תמונה קטנה יותר וחזרו על שמירה.');
      return;
    }
  } else {
    const newCard = buildCardFromWizard(createCardId());
    cards.push(newCard);

    if (!trySaveCards(cards, newCard, cards.length - 1)) {
      showError('אין מספיק מקום לשמירה. נסו תמונה קטנה יותר וחזרו על שמירה.');
      return;
    }
    pendingCardPopId = newCard.id;
  }

  renderCards(cards);
  closeWizard();
}

/* ===== דף בית ===== */

function createHeaderItemId() {
  return 'hdr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function clampPercent(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(100, Math.max(0, Math.round(num * 10) / 10));
}

function clampHeaderHeight(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 180;
  return Math.min(560, Math.max(100, Math.round(num)));
}

function clampLogoWidth(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 14;
  return Math.min(40, Math.max(6, Math.round(num)));
}

function defaultHeaderFontSize(type) {
  if (type === 'title') return 36;
  if (type === 'subtitle') return 20;
  if (type === 'badge') return 16;
  if (type === 'logo') return 12;
  return 16;
}

function clampFontSize(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback || 16;
  return Math.min(56, Math.max(10, Math.round(num)));
}

/** אייקון קטן לשדות עריכה — התווית המלאה ב-title/aria */
function editIco(kind) {
  return '<span class="edit-ico" data-ico="' + kind + '" aria-hidden="true"></span>';
}

function homeSizeControlHtml(id, value, options) {
  options = options || {};
  const min = options.min != null ? options.min : 10;
  const max = options.max != null ? options.max : 56;
  const step = options.step != null ? options.step : 1;
  const unit = options.unit || 'px';
  const label = options.label || 'גודל';
  const ico = options.ico || 'size';
  const num = Math.min(max, Math.max(min, Number(value) || min));
  return (
    '<div class="edit-size" title="' + escapeHtml(label) + '">' +
      editIco(ico) +
      '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + num + '"' +
        ' class="size-control-range" aria-label="' + escapeHtml(label) + '">' +
      '<input type="number" id="' + id + 'Num" min="' + min + '" max="' + max + '" step="' + step + '" value="' + num + '"' +
        ' class="size-control-num" inputmode="numeric" aria-label="' + escapeHtml(label) + '">' +
      '<span class="size-control-unit">' + escapeHtml(unit) + '</span>' +
    '</div>'
  );
}

function homeTextSizeHtml(id, value, fallback, labelText) {
  return homeSizeControlHtml(id, clampFontSize(value, fallback || 16), {
    min: 10,
    max: 56,
    step: 1,
    unit: 'px',
    label: labelText || 'גודל גופן',
    ico: 'text-size',
  });
}

function normalizeTextColor(value, fallback) {
  const fallbackColor = fallback || '#ffffff';
  try {
    return colorToDisplayHex(value || fallbackColor);
  } catch (_) {
    return fallbackColor;
  }
}

function homeColorChipHtml(id, value, options) {
  options = options || {};
  const color = normalizeTextColor(value, options.fallback || '#ffffff');
  const label = options.label || 'צבע';
  const ico = options.ico || 'fill';
  return (
    '<div class="edit-color-chip" title="' + escapeHtml(label) + '">' +
      editIco(ico) +
      '<div class="hsla-field hsla-field--chip" id="' + id + 'Picker" data-hsla-for="' + id + '">' +
        '<button type="button" class="hsla-swatch" title="' + escapeHtml(label) + '" aria-label="' + escapeHtml(label) + '"></button>' +
        '<input type="hidden" id="' + id + '" value="' + escapeHtml(color) + '">' +
      '</div>' +
      '<span class="edit-color-chip-label">' + escapeHtml(options.shortLabel || label) + '</span>' +
    '</div>'
  );
}

function homeColorRowHtml(chipsHtml) {
  return '<div class="edit-color-row">' + chipsHtml + '</div>';
}

function homeTextColorHtml(id, value, labelText) {
  return homeColorChipHtml(id, value, {
    label: labelText || 'צבע טקסט',
    shortLabel: 'טקסט',
    ico: 'text',
  });
}

function homeStyleRowHtml(sizeHtml, colorChipsHtml) {
  return (
    '<div class="edit-style-row">' +
      (sizeHtml || '') +
      (colorChipsHtml ? homeColorRowHtml(colorChipsHtml) : '') +
    '</div>'
  );
}

function bindHomeTextColorField(id) {
  const picker = document.getElementById(id + 'Picker');
  if (!picker) return;
  picker.dataset.hslaReady = '';
  setupHslaField(picker, function () {
    scheduleHomeEditorPreview();
  });
}

function bindHomeTextSizeField(id) {
  const range = document.getElementById(id);
  const num = document.getElementById(id + 'Num');
  if (!range || !num) return;

  function apply(raw, from) {
    const size = clampFontSize(raw, 16);
    if (from !== 'range') range.value = String(size);
    if (from !== 'num') num.value = String(size);
    scheduleHomeEditorPreview();
    return size;
  }

  range.addEventListener('input', function () {
    apply(range.value, 'range');
  });

  num.addEventListener('input', function () {
    if (num.value === '' || num.value === '-') return;
    apply(num.value, 'num');
  });

  num.addEventListener('change', function () {
    apply(num.value === '' ? range.value : num.value, 'num');
  });

  num.addEventListener('blur', function () {
    apply(num.value === '' ? range.value : num.value, 'num');
  });
}

function normalizeHeaderItem(item) {
  if (!item || typeof item !== 'object') return null;
  const type = item.type;
  if (type !== 'logo' && type !== 'title' && type !== 'subtitle' && type !== 'badge') return null;

  const base = {
    id: item.id || createHeaderItemId(),
    type: type,
    x: clampPercent(item.x, 50),
    y: clampPercent(item.y, 50),
  };

  if (type === 'logo') {
    return Object.assign(base, {
      src: item.src || '',
      link: item.link || '',
      caption: item.caption || '',
      w: clampLogoWidth(item.w),
      fontSize: clampFontSize(item.fontSize, defaultHeaderFontSize('logo')),
      color: normalizeTextColor(item.color, '#ffffff'),
    });
  }

  const maxLen = type === 'badge' ? 20 : 40;
  return Object.assign(base, {
    text: type === 'badge'
      ? normalizeHeaderBadgeText(item.text)
      : (item.text == null ? '' : String(item.text).slice(0, maxLen)),
    align: item.align === 'left' || item.align === 'right' ? item.align : 'center',
    fontSize: clampFontSize(item.fontSize, defaultHeaderFontSize(type)),
    color: normalizeTextColor(item.color, '#ffffff'),
  });
}

function normalizeHeader(header, fallbackTitle) {
  const source = header && typeof header === 'object' ? header : {};
  const items = Array.isArray(source.items)
    ? source.items.map(normalizeHeaderItem).filter(Boolean)
    : [];

  if (!items.some(function (item) { return item.type === 'title'; })) {
    items.push({
      id: createHeaderItemId(),
      type: 'title',
      text: String(fallbackTitle || 'פורטל תוכן').slice(0, 40),
      x: 50,
      y: 45,
      align: 'center',
    });
  }

  return {
    height: clampHeaderHeight(source.height),
    bgOpacity: clampBgOpacity(source.bgOpacity),
    bgImage: source.bgImage || '',
    items: items,
  };
}

function migrateLegacyHeader(parsed) {
  const items = [];
  const logos = Array.isArray(parsed.titleLogos) ? parsed.titleLogos : null;

  if (logos && logos.length) {
    logos.forEach(function (logo, idx) {
      if (!logo || !logo.src) return;
      const align = logo.align === 'left' ? 'left' : 'right';
      items.push(normalizeHeaderItem({
        type: 'logo',
        src: logo.src,
        link: logo.link || '',
        caption: logo.caption || '',
        x: align === 'left' ? 12 : (88 - idx * 16),
        y: 18,
        w: logo.w || 14,
      }));
    });
  } else if (parsed.titleLogoEnabled && parsed.titleLogo) {
    const align = parsed.titleLogoAlign === 'left' ? 'left' : 'right';
    items.push(normalizeHeaderItem({
      type: 'logo',
      src: parsed.titleLogo,
      link: parsed.titleLogoLink || '',
      caption: '',
      x: align === 'left' ? 12 : 88,
      y: 18,
      w: 14,
    }));
  }

  items.push(normalizeHeaderItem({
    type: 'title',
    text: (parsed.title || DEFAULT_HOME.title || 'פורטל תוכן').slice(0, 40),
    x: 50,
    y: 48,
    align: 'center',
  }));

  return normalizeHeader({
    height: 180,
    bgOpacity: migrateBgOpacity(parsed, 'title'),
    bgImage: parsed.titleImage || '',
    items: items,
  }, parsed.title);
}

function buildHomeHeader(parsed) {
  if (parsed && parsed.header && Array.isArray(parsed.header.items)) {
    return normalizeHeader(parsed.header, parsed.title);
  }
  if (parsed && (
    Object.prototype.hasOwnProperty.call(parsed, 'title') ||
    Object.prototype.hasOwnProperty.call(parsed, 'titleLogo') ||
    Object.prototype.hasOwnProperty.call(parsed, 'titleImage') ||
    Object.prototype.hasOwnProperty.call(parsed, 'titleLogos')
  )) {
    return migrateLegacyHeader(parsed);
  }
  return normalizeHeader(DEFAULT_HOME.header, DEFAULT_HOME.title);
}

function syncTitleFromHeader(home) {
  const titleItem = (home.header && home.header.items || []).find(function (item) {
    return item.type === 'title';
  });
  home.title = titleItem ? String(titleItem.text || '').slice(0, 40) : '';
  return home.title;
}

function getHeaderTitleText(home) {
  const titleItem = (home.header && home.header.items || []).find(function (item) {
    return item.type === 'title';
  });
  if (titleItem) return String(titleItem.text || '');
  return home.title == null ? DEFAULT_HOME.title : String(home.title);
}

function formatClassificationBadge(text) {
  const label = normalizeHeaderBadgeText(text);
  return '- ' + label + ' -';
}

const HEADER_BADGE_OPTIONS = ['בלמ״ס', 'שמור', 'סודי', 'סודי ביותר'];

function normalizeHeaderBadgeText(value) {
  const raw = String(value || '').trim().replace(/^[\s\-–—]+|[\s\-–—]+$/g, '').trim();
  if (HEADER_BADGE_OPTIONS.indexOf(raw) !== -1) return raw;
  /* תאימות לכתיב ישן של גרשיים */
  const compact = raw.replace(/["״׳']/g, '');
  const match = HEADER_BADGE_OPTIONS.find(function (opt) {
    return opt.replace(/["״׳']/g, '') === compact;
  });
  return match || 'שמור';
}

function loadHome() {
  const saved = localStorage.getItem(HOME_STORAGE_KEY);
  let home = Object.assign({}, DEFAULT_HOME);
  home.header = normalizeHeader(DEFAULT_HOME.header, DEFAULT_HOME.title);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      home = Object.assign({}, DEFAULT_HOME, parsed);
      home.introBgOpacity = migrateBgOpacity(parsed, 'intro');
      home.intro2BgOpacity = migrateBgOpacity(parsed, 'intro2');
      home.closingBgOpacity = migrateBgOpacity(parsed, 'closing');
      home.closing2BgOpacity = migrateBgOpacity(parsed, 'closing2');
      home.hasIntro2 = !!home.hasIntro2;
      home.hasClosing2 = !!home.hasClosing2;
      home.header = buildHomeHeader(parsed);
      syncTitleFromHeader(home);
      stripLegacyHeaderFields(home);
      if (!Object.prototype.hasOwnProperty.call(parsed, 'cardsLayoutMode') && parsed.categoriesEnabled) {
        home.cardsLayoutMode = 'categories';
      } else {
        home.cardsLayoutMode = getCardsLayoutMode(home);
      }
      home.categoriesEnabled = home.cardsLayoutMode === 'categories';
      home.categories = Array.isArray(home.categories) ? home.categories : [];
      home.cardsFreeHeight = clampCardsFreeHeight(home.cardsFreeHeight);
      home.cardsFreeSize = clampCardFreeWidth(home.cardsFreeSize);
      home.cardPositions = home.cardPositions && typeof home.cardPositions === 'object'
        ? home.cardPositions
        : {};
    } catch {
      home = Object.assign({}, DEFAULT_HOME);
      home.header = normalizeHeader(DEFAULT_HOME.header, DEFAULT_HOME.title);
    }
  }
  return home;
}

function migrateBgOpacity(parsed, kind) {
  const opacityKey = kind + 'BgOpacity';
  const hasBgKey = kind === 'title' ? 'titleHasBg' : kind + 'HasBg';
  const noBgKey = kind === 'title' ? 'titleNoBg' : kind + 'NoBg';

  if (Object.prototype.hasOwnProperty.call(parsed, opacityKey)) {
    return clampBgOpacity(parsed[opacityKey]);
  }
  if (Object.prototype.hasOwnProperty.call(parsed, hasBgKey)) {
    return parsed[hasBgKey] ? 100 : 0;
  }
  if (Object.prototype.hasOwnProperty.call(parsed, noBgKey)) {
    return parsed[noBgKey] ? 0 : 100;
  }
  return 100;
}

function clampBgOpacity(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 100;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function stripLegacyHeaderFields(home) {
  delete home.titleImage;
  delete home.titleBgOpacity;
  delete home.titleLogoEnabled;
  delete home.titleLogo;
  delete home.titleLogoLink;
  delete home.titleLogoAlign;
  delete home.titleLogos;
  delete home.titleHasBg;
  delete home.titleNoBg;
  return home;
}

function saveHome(home) {
  try {
    stripLegacyHeaderFields(home);
    if (home.header) {
      home.header = normalizeHeader(home.header, home.title);
      syncTitleFromHeader(home);
    }
    localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(home));
    return true;
  } catch (err) {
    console.error('שגיאת שמירת דף בית:', err);
    return false;
  }
}

const MEDIA_SECTION_KEYS = [
  'Text', 'TextSize', 'TextColor', 'Image', 'Video', 'MediaType', 'BgOpacity', 'SizeAuto', 'Height',
  'VideoFit', 'VideoZoom', 'VideoPosX', 'VideoPosY', 'VideoBgMode', 'VideoBgColor',
  'DevTeam', 'DevTeamImage', 'DevTeamLink', 'DevTeamFontSize', 'DevTeamColor', 'DevTeamSize',
  'DevTeamBgColor', 'DevTeamBorderColor', 'DevTeamBorderWidth', 'DevTeamGlow', 'DevTeamSlant',
  'DevTeamX', 'DevTeamY',
];

function copyMediaSectionFields(home, fromKind, toKind) {
  MEDIA_SECTION_KEYS.forEach(function (suffix) {
    home[toKind + suffix] = home[fromKind + suffix];
  });
}

function clearMediaSectionFields(home, kind) {
  const defaults = DEFAULT_HOME;
  MEDIA_SECTION_KEYS.forEach(function (suffix) {
    const key = kind + suffix;
    home[key] = Object.prototype.hasOwnProperty.call(defaults, key) ? defaults[key] : (
      suffix === 'MediaType' ? 'bg' :
      suffix === 'TextSize' ? 16 :
      suffix === 'TextColor' ? '#ffffff' :
      suffix === 'BgOpacity' || suffix === 'VideoZoom' ? (suffix === 'VideoZoom' ? 100 : 100) :
      suffix === 'Height' ? 280 :
      suffix === 'SizeAuto' ? true :
      suffix === 'VideoFit' ? 'cover' :
      suffix === 'VideoPosX' || suffix === 'VideoPosY' ? 50 :
      suffix === 'VideoBgMode' ? 'transparent' :
      suffix === 'VideoBgColor' ? '#2f5a28' :
      suffix === 'DevTeam' ? false :
      suffix === 'DevTeamFontSize' ? 16 :
      suffix === 'DevTeamColor' ? '#ffffff' :
      suffix === 'DevTeamSize' ? 100 :
      suffix === 'DevTeamBgColor' ? '#4a7c3f' :
      suffix === 'DevTeamBorderColor' ? '#ffffff' :
      suffix === 'DevTeamBorderWidth' ? 2 :
      suffix === 'DevTeamGlow' || suffix === 'DevTeamSlant' ? false :
      suffix === 'DevTeamX' ? 50 :
      suffix === 'DevTeamY' ? 78 :
      ''
    );
  });
}

function getSectionHeightEl(kind) {
  if (kind === 'header') return document.getElementById('homeHeaderCanvas');
  if (kind === 'intro') return document.getElementById('homeIntroMain');
  if (kind === 'intro2') return document.getElementById('homeIntro2Main');
  if (kind === 'closing') return document.getElementById('homeClosing');
  if (kind === 'closing2') return document.getElementById('homeClosing2');
  return null;
}

function getSectionRootEl(kind) {
  if (kind === 'intro') return document.getElementById('homeIntro');
  if (kind === 'intro2') return document.getElementById('homeIntro2');
  if (kind === 'closing') return document.getElementById('homeClosing');
  if (kind === 'closing2') return document.getElementById('homeClosing2');
  return null;
}

function getSectionBgEl(kind) {
  if (kind === 'intro') return document.getElementById('homeIntroBg');
  if (kind === 'intro2') return document.getElementById('homeIntro2Bg');
  if (kind === 'closing') return document.getElementById('homeClosingBg');
  if (kind === 'closing2') return document.getElementById('homeClosing2Bg');
  return null;
}

function syncHomeSectionControls(home) {
  home = home || loadHome();

  const intro2 = document.getElementById('homeIntro2');
  const closing2 = document.getElementById('homeClosing2');
  const intro = document.getElementById('homeIntro');
  const closing = document.getElementById('homeClosing');

  [intro, intro2, closing, closing2].forEach(function (el) {
    if (!el) return;
    el.classList.remove('is-removing');
    el.style.removeProperty('opacity');
  });

  if (intro2) intro2.hidden = !home.hasIntro2;
  if (closing2) closing2.hidden = !home.hasClosing2;

  document.querySelectorAll('[data-dup-home]').forEach(function (btn) {
    const kind = btn.dataset.dupHome;
    const blocked = (kind === 'intro' && home.hasIntro2) || (kind === 'closing' && home.hasClosing2);
    btn.hidden = !editMode || blocked;
  });

  document.querySelectorAll('[data-delete-home]').forEach(function (btn) {
    const kind = btn.dataset.deleteHome;
    const allowed = (kind === 'intro2' && home.hasIntro2) || (kind === 'closing2' && home.hasClosing2);
    btn.hidden = !editMode || !allowed;
  });

  document.querySelectorAll('[data-edit-home]').forEach(function (btn) {
    const section = btn.dataset.editHome;
    if (section === 'intro2') {
      btn.hidden = !editMode || !home.hasIntro2;
    } else if (section === 'closing2') {
      btn.hidden = !editMode || !home.hasClosing2;
    } else {
      btn.hidden = !editMode;
    }
  });
}

async function duplicateHomeSection(kind) {
  if (kind !== 'intro' && kind !== 'closing') return;

  const home = loadHome();
  const flag = kind === 'intro' ? 'hasIntro2' : 'hasClosing2';
  if (home[flag]) return;

  const toKind = kind + '2';
  copyMediaSectionFields(home, kind, toKind);
  if (kind === 'intro') {
    home.intro2Subtitle = (home.subtitle || '').slice(0, 10);
    home.intro2SubtitleSize = home.subtitleSize || DEFAULT_HOME.subtitleSize;
    home.intro2SubtitleColor = home.subtitleColor || DEFAULT_HOME.subtitleColor;
  }
  home[flag] = true;

  if (home[kind + 'Video']) {
    try {
      const stored = await getHomeVideo(kind);
      if (stored && stored.blob) {
        const file = new File(
          [stored.blob],
          stored.name || home[kind + 'Video'] || 'video.mp4',
          { type: stored.type || stored.blob.type || 'video/mp4' }
        );
        await putHomeVideo(toKind, file);
        home[toKind + 'Video'] = file.name;
      }
    } catch (err) {
      console.warn('Video copy failed', err);
      home[toKind + 'Video'] = '';
      home[toKind + 'MediaType'] = 'bg';
    }
  }

  if (!saveHome(home)) {
    alert('אין מספיק מקום לשמירה.');
    return;
  }
  await renderHome();
}

async function deleteSecondaryHomeSection(kind) {
  if (kind !== 'intro2' && kind !== 'closing2') return;

  const label = kind === 'intro2' ? 'פתיח 2' : 'סגירה 2';
  if (!confirm('למחוק את "' + label + '"?')) return;

  const sectionEl = getSectionRootEl(kind);
  if (sectionEl) {
    await animateElementOut(sectionEl);
    sectionEl.classList.remove('is-removing');
    sectionEl.style.removeProperty('opacity');
  }

  const home = loadHome();
  clearMediaSectionFields(home, kind);
  if (kind === 'intro2') {
    home.intro2Subtitle = '';
    home.hasIntro2 = false;
  } else {
    home.hasClosing2 = false;
  }

  try {
    await deleteHomeVideo(kind);
  } catch (err) {
    console.warn(err);
  }

  if (!saveHome(home)) {
    alert('שגיאה בשמירה לאחר מחיקה.');
    return;
  }
  await renderHome();
}

function setSectionBackground(el, imageUrl) {
  if (!el) return;
  clearSectionMedia(el);
  if (imageUrl) {
    el.style.backgroundImage = 'url(' + JSON.stringify(imageUrl) + ')';
    el.classList.add('has-image');
  } else {
    el.style.backgroundImage = '';
    el.classList.remove('has-image');
  }
}

function clearSectionMedia(el) {
  if (!el) return;
  el.querySelectorAll('.home-section-video, .home-section-iframe').forEach(function (node) {
    if (node.tagName === 'VIDEO' && node.src && node.src.indexOf('blob:') === 0) {
      URL.revokeObjectURL(node.src);
    }
    node.remove();
  });
  el.classList.remove('has-media', 'has-video-bg-color');
  el.style.removeProperty('--video-underlay-color');
}

const VIDEO_DB_NAME = 'hebet-media';
const VIDEO_STORE = 'videos';
const CARDS_BG_IDB_KEY = 'cards-bg';
const CARDS_BG_MARKER = 'idb:cards-bg';
const videoMemoryStore = Object.create(null);
let videoDbProbe = null; /* null=unknown, true/false */
let cardsBgImageCache = '';
let cardsBgObjectUrl = '';

function isFileProtocol() {
  return typeof location !== 'undefined' && location.protocol === 'file:';
}

function friendlyMediaDbError(err) {
  const raw = String((err && (err.message || err.name)) || err || '');
  if (/backing store|IndexedDB|IDBDatabase|UnknownError|Internal error/i.test(raw) || isFileProtocol()) {
    return (
      'לא ניתן לשמור מדיה בדפדפן כרגע.\n\n' +
      (isFileProtocol()
        ? 'הדף נפתח מקובץ מקומי (file://). IndexedDB לעיתים נחסם במצב הזה.\n' +
          'פתחו את האתר דרך שרת מקומי (למשל Live Server ב-VS Code / Cursor) ואז שמרו שוב.'
        : 'נסו לרענן את הדף, לסגור חלונות פרטיים, או לנקות נתוני אתר לדף הזה.')
    );
  }
  return raw || 'שגיאה בשמירת מדיה';
}

function isBrowserPlayableVideo(file) {
  if (!file) return false;
  const type = String(file.type || '').toLowerCase();
  const name = String(file.name || '').toLowerCase();
  if (/^video\/(mp4|webm|ogg)/.test(type)) return true;
  if (/\.(mp4|webm|ogg|m4v)$/.test(name)) return true;
  return false;
}

function rememberVideoInMemory(key, fileOrRecord) {
  if (!key) return;
  if (fileOrRecord && fileOrRecord.blob) {
    videoMemoryStore[key] = {
      blob: fileOrRecord.blob,
      name: fileOrRecord.name || 'video',
      type: fileOrRecord.type || 'video/mp4',
    };
    return;
  }
  if (fileOrRecord) {
    videoMemoryStore[key] = {
      blob: fileOrRecord,
      name: fileOrRecord.name || 'video',
      type: fileOrRecord.type || 'video/mp4',
    };
  }
}

function revokeCardsBgObjectUrl() {
  if (cardsBgObjectUrl) {
    URL.revokeObjectURL(cardsBgObjectUrl);
    cardsBgObjectUrl = '';
  }
}

function getResolvedCardsBgImage(home) {
  const raw = home && home.cardsBgImage ? String(home.cardsBgImage) : '';
  if (!raw) return '';
  if (raw === CARDS_BG_MARKER) return cardsBgImageCache || '';
  if (raw.indexOf('data:') === 0 || raw.indexOf('blob:') === 0) return raw;
  return cardsBgImageCache || '';
}

async function persistCardsBgImage(dataUrl) {
  if (!dataUrl) {
    revokeCardsBgObjectUrl();
    cardsBgImageCache = '';
    try { await deleteHomeVideo(CARDS_BG_IDB_KEY); } catch (_) {}
    return '';
  }
  cardsBgImageCache = dataUrl;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  await putHomeVideo(
    CARDS_BG_IDB_KEY,
    new File([blob], 'cards-bg.jpg', { type: blob.type || 'image/jpeg' })
  );
  return CARDS_BG_MARKER;
}

async function hydrateCardsBgImage(home) {
  home = home || loadHome();
  const raw = home.cardsBgImage ? String(home.cardsBgImage) : '';
  if (!raw) {
    revokeCardsBgObjectUrl();
    cardsBgImageCache = '';
    return home;
  }
  if (raw.indexOf('data:') === 0) {
    try {
      home.cardsBgImage = await persistCardsBgImage(raw);
      saveHome(home);
    } catch (err) {
      console.warn('cards bg migrate failed', err);
      cardsBgImageCache = raw;
    }
    return home;
  }
  if (raw === CARDS_BG_MARKER) {
    try {
      const rec = await getHomeVideo(CARDS_BG_IDB_KEY);
      revokeCardsBgObjectUrl();
      if (rec && rec.blob) {
        cardsBgObjectUrl = URL.createObjectURL(rec.blob);
        cardsBgImageCache = cardsBgObjectUrl;
      } else {
        cardsBgImageCache = '';
        home.cardsBgImage = '';
        saveHome(home);
      }
    } catch (err) {
      console.warn('cards bg load failed', err);
      cardsBgImageCache = '';
    }
  }
  return home;
}

function openFontsDb() {
  return new Promise(function (resolve, reject) {
    const request = indexedDB.open(FONTS_DB_NAME, 1);
    request.onupgradeneeded = function () {
      const db = request.result;
      if (!db.objectStoreNames.contains(FONTS_STORE)) {
        db.createObjectStore(FONTS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error || new Error('IndexedDB fonts failed')); };
  });
}

function listCustomFonts() {
  return openFontsDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(FONTS_STORE, 'readonly');
      const req = tx.objectStore(FONTS_STORE).getAll();
      req.onsuccess = function () { resolve(req.result || []); };
      req.onerror = function () { reject(req.error || new Error('שגיאה בטעינת גופנים')); };
    });
  });
}

function putCustomFont(record) {
  return openFontsDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(FONTS_STORE, 'readwrite');
      tx.objectStore(FONTS_STORE).put(record);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error || new Error('שגיאה בשמירת גופן')); };
    });
  });
}

function fontDisplayNameFromFile(fileName) {
  const base = String(fileName || 'CustomFont').replace(/\.[^.]+$/, '').trim() || 'CustomFont';
  const clean = base.replace(/[^\u0590-\u05FFa-zA-Z0-9 _-]/g, ' ').replace(/\s+/g, ' ').trim();
  return clean || 'CustomFont';
}

function cssValueForFontFamily(family) {
  const safe = String(family || 'CustomFont').replace(/'/g, '');
  return "'" + safe + "', sans-serif";
}

async function registerCustomFont(record) {
  if (!record || !record.family || !record.blob) return;
  if (registeredFontFamilies[record.family]) return;

  const buffer = await record.blob.arrayBuffer();
  const face = new FontFace(record.family, buffer);
  await face.load();
  document.fonts.add(face);
  registeredFontFamilies[record.family] = true;
}

async function loadAndRegisterCustomFonts() {
  const fonts = await listCustomFonts();
  customFontsCache = Array.isArray(fonts) ? fonts.slice() : [];
  customFontsCache.sort(function (a, b) {
    return String(a.name || '').localeCompare(String(b.name || ''), 'he');
  });

  for (let i = 0; i < customFontsCache.length; i += 1) {
    try {
      await registerCustomFont(customFontsCache[i]);
    } catch (err) {
      console.warn('Failed to register font', customFontsCache[i] && customFontsCache[i].name, err);
    }
  }
}

function populateFontSelects() {
  const selectIds = ['siteFont', 'cardFont'];
  selectIds.forEach(function (id) {
    const select = document.getElementById(id);
    if (!select) return;

    const current = select.value;
    select.innerHTML = '';

    const builtinGroup = document.createElement('optgroup');
    builtinGroup.label = 'גופנים מובנים';
    BUILTIN_FONTS.forEach(function (font) {
      const opt = document.createElement('option');
      opt.value = font.value;
      opt.textContent = font.label;
      opt.style.fontFamily = font.value;
      builtinGroup.appendChild(opt);
    });
    select.appendChild(builtinGroup);

    if (customFontsCache.length) {
      const customGroup = document.createElement('optgroup');
      customGroup.label = 'גופנים שהועלו';
      customFontsCache.forEach(function (font) {
        const opt = document.createElement('option');
        opt.value = font.cssValue;
        opt.textContent = font.name;
        opt.style.fontFamily = font.cssValue;
        customGroup.appendChild(opt);
      });
      select.appendChild(customGroup);
    }

    setFontSelectValue(select, current);
  });
}

function setFontSelectValue(select, value) {
  if (!select || !value) return;
  const exists = Array.prototype.some.call(select.options, function (opt) {
    return opt.value === value;
  });
  if (!exists) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = 'גופן שמור';
    opt.style.fontFamily = value;
    select.appendChild(opt);
  }
  select.value = value;
}

async function handleFontUpload(file, target) {
  if (!file) return;

  if (!FONT_FILE_RE.test(file.name)) {
    alert('נא לבחור קובץ גופן: TTF, OTF, WOFF או WOFF2');
    return;
  }
  if (file.size > MAX_FONT_BYTES) {
    alert('קובץ הגופן גדול מדי (מקסימום 8MB)');
    return;
  }

  const baseName = fontDisplayNameFromFile(file.name);
  let family = baseName;
  let suffix = 2;
  while (
    customFontsCache.some(function (f) { return f.family === family; }) ||
    BUILTIN_FONTS.some(function (f) { return f.label === family; })
  ) {
    family = baseName + ' ' + suffix;
    suffix += 1;
  }

  const id = 'font-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  const cssValue = cssValueForFontFamily(family);
  const record = {
    id: id,
    name: family,
    family: family,
    cssValue: cssValue,
    blob: file,
    type: file.type || 'application/octet-stream',
    fileName: file.name,
  };

  try {
    await registerCustomFont(record);
    await putCustomFont(record);
    customFontsCache.push(record);
    customFontsCache.sort(function (a, b) {
      return String(a.name || '').localeCompare(String(b.name || ''), 'he');
    });
    populateFontSelects();

    if (target === 'site') {
      const siteFont = document.getElementById('siteFont');
      if (siteFont) siteFont.value = cssValue;
      updateHomeField({ siteFont: cssValue });
    } else {
      const cardFont = document.getElementById('cardFont');
      if (cardFont) cardFont.value = cssValue;
      wizardData.fontFamily = cssValue;
      updateLivePreview();
    }
  } catch (err) {
    console.error(err);
    alert('לא הצלחנו לטעון את הגופן. נסו קובץ אחר.');
  }
}

function openVideoDb() {
  if (videoDbProbe === false) {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }
  return new Promise(function (resolve, reject) {
    if (!window.indexedDB) {
      videoDbProbe = false;
      reject(new Error('IndexedDB לא נתמך בדפדפן זה'));
      return;
    }
    let settled = false;
    try {
      const request = indexedDB.open(VIDEO_DB_NAME, 1);
      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(VIDEO_STORE)) {
          db.createObjectStore(VIDEO_STORE);
        }
      };
      request.onsuccess = function () {
        if (settled) return;
        settled = true;
        videoDbProbe = true;
        resolve(request.result);
      };
      request.onerror = function () {
        if (settled) return;
        settled = true;
        videoDbProbe = false;
        reject(request.error || new Error('IndexedDB failed'));
      };
      request.onblocked = function () {
        if (settled) return;
        settled = true;
        videoDbProbe = false;
        reject(new Error('IndexedDB חסום'));
      };
    } catch (err) {
      videoDbProbe = false;
      reject(err);
    }
  });
}

function putHomeVideo(key, file) {
  rememberVideoInMemory(key, file);
  return openVideoDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(VIDEO_STORE, 'readwrite');
      tx.objectStore(VIDEO_STORE).put({
        blob: file,
        name: file.name || 'video',
        type: file.type || 'video/mp4',
      }, key);
      tx.oncomplete = function () { resolve({ ephemeral: false }); };
      tx.onerror = function () { reject(tx.error || new Error('שגיאה בשמירת סרטון')); };
      tx.onabort = function () { reject(tx.error || new Error('שמירת סרטון בוטלה')); };
    });
  }).catch(function (err) {
    /* גיבוי לזיכרון — הסרטון יוצג בסשן גם אם IndexedDB נכשל */
    console.warn('Video IDB put failed, using memory store', err);
    return { ephemeral: true, error: err };
  });
}

function getHomeVideo(key) {
  if (videoMemoryStore[key] && videoMemoryStore[key].blob) {
    return Promise.resolve(videoMemoryStore[key]);
  }
  return openVideoDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(VIDEO_STORE, 'readonly');
      const req = tx.objectStore(VIDEO_STORE).get(key);
      req.onsuccess = function () {
        const result = req.result || null;
        if (result) rememberVideoInMemory(key, result);
        resolve(result);
      };
      req.onerror = function () { reject(req.error || new Error('שגיאה בטעינת סרטון')); };
    });
  }).catch(function (err) {
    console.warn('Video IDB get failed', err);
    return videoMemoryStore[key] || null;
  });
}

function deleteHomeVideo(key) {
  delete videoMemoryStore[key];
  return openVideoDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(VIDEO_STORE, 'readwrite');
      tx.objectStore(VIDEO_STORE).delete(key);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error || new Error('שגיאה במחיקת סרטון')); };
    });
  }).catch(function () {
    /* כבר נמחק מהזיכרון */
  });
}

async function setSectionMedia(el, options) {
  if (!el) return;
  clearSectionMedia(el);
  el.style.backgroundImage = '';
  el.style.background = '';
  el.classList.remove('has-image', 'has-media');

  const sectionEl = options.sectionEl;
  if (sectionEl) sectionEl.classList.remove('home-section--video-only');

  if (options.noBg && options.mediaType !== 'video' && !options.image) {
    return;
  }

  const fit = options.videoFit === 'contain' ? 'contain' : 'cover';
  const zoom = Math.min(200, Math.max(50, Number(options.videoZoom) || 100)) / 100;
  const posX = Math.min(100, Math.max(0, Number(options.videoPosX) || 50));
  const posY = Math.min(100, Math.max(0, Number(options.videoPosY) || 50));

  el.style.setProperty('--video-fit', fit);
  el.style.setProperty('--video-zoom', String(zoom));
  el.style.setProperty('--video-pos-x', posX + '%');
  el.style.setProperty('--video-pos-y', posY + '%');

  if (options.mediaType === 'video' && options.videoKey && options.hasVideo) {
    try {
      let videoSrc = '';
      if (options.videoFile) {
        videoSrc = URL.createObjectURL(options.videoFile);
      } else {
        const record = await getHomeVideo(options.videoKey);
        if (!record || !record.blob) return;
        videoSrc = URL.createObjectURL(record.blob);
      }

      el.style.backgroundImage = 'none';
      el.classList.remove('has-video-bg-color');
      el.style.removeProperty('background');
      el.style.removeProperty('--video-underlay-color');

      if (options.videoBgMode === 'color') {
        const underlay = options.videoBgColor || '#2f5a28';
        el.style.setProperty('--video-underlay-color', underlay);
        el.classList.add('has-video-bg-color');
        el.style.removeProperty('background-color');
      } else {
        // שקיפות מלאה מאחורי הסרטון — לא תלויה בשקיפות רקע של המקטע
        el.style.backgroundColor = 'transparent';
      }

      const video = document.createElement('video');
      video.className = 'home-section-video';
      video.src = videoSrc;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = true;
      el.appendChild(video);
      el.classList.add('has-media');
      if (sectionEl) sectionEl.classList.add('home-section--video-only');

      await new Promise(function (resolve) {
        if (video.readyState >= 1) {
          resolve();
          return;
        }
        video.addEventListener('loadedmetadata', function () { resolve(); }, { once: true });
        video.addEventListener('error', function () { resolve(); }, { once: true });
      });

      if (options.onVideoMeta && video.videoWidth && video.videoHeight) {
        options.onVideoMeta(video.videoWidth, video.videoHeight);
      }

      video.play().catch(function () {});
    } catch (err) {
      console.error('שגיאת ניגון סרטון:', err);
      if (options.videoFile) {
        /* נסה שוב מ־blob ישיר אם IDB נכשל */
        try {
          const videoSrc = URL.createObjectURL(options.videoFile);
          const video = document.createElement('video');
          video.className = 'home-section-video';
          video.src = videoSrc;
          video.autoplay = true;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.controls = true;
          el.appendChild(video);
          el.classList.add('has-media');
          if (sectionEl) sectionEl.classList.add('home-section--video-only');
          video.play().catch(function () {});
        } catch (err2) {
          console.error(err2);
        }
      }
    }
    return;
  }

  if (options.noBg && !options.image) return;

  if (options.image) {
    el.style.backgroundImage = 'url(' + JSON.stringify(options.image) + ')';
    el.style.backgroundColor = 'transparent';
    el.classList.add('has-image');
    el.style.setProperty('--video-fit', 'cover');
    el.style.setProperty('--video-zoom', '1');
  }
}

function calcMediaHeight(mediaWidth, mediaHeight, containerWidth) {
  if (!mediaWidth || !mediaHeight) return 280;
  const width = containerWidth || 1000;
  const height = Math.round(width / (mediaWidth / mediaHeight));
  return Math.min(560, Math.max(160, height));
}

function applySectionMediaHeight(kind, heightPx) {
  if (kind === 'header') {
    const value = clampHeaderHeight(heightPx);
    const el = getSectionHeightEl('header');
    if (el) el.style.setProperty('--header-height', value + 'px');
    return;
  }
  const value = Math.min(560, Math.max(120, Number(heightPx) || 280)) + 'px';
  const el = getSectionHeightEl(kind);
  if (el) el.style.setProperty('--section-media-height', value);
}

function homeSectionLayoutFieldsHtml(home, kind) {
  const mediaType = normalizeHomeMediaType(home[kind + 'MediaType']);
  const fit = home[kind + 'VideoFit'] === 'contain' ? 'contain' : 'cover';
  const zoom = Number(home[kind + 'VideoZoom']) || 100;
  const posX = Number(home[kind + 'VideoPosX']) || 50;
  const posY = Number(home[kind + 'VideoPosY']) || 50;
  const bgMode = home[kind + 'VideoBgMode'] === 'color' ? 'color' : 'transparent';
  const bgColor = home[kind + 'VideoBgColor'] || '#2f5a28';

  return (
    '<div class="form-field form-field--full" id="homeLayoutFields"' +
      (mediaType === 'video' ? '' : ' hidden') + '>' +
      '<span class="field-label">רקע מתחת לסרטון</span>' +
      '<div class="action-checks">' +
        '<label class="action-check" for="homeVideoBgTransparent">' +
          '<input type="radio" name="homeVideoBgMode" id="homeVideoBgTransparent" value="transparent"' +
            (bgMode === 'transparent' ? ' checked' : '') + '>' +
          '<span>שקיפות</span>' +
        '</label>' +
        '<label class="action-check" for="homeVideoBgColorMode">' +
          '<input type="radio" name="homeVideoBgMode" id="homeVideoBgColorMode" value="color"' +
            (bgMode === 'color' ? ' checked' : '') + '>' +
          '<span>רקע בצבע</span>' +
        '</label>' +
      '</div>' +
      '<div id="homeVideoBgColorWrap"' + (bgMode === 'color' ? '' : ' hidden') + ' style="margin-top:10px;">' +
        '<div class="hsla-field" id="homeVideoBgColorPicker" data-hsla-for="homeFieldVideoBgColor">' +
          '<span>צבע רקע</span>' +
          '<button type="button" class="hsla-swatch" title="בחירת צבע רקע" aria-label="בחירת צבע רקע"></button>' +
          '<span class="color-hex" id="homeFieldVideoBgColorHex">' + escapeHtml(colorToDisplayHex(bgColor)) + '</span>' +
          '<input type="hidden" id="homeFieldVideoBgColor" value="' + escapeHtml(colorToDisplayHex(bgColor)) + '">' +
        '</div>' +
      '</div>' +
      '<p class="field-subhint">את גובה המקטע משנים במסך עצמו: במצב עריכה גררו את הידית בתחתית המסגרת.</p>' +
      '<span class="field-label" style="margin-top:14px; display:block;">חיתוך והתאמת סרטון</span>' +
      '<div class="action-checks">' +
        '<label class="action-check" for="homeVideoFitCover">' +
          '<input type="radio" name="homeVideoFit" id="homeVideoFitCover" value="cover"' +
            (fit === 'cover' ? ' checked' : '') + '>' +
          '<span>חיתוך למילוי</span>' +
        '</label>' +
        '<label class="action-check" for="homeVideoFitContain">' +
          '<input type="radio" name="homeVideoFit" id="homeVideoFitContain" value="contain"' +
            (fit === 'contain' ? ' checked' : '') + '>' +
          '<span>הצגה מלאה</span>' +
        '</label>' +
      '</div>' +
      '<label for="homeFieldVideoZoom" style="margin-top:10px; display:block;">הגדלה / הקטנה: <strong id="homeFieldVideoZoomValue">' + zoom + '%</strong></label>' +
      '<input type="range" id="homeFieldVideoZoom" min="50" max="200" step="5" value="' + zoom + '" style="width:100%; accent-color:#4a7c3f;">' +
      '<label for="homeFieldVideoPosX" style="margin-top:10px; display:block;">מיקום אופקי (חיתוך): <strong id="homeFieldVideoPosXValue">' + posX + '%</strong></label>' +
      '<input type="range" id="homeFieldVideoPosX" min="0" max="100" step="1" value="' + posX + '" style="width:100%; accent-color:#4a7c3f;">' +
      '<label for="homeFieldVideoPosY" style="margin-top:10px; display:block;">מיקום אנכי (חיתוך): <strong id="homeFieldVideoPosYValue">' + posY + '%</strong></label>' +
      '<input type="range" id="homeFieldVideoPosY" min="0" max="100" step="1" value="' + posY + '" style="width:100%; accent-color:#4a7c3f;">' +
      '<button type="button" class="btn-cancel" id="homeResetAutoSize" style="margin-top:14px;">איפוס גובה לפי הסרטון</button>' +
    '</div>'
  );
}

function bindHomeLayoutFields() {
  const zoom = document.getElementById('homeFieldVideoZoom');
  const zoomValue = document.getElementById('homeFieldVideoZoomValue');
  const posX = document.getElementById('homeFieldVideoPosX');
  const posXValue = document.getElementById('homeFieldVideoPosXValue');
  const posY = document.getElementById('homeFieldVideoPosY');
  const posYValue = document.getElementById('homeFieldVideoPosYValue');
  const resetBtn = document.getElementById('homeResetAutoSize');
  const bgTransparent = document.getElementById('homeVideoBgTransparent');
  const bgColorMode = document.getElementById('homeVideoBgColorMode');
  const bgColorWrap = document.getElementById('homeVideoBgColorWrap');

  function syncBgMode() {
    if (!bgColorWrap) return;
    bgColorWrap.hidden = !(bgColorMode && bgColorMode.checked);
  }

  if (bgTransparent) bgTransparent.addEventListener('change', syncBgMode);
  if (bgColorMode) bgColorMode.addEventListener('change', syncBgMode);
  syncBgMode();

  const videoBgPicker = document.getElementById('homeVideoBgColorPicker');
  if (videoBgPicker) {
    videoBgPicker.dataset.hslaReady = '';
    setupHslaField(videoBgPicker, function () {
      scheduleHomeEditorPreview();
    });
  }

  if (zoom && zoomValue) {
    zoom.addEventListener('input', function () {
      zoomValue.textContent = zoom.value + '%';
    });
  }
  if (posX && posXValue) {
    posX.addEventListener('input', function () {
      posXValue.textContent = posX.value + '%';
    });
  }
  if (posY && posYValue) {
    posY.addEventListener('input', function () {
      posYValue.textContent = posY.value + '%';
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      resetBtn.dataset.resetAuto = '1';
      resetBtn.textContent = '✓ יאופס לפי הסרטון בשמירה';
    });
  }
}

function readHomeLayoutFields(home, kind) {
  const fitEl = document.querySelector('input[name="homeVideoFit"]:checked');
  const zoomEl = document.getElementById('homeFieldVideoZoom');
  const posXEl = document.getElementById('homeFieldVideoPosX');
  const posYEl = document.getElementById('homeFieldVideoPosY');
  const resetBtn = document.getElementById('homeResetAutoSize');
  const bgModeEl = document.querySelector('input[name="homeVideoBgMode"]:checked');
  const bgColorEl = document.getElementById('homeFieldVideoBgColor');

  const fit = fitEl && fitEl.value === 'contain' ? 'contain' : 'cover';
  const zoom = zoomEl ? Number(zoomEl.value) : 100;
  const posX = posXEl ? Number(posXEl.value) : 50;
  const posY = posYEl ? Number(posYEl.value) : 50;
  const resetAuto = !!(resetBtn && resetBtn.dataset.resetAuto === '1');
  const bgMode = bgModeEl && bgModeEl.value === 'color' ? 'color' : 'transparent';
  const bgColor = bgColorEl ? bgColorEl.value : '#2f5a28';

  home[kind + 'VideoFit'] = fit;
  home[kind + 'VideoZoom'] = zoom;
  home[kind + 'VideoPosX'] = posX;
  home[kind + 'VideoPosY'] = posY;
  home[kind + 'VideoBgMode'] = bgMode;
  home[kind + 'VideoBgColor'] = bgColor;
  if (resetAuto) home[kind + 'SizeAuto'] = true;
}

function getSectionMediaHeight(kind) {
  const el = getSectionHeightEl(kind);
  if (!el) return kind === 'header' ? 180 : 280;
  const prop = kind === 'header' ? '--header-height' : '--section-media-height';
  const raw = getComputedStyle(el).getPropertyValue(prop).trim();
  const num = parseInt(raw, 10);
  return Number.isFinite(num) ? num : (el.getBoundingClientRect().height || (kind === 'header' ? 180 : 280));
}

function syncResizeHandlesVisibility() {
  document.querySelectorAll('.home-resize-handle').forEach(function (handle) {
    handle.hidden = !editMode;
  });
}

function bindSectionResizeHandles() {
  document.querySelectorAll('.home-resize-handle[data-resize]').forEach(function (handle) {
    if (handle.dataset.bound === '1') return;
    handle.dataset.bound = '1';

    handle.addEventListener('pointerdown', function (e) {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();

      const kind = handle.dataset.resize;
      const startY = e.clientY;
      const startH = getSectionMediaHeight(kind);
      handle.classList.add('is-dragging');
      handle.setPointerCapture(e.pointerId);

      function onMove(ev) {
        const minH = kind === 'header' ? 100 : 120;
        const next = Math.min(560, Math.max(minH, Math.round(startH + (ev.clientY - startY))));
        applySectionMediaHeight(kind, next);
      }

      function onUp(ev) {
        handle.classList.remove('is-dragging');
        handle.releasePointerCapture(ev.pointerId);
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);

        const finalH = getSectionMediaHeight(kind);
        if (kind === 'header') {
          const home = loadHome();
          home.header = normalizeHeader(home.header, home.title);
          home.header.height = clampHeaderHeight(finalH);
          if (!saveHome(home)) {
            alert('אין מספיק מקום לשמירה.');
          }
          return;
        }
        const patch = {};
        patch[kind + 'SizeAuto'] = false;
        patch[kind + 'Height'] = finalH;
        updateHomeField(patch);
      }

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  });
}

function setOptionalText(el, text, maxLen) {
  if (!el) return;
  let value = text == null ? '' : String(text);
  if (maxLen) value = value.slice(0, maxLen);
  el.textContent = value;
  el.hidden = !value.trim();
}

function applyTextFontSize(el, size, fallback) {
  if (!el) return;
  el.style.fontSize = clampFontSize(size, fallback) + 'px';
}

function applyTextColor(el, color, fallback) {
  if (!el) return;
  el.style.color = colorToCss(normalizeTextColor(color, fallback || '#ffffff'));
}

function clampDevTeamSize(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 100;
  return Math.min(180, Math.max(70, Math.round(num)));
}

function clampDevTeamBorderWidth(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 2;
  return Math.min(8, Math.max(0, Math.round(num)));
}

function renderClosingDevTeam(kind, home) {
  const btnId = kind === 'closing2' ? 'homeClosing2DevTeam' : 'homeClosingDevTeam';
  const btn = document.getElementById(btnId);
  if (!btn) return;

  const enabled = !!home[kind + 'DevTeam'];
  const image = home[kind + 'DevTeamImage'] || '';
  const link = String(home[kind + 'DevTeamLink'] || '').trim();
  const fontSize = clampFontSize(home[kind + 'DevTeamFontSize'], 16);
  const color = normalizeTextColor(home[kind + 'DevTeamColor'], '#ffffff');
  const size = clampDevTeamSize(home[kind + 'DevTeamSize']);
  const bgColor = normalizeTextColor(home[kind + 'DevTeamBgColor'], '#4a7c3f');
  const borderColor = normalizeTextColor(home[kind + 'DevTeamBorderColor'], '#ffffff');
  const borderWidth = clampDevTeamBorderWidth(home[kind + 'DevTeamBorderWidth']);
  const glow = !!home[kind + 'DevTeamGlow'];
  const slant = !!home[kind + 'DevTeamSlant'];
  const x = clampPercent(home[kind + 'DevTeamX'], 50);
  const y = clampPercent(home[kind + 'DevTeamY'], 78);
  const label = btn.querySelector('.home-dev-team-label');

  btn.hidden = !enabled;
  btn.classList.toggle('has-image', !!image);
  btn.classList.toggle('has-glow', glow);
  btn.classList.toggle('is-slant', slant);
  btn.style.setProperty('--dev-team-scale', String(size / 100));
  btn.style.setProperty('--dev-team-font', fontSize + 'px');
  btn.style.setProperty('--dev-team-color', colorToCss(color));
  btn.style.setProperty('--dev-team-bg', colorToCss(bgColor));
  btn.style.setProperty('--dev-team-border-color', colorToCss(borderColor));
  btn.style.setProperty('--dev-team-border-width', borderWidth + 'px');
  btn.style.setProperty('--dx', x + '%');
  btn.style.setProperty('--dy', y + '%');
  btn.style.setProperty(
    '--dev-team-bg-image',
    image ? 'url(' + JSON.stringify(image) + ')' : 'none'
  );
  btn.dataset.devTeamKind = kind;

  if (label) label.textContent = 'צוות פיתוח';

  if (!enabled) {
    btn.removeAttribute('href');
    btn.classList.add('is-disabled');
    return;
  }

  if (editMode) {
    btn.removeAttribute('href');
    btn.classList.add('is-disabled');
  } else if (link) {
    btn.href = link;
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');
    btn.classList.remove('is-disabled');
  } else {
    btn.removeAttribute('href');
    btn.classList.add('is-disabled');
  }

  ensureDevTeamDragBound(btn, kind);
}

function saveDevTeamPosition(kind, x, y) {
  const home = loadHome();
  home[kind + 'DevTeamX'] = clampPercent(x, home[kind + 'DevTeamX'] != null ? home[kind + 'DevTeamX'] : 50);
  home[kind + 'DevTeamY'] = clampPercent(y, home[kind + 'DevTeamY'] != null ? home[kind + 'DevTeamY'] : 78);
  saveHome(home);
}

function ensureDevTeamDragBound(btn, kind) {
  if (!btn || btn.dataset.dragBound === '1') return;
  btn.dataset.dragBound = '1';

  btn.addEventListener('click', function (e) {
    if (editMode) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  btn.addEventListener('pointerdown', function (e) {
    if (!editMode || btn.hidden) return;
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const section = getSectionRootEl(kind);
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    btn.classList.add('is-dragging');
    btn.setPointerCapture(e.pointerId);

    function onMove(ev) {
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty('--dx', clampPercent(x, 50) + '%');
      btn.style.setProperty('--dy', clampPercent(y, 78) + '%');
    }

    function onUp(ev) {
      btn.classList.remove('is-dragging');
      try { btn.releasePointerCapture(ev.pointerId); } catch (_) {}
      btn.removeEventListener('pointermove', onMove);
      btn.removeEventListener('pointerup', onUp);
      btn.removeEventListener('pointercancel', onUp);

      const x = parseFloat(String(btn.style.getPropertyValue('--dx')));
      const y = parseFloat(String(btn.style.getPropertyValue('--dy')));
      saveDevTeamPosition(kind, x, y);
    }

    btn.addEventListener('pointermove', onMove);
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', onUp);
  });
}

function homeClosingDevTeamFieldsHtml(home, kind) {
  const enabled = !!home[kind + 'DevTeam'];
  const imageUrl = home[kind + 'DevTeamImage'] || '';
  const link = home[kind + 'DevTeamLink'] || '';
  const fontSize = clampFontSize(home[kind + 'DevTeamFontSize'], 16);
  const color = normalizeTextColor(home[kind + 'DevTeamColor'], '#ffffff');
  const size = clampDevTeamSize(home[kind + 'DevTeamSize']);
  const bgColor = normalizeTextColor(home[kind + 'DevTeamBgColor'], '#4a7c3f');
  const borderColor = normalizeTextColor(home[kind + 'DevTeamBorderColor'], '#ffffff');
  const borderWidth = clampDevTeamBorderWidth(home[kind + 'DevTeamBorderWidth']);
  const glow = !!home[kind + 'DevTeamGlow'];
  const slant = !!home[kind + 'DevTeamSlant'];
  return (
    '<div class="form-field form-field--full">' +
      '<label class="action-check edit-toggle" for="homeFieldDevTeam">' +
        '<input type="checkbox" id="homeFieldDevTeam"' + (enabled ? ' checked' : '') + '>' +
        '<span>צוות פיתוח</span>' +
      '</label>' +
      '<div class="home-dev-team-fields" id="homeFieldDevTeamFields"' + (enabled ? '' : ' hidden') + '>' +
        '<div class="edit-sizes-grid">' +
          homeSizeControlHtml('homeFieldDevTeamFontSize', fontSize, {
            min: 10, max: 56, step: 1, unit: 'px', label: 'גודל גופן', ico: 'text-size',
          }) +
          homeSizeControlHtml('homeFieldDevTeamSize', size, {
            min: 70, max: 180, step: 5, unit: '%', label: 'גודל כפתור', ico: 'scale',
          }) +
        '</div>' +
        homeColorRowHtml(
          homeColorChipHtml('homeFieldDevTeamColor', color, {
            label: 'צבע גופן', shortLabel: 'טקסט', ico: 'text', fallback: '#ffffff',
          }) +
          homeColorChipHtml('homeFieldDevTeamBgColor', bgColor, {
            label: 'צבע רקע (כשאין תמונה)', shortLabel: 'רקע', ico: 'fill', fallback: '#4a7c3f',
          }) +
          homeColorChipHtml('homeFieldDevTeamBorderColor', borderColor, {
            label: 'צבע מסגרת', shortLabel: 'מסגרת', ico: 'border', fallback: '#ffffff',
          })
        ) +
        homeSizeControlHtml('homeFieldDevTeamBorderWidth', borderWidth, {
          min: 0, max: 8, step: 1, unit: 'px', label: 'עובי מסגרת', ico: 'border-w',
        }) +
        '<div class="home-dev-team-options">' +
          '<label class="edit-check-ico" for="homeFieldDevTeamGlow" title="זוהר">' +
            '<input type="checkbox" id="homeFieldDevTeamGlow"' + (glow ? ' checked' : '') + '>' +
            editIco('glow') +
            '<span>זוהר</span>' +
          '</label>' +
          '<label class="edit-check-ico" for="homeFieldDevTeamSlant" title="צורת אלכסון">' +
            '<input type="checkbox" id="homeFieldDevTeamSlant"' + (slant ? ' checked' : '') + '>' +
            editIco('slant') +
            '<span>אלכסון</span>' +
          '</label>' +
        '</div>' +
        '<div class="edit-media-row">' +
          '<label class="edit-upload-btn" for="homeFieldDevTeamImage" title="תמונת רקע לכפתור">' +
            '<input type="file" id="homeFieldDevTeamImage" accept="image/*" hidden>' +
            editIco('image') +
            '<span>תמונה</span>' +
          '</label>' +
          (imageUrl
            ? '<button type="button" class="edit-clear-btn" id="homeClearDevTeamImage" title="הסרת תמונה">×</button>'
            : '') +
          '<div class="edit-link-field">' +
            editIco('link') +
            '<input type="url" id="homeFieldDevTeamLink" dir="ltr" placeholder="https://..." value="' + escapeHtml(link) + '" aria-label="קישור לכפתור">' +
          '</div>' +
        '</div>' +
        '<img class="home-edit-preview' + (imageUrl ? ' is-visible' : '') + '" id="homeFieldDevTeamImagePreview" src="' + (imageUrl || '') + '" alt="">' +
      '</div>' +
    '</div>'
  );
}

function readClosingDevTeamFields(home, kind) {
  const check = document.getElementById('homeFieldDevTeam');
  const linkEl = document.getElementById('homeFieldDevTeamLink');
  const fontEl = document.getElementById('homeFieldDevTeamFontSize');
  const colorEl = document.getElementById('homeFieldDevTeamColor');
  const sizeEl = document.getElementById('homeFieldDevTeamSize');
  const bgEl = document.getElementById('homeFieldDevTeamBgColor');
  const borderColorEl = document.getElementById('homeFieldDevTeamBorderColor');
  const borderWidthEl = document.getElementById('homeFieldDevTeamBorderWidth');
  const glowEl = document.getElementById('homeFieldDevTeamGlow');
  const slantEl = document.getElementById('homeFieldDevTeamSlant');
  home[kind + 'DevTeam'] = !!(check && check.checked);
  home[kind + 'DevTeamImage'] = homeEditDevTeamImageData || '';
  home[kind + 'DevTeamLink'] = linkEl ? linkEl.value.trim() : '';
  home[kind + 'DevTeamFontSize'] = clampFontSize(fontEl ? fontEl.value : 16, 16);
  home[kind + 'DevTeamColor'] = normalizeTextColor(colorEl ? colorEl.value : '#ffffff', '#ffffff');
  home[kind + 'DevTeamSize'] = clampDevTeamSize(sizeEl ? sizeEl.value : 100);
  home[kind + 'DevTeamBgColor'] = normalizeTextColor(bgEl ? bgEl.value : '#4a7c3f', '#4a7c3f');
  home[kind + 'DevTeamBorderColor'] = normalizeTextColor(borderColorEl ? borderColorEl.value : '#ffffff', '#ffffff');
  home[kind + 'DevTeamBorderWidth'] = clampDevTeamBorderWidth(borderWidthEl ? borderWidthEl.value : 2);
  home[kind + 'DevTeamGlow'] = !!(glowEl && glowEl.checked);
  home[kind + 'DevTeamSlant'] = !!(slantEl && slantEl.checked);
}

function bindClosingDevTeamFields() {
  const check = document.getElementById('homeFieldDevTeam');
  const fields = document.getElementById('homeFieldDevTeamFields');
  if (!check || !fields) return;

  check.addEventListener('change', function () {
    fields.hidden = !check.checked;
    scheduleHomeEditorPreview();
  });

  bindHomeTextSizeField('homeFieldDevTeamFontSize');
  bindHomeTextColorField('homeFieldDevTeamColor');
  bindHomeTextColorField('homeFieldDevTeamBgColor');
  bindHomeTextColorField('homeFieldDevTeamBorderColor');

  function bindSyncedRange(rangeId, numId, clampFn) {
    const range = document.getElementById(rangeId);
    const num = document.getElementById(numId);
    if (!range || !num) return;
    function apply(raw, from) {
      const value = clampFn(raw);
      if (from !== 'range') range.value = String(value);
      if (from !== 'num') num.value = String(value);
      scheduleHomeEditorPreview();
    }
    range.addEventListener('input', function () { apply(range.value, 'range'); });
    num.addEventListener('input', function () { apply(num.value, 'num'); });
    num.addEventListener('change', function () { apply(num.value, 'num'); });
  }

  bindSyncedRange('homeFieldDevTeamSize', 'homeFieldDevTeamSizeNum', clampDevTeamSize);
  bindSyncedRange('homeFieldDevTeamBorderWidth', 'homeFieldDevTeamBorderWidthNum', clampDevTeamBorderWidth);

  ['homeFieldDevTeamGlow', 'homeFieldDevTeamSlant'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', scheduleHomeEditorPreview);
  });

  const imageInput = document.getElementById('homeFieldDevTeamImage');
  if (imageInput) {
    imageInput.addEventListener('change', async function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      homeEditDevTeamImageData = await readFileAsDataURL(file, 900, null, true);
      const preview = document.getElementById('homeFieldDevTeamImagePreview');
      if (preview) {
        preview.src = homeEditDevTeamImageData;
        preview.classList.add('is-visible');
      }
      if (!document.getElementById('homeClearDevTeamImage')) {
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'edit-clear-btn';
        clearBtn.id = 'homeClearDevTeamImage';
        clearBtn.title = 'הסרת תמונה';
        clearBtn.textContent = '×';
        const mediaRow = imageInput.closest('.edit-media-row');
        const uploadBtn = imageInput.closest('.edit-upload-btn');
        if (mediaRow && uploadBtn) mediaRow.insertBefore(clearBtn, uploadBtn.nextSibling);
        clearBtn.addEventListener('click', clearDevTeamImage);
      }
      scheduleHomeEditorPreview();
      e.target.value = '';
    });
  }

  const clearBtn = document.getElementById('homeClearDevTeamImage');
  if (clearBtn) clearBtn.addEventListener('click', clearDevTeamImage);

  const linkEl = document.getElementById('homeFieldDevTeamLink');
  if (linkEl) {
    linkEl.addEventListener('input', scheduleHomeEditorPreview);
    linkEl.addEventListener('change', scheduleHomeEditorPreview);
  }
}

function clearDevTeamImage() {
  homeEditDevTeamImageData = '';
  const preview = document.getElementById('homeFieldDevTeamImagePreview');
  if (preview) {
    preview.src = '';
    preview.classList.remove('is-visible');
  }
  const clearBtn = document.getElementById('homeClearDevTeamImage');
  if (clearBtn) clearBtn.remove();
  scheduleHomeEditorPreview();
}

function setSectionBgOpacity(sectionEl, opacity) {
  if (!sectionEl) return;
  const value = clampBgOpacity(opacity);
  sectionEl.style.setProperty('--section-bg-opacity', String(value));
  const hasVisualMedia = !!sectionEl.querySelector('.home-section-bg.has-image, .home-section-bg.has-media');
  /* תמונה/סרטון: בלי צבע משני, אבל בלי למחוק את המדיה עצמה */
  sectionEl.classList.toggle('home-section--no-bg', value <= 0 && !hasVisualMedia);
  sectionEl.classList.toggle('home-section--soft-bg', value > 0 && value < 45);
  sectionEl.classList.toggle('home-section--has-media-bg', hasVisualMedia);
}

function homeBgOpacityHtml(opacity) {
  const value = clampBgOpacity(opacity);
  return (
    '<div class="form-field form-field--full" id="homeBgOpacityField">' +
      '<div class="edit-size" title="שקיפות רקע">' +
        editIco('fill') +
        '<input type="range" id="homeFieldBgOpacity" min="0" max="100" step="1" value="' + value + '"' +
          ' class="size-control-range" aria-label="שקיפות רקע">' +
        '<strong id="homeFieldBgOpacityValue" class="size-control-unit" style="min-width:2.8rem;">' + value + '%</strong>' +
      '</div>' +
      '<p class="field-subhint">0 = שקוף · 100 = רקע מלא</p>' +
    '</div>'
  );
}

function bindHomeBgOpacityField() {
  const input = document.getElementById('homeFieldBgOpacity');
  const label = document.getElementById('homeFieldBgOpacityValue');
  if (!input || !label) return;
  input.addEventListener('input', function () {
    label.textContent = clampBgOpacity(input.value) + '%';
    scheduleHomeEditorPreview();
  });
}

function homeImageFieldHtml(imageUrl, label) {
  return (
    '<div class="form-field form-field--full" id="homeImageFieldWrap">' +
      '<span class="field-label">' + label + '</span>' +
      '<label class="edit-upload-btn edit-upload-btn--wide" for="homeFieldImage">' +
        '<input type="file" id="homeFieldImage" accept="image/*" hidden>' +
        editIco('image') +
        '<span>העלאת תמונה / החלפה</span>' +
      '</label>' +
      '<img class="home-edit-preview' + (imageUrl ? ' is-visible' : '') + '" id="homeFieldImagePreview" src="' + (imageUrl || '') + '" alt="">' +
      (imageUrl ? '<button type="button" class="edit-clear-btn" id="homeClearImage">הסרת תמונה</button>' : '') +
    '</div>'
  );
}

function normalizeHomeMediaType(value) {
  if (value === 'image' || value === 'video' || value === 'bg') return value;
  return 'bg';
}

function homeMediaFieldsHtml(options) {
  const mediaType = normalizeHomeMediaType(options.mediaType);
  const imageUrl = options.imageUrl || '';
  const videoName = options.videoName || '';
  const bgOpacity = Object.prototype.hasOwnProperty.call(options, 'bgOpacity')
    ? options.bgOpacity
    : 100;

  return (
    '<div id="homeMediaFieldWrap" class="edit-block">' +
      '<div class="form-field form-field--full">' +
        '<span class="field-label">מדיה</span>' +
        '<div class="edit-seg">' +
          '<label class="edit-seg-btn" for="homeMediaBg" title="רקע צבע">' +
            '<input type="radio" name="homeMediaType" id="homeMediaBg" value="bg"' +
              (mediaType === 'bg' ? ' checked' : '') + '>' +
            editIco('fill') +
            '<span>רקע</span>' +
          '</label>' +
          '<label class="edit-seg-btn" for="homeMediaImage" title="תמונה">' +
            '<input type="radio" name="homeMediaType" id="homeMediaImage" value="image"' +
              (mediaType === 'image' ? ' checked' : '') + '>' +
            editIco('image') +
            '<span>תמונה</span>' +
          '</label>' +
          '<label class="edit-seg-btn" for="homeMediaVideo" title="סרטון">' +
            '<input type="radio" name="homeMediaType" id="homeMediaVideo" value="video"' +
              (mediaType === 'video' ? ' checked' : '') + '>' +
            editIco('video') +
            '<span>סרטון</span>' +
          '</label>' +
        '</div>' +
      '</div>' +
      '<div id="homeBgOpacityWrap"' + (mediaType === 'bg' ? '' : ' hidden') + '>' +
        homeBgOpacityHtml(bgOpacity) +
      '</div>' +
      '<div class="form-field form-field--full" id="homeImageOnlyWrap"' + (mediaType === 'image' ? '' : ' hidden') + '>' +
        '<label class="edit-upload-btn edit-upload-btn--wide" for="homeFieldImage">' +
          '<input type="file" id="homeFieldImage" accept="image/*" hidden>' +
          editIco('image') +
          '<span>העלאת תמונה / החלפה</span>' +
        '</label>' +
        '<img class="home-edit-preview' + (imageUrl ? ' is-visible' : '') + '" id="homeFieldImagePreview" src="' + (imageUrl || '') + '" alt="">' +
        (imageUrl ? '<button type="button" class="edit-clear-btn" id="homeClearImage" title="הסרת תמונה">הסרה</button>' : '') +
      '</div>' +
      '<div class="form-field form-field--full" id="homeVideoOnlyWrap"' + (mediaType === 'video' ? '' : ' hidden') + '>' +
        '<label class="edit-upload-btn edit-upload-btn--wide" for="homeFieldVideoFile">' +
          '<input type="file" id="homeFieldVideoFile" accept="video/*" hidden>' +
          editIco('video') +
          '<span>בחירת קובץ וידאו</span>' +
        '</label>' +
        '<p class="field-subhint">מומלץ MP4 או WebM. נשמר בדפדפן המקומי — עדיף לפתוח דרך שרת מקומי (לא file://).</p>' +
        '<p class="field-subhint" id="homeVideoFileName"' + (videoName ? '' : ' hidden') + '>' +
          'קובץ: <strong dir="ltr">' + escapeHtml(videoName) + '</strong>' +
        '</p>' +
        (videoName
          ? '<button type="button" class="edit-clear-btn" id="homeClearVideo" title="הסרת סרטון">הסרה</button>'
          : '') +
      '</div>' +
    '</div>'
  );
}

function bindHomeMediaTypeToggle() {
  const bgRadio = document.getElementById('homeMediaBg');
  const imageRadio = document.getElementById('homeMediaImage');
  const videoRadio = document.getElementById('homeMediaVideo');
  const opacityWrap = document.getElementById('homeBgOpacityWrap');
  const imageWrap = document.getElementById('homeImageOnlyWrap');
  const videoWrap = document.getElementById('homeVideoOnlyWrap');
  const layoutWrap = document.getElementById('homeLayoutFields');
  if (!imageRadio || !videoRadio || !imageWrap || !videoWrap) return;

  function sync() {
    const type = getSelectedHomeMediaType();
    if (opacityWrap) opacityWrap.hidden = type !== 'bg';
    imageWrap.hidden = type !== 'image';
    videoWrap.hidden = type !== 'video';
    if (layoutWrap) layoutWrap.hidden = type !== 'video';
    scheduleHomeEditorPreview();
  }

  if (bgRadio) bgRadio.addEventListener('change', sync);
  imageRadio.addEventListener('change', sync);
  videoRadio.addEventListener('change', sync);
  sync();
}

function getSelectedHomeMediaType() {
  const checked = document.querySelector('input[name="homeMediaType"]:checked');
  return normalizeHomeMediaType(checked ? checked.value : 'bg');
}

function applySiteTheme(home) {
  const bgColor = DEFAULT_HOME.siteBgColor;
  const bgImage = home.siteBgImage || '';
  const secondary = home.siteSecondaryColor || DEFAULT_HOME.siteSecondaryColor;
  const font = home.siteFont || DEFAULT_HOME.siteFont;
  const perRow = Math.min(6, Math.max(2, Number(home.cardsPerRow) || DEFAULT_HOME.cardsPerRow));
  const gap = Math.min(48, Math.max(4, Number(home.cardsGap) || DEFAULT_HOME.cardsGap));

  document.body.style.setProperty('--site-bg-color', bgColor);
  document.body.style.setProperty(
    '--site-bg-image',
    bgImage ? 'url(' + JSON.stringify(bgImage) + ')' : 'none'
  );
  document.body.style.setProperty('--site-secondary', colorToCss(secondary));
  document.body.style.setProperty('--site-font', font);
  document.body.classList.remove('cards-colored');

  cardsGrid.style.setProperty('--cards-per-row', String(perRow));
  cardsGrid.style.setProperty('--cards-gap', gap + 'px');

  const cardsBgImage = getResolvedCardsBgImage(home);
  const cardsBgUrl = cardsBgImage ? 'url(' + JSON.stringify(cardsBgImage) + ')' : 'none';
  cardsGrid.style.setProperty('--cards-bg-image', cardsBgUrl);
  cardsGrid.classList.toggle('has-cards-bg', !!cardsBgImage);
  const cardsSection = document.getElementById('cardsSection');
  if (cardsSection) {
    cardsSection.style.setProperty('--cards-bg-image', cardsBgUrl);
    cardsSection.classList.toggle('has-cards-bg', !!cardsBgImage);
    cardsSection.classList.toggle('is-bg-full-bleed', !!cardsBgImage);
  }

  const fontSelect = document.getElementById('siteFont');
  const clearBtn = document.getElementById('siteBgClear');
  const cardsBgClear = document.getElementById('cardsBgClear');
  const perRowInput = document.getElementById('cardsPerRow');
  const gapInput = document.getElementById('cardsGap');
  const perRowValue = document.getElementById('cardsPerRowValue');
  const gapValue = document.getElementById('cardsGapValue');

  setHslaFieldValue('siteSecondaryColor', secondary);
  if (fontSelect) setFontSelectValue(fontSelect, font);
  if (clearBtn) clearBtn.hidden = !bgImage;
  if (cardsBgClear) cardsBgClear.hidden = !home.cardsBgImage;
  if (perRowInput) perRowInput.value = String(perRow);
  if (gapInput) gapInput.value = String(gap);
  if (perRowValue) perRowValue.textContent = String(perRow);
  if (gapValue) gapValue.textContent = gap + 'px';
  syncCategoriesToolbar(home);
}

function updateHomeField(patch) {
  const home = Object.assign(loadHome(), patch);
  if (!saveHome(home)) {
    alert('אין מספיק מקום לשמירה. נסו תמונה קטנה יותר.');
    return false;
  }
  applySiteTheme(home);
  return true;
}

async function renderHome(homeOverride, previewOptions) {
  const home = homeOverride || loadHome();
  previewOptions = previewOptions || {};
  home.header = normalizeHeader(home.header, home.title);

  const title = getHeaderTitleText(home).slice(0, 40);
  const subtitle = (home.subtitle == null ? DEFAULT_HOME.subtitle : String(home.subtitle)).slice(0, 10);
  const introText = home.introText == null ? DEFAULT_HOME.introText : String(home.introText);
  const closingText = home.closingText == null ? DEFAULT_HOME.closingText : String(home.closingText);

  setOptionalText(document.getElementById('homeSubtitle'), subtitle, 10);
  setOptionalText(document.getElementById('homeIntroText'), introText);
  setOptionalText(document.getElementById('homeClosingText'), closingText);
  applyTextFontSize(document.getElementById('homeSubtitle'), home.subtitleSize, 20);
  applyTextFontSize(document.getElementById('homeIntroText'), home.introTextSize, 16);
  applyTextFontSize(document.getElementById('homeClosingText'), home.closingTextSize, 17);
  applyTextColor(document.getElementById('homeSubtitle'), home.subtitleColor, '#ffffff');
  applyTextColor(document.getElementById('homeIntroText'), home.introTextColor, '#ffffff');
  applyTextColor(document.getElementById('homeClosingText'), home.closingTextColor, '#ffffff');

  if (home.hasIntro2) {
    setOptionalText(document.getElementById('homeIntro2Subtitle'), home.intro2Subtitle || '', 10);
    setOptionalText(document.getElementById('homeIntro2Text'), home.intro2Text || '');
    applyTextFontSize(document.getElementById('homeIntro2Subtitle'), home.intro2SubtitleSize, 20);
    applyTextFontSize(document.getElementById('homeIntro2Text'), home.intro2TextSize, 16);
    applyTextColor(document.getElementById('homeIntro2Subtitle'), home.intro2SubtitleColor, '#ffffff');
    applyTextColor(document.getElementById('homeIntro2Text'), home.intro2TextColor, '#ffffff');
  }
  if (home.hasClosing2) {
    setOptionalText(document.getElementById('homeClosing2Text'), home.closing2Text || '');
    applyTextFontSize(document.getElementById('homeClosing2Text'), home.closing2TextSize, 17);
    applyTextColor(document.getElementById('homeClosing2Text'), home.closing2TextColor, '#ffffff');
  }

  renderClosingDevTeam('closing', home);
  if (home.hasClosing2) renderClosingDevTeam('closing2', home);

  const mediaJobs = [];
  const kinds = ['intro', 'closing'];
  if (home.hasIntro2) kinds.push('intro2');
  if (home.hasClosing2) kinds.push('closing2');

  kinds.forEach(function (kind) {
    const removedKey = kind + 'VideoRemoved';
    const fileKey = kind + 'VideoFile';
    const mediaType = normalizeHomeMediaType(home[kind + 'MediaType']);
    const hasVideo = mediaType === 'video' && (previewOptions[removedKey]
      ? false
      : !!(previewOptions[fileKey] || home[kind + 'Video']));
    const bgOpacity = mediaType === 'bg' ? home[kind + 'BgOpacity'] : 100;

    mediaJobs.push(setSectionMedia(getSectionBgEl(kind), {
      noBg: mediaType === 'bg' && clampBgOpacity(bgOpacity) <= 0,
      mediaType: mediaType === 'video' ? 'video' : 'image',
      image: mediaType === 'image' ? (home[kind + 'Image'] || '') : '',
      videoKey: kind,
      hasVideo: hasVideo,
      videoFile: previewOptions[fileKey] || null,
      videoFit: home[kind + 'VideoFit'],
      videoZoom: home[kind + 'VideoZoom'],
      videoPosX: home[kind + 'VideoPosX'],
      videoPosY: home[kind + 'VideoPosY'],
      videoBgMode: home[kind + 'VideoBgMode'] || 'transparent',
      videoBgColor: home[kind + 'VideoBgColor'] || '#2f5a28',
      sectionEl: getSectionRootEl(kind),
      onVideoMeta: function (w, h) {
        if (home[kind + 'SizeAuto'] !== false) {
          const target = getSectionHeightEl(kind);
          const width = target
            ? (kind.indexOf('intro') === 0 ? target.clientWidth : Math.max(0, target.clientWidth - 40))
            : 1000;
          const autoH = calcMediaHeight(w, h, width);
          applySectionMediaHeight(kind, autoH);
        }
      },
    }));

    if (home[kind + 'SizeAuto'] === false) {
      applySectionMediaHeight(kind, home[kind + 'Height'] || 280);
    } else if (mediaType !== 'video' || !hasVideo) {
      applySectionMediaHeight(kind, home[kind + 'Height'] || 280);
    }
  });

  await Promise.all(mediaJobs);

  // Clear media on hidden secondary sections
  if (!home.hasIntro2) {
    clearSectionMedia(document.getElementById('homeIntro2Bg'));
  }
  if (!home.hasClosing2) {
    clearSectionMedia(document.getElementById('homeClosing2Bg'));
  }

  function sectionDisplayOpacity(kind) {
    const mediaType = normalizeHomeMediaType(home[kind + 'MediaType']);
    if (mediaType === 'bg') return home[kind + 'BgOpacity'];
    // תמונה / סרטון: בלי צבע משני מאחור — סרטון שקוף נשאר שקוף לגמרי
    return 0;
  }

  setSectionBgOpacity(document.getElementById('homeIntro'), sectionDisplayOpacity('intro'));
  setSectionBgOpacity(document.getElementById('homeClosing'), sectionDisplayOpacity('closing'));
  if (home.hasIntro2) {
    setSectionBgOpacity(document.getElementById('homeIntro2'), sectionDisplayOpacity('intro2'));
  }
  if (home.hasClosing2) {
    setSectionBgOpacity(document.getElementById('homeClosing2'), sectionDisplayOpacity('closing2'));
  }

  renderHomeHeader(home);
  syncHomeSectionControls(home);
  applySiteTheme(home);
  document.title = title.trim() || 'פורטל תוכן';
}

function renderHomeHeader(home) {
  const section = document.getElementById('homeHeader');
  const canvas = document.getElementById('homeHeaderCanvas');
  const itemsEl = document.getElementById('homeHeaderItems');
  const bgEl = document.getElementById('homeHeaderBg');
  if (!section || !canvas || !itemsEl || !bgEl) return;

  const header = normalizeHeader(home.header, home.title);
  applySectionMediaHeight('header', header.height);
  setSectionBackground(bgEl, header.bgImage || '');
  setSectionBgOpacity(section, header.bgOpacity);

  const html = header.items.map(function (item) {
    if (item.type === 'logo') {
      if (!item.src && !editMode) return '';
      const tag = item.link && !editMode ? 'a' : 'div';
      const linkAttrs = item.link && !editMode
        ? ' href="' + escapeHtml(item.link) + '" target="_blank" rel="noopener noreferrer"'
        : '';
      const linkClass = item.link ? ' is-link' : '';
      const caption = item.caption
        ? '<span class="home-header-caption" style="font-size:' + clampFontSize(item.fontSize, 12) + 'px;color:' + colorToCss(item.color || '#ffffff') + ';">' + escapeHtml(item.caption) + '</span>'
        : '';
      const img = item.src
        ? '<img class="home-header-logo-img" src="' + item.src + '" alt="' + escapeHtml(item.caption || 'לוגו') + '">'
        : '<span class="home-header-caption">לוגו</span>';
      return (
        '<' + tag + ' class="home-header-item home-header-item--logo' + linkClass + '"' +
          ' data-header-id="' + escapeHtml(item.id) + '"' +
          ' data-header-type="logo"' +
          ' style="--hx:' + item.x + '%;--hy:' + item.y + '%;--hw:' + item.w + '%;"' +
          linkAttrs + '>' +
          img + caption +
        '</' + tag + '>'
      );
    }

    const text = String(item.text || '').trim();
    if (!text && !editMode) return '';
    const tagName = item.type === 'title' ? 'h1' : 'div';
    let display = text || (item.type === 'title' ? 'כותרת' : item.type === 'subtitle' ? 'כותרת משנה' : 'תג');
    if (item.type === 'badge') {
      display = formatClassificationBadge(display);
    }
    const fontSize = clampFontSize(item.fontSize, defaultHeaderFontSize(item.type));
    const textColor = colorToCss(item.color || '#ffffff');
    return (
      '<' + tagName + ' class="home-header-item home-header-item--' + item.type + '"' +
        ' data-header-id="' + escapeHtml(item.id) + '"' +
        ' data-header-type="' + item.type + '"' +
        ' data-align="' + (item.align || 'center') + '"' +
        ' style="--hx:' + item.x + '%;--hy:' + item.y + '%;font-size:' + fontSize + 'px;color:' + textColor + ';">' +
        escapeHtml(display) +
      '</' + tagName + '>'
    );
  }).join('');

  itemsEl.innerHTML = html;
  bindHeaderItemInteractions();
}

function applyHeaderPreset(header, preset) {
  const logos = header.items.filter(function (item) { return item.type === 'logo'; });
  const title = header.items.find(function (item) { return item.type === 'title'; });
  const subtitle = header.items.find(function (item) { return item.type === 'subtitle'; });
  const badge = header.items.find(function (item) { return item.type === 'badge'; });

  if (preset === 'logo-right-title-center') {
    if (logos[0]) { logos[0].x = 88; logos[0].y = 22; logos[0].w = 14; }
    logos.slice(1).forEach(function (logo, idx) {
      logo.x = 88;
      logo.y = 48 + idx * 22;
      logo.w = 12;
    });
    if (title) { title.x = 50; title.y = 48; title.align = 'center'; }
    if (subtitle) { subtitle.x = 50; subtitle.y = 68; subtitle.align = 'center'; }
    if (badge) { badge.x = 50; badge.y = 12; badge.align = 'center'; }
  }

  if (preset === 'logos-sides-title-center') {
    if (logos[0]) { logos[0].x = 12; logos[0].y = 28; logos[0].w = 12; }
    if (logos[1]) { logos[1].x = 88; logos[1].y = 28; logos[1].w = 12; }
    logos.slice(2).forEach(function (logo, idx) {
      logo.x = 12;
      logo.y = 55 + idx * 18;
      logo.w = 10;
    });
    if (title) { title.x = 50; title.y = 45; title.align = 'center'; }
    if (subtitle) { subtitle.x = 50; subtitle.y = 62; subtitle.align = 'center'; }
    if (badge) { badge.x = 50; badge.y = 14; badge.align = 'center'; }
  }

  return header;
}

function saveHeaderItemPosition(itemId, x, y, w) {
  const home = loadHome();
  home.header = normalizeHeader(home.header, home.title);
  const item = home.header.items.find(function (entry) { return entry.id === itemId; });
  if (!item) return;
  item.x = clampPercent(x, item.x);
  item.y = clampPercent(y, item.y);
  if (typeof w === 'number') item.w = clampLogoWidth(w);
  syncTitleFromHeader(home);
  saveHome(home);
}

function bindHeaderItemInteractions() {
  const canvas = document.getElementById('homeHeaderCanvas');
  const itemsEl = document.getElementById('homeHeaderItems');
  if (!canvas || !itemsEl || itemsEl.dataset.dragBound === '1') {
    // Rebinding after re-render: listeners on old nodes are gone with innerHTML.
    // Always attach fresh listeners on current nodes below.
  }

  itemsEl.querySelectorAll('.home-header-item').forEach(function (el) {
    el.addEventListener('pointerdown', function (e) {
      if (!editMode) return;
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const itemId = el.dataset.headerId;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);

      function onMove(ev) {
        const x = ((ev.clientX - rect.left) / rect.width) * 100;
        const y = ((ev.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--hx', clampPercent(x, 50) + '%');
        el.style.setProperty('--hy', clampPercent(y, 50) + '%');
      }

      function onUp(ev) {
        el.classList.remove('is-dragging');
        try { el.releasePointerCapture(ev.pointerId); } catch (_) {}
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerup', onUp);
        el.removeEventListener('pointercancel', onUp);

        const x = parseFloat(String(el.style.getPropertyValue('--hx')));
        const y = parseFloat(String(el.style.getPropertyValue('--hy')));
        saveHeaderItemPosition(itemId, x, y);
      }

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    });
  });
}

let editingHomeSection = null;
let homeEditImageData = '';
let homeEditDevTeamImageData = '';
let homeEditVideoFile = null;
let homeEditVideoRemoved = false;
let homeEditHeaderDraft = null;
let homeEditSnapshot = null;
let homeEditCommitted = false;
let homeEditPreviewTimer = null;

const homeEditOverlay = document.getElementById('homeEditOverlay');
const homeEditFields = document.getElementById('homeEditFields');
const homeEditForm = document.getElementById('homeEditForm');
const homeEditTitle = document.getElementById('homeEditTitle');

function readHeaderDraftFromEditor() {
  if (!homeEditHeaderDraft) return normalizeHeader(DEFAULT_HOME.header, DEFAULT_HOME.title);

  const heightEl = document.getElementById('homeFieldHeaderHeight');
  const opacityEl = document.getElementById('homeFieldBgOpacity');
  if (heightEl) homeEditHeaderDraft.height = clampHeaderHeight(heightEl.value);
  if (opacityEl) homeEditHeaderDraft.bgOpacity = clampBgOpacity(opacityEl.value);
  homeEditHeaderDraft.bgImage = homeEditImageData || '';

  homeEditHeaderDraft.items.forEach(function (item) {
    if (item.type === 'logo') {
      const captionEl = document.getElementById('homeHeaderCaption_' + item.id);
      const linkEl = document.getElementById('homeHeaderLink_' + item.id);
      const sizeEl = document.getElementById('homeHeaderSize_' + item.id);
      const fontEl = document.getElementById('homeHeaderFont_' + item.id);
      const colorEl = document.getElementById('homeHeaderColor_' + item.id);
      if (captionEl) item.caption = captionEl.value.trim().slice(0, 40);
      if (linkEl) item.link = linkEl.value.trim();
      if (sizeEl) item.w = clampLogoWidth(sizeEl.value);
      if (fontEl) item.fontSize = clampFontSize(fontEl.value, defaultHeaderFontSize('logo'));
      if (colorEl) item.color = normalizeTextColor(colorEl.value, '#ffffff');
    } else {
      const textEl = document.getElementById('homeHeaderText_' + item.id);
      const fontEl = document.getElementById('homeHeaderFont_' + item.id);
      const colorEl = document.getElementById('homeHeaderColor_' + item.id);
      if (textEl) {
        item.text = item.type === 'badge'
          ? normalizeHeaderBadgeText(textEl.value)
          : textEl.value.trim().slice(0, 40);
      }
      item.align = 'center';
      if (fontEl) item.fontSize = clampFontSize(fontEl.value, defaultHeaderFontSize(item.type));
      if (colorEl) item.color = normalizeTextColor(colorEl.value, '#ffffff');
    }
  });

  homeEditHeaderDraft = normalizeHeader(homeEditHeaderDraft, getHeaderTitleText({ header: homeEditHeaderDraft, title: '' }));
  return homeEditHeaderDraft;
}

function buildHomeDraftFromEditor() {
  const home = JSON.parse(JSON.stringify(homeEditSnapshot || loadHome()));

  if (editingHomeSection === 'header') {
    home.header = readHeaderDraftFromEditor();
    syncTitleFromHeader(home);
  }

  if (editingHomeSection === 'intro' || editingHomeSection === 'intro2') {
    const kind = editingHomeSection;
    const subtitleEl = document.getElementById('homeFieldSubtitle');
    const introEl = document.getElementById('homeFieldIntro');
    const opacityEl = document.getElementById('homeFieldBgOpacity');
    const textSizeEl = document.getElementById('homeFieldTextSize');
    if (kind === 'intro') {
      if (subtitleEl) home.subtitle = subtitleEl.value.trim().slice(0, 10);
    } else if (subtitleEl) {
      home.intro2Subtitle = subtitleEl.value.trim().slice(0, 10);
    }
    if (introEl) home[kind + 'Text'] = introEl.value.trim();
    const subtitleSizeEl = document.getElementById('homeFieldSubtitleSize');
    if (subtitleSizeEl) {
      if (kind === 'intro') home.subtitleSize = clampFontSize(subtitleSizeEl.value, 20);
      else home.intro2SubtitleSize = clampFontSize(subtitleSizeEl.value, 20);
    }
    const subtitleColorEl = document.getElementById('homeFieldSubtitleColor');
    if (subtitleColorEl) {
      if (kind === 'intro') home.subtitleColor = normalizeTextColor(subtitleColorEl.value, '#ffffff');
      else home.intro2SubtitleColor = normalizeTextColor(subtitleColorEl.value, '#ffffff');
    }
    if (textSizeEl) home[kind + 'TextSize'] = clampFontSize(textSizeEl.value, 16);
    const textColorEl = document.getElementById('homeFieldTextColor');
    if (textColorEl) home[kind + 'TextColor'] = normalizeTextColor(textColorEl.value, '#ffffff');
    if (opacityEl) home[kind + 'BgOpacity'] = clampBgOpacity(opacityEl.value);
    home[kind + 'MediaType'] = getSelectedHomeMediaType();
    readHomeLayoutFields(home, kind);
    if (home[kind + 'MediaType'] === 'image') {
      home[kind + 'Image'] = homeEditImageData || '';
    }
  }

  if (editingHomeSection === 'closing' || editingHomeSection === 'closing2') {
    const kind = editingHomeSection;
    const closingEl = document.getElementById('homeFieldClosing');
    const opacityEl = document.getElementById('homeFieldBgOpacity');
    const textSizeEl = document.getElementById('homeFieldTextSize');
    if (closingEl) home[kind + 'Text'] = closingEl.value.trim();
    if (textSizeEl) home[kind + 'TextSize'] = clampFontSize(textSizeEl.value, 17);
    const closingColorEl = document.getElementById('homeFieldTextColor');
    if (closingColorEl) home[kind + 'TextColor'] = normalizeTextColor(closingColorEl.value, '#ffffff');
    if (opacityEl) home[kind + 'BgOpacity'] = clampBgOpacity(opacityEl.value);
    home[kind + 'MediaType'] = getSelectedHomeMediaType();
    readHomeLayoutFields(home, kind);
    readClosingDevTeamFields(home, kind);
    if (home[kind + 'MediaType'] === 'image') {
      home[kind + 'Image'] = homeEditImageData || '';
    }
  }

  return home;
}

function getHomeEditorPreviewOptions() {
  const options = {};
  if (!editingHomeSection) return options;
  if (
    editingHomeSection === 'intro' ||
    editingHomeSection === 'intro2' ||
    editingHomeSection === 'closing' ||
    editingHomeSection === 'closing2'
  ) {
    options[editingHomeSection + 'VideoFile'] = homeEditVideoFile || null;
    options[editingHomeSection + 'VideoRemoved'] = homeEditVideoRemoved;
  }
  return options;
}

function getHomeSectionFocusEl(section) {
  if (section === 'header') return document.getElementById('homeHeaderCanvas');
  if (section === 'intro') return document.getElementById('homeIntroMain');
  if (section === 'intro2') return document.getElementById('homeIntro2Main');
  if (section === 'closing') return document.getElementById('homeClosing');
  if (section === 'closing2') return document.getElementById('homeClosing2');
  if (section === 'cards') return document.getElementById('cardsSection');
  return document.querySelector('[data-home-section="' + section + '"]');
}

function mountCardsLayoutBarIntoEditor() {
  const bar = document.getElementById('cardsLayoutBar');
  const mount = document.getElementById('cardsEditorMount');
  const host = document.getElementById('cardsLayoutBarHost');
  if (!bar || !mount) return false;
  if (bar.parentElement !== mount) mount.appendChild(bar);
  bar.hidden = false;
  bar.classList.add('is-in-editor');
  mount.hidden = false;
  if (host) host.hidden = true;
  syncCategoriesToolbar(loadHome());
  applySiteTheme(loadHome());
  return true;
}

function unmountCardsLayoutBarFromEditor() {
  const bar = document.getElementById('cardsLayoutBar');
  const host = document.getElementById('cardsLayoutBarHost');
  const mount = document.getElementById('cardsEditorMount');
  if (bar) {
    bar.classList.remove('is-in-editor');
    bar.hidden = true;
    if (host) {
      if (bar.parentElement !== host) host.appendChild(bar);
      host.hidden = true;
    }
  }
  if (mount) mount.hidden = true;
}

function clearHomeSectionEditingFocus() {
  document.querySelectorAll('.is-section-editing').forEach(function (el) {
    el.classList.remove('is-section-editing');
  });
}

function syncHomeSectionEditingFocus() {
  clearHomeSectionEditingFocus();
  if (!editingHomeSection) return;
  const el = getHomeSectionFocusEl(editingHomeSection);
  if (el) el.classList.add('is-section-editing');
}

function scheduleHomeEditorPreview() {
  if (!editingHomeSection || !homeEditSnapshot) return;
  /* כרטיסי תוכן נשמרים ישירות — בלי preview שמוחק/מרנדר מחדש */
  if (editingHomeSection === 'cards') return;
  clearTimeout(homeEditPreviewTimer);
  const sectionAtSchedule = editingHomeSection;
  homeEditPreviewTimer = setTimeout(function () {
    if (editingHomeSection !== sectionAtSchedule || editingHomeSection === 'cards') return;
    renderHome(buildHomeDraftFromEditor(), getHomeEditorPreviewOptions()).then(function () {
      syncHomeSectionEditingFocus();
    });
  }, 50);
}

function bindHomeEditorLivePreview() {
  if (!homeEditFields || homeEditFields.dataset.livePreviewBound === '1') return;
  homeEditFields.dataset.livePreviewBound = '1';
  homeEditFields.addEventListener('input', function () {
    if (editingHomeSection === 'cards') return;
    scheduleHomeEditorPreview();
  });
  homeEditFields.addEventListener('change', function () {
    if (editingHomeSection === 'cards') return;
    scheduleHomeEditorPreview();
  });
}

function openHomeEditor(section) {
  clearTimeout(homeEditPreviewTimer);
  unmountCardsLayoutBarFromEditor();

  const home = loadHome();
  editingHomeSection = section;
  homeEditSnapshot = JSON.parse(JSON.stringify(home));
  homeEditCommitted = false;
  homeEditImageData = '';
  homeEditDevTeamImageData = '';
  homeEditVideoFile = null;
  homeEditVideoRemoved = false;
  homeEditHeaderDraft = null;

  let fieldsHtml = '';
  let title = 'עריכת מקטע';

  if (section === 'header') {
    title = 'עריכת כותרת';
    homeEditHeaderDraft = normalizeHeader(home.header, home.title);
    homeEditImageData = homeEditHeaderDraft.bgImage || '';
    fieldsHtml = homeHeaderFieldsHtml(homeEditHeaderDraft);
  }

  if (section === 'intro' || section === 'intro2') {
    title = section === 'intro' ? 'עריכת כותרת משנה ופתיח' : 'עריכת פתיח 2';
    homeEditImageData = home[section + 'Image'] || '';
    const subtitleValue = section === 'intro'
      ? (home.subtitle || '')
      : (home.intro2Subtitle || '');
    const subtitleSize = section === 'intro'
      ? home.subtitleSize
      : home.intro2SubtitleSize;
    const subtitleColor = section === 'intro'
      ? home.subtitleColor
      : home.intro2SubtitleColor;
    fieldsHtml =
      '<div class="form-field form-field--full">' +
        '<label for="homeFieldSubtitle">כותרת משנה (עד 10 תווים, אופציונלי)</label>' +
        '<input type="text" id="homeFieldSubtitle" value="' + escapeHtml(subtitleValue.slice(0, 10)) + '" maxlength="10">' +
      '</div>' +
      homeStyleRowHtml(
        homeTextSizeHtml('homeFieldSubtitleSize', subtitleSize, 20, 'גודל גופן לכותרת משנה'),
        homeColorChipHtml('homeFieldSubtitleColor', subtitleColor, {
          label: 'צבע כותרת משנה', shortLabel: 'כותרת', ico: 'text',
        })
      ) +
      '<div class="form-field form-field--full">' +
        '<label for="homeFieldIntro">טקסט פתיח (אופציונלי)</label>' +
        '<textarea id="homeFieldIntro" rows="4">' + escapeHtml(home[section + 'Text'] || '') + '</textarea>' +
      '</div>' +
      homeStyleRowHtml(
        homeTextSizeHtml('homeFieldTextSize', home[section + 'TextSize'], 16, 'גודל גופן לטקסט פתיח'),
        homeColorChipHtml('homeFieldTextColor', home[section + 'TextColor'], {
          label: 'צבע טקסט פתיח', shortLabel: 'טקסט', ico: 'text',
        })
      ) +
      homeMediaFieldsHtml({
        mediaType: home[section + 'MediaType'] || 'bg',
        imageUrl: home[section + 'Image'] || '',
        videoName: home[section + 'Video'] || '',
        bgOpacity: home[section + 'BgOpacity'],
      }) +
      homeSectionLayoutFieldsHtml(home, section);
  }

  if (section === 'closing' || section === 'closing2') {
    title = section === 'closing' ? 'עריכת סגירה' : 'עריכת סגירה 2';
    homeEditImageData = home[section + 'Image'] || '';
    homeEditDevTeamImageData = home[section + 'DevTeamImage'] || '';
    fieldsHtml =
      '<div class="form-field form-field--full">' +
        '<label for="homeFieldClosing">טקסט סגירה (אופציונלי)</label>' +
        '<textarea id="homeFieldClosing" rows="4">' + escapeHtml(home[section + 'Text'] || '') + '</textarea>' +
      '</div>' +
      homeStyleRowHtml(
        homeTextSizeHtml('homeFieldTextSize', home[section + 'TextSize'], 17, 'גודל גופן לטקסט סגירה'),
        homeColorChipHtml('homeFieldTextColor', home[section + 'TextColor'], {
          label: 'צבע טקסט סגירה', shortLabel: 'טקסט', ico: 'text',
        })
      ) +
      homeClosingDevTeamFieldsHtml(home, section) +
      homeMediaFieldsHtml({
        mediaType: home[section + 'MediaType'] || 'bg',
        imageUrl: home[section + 'Image'] || '',
        videoName: home[section + 'Video'] || '',
        bgOpacity: home[section + 'BgOpacity'],
      }) +
      homeSectionLayoutFieldsHtml(home, section);
  }

  if (section === 'cards') {
    title = 'עריכת כרטיסי תוכן';
    fieldsHtml =
      '<p class="field-subhint">הגדרות פריסה, רקע וחיפוש לאזור הכרטיסים. השינויים נשמרים מיד.</p>';
  }

  homeEditTitle.textContent = title;
  homeEditFields.innerHTML = fieldsHtml;
  homeEditOverlay.hidden = false;
  homeEditOverlay.classList.add('home-edit-live');

  if (section === 'cards') {
    if (!mountCardsLayoutBarIntoEditor()) {
      alert('לא ניתן לפתוח את עורך הכרטיסים. רעננו את העמוד ונסו שוב.');
      closeHomeEditor();
      return;
    }
  }

  bindHomeMediaTypeToggle();
  bindHomeLayoutFields();
  bindHomeBgOpacityField();
  bindHomeTextSizeField('homeFieldSubtitleSize');
  bindHomeTextSizeField('homeFieldTextSize');
  bindHomeTextColorField('homeFieldSubtitleColor');
  bindHomeTextColorField('homeFieldTextColor');
  bindHomeEditorMediaInputs();
  bindClosingDevTeamFields();
  bindHomeHeaderEditor();
  bindHomeEditorLivePreview();
  syncHomeSectionEditingFocus();
}

function homeHeaderItemEditorHtml(item) {
  const fontSize = clampFontSize(item.fontSize, defaultHeaderFontSize(item.type));
  const color = normalizeTextColor(item.color, '#ffffff');

  if (item.type === 'logo') {
    return (
      '<div class="home-header-editor-item" data-header-edit-id="' + escapeHtml(item.id) + '">' +
        '<div class="home-header-editor-item-head">' +
          '<strong>לוגו</strong>' +
          '<button type="button" class="home-header-remove-item" data-remove-header-item="' + escapeHtml(item.id) + '" title="מחיקה" aria-label="מחיקה">×</button>' +
        '</div>' +
        '<label class="upload-box" for="homeHeaderFile_' + escapeHtml(item.id) + '">' +
          '<input type="file" id="homeHeaderFile_' + escapeHtml(item.id) + '" accept="image/*" hidden data-header-logo-file="' + escapeHtml(item.id) + '">' +
          '<span class="upload-icon">🏷️</span>' +
          '<span class="upload-text">העלאת לוגו (PNG עם שקיפות)</span>' +
        '</label>' +
        '<img class="home-edit-preview' + (item.src ? ' is-visible' : '') + '" id="homeHeaderPreview_' + escapeHtml(item.id) + '" src="' + (item.src || '') + '" alt="">' +
        '<label for="homeHeaderCaption_' + escapeHtml(item.id) + '" style="margin-top:10px;display:block;">כיתוב מתחת ללוגו</label>' +
        '<input type="text" id="homeHeaderCaption_' + escapeHtml(item.id) + '" maxlength="40" value="' + escapeHtml(item.caption || '') + '">' +
        homeStyleRowHtml(
          homeTextSizeHtml('homeHeaderFont_' + item.id, fontSize, 12, 'גודל גופן לכיתוב'),
          homeColorChipHtml('homeHeaderColor_' + item.id, color, {
            label: 'צבע כיתוב', shortLabel: 'כיתוב', ico: 'text',
          })
        ) +
        '<label for="homeHeaderLink_' + escapeHtml(item.id) + '" style="margin-top:10px;display:block;">קישור (אופציונלי)</label>' +
        '<input type="text" id="homeHeaderLink_' + escapeHtml(item.id) + '" placeholder="https://..." value="' + escapeHtml(item.link || '') + '">' +
        '<label for="homeHeaderSize_' + escapeHtml(item.id) + '" style="margin-top:10px;display:block;">גודל לוגו: <strong id="homeHeaderSizeValue_' + escapeHtml(item.id) + '">' + item.w + '%</strong></label>' +
        '<input type="range" id="homeHeaderSize_' + escapeHtml(item.id) + '" min="6" max="40" step="1" value="' + item.w + '" style="width:100%; accent-color: var(--site-secondary, #4a7c3f);">' +
      '</div>'
    );
  }

  const labels = { title: 'כותרת', subtitle: 'כותרת משנה', badge: 'תג סיווג' };
  const canDelete = item.type !== 'title';
  const isBadge = item.type === 'badge';
  const badgeValue = isBadge ? normalizeHeaderBadgeText(item.text) : '';
  const textFieldHtml = isBadge
    ? (
      '<label for="homeHeaderText_' + escapeHtml(item.id) + '">סיווג</label>' +
      '<select id="homeHeaderText_' + escapeHtml(item.id) + '" aria-label="בחירת סיווג">' +
        HEADER_BADGE_OPTIONS.map(function (opt) {
          return '<option value="' + escapeHtml(opt) + '"' +
            (opt === badgeValue ? ' selected' : '') + '>' + escapeHtml(opt) + '</option>';
        }).join('') +
      '</select>'
    )
    : (
      '<label for="homeHeaderText_' + escapeHtml(item.id) + '">טקסט (עד 40 תווים)</label>' +
      '<input type="text" id="homeHeaderText_' + escapeHtml(item.id) + '" maxlength="40" value="' + escapeHtml(item.text || '') + '">'
    );

  return (
    '<div class="home-header-editor-item" data-header-edit-id="' + escapeHtml(item.id) + '">' +
      '<div class="home-header-editor-item-head">' +
        '<strong>' + (labels[item.type] || 'טקסט') + '</strong>' +
        (canDelete
          ? '<button type="button" class="home-header-remove-item" data-remove-header-item="' + escapeHtml(item.id) + '" title="מחיקה" aria-label="מחיקה">×</button>'
          : '') +
      '</div>' +
      textFieldHtml +
      homeStyleRowHtml(
        homeTextSizeHtml('homeHeaderFont_' + item.id, fontSize, defaultHeaderFontSize(item.type), 'גודל גופן'),
        homeColorChipHtml('homeHeaderColor_' + item.id, color, {
          label: 'צבע טקסט', shortLabel: 'טקסט', ico: 'text',
        })
      ) +
    '</div>'
  );
}

function homeHeaderFieldsHtml(header) {
  const itemsHtml = header.items.map(homeHeaderItemEditorHtml).join('');
  const hasSubtitle = header.items.some(function (item) { return item.type === 'subtitle'; });
  const hasBadge = header.items.some(function (item) { return item.type === 'badge'; });

  return (
    '<div class="form-field form-field--full">' +
      '<label for="homeFieldHeaderHeight">גובה מסגרת: <strong id="homeFieldHeaderHeightValue">' + header.height + 'px</strong></label>' +
      '<input type="range" id="homeFieldHeaderHeight" min="100" max="560" step="4" value="' + header.height + '" style="width:100%; accent-color: var(--site-secondary, #4a7c3f);">' +
      '<p class="field-subhint">אפשר גם לגרור את הידית בתחתית המסגרת במצב עריכה</p>' +
    '</div>' +
    homeBgOpacityHtml(header.bgOpacity) +
    homeImageFieldHtml(header.bgImage, 'תמונת רקע לכותרת (אופציונלי)') +
    '<div class="form-field form-field--full">' +
      '<span class="field-label">תבניות מיקום</span>' +
      '<div class="home-header-choice-grid">' +
        '<button type="button" class="home-header-choice-btn" id="homeHeaderPresetRight">לוגו ימין + כותרת מרכז</button>' +
        '<button type="button" class="home-header-choice-btn" id="homeHeaderPresetSides">לוגואים משני הצדדים</button>' +
      '</div>' +
      '<p class="field-subhint">אחרי בחירת תבנית אפשר לגרור כל אלמנט במסגרת</p>' +
    '</div>' +
    '<div class="form-field form-field--full">' +
      '<span class="field-label">אלמנטים</span>' +
      '<div class="home-header-choice-grid home-header-choice-grid--add">' +
        '<button type="button" class="home-header-choice-btn home-header-choice-btn--add" id="homeHeaderAddLogo">+ לוגו</button>' +
        (hasSubtitle ? '' : '<button type="button" class="home-header-choice-btn home-header-choice-btn--add" id="homeHeaderAddSubtitle">+ כותרת משנה</button>') +
        (hasBadge ? '' : '<button type="button" class="home-header-choice-btn home-header-choice-btn--add" id="homeHeaderAddBadge">+ תג סיווג</button>') +
      '</div>' +
      '<div id="homeHeaderItemsEditor">' + itemsHtml + '</div>' +
    '</div>'
  );
}

function refreshHomeHeaderEditorFields() {
  if (!homeEditHeaderDraft || !homeEditFields) return;
  readHeaderDraftFromEditor();
  homeEditImageData = homeEditHeaderDraft.bgImage || '';
  homeEditFields.innerHTML = homeHeaderFieldsHtml(homeEditHeaderDraft);
  bindHomeBgOpacityField();
  bindHomeEditorMediaInputs();
  bindHomeHeaderEditor();
  scheduleHomeEditorPreview();
}

function bindHomeHeaderEditor() {
  if (editingHomeSection !== 'header' || !homeEditHeaderDraft) return;

  const heightEl = document.getElementById('homeFieldHeaderHeight');
  const heightValue = document.getElementById('homeFieldHeaderHeightValue');
  if (heightEl && heightValue) {
    heightEl.addEventListener('input', function () {
      heightValue.textContent = clampHeaderHeight(heightEl.value) + 'px';
      scheduleHomeEditorPreview();
    });
  }

  homeEditHeaderDraft.items.forEach(function (item) {
    bindHomeTextSizeField('homeHeaderFont_' + item.id);
    bindHomeTextColorField('homeHeaderColor_' + item.id);

    if (item.type !== 'logo') return;
    const sizeEl = document.getElementById('homeHeaderSize_' + item.id);
    const sizeValue = document.getElementById('homeHeaderSizeValue_' + item.id);
    if (sizeEl && sizeValue) {
      sizeEl.addEventListener('input', function () {
        sizeValue.textContent = clampLogoWidth(sizeEl.value) + '%';
        scheduleHomeEditorPreview();
      });
    }
  });

  document.querySelectorAll('[data-header-logo-file]').forEach(function (input) {
    input.addEventListener('change', async function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const itemId = input.dataset.headerLogoFile;
      const dataUrl = await readFileAsDataURL(file, 400, null, true);
      const item = homeEditHeaderDraft.items.find(function (entry) { return entry.id === itemId; });
      if (!item) return;
      item.src = dataUrl;
      const preview = document.getElementById('homeHeaderPreview_' + itemId);
      if (preview) {
        preview.src = dataUrl;
        preview.classList.add('is-visible');
      }
      scheduleHomeEditorPreview();
    });
  });

  document.querySelectorAll('[data-remove-header-item]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const itemId = btn.dataset.removeHeaderItem;
      readHeaderDraftFromEditor();
      homeEditHeaderDraft.items = homeEditHeaderDraft.items.filter(function (item) {
        return item.id !== itemId || item.type === 'title';
      });
      homeEditHeaderDraft = normalizeHeader(homeEditHeaderDraft, '');
      refreshHomeHeaderEditorFields();
    });
  });

  const addLogo = document.getElementById('homeHeaderAddLogo');
  if (addLogo) {
    addLogo.addEventListener('click', function () {
      readHeaderDraftFromEditor();
      const logos = homeEditHeaderDraft.items.filter(function (item) { return item.type === 'logo'; });
      homeEditHeaderDraft.items.push(normalizeHeaderItem({
        type: 'logo',
        src: '',
        link: '',
        caption: '',
        x: logos.length ? 12 : 88,
        y: 18 + logos.length * 20,
        w: 14,
      }));
      refreshHomeHeaderEditorFields();
    });
  }

  const addSubtitle = document.getElementById('homeHeaderAddSubtitle');
  if (addSubtitle) {
    addSubtitle.addEventListener('click', function () {
      readHeaderDraftFromEditor();
      if (homeEditHeaderDraft.items.some(function (item) { return item.type === 'subtitle'; })) return;
      homeEditHeaderDraft.items.push(normalizeHeaderItem({
        type: 'subtitle',
        text: '',
        x: 50,
        y: 68,
        align: 'center',
      }));
      refreshHomeHeaderEditorFields();
    });
  }

  const addBadge = document.getElementById('homeHeaderAddBadge');
  if (addBadge) {
    addBadge.addEventListener('click', function () {
      readHeaderDraftFromEditor();
      if (homeEditHeaderDraft.items.some(function (item) { return item.type === 'badge'; })) return;
      homeEditHeaderDraft.items.push(normalizeHeaderItem({
        type: 'badge',
        text: 'שמור',
        x: 50,
        y: 12,
        align: 'center',
      }));
      refreshHomeHeaderEditorFields();
    });
  }

  const presetRight = document.getElementById('homeHeaderPresetRight');
  if (presetRight) {
    presetRight.addEventListener('click', function () {
      readHeaderDraftFromEditor();
      applyHeaderPreset(homeEditHeaderDraft, 'logo-right-title-center');
      refreshHomeHeaderEditorFields();
    });
  }

  const presetSides = document.getElementById('homeHeaderPresetSides');
  if (presetSides) {
    presetSides.addEventListener('click', function () {
      readHeaderDraftFromEditor();
      applyHeaderPreset(homeEditHeaderDraft, 'logos-sides-title-center');
      refreshHomeHeaderEditorFields();
    });
  }
}

function bindHomeEditorMediaInputs() {
  const imageInput = document.getElementById('homeFieldImage');
  if (imageInput) {
    imageInput.addEventListener('change', async function (e) {
      const file = e.target.files[0];
      if (!file) return;
      homeEditImageData = await readFileAsDataURL(file, 1400, 21 / 9);
      const preview = document.getElementById('homeFieldImagePreview');
      preview.src = homeEditImageData;
      preview.classList.add('is-visible');
      scheduleHomeEditorPreview();
    });
  }

  const clearBtn = document.getElementById('homeClearImage');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      homeEditImageData = '';
      const preview = document.getElementById('homeFieldImagePreview');
      preview.src = '';
      preview.classList.remove('is-visible');
      clearBtn.remove();
      scheduleHomeEditorPreview();
    });
  }

  const videoFile = document.getElementById('homeFieldVideoFile');
  if (videoFile) {
    videoFile.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;
      if (!isBrowserPlayableVideo(file)) {
        alert(
          'הקובץ שנבחר עלול לא להתנגן בדפדפן.\n' +
          'מומלץ להשתמש ב־MP4 או WebM (לא MKV).\n\n' +
          'אפשר להמשיך, אבל ייתכן שהסרטון לא יוצג.'
        );
      }
      homeEditVideoFile = file;
      homeEditVideoRemoved = false;
      const nameEl = document.getElementById('homeVideoFileName');
      if (nameEl) {
        nameEl.hidden = false;
        nameEl.innerHTML = 'קובץ נבחר: <strong dir="ltr">' + escapeHtml(file.name) + '</strong>';
      }
      scheduleHomeEditorPreview();
    });
  }

  const clearVideo = document.getElementById('homeClearVideo');
  if (clearVideo) {
    clearVideo.addEventListener('click', function () {
      homeEditVideoFile = null;
      homeEditVideoRemoved = true;
      if (videoFile) videoFile.value = '';
      const nameEl = document.getElementById('homeVideoFileName');
      if (nameEl) {
        nameEl.hidden = true;
        nameEl.innerHTML = '';
      }
      clearVideo.remove();
      scheduleHomeEditorPreview();
    });
  }
}

function closeHomeEditor() {
  clearTimeout(homeEditPreviewTimer);
  const shouldRevert = !homeEditCommitted && !!homeEditSnapshot && editingHomeSection !== 'cards';
  unmountCardsLayoutBarFromEditor();
  homeEditOverlay.hidden = true;
  homeEditOverlay.classList.remove('home-edit-live');
  editingHomeSection = null;
  clearHomeSectionEditingFocus();
  homeEditImageData = '';
  homeEditDevTeamImageData = '';
  homeEditVideoFile = null;
  homeEditVideoRemoved = false;
  homeEditHeaderDraft = null;

  if (shouldRevert) {
    renderHome();
  }

  homeEditSnapshot = null;
  homeEditCommitted = false;
}

async function saveHomeEditor(e) {
  e.preventDefault();
  if (!editingHomeSection) return;

  if (editingHomeSection === 'cards') {
    homeEditCommitted = true;
    closeHomeEditor();
    return;
  }

  const home = loadHome();

  if (editingHomeSection === 'header') {
    home.header = readHeaderDraftFromEditor();
    syncTitleFromHeader(home);
  }

  if (editingHomeSection === 'intro' || editingHomeSection === 'intro2') {
    const kind = editingHomeSection;
    if (kind === 'intro') {
      home.subtitle = document.getElementById('homeFieldSubtitle').value.trim().slice(0, 10);
    } else {
      home.intro2Subtitle = document.getElementById('homeFieldSubtitle').value.trim().slice(0, 10);
    }
    home[kind + 'Text'] = document.getElementById('homeFieldIntro').value.trim();
    const introSubtitleSizeEl = document.getElementById('homeFieldSubtitleSize');
    if (introSubtitleSizeEl) {
      if (kind === 'intro') home.subtitleSize = clampFontSize(introSubtitleSizeEl.value, 20);
      else home.intro2SubtitleSize = clampFontSize(introSubtitleSizeEl.value, 20);
    }
    const introSubtitleColorEl = document.getElementById('homeFieldSubtitleColor');
    if (introSubtitleColorEl) {
      if (kind === 'intro') home.subtitleColor = normalizeTextColor(introSubtitleColorEl.value, '#ffffff');
      else home.intro2SubtitleColor = normalizeTextColor(introSubtitleColorEl.value, '#ffffff');
    }
    const introTextSizeEl = document.getElementById('homeFieldTextSize');
    if (introTextSizeEl) home[kind + 'TextSize'] = clampFontSize(introTextSizeEl.value, 16);
    const introTextColorEl = document.getElementById('homeFieldTextColor');
    if (introTextColorEl) home[kind + 'TextColor'] = normalizeTextColor(introTextColorEl.value, '#ffffff');
    home[kind + 'MediaType'] = getSelectedHomeMediaType();
    const introOpacityEl = document.getElementById('homeFieldBgOpacity');
    if (introOpacityEl) home[kind + 'BgOpacity'] = clampBgOpacity(introOpacityEl.value);
    readHomeLayoutFields(home, kind);
    if (home[kind + 'MediaType'] === 'video') {
      try {
        if (homeEditVideoRemoved) {
          await deleteHomeVideo(kind);
          home[kind + 'Video'] = '';
        } else if (homeEditVideoFile) {
          const putResult = await putHomeVideo(kind, homeEditVideoFile);
          home[kind + 'Video'] = homeEditVideoFile.name;
          home[kind + 'SizeAuto'] = true;
          if (putResult && putResult.ephemeral) {
            alert(
              'הסרטון יוצג בסשן הנוכחי, אבל לא נשמר לצמיתות.\n\n' +
              friendlyMediaDbError(putResult.error)
            );
          }
        }
      } catch (err) {
        console.error(err);
        alert(friendlyMediaDbError(err));
        return;
      }
    } else if (home[kind + 'MediaType'] === 'image') {
      home[kind + 'Image'] = homeEditImageData || '';
    }
  }

  if (editingHomeSection === 'closing' || editingHomeSection === 'closing2') {
    const kind = editingHomeSection;
    home[kind + 'Text'] = document.getElementById('homeFieldClosing').value.trim();
    const closingTextSizeEl = document.getElementById('homeFieldTextSize');
    if (closingTextSizeEl) home[kind + 'TextSize'] = clampFontSize(closingTextSizeEl.value, 17);
    const closingTextColorEl = document.getElementById('homeFieldTextColor');
    if (closingTextColorEl) home[kind + 'TextColor'] = normalizeTextColor(closingTextColorEl.value, '#ffffff');
    home[kind + 'MediaType'] = getSelectedHomeMediaType();
    const closingOpacityEl = document.getElementById('homeFieldBgOpacity');
    if (closingOpacityEl) home[kind + 'BgOpacity'] = clampBgOpacity(closingOpacityEl.value);
    readHomeLayoutFields(home, kind);
    readClosingDevTeamFields(home, kind);
    if (home[kind + 'MediaType'] === 'video') {
      try {
        if (homeEditVideoRemoved) {
          await deleteHomeVideo(kind);
          home[kind + 'Video'] = '';
        } else if (homeEditVideoFile) {
          const putResult = await putHomeVideo(kind, homeEditVideoFile);
          home[kind + 'Video'] = homeEditVideoFile.name;
          home[kind + 'SizeAuto'] = true;
          if (putResult && putResult.ephemeral) {
            alert(
              'הסרטון יוצג בסשן הנוכחי, אבל לא נשמר לצמיתות.\n\n' +
              friendlyMediaDbError(putResult.error)
            );
          }
        }
      } catch (err) {
        console.error(err);
        alert(friendlyMediaDbError(err));
        return;
      }
    } else if (home[kind + 'MediaType'] === 'image') {
      home[kind + 'Image'] = homeEditImageData || '';
    }
  }

  if (!saveHome(home)) {
    alert('אין מספיק מקום לשמירה. נסו תמונה קטנה יותר.');
    return;
  }

  homeEditCommitted = true;
  await renderHome();
  closeHomeEditor();
}

/* ===== אירועים ===== */

btnNew.addEventListener('click', openWizard);
btnEdit.addEventListener('click', toggleEditMode);
btnCancel.addEventListener('click', closeWizard);

document.getElementById('siteFont').addEventListener('change', function (e) {
  updateHomeField({ siteFont: e.target.value });
});

document.getElementById('siteFontUpload').addEventListener('change', async function (e) {
  const file = e.target.files[0];
  e.target.value = '';
  await handleFontUpload(file, 'site');
});

document.getElementById('cardFontUpload').addEventListener('change', async function (e) {
  const file = e.target.files[0];
  e.target.value = '';
  await handleFontUpload(file, 'card');
});

document.getElementById('siteBgImage').addEventListener('change', async function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const dataUrl = await readFileAsDataURL(file, 1600, 16 / 9);
  updateHomeField({ siteBgImage: dataUrl });
  e.target.value = '';
});

document.getElementById('siteBgClear').addEventListener('click', function () {
  updateHomeField({ siteBgImage: '' });
});

document.getElementById('cardsBgImage').addEventListener('change', async function (e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const dataUrl = await readFileAsDataURL(file, 1400, 16 / 9);
    const marker = await persistCardsBgImage(dataUrl);
    if (!updateHomeField({ cardsBgImage: marker })) {
      await persistCardsBgImage('');
      alert('אין מספיק מקום לשמירה. נסו תמונה קטנה יותר.');
    }
  } catch (err) {
    console.error(err);
    alert('לא הצלחנו לשמור את תמונת הרקע. נסו קובץ אחר.');
  }
  e.target.value = '';
});

document.getElementById('cardsBgClear').addEventListener('click', async function () {
  try {
    await persistCardsBgImage('');
  } catch (_) {}
  updateHomeField({ cardsBgImage: '' });
});

document.getElementById('cardsSearchEnabled').addEventListener('change', function (e) {
  const enabled = !!e.target.checked;
  if (!updateHomeField({ cardsSearchEnabled: enabled })) {
    e.target.checked = !enabled;
    return;
  }
  if (!enabled) {
    cardsSearchQuery = '';
    const input = document.getElementById('cardsSearchInput');
    if (input) input.value = '';
  }
  syncCategoriesToolbar(loadHome());
  renderCards(loadCards());
  if (enabled) {
    const input = document.getElementById('cardsSearchInput');
    if (input) input.focus();
  }
});

document.getElementById('cardsSearchInput').addEventListener('input', function (e) {
  cardsSearchQuery = e.target.value;
  const start = e.target.selectionStart;
  const end = e.target.selectionEnd;
  renderCards(loadCards());
  const input = document.getElementById('cardsSearchInput');
  if (input) {
    input.focus();
    try {
      input.setSelectionRange(start, end);
    } catch (_) {}
  }
});

document.getElementById('cardsPerRow').addEventListener('input', function (e) {
  const value = Number(e.target.value);
  document.getElementById('cardsPerRowValue').textContent = String(value);
  updateHomeField({ cardsPerRow: value });
});

document.getElementById('cardsGap').addEventListener('input', function (e) {
  const value = Number(e.target.value);
  document.getElementById('cardsGapValue').textContent = value + 'px';
  updateHomeField({ cardsGap: value });
});

document.getElementById('cardsLayoutMode').addEventListener('change', function (e) {
  const mode = e.target.value;
  if (mode !== 'matrix' && mode !== 'categories' && mode !== 'freeform') return;
  const home = loadHome();
  home.cardsLayoutMode = mode;
  home.categoriesEnabled = mode === 'categories';
  if (mode === 'categories') {
    home.categories = normalizeCategories(home.categories, loadCards());
  }
  if (mode === 'freeform') {
    home.cardsFreeHeight = clampCardsFreeHeight(home.cardsFreeHeight);
    home.cardsFreeSize = clampCardFreeWidth(home.cardsFreeSize);
    ensureCardPositions(home, loadCards());
  }
  if (!saveHome(home)) {
    e.target.value = getCardsLayoutMode(loadHome());
    alert('אין מספיק מקום לשמירה.');
    return;
  }
  syncCategoriesToolbar(home);
  renderCards(loadCards());
});

document.getElementById('cardsFreeHeight').addEventListener('input', function (e) {
  const value = clampCardsFreeHeight(e.target.value);
  applyCardsFreeHeight(value);
  updateHomeField({ cardsFreeHeight: value });
});

document.getElementById('cardsFreeSize').addEventListener('input', function (e) {
  const value = clampCardFreeWidth(e.target.value);
  applyCardsFreeSizeToDom(value);
  const home = loadHome();
  const positions = Object.assign({}, getCardPositionMap(home));
  Object.keys(positions).forEach(function (id) {
    positions[id] = normalizeCardPosition(Object.assign({}, positions[id], { w: value }), value);
  });
  home.cardsFreeSize = value;
  home.cardPositions = positions;
  if (!saveHome(home)) {
    alert('אין מספיק מקום לשמירה.');
    return;
  }
  syncCategoriesToolbar(home);
});

document.getElementById('addCategoryBtn').addEventListener('click', function () {
  addCategory();
});

document.querySelectorAll('[data-edit-home]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    openHomeEditor(btn.dataset.editHome);
  });
});

document.querySelectorAll('[data-dup-home]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    duplicateHomeSection(btn.dataset.dupHome);
  });
});

document.querySelectorAll('[data-delete-home]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    deleteSecondaryHomeSection(btn.dataset.deleteHome);
  });
});

homeEditForm.addEventListener('submit', saveHomeEditor);
document.getElementById('homeEditCancel').addEventListener('click', closeHomeEditor);
document.getElementById('homeEditCancelBtn').addEventListener('click', closeHomeEditor);
homeEditOverlay.addEventListener('click', function (e) {
  if (e.target === homeEditOverlay) closeHomeEditor();
});

btnPrev.addEventListener('click', function () {
  if (currentStep > 1) goToStep(currentStep - 1);
});

btnNext.addEventListener('click', function () {
  syncFormToData();
  const err = validateStep(currentStep);
  if (err) {
    showError(err);
    return;
  }
  if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
});

wizardForm.addEventListener('submit', function (e) {
  e.preventDefault();
  finishWizard();
});

btnFinish.addEventListener('click', function (e) {
  e.preventDefault();
  finishWizard();
});

modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) closeWizard();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (!homeEditOverlay.hidden) {
      closeHomeEditor();
    } else if (!detailOverlay.hidden) {
      closeCardDetail();
    } else if (!modalOverlay.hidden) {
      closeWizard();
    } else if (editMode) {
      toggleEditMode();
    }
  }
});

detailClose.addEventListener('click', closeCardDetail);
detailOverlay.addEventListener('click', function (e) {
  if (e.target === detailOverlay) closeCardDetail();
});

(function bindBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  const SHOW_AFTER = 280;

  function syncVisibility() {
    const show = window.scrollY > SHOW_AFTER;
    btn.hidden = !show;
    btn.classList.toggle('is-visible', show);
  }

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', syncVisibility, { passive: true });
  syncVisibility();
})();

bindLiveInputs();
bindHslaPickers();
setupHslaField(document.getElementById('siteColorPicker'), function (hex) {
  updateHomeField({ siteSecondaryColor: hex });
});
bindSectionResizeHandles();
syncResizeHandlesVisibility();

async function initApp() {
  try {
    await loadAndRegisterCustomFonts();
  } catch (err) {
    console.warn('Custom fonts unavailable', err);
  }
  populateFontSelects();
  try {
    await hydrateCardsBgImage(loadHome());
  } catch (err) {
    console.warn('Cards background unavailable', err);
  }
  await renderHome();
  renderCards(loadCards());
  playPageEntrance();
}

function preparePageEntrance() {
  const selectors = [
    '#siteToolbar',
    '#homeHeader',
    '#homeIntro',
    '#homeIntro2',
    '#cardsGrid .card',
    '#homeClosing',
    '#homeClosing2',
  ];
  let index = 0;
  selectors.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (el.hidden) return;
      el.classList.add('anim-enter');
      el.style.setProperty('--i', String(index));
      index += 1;
    });
  });
}

function playPageEntrance() {
  if (pageEntranceDone) {
    document.body.classList.add('motion-ready');
    return;
  }

  if (prefersReducedMotion()) {
    document.body.classList.add('motion-ready');
    pageEntranceDone = true;
    return;
  }

  preparePageEntrance();
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add('motion-ready');
      pageEntranceDone = true;
      setTimeout(function () {
        document.querySelectorAll('.anim-enter').forEach(function (el) {
          el.classList.remove('anim-enter');
          el.style.removeProperty('--i');
        });
      }, 2200);
    });
  });
}

initApp();
