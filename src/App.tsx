import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./components/ChatMessage";
import { QuickActions } from "./components/QuickActions";
import { ChatInput } from "./components/ChatInput";
import { AccessibilityPanel, AccessibilitySettings } from "./components/AccessibilityPanel";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { MenuHamburger } from "./components/MenuHamburger";
import { ChatTabs } from "./components/ChatTabs";
import { getBotResponse } from "./components/ChatbotResponses";
import { getMistralResponse, isMistralConfigured } from "./services/mistral-service";
import { Star } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('sena-welcome-accepted');
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Olá! Eu sou a Sena, sua assistente digital kawaii! ✨💜

Estou aqui para ajudar você com tecnologia de forma simples, paciente e super fofa!

**Sou especialista em ajudar:**
• Pessoas com 60+ anos 👵🏻
• Pessoas com dificuldades visuais ou motoras ♿
• Quem está começando com tecnologia 🌱

**Posso te ensinar sobre:**
📱 Como usar o celular
💬 WhatsApp e mensagens
📧 E-mail
📸 Tirar e enviar fotos
🏦 Banco digital e PIX
🛒 Compras online seguras
⚙️ Configurações do celular

**🎤 NOVIDADE:** Agora você pode me ouvir e falar comigo!
• Clique no ícone de microfone para falar 🎙️
• Clique em "Ouvir" em qualquer mensagem 🔊
• Configure a acessibilidade no menu ⚙️

Escolha uma opção abaixo ou me conte sua dúvida! 💖✨`,
      isBot: true,
      timestamp: new Date()
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [speakFunction, setSpeakFunction] = useState<((text: string) => void) | null>(null);
  
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    highContrast: false,
    ttsEnabled: false,
    autoReadMessages: false,
    reducedMotion: false,
    largeClickTargets: false,
    speechSpeed: 1.0,
    speechVolume: 0.7,
    keyboardNavigation: true
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (!settings.reducedMotion) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      messagesEndRef.current?.scrollIntoView();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, settings.reducedMotion]);

  // Aplicar configurações de acessibilidade
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
    
    if (settings.reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }

    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [settings]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAccessibilityPanel) {
          setShowAccessibilityPanel(false);
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        clearChat();
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setShowAccessibilityPanel(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAccessibilityPanel]);

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);

    // Auto-ler mensagens do bot se habilitado
    if (isBot && settings.autoReadMessages && speakFunction) {
      setTimeout(() => {
        speakFunction(text);
      }, 500);
    }
  };

  const handleSendMessage = async (text: string) => {
    // Adiciona mensagem do usuário
    addMessage(text, false);
    
    // Simula o bot "digitando"
    setIsTyping(true);
    
    // Anunciar que está processando
    if (speakFunction && settings.ttsEnabled) {
      speakFunction("Entendi! Deixe-me pensar na melhor resposta para você.");
    }
    
    try {
      let response: string;
      
      // Tenta usar Mistral AI primeiro se configurado
      if (isMistralConfigured()) {
        try {
          // Pega últimas 3 mensagens para contexto
          const recentMessages = messages.slice(-6).map(msg => ({
            role: msg.isBot ? "assistant" as const : "user" as const,
            content: msg.text
          }));
          
          response = await getMistralResponse(text, recentMessages);
        } catch (mistralError) {
          console.error('Erro ao usar Mistral AI, usando fallback:', mistralError);
          response = await getBotResponse("", text);
        }
      } else {
        // Usa sistema de respostas local
        response = await getBotResponse("", text);
      }
      
      addMessage(response, true);
    } catch (error) {
      console.error('Erro ao obter resposta:', error);
      addMessage("Desculpe, tive um problema técnico. Pode repetir sua pergunta? 🥺", true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsTyping(true);
    
    // Anunciar ação selecionada
    if (speakFunction && settings.ttsEnabled) {
      const actionLabels: { [key: string]: string } = {
        'celular-basico': 'Vou te ensinar como usar o celular',
        'wifi': 'Vou explicar como conectar no WiFi',
        'whatsapp': 'Vou te ajudar com o WhatsApp',
        'email': 'Vou te ensinar sobre e-mail',
        'camera': 'Vou explicar como usar a câmera',
        'ligacao': 'Vou te ensinar a fazer ligações',
        'compras': 'Vou explicar sobre compras online',
        'banco': 'Vou te ajudar com banco digital',
        'configuracoes': 'Vou explicar as configurações',
        'outros': 'Vou te ajudar com outras dúvidas'
      };
      speakFunction(actionLabels[action] || 'Preparando sua resposta...');
    }
    
    try {
      const response = await getBotResponse(action);
      addMessage(response, true);
    } catch (error) {
      console.error('Erro ao obter resposta da ação:', error);
      addMessage("Desculpe, tive um problema ao processar esta opção. Tente novamente. 💫", true);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        text: `Olá! Eu sou a Sena, sua assistente digital kawaii! ✨💜

Estou aqui para ajudar você com tecnologia de forma simples e paciente.

O que você gostaria de aprender hoje? 🌸`,
        isBot: true,
        timestamp: new Date()
      }
    ]);

    if (speakFunction && settings.ttsEnabled) {
      speakFunction("Nova conversa iniciada! Como posso ajudar você hoje?");
    }
  };

  const handleWelcomeAccept = () => {
    localStorage.setItem('sena-welcome-accepted', 'true');
    setShowWelcome(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark');
    
    if (speakFunction && settings.ttsEnabled) {
      speakFunction(isDarkMode ? "Modo claro ativado" : "Modo escuro ativado");
    }
  };

  const toggleTTS = () => {
    const newTTSState = !settings.ttsEnabled;
    setSettings(prev => ({ ...prev, ttsEnabled: newTTSState }));
    
    if (speakFunction) {
      speakFunction(newTTSState ? "Leitura de voz ativada" : "Leitura de voz desativada");
    }
  };

  const handleSpeakText = useCallback((speakFunc: (text: string) => void) => {
    setSpeakFunction(() => speakFunc);
  }, []);

  const handleSpeakMessage = useCallback((text: string) => {
    if (speakFunction) {
      speakFunction(text);
    }
  }, [speakFunction]);

  if (showWelcome) {
    return <WelcomeScreen onAccept={handleWelcomeAccept} />;
  }

  return (
    <div className={`chat-container ${isDarkMode ? 'dark' : ''} ${
      settings.highContrast ? 'high-contrast' : ''
    } ${settings.keyboardNavigation ? 'keyboard-navigation' : ''} ${
      settings.largeClickTargets ? 'large-click-targets' : ''
    }`}>
      {/* Skip Link para acessibilidade */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded z-50"
      >
        Pular para conteúdo principal
      </a>

      {/* Header Simplificado */}
      <header 
        className="border-b border-[#E8D5F5] dark:border-[#3D2A4D] px-4 py-4"
        style={{
          background: 'var(--background)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.imgur.com/Dc3f5ZQ.jpeg" 
              alt="Sena"
              className="w-12 h-12 rounded-full border-2 border-[#B894E8] object-cover shadow-lg"
            />
            <div>
              <h1 className="text-xl font-bold gradient-text">
                Sena ✨
              </h1>
              <p className="text-sm text-[#9B8BB4] dark:text-[#B894E8]">
                Tecnologia com alma gentil
              </p>
            </div>
          </div>
          
          <MenuHamburger
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            settings={settings}
            onToggleTTS={toggleTTS}
            onOpenAccessibility={() => setShowAccessibilityPanel(true)}
            onClearChat={clearChat}
          />
        </div>
      </header>

      {/* Chat Content com Tabs */}
      <main id="main-content" className="flex-1 overflow-hidden" role="main" aria-label="Área de conversa com Sena">
        <ChatTabs>
          <div className="h-full flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="messages-container" role="log" aria-live="polite" aria-label="Conversa">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.isBot ? 'message-bot' : 'message-user'} group`}>
                    {message.isBot && (
                      <div className="message-sender">
                        <div className="message-avatar bot">
                          <img 
                            src="https://i.imgur.com/Dc3f5ZQ.jpeg" 
                            alt="Sena"
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <span>Sena ✨</span>
                      </div>
                    )}
                    
                    {!message.isBot && (
                      <div className="message-sender">
                        <Star className="h-4 w-4" aria-hidden="true" />
                        <span>Você</span>
                      </div>
                    )}
                    
                    <div className="message-content">
                      <div className="message-text" style={{ fontSize: `${settings.fontSize}px` }}>
                        {message.text}
                      </div>
                      
                      <div className="message-controls">
                        <ChatMessage
                          message={message.text}
                          isBot={message.isBot}
                          timestamp={message.timestamp}
                          onSpeakMessage={handleSpeakMessage}
                          settings={settings}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="message message-bot group">
                    <div className="message-sender">
                      <div className="message-avatar bot">
                        <img 
                          src="https://i.imgur.com/Dc3f5ZQ.jpeg" 
                          alt="Sena"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span>Sena ✨</span>
                    </div>
                    
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span style={{ fontSize: `${settings.fontSize}px` }}>
                          Sena está preparando sua resposta mágica...
                        </span>
                        {!settings.reducedMotion && (
                          <div className="typing-dots">
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Quick Actions */}
              {!isTyping && messages.length === 1 && (
                <div className="messages-container">
                  <QuickActions onActionClick={handleQuickAction} settings={settings} />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div 
              className="border-t border-[#E8D5F5] dark:border-[#3D2A4D] p-4"
              style={{
                background: 'var(--background)',
              }}
            >
              <div className="max-w-4xl mx-auto">
                <ChatInput 
                  onSendMessage={handleSendMessage} 
                  onSpeakText={handleSpeakText}
                  disabled={isTyping} 
                  settings={settings}
                />
              </div>
            </div>
          </div>
        </ChatTabs>
      </main>

      {/* Footer */}
      <footer 
        className="border-t border-[#E8D5F5] dark:border-[#3D2A4D] py-3 px-4"
        style={{
          background: 'var(--background)',
        }}
      >
        <p className="text-center text-sm text-[#9B8BB4] dark:text-[#B894E8]">
          Sena - V6.0 Powered by AmplaAI
        </p>
      </footer>

      {/* Accessibility Panel */}
      <AccessibilityPanel
        isOpen={showAccessibilityPanel}
        onClose={() => setShowAccessibilityPanel(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}
