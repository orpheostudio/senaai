/**
 * 🌙 Yume Chat Page - Main conversation interface
 * 
 * Features:
 * - Real-time messaging with WebSocket
 * - Voice interaction (STT/TTS)
 * - File upload support
 * - Conversation history
 * - Kawaii animations
 * - Accessibility optimized
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';

// Components
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { QuickActions } from '@/components/chat/QuickActions';
import { SidePanel } from '@/components/chat/SidePanel';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';

// Hooks
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSocketStore } from '@/store/socketStore';
import { useVoice } from '@/hooks/useVoice';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Utils
import { cn } from '@/utils/cn';
import { formatTime } from '@/utils/date';
import { playNotificationSound } from '@/utils/audio';

// Types
import type { Message, ConversationSettings } from '@/types/chat';

const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  // Store hooks
  const { user } = useAuthStore();
  const { 
    currentConversation, 
    messages, 
    isLoading,
    loadConversation,
    sendMessage,
    regenerateMessage,
    deleteMessage,
    updateConversationSettings
  } = useChatStore();
  
  const { 
    accessibility, 
    appearance, 
    voice: voiceSettings 
  } = useSettingsStore();
  
  const { isConnected, emit, on, off } = useSocketStore();

  // Voice interaction
  const {
    isListening,
    isSupported: voiceSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    isSpeaking
  } = useVoice({
    continuous: true,
    interimResults: true,
    language: 'pt-BR'
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (accessibility.reducedMotion) {
      messagesEndRef.current?.scrollIntoView();
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [accessibility.reducedMotion]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load conversation on mount
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId, loadConversation]);

  // WebSocket event handlers
  useEffect(() => {
    if (!isConnected) return;

    const handleTyping = (data: { isTyping: boolean; userId: string }) => {
      if (data.userId !== user?.id) {
        setIsTyping(data.isTyping);
      }
    };

    const handleMessageReceived = (message: Message) => {
      // Play notification sound if enabled
      if (voiceSettings.notifications) {
        playNotificationSound();
      }

      // Auto-read message if enabled
      if (voiceSettings.autoRead && message.role === 'assistant') {
        setTimeout(() => speak(message.content), 500);
      }
    };

    on('typing', handleTyping);
    on('message:received', handleMessageReceived);

    return () => {
      off('typing', handleTyping);
      off('message:received', handleMessageReceived);
    };
  }, [isConnected, user?.id, voiceSettings, speak, on, off]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'mod+enter': () => {
      // Start new conversation
      window.location.href = '/chat';
    },
    'mod+k': () => {
      // Focus search
      setShowSidePanel(true);
    },
    'escape': () => {
      // Close panels
      setShowSidePanel(false);
      setSelectedMessage(null);
    },
    'f1': () => {
      // Open accessibility panel
      setShowSidePanel(true);
    }
  });

  // Handle message send
  const handleSendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!content.trim() && !attachments?.length) return;

    try {
      // Emit typing start
      emit('typing:start', { conversationId: currentConversation?.id });

      await sendMessage({
        content: content.trim(),
        attachments,
        conversationId: currentConversation?.id
      });

      // Clear voice transcript
      if (transcript) {
        // Clear transcript logic here
      }

    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      // Emit typing stop
      emit('typing:stop', { conversationId: currentConversation?.id });
    }
  }, [currentConversation?.id, sendMessage, transcript, emit]);

  // Handle voice input
  useEffect(() => {
    if (transcript && voiceSettings.enabled) {
      // Auto-send on voice command end
      const timer = setTimeout(() => {
        if (transcript.trim()) {
          handleSendMessage(transcript);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [transcript, voiceSettings.enabled, handleSendMessage]);

  // Handle quick actions
  const handleQuickAction = useCallback(async (action: string) => {
    const quickActionMessages: Record<string, string> = {
      'help': 'Como posso ajudar você hoje?',
      'weather': 'Qual é a previsão do tempo?',
      'joke': 'Conte-me uma piada!',
      'story': 'Conte-me uma história interessante',
      'advice': 'Preciso de um conselho sobre...',
      'translate': 'Traduza este texto para...'
    };

    const message = quickActionMessages[action];
    if (message) {
      await handleSendMessage(message);
    }
  }, [handleSendMessage]);

  // Handle message actions
  const handleMessageAction = useCallback(async (messageId: string, action: string) => {
    switch (action) {
      case 'regenerate':
        await regenerateMessage(messageId);
        break;
      case 'delete':
        await deleteMessage(messageId);
        break;
      case 'speak':
        const message = messages.find(m => m.id === messageId);
        if (message) {
          speak(message.content);
        }
        break;
      case 'copy':
        const messageToCopy = messages.find(m => m.id === messageId);
        if (messageToCopy) {
          navigator.clipboard.writeText(messageToCopy.content);
        }
        break;
    }
  }, [messages, regenerateMessage, deleteMessage, speak]);

  // Handle conversation settings update
  const handleSettingsUpdate = useCallback((settings: Partial<ConversationSettings>) => {
    if (currentConversation) {
      updateConversationSettings(currentConversation.id, settings);
    }
  }, [currentConversation, updateConversationSettings]);

  const isEmpty = !messages || messages.length === 0;

  return (
    <div className={cn(
      'chat-page flex h-screen',
      appearance.theme === 'dark' && 'dark',
      accessibility.highContrast && 'high-contrast',
      accessibility.largeText && 'large-text'
    )}>
      {/* Main chat area */}
      <motion.div 
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <ChatHeader
          conversation={currentConversation}
          isConnected={isConnected}
          isTyping={isTyping}
          onToggleSidePanel={() => setShowSidePanel(!showSidePanel)}
          onVoiceToggle={voiceSupported ? (isListening ? stopListening : startListening) : undefined}
          isVoiceActive={isListening}
          isSpeaking={isSpeaking}
        />

        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          {isEmpty ? (
            <WelcomeScreen 
              onQuickAction={handleQuickAction}
              userName={user?.name}
            />
          ) : (
            <motion.div 
              className="h-full flex flex-col"
              layoutScroll
            >
              <MessageList
                messages={messages}
                isLoading={isLoading}
                selectedMessage={selectedMessage}
                onMessageAction={handleMessageAction}
                onMessageSelect={setSelectedMessage}
                accessibility={accessibility}
                voiceSettings={voiceSettings}
              />
              
              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="px-4 pb-2"
                  >
                    <TypingIndicator name="Yume" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </div>

        {/* Input area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          voiceTranscript={transcript}
          isListening={isListening}
          onVoiceStart={startListening}
          onVoiceStop={stopListening}
          voiceSupported={voiceSupported}
          placeholder={isListening ? "🎤 Escutando..." : "Digite sua mensagem para Yume..."}
        />

        {/* Quick actions (only show when empty) */}
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4"
            >
              <QuickActions onAction={handleQuickAction} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Side panel */}
      <AnimatePresence>
        {showSidePanel && (
          <SidePanel
            conversation={currentConversation}
            onClose={() => setShowSidePanel(false)}
            onSettingsUpdate={handleSettingsUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;