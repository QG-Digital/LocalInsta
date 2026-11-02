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
      $('#h1r').parentNode.style.display = m[2] ? '' : 'none';
    }
    var l = c.links || {};
    $$('[data-link]').forEach(function(a){ var k = a.getAttribute('data-link'); if(l[k]) a.setAttribute('href', l[k]); });
    var d = c.demo || {};
    if(d.videoId) $('#demoVideo').setAttribute('data-video', d.videoId);
    (c.courses || []).forEach(function(course, i){
      var card = $('.course[data-i="'+i+'"]'); if(!card) return;
      ['module','duration','title','description'].forEach(function(f){
        var el = $('[data-f="'+f+'"]', card); if(el && course[f]) el.textContent = course[f];
      });
      var id = course.videoId || course.id; if(id) $('[data-video]', card).setAttribute('data-video', id);
    });
    if(c.identity && c.identity.siteTitle) document.title = c.identity.siteTitle;
    loadAds(c.googleAds || {});
    splitAll(); posters();
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
    if(a.hasAttribute('data-download') || a.hasAttribute('data-wa')) conversion();
  });

  /* ---------- download ---------- */
  function applyVersion(v){
    var url = BASE + '/releases/latest', note = '';
    if(v && v.installerName){
      url = BASE + '/releases/download/' + (v.releaseTag || 'business-tools') + '/' + v.installerName;
      note = 'Versão ' + (v.version || '') + ' · Windows';
    }
    $$('[data-download]').forEach(function(a){ a.setAttribute('href', url); });
    var n = $('#versionNote'); if(n && note) n.textContent = note;
  }

  /* ---------- vídeos sob demanda ---------- */
  function posters(){
    $$('.video[data-video]').forEach(function(box){
      var id = box.getAttribute('data-video');
      if(id && !box.querySelector('iframe')) box.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg)';
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

  /* ---------- títulos: palavra por palavra ---------- */
  function splitAll(){
    $$('.sp').forEach(function(el){
      var wasIn = el.classList.contains('in');
      var text = el.textContent.replace(/\s+/g,' ').trim();
      el.setAttribute('aria-label', text);
      el.innerHTML = '';
      text.split(' ').forEach(function(w, i){
        var o = document.createElement('span'); o.className = 'w'; o.setAttribute('aria-hidden','true');
        var s = document.createElement('span'); s.textContent = w; s.style.transitionDelay = (i * 45) + 'ms';
        o.appendChild(s); el.appendChild(o); el.appendChild(document.createTextNode(' '));
      });
      if(wasIn) el.classList.add('in');
      if(io) io.observe(el);
    });
  }
  var io = null;
  if('IntersectionObserver' in window && !reduce){
    io = new IntersectionObserver(function(es){ es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } }); }, {threshold:.15, rootMargin:'0px 0px -6% 0px'});
    $$('.rv').forEach(function(el){ io.observe(el); });
  } else { $$('.rv,.sp').forEach(function(el){ el.classList.add('in'); }); }
  splitAll();
  if(!io) $$('.sp').forEach(function(el){ el.classList.add('in'); });

  /* ---------- um dia com o LocalInsta ---------- */
  var track = $('#dayTrack'), chaps = $$('.chap'), N = chaps.length;
  var mins = chaps.map(function(c){ var t = c.getAttribute('data-t').split(':'); return (+t[0]) * 60 + (+t[1]); });
  var kinds = chaps.map(function(c){ return c.getAttribute('data-k'); });
  var tray = $('#tray'), grid = $('#grid'), toast = $('#toast'), hint = $('#hint');
  var hEl = $('#clkH'), mEl = $('#clkM'), posts = $('#phPosts'), tF = $('#tF'), tS = $('#tS');
  var colors = ['#C68642','#E76F51','#2A9D8F','#264653','#F4A261'];
  var curIdx = -1, toastTimer = null;
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function setClock(m){ m = Math.round(m); hEl.textContent = pad(Math.floor(m/60)); mEl.textContent = pad(m % 60); }
  function showChapter(idx){
    if(idx === curIdx) return;
    var up = idx > curIdx; curIdx = idx;
    chaps.forEach(function(c, i){ c.classList.toggle('is-on', i === idx); });
    var stories = 0, feeds = 0;
    for(var i = 0; i <= idx; i++){ if(kinds[i] === 'story') stories++; else feeds++; }
    tray.innerHTML = '';
    var n = 0;
    for(var j = 0; j <= idx; j++){ if(kinds[j] === 'story'){
      var s = document.createElement('span'); var inner = document.createElement('i');
      inner.style.background = colors[n % colors.length]; inner.textContent = chaps[j].getAttribute('data-t');
      s.appendChild(inner); s.style.animationDelay = '0s'; tray.appendChild(s); n++; } }
    grid.classList.toggle('has-new', feeds > 0);
    posts.textContent = 24 + feeds;
    tF.textContent = feeds; tS.textContent = stories;
    if(up || idx === 0){
      $('#toastT').textContent = kinds[idx] === 'feed' ? 'Feed publicado' : 'Story publicado';
      $('#toastH').textContent = chaps[idx].getAttribute('data-t');
      toast.classList.add('show'); clearTimeout(toastTimer);
      toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 2200);
    }
  }
  function dayFrame(){
    if(!track) return;
    var r = track.getBoundingClientRect(), vh = window.innerHeight;
    var total = r.height - (vh - 66);
    var p = clamp((66 - r.top) / total, 0, 1);
    var x = clamp(p * N - 0.5, 0, N - 1), i = Math.floor(x), f = x - i;
    var m = i >= N - 1 ? mins[N-1] : mins[i] + (mins[i+1] - mins[i]) * f;
    setClock(m);
    showChapter(clamp(Math.round(x), 0, N - 1));
    hint.classList.toggle('hint-off', p > 0.03);
    floatPhone(r, vh);
  }
  /* celular flutuante no mobile: fica preso no topo enquanto a seção rola */
  var dayRight = $('.day-right'), mqMobile = window.matchMedia('(max-width:980px)');
  function floatPhone(r, vh){
    if(!dayRight) return;
    if(!mqMobile.matches || reduce){ dayRight.classList.remove('is-float'); dayRight.style.transform = ''; return; }
    var ps = parseFloat(getComputedStyle($('.day-grid')).getPropertyValue('--ps')) || .58;
    var H = 310 * ps, min = 76;
    var y = Math.min(Math.max(r.top + 10, min), r.bottom - H - 8);
    var on = r.top < vh - 40 && r.bottom > min + 20;
    dayRight.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
    dayRight.classList.toggle('is-float', on);
  }

  /* ---------- ritmo: modo em destaque ---------- */
  var modes = $$('.mode');
  function modesFrame(){
    var mid = window.innerHeight * 0.5, best = 0, bd = 1e9;
    modes.forEach(function(m, i){ var r = m.getBoundingClientRect(); var d = Math.abs(r.top + r.height/2 - mid); if(d < bd){ bd = d; best = i; } });
    modes.forEach(function(m, i){ m.classList.toggle('is-on', i === best); });
  }

  /* ---------- barra lateral, progresso e paralaxe ---------- */
  var secs = $$('[data-sec]'), links = $$('#rail a'), rail = $('#rail'), fill = $('#railFill'), bar = $('#bar');
  var darkIds = {ritmo:1, seguro:1, baixar:1};
  var pars = $$('[data-par]');
  function frame(){
    var doc = document.documentElement, sc = window.scrollY || doc.scrollTop, max = doc.scrollHeight - window.innerHeight;
    var prog = max > 0 ? clamp(sc / max, 0, 1) : 0;
    bar.style.transform = 'scaleX(' + prog + ')';
    fill.style.transform = 'scaleY(' + prog + ')';
    var probe = window.innerHeight * 0.38, active = 0;
    secs.forEach(function(s, i){ if(s.getBoundingClientRect().top <= probe) active = i; });
    links.forEach(function(a, i){ a.classList.toggle('on', i === active); a.classList.toggle('done', i < active); });
    rail.classList.toggle('dark', !!darkIds[secs[active].id]);
    dayFrame(); modesFrame();
    if(!reduce){
      var vh = window.innerHeight;
      pars.forEach(function(el){
        var r = el.getBoundingClientRect(); if(r.bottom < -200 || r.top > vh + 200) return;
        var off = (r.top + r.height/2 - vh/2) * parseFloat(el.getAttribute('data-par'));
        el.style.translate = '0 ' + (-off).toFixed(1) + 'px';
      });
    }
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
