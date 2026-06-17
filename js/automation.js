// js/automation.js

async function renderAutomation() {
  const res = await fetch('/api/bot/status');
  const status = await res.json();
  const resLic = await fetch('/api/licenca');
  const lic = await resLic.json();
  
  const data = loadData('automation');
  data.active = status.active;

  // --- CÁLCULOS PARA O DASHBOARD ---
  const allImages = loadData('all_images') || [];
  const feedHistory = loadData('post_history_feed') || {};
  const storyHistory = loadData('post_history_story') || {};
  const configFeed = loadData('config_feed') || {};
  const shared = loadData('config_shared') || {};

  const totalPostados = Object.keys(feedHistory).length + Object.keys(storyHistory).length;
  const economia = totalPostados * 35;
  
  // Validações
  const hasInsta = shared.credenciais?.password !== "";
  const hasOpenAI = shared.api_keys?.openai !== "";
  const hasImages = allImages.length > 0;

  // --- CORREÇÃO: Tratamento da data da última postagem ---
  const lastTs = Math.max(...Object.values(feedHistory), ...Object.values(storyHistory), 0);
  let textoDataCima = "Nenhuma";
  let textoDataBaixo = "postagem ainda";
  
  if (lastTs > 0) {
      const d = new Date(lastTs * 1000);
      textoDataCima = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      textoDataBaixo = `às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Próximo horário (simplificado - pega a próxima janela)
  const proximaJanela = configFeed.janela_horario?.start || '08:00';
  
  // Buscar logs REAIS do bot
  let logsReais = [];
  try {
    const resLogs = await fetch('/api/bot/logs');
    logsReais = await resLogs.json();
  } catch (e) {
    console.log("Erro ao buscar logs:", e);
  }
  
  let logsHtml = '';
  
  if (logsReais.length > 0) {
    // Mostra os logs reais do bot
    logsHtml = logsReais.map(log => {
      let colorClass = 'info';
      if (log.type === 'success') colorClass = 'success';
      if (log.type === 'warning') colorClass = 'warning';
      if (log.type === 'error') colorClass = 'error';
      return `
      <div class="console-line">
        <span class="time">[${log.time}]</span>
        <span class="${colorClass}">${log.text}</span>
      </div>`;
    }).join('');
  } else {
    // Fallback: mostra logs simulados se não tiver logs reais
    const horaAtual = new Date().toLocaleTimeString();
    logsHtml = `
      <div class="console-line">
        <span class="time">[${horaAtual}]</span>
        <span class="info">Aguardando atividade do bot...</span>
      </div>
      <div class="console-line">
        <span class="time">[${horaAtual}]</span>
        <span class="info">Próxima janela: ${proximaJanela}</span>
      </div>
      ${data.active ? 
        `<div class="console-line"><span class="time">[${horaAtual}]</span><span class="success">Motor ativo - aguardando horário</span></div>` : 
        `<div class="console-line"><span class="time">[${horaAtual}]</span><span class="warning">Automação pausada pelo usuário</span></div>`
      }
    `;
  }

  const content = `
    <div class="dashboard-container">
      
      <!-- HEADER -->
      <div class="dashboard-header">
        <div class="status-badge">
          <span class="status-dot-large ${data.active ? 'active' : 'inactive'}"></span>
          <span>${data.active ? 'Sistema operacional' : 'Sistema em espera'}</span>
        </div>
        <h1>${data.active ? '🟢 Seu Instagram está sendo cuidado' : '⚪ Automação Pausada'}</h1>
        <p>${data.active ? 'O robô está monitorando seus horários e estoque de imagens' : 'Ative o sistema para começar a postar automaticamente'}</p>
      </div>

      <!-- MÉTRICAS COM IDs PARA ATUALIZAÇÃO AUTOMÁTICA -->
      <div class="metrics-modern">
        <div class="metric-card-modern">
          <div class="metric-icon">🖼️</div>
          <div class="metric-value-modern" id="metric-imgs">${allImages.length}</div>
          <div class="metric-label-modern">Mídias na Galeria</div>
          <div class="metric-sub" id="metric-imgs-sub">${allImages.filter(i => i.type?.includes('feed')).length} Feed | ${allImages.filter(i => i.type?.includes('story')).length} Story</div>
        </div>
        
        <div class="metric-card-modern">
          <div class="metric-icon">⏱️</div>
          <div class="metric-value-modern" id="metric-last-top" style="font-size: 20px;">${textoDataCima}</div>
          <div class="metric-label-modern">Última Postagem</div>
          <div class="metric-sub" id="metric-last-bot">${textoDataBaixo}</div>
        </div>
        
        <div class="metric-card-modern">
          <div class="metric-icon">🤖</div>
          <div class="metric-value-modern" id="metric-legends">${Object.keys(feedHistory).length}</div>
          <div class="metric-label-modern">Legendas Criadas</div>
          <div class="metric-sub">pelo seu assistente IA</div>
        </div>
        
        <div class="metric-card-modern" style="border-left: 3px solid var(--accent);">
          <div class="metric-icon">📅</div>
          <div class="metric-value-modern" style="font-size: 20px; color: var(--accent);">${proximaJanela}</div>
          <div class="metric-label-modern">Próximo Feed</div>
          <div class="metric-sub">${configFeed.dias_postagem?.length ? `Dias: ${configFeed.dias_postagem.map(d => d.slice(0,3)).join(', ')}` : 'Configure os dias'}</div>
        </div>
      </div>

      <!-- COLUNAS -->
      <div class="dashboard-two-columns">
        
        <!-- COLUNA ESQUERDA - CONSOLE -->
        <div class="console-modern">
          <div class="console-header">
            <div class="console-dots">
              <span class="console-dot red"></span>
              <span class="console-dot yellow"></span>
              <span class="console-dot green"></span>
            </div>
            <span class="console-title">terminal://activity.log</span>
          </div>
          <div class="console-content" id="bot-console">
            ${logsHtml}
          </div>
        </div>

        <!-- COLUNA DIREITA - STATUS E AÇÕES -->
        <div>
          
          <!-- Status do Sistema -->
          <div class="status-card">
            <div class="status-card-header">
              <span>📊</span> Status do Sistema
            </div>
            <div class="status-card-body">
              <div class="status-list">
                <div class="status-item">
                  <span class="status-item-label">${hasInsta ? '✅' : '❌'} Instagram</span>
                  <span class="status-item-value ${hasInsta ? 'status-badge-success' : 'status-badge-warning'}">
                    ${hasInsta ? 'Conectado' : 'Não configurado'}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-item-label">${hasOpenAI ? '✅' : '⚠️'} OpenAI</span>
                  <span class="status-item-value ${hasOpenAI ? 'status-badge-success' : 'status-badge-warning'}">
                    ${hasOpenAI ? 'Ativa' : 'Chave ausente'}
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-item-label">${hasImages ? '✅' : '❌'} Galeria</span>
                  <span class="status-item-value ${hasImages ? 'status-badge-success' : 'status-badge-warning'}">
                    <span id="metric-imgs-status">${allImages.length}</span> imagens
                  </span>
                </div>
                <div class="status-item">
                  <span class="status-item-label">⭐ Licença</span>
                  <span class="status-item-value ${lic.dias_restantes > 7 ? 'status-badge-success' : 'status-badge-warning'}">
                    ${lic.dias_restantes} dias restantes
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Economia -->
          <div class="economy-premium">
            <div class="label">💰 Economia Estimada</div>
            <div class="value" id="metric-economy">R$ ${economia.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            <div class="footnote">Comparado à gestão manual</div>
          </div>

          <!-- Botões de Ação -->
          <button class="btn-modern ${data.active ? 'btn-modern-secondary' : 'btn-modern-primary'}" onclick="toggleAutomation()">
            ${data.active ? '⏸ Pausar Automação' : '🚀 Iniciar Automação'}
          </button>
          
          <button class="btn-modern btn-modern-ghost" onclick="toggleBoot()" style="margin-top: 12px;">
            ${data.start_on_boot ? '✅ Inicia com o Computador' : '🪟 Iniciar com o Computador?'}
          </button>

        </div>
      </div>
    </div>
  `;
  
  document.getElementById('content-area').innerHTML = content;
  
  ativarRadarDeLogs();
}

async function toggleAutomation() {
  const resLic = await fetch('/api/licenca');
  const lic = await resLic.json();
  if (lic.violado || lic.dias_restantes <= 0) {
      showToast('❌ Verifique sua licença antes de continuar.', 'error');
      showTab('assinatura');
      return; 
  }

  const data = loadData('automation');
  const targetState = !data.active;
  
  if (targetState) {
    const resToggle = await fetch('/api/bot/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: true })
    });

    const result = await resToggle.json();

    if (!resToggle.ok) {
        const alertHtml = `
            <div id="setup-alert-modal" style="position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:11000; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px);">
                <div style="background: var(--bg); padding: 35px; border-radius: 20px; width: 400px; text-align: center; border: 2px solid var(--warning);">
                    <div style="font-size: 50px; margin-bottom: 15px;">🚧</div>
                    <h3 style="color:var(--text); margin-bottom: 10px;">Configuração Incompleta</h3>
                    <p style="color:var(--text2); font-size: 14px; line-height: 1.5; margin-bottom: 25px;">${result.message}</p>
                    <button onclick="document.getElementById('setup-alert-modal').remove()" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px;">Entendido, vou arrumar!</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', alertHtml);
        return; 
    }
  } else {
      await fetch('/api/bot/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: false }) });
  }

  const modalHtml = `
    <div id="bot-loader-overlay" style="position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(3px);">
        <div style="background: var(--bg); padding: 30px; border-radius: 16px; width: 320px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div class="loader-manutencao" style="margin-bottom: 20px;"></div>
            <h3 style="margin:0 0 5px 0; color: var(--text);">Processando...</h3>
            <p style="font-size: 11px; color: var(--text3); margin-bottom: 0;">Sincronizando com o motor do sistema.</p>
        </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  let tentativas = 0;
  const checkInterval = setInterval(async () => {
      tentativas++;
      const resStatus = await fetch('/api/bot/status');
      const status = await resStatus.json();

      if (status.active === targetState || tentativas > 8) {
          clearInterval(checkInterval);
          document.getElementById('bot-loader-overlay')?.remove();
          if (status.active === targetState) {
              showToast(targetState ? '✅ Bot Rodando!' : '🛑 Bot Parado!');
              data.active = targetState;
              saveData('automation', data);
              renderAutomation();
          } else {
              showToast('❌ O motor não respondeu.', 'error');
          }
      }
  }, 1000);
}

// ==========================================
// SISTEMA DE RADAR DO TERMINAL (AUTO-REFRESH)
// ==========================================
let logRadarInterval = null;

function ativarRadarDeLogs() {
    if (logRadarInterval) clearInterval(logRadarInterval);

    logRadarInterval = setInterval(async () => {
        const consoleDiv = document.getElementById('bot-console');
        
        if (!consoleDiv) {
            clearInterval(logRadarInterval);
            return;
        }

        try {
            const resLogs = await fetch('/api/bot/logs');
            const logsReais = await resLogs.json();

            if (logsReais.length > 0) {
                const logsHtml = logsReais.map(log => {
                    let colorClass = 'info'; 
                    if (log.type === 'success') colorClass = 'success'; 
                    if (log.type === 'warning') colorClass = 'warning'; 
                    if (log.type === 'error') colorClass = 'error'; 
                    
                    return `
                      <div class="console-line">
                        <span class="time">[${log.time}]</span>
                        <span class="${colorClass}">${log.text}</span>
                      </div>
                    `;
                }).join('');

                if (consoleDiv.innerHTML.trim() !== logsHtml.trim()) {
                    consoleDiv.innerHTML = logsHtml;
                    consoleDiv.scrollTop = consoleDiv.scrollHeight; 
                }
            }
        } catch (e) {}
    }, 1000);
}

// ==========================================
// ATUALIZADOR SILENCIOSO DAS MÉTRICAS (ECONOMIA)
// ==========================================
setInterval(async () => {
    const activeTab = document.querySelector('.nav-item.active')?.innerText;
    if(activeTab && activeTab.includes('Automação')) {
        const data = loadData('automation');
        
        // 1. Verifica se o bot encerrou por algum erro
        if(data.active) {
            try {
                const res = await fetch('/api/bot/status');
                const status = await res.json();
                if(!status.active && data.active) {
                    data.active = false;
                    saveData('automation', data);
                    renderAutomation();
                    showToast('O robô encerrou (Licença ou Erro)', 'error');
                }
            } catch(e){}
        }

        // 2. Atualiza os valores na tela se estiver no Dashboard
        if (document.getElementById('metric-economy')) {
            try {
                const [resFeed, resStory, resImg] = await Promise.all([
                    fetch('/api/data/post_history_feed'),
                    fetch('/api/data/post_history_story'),
                    fetch('/api/all_images')
                ]);

                const feedHist = await resFeed.json();
                const storyHist = await resStory.json();
                const allImg = await resImg.json();

                // Sincroniza cache local
                window.GlobalState['post_history_feed'] = feedHist;
                window.GlobalState['post_history_story'] = storyHist;
                window.GlobalState['all_images'] = allImg;

                // Cálculos
                const feedCount = Object.keys(feedHist).length;
                const storyCount = Object.keys(storyHist).length;
                const total = feedCount + storyCount;
                const economiaVal = total * 35;
                const lastTs = Math.max(...Object.values(feedHist), ...Object.values(storyHist), 0);

                // Aplica ao HTML suavemente
                document.getElementById('metric-imgs').innerText = allImg.length;
                document.getElementById('metric-imgs-status').innerText = allImg.length;
                document.getElementById('metric-imgs-sub').innerText = `${allImg.filter(i => i.type?.includes('feed')).length} Feed | ${allImg.filter(i => i.type?.includes('story')).length} Story`;
                
                document.getElementById('metric-legends').innerText = feedCount;
                document.getElementById('metric-economy').innerText = `R$ ${economiaVal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

                if (lastTs > 0) {
                    const d = new Date(lastTs * 1000);
                    document.getElementById('metric-last-top').innerText = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    document.getElementById('metric-last-bot').innerText = `às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
                }
            } catch (e) {}
        }
    }
}, 5000); // Atualiza os números a cada 5 segundos

async function toggleBoot() {
  const data = loadData('automation');
  data.start_on_boot = !data.start_on_boot;
  saveData('automation', data);
  await fetch('/api/bot/startup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active: data.start_on_boot })
  });
  renderAutomation();
}