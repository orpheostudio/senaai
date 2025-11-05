# 🌐 GitHub Pages - Sofia Chatbot

Este documento explica como usar a versão simplificada do Sofia (Yume) que funciona diretamente no GitHub Pages.

## 📋 Visão Geral

O arquivo `index.html` na raiz deste repositório contém uma versão standalone completa do chatbot Sofia, otimizada para funcionar diretamente no navegador sem necessidade de backend, build ou configurações complexas.

## ✨ Funcionalidades Incluídas

### 🎯 Assistente Digital Completo
- **Sofia**: Assistente especializada em tecnologia para pessoas 60+ e iniciantes
- **Base de conhecimento**: 9 categorias principais (celular, WiFi, WhatsApp, e-mail, etc.)
- **Respostas inteligentes**: Sistema de NLP básico para entender perguntas
- **Ações rápidas**: Botões para tópicos populares

### ♿ Acessibilidade Avançada
- **Speech-to-Text**: Reconhecimento de voz nativo do navegador
- **Text-to-Speech**: Leitura automática das mensagens
- **Navegação por teclado**: Atalhos e foco bem definidos
- **Alto contraste**: Modo especial para pessoas com dificuldades visuais
- **Fontes ajustáveis**: Tamanho de 14px a 24px
- **Botões grandes**: Opção para facilitar cliques
- **Animações reduzidas**: Para pessoas sensíveis a movimento

### 🎨 Interface Moderna
- **Design responsivo**: Funciona em desktop, tablet e mobile
- **Modo escuro/claro**: Alternância suave entre temas
- **Animações suaves**: Transições elegantes (opcional)
- **Layout Claude-style**: Interface inspirada nos melhores chatbots

### 🔧 Recursos Técnicos
- **React 18**: Via CDN, sem build necessário
- **Ícones Lucide**: Biblioteca de ícones moderna
- **CSS Moderno**: Grid, Flexbox, CSS Variables
- **Progressive Enhancement**: Funciona mesmo com JavaScript desabilitado

## 🚀 Como Ativar no GitHub

### Passo 1: Configurar GitHub Pages
1. No seu repositório GitHub, vá em **Settings**
2. No menu lateral, clique em **Pages**
3. Em **Source**, selecione **"Deploy from a branch"**
4. Branch: **main** (ou master)
5. Folder: **/ (root)**
6. Clique em **Save**

### Passo 2: Acessar o Site
Após alguns minutos, o site estará disponível em:
```
https://seu-usuario.github.io/nome-do-repositorio/
```

### Passo 3: Verificar Funcionamento
- ✅ Interface carrega corretamente
- ✅ Mensagens são exibidas
- ✅ Reconhecimento de voz funciona (Chrome/Edge)
- ✅ Síntese de voz funciona
- ✅ Responsividade em mobile

## 🛠️ Personalização

### Modificar Conteúdo
Para alterar as respostas ou adicionar novos tópicos, edite a função `getBotResponse` no arquivo `index.html`:

```javascript
// Encontre esta seção no código:
const knowledge = {
    'novo-topico': `**🆕 Novo Tópico**
    
    Conteúdo do seu novo tópico aqui...`,
    // ... outros tópicos
};
```

### Alterar Aparência
As cores e estilos podem ser modificados nas CSS variables no início do arquivo:

```css
:root {
    --background: #ffffff;
    --foreground: #030212;
    --primary: #3b82f6;
    /* ... outras variáveis */
}
```

### Adicionar Funcionalidades
O código está estruturado em componentes React que podem ser estendidos:
- `ChatMessage`: Componente de mensagem
- `ChatInput`: Campo de entrada com STT
- `AccessibilityPanel`: Painel de configurações
- `QuickActions`: Botões de ação rápida

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ **Chrome 80+** (funcionalidade completa)
- ✅ **Edge 80+** (funcionalidade completa)
- ✅ **Firefox 75+** (sem STT)
- ✅ **Safari 13+** (funcionalidade limitada)
- ✅ **Mobile Safari/Chrome** (responsivo)

### APIs Utilizadas
- **Speech Recognition**: Chrome/Edge apenas
- **Speech Synthesis**: Todos os navegadores modernos
- **Local Storage**: Para configurações de acessibilidade
- **CSS Grid/Flexbox**: Layout responsivo

## 🎯 Casos de Uso

### Para Desenvolvedores
- **Prototipagem rápida**: Teste conceitos sem infraestrutura
- **Demonstrações**: Apresente para clientes/stakeholders
- **Base para projetos**: Use como ponto de partida

### Para Usuários Finais
- **Aprendizado tecnológico**: Guias passo-a-passo
- **Suporte básico**: Respostas rápidas sobre tecnologia
- **Acessibilidade**: Interface adaptável às necessidades

### Para Organizações
- **Treinamento**: Capacite equipes em tecnologia
- **Suporte interno**: FAQ interativo
- **Inclusão digital**: Ferramenta acessível

## 🔐 Privacidade e Segurança

### Dados Locais
- ✅ **Nenhum dado enviado**: Tudo funciona localmente
- ✅ **Sem cookies**: Apenas localStorage para configurações
- ✅ **Sem rastreamento**: Zero analytics ou telemetria
- ✅ **Offline-ready**: Funciona sem internet após carregar

### APIs do Navegador
- **Speech Recognition**: Processado localmente
- **Speech Synthesis**: Processado localmente
- **Sem API externa**: Nenhuma chamada para serviços externos

## 🔄 Atualizações

Para atualizar o chatbot:

1. **Edite o arquivo**: Modifique `index.html` diretamente
2. **Commit & Push**: Envie as alterações para o repositório
3. **Deploy automático**: GitHub Pages atualiza automaticamente
4. **Cache**: Pode levar alguns minutos para refletir

## 🐛 Resolução de Problemas

### Site não carrega
- Verifique se GitHub Pages está ativado
- Confirme que `index.html` está na raiz
- Aguarde até 10 minutos para propagação

### Reconhecimento de voz não funciona
- Use Chrome ou Edge (Firefox/Safari não suportam)
- Permita acesso ao microfone quando solicitado
- Verifique se está em HTTPS (GitHub Pages já é)

### Síntese de voz não funciona
- Verifique volume do sistema
- Teste em outro navegador
- Alguns navegadores bloqueiam áudio automático

### Layout quebrado em mobile
- Teste em modo privado (cache)
- Verifique CSS personalizado
- Reporte issues com screenshots

## 🤝 Contribuições

Para melhorar a versão GitHub Pages:

1. **Fork** o repositório
2. **Edite** `index.html` ou `GITHUB_PAGES.md`
3. **Teste** localmente abrindo o arquivo no navegador
4. **Submit** Pull Request com descrição detalhada

## 📞 Suporte

- **Issues**: Use GitHub Issues para reportar problemas
- **Discussions**: GitHub Discussions para dúvidas
- **Wiki**: Documentação adicional no Wiki do repositório

---

**💡 Dica**: Esta versão GitHub Pages é perfeita para demonstrações, prototipagem e uso básico. Para funcionalidades avançadas (IA real, persistência, analytics), considere a versão completa com backend.