// config.js
// NÃO comite este arquivo com chaves em repositório público.
// Em produção, mova as chaves para um backend seguro.

/* URLs e IDs */
const CONFIG = {
  MISTRAL_API_URL: "https://api.mistral.ai/v1/generate", // ajuste se sua rota for outra
  MISTRAL_API_KEY: "COLE_SUA_CHAVE_AQUI",

  ADS_CLIENT: "ca-pub-0000000000000000",
  ADS_SLOT: "0000000000",

  CLARITY_ID: "0000000000",

  TERMS_URL: "https://termos.orpheostudio.com.br",
  POLICIES_URL: "https://politicas.orpheostudio.com.br",

  STRICT_DIRECTIVES: {
    persona: "aura_assistente",
    language: "pt-BR",
    tone: "educado, levemente coloquial",
    allowed_topics: ["suporte técnico", "resumos", "recomendações de leitura", "informações gerais"],
    forbidden_topics: [
      "instruções para atividades ilegais",
      "conselhos médicos diagnósticos",
      "diagnósticos legais vinculantes",
      "informações pessoais identificáveis (doxxing)"
    ],
    max_response_tokens: 800,
    require_fact_check: true,
    handle_unknowns: "admitir desconhecimento e sugerir fontes confiáveis",
    escalation: {
      threshold_confidence: 0.6,
      message: "Não tenho certeza suficiente para responder com segurança. Deseja que eu procure fontes confiáveis?"
    }
  }
};
