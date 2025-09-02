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

// Hero background rotator (15s)
(function rotateHero() {
  const hero = document.querySelector('.hero .hero-image');
  if (!hero) return;

  const images = [
    'assets/img/hero-placeholder.svg',
    'assets/img/ref-1.svg',
    'assets/img/ref-2.svg',
    'assets/img/ref-3.svg'
  ];

  // Preload
  images.forEach(src => { const img = new Image(); img.src = src; });

  let i = 0;
  const apply = () => {
    hero.style.backgroundImage = `url('${images[i]}')`;
    i = (i + 1) % images.length;
  };
  apply();
  setInterval(apply, 15000);
})();
