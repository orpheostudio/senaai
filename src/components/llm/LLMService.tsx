// Serviço de Integração com Large Language Models
import { NLPResult } from '../nlp/NLPService';

export interface LLMResponse {
  response: string;
  confidence: number;
  suggestedActions?: string[];
  followUpQuestions?: string[];
  resources?: string[];
}

export interface ConversationContext {
  userProfile: {
    ageGroup: '60+' | 'senior' | 'adult';
    techExperience: 'beginner' | 'intermediate' | 'advanced';
    preferredStyle: 'detailed' | 'concise' | 'step-by-step';
    accessibilityNeeds: string[];
  };
  currentTopic: string;
  recentTopics: string[];
  userFrustrationLevel: number;
  sessionMessages: number;
}

export class LLMService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';
  
  // Prompts especializados para Sofia
  private systemPrompts = {
    main: `Você é Sofia, uma assistente digital especializada em ajudar pessoas com 60+ anos, PCDs e iniciantes em tecnologia. 

PERSONALIDADE:
- Extremamente paciente e carinhosa
- Usa linguagem simples, sem jargões técnicos
- Sempre explica passo a passo
- Oferece encorajamento constante
- Adapta explicações ao nível do usuário

DIRETRIZES:
- Use analogias do cotidiano para explicar conceitos técnicos
- Divida tarefas complexas em etapas pequenas
- Sempre pergunte se o usuário conseguiu seguir
- Ofereça alternativas quando algo não funciona
- Seja específica sobre onde tocar/clicar
- Use emojis para tornar a conversa mais amigável
- Evite termos como "clique", prefira "toque" ou "aperte"
- Sempre valide os sentimentos do usuário

FORMATO DE RESPOSTA:
- Comece com empatia/validação
- Explique o conceito de forma simples
- Dê instruções passo a passo numeradas
- Termine com encorajamento
- Ofereça ajuda adicional`,

    frustrated: `O usuário está demonstrando frustração. Seja especialmente paciente e empática. 
Comece validando os sentimentos, simplifique ainda mais as explicações e divida em passos menores.
Use frases como "Entendo sua frustração, isso é normal" e "Vamos devagar, sem pressa".`,

    beginner: `O usuário é iniciante. Use linguagem extremamente simples, explique cada termo técnico,
use analogias familiares e seja muito detalhada nas instruções. Sempre explique "por que" além do "como".`,

    followUp: `Esta é uma pergunta de seguimento. Referencie a conversa anterior e construa sobre o que
já foi ensinado. Conecte com conceitos já explicados.`
  };

  constructor() {
    // API key será configurada via ambiente ou configurações do usuário
    this.apiKey = null;
  }

  async generateResponse(
    userMessage: string,
    nlpResult: NLPResult,
    context: ConversationContext,
    conversationHistory: Array<{ text: string; isBot: boolean }>
  ): Promise<LLMResponse> {
    
    // Se não há API key, usar fallback local
    if (!this.apiKey) {
      return this.generateLocalResponse(userMessage, nlpResult, context);
    }

    try {
      const prompt = this.buildPrompt(userMessage, nlpResult, context, conversationHistory);
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Modelo mais eficiente para este uso
          messages: [
            { role: 'system', content: this.getSystemPrompt(nlpResult, context) },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const llmResponse = data.choices[0].message.content;

      return this.processLLMResponse(llmResponse, nlpResult);

    } catch (error) {
      console.error('LLM API Error:', error);
      // Fallback para resposta local
      return this.generateLocalResponse(userMessage, nlpResult, context);
    }
  }

  private buildPrompt(
    userMessage: string,
    nlpResult: NLPResult,
    context: ConversationContext,
    history: Array<{ text: string; isBot: boolean }>
  ): string {
    let prompt = `MENSAGEM DO USUÁRIO: "${userMessage}"\n\n`;

    // Adicionar análise NLP
    prompt += `ANÁLISE DA MENSAGEM:
- Intenção: ${nlpResult.intent} (confiança: ${nlpResult.confidence})
- Sentimento: ${nlpResult.sentiment.label} (${nlpResult.sentiment.confidence})
- Tópico: ${nlpResult.topic}
- Urgência: ${nlpResult.urgency}
- Nível: ${nlpResult.difficulty}
- Entidades: ${nlpResult.entities.map(e => `${e.type}:${e.value}`).join(', ')}\n\n`;

    // Adicionar contexto do usuário
    prompt += `PERFIL DO USUÁRIO:
- Experiência: ${context.userProfile.techExperience}
- Estilo preferido: ${context.userProfile.preferredStyle}
- Nível de frustração: ${context.userFrustrationLevel}/1.0
- Tópico atual: ${context.currentTopic}
- Necessidades de acessibilidade: ${context.userProfile.accessibilityNeeds.join(', ')}\n\n`;

    // Adicionar histórico recente se relevante
    if (history.length > 2) {
      const recentHistory = history.slice(-4).map(msg => 
        `${msg.isBot ? 'Sofia' : 'Usuário'}: ${msg.text.substring(0, 100)}...`
      ).join('\n');
      prompt += `CONVERSA RECENTE:\n${recentHistory}\n\n`;
    }

    prompt += `Responda como Sofia, seguindo todas as diretrizes do sistema. A resposta deve ser personalizada para este usuário específico.`;

    return prompt;
  }

  private getSystemPrompt(nlpResult: NLPResult, context: ConversationContext): string {
    let systemPrompt = this.systemPrompts.main;

    // Adaptar prompt baseado na análise
    if (nlpResult.sentiment.label === 'frustrated' || context.userFrustrationLevel > 0.5) {
      systemPrompt += '\n\n' + this.systemPrompts.frustrated;
    }

    if (nlpResult.difficulty === 'beginner' || context.userProfile.techExperience === 'beginner') {
      systemPrompt += '\n\n' + this.systemPrompts.beginner;
    }

    if (context.sessionMessages > 3) {
      systemPrompt += '\n\n' + this.systemPrompts.followUp;
    }

    return systemPrompt;
  }

  private processLLMResponse(llmResponse: string, nlpResult: NLPResult): LLMResponse {
    // Extrair ações sugeridas (procurar por listas numeradas ou com bullet points)
    const actionPattern = /(?:^\d+\.|^[-•])\s*(.+)$/gm;
    const suggestedActions: string[] = [];
    let match;
    while ((match = actionPattern.exec(llmResponse)) !== null) {
      suggestedActions.push(match[1].trim());
    }

    // Extrair perguntas de follow-up
    const questionPattern = /\?[^?]*$/gm;
    const followUpQuestions: string[] = [];
    const questions = llmResponse.match(questionPattern);
    if (questions) {
      followUpQuestions.push(...questions.map(q => q.trim()));
    }

    // Gerar recursos baseados no tópico
    const resources = this.generateResources(nlpResult.topic, nlpResult.intent);

    return {
      response: llmResponse,
      confidence: 0.8, // Alta confiança para LLM
      suggestedActions: suggestedActions.slice(0, 3), // Máximo 3 ações
      followUpQuestions: followUpQuestions.slice(0, 2), // Máximo 2 perguntas
      resources
    };
  }

  private generateLocalResponse(
    userMessage: string,
    nlpResult: NLPResult,
    context: ConversationContext
  ): LLMResponse {
    // Sistema de fallback com respostas estruturadas
    const templates = this.getResponseTemplates();
    const template = templates[nlpResult.intent] || templates.default;

    let response = this.personalizeTemplate(template, nlpResult, context);
    
    // Adaptar para sentimento
    if (nlpResult.sentiment.label === 'frustrated') {
      response = `Entendo sua frustração, isso é muito comum! 😊 ${response}\n\nLembre-se: não há pressa, vamos devagar e você vai conseguir! 💙`;
    } else if (nlpResult.sentiment.label === 'confused') {
      response = `Sei que pode parecer confuso no início, mas vou explicar de forma bem simples! 😊\n\n${response}`;
    }

    return {
      response,
      confidence: 0.6,
      suggestedActions: this.generateSuggestedActions(nlpResult.intent),
      followUpQuestions: this.generateFollowUpQuestions(nlpResult.intent),
      resources: this.generateResources(nlpResult.topic, nlpResult.intent)
    };
  }

  private getResponseTemplates(): { [key: string]: string } {
    return {
      whatsapp: `Vou te ajudar com o WhatsApp! 📱

**Passo a passo para ${this.extractAction()} no WhatsApp:**

1. **Encontre o aplicativo**: Procure o ícone verde com um telefone branco na tela do seu celular
2. **Abra o WhatsApp**: Toque uma vez no ícone verde
3. **Aguarde carregar**: O aplicativo vai abrir (pode demorar alguns segundos)

Se você não encontrar o aplicativo, me avise que te ajudo a localizá-lo! 😊`,

      email: `Vou te explicar como usar o e-mail de forma simples! 📧

**Para ${this.extractAction()} e-mail:**

1. **Encontre o aplicativo de e-mail**: Procure um ícone que parece um envelope
2. **Abra o aplicativo**: Toque no ícone
3. **Aguarde carregar**: Suas mensagens vão aparecer

Qual parte você gostaria que eu explique com mais detalhes?`,

      default: `Entendo sua pergunta! Vou te ajudar de forma bem simples e passo a passo. 😊

Me conte um pouco mais sobre o que você está tentando fazer, assim posso dar explicações mais específicas para você.

Lembre-se: não existe pergunta boba, e estou aqui para te ajudar com toda paciência do mundo! 💙`
    };
  }

  private extractAction(): string {
    // Método auxiliar para extrair ação da mensagem
    return "usar"; // Simplificado
  }

  private personalizeTemplate(
    template: string,
    nlpResult: NLPResult,
    context: ConversationContext
  ): string {
    // Personalizar template baseado no contexto
    let personalized = template;

    // Adaptar para nível de experiência
    if (context.userProfile.techExperience === 'beginner') {
      personalized = personalized.replace(/toque/g, 'aperte com o dedo');
      personalized = personalized.replace(/aplicativo/g, 'programa do celular');
    }

    return personalized;
  }

  private generateSuggestedActions(intent: string): string[] {
    const actions: { [key: string]: string[] } = {
      whatsapp: [
        "Vamos localizar o WhatsApp no seu celular",
        "Te ensino a enviar sua primeira mensagem", 
        "Explico como enviar fotos pelo WhatsApp"
      ],
      email: [
        "Vamos configurar seu e-mail",
        "Te ensino a enviar um e-mail",
        "Explico como ler mensagens recebidas"
      ],
      default: [
        "Me conte mais detalhes sobre sua dúvida",
        "Vamos começar pelo básico",
        "Posso explicar de outra forma"
      ]
    };

    return actions[intent] || actions.default;
  }

  private generateFollowUpQuestions(intent: string): string[] {
    const questions: { [key: string]: string[] } = {
      whatsapp: [
        "Você consegue ver o ícone do WhatsApp na tela?",
        "Já usou WhatsApp antes ou é a primeira vez?"
      ],
      email: [
        "Você já tem uma conta de e-mail configurada?",
        "Qual aplicativo de e-mail você está usando?"
      ],
      default: [
        "Você conseguiu seguir até aqui?",
        "Tem alguma parte que ficou confusa?"
      ]
    };

    return questions[intent] || questions.default;
  }

  private generateResources(topic: string, intent: string): string[] {
    const resourceMap: { [key: string]: string[] } = {
      'Comunicação': [
        "Tutorial básico de WhatsApp",
        "Como fazer ligações",
        "Enviar mensagens de texto"
      ],
      'Mídia e Fotos': [
        "Como tirar fotos",
        "Enviar fotos pelo WhatsApp",
        "Organizar galeria de fotos"
      ],
      'Conectividade': [
        "Como conectar WiFi",
        "Resolver problemas de internet",
        "Usar dados móveis"
      ]
    };

    return resourceMap[topic] || ["Ajuda básica com celular", "Suporte técnico"];
  }

  // Método para configurar API key
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Método para verificar se LLM está disponível
  isLLMAvailable(): boolean {
    return this.apiKey !== null;
  }
}