# 💜 Sena V6.0 - Assistente Digital com Alma Gentil

<div align="center">
  <img src="https://i.imgur.com/Dc3f5ZQ.jpeg" alt="Sena" width="150" height="150" style="border-radius: 50%;">
  
  <h2>✨ Tecnologia com alma gentil ✨</h2>
  
  [![Version](https://img.shields.io/badge/version-6.0-purple)](/)
  [![Powered by](https://img.shields.io/badge/powered%20by-AmplaAI-ff69b4)](/)
  [![AI](https://img.shields.io/badge/AI-Mistral-orange)](https://mistral.ai/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-success)](/)
</div>

---

## 🌸 O que mudou na V6.0?

### ✅ 1. Interface Redesenhada
- **Header minimalista** com logo + nome + slogan
- **Menu hambúrguer** com todas as funções
- **Rodapé** mostrando "V6.0 Powered by AmplaAI"
- **Cores uniformes** em header e footer

### ✅ 2. Mistral AI Integrado
- **IA mais inteligente** e econômica
- **Configuração simplificada** (hardcoded)
- **Sistema de fallback** robusto
- **Respostas contextuais** e personalizadas

### ✅ 3. Sistema de Abas
- **Aba Conversa** - Chat principal
- **Aba Ajuda Rápida** - Tutoriais e dicas
- **Navegação intuitiva**

### ✅ 4. Tela de Boas-Vindas Completa
- **Logo da Sena** em destaque
- **Mensagem acolhedora**
- **Disclaimer de erros** transparente
- **Termos e Políticas** integrados
- **Checkbox obrigatório**

---

## 🚀 Início Rápido

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sena.git

# Entre na pasta
cd sena

# Instale dependências
npm install
```

### 2. Configurar Mistral AI

Edite `/services/mistral-service.ts` linha 8:

```typescript
const MISTRAL_API_KEY = "sua-chave-mistral-aqui";
```

📖 **Guia completo:** [CONFIGURAR_MISTRAL.md](CONFIGURAR_MISTRAL.md)

### 3. Executar

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

---

## 📱 Funcionalidades

### 💬 Chat Inteligente
- IA Mistral para respostas contextuais
- Fallback local se API indisponível
- Memória de conversa
- Respostas em português brasileiro

### 🎤 Acessibilidade Total
- **Text-to-Speech (TTS)** - Ouça as mensagens
- **Speech-to-Text (STT)** - Fale ao invés de digitar
- **Alto contraste** - Melhor visibilidade
- **Fontes ajustáveis** - Tamanho personalizável
- **Navegação por teclado** - F1, Ctrl+Enter, Esc
- **Áreas de clique grandes** - Facilita uso

### 🎨 Temas
- **Modo Claro** - Tons pastéis kawaii
- **Modo Escuro** - Confortável para noite
- **Alto Contraste** - Máxima legibilidade

### 📑 Organização
- **Aba Conversa** - Chat completo
- **Aba Ajuda Rápida** - Guias e tutoriais
- **Ações Rápidas** - Tópicos comuns

### 🍔 Menu Intuitivo
Todas funções em um só lugar:
- Ativar/Desativar Voz
- Alternar Tema
- Configurações de Acessibilidade
- Nova Conversa

---

## 🎯 Público-Alvo

### 👵 Pessoas 60+
Explicações pacientes, passo a passo, sem pressa

### ♿ Acessibilidade
Recursos completos para deficiências visuais e motoras

### 🌱 Iniciantes em Tecnologia
Linguagem simples, sem jargões técnicos

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| [ALTERACOES_V6.md](ALTERACOES_V6.md) | Todas as mudanças da V6 |
| [CONFIGURAR_MISTRAL.md](CONFIGURAR_MISTRAL.md) | Como configurar Mistral AI |
| [TESTE_V6.md](TESTE_V6.md) | Guia completo de testes |
| [DEPLOY_GITHUB_PAGES.md](DEPLOY_GITHUB_PAGES.md) | Deploy no GitHub Pages |
| [QUICK_START.md](QUICK_START.md) | Início rápido em 5 passos |
| [MICROSOFT_CLARITY.md](MICROSOFT_CLARITY.md) | Analytics com Clarity |

---

## 🛠️ Tecnologias

### Frontend
- **React 18** - Framework
- **TypeScript** - Tipagem
- **Tailwind CSS v4** - Estilização
- **Lucide React** - Ícones
- **shadcn/ui** - Componentes

### IA
- **Mistral AI** - Modelo de linguagem
- **Sistema de Fallback** - Respostas locais

### Acessibilidade
- **Web Speech API** - TTS/STT
- **ARIA** - Screen readers
- **Atalhos de teclado** - Navegação

### PWA
- **Service Workers** - Cache e offline
- **Web Manifest** - Instalável
- **Responsive Design** - Mobile-first

---

## 📖 Guia de Uso

### Para Usuários

1. **Primeira vez:**
   - Leia a tela de boas-vindas
   - Aceite os termos
   - Comece a conversar!

2. **Fazendo perguntas:**
   - Digite sua dúvida ou use o microfone
   - Sena responderá com carinho
   - Use "Ouvir" para escutar a resposta

3. **Configurações:**
   - Abra o menu hambúrguer (≡)
   - Ajuste voz, tema, acessibilidade
   - Salvo automaticamente

### Para Desenvolvedores

1. **Customizar personalidade:**
   - Edite `systemPrompt` em `/services/mistral-service.ts`

2. **Adicionar tópicos:**
   - Modifique `/components/ChatbotResponses.tsx`

3. **Ajustar visual:**
   - Cores em `/styles/globals.css`
   - Componentes em `/components/`

---

## 🔒 Privacidade

- ✅ Processamento local quando possível
- ✅ Mistral AI respeita LGPD/GDPR
- ✅ Sem coleta de dados pessoais identificáveis
- ✅ Links transparentes para políticas

**Links oficiais:**
- [Termos de Uso](https://termos.orpheostudio.com.br)
- [Políticas de Privacidade](https://politicas.orpheostudio.com.br)

---

## ⚠️ Disclaimer

A Sena é uma assistente digital que pode ocasionalmente cometer erros ou fornecer informações imprecisas. 

**Sempre:**
- ✅ Confirme informações importantes
- ✅ Consulte fontes oficiais
- ✅ Peça ajuda presencial quando necessário

---

## 🎨 Paleta de Cores

```css
/* Modo Claro */
--lavanda: #B894E8    /* Primária */
--coral: #FFB3C6      /* Secundária */
--perola: #FAF8FF     /* Background */
--roxo-escuro: #4A3B5C /* Texto */

/* Modo Escuro */
--roxo-profundo: #1A1625  /* Background */
--lavanda-clara: #D4B2FF  /* Primária */
--rosa-claro: #FF9EC3     /* Secundária */
--quase-branco: #F5F0FF   /* Texto */
```

---

## 📊 Status do Projeto

| Item | Status |
|------|--------|
| Interface V6 | ✅ Completo |
| Mistral AI | ✅ Integrado |
| PWA | ✅ Funcional |
| Acessibilidade | ✅ Completo |
| Testes | ✅ Documentado |
| Deploy | ✅ Pronto |
| Documentação | ✅ Completa |

---

## 🤝 Contribuindo

Quer contribuir? Ótimo!

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit (`git commit -m 'Adiciona MinhaFeature'`)
4. Push (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes

---

## 👥 Créditos

**Desenvolvido com 💜 por Orpheo Studio**

- Website: [orpheostudio.com.br](https://orpheostudio.com.br)
- Termos: [termos.orpheostudio.com.br](https://termos.orpheostudio.com.br)
- Políticas: [politicas.orpheostudio.com.br](https://politicas.orpheostudio.com.br)

**Powered by:**
- AmplaAI - Infraestrutura
- Mistral AI - Inteligência Artificial

---

## 📞 Suporte

### Precisa de ajuda?

- 📖 Leia a [documentação completa](ALTERACOES_V6.md)
- 🐛 Reporte bugs em [Issues](https://github.com/seu-usuario/sena/issues)
- 💬 Dúvidas sobre Mistral AI? Veja [CONFIGURAR_MISTRAL.md](CONFIGURAR_MISTRAL.md)
- ✅ Guia de testes em [TESTE_V6.md](TESTE_V6.md)

---

## 🗺️ Roadmap

### V6.1 (Próximo)
- [ ] Cache de respostas Mistral
- [ ] Mais temas de cores
- [ ] Exportar conversas
- [ ] Histórico de conversas

### V7.0 (Futuro)
- [ ] Backend próprio
- [ ] Banco de dados de conversas
- [ ] Dashboard administrativo
- [ ] Analytics avançado
- [ ] Multi-idioma

---

## 🎉 Agradecimentos

Obrigado por usar a Sena! 

Estamos tornando a tecnologia mais acessível e gentil para todos. 💜

Se este projeto te ajudou, considere:
- ⭐ Dar uma estrela no GitHub
- 📢 Compartilhar com amigos
- 🐛 Reportar bugs
- 💡 Sugerir melhorias

---

<div align="center">
  
  **Sena - V6.0**
  
  *Tecnologia com alma gentil* ✨
  
  Powered by AmplaAI 💜
  
</div>
