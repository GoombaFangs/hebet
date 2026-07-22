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

function getCardImageStyle(card) {
  if (card.mainImage) {
    return 'background-image: url(' + JSON.stringify(card.mainImage) + '); background-size: cover; background-position: center;';
  }
  if (card.primaryColor && card.secondaryColor) {
    return 'background: linear-gradient(135deg, ' + card.primaryColor + ', ' + card.secondaryColor + ');';
  }
  return 'background: ' + (card.gradient || GRADIENTS[0]) + ';';
}

function buildCardInner(card) {
  const typeTag = card.projectType || 'מצגת';
  const classTag = card.classification || 'שמור';
  const primary = card.primaryColor || '#e87722';
  const href = card.projectLink || card.link || '';
  const logoHtml = card.logo
    ? '<img class="card-logo" src="' + card.logo + '" alt="">'
    : '';
  const unitLine = card.unitName
    ? '<p class="card-unit">' + escapeHtml(card.unitName) + '</p>'
    : '';
  const desc = card.notes || card.description || '';

  return (
    '<div class="card-image" style="' + getCardImageStyle(card) + '">' +
      logoHtml +
      '<span class="card-title">' + escapeHtml(card.title) + '</span>' +
    '</div>' +
    '<div class="card-body">' +
      unitLine +
      '<p>' + escapeHtml(desc) + '</p>' +
    '</div>' +
    '<div class="card-footer">' +
      '<button type="button" class="btn-primary btn-view" data-link="' + escapeHtml(href) + '" style="background-color: ' + primary + ';">צפייה</button>' +
      '<div class="btn-tags">' +
        '<span class="btn-tag">' + escapeHtml(typeTag) + '</span>' +
        '<span class="btn-tag">' + escapeHtml(classTag) + '</span>' +
      '</div>' +
    '</div>'
  );
}

function renderCards(cards) {
  if (editMode) {
    cardsGrid.innerHTML = cards.map(function (card, index) {
      return (
        '<div class="card card--editing" draggable="true" data-id="' + card.id + '" style="animation-delay: ' + (index % 3) * 0.08 + 's">' +
          '<button type="button" class="card-delete" data-id="' + card.id + '" aria-label="מחיקת כרטיס">×</button>' +
          buildCardInner(card) +
        '</div>'
      );
    }).join('');
    setupDragAndDrop();
    setupDeleteButtons();
  } else {
    cardsGrid.innerHTML = cards.map(function (card) {
      return (
        '<div class="card card--clickable" data-id="' + card.id + '" role="button" tabindex="0">' +
          buildCardInner(card) +
        '</div>'
      );
    }).join('');
    setupCardClicks();
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

function setupCardClicks() {
  cardsGrid.querySelectorAll('.card--clickable').forEach(function (cardEl) {
    cardEl.addEventListener('click', function (e) {
      if (e.target.closest('.btn-view')) return;
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
const detailContent = document.getElementById('detailContent');
const detailClose = document.getElementById('detailClose');

let detailOriginRect = null;

function buildDetailHtml(card) {
  const primary = card.primaryColor || '#e87722';
  const secondary = card.secondaryColor || '#4a7c3f';
  const link = card.projectLink || card.link || '';
  const notes = card.notes || card.description || '—';

  const extras = (card.extraImages || []).map(function (src) {
    return '<img src="' + src + '" alt="">';
  }).join('');

  const logoBlock = card.logo
    ? '<div class="detail-logo-wrap"><img src="' + card.logo + '" alt="לוגו"></div>'
    : '';

  return (
    '<div class="detail-hero" style="' + getCardImageStyle(card) + '">' +
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
      '<div class="detail-colors">' +
        '<span class="detail-color-chip" style="background:' + primary + '" title="צבע ראשי"></span>' +
        '<span class="detail-color-chip" style="background:' + secondary + '" title="צבע משני"></span>' +
        '<span class="detail-color-label">צבעי מותג</span>' +
      '</div>' +
      (extras ? '<div class="detail-extras"><h4>תמונות נוספות</h4><div class="detail-extras-grid">' + extras + '</div></div>' : '') +
      (link
        ? '<a class="detail-open-link" href="' + escapeHtml(link) + '" target="_blank" rel="noopener" style="background:' + primary + ';">פתיחת קישור ←</a>'
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

function openCardDetail(id, cardEl) {
  const card = loadCards().find(function (c) { return c.id === id; });
  if (!card) return;

  detailOriginRect = cardEl.getBoundingClientRect();
  detailContent.innerHTML = buildDetailHtml(card);

  detailOverlay.hidden = false;
  detailFly.classList.remove('is-open', 'is-closing');

  // מיקום התחלתי = מיקום הריבוע
  detailFly.style.transition = 'none';
  detailFly.style.top = detailOriginRect.top + 'px';
  detailFly.style.left = detailOriginRect.left + 'px';
  detailFly.style.width = detailOriginRect.width + 'px';
  detailFly.style.height = detailOriginRect.height + 'px';
  detailFly.style.transform = 'rotateY(0deg) scale(1)';
  detailFly.style.borderRadius = '10px';

  cardEl.classList.add('card--ghost');

  // מפעילים אנימציה למרכז
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      detailFly.style.transition = '';
      detailFly.classList.add('is-open');
      detailFly.style.top = '';
      detailFly.style.left = '';
      detailFly.style.width = '';
      detailFly.style.height = '';
      detailFly.style.transform = '';
      detailFly.style.borderRadius = '';
    });
  });
}

function closeCardDetail() {
  if (detailOverlay.hidden) return;

  const ghost = document.querySelector('.card--ghost');

  if (detailOriginRect) {
    detailFly.classList.add('is-closing');
    detailFly.classList.remove('is-open');
    detailFly.style.top = detailOriginRect.top + 'px';
    detailFly.style.left = detailOriginRect.left + 'px';
    detailFly.style.width = detailOriginRect.width + 'px';
    detailFly.style.height = detailOriginRect.height + 'px';
    detailFly.style.transform = 'rotateY(90deg) scale(0.85)';
    detailFly.style.borderRadius = '10px';
    detailFly.style.opacity = '0';
  }

  setTimeout(function () {
    detailOverlay.hidden = true;
    detailFly.classList.remove('is-open', 'is-closing');
    detailFly.style.top = '';
    detailFly.style.left = '';
    detailFly.style.width = '';
    detailFly.style.height = '';
    detailFly.style.transform = '';
    detailFly.style.borderRadius = '';
    detailFly.style.opacity = '';
    detailFly.style.transition = '';
    if (ghost) ghost.classList.remove('card--ghost');
    detailOriginRect = null;
  }, 420);
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
  const title = wizardData.pageName || 'שם הדף';
  const unit = wizardData.unitName;
  const notes = wizardData.notes || 'התיאור יופיע כאן...';
  const typeTag = wizardData.projectType || 'סוג';
  const classTag = wizardData.classification || 'סיווג';
  const primary = wizardData.primaryColor || '#e87722';
  const secondary = wizardData.secondaryColor || '#4a7c3f';

  let imageStyle;
  if (wizardData.mainImage) {
    imageStyle = 'background-image: url(' + JSON.stringify(wizardData.mainImage) + '); background-size: cover; background-position: center;';
  } else {
    imageStyle = 'background: linear-gradient(135deg, ' + primary + ', ' + secondary + ');';
  }

  const logoHtml = wizardData.logo
    ? '<img class="card-logo" src="' + wizardData.logo + '" alt="">'
    : '';
  const unitHtml = unit
    ? '<p class="card-unit">' + escapeHtml(unit) + '</p>'
    : '';
  const metaBits = [];
  if (wizardData.status) metaBits.push(wizardData.status);
  if (wizardData.date) metaBits.push(formatDate(wizardData.date));
  const metaHtml = metaBits.length
    ? '<p class="card-meta">' + escapeHtml(metaBits.join(' · ')) + '</p>'
    : '';

  return (
    '<div class="card card--preview">' +
      '<div class="card-image" style="' + imageStyle + '">' +
        logoHtml +
        '<span class="card-title">' + escapeHtml(title) + '</span>' +
      '</div>' +
      '<div class="card-body">' +
        unitHtml +
        '<p>' + escapeHtml(notes) + '</p>' +
        metaHtml +
      '</div>' +
      '<div class="card-footer">' +
        '<span class="btn-primary" style="background-color: ' + primary + ';">צפייה</span>' +
        '<div class="btn-tags">' +
          '<span class="btn-tag">' + escapeHtml(typeTag) + '</span>' +
          '<span class="btn-tag">' + escapeHtml(classTag) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>'
  );
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

function readFileAsDataURL(file, maxWidth) {
  maxWidth = maxWidth || 900;
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = function () { resolve(reader.result); };
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function syncFormToData() {
  wizardData.pageName = document.getElementById('pageName').value;
  wizardData.unitName = document.getElementById('unitName').value;
  wizardData.notes = document.getElementById('notes').value;
  wizardData.date = document.getElementById('cardDate').value;
  wizardData.status = document.getElementById('status').value;
  wizardData.classification = document.getElementById('classification').value;
  wizardData.projectType = document.getElementById('projectType').value;
  wizardData.projectLink = document.getElementById('projectLink').value;
  wizardData.primaryColor = document.getElementById('primaryColor').value;
  wizardData.secondaryColor = document.getElementById('secondaryColor').value;

  document.getElementById('primaryColorHex').textContent = wizardData.primaryColor;
  document.getElementById('secondaryColorHex').textContent = wizardData.secondaryColor;
}

function bindLiveInputs() {
  const liveIds = [
    'pageName', 'unitName', 'notes', 'cardDate', 'status',
    'classification', 'projectType', 'projectLink',
    'primaryColor', 'secondaryColor',
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
    wizardData.mainImage = await readFileAsDataURL(file, 900);
    document.getElementById('mainImageText').hidden = true;
    const preview = document.getElementById('mainImagePreview');
    preview.src = wizardData.mainImage;
    preview.hidden = false;
    updateLivePreview();
  });

  document.getElementById('logoImage').addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (!file) return;
    wizardData.logo = await readFileAsDataURL(file, 300);
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

function openWizard() {
  resetWizardData();
  wizardForm.reset();
  currentStep = 1;

  document.getElementById('primaryColor').value = wizardData.primaryColor;
  document.getElementById('secondaryColor').value = wizardData.secondaryColor;
  document.getElementById('primaryColorHex').textContent = wizardData.primaryColor;
  document.getElementById('secondaryColorHex').textContent = wizardData.secondaryColor;

  document.getElementById('mainImageText').hidden = false;
  document.getElementById('mainImagePreview').hidden = true;
  document.getElementById('mainImagePreview').src = '';
  document.getElementById('logoImageText').hidden = false;
  document.getElementById('logoImagePreview').hidden = true;
  document.getElementById('logoImagePreview').src = '';
  document.getElementById('extraImagesText').textContent = 'העלאה (אופציונלי)';
  document.getElementById('extraThumbs').innerHTML = '';

  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('cardDate').value = today;
  wizardData.date = today;

  modalOverlay.hidden = false;
  updateStepUI();
  document.getElementById('pageName').focus();
}

function closeWizard() {
  modalOverlay.hidden = true;
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

  const projectLink = normalizeProjectLink(wizardData.projectLink);
  const id = createCardId();
  const newCard = {
    id: id,
    title: wizardData.pageName.trim(),
    unitName: wizardData.unitName.trim(),
    description: wizardData.notes.trim() || 'כרטיס חדש',
    notes: wizardData.notes.trim(),
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
    gradient: 'linear-gradient(135deg, ' + wizardData.primaryColor + ', ' + wizardData.secondaryColor + ')',
  };

  const cards = loadCards();
  cards.push(newCard);

  let saved = saveCards(cards);

  // אם אין מקום בזיכרון — מנסים בלי תמונות נוספות
  if (!saved && newCard.extraImages.length) {
    newCard.extraImages = [];
    cards[cards.length - 1] = newCard;
    saved = saveCards(cards);
  }

  // ניסיון אחרון — בלי לוגו
  if (!saved && newCard.logo) {
    newCard.logo = '';
    cards[cards.length - 1] = newCard;
    saved = saveCards(cards);
  }

  if (!saved) {
    showError('אין מספיק מקום לשמירה. נסו תמונה קטנה יותר וחזרו על סיום.');
    return;
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
