// Gerenciador de Contexto de Conversação
import { NLPResult } from './NLPService';

export interface UserProfile {
  ageGroup: '60+' | 'senior' | 'adult';
  techExperience: 'beginner' | 'intermediate' | 'advanced';
  preferredStyle: 'detailed' | 'concise' | 'step-by-step';
  accessibilityNeeds: string[];
  learnedTopics: string[];
  strugglingTopics: string[];
  preferredPace: 'slow' | 'medium' | 'fast';
  deviceType: 'android' | 'iphone' | 'unknown';
}

export interface ConversationState {
  currentTopic: string;
  topicDepth: number; // Quantas perguntas sobre o mesmo tópico
  userFrustrationLevel: number; // 0-1
  successfulInteractions: number;
  failedInteractions: number;
  sessionStartTime: Date;
  lastInteractionTime: Date;
  needsEncouragement: boolean;
  isFirstTime: boolean;
}

export interface ConversationMemory {
  userProfile: UserProfile;
  conversationState: ConversationState;
  topicHistory: Array<{
    topic: string;
    timestamp: Date;
    successful: boolean;
    userSatisfaction: 'positive' | 'negative' | 'neutral';
  }>;
  messageHistory: Array<{
    message: string;
    nlpResult: NLPResult;
    timestamp: Date;
    isBot: boolean;
  }>;
}

export class ContextManager {
  private memory: ConversationMemory;
  private readonly maxHistorySize = 50;

  constructor() {
    this.memory = this.initializeMemory();
    this.loadFromStorage();
  }

  private initializeMemory(): ConversationMemory {
    return {
      userProfile: {
        ageGroup: '60+',
        techExperience: 'beginner',
        preferredStyle: 'step-by-step',
        accessibilityNeeds: [],
        learnedTopics: [],
        strugglingTopics: [],
        preferredPace: 'slow',
        deviceType: 'unknown'
      },
      conversationState: {
        currentTopic: '',
        topicDepth: 0,
        userFrustrationLevel: 0,
        successfulInteractions: 0,
        failedInteractions: 0,
        sessionStartTime: new Date(),
        lastInteractionTime: new Date(),
        needsEncouragement: false,
        isFirstTime: true
      },
      topicHistory: [],
      messageHistory: []
    };
  }

  // Atualizar contexto com nova mensagem
  updateContext(message: string, nlpResult: NLPResult, isBot: boolean = false): void {
    // Adicionar à história de mensagens
    this.memory.messageHistory.push({
      message,
      nlpResult,
      timestamp: new Date(),
      isBot
    });

    // Manter apenas as últimas mensagens
    if (this.memory.messageHistory.length > this.maxHistorySize) {
      this.memory.messageHistory = this.memory.messageHistory.slice(-this.maxHistorySize);
    }

    if (!isBot) {
      this.updateUserProfile(nlpResult);
      this.updateConversationState(nlpResult);
      this.updateTopicHistory(nlpResult);
    }

    this.memory.conversationState.lastInteractionTime = new Date();
    this.saveToStorage();
  }

  private updateUserProfile(nlpResult: NLPResult): void {
    const profile = this.memory.userProfile;
    
    // Atualizar experiência técnica baseada na complexidade das perguntas
    if (nlpResult.difficulty === 'advanced' && profile.techExperience === 'beginner') {
      profile.techExperience = 'intermediate';
    } else if (nlpResult.difficulty === 'beginner' && profile.techExperience !== 'beginner') {
      // Usuário pode estar começando em um novo tópico
    }

    // Detectar tipo de dispositivo baseado nas entidades
    const deviceEntities = nlpResult.entities.filter(e => e.type === 'phone_model');
    if (deviceEntities.length > 0) {
      const device = deviceEntities[0].value.toLowerCase();
      if (device.includes('iphone')) {
        profile.deviceType = 'iphone';
      } else if (device.includes('samsung') || device.includes('motorola') || device.includes('xiaomi')) {
        profile.deviceType = 'android';
      }
    }

    // Ajustar ritmo preferido baseado no sentimento
    if (nlpResult.sentiment.label === 'frustrated') {
      profile.preferredPace = 'slow';
      profile.preferredStyle = 'step-by-step';
    }

    // Detectar necessidades de acessibilidade baseado no comportamento
    this.detectAccessibilityNeeds(nlpResult);
  }

  private detectAccessibilityNeeds(nlpResult: NLPResult): void {
    const needs = this.memory.userProfile.accessibilityNeeds;
    
    // Detectar possíveis necessidades baseado em padrões de linguagem
    const message = nlpResult.entities.find(e => e.type === 'message')?.value || '';
    
    if (message.includes('não consigo ver') || message.includes('difícil de ler')) {
      if (!needs.includes('visual_impairment')) {
        needs.push('visual_impairment');
      }
    }
    
    if (message.includes('não consigo tocar') || message.includes('difícil de apertar')) {
      if (!needs.includes('motor_difficulty')) {
        needs.push('motor_difficulty');
      }
    }
    
    if (message.includes('não ouço') || message.includes('som baixo')) {
      if (!needs.includes('hearing_impairment')) {
        needs.push('hearing_impairment');
      }
    }
  }

  private updateConversationState(nlpResult: NLPResult): void {
    const state = this.memory.conversationState;
    
    // Atualizar tópico atual
    if (nlpResult.topic !== state.currentTopic) {
      state.currentTopic = nlpResult.topic;
      state.topicDepth = 1;
    } else {
      state.topicDepth++;
    }

    // Atualizar nível de frustração
    if (nlpResult.sentiment.label === 'frustrated') {
      state.userFrustrationLevel = Math.min(state.userFrustrationLevel + 0.2, 1);
      state.failedInteractions++;
      state.needsEncouragement = true;
    } else if (nlpResult.sentiment.label === 'positive') {
      state.userFrustrationLevel = Math.max(state.userFrustrationLevel - 0.1, 0);
      state.successfulInteractions++;
      state.needsEncouragement = false;
    }

    // Detectar se precisa de encorajamento
    if (state.topicDepth > 5 && state.userFrustrationLevel > 0.5) {
      state.needsEncouragement = true;
    }

    // Marcar como não sendo primeira vez
    if (state.isFirstTime && this.memory.messageHistory.length > 3) {
      state.isFirstTime = false;
    }
  }

  private updateTopicHistory(nlpResult: NLPResult): void {
    const lastTopic = this.memory.topicHistory[this.memory.topicHistory.length - 1];
    
    // Se mudou de tópico, registrar o anterior como concluído
    if (lastTopic && lastTopic.topic !== nlpResult.topic) {
      lastTopic.successful = nlpResult.sentiment.label !== 'frustrated';
      lastTopic.userSatisfaction = this.determineSatisfaction(nlpResult.sentiment.label);
    }

    // Adicionar novo tópico se diferente do último
    if (!lastTopic || lastTopic.topic !== nlpResult.topic) {
      this.memory.topicHistory.push({
        topic: nlpResult.topic,
        timestamp: new Date(),
        successful: false, // Será atualizado quando mudar de tópico
        userSatisfaction: 'neutral'
      });
    }
  }

  private determineSatisfaction(sentiment: string): 'positive' | 'negative' | 'neutral' {
    if (sentiment === 'positive') return 'positive';
    if (sentiment === 'frustrated' || sentiment === 'negative') return 'negative';
    return 'neutral';
  }

  // Obter contexto atual para o LLM
  getCurrentContext() {
    return {
      userProfile: this.memory.userProfile,
      currentTopic: this.memory.conversationState.currentTopic,
      recentTopics: this.getRecentTopics(),
      userFrustrationLevel: this.memory.conversationState.userFrustrationLevel,
      sessionMessages: this.memory.messageHistory.filter(m => !m.isBot).length,
      needsEncouragement: this.memory.conversationState.needsEncouragement,
      isFirstTime: this.memory.conversationState.isFirstTime,
      topicDepth: this.memory.conversationState.topicDepth
    };
  }

  private getRecentTopics(): string[] {
    return this.memory.topicHistory
      .slice(-5) // Últimos 5 tópicos
      .map(t => t.topic);
  }

  // Obter histórico de conversa formatado
  getConversationHistory() {
    return this.memory.messageHistory.map(msg => ({
      text: msg.message,
      isBot: msg.isBot,
      timestamp: msg.timestamp
    }));
  }

  // Analisar padrões de aprendizado do usuário
  analyzeUserLearning(): {
    strongTopics: string[];
    weakTopics: string[];
    recommendedNextSteps: string[];
    learningPace: 'slow' | 'medium' | 'fast';
  } {
    const topicSuccess: { [key: string]: { total: number; successful: number } } = {};
    
    // Analisar sucesso por tópico
    for (const topic of this.memory.topicHistory) {
      if (!topicSuccess[topic.topic]) {
        topicSuccess[topic.topic] = { total: 0, successful: 0 };
      }
      topicSuccess[topic.topic].total++;
      if (topic.successful) {
        topicSuccess[topic.topic].successful++;
      }
    }

    const strongTopics: string[] = [];
    const weakTopics: string[] = [];

    for (const [topic, stats] of Object.entries(topicSuccess)) {
      const successRate = stats.successful / stats.total;
      if (successRate >= 0.7) {
        strongTopics.push(topic);
      } else if (successRate < 0.3) {
        weakTopics.push(topic);
      }
    }

    // Recomendar próximos passos
    const recommendedNextSteps = this.generateRecommendations(strongTopics, weakTopics);
    
    // Determinar ritmo de aprendizado
    const avgInteractionTime = this.calculateAverageInteractionTime();
    const learningPace = avgInteractionTime > 300 ? 'slow' : avgInteractionTime > 120 ? 'medium' : 'fast';

    return {
      strongTopics,
      weakTopics,
      recommendedNextSteps,
      learningPace
    };
  }

  private generateRecommendations(strongTopics: string[], weakTopics: string[]): string[] {
    const recommendations: string[] = [];

    // Se tem tópicos fortes, sugerir expansão
    if (strongTopics.includes('Comunicação')) {
      recommendations.push('Aprender sobre envio de fotos e vídeos');
      recommendations.push('Explorar chamadas de vídeo');
    }

    // Se tem tópicos fracos, sugerir revisão
    if (weakTopics.includes('Conectividade')) {
      recommendations.push('Revisar conceitos básicos de WiFi');
      recommendations.push('Praticar conexão passo a passo');
    }

    // Sugestões gerais baseadas no progresso
    if (strongTopics.length >= 2) {
      recommendations.push('Você está indo muito bem! Que tal explorar compras online?');
    }

    return recommendations.slice(0, 3); // Máximo 3 recomendações
  }

  private calculateAverageInteractionTime(): number {
    const userMessages = this.memory.messageHistory.filter(m => !m.isBot);
    if (userMessages.length < 2) return 0;

    let totalTime = 0;
    for (let i = 1; i < userMessages.length; i++) {
      const timeDiff = userMessages[i].timestamp.getTime() - userMessages[i-1].timestamp.getTime();
      totalTime += timeDiff;
    }

    return totalTime / (userMessages.length - 1) / 1000; // Em segundos
  }

  // Limpar contexto (nova sessão)
  clearSession(): void {
    this.memory.conversationState = {
      ...this.memory.conversationState,
      currentTopic: '',
      topicDepth: 0,
      userFrustrationLevel: 0,
      sessionStartTime: new Date(),
      needsEncouragement: false,
      isFirstTime: false
    };
    this.memory.messageHistory = [];
    this.saveToStorage();
  }

  // Persistência
  private saveToStorage(): void {
    try {
      localStorage.setItem('sofia_context', JSON.stringify({
        ...this.memory,
        messageHistory: this.memory.messageHistory.slice(-20) // Salvar apenas últimas 20 mensagens
      }));
    } catch (error) {
      console.warn('Não foi possível salvar contexto:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('sofia_context');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.memory = {
          ...this.memory,
          ...parsed,
          conversationState: {
            ...this.memory.conversationState,
            ...parsed.conversationState,
            sessionStartTime: new Date() // Nova sessão
          }
        };
      }
    } catch (error) {
      console.warn('Não foi possível carregar contexto:', error);
    }
  }

  // Métodos de utilidade
  getUserExperienceLevel(): 'beginner' | 'intermediate' | 'advanced' {
    return this.memory.userProfile.techExperience;
  }

  shouldUseSimpleLanguage(): boolean {
    return this.memory.userProfile.techExperience === 'beginner' || 
           this.memory.conversationState.userFrustrationLevel > 0.3;
  }

  shouldProvideEncouragement(): boolean {
    return this.memory.conversationState.needsEncouragement;
  }

  getSessionDuration(): number {
    return Date.now() - this.memory.conversationState.sessionStartTime.getTime();
  }
}