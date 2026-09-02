/* ===== מחולל מארז — כותרת עליונה ===== */
(function () {
  const STORAGE_KEY = 'hebet-pack';
  const HEIGHT_MIN = 72;
  const HEIGHT_MAX = 280;
  const DEFAULT_COLOR = '#3d403c';
  const MAX_IMAGE_BYTES = 1.8 * 1024 * 1024;

  const DEFAULT_HEADER = {
    mode: 'color',
    color: DEFAULT_COLOR,
    image: '',
    opacity: 100,
    height: 108,
  };

  let state = {
    header: Object.assign({}, DEFAULT_HEADER),
  };
  let saveTimer = 0;
  let bound = false;

  function clamp(n, min, max) {
    const value = Number(n);
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, Math.round(value)));
  }

  function clampOpacity(n) {
    return clamp(n, 0, 100);
  }

  function clampHeight(n) {
    return clamp(n, HEIGHT_MIN, HEIGHT_MAX);
  }

  function normalizeHeader(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const mode = src.mode === 'image' ? 'image' : 'color';
    const image = typeof src.image === 'string' ? src.image : '';
    return {
      mode: mode === 'image' && image ? 'image' : (mode === 'image' ? 'image' : 'color'),
      color: src.color || DEFAULT_COLOR,
      image: image,
      opacity: clampOpacity(src.opacity),
      height: clampHeight(src.height),
    };
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        state = { header: Object.assign({}, DEFAULT_HEADER) };
        return;
      }
      const parsed = JSON.parse(saved);
      state = {
        header: normalizeHeader(parsed && parsed.header),
      };
    } catch (_) {
      state = { header: Object.assign({}, DEFAULT_HEADER) };
    }
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (_) {
        alert('אין מספיק מקום לשמירה. נסו תמונה קטנה יותר.');
      }
    }, 60);
  }

  function cssUrl(value) {
    if (!value) return 'none';
    return 'url(' + JSON.stringify(value) + ')';
  }

  function els() {
    return {
      header: document.getElementById('packHeader'),
      color: document.getElementById('packHeaderColor'),
      image: document.getElementById('packHeaderImage'),
      editor: document.getElementById('packHeaderEditor'),
      modeColor: document.getElementById('packHeaderModeColor'),
      modeImage: document.getElementById('packHeaderModeImage'),
      colorPicker: document.getElementById('packHeaderColorPicker'),
      colorValue: document.getElementById('packHeaderColorValue'),
      imageInput: document.getElementById('packHeaderImageInput'),
      imageClear: document.getElementById('packHeaderImageClear'),
      opacity: document.getElementById('packHeaderOpacity'),
      opacityValue: document.getElementById('packHeaderOpacityValue'),
      height: document.getElementById('packHeaderHeight'),
      heightValue: document.getElementById('packHeaderHeightValue'),
      drop: document.getElementById('packHeaderDrop'),
      resize: document.getElementById('packHeaderResize'),
      editBtn: document.getElementById('packHeaderEdit'),
    };
  }

  function applyHeader() {
    const ui = els();
    const header = state.header;
    if (!ui.header) return;

    ui.header.style.setProperty('--pack-header-height', header.height + 'px');
    ui.header.style.setProperty('--pack-header-color', header.color || DEFAULT_COLOR);
    ui.header.style.setProperty('--pack-header-image', cssUrl(header.image));
    ui.header.style.setProperty('--pack-header-opacity', String(clampOpacity(header.opacity) / 100));
    ui.header.classList.toggle('is-image', header.mode === 'image' && !!header.image);

    if (ui.modeColor) ui.modeColor.checked = header.mode !== 'image';
    if (ui.modeImage) ui.modeImage.checked = header.mode === 'image';
    if (ui.colorValue && ui.colorValue.value !== header.color) {
      ui.colorValue.value = header.color;
      if (window.HebetColor && typeof window.HebetColor.setHslaFieldValue === 'function') {
        window.HebetColor.setHslaFieldValue(ui.colorPicker, header.color);
      }
    }
    if (ui.opacity) ui.opacity.value = String(header.opacity);
    if (ui.opacityValue) ui.opacityValue.textContent = header.opacity + '%';
    if (ui.height) ui.height.value = String(header.height);
    if (ui.heightValue) ui.heightValue.textContent = header.height + 'px';
    if (ui.imageClear) ui.imageClear.hidden = !header.image;
    ui.header.classList.toggle('is-awaiting-image', header.mode === 'image' && !header.image);
  }

  function setMode(mode) {
    state.header.mode = mode === 'image' ? 'image' : 'color';
    persist();
    applyHeader();
  }

  function setColor(value) {
    if (!value) return;
    state.header.color = value;
    state.header.mode = 'color';
    persist();
    applyHeader();
  }

  function setOpacity(value) {
    state.header.opacity = clampOpacity(value);
    persist();
    applyHeader();
  }

  function setHeight(value) {
    state.header.height = clampHeight(value);
    persist();
    applyHeader();
  }

  function setImage(dataUrl) {
    state.header.image = dataUrl || '';
    state.header.mode = dataUrl ? 'image' : 'color';
    persist();
    applyHeader();
  }

  function clearImage() {
    setImage('');
  }

  function readImageFile(file) {
    if (!file || !file.type || file.type.indexOf('image/') !== 0) {
      alert('יש לבחור קובץ תמונה.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert('התמונה גדולה מדי. נסו קובץ קטן יותר.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      setImage(String(reader.result || ''));
    };
    reader.onerror = function () {
      alert('לא ניתן לקרוא את התמונה.');
    };
    reader.readAsDataURL(file);
  }

  function isUserMode() {
    return document.body.classList.contains('user-mode') ||
      document.body.getAttribute('data-app-mode') === 'user';
  }

  function isPageEditMode() {
    return !isUserMode() && document.body.classList.contains('page-edit-mode');
  }

  function isEditorOpen() {
    const ui = els();
    return !!(ui.header && ui.header.classList.contains('is-editing'));
  }

  function openEditor() {
    if (!isPageEditMode()) return;
    const ui = els();
    if (!ui.header) return;
    ui.header.classList.add('is-editing');
    if (ui.editor) ui.editor.hidden = false;
  }

  function closeEditor() {
    const ui = els();
    if (!ui.header) return;
    ui.header.classList.remove('is-editing');
    if (ui.editor) ui.editor.hidden = true;
    const pop = document.getElementById('hslaPopover');
    if (pop && !pop.hidden) pop.hidden = true;
  }

  function toggleEditor() {
    if (isEditorOpen()) closeEditor();
    else openEditor();
  }

  function syncEditUi() {
    const ui = els();
    const editing = isPageEditMode();
    if (ui.editBtn) ui.editBtn.hidden = !editing;
    if (ui.resize) ui.resize.hidden = !editing;
    if (!editing) closeEditor();
  }

  function bindColorPicker() {
    const ui = els();
    if (!ui.colorPicker) return;
    if (!window.HebetColor || typeof window.HebetColor.setupHslaField !== 'function') return;
    window.HebetColor.setupHslaField(ui.colorPicker, function (hex) {
      setColor(hex);
    });
  }

  function bindResize() {
    const ui = els();
    if (!ui.resize || ui.resize.dataset.bound === '1') return;
    ui.resize.dataset.bound = '1';

    ui.resize.addEventListener('pointerdown', function (e) {
      if (!isPageEditMode()) return;
      e.preventDefault();
      e.stopPropagation();
      const startY = e.clientY;
      const startH = state.header.height;
      ui.resize.classList.add('is-dragging');
      ui.header.classList.add('is-dragging');
      ui.resize.setPointerCapture(e.pointerId);

      function onMove(ev) {
        setHeight(startH + (ev.clientY - startY));
      }

      function onUp(ev) {
        ui.resize.classList.remove('is-dragging');
        ui.header.classList.remove('is-dragging');
        try { ui.resize.releasePointerCapture(ev.pointerId); } catch (_) {}
        ui.resize.removeEventListener('pointermove', onMove);
        ui.resize.removeEventListener('pointerup', onUp);
        ui.resize.removeEventListener('pointercancel', onUp);
      }

      ui.resize.addEventListener('pointermove', onMove);
      ui.resize.addEventListener('pointerup', onUp);
      ui.resize.addEventListener('pointercancel', onUp);
    });
  }

  function isFileDrag(e) {
    const types = e.dataTransfer && e.dataTransfer.types;
    if (!types) return false;
    return Array.prototype.indexOf.call(types, 'Files') !== -1;
  }

  function bindEvents() {
    if (bound) return;
    bound = true;
    const ui = els();
    if (!ui.header) return;

    if (ui.modeColor) {
      ui.modeColor.addEventListener('change', function () {
        if (ui.modeColor.checked) setMode('color');
      });
    }
    if (ui.modeImage) {
      ui.modeImage.addEventListener('change', function () {
        if (ui.modeImage.checked) setMode('image');
      });
    }
    if (ui.imageInput) {
      ui.imageInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (file) readImageFile(file);
        e.target.value = '';
      });
    }
    if (ui.imageClear) {
      ui.imageClear.addEventListener('click', function () {
        clearImage();
      });
    }
    if (ui.opacity) {
      ui.opacity.addEventListener('input', function () {
        setOpacity(ui.opacity.value);
      });
    }
    if (ui.height) {
      ui.height.addEventListener('input', function () {
        setHeight(ui.height.value);
      });
    }

    if (ui.editBtn) {
      ui.editBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleEditor();
      });
    }

    ui.header.addEventListener('dragenter', function (e) {
      if (!isEditorOpen() || !isFileDrag(e)) return;
      e.preventDefault();
      ui.header.classList.add('is-drop-target');
      if (ui.drop) ui.drop.hidden = false;
    });
    ui.header.addEventListener('dragover', function (e) {
      if (!isEditorOpen() || !isFileDrag(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      ui.header.classList.add('is-drop-target');
      if (ui.drop) ui.drop.hidden = false;
    });
    ui.header.addEventListener('dragleave', function (e) {
      if (ui.header.contains(e.relatedTarget)) return;
      ui.header.classList.remove('is-drop-target');
      if (ui.drop) ui.drop.hidden = true;
    });
    ui.header.addEventListener('drop', function (e) {
      if (!isEditorOpen() || !isFileDrag(e)) return;
      e.preventDefault();
      ui.header.classList.remove('is-drop-target');
      if (ui.drop) ui.drop.hidden = true;
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) readImageFile(file);
    });

    bindResize();
    bindColorPicker();

    const btnEdit = document.getElementById('btnEdit');
    if (btnEdit) {
      btnEdit.addEventListener('click', function () {
        window.setTimeout(syncEditUi, 0);
      });
    }
    new MutationObserver(syncEditUi).observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-app-mode'],
    });
  }

  function initPackWorkspace() {
    const workspace = document.getElementById('packWorkspace');
    if (!workspace) return;
    loadState();
    const ui = els();
    if (ui.colorValue) ui.colorValue.value = state.header.color;
    bindEvents();
    applyHeader();
    syncEditUi();
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
