/* LocalInsta v2 · preço ao vivo, modal de instalação, dúvidas e animações (GSAP + Lenis) */
(function(){
  'use strict';
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BASE = 'https://github.com/QG-Digital/LocalInsta';
  // mesma fonte do app (server.py PRECO_CONFIG_URL): o gist de preço. Mudou o gist, muda app e site.
  var PRECO_URL = 'https://gist.githubusercontent.com/QG-Digital/63a6b6bc7799a6eb588a175e1f40f7e2/raw/preco';
  var temLsJs = !!document.getElementById('dayTrack'); // página principal usa o ls.js também
  function json(url){ return fetch(url, {cache:'no-cache'}).then(function(r){ if(!r.ok) throw r.status; return r.json(); }); }
  function brl(v){ return v.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}); }

  /* ---------- preço: mesma regra do app (gist -> modo DOL/REL) ---------- */
  function cotacao(){
    return json('https://api.frankfurter.dev/v1/latest?base=USD&symbols=BRL')
      .then(function(d){ var v = d && d.rates && +d.rates.BRL; if(!(v > 0)) throw 0; return v; })
      .catch(function(){ return json('https://economia.awesomeapi.com.br/json/last/USD-BRL').then(function(d){ var v = +(d.USDBRL && d.USDBRL.bid); if(!(v > 0)) throw 0; return v; }); });
  }
  function calcularPreco(){
    return json(PRECO_URL + '?t=' + Date.now()).then(function(cfg){
      var modo = String(cfg.modo || cfg.mode || 'REL').toUpperCase();
      var fallback = +cfg.preco_por_dia || 3.89;
      if(cfg.percentual_desconto_dolar === undefined) cfg.percentual_desconto_dolar = 24.47; // padrão do app
      if(modo === 'DOL'){
        var desc = Math.max(0, Math.min(100, +cfg.percentual_desconto_dolar || 0));
        return cotacao().then(function(usd){ return { dia: Math.round(usd * (1 - desc/100) * 100) / 100, dolar: true }; })
          .catch(function(){ return { dia: fallback, dolar: false }; });
      }
      return { dia: +cfg.preco_fixo || fallback, dolar: false };
    });
  }
  function mostrarPreco(p){
    var mes = Math.round(p.dia * 30 * 100) / 100;
    $$('[data-preco-mes]').forEach(function(el){ el.textContent = 'R$ ' + brl(mes); el.classList.remove('skel'); });
    $$('[data-preco-dia]').forEach(function(el){ el.textContent = 'R$ ' + brl(p.dia); el.classList.remove('skel'); });
    $$('[data-preco-nota]').forEach(function(el){
      el.textContent = p.dolar ? 'Valor de hoje. Ele acompanha a cotação do dólar, então pode variar um pouco de um dia para o outro.' : 'Valor de hoje, calculado por dia de uso.';
    });
  }
  if($('[data-preco-mes]')){
    calcularPreco().then(mostrarPreco).catch(function(){
      $$('[data-preco-mes]').forEach(function(el){ el.textContent = 'consulte no app'; el.classList.remove('skel'); });
      $$('[data-preco-dia]').forEach(function(el){ el.textContent = '—'; el.classList.remove('skel'); });
    });
  }

  /* ---------- download: páginas sem o ls.js buscam o link e o Google Ads sozinhas ---------- */
  var convId = '';
  function linkInstalador(v){
    var url = BASE + '/releases/latest';
    if(v && v.installerName) url = BASE + '/releases/download/' + (v.releaseTag || 'business-tools') + '/' + v.installerName;
    $$('[data-download],[data-download-real]').forEach(function(a){ a.setAttribute('href', url); });
  }
  if(!temLsJs){
    json('./site-version.json').then(linkInstalador).catch(function(){ linkInstalador(null); });
    json('./site-content.json').then(function(c){
      var g = (c && c.googleAds) || {}; convId = g.conversionSendTo || '';
      if(!g.measurementId || window.gtag) return;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ window.dataLayer.push(arguments); };
      window.gtag('js', new Date()); window.gtag('config', g.measurementId);
      var s = document.createElement('script'); s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(g.measurementId);
      document.head.appendChild(s);
      var l = c.links || {};
      $$('[data-link]').forEach(function(a){ var k = a.getAttribute('data-link'); if(l[k]) a.setAttribute('href', l[k]); });
    }).catch(function(){});
  }
  function conversaoNichos(){ try{ if(!temLsJs && window.gtag && convId) window.gtag('event','conversion',{send_to: convId, value: 1, currency: 'BRL'}); }catch(e){} }

  /* ---------- modal: mini tutorial antes de baixar ---------- */
  var modal = $('#dlModal'), ultimoFoco = null;
  function abrir(href){
    if(!modal) return false;
    var real = $('[data-download-real]', modal); if(real && href) real.setAttribute('href', href);
    modal.classList.remove('sent'); modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock'); if(window.__lenis) window.__lenis.stop();
    ultimoFoco = document.activeElement; setTimeout(function(){ real && real.focus(); }, 60);
    return true;
  }
  function fechar(){
    if(!modal) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock'); if(window.__lenis) window.__lenis.start();
    if(ultimoFoco) ultimoFoco.focus();
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[data-download]');
    if(a && modal && !modal.contains(a)){ e.preventDefault(); abrir(a.getAttribute('href')); return; }
    var r = e.target.closest('a[data-download-real]');
    if(r){ modal && modal.classList.add('sent'); conversaoNichos(); return; }
    if(e.target.closest('[data-dl-close]')) fechar();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && modal && modal.classList.contains('open')) fechar(); });

  /* ---------- dúvidas: só uma aberta por vez ---------- */
  $$('.faq details').forEach(function(d){
    d.addEventListener('toggle', function(){ if(d.open) $$('.faq details').forEach(function(o){ if(o !== d) o.open = false; }); });
  });

  /* ---------- vídeo do topo: só roda quando está visível ---------- */
  var vid = $('#heroVideo');
  if(vid){
    if(reduce){ vid.removeAttribute('autoplay'); vid.pause(); vid.controls = true; }
    else if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(x){ if(x.isIntersecting){ var p = vid.play(); if(p && p.catch) p.catch(function(){}); } else vid.pause(); }); }, {threshold:.2}).observe(vid);
    }
  }

  /* ---------- rolagem suave (Lenis) + animações (GSAP / ScrollTrigger) ---------- */
  if(reduce) return;
  if(window.Lenis){
    var lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: { offset: -70 } });
    window.__lenis = lenis;
    if(window.gsap && window.ScrollTrigger){
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  if(!(window.gsap && window.ScrollTrigger)) return;
  var gsap = window.gsap; gsap.registerPlugin(window.ScrollTrigger);
  // blocos que sobem ao aparecer, em sequência
  window.ScrollTrigger.batch('.g-up', {
    start: 'top 88%', once: true,
    onEnter: function(els){ gsap.fromTo(els, {y: 46, autoAlpha: 0}, {y: 0, autoAlpha: 1, duration: .9, ease: 'power3.out', stagger: .09, overwrite: true}); }
  });
  gsap.set('.g-up', {autoAlpha: 0});
  // cartão de preço: leve inclinação e entrada com mola
  var card = $('.price-card');
  if(card){
    gsap.fromTo(card, {rotate: -2.5, y: 60, autoAlpha: 0}, {rotate: 0, y: 0, autoAlpha: 1, duration: 1.1, ease: 'back.out(1.6)', scrollTrigger: {trigger: card, start: 'top 85%', once: true}});
  }
  // ícones dos nichos girando de leve no scroll
  $$('.niche .ico').forEach(function(ic){
    gsap.fromTo(ic, {rotate: -12, scale: .8}, {rotate: 0, scale: 1, ease: 'none', scrollTrigger: {trigger: ic, start: 'top 95%', end: 'top 55%', scrub: true}});
  });
})();
