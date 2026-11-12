/* LocalInsta v3 · preço ao vivo, modal de instalação, dúvidas e rolagem suave (compartilhado com as páginas de nicho) */
(function(){
  'use strict';
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BASE = 'https://github.com/QG-Digital/LocalInsta';
  // mesma fonte do app (server.py PRECO_CONFIG_URL): o gist de preço. Mudou o gist, muda app e site.
  var PRECO_URL = 'https://gist.githubusercontent.com/QG-Digital/63a6b6bc7799a6eb588a175e1f40f7e2/raw/preco';
  var temLsJs = !!document.getElementById('dayTrack'); // página principal usa o ls.js também
  document.documentElement.classList.add('js');
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
      var l = (c && c.links) || {};
      $$('[data-link]').forEach(function(a){ var k = a.getAttribute('data-link'); if(l[k]) a.setAttribute('href', l[k]); });
      if(!g.measurementId || window.gtag) return;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ window.dataLayer.push(arguments); };
      window.gtag('js', new Date()); window.gtag('config', g.measurementId);
      var s = document.createElement('script'); s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(g.measurementId);
      document.head.appendChild(s);
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
    ultimoFoco = document.activeElement; setTimeout(function(){ real && real.focus({preventScroll:true}); }, 60);
    return true;
  }
  function fechar(){
    if(!modal) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock'); if(window.__lenis) window.__lenis.start();
    if(ultimoFoco) ultimoFoco.focus({preventScroll:true});
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[data-download]');
    if(a && modal && !modal.contains(a)){ e.preventDefault(); abrir(a.getAttribute('href')); return; }
    var r = e.target.closest('a[data-download-real]');
    if(r){ modal && modal.classList.add('sent'); conversaoNichos(); return; }
    if(e.target.closest('[data-dl-close]')) fechar();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && modal && modal.classList.contains('open')) fechar(); });

  /* ---------- dúvidas: abre e fecha com altura animada, uma por vez ---------- */
  var faqs = $$('.faq details');
  function fecharFaq(d){
    if(!d.open) return;
    var ans = $('.ans', d); d.classList.remove('open');
    if(reduce || !ans.animate){ d.open = false; return; }
    var an = ans.animate([{height: ans.offsetHeight + 'px'}, {height: '0px'}], {duration: 320, easing: 'cubic-bezier(.22,.8,.24,1)'});
    an.onfinish = function(){ d.open = false; };
  }
  function abrirFaq(d){
    var ans = $('.ans', d); d.open = true; d.classList.add('open');
    if(reduce || !ans.animate) return;
    ans.animate([{height: '0px', opacity: 0}, {height: ans.offsetHeight + 'px', opacity: 1}], {duration: 420, easing: 'cubic-bezier(.22,.8,.24,1)'});
  }
  faqs.forEach(function(d){
    $('summary', d).addEventListener('click', function(e){
      e.preventDefault();
      if(d.classList.contains('open')) fecharFaq(d);
      else { faqs.forEach(function(o){ if(o !== d) fecharFaq(o); }); abrirFaq(d); }
    });
  });

  /* ---------- vídeo do topo: só roda quando está visível ---------- */
  var vid = $('#heroVideo');
  if(vid){
    if(reduce){ vid.removeAttribute('autoplay'); vid.pause(); vid.controls = true; }
    else if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(x){ if(x.isIntersecting){ var p = vid.play(); if(p && p.catch) p.catch(function(){}); } else vid.pause(); }); }, {threshold:.2}).observe(vid);
    }
  }

  /* ---------- páginas de nicho: blocos entram ao aparecer ---------- */
  var ups = $$('.g-up');
  if(ups.length){
    if(reduce || !('IntersectionObserver' in window)) ups.forEach(function(el){ el.classList.add('in'); });
    else {
      var io = new IntersectionObserver(function(es){ es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } }); }, {threshold:.12});
      ups.forEach(function(el, i){ el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
    }
  }

  /* ---------- rolagem suave (Lenis), só com mouse; no toque fica a rolagem nativa ---------- */
  if(reduce || !window.Lenis) return;
  var lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -64 } });
  window.__lenis = lenis;
  (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
})();
