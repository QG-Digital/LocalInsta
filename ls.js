/* LocalInsta v3 · página principal: conteúdo editável, "um dia" contado pela rolagem, modos e vídeos */
(function(){
  'use strict';
  var BASE = 'https://github.com/QG-Digital/LocalInsta';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function(v, a, b){ return Math.max(a, Math.min(b, v)); };

  /* ---------- dados editáveis (site-content.json) ---------- */
  function get(obj, path){ return path.split('.').reduce(function(o,k){ return (o && o[k] !== undefined) ? o[k] : undefined; }, obj); }
  var adsId = '', convId = '';

  function applyContent(c){
    if(!c) return;
    $$('[data-c]').forEach(function(el){
      var v = get(c, el.getAttribute('data-c'));
      if(typeof v === 'string' && v.trim()) el.textContent = v;
    });
    var after = c.hero && c.hero.titleAfter;
    if(typeof after === 'string' && after.trim()){
      var m = after.match(/^([.,!?:;]*)\s*([\s\S]*)$/);
      $('#h1p').textContent = m[1] || '';
      $('#h1r').textContent = m[2] || '';
      $('.h1sub').style.display = m[2] ? '' : 'none';
    }
    var l = c.links || {};
    $$('[data-link]').forEach(function(a){ var k = a.getAttribute('data-link'); if(l[k]) a.setAttribute('href', l[k]); });
    var d = c.demo || {};
    if(d.videoId) $('#demoVideo').setAttribute('data-video', d.videoId);
    (c.courses || []).forEach(function(course, i){
      var card = $('.course[data-i="'+i+'"]'); if(!card) return;
      ['duration','title','description'].forEach(function(f){
        var el = $('[data-f="'+f+'"]', card); if(el && course[f]) el.textContent = course[f];
      });
      var id = course.videoId || course.id; if(id) $('[data-video]', card).setAttribute('data-video', id);
    });
    if(c.identity && c.identity.siteTitle) document.title = c.identity.siteTitle;
    loadAds(c.googleAds || {});
    posters();
  }

  /* ---------- Google Ads ---------- */
  function loadAds(g){
    adsId = g.measurementId || ''; convId = g.conversionSendTo || '';
    if(!adsId || $('script[data-google-ads="'+adsId+'"]')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', adsId);
    var s = document.createElement('script'); s.async = true; s.dataset.googleAds = adsId;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(adsId);
    document.head.appendChild(s);
  }
  function conversion(){ try{ if(window.gtag && convId) window.gtag('event','conversion',{send_to: convId, value: 1, currency: 'BRL'}); }catch(e){} }
  document.addEventListener('click', function(e){
    var a = e.target.closest('a'); if(!a) return;
    if(a.hasAttribute('data-download-real') || a.hasAttribute('data-wa')) conversion();
  });

  /* ---------- download ---------- */
  function applyVersion(v){
    var url = BASE + '/releases/latest', note = '';
    if(v && v.installerName){
      url = BASE + '/releases/download/' + (v.releaseTag || 'business-tools') + '/' + v.installerName;
      note = 'Versão ' + (v.version || '') + ' para Windows';
    }
    $$('[data-download]').forEach(function(a){ a.setAttribute('href', url); });
    var n = $('#versionNote'); if(n && note) n.textContent = note;
  }

  /* ---------- vídeos sob demanda ---------- */
  function posters(){
    $$('.video[data-video]').forEach(function(box){
      var id = box.getAttribute('data-video');
      if(!id || box.querySelector('iframe') || box.getAttribute('data-poster') === id) return;
      box.setAttribute('data-poster', id);
      var base = 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/';
      box.style.backgroundImage = 'url(' + base + 'hqdefault.jpg)';
      var hi = new Image();
      hi.onload = function(){ if(hi.naturalWidth > 320 && box.getAttribute('data-poster') === id) box.style.backgroundImage = 'url(' + base + 'maxresdefault.jpg)'; };
      hi.src = base + 'maxresdefault.jpg';
    });
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest('.video-play'); if(!b) return;
    var box = b.closest('.video'), id = box.getAttribute('data-video'); if(!id) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true; f.title = 'Vídeo do LocalInsta';
    box.innerHTML = ''; box.appendChild(f);
  });

  /* ---------- menu mobile ---------- */
  var burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', function(){ var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  nav.addEventListener('click', function(e){ if(e.target.tagName === 'A'){ nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

  /* ---------- revelar ao rolar ---------- */
  var rv = $$('[data-rv]').concat($$('#priceCard'));
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(es){ es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } }); }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
    rv.forEach(function(el){ io.observe(el); });
  } else rv.forEach(function(el){ el.classList.add('in'); });

  /* ---------- um dia com o LocalInsta ---------- */
  var day = $('#dia'), track = $('#dayTrack'), chaps = $$('.chap'), N = chaps.length;
  var mins = chaps.map(function(c){ var t = c.getAttribute('data-t').split(':'); return (+t[0]) * 60 + (+t[1]); });
  var kinds = chaps.map(function(c){ return c.getAttribute('data-k'); });
  var tray = $('#tray'), grid = $('#grid'), toast = $('#toast');
  var hEl = $('#clkH'), mEl = $('#clkM'), posts = $('#phPosts'), tF = $('#tF'), tS = $('#tS');
  var storyColors = ['#C68642','#E76F51','#2A9D8F','#264653','#F4A261'];
  /* céu de cada capítulo: manhã, café, meio-dia, tarde, entardecer, noite */
  var sky = ['#FFF2D2','#EAF7EE','#F7FBEF','#FFEFC9','#FFD3AE','#07190F'].map(function(h){ return [parseInt(h.substr(1,2),16), parseInt(h.substr(3,2),16), parseInt(h.substr(5,2),16)]; });
  var dusk = [74,49,71];
  var D0 = 6.5 * 60, D1 = 22.75 * 60; // faixa da linha do dia
  var pct = function(m){ return (m - D0) / (D1 - D0) * 100; };
  var dayline = $('#dayline'), dlFill = $('#dlFill'), ticks = [];
  chaps.forEach(function(c, i){
    var t = document.createElement('span'); t.className = 'dl-tick'; t.style.left = pct(mins[i]) + '%'; t.textContent = c.getAttribute('data-t');
    dayline.appendChild(t); ticks.push(t);
  });
  var curIdx = -1, toastTimer = null, lastClock = -1, lastSky = '';
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function setClock(m){ m = Math.round(m); if(m === lastClock) return; lastClock = m; hEl.textContent = pad(Math.floor(m/60)); mEl.textContent = pad(m % 60); }
  function showChapter(idx){
    if(idx === curIdx) return;
    var up = idx > curIdx; curIdx = idx;
    chaps.forEach(function(c, i){ c.classList.toggle('is-on', i === idx); c.classList.toggle('is-past', i < idx); });
    ticks.forEach(function(t, i){ t.classList.toggle('done', i <= idx); t.classList.toggle('now', i === idx); });
    var stories = 0, feeds = 0;
    for(var i = 0; i <= idx; i++){ if(kinds[i] === 'story') stories++; else feeds++; }
    while(tray.children.length > stories) tray.removeChild(tray.lastChild);
    for(var j = 0, n = 0; j <= idx; j++){ if(kinds[j] !== 'story') continue;
      if(n >= tray.children.length){
        var s = document.createElement('span'), inner = document.createElement('i');
        inner.style.background = storyColors[n % storyColors.length]; inner.textContent = chaps[j].getAttribute('data-t');
        s.appendChild(inner); tray.appendChild(s);
      }
      n++;
    }
    grid.classList.toggle('has-new', feeds > 0);
    posts.textContent = 24 + feeds; tF.textContent = feeds; tS.textContent = stories;
    if(up){
      $('#toastT').textContent = kinds[idx] === 'feed' ? 'Feed publicado' : 'Story publicado';
      $('#toastH').textContent = chaps[idx].getAttribute('data-t');
      toast.classList.add('show'); clearTimeout(toastTimer);
      toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 2400);
    }
  }
  function dayFrame(vh){
    var r = track.getBoundingClientRect();
    if(r.bottom < -vh || r.top > vh * 2) return;
    var top = 64, total = r.height - (vh - top);
    var p = clamp((top - r.top) / total, 0, 1);
    /* cada capítulo segura o relógio parado por metade do trecho; na outra metade o tempo corre até o próximo horário */
    var x = clamp(p * N, 0, N - 0.001), i = Math.floor(x), f = x - i, hold = 0.5;
    var t = (i >= N - 1 || f < hold) ? 0 : (f - hold) / (1 - hold), e = t * t * (3 - 2 * t);
    var m = i >= N - 1 ? mins[N-1] : mins[i] + (mins[i+1] - mins[i]) * e;
    setClock(m);
    showChapter(i);
    var a = sky[i], b = sky[Math.min(i + 1, N - 1)], k = e, night = i === N - 1;
    if(i === N - 2){ /* anoitecer: passa rápido por um roxo de fim de tarde antes do escuro */
      var u = clamp((t - 0.4) / 0.2, 0, 1); k = u * u * (3 - 2 * u); night = k > 0.25;
      if(k < 0.5){ b = dusk; k = k * 2; } else { a = dusk; k = (k - 0.5) * 2; }
    }
    var col = 'rgb(' + Math.round(a[0] + (b[0]-a[0]) * k) + ',' + Math.round(a[1] + (b[1]-a[1]) * k) + ',' + Math.round(a[2] + (b[2]-a[2]) * k) + ')';
    day.classList.toggle('night', night);
    if(col !== lastSky){ lastSky = col; day.style.setProperty('--sky', col); }
    dlFill.style.transform = 'scaleX(' + (clamp(pct(m), 0, 100) / 100).toFixed(4) + ')';
  }

  /* ---------- ritmo: três modos com demonstração ---------- */
  var modesBox = $('#modes'), modes = $$('.mode', modesBox), views = $$('.mv', modesBox), curMode = 0;
  var week = $('#week'), cal = $('#cal');
  ['Seg','Ter','Qua','Qui','Sex'].forEach(function(d){
    var row = document.createElement('div'); row.className = 'wk';
    row.innerHTML = '<span>' + d + '</span><div class="wk-line"><i class="f"></i><i></i><i></i><i></i></div>';
    week.appendChild(row);
  });
  function shuffleWeek(){
    $$('.wk-line', week).forEach(function(line){
      var slots = [[4,26],[30,48],[54,72],[78,96]];
      $$('i', line).forEach(function(dot, k){ var s = slots[k]; dot.style.left = (s[0] + Math.random() * (s[1] - s[0])).toFixed(1) + '%'; });
    });
  }
  (function buildCal(){
    var html = ''; ['D','S','T','Q','Q','S','S'].forEach(function(w){ html += '<span class="wd">' + w + '</span>'; });
    var marks = {10:'m1', 6:'m2', 13:'m2', 20:'m2', 27:'m2', 23:'m3'};
    for(var d = 1; d <= 28; d++) html += '<span class="' + (marks[d] || '') + '">' + d + '</span>';
    cal.innerHTML = html;
  })();
  function setMode(i, user){
    curMode = i;
    modes.forEach(function(m, k){ m.classList.toggle('is-on', k === i); m.setAttribute('aria-selected', k === i); });
    views.forEach(function(v, k){ v.hidden = k !== i; });
    if(i === 0) requestAnimationFrame(shuffleWeek);
    if(user) modesBox.classList.remove('auto');
  }
  modes.forEach(function(m, i){
    m.addEventListener('click', function(){ setMode(i, true); });
    $('.mode-bar', m).addEventListener('animationend', function(){ if(modesBox.classList.contains('auto')) setMode((i + 1) % modes.length); });
  });
  shuffleWeek();
  if(!reduce && 'IntersectionObserver' in window){
    modesBox.classList.add('auto');
    new IntersectionObserver(function(es){ modesBox.classList.toggle('run', es[0].isIntersecting); }, {threshold:.35}).observe(modesBox);
  }

  /* ---------- quadro de rolagem: topo, menu ativo, janela do início ---------- */
  var topEl = $('#top'), win = $('#heroWin'), wa = $('.wa-float'), getSec = $('#baixar');
  var navLinks = $$('#nav a[href^="#"]'), navSecs = navLinks.map(function(a){ return $(a.getAttribute('href')); });
  function frame(){
    var vh = window.innerHeight, sc = window.scrollY || document.documentElement.scrollTop;
    topEl.classList.toggle('scrolled', sc > 8);
    var probe = vh * 0.4, active = -1;
    navSecs.forEach(function(s, i){ if(s && s.getBoundingClientRect().top <= probe) active = i; });
    navLinks.forEach(function(a, i){ a.classList.toggle('on', i === active); });
    if(win && !reduce){
      var wr = win.getBoundingClientRect();
      if(wr.bottom > 0 && wr.top < vh){
        var p = clamp(1 - (wr.top - vh * 0.16) / (vh * 0.74), 0, 1), e = 1 - Math.pow(1 - p, 3);
        win.style.transform = 'rotateX(' + ((1 - e) * 9).toFixed(2) + 'deg) scale(' + (0.9 + 0.1 * e).toFixed(4) + ')';
      }
    }
    if(wa && getSec){ var gr = getSec.getBoundingClientRect(), tr = track.getBoundingClientRect(); wa.classList.toggle('hide', gr.top < vh * 0.7 || (tr.top < vh * 0.5 && tr.bottom > vh)); }
    dayFrame(vh);
  }
  var ticking = false;
  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(function(){ ticking = false; frame(); }); } }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);

  /* ---------- carga ---------- */
  function json(url){ return fetch(url, {cache:'no-cache'}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  applyVersion(null); posters(); frame();
  json('./site-version.json').then(applyVersion).catch(function(){});
  json('./site-content.json').then(applyContent).catch(function(){});
})();
