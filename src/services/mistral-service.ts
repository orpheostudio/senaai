/**
 * Serviço de integração com Mistral AI
 * API Key configurada internamente para facilidade de uso
 */

const MISTRAL_API_KEY = "SEU_API_KEY_MISTRAL_AQUI"; // Substitua pela sua chave da Mistral AI
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

interface MistralMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Envia uma mensagem para a Mistral AI e retorna a resposta
 */
export async function getMistralResponse(
  userMessage: string,
  conversationHistory: MistralMessage[] = []
): Promise<string> {
  try {
    const systemPrompt: MistralMessage = {
      role: "system",
      content: `Você é a Sena, uma assistente digital kawaii e gentil especializada em ajudar pessoas com 60+ anos e pessoas com dificuldades tecnológicas.

PERSONALIDADE:
- Seja extremamente paciente, carinhosa e encorajadora
- Use emojis kawaii frequentemente (💜, ✨, 🌸, 💫, 🎀)
- Mantenha um tom acolhedor e nunca condescendente
- Celebre pequenas conquistas do usuário
- Use linguagem simples e direta

ESTILO DE RESPOSTA:
- Divida instruções em passos numerados curtos
- Use formatação em **negrito** para destacar ações importantes
- Sempre pergunte se o usuário entendeu ou precisa de mais ajuda
- Ofereça exemplos práticos quando possível
- Evite jargões técnicos, explique termos quando necessário

ESPECIALIDADES:
- Usar celular (Android e iOS)
- WhatsApp, e-mail, mensagens
- Fotografar e compartilhar fotos
- WiFi e internet
- Banco digital e PIX
- Compras online seguras
- Configurações básicas do celular
- Identificação de golpes digitais

SEGURANÇA:
- Sempre alerte sobre segurança digital quando relevante
- Ensine a identificar golpes e fraudes
- Reforce a importância de não compartilhar senhas

IMPORTANTE:
- Admita quando não souber algo
- Sugira procurar ajuda presencial quando necessário
- Mantenha respostas concisas (máximo 300 palavras)
- Adapte-se ao nível de conhecimento demonstrado pelo usuário`
    };

    const messages: MistralMessage[] = [
      systemPrompt,
      ...conversationHistory,
      { role: "user", content: userMessage }
    ];

    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest", // Modelo eficiente e econômico
        messages: messages,
        temperature: 0.7, // Criatividade moderada
        max_tokens: 500, // Respostas concisas
        top_p: 0.9,
        safe_prompt: true // Ativa moderação de conteúdo
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erro da API Mistral:", errorData);
      
      // Fallback para erro de API
      return getFallbackResponse(userMessage);
    }

    const data: MistralResponse = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }

    return getFallbackResponse(userMessage);

  } catch (error) {
    console.error("Erro ao conectar com Mistral AI:", error);
    return getFallbackResponse(userMessage);
  }
}

/**
 * Resposta de fallback caso a API falhe
 */
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // Respostas básicas baseadas em palavras-chave
  if (lowerMessage.includes("whatsapp") || lowerMessage.includes("wpp")) {
    return `💬 **WhatsApp - Primeiros Passos** ✨

**1. Abrir o WhatsApp:**
• Procure o ícone verde com telefone branco
• Toque nele para abrir

**2. Enviar mensagem:**
• Toque no ícone de nova conversa (+ ou lápis)
• Escolha o contato
• Digite sua mensagem
• Toque na setinha verde ➤

**3. Receber mensagens:**
• Novas mensagens aparecem na lista
• Toque na conversa para abrir
• Leia e responda 💜

**Precisa de ajuda específica? Me conte o que você quer fazer no WhatsApp!** 🌸`;
  }

  if (lowerMessage.includes("wifi") || lowerMessage.includes("wi-fi") || lowerMessage.includes("internet")) {
    return `📶 **Como conectar no WiFi** ✨

**Passo a passo:**

**1.** Abra **Configurações** (ícone de engrenagem ⚙️)

**2.** Procure e toque em **WiFi** ou **Rede sem fio**

**3.** Ative o WiFi (botão deve ficar azul ou verde)

**4.** Escolha sua rede WiFi na lista

**5.** Digite a **senha** (geralmente está no roteador)

**6.** Toque em **Conectar**

**💡 Dica:** A senha tem letras e números. Use exatamente como está escrito!

**Conseguiu conectar? Me conta!** 💜`;
  }

  if (lowerMessage.includes("pix") || lowerMessage.includes("banco")) {
    return `🏦 **PIX - Como usar com segurança** ✨

**O que é PIX:**
• Transferência instantânea de dinheiro
• Funciona 24 horas, todos os dias
• Grátis para pessoas físicas

**Como fazer um PIX:**

**1.** Abra o app do seu **banco**

**2.** Procure o botão **PIX**

**3.** Escolha **Enviar** ou **Transferir**

**4.** Digite a **chave PIX** do destinatário
   (pode ser CPF, telefone, e-mail ou chave aleatória)

**5.** Digite o **valor**

**6.** Confira os dados e **confirme**

**⚠️ SEGURANÇA:**
• Sempre confira o nome do destinatário antes de confirmar
• Nunca faça PIX para desconhecidos
• Bancos não pedem senha por telefone

**Tem alguma dúvida específica sobre PIX?** 💜`;
  }

  // Resposta genérica amigável
  return `Oi! 💜

Desculpe, estou com um pequeno problema técnico agora, mas ainda posso te ajudar! ✨

**Posso te ensinar sobre:**
📱 Celular e configurações
💬 WhatsApp
📧 E-mail
📸 Tirar fotos
🏦 PIX e banco digital
🛒 Compras online
📶 WiFi

**Me conte com o que você precisa de ajuda!** 🌸

Vou explicar tudo com paciência e carinho! 💖`;
}

/**
 * Verifica se a API key está configurada
 */
export function isMistralConfigured(): boolean {
  return MISTRAL_API_KEY !== "SEU_API_KEY_MISTRAL_AQUI" && MISTRAL_API_KEY.length > 0;
}
