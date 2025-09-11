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

  // Change image on mouse wheel over hero (with throttle)
  let wheelCooldown = false;
  const onWheel = (e) => {
    // Stop page scrolling when over hero
    e.preventDefault();
    if (wheelCooldown) return;
    const dir = e.deltaY > 0 ? 1 : -1; // down = next, up = prev
    if (dir > 0) {
      apply(i);
    } else {
      apply(i - 2);
    }
    restart();
    wheelCooldown = true;
    setTimeout(() => { wheelCooldown = false; }, 700);
  };
  hero.addEventListener('wheel', onWheel, { passive: false });
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

  // Create clock element next to the theme button
  let clock = container.querySelector('.theme-clock');
  if (!clock) {
    clock = document.createElement('span');
    clock.className = 'theme-clock';
    clock.setAttribute('aria-live', 'polite');
    clock.setAttribute('aria-label', 'Anlık saat');
    clock.title = 'Yerel saat';
    // Insert clock to the right of the button
    container.appendChild(clock);
  }

  // Clock updater (HH:mm:ss with Turkish locale)
  const fmt = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const updateClock = () => {
    try {
      const now = new Date();
      clock.textContent = fmt.format(now);
    } catch (e) {
      // Fallback formatting
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
  };
  updateClock();
  setInterval(updateClock, 1000);

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

// Product cards: on homepage, navigate to the products page
(function productLinks() {
  const path = (location.pathname || '').toLowerCase();
  const file = path.split('/').pop();
  const isHome = file === '' || file === 'index.html' || file === 'index.htm';
  if (!isHome) return; // only homepage

  const cards = document.querySelectorAll('.product');
  if (!cards.length) return;
  const goto = () => { window.location.href = 'urunler.html'; };
  cards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', goto);
    card.tabIndex = 0;
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goto();
      }
    });
  });
})();

// Product modal: only on products page (urunler.html)
(function productModal() {
  const path = (location.pathname || '').toLowerCase();
  const file = path.split('/').pop();
  const isProducts = file === 'urunler.html' || file === 'urunler.htm';
  if (!isProducts) return;

  const products = document.querySelectorAll('.product[data-product]');
  if (!products.length) return;

  const CONTENT = {
    pencere: {
      title: 'Alüminyum Pencere Sistemleri',
      img: 'assets/img/p-aps.PNG',
      text: `Alüminyum Pencere Sistemleri\nAlüminyum pencere sistemleri, dayanıklı profilleri ve modern tasarımıyla uzun ömürlü bir kullanım sunar. Isı yalıtımlı ve yalıtımsız seçenekleri sayesinde her ihtiyaca uygun çözümler sağlar. Yalıtımlı modeller, enerji tasarrufu sağlayarak ısınma ve soğutma maliyetlerini düşürürken; yalıtımsız modeller ekonomik çözümler arayanlar için idealdir. Çizilmeye ve darbelere karşı dayanıklı yapısı sayesinde bakım gerektirmez. Estetik görünümleriyle binalara değer katar, yaşam alanlarını daha konforlu ve güvenli hale getirir.`
    },
    kapi: {
      title: 'Alüminyum Kapı Sistemleri',
      img: 'assets/img/p-aks.PNG',
      text: `Alüminyum Kapı Sistemleri\nGüvenliği ön planda tutan alüminyum kapı sistemleri, giriş kapıları, yangın kapıları ve özel tasarım çözümleriyle her projeye uyum sağlar. Sağlam yapısı sayesinde darbeye karşı yüksek dayanıklılık gösterir. Isı ve ses yalıtımlı modelleri, konforlu yaşam alanları sunarken modern tasarımlarıyla mekân estetiğini güçlendirir. Özel renk ve model seçenekleri sayesinde binanızın mimarisine uyum sağlar. Uzun ömürlü yapısı sayesinde, ilk günkü kalitesini yıllarca korur.`
    },
    surme: {
      title: 'Sürme ve Katlanır Sistemler',
      img: 'assets/img/p-sks.PNG',
      text: `Sürme ve Katlanır Sistemler\nGeniş açıklıkları değerlendirmek için ideal çözümler sunan sürme ve katlanır sistemler, estetik ve fonksiyonelliği bir arada sunar. Sürgülü sistemler sayesinde dar alanlarda yerden tasarruf edilirken, katlanır sistemler mekânları ferah ve geniş hale getirir. Isı ve ses yalıtımlı profilleriyle yaşam alanlarında maksimum konfor sağlar. Dayanıklı alüminyum yapısı uzun yıllar güvenli kullanım sunarken, modern tasarımı mekânlarınıza değer katar.`
    },
    kompozit: {
      title: 'Kompozit Cephe Kaplamaları',
      img: 'assets/img/p-kck.PNG',
      text: `Kompozit Cephe Kaplamaları\nKompozit cephe kaplamaları, hafif yapısı ve dayanıklılığıyla dış cephe uygulamalarında en çok tercih edilen sistemlerden biridir. Uzun ömürlü ve kolay temizlenebilir olması sayesinde bakım maliyetlerini düşürür. Renk ve desen çeşitliliğiyle binalara modern bir görünüm kazandırır. Güneş ışığına, neme ve darbeye karşı yüksek dayanıklılık gösterir. Enerji verimliliği sağlayan yapısıyla yalnızca estetik değil, aynı zamanda ekonomik avantaj da sunar.`
    },
    cambalkon: {
      title: 'Cam Balkon ve Küpeşte',
      img: 'assets/img/p-cbk.PNG',
      text: `Cam Balkon ve Küpeşte\nCam balkon sistemleri, balkonları dört mevsim kullanılabilir hale getirir. Açılır-kapanır mekanizması sayesinde yazın ferah, kışın korunaklı bir ortam sunar. Temperli camları darbelere karşı dayanıklı olup, güvenli kullanım sağlar. Alüminyum küpeşte sistemleri ise estetik tasarımıyla balkon ve merdivenlere şıklık katarken güvenliği artırır. Uzun ömürlü, dayanıklı ve modern tasarımlarıyla yaşam alanlarınıza değer katar.`
    },
    panjur: {
      title: 'Güneş Kırıcı & Panjur',
      img: 'assets/img/p-gkp.PNG',
      text: `Güneş Kırıcı & Panjur\nGüneş kırıcı ve panjur sistemleri, enerji tasarrufu sağlayarak iklimlendirme maliyetlerini azaltır. Binalarda hem gölgeleme hem de estetik çözüm sunar. Alüminyum yapısı sayesinde paslanmaz, uzun yıllar dayanıklılığını korur. Modern tasarımlarıyla mimariye estetik katkı sağlarken, iç mekânları güneşin zararlı etkilerinden korur. Kullanım kolaylığı ve şık görünümüyle konforlu yaşam alanları oluşturur.`
    }
  };

  let overlay = document.querySelector('.product-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'product-modal-overlay';
    overlay.innerHTML = `
      <div class="product-modal" role="dialog" aria-modal="true" aria-label="Ürün detay">
        <button class="pm-close" aria-label="Kapat">✕</button>
        <img class="pm-media" alt="" />
        <div class="pm-body">
          <h3 class="pm-title"></h3>
          <p class="pm-text"></p>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  const closeBtn = overlay.querySelector('.pm-close');
  const mediaEl = overlay.querySelector('.pm-media');
  const titleEl = overlay.querySelector('.pm-title');
  const textEl = overlay.querySelector('.pm-text');

  const open = (key) => {
    const data = CONTENT[key];
    if (!data) return;
    mediaEl.src = data.img;
    mediaEl.alt = data.title;
    titleEl.textContent = data.title;
    textEl.textContent = data.text;
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = () => {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  };

  products.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-product');
      open(key);
    });
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('show')) close(); });
})();
