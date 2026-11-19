/* KemblincK | kleine verbeteringen bovenop een pagina die ook zonder JavaScript werkt. */
(function () {
  'use strict';
  var doc = document;

  // Kopregel: haarlijn zodra er gescrold is.
  var kop = doc.querySelector('.site-header');
  function scrolled() { if (kop) kop.classList.toggle('is-scrolled', window.scrollY > 8); }
  scrolled();
  window.addEventListener('scroll', scrolled, { passive: true });

  // Mobiel menu.
  var knop = doc.querySelector('.menu-toggle');
  var nav = doc.getElementById('hoofdmenu');
  function sluit() { if (!nav || !knop) return; nav.classList.remove('is-open'); knop.setAttribute('aria-expanded', 'false'); }
  if (knop && nav) {
    knop.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      knop.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) sluit(); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') sluit(); });
  }

  // Verschijnen bij scrollen. Bewust zonder IntersectionObserver: deze controle reageert
  // direct op scrollen en kan dus geen inhoud verborgen laten als de browser traag tekent.
  var items = [].slice.call(doc.querySelectorAll('[data-reveal]'));
  var laatst = 0, wacht = null;
  function onthul() {
    laatst = Date.now();
    var grens = window.innerHeight * 0.94;
    items = items.filter(function (el) {
      if (el.getBoundingClientRect().top < grens) { el.classList.add('is-in'); return false; }
      return true;
    });
    if (!items.length) { window.removeEventListener('scroll', bijScroll); window.removeEventListener('resize', bijScroll); }
  }
  function bijScroll() {
    if (Date.now() - laatst > 60) onthul();
    clearTimeout(wacht); wacht = setTimeout(onthul, 120);
  }
  window.addEventListener('scroll', bijScroll, { passive: true });
  window.addEventListener('resize', bijScroll);
  window.addEventListener('load', onthul);
  onthul();

  // Actieve sectie in het menu.
  var links = [].slice.call(doc.querySelectorAll('.nav a.nav-link[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var kaart = {};
    links.forEach(function (a) { var s = doc.getElementById(a.getAttribute('href').slice(1)); if (s) kaart[s.id] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        if (kaart[en.target.id]) kaart[en.target.id].classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(kaart).forEach(function (id) { spy.observe(doc.getElementById(id)); });
  }

  // Jaartal in de voet.
  var jaar = doc.getElementById('jaar');
  if (jaar) jaar.textContent = String(new Date().getFullYear());

  // Contactformulier: zelfde edge function en veldnamen als voorheen.
  var f = doc.getElementById('kc-form');
  if (!f) return;
  var st = doc.getElementById('kc-form-status');
  var verstuur = f.querySelector('button[type="submit"]');
  var t = f.dataset;
  var URL_FUNCTIE = 'https://xyfvkmhkwcjqskxrcfrj.supabase.co/functions/v1/kemblinck-contact';
  function melding(tekst, fout) { st.textContent = tekst; st.classList.toggle('fout', !!fout); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var bericht = f.bericht.value.trim();
    var d = { naam: f.naam.value.trim(), email: f.email.value.trim(), bericht: bericht, website: f.website.value };
    if (d.naam.length < 2) { melding(t.msgNaam, true); f.naam.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) { melding(t.msgEmail, true); f.email.focus(); return; }
    if (bericht.length < 10) { melding(t.msgBericht, true); f.bericht.focus(); return; }
    if (f.onderwerp && f.onderwerp.value) d.bericht = t.onderwerpLabel + ': ' + f.onderwerp.value + '\n\n' + bericht;
    verstuur.disabled = true; melding(t.msgBezig);
    fetch(URL_FUNCTIE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, j: j }; }); })
      .then(function (r) {
        if (r.ok) { f.reset(); melding(t.msgOk); }
        else { melding((t.serverMsg === '1' && r.j && r.j.fout) || t.msgFout, true); }
      })
      .catch(function () { melding(t.msgFout, true); })
      .then(function () { verstuur.disabled = false; });
  });
})();
