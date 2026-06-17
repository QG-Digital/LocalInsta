function showTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick').includes(tabId)) {
      btn.classList.add('active');
    }
  });

  switch(tabId) {
    case 'automation': renderAutomation(); break;
    case 'gallery': renderGallery(); break;
    case 'brand': renderBrand(); break;
    case 'credentials': renderCredentials(); break;
    case 'session': renderSession(); break;
    case 'dates': renderDates(); break;
    case 'feed': renderFeed(); break;
    case 'story': renderStory(); break;
	case 'assinatura': renderAssinatura(); break;
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// --- SESSION ---
function renderSession() {
  const session = loadData('session_python');
  
  const auth = session.authorization_data || { sessionid: "Não logado", ds_user_id: "Não logado" };
  const device = session.device_settings || { manufacturer: "N/A", model: "N/A" };
  const lastLogin = session.last_login ? new Date(session.last_login * 1000).toLocaleString('pt-BR') : "Nunca";
  const userAgent = session.user_agent || "N/A";

  const content = `
    <div class="page-header">
      <div class="page-title">Sessão Instagram</div>
      <div class="page-desc">Visualização dos tokens de segurança e perfil do dispositivo <b style="color:var(--error);">(Somente Leitura)</b></div>
    </div>
    
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Autenticação (Gerado pelo Bot)</div></div>
      <div class="panel-body">
        <div class="field"><label class="field-label">sessionid</label><input type="text" readonly value="${auth.sessionid}" style="background: var(--surface2);"></div>
        <div class="field" style="margin-top:10px"><label class="field-label">ds_user_id</label><input type="text" readonly value="${auth.ds_user_id}" style="background: var(--surface2);"></div>
        <div class="field" style="margin-top:10px"><label class="field-label">Último Login</label><input type="text" readonly value="${lastLogin}" style="background: var(--surface2);"></div>
      </div>
    </div>
    
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Dispositivo Virtual & User Agent</div></div>
      <div class="panel-body">
        <div class="field"><label class="field-label">User Agent</label><textarea readonly rows="2" style="background: var(--surface2); resize: none;">${userAgent}</textarea></div>
        <div class="grid-2" style="margin-top:10px">
          <div class="field"><label class="field-label">Manufacturer</label><input type="text" readonly value="${device.manufacturer}" style="background: var(--surface2);"></div>
          <div class="field"><label class="field-label">Model</label><input type="text" readonly value="${device.model}" style="background: var(--surface2);"></div>
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: var(--text3); font-size: 11px;">
      ℹ️ Estas informações são atualizadas automaticamente quando o bot faz login.
    </div>
  `;
  document.getElementById('content-area').innerHTML = content;
}

// ==================== DATAS E CAMPANHAS ====================
let currentDatesSubTab = 'potenciais';

function renderDates() {
  const feedDates = loadData('special_dates_feed') || {};
  const storyDates = loadData('special_dates_story') || {};
  const potenciais = loadData('datas_potenciais') || { campanhas: { prioridade_maxima: { datas: [] } } };
  const comemorativas = loadData('datas_comemorativas') || [];
  const customDates = loadData('custom_dates') || { feed: {}, story: {} };

  const content = `
    <div class="page-header">
      <div class="page-title">Calendário e Campanhas</div>
      <div class="page-desc">Gerencie campanhas para Feed e Stories separadamente</div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">📡 Campanhas Configuradas</div>
        <button class="btn btn-secondary btn-sm" onclick="openCustomDateModal()">+ Data Personalizada</button>
      </div>
      <div class="panel-body">
        <div id="active-dates-list" class="windows-list"></div>
      </div>
    </div>

    <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
      <button class="btn ${currentDatesSubTab === 'potenciais' ? 'btn-primary' : 'btn-secondary'}" onclick="switchDatesTab('potenciais')">💎 Sugestões</button>
      <button class="btn ${currentDatesSubTab === 'comemorativas' ? 'btn-primary' : 'btn-secondary'}" onclick="switchDatesTab('comemorativas')">📅 Calendário Geral</button>
      <button class="btn ${currentDatesSubTab === 'custom' ? 'btn-primary' : 'btn-secondary'}" onclick="switchDatesTab('custom')">🎂 Minhas Datas</button>
    </div>

    <div id="dates-tab-content">
       ${currentDatesSubTab === 'potenciais' ? renderPotenciaisTab(potenciais, feedDates, storyDates) : 
         currentDatesSubTab === 'comemorativas' ? renderComemorativasTab(comemorativas, feedDates, storyDates) :
         renderCustomTab(customDates, feedDates, storyDates)}
    </div>

    <div id="custom-date-modal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center;">
      <div style="background:var(--bg); border-radius:12px; width:400px; max-width:90%; padding:20px;">
        <h3 style="margin:0 0 15px 0;">Nova Data Personalizada</h3>
        <div class="field"><label class="field-label">Nome da campanha</label><input type="text" id="custom_name" placeholder="Ex: Aniversário do Seu Luiz"></div>
        <div class="grid-2" style="margin-top:10px">
          <div class="field"><label class="field-label">Dia</label><input type="number" id="custom_day" min="1" max="31"></div>
          <div class="field"><label class="field-label">Mês</label><input type="number" id="custom_month" min="1" max="12"></div>
        </div>
        <div style="margin-top:15px; display:flex; gap:10px; justify-content:flex-end;">
          <button class="btn btn-secondary" onclick="closeCustomDateModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="saveCustomDate()">Criar Campanha</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('content-area').innerHTML = content;
  renderActiveDatesList();
}

function switchDatesTab(tab) {
  currentDatesSubTab = tab;
  renderDates();
}

function renderPotenciaisTab(potenciais, feedDates, storyDates) {
  const datas = potenciais.campanhas?.prioridade_maxima?.datas || [];
  const datasSugeridas = datas.filter(d => {
    const dateKey = `${String(d.dia).padStart(2,'0')}/${String(d.mes).padStart(2,'0')}`;
    return !(feedDates[dateKey] && storyDates[dateKey]);
  });

  if (datasSugeridas.length === 0) {
    return `<div class="panel"><div class="panel-body" style="text-align:center;color:var(--text3);padding:40px;">🎉 Todas as sugestões já foram ativadas!</div></div>`;
  }

  return `
    <div class="panel" style="border-top: 3px solid var(--accent);">
      <div class="panel-body" style="padding:0;">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:var(--surface2); border-bottom:2px solid var(--accent);">
              <th style="padding:12px 8px; text-align:left;">📅 DATA</th>
              <th style="padding:12px 8px; text-align:left;">💡 SUGESTÃO</th>
              <th style="padding:12px 8px; text-align:center; width:100px;">📱 FEED</th>
              <th style="padding:12px 8px; text-align:center; width:100px;">📸 STORY</th>
             </tr>
          </thead>
          <tbody>
            ${datasSugeridas.map(d => {
              const dateKey = `${String(d.dia).padStart(2,'0')}/${String(d.mes).padStart(2,'0')}`;
              const feedActive = !!feedDates[dateKey];
              const storyActive = !!storyDates[dateKey];
              return `
                <tr style="border-bottom:1px solid var(--border);">
                  <td style="padding:12px 8px; font-weight:700; color:var(--accent);">${dateKey}</td>
                  <td style="padding:12px 8px;">${d.nome}</td>
                  <td style="padding:12px 8px; text-align:center;">
                    <div onclick="activateDate('${dateKey}', '${d.nome}', 'feed')" 
                         style="cursor:pointer; display:inline-block; ${feedActive ? 'background:var(--success); color:white;' : 'background:#2196F3; color:white;'} padding:6px 12px; border-radius:6px; font-size:12px;">
                      ${feedActive ? '✓ ATIVO' : '+ ATIVAR'}
                    </div>
                  </td>
                  <td style="padding:12px 8px; text-align:center;">
                    <div onclick="activateDate('${dateKey}', '${d.nome}', 'story')" 
                         style="cursor:pointer; display:inline-block; ${storyActive ? 'background:var(--success); color:white;' : 'background:#E91E63; color:white;'} padding:6px 12px; border-radius:6px; font-size:12px;">
                      ${storyActive ? '✓ ATIVO' : '+ ATIVAR'}
                    </div>
                  </td>
                 </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderComemorativasTab(comemorativas, feedDates, storyDates) {
  return `
    <div class="panel">
      <div class="panel-header">
        <input type="text" id="search-date" placeholder="🔍 Procurar evento..." oninput="filterCalendar()" style="width:100%;">
      </div>
      <div class="panel-body" style="max-height:450px; overflow-y:auto; padding:0;">
        <table style="width:100%; font-size:12px; border-collapse:collapse;">
          <tbody id="full-calendar-body">
            ${comemorativas.map(c => (c.dias_especiais || []).map(esp => {
              const dateKey = `${c.dia}/${getMonthNum(c.mes)}`;
              const feedActive = !!feedDates[dateKey];
              const storyActive = !!storyDates[dateKey];
              return `
              <tr class="cal-row" style="border-bottom:1px solid var(--surface2);">
                <td style="padding:10px; font-weight:700; width:65px;">${dateKey}</td>
                <td style="padding:10px;">${esp}</td>
                <td style="padding:10px; text-align:right; white-space:nowrap;">
                  <div style="display:flex; gap:6px; justify-content:flex-end;">
                    <button class="btn btn-xs" style="${feedActive ? 'background:var(--success); color:white;' : 'background:#2196F3; color:white;'}" onclick="activateDate('${dateKey}', '${esp}', 'feed')">
                      ${feedActive ? 'Feed ✓' : 'Feed'}
                    </button>
                    <button class="btn btn-xs" style="${storyActive ? 'background:var(--success); color:white;' : 'background:#E91E63; color:white;'}" onclick="activateDate('${dateKey}', '${esp}', 'story')">
                      ${storyActive ? 'Story ✓' : 'Story'}
                    </button>
                  </div>
                </td>
              </tr>
              `;
            }).join('')).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCustomTab(customDates, feedDates, storyDates) {
  const allCustom = { ...customDates.feed, ...customDates.story };
  const uniqueCustom = [...new Set(Object.values(allCustom))];
  const allImages = loadData('all_images') || [];
  
  if (uniqueCustom.length === 0) {
    return `
      <div class="panel">
        <div class="panel-body" style="text-align:center; color:var(--text3); padding:40px;">
          Nenhuma data personalizada.<br>Clique no botão "+ Data Personalizada" para criar.
        </div>
      </div>
    `;
  }

  return `
    <div class="panel">
      <div class="panel-body" style="padding:0;">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="background:var(--surface2); border-bottom:2px solid var(--accent);">
              <th style="padding:12px 8px; text-align:left;">🎂 NOME PERSONALIZADO</th>
              <th style="padding:12px 8px; text-align:center; width:100px;">📅 DATA</th>
              <th style="padding:12px 8px; text-align:center; width:100px;">📱 FEED</th>
              <th style="padding:12px 8px; text-align:center; width:100px;">📸 STORY</th>
              <th style="padding:12px 8px; text-align:center; width:190px;">📂 PASTAS (FOTOS)</th>
              <th style="padding:12px 8px; text-align:center; width:70px;">🗑️</th>
             </tr>
          </thead>
          <tbody>
            ${uniqueCustom.map(customName => {
              let dateKey = null;
              for (const [k, v] of Object.entries({ ...customDates.feed, ...customDates.story })) {
                if (v === customName) { dateKey = k; break; }
              }
              const feedActive = !!feedDates[dateKey];
              const storyActive = !!storyDates[dateKey];
              const displayName = customName.replace(/_/g, ' ');

              // CONTAGEM DE FOTOS
              const feedCount = allImages.filter(i => i.type === 'feed_especial' && i.path.replace(/\\/g, '/').includes(`/${customName}/`)).length;
              const storyCount = allImages.filter(i => i.type === 'story_especial' && i.path.replace(/\\/g, '/').includes(`/${customName}/`)).length;
              
              return `
                <tr style="border-bottom:1px solid var(--border);">
                  <td style="padding:12px 8px; font-weight:600;">${displayName}</td>
                  <td style="padding:12px 8px; text-align:center; font-family:monospace;">${dateKey || '—'}</td>
                  <td style="padding:12px 8px; text-align:center;">
                    <div onclick="toggleCustomDateStatus('${dateKey}', 'feed', ${feedActive}, '${customName}')" 
                         style="cursor:pointer; display:inline-block; ${feedActive ? 'background:var(--success);' : 'background:var(--surface2); border:1px solid var(--border);'} color:${feedActive ? 'white' : 'var(--text3)'}; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:500;">
                      ${feedActive ? '✓ ATIVO' : 'INATIVO'}
                    </div>
                  </td>
                  <td style="padding:12px 8px; text-align:center;">
                    <div onclick="toggleCustomDateStatus('${dateKey}', 'story', ${storyActive}, '${customName}')" 
                         style="cursor:pointer; display:inline-block; ${storyActive ? 'background:var(--success);' : 'background:var(--surface2); border:1px solid var(--border);'} color:${storyActive ? 'white' : 'var(--text3)'}; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:500;">
                      ${storyActive ? '✓ ATIVO' : 'INATIVO'}
                    </div>
                  </td>
                  <td style="padding:12px 8px; text-align:center;">
                    <div style="display:flex; gap:6px; justify-content:center;">
                      <button class="btn btn-secondary btn-sm" onclick="openSpecificFolder('${customName}', 'feed')" ${!customName ? 'disabled' : ''}>📂 Feed (${feedCount})</button>
                      <button class="btn btn-secondary btn-sm" onclick="openSpecificFolder('${customName}', 'story')" ${!customName ? 'disabled' : ''}>📂 Story (${storyCount})</button>
                    </div>
                  </td>
                  <td style="padding:12px 8px; text-align:center;">
                    <button class="btn btn-error btn-sm" onclick="deleteCustomDate('${dateKey}', '${customName}')" title="Deletar data">🗑️</button>
                  </td>
                 </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function toggleCustomDateStatus(date, type, isCurrentlyActive, campaignName) {
  if (isCurrentlyActive) {
    // DESATIVAR
    const key = type === 'feed' ? 'special_dates_feed' : 'special_dates_story';
    const data = loadData(key) || {};
    delete data[date];
    saveData(key, data);
    showToast(`${type.toUpperCase()} desativado para ${date}`, 'warning');
  } else {
    // ATIVAR
    await activateDate(date, campaignName, type);
  }
  
  renderDates();
}

function renderActiveDatesList() {
  const feedDates = loadData('special_dates_feed') || {};
  const storyDates = loadData('special_dates_story') || {};
  const allCampaigns = loadData('special_dates_all') || {}; 
  const allImages = loadData('all_images') || []; // Pegamos as imagens pra contar
  
  const allDates = Object.keys(allCampaigns).sort();
  const list = document.getElementById('active-dates-list');
  
  if (allDates.length === 0) {
    if (list) list.innerHTML = `<div style="text-align:center; color:var(--text3); padding:40px;">Nenhuma campanha criada. Crie uma nas abas abaixo.</div>`;
    return;
  }
  if (!list) return;

  list.innerHTML = `
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:var(--surface2); border-bottom:2px solid var(--accent);">
          <th style="padding:12px 8px; text-align:left; width:90px;">📅 DATA</th>
          <th style="padding:12px 8px; text-align:left;">🏷️ NOME DA CAMPANHA</th>
          <th style="padding:12px 8px; text-align:center; width:100px;">📱 FEED</th>
          <th style="padding:12px 8px; text-align:center; width:100px;">📸 STORY</th>
          <th style="padding:12px 8px; text-align:center; width:190px;">📂 PASTAS (FOTOS)</th>
          <th style="padding:12px 8px; text-align:center; width:70px;">🗑️</th>
        </tr>
      </thead>
      <tbody>
        ${allDates.map(date => {
          const campaignName = allCampaigns[date] || '';
          const displayName = campaignName.replace(/_/g, ' ');
          const feedName = feedDates[date];
          const storyName = storyDates[date];
          const feedActive = !!feedName;
          const storyActive = !!storyName;

          // CONTAGEM DE FOTOS
          const feedCount = allImages.filter(i => i.type === 'feed_especial' && i.path.replace(/\\/g, '/').includes(`/${campaignName}/`)).length;
          const storyCount = allImages.filter(i => i.type === 'story_especial' && i.path.replace(/\\/g, '/').includes(`/${campaignName}/`)).length;
          
          return `
            <tr style="border-bottom:1px solid var(--border); ${(!feedActive && !storyActive) ? 'opacity:0.7;' : ''}">
              <td style="padding:12px 8px; font-weight:700; color:var(--accent);">${date}</td>
              <td style="padding:12px 8px; font-weight:500;">${displayName}${(!feedActive && !storyActive) ? ' <span style="color:var(--text3); font-size:10px;">(inativo)</span>' : ''}</td>
              <td style="padding:12px 8px; text-align:center;">
                <div onclick="toggleDateStatus('${date}', 'feed', ${feedActive})" 
                     style="cursor:pointer; display:inline-block; ${feedActive ? 'background:var(--success);' : 'background:var(--surface2); border:1px solid var(--border);'} color:${feedActive ? 'white' : 'var(--text3)'}; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:500; transition:all 0.2s;">
                  ${feedActive ? '✓ ATIVO' : 'INATIVO'}
                </div>
              </td>
              <td style="padding:12px 8px; text-align:center;">
                <div onclick="toggleDateStatus('${date}', 'story', ${storyActive})" 
                     style="cursor:pointer; display:inline-block; ${storyActive ? 'background:var(--success);' : 'background:var(--surface2); border:1px solid var(--border);'} color:${storyActive ? 'white' : 'var(--text3)'}; padding:6px 12px; border-radius:6px; font-size:12px; font-weight:500; transition:all 0.2s;">
                  ${storyActive ? '✓ ATIVO' : 'INATIVO'}
                </div>
              </td>
              <td style="padding:12px 8px; text-align:center;">
                <div style="display:flex; gap:6px; justify-content:center;">
                  ${feedActive ? `<button class="btn btn-secondary btn-sm" onclick="openSpecificFolder('${feedName}', 'feed')" title="Abrir pasta">📂 Feed (${feedCount})</button>` : '<span style="opacity:0.3; font-size:11px;">—</span>'}
                  ${storyActive ? `<button class="btn btn-secondary btn-sm" onclick="openSpecificFolder('${storyName}', 'story')" title="Abrir pasta">📂 Story (${storyCount})</button>` : '<span style="opacity:0.3; font-size:11px;">—</span>'}
                </div>
              </td>
              <td style="padding:12px 8px; text-align:center;">
                <button class="btn btn-error btn-sm" onclick="removeFullDate('${date}')" title="Remover campanha">🗑️</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

async function toggleDateStatus(date, type, isCurrentlyActive) {
  const key = type === 'feed' ? 'special_dates_feed' : 'special_dates_story';
  const data = loadData(key) || {};
  const allCampaigns = loadData('special_dates_all') || {};
  
  if (isCurrentlyActive) {
    // DESATIVAR: remove a data do tipo especificado
    delete data[date];
    saveData(key, data);
    showToast(`${type.toUpperCase()} desativado para ${date}`, 'warning');
  } else {
    // ATIVAR: pega o nome do special_dates_all (já existe!)
    const campaignName = allCampaigns[date];
    
    if (!campaignName) {
      showToast(`Erro: Campanha ${date} não encontrada no registro`, 'error');
      return;
    }
    
    // Ativa com o nome já existente (sem perguntar!)
    data[date] = campaignName;
    saveData(key, data);
    
    // Garante que a pasta existe
    const shared = loadData('config_shared') || {};
    const pastaBase = type === 'feed' ? (shared.pastas?.feed_especiais || 'posts_especiais_feed') : (shared.pastas?.story_especiais || 'posts_especiais');
    const path = `${pastaBase}/${campaignName}`;
    
    await fetch('/api/create_folder', { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({path: path}) 
    }).catch(e => console.error(e));
    
    showToast(`${type.toUpperCase()} ativado para ${date}!`, 'success');
  }
  
  renderDates();
}

function openSpecificFolder(folderName, type) {
  const shared = loadData('config_shared') || { pastas: { feed_especiais: "posts_especiais_feed", story_especiais: "posts_especiais" } };
  const pastaBase = type === 'feed' ? shared.pastas.feed_especiais : shared.pastas.story_especiais;
  const path = `${pastaBase}/${folderName}`;
  fetch('/api/open_folder', { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({path: path}) 
  }).catch(e => console.error(e));
}

function removeSingleDate(date, type) {
  const key = type === 'feed' ? 'special_dates_feed' : 'special_dates_story';
  const data = loadData(key) || {};
  delete data[date];
  saveData(key, data);
  renderDates();
  showToast(`${type.toUpperCase()} removido de ${date}`, 'warning');
}

function removeFullDate(date) {
  const allCampaigns = loadData('special_dates_all') || {};
  const campaignName = allCampaigns[date] || '';
  const displayName = campaignName.replace(/_/g, ' ');
  
  // Cria o modal bonito
  const modalHtml = `
    <div id="confirm-modal" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.6); z-index:10000; display:flex; align-items:center; justify-content:center;">
      <div style="background:var(--bg); border-radius:16px; width:360px; max-width:90%; padding:24px; box-shadow:0 20px 35px rgba(0,0,0,0.3); text-align:center;">
        <div style="font-size:48px; margin-bottom:12px;">🗑️</div>
        <h3 style="margin:0 0 8px 0; font-size:18px;">Excluir Campanha</h3>
        <p style="color:var(--text2); margin-bottom:20px; font-size:13px;">
          Tem certeza que deseja remover <strong>${displayName}</strong> (${date})?
          <br><br>
          <span style="color:var(--text3); font-size:11px;">⚠️ Isso não apaga suas pastas, apenas desativa a campanha.</span>
        </p>
        <div style="display:flex; gap:12px; justify-content:center;">
          <button id="modal-cancel" style="background:var(--surface2); border:1px solid var(--border); color:var(--text2); padding:8px 20px; border-radius:8px; cursor:pointer; font-size:13px;">Cancelar</button>
          <button id="modal-confirm" style="background:var(--error); border:none; color:white; padding:8px 20px; border-radius:8px; cursor:pointer; font-size:13px; font-weight:600;">Excluir</button>
        </div>
      </div>
    </div>
  `;
  
  // Adiciona o modal ao body
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Eventos dos botões
  document.getElementById('modal-cancel').onclick = () => {
    document.getElementById('confirm-modal').remove();
  };
  
  document.getElementById('modal-confirm').onclick = () => {
    // Remove de TODOS os lugares
    const f = loadData('special_dates_feed') || {};
    const s = loadData('special_dates_story') || {};
    const all = loadData('special_dates_all') || {};
    const custom = loadData('custom_dates') || { feed: {}, story: {} };
    
    delete f[date];
    delete s[date];
    delete all[date];
    delete custom.feed[date];
    delete custom.story[date];
    
    saveData('special_dates_feed', f);
    saveData('special_dates_story', s);
    saveData('special_dates_all', all);
    saveData('custom_dates', custom);
    
    document.getElementById('confirm-modal').remove();
    renderDates();
    showToast(`Campanha "${displayName}" removida!`, 'warning');
  };
}

async function activateDate(date, name, type) {
  const key = type === 'feed' ? 'special_dates_feed' : 'special_dates_story';
  const data = loadData(key) || {};
  const shared = loadData('config_shared') || { pastas: { feed_especiais: "posts_especiais_feed", story_especiais: "posts_especiais" } };
  const allCampaigns = loadData('special_dates_all') || {};

  // Se a campanha já existe no registro geral, usa o nome de lá
  let finalName = allCampaigns[date];
  
  if (!finalName) {
    // Se não existe, cria novo nome (só acontece na primeira ativação)
    finalName = (name || "campanha").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_]/g, "_");
    allCampaigns[date] = finalName;
    saveData('special_dates_all', allCampaigns);
  }
  
  data[date] = finalName;
  saveData(key, data);

  const pastaBase = type === 'feed' ? shared.pastas.feed_especiais : shared.pastas.story_especiais;
  const path = `${pastaBase}/${finalName}`;

  await fetch('/api/create_folder', { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({path: path}) 
  }).catch(e => console.error(e));

  showToast(`${type.toUpperCase()} ativado para ${date}!`, 'success');
  renderDates();
}

function openCustomDateModal() {
  const modal = document.getElementById('custom-date-modal');
  if (modal) modal.style.display = 'flex';
}

function closeCustomDateModal() {
  const modal = document.getElementById('custom-date-modal');
  if (modal) modal.style.display = 'none';
  const nameInput = document.getElementById('custom_name');
  const dayInput = document.getElementById('custom_day');
  const monthInput = document.getElementById('custom_month');
  if (nameInput) nameInput.value = '';
  if (dayInput) dayInput.value = '';
  if (monthInput) monthInput.value = '';
}

function saveCustomDate() {
  const name = document.getElementById('custom_name')?.value.trim();
  const day = parseInt(document.getElementById('custom_day')?.value);
  const month = parseInt(document.getElementById('custom_month')?.value);
  
  if (!name || !day || !month) {
    showToast('Preencha todos os campos!', 'error');
    return;
  }
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    showToast('Dia ou mês inválido!', 'error');
    return;
  }
  
  const dateKey = `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}`;
  const folderName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_]/g, "_");
  
  // Salva no registro GERAL de campanhas
  const allCampaigns = loadData('special_dates_all') || {};
  allCampaigns[dateKey] = folderName;
  saveData('special_dates_all', allCampaigns);
  
  // Salva nas customizadas
  const customDates = loadData('custom_dates') || { feed: {}, story: {} };
  customDates.feed[dateKey] = folderName;
  customDates.story[dateKey] = folderName;
  saveData('custom_dates', customDates);
  
  closeCustomDateModal();
  renderDates();
  showToast(`Data "${name}" criada! Clique em INATIVO para ativar.`, 'success');
}

function deleteCustomDate(dateKey, name) {
  // Remove do registro geral
  const allCampaigns = loadData('special_dates_all') || {};
  delete allCampaigns[dateKey];
  saveData('special_dates_all', allCampaigns);
  
  // Remove das customizadas
  const customDates = loadData('custom_dates') || { feed: {}, story: {} };
  delete customDates.feed[dateKey];
  delete customDates.story[dateKey];
  saveData('custom_dates', customDates);
  
  // Remove das ativações
  const f = loadData('special_dates_feed') || {};
  const s = loadData('special_dates_story') || {};
  if (f[dateKey] === name) delete f[dateKey];
  if (s[dateKey] === name) delete s[dateKey];
  saveData('special_dates_feed', f);
  saveData('special_dates_story', s);
  
  renderDates();
  showToast(`Data "${name}" removida!`, 'warning');
}

function getMonthNum(mes) {
  const meses = { "Janeiro": "01", "Fevereiro": "02", "Março": "03", "Abril": "04", "Maio": "05", "Junho": "06", "Julho": "07", "Agosto": "08", "Setembro": "09", "Outubro": "10", "Novembro": "11", "Dezembro": "12" };
  return meses[mes] || "01";
}

function filterCalendar() {
  const term = document.getElementById('search-date')?.value.toLowerCase() || '';
  document.querySelectorAll('.cal-row').forEach(row => {
    row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
  });
}

// ==================== FALLBACKS ====================
function renderFallbacks() {
  const pi = loadData('prompts_ia') || { legendas_fallback: [] };
  const list = document.getElementById('fallback-list');
  if(!list) return;

  list.innerHTML = '';
  (pi.legendas_fallback || []).forEach((fb, i) => {
    const item = document.createElement('div');
    item.className = 'fallback-item';
    item.innerHTML = `
      <textarea oninput="updateFallback(${i}, this.value)" placeholder="Escreva uma legenda genérica...">${fb || ''}</textarea>
      <button class="btn btn-ghost btn-sm" onclick="removeFallback(${i})">X</button>
    `;
    list.appendChild(item);
  });
}

function addFallback() {
  const pi = loadData('prompts_ia') || { legendas_fallback: [] };
  pi.legendas_fallback.push('');
  saveData('prompts_ia', pi);
  renderFallbacks();
}

function updateFallback(i, val) {
  const pi = loadData('prompts_ia') || { legendas_fallback: [] };
  pi.legendas_fallback[i] = val;
  saveData('prompts_ia', pi);
}

function removeFallback(i) {
  const pi = loadData('prompts_ia') || { legendas_fallback: [] };
  pi.legendas_fallback.splice(i, 1);
  saveData('prompts_ia', pi);
  renderFallbacks();
}

// ==================== MARCA & IA ====================
function renderBrand() {
  const cm = loadData('contexto_marca') || { nome: "", slogan: "", missao: "", produto: "", tom_comunicacao: "" };
  const pi = loadData('prompts_ia') || { system_prompt: "", user_prompt_template: "", legendas_fallback: [] };
  const cf = loadData('config_feed') || {};
  
  const iaParams = cf.legenda_ia || {
      modelo: "gpt-4.1-nano",
      max_tokens: 200,
      temperatura: 0.7,
      tamanho_ideal_min: 125,
      tamanho_ideal_max: 150,
      timeout_segundos: 30
  };

  const content = `
    <div class="page-header">
      <div class="page-title">Marca & IA</div>
      <div class="page-desc">Identidade da marca e templates de prompt para geração de legendas</div>
    </div>
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Contexto da Marca</div></div>
      <div class="panel-body">
        <div class="grid-2">
          <div class="field"><label class="field-label">Nome da Marca</label><input type="text" id="marca_nome" value="${cm.nome || ''}"></div>
          <div class="field"><label class="field-label">Slogan</label><input type="text" id="marca_slogan" value="${cm.slogan || ''}"></div>
        </div>
        <div class="field" style="margin-top:10px"><label class="field-label">Missão</label><textarea id="marca_missao" rows="2">${cm.missao || ''}</textarea></div>
        <div class="grid-2" style="margin-top:10px">
          <div class="field"><label class="field-label">Produto Principal</label><input type="text" id="marca_produto" value="${cm.produto || ''}"></div>
          <div class="field"><label class="field-label">Tom de Comunicação</label><input type="text" id="marca_tom" value="${cm.tom_comunicacao || ''}"></div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Prompts da IA</div></div>
      <div class="panel-body">
        <div class="field"><label class="field-label">System Prompt</label><textarea id="system_prompt" rows="3">${pi.system_prompt || ''}</textarea></div>
        
        <div class="field" style="margin-top:15px">
          <label class="field-label" style="color: var(--text); font-size: 13px;">User Template (Regras de Escrita)</label>
          
          <div style="background: var(--surface2); padding: 12px; border-left: 3px solid var(--accent); margin-bottom: 10px; font-size: 11.5px; color: var(--text2);">
            <strong>Como funciona?</strong> O bot vai trocar as variáveis <code>{}</code> pelos dados reais:<br><br>
            <span style="color: var(--text);"><b>{descricao_visual}</b></span>: O que a IA viu na sua foto.<br>
            <span style="color: var(--text);"><b>{contexto}</b></span>: Tudo do "Contexto da Marca".<br>
            <span style="color: var(--text);"><b>{min_caracteres}</b> e <b>{max_caracteres}</b></span>: Limites de tamanho.
          </div>

          <div class="var-toolbar" style="margin-bottom: 8px;">
            <button class="var-btn" id="btn-var-desc" onclick="insertVar('{descricao_visual}')">{descricao_visual}</button>
            <button class="var-btn" id="btn-var-ctx" onclick="insertVar('{contexto}')">{contexto}</button>
            <button class="var-btn" id="btn-var-min" onclick="insertVar('{min_caracteres}')">{min_caracteres}</button>
            <button class="var-btn" id="btn-var-max" onclick="insertVar('{max_caracteres}')">{max_caracteres}</button>
          </div>
          
          <textarea id="user_prompt_template" rows="12" oninput="validatePromptVars()">${pi.user_prompt_template || ''}</textarea>
        </div>
      </div>
    </div>
    
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">Legendas de Fallback</div>
        <button class="btn btn-secondary btn-sm" onclick="addFallback()">Adicionar</button>
      </div>
      <div class="panel-body">
        <div class="fallback-list" id="fallback-list"></div>
      </div>
    </div>
    
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Parâmetros da IA (Feed)</div></div>
      <div class="panel-body">
        <div class="grid-3">
          <div class="field"><label class="field-label">Modelo</label><input type="text" id="ia_modelo" value="${iaParams.modelo}"></div>
          <div class="field"><label class="field-label">Max Tokens</label><input type="number" id="ia_max_tokens" value="${iaParams.max_tokens}"></div>
          <div class="field"><label class="field-label">Temperatura</label><input type="number" step="0.1" id="ia_temperatura" value="${iaParams.temperatura}"></div>
          <div class="field"><label class="field-label">Tamanho Min (Carac.)</label><input type="number" id="ia_min" value="${iaParams.tamanho_ideal_min}"></div>
          <div class="field"><label class="field-label">Tamanho Max (Carac.)</label><input type="number" id="ia_max" value="${iaParams.tamanho_ideal_max}"></div>
          <div class="field"><label class="field-label">Timeout (seg)</label><input type="number" id="ia_timeout" value="${iaParams.timeout_segundos}"></div>
        </div>
      </div>
    </div>
    
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Hashtags Fixas (Sempre no fim)</div></div>
      <div class="panel-body">
        <div class="field"><textarea id="hashtags_fixas" rows="2">${cf.hashtags_fixas || ''}</textarea></div>
      </div>
    </div>
    
    <div class="save-bar">
      <div class="save-bar-info" id="save-brand-info"><span>Todas as variáveis presentes!</span></div>
      <button class="btn btn-primary" id="btn-save-brand" onclick="saveBrandIA()">Salvar Marca & IA</button>
    </div>
  `;
  document.getElementById('content-area').innerHTML = content;
  renderFallbacks();
  setTimeout(validatePromptVars, 100);
}

function insertVar(variable) {
  const ta = document.getElementById('user_prompt_template');
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  ta.value = ta.value.slice(0, start) + variable + ta.value.slice(end);
  ta.focus();
  validatePromptVars();
}

function validatePromptVars() {
  const text = document.getElementById('user_prompt_template')?.value || '';
  
  const vars = [
    { id: 'btn-var-desc', token: '{descricao_visual}' },
    { id: 'btn-var-ctx', token: '{contexto}' },
    { id: 'btn-var-min', token: '{min_caracteres}' },
    { id: 'btn-var-max', token: '{max_caracteres}' }
  ];
  
  let allValid = true;
  
  vars.forEach(v => {
    const btn = document.getElementById(v.id);
    if (btn) {
      if (!text.includes(v.token)) {
        btn.style.backgroundColor = 'var(--error)';
        btn.style.color = 'white';
        btn.style.borderColor = 'var(--error)';
        allValid = false;
      } else {
        btn.style.backgroundColor = 'var(--surface2)';
        btn.style.color = 'var(--text)';
        btn.style.borderColor = 'var(--border2)';
      }
    }
  });
  
  const saveBtn = document.getElementById('btn-save-brand');
  const saveInfo = document.getElementById('save-brand-info');
  
  if (saveBtn) {
    if (!allValid) {
      saveBtn.disabled = true;
      saveBtn.style.opacity = '0.5';
      saveBtn.style.cursor = 'not-allowed';
      if (saveInfo) saveInfo.innerHTML = '<span style="color:var(--error);">⚠️ Variáveis em VERMELHO estão faltando!</span>';
    } else {
      saveBtn.disabled = false;
      saveBtn.style.opacity = '1';
      saveBtn.style.cursor = 'pointer';
      if (saveInfo) saveInfo.innerHTML = '<span>Tudo certo para salvar! ✓</span>';
    }
  }
}

function saveBrandIA() {
  const cm = loadData('contexto_marca') || {};
  cm.nome = document.getElementById('marca_nome')?.value || '';
  cm.slogan = document.getElementById('marca_slogan')?.value || '';
  cm.missao = document.getElementById('marca_missao')?.value || '';
  cm.produto = document.getElementById('marca_produto')?.value || '';
  cm.tom_comunicacao = document.getElementById('marca_tom')?.value || '';
  saveData('contexto_marca', cm);

  const pi = loadData('prompts_ia') || {};
  pi.system_prompt = document.getElementById('system_prompt')?.value || '';
  pi.user_prompt_template = document.getElementById('user_prompt_template')?.value || '';
  saveData('prompts_ia', pi);

  const cf = loadData('config_feed') || {};
  cf.legenda_ia = cf.legenda_ia || {};
  cf.legenda_ia.modelo = document.getElementById('ia_modelo')?.value || "gpt-4.1-nano";
  cf.legenda_ia.max_tokens = parseInt(document.getElementById('ia_max_tokens')?.value) || 200;
  cf.legenda_ia.temperatura = parseFloat(document.getElementById('ia_temperatura')?.value) || 0.7;
  cf.legenda_ia.tamanho_ideal_min = parseInt(document.getElementById('ia_min')?.value) || 125;
  cf.legenda_ia.tamanho_ideal_max = parseInt(document.getElementById('ia_max')?.value) || 150;
  cf.legenda_ia.timeout_segundos = parseInt(document.getElementById('ia_timeout')?.value) || 30;
  cf.hashtags_fixas = document.getElementById('hashtags_fixas')?.value || '';
  saveData('config_feed', cf);

  showToast('Configurações de Marca e IA salvas!');
}

// ==================== CREDENTIALS ====================
function renderCredentials() {
  const cs = loadData('config_shared') || { credenciais: { username: "", password: "" }, api_keys: { openai: "" } };
  
  const content = `
    <div class="page-header">
      <div class="page-title">Credenciais</div>
      <div class="page-desc">Dados de acesso ao Instagram e chaves de API</div>
    </div>
    
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Conta Instagram</div></div>
      <div class="panel-body">
        <div class="grid-2">
          <div class="field">
            <label class="field-label">Username</label>
            <input type="text" id="cred_username" value="${cs.credenciais?.username || ''}">
          </div>
          <div class="field">
            <label class="field-label">Senha</label>
            <div style="display: flex; gap: 8px;">
              <input type="password" id="cred_password" value="${cs.credenciais?.password || ''}" style="flex:1;">
              <button class="btn btn-secondary btn-sm" onclick="togglePasswordVisibility('cred_password')" type="button" style="padding: 7px 12px;">
                👁️
              </button>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; color: var(--text3);">Gerencia a conexão segura com o perfil.</span>
          <button class="btn btn-secondary" id="btn-test-login" onclick="testInstagramLogin()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Testar Conexão (Login)
          </button>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><div class="panel-title">Chave de Inteligência Artificial</div></div>
      <div class="panel-body">
        <div class="field">
          <label class="field-label">OpenAI API Key</label>
          <div style="display: flex; gap: 8px;">
            <input type="password" id="cred_openai_key" value="${cs.api_keys?.openai || ''}" style="flex:1;">
            <button class="btn btn-secondary btn-sm" onclick="togglePasswordVisibility('cred_openai_key')" type="button" style="padding: 7px 12px;">
              👁️
            </button>
          </div>
        </div>
        <p style="font-size: 10px; color: var(--text3); margin-top: 10px;">Necessária para analisar fotos e criar legendas automáticas.</p>
      </div>
    </div>
    
    <div class="save-bar">
      <div></div>
      <button class="btn btn-primary" onclick="saveCredentials()">Salvar Alterações</button>
    </div>
  `;
  document.getElementById('content-area').innerHTML = content;
}

// FUNÇÃO PARA MOSTRAR/ESCONDER SENHA
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
  } else {
    input.type = 'password';
  }
}

async function testInstagramLogin() {
  const btn = document.getElementById('btn-test-login');
  const user = document.getElementById('cred_username')?.value;
  const pass = document.getElementById('cred_password')?.value;

  if (!user || !pass) {
    showToast('Preencha usuário e senha primeiro!', 'warning');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.innerHTML = '⏳ Verificando Rede e Acesso...';
  }

  try {
    const res = await fetch('/api/test_ig_login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    
    const data = await res.json();
    
    if (data.status === 'success') {
      showToast('✅ Conexão estabelecida com sucesso!', 'success');
	  
      const cs = loadData('config_shared');
      cs.credenciais.username = user;
      cs.credenciais.password = pass;
      saveData('config_shared', cs); 

      // Opcional: Se quiser dar um "refresh" visual nos campos sem sair da página:
      renderCredentials();
      // Pequeno delay para atualizar a memória
    } else {
      // --- TRATAMENTO DE ERRO DE REDE BLOQUEADA (BLACKLIST) ---
      if (data.message && data.message.toLowerCase().includes('blacklist')) {
          const networkAlertHtml = `
            <div id="network-alert-modal" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:15000; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(5px);">
                <div style="background: var(--bg); padding: 40px; border-radius: 24px; width: 450px; text-align: center; border: 2px solid #ff4757; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                    <div style="font-size: 60px; margin-bottom: 20px;">🌐</div>
                    <h2 style="color:var(--text); margin-bottom: 15px;">Internet Bloqueada</h2>
                    <p style="color:var(--text2); font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                        O Instagram bloqueou temporariamente o seu endereço de internet atual para automações.
                        <br><br>
                        <strong>Como resolver agora?</strong>
                        <br>
                        1. No seu celular, ligue o <b>Roteador Wi-Fi (Dados Móveis)</b>.
                        <br>
                        2. Conecte seu computador nesta rede do celular.
                        <br>
                        3. Tente realizar o login novamente.
                    </p>
                    <button onclick="document.getElementById('network-alert-modal').remove()" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 15px; font-size: 14px;">Entendido, vou trocar de rede!</button>
                </div>
            </div>
          `;
          document.body.insertAdjacentHTML('beforeend', networkAlertHtml);
      } else {
          showToast('❌ Erro no login: ' + data.message, 'error');
      }
    }
  } catch (e) {
    showToast('❌ O servidor não respondeu.', 'error');
  }

  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Testar Conexão (Login)`;
  }
}

function saveCredentials() {
  // Pega o estado atual completo (que já tem as URLs e Pastas carregadas do JSON)
  const cs = loadData('config_shared');
  
  // Atualiza apenas os campos que estão visíveis na tela
  cs.credenciais = cs.credenciais || {};
  cs.credenciais.username = document.getElementById('cred_username')?.value || '';
  cs.credenciais.password = document.getElementById('cred_password')?.value || '';
  
  cs.api_keys = cs.api_keys || {};
  cs.api_keys.openai = document.getElementById('cred_openai_key')?.value || '';

  // As partes cs.urls e cs.pastas permanecem intactas no objeto 'cs'
  
  saveData('config_shared', cs);
  showToast('Credenciais atualizadas com sucesso!');
}

// ==================== FEED (SIMPLIFICADO) ====================
function renderFeed() {
  const cf = loadData('config_feed') || { dias_postagem: [], janela_horario: { start: "08:00", end: "08:45" }, max_posts_por_dia: 1, tolerancia_atraso_dias: 0, cooldown_dias: 5, dias_antecipacao_especiais: 5, usar_ia_legenda: true };
  
  const content = `
    <div class="page-header">
      <div class="page-title">Config Feed</div>
      <div class="page-desc">Horários, dias e comportamento do bot de feed</div>
    </div>

    <div class="panel">
      <div class="panel-header"><div class="panel-title">Dias de Postagem</div></div>
      <div class="panel-body">
        <div class="day-checks" id="feed-days">
          ${['segunda','terca','quarta','quinta','sexta','sabado','domingo'].map(d => `
            <div class="day-check">
              <input type="checkbox" id="fd-${d}" value="${d}" ${(cf.dias_postagem || []).includes(d) ? 'checked' : ''}>
              <label for="fd-${d}">${d.slice(0,3)}</label>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><div class="panel-title">Janela de Horário</div></div>
      <div class="panel-body">
        <div class="grid-2">
          <div class="field"><label class="field-label">Início</label><input type="time" id="feed_start" value="${cf.janela_horario?.start || '08:00'}"></div>
          <div class="field"><label class="field-label">Fim</label><input type="time" id="feed_end" value="${cf.janela_horario?.end || '08:45'}"></div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header"><div class="panel-title">Configurações Gerais</div></div>
      <div class="panel-body">
        <div class="grid-2">
          <div class="field"><label class="field-label">Max Posts/Dia</label><input type="number" id="feed_max" value="${cf.max_posts_por_dia || 1}"></div>
          <div class="field"><label class="field-label">Tolerância (dias)</label><input type="number" id="feed_tol" value="${cf.tolerancia_atraso_dias || 0}"></div>
          <div class="field"><label class="field-label">Cooldown (dias)</label><input type="number" id="feed_cool" value="${cf.cooldown_dias || 5}"></div>
          <div class="field"><label class="field-label" style="color:var(--accent);">Campanha Especiais (Dias antes)</label><input type="number" id="feed_ant" value="${cf.dias_antecipacao_especiais || 5}"></div>
        </div>
        <div style="margin-top: 15px"></div>
        <div class="toggle-field">
          <div class="toggle-info">
            <span class="toggle-name">Usar IA para legenda</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="feed_ia" ${cf.usar_ia_legenda ? 'checked' : ''}>
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="save-bar">
      <div></div>
      <button class="btn btn-primary" onclick="saveFeed()">Salvar Config Feed</button>
    </div>
  `;
  document.getElementById('content-area').innerHTML = content;
}

function saveFeed() {
  const cf = loadData('config_feed') || {};
  
  cf.dias_postagem = Array.from(document.querySelectorAll('#feed-days input:checked')).map(i => i.value);
  
  cf.janela_horario = cf.janela_horario || {};
  cf.janela_horario.start = document.getElementById('feed_start')?.value || '08:00';
  cf.janela_horario.end = document.getElementById('feed_end')?.value || '08:45';
  
  cf.max_posts_por_dia = parseInt(document.getElementById('feed_max')?.value) || 1;
  cf.tolerancia_atraso_dias = parseInt(document.getElementById('feed_tol')?.value) || 0;
  cf.cooldown_dias = parseInt(document.getElementById('feed_cool')?.value) || 5;
  cf.dias_antecipacao_especiais = parseInt(document.getElementById('feed_ant')?.value) || 5;
  
  cf.usar_ia_legenda = document.getElementById('feed_ia')?.checked || false;
  
  saveData('config_feed', cf);
  showToast('Config Feed salvo!');
}

// ==================== STORY ====================
function renderStory() {
  const cst = loadData('config_story') || { post_windows: [], cooldown_days: 5, max_posts_per_day: 5, check_interval_seconds: 30, dias_antecipacao_especiais: 5 };
  const content = `
    <div class="page-header">
      <div class="page-title">Config Story</div>
      <div class="page-desc">Janelas de horário e comportamento do bot de stories</div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">Janelas de Postagem</div>
        <button class="btn-icon" onclick="addStoryWindow()">Adicionar</button>
      </div>
      <div class="panel-body">
        <div class="windows-list" id="story-windows"></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header"><div class="panel-title">Configurações Gerais</div></div>
      <div class="panel-body">
        <div class="grid-2">
          <div class="field"><label class="field-label">Cooldown (dias)</label><input type="number" id="story_cool" value="${cst.cooldown_days || 5}"></div>
          <div class="field"><label class="field-label">Max Posts/Dia</label><input type="number" id="story_max" value="${cst.max_posts_per_day || 5}"></div>
          <div class="field"><label class="field-label">Check (seg)</label><input type="number" id="story_check" value="${cst.check_interval_seconds || 30}"></div>
          <div class="field"><label class="field-label" style="color:var(--accent);">Campanha Especiais (Dias antes)</label><input type="number" id="story_ant" value="${cst.dias_antecipacao_especiais || 5}"></div>
        </div>
      </div>
    </div>
    <div class="save-bar">
      <div></div>
      <button class="btn btn-primary" onclick="saveStory()">Salvar Config Story</button>
    </div>
  `;
  document.getElementById('content-area').innerHTML = content;
  renderStoryWindows();
}

function renderStoryWindows() {
  const cst = loadData('config_story') || { post_windows: [] };
  const list = document.getElementById('story-windows');
  if (!list) return;
  list.innerHTML = '';
  (cst.post_windows || []).forEach((w, i) => {
    const item = document.createElement('div');
    item.className = 'window-item';
    item.innerHTML = `
      <input type="time" value="${w.start || '09:00'}" oninput="updateStoryWindow(${i}, 'start', this.value)">
      <span>até</span>
      <input type="time" value="${w.end || '10:00'}" oninput="updateStoryWindow(${i}, 'end', this.value)">
      <button class="btn btn-ghost btn-sm" onclick="removeStoryWindow(${i})">X</button>
    `;
    list.appendChild(item);
  });
}

function addStoryWindow() {
  const cst = loadData('config_story') || { post_windows: [] };
  if (!cst.post_windows) cst.post_windows = [];
  cst.post_windows.push({start: '09:00', end: '10:00'});
  saveData('config_story', cst);
  renderStoryWindows();
}

function updateStoryWindow(i, key, val) {
  const cst = loadData('config_story') || { post_windows: [] };
  if (!cst.post_windows[i]) cst.post_windows[i] = {};
  cst.post_windows[i][key] = val;
  saveData('config_story', cst);
}

function removeStoryWindow(i) {
  const cst = loadData('config_story') || { post_windows: [] };
  cst.post_windows.splice(i, 1);
  saveData('config_story', cst);
  renderStoryWindows();
}

function saveStory() {
  const cst = loadData('config_story') || {};
  cst.cooldown_days = parseInt(document.getElementById('story_cool')?.value) || 5;
  cst.max_posts_per_day = parseInt(document.getElementById('story_max')?.value) || 5;
  cst.check_interval_seconds = parseInt(document.getElementById('story_check')?.value) || 30;
  cst.dias_antecipacao_especiais = parseInt(document.getElementById('story_ant')?.value) || 5;
  saveData('config_story', cst);
  showToast('Config Story salvo!');
}