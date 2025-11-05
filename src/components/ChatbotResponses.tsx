// Sistema de respostas inteligentes do chatbot Sofia com NLP e LLM
import { NLPService, NLPResult } from './nlp/NLPService';
import { LLMService, ConversationContext } from './llm/LLMService';
import { ContextManager } from './nlp/ContextManager';

// Instâncias dos serviços
const nlpService = new NLPService();
const llmService = new LLMService();
const contextManager = new ContextManager();

// Configurar LLM se API key estiver disponível
const initializeLLM = () => {
  // Verificar se está em ambiente browser
  if (typeof window === 'undefined') return;
  
  try {
    const apiKey = localStorage.getItem('openai_api_key');
    if (apiKey) {
      llmService.setApiKey(apiKey);
    }
  } catch (error) {
    console.warn('Erro ao acessar localStorage:', error);
  }
};

// Inicializar quando o DOM estiver carregado
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLLM);
  } else {
    setTimeout(initializeLLM, 100);
  }
}

export async function getBotResponse(action: string = "", userMessage: string = ""): Promise<string> {
  try {
    // Se é uma ação rápida (botões)
    if (action) {
      const response = getQuickActionResponse(action);
      
      // Simular análise NLP para ação rápida
      const nlpResult: NLPResult = {
        intent: action,
        confidence: 1.0,
        entities: [],
        sentiment: { label: 'neutral', confidence: 0.5 },
        topic: getTopicForAction(action),
        urgency: 'low',
        difficulty: 'beginner'
      };
      
      // Atualizar contexto
      contextManager.updateContext(getActionDescription(action), nlpResult, false);
      
      return response;
    }
    
    // Se é uma mensagem livre do usuário
    if (userMessage) {
      return await getIntelligentResponse(userMessage);
    }
    
    return "Desculpe, não entendi. Pode reformular sua pergunta?";
  } catch (error) {
    console.error('Erro ao gerar resposta:', error);
    return getFallbackResponse(userMessage);
  }
}

async function getIntelligentResponse(userMessage: string): Promise<string> {
  // 1. Análise NLP da mensagem
  const nlpResult = nlpService.analyzeMessage(userMessage);
  
  // 2. Atualizar contexto de conversa
  contextManager.updateContext(userMessage, nlpResult, false);
  
  // 3. Obter contexto atual
  const context = contextManager.getCurrentContext();
  
  // 4. Obter histórico de conversa
  const conversationHistory = contextManager.getConversationHistory().slice(-10);
  
  // 5. Tentar usar LLM se disponível
  if (llmService.isLLMAvailable()) {
    try {
      const llmResponse = await llmService.generateResponse(
        userMessage,
        nlpResult,
        context as ConversationContext,
        conversationHistory
      );
      
      // Personalizar resposta baseada no contexto
      const personalizedResponse = personalizeResponse(llmResponse.response, nlpResult, context);
      
      // Adicionar ações sugeridas se relevante
      const finalResponse = addSuggestedActions(personalizedResponse, llmResponse.suggestedActions);
      
      return finalResponse;
    } catch (error) {
      console.error('Erro no LLM, usando fallback:', error);
    }
  }
  
  // 6. Fallback para respostas baseadas em regras
  return getEnhancedContextualResponse(userMessage, nlpResult, context);
}

function personalizeResponse(response: string, nlpResult: NLPResult, context: any): string {
  let personalized = response;
  
  // Adaptar para frustração
  if (nlpResult.sentiment.label === 'frustrated' || context.userFrustrationLevel > 0.5) {
    personalized = addEmpathy(personalized);
  }
  
  // Adaptar para nível de experiência
  if (context.userProfile?.techExperience === 'beginner') {
    personalized = simplifyLanguage(personalized);
  }
  
  // Adicionar encorajamento se necessário
  if (context.needsEncouragement) {
    personalized = addEncouragement(personalized);
  }
  
  // Adaptar para acessibilidade
  if (context.userProfile?.accessibilityNeeds?.length > 0) {
    personalized = adaptForAccessibility(personalized, context.userProfile.accessibilityNeeds);
  }
  
  return personalized;
}

function addEmpathy(response: string): string {
  const empathyPhrases = [
    "Entendo sua frustração, isso é muito comum! 😊",
    "Sei que pode ser desafiador no início, mas você vai conseguir! 💙",
    "É normal se sentir assim, vamos resolver juntos! 🤝",
    "Não se preocupe, todos passamos por essa fase de aprendizado! ✨"
  ];
  
  const randomEmpathy = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
  return `${randomEmpathy}\n\n${response}`;
}

function simplifyLanguage(response: string): string {
  const simplifications: { [key: string]: string } = {
    'aplicativo': 'programa do celular',
    'interface': 'tela',
    'configurar': 'ajustar',
    'sincronizar': 'atualizar',
    'dispositivo': 'aparelho',
    'clique': 'toque',
    'selecionar': 'escolher',
    'navegar': 'andar pela tela'
  };
  
  let simplified = response;
  for (const [complex, simple] of Object.entries(simplifications)) {
    simplified = simplified.replace(new RegExp(complex, 'gi'), simple);
  }
  
  return simplified;
}

function addEncouragement(response: string): string {
  const encouragements = [
    "\n\n🌟 Lembre-se: você está indo muito bem! Cada passo é um progresso!",
    "\n\n💪 Não desista! Você é mais capaz do que imagina!",
    "\n\n✨ Parabéns por ter coragem de aprender coisas novas!",
    "\n\n🎯 Você está no caminho certo! Continue assim!"
  ];
  
  const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
  return response + randomEncouragement;
}

function adaptForAccessibility(response: string, needs: string[]): string {
  let adapted = response;
  
  if (needs.includes('visual_impairment')) {
    adapted = adapted.replace(/👀|🔍/g, ''); // Remover emojis visuais
    adapted += "\n\n🔊 Esta mensagem está otimizada para leitores de tela.";
  }
  
  if (needs.includes('motor_difficulty')) {
    adapted = adapted.replace(/clique|toque/gi, 'pressione devagar');
    adapted += "\n\n🤲 Use o tempo que precisar. Não há pressa!";
  }
  
  return adapted;
}

function addSuggestedActions(response: string, actions?: string[]): string {
  if (!actions || actions.length === 0) return response;
  
  let enhanced = response + "\n\n💡 **Próximos passos que posso te ajudar:**\n";
  actions.forEach((action, index) => {
    enhanced += `${index + 1}. ${action}\n`;
  });
  
  enhanced += "\nQual dessas opções te interessa mais? 😊";
  
  return enhanced;
}

function getEnhancedContextualResponse(userMessage: string, nlpResult: NLPResult, context: any): string {
  const message = userMessage.toLowerCase();
  
  // Usar análise NLP para resposta mais inteligente
  const intentResponse = getResponseByIntent(nlpResult.intent, nlpResult, context);
  if (intentResponse) {
    return personalizeResponse(intentResponse, nlpResult, context);
  }
  
  // Respostas baseadas em sentimento
  if (nlpResult.sentiment.label === 'frustrated') {
    return getFrustratedUserResponse(nlpResult, context);
  }
  
  if (nlpResult.sentiment.label === 'confused') {
    return getConfusedUserResponse(nlpResult, context);
  }
  
  if (nlpResult.sentiment.label === 'positive') {
    return getPositiveUserResponse(nlpResult, context);
  }
  
  // Resposta baseada no histórico
  if (context.currentTopic && context.topicDepth > 1) {
    return getContinuationResponse(context.currentTopic, nlpResult, context);
  }
  
  // Resposta genérica inteligente
  return getSmartGenericResponse(nlpResult, context, userMessage);
}

function getResponseByIntent(intent: string, nlpResult: NLPResult, context: any): string | null {
  const intentResponses: { [key: string]: () => string } = {
    whatsapp: () => getQuickActionResponse("whatsapp"),
    email: () => getQuickActionResponse("email"),
    phone: () => getQuickActionResponse("ligacao"),
    camera: () => getQuickActionResponse("camera"),
    wifi: () => getQuickActionResponse("wifi"),
    banking: () => getQuickActionResponse("banco"),
    shopping: () => getQuickActionResponse("compras"),
    settings: () => getQuickActionResponse("configuracoes"),
    basic_phone: () => getQuickActionResponse("celular-basico"),
    help: () => getHelpResponse(nlpResult, context)
  };
  
  const responseGenerator = intentResponses[intent];
  return responseGenerator ? responseGenerator() : null;
}

function getFrustratedUserResponse(nlpResult: NLPResult, context: any): string {
  const frustratedResponses = [
    `Entendo completamente sua frustração! 😔 Isso é muito mais comum do que você imagina.

Vamos tentar uma abordagem diferente. Me conte:
- Em qual passo exato você está tendo dificuldade?
- O que aparece na tela quando tenta?

Vou explicar de uma forma ainda mais simples e devagar. Não desista, você vai conseguir! 💙`,

    `Sei que é frustrante quando a tecnologia não coopera! 😤 Mas saiba que TODOS nós já passamos por isso.

Vamos fazer assim:
1. Respire fundo 😌
2. Me conte qual era seu objetivo
3. Vamos recomeçar, bem devagar

Você é muito mais capaz do que imagina! Vamos juntos! 🤝💙`
  ];
  
  return frustratedResponses[context.sessionMessages % 2];
}

function getConfusedUserResponse(nlpResult: NLPResult, context: any): string {
  return `Entendo que ficou confuso! 🤔 É normal no início - tecnologia pode ser bem confusa mesmo.

Vamos esclarecer isso! Me ajude respondendo:

📱 **Sobre seu celular:**
- É Android (Samsung, Motorola...) ou iPhone?
- Que aplicativo você está tentando usar?

🎯 **Sobre seu objetivo:**
- O que você quer fazer exatamente?
- É a primeira vez tentando isso?

Com essas informações, posso te dar explicações muito mais claras e específicas! 😊💙`;
}

function getPositiveUserResponse(nlpResult: NLPResult, context: any): string {
  const positiveResponses = [
    `Que ótimo! Fico muito feliz que está dando certo! 🎉😊

Você está indo muito bem! Continue assim que logo vai estar dominando tudo!

O que mais gostaria de aprender agora? 💙✨`,

    `Maravilha! 🌟 Adorei saber que conseguiu!

Isso mostra que você tem muito potencial para tecnologia. Parabéns! 👏

Quer tentar algo um pouquinho mais avançado agora? Ou prefere praticar mais o que acabou de aprender? 😊`
  ];
  
  return positiveResponses[context.successfulInteractions % 2];
}

function getContinuationResponse(currentTopic: string, nlpResult: NLPResult, context: any): string {
  return `Vejo que continuamos falando sobre ${currentTopic}! 😊

Baseado no que já conversamos, posso te ajudar a:

🔄 **Revisar** os passos que já explicamos
📈 **Avançar** para o próximo nível  
🔧 **Resolver** alguma dificuldade específica
💡 **Explorar** outras funcionalidades relacionadas

O que seria mais útil para você agora? 💙`;
}

function getSmartGenericResponse(nlpResult: NLPResult, context: any, userMessage: string): string {
  // Analisar entidades para resposta mais específica
  const entities = nlpResult.entities;
  const hasAppName = entities.some(e => e.type === 'app_name');
  const hasAction = entities.some(e => e.type === 'action');
  
  if (hasAppName) {
    const appName = entities.find(e => e.type === 'app_name')?.value;
    return `Entendi que você quer fazer algo com ${appName}! 😊

Para te ajudar melhor, me conte:
- O que exatamente você quer fazer no ${appName}?
- Você já tem ele instalado no celular?
- É a primeira vez usando este aplicativo?

Com essas informações, posso te dar um passo a passo bem detalhado! 💙`;
  }
  
  if (hasAction) {
    const action = entities.find(e => e.type === 'action')?.value;
    return `Vejo que você quer ${action} algo! 😊

Para te orientar corretamente:
- Em qual aplicativo você quer fazer isso?
- Já tentou antes ou é a primeira vez?
- Tem alguma dificuldade específica?

Vou te ensinar o jeito mais fácil de fazer! 💙`;
  }
  
  // Resposta genérica inteligente baseada no nível de dificuldade
  if (nlpResult.difficulty === 'beginner') {
    return `Entendi sua pergunta! 😊

Como vejo que você está começando, vou explicar tudo bem detalhadamente.

Me conte:
- **O que você quer aprender** hoje?
- **Qual aplicativo** ou função te interessa?
- **Tem alguma urgência** ou é só curiosidade?

Vou te ensinar passo a passo, com toda paciência do mundo! 💙✨`;
  }
  
  // Resposta genérica empática usando fallback
  return `Entendi sua pergunta! 😊

Para te dar a melhor ajuda possível, me conte um pouco mais sobre:

- **Qual aplicativo** ou função você quer usar?
- **O que você quer fazer** exatamente?
- **Já tentou algo** ou é a primeira vez?

Quanto mais detalhes você me der, melhor posso te ajudar! Não tenha pressa, vamos resolver isso juntos passo a passo! 💙

💡 **Dica**: Você também pode escolher uma das opções ali embaixo se preferir!`;
}

function getHelpResponse(nlpResult: NLPResult, context: any): string {
  const userAnalysis = contextManager.analyzeUserLearning();
  
  let helpResponse = `Estou aqui para te ajudar! 😊

**Baseado no nosso histórico, vejo que:**`;

  if (userAnalysis.strongTopics.length > 0) {
    helpResponse += `\n✅ **Você já domina:** ${userAnalysis.strongTopics.join(', ')}`;
  }

  if (userAnalysis.weakTopics.length > 0) {
    helpResponse += `\n📚 **Podemos melhorar:** ${userAnalysis.weakTopics.join(', ')}`;
  }

  helpResponse += `\n\n💡 **Recomendações para você:**`;
  userAnalysis.recommendedNextSteps.forEach((step, index) => {
    helpResponse += `\n${index + 1}. ${step}`;
  });

  helpResponse += `\n\nO que te interessa mais? Ou tem alguma dúvida específica? 💙`;

  return helpResponse;
}

// Funções auxiliares para ações rápidas
function getTopicForAction(action: string): string {
  const topicMapping: { [key: string]: string } = {
    'whatsapp': 'Comunicação',
    'email': 'Comunicação', 
    'ligacao': 'Comunicação',
    'camera': 'Mídia e Fotos',
    'wifi': 'Conectividade',
    'banco': 'Serviços Financeiros',
    'compras': 'Compras Online',
    'configuracoes': 'Configurações do Dispositivo',
    'celular-basico': 'Uso Básico do Celular'
  };
  
  return topicMapping[action] || 'Geral';
}

function getActionDescription(action: string): string {
  const descriptions: { [key: string]: string } = {
    'whatsapp': 'Usuário quer aprender sobre WhatsApp',
    'email': 'Usuário quer aprender sobre e-mail',
    'ligacao': 'Usuário quer aprender a fazer ligações',
    'camera': 'Usuário quer aprender a usar câmera',
    'wifi': 'Usuário quer aprender sobre WiFi',
    'banco': 'Usuário quer aprender sobre banco digital',
    'compras': 'Usuário quer aprender sobre compras online',
    'configuracoes': 'Usuário quer aprender sobre configurações',
    'celular-basico': 'Usuário quer aprender uso básico do celular'
  };
  
  return descriptions[action] || `Usuário selecionou ação: ${action}`;
}

function getFallbackResponse(userMessage: string): string {
  return `Desculpe, tive um probleminha técnico! 😅

Mas não se preocupe, vou te ajudar mesmo assim!

Pode me contar de novo o que você precisa? Vou dar meu melhor para explicar de forma simples e clara! 💙

**Dica:** Tente ser bem específico sobre o que quer fazer, assim posso te ajudar melhor! 😊`;
}

// Manter as funções originais para compatibilidade
function getQuickActionResponse(action: string): string {
  const responses: { [key: string]: string } = {
    "celular-basico": `Vou te ensinar o básico do celular! 📱

**Conhecendo seu celular:**

1. **Tela Principal (Início)**: É a primeira tela que aparece quando você liga o celular
   - Aqui ficam os aplicativos mais importantes
   - Para voltar sempre aqui, aperte o botão redondo na parte de baixo

2. **Como abrir aplicativos**:
   - Toque uma vez no ícone do aplicativo
   - Aguarde alguns segundos para abrir

3. **Como voltar**: 
   - Use o botão "Voltar" (seta para trás) no canto inferior
   - Ou o botão "Início" (redondo) para ir à tela principal

4. **Desligar a tela**:
   - Aperte rapidamente o botão lateral (liga/desliga)
   - A tela escurece mas o celular continua ligado

**Dica importante**: Não tenha pressa! O celular às vezes demora um pouco para responder.

Qual parte você gostaria que eu explique melhor? 😊`,

    "wifi": `Vou te ajudar a conectar no WiFi! 📶

**Passo a passo para conectar WiFi:**

1. **Abrir Configurações**:
   - Procure um ícone de "engrenagem" ⚙️ ou "Configurações"
   - Toque nele uma vez

2. **Encontrar WiFi**:
   - Procure por "WiFi", "Wi-Fi" ou "Conexões"
   - Toque nesta opção

3. **Ativar o WiFi**:
   - Se estiver desligado, toque no botão para ligar
   - Aparecerá uma lista de redes disponíveis

4. **Escolher sua rede**:
   - Encontre o nome da sua rede WiFi
   - Toque no nome da rede

5. **Colocar senha**:
   - Digite a senha do WiFi
   - Toque em "Conectar"

**Onde encontrar a senha do WiFi?**
- Atrás do roteador (aparelho da internet)
- Em uma etiqueta ou papel que veio com o aparelho
- Pergunte para quem instalou a internet

Conseguiu seguir até aqui? Me avise em qual passo está! 😊`,

    "whatsapp": `Vou te ensinar a usar o WhatsApp! 💬

**Primeiros passos no WhatsApp:**

1. **Encontrar o WhatsApp**:
   - Procure um ícone verde com um telefone branco
   - Toque uma vez para abrir

2. **Tela principal do WhatsApp**:
   - Aparecerão suas conversas (no início pode estar vazio)
   - Embaixo tem: "Conversas", "Status", "Chamadas"

3. **Para enviar mensagem**:
   - Toque no símbolo de "nova conversa" (+ ou ícone de lápis)
   - Escolha um contato da sua agenda
   - Digite sua mensagem na caixa embaixo
   - Toque na setinha verde para enviar

4. **Para responder mensagem**:
   - Toque na conversa que recebeu
   - Digite sua resposta embaixo
   - Toque na setinha verde

**Símbolos importantes:**
- ✓ = Mensagem enviada
- ✓✓ = Mensagem entregue 
- ✓✓ azul = Mensagem lida

Quer que eu explique como enviar fotos ou fazer outra coisa no WhatsApp? 😊`,

    "email": `Vou te ajudar com e-mail! 📧

**Como usar e-mail no celular:**

1. **Encontrar aplicativo de e-mail**:
   - Procure por "E-mail", "Gmail" ou um ícone de envelope 📨
   - Toque para abrir

2. **Ver e-mails recebidos**:
   - Na tela principal aparecem suas mensagens
   - As mais novas ficam no topo
   - Toque em uma mensagem para ler

3. **Enviar um e-mail**:
   - Procure botão "Escrever", "+" ou ícone de lápis
   - Toque nele
   - Preencha:
     * **Para**: E-mail de quem vai receber
     * **Assunto**: Resumo do que é o e-mail
     * **Mensagem**: Escreva sua mensagem

4. **Enviar**:
   - Procure botão "Enviar" (geralmente uma setinha)
   - Toque para enviar

**Dicas importantes:**
- Sempre confira o e-mail do destinatário
- Escreva assuntos claros como "Reunião de família"
- Seja educado na mensagem

Tem alguma conta de e-mail já configurada? Qual aplicativo está usando? 😊`,

    "camera": `Vou te ensinar a usar a câmera! 📸

**Como tirar fotos:**

1. **Abrir a câmera**:
   - Procure ícone de câmera 📷 
   - Ou deslize a tela de bloqueio para o lado (alguns celulares)

2. **Preparar a foto**:
   - Aponte o celular para o que quer fotografar
   - Você vê na tela como vai ficar a foto
   - Segure o celular firme

3. **Tirar a foto**:
   - Toque no botão redondo grande (geralmente embaixo)
   - Ou aperte o botão de volume

4. **Ver a foto tirada**:
   - Toque na miniatura da foto (cantinho da tela)
   - Ou vá na "Galeria" depois

**Para enviar foto pelo WhatsApp:**
1. Abra conversa no WhatsApp
2. Toque no clipe 📎 ou câmera
3. Escolha "Câmera" ou "Galeria"
4. Selecione a foto e envie

**Dicas para fotos melhores:**
- Use boa iluminação (perto da janela)
- Limpe a lente da câmera
- Segure firme para não tremer

Quer que eu explique melhor alguma parte? 😊`,

    "ligacao": `Vou te ensinar a fazer ligações! 📞

**Como ligar para alguém:**

1. **Abrir o aplicativo Telefone**:
   - Procure ícone de telefone 📱
   - Geralmente fica na parte de baixo da tela

2. **Três formas de ligar**:

**Forma 1 - Pelos Contatos:**
- Toque em "Contatos" ou "Agenda"
- Procure o nome da pessoa
- Toque no nome, depois no ícone de telefone

**Forma 2 - Digitando número:**
- Toque em "Teclado" ou nos números
- Digite o número com o DDD
- Toque no botão verde de ligar

**Forma 3 - Hist��rico:**
- Toque em "Recentes" ou "Histórico"
- Veja ligações anteriores
- Toque ao lado do nome para ligar de volta

3. **Durante a ligação**:
   - Fale próximo ao celular
   - Para desligar: toque no botão vermelho

**Para atender ligação:**
- Quando toca, deslize o botão verde
- Ou toque no botão verde (depende do celular)

**Dicas importantes:**
- Sempre coloque DDD + número
- Para celular: ex: (11) 99999-9999
- Para fixo: ex: (11) 3333-3333

Quer que eu explique como salvar contatos na agenda? 😊`,

    "compras": `Vou te ensinar sobre compras online seguras! 🛒

**Como comprar online com segurança:**

1. **Sites confiáveis para começar**:
   - Mercado Livre, Amazon, Magazine Luiza
   - Sempre digite o endereço direto ou use o aplicativo oficial

2. **Antes de comprar - Verificações importantes**:
   - ✅ Site tem "https://" (o "s" é importante!)
   - ✅ Vendedor tem boa avaliação (estrelinhas)
   - ✅ Produto tem fotos e descrição detalhada
   - ✅ Preço não é "bom demais para ser verdade"

3. **Passo a passo para comprar**:
   - Encontre o produto
   - Leia descrição e avaliações
   - Verifique frete e prazo de entrega
   - Clique "Comprar" ou "Adicionar ao carrinho"
   - Preencha seus dados de entrega
   - Escolha forma de pagamento

4. **Formas de pagamento mais seguras**:
   - Cartão de crédito (tem proteção)
   - PIX (para vendedores confiáveis)
   - Boleto (cuidado com prazo de vencimento)

**NUNCA faça:**
❌ Comprar por links no WhatsApp de desconhecidos
❌ Dar dados do cartão por telefone
❌ Pagar antecipado para "reservar" produto

**Sempre guarde:**
📋 Número do pedido
📋 Dados do vendedor
📋 Comprovante de pagamento

Quer que eu explique como usar um site específico? 😊`,

    "banco": `Vou te ajudar com banco digital e PIX! 🏦

**Usando aplicativo do banco:**

1. **Baixar app do seu banco**:
   - Procure nome do SEU banco na loja de aplicativos
   - Baixe apenas o aplicativo oficial
   - Cuidado com aplicativos falsos!

2. **Primeiro acesso**:
   - Use os dados que você usa no caixa eletrônico
   - Agência, conta e senha
   - Pode pedir para cadastrar digital ou senha do celular

3. **Funções principais**:
   - **Saldo**: Ver quanto tem na conta
   - **Extrato**: Ver entradas e saídas de dinheiro
   - **Transferência**: Enviar dinheiro para outra conta
   - **PIX**: Transferência rápida e grátis

**Como usar o PIX:**

1. **Para enviar PIX**:
   - Entre no app do banco
   - Procure "PIX" ou "Transferir"
   - Escolha como enviar:
     * Chave PIX (CPF, telefone, e-mail)
     * QR Code (câmera)
     * Dados bancários completos

2. **Para receber PIX**:
   - Dê sua chave PIX (seu CPF é mais fácil)
   - Ou gere QR Code no app
   - O dinheiro cai na hora!

**Segurança importantes:**
🔒 Nunca empreste seu celular com app bancário aberto
🔒 Sempre confira dados antes de confirmar PIX
🔒 PIX não tem como cancelar depois de enviar
🔒 Desconfie de PIX de desconhecidos

Qual banco você usa? Posso dar dicas mais específicas! 😊`,

    "configuracoes": `Vou te ajudar com configurações do celular! ⚙️

**Principais configurações úteis:**

1. **Como chegar nas Configurações**:
   - Procure ícone de "engrenagem" ⚙️
   - Ou "Configurações" / "Ajustes"
   - Toque para abrir

2. **Configurações mais importantes**:

**Brilho da tela:**
- Configurações → Tela ou Display
- Ajuste o brilho para enxergar melhor
- Pode deixar automático

**Volume:**
- Configurações → Som
- Ajuste volume de toque, mídia e notificações
- Teste os volumes

**WiFi:**
- Configurações → WiFi
- Conectar e gerenciar redes

**Bluetooth:**
- Configurações → Bluetooth
- Para conectar fones ou caixas de som

**Economia de bateria:**
- Configurações → Bateria
- Ver o que gasta mais bateria

3. **Configurações de acessibilidade**:
- Configurações → Acessibilidade
- **Texto grande**: Aumentar tamanho das letras
- **Lupa**: Para aumentar coisas na tela
- **Alto contraste**: Para enxergar melhor

4. **Bloquear tela**:
- Configurações → Segurança
- Configurar senha, digital ou padrão

**Dica importante**: Sempre anote senhas que criar!

Qual configuração você gostaria de ajustar primeiro? 😊`,

    "outros": `Estou aqui para te ajudar com qualquer dúvida sobre tecnologia! 😊

**Outros assuntos que posso te ajudar:**

📱 **Uso básico do celular**
- Como navegar pela tela
- Organizar aplicativos
- Cuidados com o aparelho

🌐 **Internet e navegação**
- Como usar o Google
- Procurar informações
- Cuidados com links suspeitos

📺 **YouTube e vídeos**
- Como assistir vídeos
- Procurar canais interessantes
- Controlar reprodução

🎵 **Música no celular**
- Aplicativos de música
- Como ouvir suas músicas favoritas

📱 **Outros aplicativos úteis**
- Uber/99 para transporte
- iFood para delivery
- Maps para localização

🔧 **Problemas técnicos**
- Celular lento
- Aplicativo não abre
- Espaço de armazenamento

💡 **Dicas de segurança digital**
- Como criar senhas seguras
- Evitar golpes online
- Proteger informações pessoais

**Me conte:**
- Qual é sua dúvida específica?
- O que você gostaria de aprender?
- Está tendo algum problema?

Vou explicar tudo com calma e paciência! 💙`
  };

  return responses[action] || "Desculpe, ainda não tenho uma resposta específica para isso. Pode me contar mais detalhes sobre o que precisa?";
}

function getContextualResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // Respostas baseadas em palavras-chave e contexto
  if (message.includes("obrigad")) {
    return `De nada! Fico muito feliz em poder ajudar! 😊

Se tiver mais dúvidas ou quiser aprender algo novo, é só perguntar. Estou sempre aqui para te ajudar com toda paciência do mundo! 💙

Você conseguiu fazer o que queria? Se ainda estiver com dificuldades, podemos tentar de outro jeito!`;
  }

  if (message.includes("não entendi") || message.includes("confus")) {
    return `Entendo! Às vezes eu explico rápido demais. Vamos com mais calma! 😊

Me diga qual parte ficou confusa que eu explico de novo, bem devagar e com mais detalhes.

Lembre-se: não existe pergunta boba! É normal ficar confuso no início. Todos passamos por isso! 💙`;
  }

  if (message.includes("não funcionou") || message.includes("erro") || message.includes("problema")) {
    return `Que chato! Vamos resolver isso juntos! 😊

Para eu te ajudar melhor, me conte:

1. **O que você estava tentando fazer?**
2. **Em que passo parou de funcionar?**
3. **Apareceu alguma mensagem na tela?**
4. **O que aconteceu exatamente?**

Com essas informações, posso te dar uma solução mais certeira! Não desista, vamos conseguir! 💪💙`;
  }

  if (message.includes("medo") || message.includes("receio")) {
    return `Entendo perfeitamente seu receio! É muito normal ter medo de mexer em tecnologia no início. 😊

**Saiba que:**
- Você não vai "quebrar" nada só explorando
- Sempre dá para voltar atrás
- Eu estou aqui para te ajudar em cada passo
- Todos os especialistas já foram iniciantes um dia

**Vamos começar bem devagar:**
- Com coisas simples e seguras
- Explicando cada passo
- Sem pressa nenhuma

O que você gostaria de aprender primeiro? Algo bem básico para você ganhar confiança! 💙✨`;
  }

  // Detectar perguntas sobre aplicativos específicos
  if (message.includes("whatsapp") || message.includes("zap")) {
    return getQuickActionResponse("whatsapp");
  }

  if (message.includes("email") || message.includes("e-mail")) {
    return getQuickActionResponse("email");
  }

  if (message.includes("foto") || message.includes("camera")) {
    return getQuickActionResponse("camera");
  }

  if (message.includes("wifi") || message.includes("internet")) {
    return getQuickActionResponse("wifi");
  }

  if (message.includes("banco") || message.includes("pix")) {
    return getQuickActionResponse("banco");
  }

  if (message.includes("ligar") || message.includes("ligação")) {
    return getQuickActionResponse("ligacao");
  }

  // Resposta genérica empática
  return `Entendi sua pergunta! 😊

Para te dar a melhor ajuda possível, me conte um pouco mais sobre:

- **Qual aplicativo** ou função você quer usar?
- **O que você quer fazer** exatamente?
- **Já tentou algo** ou é a primeira vez?

Quanto mais detalhes você me der, melhor posso te ajudar! Não tenha pressa, vamos resolver isso juntos passo a passo! 💙

💡 **Dica**: Você também pode escolher uma das opções ali embaixo se preferir!`;
}

// Função para re-inicializar LLM (útil quando API key é configurada)
export const reinitializeLLM = () => {
  initializeLLM();
};

// Exportar serviços para uso externo
export { nlpService, llmService, contextManager };

// Manter compatibilidade com versão anterior
export const chatbotResponses = {
  "celular-basico": getQuickActionResponse("celular-basico"),
  "wifi": getQuickActionResponse("wifi"),
  "whatsapp": getQuickActionResponse("whatsapp"),
  "email": getQuickActionResponse("email"),
  "camera": getQuickActionResponse("camera"),
  "ligacao": getQuickActionResponse("ligacao"),
  "compras": getQuickActionResponse("compras"),
  "banco": getQuickActionResponse("banco"),
  "configuracoes": getQuickActionResponse("configuracoes"),
  "outros": getQuickActionResponse("outros")
};