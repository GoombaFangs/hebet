const STORAGE_KEY = 'hebet-cards';

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
    projectLink: '',
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

function buildCardInner(card) {
  const typeTag = card.projectType || 'מצגת';
  const classTag = card.classification || 'שמור';
  const primary = card.primaryColor || '#e87722';
  const secondary = card.secondaryColor || '#4a7c3f';
  const href = card.projectLink || card.link || '';
  const logoHtml = card.logo
    ? '<img class="card-logo" src="' + card.logo + '" alt="">'
    : '';
  const titleRaw = (card.title || '').slice(0, 10);
  const unitRaw = (card.unitName || '').slice(0, 10);
  const unitLine = unitRaw
    ? '<p class="card-unit">' + escapeHtml(unitRaw) + '</p>'
    : '';
  const desc = card.notes || card.description || '';

  return (
    '<div class="card-image' + (shouldShowImageBg(card) ? ' card-image--photo' : '') + '" style="' + getCardImageStyle(card) + '">' +
      getCardBgPhotoHtml(card) +
      logoHtml +
      '<span class="card-title">' + escapeHtml(titleRaw) + '</span>' +
    '</div>' +
    '<div class="card-body">' +
      unitLine +
      '<p class="card-notes">' + formatNotesHtml(desc) + '</p>' +
    '</div>' +
    '<div class="card-footer">' +
      '<button type="button" class="btn-primary btn-view" data-link="' + escapeHtml(href) + '" style="background-color:' + primary + ';">צפייה</button>' +
      '<div class="btn-tags">' +
        '<span class="btn-tag" style="border-color:' + secondary + ';color:' + secondary + ';">' + escapeHtml(typeTag) + '</span>' +
        '<span class="btn-tag" style="border-color:' + secondary + ';color:' + secondary + ';">' + escapeHtml(classTag) + '</span>' +
      '</div>' +
    '</div>'
  );
}

function renderCards(cards) {
  if (editMode) {
    cardsGrid.innerHTML = cards.map(function (card, index) {
      return (
        '<div class="card card--editing" draggable="true" data-id="' + card.id + '" style="animation-delay: ' + (index % 3) * 0.08 + 's; ' + getCardThemeStyle(card) + '">' +
          '<button type="button" class="card-edit" data-id="' + card.id + '" aria-label="עריכת כרטיס" title="עריכה">✎</button>' +
          '<button type="button" class="card-delete" data-id="' + card.id + '" aria-label="מחיקת כרטיס">×</button>' +
          buildCardInner(card) +
        '</div>'
      );
    }).join('');
    setupDragAndDrop();
    setupDeleteButtons();
    setupEditButtons();
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

function setupCardClicks() {
  cardsGrid.querySelectorAll('.card--clickable').forEach(function (cardEl) {
    cardEl.addEventListener('click', function (e) {
      if (e.target.closest('.btn-view') || e.target.closest('.card-edit')) return;
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
      const link = btn.dataset.link;
      if (!link) {
        alert('אין קישור לכרטיס זה');
        return;
      }
      window.open(link, '_blank', 'noopener');
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
  const link = card.projectLink || card.link || '';
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
      (link
        ? '<a class="detail-open-link" href="' + escapeHtml(link) + '" target="_blank" rel="noopener">פתיחת קישור ←</a>'
        : '') +
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
    projectLink: '',
    link: '',
  };

  const metaBits = [];
  if (wizardData.status) metaBits.push(wizardData.status);
  if (wizardData.date) metaBits.push(formatDate(wizardData.date));
  const metaHtml = metaBits.length
    ? '<p class="card-meta">' + escapeHtml(metaBits.join(' · ')) + '</p>'
    : '';

  let inner = buildCardInner(previewCard);
  if (metaHtml) {
    inner = inner.replace('</div>\n      <div class="card-footer">', metaHtml + '</div><div class="card-footer">');
    // fallback without newlines
    if (inner.indexOf(metaHtml) === -1) {
      inner = inner.replace('</div><div class="card-footer">', metaHtml + '</div><div class="card-footer">');
    }
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
    if (!wizardData.projectLink.trim()) return 'קישור לפרויקט הוא שדה חובה';
    try {
      const url = new URL(normalizeProjectLink(wizardData.projectLink));
      if (!/^https?:$/.test(url.protocol)) return 'הקישור חייב להיות כתובת אינטרנט תקינה';
    } catch {
      return 'הקישור אינו תקין — הזינו כתובת (למשל https://...)';
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
  wizardData.projectLink = document.getElementById('projectLink').value;
  wizardData.primaryColor = document.getElementById('primaryColor').value;
  wizardData.secondaryColor = document.getElementById('secondaryColor').value;
  wizardData.fontFamily = document.getElementById('cardFont').value;
  wizardData.useImageBg = document.getElementById('useImageBg').checked;

  document.getElementById('primaryColorHex').textContent = wizardData.primaryColor;
  document.getElementById('secondaryColorHex').textContent = wizardData.secondaryColor;
}

function bindLiveInputs() {
  const liveIds = [
    'pageName', 'unitName', 'notes', 'cardDate', 'status',
    'classification', 'projectType', 'projectLink',
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

  document.getElementById('mainImage').addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    // יחס משוער של אזור התמונה בכרטיס
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
  document.getElementById('projectLink').value = wizardData.projectLink || '';
  document.getElementById('primaryColor').value = wizardData.primaryColor || '#e87722';
  document.getElementById('secondaryColor').value = wizardData.secondaryColor || '#4a7c3f';
  document.getElementById('primaryColorHex').textContent = wizardData.primaryColor || '#e87722';
  document.getElementById('secondaryColorHex').textContent = wizardData.secondaryColor || '#4a7c3f';
  document.getElementById('cardFont').value = wizardData.fontFamily || "'Segoe UI', Tahoma, Arial, sans-serif";
  document.getElementById('useImageBg').checked = wizardData.useImageBg !== false;
  fillMediaPreviews();
}

function updateWizardChrome() {
  const isEdit = !!editingCardId;
  document.getElementById('wizardTitle').textContent = isEdit ? 'עריכת כרטיס' : 'יצירת כרטיס חדש';
  btnFinish.textContent = isEdit ? '✓ שמירת שינויים' : '✓ שמירה';
}

function buildCardFromWizard(id) {
  const projectLink = normalizeProjectLink(wizardData.projectLink);
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
    projectLink: projectLink,
    link: projectLink,
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

function openWizard() {
  editingCardId = null;
  resetWizardData();
  wizardForm.reset();
  currentStep = 1;

  const today = new Date().toISOString().slice(0, 10);
  wizardData.date = today;
  wizardData.useImageBg = true;
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
  wizardData.projectLink = card.projectLink || card.link || '';
  wizardData.mainImage = card.mainImage || '';
  wizardData.extraImages = (card.extraImages || []).slice();
  wizardData.logo = card.logo || '';
  wizardData.primaryColor = card.primaryColor || '#e87722';
  wizardData.secondaryColor = card.secondaryColor || '#4a7c3f';
  wizardData.fontFamily = card.fontFamily || "'Segoe UI', Tahoma, Arial, sans-serif";
  wizardData.useImageBg = card.useImageBg !== false;

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

/* ===== אירועים ===== */

btnNew.addEventListener('click', openWizard);
btnEdit.addEventListener('click', toggleEditMode);
btnCancel.addEventListener('click', closeWizard);

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
    if (!detailOverlay.hidden) {
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
renderCards(loadCards());
