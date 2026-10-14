// Ogni pagina si apre dall'inizio (alcuni browser e contenitori mantengono lo scroll della pagina precedente)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) {
  // salto istantaneo (lo scroll-behavior smooth del CSS lo renderebbe interrompibile) e ripetuto a pagina caricata
  const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  toTop();
  window.addEventListener('DOMContentLoaded', toTop);
  window.addEventListener('pageshow', toTop);
  window.addEventListener('load', () => { toTop(); setTimeout(toTop, 150); });
}

// Menu mobile
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('nav-menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Apri il menu' : 'Chiudi il menu');
    menu.classList.toggle('is-open', !open);
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Apri il menu');
      menu.classList.remove('is-open');
    }
  });
}

// Pulsante torna in alto
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  const onScroll = () => backToTop.classList.toggle('is-visible', window.scrollY > 600);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Anno nel footer
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Animazioni allo scroll + contatori
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js');

  const groups = [
    '.about-grid > *', '.section-head', '.why-card', '.service-card',
    '.testimonial', '.post', '.footer-grid > *', '.step', '.faq-item', '.faq-head', '.booking-card', '.tl-item', '.career-card', '.sede'
  ];
  document.querySelectorAll(groups.join(',')).forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.matches(groups.join(',')));
    el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 4) * 0.1}s`);
    el.classList.add('reveal');
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('is-in');
        io.unobserve(el);
        // a comparsa finita torna alle transizioni normali (hover senza ritardo)
        setTimeout(() => el.classList.remove('reveal', 'is-in'), 1000);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 80px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Contatori delle cifre nell'hero
  document.querySelectorAll('.stats strong').forEach((el) => {
    const match = el.textContent.match(/^(\d+)(.*)$/);
    if (!match) return;
    const target = Number(match[1]);
    const suffix = match[2];
    const duration = 1400;
    const start = performance.now() + 400;
    el.textContent = `0${suffix}`;
    const tick = (now) => {
      const t = Math.min(Math.max((now - start) / duration, 0), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// Immagini decorative: se mancano, nasconde l'icona di immagine rotta
document.querySelectorAll('img.organ').forEach((img) => {
  const hide = () => { img.style.visibility = 'hidden'; };
  if (img.complete && !img.naturalWidth) hide();
  else img.addEventListener('error', hide);
});

// Navbar: sfondo vetro dopo i primi pixel di scroll
const header = document.querySelector('.site-header');
if (header) {
  const onHeaderScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll();
}

// Bottoni primari: livelli per lama di luce, bagliore e freccia
document.querySelectorAll('.btn:not(.btn--outline):not(.btn--ghost):not(.btn--light)').forEach((btn) => {
  if (btn.querySelector('.btn-shine')) return;
  btn.insertAdjacentHTML('afterbegin', '<span class="btn-shine" aria-hidden="true"></span><span class="btn-glow" aria-hidden="true"></span>');
  btn.insertAdjacentHTML('beforeend', '<svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>');
});

// FAQ: una sola risposta aperta alla volta (fallback per browser che ignorano <details name>)
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach((other) => { if (other !== item) other.open = false; });
  });
});

// Linee verdi: si disegnano quando entrano nello schermo
const drawables = document.querySelectorAll('.ecg, .steps');
if ('IntersectionObserver' in window) {
  const drawIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-drawn'); drawIO.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  drawables.forEach((el) => drawIO.observe(el));
} else {
  drawables.forEach((el) => el.classList.add('is-drawn'));
}
