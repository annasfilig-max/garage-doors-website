/**
 * JT Marketing — Garage Door Template
 * main.js — all interactive behaviour in one file, no dependencies
 */

(function () {
  'use strict';

  /* ================================================================
     UTILITY
  ================================================================ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================
     MOBILE MENU
  ================================================================ */
  function initMobileMenu() {
    const hamburger = $('#hamburger');
    const mobileNav = $('#mobile-nav');
    if (!hamburger || !mobileNav) return;

    function openMenu() {
      hamburger.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Close on nav link tap
    $$('a', mobileNav).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Esc
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ================================================================
     FAQ ACCORDION
  ================================================================ */
  function initFAQ() {
    const questions = $$('.faq-question');
    if (!questions.length) return;

    questions.forEach(btn => {
      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        const answerId = btn.getAttribute('aria-controls');
        const answer = answerId ? document.getElementById(answerId) : btn.nextElementSibling;

        // Close all
        questions.forEach(q => {
          q.setAttribute('aria-expanded', 'false');
          const a = document.getElementById(q.getAttribute('aria-controls')) || q.nextElementSibling;
          if (a) a.classList.remove('open');
        });

        // Open clicked (unless it was already open)
        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          if (answer) answer.classList.add('open');
        }
      });
    });
  }

  /* ================================================================
     GALLERY LIGHTBOX
  ================================================================ */
  function initLightbox() {
    const lightbox = $('#lightbox');
    if (!lightbox) return;

    const lightboxImg = $('#lightbox-img');
    const closeBtn   = $('#lightbox-close');
    const prevBtn    = $('#lightbox-prev');
    const nextBtn    = $('#lightbox-next');
    const items      = $$('.masonry-item[data-src]');
    let current = 0;

    function openLightbox(index) {
      current = index;
      lightboxImg.src = items[current].dataset.src;
      lightboxImg.alt = items[current].dataset.alt || 'Gallery image';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      if (items[current]) items[current].focus();
    }

    function showPrev() {
      current = (current - 1 + items.length) % items.length;
      lightboxImg.src = items[current].dataset.src;
      lightboxImg.alt = items[current].dataset.alt || 'Gallery image';
    }

    function showNext() {
      current = (current + 1) % items.length;
      lightboxImg.src = items[current].dataset.src;
      lightboxImg.alt = items[current].dataset.alt || 'Gallery image';
    }

    items.forEach((item, i) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', item.dataset.alt || `View image ${i + 1}`);
      item.addEventListener('click', () => openLightbox(i));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn)  prevBtn.addEventListener('click', showPrev);
    if (nextBtn)  nextBtn.addEventListener('click', showNext);

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  /* ================================================================
     GALLERY FILTER TABS
  ================================================================ */
  function initGalleryFilters() {
    const filterBtns = $$('.filter-btn');
    const items      = $$('.masonry-item');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        const filter = btn.dataset.filter;
        items.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* ================================================================
     COUNT-UP ANIMATIONS
  ================================================================ */
  function initCountUp() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const animate = (el) => {
      if (prefersReducedMotion()) {
        el.textContent = el.dataset.count;
        return;
      }
      const target   = parseInt(el.dataset.count, 10);
      const suffix   = el.dataset.suffix || '';
      const prefix   = el.dataset.prefix || '';
      const duration = 1800;
      const start    = performance.now();

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(el => observer.observe(el));
  }

  /* ================================================================
     TESTIMONIAL CAROUSEL
  ================================================================ */
  function initCarousel() {
    const track   = $('#testimonials-track');
    const prevBtn = $('#carousel-prev');
    const nextBtn = $('#carousel-next');
    if (!track) return;

    const slides = $$('.testimonial-slide', track);
    let current  = 0;

    function getSlidesVisible() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768)  return 2;
      return 1;
    }

    function getMax() {
      return Math.max(0, slides.length - getSlidesVisible());
    }

    function goTo(index) {
      const max = getMax();
      current = Math.max(0, Math.min(index, max));
      const pct = (100 / getSlidesVisible()) * current;
      if (!prefersReducedMotion()) {
        track.style.transition = 'transform 0.4s ease';
      } else {
        track.style.transition = 'none';
      }
      track.style.transform = `translateX(-${pct}%)`;
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current >= max;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current));

    // Go next by 1
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    // Fix: override to increment
    if (nextBtn) {
      nextBtn.onclick = () => goTo(current + 1);
    }
    if (prevBtn) {
      prevBtn.onclick = () => goTo(current - 1);
    }

    window.addEventListener('resize', () => goTo(current));
    goTo(0);
  }

  /* ================================================================
     FORM VALIDATION
  ================================================================ */
  function validateField(input) {
    const errorEl = document.getElementById(input.getAttribute('aria-describedby'));
    let msg = '';

    if (input.required && !input.value.trim()) {
      msg = 'This field is required.';
    } else if (input.type === 'email' && input.value.trim()) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(input.value.trim())) msg = 'Please enter a valid email address.';
    } else if (input.dataset.type === 'phone' && input.value.trim()) {
      const phoneRe = /^[\d\s\-\+\(\)\.]{7,20}$/;
      if (!phoneRe.test(input.value.trim())) msg = 'Please enter a valid phone number.';
    }

    if (msg) {
      input.classList.add('error');
      if (errorEl) { errorEl.textContent = msg; errorEl.classList.add('visible'); }
      return false;
    } else {
      input.classList.remove('error');
      if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('visible'); }
      return true;
    }
  }

  function initForms() {
    $$('form[data-validate]').forEach(form => {
      const inputs = $$('input:not([type=hidden]):not([name=_gotcha]), select, textarea', form);
      const successEl = form.nextElementSibling?.classList.contains('form-success')
        ? form.nextElementSibling
        : null;

      // Live validation on blur
      inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) validateField(input);
        });
      });

      form.addEventListener('submit', async e => {
        e.preventDefault();
        let valid = true;
        inputs.forEach(input => { if (!validateField(input)) valid = false; });
        if (!valid) { inputs.find(i => i.classList.contains('error'))?.focus(); return; }

        const submitBtn = $('button[type=submit]', form);
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

        try {
          const formData = new FormData(form);
          const action   = form.getAttribute('action');

          const res = await fetch(action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });

          if (res.ok) {
            form.style.display = 'none';
            if (successEl) successEl.classList.add('visible');
          } else {
            throw new Error('Server error');
          }
        } catch {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Try Again';
          }
          const errBanner = form.querySelector('.form-submit-error');
          if (errBanner) { errBanner.textContent = 'Something went wrong. Please try again or call us directly.'; errBanner.classList.add('visible'); }
        }
      });
    });
  }

  /* ================================================================
     ACTIVE NAV — mark current page
  ================================================================ */
  function initActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    $$('a[data-nav]').forEach(a => {
      if (a.dataset.nav === path) a.setAttribute('aria-current', 'page');
    });
  }

  /* ================================================================
     INIT
  ================================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initFAQ();
    initLightbox();
    initGalleryFilters();
    initCountUp();
    initCarousel();
    initForms();
    initActiveNav();
  });

})();
