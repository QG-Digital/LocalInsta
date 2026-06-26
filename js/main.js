// ── NAVIGATION ACTIVE STATE ──
document.addEventListener('DOMContentLoaded', function() {
  updateActiveNav();
});

function updateActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Check if current page matches
    if (currentPath.includes(href.replace('../', '').replace('.html', ''))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
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

// ── MOBILE MENU TOGGLE (IF NEEDED) ──
function toggleMobileMenu() {
  const nav = document.querySelector('.header-nav');
  if (nav) {
    nav.classList.toggle('active');
  }
}

// ── SCROLL TO TOP BUTTON ──
function createScrollToTopButton() {
  const button = document.createElement('button');
  button.innerHTML = '↑';
  button.className = 'scroll-to-top';
  button.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 44px;
    height: 44px;
    background: var(--ig-grad);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    z-index: 99;
    transition: all 0.3s;
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

// Initialize scroll to top button
createScrollToTopButton();

// ── PERFORMANCE: DEFER NON-CRITICAL SCRIPTS ──
window.addEventListener('load', function() {
  // Load analytics or other non-critical scripts here
});

document.addEventListener('DOMContentLoaded', function() {
  const btnDemo = document.getElementById('btn-demo');
  const videoContainer = document.getElementById('video-demo-container');

  if (btnDemo && videoContainer) {
    btnDemo.addEventListener('click', function() {
      // Liga/Desliga a classe active
      videoContainer.classList.toggle('active');
      
      // Muda o texto do botão para ficar mais intuitivo
      if (videoContainer.classList.contains('active')) {
        btnDemo.textContent = 'Fechar Demonstração';
        // Rola a página um pouquinho para baixo para mostrar o vídeo
        setTimeout(() => {
          videoContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
      } else {
        btnDemo.textContent = 'Ver Demonstração';
        // Para o vídeo quando fechar (opcional)
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
      
      // Ajusta o body para não rolar quando o menu está aberto
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
