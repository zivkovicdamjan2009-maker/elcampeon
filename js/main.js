/* El Campéon Academy · interakcije i animacije */
(function () {
  'use strict';
  var root = document.documentElement;
  var body = document.body;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame.bind(window);
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* Slike: placeholder nestaje kad se slika učita */
  /* Fotografije: dodajte fajl u assets/img/ pod imenom iz data-src i pojaviće se sama */
  document.querySelectorAll('.media img[data-src]').forEach(function (img) {
    var box = img.closest('.media');
    img.addEventListener('load', function () { box.classList.add('has-img'); });
    img.addEventListener('error', function () { img.remove(); });
    img.src = img.getAttribute('data-src');
  });

  /* Preloader */
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
  } else { exitLoader(); }

  /* Reveal pri skrolovanju */
  function setupReveals() {
    if (window.innerWidth < 900) document.querySelectorAll('.academy__grid > [data-reveal]').forEach(function (el) { el.removeAttribute('data-reveal'); });
    if (reduced || !('IntersectionObserver' in window)) return;
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    els.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (n) { return n.hasAttribute('data-reveal'); });
      el.style.transitionDelay = (Math.min(Math.max(0, sibs.indexOf(el)), 4) * 90) + 'ms';
    });
    root.classList.add('js-reveal');
    var pending = new Set(els);
    var show = function (el) {
      if (!pending.has(el)) return;
      pending.delete(el); io.unobserve(el);
      el.classList.add('is-visible');
      setTimeout(function () { el.classList.add('is-done'); el.style.transitionDelay = ''; }, 1600);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) show(e.target); });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
    /* rezerva za brzo skrolovanje točkićem */
    var rq = 0;
    var check = function () {
      rq = 0;
      if (!pending.size) return;
      var vh = window.innerHeight;
      pending.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > 0) show(el);
      });
    };
    window.addEventListener('scroll', function () { if (!rq) rq = raf(check); }, { passive: true });
    setTimeout(check, 60);
  }

  /* Lebdeće kartice: pauza kad nisu na ekranu */
  if ('IntersectionObserver' in window) {
    var fio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-paused', !e.isIntersecting); });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('.float').forEach(function (el) { fio.observe(el); });
  }

  /* Nav pill + sticky CTA (samo kad se prag promeni) */
  var header = document.querySelector('.site-header');
  var sticky = document.querySelector('.sticky-cta');
  var menu = document.getElementById('menu');
  var lastState = '';
  function onScroll() {
    var y = window.scrollY;
    var menuOpen = menu && menu.classList.contains('is-open');
    var pill = y > 8 && !menuOpen;
    var showSticky = window.innerWidth < 900 && y > 560 && !menuOpen;
    var s = (pill ? 1 : 0) + '' + (showSticky ? 1 : 0);
    if (s === lastState) return;
    lastState = s;
    header.classList.toggle('is-pill', pill);
    if (sticky) sticky.classList.toggle('is-visible', showSticky);
    body.classList.toggle('has-sticky', showSticky);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Mobilni meni */
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
    window.addEventListener('resize', function () { if (window.innerWidth >= 900 && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Mobilni: mekani ulaz i izlaz iz zakačene sekcije */
  function edgeEase(stage, r) {
    if (!stage) return;
    if (window.innerWidth >= 900) { if (stage.style.transform) stage.style.transform = ''; return; }
    var vh = window.innerHeight;
    var e = function (t) { return 1 - Math.pow(1 - t, 3); };
    var en = e(clamp(1 - r.top / (vh * 0.9), 0, 1));
    var ex = e(clamp((vh - r.bottom) / (vh * 0.9), 0, 1));
    stage.style.transform = 'translate3d(0,' + ((1 - en) * 56 - ex * 24) + 'px,0) scale(' + (0.92 + 0.08 * en - 0.06 * ex) + ')';
  }
  function stackPos(sec, N, mobileMode) {
    var r = sec.getBoundingClientRect();
    var total = sec.offsetHeight - window.innerHeight;
    var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    var rawp = p * (N - 1);
    var k = Math.min(Math.floor(rawp), N - 2);
    var f = rawp - k;
    var a = mobileMode ? (k === 0 ? 0 : 0.1) : 0.18, b = mobileMode ? (k === N - 2 ? 1 : 0.9) : 0.82;
    var t = clamp((f - a) / (b - a), 0, 1);
    return k + t * t * (3 - 2 * t);
  }
  function placeCards(cards, cur) {
    for (var i = 0; i < cards.length; i++) {
      var d = i - cur, t, o;
      if (d > 0) { t = 'translate3d(0,' + (Math.min(d, 1.2) * 115) + '%,0)'; o = d >= 1.15 ? 0 : 1; }
      else { var b = Math.max(d, -3); t = 'translate3d(0,' + (b * 22) + 'px,0) scale(' + (1 + b * 0.055) + ')'; o = clamp(1 + b * 0.32, 0, 1); }
      cards[i].style.transform = t;
      cards[i].style.opacity = o;
    }
  }

  /* O akademiji: slaganje kartica pri skrolovanju, samo mobilni */
  (function () {
    var sec = document.getElementById('akademija');
    if (!sec) return;
    var cards = sec.querySelectorAll('.academy__grid > div');
    var stage = sec.querySelector('.academy__grid');
    var N = cards.length;
    if (N < 2) return;
    var pending = 0, cur = null, lastT = 0, wasMobile = null;
    function frame(now) {
      pending = 0;
      var m = window.innerWidth < 900;
      if (!m) {
        if (wasMobile !== false) { for (var i = 0; i < N; i++) { cards[i].style.transform = ''; cards[i].style.opacity = ''; cards[i].style.zIndex = ''; } stage.style.transform = ''; }
        wasMobile = false; cur = null; return;
      }
      if (wasMobile !== true) { for (var j = 0; j < N; j++) cards[j].style.zIndex = j + 1; cur = null; }
      wasMobile = true;
      var tgt = stackPos(sec, N, true);
      var r = sec.getBoundingClientRect();
      if (cur === null || reduced || r.bottom < 0 || r.top > window.innerHeight) cur = tgt;
      else {
        var dt = Math.min(64, lastT ? now - lastT : 16);
        cur += (tgt - cur) * (1 - Math.exp(-dt / 110));
        if (Math.abs(tgt - cur) < 0.0005) cur = tgt;
      }
      lastT = now;
      edgeEase(stage, r);
      placeCards(cards, cur);
      if (cur !== tgt) pending = raf(frame); else lastT = 0;
    }
    var tick = function () { if (!pending) pending = raf(frame); };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  })();

  /* Coerver: kartice vođene skrolom, sa ublažavanjem za točkić miša */
  (function () {
    var sec = document.getElementById('coerver');
    if (!sec) return;
    var cards = sec.querySelectorAll('.cv-card');
    var bars = sec.querySelectorAll('.coerver__bars i');
    var label = sec.querySelector('.coerver__label');
    var labels = Array.prototype.map.call(cards, function (c) { return c.getAttribute('data-sr'); });
    var N = cards.length;
    var smooth = function (t) { return t * t * (3 - 2 * t); };
    var pending = 0, cur = null, lastT = 0, lastIdx = -1;
    cards.forEach(function (c, i) { c.style.zIndex = i + 1; });
    function frame(now) {
      pending = 0;
      var tgt = stackPos(sec, N, window.innerWidth < 900);
      var r0 = sec.getBoundingClientRect();
      var off = r0.bottom < 0 || r0.top > window.innerHeight;
      if (cur === null || off || reduced) cur = tgt;
      else {
        var dt = Math.min(64, lastT ? now - lastT : 16);
        cur += (tgt - cur) * (1 - Math.exp(-dt / 110));
        if (Math.abs(tgt - cur) < 0.0005) cur = tgt;
      }
      lastT = now;
      edgeEase(sec.querySelector('.coerver__stage'), r0);
      for (var i = 0; i < N; i++) {
        var d = i - cur, t, o;
        if (d > 0) { t = 'translate3d(0,' + (Math.min(d, 1.2) * 115) + '%,0)'; o = d >= 1.15 ? 0 : 1; }
        else { var b = Math.max(d, -3); t = 'translate3d(0,' + (b * 22) + 'px,0) scale(' + (1 + b * 0.055) + ')'; o = clamp(1 + b * 0.32, 0, 1); }
        cards[i].style.transform = t;
        cards[i].style.opacity = o;
        bars[i].style.transform = 'scaleX(' + clamp(cur + 1 - i, 0, 1) + ')';
      }
      var idx = Math.round(cur);
      if (idx !== lastIdx) { lastIdx = idx; label.textContent = labels[idx]; }
      if (cur !== tgt) pending = raf(frame); else lastT = 0;
    }
    var tick = function () { if (!pending) pending = raf(frame); };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  })();

  /* Forma */
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
    Object.keys(fields).forEach(function (k) { fields[k].input.addEventListener('input', function () { setError(k, ''); }); });
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
      var action = form.getAttribute('action');
      var finish = function () { document.getElementById('sent-name').textContent = name; form.hidden = true; sent.hidden = false; };
      if (action) {
        fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error(); document.getElementById('sent-demo').hidden = true; finish(); form.reset(); })
          .catch(function () { setError('contact', 'Slanje nije uspelo. Pokušajte ponovo ili nas pozovite.'); });
      } else { finish(); }
    });
    document.getElementById('sent-back').addEventListener('click', function () { sent.hidden = true; form.hidden = false; });
  }
})();
