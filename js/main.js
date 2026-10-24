/* El Campeon Academy — interakcije i animacije */
(function () {
  'use strict';
  var root = document.documentElement;
  var body = document.body;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Slike: placeholder nestaje kad se slika učita ---------- */
  document.querySelectorAll('.media img').forEach(function (img) {
    var box = img.closest('.media');
    var ok = function () { box.classList.add('has-img'); };
    var bad = function () { img.remove(); };
    if (img.complete) { img.naturalWidth ? ok() : bad(); }
    else { img.addEventListener('load', ok); img.addEventListener('error', bad); }
  });

  /* ---------- Preloader ---------- */
  var loader = document.querySelector('.loader');
  var exited = false;
  function exitLoader() {
    if (exited) return;
    exited = true;
    body.classList.remove('is-loading');
    body.classList.add('is-in');
    if (loader) {
      loader.classList.add('is-out');
      setTimeout(function () { loader.classList.add('is-done'); loader.setAttribute('aria-hidden', 'true'); }, reduced ? 50 : 950);
    }
    setupReveals();
  }
  if (loader) {
    loader.addEventListener('click', exitLoader);
    var minWait = new Promise(function (r) { setTimeout(r, reduced ? 250 : 1750); });
    var fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    var cap = new Promise(function (r) { setTimeout(r, 3200); });
    Promise.race([Promise.all([minWait, fonts]), cap]).then(exitLoader);
  } else {
    exitLoader();
  }

  /* ---------- Reveal pri skrolovanju ---------- */
  function setupReveals() {
    if (reduced || !('IntersectionObserver' in window)) return;
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    els.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (n) { return n.hasAttribute('data-reveal'); });
      var idx = Math.min(Math.max(0, sibs.indexOf(el)), 4);
      el.style.transitionDelay = (idx * 90) + 'ms';
    });
    root.classList.add('js-reveal');
    var show = function (el) {
      el.classList.add('is-visible');
      setTimeout(function () { el.style.transitionDelay = ''; }, 1600);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Nav: pill na skrol + sticky CTA na mobilnom ---------- */
  var header = document.querySelector('.site-header');
  var sticky = document.querySelector('.sticky-cta');
  var menu = document.getElementById('menu');
  function onScroll() {
    var y = window.scrollY;
    var menuOpen = menu && menu.classList.contains('is-open');
    header.classList.toggle('is-pill', y > 8 && !menuOpen);
    var showSticky = window.innerWidth < 900 && y > 560 && !menuOpen;
    if (sticky) sticky.classList.toggle('is-visible', showSticky);
    body.classList.toggle('has-sticky', showSticky);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Mobilni meni ---------- */
  var burger = document.querySelector('.burger');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    body.style.overflow = open ? 'hidden' : '';
    onScroll();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelector('.menu__close').addEventListener('click', function () { setMenu(false); });
    menu.querySelectorAll('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- "Pitaj za ovaj program" ---------- */
  var formatSelect = document.getElementById('f-format');
  document.querySelectorAll('[data-program]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (formatSelect) formatSelect.value = btn.getAttribute('data-program');
      var target = document.getElementById('prijava');
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 76, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Forma ---------- */
  var form = document.getElementById('trial-form');
  var sent = document.getElementById('form-sent');
  if (form) {
    var fields = {
      name: { input: document.getElementById('f-name'), err: document.getElementById('e-name') },
      contact: { input: document.getElementById('f-contact'), err: document.getElementById('e-contact') }
    };
    var setError = function (key, msg) {
      var f = fields[key];
      f.err.textContent = msg || '';
      f.input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      f.input.closest('.field').classList.toggle('is-invalid', !!msg);
    };
    Object.keys(fields).forEach(function (k) {
      fields[k].input.addEventListener('input', function () { setError(k, ''); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = fields.name.input.value.trim();
      var c = fields.contact.input.value.trim();
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
      var okPhone = /^\+?[\d\s\/-]{6,}$/.test(c);
      var bad = false;
      if (!name) { setError('name', 'Upišite ime da bismo znali kome se javljamo.'); bad = true; }
      if (!c) { setError('contact', 'Ostavite broj telefona ili email.'); bad = true; }
      else if (!okEmail && !okPhone) { setError('contact', 'Proverite broj ili email. Izgleda da nešto nedostaje.'); bad = true; }
      if (bad) { form.querySelector('[aria-invalid="true"]').focus(); return; }

      /* Ako je u <form> postavljen action (npr. Formspree), podaci se zaista šalju. */
      var action = form.getAttribute('action');
      var finish = function () {
        document.getElementById('sent-name').textContent = name;
        form.hidden = true; sent.hidden = false;
      };
      if (action) {
        fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(); document.getElementById('sent-demo').hidden = true; finish(); form.reset(); })
          .catch(function () { setError('contact', 'Slanje nije uspelo. Pokušajte ponovo ili nas pozovite.'); });
      } else {
        finish();
      }
    });
    document.getElementById('sent-back').addEventListener('click', function () { sent.hidden = true; form.hidden = false; });
  }
})();
