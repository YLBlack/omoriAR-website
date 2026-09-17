/* =========================================================
   تعريب OMORI — main.js
   ========================================================= */

/* ---------------------------------------------------------
   DOWNLOAD LINKS — the single place to edit later.
   Put the real patch URLs here; empty string = not ready yet
   and the button shows a friendly message instead of a dead link.
   --------------------------------------------------------- */
const DOWNLOAD_LINKS = {
  pc: '',      // e.g. 'https://.../Omori-AR-1.3-pc.zip'
  android: '', // e.g. 'https://.../Omori-AR-1.3-android.zip'
};

const MESSAGES = {
  pc: 'رابط تحميل نسخة الحاسوب قيد الإعداد — تابع قنوات الفريق ليصلك الإعلان.',
  android: 'رابط تحميل نسخة الجوال قيد الإعداد — تابع قنوات الفريق ليصلك الإعلان.',
  // English mini-page (en/index.html) uses the same DOWNLOAD_LINKS above.
  en_pc: 'The PC download link is being set up — follow the team channels for the release announcement.',
  en_android: 'The Android download link is being set up — follow the team channels for the release announcement.',
};

const LANG = document.documentElement.lang === 'en' ? 'en' : 'ar';

(function () {
  'use strict';

  /* ---------- download buttons ---------- */

  const dlMsg = document.getElementById('dl-msg');

  function showDlMsg(text) {
    if (!dlMsg) return;
    dlMsg.textContent = text;
    dlMsg.hidden = false;
  }

  document.querySelectorAll('[data-download]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-download');
      const url = DOWNLOAD_LINKS[key];

      if (url) {
        window.open(url, '_blank', 'noopener');
      } else {
        const msgKey = LANG === 'en' ? 'en_' + key : key;
        showDlMsg(MESSAGES[msgKey] || MESSAGES[key] || 'قريباً.');
      }
    });
  });

  /* ---------- screenshot slots: drop files in assets/img/screens/ and they appear ---------- */

  const SCREEN_EXT = ['jpg', 'png', 'webp'];
  // works from both /index.html and /en/index.html
  const SCREEN_BASE = (function () {
    const probe = document.querySelector('link[rel="stylesheet"]');
    if (probe && probe.getAttribute('href').includes('../')) return '../assets/img/screens/';
    return 'assets/img/screens/';
  })();

  function probeImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async function autoFillScreens() {
    const slots = Array.from(document.querySelectorAll('.screen__slot[data-screen]'));
    if (!slots.length) return;

    // Probe numbered names: screen1.jpg, screen2.jpg, ... (.png/.webp also work)
    const candidates = [];
    slots.forEach((slot, i) => {
      candidates.push(SCREEN_EXT.map((ext) => ({ slot, url: SCREEN_BASE + 'screen' + (i + 1) + '.' + ext })));
    });

    for (const group of candidates) {
      for (const { slot, url } of group) {
        if (slot.dataset.filled) break;
        const found = await probeImage(url);
        if (found) {
          slot.classList.add('has-img');
          slot.innerHTML = '';
          const img = document.createElement('img');
          img.src = found;
          const isEn = document.documentElement.lang === 'en';
          img.alt = isEn ? 'Localization screenshot' : 'لقطة من التعريب';
          img.loading = 'lazy';
          slot.appendChild(img);
          slot.dataset.filled = '1';
          break;
        }
      }
    }

    // A lightbox for the filled slots — click a screenshot to view it large.
    document.querySelectorAll('.screen__slot.has-img').forEach((slot) => {
      slot.setAttribute('tabindex', '0');
      slot.setAttribute('role', 'button');
      slot.setAttribute('aria-label', isEn() ? 'عرض الصورة بحجم أكبر' : 'عرض الصورة بحجم أكبر');
      slot.addEventListener('click', () => openLightbox(slot.querySelector('img').src, slot.querySelector('img').alt));
      slot.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(slot.querySelector('img').src, slot.querySelector('img').alt);
        }
      });
    });
  }

  function isEn() { return document.documentElement.lang === 'en'; }

  function openLightbox(src, alt) {
    let lb = document.getElementById('lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.className = 'lightbox';
      lb.innerHTML = '<button class="lightbox__close" aria-label="' + (isEn() ? 'Close' : 'إغلاق') + '\">×</button><img alt="">';
      document.body.appendChild(lb);
      lb.addEventListener('click', (e) => {
        if (e.target === lb || e.target.classList.contains('lightbox__close')) closeLightbox();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLightbox();
      });
    }
    lb.querySelector('img').src = src;
    lb.querySelector('img').alt = alt;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  autoFillScreens();

  /* ---------- video cover ---------- */

  const video = document.getElementById('trailer');
  const cover = document.getElementById('video-cover');

  if (video && cover) {
    const ctrl = document.getElementById('video-ctrl');
    const ctrlIcon = document.getElementById('video-ctrl-icon');
    const isEnPage = document.documentElement.lang === 'en';
    const LBL = {
      play: isEnPage ? 'Play' : 'تشغيل',
      pause: isEnPage ? 'Pause' : 'إيقاف مؤقت',
      replay: isEnPage ? 'Play again' : 'شغّل المقطع',
      fail: isEnPage ? "Couldn't play — try again" : 'تعذّر التشغيل — جرّب مجدداً',
    };

    function setCtrl(paused) {
      if (!ctrl || !ctrlIcon) return;
      ctrl.hidden = false;
      ctrl.setAttribute('aria-label', paused ? LBL.play : LBL.pause);
      ctrlIcon.className = paused ? 'video-ctrl__icon--play' : 'video-ctrl__icon--pause';
    }

    cover.addEventListener('click', () => {
      cover.hidden = true;
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          cover.hidden = false;
          cover.querySelector('.video-cover__label').textContent = LBL.fail;
        });
      }
      setCtrl(false);
    });

    if (ctrl) {
      ctrl.addEventListener('click', () => {
        if (video.paused) {
          video.play();
          setCtrl(false);
        } else {
          video.pause();
          setCtrl(true);
        }
      });
    }

    video.addEventListener('ended', () => {
      cover.hidden = false;
      if (ctrl) ctrl.hidden = true;
      if (cover.querySelector('.video-cover__label')) {
        cover.querySelector('.video-cover__label').textContent = LBL.replay;
      }
    });
  }

  /* ---------- star parallax (title-screen drift) ---------- */

  const layers = document.querySelectorAll('.stars__layer');
  let starRaf = 0;

  function starDrift(e) {
    cancelAnimationFrame(starRaf);
    starRaf = requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 18;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      layers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth) || 0.5;
        layer.style.transform = 'translate(' + (-x * depth).toFixed(1) + 'px,' + (-y * depth).toFixed(1) + 'px)';
      });
    });
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && layers.length) {
    window.addEventListener('pointermove', starDrift, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- active nav highlight ---------- */

  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function setActiveNav() {
    const y = window.scrollY + 140;
    let current = null;
    sections.forEach((sec) => {
      if (sec.offsetTop <= y) current = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', current !== null && link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });
  setActiveNav();

  /* ---------- mobile menu ---------- */

  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
