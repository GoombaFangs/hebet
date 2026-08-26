const STORAGE_KEY = 'hebet-cards';
const HOME_STORAGE_KEY = 'hebet-home';
const FONTS_DB_NAME = 'hebet-fonts';
const FONTS_STORE = 'fonts';
const HEBET_BOOTSTRAP_ID = 'hebet-bootstrap';
const HEBET_BOOTSTRAP_VERSION = 1;
const HEBET_EXPORT_FILENAME = 'hebet-portal.html';

const APP_MODE = (function detectAppMode() {
  if (document.body) {
    const attr = document.body.getAttribute('data-app-mode');
    if (attr === 'user') return 'user';
  }
  try {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'user') return 'user';
  } catch (err) {}
  return 'edit';
})();
const IS_USER_MODE = APP_MODE === 'user';
const IS_EDIT_MODE = !IS_USER_MODE;

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

const HEADER_ACCENT = '#E31C24';
const HEADER_INK = '#1A1A1A';
const HEADER_TEXT_COLOR = '#000000';

const DEFAULT_HOME = {
  title: 'כותרת',
  header: {
    layout: 'hero',
    height: 400,
    bgOpacity: 0,
    bgImage: '',
    artSrc: '',
    artSide: 'left',
    artWidth: 46,
    kicker: 'תווית עליונה',
    kickerColor: HEADER_TEXT_COLOR,
    kickerSize: 15,
    title: 'כותרת',
    titleColor: HEADER_TEXT_COLOR,
    titleSize: 44,
    body: 'טקסט תיאור. כאן אפשר לכתוב פסקה קצרה על תוכן האתר.',
    bodyColor: HEADER_TEXT_COLOR,
    bodySize: 17,
    bodyAccentColor: HEADER_ACCENT,
    bodyAccents: '',
    buttonText: 'כפתור',
    buttonHref: '',
    buttonBg: HEADER_ACCENT,
    buttonColor: '#ffffff',
    buttonRadius: 40,
    linkText: 'קישור',
    linkHref: '',
    linkColor: HEADER_ACCENT,
  },
  subtitle: 'כותרת משנה',
  subtitleSize: 20,
  subtitleColor: '#ffffff',
  introText: 'טקסט פתיח',
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
  hasIntro: false,
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
  closingText: 'טקסט סגירה',
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
  siteSecondaryColor: '#e31c23',
  colorCards: false,
  siteFont: "'Segoe UI', Tahoma, Arial, sans-serif",
  cardsPerRow: 5,
  cardsGap: 16,
  cardsLayoutMode: 'categories',
  categories: [],
  cardsFreeHeight: 420,
  cardsFreeSize: 18,
  cardPositions: {},
  floatMenu: {
    enabled: true,
    side: 'start',
    title: 'כותרת תפריט',
    items: [],
    tags: [],
  },
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

const DEFAULT_CARD_BG_MODE = 'squareImage';
const DEFAULT_CARD_TITLE_COLOR = '#e31c23';
const DEFAULT_CARD_NOTES_COLOR = '#333333';
const DEFAULT_CARD_TITLE_SIZE = 34;
const DEFAULT_CARD_NOTES_SIZE = 15;

const DEFAULT_CARDS = [
  { id: 'card-1', title: 'כותרת', description: 'תיאור קצר', link: 'pages/page1.html', gradient: GRADIENTS[0], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f', bgMode: DEFAULT_CARD_BG_MODE, outlineColor: '#e31c23', outlineWidth: 2, flatEdge: 'outline', flatBgColor: '#ffffff', titleColor: '#e31c23', notesColor: '#333333', titleSize: 34, notesSize: 15 },
  { id: 'card-2', title: 'כותרת', description: 'תיאור קצר', link: 'pages/page2.html', gradient: GRADIENTS[1], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f', bgMode: DEFAULT_CARD_BG_MODE, outlineColor: '#e31c23', outlineWidth: 2, flatEdge: 'outline', flatBgColor: '#ffffff', titleColor: '#e31c23', notesColor: '#333333', titleSize: 34, notesSize: 15 },
  { id: 'card-3', title: 'כותרת', description: 'תיאור קצר', link: 'pages/page3.html', gradient: GRADIENTS[2], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f', bgMode: DEFAULT_CARD_BG_MODE, outlineColor: '#e31c23', outlineWidth: 2, flatEdge: 'outline', flatBgColor: '#ffffff', titleColor: '#e31c23', notesColor: '#333333', titleSize: 34, notesSize: 15 },
  { id: 'card-4', title: 'כותרת', description: 'תיאור קצר', link: 'pages/page4.html', gradient: GRADIENTS[3], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f', bgMode: DEFAULT_CARD_BG_MODE, outlineColor: '#e31c23', outlineWidth: 2, flatEdge: 'outline', flatBgColor: '#ffffff', titleColor: '#e31c23', notesColor: '#333333', titleSize: 34, notesSize: 15 },
  { id: 'card-5', title: 'כותרת', description: 'תיאור קצר', link: 'pages/page5.html', gradient: GRADIENTS[4], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f', bgMode: DEFAULT_CARD_BG_MODE, outlineColor: '#e31c23', outlineWidth: 2, flatEdge: 'outline', flatBgColor: '#ffffff', titleColor: '#e31c23', notesColor: '#333333', titleSize: 34, notesSize: 15 },
  { id: 'card-6', title: 'כותרת', description: 'תיאור קצר', link: 'pages/page6.html', gradient: GRADIENTS[5], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f', bgMode: DEFAULT_CARD_BG_MODE, outlineColor: '#e31c23', outlineWidth: 2, flatEdge: 'outline', flatBgColor: '#ffffff', titleColor: '#e31c23', notesColor: '#333333', titleSize: 34, notesSize: 15 },
  { id: 'card-7', title: 'כותרת', description: 'תיאור קצר', link: 'pages/page7.html', gradient: GRADIENTS[6], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f', bgMode: DEFAULT_CARD_BG_MODE, outlineColor: '#e31c23', outlineWidth: 2, flatEdge: 'outline', flatBgColor: '#ffffff', titleColor: '#e31c23', notesColor: '#333333', titleSize: 34, notesSize: 15 },
  { id: 'card-8', title: 'כותרת', description: 'תיאור קצר', link: 'pages/page8.html', gradient: GRADIENTS[7], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f', bgMode: DEFAULT_CARD_BG_MODE, outlineColor: '#e31c23', outlineWidth: 2, flatEdge: 'outline', flatBgColor: '#ffffff', titleColor: '#e31c23', notesColor: '#333333', titleSize: 34, notesSize: 15 },
  { id: 'card-9', title: 'כותרת', description: 'תיאור קצר', link: 'pages/page9.html', gradient: GRADIENTS[8], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f', bgMode: DEFAULT_CARD_BG_MODE, outlineColor: '#e31c23', outlineWidth: 2, flatEdge: 'outline', flatBgColor: '#ffffff', titleColor: '#e31c23', notesColor: '#333333', titleSize: 34, notesSize: 15 },
  { id: 'card-10', title: 'כותרת', description: 'תיאור קצר', link: 'pages/page10.html', gradient: GRADIENTS[9], projectType: 'מצגת', classification: 'שמור', status: 'מוכן', primaryColor: '#e87722', secondaryColor: '#4a7c3f', bgMode: DEFAULT_CARD_BG_MODE, outlineColor: '#e31c23', outlineWidth: 2, flatEdge: 'outline', flatBgColor: '#ffffff', titleColor: '#e31c23', notesColor: '#333333', titleSize: 34, notesSize: 15 },
];

const cardsGridTop = document.getElementById('cardsGridTop');
const cardsGridBottom = document.getElementById('cardsGridBottom');
const btnNew = document.getElementById('btnNew');
const btnEdit = document.getElementById('btnEdit');
const btnSettings = document.getElementById('btnSettings');
const settingsMenu = document.getElementById('settingsMenu');
const settingsWrap = document.getElementById('settingsWrap');
const modalOverlay = document.getElementById('modalOverlay');
const wizardForm = document.getElementById('wizardForm');
const btnCancel = document.getElementById('btnCancel');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnFinish = document.getElementById('btnFinish');
const livePreview = document.getElementById('livePreview');
const wizardError = document.getElementById('wizardError');

let editMode = false;
let activeInlineEdit = null;
let draggedElement = null;
let currentStep = 1;
let editingCardId = null;
let wizardPreviewTextEdit = null;
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
    outlineColor: '#e31c23',
    titleColor: DEFAULT_CARD_TITLE_COLOR,
    notesColor: DEFAULT_CARD_NOTES_COLOR,
    titleSize: DEFAULT_CARD_TITLE_SIZE,
    notesSize: DEFAULT_CARD_NOTES_SIZE,
    flatBgColor: '#ffffff',
    outlineWidth: 2,
    flatEdge: 'outline',
    actionStyle: 'text',
    actionColor: '#e87722',
    iconSize: 22,
    iconsFree: false,
    iconPositions: {},
    logoFree: false,
    logoPosition: null,
    flatImageZoom: 100,
    flatImagePosX: 50,
    flatImagePosY: 50,
    fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
    bgMode: DEFAULT_CARD_BG_MODE,
    useImageBg: false,
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
  let cards;
  if (saved) {
    try {
      cards = JSON.parse(saved);
    } catch {
      cards = [...DEFAULT_CARDS];
    }
  } else {
    cards = [...DEFAULT_CARDS];
  }
  return normalizeStoredCards(cards);
}

function normalizeStoredCards(cards) {
  cards = Array.isArray(cards) ? cards : [];
  let changed = false;
  const normalized = cards.map(function (card, index) {
    if (card.section === 'top' || card.section === 'bottom') return card;
    changed = true;
    return Object.assign({}, card, {
      section: index < Math.ceil(cards.length / 2) ? 'top' : 'bottom',
    });
  });
  if (changed) saveCards(normalized);
  return normalized;
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

const CARD_SECTIONS = [
  {
    id: 'top',
    editKey: 'cardsTop',
    label: 'סקשן עליון',
    defaultTitle: 'סקשן עליון',
    sectionElId: 'cardsSectionTop',
    gridElId: 'cardsGridTop',
    titleElId: 'cardsTopTitle',
  },
  {
    id: 'bottom',
    editKey: 'cardsBottom',
    label: 'סקשן תחתון',
    defaultTitle: 'סקשן תחתון',
    sectionElId: 'cardsSectionBottom',
    gridElId: 'cardsGridBottom',
    titleElId: 'cardsBottomTitle',
  },
];

let activeCardsSectionId = 'top';

function defaultCardsSectionConfig(overrides) {
  return Object.assign({
    title: '',
    layoutMode: 'categories',
    cardsPerRow: 5,
    cardsGap: 16,
    categories: [],
    cardPositions: {},
    cardsFreeHeight: 420,
    cardsFreeSize: 18,
  }, overrides || {});
}

function getCardsSectionMeta(sectionId) {
  return CARD_SECTIONS.find(function (row) { return row.id === sectionId; }) || CARD_SECTIONS[0];
}

function getCardsSectionIdFromEditKey(editKey) {
  const row = CARD_SECTIONS.find(function (item) { return item.editKey === editKey; });
  return row ? row.id : 'top';
}

function getCardsEditKeyFromSectionId(sectionId) {
  return getCardsSectionMeta(sectionId).editKey;
}

function isCardsHomeSection(section) {
  return section === 'cardsTop' || section === 'cardsBottom';
}

function getCardsGridEl(sectionId) {
  return document.getElementById(getCardsSectionMeta(sectionId).gridElId);
}

function getCardsSectionEl(sectionId) {
  return document.getElementById(getCardsSectionMeta(sectionId).sectionElId);
}

function getCardsSectionIdFromGridEl(gridEl) {
  if (!gridEl) return activeCardsSectionId;
  const sectionId = gridEl.dataset.cardsSection;
  if (sectionId === 'top' || sectionId === 'bottom') return sectionId;
  return activeCardsSectionId;
}

function getCardsSectionIdFromElement(el) {
  return getCardsSectionIdFromGridEl(el && el.closest ? el.closest('.cards-grid') : null);
}

function forEachCardsGrid(callback) {
  CARD_SECTIONS.forEach(function (row) {
    const grid = getCardsGridEl(row.id);
    if (grid) callback(grid, row.id);
  });
}

function normalizeCardSection(card) {
  return card && card.section === 'bottom' ? 'bottom' : 'top';
}

function getCardsForSection(cards, sectionId) {
  return (cards || []).filter(function (card) {
    return normalizeCardSection(card) === sectionId;
  });
}

function ensureCardsSections(home) {
  if (home.cardsSections && home.cardsSections.top && home.cardsSections.bottom) {
    home.cardsSections.top = defaultCardsSectionConfig(home.cardsSections.top);
    home.cardsSections.bottom = defaultCardsSectionConfig(home.cardsSections.bottom);
    return home;
  }

  let legacyLayoutMode = 'categories';
  if (home.cardsLayoutMode === 'matrix' || home.cardsLayoutMode === 'categories' || home.cardsLayoutMode === 'freeform') {
    legacyLayoutMode = home.cardsLayoutMode;
  } else if (home.categoriesEnabled) {
    legacyLayoutMode = 'categories';
  }

  const legacyTop = defaultCardsSectionConfig({
    title: home.cardsTopTitle || 'סקשן עליון',
    layoutMode: legacyLayoutMode,
    cardsPerRow: home.cardsPerRow,
    cardsGap: home.cardsGap,
    categories: Array.isArray(home.categories) ? home.categories : [],
    cardPositions: home.cardPositions && typeof home.cardPositions === 'object' ? home.cardPositions : {},
    cardsFreeHeight: home.cardsFreeHeight,
    cardsFreeSize: home.cardsFreeSize,
  });

  home.cardsSections = {
    top: legacyTop,
    bottom: defaultCardsSectionConfig({
      title: home.cardsBottomTitle || 'סקשן תחתון',
    }),
  };
  return home;
}

function getCardsSectionConfig(home, sectionId) {
  home = ensureCardsSections(home || loadHome());
  return home.cardsSections[sectionId] || home.cardsSections.top;
}

function setCardsSectionConfig(home, sectionId, patch) {
  home = ensureCardsSections(home || loadHome());
  home.cardsSections[sectionId] = Object.assign({}, getCardsSectionConfig(home, sectionId), patch);
  return home;
}

function getActiveCardsSectionId() {
  return activeCardsSectionId || 'top';
}

function setActiveCardsSectionId(sectionId) {
  activeCardsSectionId = sectionId === 'bottom' ? 'bottom' : 'top';
}

const FLOAT_MENU_SECTIONS = [
  { id: 'header', label: 'כותרת', el: 'homeHeader' },
  { id: 'intro', label: 'פתיח', el: 'homeIntro' },
  { id: 'intro2', label: 'פתיח 2', el: 'homeIntro2' },
  { id: 'cardsTop', label: 'סקשן עליון', el: 'cardsSectionTop' },
  { id: 'cardsBottom', label: 'סקשן תחתון', el: 'cardsSectionBottom' },
  { id: 'closing', label: 'סגירה', el: 'homeClosing' },
  { id: 'closing2', label: 'סגירה 2', el: 'homeClosing2' },
];

let floatMenuIdSeq = 0;
let floatMenuSpyBound = false;
let floatMenuActiveId = '';

function createFloatMenuId(prefix) {
  floatMenuIdSeq += 1;
  return (prefix || 'fm') + '-' + Date.now().toString(36) + '-' + floatMenuIdSeq;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function isRichTextValue(value) {
  return /<span[\s>]/i.test(String(value || ''));
}

function clampStoredInlineText(value, maxLen) {
  const raw = String(value || '');
  if (!raw || !maxLen) return raw;
  if (!isRichTextValue(raw)) return raw.slice(0, maxLen);
  const sanitized = sanitizeInlineHtml(raw);
  const plain = plainTextFromHtml(sanitized);
  if (plain.length <= maxLen) return sanitized;
  return plain.slice(0, maxLen);
}

function plainTextFromHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return String(div.textContent || '').replace(/\u00a0/g, ' ').replace(/\r\n/g, '\n');
}

function sanitizeInlineColor(value) {
  const color = String(value || '').trim();
  if (!color || !/^[#a-z0-9(),.%\s-]+$/i.test(color)) return '';
  return color;
}

function sanitizeInlineHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';

  function walkChildren(node) {
    let out = '';
    node.childNodes.forEach(function (child) { out += walkNode(child); });
    return out;
  }

  function walkNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = node.tagName.toLowerCase();
    if (tag === 'br') return '<br>';
    if (tag === 'span') {
      const style = node.getAttribute('style') || '';
      const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
      const color = colorMatch ? sanitizeInlineColor(colorMatch[1]) : '';
      if (!color) return walkChildren(node);
      return '<span style="color:' + color + '">' + walkChildren(node) + '</span>';
    }
    if (tag === 'font') {
      const color = sanitizeInlineColor(node.getAttribute('color') || '');
      if (color) return '<span style="color:' + color + '">' + walkChildren(node) + '</span>';
      return walkChildren(node);
    }
    return walkChildren(node);
  }

  return walkChildren(div);
}

function renderStoredInlineText(value, plainFallback) {
  const raw = String(value || '');
  if (!raw.trim()) return escapeHtml(plainFallback || '');
  if (isRichTextValue(raw)) return sanitizeInlineHtml(raw);
  return escapeHtml(raw);
}

let savedInlineTextSelection = null;

const WIZARD_PREVIEW_SIZE = {
  pageName: { min: 12, max: 56, fallback: DEFAULT_CARD_TITLE_SIZE },
  notes: { min: 10, max: 32, fallback: DEFAULT_CARD_NOTES_SIZE },
};

function getWizardPreviewSizeSpec(field) {
  return WIZARD_PREVIEW_SIZE[field] || WIZARD_PREVIEW_SIZE.pageName;
}

function isWizardPreviewTextEditing() {
  return !!(wizardPreviewTextEdit && wizardPreviewTextEdit.el);
}

function getInlineFormattingTargetEl() {
  if (isWizardPreviewTextEditing()) return wizardPreviewTextEdit.el;
  return activeInlineEdit ? activeInlineEdit.el : null;
}

function canUseInlineFormattingToolbar() {
  if (isWizardPreviewTextEditing()) return true;
  if (!editMode || !activeInlineEdit) return false;
  const spec = getInlineEditSpec(activeInlineEdit.el);
  return supportsInlineToolbarTools(spec);
}

function isInlineFormattingToolbarEl(node) {
  if (!node || !node.closest) return false;
  return !!node.closest('#siteToolbar, .hsla-popover');
}

function bindInlineFormattingToolbarGuard() {
  const shell = document.getElementById('siteToolbar');
  if (!shell || shell.dataset.formatGuardBound === '1') return;
  shell.dataset.formatGuardBound = '1';

  shell.addEventListener('mousedown', function (e) {
    if (!canUseInlineFormattingToolbar()) return;
    const control = e.target.closest('#inlineTextSizeControl, #inlineTextColorPicker');
    if (!control) return;
    e.preventDefault();
    saveInlineTextSelection();
  }, true);
}

function scheduleWizardPreviewTextEditCommit() {
  window.setTimeout(function () {
    if (!wizardPreviewTextEdit) return;
    const el = wizardPreviewTextEdit.el;
    if (!el || !el.isConnected) {
      wizardPreviewTextEdit = null;
      syncInlineTextSizeControl();
      return;
    }
    if (isInlineFormattingToolbarEl(document.activeElement)) return;
    if (document.activeElement === el) return;
    commitWizardPreviewTextEdit();
    updateLivePreview();
  }, 0);
}

function saveInlineTextSelection() {
  const el = getInlineFormattingTargetEl();
  if (!el) return;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.commonAncestorContainer)) return;
  savedInlineTextSelection = range.cloneRange();
}

function restoreInlineTextSelection() {
  if (!savedInlineTextSelection || !getInlineFormattingTargetEl()) return false;
  try {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedInlineTextSelection);
    return !sel.isCollapsed;
  } catch (_) {
    return false;
  }
}

function wrapRangeWithColor(range, color) {
  const span = document.createElement('span');
  span.style.color = color;
  try {
    range.surroundContents(span);
    return;
  } catch (_) {}
  const fragment = range.extractContents();
  span.appendChild(fragment);
  range.insertNode(span);
  range.setStartAfter(span);
  range.collapse(true);
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function hasActiveInlineTextSelection() {
  const el = getInlineFormattingTargetEl();
  if (!el) return false;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || sel.isCollapsed) return false;
  const range = sel.getRangeAt(0);
  return el.contains(range.commonAncestorContainer);
}

function applyWizardPreviewTextColor(hex) {
  if (!isWizardPreviewTextEditing()) return;
  const el = wizardPreviewTextEdit.el;
  const spec = wizardPreviewTextEdit.spec;
  const color = colorToCss(hex);

  if (spec.field === 'pageName') {
    wizardData.titleColor = color;
    const titleInput = document.getElementById('titleColor');
    if (titleInput) titleInput.value = color;
    setHslaFieldValue('titleColor', color);
    const titleHex = document.getElementById('titleColorHex');
    if (titleHex) titleHex.textContent = colorToDisplayHex(color);
  } else if (spec.field === 'notes') {
    wizardData.notesColor = color;
    const notesInput = document.getElementById('notesColor');
    if (notesInput) notesInput.value = color;
    setHslaFieldValue('notesColor', color);
    const notesHex = document.getElementById('notesColorHex');
    if (notesHex) notesHex.textContent = colorToDisplayHex(color);
  }

  patchWizardPreviewCardTheme();
  el.focus();
  selectElementContents(el);
}

function applyWizardPreviewTextSize(rawSize) {
  if (!isWizardPreviewTextEditing()) return;
  const spec = wizardPreviewTextEdit.spec;
  const cfg = getWizardPreviewSizeSpec(spec.field);
  const size = clampFontSize(rawSize, cfg.fallback, cfg.max);
  if (spec.field === 'pageName') wizardData.titleSize = size;
  else if (spec.field === 'notes') wizardData.notesSize = size;
  patchWizardPreviewCardTheme();
  const range = document.getElementById('inlineTextSize');
  const valueEl = document.getElementById('inlineTextSizeValue');
  if (range) {
    range.min = String(cfg.min);
    range.max = String(cfg.max);
    range.value = String(size);
  }
  if (valueEl) valueEl.textContent = String(size);
}

function applyInlineTextColor(hex) {
  if (isWizardPreviewTextEditing()) {
    applyWizardPreviewTextColor(hex);
    return;
  }
  if (!activeInlineEdit) return;
  const spec = getInlineEditSpec(activeInlineEdit.el);
  if (!supportsInlineToolbarTools(spec)) return;
  if (!hasActiveInlineTextSelection() && !restoreInlineTextSelection()) return;
  const el = activeInlineEdit.el;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.commonAncestorContainer) || range.collapsed) return;

  const color = colorToCss(hex);
  const workingRange = range.cloneRange();
  el.focus();
  sel.removeAllRanges();
  sel.addRange(workingRange);
  try {
    document.execCommand('styleWithCSS', false, true);
    if (!document.execCommand('foreColor', false, color)) {
      wrapRangeWithColor(workingRange.cloneRange(), color);
    }
  } catch (_) {
    wrapRangeWithColor(workingRange.cloneRange(), color);
  }
  activeInlineEdit.lastGoodHtml = el.innerHTML;
  saveInlineTextSelection();
}

function supportsInlineToolbarTools(spec) {
  return !!(spec && spec.richText && String(spec.key || '').indexOf('card.') !== 0);
}

function stripPlainInlineFormatting(el) {
  if (!el) return;
  el.style.removeProperty('font-size');
  el.style.removeProperty('color');
  el.style.removeProperty('font-weight');
  el.style.removeProperty('line-height');
  el.querySelectorAll('span, font, b, i, u').forEach(function (node) {
    if (node.parentNode) node.replaceWith(document.createTextNode(node.textContent || ''));
  });
}

function preservePlainInlineEditValue(el, spec) {
  if (!el || !spec || supportsInlineToolbarTools(spec)) return;
  const plain = readInlineEditValue(el);
  const maxLen = spec.maxLen || plain.length;
  const next = plain.slice(0, maxLen);
  if (el.textContent !== next) el.textContent = next;
  stripPlainInlineFormatting(el);
}

const INLINE_EDIT_SIZE_FIELDS = {
  subtitle: { homeKey: 'subtitleSize', fallback: 20, max: 56 },
  introText: { homeKey: 'introTextSize', fallback: 16, max: 56 },
  intro2Subtitle: { homeKey: 'intro2SubtitleSize', fallback: 20, max: 56 },
  intro2Text: { homeKey: 'intro2TextSize', fallback: 16, max: 56 },
  closingText: { homeKey: 'closingTextSize', fallback: 17, max: 56 },
  closing2Text: { homeKey: 'closing2TextSize', fallback: 17, max: 56 },
  'header.kicker': { headerField: 'kickerSize', fallback: 15, max: 32 },
  'header.title': { headerField: 'titleSize', fallback: 44, max: 72 },
  'header.body': { headerField: 'bodySize', fallback: 17, max: 32 },
};

function getInlineEditFontSize(home, key) {
  const cfg = INLINE_EDIT_SIZE_FIELDS[key];
  if (!cfg) return null;
  if (cfg.headerField) {
    const header = normalizeHeader(home.header, home.title);
    return clampFontSize(header[cfg.headerField], cfg.fallback, cfg.max);
  }
  return clampFontSize(home[cfg.homeKey], cfg.fallback, cfg.max);
}

function setInlineEditFontSize(home, key, size) {
  const cfg = INLINE_EDIT_SIZE_FIELDS[key];
  if (!cfg) return null;
  const clamped = clampFontSize(size, cfg.fallback, cfg.max);
  if (cfg.headerField) {
    const next = Object.assign({}, normalizeHeader(home.header, home.title));
    next[cfg.headerField] = clamped;
    home.header = normalizeHeader(next, next.title);
    if (homeEditHeaderDraft) homeEditHeaderDraft[cfg.headerField] = clamped;
  } else {
    home[cfg.homeKey] = clamped;
  }
  return clamped;
}

function syncInlineTextSizeControl() {
  const control = document.getElementById('inlineTextSizeControl');
  const range = document.getElementById('inlineTextSize');
  const valueEl = document.getElementById('inlineTextSizeValue');
  if (!control || !range || !valueEl) return;

  const enabled = canUseInlineFormattingToolbar();

  if (!enabled) {
    control.classList.add('is-disabled');
    range.disabled = true;
    syncInlineTextColorControl();
    return;
  }

  if (isWizardPreviewTextEditing()) {
    control.classList.remove('is-disabled');
    range.disabled = false;
    const spec = wizardPreviewTextEdit.spec;
    const cfg = getWizardPreviewSizeSpec(spec.field);
    const stored = spec.field === 'pageName'
      ? wizardData.titleSize
      : wizardData.notesSize;
    const size = clampFontSize(stored, cfg.fallback, cfg.max);
    range.min = String(cfg.min);
    range.max = String(cfg.max);
    range.value = String(size);
    valueEl.textContent = String(size);
    syncInlineTextColorControl();
    return;
  }

  const cfg = INLINE_EDIT_SIZE_FIELDS[activeInlineEdit.key];
  if (!cfg) {
    control.classList.add('is-disabled');
    range.disabled = true;
    syncInlineTextColorControl();
    return;
  }

  control.classList.remove('is-disabled');
  range.disabled = false;
  range.max = String(cfg.max);
  const size = getInlineEditFontSize(loadHome(), activeInlineEdit.key);
  range.value = String(size);
  valueEl.textContent = String(size);
  syncInlineTextColorControl();
}

function syncInlineTextColorControl() {
  const field = document.getElementById('inlineTextColorPicker');
  if (!field) return;
  const enabled = canUseInlineFormattingToolbar();
  field.classList.toggle('is-disabled', !enabled);
  const swatch = field.querySelector('.hsla-swatch');
  if (swatch) swatch.setAttribute('aria-disabled', enabled ? 'false' : 'true');
  if (enabled && isWizardPreviewTextEditing()) {
    const spec = wizardPreviewTextEdit.spec;
    const color = spec.field === 'pageName'
      ? (wizardData.titleColor || DEFAULT_CARD_TITLE_COLOR)
      : (wizardData.notesColor || DEFAULT_CARD_NOTES_COLOR);
    const input = document.getElementById('inlineTextColor');
    if (input) {
      input.value = colorToDisplayHex(color);
      updateHslaSwatch(field);
    }
  }
}

function applyInlineTextSize(rawSize) {
  if (isWizardPreviewTextEditing()) {
    applyWizardPreviewTextSize(rawSize);
    return;
  }
  if (!activeInlineEdit) return;
  const spec = getInlineEditSpec(activeInlineEdit.el);
  if (!supportsInlineToolbarTools(spec)) return;
  const key = activeInlineEdit.key;
  const cfg = INLINE_EDIT_SIZE_FIELDS[key];
  if (!cfg) return;

  const home = loadHome();
  const size = setInlineEditFontSize(home, key, rawSize);
  if (size == null) return;
  saveHome(home);
  activeInlineEdit.el.style.fontSize = size + 'px';

  const range = document.getElementById('inlineTextSize');
  const valueEl = document.getElementById('inlineTextSizeValue');
  if (range) range.value = String(size);
  if (valueEl) valueEl.textContent = String(size);
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
    svWrap: document.getElementById('colorSvWrap'),
    svBase: document.getElementById('colorSvBase'),
    svCursor: document.getElementById('colorSvCursor'),
    hueWrap: document.getElementById('colorHueWrap'),
    hueCursor: document.getElementById('colorHueCursor'),
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

function hsvPureHueCss(h) {
  const rgb = hsvToRgb(h, 100, 100);
  return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
}

function updateVisualPickerFromState() {
  const els = getHslaPopoverEls();
  if (!els.svWrap) return;
  const hsv = rgbToHsv(colorPickerState.r, colorPickerState.g, colorPickerState.b);

  if (els.svBase) {
    els.svBase.style.backgroundColor = hsvPureHueCss(hsv.h);
  }
  if (els.svCursor) {
    els.svCursor.style.left = hsv.s + '%';
    els.svCursor.style.top = (100 - hsv.v) + '%';
  }
  if (els.hueCursor) {
    els.hueCursor.style.top = (hsv.h / 360 * 100) + '%';
  }
  if (els.svWrap) {
    els.svWrap.setAttribute('aria-valuenow', String(hsv.s));
    els.svWrap.setAttribute('aria-valuetext', 'S ' + hsv.s + '%, V ' + hsv.v + '%');
  }
  if (els.hueWrap) {
    els.hueWrap.setAttribute('aria-valuenow', String(hsv.h));
  }
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

  if (els.rRange) {
    els.rRange.style.background =
      'linear-gradient(to right, rgb(0,' + state.g + ',' + state.b + '), rgb(255,' + state.g + ',' + state.b + '))';
  }
  if (els.gRange) {
    els.gRange.style.background =
      'linear-gradient(to right, rgb(' + state.r + ',0,' + state.b + '), rgb(' + state.r + ',255,' + state.b + '))';
  }
  if (els.bRange) {
    els.bRange.style.background =
      'linear-gradient(to right, rgb(' + state.r + ',' + state.g + ',0), rgb(' + state.r + ',' + state.g + ',255))';
  }

  if (els.hRange) els.hRange.value = String(hsv.h);
  if (els.sRange) els.sRange.value = String(hsv.s);
  if (els.vRange) els.vRange.value = String(hsv.v);
  if (els.aRangeHsva) els.aRangeHsva.value = String(alphaPct);
  if (els.hNum) els.hNum.value = String(hsv.h);
  if (els.sNum) els.sNum.value = String(hsv.s);
  if (els.vNum) els.vNum.value = String(hsv.v);
  if (els.aNumHsva) els.aNumHsva.value = String(alphaPct);

  // H בלבד — קשת צבעים
  if (els.hRange) {
    els.hRange.style.background =
      'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)';
  }

  updateVisualPickerFromState();
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

function updateColorFromVisualSv(clientX, clientY, commit) {
  const els = getHslaPopoverEls();
  if (!els.svWrap) return;
  const rect = els.svWrap.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const s = clampNumber(((clientX - rect.left) / rect.width) * 100, 0, 100);
  const v = clampNumber((1 - (clientY - rect.top) / rect.height) * 100, 0, 100);
  const hsv = rgbToHsv(colorPickerState.r, colorPickerState.g, colorPickerState.b);
  const rgb = hsvToRgb(hsv.h, s, v);
  colorPickerState = { r: rgb.r, g: rgb.g, b: rgb.b, a: colorPickerState.a };
  applyColorPickerState(!!commit);
}

function updateColorFromVisualHue(clientY, commit) {
  const els = getHslaPopoverEls();
  if (!els.hueWrap) return;
  const rect = els.hueWrap.getBoundingClientRect();
  if (!rect.height) return;
  const h = clampNumber(((clientY - rect.top) / rect.height) * 360, 0, 360);
  const hsv = rgbToHsv(colorPickerState.r, colorPickerState.g, colorPickerState.b);
  const rgb = hsvToRgb(h, hsv.s, hsv.v);
  colorPickerState = { r: rgb.r, g: rgb.g, b: rgb.b, a: colorPickerState.a };
  applyColorPickerState(!!commit);
}

function bindVisualColorDrag(targetEl, onMove, onEnd) {
  if (!targetEl) return;
  let dragging = false;

  function handleMove(e) {
    if (!dragging) return;
    e.preventDefault();
    onMove(e.clientX, e.clientY, false);
  }

  function stopDrag(e) {
    if (!dragging) return;
    dragging = false;
    document.removeEventListener('pointermove', handleMove);
    document.removeEventListener('pointerup', stopDrag);
    document.removeEventListener('pointercancel', stopDrag);
    if (e) onMove(e.clientX, e.clientY, true);
    else onEnd(true);
  }

  targetEl.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    targetEl.setPointerCapture(e.pointerId);
    onMove(e.clientX, e.clientY, false);
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', stopDrag);
    document.addEventListener('pointercancel', stopDrag);
  });
}

function bindVisualColorPicker() {
  const els = getHslaPopoverEls();
  bindVisualColorDrag(els.svWrap, function (x, y, commit) {
    updateColorFromVisualSv(x, y, commit);
  }, function (commit) {
    applyColorPickerState(commit);
  });
  bindVisualColorDrag(els.hueWrap, function (_x, y, commit) {
    updateColorFromVisualHue(y, commit);
  }, function (commit) {
    applyColorPickerState(commit);
  });
}

function positionHslaPopover(anchor) {
  const els = getHslaPopoverEls();
  if (!els.popover || !anchor) return;
  const pad = 8;
  const width = els.popover.offsetWidth || 280;
  const height = els.popover.offsetHeight || 480;
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

  if (field.id === 'inlineTextColorPicker') {
    if (!canUseInlineFormattingToolbar()) return;
    if (isWizardPreviewTextEditing()) {
      const spec = wizardPreviewTextEdit.spec;
      const current = spec.field === 'pageName'
        ? (wizardData.titleColor || DEFAULT_CARD_TITLE_COLOR)
        : (wizardData.notesColor || DEFAULT_CARD_NOTES_COLOR);
      input.value = colorToDisplayHex(current);
      updateHslaSwatch(field);
    }
    saveInlineTextSelection();
    applyInlineTextColor(input.value);
  }

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

  bindVisualColorPicker();

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
  if (field.id === 'inlineTextColorPicker') {
    field.addEventListener('mousedown', function (e) {
      if (!canUseInlineFormattingToolbar()) return;
      e.preventDefault();
      saveInlineTextSelection();
    });
  }
  swatch.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (field.id === 'inlineTextColorPicker' && !canUseInlineFormattingToolbar()) return;
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
  if (text.length <= 15) return escapeHtml(text);
  return escapeHtml(text.slice(0, 15)) + '<br>' + escapeHtml(text.slice(15));
}

function getColorBlend(primary, secondary) {
  const p = colorToCss(primary || '#e87722');
  const s = colorToCss(secondary || '#4a7c3f');
  return 'linear-gradient(135deg, ' + p + ' 0%, ' + s + ' 100%)';
}

function getCardBgMode(card) {
  if (!card) return DEFAULT_CARD_BG_MODE;
  if (
    card.bgMode === 'colors' ||
    card.bgMode === 'image' ||
    card.bgMode === 'none' ||
    card.bgMode === 'squareImage'
  ) {
    return card.bgMode;
  }
  /* תאימות לכרטיסים ישנים עם useImageBg */
  if (card.useImageBg === true) return 'image';
  if (card.useImageBg === false) return 'colors';
  return DEFAULT_CARD_BG_MODE;
}

function normalizeCardBgMode(value) {
  if (value === 'image' || value === 'none' || value === 'colors' || value === 'squareImage') {
    return value;
  }
  return DEFAULT_CARD_BG_MODE;
}

function isFlatCardMode(mode) {
  return mode === 'none' || mode === 'squareImage';
}

function getSelectedCardBgMode() {
  const checked = document.querySelector('input[name="cardBgMode"]:checked');
  return normalizeCardBgMode(checked ? checked.value : DEFAULT_CARD_BG_MODE);
}

function setCardBgModeInputs(mode) {
  const value = normalizeCardBgMode(mode);
  const radio = document.querySelector('input[name="cardBgMode"][value="' + value + '"]');
  if (radio) radio.checked = true;
  syncCardBgModeUi();
}

function normalizeFlatEdge(value) {
  if (value === 'glow' || value === 'none' || value === 'outline') return value;
  return 'outline';
}

function getCardFlatEdge(card) {
  if (!card) return 'outline';
  return normalizeFlatEdge(card.flatEdge);
}

function getSelectedFlatEdge() {
  const checked = document.querySelector('input[name="flatEdge"]:checked');
  return normalizeFlatEdge(checked ? checked.value : 'outline');
}

function setFlatEdgeInputs(edge) {
  const value = normalizeFlatEdge(edge);
  const radio = document.querySelector('input[name="flatEdge"][value="' + value + '"]');
  if (radio) radio.checked = true;
  syncCardBgModeUi();
}

function clampFlatImageZoom(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 100;
  return Math.max(50, Math.min(200, Math.round(n)));
}

function clampFlatImagePos(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function getFlatImageZoom(card) {
  return clampFlatImageZoom(card && card.flatImageZoom);
}

function getFlatImagePosX(card) {
  return clampFlatImagePos(card && card.flatImagePosX);
}

function getFlatImagePosY(card) {
  return clampFlatImagePos(card && card.flatImagePosY);
}

function syncCardBgModeUi() {
  const mode = getSelectedCardBgMode();
  const edge = getSelectedFlatEdge();
  const isFlat = isFlatCardMode(mode);
  const hasEdgeFx = isFlat && (edge === 'outline' || edge === 'glow');
  const needsMainImage = mode === 'image' || mode === 'squareImage';

  const wrap = document.getElementById('mainImageFieldWrap');
  if (wrap) wrap.hidden = !needsMainImage;

  const flatImagePosWrap = document.getElementById('flatImagePosWrap');
  if (flatImagePosWrap) {
    flatImagePosWrap.hidden = mode !== 'squareImage' || !wizardData.mainImage;
  }

  const mediaExtrasWrap = document.getElementById('cardMediaExtrasWrap');
  if (mediaExtrasWrap) mediaExtrasWrap.hidden = isFlat;

  const mainImageLabel = document.getElementById('mainImageFieldLabel');
  const mainImageHint = document.getElementById('mainImageFieldHint');
  if (mode === 'squareImage') {
    if (mainImageLabel) mainImageLabel.innerHTML = 'תמונת ארט <span class="req">*</span>';
    if (mainImageHint) {
      mainImageHint.hidden = false;
      mainImageHint.textContent = 'מומלץ PNG עם שקיפות — החלקים השקופים ייעלמו מהכרטיס';
    }
  } else if (mode === 'image') {
    if (mainImageLabel) mainImageLabel.innerHTML = 'תמונה לחלק העליון <span class="req">*</span>';
    if (mainImageHint) {
      mainImageHint.hidden = false;
      mainImageHint.textContent = 'התמונה תופיע בראש הכרטיס הקלאסי';
    }
  }

  const flatBgWrap = document.getElementById('flatBgColorFieldWrap');
  if (flatBgWrap) flatBgWrap.hidden = mode !== 'none';

  const flatEdgeWrap = document.getElementById('flatEdgeFieldWrap');
  if (flatEdgeWrap) flatEdgeWrap.hidden = !isFlat;

  const outlineWrap = document.getElementById('outlineColorFieldWrap');
  if (outlineWrap) outlineWrap.hidden = !hasEdgeFx;

  const outlineWidthWrap = document.getElementById('outlineWidthFieldWrap');
  if (outlineWidthWrap) outlineWidthWrap.hidden = !hasEdgeFx;

  const titleColorWrap = document.getElementById('titleColorFieldWrap');
  if (titleColorWrap) titleColorWrap.hidden = !isFlat;
  const notesColorWrap = document.getElementById('notesColorFieldWrap');
  if (notesColorWrap) notesColorWrap.hidden = !isFlat;

  const primaryWrap = document.getElementById('primaryColorFieldWrap');
  if (primaryWrap) primaryWrap.hidden = mode !== 'colors';
  const secondaryWrap = document.getElementById('secondaryColorFieldWrap');
  if (secondaryWrap) secondaryWrap.hidden = mode !== 'colors';

  const colorLabel = document.getElementById('outlineColorLabel');
  const colorHint = document.getElementById('outlineColorHint');
  const widthLabel = document.getElementById('outlineWidthLabel');
  const widthHint = document.getElementById('outlineWidthHint');
  const widthEl = document.getElementById('outlineWidth');
  const widthNum = widthEl ? widthEl.value : '4';

  if (edge === 'glow') {
    if (colorLabel) colorLabel.textContent = 'צבע זוהר';
    if (colorHint) colorHint.textContent = 'צבע ההילה סביב הכרטיס';
    if (widthLabel) widthLabel.innerHTML = 'עוצמת זוהר <span class="field-value" id="outlineWidthValue">' + widthNum + 'px</span>';
    if (widthHint) widthHint.textContent = 'כמה חזק וגדול יהיה הזוהר';
  } else {
    if (colorLabel) colorLabel.textContent = 'צבע מסגרת';
    if (colorHint) colorHint.textContent = 'צבע הקו סביב הכרטיס';
    if (widthLabel) widthLabel.innerHTML = 'עובי מסגרת <span class="field-value" id="outlineWidthValue">' + widthNum + 'px</span>';
    if (widthHint) widthHint.textContent = 'כמה עבה תהיה המסגרת';
  }
}

function getCardOutlineColor(card) {
  if (!card) return '#e31c23';
  return card.outlineColor || '#e31c23';
}

function getCardTitleColor(card) {
  if (!card) return DEFAULT_CARD_TITLE_COLOR;
  return card.titleColor || DEFAULT_CARD_TITLE_COLOR;
}

function getCardNotesColor(card) {
  if (!card) return DEFAULT_CARD_NOTES_COLOR;
  return card.notesColor || DEFAULT_CARD_NOTES_COLOR;
}

function getCardTitleSize(card) {
  const n = Number(card && card.titleSize);
  if (!Number.isFinite(n)) return DEFAULT_CARD_TITLE_SIZE;
  return clampFontSize(n, 12, 56);
}

function getCardNotesSize(card) {
  const n = Number(card && card.notesSize);
  if (!Number.isFinite(n)) return DEFAULT_CARD_NOTES_SIZE;
  return clampFontSize(n, 10, 32);
}

function getCardFlatBgColor(card) {
  if (!card) return '#ffffff';
  return card.flatBgColor || '#ffffff';
}

function getCardOutlineWidth(card) {
  const n = Number(card && card.outlineWidth);
  if (!Number.isFinite(n)) return 2;
  return Math.max(1, Math.min(20, Math.round(n)));
}

function shouldShowImageBg(card) {
  return getCardBgMode(card) === 'image' && !!card.mainImage;
}

function getCardImageStyle(card) {
  const mode = getCardBgMode(card);
  if (mode === 'none' || mode === 'squareImage') {
    return 'background: transparent; background-image: none; background-color: transparent;';
  }
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
  const outline = colorToCss(getCardOutlineColor(card));
  const flatBg = colorToCss(getCardFlatBgColor(card));
  const outlineWidth = getCardOutlineWidth(card);
  const actionColor = colorToCss(getCardActionColor(card));
  const zoom = getFlatImageZoom(card);
  const posX = getFlatImagePosX(card);
  const posY = getFlatImagePosY(card);
  // מרכאות בודדות — כדי לא לשבור את מאפיין style ב-HTML
  const font = (card.fontFamily || "'Segoe UI', Tahoma, Arial, sans-serif").replace(/"/g, "'");
  return (
    'font-family: ' + font + ';' +
    '--card-outline:' + outline + ';' +
    '--card-title-color:' + colorToCss(getCardTitleColor(card)) + ';' +
    '--card-notes-color:' + colorToCss(getCardNotesColor(card)) + ';' +
    '--card-title-size:' + getCardTitleSize(card) + 'px;' +
    '--card-notes-size:' + getCardNotesSize(card) + 'px;' +
    '--card-flat-bg:' + flatBg + ';' +
    '--card-outline-width:' + outlineWidth + 'px;' +
    '--card-action:' + actionColor + ';' +
    '--card-icon-size:' + getCardIconSize(card) + 'px;' +
    '--card-flat-img-zoom:' + (zoom / 100) + ';' +
    '--card-flat-img-x:' + posX + '%;' +
    '--card-flat-img-y:' + posY + '%;'
  );
}

function getCardActionColor(card) {
  if (!card) return '#e87722';
  return card.actionColor || '#e87722';
}

function getCardIconSize(card) {
  const n = Number(card && card.iconSize);
  if (!Number.isFinite(n)) return 22;
  return Math.max(14, Math.min(48, Math.round(n)));
}

function isCardIconsFree(card) {
  return getCardActionStyle(card) === 'icons' && !!(card && card.iconsFree);
}

function clampIconPos(x, y) {
  return {
    x: Math.max(6, Math.min(94, Math.round(Number(x) * 10) / 10)),
    y: Math.max(6, Math.min(94, Math.round(Number(y) * 10) / 10)),
  };
}

function getDefaultIconPosition(index, total) {
  const spacing = Math.min(18, 50 / Math.max(total, 1));
  const start = 50 + ((total - 1) * spacing) / 2;
  return clampIconPos(start - index * spacing, 88);
}

function getIconPosition(card, action, index, total) {
  const saved = card && card.iconPositions && card.iconPositions[action];
  if (saved && saved.x != null && saved.y != null) {
    return clampIconPos(saved.x, saved.y);
  }
  return getDefaultIconPosition(index, total);
}

function normalizeIconPositions(positions) {
  const out = {};
  if (!positions || typeof positions !== 'object') return out;
  Object.keys(positions).forEach(function (key) {
    const pos = positions[key];
    if (!pos) return;
    out[key] = clampIconPos(pos.x, pos.y);
  });
  return out;
}

function isCardLogoFree(card) {
  return !!(card && card.logo && card.logoFree);
}

function getLogoPosition(card) {
  const saved = card && card.logoPosition;
  if (saved && saved.x != null && saved.y != null) {
    return clampIconPos(saved.x, saved.y);
  }
  return clampIconPos(14, 16);
}

function normalizeLogoPosition(pos) {
  if (!pos || pos.x == null || pos.y == null) return null;
  return clampIconPos(pos.x, pos.y);
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
  const actions = getCardActions(card);
  const isIcons = getCardActionStyle(card) === 'icons';
  const isFree = isCardIconsFree(card);

  if (isFree) return '';

  if (!actions.length) {
    if (isIcons) {
      return '<span class="card-action-icon" style="opacity:0.45;" aria-hidden="true">' + getActionIconSvg('צפייה') + '</span>';
    }
    return '<span class="btn-primary btn-view" style="opacity:0.5;">אין קישור</span>';
  }

  if (isIcons) {
    return (
      '<div class="card-actions card-actions--icons">' +
        actions.map(function (item) {
          return (
            '<button type="button" class="card-action-icon" ' +
              'data-link="' + escapeHtml(item.link) + '" ' +
              'data-action="' + escapeHtml(item.action) + '" ' +
              'title="' + escapeHtml(item.action) + '" ' +
              'aria-label="' + escapeHtml(item.action) + '">' +
              getActionIconSvg(item.action) +
            '</button>'
          );
        }).join('') +
      '</div>'
    );
  }

  return (
    '<div class="card-actions">' +
      actions.map(function (item) {
        return (
          '<button type="button" class="btn-primary btn-view" ' +
            'data-link="' + escapeHtml(item.link) + '" ' +
            'data-action="' + escapeHtml(item.action) + '">' +
            escapeHtml(item.action) +
          '</button>'
        );
      }).join('') +
    '</div>'
  );
}

function buildFreeIconsLayerHtml(card) {
  if (!isCardIconsFree(card)) return '';
  const actions = getCardActions(card);
  if (!actions.length) return '';

  return (
    '<div class="card-icons-layer" aria-label="אייקוני פעולה">' +
      actions.map(function (item, index) {
        const pos = getIconPosition(card, item.action, index, actions.length);
        return (
          '<button type="button" class="card-action-icon is-free" ' +
            'data-link="' + escapeHtml(item.link) + '" ' +
            'data-action="' + escapeHtml(item.action) + '" ' +
            'title="' + escapeHtml(item.action) + '" ' +
            'aria-label="' + escapeHtml(item.action) + '" ' +
            'style="left:' + pos.x + '%;top:' + pos.y + '%;">' +
            getActionIconSvg(item.action) +
          '</button>'
        );
      }).join('') +
    '</div>'
  );
}

function normalizeActionStyle(value) {
  return value === 'icons' ? 'icons' : 'text';
}

function getCardActionStyle(card) {
  return normalizeActionStyle(card && card.actionStyle);
}

function getSelectedActionStyle() {
  const checked = document.querySelector('input[name="actionStyle"]:checked');
  return normalizeActionStyle(checked ? checked.value : 'text');
}

function setActionStyleInputs(style) {
  const value = normalizeActionStyle(style);
  const radio = document.querySelector('input[name="actionStyle"][value="' + value + '"]');
  if (radio) radio.checked = true;
  syncActionStyleUi();
}

function syncActionStyleUi() {
  const isIcons = getSelectedActionStyle() === 'icons';
  const wrap = document.getElementById('iconOptionsWrap');
  if (wrap) wrap.hidden = !isIcons;
}

function withWizardFormScrollPreserved(fn) {
  const panel = document.querySelector('#wizardForm .wizard-panel:not([hidden])');
  const form = document.getElementById('wizardForm');
  const scroller = panel || form;
  const scrollTop = scroller ? scroller.scrollTop : 0;
  fn();
  if (!scroller) return;
  scroller.scrollTop = scrollTop;
  requestAnimationFrame(function () {
    scroller.scrollTop = scrollTop;
  });
}

function getActionIconSvg(action) {
  if (action === 'צפייה') {
    return (
      '<svg class="card-action-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M8 5.14v13.72L19.5 12 8 5.14z"/>' +
      '</svg>'
    );
  }
  if (action === 'הורדה') {
    return (
      '<svg class="card-action-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 4v10m0 0l-4-4m4 4l4-4M6 18h12"/>' +
      '</svg>'
    );
  }
  if (action === 'הדפסה') {
    return (
      '<svg class="card-action-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2m-10 0h10v4H7v-4z"/>' +
      '</svg>'
    );
  }
  return '';
}

function getCardShellClass(card) {
  let cls = '';
  const mode = getCardBgMode(card);
  if (isFlatCardMode(mode)) {
    const edge = getCardFlatEdge(card);
    if (edge === 'glow') cls += ' card--flat card--edge-glow';
    else if (edge === 'none') cls += ' card--flat card--edge-none';
    else cls += ' card--flat card--edge-outline';
    if (mode === 'squareImage') cls += ' card--square-image';
  }
  if (isCardIconsFree(card)) cls += ' card--icons-free';
  if (isCardLogoFree(card)) cls += ' card--logo-free';
  return cls;
}

function buildFlatImageHtml(card) {
  if (getCardBgMode(card) !== 'squareImage' || !card.mainImage) return '';
  return (
    '<div class="card-flat-photo-wrap" aria-hidden="true">' +
      '<img class="card-flat-photo" src="' + card.mainImage + '" alt="">' +
    '</div>'
  );
}

function buildFreeLogoHtml(card) {
  if (!isCardLogoFree(card)) return '';
  const pos = getLogoPosition(card);
  return (
    '<div class="card-logo-free is-free" style="left:' + pos.x + '%;top:' + pos.y + '%;">' +
      '<img class="card-logo card-logo--free" src="' + card.logo + '" alt="">' +
    '</div>'
  );
}

function buildCardInner(card, options) {
  options = options || {};
  const showTags = options.showTags === true;
  const showActions = options.showActions === true;
  const logoFree = isCardLogoFree(card);
  const logoHtml = (!logoFree && card.logo)
    ? '<img class="card-logo" src="' + card.logo + '" alt="">'
    : '';
  const titleRaw = (card.title || '').slice(0, 10);
  const unitRaw = (card.unitName || '').slice(0, 10);
  const unitLine = unitRaw
    ? '<p class="card-unit">' + escapeHtml(unitRaw) + '</p>'
    : '';
  const desc = card.notes || card.description || '';
  const tagsHtml = showTags
    ? (
      '<div class="card-image-tags">' +
        '<span class="card-overlay-tag">' + escapeHtml(card.projectType || 'מצגת') + '</span>' +
        '<span class="card-overlay-tag">' + escapeHtml(card.classification || 'שמור') + '</span>' +
      '</div>'
    )
    : '';
  const actionsHtml = showActions ? buildActionButtonsHtml(card) : '';
  const freeIconsHtml = showActions ? buildFreeIconsLayerHtml(card) : '';
  const freeLogoHtml = buildFreeLogoHtml(card);
  const flatImageHtml = buildFlatImageHtml(card);
  const footerHtml = actionsHtml
    ? '<div class="card-footer">' + actionsHtml + '</div>'
    : '';

  if (isFlatCardMode(getCardBgMode(card))) {
    return (
      flatImageHtml +
      '<div class="card-flat-body">' +
        tagsHtml +
        (logoHtml ? '<div class="card-flat-logo">' + logoHtml + '</div>' : '') +
        buildCardEditableTitle(card, titleRaw) +
        unitLine +
        buildCardEditableNotes(card, desc) +
      '</div>' +
      footerHtml +
      freeLogoHtml +
      freeIconsHtml
    );
  }

  return (
    '<div class="card-image' +
      (shouldShowImageBg(card) ? ' card-image--photo' : '') +
      '" style="' + getCardImageStyle(card) + '">' +
      getCardBgPhotoHtml(card) +
      logoHtml +
      tagsHtml +
      buildCardEditableTitle(card, titleRaw) +
    '</div>' +
    '<div class="card-body">' +
      unitLine +
      buildCardEditableNotes(card, desc) +
    '</div>' +
    footerHtml +
    freeLogoHtml +
    freeIconsHtml
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
      subtitle: String(cat.subtitle || '').slice(0, 80),
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

function getCategorySubtitleStyle(cat) {
  const size = Math.max(10, Math.round(clampFontSize(cat && cat.fontSize, 22) * 0.72));
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

function getCardsLayoutMode(home, sectionId) {
  home = ensureCardsSections(home || loadHome());
  sectionId = sectionId || getActiveCardsSectionId();
  const cfg = getCardsSectionConfig(home, sectionId);
  if (cfg.layoutMode === 'matrix' || cfg.layoutMode === 'categories' || cfg.layoutMode === 'freeform') {
    return cfg.layoutMode;
  }
  if (home.categoriesEnabled && sectionId === 'top') return 'categories';
  return 'categories';
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
  home = ensureCardsSections(home || loadHome());
  const sectionId = getActiveCardsSectionId();
  const cfg = getCardsSectionConfig(home, sectionId);
  const mode = getCardsLayoutMode(home, sectionId);
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

  const height = clampCardsFreeHeight(cfg.cardsFreeHeight);
  const size = clampCardFreeWidth(cfg.cardsFreeSize);
  if (freeHeightInput) freeHeightInput.value = String(height);
  if (freeSizeInput) freeSizeInput.value = String(size);
  if (freeHeightValue) freeHeightValue.textContent = height + 'px';
  if (freeSizeValue) freeSizeValue.textContent = size + '%';
}

function removeCardFromCategories(cardId, sectionId) {
  const home = loadHome();
  sectionId = sectionId || getCardSectionById(cardId) || 'top';
  const cfg = getCardsSectionConfig(home, sectionId);
  if (!Array.isArray(cfg.categories) || !cfg.categories.length) return;
  let changed = false;
  const categories = cfg.categories.map(function (cat) {
    const nextIds = (cat.cardIds || []).filter(function (id) { return id !== cardId; });
    if (nextIds.length !== (cat.cardIds || []).length) changed = true;
    return Object.assign({}, cat, { cardIds: nextIds });
  });
  if (changed) {
    saveHome(setCardsSectionConfig(home, sectionId, { categories: categories }));
  }
}

function getCardSectionById(cardId) {
  const card = loadCards().find(function (c) { return c.id === cardId; });
  return card ? normalizeCardSection(card) : null;
}

function placeCardIdAfterSource(home, sourceId, newId, sectionId) {
  sectionId = sectionId || getCardSectionById(sourceId) || 'top';
  const cfg = getCardsSectionConfig(home, sectionId);
  if (!Array.isArray(cfg.categories)) return null;
  for (let i = 0; i < cfg.categories.length; i++) {
    const ids = cfg.categories[i].cardIds || [];
    const idx = ids.indexOf(sourceId);
    if (idx === -1) continue;
    ids.splice(idx + 1, 0, newId);
    cfg.categories[i].cardIds = ids;
    return setCardsSectionConfig(home, sectionId, { categories: cfg.categories });
  }
  return null;
}

function buildCardElementHtml(card, index, options) {
  options = options || {};
  const popClass = pendingCardPopId === card.id ? ' card-pop-in' : '';
  const flatClass = getCardShellClass(card);
  if (editMode) {
    return (
      '<div class="card card--editing' + popClass + flatClass + '" draggable="' + (options.draggable === false ? 'false' : 'true') + '" data-id="' + card.id + '" style="animation-delay: ' + (index % 3) * 0.08 + 's; ' + getCardThemeStyle(card) + '">' +
        '<button type="button" class="card-edit" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
        '<button type="button" class="card-duplicate" data-id="' + card.id + '" aria-label="שיכפול כרטיס" title="שיכפול">⧉</button>' +
        '<button type="button" class="card-delete" data-id="' + card.id + '" aria-label="מחיקת כרטיס">×</button>' +
        buildCardInner(card) +
      '</div>'
    );
  }
  return (
    '<div class="card card--clickable' + popClass + flatClass + '" data-id="' + card.id + '" role="button" tabindex="0" style="' + getCardThemeStyle(card) + '">' +
      '<button type="button" class="card-edit card-edit--quiet" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
      buildCardInner(card) +
    '</div>'
  );
}

function getCardPositionMap(home, sectionId) {
  const cfg = getCardsSectionConfig(home, sectionId || getActiveCardsSectionId());
  return cfg.cardPositions && typeof cfg.cardPositions === 'object' ? cfg.cardPositions : {};
}

function ensureCardPositions(home, cards, sectionId) {
  sectionId = sectionId || getActiveCardsSectionId();
  home = ensureCardsSections(home);
  const cfg = getCardsSectionConfig(home, sectionId);
  const positions = Object.assign({}, getCardPositionMap(home, sectionId));
  const defaultW = clampCardFreeWidth(cfg.cardsFreeSize);
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
  home = setCardsSectionConfig(home, sectionId, { cardPositions: positions });
  saveHome(home);
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
  const flatClass = getCardShellClass(card);
  const style =
    '--cx:' + pos.x + '%;--cy:' + pos.y + '%;--cw:' + pos.w + '%;' +
    'animation-delay:' + (index % 3) * 0.08 + 's;';
  const resizeHandle = editMode
    ? '<span class="card-free-resize" data-id="' + card.id + '" title="שנה גודל כרטיס" aria-label="שנה גודל כרטיס"></span>'
    : '';
  const cardHtml = editMode
    ? (
      '<div class="card card--editing' + popClass + flatClass + '" data-id="' + card.id + '" style="' + getCardThemeStyle(card) + '">' +
        '<button type="button" class="card-edit" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
        '<button type="button" class="card-duplicate" data-id="' + card.id + '" aria-label="שיכפול כרטיס" title="שיכפול">⧉</button>' +
        '<button type="button" class="card-delete" data-id="' + card.id + '" aria-label="מחיקת כרטיס">×</button>' +
        buildCardInner(card) +
      '</div>'
    )
    : (
      '<div class="card card--clickable' + popClass + flatClass + '" data-id="' + card.id + '" role="button" tabindex="0" style="' + getCardThemeStyle(card) + '">' +
        '<button type="button" class="card-edit card-edit--quiet" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
        buildCardInner(card) +
      '</div>'
    );

  return (
    '<div class="card-free-wrap' + (editMode ? ' is-editable' : '') + '" data-id="' + card.id + '" style="' + style + '">' +
      cardHtml +
      resizeHandle +
    '</div>'
  );
}

function renderCardsSectionTitle(home, sectionId) {
  const meta = getCardsSectionMeta(sectionId);
  const titleEl = document.getElementById(meta.titleElId);
  const cfg = getCardsSectionConfig(home, sectionId);
  if (!titleEl) return;
  titleEl.textContent = (cfg.title || meta.defaultTitle).trim() || meta.defaultTitle;
}

function renderFreeformCards(cards, home, sectionId, gridEl) {
  sectionId = sectionId || getActiveCardsSectionId();
  gridEl = gridEl || getCardsGridEl(sectionId);
  if (!gridEl) return;

  const cfg = getCardsSectionConfig(home, sectionId);
  const height = clampCardsFreeHeight(cfg.cardsFreeHeight);
  const defaultW = clampCardFreeWidth(cfg.cardsFreeSize);
  let positions = ensureCardPositions(home, cards, sectionId);
  home = loadHome();
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
  if (changed) {
    saveHome(setCardsSectionConfig(home, sectionId, {
      cardPositions: positions,
      cardsFreeHeight: height,
      cardsFreeSize: defaultW,
    }));
  }

  const cardsHtml = cards.map(function (card, index) {
    return buildFreeformCardHtml(card, positions[card.id], index);
  }).join('');

  gridEl.innerHTML =
    '<div class="cards-freeform-canvas" id="cardsFreeformCanvas-' + sectionId + '" data-cards-section="' + sectionId + '" style="--cards-free-height:' + height + 'px;">' +
      cardsHtml +
      (editMode
        ? '<div class="home-resize-handle cards-free-resize-handle" data-cards-section="' + sectionId + '" title="גררו לשינוי גובה המרחב">' +
            '<span class="home-resize-grip"></span>' +
          '</div>'
        : '') +
    '</div>';
}

function renderCardsIntoSection(cards, home, sectionId) {
  const gridEl = getCardsGridEl(sectionId);
  if (!gridEl) return;

  const cfg = getCardsSectionConfig(home, sectionId);
  const sectionCards = getCardsForSection(cards, sectionId);
  const mode = getCardsLayoutMode(home, sectionId);
  const perRow = Math.min(6, Math.max(2, Number(cfg.cardsPerRow) || DEFAULT_HOME.cardsPerRow));
  const gap = Math.min(48, Math.max(4, Number(cfg.cardsGap) || DEFAULT_HOME.cardsGap));

  gridEl.style.setProperty('--cards-per-row', String(perRow));
  gridEl.style.setProperty('--cards-gap', gap + 'px');
  gridEl.classList.toggle('has-categories', mode === 'categories');
  gridEl.classList.toggle('is-freeform', mode === 'freeform');
  gridEl.classList.toggle('edit-mode', editMode);
  renderCardsSectionTitle(home, sectionId);

  if (mode === 'freeform') {
    renderFreeformCards(sectionCards, home, sectionId, gridEl);
    return;
  }

  if (mode === 'categories') {
    const categories = normalizeCategories(cfg.categories, sectionCards);
    let html = '';
    categories.forEach(function (cat) {
      html += buildCategoryBlockHtml(cat, getCardsByIds(sectionCards, cat.cardIds), { isLoose: false });
    });
    const loose = getUncategorizedCards(sectionCards, categories);
    if (editMode || loose.length) {
      html += buildCategoryBlockHtml(
        { id: '', title: 'ללא קטגוריה' },
        loose,
        { isLoose: true }
      );
    }
    if (!html) {
      gridEl.classList.remove('has-categories');
      html = sectionCards.map(function (card, index) {
        return buildCardElementHtml(card, index);
      }).join('');
    }
    gridEl.innerHTML = html;
    return;
  }

  gridEl.innerHTML = sectionCards.map(function (card, index) {
    return buildCardElementHtml(card, index);
  }).join('');
}

function renderCards(cards) {
  if (isInlineEditPrefixActive('card.')) return;
  const home = ensureCardsSections(loadHome());
  syncCategoriesToolbar(home);

  CARD_SECTIONS.forEach(function (row) {
    renderCardsIntoSection(cards, home, row.id);
  });

  if (editMode) {
    let needsFreeform = false;
    let needsCategories = false;
    let needsDrag = false;
    CARD_SECTIONS.forEach(function (row) {
      const mode = getCardsLayoutMode(home, row.id);
      if (mode === 'freeform') needsFreeform = true;
      else {
        needsDrag = true;
        if (mode === 'categories') needsCategories = true;
      }
    });
    if (needsFreeform) setupFreeformCardInteractions();
    if (needsDrag) setupDragAndDrop();
    setupDeleteButtons();
    setupEditButtons();
    setupDuplicateButtons();
    if (needsCategories) setupCategoryControls();
  } else {
    setupCardClicks();
    setupEditButtons();
  }
  pendingCardPopId = null;
  if (editMode) syncInlineEditableHosts();
}

function buildCategoryBlockHtml(cat, cards, options) {
  options = options || {};
  const isLoose = !!options.isLoose;
  const catId = cat.id || '';
  const titleStyle = getCategoryTitleStyle(cat);
  const subtitleStyle = getCategorySubtitleStyle(cat);
  const fontSize = clampFontSize(cat.fontSize, 22);
  const color = normalizeTextColor(cat.color, '#2a3a2f');
  const colorFieldId = 'catColor_' + catId;
  const subtitle = String(cat.subtitle || '');

  if (!editMode && !cards.length) return '';

  let headerHtml;
  if (editMode && !isLoose) {
    headerHtml =
      '<header class="category-header">' +
        '<div class="category-header-texts">' +
          '<input type="text" class="category-title-input" data-category-id="' + escapeHtml(catId) + '" value="' + escapeHtml(cat.title || 'קטגוריה') + '" maxlength="40" aria-label="שם קטגוריה" style="' + titleStyle + '">' +
          '<input type="text" class="category-subtitle-input" data-category-id="' + escapeHtml(catId) + '" value="' + escapeHtml(subtitle) + '" maxlength="80" placeholder="תיאור קצר" aria-label="תיאור קטגוריה" style="' + subtitleStyle + '">' +
        '</div>' +
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
    const subtitleHtml = subtitle.trim()
      ? '<p class="category-subtitle" style="' + subtitleStyle + '">' + escapeHtml(subtitle) + '</p>'
      : '';
    headerHtml =
      '<header class="category-header">' +
        '<div class="category-header-texts">' +
          '<h3 class="category-title" style="' + titleStyle + '">' + escapeHtml(cat.title || 'קטגוריה') + '</h3>' +
          subtitleHtml +
        '</div>' +
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


/* ===== מצב עריכה / גרירה / מחיקה ===== */

function mergeSectionCardOrder(allCards, sectionId, orderedSectionCards) {
  const otherCards = allCards.filter(function (card) {
    return normalizeCardSection(card) !== sectionId;
  });
  if (sectionId === 'top') return orderedSectionCards.concat(otherCards);
  const topCards = allCards.filter(function (card) { return normalizeCardSection(card) === 'top'; });
  return topCards.concat(orderedSectionCards);
}

function saveOrderFromDom(contextEl) {
  let home = ensureCardsSections(loadHome());
  const cards = loadCards();
  const cardMap = Object.fromEntries(cards.map(function (c) { return [c.id, c]; }));
  let gridEl = null;
  if (contextEl) {
    if (contextEl.classList && contextEl.classList.contains('cards-grid')) {
      gridEl = contextEl;
    } else if (contextEl.closest) {
      gridEl = contextEl.closest('.cards-grid');
    }
  }
  if (!gridEl && draggedElement) {
    gridEl = draggedElement.closest('.cards-grid');
  }
  const sectionId = getCardsSectionIdFromGridEl(gridEl);
  const mode = getCardsLayoutMode(home, sectionId);
  const cfg = getCardsSectionConfig(home, sectionId);

  if (mode !== 'categories') {
    if (mode === 'freeform') return;
    const targetGrid = gridEl || getCardsGridEl(sectionId);
    if (!targetGrid) return;
    const ids = [...targetGrid.querySelectorAll('.card')].map(function (el) {
      return el.dataset.id;
    });
    const ordered = ids.map(function (id) { return cardMap[id]; }).filter(Boolean);
    saveCards(mergeSectionCardOrder(cards, sectionId, ordered));
    return;
  }

  const targetGrid = gridEl || getCardsGridEl(sectionId);
  if (!targetGrid) return;
  const allIds = [];
  const categories = [];

  targetGrid.querySelectorAll('.category-block').forEach(function (block) {
    const catId = block.dataset.categoryId || '';
    const ids = [...block.querySelectorAll('.card')].map(function (el) {
      return el.dataset.id;
    });
    allIds.push.apply(allIds, ids);
    if (!catId) return;
    const titleInput = block.querySelector('.category-title-input');
    const subtitleInput = block.querySelector('.category-subtitle-input');
    const title = titleInput
      ? String(titleInput.value || '').trim().slice(0, 40) || 'קטגוריה'
      : 'קטגוריה';
    const subtitle = subtitleInput
      ? String(subtitleInput.value || '').trim().slice(0, 80)
      : '';
    const sizeEl = block.querySelector('.category-font-size');
    const colorEl = block.querySelector('.category-color-input');
    categories.push({
      id: catId,
      title: title,
      subtitle: subtitle,
      cardIds: ids,
      fontSize: clampFontSize(sizeEl ? sizeEl.value : 22, 22),
      color: normalizeTextColor(colorEl ? colorEl.value : '#2a3a2f', '#2a3a2f'),
    });
  });

  home = setCardsSectionConfig(home, sectionId, { categories: categories });
  saveHome(home);
  const ordered = allIds.map(function (id) { return cardMap[id]; }).filter(Boolean);
  saveCards(mergeSectionCardOrder(cards, sectionId, ordered));
}

function saveAllCardsSectionsFromDom() {
  CARD_SECTIONS.forEach(function (row) {
    const grid = getCardsGridEl(row.id);
    if (grid) saveOrderFromDom(grid);
  });
}

function getCardDropContainer(el) {
  const gridEl = el && el.closest('.cards-grid');
  if (!gridEl) return getCardsGridEl(getActiveCardsSectionId());
  const categoryCards = el.closest('.category-cards');
  if (categoryCards) return categoryCards;
  return gridEl.classList.contains('has-categories') ? null : gridEl;
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
  const cardElements = document.querySelectorAll('.cards-grid .card--editing');

  cardElements.forEach(function (card) {
    card.addEventListener('dragstart', function (e) {
      if (activeInlineEdit || (e.target.closest && e.target.closest('[data-inline-edit]'))) {
        e.preventDefault();
        return;
      }
      draggedElement = card;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.id);
    });

    card.addEventListener('dragend', function () {
      card.classList.remove('dragging');
      document.querySelectorAll('.cards-grid .category-cards.is-drop-target').forEach(function (el) {
        el.classList.remove('is-drop-target');
      });
      document.querySelectorAll('.cards-grid .category-cards').forEach(ensureCategoryEmptyPlaceholder);
      saveOrderFromDom(card);
      draggedElement = null;
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

  document.querySelectorAll('.cards-grid .category-cards').forEach(function (container) {
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
  document.querySelectorAll('.cards-grid .category-title-input').forEach(function (input) {
    input.addEventListener('click', function (e) {
      e.stopPropagation();
    });
    input.addEventListener('change', function () {
      saveOrderFromDom(input);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
      }
    });
  });

  document.querySelectorAll('.cards-grid .category-subtitle-input').forEach(function (input) {
    input.addEventListener('click', function (e) {
      e.stopPropagation();
    });
    input.addEventListener('change', function () {
      saveOrderFromDom(input);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
      }
    });
  });

  document.querySelectorAll('.cards-grid .category-delete').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      deleteCategory(btn.dataset.categoryId, getCardsSectionIdFromElement(btn));
    });
  });

  document.querySelectorAll('.cards-grid .category-add').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      addCategoryAfter(btn.dataset.categoryId || '', getCardsSectionIdFromElement(btn));
    });
  });

  document.querySelectorAll('.cards-grid .category-font-size').forEach(function (range) {
    const block = range.closest('.category-block');
    const valueEl = block && block.querySelector('.category-font-size-value');
    const titleInput = block && block.querySelector('.category-title-input');
    const subtitleInput = block && block.querySelector('.category-subtitle-input');

    function applySize(raw) {
      const size = clampFontSize(raw, 22);
      const subtitleSize = Math.max(10, Math.round(size * 0.72));
      range.value = String(size);
      if (valueEl) valueEl.textContent = String(size);
      if (titleInput) titleInput.style.fontSize = size + 'px';
      if (subtitleInput) subtitleInput.style.fontSize = subtitleSize + 'px';
      saveOrderFromDom(range);
    }

    range.addEventListener('input', function () {
      applySize(range.value);
    });
    range.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  });

  document.querySelectorAll('.cards-grid .category-color-field').forEach(function (field) {
    field.dataset.hslaReady = '';
    setupHslaField(field, function (hex) {
      const block = field.closest('.category-block');
      const titleInput = block && block.querySelector('.category-title-input');
      const subtitleInput = block && block.querySelector('.category-subtitle-input');
      const cssColor = colorToCss(hex);
      if (titleInput) titleInput.style.color = cssColor;
      if (subtitleInput) subtitleInput.style.color = cssColor;
      saveOrderFromDom(field);
    });
  });
}

function addCategory() {
  addCategoryAfter('');
}

function updateActiveCardsSectionConfig(patch) {
  let home = loadHome();
  const sectionId = getActiveCardsSectionId();
  home = setCardsSectionConfig(home, sectionId, patch);
  if (!saveHome(home)) {
    alert('אין מספיק מקום לשמירה.');
    return false;
  }
  applySiteTheme(home);
  renderCards(loadCards());
  return true;
}

function addCategoryAfter(afterCategoryId, sectionId) {
  let home = loadHome();
  sectionId = sectionId || getActiveCardsSectionId();
  const cards = getCardsForSection(loadCards(), sectionId);
  const cfg = getCardsSectionConfig(home, sectionId);
  const categories = normalizeCategories(cfg.categories, cards);
  const newCat = {
    id: createCategoryId(),
    title: 'קטגוריה חדשה',
    subtitle: '',
    cardIds: [],
    fontSize: 22,
    color: '#2a3a2f',
  };
  if (afterCategoryId) {
    const idx = categories.findIndex(function (cat) { return cat.id === afterCategoryId; });
    if (idx >= 0) categories.splice(idx + 1, 0, newCat);
    else categories.push(newCat);
  } else {
    categories.push(newCat);
  }
  home = setCardsSectionConfig(home, sectionId, {
    layoutMode: 'categories',
    categories: categories,
  });
  if (!saveHome(home)) {
    alert('אין מספיק מקום לשמירה.');
    return;
  }
  syncCategoriesToolbar(home);
  renderCards(loadCards());
}

function deleteCategory(categoryId, sectionId) {
  if (!categoryId) return;
  if (!confirm('למחוק את הקטגוריה? הכרטיסים יישארו בלי קטגוריה.')) return;
  let home = loadHome();
  sectionId = sectionId || getActiveCardsSectionId();
  const cards = getCardsForSection(loadCards(), sectionId);
  const cfg = getCardsSectionConfig(home, sectionId);
  const categories = normalizeCategories(cfg.categories, cards).filter(function (cat) {
    return cat.id !== categoryId;
  });
  home = setCardsSectionConfig(home, sectionId, { categories: categories });
  saveHome(home);
  renderCards(loadCards());
}

function saveCardFreePosition(cardId, x, y, w) {
  let home = loadHome();
  const sectionId = getCardSectionById(cardId) || getActiveCardsSectionId();
  const cfg = getCardsSectionConfig(home, sectionId);
  const positions = Object.assign({}, getCardPositionMap(home, sectionId));
  const prev = normalizeCardPosition(positions[cardId], cfg.cardsFreeSize);
  positions[cardId] = {
    x: clampPercent(x, prev.x),
    y: clampPercent(y, prev.y),
    w: typeof w === 'number' ? clampCardFreeWidth(w) : prev.w,
  };
  saveHome(setCardsSectionConfig(home, sectionId, { cardPositions: positions }));
}

function removeCardPosition(cardId) {
  let home = loadHome();
  const sectionId = getCardSectionById(cardId) || getActiveCardsSectionId();
  const positions = Object.assign({}, getCardPositionMap(home, sectionId));
  if (!positions[cardId]) return;
  delete positions[cardId];
  saveHome(setCardsSectionConfig(home, sectionId, { cardPositions: positions }));
}

function placeFreeformCopyNearSource(home, sourceId, newId) {
  const sectionId = getCardSectionById(sourceId) || 'top';
  const cfg = getCardsSectionConfig(home, sectionId);
  const positions = Object.assign({}, getCardPositionMap(home, sectionId));
  const src = positions[sourceId];
  if (!src) return false;
  positions[newId] = {
    x: clampPercent(Number(src.x) + 4, src.x),
    y: clampPercent(Number(src.y) + 4, src.y),
    w: clampCardFreeWidth(src.w != null ? src.w : cfg.cardsFreeSize),
  };
  saveHome(setCardsSectionConfig(home, sectionId, { cardPositions: positions }));
  return true;
}

function applyCardsFreeHeight(height, sectionId) {
  sectionId = sectionId || getActiveCardsSectionId();
  const canvas = document.getElementById('cardsFreeformCanvas-' + sectionId);
  if (canvas) canvas.style.setProperty('--cards-free-height', clampCardsFreeHeight(height) + 'px');
  const valueEl = document.getElementById('cardsFreeHeightValue');
  if (valueEl) valueEl.textContent = clampCardsFreeHeight(height) + 'px';
}

function applyCardsFreeSizeToDom(size, sectionId) {
  sectionId = sectionId || getActiveCardsSectionId();
  const w = clampCardFreeWidth(size);
  const grid = getCardsGridEl(sectionId);
  if (grid) {
    grid.querySelectorAll('.card-free-wrap').forEach(function (wrap) {
      wrap.style.setProperty('--cw', w + '%');
    });
  }
  const valueEl = document.getElementById('cardsFreeSizeValue');
  if (valueEl) valueEl.textContent = w + '%';
}

function setupFreeformCardInteractions() {
  document.querySelectorAll('.cards-grid .card-free-wrap.is-editable').forEach(function (wrap) {
    wrap.addEventListener('pointerdown', function (e) {
      if (!editMode) return;
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest('.card-edit, .card-duplicate, .card-delete, .card-free-resize, .btn-view, a, button')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const cardId = wrap.dataset.id;
      const canvas = wrap.closest('.cards-freeform-canvas');
      if (!canvas) return;
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

  document.querySelectorAll('.cards-grid .card-free-resize').forEach(function (handle) {
    handle.addEventListener('pointerdown', function (e) {
      if (!editMode) return;
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const wrap = handle.closest('.card-free-wrap');
      if (!wrap) return;
      const cardId = wrap.dataset.id;
      const canvas = wrap.closest('.cards-freeform-canvas');
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;

      const sectionId = canvas.dataset.cardsSection || getActiveCardsSectionId();
      const cfg = getCardsSectionConfig(loadHome(), sectionId);
      const startX = e.clientX;
      const startW = parseFloat(String(wrap.style.getPropertyValue('--cw'))) || clampCardFreeWidth(cfg.cardsFreeSize);
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

  const heightHandles = document.querySelectorAll('.cards-free-resize-handle');
  heightHandles.forEach(function (heightHandle) {
    if (heightHandle.dataset.bound === '1') return;
    heightHandle.dataset.bound = '1';
    heightHandle.addEventListener('pointerdown', function (e) {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();

      const sectionId = heightHandle.dataset.cardsSection || getActiveCardsSectionId();
      const cfg = getCardsSectionConfig(loadHome(), sectionId);
      const startY = e.clientY;
      const startH = clampCardsFreeHeight(cfg.cardsFreeHeight);
      heightHandle.classList.add('is-dragging');
      heightHandle.setPointerCapture(e.pointerId);

      function onMove(ev) {
        const next = clampCardsFreeHeight(startH + (ev.clientY - startY));
        applyCardsFreeHeight(next, sectionId);
        const input = document.getElementById('cardsFreeHeight');
        if (input) input.value = String(next);
      }

      function onUp(ev) {
        heightHandle.classList.remove('is-dragging');
        try { heightHandle.releasePointerCapture(ev.pointerId); } catch (_) {}
        heightHandle.removeEventListener('pointermove', onMove);
        heightHandle.removeEventListener('pointerup', onUp);
        heightHandle.removeEventListener('pointercancel', onUp);

        const canvasEl = document.getElementById('cardsFreeformCanvas-' + sectionId);
        const fromCss = canvasEl ? parseFloat(canvasEl.style.getPropertyValue('--cards-free-height')) : NaN;
        const height = clampCardsFreeHeight(Number.isFinite(fromCss) ? fromCss : cfg.cardsFreeHeight);
        updateActiveCardsSectionConfig({ cardsFreeHeight: height });
      }

      heightHandle.addEventListener('pointermove', onMove);
      heightHandle.addEventListener('pointerup', onUp);
      heightHandle.addEventListener('pointercancel', onUp);
    });
  });
}

function setupDeleteButtons() {
  document.querySelectorAll('.cards-grid .card-delete').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      deleteCard(btn.dataset.id);
    });
  });
}

function setupEditButtons() {
  document.querySelectorAll('.cards-grid .card-edit').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      openWizardForEdit(btn.dataset.id);
    });
  });
}

function setupDuplicateButtons() {
  document.querySelectorAll('.cards-grid .card-duplicate').forEach(function (btn) {
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

  let nextHome = loadHome();
  const sectionId = normalizeCardSection(source);
  if (getCardsLayoutMode(nextHome, sectionId) === 'categories') {
    const placedHome = placeCardIdAfterSource(nextHome, id, copy.id, sectionId);
    if (placedHome) nextHome = placedHome;
  } else if (getCardsLayoutMode(nextHome, sectionId) === 'freeform') {
    placeFreeformCopyNearSource(nextHome, id, copy.id);
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
  document.querySelectorAll('.cards-grid .card--clickable').forEach(function (cardEl) {
    cardEl.addEventListener('click', function (e) {
      if (
        e.target.closest('.btn-view') ||
        e.target.closest('.card-action-icon') ||
        e.target.closest('.card-edit') ||
        e.target.closest('.card-duplicate')
      ) return;
      openCardDetail(cardEl.dataset.id);
    });

    cardEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCardDetail(cardEl.dataset.id);
      }
    });
  });

  document.querySelectorAll('.cards-grid .btn-view, .cards-grid .card-action-icon[data-link]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      handleCardAction(btn.dataset.link, btn.dataset.action || 'צפייה');
    });
  });
}

/* ===== תצוגת פרטים ===== */

const detailOverlay = document.getElementById('detailOverlay');
const detailFly = document.getElementById('detailFly');
const detailContent = document.getElementById('detailContent');
const detailClose = document.getElementById('detailClose');

function buildDetailHtml(card) {
  const notes = card.notes || card.description || '—';

  const extras = (card.extraImages || []).map(function (src) {
    return '<img src="' + src + '" alt="">';
  }).join('');

  const logoBlock = card.logo
    ? '<div class="detail-logo-wrap"><img src="' + card.logo + '" alt="לוגו"></div>'
    : '';

  return (
    '<div class="detail-hero' +
      (shouldShowImageBg(card) ? ' detail-hero--photo' : '') +
      (getCardBgMode(card) === 'none' || getCardBgMode(card) === 'squareImage' ? ' detail-hero--none' : '') +
      (getCardBgMode(card) === 'squareImage' ? ' detail-hero--square-image' : '') +
      '" style="' + getCardImageStyle(card) + getCardThemeStyle(card) + '">' +
      getCardBgPhotoHtml(card) +
      (getCardBgMode(card) === 'squareImage' ? buildFlatImageHtml(card) : '') +
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
      (IS_EDIT_MODE
        ? '<button type="button" class="detail-edit-btn" data-id="' + card.id + '">✎ עריכת כרטיס</button>'
        : '') +
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

function openCardDetail(id) {
  const card = loadCards().find(function (c) { return c.id === id; });
  if (!card) return;

  const target = getDetailTargetRect();

  detailContent.innerHTML = buildDetailHtml(card);
  detailFly.style.setProperty('--card-outline', colorToCss(getCardOutlineColor(card)));
  detailFly.style.setProperty('--card-flat-bg', colorToCss(getCardFlatBgColor(card)));
  detailFly.style.setProperty('--card-outline-width', getCardOutlineWidth(card) + 'px');
  detailFly.style.setProperty('--card-action', colorToCss(getCardActionColor(card)));

  const detailEditBtn = detailContent.querySelector('.detail-edit-btn');
  if (detailEditBtn) {
    detailEditBtn.addEventListener('click', function () {
      const id = card.id;
      closeCardDetail();
      openWizardForEdit(id);
    });
  }

  const detailActionBtns = detailContent.querySelectorAll('.detail-open-link');
  detailActionBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      handleCardAction(btn.dataset.link, btn.dataset.action || 'צפייה');
    });
  });

  detailFly.style.top = target.top + 'px';
  detailFly.style.left = target.left + 'px';
  detailFly.style.width = target.width + 'px';
  detailFly.style.height = target.height + 'px';
  detailOverlay.hidden = false;
}

function closeCardDetail() {
  if (detailOverlay.hidden) return;

  detailOverlay.hidden = true;
  detailFly.style.top = '';
  detailFly.style.left = '';
  detailFly.style.width = '';
  detailFly.style.height = '';
}

async function deleteCard(id) {
  const card = loadCards().find(function (c) { return c.id === id; });
  const name = card ? card.title : 'כרטיס זה';
  if (!confirm('למחוק את "' + name + '"?')) return;

  const el = document.querySelector('.cards-grid .card[data-id="' + id + '"]');
  await animateElementOut(el);

  const cards = loadCards().filter(function (c) { return c.id !== id; });
  saveCards(cards);
  removeCardFromCategories(id, getCardSectionById(id));
  removeCardPosition(id);
  renderCards(cards);
}

function toggleEditMode() {
  if (IS_USER_MODE) return;
  if (activeInlineEdit) commitInlineEdit();
  const wasEditMode = editMode;
  editMode = !editMode;
  btnEdit.textContent = editMode ? 'סיום עריכה' : 'עריכה';
  btnEdit.classList.toggle('active', editMode);
  forEachCardsGrid(function (grid) {
    grid.classList.toggle('edit-mode', editMode);
  });
  document.body.classList.toggle('page-edit-mode', editMode);
  if (wasEditMode && !editMode) {
    saveAllCardsSectionsFromDom();
  }
  if (!editMode && isCardsHomeSection(editingHomeSection)) {
    homeEditCommitted = true;
    closeHomeEditor();
  }
  unmountCardsLayoutBarFromEditor();
  const home = loadHome();
  syncHomeSectionControls(home);
  syncCategoriesToolbar(home);
  syncResizeHandlesVisibility();
  renderHomeHeader(home);
  renderFloatMenu(home);
  renderCards(loadCards());
  renderClosingDevTeam('closing', home);
  if (home.hasClosing2) renderClosingDevTeam('closing2', home);
  syncInlineEditableHosts();
  syncInlineTextSizeControl();
}

/* ===== תצוגה מקדימה חיה ===== */

function getWizardPreviewCardData() {
  const previewCard = {
    title: wizardData.pageName || 'שם הדף',
    unitName: wizardData.unitName,
    notes: wizardData.notes || 'התיאור יופיע כאן...',
    description: wizardData.notes || 'התיאור יופיע כאן...',
    projectType: wizardData.projectType || 'סוג',
    classification: wizardData.classification || 'סיווג',
    primaryColor: wizardData.primaryColor || '#e87722',
    secondaryColor: wizardData.secondaryColor || '#4a7c3f',
    outlineColor: wizardData.outlineColor || '#e87722',
    titleColor: wizardData.titleColor || DEFAULT_CARD_TITLE_COLOR,
    notesColor: wizardData.notesColor || DEFAULT_CARD_NOTES_COLOR,
    titleSize: wizardData.titleSize || DEFAULT_CARD_TITLE_SIZE,
    notesSize: wizardData.notesSize || DEFAULT_CARD_NOTES_SIZE,
    flatBgColor: wizardData.flatBgColor || '#ffffff',
    outlineWidth: getCardOutlineWidth(wizardData),
    flatEdge: getCardFlatEdge(wizardData),
    actionStyle: getCardActionStyle(wizardData),
    actionColor: getCardActionColor(wizardData),
    iconSize: getCardIconSize(wizardData),
    iconsFree: !!wizardData.iconsFree,
    iconPositions: normalizeIconPositions(wizardData.iconPositions),
    logoFree: !!wizardData.logoFree,
    logoPosition: normalizeLogoPosition(wizardData.logoPosition),
    flatImageZoom: getFlatImageZoom(wizardData),
    flatImagePosX: getFlatImagePosX(wizardData),
    flatImagePosY: getFlatImagePosY(wizardData),
    mainImage: wizardData.mainImage,
    logo: wizardData.logo,
    fontFamily: wizardData.fontFamily,
    bgMode: wizardData.bgMode || DEFAULT_CARD_BG_MODE,
    useImageBg: wizardData.bgMode === 'image',
    enabledActions: wizardData.enabledActions.slice(),
    actionLinks: Object.assign({}, wizardData.actionLinks),
  };

  const previewLinks = {};
  wizardData.enabledActions.forEach(function (action) {
    previewLinks[action] = wizardData.actionLinks[action] || '#';
  });
  previewCard.actionLinks = previewLinks;
  return previewCard;
}

function patchWizardPreviewCardTheme() {
  const cardEl = livePreview && livePreview.querySelector('.card--preview');
  if (!cardEl) return;
  const previewCard = getWizardPreviewCardData();
  cardEl.className = 'card card--preview' + getCardShellClass(previewCard);
  cardEl.setAttribute('style', getCardThemeStyle(previewCard));
}

function buildPreviewCard() {
  const previewCard = getWizardPreviewCardData();

  const metaBits = [];
  const metaHtml = metaBits.length
    ? '<p class="card-meta">' + escapeHtml(metaBits.join(' · ')) + '</p>'
    : '';

  let inner = buildCardInner(previewCard);
  if (metaHtml) {
    inner = inner.replace('</div><div class="card-footer">', metaHtml + '</div><div class="card-footer">');
  }

  return '<div class="card card--preview' + getCardShellClass(previewCard) + '" style="' + getCardThemeStyle(previewCard) + '">' + inner + '</div>';
}

function updateLivePreview() {
  if (wizardPreviewTextEdit) commitWizardPreviewTextEdit();
  livePreview.innerHTML = buildPreviewCard();
  setupWizardFreeDrag();
  markWizardPreviewTextFields();
}

function bindFreeDragHandle(cardEl, handle, onMovePos) {
  if (!cardEl || !handle) return;
  handle.addEventListener('pointerdown', function (e) {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = cardEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    handle.classList.add('is-dragging');
    try { handle.setPointerCapture(e.pointerId); } catch (err) {}

    function onMove(ev) {
      const x = ((ev.clientX - rect.left) / rect.width) * 100;
      const y = ((ev.clientY - rect.top) / rect.height) * 100;
      const pos = clampIconPos(x, y);
      handle.style.left = pos.x + '%';
      handle.style.top = pos.y + '%';
      onMovePos(pos);
    }

    function onUp() {
      handle.classList.remove('is-dragging');
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
    }

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  });
}

function setupWizardFreeDrag() {
  const cardEl = livePreview && livePreview.querySelector('.card--preview');
  if (!cardEl) return;

  if (cardEl.classList.contains('card--icons-free')) {
    cardEl.querySelectorAll('.card-action-icon.is-free').forEach(function (btn) {
      bindFreeDragHandle(cardEl, btn, function (pos) {
        const action = btn.dataset.action;
        if (!action) return;
        if (!wizardData.iconPositions || typeof wizardData.iconPositions !== 'object') {
          wizardData.iconPositions = {};
        }
        wizardData.iconPositions[action] = pos;
      });
    });
  }

  if (cardEl.classList.contains('card--logo-free')) {
    const logoHandle = cardEl.querySelector('.card-logo-free.is-free');
    bindFreeDragHandle(cardEl, logoHandle, function (pos) {
      wizardData.logoPosition = pos;
    });
  }
}

function getWizardPreviewTextSpec(el) {
  if (!el) return null;
  if (el.classList.contains('card-title')) {
    return { field: 'pageName', inputId: 'pageName', maxLen: 10, placeholder: 'שם הדף' };
  }
  if (el.classList.contains('card-notes')) {
    return { field: 'notes', inputId: 'notes', maxLen: 30, placeholder: 'התיאור יופיע כאן...' };
  }
  return null;
}

function readPreviewEditableText(el) {
  return String(el.innerText || el.textContent || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '');
}

function applyPreviewTextToWizard(spec, value) {
  wizardData[spec.field] = value;
  const input = document.getElementById(spec.inputId);
  if (input) input.value = value;
}

function placeCaretAtEnd(el) {
  try {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } catch (_) {}
}

function selectElementContents(el) {
  try {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } catch (_) {}
}

function finishWizardPreviewTextDom(el) {
  if (!el) return;
  el.removeAttribute('contenteditable');
  el.classList.remove('is-preview-editing');
}

function commitWizardPreviewTextEdit() {
  if (!wizardPreviewTextEdit) return;
  const el = wizardPreviewTextEdit.el;
  const spec = wizardPreviewTextEdit.spec;
  let value = readPreviewEditableText(el).trim();
  if (value === spec.placeholder) value = '';
  value = value.slice(0, spec.maxLen);
  applyPreviewTextToWizard(spec, value);
  finishWizardPreviewTextDom(el);
  wizardPreviewTextEdit = null;
  syncInlineTextSizeControl();
}

function cancelWizardPreviewTextEdit() {
  if (!wizardPreviewTextEdit) return;
  applyPreviewTextToWizard(wizardPreviewTextEdit.spec, wizardPreviewTextEdit.original);
  finishWizardPreviewTextDom(wizardPreviewTextEdit.el);
  wizardPreviewTextEdit = null;
  updateLivePreview();
  syncInlineTextSizeControl();
}

function startWizardPreviewTextEdit(el) {
  const spec = getWizardPreviewTextSpec(el);
  if (!spec) return;
  if (wizardPreviewTextEdit && wizardPreviewTextEdit.el === el) return;
  if (wizardPreviewTextEdit) commitWizardPreviewTextEdit();

  const original = wizardData[spec.field] || '';
  let editText = original;
  if (!editText) {
    const visible = readPreviewEditableText(el).trim();
    if (visible && visible !== spec.placeholder) editText = visible;
  }
  el.textContent = editText;
  el.classList.add('is-preview-editing');
  el.setAttribute('contenteditable', 'true');
  wizardPreviewTextEdit = { el: el, spec: spec, original: original };
  el.focus();
  selectElementContents(el);
  syncInlineTextSizeControl();
}

function markWizardPreviewTextFields() {
  const cardEl = livePreview && livePreview.querySelector('.card--preview');
  if (!cardEl) return;

  const fields = [
    [cardEl.querySelector('.card-title'), 'עריכת כותרת'],
    [cardEl.querySelector('.card-notes'), 'עריכת תיאור'],
  ];

  fields.forEach(function (pair) {
    const el = pair[0];
    if (!el) return;
    el.classList.add('is-preview-text');
    el.setAttribute('role', 'textbox');
    el.setAttribute('tabindex', '0');
    el.setAttribute('spellcheck', 'false');
    el.setAttribute('title', 'לחצו לעריכה');
    el.setAttribute('aria-label', pair[1]);
  });
}

function bindWizardPreviewTextEdit() {
  if (!livePreview || livePreview.dataset.previewTextBound === '1') return;
  livePreview.dataset.previewTextBound = '1';

  if (document.body.dataset.wizardPreviewDocBound !== '1') {
    document.body.dataset.wizardPreviewDocBound = '1';
    document.addEventListener('pointerdown', function (e) {
      if (!wizardPreviewTextEdit) return;
      const el = wizardPreviewTextEdit.el;
      if (el.contains(e.target)) return;
      if (isInlineFormattingToolbarEl(e.target)) return;
      commitWizardPreviewTextEdit();
      updateLivePreview();
    }, true);
  }

  livePreview.addEventListener('pointerdown', function (e) {
    const el = e.target.closest('.is-preview-text');
    if (!el || !livePreview.contains(el)) return;
    e.stopPropagation();
    if (wizardPreviewTextEdit && wizardPreviewTextEdit.el !== el) {
      commitWizardPreviewTextEdit();
    }
  });

  livePreview.addEventListener('click', function (e) {
    const el = e.target.closest('.is-preview-text');
    if (!el || !livePreview.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();
    startWizardPreviewTextEdit(el);
  });

  livePreview.addEventListener('keydown', function (e) {
    const el = e.target.closest('.is-preview-text');
    if (!el || !livePreview.contains(el)) return;

    if (el.getAttribute('contenteditable') !== 'true') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startWizardPreviewTextEdit(el);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      commitWizardPreviewTextEdit();
      updateLivePreview();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelWizardPreviewTextEdit();
    }
  });

  livePreview.addEventListener('input', function (e) {
    const el = e.target.closest('.is-preview-text');
    if (!el || !wizardPreviewTextEdit || wizardPreviewTextEdit.el !== el) return;
    const spec = wizardPreviewTextEdit.spec;
    let value = readPreviewEditableText(el);
    if (value.length > spec.maxLen) {
      value = value.slice(0, spec.maxLen);
      el.textContent = value;
      placeCaretAtEnd(el);
    }
    applyPreviewTextToWizard(spec, value);
  });

  livePreview.addEventListener('blur', function (e) {
    if (!wizardPreviewTextEdit || wizardPreviewTextEdit.el !== e.target) return;
    if (isInlineFormattingToolbarEl(e.relatedTarget)) return;
    scheduleWizardPreviewTextEditCommit();
  }, true);
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

  showError('');
  updateLivePreview();
}

function validateStep(step) {
  if (step === 1) {
    if ((wizardData.bgMode === 'image' || wizardData.bgMode === 'squareImage') && !wizardData.mainImage) {
      return wizardData.bgMode === 'squareImage'
        ? 'יש להעלות תמונת ארט'
        : 'יש להעלות תמונה לחלק העליון של הכרטיס';
    }
  }

  if (step === 2) {
    if (!wizardData.pageName.trim()) return 'שם הדף הוא שדה חובה';
    if (!wizardData.classification) return 'סיווג הוא שדה חובה';
  }

  if (step === 3) {
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
  wizardData.outlineColor = (document.getElementById('outlineColor') || {}).value || '#e87722';
  wizardData.titleColor = (document.getElementById('titleColor') || {}).value || DEFAULT_CARD_TITLE_COLOR;
  wizardData.notesColor = (document.getElementById('notesColor') || {}).value || DEFAULT_CARD_NOTES_COLOR;
  wizardData.flatBgColor = (document.getElementById('flatBgColor') || {}).value || '#ffffff';
  wizardData.flatEdge = getSelectedFlatEdge();
  wizardData.actionStyle = getSelectedActionStyle();
  wizardData.actionColor = (document.getElementById('actionColor') || {}).value || '#e87722';
  const iconSizeEl = document.getElementById('iconSize');
  wizardData.iconSize = getCardIconSize({
    iconSize: iconSizeEl ? iconSizeEl.value : wizardData.iconSize,
  });
  const iconsFreeEl = document.getElementById('iconsFree');
  wizardData.iconsFree = !!(iconsFreeEl && iconsFreeEl.checked);
  wizardData.iconPositions = normalizeIconPositions(wizardData.iconPositions);
  const logoFreeEl = document.getElementById('logoFree');
  wizardData.logoFree = !!(logoFreeEl && logoFreeEl.checked);
  wizardData.logoPosition = normalizeLogoPosition(wizardData.logoPosition);
  const flatImageZoomEl = document.getElementById('flatImageZoom');
  wizardData.flatImageZoom = clampFlatImageZoom(
    flatImageZoomEl ? flatImageZoomEl.value : wizardData.flatImageZoom
  );
  const flatImagePosXEl = document.getElementById('flatImagePosX');
  wizardData.flatImagePosX = clampFlatImagePos(
    flatImagePosXEl ? flatImagePosXEl.value : wizardData.flatImagePosX
  );
  const flatImagePosYEl = document.getElementById('flatImagePosY');
  wizardData.flatImagePosY = clampFlatImagePos(
    flatImagePosYEl ? flatImagePosYEl.value : wizardData.flatImagePosY
  );
  const flatImageZoomValue = document.getElementById('flatImageZoomValue');
  if (flatImageZoomValue) flatImageZoomValue.textContent = wizardData.flatImageZoom + '%';
  const flatImagePosXValue = document.getElementById('flatImagePosXValue');
  if (flatImagePosXValue) flatImagePosXValue.textContent = wizardData.flatImagePosX + '%';
  const flatImagePosYValue = document.getElementById('flatImagePosYValue');
  if (flatImagePosYValue) flatImagePosYValue.textContent = wizardData.flatImagePosY + '%';
  const iconSizeValue = document.getElementById('iconSizeValue');
  if (iconSizeValue) iconSizeValue.textContent = wizardData.iconSize + 'px';
  syncActionStyleUi();
  const outlineWidthEl = document.getElementById('outlineWidth');
  wizardData.outlineWidth = getCardOutlineWidth({
    outlineWidth: outlineWidthEl ? outlineWidthEl.value : wizardData.outlineWidth,
  });
  const outlineWidthValue = document.getElementById('outlineWidthValue');
  if (outlineWidthValue) outlineWidthValue.textContent = wizardData.outlineWidth + 'px';
  // גופן הכרטיס נשאר ברירת מחדל / ערך שמור — אין בחירה באשף
  if (!wizardData.fontFamily) {
    wizardData.fontFamily = "'Segoe UI', Tahoma, Arial, sans-serif";
  }
  wizardData.bgMode = getSelectedCardBgMode();
  wizardData.useImageBg = wizardData.bgMode === 'image';
  syncCardBgModeUi();

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
  const outlineHex = document.getElementById('outlineColorHex');
  if (outlineHex) outlineHex.textContent = colorToDisplayHex(wizardData.outlineColor);
  const titleHex = document.getElementById('titleColorHex');
  if (titleHex) titleHex.textContent = colorToDisplayHex(wizardData.titleColor);
  const notesHex = document.getElementById('notesColorHex');
  if (notesHex) notesHex.textContent = colorToDisplayHex(wizardData.notesColor);
  const flatBgHex = document.getElementById('flatBgColorHex');
  if (flatBgHex) flatBgHex.textContent = colorToDisplayHex(wizardData.flatBgColor);
  const actionColorHex = document.getElementById('actionColorHex');
  if (actionColorHex) actionColorHex.textContent = colorToDisplayHex(wizardData.actionColor);
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
  ];

  liveIds.forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
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

  document.querySelectorAll('input[name="cardBgMode"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      syncFormToData();
      updateLivePreview();
    });
  });

  document.querySelectorAll('input[name="flatEdge"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      syncFormToData();
      updateLivePreview();
    });
  });

  document.querySelectorAll('input[name="actionStyle"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      withWizardFormScrollPreserved(function () {
        syncFormToData();
        updateLivePreview();
      });
    });
  });

  const iconSizeEl = document.getElementById('iconSize');
  if (iconSizeEl) {
    iconSizeEl.addEventListener('input', function () {
      syncFormToData();
      updateLivePreview();
    });
  }

  const iconsFreeEl = document.getElementById('iconsFree');
  if (iconsFreeEl) {
    iconsFreeEl.addEventListener('change', function () {
      syncFormToData();
      updateLivePreview();
    });
  }

  const logoFreeEl = document.getElementById('logoFree');
  if (logoFreeEl) {
    logoFreeEl.addEventListener('change', function () {
      syncFormToData();
      updateLivePreview();
    });
  }

  ['flatImageZoom', 'flatImagePosX', 'flatImagePosY'].forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () {
      syncFormToData();
      updateLivePreview();
    });
  });

  const outlineWidthEl = document.getElementById('outlineWidth');
  if (outlineWidthEl) {
    outlineWidthEl.addEventListener('input', function () {
      syncFormToData();
      updateLivePreview();
    });
  }

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

  setupHslaField(document.getElementById('outlineColorPicker'), function (hex) {
    wizardData.outlineColor = hex;
    const outlineHex = document.getElementById('outlineColorHex');
    if (outlineHex) outlineHex.textContent = colorToDisplayHex(hex);
    updateLivePreview();
  });

  setupHslaField(document.getElementById('titleColorPicker'), function (hex) {
    wizardData.titleColor = hex;
    const titleHex = document.getElementById('titleColorHex');
    if (titleHex) titleHex.textContent = colorToDisplayHex(hex);
    updateLivePreview();
  });

  setupHslaField(document.getElementById('notesColorPicker'), function (hex) {
    wizardData.notesColor = hex;
    const notesHex = document.getElementById('notesColorHex');
    if (notesHex) notesHex.textContent = colorToDisplayHex(hex);
    updateLivePreview();
  });

  setupHslaField(document.getElementById('flatBgColorPicker'), function (hex) {
    wizardData.flatBgColor = hex;
    const flatBgHex = document.getElementById('flatBgColorHex');
    if (flatBgHex) flatBgHex.textContent = colorToDisplayHex(hex);
    updateLivePreview();
  });

  setupHslaField(document.getElementById('actionColorPicker'), function (hex) {
    wizardData.actionColor = hex;
    const actionHex = document.getElementById('actionColorHex');
    if (actionHex) actionHex.textContent = colorToDisplayHex(hex);
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
    syncCardBgModeUi();
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
  const outlineInput = document.getElementById('outlineColor');
  if (outlineInput) outlineInput.value = wizardData.outlineColor || '#e87722';
  const titleInput = document.getElementById('titleColor');
  if (titleInput) titleInput.value = wizardData.titleColor || DEFAULT_CARD_TITLE_COLOR;
  const notesInput = document.getElementById('notesColor');
  if (notesInput) notesInput.value = wizardData.notesColor || DEFAULT_CARD_NOTES_COLOR;
  const flatBgInput = document.getElementById('flatBgColor');
  if (flatBgInput) flatBgInput.value = wizardData.flatBgColor || '#ffffff';
  const actionColorInput = document.getElementById('actionColor');
  if (actionColorInput) actionColorInput.value = wizardData.actionColor || '#e87722';
  setHslaFieldValue('primaryColor', wizardData.primaryColor || '#e87722');
  setHslaFieldValue('secondaryColor', wizardData.secondaryColor || '#4a7c3f');
  setHslaFieldValue('outlineColor', wizardData.outlineColor || '#e87722');
  setHslaFieldValue('titleColor', wizardData.titleColor || DEFAULT_CARD_TITLE_COLOR);
  setHslaFieldValue('notesColor', wizardData.notesColor || DEFAULT_CARD_NOTES_COLOR);
  setHslaFieldValue('flatBgColor', wizardData.flatBgColor || '#ffffff');
  setHslaFieldValue('actionColor', wizardData.actionColor || '#e87722');
  document.getElementById('primaryColorHex').textContent = colorToDisplayHex(wizardData.primaryColor || '#e87722');
  document.getElementById('secondaryColorHex').textContent = colorToDisplayHex(wizardData.secondaryColor || '#4a7c3f');
  const outlineHex = document.getElementById('outlineColorHex');
  if (outlineHex) {
    outlineHex.textContent = colorToDisplayHex(wizardData.outlineColor || '#e87722');
  }
  const titleHex = document.getElementById('titleColorHex');
  if (titleHex) {
    titleHex.textContent = colorToDisplayHex(wizardData.titleColor || DEFAULT_CARD_TITLE_COLOR);
  }
  const notesHex = document.getElementById('notesColorHex');
  if (notesHex) {
    notesHex.textContent = colorToDisplayHex(wizardData.notesColor || DEFAULT_CARD_NOTES_COLOR);
  }
  const flatBgHex = document.getElementById('flatBgColorHex');
  if (flatBgHex) {
    flatBgHex.textContent = colorToDisplayHex(wizardData.flatBgColor || '#ffffff');
  }
  const actionColorHex = document.getElementById('actionColorHex');
  if (actionColorHex) {
    actionColorHex.textContent = colorToDisplayHex(wizardData.actionColor || '#e87722');
  }
  const outlineWidth = getCardOutlineWidth(wizardData);
  const outlineWidthEl = document.getElementById('outlineWidth');
  if (outlineWidthEl) outlineWidthEl.value = String(outlineWidth);
  const outlineWidthValue = document.getElementById('outlineWidthValue');
  if (outlineWidthValue) outlineWidthValue.textContent = outlineWidth + 'px';
  setFlatEdgeInputs(wizardData.flatEdge || 'outline');
  setActionStyleInputs(wizardData.actionStyle || 'text');
  const iconSize = getCardIconSize(wizardData);
  const iconSizeEl = document.getElementById('iconSize');
  if (iconSizeEl) iconSizeEl.value = String(iconSize);
  const iconSizeValue = document.getElementById('iconSizeValue');
  if (iconSizeValue) iconSizeValue.textContent = iconSize + 'px';
  const iconsFreeEl = document.getElementById('iconsFree');
  if (iconsFreeEl) iconsFreeEl.checked = !!wizardData.iconsFree;
  const logoFreeEl = document.getElementById('logoFree');
  if (logoFreeEl) logoFreeEl.checked = !!wizardData.logoFree;
  const zoom = getFlatImageZoom(wizardData);
  const posX = getFlatImagePosX(wizardData);
  const posY = getFlatImagePosY(wizardData);
  const flatImageZoomEl = document.getElementById('flatImageZoom');
  if (flatImageZoomEl) flatImageZoomEl.value = String(zoom);
  const flatImagePosXEl = document.getElementById('flatImagePosX');
  if (flatImagePosXEl) flatImagePosXEl.value = String(posX);
  const flatImagePosYEl = document.getElementById('flatImagePosY');
  if (flatImagePosYEl) flatImagePosYEl.value = String(posY);
  const flatImageZoomValue = document.getElementById('flatImageZoomValue');
  if (flatImageZoomValue) flatImageZoomValue.textContent = zoom + '%';
  const flatImagePosXValue = document.getElementById('flatImagePosXValue');
  if (flatImagePosXValue) flatImagePosXValue.textContent = posX + '%';
  const flatImagePosYValue = document.getElementById('flatImagePosYValue');
  if (flatImagePosYValue) flatImagePosYValue.textContent = posY + '%';
  setCardBgModeInputs(wizardData.bgMode || DEFAULT_CARD_BG_MODE);

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
    outlineColor: wizardData.outlineColor || '#e87722',
    titleColor: wizardData.titleColor || DEFAULT_CARD_TITLE_COLOR,
    notesColor: wizardData.notesColor || DEFAULT_CARD_NOTES_COLOR,
    titleSize: wizardData.titleSize || DEFAULT_CARD_TITLE_SIZE,
    notesSize: wizardData.notesSize || DEFAULT_CARD_NOTES_SIZE,
    flatBgColor: wizardData.flatBgColor || '#ffffff',
    outlineWidth: getCardOutlineWidth(wizardData),
    flatEdge: getCardFlatEdge(wizardData),
    actionStyle: getCardActionStyle(wizardData),
    actionColor: getCardActionColor(wizardData),
    iconSize: getCardIconSize(wizardData),
    iconsFree: !!wizardData.iconsFree && getCardActionStyle(wizardData) === 'icons',
    iconPositions: normalizeIconPositions(wizardData.iconPositions),
    logoFree: !!wizardData.logoFree && !!wizardData.logo,
    logoPosition: normalizeLogoPosition(wizardData.logoPosition),
    flatImageZoom: getFlatImageZoom(wizardData),
    flatImagePosX: getFlatImagePosX(wizardData),
    flatImagePosY: getFlatImagePosY(wizardData),
    fontFamily: wizardData.fontFamily || "'Segoe UI', Tahoma, Arial, sans-serif",
    bgMode: wizardData.bgMode || DEFAULT_CARD_BG_MODE,
    useImageBg: wizardData.bgMode === 'image',
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
  if (IS_USER_MODE) return;
  editingCardId = null;
  resetWizardData();
  wizardForm.reset();
  currentStep = 1;

  wizardData.date = '';
  wizardData.status = '';
  wizardData.bgMode = DEFAULT_CARD_BG_MODE;
  wizardData.useImageBg = false;
  wizardData.enabledActions = ['צפייה'];
  wizardData.actionLinks = { 'צפייה': '', 'הורדה': '', 'הדפסה': '' };
  wizardData.primaryColor = '#e87722';
  wizardData.secondaryColor = '#4a7c3f';
  wizardData.outlineColor = '#e31c23';
  wizardData.titleColor = DEFAULT_CARD_TITLE_COLOR;
  wizardData.notesColor = DEFAULT_CARD_NOTES_COLOR;
  wizardData.titleSize = DEFAULT_CARD_TITLE_SIZE;
  wizardData.notesSize = DEFAULT_CARD_NOTES_SIZE;
  wizardData.flatBgColor = '#ffffff';
  wizardData.outlineWidth = 2;
  wizardData.flatEdge = 'outline';
  wizardData.actionStyle = 'text';
  wizardData.actionColor = '#e87722';
  wizardData.iconSize = 22;
  wizardData.iconsFree = false;
  wizardData.iconPositions = {};
  wizardData.logoFree = false;
  wizardData.logoPosition = null;
  wizardData.flatImageZoom = 100;
  wizardData.flatImagePosX = 50;
  wizardData.flatImagePosY = 50;
  wizardData.fontFamily = "'Segoe UI', Tahoma, Arial, sans-serif";

  applyWizardDataToForm();
  updateWizardChrome();

  modalOverlay.hidden = false;
  document.body.classList.add('is-wizard-open');
  syncSiteToolbarHeight();
  updateStepUI();
  syncInlineTextSizeControl();
}

function openWizardForEdit(cardId) {
  if (IS_USER_MODE) return;
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
  wizardData.outlineColor = card.outlineColor || '#e87722';
  wizardData.titleColor = card.titleColor || DEFAULT_CARD_TITLE_COLOR;
  wizardData.notesColor = card.notesColor || DEFAULT_CARD_NOTES_COLOR;
  wizardData.titleSize = getCardTitleSize(card);
  wizardData.notesSize = getCardNotesSize(card);
  wizardData.flatBgColor = card.flatBgColor || '#ffffff';
  wizardData.outlineWidth = getCardOutlineWidth(card);
  wizardData.flatEdge = getCardFlatEdge(card);
  wizardData.actionStyle = getCardActionStyle(card);
  wizardData.actionColor = getCardActionColor(card);
  wizardData.iconSize = getCardIconSize(card);
  wizardData.iconsFree = !!card.iconsFree;
  wizardData.iconPositions = normalizeIconPositions(card.iconPositions);
  wizardData.logoFree = !!card.logoFree;
  wizardData.logoPosition = normalizeLogoPosition(card.logoPosition);
  wizardData.flatImageZoom = getFlatImageZoom(card);
  wizardData.flatImagePosX = getFlatImagePosX(card);
  wizardData.flatImagePosY = getFlatImagePosY(card);
  wizardData.fontFamily = card.fontFamily || "'Segoe UI', Tahoma, Arial, sans-serif";
  wizardData.bgMode = getCardBgMode(card);
  wizardData.useImageBg = wizardData.bgMode === 'image';

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
  document.body.classList.add('is-wizard-open');
  syncSiteToolbarHeight();
  updateStepUI();
  syncInlineTextSizeControl();
}

function closeWizard() {
  if (wizardPreviewTextEdit) commitWizardPreviewTextEdit();
  modalOverlay.hidden = true;
  document.body.classList.remove('is-wizard-open');
  editingCardId = null;
  showError('');
  syncInlineTextSizeControl();
}

function finishWizard() {
  if (wizardPreviewTextEdit) commitWizardPreviewTextEdit();
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
    newCard.section = getActiveCardsSectionId();
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

function clampPercent(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(100, Math.max(0, Math.round(num * 10) / 10));
}

function clampHeaderHeight(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 400;
  return Math.min(720, Math.max(220, Math.round(num)));
}

function clampHeaderArtWidth(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 46;
  return Math.min(70, Math.max(20, Math.round(num)));
}

function clampButtonRadius(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 40;
  return Math.min(48, Math.max(0, Math.round(num)));
}

function clampFontSize(value, fallback, max) {
  const num = Number(value);
  const cap = max != null ? max : 72;
  if (!Number.isFinite(num)) return fallback || 16;
  return Math.min(cap, Math.max(10, Math.round(num)));
}

function normalizeAccentList(value) {
  if (Array.isArray(value)) {
    return value.map(function (item) { return String(item || '').trim(); }).filter(Boolean).join('\n');
  }
  return String(value == null ? '' : value);
}

function parseAccentList(value) {
  return normalizeAccentList(value).split(/\r?\n|,/).map(function (item) {
    return item.trim();
  }).filter(Boolean);
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

function homeTextSizeHtml(id, value, fallback, labelText, max) {
  const cap = max || 56;
  return homeSizeControlHtml(id, clampFontSize(value, fallback || 16, cap), {
    min: 10,
    max: cap,
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

function bindHomeTextSizeField(id, max) {
  const range = document.getElementById(id);
  const num = document.getElementById(id + 'Num');
  if (!range || !num) return;
  const cap = max || Number(range.max) || 56;

  function apply(raw, from) {
    const size = clampFontSize(raw, 16, cap);
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

function pickHeaderText(source, key, fallback) {
  if (source && source[key] != null) return String(source[key]);
  return fallback == null ? '' : String(fallback);
}

function normalizeHeader(header, fallbackTitle) {
  const source = header && typeof header === 'object' ? header : {};
  const defaults = DEFAULT_HOME.header;
  const titleFallback = fallbackTitle != null && String(fallbackTitle).trim()
    ? String(fallbackTitle)
    : defaults.title;

  return {
    layout: 'hero',
    height: clampHeaderHeight(source.height != null ? source.height : defaults.height),
    bgOpacity: clampBgOpacity(
      source.bgOpacity != null ? source.bgOpacity : defaults.bgOpacity,
      defaults.bgOpacity
    ),
    bgImage: source.bgImage || '',
    artSrc: source.artSrc || '',
    artSide: 'left',
    artWidth: clampHeaderArtWidth(source.artWidth != null ? source.artWidth : defaults.artWidth),
    kicker: clampStoredInlineText(pickHeaderText(source, 'kicker', defaults.kicker), 80),
    kickerColor: normalizeTextColor(source.kickerColor, defaults.kickerColor),
    kickerSize: clampFontSize(source.kickerSize, defaults.kickerSize, 32),
    title: clampStoredInlineText(pickHeaderText(source, 'title', titleFallback), 80),
    titleColor: normalizeTextColor(source.titleColor, defaults.titleColor),
    titleSize: clampFontSize(source.titleSize, defaults.titleSize, 72),
    body: clampStoredInlineText(pickHeaderText(source, 'body', defaults.body), 400),
    bodyColor: normalizeTextColor(source.bodyColor, defaults.bodyColor),
    bodySize: clampFontSize(source.bodySize, defaults.bodySize, 32),
    bodyAccentColor: normalizeTextColor(source.bodyAccentColor, defaults.bodyAccentColor),
    bodyAccents: normalizeAccentList(source.bodyAccents != null ? source.bodyAccents : defaults.bodyAccents),
    buttonText: pickHeaderText(source, 'buttonText', defaults.buttonText).slice(0, 40),
    buttonHref: String(source.buttonHref || '').trim(),
    buttonBg: normalizeTextColor(source.buttonBg, defaults.buttonBg),
    buttonColor: normalizeTextColor(source.buttonColor, defaults.buttonColor),
    buttonRadius: clampButtonRadius(source.buttonRadius != null ? source.buttonRadius : defaults.buttonRadius),
    linkText: pickHeaderText(source, 'linkText', defaults.linkText).slice(0, 40),
    linkHref: String(source.linkHref || '').trim(),
    linkColor: normalizeTextColor(source.linkColor, defaults.linkColor),
  };
}

function findLegacyHeaderItem(items, type) {
  if (!Array.isArray(items)) return null;
  return items.find(function (item) { return item && item.type === type; }) || null;
}

function migrateItemsToHero(header, fallbackTitle) {
  const source = header && typeof header === 'object' ? header : {};
  const items = Array.isArray(source.items) ? source.items : [];
  const titleItem = findLegacyHeaderItem(items, 'title');
  const subtitleItem = findLegacyHeaderItem(items, 'subtitle');
  const logoItem = items.find(function (item) { return item && item.type === 'logo' && item.src; });
  const isPlainDefault = items.length <= 1
    && titleItem
    && (!titleItem.text || titleItem.text === 'פורטל תוכן')
    && !logoItem
    && !subtitleItem;

  if (isPlainDefault) {
    return normalizeHeader(DEFAULT_HOME.header, DEFAULT_HOME.title);
  }

  return normalizeHeader({
    height: source.height,
    bgOpacity: source.bgOpacity,
    bgImage: source.bgImage || '',
    artSrc: logoItem ? logoItem.src : '',
    artSide: 'left',
    title: titleItem && titleItem.text ? titleItem.text : fallbackTitle,
    titleColor: titleItem && titleItem.color ? titleItem.color : HEADER_TEXT_COLOR,
    titleSize: titleItem && titleItem.fontSize ? titleItem.fontSize : 44,
    kicker: subtitleItem && subtitleItem.text ? subtitleItem.text : '',
    kickerColor: subtitleItem && subtitleItem.color ? subtitleItem.color : HEADER_TEXT_COLOR,
    kickerSize: subtitleItem && subtitleItem.fontSize ? subtitleItem.fontSize : 15,
    body: '',
    bodyAccents: '',
    buttonText: '',
    linkText: '',
  }, fallbackTitle);
}

function migrateLegacyHeader(parsed) {
  const logos = Array.isArray(parsed.titleLogos) ? parsed.titleLogos : [];
  const firstLogo = logos.find(function (logo) { return logo && logo.src; })
    || (parsed.titleLogoEnabled && parsed.titleLogo ? { src: parsed.titleLogo } : null);

  return migrateItemsToHero({
    height: 400,
    bgOpacity: migrateBgOpacity(parsed, 'title'),
    bgImage: parsed.titleImage || '',
    items: [
      firstLogo ? { type: 'logo', src: firstLogo.src } : null,
      { type: 'title', text: parsed.title || DEFAULT_HOME.title },
    ].filter(Boolean),
  }, parsed.title);
}

function buildHomeHeader(parsed) {
  if (parsed && parsed.header && parsed.header.layout === 'hero') {
    return normalizeHeader(parsed.header, parsed.title);
  }
  if (parsed && parsed.header && Array.isArray(parsed.header.items)) {
    return migrateItemsToHero(parsed.header, parsed.title);
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
  home.title = home.header && home.header.title != null
    ? String(home.header.title).slice(0, 80)
    : '';
  return home.title;
}

function getHeaderTitleText(home) {
  if (home && home.header && home.header.title != null) {
    return String(home.header.title);
  }
  return home && home.title != null ? String(home.title) : DEFAULT_HOME.title;
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
  home.floatMenu = normalizeFloatMenu(home.floatMenu, home);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      home = Object.assign({}, DEFAULT_HOME, parsed);
      home.introBgOpacity = migrateBgOpacity(parsed, 'intro');
      home.intro2BgOpacity = migrateBgOpacity(parsed, 'intro2');
      home.closingBgOpacity = migrateBgOpacity(parsed, 'closing');
      home.closing2BgOpacity = migrateBgOpacity(parsed, 'closing2');
      if (Object.prototype.hasOwnProperty.call(parsed, 'hasIntro')) {
        home.hasIntro = !!parsed.hasIntro;
      } else {
        home.hasIntro = true;
      }
      home.hasIntro2 = !!home.hasIntro2;
      home.hasClosing2 = !!home.hasClosing2;
      home.header = buildHomeHeader(parsed);
      syncTitleFromHeader(home);
      stripLegacyHeaderFields(home);
      if (!Object.prototype.hasOwnProperty.call(parsed, 'cardsLayoutMode') && parsed.categoriesEnabled) {
        home.cardsLayoutMode = 'categories';
      }
      home.categoriesEnabled = !!home.categoriesEnabled;
      home.categories = Array.isArray(home.categories) ? home.categories : [];
      home.cardsFreeHeight = clampCardsFreeHeight(home.cardsFreeHeight);
      home.cardsFreeSize = clampCardFreeWidth(home.cardsFreeSize);
      home.cardPositions = home.cardPositions && typeof home.cardPositions === 'object'
        ? home.cardPositions
        : {};
      home.floatMenu = normalizeFloatMenu(home.floatMenu, home);
      home = ensureCardsSections(home);
    } catch {
      home = Object.assign({}, DEFAULT_HOME);
      home.header = normalizeHeader(DEFAULT_HOME.header, DEFAULT_HOME.title);
      home.floatMenu = normalizeFloatMenu(home.floatMenu, home);
      home = ensureCardsSections(home);
    }
  }
  home = ensureCardsSections(home);
  return home;
}

function migrateBgOpacity(parsed, kind) {
  const opacityKey = kind + 'BgOpacity';
  const hasBgKey = kind === 'title' ? 'titleHasBg' : kind + 'HasBg';
  const noBgKey = kind === 'title' ? 'titleNoBg' : kind + 'NoBg';
  const fallback = defaultBgOpacityForKind(kind);

  if (Object.prototype.hasOwnProperty.call(parsed, opacityKey)) {
    return clampBgOpacity(parsed[opacityKey], fallback);
  }
  if (Object.prototype.hasOwnProperty.call(parsed, hasBgKey)) {
    return parsed[hasBgKey] ? 100 : 0;
  }
  if (Object.prototype.hasOwnProperty.call(parsed, noBgKey)) {
    return parsed[noBgKey] ? 0 : 100;
  }
  return fallback;
}

function defaultBgOpacityForKind(kind) {
  return kind === 'title' ? DEFAULT_HOME.header.bgOpacity : 100;
}

function clampBgOpacity(value, fallback) {
  if (fallback == null) fallback = 100;
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
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

function homeHasIntro(home) {
  return !!(home && home.hasIntro);
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
  const introRestore = document.getElementById('homeIntroRestore');
  const hasIntro = homeHasIntro(home);

  [intro, intro2, closing, closing2].forEach(function (el) {
    if (!el) return;
    el.classList.remove('is-removing');
    el.style.removeProperty('opacity');
  });

  if (intro) intro.hidden = !hasIntro;
  if (intro2) intro2.hidden = !home.hasIntro2;
  if (closing2) closing2.hidden = !home.hasClosing2;
  if (introRestore) introRestore.hidden = !editMode || hasIntro || IS_USER_MODE;

  document.querySelectorAll('[data-dup-home]').forEach(function (btn) {
    const kind = btn.dataset.dupHome;
    const blocked = (kind === 'intro' && (!hasIntro || home.hasIntro2)) || (kind === 'closing' && home.hasClosing2);
    btn.hidden = !editMode || blocked;
  });

  document.querySelectorAll('[data-delete-home]').forEach(function (btn) {
    const kind = btn.dataset.deleteHome;
    const allowed =
      (kind === 'intro' && hasIntro) ||
      (kind === 'intro2' && home.hasIntro2) ||
      (kind === 'closing2' && home.hasClosing2);
    btn.hidden = !editMode || !allowed;
  });

  document.querySelectorAll('[data-edit-home]').forEach(function (btn) {
    const section = btn.dataset.editHome;
    if (section === 'intro') {
      btn.hidden = !editMode || !hasIntro;
    } else if (section === 'intro2') {
      btn.hidden = !editMode || !home.hasIntro2;
    } else if (section === 'closing2') {
      btn.hidden = !editMode || !home.hasClosing2;
    } else if (section === 'floatmenu') {
      btn.hidden = !editMode || !normalizeFloatMenu(home.floatMenu, home).enabled;
    } else {
      btn.hidden = !editMode;
    }
  });
}

async function hideHomeIntro() {
  if (!confirm('להסתיר את כותרת המשנה והפתיח?\nאפשר להחזיר אותם אחר כך ממצב עריכה.')) return;

  if (editingHomeSection === 'intro') {
    closeHomeEditor();
  }

  const sectionEl = getSectionRootEl('intro');
  if (sectionEl) {
    await animateElementOut(sectionEl);
    sectionEl.classList.remove('is-removing');
    sectionEl.style.removeProperty('opacity');
  }

  const home = loadHome();
  home.hasIntro = false;
  if (!saveHome(home)) {
    alert('שגיאה בשמירה.');
    return;
  }
  await renderHome();
}

async function restoreHomeIntro() {
  const home = loadHome();
  home.hasIntro = true;
  if (!saveHome(home)) {
    alert('אין מספיק מקום לשמירה.');
    return;
  }
  await renderHome();
}

async function duplicateHomeSection(kind) {
  if (kind !== 'intro' && kind !== 'closing') return;

  const home = loadHome();
  if (kind === 'intro' && !homeHasIntro(home)) return;
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
const videoMemoryStore = Object.create(null);
let videoDbProbe = null; /* null=unknown, true/false */

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
  const selectIds = ['siteFont'];
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
  if (!el) return kind === 'header' ? 400 : 280;
  const prop = kind === 'header' ? '--header-height' : '--section-media-height';
  const raw = getComputedStyle(el).getPropertyValue(prop).trim();
  const num = parseInt(raw, 10);
  return Number.isFinite(num) ? num : (el.getBoundingClientRect().height || (kind === 'header' ? 400 : 280));
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
        const minH = kind === 'header' ? 220 : 120;
        const next = Math.min(kind === 'header' ? 720 : 560, Math.max(minH, Math.round(startH + (ev.clientY - startY))));
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
  if (activeInlineEdit && activeInlineEdit.el === el) return;
  if (editMode && document.activeElement === el) return;
  let value = text == null ? '' : String(text);
  const plain = isRichTextValue(value) ? plainTextFromHtml(value) : value;
  if (maxLen && plain.length > maxLen) value = isRichTextValue(value) ? plain.slice(0, maxLen) : plain.slice(0, maxLen);
  if (editMode && !plain.trim()) {
    el.textContent = el.getAttribute('data-inline-placeholder') || '';
    el.classList.add('is-inline-placeholder');
    el.hidden = false;
    return;
  }
  el.classList.remove('is-inline-placeholder');
  if (isRichTextValue(value)) el.innerHTML = sanitizeInlineHtml(value);
  else el.textContent = value;
  el.hidden = !plain.trim();
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

function isSafeFloatMenuUrl(url) {
  const value = String(url || '').trim();
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower.indexOf('javascript:') !== 0 && lower.indexOf('data:') !== 0;
}

function getFloatMenuSectionMeta(id) {
  return FLOAT_MENU_SECTIONS.find(function (row) { return row.id === id; }) || null;
}

function getFloatMenuSectionEl(sectionId) {
  const meta = getFloatMenuSectionMeta(sectionId);
  return meta ? document.getElementById(meta.el) : null;
}

function isFloatMenuSectionAvailable(sectionId, home) {
  home = home || loadHome();
  const el = getFloatMenuSectionEl(sectionId);
  if (!el || el.hidden) return false;
  if (sectionId === 'intro' && !homeHasIntro(home)) return false;
  if (sectionId === 'intro2' && !home.hasIntro2) return false;
  if (sectionId === 'closing2' && !home.hasClosing2) return false;
  return true;
}

function normalizeFloatMenuItem(item) {
  item = item && typeof item === 'object' ? item : {};
  const type = item.type === 'url' ? 'url' : 'section';
  let target = String(item.target == null ? '' : item.target).trim();
  if (target === 'cards') target = 'cardsTop';
  if (type === 'section' && !getFloatMenuSectionMeta(target)) target = 'header';
  return {
    id: String(item.id || createFloatMenuId('fm')),
    label: String(item.label || '').trim().slice(0, 40),
    type: type,
    target: target.slice(0, 300),
  };
}

function defaultFloatMenuSectionItems(home) {
  return FLOAT_MENU_SECTIONS.filter(function (row) {
    return isFloatMenuSectionAvailable(row.id, home);
  }).map(function (row) {
    return normalizeFloatMenuItem({
      label: row.label,
      type: 'section',
      target: row.id,
    });
  });
}

function normalizeFloatMenu(raw, home) {
  const defaults = DEFAULT_HOME.floatMenu;
  const src = raw && typeof raw === 'object' ? raw : defaults;
  let items = Array.isArray(src.items)
    ? src.items.map(normalizeFloatMenuItem).filter(function (item) { return item.label; })
    : [];
  const tags = Array.isArray(src.tags)
    ? src.tags.map(normalizeFloatMenuItem).filter(function (item) { return item.label; })
    : [];
  const enabled = Object.prototype.hasOwnProperty.call(src, 'enabled') ? !!src.enabled : !!defaults.enabled;
  if (enabled && !items.length) {
    items = defaultFloatMenuSectionItems(home);
  }
  return {
    enabled: enabled,
    side: src.side === 'end' ? 'end' : 'start',
    title: String(src.title == null ? defaults.title : src.title).trim().slice(0, 40),
    items: items,
    tags: tags,
  };
}

function visibleFloatMenuItems(items, home) {
  return (items || []).filter(function (item) {
    if (item.type === 'url') return isSafeFloatMenuUrl(item.target);
    return isFloatMenuSectionAvailable(item.target, home);
  });
}

function floatMenuItemButtonHtml(item, extraClass) {
  const label = renderStoredInlineText(item.label || '');
  const idAttr = ' data-fm-id="' + escapeHtml(item.id) + '"';
  const inlineAttr = editMode
    ? ' data-inline-edit="floatMenu.item" data-inline-placeholder="תווית"' +
      ' contenteditable="true" spellcheck="false" role="textbox" tabindex="0"'
    : '';
  if (item.type === 'url' && !editMode) {
    const href = escapeHtml(item.target || '#');
    return (
      '<a class="' + extraClass + '" href="' + href + '" target="_blank" rel="noopener noreferrer"' +
        idAttr + '>' + label + '</a>'
    );
  }
  return (
    '<button type="button" class="' + extraClass + '"' + idAttr + inlineAttr +
      ' data-fm-type="' + escapeHtml(item.type) + '"' +
      ' data-fm-target="' + escapeHtml(item.target) + '">' +
      label +
    '</button>'
  );
}

function applyFloatMenuLayout(menu) {
  const enabled = !!(menu && menu.enabled);
  document.body.classList.toggle('has-float-menu', enabled);
  if (enabled) {
    document.body.setAttribute('data-float-menu-side', menu.side === 'end' ? 'end' : 'start');
  } else {
    document.body.removeAttribute('data-float-menu-side');
  }
  const check = document.getElementById('floatMenuEnabled');
  if (check) check.checked = enabled;
}

function isFloatMenuCompactViewport() {
  return window.matchMedia('(max-width: 900px)').matches;
}

function syncSiteToolbarHeight() {
  const shell = document.getElementById('siteToolbar');
  const height = shell && !shell.hidden ? Math.ceil(shell.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty('--site-toolbar-height', Math.max(0, height) + 'px');
}

function syncFloatMenuAnchor() {
  const aside = document.getElementById('floatMenu');
  if (!aside) return;
  if (aside.hidden || isFloatMenuCompactViewport()) {
    aside.style.top = '';
    aside.style.maxHeight = '';
    document.body.style.removeProperty('--float-menu-sticky-top');
    return;
  }

  const toolbar = document.getElementById('siteToolbar');
  let minTop = 16;
  if (!IS_USER_MODE && toolbar && !toolbar.hidden) {
    minTop = Math.max(minTop, Math.round(toolbar.getBoundingClientRect().height) + 8);
  }

  const maxMenuHeight = Math.max(120, window.innerHeight - minTop - 16);
  aside.style.maxHeight = maxMenuHeight + 'px';

  const menuHeight = Math.min(aside.scrollHeight, maxMenuHeight);
  const centeredTop = Math.max(minTop, Math.round((window.innerHeight - menuHeight) / 2));
  document.body.style.setProperty('--float-menu-sticky-top', centeredTop + 'px');
  aside.style.top = '';
}

function syncFloatMenuFromViewport() {
  syncSiteToolbarHeight();
  syncFloatMenuAnchor();
  syncFloatMenuActiveFromScroll();
}

function scrollToFloatMenuItem(item) {
  if (!item) return;
  if (item.type === 'url') {
    if (isSafeFloatMenuUrl(item.target)) {
      window.open(item.target, '_blank', 'noopener,noreferrer');
    }
    return;
  }
  const el = getFloatMenuSectionEl(item.target);
  if (!el || el.hidden) return;
  const toolbar = document.getElementById('siteToolbar');
  const toolbarH = (!IS_USER_MODE && toolbar && !toolbar.hidden) ? toolbar.getBoundingClientRect().height : 0;
  const top = el.getBoundingClientRect().top + window.scrollY - Math.max(12, toolbarH + 8);
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

function setFloatMenuActiveId(id) {
  floatMenuActiveId = id || '';
  document.querySelectorAll('#floatMenu [data-fm-id]').forEach(function (el) {
    el.classList.toggle('is-active', el.getAttribute('data-fm-id') === floatMenuActiveId);
  });
}

function syncFloatMenuActiveFromScroll() {
  const aside = document.getElementById('floatMenu');
  if (!aside || aside.hidden) return;
  const home = loadHome();
  const menu = normalizeFloatMenu(home.floatMenu, home);
  const items = visibleFloatMenuItems(menu.items, home);
  if (!items.length) {
    setFloatMenuActiveId('');
    return;
  }

  const marker = window.scrollY + Math.max(80, window.innerHeight * 0.22);
  let current = items[0];
  items.forEach(function (item) {
    if (item.type !== 'section') return;
    const el = getFloatMenuSectionEl(item.target);
    if (!el || el.hidden) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (top <= marker) current = item;
  });
  setFloatMenuActiveId(current && current.id);
}

function bindFloatMenuInteractions() {
  const aside = document.getElementById('floatMenu');
  if (!aside || aside.dataset.bound === '1') return;
  aside.dataset.bound = '1';

  aside.addEventListener('click', function (e) {
    if (editMode) return;
    const btn = e.target.closest('[data-fm-id]');
    if (!btn || !aside.contains(btn)) return;
    if (btn.tagName === 'A') return;
    e.preventDefault();
    const home = loadHome();
    const menu = normalizeFloatMenu(home.floatMenu, home);
    const all = [].concat(menu.items || [], menu.tags || []);
    const item = all.find(function (row) { return row.id === btn.getAttribute('data-fm-id'); });
    if (!item) return;
    setFloatMenuActiveId(item.id);
    scrollToFloatMenuItem(item);
  });

  if (!floatMenuSpyBound) {
    floatMenuSpyBound = true;
    window.addEventListener('scroll', syncFloatMenuFromViewport, { passive: true });
    window.addEventListener('resize', syncFloatMenuFromViewport);
    if (typeof ResizeObserver === 'function') {
      const toolbar = document.getElementById('siteToolbar');
      if (toolbar) {
        const toolbarObserver = new ResizeObserver(function () {
          syncSiteToolbarHeight();
          syncFloatMenuAnchor();
        });
        toolbarObserver.observe(toolbar);
      }
      if (aside) {
        const menuObserver = new ResizeObserver(function () { syncFloatMenuAnchor(); });
        menuObserver.observe(aside);
      }
    }
  }
}

function renderFloatMenu(home) {
  if (isInlineEditPrefixActive('floatMenu.')) return;
  home = home || loadHome();
  const menu = normalizeFloatMenu(home.floatMenu, home);
  const aside = document.getElementById('floatMenu');
  const titleEl = document.getElementById('floatMenuTitle');
  const navEl = document.getElementById('floatMenuNav');
  const tagsEl = document.getElementById('floatMenuTags');
  const editBtn = aside ? aside.querySelector('.float-menu-edit') : null;

  applyFloatMenuLayout(menu);

  if (!aside || !navEl || !tagsEl) return;

  aside.hidden = !menu.enabled;
  if (editBtn) editBtn.hidden = !editMode || !menu.enabled || IS_USER_MODE;

  if (!menu.enabled) {
    navEl.innerHTML = '';
    tagsEl.innerHTML = '';
    tagsEl.hidden = true;
    syncFloatMenuAnchor();
    return;
  }

  if (titleEl) {
    const titlePlain = isRichTextValue(menu.title) ? plainTextFromHtml(menu.title) : String(menu.title || '');
    if (editMode && !titlePlain.trim()) {
      titleEl.textContent = titleEl.getAttribute('data-inline-placeholder') || 'כותרת תפריט';
      titleEl.classList.add('is-inline-placeholder');
      titleEl.hidden = false;
    } else {
      titleEl.classList.remove('is-inline-placeholder');
      if (isRichTextValue(menu.title)) titleEl.innerHTML = sanitizeInlineHtml(menu.title);
      else titleEl.textContent = menu.title || '';
      titleEl.hidden = !titlePlain.trim();
    }
  }

  const items = visibleFloatMenuItems(menu.items, home);
  navEl.innerHTML = items.map(function (item) {
    return floatMenuItemButtonHtml(item, 'float-menu-link');
  }).join('');

  const tags = visibleFloatMenuItems(menu.tags, home);
  tagsEl.innerHTML = tags.map(function (item) {
    return floatMenuItemButtonHtml(item, 'float-menu-tag');
  }).join('');
  tagsEl.hidden = !tags.length;

  bindFloatMenuInteractions();
  requestAnimationFrame(syncFloatMenuFromViewport);
}

function applySiteTheme(home) {
  home = ensureCardsSections(home || loadHome());
  const bgColor = home.siteBgColor || DEFAULT_HOME.siteBgColor;
  const bgImage = home.siteBgImage || '';
  const secondary = home.siteSecondaryColor || DEFAULT_HOME.siteSecondaryColor;
  const font = home.siteFont || DEFAULT_HOME.siteFont;
  const sectionId = getActiveCardsSectionId();
  const cfg = getCardsSectionConfig(home, sectionId);
  const perRow = Math.min(6, Math.max(2, Number(cfg.cardsPerRow) || DEFAULT_HOME.cardsPerRow));
  const gap = Math.min(48, Math.max(4, Number(cfg.cardsGap) || DEFAULT_HOME.cardsGap));

  document.body.style.setProperty('--site-bg-color', colorToCss(bgColor));
  document.body.style.setProperty(
    '--site-bg-image',
    bgImage ? 'url(' + JSON.stringify(bgImage) + ')' : 'none'
  );
  document.body.style.setProperty('--site-secondary', colorToCss(secondary));
  document.body.style.setProperty('--site-font', font);
  document.body.classList.remove('cards-colored');

  const fontSelect = document.getElementById('siteFont');
  const clearBtn = document.getElementById('siteBgClear');
  const perRowInput = document.getElementById('cardsPerRow');
  const gapInput = document.getElementById('cardsGap');
  const perRowValue = document.getElementById('cardsPerRowValue');
  const gapValue = document.getElementById('cardsGapValue');

  setHslaFieldValue('siteSecondaryColor', secondary);
  setHslaFieldValue('siteBgColor', bgColor);
  if (fontSelect) setFontSelectValue(fontSelect, font);
  if (clearBtn) clearBtn.hidden = !bgImage;
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

  const title = getHeaderTitleText(home).slice(0, 80);
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
  const kinds = ['closing'];
  if (homeHasIntro(home)) kinds.unshift('intro');
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

  // Clear media on hidden sections
  if (!homeHasIntro(home)) {
    clearSectionMedia(document.getElementById('homeIntroBg'));
  }
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

  if (homeHasIntro(home)) {
    setSectionBgOpacity(document.getElementById('homeIntro'), sectionDisplayOpacity('intro'));
  }
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
  renderFloatMenu(home);
  syncInlineEditableHosts();
  document.title = title.trim() || 'פורטל תוכן';
}

function renderAccentedText(text, accents, accentColor) {
  const raw = String(text || '');
  if (!raw) return '';
  const phrases = parseAccentList(accents).sort(function (a, b) { return b.length - a.length; });
  if (!phrases.length) return escapeHtml(raw);

  const ranges = [];
  phrases.forEach(function (phrase) {
    let from = 0;
    while (from < raw.length) {
      const idx = raw.indexOf(phrase, from);
      if (idx === -1) break;
      const end = idx + phrase.length;
      const overlaps = ranges.some(function (range) {
        return idx < range.end && end > range.start;
      });
      if (!overlaps) ranges.push({ start: idx, end: end });
      from = idx + phrase.length;
    }
  });
  ranges.sort(function (a, b) { return a.start - b.start; });

  let html = '';
  let cursor = 0;
  const accentCss = colorToCss(accentColor || HEADER_ACCENT);
  ranges.forEach(function (range) {
    if (cursor < range.start) html += escapeHtml(raw.slice(cursor, range.start));
    html += '<span class="home-header-accent" style="color:' + accentCss + ';">' +
      escapeHtml(raw.slice(range.start, range.end)) + '</span>';
    cursor = range.end;
  });
  if (cursor < raw.length) html += escapeHtml(raw.slice(cursor));
  return html;
}

function headerActionHref(href) {
  const value = String(href || '').trim();
  if (!value) return '';
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(value)) return value;
  return 'https://' + value;
}

function isInlineEditPrefixActive(prefix) {
  if (activeInlineEdit && String(activeInlineEdit.key || '').indexOf(prefix) === 0) return true;
  const ae = document.activeElement;
  if (!ae || !ae.closest) return false;
  const host = ae.closest('[data-inline-edit]');
  if (!host) return false;
  return String(host.getAttribute('data-inline-edit') || '').indexOf(prefix) === 0;
}

function findInlineEditHost(target) {
  if (!target || !target.closest) return null;
  const direct = target.closest('[data-inline-edit]');
  if (direct) return direct;
  const link = target.closest('.home-header-link');
  if (link) return link.querySelector('[data-inline-edit]');
  return null;
}

function syncInlineEditableHost(el, spec) {
  if (!el) return;
  spec = spec || getInlineEditSpec(el);
  if (editMode && !IS_USER_MODE && spec) {
    el.setAttribute('contenteditable', spec.richText ? 'true' : 'plaintext-only');
    if (el.getAttribute('contenteditable') !== 'true' && el.getAttribute('contenteditable') !== 'plaintext-only') {
      el.setAttribute('contenteditable', 'true');
    }
    el.setAttribute('spellcheck', 'false');
    el.setAttribute('role', 'textbox');
    el.setAttribute('tabindex', '0');
    if (!el.getAttribute('aria-label')) {
      el.setAttribute('aria-label', el.getAttribute('data-inline-placeholder') || 'עריכת טקסט');
    }
  } else {
    el.removeAttribute('contenteditable');
    el.removeAttribute('role');
    if (el.getAttribute('tabindex') === '0') el.removeAttribute('tabindex');
  }
}

function syncInlineEditableHosts() {
  document.querySelectorAll('[data-inline-edit]').forEach(function (el) {
    syncInlineEditableHost(el);
  });
}

function inlineEditAttr(key, placeholder) {
  if (!editMode) return '';
  return ' data-inline-edit="' + escapeHtml(key) + '"' +
    (placeholder ? ' data-inline-placeholder="' + escapeHtml(placeholder) + '"' : '') +
    ' contenteditable="true" spellcheck="false" role="textbox" tabindex="0"';
}

function cardInlineEditAttrs(cardId, key, placeholder) {
  if (!editMode || IS_USER_MODE || !cardId) return '';
  return (
    ' data-inline-edit="' + escapeHtml(key) + '"' +
    ' data-card-id="' + escapeHtml(cardId) + '"' +
    (placeholder ? ' data-inline-placeholder="' + escapeHtml(placeholder) + '"' : '') +
    ' contenteditable="true" spellcheck="false" role="textbox" tabindex="0"'
  );
}

function buildCardEditableTitle(card, titleRaw) {
  if (!editMode || IS_USER_MODE) {
    return '<span class="card-title">' + escapeHtml(titleRaw) + '</span>';
  }
  return (
    '<span class="card-title' + (!titleRaw ? ' is-inline-placeholder' : '') + '"' +
      cardInlineEditAttrs(card.id, 'card.title', 'כותרת') +
      ' aria-label="עריכת כותרת">' +
      escapeHtml(titleRaw || 'כותרת') +
    '</span>'
  );
}

function buildCardEditableNotes(card, desc) {
  const text = String(desc || '').trim();
  if (!editMode || IS_USER_MODE) {
    return '<p class="card-notes">' + formatNotesHtml(desc) + '</p>';
  }
  return (
    '<p class="card-notes' + (!text ? ' is-inline-placeholder' : '') + '"' +
      cardInlineEditAttrs(card.id, 'card.notes', 'תיאור קצר') +
      ' aria-label="עריכת תיאור">' +
      escapeHtml(text || 'תיאור קצר') +
    '</p>'
  );
}

function getCardNotesText(card) {
  if (!card) return '';
  return String(card.notes || card.description || '').trim();
}

function refreshCardsAfterInlineEdit() {
  renderCards(loadCards());
  syncInlineEditableHosts();
}

function renderHomeHeader(home) {
  if (isInlineEditPrefixActive('header.')) return;
  const section = document.getElementById('homeHeader');
  const canvas = document.getElementById('homeHeaderCanvas');
  const itemsEl = document.getElementById('homeHeaderItems');
  const bgEl = document.getElementById('homeHeaderBg');
  if (!section || !canvas || !itemsEl || !bgEl) return;

  const header = normalizeHeader(home.header, home.title);
  applySectionMediaHeight('header', header.height);
  setSectionBackground(bgEl, header.bgImage || '');
  setSectionBgOpacity(section, header.bgOpacity);

  const kicker = String(header.kicker || '').trim();
  const title = String(header.title || '').trim();
  const body = String(header.body || '').trim();
  const buttonText = String(header.buttonText || '').trim();
  const linkText = String(header.linkText || '').trim();
  const buttonHref = headerActionHref(header.buttonHref);
  const linkHref = headerActionHref(header.linkHref);

  const kickerHtml = (kicker || editMode)
    ? '<p class="home-header-kicker' + (!kicker && editMode ? ' is-inline-placeholder' : '') + '"' +
        inlineEditAttr('header.kicker', 'תווית עליונה') +
        ' style="font-size:' + header.kickerSize + 'px;color:' + colorToCss(header.kickerColor) + ';">' +
        (kicker ? renderStoredInlineText(kicker) : escapeHtml('תווית עליונה')) + '</p>'
    : '';
  const titleHtml = (title || editMode)
    ? '<h1 class="home-header-title' + (!title && editMode ? ' is-inline-placeholder' : '') + '"' +
        inlineEditAttr('header.title', 'כותרת') +
        ' style="font-size:' + header.titleSize + 'px;color:' + colorToCss(header.titleColor) + ';">' +
        (title ? renderStoredInlineText(title) : escapeHtml('כותרת')) + '</h1>'
    : '';
  const bodyHtml = (body || editMode)
    ? '<p class="home-header-body' + (!body && editMode ? ' is-inline-placeholder' : '') + '"' +
        inlineEditAttr('header.body', 'פסקת טקסט') +
        ' style="font-size:' + header.bodySize + 'px;color:' + colorToCss(header.bodyColor) + ';">' +
        (body
          ? (isRichTextValue(body)
              ? sanitizeInlineHtml(body)
              : renderAccentedText(body, header.bodyAccents, header.bodyAccentColor))
          : escapeHtml('פסקת טקסט')) +
      '</p>'
    : '';

  const buttonHtml = (buttonText || editMode)
    ? (buttonHref && !editMode
        ? '<a class="home-header-btn" href="' + escapeHtml(buttonHref) + '" target="_blank" rel="noopener noreferrer"'
        : '<span class="home-header-btn"') +
      inlineEditAttr('header.buttonText', 'כפתור') +
      ' style="background:' + colorToCss(header.buttonBg) + ';color:' + colorToCss(header.buttonColor) +
        ';border-radius:' + header.buttonRadius + 'px;">' +
      escapeHtml(buttonText || 'כפתור') +
      (buttonHref && !editMode ? '</a>' : '</span>')
    : '';
  const linkHtml = (linkText || editMode)
    ? (linkHref && !editMode
        ? '<a class="home-header-link" href="' + escapeHtml(linkHref) + '" target="_blank" rel="noopener noreferrer"'
        : '<span class="home-header-link"') +
      ' style="color:' + colorToCss(header.linkColor) + ';">' +
      '<span' + inlineEditAttr('header.linkText', 'קישור') + '>' +
        escapeHtml(linkText || 'קישור') +
      '</span>' +
      '<span class="home-header-link-arrow" aria-hidden="true">←</span>' +
      (linkHref && !editMode ? '</a>' : '</span>')
    : '';
  const actionsHtml = (buttonHtml || linkHtml)
    ? '<div class="home-header-actions">' + buttonHtml + linkHtml + '</div>'
    : '';

  const artHtml = header.artSrc
    ? '<div class="home-header-art"><img class="home-header-art-img" src="' + header.artSrc + '" alt=""></div>'
    : '';

  itemsEl.innerHTML =
    '<div class="home-header-hero' + (header.artSrc ? '' : ' home-header-hero--no-art') + '"' +
      ' data-art-side="left"' +
      ' style="--header-art-width:' + header.artWidth + '%;">' +
      '<div class="home-header-copy">' + kickerHtml + titleHtml + bodyHtml + actionsHtml + '</div>' +
      artHtml +
    '</div>';
}

function getInlineEditSpec(el) {
  const key = el.getAttribute('data-inline-edit');
  if (!key) return null;

  if (key === 'floatMenu.item') {
    const id = el.getAttribute('data-fm-id');
    return {
      key: key,
      maxLen: 40,
      multiline: false,
      richText: true,
      placeholder: 'תווית',
      get: function (home) {
        const menu = normalizeFloatMenu(home.floatMenu, home);
        const all = [].concat(menu.items || [], menu.tags || []);
        const item = all.find(function (row) { return row.id === id; });
        return item ? String(item.label || '') : '';
      },
      set: function (home, value) {
        const menu = normalizeFloatMenu(home.floatMenu, home);
        [].concat(menu.items || [], menu.tags || []).forEach(function (item) {
          if (item.id === id) item.label = value.slice(0, 40);
        });
        home.floatMenu = menu;
      },
    };
  }

  if (key === 'card.title' || key === 'card.notes') {
    const cardId = el.getAttribute('data-card-id');
    const isNotes = key === 'card.notes';
    return {
      key: key,
      maxLen: isNotes ? 30 : 10,
      multiline: isNotes,
      richText: false,
      placeholder: isNotes ? 'תיאור קצר' : 'כותרת',
      get: function () {
        const card = loadCards().find(function (c) { return c.id === cardId; });
        if (!card) return '';
        return isNotes ? getCardNotesText(card) : String(card.title || '');
      },
      set: function (_home, value) {
        const cards = loadCards();
        const card = cards.find(function (c) { return c.id === cardId; });
        if (!card) return;
        if (isNotes) {
          const next = String(value || '').slice(0, 30);
          card.notes = next;
          card.description = next;
        } else {
          card.title = String(value || '').slice(0, 10);
        }
        saveCards(cards);
      },
    };
  }

  const headerFields = {
    'header.kicker': { field: 'kicker', maxLen: 80, richText: true },
    'header.title': { field: 'title', maxLen: 80, richText: true },
    'header.body': { field: 'body', maxLen: 400, multiline: true, richText: true },
    'header.buttonText': { field: 'buttonText', maxLen: 40 },
    'header.linkText': { field: 'linkText', maxLen: 40 },
  };
  if (headerFields[key]) {
    const spec = headerFields[key];
    return {
      key: key,
      maxLen: spec.maxLen,
      multiline: !!spec.multiline,
      richText: !!spec.richText,
      inputId: spec.input,
      get: function (home) {
        const header = normalizeHeader(home.header, home.title);
        return String(header[spec.field] || '');
      },
      set: function (home, value) {
        const next = Object.assign({}, normalizeHeader(home.header, home.title));
        next[spec.field] = spec.richText
          ? clampStoredInlineText(value, spec.maxLen)
          : String(value || '').slice(0, spec.maxLen);
        home.header = normalizeHeader(next, next.title);
        if (spec.field === 'title') syncTitleFromHeader(home);
        if (homeEditHeaderDraft) homeEditHeaderDraft[spec.field] = next[spec.field];
      },
    };
  }

  const homeFields = {
    subtitle: { maxLen: 10, input: 'homeFieldSubtitle', richText: true },
    introText: { maxLen: 2000, input: 'homeFieldIntro', multiline: true, richText: true },
    intro2Subtitle: { maxLen: 10, input: 'homeFieldSubtitle', richText: true },
    intro2Text: { maxLen: 2000, input: 'homeFieldIntro', multiline: true, richText: true },
    closingText: { maxLen: 2000, input: 'homeFieldClosing', multiline: true, richText: true },
    closing2Text: { maxLen: 2000, input: 'homeFieldClosing', multiline: true, richText: true },
    'floatMenu.title': { maxLen: 40, input: 'floatMenuTitleField', homeKey: 'floatMenu', richText: true },
  };
  const field = homeFields[key];
  if (!field) return null;

  if (key === 'floatMenu.title') {
    return {
      key: key,
      maxLen: 40,
      multiline: false,
      richText: true,
      inputId: 'floatMenuTitleField',
      get: function (home) {
        return String(normalizeFloatMenu(home.floatMenu, home).title || '');
      },
      set: function (home, value) {
        const menu = normalizeFloatMenu(home.floatMenu, home);
        menu.title = value.slice(0, 40);
        home.floatMenu = menu;
        if (homeEditFloatMenuDraft) homeEditFloatMenuDraft.title = menu.title;
      },
    };
  }

  return {
    key: key,
    maxLen: field.maxLen,
    multiline: !!field.multiline,
    richText: !!field.richText,
    inputId: field.input,
    get: function (home) {
      return home[key] == null ? '' : String(home[key]);
    },
    set: function (home, value) {
      home[key] = value.slice(0, field.maxLen);
    },
  };
}

function readInlineEditValue(el) {
  return String(el.innerText || el.textContent || '').replace(/\u00a0/g, ' ').replace(/\r\n/g, '\n');
}

function readInlineEditStoredValue(el, richText) {
  if (!richText) return readInlineEditValue(el).trim();
  const sanitized = sanitizeInlineHtml(el.innerHTML);
  const plain = plainTextFromHtml(sanitized).trim();
  if (!plain) return '';
  if (!isRichTextValue(sanitized)) return plain;
  return sanitized;
}

function finishInlineEditDom(el) {
  if (!el) return;
  const cardEl = el.closest ? el.closest('.card--editing') : null;
  el.classList.remove('is-inline-editing');
  savedInlineTextSelection = null;
  if (cardEl) {
    cardEl.classList.remove('is-inline-editing-card');
    if (editMode && !IS_USER_MODE && cardEl.hasAttribute('data-id')) {
      cardEl.setAttribute('draggable', 'true');
    }
  }
  if (!editMode || IS_USER_MODE) {
    el.removeAttribute('contenteditable');
    el.removeAttribute('role');
    if (el.getAttribute('tabindex') === '0') el.removeAttribute('tabindex');
  }
}

function syncInlinePlaceholder(el, spec, value) {
  if (!el || !spec) return;
  const placeholder = el.getAttribute('data-inline-placeholder') || '';
  const plain = spec.richText && isRichTextValue(value)
    ? plainTextFromHtml(value).trim()
    : String(value || '').trim();
  if (!plain) {
    el.textContent = placeholder;
    el.classList.add('is-inline-placeholder');
  } else {
    el.classList.remove('is-inline-placeholder');
  }
}

function cancelInlineEdit() {
  if (!activeInlineEdit) return;
  const spec = activeInlineEdit;
  finishInlineEditDom(spec.el);
  activeInlineEdit = null;
  syncInlineTextSizeControl();
  const home = loadHome();
  if (String(spec.key || '').indexOf('header.') === 0) renderHomeHeader(home);
  else if (String(spec.key || '').indexOf('floatMenu.') === 0) renderFloatMenu(home);
  else if (String(spec.key || '').indexOf('card.') === 0) refreshCardsAfterInlineEdit();
  else renderHome();
  syncInlineEditableHosts();
}

function commitInlineEdit(options) {
  options = options || {};
  const silent = !!options.silent;
  if (!activeInlineEdit) return;
  const el = activeInlineEdit.el;
  const spec = getInlineEditSpec(el);
  if (!spec) {
    finishInlineEditDom(el);
    activeInlineEdit = null;
    syncInlineTextSizeControl();
    return;
  }
  let value = readInlineEditStoredValue(el, spec.richText);
  let plain = spec.richText && isRichTextValue(value) ? plainTextFromHtml(value).trim() : value.trim();
  const placeholder = el.getAttribute('data-inline-placeholder') || '';
  const stored = spec.get(loadHome());
  const storedPlain = spec.richText && isRichTextValue(stored)
    ? plainTextFromHtml(stored).trim()
    : String(stored || '').trim();
  if (plain === placeholder && storedPlain === '') {
    value = '';
    plain = '';
  }
  if (spec.maxLen && plain.length > spec.maxLen) {
    value = spec.richText && isRichTextValue(value) ? plain.slice(0, spec.maxLen) : value.slice(0, spec.maxLen);
  }

  if (String(spec.key || '').indexOf('card.') === 0) {
    value = String(value || '').slice(0, spec.maxLen);
    plain = value.trim();
  }

  const home = loadHome();
  spec.set(home, value);
  saveHome(home);

  if (spec.inputId && editingHomeSection) {
    const input = document.getElementById(spec.inputId);
    if (input) input.value = isRichTextValue(value) ? plainTextFromHtml(value) : value;
  }

  finishInlineEditDom(el);
  activeInlineEdit = null;
  syncInlineTextSizeControl();

  if (silent) {
    syncInlinePlaceholder(el, spec, value);
    syncInlineEditableHost(el, spec);
    return;
  }

  if (String(spec.key || '').indexOf('header.') === 0) {
    renderHomeHeader(home);
    document.title = getHeaderTitleText(home).trim() || 'פורטל תוכן';
  } else if (String(spec.key || '').indexOf('floatMenu.') === 0) {
    renderFloatMenu(home);
  } else if (String(spec.key || '').indexOf('card.') === 0) {
    refreshCardsAfterInlineEdit();
  } else {
    renderHome();
  }
  syncInlineEditableHosts();
}

function startInlineEdit(el) {
  if (!editMode || IS_USER_MODE || !el || !document.body.contains(el)) return;
  const spec = getInlineEditSpec(el);
  if (!spec) return;
  if (activeInlineEdit && activeInlineEdit.el === el) return;
  if (activeInlineEdit) commitInlineEdit({ silent: true });

  if (el.classList.contains('is-inline-placeholder')) {
    el.classList.remove('is-inline-placeholder');
    el.textContent = '';
  }
  el.classList.add('is-inline-editing');
  el.hidden = false;
  syncInlineEditableHost(el, spec);
  preservePlainInlineEditValue(el, spec);
  const cardEl = el.closest ? el.closest('.card--editing') : null;
  if (cardEl) {
    cardEl.classList.add('is-inline-editing-card');
    cardEl.setAttribute('draggable', 'false');
  }
  activeInlineEdit = {
    el: el,
    key: spec.key,
    original: spec.get(loadHome()),
    lastGoodHtml: spec.richText ? el.innerHTML : '',
  };
  syncInlineTextSizeControl();
}

function bindInlineEditing() {
  if (IS_USER_MODE || document.body.dataset.inlineEditBound === '1') return;
  document.body.dataset.inlineEditBound = '1';

  document.addEventListener('pointerdown', function (e) {
    if (!editMode || IS_USER_MODE) return;
    if (e.target.closest && e.target.closest('.site-toolbar, .hsla-popover')) return;
    const next = findInlineEditHost(e.target);
    if (next) {
      if (next.classList.contains('is-inline-placeholder')) {
        next.classList.remove('is-inline-placeholder');
        next.textContent = '';
      }
      if (activeInlineEdit && activeInlineEdit.el !== next) {
        commitInlineEdit({ silent: true });
      }
      e.stopPropagation();
      startInlineEdit(next);
      return;
    }
    if (e.target.closest && e.target.closest('.home-edit-modal, .wizard, .settings-menu, .detail-overlay')) {
      if (activeInlineEdit) commitInlineEdit({ silent: true });
      return;
    }
    if (activeInlineEdit) commitInlineEdit();
  }, true);

  document.addEventListener('focusin', function (e) {
    if (!editMode || IS_USER_MODE) return;
    const el = findInlineEditHost(e.target);
    if (!el) return;
    startInlineEdit(el);
  });

  document.addEventListener('keydown', function (e) {
    if (!activeInlineEdit) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancelInlineEdit();
      return;
    }
    const spec = getInlineEditSpec(activeInlineEdit.el);
    if (!spec) return;
    if (!spec.richText && (e.ctrlKey || e.metaKey) && /[biu]/i.test(e.key)) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      if (spec.multiline) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const el = activeInlineEdit.el;
          commitInlineEdit();
          if (el) el.blur();
        }
        return;
      }
      e.preventDefault();
      const el = activeInlineEdit.el;
      commitInlineEdit();
      if (el) el.blur();
    }
  }, true);

  document.addEventListener('paste', function (e) {
    if (!activeInlineEdit || !activeInlineEdit.el.contains(e.target)) return;
    const spec = getInlineEditSpec(activeInlineEdit.el);
    if (!spec) return;
    e.preventDefault();
    let text = '';
    try {
      text = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
    } catch (_) {}
    if (!spec.multiline) text = text.replace(/\s+/g, ' ').trim();
    if (spec.maxLen) {
      const current = spec.richText
        ? plainTextFromHtml(activeInlineEdit.el.innerHTML)
        : readInlineEditValue(activeInlineEdit.el);
      const selected = window.getSelection() ? String(window.getSelection()) : '';
      const room = spec.maxLen - Math.max(0, current.length - selected.length);
      if (room <= 0) return;
      text = text.slice(0, room);
    }
    if (!text) return;
    try {
      if (!document.execCommand('insertText', false, text)) {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch (_) {}
  }, true);

  document.addEventListener('selectionchange', function () {
    saveInlineTextSelection();
  });

  document.addEventListener('input', function () {
    if (!activeInlineEdit) return;
    const spec = getInlineEditSpec(activeInlineEdit.el);
    if (!spec || !spec.maxLen) return;
    if (!supportsInlineToolbarTools(spec)) {
      preservePlainInlineEditValue(activeInlineEdit.el, spec);
    }
    const raw = spec.richText
      ? plainTextFromHtml(activeInlineEdit.el.innerHTML)
      : readInlineEditValue(activeInlineEdit.el);
    if (raw.length > spec.maxLen) {
      if (spec.richText && activeInlineEdit.lastGoodHtml != null) {
        activeInlineEdit.el.innerHTML = activeInlineEdit.lastGoodHtml;
      } else {
        activeInlineEdit.el.textContent = raw.slice(0, spec.maxLen);
      }
      try {
        const range = document.createRange();
        range.selectNodeContents(activeInlineEdit.el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (_) {}
      return;
    }
    if (spec.richText) activeInlineEdit.lastGoodHtml = activeInlineEdit.el.innerHTML;
  });
}

function readHeaderField(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function _removedHeaderPreset(header, preset) {
  const logos = header.items ? header.items.filter(function (item) { return item.type === 'logo'; }) : [];
  const title = null;
  const subtitle = header.items && header.items.find(function (item) { return item.type === 'subtitle'; });
  const badge = header.items && header.items.find(function (item) { return item.type === 'badge'; });

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
let homeEditFloatMenuDraft = null;
let homeEditSnapshot = null;
let homeEditCommitted = false;
let homeEditPreviewTimer = null;

const homeEditOverlay = document.getElementById('homeEditOverlay');
const homeEditFields = document.getElementById('homeEditFields');
const homeEditForm = document.getElementById('homeEditForm');
const homeEditTitle = document.getElementById('homeEditTitle');

function readHeaderDraftFromEditor() {
  if (!homeEditHeaderDraft) return normalizeHeader(DEFAULT_HOME.header, DEFAULT_HOME.title);

  homeEditHeaderDraft.artSide = 'left';
  homeEditHeaderDraft.artWidth = clampHeaderArtWidth(readHeaderField('homeHeaderArtWidth') || homeEditHeaderDraft.artWidth);
  homeEditHeaderDraft.buttonHref = readHeaderField('homeHeaderButtonHref').trim();
  homeEditHeaderDraft.linkHref = readHeaderField('homeHeaderLinkHref').trim();

  homeEditHeaderDraft = normalizeHeader(homeEditHeaderDraft, homeEditHeaderDraft.title);
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

  if (editingHomeSection === 'floatmenu') {
    home.floatMenu = readFloatMenuDraftFromEditor();
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
  if (section === 'floatmenu') return document.getElementById('floatMenu');
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
  if (isCardsHomeSection(editingHomeSection)) return;
  clearTimeout(homeEditPreviewTimer);
  const sectionAtSchedule = editingHomeSection;
  homeEditPreviewTimer = setTimeout(function () {
    if (editingHomeSection !== sectionAtSchedule || isCardsHomeSection(editingHomeSection)) return;
    if (editingHomeSection === 'floatmenu') {
      const draft = buildHomeDraftFromEditor();
      renderFloatMenu(draft);
      if (homeEditOverlay) {
        homeEditOverlay.classList.toggle(
          'is-editing-float-menu',
          !!(draft.floatMenu && draft.floatMenu.side !== 'end')
        );
      }
      syncHomeSectionEditingFocus();
      return;
    }
    renderHome(buildHomeDraftFromEditor(), getHomeEditorPreviewOptions()).then(function () {
      syncHomeSectionEditingFocus();
    });
  }, 50);
}

function bindHomeEditorLivePreview() {
  if (!homeEditFields || homeEditFields.dataset.livePreviewBound === '1') return;
  homeEditFields.dataset.livePreviewBound = '1';
  homeEditFields.addEventListener('input', function () {
    if (isCardsHomeSection(editingHomeSection)) return;
    scheduleHomeEditorPreview();
  });
  homeEditFields.addEventListener('change', function () {
    if (isCardsHomeSection(editingHomeSection)) return;
    scheduleHomeEditorPreview();
  });
}

function floatMenuSectionOptionsHtml(selected) {
  return FLOAT_MENU_SECTIONS.map(function (row) {
    return '<option value="' + escapeHtml(row.id) + '"' +
      (row.id === selected ? ' selected' : '') + '>' +
      escapeHtml(row.label) + '</option>';
  }).join('');
}

function floatMenuEditorRowHtml(item, kind, index) {
  const isUrl = item.type === 'url';
  return (
    '<div class="float-menu-editor-row" data-fm-row="' + escapeHtml(item.id) + '" data-fm-kind="' + kind + '">' +
      '<div class="float-menu-editor-row-head">' +
        '<strong>' + (kind === 'tags' ? 'תג ' : 'פריט ') + (index + 1) + '</strong>' +
        '<button type="button" class="home-header-remove-item" data-fm-editor="remove" data-fm-kind="' + kind + '" data-fm-id="' + escapeHtml(item.id) + '" title="מחיקה" aria-label="מחיקה">×</button>' +
      '</div>' +
      '<label>תווית' +
        '<input type="text" data-fm-field="label" maxlength="40" value="' + escapeHtml(item.label || '') + '">' +
      '</label>' +
      '<div class="float-menu-editor-grid">' +
        '<label>סוג' +
          '<select data-fm-field="type">' +
            '<option value="section"' + (isUrl ? '' : ' selected') + '>מקטע באתר</option>' +
            '<option value="url"' + (isUrl ? ' selected' : '') + '>קישור</option>' +
          '</select>' +
        '</label>' +
        (isUrl
          ? '<label>כתובת' +
              '<input type="text" data-fm-field="target" dir="ltr" placeholder="https://..." value="' + escapeHtml(item.target || '') + '">' +
            '</label>'
          : '<label>מקטע' +
              '<select data-fm-field="target">' + floatMenuSectionOptionsHtml(item.target) + '</select>' +
            '</label>') +
      '</div>' +
    '</div>'
  );
}

function floatMenuFieldsHtml(menu) {
  const itemsHtml = (menu.items || []).map(function (item, i) {
    return floatMenuEditorRowHtml(item, 'items', i);
  }).join('');
  const tagsHtml = (menu.tags || []).map(function (item, i) {
    return floatMenuEditorRowHtml(item, 'tags', i);
  }).join('');

  return (
    '<p class="field-subhint">התפריט נשאר במסך בזמן גלילה, ושאר האתר נדחק הצידה כדי לפנות לו מקום.</p>' +
    '<div class="form-field form-field--full">' +
      '<label for="floatMenuTitleField">כותרת התפריט</label>' +
      '<input type="text" id="floatMenuTitleField" maxlength="40" value="' + escapeHtml(menu.title || '') + '">' +
    '</div>' +
    '<div class="form-field form-field--full">' +
      '<span class="field-label">צד</span>' +
      '<div class="edit-seg" role="radiogroup" aria-label="צד התפריט">' +
        '<label class="edit-seg-btn" for="floatMenuSideStart">' +
          '<input type="radio" name="floatMenuSide" id="floatMenuSideStart" value="start"' + (menu.side === 'end' ? '' : ' checked') + '>' +
          '<span>ימין</span>' +
        '</label>' +
        '<label class="edit-seg-btn" for="floatMenuSideEnd">' +
          '<input type="radio" name="floatMenuSide" id="floatMenuSideEnd" value="end"' + (menu.side === 'end' ? ' checked' : '') + '>' +
          '<span>שמאל</span>' +
        '</label>' +
      '</div>' +
    '</div>' +
    '<div class="form-field form-field--full">' +
      '<span class="field-label">פריטי ניווט</span>' +
      '<div class="float-menu-editor-list" id="floatMenuItemsEditor">' +
        (itemsHtml || '<p class="field-subhint">אין פריטים עדיין. הוסיפו פריט או מלאו ממקטעי האתר.</p>') +
      '</div>' +
      '<div class="home-header-choice-grid home-header-choice-grid--add" style="margin-top:10px;">' +
        '<button type="button" class="home-header-choice-btn home-header-choice-btn--add" data-fm-editor="add-item">+ פריט</button>' +
        '<button type="button" class="home-header-choice-btn" data-fm-editor="fill-sections">מילוי ממקטעים</button>' +
      '</div>' +
    '</div>' +
    '<div class="form-field form-field--full">' +
      '<span class="field-label">תגיות (אופציונלי)</span>' +
      '<div class="float-menu-editor-list" id="floatMenuTagsEditor">' +
        (tagsHtml || '<p class="field-subhint">תגיות מופיעות מתחת לתפריט, כמו כפתורים קטנים.</p>') +
      '</div>' +
      '<div class="home-header-choice-grid home-header-choice-grid--add" style="margin-top:10px;">' +
        '<button type="button" class="home-header-choice-btn home-header-choice-btn--add" data-fm-editor="add-tag">+ תג</button>' +
      '</div>' +
    '</div>'
  );
}

function readFloatMenuDraftFromEditor() {
  const base = homeEditFloatMenuDraft || normalizeFloatMenu(null, loadHome());
  const titleEl = document.getElementById('floatMenuTitleField');
  const sideEl = document.querySelector('input[name="floatMenuSide"]:checked');
  const next = {
    enabled: true,
    side: sideEl && sideEl.value === 'end' ? 'end' : 'start',
    title: titleEl ? titleEl.value.trim().slice(0, 40) : base.title,
    items: [],
    tags: [],
  };

  document.querySelectorAll('.float-menu-editor-row').forEach(function (row) {
    const kind = row.getAttribute('data-fm-kind') === 'tags' ? 'tags' : 'items';
    const labelEl = row.querySelector('[data-fm-field="label"]');
    const typeEl = row.querySelector('[data-fm-field="type"]');
    const targetEl = row.querySelector('[data-fm-field="target"]');
    const item = normalizeFloatMenuItem({
      id: row.getAttribute('data-fm-row'),
      label: labelEl ? labelEl.value : '',
      type: typeEl ? typeEl.value : 'section',
      target: targetEl ? targetEl.value : '',
    });
    next[kind].push(item);
  });

  homeEditFloatMenuDraft = normalizeFloatMenu(next, loadHome());
  homeEditFloatMenuDraft.enabled = true;
  return homeEditFloatMenuDraft;
}

function refreshFloatMenuEditorFields() {
  if (!homeEditFields || editingHomeSection !== 'floatmenu') return;
  readFloatMenuDraftFromEditor();
  homeEditFields.innerHTML = floatMenuFieldsHtml(homeEditFloatMenuDraft);
  scheduleHomeEditorPreview();
}

function bindFloatMenuEditor() {
  if (!homeEditFields || homeEditFields.dataset.floatMenuBound === '1') return;
  homeEditFields.dataset.floatMenuBound = '1';
  homeEditFields.addEventListener('click', function (e) {
    if (editingHomeSection !== 'floatmenu') return;
    const btn = e.target.closest('[data-fm-editor]');
    if (!btn) return;
    e.preventDefault();
    const action = btn.getAttribute('data-fm-editor');
    const draft = readFloatMenuDraftFromEditor();
    if (action === 'add-item') {
      draft.items.push(normalizeFloatMenuItem({ label: 'פריט חדש', type: 'section', target: 'header' }));
    } else if (action === 'add-tag') {
      draft.tags.push(normalizeFloatMenuItem({ label: 'תג', type: 'section', target: 'cardsTop' }));
    } else if (action === 'fill-sections') {
      draft.items = defaultFloatMenuSectionItems(loadHome());
    } else if (action === 'remove') {
      const id = btn.getAttribute('data-fm-id');
      const kind = btn.getAttribute('data-fm-kind') === 'tags' ? 'tags' : 'items';
      draft[kind] = (draft[kind] || []).filter(function (item) { return item.id !== id; });
    } else {
      return;
    }
    homeEditFloatMenuDraft = draft;
    homeEditFields.innerHTML = floatMenuFieldsHtml(draft);
    scheduleHomeEditorPreview();
  });
  homeEditFields.addEventListener('change', function (e) {
    if (editingHomeSection !== 'floatmenu') return;
    if (!e.target || e.target.getAttribute('data-fm-field') !== 'type') return;
    readFloatMenuDraftFromEditor();
    homeEditFields.innerHTML = floatMenuFieldsHtml(homeEditFloatMenuDraft);
    scheduleHomeEditorPreview();
  });
}

function openHomeEditor(section) {
  if (IS_USER_MODE) return;
  clearTimeout(homeEditPreviewTimer);
  unmountCardsLayoutBarFromEditor();

  const home = loadHome();
  if (section === 'intro' && !homeHasIntro(home)) return;
  editingHomeSection = section;
  homeEditSnapshot = JSON.parse(JSON.stringify(home));
  homeEditCommitted = false;
  homeEditImageData = '';
  homeEditDevTeamImageData = '';
  homeEditVideoFile = null;
  homeEditVideoRemoved = false;
  homeEditHeaderDraft = null;
  homeEditFloatMenuDraft = null;

  let fieldsHtml = '';
  let title = 'עריכת מקטע';

  if (section === 'header') {
    title = 'עריכת כותרת';
    homeEditHeaderDraft = normalizeHeader(home.header, home.title);
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

  if (section === 'floatmenu') {
    title = 'עריכת תפריט צף';
    homeEditFloatMenuDraft = normalizeFloatMenu(home.floatMenu, home);
    homeEditFloatMenuDraft.enabled = true;
    if (!homeEditFloatMenuDraft.items.length) {
      homeEditFloatMenuDraft.items = defaultFloatMenuSectionItems(home);
    }
    fieldsHtml = floatMenuFieldsHtml(homeEditFloatMenuDraft);
  }

  if (isCardsHomeSection(section)) {
    const sectionId = getCardsSectionIdFromEditKey(section);
    const meta = getCardsSectionMeta(sectionId);
    const cfg = getCardsSectionConfig(home, sectionId);
    setActiveCardsSectionId(sectionId);
    title = 'עריכת ' + meta.label;
    fieldsHtml =
      '<div class="form-field form-field--full">' +
        '<label for="cardsSectionTitleInput">כותרת הסקשן</label>' +
        '<input type="text" id="cardsSectionTitleInput" maxlength="80" value="' + escapeHtml(cfg.title || meta.defaultTitle) + '">' +
      '</div>' +
      '<p class="field-subhint">הגדרות פריסה ל' + escapeHtml(meta.label) + '. השינויים נשמרים מיד.</p>';
  }

  homeEditTitle.textContent = title;
  homeEditFields.innerHTML = fieldsHtml;
  homeEditOverlay.hidden = false;
  homeEditOverlay.classList.add('home-edit-live');
  homeEditOverlay.classList.toggle(
    'is-editing-float-menu',
    section === 'floatmenu' && homeEditFloatMenuDraft && homeEditFloatMenuDraft.side !== 'end'
  );
  homeEditOverlay.classList.toggle('is-editing-header', section === 'header');

  if (isCardsHomeSection(section)) {
    bindCardsSectionTitleField(section);
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
  bindFloatMenuEditor();
  bindHomeEditorLivePreview();
  syncHomeSectionEditingFocus();
}

function bindCardsSectionTitleField(section) {
  const input = document.getElementById('cardsSectionTitleInput');
  if (!input) return;
  input.addEventListener('input', function () {
    const sectionId = getCardsSectionIdFromEditKey(section);
    let nextHome = loadHome();
    nextHome = setCardsSectionConfig(nextHome, sectionId, {
      title: String(input.value || '').trim(),
    });
    if (!saveHome(nextHome)) return;
    renderCardsSectionTitle(nextHome, sectionId);
  });
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
        '<input type="range" id="homeHeaderSize_' + escapeHtml(item.id) + '" min="6" max="40" step="1" value="' + item.w + '" style="width:100%; accent-color: var(--site-secondary, #e31c23);">' +
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
  const artWidth = clampHeaderArtWidth(header.artWidth);
  return (
    '<p class="field-subhint">את הטקסט עורכים ישירות על הכותרת. כאן מגדירים איור וקישורים בלבד.</p>' +
    '<div class="home-header-editor-item">' +
      '<div class="home-header-editor-item-head"><strong>איור</strong></div>' +
      '<label class="edit-upload-btn edit-upload-btn--wide" for="homeHeaderArtFile">' +
        '<input type="file" id="homeHeaderArtFile" accept="image/*" hidden>' +
        editIco('image') +
        '<span>העלאת איור / החלפה</span>' +
      '</label>' +
      '<img class="home-edit-preview' + (header.artSrc ? ' is-visible' : '') + '" id="homeHeaderArtPreview" src="' + (header.artSrc || '') + '" alt="">' +
      (header.artSrc ? '<button type="button" class="edit-clear-btn" id="homeHeaderArtClear">הסרת איור</button>' : '') +
      homeSizeControlHtml('homeHeaderArtWidth', artWidth, {
        min: 20, max: 70, step: 1, unit: '%', label: 'רוחב איור', ico: 'size',
      }) +
    '</div>' +
    '<div class="home-header-editor-item">' +
      '<div class="home-header-editor-item-head"><strong>כפתור</strong></div>' +
      '<label for="homeHeaderButtonHref">קישור (אופציונלי)</label>' +
      '<input type="text" id="homeHeaderButtonHref" placeholder="https://..." value="' + escapeHtml(header.buttonHref || '') + '">' +
    '</div>' +
    '<div class="home-header-editor-item">' +
      '<div class="home-header-editor-item-head"><strong>קישור משני</strong></div>' +
      '<label for="homeHeaderLinkHref">קישור (אופציונלי)</label>' +
      '<input type="text" id="homeHeaderLinkHref" placeholder="https://..." value="' + escapeHtml(header.linkHref || '') + '">' +
    '</div>'
  );
}

function refreshHomeHeaderEditorFields() {
  if (!homeEditHeaderDraft || !homeEditFields) return;
  readHeaderDraftFromEditor();
  homeEditFields.innerHTML = homeHeaderFieldsHtml(homeEditHeaderDraft);
  bindHomeHeaderEditor();
  scheduleHomeEditorPreview();
}

function bindHomeHeaderEditor() {
  if (editingHomeSection !== 'header' || !homeEditHeaderDraft) return;

  const range = document.getElementById('homeHeaderArtWidth');
  const num = document.getElementById('homeHeaderArtWidthNum');
  if (range && num) {
    function sync(from) {
      const value = clampHeaderArtWidth(from === 'num' ? num.value : range.value);
      range.value = String(value);
      num.value = String(value);
      scheduleHomeEditorPreview();
    }
    range.addEventListener('input', function () { sync('range'); });
    num.addEventListener('input', function () {
      if (num.value === '' || num.value === '-') return;
      sync('num');
    });
    num.addEventListener('change', function () { sync('num'); });
  }

  const artFile = document.getElementById('homeHeaderArtFile');
  if (artFile) {
    artFile.addEventListener('change', async function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const dataUrl = await readFileAsDataURL(file, 900, null, true);
      homeEditHeaderDraft.artSrc = dataUrl;
      const preview = document.getElementById('homeHeaderArtPreview');
      if (preview) {
        preview.src = dataUrl;
        preview.classList.add('is-visible');
      }
      scheduleHomeEditorPreview();
    });
  }

  const artClear = document.getElementById('homeHeaderArtClear');
  if (artClear) {
    artClear.addEventListener('click', function () {
      homeEditHeaderDraft.artSrc = '';
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
  const shouldRevert = !homeEditCommitted && !!homeEditSnapshot && !isCardsHomeSection(editingHomeSection);
  unmountCardsLayoutBarFromEditor();
  homeEditOverlay.hidden = true;
  homeEditOverlay.classList.remove('home-edit-live');
  homeEditOverlay.classList.remove('is-editing-float-menu');
  homeEditOverlay.classList.remove('is-editing-header');
  editingHomeSection = null;
  clearHomeSectionEditingFocus();
  homeEditImageData = '';
  homeEditDevTeamImageData = '';
  homeEditVideoFile = null;
  homeEditVideoRemoved = false;
  homeEditHeaderDraft = null;
  homeEditFloatMenuDraft = null;

  if (shouldRevert) {
    renderHome();
  }

  homeEditSnapshot = null;
  homeEditCommitted = false;
}

async function saveHomeEditor(e) {
  e.preventDefault();
  if (!editingHomeSection) return;
  if (activeInlineEdit) commitInlineEdit();

  if (isCardsHomeSection(editingHomeSection)) {
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

  if (editingHomeSection === 'floatmenu') {
    const menu = readFloatMenuDraftFromEditor();
    menu.enabled = true;
    home.floatMenu = menu;
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

function isSettingsMenuOpen() {
  return !!(settingsMenu && !settingsMenu.hidden);
}

function openSettingsModal() {
  if (!settingsMenu || !btnSettings) return;
  settingsMenu.hidden = false;
  btnSettings.setAttribute('aria-expanded', 'true');
}

function closeSettingsModal() {
  if (!settingsMenu || !btnSettings) return;
  settingsMenu.hidden = true;
  btnSettings.setAttribute('aria-expanded', 'false');
}

function toggleSettingsModal() {
  if (isSettingsMenuOpen()) closeSettingsModal();
  else openSettingsModal();
}

function deleteIndexedDb(name) {
  return new Promise(function (resolve) {
    if (!window.indexedDB || !name) {
      resolve();
      return;
    }
    try {
      const request = indexedDB.deleteDatabase(name);
      request.onsuccess = function () { resolve(); };
      request.onerror = function () { resolve(); };
      request.onblocked = function () { resolve(); };
    } catch (err) {
      resolve();
    }
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

function base64ToBlob(base64, mime) {
  const bin = atob(String(base64 || ''));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime || 'application/octet-stream' });
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

function getAllHomeVideos() {
  return openVideoDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(VIDEO_STORE, 'readonly');
      const store = tx.objectStore(VIDEO_STORE);
      const req = store.openCursor();
      const out = {};
      req.onsuccess = function (e) {
        const cursor = e.target.result;
        if (!cursor) {
          resolve(out);
          return;
        }
        out[String(cursor.key)] = cursor.value;
        cursor.continue();
      };
      req.onerror = function () { reject(req.error || new Error('שגיאה בטעינת מדיה')); };
    });
  }).catch(function () {
    return {};
  });
}

async function collectAppSnapshot() {
  const home = loadHome();
  const cards = loadCards();
  const fonts = await listCustomFonts().catch(function () { return []; });
  const videosRaw = await getAllHomeVideos();

  const fontsSerialized = [];
  for (let i = 0; i < fonts.length; i += 1) {
    const font = fonts[i];
    if (!font || !font.blob) continue;
    fontsSerialized.push({
      id: font.id,
      name: font.name,
      family: font.family,
      cssValue: font.cssValue,
      type: font.type || font.blob.type || 'application/octet-stream',
      fileName: font.fileName || font.name || 'font.woff2',
      data: await blobToBase64(font.blob),
    });
  }

  const videos = {};
  const videoKeys = Object.keys(videosRaw);
  for (let i = 0; i < videoKeys.length; i += 1) {
    const key = videoKeys[i];
    const rec = videosRaw[key];
    if (!rec || !rec.blob) continue;
    videos[key] = {
      name: rec.name || key,
      type: rec.type || rec.blob.type || 'video/mp4',
      data: await blobToBase64(rec.blob),
    };
  }

  return {
    version: HEBET_BOOTSTRAP_VERSION,
    exportedAt: new Date().toISOString(),
    mode: 'user',
    home: home,
    cards: cards,
    fonts: fontsSerialized,
    videos: videos,
  };
}

async function importAppSnapshot(snapshot) {
  if (!snapshot || !snapshot.home || !Array.isArray(snapshot.cards)) {
    throw new Error('קובץ לא תקין או חסרים בו נתונים');
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.cards));
  localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(snapshot.home));

  await deleteIndexedDb(FONTS_DB_NAME);
  const fonts = Array.isArray(snapshot.fonts) ? snapshot.fonts : [];
  for (let i = 0; i < fonts.length; i += 1) {
    const font = fonts[i];
    if (!font || !font.data) continue;
    const blob = base64ToBlob(font.data, font.type);
    await putCustomFont({
      id: font.id || ('font-' + i),
      name: font.name || font.family || 'CustomFont',
      family: font.family || font.name || 'CustomFont',
      cssValue: font.cssValue || cssValueForFontFamily(font.family || font.name || 'CustomFont'),
      blob: blob,
      type: font.type || blob.type,
      fileName: font.fileName || font.name || 'font.woff2',
    });
  }

  await deleteIndexedDb(VIDEO_DB_NAME);
  const videos = snapshot.videos && typeof snapshot.videos === 'object' ? snapshot.videos : {};
  const videoKeys = Object.keys(videos);
  for (let i = 0; i < videoKeys.length; i += 1) {
    const key = videoKeys[i];
    const vid = videos[key];
    if (!vid || !vid.data) continue;
    const blob = base64ToBlob(vid.data, vid.type);
    const file = new File([blob], vid.name || key, { type: vid.type || blob.type || 'video/mp4' });
    await putHomeVideo(key, file);
  }
}

async function bootstrapFromEmbeddedDataIfPresent() {
  const el = document.getElementById(HEBET_BOOTSTRAP_ID);
  if (!el || !String(el.textContent || '').trim()) return false;
  const snapshot = JSON.parse(el.textContent);
  await importAppSnapshot(snapshot);
  return true;
}

function buildExportedPortalHtml(snapshot, indexHtml, cssText, jsText) {
  let out = String(indexHtml || '');
  out = out.replace('<body data-app-mode="edit">', '<body data-app-mode="user" class="user-mode">');
  out = out.replace('<body>', '<body data-app-mode="user" class="user-mode">');
  out = out.replace(
    /<link rel="stylesheet" href="css\/style\.css">/,
    '<style>\n' + cssText + '\n</style>'
  );

  const bootstrapTag =
    '<script id="' + HEBET_BOOTSTRAP_ID + '" type="application/json">' +
    serializeBootstrapJson(snapshot) +
    '</script>\n';

  out = out.replace(
    '<script src="js/app.js"></script>',
    bootstrapTag + '<script>\n' + escapeForInlineScript(jsText) + '\n</script>'
  );

  return out;
}

async function fetchProjectAsset(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error('לא ניתן לקרוא ' + path);
  return res.text();
}

async function exportUserModeHtml() {
  if (IS_USER_MODE) return;
  closeSettingsModal();

  let indexHtml;
  let cssText;
  let jsText;
  try {
    indexHtml = await fetchProjectAsset('index.html');
    cssText = await fetchProjectAsset('css/style.css');
    jsText = await fetchProjectAsset('js/app.js');
  } catch (err) {
    console.error(err);
    alert(
      'לא ניתן לייצא מהמיקום הנוכחי.\n' +
      'פתחו את האתר דרך שרת מקומי (לא file://) ונסו שוב.'
    );
    return;
  }

  let snapshot;
  try {
    snapshot = await collectAppSnapshot();
  } catch (err) {
    console.error(err);
    alert('שגיאה באיסוף הנתונים לייצוא.');
    return;
  }

  const html = buildExportedPortalHtml(snapshot, indexHtml, cssText, jsText);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: HEBET_EXPORT_FILENAME,
        types: [{ description: 'HTML', accept: { 'text/html': ['.html'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      console.warn('showSaveFilePicker failed, falling back to download', err);
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = HEBET_EXPORT_FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function parseSnapshotFromHtmlText(htmlText) {
  const doc = new DOMParser().parseFromString(String(htmlText || ''), 'text/html');
  const bootstrapEl = doc.getElementById(HEBET_BOOTSTRAP_ID);
  if (!bootstrapEl || !String(bootstrapEl.textContent || '').trim()) {
    throw new Error('לא נמצאו נתוני אתר בקובץ שנבחר');
  }
  return JSON.parse(bootstrapEl.textContent);
}

async function loadPortalFromHtmlFile(file) {
  if (!file) return;
  closeSettingsModal();
  try {
    const htmlText = await file.text();
    const snapshot = parseSnapshotFromHtmlText(htmlText);
    await importAppSnapshot(snapshot);
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert((err && err.message) ? err.message : 'לא הצלחנו לטעון את הקובץ');
  }
}

function applyAppModeShell() {
  if (!IS_USER_MODE) return;
  document.body.classList.add('user-mode');
  if (document.body.getAttribute('data-app-mode') !== 'user') {
    document.body.setAttribute('data-app-mode', 'user');
  }
  const toolbar = document.getElementById('siteToolbar');
  if (toolbar) toolbar.hidden = true;
  editMode = false;
  document.body.classList.remove('page-edit-mode');
  forEachCardsGrid(function (grid) {
    grid.classList.remove('edit-mode');
  });
  if (btnEdit) {
    btnEdit.classList.remove('active');
    btnEdit.textContent = 'עריכה';
  }
}

async function resetSiteToDefaults() {
  if (IS_USER_MODE) return;
  const ok = window.confirm(
    'לאפס את האתר ולהתחיל מהתחלה?\n\n' +
    'כל הכרטיסים, עיצוב הדף והמדיה שנשמרו יימחקו. לא ניתן לבטל.'
  );
  if (!ok) return;

  closeSettingsModal();
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(HOME_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed clearing localStorage', err);
  }

  try {
    Object.keys(videoMemoryStore).forEach(function (key) {
      delete videoMemoryStore[key];
    });
  } catch (err) {}

  customFontsCache = [];

  await Promise.all([
    deleteIndexedDb(FONTS_DB_NAME),
    deleteIndexedDb(VIDEO_DB_NAME),
  ]);

  window.location.reload();
}

if (btnSettings) {
  btnSettings.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleSettingsModal();
  });
}

if (settingsMenu) {
  settingsMenu.querySelectorAll('.settings-action').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const action = btn.getAttribute('data-settings-action');
      if (action === 'reset') {
        resetSiteToDefaults();
        return;
      }
      if (action === 'export') {
        exportUserModeHtml();
        return;
      }
      if (action === 'load') {
        const loadInput = document.getElementById('settingsLoadInput');
        if (loadInput) loadInput.click();
        return;
      }
      closeSettingsModal();
    });
  });
}

const settingsLoadInput = document.getElementById('settingsLoadInput');
if (settingsLoadInput) {
  settingsLoadInput.addEventListener('change', function (e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (file) loadPortalFromHtmlFile(file);
  });
}

document.addEventListener('click', function (e) {
  if (!isSettingsMenuOpen()) return;
  if (settingsWrap && settingsWrap.contains(e.target)) return;
  closeSettingsModal();
});

document.getElementById('siteFont').addEventListener('change', function (e) {
  updateHomeField({ siteFont: e.target.value });
});

document.getElementById('siteFontUpload').addEventListener('change', async function (e) {
  const file = e.target.files[0];
  e.target.value = '';
  await handleFontUpload(file, 'site');
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

const floatMenuEnabledEl = document.getElementById('floatMenuEnabled');
if (floatMenuEnabledEl) {
  floatMenuEnabledEl.addEventListener('change', function (e) {
    const home = loadHome();
    const menu = normalizeFloatMenu(home.floatMenu, home);
    const enabled = !!e.target.checked;
    menu.enabled = enabled;
    if (enabled && !menu.items.length) {
      menu.items = defaultFloatMenuSectionItems(home);
    }
    home.floatMenu = menu;
    if (!saveHome(home)) {
      e.target.checked = !enabled;
      alert('אין מספיק מקום לשמירה.');
      return;
    }
    renderFloatMenu(home);
    syncHomeSectionControls(home);
  });
}

document.getElementById('cardsPerRow').addEventListener('input', function (e) {
  const value = Number(e.target.value);
  document.getElementById('cardsPerRowValue').textContent = String(value);
  updateActiveCardsSectionConfig({ cardsPerRow: value });
});

document.getElementById('cardsGap').addEventListener('input', function (e) {
  const value = Number(e.target.value);
  document.getElementById('cardsGapValue').textContent = value + 'px';
  updateActiveCardsSectionConfig({ cardsGap: value });
});

document.getElementById('cardsLayoutMode').addEventListener('change', function (e) {
  const mode = e.target.value;
  if (mode !== 'matrix' && mode !== 'categories' && mode !== 'freeform') return;
  let home = loadHome();
  const sectionId = getActiveCardsSectionId();
  const cfg = getCardsSectionConfig(home, sectionId);
  const patch = { layoutMode: mode };
  if (mode === 'categories') {
    patch.categories = normalizeCategories(cfg.categories, getCardsForSection(loadCards(), sectionId));
  }
  if (mode === 'freeform') {
    patch.cardsFreeHeight = clampCardsFreeHeight(cfg.cardsFreeHeight);
    patch.cardsFreeSize = clampCardFreeWidth(cfg.cardsFreeSize);
    home = setCardsSectionConfig(home, sectionId, patch);
    ensureCardPositions(home, getCardsForSection(loadCards(), sectionId), sectionId);
    if (!saveHome(home)) {
      e.target.value = getCardsLayoutMode(loadHome(), sectionId);
      alert('אין מספיק מקום לשמירה.');
      return;
    }
    syncCategoriesToolbar(home);
    renderCards(loadCards());
    return;
  }
  if (!updateActiveCardsSectionConfig(patch)) {
    e.target.value = getCardsLayoutMode(loadHome(), sectionId);
  }
});

document.getElementById('cardsFreeHeight').addEventListener('input', function (e) {
  const value = clampCardsFreeHeight(e.target.value);
  applyCardsFreeHeight(value);
  updateActiveCardsSectionConfig({ cardsFreeHeight: value });
});

document.getElementById('cardsFreeSize').addEventListener('input', function (e) {
  const value = clampCardFreeWidth(e.target.value);
  applyCardsFreeSizeToDom(value);
  let home = loadHome();
  const sectionId = getActiveCardsSectionId();
  const positions = Object.assign({}, getCardPositionMap(home, sectionId));
  Object.keys(positions).forEach(function (id) {
    positions[id] = normalizeCardPosition(Object.assign({}, positions[id], { w: value }), value);
  });
  home = setCardsSectionConfig(home, sectionId, {
    cardsFreeSize: value,
    cardPositions: positions,
  });
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
    const kind = btn.dataset.deleteHome;
    if (kind === 'intro') hideHomeIntro();
    else deleteSecondaryHomeSection(kind);
  });
});

const homeIntroRestore = document.getElementById('homeIntroRestore');
if (homeIntroRestore) {
  homeIntroRestore.addEventListener('click', function () {
    restoreHomeIntro();
  });
}

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
    if (activeInlineEdit) return;
    if (isSettingsMenuOpen()) {
      closeSettingsModal();
    } else if (!homeEditOverlay.hidden) {
      closeHomeEditor();
    } else if (!detailOverlay.hidden) {
      closeCardDetail();
    } else if (!modalOverlay.hidden) {
      closeWizard();
    } else if (editMode && IS_EDIT_MODE) {
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
bindWizardPreviewTextEdit();
bindInlineFormattingToolbarGuard();
bindHslaPickers();
setupHslaField(document.getElementById('inlineTextColorPicker'), function (hex) {
  applyInlineTextColor(hex);
});
(function bindInlineTextSizeControl() {
  const range = document.getElementById('inlineTextSize');
  if (!range) return;
  range.addEventListener('input', function () {
    applyInlineTextSize(range.value);
  });
})();
setupHslaField(document.getElementById('siteColorPicker'), function (hex) {
  updateHomeField({ siteSecondaryColor: hex });
});
setupHslaField(document.getElementById('siteBgColorPicker'), function (hex) {
  updateHomeField({ siteBgColor: hex });
});
bindSectionResizeHandles();
syncResizeHandlesVisibility();
bindInlineEditing();

async function initApp() {
  applyAppModeShell();

  try {
    await bootstrapFromEmbeddedDataIfPresent();
  } catch (err) {
    console.warn('Bootstrap import failed', err);
    if (document.getElementById(HEBET_BOOTSTRAP_ID)) {
      alert('שגיאה בטעינת נתונים מוטמעים בקובץ');
    }
  }

  try {
    await loadAndRegisterCustomFonts();
  } catch (err) {
    console.warn('Custom fonts unavailable', err);
  }
  populateFontSelects();
  syncSiteToolbarHeight();
  await renderHome();
  renderCards(loadCards());
  playPageEntrance();
}

function preparePageEntrance() {
  const selectors = [
    '#siteToolbar',
    '#floatMenu',
    '#homeHeader',
    '#homeIntro',
    '#homeIntro2',
    '#cardsGridTop .card',
    '#cardsGridBottom .card',
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
