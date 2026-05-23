/* =========================================================
   TK GaLaBau – main.js
   ========================================================= */

(function () {
  'use strict';

  /* ---- Current year in footer ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky header ---- */
  const header = document.getElementById('header');
  var menuIsOpen = false;
  function handleScroll() {
    if (menuIsOpen) return; // don't change header state while menu is open
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---- Mobile burger menu ---- */
  const burger  = document.getElementById('burger');
  const navList = document.getElementById('navList');

  // iOS-safe scroll lock: prevents page jump when body overflow is toggled
  var scrollLockY = 0;
  function lockScroll() {
    scrollLockY = window.scrollY;
    document.body.style.top      = '-' + scrollLockY + 'px';
    document.body.style.position = 'fixed';
    document.body.style.width    = '100%';
  }
  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top      = '';
    document.body.style.width    = '';
    window.scrollTo(0, scrollLockY);
  }

  if (burger && navList) {
    burger.addEventListener('click', function () {
      const open = navList.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open.toString());
      menuIsOpen = open;
      // Force header to stay visible while menu is open
      if (open) {
        header.classList.add('scrolled');
        lockScroll();
      } else {
        unlockScroll();
        // Restore correct header state based on actual scroll position
        header.classList.toggle('scrolled', window.scrollY > 40);
      }
    });

    // Close menu when a link is clicked
    navList.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        navList.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        menuIsOpen = false;
        unlockScroll();
        header.classList.toggle('scrolled', window.scrollY > 40);
      });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (navList.classList.contains('open') &&
          !navList.contains(e.target) &&
          !burger.contains(e.target)) {
        navList.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        menuIsOpen = false;
        unlockScroll();
        header.classList.toggle('scrolled', window.scrollY > 40);
      }
    });
  }

  /* ---- Reveal on scroll (IntersectionObserver) ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show all immediately
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link[href^="#"]');

  function setActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(function (section) {
      if (scrollY >= section.offsetTop &&
          scrollY < section.offsetTop + section.offsetHeight) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + section.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ---- Gallery: Filter ---- */
  const filterBtns = document.querySelectorAll('.gallery__filter');
  const galleryItems = document.querySelectorAll('.gallery__item');

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');

        var filter = btn.getAttribute('data-filter');
        galleryItems.forEach(function (item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.classList.remove('is-hidden');
          } else {
            item.classList.add('is-hidden');
          }
        });
      });
    });
  }

  /* ---- Lightbox ---- */
  var lightbox      = document.getElementById('lightbox');
  var lightboxImg   = document.getElementById('lightboxImg');
  var lightboxCap   = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev  = document.getElementById('lightboxPrev');
  var lightboxNext  = document.getElementById('lightboxNext');
  var currentIndex  = 0;
  var visibleItems  = [];

  function openLightbox(index) {
    visibleItems = Array.from(galleryItems).filter(function (i) {
      return !i.classList.contains('is-hidden');
    });
    currentIndex = index;
    showLightboxImage(currentIndex);
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function showLightboxImage(idx) {
    var item = visibleItems[idx];
    if (!item) return;
    var img = item.querySelector('img');
    var cap = item.querySelector('.gallery__caption');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCap.textContent = cap ? cap.textContent : '';
  }

  if (lightbox) {
    galleryItems.forEach(function (item, i) {
      item.addEventListener('click', function () {
        openLightbox(Array.from(galleryItems).indexOf(item));
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);

    lightboxPrev.addEventListener('click', function () {
      currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
      showLightboxImage(currentIndex);
    });

    lightboxNext.addEventListener('click', function () {
      currentIndex = (currentIndex + 1) % visibleItems.length;
      showLightboxImage(currentIndex);
    });

    // Close on backdrop click
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; showLightboxImage(currentIndex); }
      if (e.key === 'ArrowRight')  { currentIndex = (currentIndex + 1) % visibleItems.length; showLightboxImage(currentIndex); }
    });
  }

  /* ---- Contact form (front-end validation & feedback) ---- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const fields = form.querySelectorAll('[required]');
      let valid = true;

      fields.forEach(function (field) {
        field.classList.remove('is-error');
        if (field.type === 'checkbox' && !field.checked) {
          field.classList.add('is-error');
          valid = false;
        } else if (field.type !== 'checkbox' && !field.value.trim()) {
          field.classList.add('is-error');
          valid = false;
        } else if (field.type === 'email') {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(field.value.trim())) {
            field.classList.add('is-error');
            valid = false;
          }
        }
      });

      if (!valid) {
        showMessage('Bitte füllen Sie alle Pflichtfelder korrekt aus.', 'error');
        return;
      }

      // Normally you would POST to a backend here.
      // For a static GitHub Pages site, we show a success message and
      // suggest the user copy the data or use a service like Formspree.
      showMessage(
        'Vielen Dank! Wir melden uns so schnell wie möglich bei Ihnen. ' +
        'Alternativ rufen Sie uns direkt an: +49 173 7177255',
        'success'
      );
      form.reset();
    });
  }

  function showMessage(text, type) {
    let msg = document.getElementById('formMessage');
    if (!msg) {
      msg = document.createElement('div');
      msg.id = 'formMessage';
      msg.style.cssText =
        'padding:1rem 1.25rem;border-radius:8px;font-size:0.9rem;font-weight:500;' +
        'margin-top:0.5rem;line-height:1.5;';
      form.appendChild(msg);
    }
    msg.textContent = text;
    msg.style.background = type === 'success' ? '#d8f3dc' : '#ffe0e0';
    msg.style.color       = type === 'success' ? '#1b4332' : '#c0392b';
    msg.style.border      = type === 'success' ? '1px solid #b7e4c7' : '1px solid #f5b7b1';

    // Auto-hide after 8 seconds
    clearTimeout(msg._timer);
    msg._timer = setTimeout(function () {
      msg.style.opacity = '0';
      msg.style.transition = 'opacity 0.4s';
      setTimeout(function () { msg.remove(); }, 400);
    }, 8000);
  }

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

})();
