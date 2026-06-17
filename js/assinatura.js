// js/assinatura.js
let precoVendaAtual = 0;
let paymentIdAtual = null;
let diasSelecionados = 30;
let timerPix = null;
let autoCheckPix = null;
let expirationInterval = null;
let pagamentoConfirmado = false;

// --- SISTEMA DO MODAL DE CARREGAMENTO ---
let loadingInterval = null;

function showLoadingModal() {
    const modalHtml = `
        <div id="license-loader-overlay" style="position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(3px);">
            <div style="background: var(--bg); padding: 30px; border-radius: 16px; width: 320px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="font-size: 35px; margin-bottom: 10px;">🔐</div>
                <h3 style="margin:0 0 5px 0; color: var(--text);">Acessando Servidor</h3>
                <p style="font-size: 11px; color: var(--text3); margin-bottom: 20px;">Sincronizando licença e atualizando valores...</p>
                <div style="width: 100%; background: var(--surface2); border-radius: 10px; height: 8px; overflow: hidden; position: relative;">
                    <div id="license-progress-bar" style="width: 0%; height: 100%; background: var(--accent); transition: width 0.2s ease-out;"></div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    let progress = 0;
    loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 85) progress = 85;
        const bar = document.getElementById('license-progress-bar');
        if (bar) bar.style.width = progress + '%';
    }, 200);
}

function hideLoadingModal() {
    clearInterval(loadingInterval);
    const bar = document.getElementById('license-progress-bar');
    if (bar) bar.style.width = '100%';
    
    setTimeout(() => {
        const modal = document.getElementById('license-loader-overlay');
        if (modal) modal.remove();
    }, 400);
}

// ----------------------------------------

async function renderAssinatura() {
  showLoadingModal();

  let licenca = null;
  let sucesso = false;

  for(let i = 0; i < 3; i++) {
      try {
          const [res] = await Promise.all([
              fetch('/api/licenca'),
              new Promise(resolve => setTimeout(resolve, 1500))
          ]);
          
          if (res.ok) {
              licenca = await res.json();
              precoVendaAtual = licenca.preco_venda_atual || 3.59;
              sucesso = true;
              break;
          }
      } catch (error) {
          console.log(`Aguardando servidor... (Tentativa ${i+1})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
      }
  }

  if (!sucesso || !licenca) {
      showToast("Aviso: Servidor lento. Trabalhando offline.", "warning");
      licenca = { violado: false, data_expiracao: new Date(Date.now() + 86400000).toISOString() }; 
      precoVendaAtual = 3.59;
  }

  let content = `
    <div class="page-header">
      <div class="page-title">💎 Central de Licenciamento</div>
      <div class="page-desc">Gerencie sua assinatura e integridade do software</div>
    </div>

    <div class="panel" id="licenca-status" style="background: linear-gradient(135deg, var(--surface2) 0%, var(--surface3) 100%); border: none;">
      <div class="panel-body" id="status-content" style="padding: 20px;"></div>
    </div>
  `;

  if (licenca.violado) {
    content += `
      <div class="panel" style="border: 2px solid var(--error); background: #fff5f5;">
        <div class="panel-body" style="text-align: center; padding: 40px;">
          <div style="font-size: 50px; margin-bottom: 15px;">🔧</div>
          <h2 style="color: var(--error); margin-bottom: 10px;">Manutenção Necessária</h2>
          <p style="color: var(--text2); max-width: 400px; margin: 0 auto 25px auto;">
            Detectamos uma falha crítica na integridade dos seus arquivos. 
            Para restaurar o sistema e voltar a postar, é necessário uma recalibração digital.
          </p>
          <button class="btn btn-primary" onclick="solicitarTecnico()" style="background: var(--error); padding: 15px 30px; font-size: 14px;">
             Solicitar Técnico Digital (R$ 100,00)
          </button>
        </div>
      </div>
    `;
  } else {
    content += `
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">💰 Planos Disponíveis</div>
          <span style="font-size: 11px; color: var(--text3);">Valor atual: R$ ${precoVendaAtual.toFixed(2)}/dia</span>
        </div>
        <div class="panel-body">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 20px;">
            ${[7, 15, 30, 90, 365].map(d => `
              <div class="plano-card" onclick="setDias(${d})" style="cursor:pointer; border: 1px solid var(--border); border-radius: 12px; padding: 16px; text-align: center; background: var(--bg); transition: all 0.2s;">
                <div style="font-size: 24px; font-weight: 700; color: var(--accent);">${d}d</div>
                <div style="font-size: 16px; font-weight: 600;">R$ ${(d * precoVendaAtual).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap; padding-top: 15px; border-top: 1px solid var(--border);">
            <span style="font-size: 12px; font-weight: 600;">📅 Personalizar:</span>
            <input type="number" id="custom-dias" placeholder="Qtd Dias" min="1" max="999" step="1" style="width: 100px; text-align: center;">
            <button class="btn btn-secondary" onclick="customDias()">Gerar PIX</button>
          </div>
        </div>
      </div>
    `;
  }

  // MODAL SIMPLIFICADO E BONITO
  content += `
    <div id="pix-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:10000; align-items:center; justify-content:center;">
      <div class="pix-modal-card">
        
        <!-- Cabeçalho -->
        <div class="pix-modal-header">
          <h2 id="pix-title">Adicionando dias ao LocalInsta</h2>
        </div>

        <!-- Instrução -->
        <div class="pix-instruction">
          Escaneie o QR Code com o app do seu banco ou copie o código
        </div>

        <!-- QR Code Card -->
        <div class="pix-qr-card">
          <div id="qr-code-area" class="qr-code-container"></div>
        </div>

        <!-- Valor -->
        <div class="pix-amount">
          <span id="pix-valor">R$ 0,00</span>
        </div>

        <!-- Área de copiar código -->
        <div class="pix-copy-area">
          <div class="pix-copy-header">
            <span>📋</span> Código PIX
          </div>
          <div class="pix-copy-row">
            <div id="pix-text" class="pix-code-text">Clique para copiar</div>
            <button class="pix-copy-btn" onclick="copyPix()">Copiar</button>
          </div>
        </div>

        <!-- Botões de ação (lado a lado) -->
        <div class="pix-buttons-row">
          <button id="btn-confirmar" class="pix-btn pix-btn-primary" onclick="confirmarPagamento(false)">✅ Já paguei</button>
          <button class="pix-btn pix-btn-secondary" onclick="fecharPixModal()">✖ Cancelar</button>
        </div>

        <!-- Timer oculto (apenas lógica) -->
        <div id="pix-timer" style="display:none;">10:00</div>
      </div>
    </div>
  `;

  document.getElementById('content-area').innerHTML = content;
  carregarStatusLicenca(licenca);
  
  hideLoadingModal();
}

async function solicitarTecnico() {
    showToast('Iniciando chamado técnico...', 'warning');
    const res = await fetch('/api/gerar_pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'reparo' })
    });
    const data = await res.json();
    if (data.success) {
        paymentIdAtual = data.payment_id;
        
        document.getElementById('pix-title').innerHTML = `Manutenção Digital`;
        document.getElementById('pix-valor').innerHTML = `R$ 100,00`;
        document.getElementById('qr-code-area').innerHTML = `<img src="data:image/png;base64,${data.qr_code}" style="width:180px; height:180px;">`;
        document.getElementById('pix-text').innerText = data.qr_code_text;
        document.getElementById('pix-text').setAttribute('data-code', data.qr_code_text);
        document.getElementById('pix-modal').style.display = 'flex';
        
        startPixFlow(true);
    }
}

async function confirmarPagamento(isRepair = false) {
  if (!paymentIdAtual) {
    showToast('Nenhum pagamento pendente.', 'error');
    return;
  }
  
  if (pagamentoConfirmado) return;
  pagamentoConfirmado = true;

  const confirmBtn = document.getElementById('btn-confirmar');
  if (confirmBtn) confirmBtn.disabled = true;
  
  const res = await fetch(`/api/verificar_pagamento/${paymentIdAtual}`);
  const data = await res.json();
  
  if (data.success) {
    clearInterval(timerPix);
    clearInterval(autoCheckPix);
    
    showToast('✅ Pagamento confirmado! Assinatura atualizada.', 'success');
    
    setTimeout(() => {
      if (isRepair) {
        exibirTelaManutencao();
      } else {
        fecharPixModal();
        setTimeout(() => renderAssinatura(), 1500);
      }
      pagamentoConfirmado = false;
    }, 1500);
  } else {
    // Apenas reabilita o botão
    setTimeout(() => {
      if (confirmBtn) confirmBtn.disabled = false;
      pagamentoConfirmado = false;
    }, 2000);
  }
}

function exibirTelaManutencao() {
    const container = document.querySelector('.pix-modal-card');
    if (container) {
        container.innerHTML = `
            <div style="padding: 30px; text-align: center;">
                <div class="loader-manutencao"></div>
                <h3 style="margin-top: 20px;">Reparando Sistema...</h3>
                <p style="color: var(--text2); font-size: 13px;">Não feche sua tela. Estamos reconstruindo as chaves de segurança.</p>
                <div style="background: var(--surface2); height: 8px; border-radius: 10px; margin-top: 20px; overflow: hidden;">
                    <div id="progress-bar" style="background: var(--accent); height: 100%; width: 0%; transition: width 0.5s;"></div>
                </div>
                <p id="progress-text" style="font-size: 10px; margin-top: 10px;">Processando 0%</p>
            </div>
        `;
        let progresso = 0;
        const interval = setInterval(() => {
            progresso += 5;
            const bar = document.getElementById('progress-bar');
            const text = document.getElementById('progress-text');
            if (bar) bar.style.width = progresso + "%";
            if (text) text.innerText = `Processando ${progresso}%`;
            if (progresso >= 100) {
                clearInterval(interval);
                showToast('✅ Sistema Restaurado!', 'success');
                fecharPixModal();
                renderAssinatura();
            }
        }, 1000);
    }
}

function setDias(dias) { 
    diasSelecionados = dias; 
    gerarPix(); 
}

function customDias() {
    const d = parseInt(document.getElementById('custom-dias').value);
    if (!d || d < 1 || isNaN(d)) {
        showToast('Insira uma quantidade de dias válida (número inteiro)', 'warning');
        return;
    }
    diasSelecionados = d;
    gerarPix();
}

async function gerarPix() {
  showToast('Gerando PIX...', 'warning');
  const res = await fetch('/api/gerar_pix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dias: diasSelecionados, tipo: 'assinatura' })
  });
  const data = await res.json();
  
  if (data.success) {
    paymentIdAtual = data.payment_id;
    const valorFormatado = data.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    document.getElementById('pix-title').innerHTML = `Adicionando +${diasSelecionados} dias ao LocalInsta`;
    document.getElementById('pix-valor').innerHTML = `R$ ${valorFormatado}`;
    document.getElementById('qr-code-area').innerHTML = `<img src="data:image/png;base64,${data.qr_code}" style="width:180px; height:180px;">`;
    document.getElementById('pix-text').innerText = data.qr_code_text;
    document.getElementById('pix-text').setAttribute('data-code', data.qr_code_text);
    document.getElementById('pix-modal').style.display = 'flex';
    
    startPixFlow(false);
  } else {
    showToast('Erro ao gerar PIX', 'error');
  }
}

function startPixFlow(isRepair = false) {
  let segundos = 600;
  const timerDisplay = document.getElementById('pix-timer');
  
  clearInterval(timerPix);
  clearInterval(autoCheckPix);
  pagamentoConfirmado = false;

  timerPix = setInterval(() => {
    segundos--;
    if (segundos <= 0) {
      fecharPixModal();
      showToast('O tempo do PIX expirou.', 'error');
      return;
    }
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    if (timerDisplay) timerDisplay.innerText = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }, 1000);

  autoCheckPix = setInterval(() => {
    if (document.getElementById('pix-modal').style.display === 'flex') {
        confirmarPagamento(isRepair);
    }
  }, 8000);
}

function fecharPixModal() {
  clearInterval(timerPix);
  clearInterval(autoCheckPix);
  clearInterval(expirationInterval);
  const modal = document.getElementById('pix-modal');
  if (modal) modal.style.display = 'none';
  paymentIdAtual = null;
  pagamentoConfirmado = false;
}

function copyPix() {
  const codeElement = document.getElementById('pix-text');
  const code = codeElement.getAttribute('data-code') || codeElement.innerText;
  navigator.clipboard.writeText(code);
  showToast('✅ Código PIX copiado!', 'success');
}

function carregarStatusLicenca(licenca) {
    const statusContent = document.getElementById('status-content');
    if (!statusContent) return;

    if (licenca.violado) {
        statusContent.innerHTML = `
            <div style="text-align:center; width:100%; padding: 10px; background: rgba(211, 47, 47, 0.1); border: 2px dashed var(--error); border-radius: 12px;">
                <div style="font-size: 40px; margin-bottom: 5px;">⚠️</div>
                <div style="font-size: 18px; font-weight: 800; color: var(--error);">SISTEMA VIOLADO</div>
                <div style="font-size: 12px; color: var(--text); font-weight: 600; margin-top: 5px;">
                    Integridade dos arquivos corrompida.
                </div>
                <div style="font-size: 11px; color: var(--text2); margin-top: 2px;">
                    Por segurança, todas as funções foram travadas. <br> 
                    <strong>Contate o suporte técnico imediatamente.</strong>
                </div>
            </div>`;
        return;
    }

    const targetDate = new Date(licenca.data_expiracao);
    clearInterval(expirationInterval);

    const updateUI = () => {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            statusContent.innerHTML = `
                <div style="text-align:center; width:100%;">
                    <div style="font-size: 10px; color: var(--text3);">STATUS DA LICENÇA</div>
                    <div style="font-size: 32px; font-weight: 800; color: var(--error);">EXPIRADA</div>
                </div>`;
            clearInterval(expirationInterval);
            return;
        }

        let totalSeconds = Math.floor(diff / 1000);
        let totalMinutes = Math.floor(totalSeconds / 60);
        let totalHours = Math.floor(totalMinutes / 60);
        let totalDays = Math.floor(totalHours / 24);

        let displayPrincipal = "";
        let displaySecundario = "";
        let clockColor = "var(--success)";

        if (totalDays >= 365) {
            const anos = Math.floor(totalDays / 365);
            const meses = Math.floor((totalDays % 365) / 30);
            displayPrincipal = `${anos} ${anos > 1 ? 'Anos' : 'Ano'}`;
            displaySecundario = meses > 0 ? `e ${meses} ${meses > 1 ? 'meses' : 'mês'}` : "de acesso garantido";
        } 
        else if (totalDays >= 31) {
            const meses = Math.floor(totalDays / 30);
            const dias = totalDays % 30;
            displayPrincipal = `${meses} ${meses > 1 ? 'Meses' : 'Mês'}`;
            displaySecundario = dias > 0 ? `e ${dias} ${dias > 1 ? 'dias' : 'dia'}` : "de acesso garantido";
        } 
        else {
            const h = Math.floor(totalHours % 24);
            const m = Math.floor(totalMinutes % 60);
            const s = Math.floor(totalSeconds % 60);
            
            const relogio = `<span style="font-family:monospace;">${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}</span>`;
            
            if (totalDays > 0) {
                displayPrincipal = `${totalDays}d ${relogio}`;
            } else {
                displayPrincipal = relogio;
                clockColor = "var(--error)";
            }
            displaySecundario = "Tempo restante de licença";
        }

        if (totalDays < 3) clockColor = "var(--warning)";
        if (totalDays < 1) clockColor = "var(--error)";

        statusContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; text-align: center; width: 100%;">
                <div style="flex: 1.5; border-right: 1px solid rgba(0,0,0,0.05); padding-right: 10px;">
                    <div style="font-size: 10px; color: var(--text3); text-transform: uppercase;">Acesso Disponível</div>
                    <div style="font-size: 32px; font-weight: 800; color: ${clockColor}; line-height: 1;">
                        ${displayPrincipal}
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--text2); margin-top: 4px;">
                        ${displaySecundario}
                    </div>
                </div>
                <div style="flex: 1; padding-left: 10px;">
                    <div style="font-size: 10px; color: var(--text3); text-transform: uppercase;">Vencimento</div>
                    <div style="font-size: 16px; font-weight: 700; color: var(--text);">
                        ${targetDate.toLocaleDateString('pt-BR')}
                    </div>
                    <div style="font-size: 11px; color: var(--text3);">às ${targetDate.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>
                    <div style="margin-top: 5px; font-size: 9px; background: ${clockColor}22; color: ${clockColor}; display: inline-block; padding: 2px 8px; border-radius: 10px; font-weight: 700;">
                        PRO ACTIVATED
                    </div>
                </div>
            </div>
        `;
    };

    updateUI();
    expirationInterval = setInterval(updateUI, 1000);
}