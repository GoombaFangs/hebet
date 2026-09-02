/* ===== כללי — שער כניסה + מעבר בין מחוללים + סרגל כלים ===== */
(function (global) {
  const GENERATOR_MANHALAN = 'manhalan';
  const GENERATOR_PACK = 'pack';

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

  if (!isGateOpen()) {
    applyGenerator(GENERATOR_MANHALAN);
  }

  global.HebetShell = {
    MANHALAN: GENERATOR_MANHALAN,
    PACK: GENERATOR_PACK,
    isGateOpen: isGateOpen,
    getGenerator: getGenerator,
    enterGenerator: enterGenerator,
    applyGenerator: applyGenerator,
    onEnter: onEnter,
  };
})(window);
