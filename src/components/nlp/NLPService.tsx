// Serviço de Processamento de Linguagem Natural
export interface NLPResult {
  intent: string;
  confidence: number;
  entities: EntityResult[];
  sentiment: SentimentResult;
  topic: string;
  urgency: 'low' | 'medium' | 'high';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface EntityResult {
  type: string;
  value: string;
  confidence: number;
}

export interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'confused';
  confidence: number;
}

export class NLPService {
  // Palavras-chave para análise de intenções
  private intentKeywords = {
    whatsapp: ['whatsapp', 'zap', 'mensagem', 'conversa', 'chat', 'status', 'figurinha', 'áudio', 'vídeo chamada'],
    email: ['email', 'e-mail', 'correio', 'gmail', 'outlook', 'enviar email', 'receber email', 'anexo'],
    phone: ['ligar', 'ligação', 'telefonar', 'chamada', 'contato', 'agenda', 'telefone'],
    camera: ['foto', 'câmera', 'fotografia', 'selfie', 'galeria', 'album', 'tirar foto', 'enviar foto'],
    wifi: ['wifi', 'wi-fi', 'internet', 'conexão', 'rede', 'senha wifi', 'conectar internet'],
    banking: ['banco', 'pix', 'transferência', 'saldo', 'extrato', 'conta', 'cartão', 'pagamento'],
    shopping: ['comprar', 'loja', 'mercado livre', 'amazon', 'compra online', 'produto', 'preço', 'entrega'],
    settings: ['configuração', 'ajuste', 'definições', 'volume', 'brilho', 'senha', 'bloqueio'],
    basic_phone: ['celular', 'smartphone', 'android', 'iphone', 'como usar', 'básico', 'tela inicial'],
    help: ['ajuda', 'socorro', 'não sei', 'não entendo', 'como', 'ensinar', 'explicar']
  };

  // Palavras indicativas de dificuldade/frustração
  private sentimentKeywords = {
    frustrated: ['não consigo', 'difícil', 'complicado', 'não funciona', 'erro', 'problema', 'travou', 'não sei'],
    confused: ['confuso', 'perdido', 'não entendo', 'como assim', 'o que é', 'onde', 'qual'],
    positive: ['obrigado', 'obrigada', 'legal', 'bom', 'perfeito', 'entendi', 'consegui', 'funcionou'],
    negative: ['ruim', 'péssimo', 'horrível', 'odeio', 'não gosto', 'chato']
  };

  // Entidades específicas do domínio
  private entityPatterns = {
    app_name: /\b(whatsapp|instagram|facebook|youtube|gmail|chrome|maps|uber|99|ifood)\b/gi,
    phone_model: /\b(iphone|samsung|motorola|xiaomi|lg|huawei)\b/gi,
    tech_term: /\b(app|aplicativo|wifi|bluetooth|4g|5g|dados móveis|hotspot)\b/gi,
    action: /\b(instalar|desinstalar|baixar|enviar|receber|conectar|desconectar|ligar|desligar)\b/gi,
    person: /\b(filho|filha|neto|neta|sobrinho|sobrinha|vizinho|amigo|médico)\b/gi
  };

  analyzeMessage(message: string): NLPResult {
    const cleanMessage = message.toLowerCase().trim();
    
    // Análise de intenção
    const intent = this.classifyIntent(cleanMessage);
    
    // Análise de entidades
    const entities = this.extractEntities(cleanMessage);
    
    // Análise de sentimento
    const sentiment = this.analyzeSentiment(cleanMessage);
    
    // Classificação de tópico
    const topic = this.classifyTopic(cleanMessage, intent.intent);
    
    // Análise de urgência
    const urgency = this.analyzeUrgency(cleanMessage, sentiment);
    
    // Análise de dificuldade
    const difficulty = this.analyzeDifficulty(cleanMessage);

    return {
      intent: intent.intent,
      confidence: intent.confidence,
      entities,
      sentiment,
      topic,
      urgency,
      difficulty
    };
  }

  private classifyIntent(message: string): { intent: string; confidence: number } {
    let bestIntent = 'general';
    let bestScore = 0;

    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          // Peso maior para correspondências exatas
          const exactMatch = new RegExp(`\\b${keyword}\\b`).test(message);
          score += exactMatch ? 2 : 1;
        }
      }
      
      // Normalizar score pelo número de keywords
      const normalizedScore = score / keywords.length;
      
      if (normalizedScore > bestScore) {
        bestScore = normalizedScore;
        bestIntent = intent;
      }
    }

    // Calcular confiança (0-1)
    const confidence = Math.min(bestScore * 0.5, 1);

    return { intent: bestIntent, confidence };
  }

  private extractEntities(message: string): EntityResult[] {
    const entities: EntityResult[] = [];

    for (const [type, pattern] of Object.entries(this.entityPatterns)) {
      const matches = message.match(pattern);
      if (matches) {
        for (const match of matches) {
          entities.push({
            type,
            value: match.toLowerCase(),
            confidence: 0.8
          });
        }
      }
    }

    // Extrair números (possivelmente códigos, idades, etc.)
    const numbers = message.match(/\b\d+\b/g);
    if (numbers) {
      for (const number of numbers) {
        entities.push({
          type: 'number',
          value: number,
          confidence: 0.6
        });
      }
    }

    return entities;
  }

  private analyzeSentiment(message: string): SentimentResult {
    let sentiment: SentimentResult['label'] = 'neutral';
    let confidence = 0.5;

    for (const [label, keywords] of Object.entries(this.sentimentKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (message.includes(keyword)) {
          score++;
        }
      }
      
      if (score > 0) {
        const newConfidence = Math.min(score * 0.3, 1);
        if (newConfidence > confidence) {
          sentiment = label as SentimentResult['label'];
          confidence = newConfidence;
        }
      }
    }

    // Detectar pontos de interrogação múltiplos (confusão)
    if (message.includes('???') || message.split('?').length > 3) {
      sentiment = 'confused';
      confidence = Math.max(confidence, 0.7);
    }

    // Detectar exclamações múltiplas (frustração)
    if (message.includes('!!!') || message.split('!').length > 3) {
      sentiment = 'frustrated';
      confidence = Math.max(confidence, 0.7);
    }

    return { label: sentiment, confidence };
  }

  private classifyTopic(message: string, intent: string): string {
    const topicMapping: { [key: string]: string } = {
      whatsapp: 'Comunicação',
      email: 'Comunicação',
      phone: 'Comunicação',
      camera: 'Mídia e Fotos',
      wifi: 'Conectividade',
      banking: 'Serviços Financeiros',
      shopping: 'Compras Online',
      settings: 'Configurações do Dispositivo',
      basic_phone: 'Uso Básico do Celular',
      help: 'Suporte Geral'
    };

    return topicMapping[intent] || 'Geral';
  }

  private analyzeUrgency(message: string, sentiment: SentimentResult): 'low' | 'medium' | 'high' {
    const urgentWords = ['urgente', 'rápido', 'agora', 'preciso', 'importante', 'emergência'];
    const hasUrgentWords = urgentWords.some(word => message.includes(word));
    
    if (sentiment.label === 'frustrated' && hasUrgentWords) {
      return 'high';
    }
    
    if (sentiment.label === 'frustrated' || hasUrgentWords) {
      return 'medium';
    }
    
    return 'low';
  }

  private analyzeDifficulty(message: string): 'beginner' | 'intermediate' | 'advanced' {
    const beginnerIndicators = [
      'não sei', 'como', 'ensinar', 'explicar', 'básico', 'simples', 
      'primeiro', 'começo', 'início', 'nunca usei'
    ];
    
    const intermediateIndicators = [
      'configurar', 'ajustar', 'personalizar', 'sincronizar'
    ];
    
    const advancedIndicators = [
      'programar', 'código', 'desenvolver', 'avançado', 'técnico'
    ];

    const beginnerScore = beginnerIndicators.filter(word => message.includes(word)).length;
    const intermediateScore = intermediateIndicators.filter(word => message.includes(word)).length;
    const advancedScore = advancedIndicators.filter(word => message.includes(word)).length;

    if (advancedScore > 0) return 'advanced';
    if (intermediateScore > beginnerScore) return 'intermediate';
    return 'beginner';
  }

  // Método para extrair contexto histórico da conversa
  analyzeConversationHistory(messages: Array<{ text: string; isBot: boolean }>): {
    topics: string[];
    userFrustrationLevel: number;
    learnedConcepts: string[];
    needsFollowUp: boolean;
  } {
    const topics: string[] = [];
    let frustrationLevel = 0;
    const learnedConcepts: string[] = [];
    let needsFollowUp = false;

    // Analisar últimas 10 mensagens
    const recentMessages = messages.slice(-10);
    
    for (const message of recentMessages) {
      if (!message.isBot) {
        const analysis = this.analyzeMessage(message.text);
        topics.push(analysis.topic);
        
        if (analysis.sentiment.label === 'frustrated') {
          frustrationLevel += 0.2;
        } else if (analysis.sentiment.label === 'positive') {
          frustrationLevel = Math.max(0, frustrationLevel - 0.1);
        }
        
        // Detectar se usuário conseguiu resolver algo
        if (message.text.toLowerCase().includes('consegui') || 
            message.text.toLowerCase().includes('funcionou')) {
          learnedConcepts.push(analysis.topic);
        }
        
        // Detectar se precisa de follow-up
        if (analysis.urgency === 'high' || 
            message.text.toLowerCase().includes('ainda') ||
            message.text.toLowerCase().includes('continua')) {
          needsFollowUp = true;
        }
      }
    }

    return {
      topics: [...new Set(topics)], // Remove duplicatas
      userFrustrationLevel: Math.min(frustrationLevel, 1),
      learnedConcepts: [...new Set(learnedConcepts)],
      needsFollowUp
    };
  }
}