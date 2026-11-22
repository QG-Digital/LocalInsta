/* LocalInsta · medição do site + aviso de cookies (LGPD) + Google Ads com Modo de Consentimento v2.
   Lê os IDs do site-content.json:
     googleAds.measurementId          -> AW-xxxx (tag do Google Ads)
     googleAds.conversionSendTo       -> conversão principal (download)
     googleAds.conversions.whatsapp   -> conversão do WhatsApp (opcional; sem ela usa a principal)
     analytics.ga4MeasurementId       -> G-xxxx (Google Analytics 4: páginas visitadas, origem, tempo) (opcional)
   Sem consentimento, o Google recebe só sinais sem cookies (modo de consentimento "avançado").
   API pública: window.LITrack.event(nome, params) e window.LITrack.cookies() (reabre o aviso). */
(function(){
  'use strict';
  if(window.LITrack) return;
  var CHAVE = 'li_consent_v1';
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var cfg = { ads: '', conv: '', convWa: '', ga4: '' };
  var pronto = false, fila = [];
  var pagina = (location.pathname.replace(/\/+$/, '').split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  var mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  /* ---------- gtag + consentimento padrão (antes de qualquer config) ---------- */
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  function lerConsent(){ try { return localStorage.getItem(CHAVE); } catch(e){ return null; } }
  function salvarConsent(v){ try { localStorage.setItem(CHAVE, v); } catch(e){} }
  function estado(v){
    var sim = v === 'all' ? 'granted' : 'denied';
    return { ad_storage: sim, ad_user_data: sim, ad_personalization: sim, analytics_storage: sim };
  }
  var escolha = lerConsent();
  var padrao = estado(escolha);
  padrao.wait_for_update = 500;
  window.gtag('consent', 'default', padrao);
  window.gtag('set', 'url_passthrough', true);   // mantém o gclid na navegação mesmo sem cookies
  window.gtag('set', 'ads_data_redaction', escolha !== 'all');
  window.gtag('js', new Date());

  function carregarTag(id){
    if(!id || document.querySelector('script[data-li-gtag]')) return;
    var s = document.createElement('script'); s.async = true; s.setAttribute('data-li-gtag', id);
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }
  function utm(){
    var p = new URLSearchParams(location.search), o = {};
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){ if(p.get(k)) o[k] = p.get(k); });
    if(p.get('gclid')) o.veio_do_google_ads = 'sim';
    return o;
  }
  function configurar(){
    var base = { page_title: document.title, page_location: location.href, page_path: location.pathname, pagina: pagina };
    if(cfg.ads) window.gtag('config', cfg.ads, { page_path: location.pathname });
    if(cfg.ga4) window.gtag('config', cfg.ga4, Object.assign({ send_page_view: true }, base, utm()));
    carregarTag(cfg.ads || cfg.ga4);
    pronto = true;
    fila.splice(0).forEach(function(f){ f(); });
  }
  function quandoPronto(f){ pronto ? f() : fila.push(f); }

  /* ---------- eventos ---------- */
  function ev(nome, params){
    quandoPronto(function(){
      try { window.gtag('event', nome, Object.assign({ pagina: pagina, dispositivo: mobile ? 'celular' : 'computador', transport_type: 'beacon' }, params || {})); } catch(e){}
    });
  }
  function conversao(sendTo, extra){
    quandoPronto(function(){
      if(!sendTo) return;
      try { window.gtag('event', 'conversion', Object.assign({ send_to: sendTo, value: 1, currency: 'BRL', transport_type: 'beacon' }, extra || {})); } catch(e){}
    });
  }
  function onde(el){
    var s = el.closest('[data-loc]'); if(s) return s.getAttribute('data-loc');
    if(el.closest('header, .top, nav')) return 'topo';
    if(el.closest('footer')) return 'rodape';
    if(el.closest('.wa-float')) return 'botao_flutuante';
    if(el.closest('#dlModal')) return 'janela_instalacao';
    var sec = el.closest('section[id], section, [id]'); return sec && sec.id ? sec.id : 'pagina';
  }
  function texto(el){ return (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60); }

  var wa_ultimo = 0;
  document.addEventListener('click', function(e){
    var a = e.target.closest('a, button'); if(!a) return;
    var href = a.getAttribute('href') || '';
    var loc = onde(a), txt = texto(a);

    if(a.hasAttribute('data-download')){          // abriu a janela de instalação (ainda não baixou)
      ev('clique_baixar', { local: loc, texto: txt });
      if(mobile) ev('clique_baixar_no_celular', { local: loc });
      return;
    }
    if(a.hasAttribute('data-download-real')){     // download de verdade
      ev('download_iniciado', { local: loc, arquivo: href.split('/').pop() });
      conversao(cfg.conv);
      return;
    }
    if(a.hasAttribute('data-send-link')){ ev('enviar_link_para_whatsapp', { local: loc }); return; }
    if(a.hasAttribute('data-wa') || /wa\.me|whatsapp/i.test(href)){
      if(Date.now() - wa_ultimo < 1500) return; wa_ultimo = Date.now();
      ev('clique_whatsapp', { local: loc, texto: txt });
      conversao(cfg.convWa || cfg.conv);
      return;
    }
    if(a.classList.contains('video-play')){
      var box = a.closest('[data-video]');
      ev('assistiu_video', { video_id: box ? box.getAttribute('data-video') : '', local: loc });
      return;
    }
    var link = a.getAttribute('data-link');
    if(link === 'affiliate') { ev('clique_afiliado', { local: loc }); return; }
    if(link === 'instagram' || link === 'github') { ev('clique_' + link, { local: loc }); return; }
    if(a.tagName === 'A' && /^https?:/i.test(href) && a.host !== location.host) ev('link_externo', { destino: a.host, local: loc });
    else if(a.tagName === 'A' && /\.html|^\.\//.test(href)) ev('navegou_para', { destino: href.replace(/^\.\//, ''), local: loc });
  }, true);

  // dúvidas abertas
  document.addEventListener('click', function(e){
    var s = e.target.closest('details > summary'); if(!s) return;
    ev('abriu_duvida', { pergunta: texto(s) });
  }, true);

  // rolagem: 25/50/75/90%
  var marcas = [25, 50, 75, 90], feitas = {};
  function rolagem(){
    var h = document.documentElement, total = h.scrollHeight - h.clientHeight; if(total <= 0) return;
    var pct = Math.round((h.scrollTop || document.body.scrollTop) / total * 100);
    marcas.forEach(function(m){ if(pct >= m && !feitas[m]){ feitas[m] = 1; ev('rolou_pagina', { porcentagem: m }); } });
  }
  window.addEventListener('scroll', function(){ clearTimeout(rolagem.t); rolagem.t = setTimeout(rolagem, 250); }, { passive: true });

  // seções vistas (só as que têm id), uma vez cada
  function observarSecoes(){
    if(!('IntersectionObserver' in window)) return;
    var vistas = {};
    var io = new IntersectionObserver(function(es){
      es.forEach(function(x){
        var id = x.target.id; if(!x.isIntersecting || vistas[id]) return;
        vistas[id] = 1; ev('viu_secao', { secao: id }); io.unobserve(x.target);
      });
    }, { threshold: .5 });
    $$('section[id], [data-track-section][id]').forEach(function(s){ io.observe(s); });
  }

  // tempo engajado: 30 s e 2 min com a aba visível
  var ativo = 0, marcasTempo = { 30: 'ficou_30s', 120: 'ficou_2min' };
  setInterval(function(){
    if(document.visibilityState !== 'visible') return;
    ativo += 5;
    if(marcasTempo[ativo]) ev(marcasTempo[ativo], {});
  }, 5000);

  /* ---------- aviso de cookies ---------- */
  var CSS = '' +
    '.li-ck{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:720px;margin:0 auto;background:#fff;color:#0E1F16;' +
    'border:1px solid #D5E6DB;border-radius:18px;box-shadow:0 18px 50px rgba(7,25,15,.18);padding:18px 20px;display:flex;gap:16px;align-items:center;' +
    'font:400 15px/1.5 Figtree,"Segoe UI",system-ui,sans-serif;transform:translateY(140%);transition:transform .45s cubic-bezier(.22,.8,.24,1)}' +
    '.li-ck.on{transform:none}.li-ck p{flex:1;margin:0}.li-ck a{color:#0A7F52;text-decoration:underline}' +
    '.li-ck b{font-family:Gabarito,Figtree,sans-serif}' +
    '.li-ck .bt{display:flex;gap:8px;flex-shrink:0}.li-ck button{cursor:pointer;border-radius:999px;padding:10px 18px;font:600 14px Figtree,system-ui,sans-serif;border:1px solid #12A46B}' +
    '.li-ck .ok{background:#12A46B;color:#fff}.li-ck .ok:hover{background:#0A7F52}.li-ck .no{background:#fff;color:#0A7F52}.li-ck .no:hover{background:#E9F6EE}' +
    '@media(max-width:640px){.li-ck{flex-direction:column;align-items:stretch;bottom:10px;left:10px;right:10px}.li-ck .bt{justify-content:stretch}.li-ck button{flex:1}}';
  function aviso(forcar){
    if(!forcar && lerConsent()) return;
    if(document.querySelector('.li-ck')) { document.querySelector('.li-ck').classList.add('on'); return; }
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var d = document.createElement('div'); d.className = 'li-ck'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Aviso de cookies');
    d.innerHTML = '<p><b>Cookies</b> · Usamos cookies para medir as visitas e saber quais anúncios trazem as pessoas até aqui. ' +
      'Nada disso tem a ver com o app: seus dados do LocalInsta continuam só no seu PC. ' +
      '<a href="./privacidade.html#cookies">Saiba mais</a></p>' +
      '<div class="bt"><button type="button" class="no">Só o necessário</button><button type="button" class="ok">Aceitar</button></div>';
    document.body.appendChild(d);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ d.classList.add('on'); }); });
    function decidir(v){
      salvarConsent(v);
      window.gtag('consent', 'update', estado(v));
      window.gtag('set', 'ads_data_redaction', v !== 'all');
      ev('cookies_' + (v === 'all' ? 'aceitos' : 'recusados'), {});
      d.classList.remove('on'); setTimeout(function(){ d.remove(); }, 500);
    }
    d.querySelector('.ok').addEventListener('click', function(){ decidir('all'); });
    d.querySelector('.no').addEventListener('click', function(){ decidir('necessary'); });
  }
  // link "Preferências de cookies" no rodapé
  function linkRodape(){
    var foot = document.querySelector('.foot-links, footer nav, footer');
    if(!foot || foot.querySelector('[data-li-cookies]')) return;
    var a = document.createElement('a'); a.href = '#'; a.setAttribute('data-li-cookies', ''); a.textContent = 'Cookies';
    a.addEventListener('click', function(e){ e.preventDefault(); aviso(true); });
    foot.appendChild(a);
  }

  /* ---------- início ---------- */
  function iniciar(){
    fetch('./site-content.json', { cache: 'no-cache' }).then(function(r){ return r.json(); }).then(function(c){
      var g = (c && c.googleAds) || {}, an = (c && c.analytics) || {};
      cfg.ads = g.measurementId || ''; cfg.conv = g.conversionSendTo || '';
      cfg.convWa = (g.conversions && g.conversions.whatsapp) || '';
      cfg.ga4 = an.ga4MeasurementId || '';
      configurar();
    }).catch(configurar);
    aviso(false); linkRodape(); observarSecoes();
  }
  window.LITrack = { event: ev, cookies: function(){ aviso(true); } };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
