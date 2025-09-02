// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

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

// Floating back-to-home button (site-wide)
(function addBackToHome() {
  if (document.querySelector('.back-to-home')) return;
  const wrap = document.createElement('div');
  wrap.className = 'back-to-home';
  const a = document.createElement('a');
  a.href = '/index.html';
  a.setAttribute('aria-label', 'Ana menüye dön');
  a.innerText = 'Ana menüye dön';
  wrap.appendChild(a);
  document.body.appendChild(wrap);
})();
