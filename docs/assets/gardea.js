/* Le Mans Conciergerie : offre de lancement, avis Google, calculateur des tarifs. Le reste (menu, formulaires, animations) : assets/kit. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EN = /^en/i.test(document.documentElement.lang);
  const fmt = n => EN ? '€' + new Intl.NumberFormat('en-GB').format(Math.round(n))
    : new Intl.NumberFormat('fr-FR').format(Math.round(n)).replace(/\s/g, ' ') + ' €';
  // offre de lancement : retirée après la date de data-offre-fin (outils/config.py)
  const fin = document.body.dataset.offreFin;
  if (!fin || new Date() > new Date(fin + 'T23:59:59')) $$('[data-offre-lancement]').forEach(b => b.remove());
  // avis Google : rien ne s'affiche tant que GOOGLE_REVIEWS_URL est vide
  const url = document.body.dataset.reviews;
  if (url) $$('[data-google-reviews]').forEach(b => { $('a', b).href = url; b.hidden = false; });
  // calculateur : tout est calculé dans le navigateur, rien n'est envoyé
  $$('[data-calc]').forEach(f => {
    const n = id => Math.max(0, +$(id, f).value || 0);
    const draw = () => {
      const m = n('#k-montant'), nb = Math.round(n('#k-nb')), forfait = +$('#k-type', f).value;
      $('[data-k=com]', f).textContent = fmt(m * .15);
      $('[data-k=men]', f).textContent = fmt(nb * forfait);
      $('[data-k=cmp]', f).textContent = fmt(m * .22);
    };
    f.addEventListener('input', draw); f.addEventListener('change', draw); f.addEventListener('submit', e => e.preventDefault()); draw();
  });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
