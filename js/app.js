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

const DEFAULT_HOME = {
  title: 'פורטל תוכן',
  titleImage: '',
  titleBgOpacity: 100,
  titleLogoEnabled: false,
  titleLogo: '',
  titleLogoLink: '',
  titleLogoAlign: 'right',
  subtitle: 'צפייה מהנה',
  introText: 'ברוכים הבאים לפורטל התוכן. כאן תמצאו מצגות, לומדות וסרטים.',
  introImage: '',
  introVideo: '',
  introMediaType: 'image',
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
  intro2Text: '',
  intro2Image: '',
  intro2Video: '',
  intro2MediaType: 'image',
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
  closingImage: '',
  closingVideo: '',
  closingMediaType: 'image',
  closingBgOpacity: 100,
  closingSizeAuto: true,
  closingHeight: 280,
  closingVideoFit: 'cover',
  closingVideoZoom: 100,
  closingVideoPosX: 50,
  closingVideoPosY: 50,
  closingVideoBgMode: 'transparent',
  closingVideoBgColor: '#2f5a28',
  hasClosing2: false,
  closing2Text: '',
  closing2Image: '',
  closing2Video: '',
  closing2MediaType: 'image',
  closing2BgOpacity: 100,
  closing2SizeAuto: true,
  closing2Height: 280,
  closing2VideoFit: 'cover',
  closing2VideoZoom: 100,
  closing2VideoPosX: 50,
  closing2VideoPosY: 50,
  closing2VideoBgMode: 'transparent',
  closing2VideoBgColor: '#2f5a28',
  siteBgColor: '#f0f0f0',
  siteBgImage: '',
  siteSecondaryColor: '#4a7c3f',
  siteFont: "'Segoe UI', Tahoma, Arial, sans-serif",
  cardsPerRow: 5,
  cardsGap: 16,
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
const TOTAL_STEPS = 3;

const wizardData = createEmptyWizardData();

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
  const p = primary || '#e87722';
  const s = secondary || '#4a7c3f';
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
  const primary = card.primaryColor || '#e87722';
  const secondary = card.secondaryColor || '#4a7c3f';
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

function isPdfLink(link) {
  return /\.pdf(\?|#|$)/i.test(link || '');
}

function isYouTubeLink(link) {
  return /(youtube\.com|youtu\.be)/i.test(link || '');
}

function suggestActionForLink(link) {
  if (isPdfLink(link)) return 'הדפסה';
  if (isYouTubeLink(link)) return 'צפייה';
  return 'צפייה';
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
  const primary = card.primaryColor || '#e87722';
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
  const secondary = card.secondaryColor || '#4a7c3f';
  const logoHtml = card.logo
    ? '<img class="card-logo" src="' + card.logo + '" alt="">'
    : '';
  const titleRaw = (card.title || '').slice(0, 10);
  const unitRaw = (card.unitName || '').slice(0, 10);
  const unitLine = unitRaw
    ? '<p class="card-unit" style="color:' + secondary + ';">' + escapeHtml(unitRaw) + '</p>'
    : '';
  const desc = card.notes || card.description || '';

  return (
    '<div class="card-image' + (shouldShowImageBg(card) ? ' card-image--photo' : '') + '" style="' + getCardImageStyle(card) + '">' +
      getCardBgPhotoHtml(card) +
      logoHtml +
      '<div class="card-image-tags">' +
        '<span class="card-overlay-tag" style="border-color:' + secondary + ';">' + escapeHtml(typeTag) + '</span>' +
        '<span class="card-overlay-tag" style="border-color:' + secondary + ';">' + escapeHtml(classTag) + '</span>' +
      '</div>' +
      '<span class="card-title">' + escapeHtml(titleRaw) + '</span>' +
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

function renderCards(cards) {
  if (editMode) {
    cardsGrid.innerHTML = cards.map(function (card, index) {
      return (
        '<div class="card card--editing" draggable="true" data-id="' + card.id + '" style="animation-delay: ' + (index % 3) * 0.08 + 's; ' + getCardThemeStyle(card) + '">' +
          '<button type="button" class="card-edit" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
          '<button type="button" class="card-duplicate" data-id="' + card.id + '" aria-label="שיכפול כרטיס" title="שיכפול">⧉</button>' +
          '<button type="button" class="card-delete" data-id="' + card.id + '" aria-label="מחיקת כרטיס">×</button>' +
          buildCardInner(card) +
        '</div>'
      );
    }).join('');
    setupDragAndDrop();
    setupDeleteButtons();
    setupEditButtons();
    setupDuplicateButtons();
  } else {
    cardsGrid.innerHTML = cards.map(function (card) {
      return (
        '<div class="card card--clickable" data-id="' + card.id + '" role="button" tabindex="0" style="' + getCardThemeStyle(card) + '">' +
          '<button type="button" class="card-edit card-edit--quiet" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
          buildCardInner(card) +
        '</div>'
      );
    }).join('');
    setupCardClicks();
    setupEditButtons();
  }
}

/* ===== מצב עריכה / גרירה / מחיקה ===== */

function saveOrderFromDom() {
  const ids = [...cardsGrid.querySelectorAll('.card')].map(function (el) {
    return el.dataset.id;
  });
  const cards = loadCards();
  const cardMap = Object.fromEntries(cards.map(function (c) { return [c.id, c]; }));
  const reordered = ids.map(function (id) { return cardMap[id]; }).filter(Boolean);
  saveCards(reordered);
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
      draggedElement = null;
      saveOrderFromDom();
    });

    card.addEventListener('dragover', function (e) {
      e.preventDefault();
      if (!draggedElement || draggedElement === card) return;

      const rect = card.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      const midY = rect.top + rect.height / 2;
      const after = e.clientY > midY || (Math.abs(e.clientY - midY) < rect.height / 4 && e.clientX > midX);

      if (after) {
        cardsGrid.insertBefore(draggedElement, card.nextSibling);
      } else {
        cardsGrid.insertBefore(draggedElement, card);
      }
    });
  });
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

  renderCards(cards);
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
        row('תאריך', formatDate(card.date) || '—') +
        row('סטטוס', card.status || '—') +
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
  detailFly.style.setProperty('--card-primary', card.primaryColor || '#e87722');
  detailFly.style.setProperty('--card-secondary', card.secondaryColor || '#4a7c3f');

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

function deleteCard(id) {
  const card = loadCards().find(function (c) { return c.id === id; });
  const name = card ? card.title : 'כרטיס זה';
  if (!confirm('למחוק את "' + name + '"?')) return;

  const cards = loadCards().filter(function (c) { return c.id !== id; });
  saveCards(cards);
  renderCards(cards);
}

function toggleEditMode() {
  editMode = !editMode;
  btnEdit.textContent = editMode ? 'סיום עריכה' : 'עריכה';
  btnEdit.classList.toggle('active', editMode);
  cardsGrid.classList.toggle('edit-mode', editMode);
  document.body.classList.toggle('page-edit-mode', editMode);
  document.getElementById('cardsLayoutBar').hidden = !editMode;
  syncHomeSectionControls(loadHome());
  syncResizeHandlesVisibility();
  renderHomeLogo(loadHome());
  renderCards(loadCards());
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
  if (wizardData.status) metaBits.push(wizardData.status);
  if (wizardData.date) metaBits.push(formatDate(wizardData.date));
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
    if (!wizardData.date) return 'תאריך הוא שדה חובה';
    if (!wizardData.status) return 'סטטוס הוא שדה חובה';
    if (!wizardData.classification) return 'סיווג הוא שדה חובה';
  }

  if (step === 2) {
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
  wizardData.date = document.getElementById('cardDate').value;
  wizardData.status = document.getElementById('status').value;
  wizardData.classification = document.getElementById('classification').value;
  wizardData.projectType = document.getElementById('projectType').value;
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

  document.getElementById('primaryColorHex').textContent = wizardData.primaryColor;
  document.getElementById('secondaryColorHex').textContent = wizardData.secondaryColor;
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
      // הצעה אוטומטית לפי סוג הקישור — רק אם פעולה אחת מסומנת
      if (wizardData.enabledActions.length === 1) {
        const suggested = suggestActionForLink(input.value);
        if (suggested !== action) {
          // לא מחליפים אוטומטית את הצ'קבוקסים כשיש כבר בחירה מרובה
        }
      }
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
    'pageName', 'unitName', 'notes', 'cardDate', 'status',
    'classification', 'projectType',
    'primaryColor', 'secondaryColor', 'cardFont', 'useImageBg',
  ];

  liveIds.forEach(function (id) {
    const el = document.getElementById(id);
    el.addEventListener('input', function () {
      syncFormToData();
      updateLivePreview();
    });
    el.addEventListener('change', function () {
      syncFormToData();
      updateLivePreview();
    });
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
  document.getElementById('cardDate').value = wizardData.date || '';
  document.getElementById('status').value = wizardData.status || '';
  document.getElementById('classification').value = wizardData.classification || '';
  document.getElementById('projectType').value = wizardData.projectType || '';
  document.getElementById('primaryColor').value = wizardData.primaryColor || '#e87722';
  document.getElementById('secondaryColor').value = wizardData.secondaryColor || '#4a7c3f';
  document.getElementById('primaryColorHex').textContent = wizardData.primaryColor || '#e87722';
  document.getElementById('secondaryColorHex').textContent = wizardData.secondaryColor || '#4a7c3f';
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
    date: wizardData.date,
    status: wizardData.status,
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

  const today = new Date().toISOString().slice(0, 10);
  wizardData.date = today;
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
  wizardData.date = card.date || new Date().toISOString().slice(0, 10);
  wizardData.status = card.status || '';
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
  }

  renderCards(cards);
  closeWizard();
}

/* ===== דף בית ===== */

function loadHome() {
  const saved = localStorage.getItem(HOME_STORAGE_KEY);
  let home = Object.assign({}, DEFAULT_HOME);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      home = Object.assign({}, DEFAULT_HOME, parsed);
      home.titleBgOpacity = migrateBgOpacity(parsed, 'title');
      home.introBgOpacity = migrateBgOpacity(parsed, 'intro');
      home.intro2BgOpacity = migrateBgOpacity(parsed, 'intro2');
      home.closingBgOpacity = migrateBgOpacity(parsed, 'closing');
      home.closing2BgOpacity = migrateBgOpacity(parsed, 'closing2');
      home.hasIntro2 = !!home.hasIntro2;
      home.hasClosing2 = !!home.hasClosing2;
    } catch {
      home = Object.assign({}, DEFAULT_HOME);
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

function saveHome(home) {
  try {
    localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(home));
    return true;
  } catch (err) {
    console.error('שגיאת שמירת דף בית:', err);
    return false;
  }
}

const MEDIA_SECTION_KEYS = [
  'Text', 'Image', 'Video', 'MediaType', 'BgOpacity', 'SizeAuto', 'Height',
  'VideoFit', 'VideoZoom', 'VideoPosX', 'VideoPosY', 'VideoBgMode', 'VideoBgColor',
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
      suffix === 'MediaType' ? 'image' :
      suffix === 'BgOpacity' || suffix === 'VideoZoom' ? (suffix === 'VideoZoom' ? 100 : 100) :
      suffix === 'Height' ? 280 :
      suffix === 'SizeAuto' ? true :
      suffix === 'VideoFit' ? 'cover' :
      suffix === 'VideoPosX' || suffix === 'VideoPosY' ? 50 :
      suffix === 'VideoBgMode' ? 'transparent' :
      suffix === 'VideoBgColor' ? '#2f5a28' :
      ''
    );
  });
}

function getSectionHeightEl(kind) {
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
      home[toKind + 'MediaType'] = 'image';
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
  return new Promise(function (resolve, reject) {
    const request = indexedDB.open(VIDEO_DB_NAME, 1);
    request.onupgradeneeded = function () {
      const db = request.result;
      if (!db.objectStoreNames.contains(VIDEO_STORE)) {
        db.createObjectStore(VIDEO_STORE);
      }
    };
    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error || new Error('IndexedDB failed')); };
  });
}

function putHomeVideo(key, file) {
  return openVideoDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(VIDEO_STORE, 'readwrite');
      tx.objectStore(VIDEO_STORE).put({
        blob: file,
        name: file.name || 'video',
        type: file.type || 'video/mp4',
      }, key);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error || new Error('שגיאה בשמירת סרטון')); };
    });
  });
}

function getHomeVideo(key) {
  return openVideoDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(VIDEO_STORE, 'readonly');
      const req = tx.objectStore(VIDEO_STORE).get(key);
      req.onsuccess = function () { resolve(req.result || null); };
      req.onerror = function () { reject(req.error || new Error('שגיאה בטעינת סרטון')); };
    });
  });
}

function deleteHomeVideo(key) {
  return openVideoDb().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(VIDEO_STORE, 'readwrite');
      tx.objectStore(VIDEO_STORE).delete(key);
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error || new Error('שגיאה במחיקת סרטון')); };
    });
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
      el.style.removeProperty('background-color');

      if (options.videoBgMode === 'color') {
        const underlay = options.videoBgColor || '#2f5a28';
        el.style.setProperty('--video-underlay-color', underlay);
        el.classList.add('has-video-bg-color');
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
    }
    return;
  }

  if (options.noBg && !options.image) return;

  if (options.image) {
    el.style.backgroundImage = 'url(' + JSON.stringify(options.image) + ')';
    el.classList.add('has-image');
    el.style.setProperty('--video-fit', 'cover');
    el.style.setProperty('--video-zoom', '1');
    if (options.noBg) {
      el.style.backgroundColor = 'transparent';
    }
  }
}

function calcMediaHeight(mediaWidth, mediaHeight, containerWidth) {
  if (!mediaWidth || !mediaHeight) return 280;
  const width = containerWidth || 1000;
  const height = Math.round(width / (mediaWidth / mediaHeight));
  return Math.min(560, Math.max(160, height));
}

function applySectionMediaHeight(kind, heightPx) {
  const value = Math.min(560, Math.max(120, Number(heightPx) || 280)) + 'px';
  const el = getSectionHeightEl(kind);
  if (el) el.style.setProperty('--section-media-height', value);
}

function homeSectionLayoutFieldsHtml(home, kind) {
  const mediaType = home[kind + 'MediaType'] || 'image';
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
        '<label class="site-theme-control" for="homeFieldVideoBgColor" style="gap:10px;">' +
          '<span>צבע רקע</span>' +
          '<input type="color" id="homeFieldVideoBgColor" value="' + escapeHtml(bgColor) + '">' +
        '</label>' +
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
  if (!el) return 280;
  const raw = getComputedStyle(el).getPropertyValue('--section-media-height').trim();
  const num = parseInt(raw, 10);
  return Number.isFinite(num) ? num : (el.getBoundingClientRect().height || 280);
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
        const next = Math.min(560, Math.max(120, Math.round(startH + (ev.clientY - startY))));
        applySectionMediaHeight(kind, next);
      }

      function onUp(ev) {
        handle.classList.remove('is-dragging');
        handle.releasePointerCapture(ev.pointerId);
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);

        const finalH = getSectionMediaHeight(kind);
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

function setSectionBgOpacity(sectionEl, opacity) {
  if (!sectionEl) return;
  const value = clampBgOpacity(opacity);
  sectionEl.style.setProperty('--section-bg-opacity', String(value));
  sectionEl.classList.toggle('home-section--no-bg', value <= 0);
  sectionEl.classList.toggle('home-section--soft-bg', value > 0 && value < 45);
}

function homeBgOpacityHtml(opacity) {
  const value = clampBgOpacity(opacity);
  return (
    '<div class="form-field form-field--full">' +
      '<label for="homeFieldBgOpacity">שקיפות רקע: <strong id="homeFieldBgOpacityValue">' + value + '%</strong></label>' +
      '<input type="range" id="homeFieldBgOpacity" min="0" max="100" step="1" value="' + value + '" style="width:100%; accent-color: var(--site-secondary, #4a7c3f);">' +
      '<p class="field-subhint">0 = שקוף לגמרי · 100 = רקע מלא בצבע המשני של האתר</p>' +
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
      '<label>' + label + '</label>' +
      '<label class="upload-box" for="homeFieldImage">' +
        '<input type="file" id="homeFieldImage" accept="image/*" hidden>' +
        '<span class="upload-icon">🖼️</span>' +
        '<span class="upload-text">לחצו להעלאת תמונה / להחלפה</span>' +
      '</label>' +
      '<img class="home-edit-preview' + (imageUrl ? ' is-visible' : '') + '" id="homeFieldImagePreview" src="' + (imageUrl || '') + '" alt="">' +
      (imageUrl ? '<button type="button" class="btn-cancel" id="homeClearImage" style="margin-top:10px;">הסרת תמונה</button>' : '') +
    '</div>'
  );
}

function homeMediaFieldsHtml(options) {
  const mediaType = options.mediaType === 'video' ? 'video' : 'image';
  const imageUrl = options.imageUrl || '';
  const videoName = options.videoName || '';

  return (
    '<div id="homeMediaFieldWrap">' +
      '<div class="form-field form-field--full">' +
        '<span class="field-label">סוג מדיה</span>' +
        '<div class="action-checks">' +
          '<label class="action-check" for="homeMediaImage">' +
            '<input type="radio" name="homeMediaType" id="homeMediaImage" value="image"' +
              (mediaType === 'image' ? ' checked' : '') + '>' +
            '<span>תמונה</span>' +
          '</label>' +
          '<label class="action-check" for="homeMediaVideo">' +
            '<input type="radio" name="homeMediaType" id="homeMediaVideo" value="video"' +
              (mediaType === 'video' ? ' checked' : '') + '>' +
            '<span>סרטון</span>' +
          '</label>' +
        '</div>' +
      '</div>' +
      '<div class="form-field form-field--full" id="homeImageOnlyWrap"' + (mediaType === 'video' ? ' hidden' : '') + '>' +
        '<label>תמונה (אופציונלי)</label>' +
        '<label class="upload-box" for="homeFieldImage">' +
          '<input type="file" id="homeFieldImage" accept="image/*" hidden>' +
          '<span class="upload-icon">🖼️</span>' +
          '<span class="upload-text">לחצו להעלאת תמונה / להחלפה</span>' +
        '</label>' +
        '<img class="home-edit-preview' + (imageUrl ? ' is-visible' : '') + '" id="homeFieldImagePreview" src="' + (imageUrl || '') + '" alt="">' +
        (imageUrl ? '<button type="button" class="btn-cancel" id="homeClearImage" style="margin-top:10px;">הסרת תמונה</button>' : '') +
      '</div>' +
      '<div class="form-field form-field--full" id="homeVideoOnlyWrap"' + (mediaType === 'image' ? ' hidden' : '') + '>' +
        '<label>בחירת סרטון מהמחשב</label>' +
        '<label class="upload-box" for="homeFieldVideoFile">' +
          '<input type="file" id="homeFieldVideoFile" accept="video/*" hidden>' +
          '<span class="upload-icon">🎬</span>' +
          '<span class="upload-text">לחצו לבחירת קובץ וידאו</span>' +
        '</label>' +
        '<p class="field-subhint">הסרטון נשמר בדפדפן (לא באתר) — בלי מגבלת 4MB, ועובד גם בלי שרת.</p>' +
        '<p class="field-subhint" id="homeVideoFileName"' + (videoName ? '' : ' hidden') + '>' +
          'קובץ נוכחי: <strong dir="ltr">' + escapeHtml(videoName) + '</strong>' +
        '</p>' +
        (videoName
          ? '<button type="button" class="btn-cancel" id="homeClearVideo" style="margin-top:10px;">הסרת סרטון</button>'
          : '') +
      '</div>' +
    '</div>'
  );
}

function bindHomeNoBgToggle() {
  // רקע צבעוני לא מסתיר יותר את בחירת המדיה
}

function bindHomeMediaTypeToggle() {
  const imageRadio = document.getElementById('homeMediaImage');
  const videoRadio = document.getElementById('homeMediaVideo');
  const imageWrap = document.getElementById('homeImageOnlyWrap');
  const videoWrap = document.getElementById('homeVideoOnlyWrap');
  const layoutWrap = document.getElementById('homeLayoutFields');
  if (!imageRadio || !videoRadio || !imageWrap || !videoWrap) return;

  function sync() {
    const isVideo = videoRadio.checked;
    imageWrap.hidden = isVideo;
    videoWrap.hidden = !isVideo;
    if (layoutWrap) layoutWrap.hidden = !isVideo;
  }

  imageRadio.addEventListener('change', sync);
  videoRadio.addEventListener('change', sync);
  sync();
}

function getSelectedHomeMediaType() {
  const checked = document.querySelector('input[name="homeMediaType"]:checked');
  return checked ? checked.value : 'image';
}

function applySiteTheme(home) {
  const bgColor = home.siteBgColor || DEFAULT_HOME.siteBgColor;
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
  document.body.style.setProperty('--site-secondary', secondary);
  document.body.style.setProperty('--site-font', font);

  cardsGrid.style.setProperty('--cards-per-row', String(perRow));
  cardsGrid.style.setProperty('--cards-gap', gap + 'px');

  const colorInput = document.getElementById('siteBgColor');
  const secondaryInput = document.getElementById('siteSecondaryColor');
  const fontSelect = document.getElementById('siteFont');
  const clearBtn = document.getElementById('siteBgClear');
  const perRowInput = document.getElementById('cardsPerRow');
  const gapInput = document.getElementById('cardsGap');
  const perRowValue = document.getElementById('cardsPerRowValue');
  const gapValue = document.getElementById('cardsGapValue');

  if (colorInput) colorInput.value = bgColor;
  if (secondaryInput) secondaryInput.value = secondary;
  if (fontSelect) setFontSelectValue(fontSelect, font);
  if (clearBtn) clearBtn.hidden = !bgImage;
  if (perRowInput) perRowInput.value = String(perRow);
  if (gapInput) gapInput.value = String(gap);
  if (perRowValue) perRowValue.textContent = String(perRow);
  if (gapValue) gapValue.textContent = gap + 'px';
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

  const title = (home.title == null ? DEFAULT_HOME.title : String(home.title)).slice(0, 10);
  const subtitle = (home.subtitle == null ? DEFAULT_HOME.subtitle : String(home.subtitle)).slice(0, 10);
  const introText = home.introText == null ? DEFAULT_HOME.introText : String(home.introText);
  const closingText = home.closingText == null ? DEFAULT_HOME.closingText : String(home.closingText);

  setOptionalText(document.getElementById('homeTitle'), title, 10);
  setOptionalText(document.getElementById('homeSubtitle'), subtitle, 10);
  setOptionalText(document.getElementById('homeIntroText'), introText);
  setOptionalText(document.getElementById('homeClosingText'), closingText);

  if (home.hasIntro2) {
    setOptionalText(document.getElementById('homeIntro2Subtitle'), home.intro2Subtitle || '', 10);
    setOptionalText(document.getElementById('homeIntro2Text'), home.intro2Text || '');
  }
  if (home.hasClosing2) {
    setOptionalText(document.getElementById('homeClosing2Text'), home.closing2Text || '');
  }

  setSectionBackground(
    document.getElementById('homeHeroBg'),
    home.titleImage || ''
  );

  const mediaJobs = [];
  const kinds = ['intro', 'closing'];
  if (home.hasIntro2) kinds.push('intro2');
  if (home.hasClosing2) kinds.push('closing2');

  kinds.forEach(function (kind) {
    const removedKey = kind + 'VideoRemoved';
    const fileKey = kind + 'VideoFile';
    const hasVideo = previewOptions[removedKey]
      ? false
      : !!(previewOptions[fileKey] || home[kind + 'Video']);

    mediaJobs.push(setSectionMedia(getSectionBgEl(kind), {
      noBg: clampBgOpacity(home[kind + 'BgOpacity']) <= 0,
      mediaType: home[kind + 'MediaType'] || 'image',
      image: home[kind + 'Image'] || '',
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
    } else if ((home[kind + 'MediaType'] || 'image') !== 'video' || !hasVideo) {
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

  setSectionBgOpacity(document.getElementById('homeHero'), home.titleBgOpacity);
  setSectionBgOpacity(document.getElementById('homeIntro'), home.introBgOpacity);
  setSectionBgOpacity(document.getElementById('homeClosing'), home.closingBgOpacity);
  if (home.hasIntro2) setSectionBgOpacity(document.getElementById('homeIntro2'), home.intro2BgOpacity);
  if (home.hasClosing2) setSectionBgOpacity(document.getElementById('homeClosing2'), home.closing2BgOpacity);

  renderHomeLogo(home);
  syncHomeSectionControls(home);
  applySiteTheme(home);
  document.title = title.trim() || 'פורטל תוכן';
}

function renderHomeLogo(home) {
  const section = document.getElementById('homeLogoSection');
  const wrap = document.getElementById('homeLogoWrap');
  const img = document.getElementById('homeLogo');
  if (!section || !wrap || !img) return;

  const enabled = !!home.titleLogoEnabled && !!home.titleLogo;
  const showInEdit = !!editMode;
  const align = home.titleLogoAlign === 'left' ? 'left' : 'right';

  section.hidden = !enabled && !showInEdit;
  section.classList.toggle('home-logo-section--empty', !enabled);
  section.classList.toggle('home-logo-section--left', align === 'left');
  section.classList.toggle('home-logo-section--right', align === 'right');

  wrap.hidden = !enabled;
  wrap.classList.toggle('is-link', enabled && !!home.titleLogoLink);

  if (!enabled) {
    img.removeAttribute('src');
    img.alt = '';
    wrap.removeAttribute('href');
    wrap.removeAttribute('target');
    wrap.removeAttribute('rel');
    return;
  }

  img.src = home.titleLogo;
  img.alt = 'לוגו יחידה';

  if (home.titleLogoLink) {
    wrap.href = home.titleLogoLink;
    wrap.target = '_blank';
    wrap.rel = 'noopener noreferrer';
  } else {
    wrap.removeAttribute('href');
    wrap.removeAttribute('target');
    wrap.removeAttribute('rel');
  }
}

let editingHomeSection = null;
let homeEditImageData = '';
let homeEditVideoFile = null;
let homeEditVideoRemoved = false;
let homeEditLogoData = '';
let homeEditSnapshot = null;
let homeEditCommitted = false;
let homeEditPreviewTimer = null;

const homeEditOverlay = document.getElementById('homeEditOverlay');
const homeEditFields = document.getElementById('homeEditFields');
const homeEditForm = document.getElementById('homeEditForm');
const homeEditTitle = document.getElementById('homeEditTitle');

function buildHomeDraftFromEditor() {
  const home = JSON.parse(JSON.stringify(homeEditSnapshot || loadHome()));

  if (editingHomeSection === 'hero') {
    const titleEl = document.getElementById('homeFieldTitle');
    const opacityEl = document.getElementById('homeFieldBgOpacity');
    if (titleEl) home.title = titleEl.value.trim().slice(0, 10);
    if (opacityEl) home.titleBgOpacity = clampBgOpacity(opacityEl.value);
    home.titleImage = homeEditImageData || '';
  }

  if (editingHomeSection === 'logo') {
    const enabledEl = document.getElementById('homeFieldLogoEnabled');
    const linkEl = document.getElementById('homeFieldLogoLink');
    const alignChecked = document.querySelector('input[name="homeLogoAlign"]:checked');
    home.titleLogoEnabled = !!(enabledEl && enabledEl.checked);
    home.titleLogoAlign = alignChecked && alignChecked.value === 'left' ? 'left' : 'right';
    if (home.titleLogoEnabled) {
      home.titleLogo = homeEditLogoData || '';
      home.titleLogoLink = linkEl ? linkEl.value.trim() : '';
    } else {
      home.titleLogo = '';
      home.titleLogoLink = '';
    }
  }

  if (editingHomeSection === 'intro' || editingHomeSection === 'intro2') {
    const kind = editingHomeSection;
    const subtitleEl = document.getElementById('homeFieldSubtitle');
    const introEl = document.getElementById('homeFieldIntro');
    const opacityEl = document.getElementById('homeFieldBgOpacity');
    if (kind === 'intro') {
      if (subtitleEl) home.subtitle = subtitleEl.value.trim().slice(0, 10);
    } else if (subtitleEl) {
      home.intro2Subtitle = subtitleEl.value.trim().slice(0, 10);
    }
    if (introEl) home[kind + 'Text'] = introEl.value.trim();
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
    if (closingEl) home[kind + 'Text'] = closingEl.value.trim();
    if (opacityEl) home[kind + 'BgOpacity'] = clampBgOpacity(opacityEl.value);
    home[kind + 'MediaType'] = getSelectedHomeMediaType();
    readHomeLayoutFields(home, kind);
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

function scheduleHomeEditorPreview() {
  if (!editingHomeSection || !homeEditSnapshot) return;
  clearTimeout(homeEditPreviewTimer);
  homeEditPreviewTimer = setTimeout(function () {
    renderHome(buildHomeDraftFromEditor(), getHomeEditorPreviewOptions());
  }, 50);
}

function bindHomeEditorLivePreview() {
  if (!homeEditFields || homeEditFields.dataset.livePreviewBound === '1') return;
  homeEditFields.dataset.livePreviewBound = '1';
  homeEditFields.addEventListener('input', scheduleHomeEditorPreview);
  homeEditFields.addEventListener('change', scheduleHomeEditorPreview);
}

function openHomeEditor(section) {
  const home = loadHome();
  editingHomeSection = section;
  homeEditSnapshot = JSON.parse(JSON.stringify(home));
  homeEditCommitted = false;
  homeEditImageData = '';
  homeEditVideoFile = null;
  homeEditVideoRemoved = false;
  homeEditLogoData = '';

  let fieldsHtml = '';
  let title = 'עריכת מקטע';

  if (section === 'hero') {
    title = 'עריכת כותרת';
    homeEditImageData = home.titleImage || '';
    fieldsHtml =
      '<div class="form-field form-field--full">' +
        '<label for="homeFieldTitle">כותרת (עד 10 תווים, אופציונלי)</label>' +
        '<input type="text" id="homeFieldTitle" value="' + escapeHtml((home.title || '').slice(0, 10)) + '" maxlength="10">' +
      '</div>' +
      homeBgOpacityHtml(home.titleBgOpacity) +
      homeImageFieldHtml(home.titleImage, 'תמונת כותרת (אופציונלי)');
  }

  if (section === 'logo') {
    title = 'עריכת לוגו';
    homeEditLogoData = home.titleLogo || '';
    fieldsHtml = homeLogoFieldsHtml(home);
  }

  if (section === 'intro' || section === 'intro2') {
    title = section === 'intro' ? 'עריכת כותרת משנה ופתיח' : 'עריכת פתיח 2';
    homeEditImageData = home[section + 'Image'] || '';
    const subtitleValue = section === 'intro'
      ? (home.subtitle || '')
      : (home.intro2Subtitle || '');
    fieldsHtml =
      '<div class="form-field form-field--full">' +
        '<label for="homeFieldSubtitle">כותרת משנה (עד 10 תווים, אופציונלי)</label>' +
        '<input type="text" id="homeFieldSubtitle" value="' + escapeHtml(subtitleValue.slice(0, 10)) + '" maxlength="10">' +
      '</div>' +
      '<div class="form-field form-field--full">' +
        '<label for="homeFieldIntro">טקסט פתיח (אופציונלי)</label>' +
        '<textarea id="homeFieldIntro" rows="4">' + escapeHtml(home[section + 'Text'] || '') + '</textarea>' +
      '</div>' +
      homeBgOpacityHtml(home[section + 'BgOpacity']) +
      homeMediaFieldsHtml({
        mediaType: home[section + 'MediaType'] || 'image',
        imageUrl: home[section + 'Image'] || '',
        videoName: home[section + 'Video'] || '',
      }) +
      homeSectionLayoutFieldsHtml(home, section);
  }

  if (section === 'closing' || section === 'closing2') {
    title = section === 'closing' ? 'עריכת סגירה' : 'עריכת סגירה 2';
    homeEditImageData = home[section + 'Image'] || '';
    fieldsHtml =
      '<div class="form-field form-field--full">' +
        '<label for="homeFieldClosing">טקסט סגירה (אופציונלי)</label>' +
        '<textarea id="homeFieldClosing" rows="4">' + escapeHtml(home[section + 'Text'] || '') + '</textarea>' +
      '</div>' +
      homeBgOpacityHtml(home[section + 'BgOpacity']) +
      homeMediaFieldsHtml({
        mediaType: home[section + 'MediaType'] || 'image',
        imageUrl: home[section + 'Image'] || '',
        videoName: home[section + 'Video'] || '',
      }) +
      homeSectionLayoutFieldsHtml(home, section);
  }

  homeEditTitle.textContent = title;
  homeEditFields.innerHTML = fieldsHtml;
  homeEditOverlay.hidden = false;
  homeEditOverlay.classList.add('home-edit-live');

  bindHomeNoBgToggle();
  bindHomeMediaTypeToggle();
  bindHomeLogoToggle();
  bindHomeLayoutFields();
  bindHomeBgOpacityField();
  bindHomeEditorMediaInputs();
  bindHomeEditorLogoInputs();
  bindHomeEditorLivePreview();
}

function homeLogoFieldsHtml(home) {
  const enabled = !!home.titleLogoEnabled;
  const logo = home.titleLogo || '';
  const link = home.titleLogoLink || '';
  const align = home.titleLogoAlign === 'left' ? 'left' : 'right';

  return (
    '<div class="form-field form-field--full">' +
      '<label class="checkbox-label" for="homeFieldLogoEnabled" style="margin-top:0;">' +
        '<input type="checkbox" id="homeFieldLogoEnabled"' + (enabled ? ' checked' : '') + '>' +
        '<span>לוגו</span>' +
      '</label>' +
      '<p class="field-subhint">הוספת לוגו יחידה בשורה מעל הכותרת, עם קישור אופציונלי לאתר</p>' +
    '</div>' +
    '<div id="homeLogoFieldsWrap"' + (enabled ? '' : ' hidden') + '>' +
      '<div class="form-field form-field--full">' +
        '<label>תמונת לוגו</label>' +
        '<label class="upload-box" for="homeFieldLogo">' +
          '<input type="file" id="homeFieldLogo" accept="image/*" hidden>' +
          '<span class="upload-icon">🏷️</span>' +
          '<span class="upload-text">לחצו להעלאת לוגו (תומך בשקיפות PNG)</span>' +
        '</label>' +
        '<img class="home-edit-preview' + (logo ? ' is-visible' : '') + '" id="homeFieldLogoPreview" src="' + (logo || '') + '" alt="">' +
        (logo ? '<button type="button" class="btn-cancel" id="homeClearLogo" style="margin-top:10px;">הסרת לוגו</button>' : '') +
      '</div>' +
      '<div class="form-field form-field--full">' +
        '<span class="field-label">מיקום הלוגו</span>' +
        '<div class="action-checks">' +
          '<label class="action-check" for="homeLogoAlignRight">' +
            '<input type="radio" name="homeLogoAlign" id="homeLogoAlignRight" value="right"' +
              (align === 'right' ? ' checked' : '') + '>' +
            '<span>ימין</span>' +
          '</label>' +
          '<label class="action-check" for="homeLogoAlignLeft">' +
            '<input type="radio" name="homeLogoAlign" id="homeLogoAlignLeft" value="left"' +
              (align === 'left' ? ' checked' : '') + '>' +
            '<span>שמאל</span>' +
          '</label>' +
        '</div>' +
      '</div>' +
      '<div class="form-field form-field--full">' +
        '<label for="homeFieldLogoLink">קישור לאתר (אופציונלי)</label>' +
        '<input type="text" id="homeFieldLogoLink" placeholder="https://..." value="' + escapeHtml(link) + '">' +
      '</div>' +
    '</div>'
  );
}

function bindHomeLogoToggle() {
  const checkbox = document.getElementById('homeFieldLogoEnabled');
  const wrap = document.getElementById('homeLogoFieldsWrap');
  if (!checkbox || !wrap) return;

  function sync() {
    wrap.hidden = !checkbox.checked;
  }

  checkbox.addEventListener('change', sync);
  sync();
}

function bindHomeEditorLogoInputs() {
  const logoInput = document.getElementById('homeFieldLogo');
  if (logoInput) {
    logoInput.addEventListener('change', async function (e) {
      const file = e.target.files[0];
      if (!file) return;
      homeEditLogoData = await readFileAsDataURL(file, 400, null, true);
      const preview = document.getElementById('homeFieldLogoPreview');
      preview.src = homeEditLogoData;
      preview.classList.add('is-visible');
      scheduleHomeEditorPreview();
    });
  }

  const clearLogo = document.getElementById('homeClearLogo');
  if (clearLogo) {
    clearLogo.addEventListener('click', function () {
      homeEditLogoData = '';
      const preview = document.getElementById('homeFieldLogoPreview');
      preview.src = '';
      preview.classList.remove('is-visible');
      clearLogo.remove();
      scheduleHomeEditorPreview();
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
  const shouldRevert = !homeEditCommitted && !!homeEditSnapshot;
  homeEditOverlay.hidden = true;
  homeEditOverlay.classList.remove('home-edit-live');
  editingHomeSection = null;
  homeEditImageData = '';
  homeEditVideoFile = null;
  homeEditVideoRemoved = false;
  homeEditLogoData = '';

  if (shouldRevert) {
    renderHome();
  }

  homeEditSnapshot = null;
  homeEditCommitted = false;
}

async function saveHomeEditor(e) {
  e.preventDefault();
  if (!editingHomeSection) return;

  const home = loadHome();

  if (editingHomeSection === 'hero') {
    home.title = document.getElementById('homeFieldTitle').value.trim().slice(0, 10);
    home.titleBgOpacity = clampBgOpacity(document.getElementById('homeFieldBgOpacity').value);
    home.titleImage = homeEditImageData || '';
  }

  if (editingHomeSection === 'logo') {
    home.titleLogoEnabled = document.getElementById('homeFieldLogoEnabled').checked;
    const alignChecked = document.querySelector('input[name="homeLogoAlign"]:checked');
    home.titleLogoAlign = alignChecked && alignChecked.value === 'left' ? 'left' : 'right';
    if (home.titleLogoEnabled) {
      home.titleLogo = homeEditLogoData || '';
      home.titleLogoLink = document.getElementById('homeFieldLogoLink').value.trim();
    } else {
      home.titleLogo = '';
      home.titleLogoLink = '';
    }
  }

  if (editingHomeSection === 'intro' || editingHomeSection === 'intro2') {
    const kind = editingHomeSection;
    if (kind === 'intro') {
      home.subtitle = document.getElementById('homeFieldSubtitle').value.trim().slice(0, 10);
    } else {
      home.intro2Subtitle = document.getElementById('homeFieldSubtitle').value.trim().slice(0, 10);
    }
    home[kind + 'Text'] = document.getElementById('homeFieldIntro').value.trim();
    home[kind + 'BgOpacity'] = clampBgOpacity(document.getElementById('homeFieldBgOpacity').value);
    home[kind + 'MediaType'] = getSelectedHomeMediaType();
    readHomeLayoutFields(home, kind);
    if (home[kind + 'MediaType'] === 'video') {
      try {
        if (homeEditVideoRemoved) {
          await deleteHomeVideo(kind);
          home[kind + 'Video'] = '';
        } else if (homeEditVideoFile) {
          await putHomeVideo(kind, homeEditVideoFile);
          home[kind + 'Video'] = homeEditVideoFile.name;
          home[kind + 'SizeAuto'] = true;
        }
      } catch (err) {
        alert(err.message || 'שגיאה בשמירת הסרטון');
        return;
      }
    } else {
      home[kind + 'Image'] = homeEditImageData || '';
    }
  }

  if (editingHomeSection === 'closing' || editingHomeSection === 'closing2') {
    const kind = editingHomeSection;
    home[kind + 'Text'] = document.getElementById('homeFieldClosing').value.trim();
    home[kind + 'BgOpacity'] = clampBgOpacity(document.getElementById('homeFieldBgOpacity').value);
    home[kind + 'MediaType'] = getSelectedHomeMediaType();
    readHomeLayoutFields(home, kind);
    if (home[kind + 'MediaType'] === 'video') {
      try {
        if (homeEditVideoRemoved) {
          await deleteHomeVideo(kind);
          home[kind + 'Video'] = '';
        } else if (homeEditVideoFile) {
          await putHomeVideo(kind, homeEditVideoFile);
          home[kind + 'Video'] = homeEditVideoFile.name;
          home[kind + 'SizeAuto'] = true;
        }
      } catch (err) {
        alert(err.message || 'שגיאה בשמירת הסרטון');
        return;
      }
    } else {
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

document.getElementById('siteBgColor').addEventListener('input', function (e) {
  updateHomeField({ siteBgColor: e.target.value });
});

document.getElementById('siteSecondaryColor').addEventListener('input', function (e) {
  updateHomeField({ siteSecondaryColor: e.target.value });
});

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

bindLiveInputs();
bindSectionResizeHandles();
syncResizeHandlesVisibility();

async function initApp() {
  try {
    await loadAndRegisterCustomFonts();
  } catch (err) {
    console.warn('Custom fonts unavailable', err);
  }
  populateFontSelects();
  renderHome();
  renderCards(loadCards());
}

initApp();
