const DEFAULTS = {
  contexto_marca: {
    nome: "Atelie Schulze",
    missao: "Transformamos saudade em arte, memorias em objetos que aquecem o coracao todos os dias.",
    produto: "Canecas que guardam historias exclusivas feitas a mao",
    slogan: "Do seu coracao as nossas maos.",
    tom_comunicacao: "Acolhedor, emocionante, artesanal, familiar"
  },
  prompts_ia: {
    system_prompt: "Voce escreve legendas curtas e impactantes para Instagram. Maximo 150 caracteres. Frases diretas. Um emoji por linha. NUNCA use hashtags.",
    user_prompt_template: "Voce e o redator do Atelie Schulze, uma marca de canecas artesanais personalizadas.\n\nDESCRICAO DA IMAGEM: {descricao_visual}\n\nCONTEXTO DA MARCA: {contexto}\n\nCrie uma legenda para o Instagram seguindo estas regras OBRIGATORIAS:\n\n1. **TAMANHO IDEAL**: Entre {min_caracteres} e {max_caracteres} CARACTERES (total, incluindo emojis e espacos)\n2. **ESTRUTURA**:\n   - Comece com um emoji + GANCHO FORTE\n   - Frase sobre o processo artesanal\n   - Frase sobre a historia unica\n   - Termine com CTA claro\n3. **FORMATO**: Maximo 3 linhas, com quebras de linha\n4. **TOM**: Acolhedor, familiar, emotivo, mas CONCISO\n5. **PROIBIDO**: Hashtags, reticencias, adjetivos excessivos\n\nEXEMPLO:\n⭐ Quer comecar o dia com quem voce ama?\nCada traco e feito a mao, com calma e carinho.\n👉 Chama no Direct!",
    legendas_fallback: [
      "✨ Comece o dia com quem voce ama.\nCada traco e feito a mao, com calma.\n👉 Chama no Direct!",
      "🎨 Arte que aquece o coracao.\nDesenhada a mao, so para voce.\n📦 Link na Bio!",
      "💖 Transformamos saudade em arte.\nSo o que cabe no seu coracao.\n👉 Manda uma DM!"
    ]
  },
  config_shared: {
    credenciais: { username: "atelie_schulze", password: "" },
    api_keys: { openai: "" },
    urls: {
      openai: "https://api.openai.com/v1/chat/completions",
      secretaria_midia: "http://localhost:6969/enviar_midia",
      secretaria_texto: "http://localhost:6969/enviar"
    },
    pastas: {
      feed_base: "Feed Instagram",
      feed_especiais: "posts_especiais_feed",
      story_base: "Story Instagram",
      story_especiais: "posts_especiais"
    }
  },
  config_feed: {
    dias_postagem: ["segunda","terca","quarta","quinta","sexta","sabado","domingo"],
    janela_horario: { start: "08:00", end: "08:45" },
    max_posts_por_dia: 1,
    tolerancia_atraso_dias: 0,
    cooldown_dias: 5,
    usar_ia_legenda: true,
    hashtags_fixas: "#AtelieSchulze #CanecasPersonalizadas #FeitoAMao #ArteExclusiva #PresenteComSignificado #MemoriasAfetivas",
    facebook_integration: { enabled: true, script_path: "facebook_feed.js", timeout_seconds: 900 },
    legenda_ia: {
      modelo: "gpt-4.1-nano",
      max_tokens: 200,
      temperatura: 0.7,
      tamanho_ideal_min: 125,
      tamanho_ideal_max: 150,
      timeout_segundos: 30
    },
    enviar_para_secretaria: true
  },
  config_story: {
    post_windows: [
      { start: "07:00", end: "08:00" },
      { start: "12:00", end: "13:00" },
      { start: "15:00", end: "16:00" },
      { start: "18:00", end: "19:00" },
      { start: "21:00", end: "22:00" }
    ],
    cooldown_days: 5,
    max_posts_per_day: 5,
    enviar_para_secretaria: true,
    check_interval_seconds: 30
  },
  automation: {
    active: false,
    start_on_boot: false
  },
  session_python: {
  },
  custom_dates: { feed: {}, story: {} },
  special_dates_feed: {
    "01/01": "Ano_Novo",
    "25/12": "Natal",
    "14/02": "Dia_dos_Namorados",
    "12/05": "Dia_das_Maes",
    "09/08": "Dia_dos_Pais",
    "12/10": "Dia_das_Criancas",
    "31/10": "Halloween",
    "07/09": "Independencia"
  },
  special_dates_all: {},
  special_dates_story: {
    "01/01": "Ano_Novo",
    "25/12": "Natal",
    "14/02": "Dia_dos_Namorados",
    "12/05": "Dia_das_Maes",
    "09/08": "Dia_dos_Pais",
    "12/10": "Dia_das_Criancas",
    "31/10": "Halloween",
    "07/09": "Independencia",
    "15/11": "Proclamacao_Republica",
    "25/01": "Aniversario_SP"
  },
  post_history_feed: {
  },
  post_history_story: {
  }
};

// Memória global para a interface acessar sem travar (sincrono)
window.GlobalState = {};

// Função para esperar o Python acordar antes de carregar a tela
async function waitForPython() {
  while (true) {
    try {
      const res = await fetch('/api/bot/status');
      if (res.ok) return; // O Python acordou! Podemos continuar.
    } catch (e) {
      // O Python ainda está dormindo (carregando). Espera meio segundo e tenta de novo.
    }
    await new Promise(r => setTimeout(r, 500));
  }
}

// Função principal de inicialização
async function initApp() {
  // 1. Trava a tela de carregamento até o Python responder
  await waitForPython();

  const keys = [
    'contexto_marca', 'prompts_ia', 'config_shared', 'config_feed', 
    'config_story', 'automation', 'session_python', 'special_dates_feed', 
    'special_dates_story', 'special_dates_all',
    'post_history_feed', 'post_history_story', 'datas_potenciais', 'datas_comemorativas'
  ];

  // 2. Carrega todos os arquivos .json
  for (const key of keys) {
    try {
      const res = await fetch(`/api/data/${key}`);
      const data = await res.json();
      
      if (Object.keys(data).length > 0) {
        window.GlobalState[key] = data;
      } else {
        window.GlobalState[key] = DEFAULTS[key] ? JSON.parse(JSON.stringify(DEFAULTS[key])) : {};
      }
    } catch (e) {
      console.error(`Erro ao carregar ${key}`, e);
      window.GlobalState[key] = DEFAULTS[key] ? JSON.parse(JSON.stringify(DEFAULTS[key])) : {};
    }
  }

  // 3. Carrega a lista de imagens das pastas
  try {
    const resImg = await fetch('/api/all_images');
    window.GlobalState['all_images'] = await resImg.json();
  } catch(e) {
    console.error("Erro ao carregar imagens", e);
    window.GlobalState['all_images'] = [];
  }

  // 4. Agora que TUDO carregou com segurança, mostra a tela inicial
  showTab('automation');
}

// Substitui o antigo loadData
function loadData(key) {
  return window.GlobalState[key];
}

// Substitui o antigo saveData
function saveData(key, data) {
  // Atualiza a memória local
  window.GlobalState[key] = data;
  
  // Envia para o Python salvar no arquivo .json real
  fetch(`/api/data/${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.error("Erro ao salvar", err));
}