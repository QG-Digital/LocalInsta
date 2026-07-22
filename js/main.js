// ═══════════════════════════════════════════
// LOCALINSTA — MODERN JS v2
// ═══════════════════════════════════════════

// ── NAVIGATION ACTIVE STATE ──
document.addEventListener('DOMContentLoaded', function() {
  updateActiveNav();
  initScrollAnimations();
  initHeaderScroll();
});

function updateActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (currentPath.includes(href.replace('../', '').replace('.html', ''))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ── HEADER SCROLL EFFECT ──
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });
}

// ── SCROLL REVEAL ANIMATIONS ──
function initScrollAnimations() {
  // Add reveal classes to elements
  const sections = document.querySelectorAll('.section');
  const cards = document.querySelectorAll('.card');
  const featureItems = document.querySelectorAll('.feature-item');

  sections.forEach(el => {
    el.classList.add('reveal');
  });

  cards.forEach(el => {
    el.classList.add('reveal');
  });

  featureItems.forEach(el => {
    el.classList.add('reveal');
  });

  // Observe
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  }
}

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ── BUTTON RIPPLE EFFECT ──
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// ── FORM VALIDATION ──
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ── ANALYTICS (OPTIONAL) ──
function trackEvent(category, action, label) {
  if (window.gtag) {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  }
}

// ── LAZY LOAD IMAGES ──
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ── SCROLL TO TOP BUTTON ──
function createScrollToTopButton() {
  const button = document.createElement('button');
  button.innerHTML = '↑';
  button.className = 'scroll-to-top';
  button.style.cssText = `
    position: fixed;
    bottom: 28px;
    right: 28px;
    width: 48px;
    height: 48px;
    background: var(--accent-grad);
    color: white;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 700;
    z-index: 99;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  `;

  document.body.appendChild(button);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      button.style.display = 'flex';
    } else {
      button.style.display = 'none';
    }
  });

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

createScrollToTopButton();

// ── PERFORMANCE ──
window.addEventListener('load', function() {
  // Load analytics or other non-critical scripts here
});

// ── VIDEO DEMO TOGGLE ──
document.addEventListener('DOMContentLoaded', function() {
  const btnDemo = document.getElementById('btn-demo');
  const videoContainer = document.getElementById('video-demo-container');

  if (btnDemo && videoContainer) {
    btnDemo.addEventListener('click', function() {
      videoContainer.classList.toggle('active');
      
      if (videoContainer.classList.contains('active')) {
        btnDemo.textContent = 'Fechar Demonstração';
        setTimeout(() => {
          videoContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
      } else {
        btnDemo.textContent = 'Ver Demonstração';
        const iframe = document.getElementById('video-frame');
        const src = iframe.src;
        iframe.src = src;
      }
    });
  }
});

// ── MOBILE MENU TOGGLE ──
document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.header');
  const headerNav = document.querySelector('.header-nav');
  const headerRight = document.querySelector('.header-right');

  // Remove menu toggle antigo se existir (evita duplicação)
  const oldToggle = document.querySelector('.menu-toggle');
  if (oldToggle) oldToggle.remove();

  if (header && headerNav) {
    // Cria o botão hambúrguer
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.setAttribute('aria-label', 'Menu de navegação');
    menuToggle.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;

    // Insere o botão antes do header-nav
    header.insertBefore(menuToggle, headerNav);

    // Toggle do menu
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
      headerNav.classList.toggle('open');
      
      if (headerNav.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Fecha o menu ao clicar em um link
    headerNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        headerNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Fecha o menu ao clicar fora
    document.addEventListener('click', function(e) {
      if (!header.contains(e.target) && headerNav.classList.contains('open')) {
        menuToggle.classList.remove('active');
        headerNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
});
