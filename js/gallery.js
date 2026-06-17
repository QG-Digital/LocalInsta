function renderGallery() {
  const feedHistory = loadData('post_history_feed');
  const storyHistory = loadData('post_history_story');
  const allImages = loadData('all_images') || [];
  const configFeed = loadData('config_feed');
  const configStory = loadData('config_story');

  const feedTotal = allImages.filter(i => i.type.includes('feed')).length;
  const storyTotal = allImages.filter(i => i.type.includes('story')).length;
  
  const feedPosted = Object.keys(feedHistory).filter(k => !k.startsWith('_')).length;
  const storyPosted = Object.keys(storyHistory).filter(k => !k.startsWith('_')).length;

  const feedPending = Math.max(0, feedTotal - feedPosted);
  const storyPending = Math.max(0, storyTotal - storyPosted);

  const feedDaysArray = Array.isArray(configFeed.dias_postagem) ? configFeed.dias_postagem : ["segunda","terca","quarta","quinta","sexta","sabado","domingo"];
  const feedDaysPerWeek = feedDaysArray.length;
  const feedPostsPerDay = parseInt(configFeed.max_posts_por_dia) || 1;
  const feedPostsPerWeek = feedDaysPerWeek * feedPostsPerDay;

  const storyPostsPerDay = parseInt(configStory.max_posts_per_day) || 5;
  const storyPostsPerWeek = storyPostsPerDay * 7;

  function getVitalityDetails(pending, postsPerWeek) {
    if (pending === 0) return { color: 'var(--text3)', label: 'Zerado', text: 'Sem imagens' };
    if (postsPerWeek === 0) return { color: 'var(--text3)', label: 'Pausado', text: 'Sem dias marcados' };
    const weeksRemaining = pending / postsPerWeek;
    const daysRemaining = Math.floor(weeksRemaining * 7);
    if (daysRemaining < 1) return { color: 'var(--error)', label: 'Crítico', text: 'Acaba hoje' };
    if (daysRemaining >= 60) return { color: 'var(--success)', label: 'Saudável', text: `~${Math.floor(daysRemaining/30)} meses` };
    if (daysRemaining >= 30) return { color: 'var(--success)', label: 'Saudável', text: `1 mês e pouco` };
    if (daysRemaining >= 7) return { color: 'var(--warning)', label: 'Atenção', text: `~${Math.floor(daysRemaining/7)} semanas` };
    return { color: 'var(--error)', label: 'Crítico', text: `~${daysRemaining} dias` };
  }

  const vitFeed = getVitalityDetails(feedPending, feedPostsPerWeek);
  const vitStory = getVitalityDetails(storyPending, storyPostsPerWeek);

  const content = `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div class="page-title">Galeria e Estoque</div>
        <div class="page-desc">Gerencie suas imagens, exclua e veja previsões</div>
      </div>
      <button class="btn btn-secondary" onclick="refreshGallery()" id="btn-refresh-gallery">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Sincronizar Pastas
      </button>
    </div>

    <!-- PAINEL DE VITALIDADE -->
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Resumo e Previsão de Estoque</div></div>
      <div class="panel-body">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
          <div style="border: 1px solid var(--border); padding: 12px; border-left: 3px solid var(--accent);">
            <div style="font-size: 10px; color: var(--text3); text-transform: uppercase;">Última Postagem Geral</div>
            <div style="font-weight: 700; margin-top: 5px; font-size: 16px;">${getLastPostDate(feedHistory, storyHistory)}</div>
            <div style="font-size: 10px; margin-top: 4px; color: var(--text2);">Total: ${feedPosted} Feed | ${storyPosted} Story</div>
          </div>
          <div style="border: 1px solid var(--border); padding: 12px; border-left: 3px solid ${vitFeed.color}; background: ${vitFeed.color}0A;">
            <div style="font-size: 10px; color: var(--text3); text-transform: uppercase;">Vitalidade do Feed</div>
            <div style="font-weight: 700; margin-top: 5px; font-size: 16px; color: ${vitFeed.color};">${vitFeed.label} (${vitFeed.text})</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
               <span style="font-size: 10px; color: var(--text2);">Restam ${feedPending} inéditas</span>
               <button class="btn btn-secondary btn-sm" onclick="openMainFolder('feed')" style="padding: 2px 8px; font-size: 9px; height: 22px;">📂 Abrir Pasta</button>
            </div>
          </div>
          <div style="border: 1px solid var(--border); padding: 12px; border-left: 3px solid ${vitStory.color}; background: ${vitStory.color}0A;">
            <div style="font-size: 10px; color: var(--text3); text-transform: uppercase;">Vitalidade do Story</div>
            <div style="font-weight: 700; margin-top: 5px; font-size: 16px; color: ${vitStory.color};">${vitStory.label} (${vitStory.text})</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
               <span style="font-size: 10px; color: var(--text2);">Restam ${storyPending} inéditas</span>
               <button class="btn btn-secondary btn-sm" onclick="openMainFolder('story')" style="padding: 2px 8px; font-size: 9px; height: 22px;">📂 Abrir Pasta</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PAINEL DA GALERIA -->
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">Filtros de Galeria</div>
        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" onclick="filterGallery('all')">Todas</button>
          <button class="btn btn-secondary btn-sm" onclick="filterGallery('feed_normal')">Feed Normal</button>
          <button class="btn btn-secondary btn-sm" onclick="filterGallery('feed_especial')" style="color: #2196F3; border-color: #2196F3;">Feed Especial</button>
          <button class="btn btn-secondary btn-sm" onclick="filterGallery('story_normal')">Story Normal</button>
          <button class="btn btn-secondary btn-sm" onclick="filterGallery('story_especial')" style="color: #E91E63; border-color: #E91E63;">Story Especial</button>
        </div>
      </div>
      <div class="panel-body">
        <div class="gallery-grid" id="gallery-grid">
          ${generateRealGalleryItems('all')}
        </div>
      </div>
    </div>
  `;
  document.getElementById('content-area').innerHTML = content;
}

function openMainFolder(type) {
  const shared = loadData('config_shared');
  const folderPath = type === 'feed' ? shared.pastas.feed_base : shared.pastas.story_base;
  fetch('/api/open_folder', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: folderPath }) });
}

function filterGallery(type) {
  document.getElementById('gallery-grid').innerHTML = generateRealGalleryItems(type);
}

function generateRealGalleryItems(type) {
  const feedHistory = loadData('post_history_feed') || {};
  const storyHistory = loadData('post_history_story') || {};
  const allImages = loadData('all_images') || [];
  
  const itemsMap = new Map();

  Object.entries(feedHistory).forEach(([path, time]) => {
    if(!path.startsWith('_falha_') && !path.startsWith('_sem_imagem_')) itemsMap.set(path, { path, time, type: 'feed', posted: true });
  });
  Object.entries(storyHistory).forEach(([path, time]) => {
    if(!path.startsWith('_falha_') && !path.startsWith('_sem_imagem_')) itemsMap.set(path, { path, time, type: 'story', posted: true });
  });

  allImages.forEach(img => {
    if (!itemsMap.has(img.path)) itemsMap.set(img.path, { path: img.path, time: 0, type: img.type, posted: false });
  });

  let items = Array.from(itemsMap.values());

  if (type !== 'all') {
    if (type === 'feed_normal') items = items.filter(i => i.type === 'feed');
    else if (type === 'story_normal') items = items.filter(i => i.type === 'story');
    else items = items.filter(i => i.type === type); // feed_especial, story_especial
  }

  items.sort((a, b) => {
     if (a.posted === b.posted) return b.time - a.time; 
     return a.posted ? 1 : -1; 
  });

  let html = '';
  items.forEach(item => {
    const imgPath = item.path.replace(/\\/g, '/');
    const fileName = imgPath.split('/').pop();
    const dateStr = item.posted ? new Date(item.time * 1000).toLocaleDateString('pt-BR') : 'Aguardando bot...';
    
    const statusIcon = item.posted 
      ? '<div style="position: absolute; bottom: 5px; right: 5px; background: var(--success); color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; z-index: 10; box-shadow: 0 2px 5px rgba(0,0,0,0.3);" title="Postado">✓</div>'
      : '<div style="position: absolute; bottom: 5px; right: 5px; background: var(--warning); color: #000; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; z-index: 10; box-shadow: 0 2px 5px rgba(0,0,0,0.3);" title="Pendente na Fila">⏱️</div>';

    // Botão de Deletar (Lixeira) no canto superior esquerdo
    const deleteBtn = `<button onclick="deleteImage('${btoa(imgPath)}')" style="position: absolute; top: 5px; left: 5px; background: rgba(211, 47, 47, 0.9); color: white; border: none; border-radius: 4px; width: 24px; height: 24px; cursor: pointer; z-index: 10; display:flex; align-items:center; justify-content:center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);" title="Excluir Imagem">🗑️</button>`;

    let badgeClass = "badge-feed";
    let badgeText = "Feed";
    let campName = "";

    if (item.type === 'feed_especial') {
        badgeClass = "badge-especial-feed";
        badgeText = "Feed";
        campName = imgPath.split('/')[imgPath.split('/').length - 2];
    } else if (item.type === 'story') {
        badgeClass = "badge-story";
        badgeText = "Story";
    } else if (item.type === 'story_especial') {
        badgeClass = "badge-especial-story";
        badgeText = "Story";
        campName = imgPath.split('/')[imgPath.split('/').length - 2];
    }

    const campBadge = campName ? `<div style="font-size: 9px; color: var(--accent); font-weight: 700; margin-top: 2px;">🎁 ${campName.replace(/_/g, ' ')}</div>` : '';

    html += `
      <div class="gallery-item" style="opacity: ${item.posted ? '0.7' : '1'}; transition: 0.2s; position: relative;">
        <div class="gallery-img-placeholder" style="position: relative; overflow: hidden; border-bottom: 2px solid ${item.posted ? 'var(--success)' : 'var(--warning)'}">
          ${deleteBtn}
          ${statusIcon}
          <img loading="lazy" src="/api/image/${encodeURIComponent(imgPath)}" 
               style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;"
               onerror="this.outerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;opacity:0.3;background:#eee\\'><svg viewBox=\\'0 0 24 24\\' width=\\'24\\' height=\\'24\\' fill=\\'none\\' stroke=\\'currentColor\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\' ry=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21 15 16 10 5 21\\'/></svg></div>'">
        </div>
        <div class="gallery-info">
          <div style="font-weight: 700; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${fileName}">${fileName}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="badge ${badgeClass}">${badgeText}</span>
            <span style="font-size: 10px; font-weight: 600; color: ${item.posted ? 'var(--text3)' : 'var(--warning)'}">${dateStr}</span>
          </div>
          ${campBadge}
        </div>
      </div>
    `;
  });

  if(items.length === 0) return `<div style="grid-column: 1/-1; padding: 20px; text-align: center; color: var(--text3);">Nenhuma imagem encontrada. Adicione fotos nas pastas e clique em Sincronizar!</div>`;
  return html;
}

function getLastPostDate(feed, story) {
  const feedTimes = Object.entries(feed).filter(([k]) => !k.startsWith('_')).map(([,v]) => v);
  const storyTimes = Object.entries(story).filter(([k]) => !k.startsWith('_')).map(([,v]) => v);
  const allTimes = [...feedTimes, ...storyTimes];
  if (allTimes.length === 0) return 'Nenhuma postagem';
  const last = Math.max(...allTimes);
  const diff = Math.floor((Date.now() / 1000 - last) / 86400);
  return diff === 0 ? 'Hoje' : `Há ${diff} dias`;
}

async function refreshGallery() {
  const btn = document.getElementById('btn-refresh-gallery');
  if (btn) { btn.disabled = true; btn.innerHTML = "⏳ Sincronizando..."; }
  try {
    const res = await fetch('/api/all_images');
    window.GlobalState['all_images'] = await res.json();
    renderGallery();
    showToast("Galeria atualizada com sucesso!", "success");
  } catch (e) { showToast("Erro ao atualizar galeria", "error"); }
  if (btn) { btn.disabled = false; btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Sincronizar Pastas`; }
}

async function deleteImage(b64Path) {
  // Cria o HTML do modal bonitão
  const modalHtml = `
    <div id="delete-img-modal" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(2px);">
      <div style="background:var(--bg); border-radius:16px; width:360px; max-width:90%; padding:24px; box-shadow:0 20px 35px rgba(0,0,0,0.3); text-align:center;">
        <div style="font-size:48px; margin-bottom:12px;">🗑️</div>
        <h3 style="margin:0 0 8px 0; font-size:18px;">Excluir Imagem</h3>
        <p style="color:var(--text2); margin-bottom:20px; font-size:13px;">
          Tem certeza que deseja apagar esta foto do seu computador?
          <br><br>
          <span style="color:var(--error); font-size:11px; font-weight:bold;">⚠️ Esta ação não pode ser desfeita!</span>
        </p>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button id="modal-img-cancel" style="background:var(--surface2); border:1px solid var(--border); color:var(--text2); padding:8px 20px; border-radius:8px; cursor:pointer; font-size:13px;">Cancelar</button>
          <button id="modal-img-confirm" style="background:var(--error); border:none; color:white; padding:8px 20px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600;">Excluir</button>
        </div>
      </div>
    </div>
  `;

  // Joga o modal na tela
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Se clicar em Cancelar, só fecha o modal
  document.getElementById('modal-img-cancel').onclick = () => {
    document.getElementById('delete-img-modal').remove();
  };

  // Se clicar em Excluir, faz a mágica
  document.getElementById('modal-img-confirm').onclick = async () => {
    const btn = document.getElementById('modal-img-confirm');
    btn.innerText = "Excluindo...";
    btn.disabled = true;

    const realPath = atob(b64Path);
    try {
      const res = await fetch('/api/delete_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: realPath })
      });
      const data = await res.json();
      
      if(data.status === 'success') {
        showToast("Imagem excluída com sucesso!", "success");
        refreshGallery(); // Recarrega as fotos automaticamente
      } else {
        showToast("Erro: " + data.message, "error");
      }
    } catch(e) {
      showToast("Erro ao excluir imagem.", "error");
    }
    
    // Tira o modal da tela
    document.getElementById('delete-img-modal').remove();
  };
}