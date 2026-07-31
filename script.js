/* ═══════════════════════════════════════════════
   LocalInsta Landing Page — JavaScript
   ═══════════════════════════════════════════════ */

// ─── Counter Animation ───────────────────────────
function animateCounters() {
  const counters = document.querySelectorAll('.metric-value');
  counters.forEach(counter => {
    const target = parseFloat(counter.dataset.target);
    const isDecimal = counter.classList.contains('metric-decimal');
    const duration = 4000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      const current = eased * target;
      if (isDecimal) {
        counter.textContent = current.toFixed(1);
      } else {
        counter.textContent = Math.floor(current).toLocaleString('pt-BR');
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        if (isDecimal) {
          counter.textContent = target.toFixed(1);
        } else {
          counter.textContent = Math.floor(target).toLocaleString('pt-BR');
        }
      }
    }
    requestAnimationFrame(update);
  });
}

// ─── Intersection Observer for animations ─────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      if (entry.target.closest('.metrics')) {
        animateCounters();
      }
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.feature-card, .curso-card, .metric-item').forEach(el => {
  observer.observe(el);
});

// Observe metrics section
const metricsSection = document.querySelector('.metrics');
if (metricsSection) {
  const metricsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        metricsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  metricsObserver.observe(metricsSection);
}

// ─── Navbar scroll effect ────────────────────────
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > 100) {
    navbar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
  } else {
    navbar.style.boxShadow = 'none';
  }
  lastScroll = currentScroll;
});

// ─── Smooth scroll for nav links ─────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Mobile menu toggle ──────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '64px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'white';
    navLinks.style.padding = '20px 24px';
    navLinks.style.gap = '16px';
    navLinks.style.borderBottom = '1px solid var(--border)';
    navLinks.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
  });
}

// ─── Calendar interactive ────────────────────────
const calDays = document.querySelectorAll('.cal-day:not(.empty)');
const calNavItems = document.querySelectorAll('.cal-nav-item');

calDays.forEach(day => {
  day.addEventListener('mouseenter', () => {
    day.style.background = 'var(--green-bg)';
    day.style.borderRadius = '6px';
    day.style.fontWeight = '600';
  });
  day.addEventListener('mouseleave', () => {
    day.style.background = '';
    day.style.borderRadius = '';
    day.style.fontWeight = '';
  });
});

// Calendar view toggle
const calViewSpans = document.querySelectorAll('.cal-view-toggle span');
calViewSpans.forEach(span => {
  span.addEventListener('click', () => {
    calViewSpans.forEach(s => s.classList.remove('active'));
    span.classList.add('active');
  });
});

// ─── Feature cards stagger animation ─────────────
const featureCards = document.querySelectorAll('.feature-card');
const featureObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = `${index * 100}ms`;
      entry.target.classList.add('animate-in');
      featureObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

featureCards.forEach(card => featureObserver.observe(card));

// ─── Curso cards stagger animation ───────────────
const cursoCards = document.querySelectorAll('.curso-card');
const cursoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = `${index * 120}ms`;
      entry.target.classList.add('animate-in');
      cursoObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

cursoCards.forEach(card => cursoObserver.observe(card));

// ─── "Ver demonstração": expande vídeo do YouTube dentro do hero ───────────────
function tocarVideoHero() {
  const thumb = document.getElementById('heroVideoThumb');
  const frame = document.querySelector('.hero-video-frame');
  if (frame) {
    frame.innerHTML = '<div style="position:relative;padding-bottom:56.25%;"><iframe src="https://www.youtube.com/watch?v=HnNemVCRQhg" allow="autoplay; encrypted-media" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:none;"></iframe></div>';
  }
}

const btnVerDemo = document.getElementById('btnVerDemo');
const heroVideoDrop = document.getElementById('heroVideoDrop');
if (btnVerDemo && heroVideoDrop) {
  btnVerDemo.addEventListener('click', (e) => {
    e.preventDefault();
    heroVideoDrop.classList.toggle('open');
    if (heroVideoDrop.classList.contains('open')) {
      heroVideoDrop.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}
