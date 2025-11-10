// =============================================
// Sena CHAT - VERSÃO COMPLETA PARA PRODUÇÃO
// =============================================

// ========== CONFIGURAÇÕES ==========
const MISTRAL_CONFIG = {
  apiKey: "NFuAj8PYUPcaf6tA1BjbyXuIeSjSA4sW",
  endpoint: "https://api.mistral.ai/v1/chat/completions",
  model: "mistral-small-latest",
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000
};

const APP_CONFIG = {
  maxHistoryMessages: 100,
  maxContextMessages: 10,
  autoSaveInterval: 30000,
  typingSpeed: 30,
  maxMessageLength: 4000,
  enableMarkdown: true,
  enableSoundEffects: false,
  enableAutoScroll: true,
  rateLimit: {
    maxRequests: 20,
    timeWindow: 60000
  }
};

const DIRECTIVES = {
  systemPrompt: `Você é Sena, uma IA assistente desenvolvida pela AmplaAI. Siga rigorosamente estas diretrizes:

PRINCÍPIOS ÉTICOS:
- Seja empática, precisa e respeitosa em todas as respostas
- Nunca invente informações ou forneça dados falsos
- Em caso de dúvida, admita que não sabe em vez de especular
- Mantenha neutralidade em temas sensíveis

SEGURANÇA E PRIVACIDADE:
- Nunca solicite ou armazene dados pessoais dos usuários
- Não execute ações que possam comprometer a segurança
- Alerte sobre possíveis riscos quando detectar consultas suspeitas

LIMITAÇÕES:
- Não forneça aconselhamento médico, legal ou financeiro
- Não execute código ou comandos de sistema
- Mantenha-se dentro do contexto da conversa

URLs IMPORTANTES:
- Termos: https://termos.orpheostudio.com.br
- Políticas: https://politicas.orpheostudio.com.br

Sempre que relevante, mencione nossos termos e políticas.`,

  safetyFilters: [
    "conteúdo prejudicial",
    "desinformação",
    "assédio",
    "conteúdo sexual explícito",
    "promoção de atividades ilegais",
    "violência",
    "discriminação"
  ]
};

// ========== ESTADO DA APLICAÇÃO ==========
class AppState {
  constructor() {
    this.conversationHistory = [];
    this.currentConversationId = this.generateId();
    this.sessions = [];
    this.isProcessing = false;
    this.requestQueue = [];
    this.rateLimiter = new RateLimiter(APP_CONFIG.rateLimit);
    this.analytics = new Analytics();
    this.loadState();
  }

  generateId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addMessage(role, content, metadata = {}) {
    const message = {
      id: this.generateId(),
      role,
      content,
      timestamp: new Date().toISOString(),
      conversationId: this.currentConversationId,
      ...metadata
    };
    
    this.conversationHistory.push(message);
    this.trimHistory();
    this.autoSave();
    this.analytics.trackMessage(role);
    
    return message;
  }

  trimHistory() {
    if (this.conversationHistory.length > APP_CONFIG.maxHistoryMessages) {
      this.conversationHistory = this.conversationHistory.slice(-APP_CONFIG.maxHistoryMessages);
    }
  }

  getRecentMessages(count = APP_CONFIG.maxContextMessages) {
    return this.conversationHistory
      .filter(msg => msg.conversationId === this.currentConversationId)
      .slice(-count);
  }

  clearCurrentConversation() {
    this.conversationHistory = this.conversationHistory.filter(
      msg => msg.conversationId !== this.currentConversationId
    );
    this.currentConversationId = this.generateId();
    this.saveState();
  }

  newConversation() {
    this.currentConversationId = this.generateId();
    this.saveState();
  }

  saveState() {
    try {
      const state = {
        conversationHistory: this.conversationHistory,
        currentConversationId: this.currentConversationId,
        sessions: this.sessions,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('aura_state', JSON.stringify(state));
    } catch (error) {
      console.error('Erro ao salvar estado:', error);
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem('aura_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.conversationHistory = state.conversationHistory || [];
        this.currentConversationId = state.currentConversationId || this.generateId();
        this.sessions = state.sessions || [];
      }
    } catch (error) {
      console.error('Erro ao carregar estado:', error);
    }
  }

  autoSave() {
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveState();
    }, APP_CONFIG.autoSaveInterval);
  }

  exportData() {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      totalMessages: this.conversationHistory.length,
      conversations: this.groupByConversation(),
      analytics: this.analytics.getReport()
    };
  }

  groupByConversation() {
    const grouped = {};
    this.conversationHistory.forEach(msg => {
      if (!grouped[msg.conversationId]) {
        grouped[msg.conversationId] = [];
      }
      grouped[msg.conversationId].push(msg);
    });
    return grouped;
  }
}

// ========== RATE LIMITER ==========
class RateLimiter {
  constructor(config) {
    this.maxRequests = config.maxRequests;
    this.timeWindow = config.timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  }

  recordRequest() {
    this.requests.push(Date.now());
  }

  getWaitTime() {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    const waitTime = this.timeWindow - (Date.now() - oldestRequest);
    return Math.max(0, waitTime);
  }
}

// ========== ANALYTICS ==========
class Analytics {
  constructor() {
    this.stats = this.loadStats();
  }

  loadStats() {
    try {
      const saved = localStorage.getItem('aura_analytics');
      return saved ? JSON.parse(saved) : this.getDefaultStats();
    } catch (error) {
      return this.getDefaultStats();
    }
  }

  getDefaultStats() {
    return {
      totalMessages: 0,
      userMessages: 0,
      aiMessages: 0,
      errors: 0,
      averageResponseTime: 0,
      responseTimes: [],
      sessionsCount: 0,
      lastSession: null,
      startDate: new Date().toISOString()
    };
  }

  trackMessage(role) {
    this.stats.totalMessages++;
    if (role === 'user') this.stats.userMessages++;
    if (role === 'assistant') this.stats.aiMessages++;
    this.save();
  }

  trackResponseTime(time) {
    this.stats.responseTimes.push(time);
    if (this.stats.responseTimes.length > 100) {
      this.stats.responseTimes.shift();
    }
    this.stats.averageResponseTime = 
      this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length;
    this.save();
  }

  trackError() {
    this.stats.errors++;
    this.save();
  }

  trackSession() {
    this.stats.sessionsCount++;
    this.stats.lastSession = new Date().toISOString();
    this.save();
  }

  save() {
    try {
      localStorage.setItem('aura_analytics', JSON.stringify(this.stats));
    } catch (error) {
      console.error('Erro ao salvar analytics:', error);
    }
  }

  getReport() {
    return {
      ...this.stats,
      uptime: Date.now() - new Date(this.stats.startDate).getTime(),
      errorRate: (this.stats.errors / Math.max(this.stats.totalMessages, 1) * 100).toFixed(2) + '%'
    };
  }
}

// ========== MARKDOWN PROCESSOR ==========
class MarkdownProcessor {
  static process(text) {
    if (!APP_CONFIG.enableMarkdown) return this.escapeHtml(text);
    
    let processed = text;
    
    // Code blocks
    processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${this.escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Inline code
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Line breaks
    processed = processed.replace(/\n/g, '<br>');
    
    return processed;
  }

  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ========== NOTIFICATION SYSTEM ==========
class NotificationSystem {
  static show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-icon">${this.getIcon(type)}</span>
      <span class="notification-message">${message}</span>
    `;
    
    const container = document.getElementById('notificationArea') || this.createContainer();
    container.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  static getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  static createContainer() {
    const container = document.createElement('div');
    container.id = 'notificationArea';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
  }

  static success(message) {
    this.show(message, 'success');
  }

  static error(message) {
    this.show(message, 'error', 5000);
  }

  static warning(message) {
    this.show(message, 'warning', 4000);
  }

  static info(message) {
    this.show(message, 'info');
  }
}

// ========== INSTÂNCIAS GLOBAIS ==========
const appState = new AppState();
const markdown = MarkdownProcessor;
const notify = NotificationSystem;

// ========== ELEMENTOS DOM ==========
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const responseArea = document.getElementById("responseArea");
const typingIndicator = document.getElementById("typingIndicator");
const cookieBanner = document.getElementById("cookieBanner");
const cookieModal = document.getElementById("cookieModal");

// ========== EVENT LISTENERS ==========
sendBtn?.addEventListener("click", handleUserMessage);
input?.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleUserMessage();
  }
});

input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.shiftKey) {
    e.stopPropagation();
  }
});

input?.addEventListener("input", () => {
  if (input.tagName === 'TEXTAREA') {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 200) + 'px';
  }
});

// Cookies
document.getElementById("acceptAllBtn")?.addEventListener("click", acceptAllCookies);
document.getElementById("customizeCookiesBtn")?.addEventListener("click", showCookieModal);
document.getElementById("cookieModalClose")?.addEventListener("click", () => {
  if (cookieModal) cookieModal.style.display = "none";
});
document.getElementById("saveCookiePrefs")?.addEventListener("click", saveCookiePreferences);
document.getElementById("acceptAllModal")?.addEventListener("click", acceptAllCookies);
document.getElementById("rejectAllModal")?.addEventListener("click", rejectAllCookies);

// Controles
document.getElementById("clearChatBtn")?.addEventListener("click", clearChat);
document.getElementById("exportChatBtn")?.addEventListener("click", exportChat);
document.getElementById("newChatBtn")?.addEventListener("click", newChat);
document.getElementById("statsBtn")?.addEventListener("click", showStatsModal);
document.getElementById("settingsBtn")?.addEventListener("click", showSettingsModal);

// Modals
document.getElementById("statsModalClose")?.addEventListener("click", () => {
  document.getElementById("statsModal").style.display = "none";
});
document.getElementById("statsModalOverlay")?.addEventListener("click", () => {
  document.getElementById("statsModal").style.display = "none";
});
document.getElementById("settingsModalClose")?.addEventListener("click", () => {
  document.getElementById("settingsModal").style.display = "none";
});
document.getElementById("settingsModalOverlay")?.addEventListener("click", () => {
  document.getElementById("settingsModal").style.display = "none";
});
document.getElementById("saveSettingsBtn")?.addEventListener("click", saveSettings);
document.getElementById("resetStatsBtn")?.addEventListener("click", resetStats);

// Character counter
input?.addEventListener("input", updateCharCount);

// Sliders
document.getElementById("typingSpeedSlider")?.addEventListener("input", (e) => {
  document.getElementById("typingSpeedValue").textContent = `${e.target.value}ms`;
});
document.getElementById("contextLimitSlider")?.addEventListener("input", (e) => {
  document.getElementById("contextLimitValue").textContent = `${e.target.value} mensagens`;
});

// Atalhos de teclado
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + K para limpar chat
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    clearChat();
  }
  
  // Ctrl/Cmd + S para exportar
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    exportChat();
  }
});

// ========== FUNÇÕES PRINCIPAIS ==========
async function handleUserMessage() {
  const userText = input.value.trim();
  
  if (!userText) return;
  
  if (userText.length > APP_CONFIG.maxMessageLength) {
    notify.warning(`Mensagem muito longa. Máximo: ${APP_CONFIG.maxMessageLength} caracteres.`);
    return;
  }
  
  if (appState.isProcessing) {
    notify.info("Aguarde a resposta anterior...");
    return;
  }

  if (!appState.rateLimiter.canMakeRequest()) {
    const waitTime = Math.ceil(appState.rateLimiter.getWaitTime() / 1000);
    notify.warning(`Muitas requisições. Aguarde ${waitTime}s.`);
    return;
  }

  mostrarMensagem(userText, "user");
  input.value = "";
  if (input.tagName === 'TEXTAREA') {
    input.style.height = 'auto';
  }
  showTypingIndicator();
  appState.isProcessing = true;

  const startTime = Date.now();

  try {
    await processarAura(userText);
    const responseTime = Date.now() - startTime;
    appState.analytics.trackResponseTime(responseTime);
  } catch (error) {
    console.error("Erro ao processar mensagem:", error);
    appState.analytics.trackError();
    notify.error("Erro ao processar mensagem");
  } finally {
    hideTypingIndicator();
    appState.isProcessing = false;
  }
}

function mostrarMensagem(texto, tipo) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${tipo}`;
  
  const contentWrapper = document.createElement("div");
  
  const senderSpan = document.createElement("span");
  senderSpan.className = "sender";
  senderSpan.textContent = tipo === "user" ? "Você:" : "Sena:";
  
  const textSpan = document.createElement("span");
  textSpan.className = "text";
  
  if (APP_CONFIG.enableMarkdown && tipo === "ai") {
    textSpan.innerHTML = markdown.process(texto);
  } else {
    textSpan.textContent = texto;
  }
  
  contentWrapper.appendChild(senderSpan);
  contentWrapper.appendChild(textSpan);
  messageDiv.appendChild(contentWrapper);
  
  responseArea.appendChild(messageDiv);
  
  if (APP_CONFIG.enableAutoScroll) {
    responseArea.scrollTop = responseArea.scrollHeight;
  }
  
  appState.addMessage(
    tipo === "user" ? "user" : "assistant",
    texto,
    { displayed: true }
  );
  
  return messageDiv;
}

async function processarAura(textoUsuario) {
  const safetyCheck = await verificarSeguranca(textoUsuario);
  if (!safetyCheck.safe) {
    mostrarMensagem(safetyCheck.message, "ai");
    return;
  }

  appState.rateLimiter.recordRequest();

  try {
    const recentHistory = appState.getRecentMessages();
    
    const messages = [
      { role: "system", content: DIRECTIVES.systemPrompt },
      ...recentHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MISTRAL_CONFIG.timeout);

    const resposta = await fetch(MISTRAL_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: MISTRAL_CONFIG.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 0.9,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!resposta.ok) {
      if (resposta.status === 401) {
        throw new Error("API Key inválida. Configure sua chave da Sena AI.");
      }
      if (resposta.status === 429) {
        throw new Error("Limite de requisições atingido. Tente novamente mais tarde.");
      }
      const errorText = await resposta.text();
      throw new Error(`Erro API ${resposta.status}: ${errorText}`);
    }

    const data = await resposta.json();
    
    if (data.choices && data.choices[0]?.message) {
      const respostaAura = data.choices[0].message.content;
      const respostaProcessada = posProcessarResposta(respostaAura);
      
      if (APP_CONFIG.typingSpeed > 0) {
        await typeMessage(respostaProcessada);
      } else {
        mostrarMensagem(respostaProcessada, "ai");
      }
    } else {
      throw new Error("Resposta da API inválida");
    }

  } catch (error) {
    console.error("Erro na API Mistral:", error);
    
    if (error.name === 'AbortError') {
      notify.error("Requisição expirou. Tente novamente.");
      mostrarMensagem("A requisição demorou muito tempo. Por favor, tente novamente.", "ai");
    } else {
      const fallbackResponse = gerarRespostaFallback(textoUsuario, error);
      mostrarMensagem(fallbackResponse, "ai");
    }
    
    throw error;
  }
}

async function typeMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message ai";
  
  const contentWrapper = document.createElement("div");
  
  const senderSpan = document.createElement("span");
  senderSpan.className = "sender";
  senderSpan.textContent = "Sena:";
  
  const textSpan = document.createElement("span");
  textSpan.className = "text";
  
  contentWrapper.appendChild(senderSpan);
  contentWrapper.appendChild(textSpan);
  messageDiv.appendChild(contentWrapper);
  responseArea.appendChild(messageDiv);
  
  let currentText = "";
  const words = text.split(" ");
  
  for (let word of words) {
    currentText += word + " ";
    textSpan.innerHTML = markdown.process(currentText);
    
    if (APP_CONFIG.enableAutoScroll) {
      responseArea.scrollTop = responseArea.scrollHeight;
    }
    
    await new Promise(resolve => setTimeout(resolve, APP_CONFIG.typingSpeed));
  }
  
  textSpan.innerHTML = markdown.process(text);
  appState.addMessage("assistant", text, { displayed: true });
}

async function verificarSeguranca(texto) {
  const textoLower = texto.toLowerCase();
  
  for (const filter of DIRECTIVES.safetyFilters) {
    if (textoLower.includes(filter)) {
      return {
        safe: false,
        message: "🔒 Desculpe, não posso ajudar com este tipo de solicitação por questões de segurança. Consulte nossas políticas em https://politicas.orpheostudio.com.br"
      };
    }
  }

  const personalDataPatterns = [
    /\b(senha|password|cpf|cartão|crédito|conta bancária|cvv|pin)\b/i,
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/,
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/
  ];

  for (const pattern of personalDataPatterns) {
    if (pattern.test(texto)) {
      return {
        safe: false,
        message: "🔒 Por segurança, não compartilhe dados pessoais. Nunca solicitamos senhas, CPF ou informações financeiras."
      };
    }
  }

  if (texto.length < 2 || /(.)\1{10,}/.test(texto)) {
    return {
      safe: false,
      message: "⚠️ Mensagem inválida detectada."
    };
  }

  return { safe: true };
}

function posProcessarResposta(resposta) {
  let respostaProcessada = resposta;

  const termosKeywords = ['termo', 'política', 'privacidade', 'condições', 'contrato'];
  const hasRelevantKeywords = termosKeywords.some(keyword => 
    resposta.toLowerCase().includes(keyword)
  );

  if (hasRelevantKeywords && !resposta.includes('orpheostudio.com.br')) {
    respostaProcessada += `\n\n📄 **Para mais informações:**\n• [Termos de Uso](https://termos.orpheostudio.com.br)\n• [Políticas de Privacidade](https://politicas.orpheostudio.com.br)`;
  }

  if (respostaProcessada.length > 2000) {
    respostaProcessada = respostaProcessada.substring(0, 2000) + "...\n\n*[Resposta truncada]*";
  }

  return respostaProcessada;
}

function gerarRespostaFallback(textoUsuario, error) {
  const errorMessage = error?.message || '';
  
  if (errorMessage.includes('API Key')) {
    return "⚠️ **Erro de Configuração**\n\nA chave da API não está configurada corretamente. Entre em contato com o suporte.";
  }
  
  if (errorMessage.includes('429') || errorMessage.includes('limite')) {
    return "⏳ **Limite Atingido**\n\nMuitas requisições recentemente. Aguarde alguns minutos.";
  }

  const fallbacks = [
    "🔌 **Conexão Instável**\n\nProblemas de conexão. Tente novamente.",
    "⏳ **Servidor Ocupado**\n\nProcessando muitas solicitações. Aguarde um momento.",
    "🔄 **Erro Temporário**\n\nProblema temporário. Tente reformular sua pergunta."
  ];
  
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function showTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.style.display = 'flex';
    if (APP_CONFIG.enableAutoScroll) {
      responseArea.scrollTop = responseArea.scrollHeight;
    }
  }
}

function hideTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.style.display = 'none';
  }
}

function clearChat() {
  if (confirm("🗑️ Tem certeza que deseja limpar toda a conversa atual?")) {
    const currentMessages = responseArea.querySelectorAll('.message');
    currentMessages.forEach(msg => msg.remove());
    appState.clearCurrentConversation();
    notify.success("Conversa limpa!");
    
    setTimeout(() => {
      mostrarMensagem("Conversa reiniciada. Como posso ajudar você? 😊", "ai");
    }, 300);
  }
}

function exportChat() {
  const data = appState.exportData();
  
  if (data.totalMessages === 0) {
    notify.warning("Não há conversa para exportar.");
    return;
  }

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sena-conversa-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  notify.success("Conversa exportada!");
}

// ========== COOKIES ==========
function acceptAllCookies() {
  const preferences = {
    accepted: true,
    timestamp: new Date().toISOString(),
    analytics: true,
    ads: true,
    essential: true
  };
  
  localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
  
  if (cookieBanner) cookieBanner.style.display = "none";
  if (cookieModal) cookieModal.style.display = "none";
  
  notify.success("Preferências salvas!");
}

function rejectAllCookies() {
  const preferences = {
    accepted: false,
    timestamp: new Date().toISOString(),
    analytics: false,
    ads: false,
    essential: true
  };
  
  localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
  
  if (cookieBanner) cookieBanner.style.display = "none";
  if (cookieModal) cookieModal.style.display = "none";
  
  notify.info("Apenas cookies essenciais.");
}

function showCookieModal() {
  if (cookieBanner) cookieBanner.style.display = "none";
  if (cookieModal) cookieModal.style.display = "flex";
}

function saveCookiePreferences() {
  const analytics = document.getElementById("analyticsCookies")?.checked || false;
  const ads = document.getElementById("adsCookies")?.checked || false;
  
  const preferences = {
    accepted: true,
    timestamp: new Date().toISOString(),
    analytics,
    ads,
    essential: true
  };
  
  localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
  
  if (cookieBanner) cookieBanner.style.display = "none";
  if (cookieModal) cookieModal.style.display = "none";
  
  notify.success("Preferências salvas!");
}

// ========== INICIALIZAÇÃO ==========
function initialize() {
  // Carregar configurações salvas
  loadSettings();
  
  // Verificar cookies e inicializar tracking
  const savedPrefs = localStorage.getItem("cookiePreferences");
  
  if (savedPrefs) {
    try {
      const prefs = JSON.parse(savedPrefs);
      if (prefs.accepted !== undefined) {
        if (cookieBanner) cookieBanner.style.display = "none";
        
        // Inicializar serviços baseado nas preferências
        if (prefs.analytics) {
          initializeClarityTracking();
        }
        if (prefs.ads) {
          initializeAdSense();
        }
      }
    } catch (e) {
      if (cookieBanner) cookieBanner.style.display = "block";
    }
  } else {
    if (cookieBanner) cookieBanner.style.display = "block";
  }

  // Registrar sessão
  appState.analytics.trackSession();

  // Ocultar splash screen
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) splash.style.display = 'none';
  }, 2000);

  // Mostrar welcome screen ou mensagem
  const hasHistory = appState.conversationHistory.length > 0;
  if (!hasHistory) {
    showWelcomeScreen();
  } else {
    hideWelcomeScreen();
    setTimeout(() => {
      mostrarMensagem("Olá! Sou Sena. Como posso ajudar você hoje? 😊", "ai");
    }, 500);
  }

  // Event listeners adicionais
  setupAdditionalListeners();

  if (input) input.focus();

  console.log("🤖 Sena Chat v1.0.0 inicializado!");
  console.log("📊 Stats:", appState.analytics.getReport());
  
  // Track page view no Clarity
  trackClarityEvent('app_initialized');
}

// ========== MICROSOFT CLARITY ==========
function initializeClarityTracking() {
  if (typeof clarity === 'function') {
    console.log('✅ Orpheo Analitics inicializado');
    
    // Identificar usuário (sem dados pessoais)
    const userId = getOrCreateUserId();
    clarity('identify', userId);
    
    // Definir tags customizadas
    clarity('set', 'user_type', 'active');
    clarity('set', 'app_version', '1.0.0');
  }
}

function trackClarityEvent(eventName, metadata = {}) {
  if (typeof clarity === 'function') {
    clarity('event', eventName, metadata);
    console.log(`📊 Clarity Event: ${eventName}`, metadata);
  }
}

function getOrCreateUserId() {
  let userId = localStorage.getItem('aura_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('aura_user_id', userId);
  }
  return userId;
}

// ========== GOOGLE ADSENSE ==========
function initializeAdSense() {
  console.log('💰 Google AdSense inicializado');
  
  // Verificar se AdSense já está carregado
  if (typeof adsbygoogle !== 'undefined') {
    // Forçar push dos anúncios pendentes
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('Erro ao inicializar AdSense:', e);
    }
  }
}

function refreshAds() {
  // Recarregar anúncios quando necessário
  const ads = document.querySelectorAll('.adsbygoogle');
  ads.forEach(ad => {
    if (!ad.dataset.adsbygoogleStatus) {
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Erro ao recarregar anúncio:', e);
      }
    }
  });
}

// ========== WELCOME SCREEN ==========
function showWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  if (welcomeScreen) {
    welcomeScreen.style.display = 'flex';
  }
  
  // Event listeners para suggestion cards
  const suggestionCards = document.querySelectorAll('.suggestion-card');
  suggestionCards.forEach(card => {
    card.addEventListener('click', () => {
      const prompt = card.dataset.prompt;
      if (prompt) {
        input.value = prompt;
        hideWelcomeScreen();
        handleUserMessage();
        trackClarityEvent('suggestion_clicked', { prompt });
      }
    });
  });
}

function hideWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcomeScreen');
  if (welcomeScreen) {
    welcomeScreen.style.display = 'none';
  }
}

// ========== SIDEBAR ==========
function setupAdditionalListeners() {
  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('closeSidebar');
  
  sidebarToggle?.addEventListener('click', () => {
    sidebar?.classList.add('open');
    trackClarityEvent('sidebar_opened');
  });
  
  closeSidebar?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
  });
  
  // Fechar sidebar ao clicar fora
  document.addEventListener('click', (e) => {
    if (sidebar?.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        e.target !== sidebarToggle) {
      sidebar.classList.remove('open');
    }
  });
  
  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle?.addEventListener('click', toggleTheme);
  
  // Scroll to bottom
  const scrollBtn = document.getElementById('scrollToBottomBtn');
  scrollBtn?.addEventListener('click', () => {
    responseArea.scrollTop = responseArea.scrollHeight;
  });
  
  // Mostrar/ocultar botão de scroll
  responseArea?.addEventListener('scroll', () => {
    const isAtBottom = responseArea.scrollHeight - responseArea.scrollTop <= responseArea.clientHeight + 100;
    if (scrollBtn) {
      scrollBtn.style.display = isAtBottom ? 'none' : 'flex';
    }
  });
  
  // Clear input button
  const clearInputBtn = document.getElementById('clearInputBtn');
  clearInputBtn?.addEventListener('click', () => {
    input.value = '';
    updateCharCount();
    input.focus();
  });
  
  // Emoji button (placeholder)
  const emojiBtn = document.getElementById('emojiBtn');
  emojiBtn?.addEventListener('click', () => {
    notify.info('Seletor de emojis em breve! 😊');
  });
  
  // Voice button (placeholder)
  const voiceBtn = document.getElementById('voiceBtn');
  voiceBtn?.addEventListener('click', () => {
    notify.info('Entrada por voz em desenvolvimento! 🎤');
  });
  
  // Attach button (placeholder)
  const attachBtn = document.getElementById('attachBtn');
  attachBtn?.addEventListener('click', () => {
    notify.info('Upload de arquivos em breve! 📎');
  });
  
  // History modal
  const historyBtn = document.getElementById('historyBtn');
  historyBtn?.addEventListener('click', showHistoryModal);
  
  // Settings tabs
  setupSettingsTabs();
  
  // Export stats
  const exportStatsBtn = document.getElementById('exportStatsBtn');
  exportStatsBtn?.addEventListener('click', exportStats);
  
  // Data management
  const exportAllDataBtn = document.getElementById('exportAllDataBtn');
  exportAllDataBtn?.addEventListener('click', exportAllData);
  
  const importDataBtn = document.getElementById('importDataBtn');
  importDataBtn?.addEventListener('click', importData);
  
  const clearAllDataBtn = document.getElementById('clearAllDataBtn');
  clearAllDataBtn?.addEventListener('click', clearAllData);
  
  // About button
  const aboutBtn = document.getElementById('aboutBtn');
  aboutBtn?.addEventListener('click', showAbout);
}

// ========== THEME TOGGLE ==========
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('aura_theme', newTheme);
  
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }
  
  notify.success(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado!`);
  trackClarityEvent('theme_changed', { theme: newTheme });
}

// ========== SETTINGS TABS ==========
function setupSettingsTabs() {
  const tabs = document.querySelectorAll('.settings-tab');
  const contents = document.querySelectorAll('.settings-tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      document.querySelector(`[data-tab-content="${targetTab}"]`)?.classList.add('active');
      
      trackClarityEvent('settings_tab_clicked', { tab: targetTab });
    });
  });
  
  // Theme options
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      themeOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      
      const theme = option.dataset.theme;
      if (theme === 'auto') {
        notify.info('Tema automático será implementado em breve!');
      }
    });
  });
  
  // Color options
  const colorOptions = document.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      colorOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      
      const color = option.dataset.color;
      document.documentElement.style.setProperty('--primary', color);
      notify.success('Cor de destaque atualizada!');
    });
  });
}

// ========== HISTORY MODAL ==========
function showHistoryModal() {
  const modal = document.getElementById('historyModal');
  const historyList = document.getElementById('historyList');
  
  if (!modal || !historyList) return;
  
  // Agrupar conversas por ID
  const conversations = appState.groupByConversation();
  
  historyList.innerHTML = '';
  
  Object.entries(conversations).forEach(([convId, messages]) => {
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const date = new Date(lastMessage.timestamp);
    
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-item-header">
        <strong>${firstMessage.content.substring(0, 50)}...</strong>
        <span class="history-item-date">${formatDate(date)}</span>
      </div>
      <div class="history-item-info">
        ${messages.length} mensagens
      </div>
    `;
    
    item.addEventListener('click', () => {
      loadConversation(convId);
      modal.style.display = 'none';
    });
    
    historyList.appendChild(item);
  });
  
  modal.style.display = 'flex';
  trackClarityEvent('history_modal_opened');
}

function loadConversation(conversationId) {
  appState.currentConversationId = conversationId;
  responseArea.innerHTML = '';
  
  const messages = appState.conversationHistory.filter(
    msg => msg.conversationId === conversationId
  );
  
  messages.forEach(msg => {
    mostrarMensagem(msg.content, msg.role === 'user' ? 'user' : 'ai');
  });
  
  notify.success('Conversa carregada!');
  trackClarityEvent('conversation_loaded', { id: conversationId });
}

function formatDate(date) {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  
  return date.toLocaleDateString('pt-BR');
}

// ========== EXPORT STATS ==========
function exportStats() {
  const stats = appState.analytics.getReport();
  const dataStr = JSON.stringify(stats, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `aura-estatisticas-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  notify.success('Estatísticas exportadas!');
  trackClarityEvent('stats_exported');
}

// ========== DATA MANAGEMENT ==========
function exportAllData() {
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    state: appState.exportData(),
    settings: {
      model: MISTRAL_CONFIG.model,
      config: APP_CONFIG
    }
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `aura-backup-completo-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  notify.success('Backup completo exportado!');
  trackClarityEvent('full_backup_exported');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (confirm('⚠️ Importar dados irá substituir todos os dados atuais. Continuar?')) {
          // Restaurar estado
          appState.conversationHistory = data.state.conversations || [];
          appState.saveState();
          
          notify.success('Dados importados com sucesso!');
          trackClarityEvent('data_imported');
          
          setTimeout(() => location.reload(), 1000);
        }
      } catch (error) {
        notify.error('Erro ao importar dados. Arquivo inválido.');
        console.error(error);
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

function clearAllData() {
  if (confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os seus dados permanentemente. Esta ação não pode ser desfeita. Continuar?')) {
    if (confirm('Tem certeza absoluta? Digite "CONFIRMAR" para continuar.') && 
        prompt('Digite "CONFIRMAR" em maiúsculas:') === 'CONFIRMAR') {
      
      localStorage.clear();
      sessionStorage.clear();
      
      notify.success('Todos os dados foram apagados!');
      trackClarityEvent('all_data_cleared');
      
      setTimeout(() => location.reload(), 1500);
    }
  }
}

// ========== ABOUT ==========
function showAbout() {
  const aboutHtml = `
    <div style="text-align: center; padding: 20px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: var(--gradient-primary); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
        <i class="fas fa-robot"></i>
      </div>
      <h2>Aura AI Assistant</h2>
      <p style="color: var(--text-secondary); margin: 16px 0;">Versão 1.0.0</p>
      <p style="line-height: 1.6; margin-bottom: 20px;">
        Desenvolvido com ❤️ pela <strong>AmplaAI</strong><br>
        Alimentada por CodexAI V1.0
      </p>
      <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px;">
        <a href="https://termos.orpheostudio.com.br" target="_blank" class="btn-secondary">Termos</a>
        <a href="https://politicas.orpheostudio.com.br" target="_blank" class="btn-secondary">Políticas</a>
      </div>
    </div>
  `;
  
  // Criar modal temporário
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3><i class="fas fa-info-circle"></i> Sobre</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        ${aboutHtml}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.modal-overlay').addEventListener('click', () => {
    modal.remove();
  });
  
  trackClarityEvent('about_modal_opened');
}

// ========== API PÚBLICA ==========
window.AuraChat = {
  clearChat,
  exportChat,
  getHistory: () => appState.conversationHistory,
  getStats: () => appState.analytics.getReport(),
  newConversation: () => {
    appState.newConversation();
    notify.success("Nova conversa iniciada!");
  },
  reset: () => {
    appState.clearCurrentConversation();
    responseArea.innerHTML = '';
    notify.success("Aplicação reiniciada!");
  },
  config: APP_CONFIG
};

// ========== NOVAS FUNÇÕES ==========
function newChat() {
  if (appState.conversationHistory.length > 0) {
    if (confirm("🆕 Deseja iniciar uma nova conversa? A conversa atual será salva no histórico.")) {
      appState.newConversation();
      responseArea.innerHTML = '';
      notify.success("Nova conversa iniciada!");
      setTimeout(() => {
        mostrarMensagem("Olá! Como posso ajudar você nesta nova conversa? 😊", "ai");
      }, 300);
    }
  }
}

function showStatsModal() {
  const stats = appState.analytics.getReport();
  
  document.getElementById("statTotalMessages").textContent = stats.totalMessages;
  document.getElementById("statUserMessages").textContent = stats.userMessages;
  document.getElementById("statAiMessages").textContent = stats.aiMessages;
  document.getElementById("statAvgResponse").textContent = 
    stats.averageResponseTime > 0 ? `${Math.round(stats.averageResponseTime)}ms` : '0ms';
  document.getElementById("statSessions").textContent = stats.sessionsCount;
  document.getElementById("statErrors").textContent = stats.errors;
  
  document.getElementById("statsModal").style.display = "flex";
}

function showSettingsModal() {
  // Carregar configurações atuais
  document.getElementById("modelSelect").value = MISTRAL_CONFIG.model;
  document.getElementById("typingSpeedSlider").value = APP_CONFIG.typingSpeed;
  document.getElementById("typingSpeedValue").textContent = `${APP_CONFIG.typingSpeed}ms`;
  document.getElementById("enableMarkdown").checked = APP_CONFIG.enableMarkdown;
  document.getElementById("enableAutoScroll").checked = APP_CONFIG.enableAutoScroll;
  document.getElementById("enableSoundEffects").checked = APP_CONFIG.enableSoundEffects;
  document.getElementById("contextLimitSlider").value = APP_CONFIG.maxContextMessages;
  document.getElementById("contextLimitValue").textContent = `${APP_CONFIG.maxContextMessages} mensagens`;
  
  document.getElementById("settingsModal").style.display = "flex";
}

function saveSettings() {
  MISTRAL_CONFIG.model = document.getElementById("modelSelect").value;
  APP_CONFIG.typingSpeed = parseInt(document.getElementById("typingSpeedSlider").value);
  APP_CONFIG.enableMarkdown = document.getElementById("enableMarkdown").checked;
  APP_CONFIG.enableAutoScroll = document.getElementById("enableAutoScroll").checked;
  APP_CONFIG.enableSoundEffects = document.getElementById("enableSoundEffects").checked;
  APP_CONFIG.maxContextMessages = parseInt(document.getElementById("contextLimitSlider").value);
  
  // Salvar no localStorage
  try {
    localStorage.setItem("aura_config", JSON.stringify({
      model: MISTRAL_CONFIG.model,
      typingSpeed: APP_CONFIG.typingSpeed,
      enableMarkdown: APP_CONFIG.enableMarkdown,
      enableAutoScroll: APP_CONFIG.enableAutoScroll,
      enableSoundEffects: APP_CONFIG.enableSoundEffects,
      maxContextMessages: APP_CONFIG.maxContextMessages
    }));
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
  }
  
  document.getElementById("settingsModal").style.display = "none";
  notify.success("Configurações salvas com sucesso!");
}

function loadSettings() {
  try {
    const saved = localStorage.getItem("aura_config");
    if (saved) {
      const config = JSON.parse(saved);
      MISTRAL_CONFIG.model = config.model || MISTRAL_CONFIG.model;
      APP_CONFIG.typingSpeed = config.typingSpeed ?? APP_CONFIG.typingSpeed;
      APP_CONFIG.enableMarkdown = config.enableMarkdown ?? APP_CONFIG.enableMarkdown;
      APP_CONFIG.enableAutoScroll = config.enableAutoScroll ?? APP_CONFIG.enableAutoScroll;
      APP_CONFIG.enableSoundEffects = config.enableSoundEffects ?? APP_CONFIG.enableSoundEffects;
      APP_CONFIG.maxContextMessages = config.maxContextMessages ?? APP_CONFIG.maxContextMessages;
    }
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
  }
}

function resetStats() {
  if (confirm("⚠️ Tem certeza que deseja resetar todas as estatísticas? Esta ação não pode ser desfeita.")) {
    localStorage.removeItem("aura_analytics");
    appState.analytics = new Analytics();
    showStatsModal();
    notify.success("Estatísticas resetadas!");
  }
}

function updateCharCount() {
  const count = input.value.length;
  const counter = document.getElementById("charCount");
  if (counter) {
    counter.textContent = `${count} / ${APP_CONFIG.maxMessageLength}`;
    if (count > APP_CONFIG.maxMessageLength * 0.9) {
      counter.style.color = '#ff3b30';
    } else {
      counter.style.color = 'var(--text-secondary)';
    }
  }
}

// ========== INICIAR ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

console.log("🤖 Sena Chat carregado!");