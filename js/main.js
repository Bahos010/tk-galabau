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
  function handleScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---- Mobile burger menu ---- */
  const burger  = document.getElementById('burger');
  const navList = document.getElementById('navList');

  if (burger && navList) {
    burger.addEventListener('click', function () {
      const open = navList.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open.toString());
      // Prevent page scrolling when menu is open
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navList.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        navList.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
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
        document.body.style.overflow = '';
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
