/* Gardéa : script commun à toutes les pages.
   Chaque bloc ne s'active que si les éléments concernés existent sur la page. */
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer:fine)').matches;
// Langue de la page : le français par défaut, l'anglais sur les pages du dossier en/
const EN = /^en/i.test(document.documentElement.lang), L = (fr, en) => EN ? en : fr;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => EN ? '€' + new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(Math.round(n)) : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n)).replace(/ /g, ' ') + ' €';
function store(kind, key, val) { try { const s = window[kind]; if (val === undefined) return s.getItem(key); s.setItem(key, val); } catch (e) { return null; } }
// Animation numérique avec filet de sécurité : la valeur finale s'affiche toujours
function animate(dur, draw) {
  if (reduce) { draw(1); return; }
  const t0 = performance.now(); let done = false;
  const step = t => { if (done) return; const p = Math.min(1, (t - t0) / dur); draw(p); if (p < 1) requestAnimationFrame(step); else done = true; };
  requestAnimationFrame(step);
  setTimeout(() => { if (!done) { done = true; draw(1); } }, dur + 120);
}
const WEB3FORMS_KEY = '7c89f90e-c488-481c-9d68-d91c05da00f8'; // clé Web3Forms (publique, faite pour être dans la page)
const CONTACT_EMAIL = 'lemansconciergerie@gmail.com';

/* ---------- Mesure d'audience et publicité (SEA / SMO) ----------
   Collez vos identifiants pour activer le suivi sur TOUT le site. Rien n'est chargé
   tant que le visiteur n'a pas accepté (obligatoire en France, recommandations CNIL). */
const TRACKING = {
  ga4: '',           // Google Analytics 4, ex. 'G-XXXXXXXXXX'
  googleAds: '',     // Google Ads, ex. 'AW-XXXXXXXXX'
  googleAdsLead: '', // conversion Google Ads « demande d'audit », ex. 'AW-XXXXXXXXX/AbCdEfGhIj'
  metaPixel: ''      // Pixel Meta (Facebook / Instagram), ex. '123456789012345'
};
window.dataLayer = window.dataLayer || [];
const CONSENT_KEY = 'gardea-consentement', SRC_KEY = 'gardea-provenance';
function loadTracking() {
  if (window.__lmcTags) return; window.__lmcTags = true;
  if (TRACKING.ga4 || TRACKING.googleAds) {
    const s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + (TRACKING.ga4 || TRACKING.googleAds);
    document.head.append(s);
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    if (TRACKING.ga4) gtag('config', TRACKING.ga4);
    if (TRACKING.googleAds) gtag('config', TRACKING.googleAds);
  }
  if (TRACKING.metaPixel) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/fr_FR/fbevents.js');
    fbq('init', TRACKING.metaPixel); fbq('track', 'PageView');
  }
}
function showConsent() {
  if ($('.consent')) return;
  const box = document.createElement('div'); box.className = 'consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Cookies');
  box.innerHTML = L('<p>Nous utilisons des cookies de mesure d\'audience et de publicité pour savoir comment vous nous avez trouvés. <a href="' + ROOT + 'mentions-legales.html#cookies">En savoir plus</a></p><div class="row-c"><button type="button" data-c="non">Refuser</button><button type="button" class="ok" data-c="oui">Accepter</button></div>',
    '<p>We use audience measurement and advertising cookies to find out how you found us. <a href="' + ROOT + 'legal-notice.html#cookies">Learn more</a></p><div class="row-c"><button type="button" data-c="non">Decline</button><button type="button" class="ok" data-c="oui">Accept</button></div>');
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; store('localStorage', CONSENT_KEY, b.dataset.c); if (b.dataset.c === 'oui') loadTracking(); box.remove(); });
  document.body.append(box);
}
const ROOT = document.body.dataset.root || '';
if (Object.values(TRACKING).some(Boolean)) {
  const c = store('localStorage', CONSENT_KEY);
  if (c === 'oui') loadTracking(); else if (c !== 'non') showConsent();
  const cs = $('#cookie-settings'); if (cs) { cs.hidden = false; cs.addEventListener('click', e => { e.preventDefault(); showConsent(); }); }
}
// Provenance des visiteurs (campagnes Google Ads, Meta, liens des réseaux…)
(() => {
  const p = new URLSearchParams(location.search), found = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(k => { if (p.get(k)) found[k] = p.get(k).slice(0, 100); });
  if (document.referrer && !document.referrer.includes(location.host)) found.referrer = document.referrer.slice(0, 150);
  if (Object.keys(found).length && !store('sessionStorage', SRC_KEY)) store('sessionStorage', SRC_KEY, JSON.stringify(found));
})();
function sourceInfo() {
  let s = null; try { s = JSON.parse(store('sessionStorage', SRC_KEY)); } catch (e) {}
  return (s ? Object.entries(s).map(([k, v]) => k + '=' + v).join(' | ') : 'accès direct') + ' | page=' + location.pathname;
}
function trackLead(name) {
  dataLayer.push({ event: 'generate_lead', form_name: name });
  if (window.gtag) {
    if (TRACKING.ga4) gtag('event', 'generate_lead', { form_name: name });
    if (TRACKING.googleAdsLead) gtag('event', 'conversion', { send_to: TRACKING.googleAdsLead });
  }
  if (window.fbq) fbq('track', 'Lead');
}
function sendForm(data) {
  data.access_key = WEB3FORMS_KEY; data.from_name = 'Site Gardéa' + (EN ? ' (EN)' : ''); if (EN) { data.subject = '[EN] ' + data.subject; data.langue = 'anglais (version EN du site)'; } data.provenance = sourceInfo();
  return fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
    .then(r => r.json()).then(r => { if (String(r.success) !== 'true') throw new Error(r.message); return r; });
}
document.addEventListener('click', e => {
  const a = e.target.closest('a.btn, button.btn'); if (!a) return;
  dataLayer.push({ event: 'cta_click', cta_text: a.textContent.trim().slice(0, 60) });
  if (window.gtag && TRACKING.ga4) gtag('event', 'cta_click', { cta_text: a.textContent.trim().slice(0, 60) });
});
$$('.soc').forEach(a => { if (a.getAttribute('href') !== '#') { a.target = '_blank'; a.rel = 'me noopener'; } });

/* ---------- Données ---------- */
// Zone : Le Mans et sa banlieue. Coefficients indicatifs (à ajuster selon votre expérience terrain)
const QUARTIERS = [
  ['Le Mans – centre-ville, Vieux-Mans', 1.10], ['Le Mans – autres quartiers', 1.00],
  ['Allonnes', 0.95], ['Coulaines', 0.95], ['Arnage', 1.00], ['Changé', 0.95], ['Sargé-lès-Le Mans', 0.95],
  ['La Chapelle-Saint-Aubin', 0.95], ['Ruaudin', 0.95], ['Yvré-l\'Évêque', 0.95], ['Saint-Saturnin', 0.95], ['Mulsanne', 1.00],
  ['Autre commune voisine', 0.95]
];
// Libellés affichés en anglais ; la valeur envoyée reste en français
const Q_EN = { 'Le Mans – centre-ville, Vieux-Mans': 'Le Mans – city centre, Old Town', 'Le Mans – autres quartiers': 'Le Mans – other districts', 'Autre commune voisine': 'Another nearby town' };
const qLabel = q => EN && Q_EN[q] || q;
$$('select[data-quartiers]').forEach(s => QUARTIERS.forEach(([q]) => s.add(new Option(qLabel(q), q))));

/* ---------- Chargement, compteurs ---------- */
setTimeout(() => document.body.classList.add('loaded'), 60);
function countUp(el) {
  const to = +el.dataset.count, suf = el.dataset.suffix || '';
  const out = v => new Intl.NumberFormat(EN ? 'en-GB' : 'fr-FR').format(Math.round(v)).replace(/ /g, ' ') + suf;
  animate(1600, p => el.textContent = out(to * (1 - Math.pow(1 - p, 4))));
}
setTimeout(() => $$('.float [data-count]').forEach(countUp), reduce ? 0 : 1100);
// Longueur des tracés à dessiner dans les illustrations
$$('.illus .draw').forEach(p => { try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1); } catch (e) {} });

/* ---------- Défilement : apparitions, barre, nav, parallaxe, schémas ---------- */
let pending = $$('.rv,.clip,[data-count]:not(.float [data-count]),#flow,.illus,.months');
const nav = $('#nav'), prog = $('#progress'), sticky = $('#sticky'), pimg = $$('[data-parallax]');
const progressLists = $$('#steps,.journey').map(el => ({ el, items: $$(':scope > li:not(.bar):not(.jbar)', el) }));
const bandP = $('#band-txt');
const bandWords = bandP ? (() => { bandP.innerHTML = bandP.textContent.split(' ').map(w => `<span class="w">${w}</span>`).join(' '); return $$('.w', bandP); })() : [];
const contactSec = $('#contact');
let lastY = scrollY, ticking = false;
function onScroll() {
  const y = scrollY, h = innerHeight, max = document.documentElement.scrollHeight - h;
  if (prog) prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  if (nav) {
    nav.classList.toggle('scrolled', y > 10);
    nav.classList.toggle('hide', !reduce && y > 400 && y > lastY && !$('#menu').classList.contains('open'));
  }
  lastY = y;
  if (sticky) sticky.classList.toggle('show', y > h * .8 && (!contactSec || contactSec.getBoundingClientRect().top > h) && (!$('#formulaire') || $('#formulaire').getBoundingClientRect().bottom < 0 || $('#formulaire').getBoundingClientRect().top > h));
  pending = pending.filter(el => {
    const r = el.getBoundingClientRect();
    if (reduce || (r.top < h * .88 && r.bottom > 0)) {
      el.classList.add('in');
      if (el.dataset.count !== undefined) countUp(el);
      return false;
    }
    return true;
  });
  progressLists.forEach(({ el, items }) => {
    const sr = el.getBoundingClientRect();
    const sp = Math.min(1, Math.max(0, (h * .75 - sr.top) / (sr.height + h * .25)));
    el.style.setProperty('--prog', reduce ? 1 : sp);
    items.forEach((li, i) => li.classList.toggle('on', reduce || sp >= i / items.length + .02));
  });
  bandWords.forEach(w => { const r = w.getBoundingClientRect(); w.classList.toggle('lit', reduce || r.top < h * .8); });
  if (!reduce && innerWidth > 700) pimg.forEach(img => {
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > h) return;
    img.style.translate = `0 ${((r.top + r.height / 2 - h / 2) / h) * -8}%`;
  });
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ---------- Bandeaux qui défilent (galerie, avis) ---------- */
$$('.track, .avis-track').forEach(t => {
  if (reduce) return;
  [...t.children].forEach(c => { const d = c.cloneNode(true); if (d.tagName === 'IMG') d.alt = ''; d.setAttribute('aria-hidden', 'true'); t.append(d); });
});

/* ---------- Boutons magnétiques ---------- */
if (fine && !reduce) $$('.btn').forEach(b => {
  b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.setProperty('--x', (e.clientX - r.left - r.width / 2) * .18 + 'px'); b.style.setProperty('--y', (e.clientY - r.top - r.height / 2) * .3 + 'px'); });
  b.addEventListener('pointerleave', () => { b.style.setProperty('--x', '0px'); b.style.setProperty('--y', '0px'); });
});

/* ---------- Menu ---------- */
const burger = $('.burger'), menu = $('#menu');
if (burger && menu) {
  const setMenu = o => {
    menu.classList.toggle('open', o); document.body.classList.toggle('menu-open', o);
    burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? L('Fermer le menu', 'Close menu') : L('Ouvrir le menu', 'Open menu'));
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if (menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); } });
  addEventListener('resize', () => { if (innerWidth > 1180) setMenu(false); });
}

/* ---------- Accordéons (FAQ) ---------- */
$$('.acc-q').forEach(q => q.addEventListener('click', () => {
  const open = q.getAttribute('aria-expanded') === 'true';
  const scope = q.closest('.acc') || document;
  $$('.acc-q', scope).forEach(o => { o.setAttribute('aria-expanded', 'false'); o.closest('.acc-item').classList.remove('open'); });
  q.setAttribute('aria-expanded', String(!open)); q.closest('.acc-item').classList.toggle('open', !open);
}));

/* ---------- FAQ : recherche et sommaire ---------- */
const faqSearch = $('#faq-search');
if (faqSearch) {
  const items = $$('.faq-cat .acc-item'), empty = $('#faq-empty');
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  faqSearch.addEventListener('input', () => {
    const q = norm(faqSearch.value.trim()); let shown = 0;
    items.forEach(it => { const ok = !q || norm(it.textContent).includes(q); it.hidden = !ok; if (ok) shown++; });
    $$('.faq-cat').forEach(c => { c.hidden = !$$('.acc-item:not([hidden])', c).length; });
    empty.hidden = shown > 0;
    if (q && shown && shown <= 3) $$('.acc-item:not([hidden])').forEach(it => { it.classList.add('open'); $('.acc-q', it).setAttribute('aria-expanded', 'true'); });
  });
  const links = $$('.faq-nav a'), cats = $$('.faq-cat');
  addEventListener('scroll', () => {
    let cur = cats[0]; cats.forEach(c => { if (c.getBoundingClientRect().top < innerHeight * .35) cur = c; });
    links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur.id));
  }, { passive: true });
}

/* ---------- Blog : filtres ---------- */
const blogFilters = $('#blog-filters');
if (blogFilters) blogFilters.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('button', blogFilters).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  $$('.post[data-cat]').forEach(p => { p.hidden = b.dataset.v !== 'tout' && p.dataset.cat !== b.dataset.v; });
});

/* ---------- Estimation en 3 étapes ----------
   Hypothèses moyennes pour Le Mans, à ajuster avec votre expérience terrain. */
const EST = {
  types: { studio: { base: 42, ref: 25, cap: 2 }, t2: { base: 55, ref: 40, cap: 4 }, t3: { base: 70, ref: 60, cap: 6 }, t4: { base: 88, ref: 80, cap: 8 }, maison: { base: 100, ref: 95, cap: 8 } },
  occupation: [0.63, 0.56, 0.50, 0.50, 0.52, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.52, 0.48], // même ordre que QUARTIERS
  atouts: { parking: 0.06, jardin: 0.05, exterieur: 0.03, transport: 0.03, renove: 0.04, cachet: 0.04 },
};
/* Commission HT par tranches : chaque taux ne s'applique qu'à sa tranche du montant des séjours du mois.
   Minimum de 150 € dès qu'il y a au moins un séjour, 0 € sans séjour. */
const TIERS = [[0, 800, 0.10], [800, 1500, 0.15], [1500, 2500, 0.20], [2500, Infinity, 0.25]], COM_MIN = 150;
const commission = m => {
  if (!(m > 0)) return { parts: TIERS.map(() => 0), raw: 0, total: 0, min: false, rate: 0 };
  const parts = TIERS.map(([a, b, r]) => Math.round(Math.max(0, Math.min(m, b) - a) * r));
  const raw = parts.reduce((x, y) => x + y, 0), total = Math.max(raw, COM_MIN);
  return { parts, raw, total, min: raw < COM_MIN, rate: total / m };
};
const pct = v => new Intl.NumberFormat(EN ? 'en-GB' : 'fr-FR', { maximumFractionDigits: 1 }).format(Math.round(v * 1000 + 1e-6) / 10) + L(' %', '%');
const wiz = $('#wiz');
if (wiz) {
  const shown = {};
  const tween = (id, to) => {
    const el = $('#' + id), from = shown[id] ?? 0; shown[id] = to;
    const my = (tween.v[id] = (tween.v[id] || 0) + 1);
    animate(600, p => { if (tween.v[id] === my) el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - p, 3))); });
  };
  tween.v = {};
  const ws = { type: '', voy: 4, sdb: 1, atouts: new Set() }, wq = $('#w-quartier');
  QUARTIERS.forEach(([q]) => wq.add(new Option(qLabel(q), q)));
  const wizGo = n => {
    $$('.wiz-panel', wiz).forEach(p => p.classList.toggle('on', +p.dataset.p === n));
    $$('.wiz-steps li', wiz).forEach(li => { const s = +li.dataset.s; li.classList.toggle('on', s === n); li.classList.toggle('done', s < n); });
    $('#wiz-bar').style.width = (n / 3 * 100) + '%';
    const t = $('.wiz-panel.on h3, .wiz-panel.on .wiz-grid select', wiz);
    if (n > 1 && t) t.focus({ preventScroll: true });
    const top = wiz.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * .6) wiz.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  $$('[data-single]', wiz).forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', g).forEach(x => x.setAttribute('aria-checked', String(x === b)));
    ws[g.dataset.single] = b.dataset.v; g.classList.remove('bad');
    const t = EST.types[b.dataset.v]; if (t && !$('#w-surface').value) $('#w-surface').placeholder = t.ref;
  }));
  $$('[data-multi]', wiz).forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on));
    ws.atouts[on ? 'add' : 'delete'](b.dataset.v);
  }));
  $$('[data-stepper]', wiz).forEach(s => s.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const k = s.dataset.stepper; ws[k] = Math.min(+s.dataset.max, Math.max(+s.dataset.min, ws[k] + +b.dataset.d));
    $('#w-' + k).textContent = ws[k];
  }));
  $$('[data-go]', wiz).forEach(b => b.addEventListener('click', () => wizGo(+b.dataset.go)));
  const wizCalc = () => {
    const t = EST.types[ws.type], qi = wq.selectedIndex - 1, surface = +$('#w-surface').value;
    let night = t.base * QUARTIERS[qi][1] + Math.min(40, Math.max(0, surface - t.ref) * 0.25) + Math.max(0, ws.voy - t.cap) * 5 + (ws.sdb - 1) * 6;
    let bonus = 0; ws.atouts.forEach(a => bonus += EST.atouts[a]);
    night = Math.round(night * (1 + bonus));
    let occ = EST.occupation[qi] + (ws.atouts.has('parking') ? .01 : 0) + (ws.atouts.has('transport') ? .01 : 0);
    occ = Math.min(.8, Math.max(.35, occ));
    const nights = Math.round(30.4 * occ);
    const gross = night * nights, c = commission(gross), com = c.total, rate = c.rate, net = gross - com;
    const r10 = v => Math.round(v / 10) * 10;
    return { c, rate, night, occ, nights, gross, com, net, min: r10(net * .85), max: r10(net * 1.15), year: net * 12, surface, quartier: QUARTIERS[qi][0] };
  };
  let lastEst = null, resume = '';
  const mkResume = r => `${r.surface} m², ${ws.type.toUpperCase()}, ${ws.voy} voyageurs, ${ws.sdb} sdb, ${r.quartier}${ws.atouts.size ? ', atouts : ' + [...ws.atouts].join(', ') : ''} : ${r.night} €/nuit, ${Math.round(r.occ * 100)} % d'occupation, brut ${fmt(r.gross)}, commission HT ${fmt(r.com)} (taux effectif ${pct(r.rate)}${r.c.min ? ', minimum mensuel' : ''}), propriétaire ${fmt(r.net)}/mois`;
  const showEst = r => {
    ['r-net', 'r-net2'].forEach(id => tween(id, r.net));
    tween('r-min', r.min); tween('r-max', r.max); tween('r-year', r.year); tween('r-night', r.night);
    tween('r-gross', r.gross); tween('r-com', r.com);
    $('#r-rate').textContent = L('taux effectif ', 'effective rate ') + pct(r.rate);
    const rt = $('#r-tiers');
    if (rt) rt.innerHTML = TIERS.map(([a, b, t], k) => r.c.parts[k] ? `<li><span>${b === Infinity ? L('Au-delà de ', 'Above ') + fmt(a) : fmt(a) + ' – ' + fmt(b)} · ${pct(t)}</span><b>${fmt(r.c.parts[k])}</b></li>` : '').join('')
      + (r.c.min ? `<li class="min"><span>${L('Minimum mensuel appliqué', 'Monthly minimum applied')}</span><b>${fmt(COM_MIN)}</b></li>` : '');
    $('#r-occ').textContent = Math.round(r.occ * 100) + L(' %', '%'); $('#r-nights').textContent = r.nights;
  };
  $('#wiz-1').addEventListener('submit', e => {
    e.preventDefault();
    const miss = [];
    $$('.f', e.target).forEach(f => f.classList.remove('bad'));
    if (!wq.value) { miss.push(L('la commune', 'the town')); wq.closest('.f').classList.add('bad'); }
    const sf = $('#w-surface'); if (!sf.value || !sf.checkValidity()) { miss.push(L('la surface', 'the floor area')); sf.closest('.f').classList.add('bad'); }
    if (!ws.type) { miss.push(L('le type de logement', 'the property type')); $('[data-single=type]').classList.add('bad'); }
    $('#wiz-err-1').textContent = miss.length ? L('Il manque ', 'Please add ') + miss.join(', ') + '.' : '';
    if (miss.length) return;
    lastEst = wizCalc(); wizGo(2);
  });
  $('#wiz-2').addEventListener('submit', e => {
    e.preventDefault();
    const em = $('#w-email'), tel = $('#w-tel');
    const okEmail = em.value && em.checkValidity(), okTel = tel.value.replace(/\D/g, '').length >= 9;
    if (!okEmail && !okTel) { $('#wiz-err-2').textContent = em.value && !em.checkValidity() ? L('Cette adresse e-mail ne semble pas valide.', 'This email address doesn\'t look valid.') : L('Indiquez un e-mail ou un numéro de téléphone.', 'Please enter an email or a phone number.'); em.focus(); return; }
    $('#wiz-err-2').textContent = '';
    const r = lastEst || wizCalc();
    resume = mkResume(r);
    // Envoi de la demande (le résultat s'affiche même si l'envoi échoue)
    const data = { subject: 'Estimation en ligne Le Mans Conciergerie – ' + r.quartier + ', ' + r.surface + ' m²', nom: $('#w-nom').value || '(non renseigné)', email: em.value || '(non renseigné)', telephone: tel.value || '(non renseigné)', estimation: resume };
    if (okEmail) data.replyto = em.value;
    sendForm(data).then(() => trackLead('estimation')).catch(() => {});
    showEst(r);
    wizGo(3);
  });
  $('#send-est').addEventListener('click', () => {
    const r = lastEst || wizCalc();
    store('sessionStorage', 'lmc-audit', JSON.stringify({ surface: r.surface, quartier: r.quartier, type: ws.type, nom: $('#w-nom').value, email: $('#w-email').value, telephone: $('#w-tel').value, estimation: resume }));
    location.href = ROOT + 'audit.html#formulaire';
  });
}

/* ---------- Formulaire de contact (accueil) ---------- */
const lowerFirst = t => t.charAt(0).toLowerCase() + t.slice(1);
const cform = $('#form');
if (cform) {
  const msg = $('#formMsg');
  cform.addEventListener('submit', e => {
    e.preventDefault();
    $$('.f, .chk', cform).forEach(f => f.classList.remove('bad'));
    const bad = $$('[required]', cform).filter(f => !f.checkValidity());
    if (bad.length) {
      bad.forEach(f => f.closest('.f, .chk').classList.add('bad')); bad[0].focus();
      msg.className = 'msg err'; msg.textContent = L('Il manque : ', 'Please fill in: ') + bad.map(f => f.dataset.name || lowerFirst(f.labels[0].textContent)).join(', ') + '.'; return;
    }
    const btn = $('button[type=submit]', cform); btn.disabled = true;
    msg.className = 'msg'; msg.textContent = L('Envoi en cours…', 'Sending…');
    const data = Object.fromEntries(new FormData(cform));
    data.subject = 'Gardéa : propriétaire pilote – ' + data.nom + ' (' + data.type_logement + ', ' + data.quartier + ')';
    data.replyto = data.email;
    sendForm(data).then(() => {
      msg.className = 'msg ok'; msg.textContent = L('Merci ' + data.nom.split(' ')[0] + ', votre demande est bien envoyée. Je vous rappelle rapidement pour fixer un rendez-vous.', 'Thank you ' + data.nom.split(' ')[0] + ', your request has been sent. I\'ll call you back shortly to arrange a visit.');
      trackLead('contact'); cform.reset();
    }).catch(() => {
      msg.className = 'msg err'; msg.textContent = L('L\'envoi a échoué. Écrivez-nous directement à ', 'Sending failed. Please email us directly at ') + CONTACT_EMAIL + '.';
    }).finally(() => { btn.disabled = false; });
  });
}

/* ---------- Formulaire d'audit (audit.html) ---------- */
const aform = $('#audit');
if (aform) {
  const out = $('#a-msg-out'), seg = $('.seg', aform); let deja = '';
  seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', seg).forEach(x => x.setAttribute('aria-checked', String(x === b)));
    deja = b.dataset.v; $('#f-annonce').hidden = deja !== 'Oui';
  });
  // Pré-remplissage depuis l'estimation de la page d'accueil
  let pre = null; try { pre = JSON.parse(store('sessionStorage', 'lmc-audit')); } catch (e) {}
  if (pre) {
    const types = { studio: 'Studio', t2: 'T2', t3: 'T3', t4: 'T4 et plus', maison: 'Maison' };
    const set = (id, v) => { if (v) $(id).value = v; };
    set('#a-surface', pre.surface); set('#a-quartier', pre.quartier); set('#a-type', types[pre.type]);
    set('#a-nom', pre.nom); set('#a-email', pre.email); set('#a-tel', pre.telephone); set('#a-est', pre.estimation);
    if (pre.estimation) $('#est-note').hidden = false;
  }
  aform.addEventListener('submit', e => {
    e.preventDefault();
    $$('.f', aform).forEach(f => f.classList.remove('bad'));
    const miss = $$('[required]', aform).filter(f => !f.value || !f.checkValidity());
    miss.forEach(f => f.closest('.f').classList.add('bad'));
    const em = $('#a-email'), tel = $('#a-tel');
    const okEmail = em.value && em.checkValidity(), okTel = tel.value.replace(/\D/g, '').length >= 9;
    const names = miss.map(f => lowerFirst(f.labels[0].textContent));
    if (!okEmail && !okTel) { names.push(L('un téléphone ou un e-mail valide', 'a valid phone number or email')); (em.value ? em : tel).closest('.f').classList.add('bad'); }
    if (names.length) { out.className = 'msg err'; out.textContent = L('Il manque : ', 'Please fill in: ') + names.join(', ') + '.'; (miss[0] || tel).focus(); return; }
    const btn = $('button[type=submit]', aform); btn.disabled = true;
    out.className = 'msg'; out.textContent = L('Envoi en cours…', 'Sending…');
    const data = Object.fromEntries(new FormData(aform));
    data.deja_en_ligne = deja || '(non précisé)';
    data.subject = 'Demande d\'audit gratuit – ' + data.nom + ' (' + data.surface + ' m², ' + data.quartier + ')';
    if (okEmail) data.replyto = em.value;
    sendForm(data).then(() => {
      trackLead('audit'); store('sessionStorage', 'lmc-audit', '');
      $('#done-t').textContent = L('Merci ' + data.nom.split(' ')[0] + ', c\'est envoyé !', 'Thank you ' + data.nom.split(' ')[0] + ', it\'s on its way!');
      aform.hidden = true; const d = $('#done'); d.hidden = false; d.focus();
    }).catch(() => {
      out.className = 'msg err'; out.textContent = L('L\'envoi a échoué. Écrivez-nous directement à ', 'Sending failed. Please email us directly at ') + CONTACT_EMAIL + '.';
    }).finally(() => { btn.disabled = false; });
  });
}

$$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

/* ---------- Version anglaise : suggestion discrète, sans redirection ---------- */
(() => {
  const enLink = $('.lang-sw a[hreflang="en"]');
  if (EN || !enLink || store('localStorage', 'lmc-lang-hint')) return;
  const langs = navigator.languages || [navigator.language || ''];
  if (!/^en\b/i.test(langs[0] || '') || langs.some(l => /^fr\b/i.test(l))) return;
  const box = document.createElement('div'); box.className = 'lang-hint'; box.lang = 'en'; box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Language');
  box.innerHTML = '<span>This page is also available in English. <a href="' + enLink.getAttribute('href') + '" hreflang="en">Read in English</a></span><button type="button" aria-label="Dismiss">×</button>';
  const close = () => { store('localStorage', 'lmc-lang-hint', '1'); box.remove(); };
  box.querySelector('button').addEventListener('click', close);
  box.querySelector('a').addEventListener('click', () => store('localStorage', 'lmc-lang-hint', '1'));
  setTimeout(() => document.body.append(box), 1200);
})();


/* ---------- Démo : création d'une annonce, étape par étape (accueil) ---------- */
(() => {
  const demo = $('#lst-demo'); if (!demo) return;
  const steps = $$('.lst-steps li'), tys = $$('.ty', demo), bar = $('.ed-prog i', demo), replay = $('.lst-replay', demo);
  const texts = tys.map(t => t.textContent);
  if (reduce || !('IntersectionObserver' in window)) { steps.forEach(li => li.classList.add('done')); return; } // état final affiché
  let run = 0;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const type = async (el, txt, speed, id) => {
    el.classList.add('typing');
    for (let i = 1; i <= txt.length; i++) { if (id !== run) return; el.textContent = txt.slice(0, i); await wait(speed); }
    el.classList.remove('typing');
  };
  const go = n => {
    demo.dataset.cur = n; demo.classList.add('s' + n); bar.style.width = (n / 6 * 100) + '%';
    steps.forEach(li => { const k = +li.dataset.s; li.classList.toggle('on', k === n); li.classList.toggle('done', k < n); });
  };
  const reset = () => {
    demo.className = 'bx-vis lst armed'; delete demo.dataset.cur; bar.style.width = '0%';
    tys.forEach(t => { t.textContent = ''; t.classList.remove('typing'); });
    steps.forEach(li => li.classList.remove('on', 'done'));
  };
  const play = async () => {
    const id = ++run; replay.hidden = true; reset();
    const ok = () => id === run;
    await wait(400); if (!ok()) return;
    go(1); await wait(1500); if (!ok()) return;
    go(2); await type(tys[0], texts[0], 38, id); await wait(350); if (!ok()) return;
    go(3); await type(tys[1], texts[1], 18, id); await wait(350); if (!ok()) return;
    go(4); await wait(1300); if (!ok()) return;
    go(5); await wait(1400); if (!ok()) return;
    go(6); await wait(1000); if (!ok()) return;
    delete demo.dataset.cur; steps.forEach(li => { li.classList.remove('on'); li.classList.add('done'); });
    replay.hidden = false;
  };
  reset();
  replay.addEventListener('click', play);
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .35 });
  io.observe(demo);
})();

/* ---------- Grille de commission par tranches : curseur et exemples ---------- */
$$('[data-tiers]').forEach(box => {
  const range = $('.tiers-range', box), out = $('.tiers-amt', box), segs = $$('.tb', box), rows = $$('tbody tr', box);
  const draw = m => {
    const c = commission(m);
    out.textContent = fmt(m);
    range.setAttribute('aria-valuetext', fmt(m));
    segs.forEach((sg, k) => { const [a, b] = TIERS[k], span = (b === Infinity ? +sg.dataset.span : b - a); sg.style.setProperty('--f', Math.max(0, Math.min(1, (m - a) / span))); sg.classList.toggle('on', m > a); });
    rows.forEach((tr, k) => { $('[data-c]', tr).textContent = fmt(c.parts[k]); tr.classList.toggle('on', c.parts[k] > 0); });
    $('.tt-min', box).hidden = !c.min;
    $('[data-total]', box).textContent = fmt(c.total);
    $('[data-eff]', box).textContent = m > 0 ? pct(c.rate) : '–';
    $('[data-net]', box).textContent = fmt(m - c.total);
    $$('.tiers-chips button', box).forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === m)));
  };
  range.addEventListener('input', () => draw(+range.value));
  $$('.tiers-chips button', box).forEach(b => b.addEventListener('click', () => { range.value = b.dataset.v; draw(+b.dataset.v); }));
  draw(+range.value);
});

/* ---------- Gardéa : offre de lancement, avis Google, calculateur des tarifs ---------- */
// Offre de lancement : retirée automatiquement après la date de data-offre-fin (outils/config.py)
(() => {
  const fin = document.body.dataset.offreFin;
  if (!fin || new Date() > new Date(fin + 'T23:59:59')) $$('[data-offre-lancement]').forEach(b => b.remove());
})();
// Avis Google : rien ne s'affiche tant que GOOGLE_REVIEWS_URL (outils/config.py) est vide
(() => {
  const url = document.body.dataset.reviews;
  if (url) $$('[data-google-reviews]').forEach(b => { $('a', b).href = url; b.hidden = false; });
})();
// Calculateur : tout est calculé dans le navigateur, rien n'est envoyé
$$('[data-calc]').forEach(f => {
  const n = id => Math.max(0, +$(id, f).value || 0);
  const draw = () => {
    const montant = n('#k-montant'), nb = Math.round(n('#k-nb')), forfait = +$('#k-type', f).value;
    $('[data-k=com]', f).textContent = fmt(Math.round(montant * .15));
    $('[data-k=men]', f).textContent = fmt(nb * forfait);
    $('[data-k=cmp]', f).textContent = fmt(Math.round(montant * .22));
  };
  f.addEventListener('input', draw); f.addEventListener('submit', e => e.preventDefault()); draw();
});
