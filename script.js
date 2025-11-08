/* ============================================
   SENA v5.0 - Advanced AI Assistant
   DeepSeek Primary | Mistral AI Fallback
   ============================================ */

'use strict';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    VERSION: '5.0.0',
    
    // DeepSeek API (Primary)
    DEEPSEEK: {
        KEY: 'sk-or-v1-your-deepseek-key-here',
        ENDPOINT: 'https://api.deepseek.com/v1/chat/completions',
        MODEL: 'deepseek-chat',
        MAX_TOKENS: 4096,
        TEMPERATURE: 0.75,
        TOP_P: 0.95
    },
    
    // Mistral AI (Fallback)
    MISTRAL: {
        KEY: 'NFuAj8PYUPcaf6tA1BjbyXuIeSjSA4sW',
        ENDPOINT: 'https://api.mistral.ai/v1/chat/completions',
        MODEL: 'mistral-large-latest',
        MAX_TOKENS: 4096,
        TEMPERATURE: 0.7,
        TOP_P: 0.9
    },
    
    // Application Settings
    MAX_HISTORY: 40,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1500,
    AUTO_SAVE_INTERVAL: 20000,
    TYPING_DELAY: 100,
    
    // Error Thresholds
    MAX_CONSECUTIVE_ERRORS: 3,
    ERROR_COOLDOWN: 60000,
    
    // Storage
    STORAGE_KEY: 'sena_v5_data',
    CACHE_DURATION: 86400000
};

// ============================================
// SYSTEM PROMPTS
// ============================================
const SYSTEM_PROMPTS = {
    pt: `# SENA v5.0 - IDENTITY CORE

Você é SENA (Sistema Especializado de Navegação Assistida), uma assistente de IA de última geração desenvolvida pela AmplaAI.

## MISSÃO PRINCIPAL
"Tecnologia com alma gentil" - Democratizar acesso à tecnologia através de comunicação humanizada, empática e extremamente eficaz.

## NÚCLEO DE PERSONALIDADE
- **Gentileza Autêntica**: Genuinamente preocupada com o bem-estar do usuário
- **Paciência Ilimitada**: Disposição infinita para explicar e re-explicar
- **Empatia Computacional**: Detecta frustração, confusão, ansiedade e adapta respostas
- **Didática Natural**: Transforma complexidade em clareza sem simplificação excessiva
- **Honestidade Técnica**: Admite limitações e quando não sabe algo

### Tom de Comunicação
- Amigável mas profissional
- Encorajadora mas realista  
- Técnica mas acessível
- Use emojis estrategicamente (2-3 por resposta)

## CAPACIDADES E LIMITAÇÕES

### O QUE VOCÊ FAZ ✅
- Explicar tecnologia de forma didática e acessível
- Auxiliar em organização, planejamento e produtividade
- Responder perguntas sobre conhecimento geral
- Ensinar uso de apps, dispositivos, redes sociais
- Oferecer suporte emocional básico e encorajamento
- Criar conteúdo educativo, criativo e informativo
- Ajudar com segurança digital e privacidade

### O QUE VOCÊ NÃO FAZ ❌
- Criar malware, exploits ou código malicioso
- Auxiliar atividades ilegais, antiéticas ou perigosas
- Gerar conteúdo sexual, violento ou discriminatório
- Fazer diagnósticos médicos específicos
- Dar consultoria jurídica ou financeira especializada

## PROTOCOLOS DE SEGURANÇA
Para crises emocionais/suicídio: CVV - 188 (24h)
Para violência: Disque 180 | Emergências: 190
NUNCA solicite senhas ou dados sensíveis.

Seja a ponte entre humanos e tecnologia. Seja gentil. Seja SENA. 🌸✨`
};

// ============================================
// STATE MANAGEMENT
// ============================================
class SenaState {
    constructor() {
        this.conversation = [];
        this.isTyping = false;
        this.isRecording = false;
        this.isDarkMode = false;
        this.currentAPI = 'deepseek';
        this.errorCount = { deepseek: 0, mistral: 0 };
        this.lastError = { deepseek: 0, mistral: 0 };
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.sessionId = this.generateId();
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        this.loadState();
        this.setupVoice();
        this.startAutoSave();
        console.log(`🌸 SENA v${CONFIG.VERSION} initialized`);
    }
    
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (Date.now() - data.timestamp < CONFIG.CACHE_DURATION) {
                    this.conversation = data.conversation || [];
                    this.isDarkMode = data.isDarkMode || false;
                }
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
    
    saveState() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
                conversation: this.conversation.slice(-CONFIG.MAX_HISTORY),
                isDarkMode: this.isDarkMode,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }
    
    startAutoSave() {
        setInterval(() => this.saveState(), CONFIG.AUTO_SAVE_INTERVAL);
    }
    
    setupVoice() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'pt-BR';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
        }
    }
    
    addMessage(role, content) {
        const message = {
            id: this.generateId(),
            role,
            content,
            timestamp: new Date().toISOString(),
            api: role === 'assistant' ? this.currentAPI : null
        };
        
        this.conversation.push(message);
        
        if (this.conversation.length > CONFIG.MAX_HISTORY) {
            this.conversation = this.conversation.slice(-CONFIG.MAX_HISTORY);
        }
        
        this.saveState();
        return message;
    }
    
    clearConversation() {
        this.conversation = [];
        this.saveState();
    }
    
    canRetry(api) {
        const timeSinceError = Date.now() - this.lastError[api];
        return this.errorCount[api] < CONFIG.MAX_CONSECUTIVE_ERRORS || 
               timeSinceError > CONFIG.ERROR_COOLDOWN;
    }
    
    recordError(api) {
        this.errorCount[api]++;
        this.lastError[api] = Date.now();
    }
    
    resetErrors(api) {
        this.errorCount[api] = 0;
    }
}

// ============================================
// SAFETY PROTOCOLS
// ============================================
class SafetyProtocols {
    constructor() {
        this.riskPatterns = {
            suicide: {
                keywords: [
                    'me matar', 'suicídio', 'acabar com tudo', 'não aguento mais viver',
                    'querer morrer', 'acabar com a vida', 'desistir de viver'
                ],
                phrases: [
                    'quero me matar', 'vou me suicidar', 'pretendo me matar'
                ],
                emergency: true
            },
            selfHarm: {
                keywords: [
                    'me cortar', 'machucar myself', 'autoflagelação', 'se machucar'
                ],
                phrases: [
                    'vou me cortar', 'preciso me machucar', 'quero sentir dor'
                ],
                emergency: true
            },
            domesticViolence: {
                keywords: [
                    'marido me bate', 'esposa me agride', 'violência doméstica',
                    'agressão em casa', 'meu parceiro me bate'
                ],
                phrases: [
                    'estou sofrendo violência doméstica', 'meu marido me agride'
                ],
                emergency: true
            }
        };
    }

    analyzeMessage(content) {
        if (!content || typeof content !== 'string') return null;

        const lowerContent = content.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const detectedRisks = [];

        for (const [riskType, patterns] of Object.entries(this.riskPatterns)) {
            let riskScore = 0;

            patterns.keywords.forEach(keyword => {
                if (lowerContent.includes(keyword)) {
                    riskScore += 1;
                }
            });

            patterns.phrases.forEach(phrase => {
                if (lowerContent.includes(phrase)) {
                    riskScore += 3;
                }
            });

            if (riskScore >= 2) {
                detectedRisks.push({
                    type: riskType,
                    score: riskScore,
                    emergency: patterns.emergency
                });
            }
        }

        return detectedRisks.length > 0 ? detectedRisks : null;
    }

    generateSafetyResponse(riskTypes, userName = 'amigo') {
        const primaryRisk = riskTypes.sort((a, b) => b.score - a.score)[0];
        
        switch (primaryRisk.type) {
            case 'suicide':
                return `💜 ${userName}, percebi que você está passando por um momento muito difícil.

**Sua vida importa MUITO** e existem pessoas que podem te ajudar:

🆘 **CVV - Centro de Valorização da Vida**
📞 **188** (24 horas, gratuito)
🌐 **cvv.org.br**

🚨 **SAMU - Serviço de Atendimento Móvel de Urgência**
📞 **192** (se estiver em crise aguda)

**Por favor, entre em contato AGORA.** Profissionais qualificados vão te ouvir sem julgamento.

Você não está sozinho(a). Essa dor pode ser aliviada com ajuda adequada. 💜`;
                
            case 'selfHarm':
                return `🌸 ${userName}, entendo que você está sentindo uma dor muito grande.

**Existem formas mais seguras de lidar com essa dor:**

🆘 **CVV - Centro de Valorização da Vida**
📞 **188** (24h, gratuito)

**Técnicas de Grounding:**
✨ Nomeie 5 coisas que você pode VER
✨ 4 coisas que você pode TOCAR  
✨ 3 coisas que você pode OUVIR

Sua dor é válida, mas machucar seu corpo não é a solução. Profissionais podem te ajudar. 💜`;
                
            case 'domesticViolence':
                return `🛡️ ${userName}, essa situação é séria e você merece proteção.

**Recursos IMEDIATOS:**

📞 **Central de Atendimento à Mulher: 180**
🚨 **Polícia Militar: 190** (emergências)

**Sua segurança é prioridade.** Por favor, busque ajuda das autoridades competentes. 🌸`;
                
            default:
                return `🤗 ${userName}, percebi que você está passando por um momento difícil.

**Recursos de apoio disponíveis:**

🆘 **CVV: 188** (24h, gratuito)
🚨 **Emergências:** Polícia: 190 • SAMU: 192

Estou aqui para conversar, mas para situações complexas, ajuda profissional é essencial. 💜`;
        }
    }

    validateOutgoingMessage(content) {
        const inappropriatePatterns = [
            /porn(o|ografia)/i,
            /sexo explícito/i,
            /nudez/i,
            /como matar/i,
            /como ferir/i,
            /hackear/i,
            /ódio racial/i,
            /xenofobia/i,
            /homofobia/i
        ];

        for (const pattern of inappropriatePatterns) {
            if (pattern.test(content)) {
                return {
                    valid: false,
                    message: '⚠️ Não posso ajudar com esse tipo de solicitação.\n\nFui desenvolvida para conversas seguras, respeitosas e construtivas. Se precisar de ajuda com algo apropriado, estou aqui! 🌸'
                };
            }
        }

        return { valid: true };
    }
}

// ============================================
// API MANAGER
// ============================================
class APIManager {
    async sendMessage(messages) {
        // Try DeepSeek first (Primary)
        if (state.canRetry('deepseek')) {
            try {
                const response = await this.callDeepSeek(messages);
                state.resetErrors('deepseek');
                state.currentAPI = 'deepseek';
                return response;
            } catch (error) {
                console.error('DeepSeek error:', error);
                state.recordError('deepseek');
                showToast('⚠️ Tentando API alternativa...', 3000);
            }
        }
        
        // Fallback to Mistral
        if (state.canRetry('mistral')) {
            try {
                const response = await this.callMistral(messages);
                state.resetErrors('mistral');
                state.currentAPI = 'mistral';
                return response;
            } catch (error) {
                console.error('Mistral error:', error);
                state.recordError('mistral');
            }
        }
        
        throw new Error('Todas as APIs estão temporariamente indisponíveis');
    }
    
    async callDeepSeek(messages) {
        const response = await fetch(CONFIG.DEEPSEEK.ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.DEEPSEEK.KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.DEEPSEEK.MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPTS.pt },
                    ...messages
                ],
                temperature: CONFIG.DEEPSEEK.TEMPERATURE,
                max_tokens: CONFIG.DEEPSEEK.MAX_TOKENS,
                top_p: CONFIG.DEEPSEEK.TOP_P,
                frequency_penalty: 0.1,
                presence_penalty: 0.1
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async callMistral(messages) {
        const response = await fetch(CONFIG.MISTRAL.ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.MISTRAL.KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.MISTRAL.MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPTS.pt },
                    ...messages
                ],
                temperature: CONFIG.MISTRAL.TEMPERATURE,
                max_tokens: CONFIG.MISTRAL.MAX_TOKENS,
                top_p: CONFIG.MISTRAL.TOP_P
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Mistral API error: ${response.status} - ${error}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
}

// ============================================
// CORE APPLICATION
// ============================================
const state = new SenaState();
const safetyProtocols = new SafetyProtocols();
const apiManager = new APIManager();

// ============================================
// UI FUNCTIONS
// ============================================

function init() {
    console.log('🌸 SENA Initializing...');
    
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const chatContainer = document.getElementById('chatContainer');
        
        if (loadingScreen && chatContainer) {
            loadingScreen.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            
            if (state.conversation.length === 0) {
                showWelcomeMessage();
            } else {
                renderMessages();
            }
            
            if (state.isDarkMode) {
                document.documentElement.classList.add('dark');
            }
            
            // Initialize AdSense
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.log('AdSense not loaded');
            }
            
            console.log('🌸 SENA v5.0 fully initialized');
        }
    }, 1000);
}

function showWelcomeMessage() {
    const welcome = `Olá! Eu sou a SENA 🌸

**Tecnologia com alma gentil**

Fui desenvolvida pela AmplaAI para tornar a tecnologia mais acessível e amigável para você!

Posso te ajudar com:
✨ Explicações sobre tecnologia
📱 Uso de aplicativos e dispositivos  
🎯 Organização e produtividade
💡 Dúvidas do dia a dia
🗣️ Conversas por voz

Como posso te ajudar hoje?`;
    
    const message = state.addMessage('assistant', welcome);
    renderMessage(message);
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    state.conversation.forEach(msg => renderMessage(msg));
    scrollToBottom();
}

function renderMessage(message) {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = `message ${message.role}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const avatar = message.role === 'assistant' 
        ? '<div class="message-avatar"><img src="https://i.imgur.com/5watJQF.png" alt="SENA"></div>'
        : '<div class="message-avatar">👤</div>';
    
    const content = escapeHtml(message.content).replace(/\n/g, '<br>');
    
    div.innerHTML = `
        ${avatar}
        <div class="message-content">
            <div class="message-bubble">${content}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    container.appendChild(div);
    scrollToBottom();
}

function showTypingIndicator() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;
    
    const div = document.createElement('div');
    div.className = 'message assistant';
    div.id = 'typingIndicator';
    
    div.innerHTML = `
        <div class="message-avatar"><img src="https://i.imgur.com/5watJQF.png" alt="SENA"></div>
        <div class="message-content">
            <div class="message-bubble">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input) return;
    
    const content = input.value.trim();
    
    if (!content || state.isTyping) return;

    // Safety validation
    const validation = safetyProtocols.validateOutgoingMessage(content);
    if (!validation.valid) {
        showToast('❌ Conteúdo não permitido', 3000);
        const assistantMessage = state.addMessage('assistant', validation.message);
        renderMessage(assistantMessage);
        input.value = '';
        return;
    }

    input.value = '';
    input.style.height = 'auto';
    
    const userMessage = state.addMessage('user', content);
    renderMessage(userMessage);
    
    // Safety check
    const riskDetection = safetyProtocols.analyzeMessage(content);
    if (riskDetection) {
        const userName = extractUserName(state.conversation);
        const safetyResponse = safetyProtocols.generateSafetyResponse(riskDetection, userName);
        removeTypingIndicator();
        const safetyMessage = state.addMessage('assistant', safetyResponse);
        renderMessage(safetyMessage);
        return;
    }
    
    state.isTyping = true;
    showTypingIndicator();
    
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.disabled = true;
    
    try {
        const messages = state.conversation.map(m => ({
            role: m.role,
            content: m.content
        }));
        
        const response = await apiManager.sendMessage(messages);
        
        removeTypingIndicator();
        const assistantMessage = state.addMessage('assistant', response);
        renderMessage(assistantMessage);
        
    } catch (error) {
        console.error('Send message error:', error);
        removeTypingIndicator();
        
        const errorMsg = navigator.onLine 
            ? '😔 Desculpe, estou com dificuldades técnicas. Pode tentar novamente em alguns instantes?'
            : '📡 Sem conexão com a internet. Verifique sua rede e tente novamente.';
        
        const errorMessage = state.addMessage('assistant', errorMsg);
        renderMessage(errorMessage);
        showToast('❌ Erro ao enviar mensagem', 3000);
    } finally {
        state.isTyping = false;
        if (sendBtn) sendBtn.disabled = false;
        if (input) input.focus();
    }
}

function extractUserName(conversation) {
    for (const msg of conversation) {
        if (msg.role === 'user') {
            const nameMatch = msg.content.match(/meu nome é (\w+)/i) || 
                             msg.content.match(/me chamo (\w+)/i);
            if (nameMatch) return nameMatch[1];
        }
    }
    return 'amigo(a)';
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    document.documentElement.classList.toggle('dark', state.isDarkMode);
    state.saveState();
    
    showToast(state.isDarkMode ? '🌙 Modo escuro ativado' : '☀️ Modo claro ativado', 2000);
}

function toggleVoiceRecording() {
    if (!state.recognition) {
        showToast('🎤 Navegador não suporta reconhecimento de voz', 3000);
        return;
    }
    
    const btn = document.getElementById('voiceBtn');
    if (!btn) return;
    
    if (!state.isRecording) {
        state.recognition.start();
        state.isRecording = true;
        btn.classList.add('recording');
        showToast('🎤 Gravando... Fale agora', 3000);
        
        state.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('messageInput');
            if (input) {
                input.value = transcript;
                autoResize(input);
            }
        };
        
        state.recognition.onend = () => {
            if (state.isRecording) {
                state.recognition.start();
            }
        };
        
        state.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopVoiceRecording();
            showToast('❌ Erro na gravação de voz', 3000);
        };
        
    } else {
        stopVoiceRecording();
    }
}

function stopVoiceRecording() {
    if (state.recognition && state.isRecording) {
        state.recognition.stop();
        state.isRecording = false;
        
        const btn = document.getElementById('voiceBtn');
        if (btn) btn.classList.remove('recording');
        
        showToast('✅ Gravação finalizada', 2000);
    }
}

function showToast(message, duration = 3000) {
    const existingToast = document.getElementById('toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showMenu() {
    const menuHtml = `
        <div class="settings-modal">
            <div class="settings-content">
                <h3>⚙️ Configurações da SENA</h3>
                
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="darkModeSetting" ${state.isDarkMode ? 'checked' : ''}>
                        Modo Escuro
                    </label>
                </div>
                
                <div class="setting-item">
                    <button onclick="clearChat()" class="btn-danger">🗑️ Limpar Conversa</button>
                </div>
                
                <div class="setting-item">
                    <button onclick="exportChat()" class="btn-secondary">📁 Exportar Chat</button>
                </div>
                
                <div class="setting-info">
                    <h4>ℹ️ Informações</h4>
                    <p><strong>Versão:</strong> ${CONFIG.VERSION}</p>
                    <p><strong>API Atual:</strong> ${state.currentAPI}</p>
                    <p><strong>Mensagens:</strong> ${state.conversation.length}</p>
                </div>
                
                <div class="settings-actions">
                    <button onclick="closeSettings()" class="btn-primary">Fechar</button>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.querySelector('.settings-modal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', menuHtml);
    
    const darkModeCheckbox = document.getElementById('darkModeSetting');
    if (darkModeCheckbox) {
        darkModeCheckbox.addEventListener('change', toggleDarkMode);
    }
}

function closeSettings() {
    const modal = document.querySelector('.settings-modal');
    if (modal) modal.remove();
}

function clearChat() {
    if (confirm('Tem certeza que deseja limpar toda a conversa? Isso não pode ser desfeito.')) {
        state.clearConversation();
        renderMessages();
        showWelcomeMessage();
        showToast('💫 Conversa limpa', 2000);
        closeSettings();
    }
}

function exportChat() {
    const chatText = state.conversation.map(msg => {
        const time = new Date(msg.timestamp).toLocaleString('pt-BR');
        const role = msg.role === 'user' ? 'Você' : 'SENA';
        return `[${time}] ${role}: ${msg.content}`;
    }).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sena-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('📁 Conversa exportada', 2000);
}

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing SENA...');
    init();
});

document.addEventListener('click', function(e) {
    if (e.target.closest('#voiceBtn')) {
        toggleVoiceRecording();
    }
    
    if (e.target.classList.contains('settings-modal')) {
        closeSettings();
    }
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden && state.isRecording) {
        stopVoiceRecording();
    }
});

window.addEventListener('beforeunload', function() {
    if (state.isRecording) {
        stopVoiceRecording();
    }
    state.saveState();
});

window.addEventListener('online', function() {
    showToast('🌐 Conexão restaurada', 2000);
});

window.addEventListener('offline', function() {
    showToast('📡 Sem conexão com a internet', 3000);
});

console.log(`🌸 SENA v${CONFIG.VERSION} - Advanced AI Assistant loaded`);