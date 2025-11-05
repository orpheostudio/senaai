# 🤖 Configurar Mistral AI - Sena

## 📋 Sobre

A Sena usa a **Mistral AI** para gerar respostas inteligentes e personalizadas. A API já está integrada no código, você só precisa configurar sua chave de API.

## 🔑 Obter Chave da API Mistral

### Passo 1: Criar Conta

1. Acesse [console.mistral.ai](https://console.mistral.ai/)
2. Clique em **Sign up** (ou **Log in** se já tiver conta)
3. Complete o cadastro com seu e-mail

### Passo 2: Criar API Key

1. No dashboard, vá em **API Keys**
2. Clique em **Create new key**
3. Dê um nome (ex: "Sena Chatbot")
4. Copie a chave gerada (começa com algo como `sk-...`)

⚠️ **IMPORTANTE:** Guarde esta chave em local seguro! Ela só é mostrada uma vez.

### Passo 3: Adicionar Créditos (se necessário)

- Mistral oferece alguns créditos gratuitos iniciais
- Verifique seu saldo em **Billing**
- Adicione créditos se necessário (aceita cartão de crédito)

## ⚙️ Configurar no Código

### Arquivo: `/services/mistral-service.ts`

Abra o arquivo e substitua a linha 8:

**Antes:**
```typescript
const MISTRAL_API_KEY = "SEU_API_KEY_MISTRAL_AQUI";
```

**Depois:**
```typescript
const MISTRAL_API_KEY = "sk-sua-chave-real-aqui";
```

### Exemplo:
```typescript
const MISTRAL_API_KEY = "sk-abc123def456ghi789jkl012mno345pqr";
```

## ✅ Testar

1. Salve o arquivo
2. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Abra o chat e envie uma mensagem
4. A Sena deve responder usando a IA da Mistral!

## 🔒 Segurança

### ⚠️ NÃO faça:
- ❌ Compartilhar sua chave publicamente
- ❌ Fazer commit da chave no Git
- ❌ Deixar a chave em código frontend público

### ✅ Faça:
- ✅ Use variáveis de ambiente em produção
- ✅ Configure `.gitignore` para não enviar chaves
- ✅ Monitore uso no dashboard da Mistral
- ✅ Revogue chaves comprometidas imediatamente

## 🏭 Produção (Opcional)

Para produção, use variáveis de ambiente:

### 1. Criar arquivo `.env`:
```env
VITE_MISTRAL_API_KEY=sk-sua-chave-aqui
```

### 2. Atualizar `mistral-service.ts`:
```typescript
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY || "";
```

### 3. Adicionar ao `.gitignore`:
```
.env
.env.local
.env.production
```

## 💰 Custos

### Modelo usado: `mistral-small-latest`

- **Preço:** ~$0.002 por 1K tokens
- **Estimativa:** 1000 conversas = ~$2-5 USD
- **Vantagens:** 
  - Rápido
  - Econômico
  - Boa qualidade para assistente

### Dicas para economizar:
- ✅ Use `max_tokens: 500` (já configurado)
- ✅ Limite histórico de conversa a 6 mensagens
- ✅ Ative `safe_prompt` para moderação
- ✅ Configure fallback para respostas básicas

## 🔄 Sistema de Fallback

Se a API Mistral falhar ou não estiver configurada, a Sena usa um sistema de fallback com respostas pré-programadas.

**Tópicos cobertos no fallback:**
- WhatsApp
- WiFi/Internet
- PIX e Banco
- Respostas genéricas

Isso garante que a Sena sempre funcione, mesmo sem API configurada!

## 📊 Monitoramento

### Dashboard Mistral

1. Acesse [console.mistral.ai](https://console.mistral.ai/)
2. Vá em **Usage**
3. Monitore:
   - Requests por dia
   - Tokens consumidos
   - Custos
   - Latência

### Logs no Console

Abra DevTools > Console para ver:
- ✅ Requests bem-sucedidos
- ❌ Erros de API
- 🔄 Fallbacks ativados

## 🆘 Troubleshooting

### Erro: "Invalid API Key"
- Verifique se copiou a chave corretamente
- Certifique-se de que não há espaços extras
- Gere uma nova chave se necessário

### Erro: "Insufficient credits"
- Adicione créditos no dashboard
- Verifique seu método de pagamento

### Erro: "Rate limit exceeded"
- Aguarde alguns minutos
- Considere upgrade de plano
- Implemente cache de respostas

### Sena não responde
1. Abra DevTools > Console
2. Procure por erros em vermelho
3. Verifique se a chave está configurada
4. Teste a conexão com a API

## 🎯 Alternativas

Se não quiser usar Mistral AI:

### 1. Usar apenas Fallback
Remova ou comente a chamada do Mistral no `App.tsx`:

```typescript
// Use apenas o sistema local
const response = await getBotResponse("", text);
```

### 2. Outras APIs
Você pode adaptar para:
- OpenAI GPT
- Google PaLM
- Anthropic Claude
- Cohere

Basta ajustar o código em `/services/mistral-service.ts`

## 📚 Recursos

- [Documentação Mistral AI](https://docs.mistral.ai/)
- [Pricing](https://mistral.ai/pricing/)
- [API Reference](https://docs.mistral.ai/api/)
- [Modelos Disponíveis](https://docs.mistral.ai/platform/endpoints/)

## 💡 Dicas Avançadas

### Customizar Personalidade

Edite o `systemPrompt` em `mistral-service.ts` para ajustar:
- Tom de voz
- Nível de detalhamento
- Emojis usados
- Especialidades

### Ajustar Parâmetros

```typescript
{
  temperature: 0.7,  // Criatividade (0-1)
  max_tokens: 500,   // Tamanho da resposta
  top_p: 0.9,        // Diversidade
}
```

### Implementar Cache

Para economizar:
```typescript
const cache = new Map();
if (cache.has(userMessage)) {
  return cache.get(userMessage);
}
// ...fazer request
cache.set(userMessage, response);
```

---

**Pronto!** 🎉 Sua Sena está configurada com IA avançada da Mistral!

Para dúvidas: [Orpheo Studio](https://orpheostudio.com.br)
