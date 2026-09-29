/* =========================================================
   تعريب أوموري — main.js
   Vanilla, dependency-free. Everything is progressive:
   with JS unavailable the page still reads and shows images.
   ========================================================= */

/* ---------------------------------------------------------
   SITE — the single place to edit release facts.
   The HTML already carries these values (so a JS-less
   visitor sees them too); this object keeps every page in
   sync from one edit.

   links.android === '' means "not published yet": the button
   then explains itself instead of leading to a dead URL.
   --------------------------------------------------------- */
const SITE = {
  version: '1.3',                                    // the localization's own version
  build: 'v1.0.8.1',                                 // the released build's tag
  sha256: '0aa8ffdda90793f43c9d9fb494b724bbaddcc1cd23f2ada778f5c392ab89d40d',
  links: {
    pc: 'https://github.com/YLBlack/omoriAR-website/releases/download/v1.0.8.1/Omori.AR.release.zip',
    android: '',                                     // still being prepared
  },
  size: { ar: '77 م.ب', en: '77 MB' },
  date: { ar: '28 سبتمبر 2026', en: '28 September 2026' },
  updated: { ar: 'سبتمبر 2026', en: 'September 2026' },
};

const LANG = document.documentElement.lang === 'en' ? 'en' : 'ar';
const IS_RTL = document.documentElement.dir === 'rtl';

const T = {
  ar: {
    androidSoon: 'نسخة الأندرويد قيد التجهيز ولم تُرفع بعد — تابع قنوات الفريق ليصلك الإعلان، وستصدر بأرقام البطاقة نفسها.',
    play: 'تشغيل',
    pause: 'إيقاف مؤقت',
    replay: 'شغّل المقطع',
    fail: 'تعذّر التشغيل — جرّب مجدداً',
    lightboxLabel: 'عرض اللقطات',
    close: 'إغلاق',
    prev: 'اللقطة السابقة',
    next: 'اللقطة التالية',
    counter: (i, n) => `${i} من ${n}`,
    shotAlt: 'لقطة من التعريب',
  },
  en: {
    androidSoon: 'The Android build is still being prepared — follow the team channels for the announcement.',
    play: 'Play',
    pause: 'Pause',
    replay: 'Play again',
    fail: "Couldn't play — try again",
    lightboxLabel: 'Screenshot viewer',
    close: 'Close',
    prev: 'Previous screenshot',
    next: 'Next screenshot',
    counter: (i, n) => `${i} of ${n}`,
    shotAlt: 'Localization screenshot',
  },
};

const t = T[LANG];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

(function () {
  'use strict';

  /* ---------- keep the release facts in sync ---------- */

  $$('[data-site]').forEach((el) => {
    const key = el.getAttribute('data-site');
    const value = key === 'sha' ? SITE.sha256
      : key === 'size' ? SITE.size[LANG]
        : key === 'date' ? SITE.date[LANG]
          : key === 'updated' ? SITE.updated[LANG]
            : SITE[key];
    if (value) el.textContent = value;
  });

  // "js" is set inline in <head>; add it here too for the case where the
  // inline snippet was stripped (some proxies), so reveals never stay hidden.
  document.documentElement.classList.add('js');

  /* ---------- download buttons ---------- */

  const dlMsg = $('#dl-msg');

  function showDlMsg(text) {
    if (!dlMsg) return;
    dlMsg.textContent = text;
    dlMsg.hidden = false;
    dlMsg.focus?.({ preventScroll: true });
  }

  $$('[data-download]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-download');
      const url = SITE.links[key];
      if (url) {
        window.open(url, '_blank', 'noopener');
      } else {
        showDlMsg(t.androidSoon);
      }
    });
  });

  /* ---------- header height: drives sticky offsets ---------- */

  const header = $('.site-header');
  function measureHeader() {
    if (!header) return;
    document.documentElement.style.setProperty('--header-h', `${Math.round(header.offsetHeight)}px`);
  }
  measureHeader();
  window.addEventListener('resize', measureHeader, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureHeader);

  /* ---------- reading progress + back to top ---------- */

  const progressBar = $('#progress .progress__bar');
  const toTop = $('#to-top');
  let ticking = false;

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    if (toTop) toTop.hidden = y < window.innerHeight * 0.8;
    setActiveNav();
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- active nav highlight ---------- */

  const navLinks = $$('.nav a');
  const sections = navLinks.map((link) => $(link.getAttribute('href'))).filter(Boolean);

  function setActiveNav() {
    if (!sections.length) return;
    const y = window.scrollY + (header ? header.offsetHeight : 64) + 80;
    let current = null;
    sections.forEach((sec) => { if (sec.offsetTop <= y) current = sec.id; });
    navLinks.forEach((link) => {
      const active = current !== null && link.getAttribute('href') === '#' + current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  /* ---------- mobile menu ---------- */

  const toggle = $('#menu-toggle');
  const nav = $('#site-nav');
  let lastFocused = null;

  function openMenu() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    lastFocused = document.activeElement;
    nav.querySelector('a')?.focus({ preventScroll: true });
  }

  function closeMenu(restoreFocus = true) {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    if (!restoreFocus) return;
    // hand focus back to whatever opened the menu; the toggle is the safe fallback
    const target = lastFocused instanceof HTMLElement && lastFocused !== document.body && document.contains(lastFocused)
      ? lastFocused
      : toggle;
    target.focus({ preventScroll: true });
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu(false);
    });

    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('is-open')) return;
      if (e.target.closest('#site-nav') || e.target.closest('#menu-toggle')) return;
      closeMenu(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (nav.classList.contains('is-open')) closeMenu();
        else if (lightbox && lightbox.classList.contains('is-open')) closeLightbox();
      }
      if (e.key === 'Tab' && nav.classList.contains('is-open')) {
        const focusables = [toggle, ...$$('a', nav)];
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 760 && nav.classList.contains('is-open')) closeMenu(false);
    }, { passive: true });
  }

  /* ---------- extra screenshots dropped into assets/img/screens/ ---------- */

  const SCREEN_DIR = (function () {
    const probe = document.querySelector('link[rel="stylesheet"][href^=".."]');
    return probe ? '../assets/img/screens/' : 'assets/img/screens/';
  })();

  // Any screenshot beyond the ones written into the HTML lives here. Adding a shot
  // means running tools/optimize-screens.py and listing the file below; we never probe
  // for files that might not exist, so no visit is punished with 404s in the console.
  const EXTRA_SCREENS = [];

  function appendExtraScreens() {
    const grid = $('#gallery-grid');
    if (!grid || !EXTRA_SCREENS.length) return;

    const added = [];
    EXTRA_SCREENS.forEach((file) => {
      const figure = document.createElement('figure');
      figure.className = 'shot shot--grid';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shot__open';
      button.setAttribute('data-lightbox', '');
      const img = document.createElement('img');
      img.src = `${SCREEN_DIR}${file}`;
      img.width = 480;
      img.height = 360;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = t.shotAlt;
      button.append(img);
      figure.append(button);
      grid.append(figure);
      added.push(figure);
    });
    watchShots(added);
  }

  /* ---------- screenshots ease in as they reach the screen ---------- */

  let shotObserver = null;
  let shotWatchReady = false;

  // the plain-geometry half of the reveal: needs no observer support at all
  function revealShotsInView() {
    const limit = window.innerHeight * 0.94;
    $$('.shot.is-pending').forEach((shot) => {
      const r = shot.getBoundingClientRect();
      if (r.top < limit && r.bottom > -40) shot.classList.remove('is-pending');
    });
  }

  function watchShots(shots) {
    shots = shots || $$('.shot');
    if (!shots.length) return;

    // the script hides them first, never the stylesheet — so a script that never
    // runs leaves every screenshot visible instead of blank
    shots.forEach((shot) => shot.classList.add('is-pending'));

    if (!shotWatchReady && 'IntersectionObserver' in window) {
      shotWatchReady = true;
      shotObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove('is-pending');
          shotObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -6% 0px' });
      // belt and braces: if the observer is late (or missing), scrolling still
      // reveals everything the moment it reaches the screen
      window.addEventListener('scroll', revealShotsInView, { passive: true });
      window.addEventListener('resize', revealShotsInView, { passive: true });
    }

    if (shotObserver) shots.forEach((shot) => shotObserver.observe(shot));
    revealShotsInView();
  }

  /* ---------- the gallery grid ---------- */

  const grid = $('#gallery-grid');

  function galleryShots() {
    return grid ? $$('.shot--grid', grid) : [];
  }

  /* ---------- lightbox ---------- */

  let lightbox = null;
  let lastLightboxTrigger = null;

  function buildLightbox() {
    const el = document.createElement('div');
    el.id = 'lightbox';
    el.className = 'lightbox';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', t.lightboxLabel);
    el.innerHTML = `
      <button class="lightbox__close" type="button" aria-label="${t.close}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" focusable="false"><path d="M5 5l14 14M19 5L5 19"/></svg>
      </button>
      <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="${t.prev}">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M15 4 7 12l8 8"/></svg>
      </button>
      <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="${t.next}">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M9 4l8 8-8 8"/></svg>
      </button>
      <figure class="lightbox__frame">
        <img class="lightbox__img" alt="">
        <figcaption class="lightbox__cap"></figcaption>
      </figure>
      <p class="lightbox__counter latin" aria-hidden="true"></p>
    `;
    document.body.append(el);

    el.addEventListener('click', (e) => {
      if (e.target === el) closeLightbox();
      if (e.target.closest('.lightbox__close')) closeLightbox();
      if (e.target.closest('.lightbox__nav--prev')) step(-1);
      if (e.target.closest('.lightbox__nav--next')) step(1);
    });

    // swipe on touch devices
    let startX = null;
    el.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) < 42) return;
      const forward = IS_RTL ? dx > 0 : dx < 0;
      step(forward ? 1 : -1);
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (!el.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeLightbox(); return; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const forward = IS_RTL ? e.key === 'ArrowLeft' : e.key === 'ArrowRight';
        step(forward ? 1 : -1);
      }
      if (e.key === 'Tab') {
        const focusables = $$('button', el);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    return el;
  }

  function openLightbox(trigger) {
    lightbox = lightbox || buildLightbox();
    lastLightboxTrigger = trigger;
    const items = galleryShots();
    const index = Math.max(0, items.indexOf(trigger.closest('figure')));
    lightbox.dataset.index = String(index);
    renderLightbox();
    lightbox.classList.add('is-open');
    document.body.classList.add('is-locked');
    $('.lightbox__close', lightbox).focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    if (lastLightboxTrigger instanceof HTMLElement) lastLightboxTrigger.focus({ preventScroll: true });
  }

  function step(delta) {
    if (!lightbox) return;
    const items = galleryShots();
    if (!items.length) return;
    const next = (Number(lightbox.dataset.index || 0) + delta + items.length) % items.length;
    lightbox.dataset.index = String(next);
    renderLightbox();
  }

  function renderLightbox() {
    const items = galleryShots();
    const item = items[Number(lightbox.dataset.index || 0)];
    if (!item) return;
    const img = $('img', item);
    const cap = $('figcaption', item);
    const big = $('.lightbox__img', lightbox);
    const wide = img.getAttribute('srcset') || '';
    const last = wide.match(/(\S+\.webp) 960w/);
    big.src = last ? last[1] : img.currentSrc || img.src;
    big.alt = img.alt;
    $('.lightbox__cap', lightbox).textContent = cap ? cap.textContent.trim() : '';
    $('.lightbox__counter', lightbox).textContent = t.counter(Number(lightbox.dataset.index || 0) + 1, items.length);
    lightbox.querySelectorAll('.lightbox__nav').forEach((b) => { b.hidden = items.length < 2; });
  }

  if (grid) {
    grid.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-lightbox]');
      if (trigger) openLightbox(trigger);
    });
  }

  /* ---------- video ---------- */

  const video = $('#trailer');
  const cover = $('#video-cover');

  if (video && cover) {
    const ctrl = $('#video-ctrl');
    const ctrlIcon = $('#video-ctrl-icon');
    const ICON = {
      play: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" focusable="false"><path d="M7 4.6v14.8c0 .8.9 1.2 1.5.8l11.4-7.4a1 1 0 0 0 0-1.6L8.5 3.8C7.9 3.4 7 3.8 7 4.6z"/></svg>',
      pause: '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" focusable="false"><path d="M6.5 4h3.6v16H6.5zM13.9 4h3.6v16h-3.6z"/></svg>',
    };
    const label = $('.video-cover__label', cover);

    function setCtrl(paused) {
      if (!ctrl || !ctrlIcon) return;
      ctrl.hidden = false;
      ctrl.setAttribute('aria-label', paused ? t.play : t.pause);
      ctrlIcon.innerHTML = paused ? ICON.play : ICON.pause;
    }

    cover.addEventListener('click', () => {
      cover.hidden = true;
      const started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(() => {
          cover.hidden = false;
          if (label) label.textContent = t.fail;
        });
      }
      setCtrl(false);
    });

    if (ctrl) {
      ctrl.addEventListener('click', () => {
        if (video.paused) { video.play(); setCtrl(false); }
        else { video.pause(); setCtrl(true); }
      });
    }

    video.addEventListener('ended', () => {
      cover.hidden = false;
      if (ctrl) ctrl.hidden = true;
      if (label) label.textContent = t.replay;
    });
  }

  /* ---------- star parallax (title-screen drift) ---------- */

  const layers = $$('.stars__layer');
  let starRaf = 0;

  if (!prefersReducedMotion && layers.length) {
    window.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(starRaf);
      starRaf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 18;
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
        layers.forEach((layer) => {
          const depth = parseFloat(layer.dataset.depth) || 0.5;
          layer.style.transform = `translate(${(-x * depth).toFixed(1)}px, ${(-y * depth).toFixed(1)}px)`;
        });
      });
    }, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */

  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealEls.forEach((el) => {
      // whatever is already on screen reveals on this very frame — the hero is
      // the largest thing we paint, so it must never wait for the observer
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- stat counters ---------- */

  const counters = $$('.stat__num[data-count]');

  function runCounter(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const sep = el.dataset.sep || '';
    const format = (v) => {
      const fixed = v.toFixed(decimals);
      return sep ? fixed.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : fixed;
    };
    if (prefersReducedMotion) { el.textContent = format(target); return; }

    const duration = 1100;
    const started = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- boot ---------- */

  watchShots();
  appendExtraScreens();

  onScroll();
})();
