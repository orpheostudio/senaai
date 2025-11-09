// Configurações avançadas da API
const MISTRAL_CONFIG = {
  apiKey: "sua_chave_api_aqui", // Substitua pela sua chave real
  endpoint: "https://api.mistral.ai/v1/chat/completions",
  availableModels: [
    { id: "mistral-small-latest", name: "Mistral Small", speed: "rápido", cost: "baixo" },
    { id: "mistral-medium-latest", name: "Mistral Medium", speed: "balanceado", cost: "médio" },
    { id: "mistral-large-latest", name: "Mistral Large", speed: "avançado", cost: "alto" }
  ],
  defaultModel: "mistral-small-latest",
  maxTokens: 2000,
  temperature: 0.7
};

// Sistema de temas
const THEMES = {
  light: {
    name: "light",
    icon: "fa-moon",
    label: "Modo Escuro"
  },
  dark: {
    name: "dark", 
    icon: "fa-sun",
    label: "Modo Claro"
  }
};

// Diretrizes avançadas para a Sena
const DIRECTIVES = {
  systemPrompt: `Você é Sena, uma IA assistente avançada desenvolvida pela Orpheo Studio. Siga rigorosamente estas diretrizes:

IDENTIDADE E TOM:
- Seja empática, precisa e profissional em todas as respostas
- Use um tom amigável mas respeitoso
- Adapte o nível de detalhe com base na complexidade da pergunta
- Mantenha consistência na personalidade

PRINCÍPIOS ÉTICOS:
- Nunca invente informações ou forneça dados falsos
- Em caso de dúvida, admita que não sabe em vez de especular
- Mantenha neutralidade em temas sensíveis e controversos
- Promova conversas construtivas e respeitosas

SEGURANÇA E PRIVACIDADE:
- Nunca solicite ou armazene dados pessoais dos usuários
- Alerte sobre possíveis riscos quando detectar consultas suspeitas
- Não execute ações que possam comprometer a segurança
- Proteja a privacidade do usuário acima de tudo

LIMITAÇÕES TÉCNICAS:
- Não forneça aconselhamento médico, legal ou financeiro profissional
- Não execute código ou comandos de sistema
- Mantenha-se dentro do contexto da conversa atual
- Reconheça quando uma pergunta está fora do seu escopo

RECURSOS E CAPACIDADES:
- Você pode processar e analisar texto complexo
- Mantém contexto de conversas longas
- Oferece respostas detalhadas quando solicitado
- Pode quebrar explicações complexas em partes compreensíveis

URLs OFICIAIS:
- Termos de Uso: https://termos.orpheostudio.com.br
- Política de Privacidade: https://politicas.orpheostudio.com.br
- Site: https://www.orpheostudio.com.br

Sempre que relevante, mencione nossos termos e políticas de forma natural.`,

  safetyFilters: [
    "conteúdo prejudicial", "desinformação", "assédio", 
    "conteúdo sexual explícito", "promoção de atividades ilegais",
    "discursos de ódio", "violência", "automutilação"
  ],
  
  responseGuidelines: {
    maxLength: 2000,
    includeSources: true,
    suggestFollowUp: true,
    maintainContext: true
  }
};

// Estado global da aplicação
const AppState = {
  conversationHistory: [],
  currentTheme: 'light',
  userPreferences: {
    soundEffects: true,
    autoScroll: true,
    model: MISTRAL_CONFIG.defaultModel,
    temperature: MISTRAL_CONFIG.temperature
  },
  sessionStats: {
    startTime: new Date(),
    messageCount: 0,
    tokensUsed: 0
  },
  isOnline: true,
  typing: false
};

// Elementos DOM - Cache avançado
const DOM = {
  // Elementos principais
  input: document.getElementById("userInput"),
  sendBtn: document.getElementById("sendBtn"),
  responseArea: document.getElementById("responseArea"),
  typingIndicator: document.getElementById("typingIndicator"),
  
  // Controles
  clearChatBtn: document.getElementById("clearChatBtn"),
  exportChatBtn: document.getElementById("exportChatBtn"),
  sidebarToggle: document.getElementById("sidebarToggle"),
  sidebar: document.getElementById("sidebar"),
  sidebarClose: document.getElementById("sidebarClose"),
  
  // Configurações
  settingsBtn: document.getElementById("settingsBtn"),
  settingsModal: document.getElementById("settingsModal"),
  settingsModalClose: document.getElementById("settingsModalClose"),
  modelSelect: document.getElementById("modelSelect"),
  temperatureSlider: document.getElementById("temperatureSlider"),
  temperatureValue: document.getElementById("temperatureValue"),
  soundEffects: document.getElementById("soundEffects"),
  autoScroll: document.getElementById("autoScroll"),
  
  // Cookies
  cookieBanner: document.getElementById("cookieBanner"),
  acceptAllBtn: document.getElementById("acceptAllBtn"),
  customizeCookiesBtn: document.getElementById("customizeCookiesBtn"),
  cookieModal: document.getElementById("cookieModal"),
  cookieModalClose: document.getElementById("cookieModalClose"),
  saveCookiePrefs: document.getElementById("saveCookiePrefs"),
  acceptAllModal: document.getElementById("acceptAllModal"),
  rejectAllModal: document.getElementById("rejectAllModal"),
  
  // Tema
  themeToggle: document.getElementById("themeToggle"),
  
  // Estatísticas
  messageCount: document.getElementById("messageCount"),
  sessionTime: document.getElementById("sessionTime"),
  modelStatus: document.getElementById("modelStatus"),
  
  // Sugestões
  quickSuggestions: document.getElementById("quickSuggestions"),
  suggestionBtns: document.querySelectorAll(".suggestion-btn"),
  
  // Voz
  voiceInputBtn: document.getElementById("voiceInputBtn"),
  
  // Notificações
  notificationArea: document.getElementById("notificationArea")
};

// Sistema de inicialização
class AuraChat {
  constructor() {
    this.initializeApp();
    this.setupEventListeners();
    this.loadUserPreferences();
    this.startSessionTimer();
  }

  initializeApp() {
    console.log("🚀 Sena Chat inicializado - Versão 2.0");
    
    // Verificar conectividade
    this.checkConnectivity();
    
    // Carregar histórico se existir
    this.loadConversationHistory();
    
    // Mensagem de boas-vindas inteligente
    this.showWelcomeMessage();
    
    // Inicializar estatísticas
    this.updateStats();
  }

  setupEventListeners() {
    // Eventos de mensagens
    DOM.sendBtn.addEventListener("click", () => this.handleUserMessage());
    DOM.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleUserMessage();
    });

    // Eventos de controle
    DOM.clearChatBtn.addEventListener("click", () => this.clearChat());
    DOM.exportChatBtn.addEventListener("click", () => this.exportChat());
    DOM.sidebarToggle.addEventListener("click", () => this.toggleSidebar());
    DOM.sidebarClose.addEventListener("click", () => this.toggleSidebar(false));

    // Eventos de configurações
    DOM.settingsBtn.addEventListener("click", () => this.showSettings());
    DOM.settingsModalClose.addEventListener("click", () => this.hideSettings());
    DOM.modelSelect.addEventListener("change", (e) => this.updateModel(e.target.value));
    DOM.temperatureSlider.addEventListener("input", (e) => this.updateTemperature(e.target.value));
    DOM.soundEffects.addEventListener("change", (e) => this.toggleSoundEffects(e.target.checked));
    DOM.autoScroll.addEventListener("change", (e) => this.toggleAutoScroll(e.target.checked));

    // Eventos de cookies
    DOM.acceptAllBtn.addEventListener("click", () => this.acceptAllCookies());
    DOM.customizeCookiesBtn.addEventListener("click", () => this.showCookieModal());
    DOM.cookieModalClose.addEventListener("click", () => this.hideCookieModal());
    DOM.saveCookiePrefs.addEventListener("click", () => this.saveCookiePreferences());
    DOM.acceptAllModal.addEventListener("click", () => this.acceptAllCookies());
    DOM.rejectAllModal.addEventListener("click", () => this.rejectAllCookies());

    // Eventos de tema
    DOM.themeToggle.addEventListener("click", () => this.toggleTheme());

    // Eventos de sugestões
    DOM.suggestionBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const prompt = e.target.closest('.suggestion-btn').dataset.prompt;
        DOM.input.value = prompt;
        this.handleUserMessage();
      });
    });

    // Eventos de voz
    DOM.voiceInputBtn.addEventListener("click", () => this.startVoiceInput());

    // Eventos globais
    document.addEventListener('click', (e) => {
      if (e.target === DOM.settingsModal) this.hideSettings();
      if (e.target === DOM.cookieModal) this.hideCookieModal();
    });

    // Focar no input ao carregar
    DOM.input.focus();
  }

  async handleUserMessage() {
    const userText = DOM.input.value.trim();
    if (userText === "") return;

    // Adicionar mensagem do usuário
    this.addMessage("Você", userText, "user");
    DOM.input.value = "";
    
    // Mostrar indicador de digitação
    this.showTypingIndicator();

    try {
      await this.processWithAI(userText);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      this.addMessage("Sena", "Desculpe, encontrei um erro. Tente novamente.", "error");
      this.showNotification("Erro ao processar sua mensagem", "error");
    } finally {
      this.hideTypingIndicator();
      this.updateStats();
    }
  }

  async processWithAI(userMessage) {
    // Verificação de segurança
    const safetyCheck = await this.checkSafety(userMessage);
    if (!safetyCheck.safe) {
      this.addMessage("Aura", safetyCheck.message, "warning");
      return;
    }

    try {
      const response = await this.callMistralAPI(userMessage);
      const processedResponse = this.processAIResponse(response);
      this.addMessage("Sena", processedResponse, "Sena");
      
      // Atualizar estatísticas
      AppState.sessionStats.messageCount += 2; // User + AI
      
    } catch (error) {
      throw error;
    }
  }

  async callMistralAPI(userMessage) {
    const messages = [
      { role: "system", content: DIRECTIVES.systemPrompt },
      ...AppState.conversationHistory.slice(-8).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: userMessage }
    ];

    const response = await fetch(MISTRAL_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: AppState.userPreferences.model,
        messages: messages,
        temperature: parseFloat(AppState.userPreferences.temperature),
        max_tokens: MISTRAL_CONFIG.maxTokens,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error("Resposta da API inválida");
    }
  }

  processAIResponse(response) {
    let processed = response;

    // Adicionar referências quando relevante
    if (this.shouldAddReferences(response)) {
      processed += `\n\n---\n*Para mais informações, consulte:*\n• [Termos de Uso](${this.getTermosUrl()})\n• [Política de Privacidade](${this.getPoliticasUrl()})`;
    }

    // Limitar tamanho se necessário
    if (processed.length > DIRECTIVES.responseGuidelines.maxLength) {
      processed = processed.substring(0, DIRECTIVES.responseGuidelines.maxLength) + "...\n\n*[Resposta truncada para melhor legibilidade]*";
    }

    return processed;
  }

  addMessage(sender, text, type = "normal") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender.toLowerCase()} ${type} fade-in`;
    
    const senderSpan = document.createElement("span");
    senderSpan.className = "sender";
    senderSpan.textContent = `${sender}:`;
    
    const textSpan = document.createElement("span");
    textSpan.className = "text";
    textSpan.innerHTML = this.formatMessage(text);
    
    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(textSpan);
    DOM.responseArea.appendChild(messageDiv);
    
    // Rolagem automática
    if (AppState.userPreferences.autoScroll) {
      DOM.responseArea.scrollTop = DOM.responseArea.scrollHeight;
    }
    
    // Salvar no histórico
    if (sender !== "Sistema") {
      AppState.conversationHistory.push({
        role: sender === "Você" ? "user" : "assistant",
        content: text,
        timestamp: new Date().toISOString(),
        type: type
      });
      
      // Salvar no localStorage
      this.saveConversationHistory();
    }

    // Efeito sonoro
    if (AppState.userPreferences.soundEffects && sender === "Aura") {
      this.playSound('message');
    }
  }

  formatMessage(text) {
    // Formatação básica de markdown
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  }

  // Sistema de segurança avançado
  async checkSafety(text) {
    const textLower = text.toLowerCase();
    
    // Verificar filtros de segurança
    for (const filter of DIRECTIVES.safetyFilters) {
      if (textLower.includes(filter)) {
        return {
          safe: false,
          message: "Desculpe, não posso ajudar com este tipo de solicitação por questões de segurança e conformidade com nossas políticas."
        };
      }
    }

    // Detecção avançada de dados pessoais
    const personalDataPatterns = [
      /\b(senha|password|cpf|cartão|crédito|conta bancária|rg)\b/i,
      /\b(\d{3}\.\d{3}\.\d{3}-\d{2})\b/,
      /\b(\d{2}\.\d{3}\.\d{3}-\d{1})\b/,
      /\b(\d{4}-\d{4}-\d{4}-\d{4})\b/
    ];

    for (const pattern of personalDataPatterns) {
      if (pattern.test(text)) {
        return {
          safe: false,
          message: "Por segurança, não compartilhe dados pessoais. Nunca solicitamos informações sensíveis como senhas, documentos ou dados financeiros."
        };
      }
    }

    return { safe: true };
  }

  // Sistema de notificações
  showNotification(message, type = "info", duration = 5000) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    
    const icon = type === "success" ? "fa-check" : 
                 type === "error" ? "fa-exclamation-triangle" : 
                 type === "warning" ? "fa-exclamation-circle" : "fa-info-circle";
    
    notification.innerHTML = `
      <i class="fas ${icon}"></i>
      <span>${message}</span>
    `;
    
    DOM.notificationArea.appendChild(notification);
    
    // Remover após o tempo especificado
    setTimeout(() => {
      notification.remove();
    }, duration);
  }

  // Controle de tema
  toggleTheme() {
    const newTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    AppState.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Atualizar ícone do botão
    const themeConfig = THEMES[theme];
    DOM.themeToggle.innerHTML = `
      <i class="fas ${themeConfig.icon}"></i>
      ${themeConfig.label}
    `;
    
    // Salvar preferência
    this.saveUserPreferences();
    
    this.showNotification(`Tema ${theme === 'light' ? 'claro' : 'escuro'} ativado`, "success");
  }

  // Gerenciamento de cookies
  acceptAllCookies() {
    localStorage.setItem("cookiesAccepted", "true");
    localStorage.setItem("analyticsCookies", "true");
    localStorage.setItem("adsCookies", "true");
    localStorage.setItem("essentialCookies", "true");
    
    DOM.cookieBanner.style.display = "none";
    DOM.cookieModal.style.display = "none";
    
    this.showNotification("Preferências de cookies salvas", "success");
  }

  rejectAllCookies() {
    localStorage.setItem("cookiesAccepted", "false");
    localStorage.setItem("analyticsCookies", "false");
    localStorage.setItem("adsCookies", "false");
    localStorage.setItem("essentialCookies", "true");
    
    DOM.cookieBanner.style.display = "none";
    DOM.cookieModal.style.display = "none";
    
    this.showNotification("Cookies não essenciais desativados", "info");
  }

  saveCookiePreferences() {
    const analytics = document.getElementById("analyticsCookies").checked;
    const ads = document.getElementById("adsCookies").checked;
    
    localStorage.setItem("cookiesAccepted", "true");
    localStorage.setItem("analyticsCookies", analytics.toString());
    localStorage.setItem("adsCookies", ads.toString());
    localStorage.setItem("essentialCookies", "true");
    
    DOM.cookieBanner.style.display = "none";
    DOM.cookieModal.style.display = "none";
    
    this.showNotification("Preferências de cookies salvas", "success");
  }

  // Funções auxiliares
  showTypingIndicator() {
    DOM.typingIndicator.style.display = "flex";
    AppState.typing = true;
  }

  hideTypingIndicator() {
    DOM.typingIndicator.style.display = "none";
    AppState.typing = false;
  }

  toggleSidebar(show = null) {
    const shouldShow = show !== null ? show : !DOM.sidebar.classList.contains("active");
    
    if (shouldShow) {
      DOM.sidebar.classList.add("active");
      this.loadConversationList();
    } else {
      DOM.sidebar.classList.remove("active");
    }
  }

  showSettings() {
    DOM.settingsModal.style.display = "flex";
  }

  hideSettings() {
    DOM.settingsModal.style.display = "none";
  }

  showCookieModal() {
    DOM.cookieModal.style.display = "flex";
  }

  hideCookieModal() {
    DOM.cookieModal.style.display = "none";
  }

  updateStats() {
    DOM.messageCount.textContent = `${AppState.sessionStats.messageCount} mensagens`;
    this.updateSessionTime();
  }

  updateSessionTime() {
    const now = new Date();
    const diff = now - AppState.sessionStats.startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    DOM.sessionTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  startSessionTimer() {
    setInterval(() => this.updateSessionTime(), 1000);
  }

  playSound(type) {
    if (!AppState.userPreferences.soundEffects) return;
    
    // Implementar sons conforme necessário
    console.log(`Playing sound: ${type}`);
  }

  // Persistência de dados
  saveUserPreferences() {
    localStorage.setItem("auraPreferences", JSON.stringify(AppState.userPreferences));
    localStorage.setItem("auraTheme", AppState.currentTheme);
  }

  loadUserPreferences() {
    const savedPrefs = localStorage.getItem("auraPreferences");
    const savedTheme = localStorage.getItem("auraTheme");
    
    if (savedPrefs) {
      AppState.userPreferences = { ...AppState.userPreferences, ...JSON.parse(savedPrefs) };
    }
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
    
    // Aplicar preferências carregadas
    this.applyLoadedPreferences();
  }

  applyLoadedPreferences() {
    DOM.modelSelect.value = AppState.userPreferences.model;
    DOM.temperatureSlider.value = AppState.userPreferences.temperature;
    DOM.temperatureValue.textContent = AppState.userPreferences.temperature;
    DOM.soundEffects.checked = AppState.userPreferences.soundEffects;
    DOM.autoScroll.checked = AppState.userPreferences.autoScroll;
  }

  saveConversationHistory() {
    localStorage.setItem("auraConversation", JSON.stringify(AppState.conversationHistory));
  }

  loadConversationHistory() {
    const saved = localStorage.getItem("auraConversation");
    if (saved) {
      AppState.conversationHistory = JSON.parse(saved);
      this.renderConversationHistory();
    }
  }

  renderConversationHistory() {
    // Limpar área de resposta
    DOM.responseArea.innerHTML = "";
    
    // Adicionar mensagens do histórico
    AppState.conversationHistory.forEach(msg => {
      const sender = msg.role === "user" ? "Você" : "Aura";
      this.addMessage(sender, msg.content, msg.type);
    });
  }

  loadConversationList() {
    // Implementar carregamento da lista de conversas
    const conversationList = document.getElementById("conversationList");
    conversationList.innerHTML = "<p>Histórico de conversas</p>";
  }

  showWelcomeMessage() {
    setTimeout(() => {
      this.addMessage("Aura", "Olá! Sou a Aura, sua assistente IA. Estou aqui para ajudar você com informações e suporte. Como posso ser útil hoje? 😊", "welcome");
    }, 1000);
  }

  checkConnectivity() {
    // Verificar conectividade com a API
    fetch(MISTRAL_CONFIG.endpoint, { method: 'HEAD' })
      .then(() => {
        DOM.modelStatus.textContent = "Conectado";
        DOM.modelStatus.style.color = "var(--success-color)";
      })
      .catch(() => {
        DOM.modelStatus.textContent = "Offline";
        DOM.modelStatus.style.color = "var(--error-color)";
        this.showNotification("Modo offline ativado", "warning");
      });
  }

  // Novas funcionalidades
  updateModel(modelId) {
    AppState.userPreferences.model = modelId;
    this.saveUserPreferences();
    this.showNotification(`Modelo alterado para: ${modelId}`, "success");
  }

  updateTemperature(value) {
    AppState.userPreferences.temperature = value;
    DOM.temperatureValue.textContent = value;
    this.saveUserPreferences();
  }

  toggleSoundEffects(enabled) {
    AppState.userPreferences.soundEffects = enabled;
    this.saveUserPreferences();
  }

  toggleAutoScroll(enabled) {
    AppState.userPreferences.autoScroll = enabled;
    this.saveUserPreferences();
  }

  clearChat() {
    if (confirm("Tem certeza que deseja limpar toda a conversa?")) {
      AppState.conversationHistory = [];
      DOM.responseArea.innerHTML = "";
      this.saveConversationHistory();
      this.addMessage("Sistema", "Conversa reiniciada. Como posso ajudar você?", "system");
      this.showNotification("Conversa limpa", "success");
    }
  }

  exportChat() {
    if (AppState.conversationHistory.length === 0) {
      this.showNotification("Não há conversa para exportar", "warning");
      return;
    }

    const chatData = {
      exportDate: new Date().toISOString(),
      version: "2.0",
      totalMessages: AppState.conversationHistory.length,
      sessionDuration: new Date() - AppState.sessionStats.startTime,
      conversation: AppState.conversationHistory
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversa-aura-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.showNotification("Conversa exportada com sucesso", "success");
  }

  startVoiceInput() {
    this.showNotification("Reconhecimento de voz não implementado", "warning");
    // Implementar reconhecimento de voz aqui
  }

  shouldAddReferences(text) {
    const referenceKeywords = ['termo', 'política', 'privacidade', 'legal', 'contrato', 'condições', 'direito'];
    return referenceKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  getTermosUrl() {
    return "https://termos.orpheostudio.com.br";
  }

  getPoliticasUrl() {
    return "https://politicas.orpheostudio.com.br";
  }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
  window.auraChat = new AuraChat();
});

// Gerenciamento de erros global
window.addEventListener('error', (e) => {
  console.error('Erro global:', e.error);
  if (window.auraChat) {
    window.auraChat.showNotification("Ocorreu um erro inesperado", "error");
  }
});

// Service Worker para funcionalidades offline (opcional)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => console.log('SW registered'))
    .catch(error => console.log('SW registration failed'));
}
