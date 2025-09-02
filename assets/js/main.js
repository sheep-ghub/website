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
    'assets/img/hero-01.png',
    'assets/img/hero-02.png',
    'assets/img/hero-03.png',
    'assets/img/hero-04.png'
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
  const apply = () => {
    const next = images[i];
    fadeLayer.style.backgroundImage = `url('${next}')`;
    // start fade-in
    requestAnimationFrame(() => { fadeLayer.style.opacity = '1'; });
    // after fade, set as base bg and hide overlay
    setTimeout(() => {
      hero.style.backgroundImage = `url('${next}')`;
      fadeLayer.style.opacity = '0';
    }, 650);
    i = (i + 1) % images.length;
  };
  // Initialize with first image
  hero.style.backgroundImage = `url('${images[0]}')`;
  i = 1;
  setInterval(apply, 8000);
})();
