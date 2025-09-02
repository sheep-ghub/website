// Mobile nav toggle
(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
})();

// Year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Contact form handler (front-end only)
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('İletişim formu gönderildi:', data);
    form.reset();
    alert('Teşekkürler! En kısa sürede sizinle iletişime geçeceğiz.');
  });
}

// Hero background rotator with blurred fade (~8s)
(function rotateHero() {
  const hero = document.querySelector('.hero .hero-image');
  if (!hero) return;

  const images = [
    'assets/img/hero-01.PNG',
    'assets/img/hero-02.PNG',
    'assets/img/hero-03.PNG',
    'assets/img/hero-04.PNG'
  ];

  // Preload
  images.forEach(src => { const img = new Image(); img.src = src; });

  // Create fade layer
  const fadeLayer = document.createElement('div');
  Object.assign(fadeLayer.style, {
    position: 'absolute', inset: '0', backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'blur(8px)', opacity: '0', transition: 'opacity 600ms ease', pointerEvents: 'none', borderRadius: '16px'
  });
  hero.appendChild(fadeLayer);

  let i = 0;
  const apply = (index) => {
    const nextIndex = (typeof index === 'number') ? ((index % images.length) + images.length) % images.length : i;
    const next = images[nextIndex];
    fadeLayer.style.backgroundImage = `url('${next}')`;
    requestAnimationFrame(() => { fadeLayer.style.opacity = '1'; });
    setTimeout(() => {
      hero.style.backgroundImage = `url('${next}')`;
      fadeLayer.style.opacity = '0';
    }, 650);
    i = (nextIndex + 1) % images.length;
  };

  // Initialize with first image
  hero.style.backgroundImage = `url('${images[0]}')`;
  i = 1;

  let timer = setInterval(() => apply(), 8000);

  // Controls
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');
  const restart = () => { clearInterval(timer); timer = setInterval(() => apply(), 8000); };
  if (prevBtn) prevBtn.addEventListener('click', () => { apply(i - 2); restart(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { apply(i); restart(); });
})();

// Floating back-to-home button (hide on homepage)
(function addBackToHome() {
  // Determine if current page is the homepage
  const path = (location.pathname || '').toLowerCase();
  const file = path.split('/').pop();
  const isHome = file === '' || file === 'index.html' || file === 'index.htm';
  if (isHome) return; // Do not render on the homepage

  if (document.querySelector('.back-to-home')) return;
  const wrap = document.createElement('div');
  wrap.className = 'back-to-home';
  const a = document.createElement('a');
  a.href = 'index.html';
  a.setAttribute('aria-label', 'Ana menüye dön');
  a.innerText = 'Ana menüye dön';
  wrap.appendChild(a);
  document.body.appendChild(wrap);
})();

// Theme toggle (top-right) with persistent preference
(function themeToggle() {
  const root = document.documentElement;
  const STORAGE_KEY = 'theme-preference';
  const getStored = () => localStorage.getItem(STORAGE_KEY);
  const setStored = (val) => localStorage.setItem(STORAGE_KEY, val);
  const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = (mode) => {
    if (mode === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    updateButton(mode);
  };

  // Create toggle UI
  let container = document.querySelector('.theme-toggle');
  if (!container) {
    container = document.createElement('div');
    container.className = 'theme-toggle';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Temayı değiştir');
    btn.title = 'Tema: Açık/Koyu';
    container.appendChild(btn);
    document.body.appendChild(container);
  }
  const button = container.querySelector('button');

  function updateButton(mode) {
    if (!button) return;
    if (mode === 'dark') {
      button.textContent = '☀️';
      button.setAttribute('aria-label', 'Açık temaya geç');
      button.title = 'Açık temaya geç';
    } else {
      button.textContent = '🌙';
      button.setAttribute('aria-label', 'Koyu temaya geç');
      button.title = 'Koyu temaya geç';
    }
  }

  // Init theme
  const stored = getStored();
  const initial = stored || (prefersDark() ? 'dark' : 'light');
  applyTheme(initial);

  // Toggle handler
  button && button.addEventListener('click', () => {
    const currentDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = currentDark ? 'light' : 'dark';
    applyTheme(next);
    setStored(next);
  });

  // Sync with system when user has no explicit choice
  if (!stored && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener && mq.addEventListener('change', (e) => {
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }
})();
