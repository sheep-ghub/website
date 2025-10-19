// Mobile nav toggle
(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
})();

// Demo PIN gate (site-wide)
(function demoPinGate() {
  const STORAGE_KEY = 'demo-unlocked';
  const STORAGE_TIME_KEY = 'demo-unlocked-at';
  const WINDOW_MS = 15 * 60 * 1000; // 15 dakika

  const PIN = (window.DEMO_PIN && String(window.DEMO_PIN)) || '8786'; // değiştirilebilir

  const now = Date.now();
  let unlocked = false;
  let remain = 0;
  try {
    const flag = localStorage.getItem(STORAGE_KEY) === '1';
    const ts = parseInt(localStorage.getItem(STORAGE_TIME_KEY) || '0', 10) || 0;
    const age = now - ts;
    if (flag && ts && age < WINDOW_MS) {
      unlocked = true;
      remain = WINDOW_MS - age;
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TIME_KEY);
    }
  } catch (_) {}

  // Helper to (re)lock after window
  const scheduleRelock = (ms) => {
    if (!ms || ms <= 0) return;
    setTimeout(() => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_TIME_KEY);
      } catch (_) {}
      buildOverlay();
    }, ms);
  };

  // If already unlocked and not expired, skip overlay and schedule relock
  if (unlocked) {
    scheduleRelock(remain);
    return;
  }

  function buildOverlay() {
    // Avoid duplicate overlay
    if (document.querySelector('.demo-auth-overlay')) return;

    // Build overlay
    const overlay = document.createElement('div');
    overlay.className = 'demo-auth-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="demo-auth">
        <h3 class="demo-title">Demo Erişim</h3>
        <p class="demo-desc">Bu Website Şuanda Demo Sürümdedir. Demo Sürüme Erişmek İçin Demo Şifreye İhtiyacınız Vardır.</p>
        <div class="demo-input-wrap">
          <input class="demo-input" type="password" inputmode="none" autocomplete="off" spellcheck="false" aria-label="Demo şifre" readonly />
        </div>
        <div class="demo-keypad" aria-label="Ekran klavyesi">
          ${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" class="kp kp-num" data-num="${n}">${n}</button>`).join('')}
          <button type="button" class="kp kp-act kp-clear" aria-label="Temizle">⌫</button>
          <button type="button" class="kp kp-num" data-num="0">0</button>
          <button type="button" class="kp kp-act kp-ok" aria-label="Onayla">OK</button>
        </div>
        <div class="demo-error" aria-live="polite" hidden>Şifre hatalı</div>
      </div>
    `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('.demo-input');
    const errEl = overlay.querySelector('.demo-error');

    // Block background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function showError() {
      if (!errEl) return;
      errEl.hidden = false;
      errEl.classList.remove('fadeout');
      setTimeout(() => {
        errEl.classList.add('fadeout');
        setTimeout(() => { errEl.hidden = true; errEl.classList.remove('fadeout'); }, 800);
      }, 3000);
    }

    function success() {
      overlay.classList.add('hide');
      try {
        localStorage.setItem(STORAGE_KEY, '1');
        localStorage.setItem(STORAGE_TIME_KEY, String(Date.now()));
      } catch (_) {}
      setTimeout(() => { overlay.remove(); document.body.style.overflow = prevOverflow; }, 250);
      scheduleRelock(WINDOW_MS);
    }

    function check() {
      if (!input) return;
      const val = input.value;
      if (val === PIN) success();
      else { input.value = ''; showError(); }
    }

    overlay.addEventListener('click', (e) => { e.stopPropagation(); });
    overlay.querySelectorAll('.kp-num').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!input) return;
        if (input.value.length >= 12) return;
        input.value += String(btn.getAttribute('data-num') || '');
      });
    });
    const clearBtn = overlay.querySelector('.kp-clear');
    clearBtn && clearBtn.addEventListener('click', () => { if (input) input.value = input.value.slice(0, -1); });
    const okBtn = overlay.querySelector('.kp-ok');
    okBtn && okBtn.addEventListener('click', check);
  }

  // Show overlay initially
  buildOverlay();
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

// Hero background rotator with blurred fade (~8s) + touch swipe without blur
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

  // Ensure hero container is a proper stacking context (don't override CSS absolute)
  hero.style.overflow = 'hidden';
  // Keep hero background defined in CSS; our layers will cover it.

  // Base layer: shows the current image (instead of hero background)
  const baseLayer = document.createElement('div');
  Object.assign(baseLayer.style, {
    position: 'absolute', inset: '0', backgroundSize: 'cover', backgroundPosition: 'center',
    borderRadius: '16px', willChange: 'transform', transform: 'translateX(0)', pointerEvents: 'none', zIndex: '1'
  });
  hero.appendChild(baseLayer);

  // Fade layer: used only for auto/button/wheel changes (keeps existing blur fade)
  const fadeLayer = document.createElement('div');
  Object.assign(fadeLayer.style, {
    position: 'absolute', inset: '0', backgroundSize: 'cover', backgroundPosition: 'center',
    filter: 'blur(8px)', opacity: '0', transition: 'opacity 600ms ease', pointerEvents: 'none', borderRadius: '16px', zIndex: '1'
  });
  hero.appendChild(fadeLayer);

  // Slide layer: used for touch dragging (no blur)
  const slideLayer = document.createElement('div');
  Object.assign(slideLayer.style, {
    position: 'absolute', inset: '0', backgroundSize: 'cover', backgroundPosition: 'center',
    borderRadius: '16px', willChange: 'transform', transform: 'translateX(0)', display: 'none', pointerEvents: 'none', zIndex: '1'
  });
  hero.appendChild(slideLayer);

  // Index handling: keep compatibility with existing button logic
  // i always points to the NEXT index to show when moving forward.
  let i = 0;
  const setBase = (idx) => { baseLayer.style.backgroundImage = `url('${images[idx]}')`; };

  const apply = (index) => {
    const nextIndex = (typeof index === 'number') ? ((index % images.length) + images.length) % images.length : i;
    const next = images[nextIndex];
    fadeLayer.style.backgroundImage = `url('${next}')`;
    requestAnimationFrame(() => { fadeLayer.style.opacity = '1'; });
    setTimeout(() => {
      setBase(nextIndex);
      fadeLayer.style.opacity = '0';
    }, 650);
    i = (nextIndex + 1) % images.length;
  };

  // Initialize with first image
  setBase(0);
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

  // Touch swipe (mobile): slide horizontally with no blur
  let touchStartX = 0;
  let touchStartY = 0;
  let dragging = false;
  let swipeDir = 0; // -1 = left swipe (next), +1 = right swipe (prev)
  let deltaX = 0;
  let animating = false;

  const currentIndex = () => ((i - 1 + images.length) % images.length);
  const targetIndexForSwipe = (dir) => {
    const cur = currentIndex();
    // dir < 0 (left swipe) => next image; dir > 0 (right swipe) => previous image
    return dir < 0 ? ((cur + 1) % images.length)
                   : ((cur - 1 + images.length) % images.length);
  };

  const onTouchStart = (e) => {
    if (animating) return;
    if (!e.touches || e.touches.length !== 1) return;
    clearInterval(timer);
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    dragging = true;
    swipeDir = 0;
    deltaX = 0;
    // reset layers
    baseLayer.style.transition = 'none';
    slideLayer.style.transition = 'none';
    slideLayer.style.display = 'none';
    fadeLayer.style.opacity = '0'; // ensure no fade during drag
  };

  const onTouchMove = (e) => {
    if (!dragging || animating) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    // Determine intent: if horizontal move dominates, prevent scroll
    if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();

    deltaX = dx;
    const width = hero.clientWidth || 1;

    if (!swipeDir && Math.abs(dx) > 5) {
      swipeDir = dx < 0 ? -1 : 1; // -1: left swipe (next), 1: right swipe (prev)
      const targetIdx = targetIndexForSwipe(swipeDir);
      slideLayer.style.backgroundImage = `url('${images[targetIdx]}')`;
      slideLayer.style.display = 'block';
      // Pre-position the slide offscreen so no gap appears
      const width = hero.clientWidth || 1;
      slideLayer.style.transform = `translateX(${ -swipeDir * width }px)`;
    }

    if (!swipeDir) return;

    // Follow the finger: base moves with dx
    // Slide comes from the side opposite to movement
    // swipeDir = -1 (left) => slide from right: offset = dx + width
    // swipeDir = +1 (right) => slide from left:  offset = dx - width
    const offsetCurrent = `translateX(${dx}px)`;
    const offsetSlide = `translateX(${dx - swipeDir * width}px)`;
    baseLayer.style.transform = offsetCurrent;
    slideLayer.style.transform = offsetSlide;
  };

  const onTouchEnd = () => {
    if (!dragging || animating) return;
    dragging = false;
    const width = hero.clientWidth || 1;
    const threshold = Math.max(60, width * 0.2);

    if (swipeDir && Math.abs(deltaX) > threshold) {
      // Commit to slide
      animating = true;
      baseLayer.style.transition = 'transform 300ms ease';
      slideLayer.style.transition = 'transform 300ms ease';
      // Move base in the same direction as the finger
      baseLayer.style.transform = `translateX(${swipeDir * width}px)`;
      slideLayer.style.transform = 'translateX(0px)';

      const finalize = () => {
        // Set new base as the slide image
        const newIdx = targetIndexForSwipe(swipeDir);
        setBase(newIdx);
        baseLayer.style.transition = 'none';
        slideLayer.style.transition = 'none';
        baseLayer.style.transform = 'translateX(0)';
        slideLayer.style.transform = 'translateX(0)';
        slideLayer.style.display = 'none';
        // Update i (next forward index)
        i = (newIdx + 1) % images.length;
        animating = false;
        // restart auto-rotate
        restart();
      };

      // Use one-time transitionend; fallback timeout
      let done = false;
      const once = () => { if (done) return; done = true; baseLayer.removeEventListener('transitionend', once); finalize(); };
      baseLayer.addEventListener('transitionend', once);
      setTimeout(once, 350);
    } else {
      // Revert
      baseLayer.style.transition = 'transform 220ms ease';
      slideLayer.style.transition = 'transform 220ms ease';
      baseLayer.style.transform = 'translateX(0)';
      // Put slide back offscreen
      const off = swipeDir ? (deltaX - swipeDir * width) : 0;
      slideLayer.style.transform = `translateX(${off}px)`;
      setTimeout(() => {
        slideLayer.style.display = 'none';
        slideLayer.style.transition = 'none';
        baseLayer.style.transition = 'none';
        // restart auto-rotate
        restart();
      }, 230);
    }
  };

  hero.addEventListener('touchstart', onTouchStart, { passive: true });
  hero.addEventListener('touchmove', onTouchMove, { passive: false });
  hero.addEventListener('touchend', onTouchEnd, { passive: true });
  hero.addEventListener('touchcancel', onTouchEnd, { passive: true });
})();

// Floating back-to-home button (hide on homepage)
(function addBackToHome() {
  // Determine if current page is the homepage (supports pretty URLs)
  const path = (location.pathname || '').toLowerCase();
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || '';
  const isGhPages = location.hostname.endsWith('github.io');
  const isHome = segments.length === 0 || last === 'index.html' || last === 'index.htm' || (isGhPages && segments.length === 1);
  if (isHome) return; // Do not render on the homepage

  if (document.querySelector('.back-to-home')) return;
  const wrap = document.createElement('div');
  wrap.className = 'back-to-home';
  const a = document.createElement('a');
  // If we are inside a subdirectory, go one level up to reach site root; else use './'
  a.href = (segments.length > 0) ? '../' : './';
  a.setAttribute('aria-label', 'Ana menüye dön');
  a.innerText = 'Ana menüye dön';
  wrap.appendChild(a);
  document.body.appendChild(wrap);
})();

// Theme toggle (top-right) with persistent preference
(function themeToggle() {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const STORAGE_KEY = 'theme-preference';
  const getStored = () => localStorage.getItem(STORAGE_KEY);
  const setStored = (val) => localStorage.setItem(STORAGE_KEY, val);
  const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  // Determine if current page is the homepage (supports pretty URLs)
  const path = (location.pathname || '').toLowerCase();
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || '';
  const isGhPages = location.hostname.endsWith('github.io');
  const isHome = segments.length === 0 || last === 'index.html' || last === 'index.htm' || (isGhPages && segments.length === 1);

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

  // Clock updaters (TR locale): HH:mm:ss normal, HH:mm when compact
  let isCompact = false;
  const fmtFull = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const fmtCompact = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });
  const updateClock = () => {
    try {
      const now = new Date();
      clock.textContent = (isCompact ? fmtCompact : fmtFull).format(now);
    } catch (e) {
      // Fallback formatting
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      clock.textContent = isCompact
        ? `${pad(now.getHours())}:${pad(now.getMinutes())}`
        : `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
  };
  updateClock();
  setInterval(updateClock, 1000);

  // One-time intro animation for the theme/clock bar on first homepage visit
  (function scheduleThemeIntro() {
    if (!isHome) return;
    // Prepare initial hidden state for each visit (both theme bar and header)
    const header = document.querySelector('.site-header');
    container.classList.add('intro-start');
    header && header.classList.add('intro-start');
    const playIntro = () => {
      container.classList.add('intro-show');
      header && header.classList.add('intro-show');
      setTimeout(() => {
        container.classList.remove('intro-start', 'intro-show');
        header && header.classList.remove('intro-start', 'intro-show');
      }, 700);
    };
    // If demo overlay is present, wait for it to hide/remove
    const overlayNow = document.querySelector('.demo-auth-overlay');
    if (overlayNow) {
      let tries = 0;
      const maxTries = 200; // ~24s at 120ms
      const timer = setInterval(() => {
        tries++;
        const overlay = document.querySelector('.demo-auth-overlay');
        const gone = !overlay;
        const hidden = overlay && overlay.classList.contains('hide');
        if (gone || hidden || tries >= maxTries) {
          clearInterval(timer);
          setTimeout(playIntro, 280);
        }
      }, 120);
    } else {
      setTimeout(playIntro, 200);
    }
  })();

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

  // Scroll-driven compact mode with hysteresis to avoid flicker
  // Enter compact at 120px; exit at 40px
  const ENTER_Y = 120;
  const EXIT_Y = 40;
  const applyCompact = (compact) => {
    if (compact === isCompact) return;
    isCompact = compact;
    header && header.classList.toggle('compact', compact);
    container.classList.toggle('compact', compact);
    updateClock();
  };
  const setRatio = (y) => {
    // Smooth ratio 0..1 across ENTER_Y distance
    const r = Math.max(0, Math.min(1, y / ENTER_Y));
    root.style.setProperty('--compact-ratio', String(r));
  };
  const handleScroll = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    setRatio(y);
    if (!isCompact && y > ENTER_Y) applyCompact(true);
    else if (isCompact && y < EXIT_Y) applyCompact(false);
  };
  // Initialize based on current position and listen to scroll
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
})();

// Product cards (only homepage section): navigate to products page
(function productLinks() {
  // Select only the homepage "Öne Çıkan Ürünler" cards (they don't have data-product)
  const cards = document.querySelectorAll('.products .product:not([data-product])');
  if (!cards.length) return; // nothing to do on non-home pages
  const goto = () => { window.location.href = 'urunler/'; };
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
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || '';
  const isProducts = last === 'urunler' || last === 'urunler.html' || last === 'urunler.htm';
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
  // Prefix for asset paths when we are under a subdirectory
  const assetPrefix = segments.length > 0 ? '../' : '';

  const open = (key) => {
    const data = CONTENT[key];
    if (!data) return;
    mediaEl.src = assetPrefix + data.img;
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
