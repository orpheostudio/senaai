# 💜✨ Sena - Assistente Digital Kawaii

<div align="center">
  <img src="https://i.imgur.com/Dc3f5ZQ.jpeg" alt="Sena" width="200" height="200" style="border-radius: 50%;">
  
  <h3>Assistente Digital Kawaii e Acessível</h3>
  
  [![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-success)](https://seu-usuario.github.io/sena)
  [![PWA](https://img.shields.io/badge/PWA-Ready-purple)](https://seu-usuario.github.io/sena)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Microsoft Clarity](https://img.shields.io/badge/Analytics-Clarity-orange)](https://clarity.microsoft.com/)
  
</div>

## 🌸 Sobre a Sena

Sena é uma assistente digital kawaii especialmente desenvolvida para tornar a tecnologia mais acessível e amigável para todos, com foco especial em:

- 👵🏻 Pessoas com 60+ anos
- ♿ Pessoas com dificuldades visuais ou motoras
- 🌱 Quem está começando com tecnologia

## ✨ Características

### 🎨 Design Kawaii
- Interface fofa e moderna com paleta de cores pastel (lavanda, coral, pérola)
- Gradientes suaves e animações delicadas
- Avatar personalizado da Sena
- Experiência visual agradável

### ♿ Acessibilidade Completa
- 🔊 Text-to-Speech (TTS) - Leitura de voz
- 🎤 Speech-to-Text (STT) - Comando por voz
- 🔍 Alto contraste
- 📏 Tamanho de fonte ajustável
- ⌨️ Navegação por teclado
- 🎯 Áreas de clique aumentadas
- 🎭 Animações reduzidas (opcional)

### 📱 PWA (Progressive Web App)
- ⚡ Instalável em dispositivos móveis e desktop
- 📴 Funciona offline
- 🔄 Atualização automática
- 🚀 Carregamento rápido
- 💾 Cache inteligente

### 🧠 Funcionalidades
- 📱 Guias de uso de celular
- 💬 Tutoriais de WhatsApp
- 📧 Ajuda com e-mail
- 📸 Como usar a câmera
- 🏦 Banco digital e PIX
- 🛒 Compras online seguras
- ⚙️ Configurações do celular

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sena.git

# Entre na pasta
cd sena

# Instale as dependências
npm install

# Gere os ícones PWA
npm run generate-icons

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🏗️ Build

```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📦 Deploy

### GitHub Pages

1. Configure o GitHub Pages no seu repositório
2. Atualize a `base` no `vite.config.ts`
3. Execute:

```bash
npm run deploy
```

Veja o [Guia Completo de Deploy](DEPLOY_GITHUB_PAGES.md) para mais detalhes.

## 📊 Microsoft Clarity

Para habilitar o Microsoft Clarity:

1. Crie uma conta em [clarity.microsoft.com](https://clarity.microsoft.com/)
2. Crie um novo projeto
3. Copie o Project ID
4. Substitua `YOUR_CLARITY_PROJECT_ID` no `index.html`

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Build**: Vite
- **PWA**: Service Workers + Web Manifest
- **Analytics**: Microsoft Clarity
- **Deploy**: GitHub Pages

## 📱 Estrutura do Projeto

```
sena/
├── components/          # Componentes React
│   ├── WelcomeScreen.tsx
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   ├── AccessibilityPanel.tsx
│   └── ui/             # Componentes UI (shadcn)
├── public/             # Arquivos estáticos
│   ├── manifest.json   # PWA manifest
│   ├── service-worker.js
│   └── icons/          # Ícones PWA
├── styles/
│   └── globals.css     # Estilos globais
├── App.tsx             # Componente principal
├── index.html          # HTML principal
├── vite.config.ts      # Configuração Vite
└── package.json        # Dependências
```

## 🎨 Personalização

### Cores

As cores podem ser ajustadas em `/styles/globals.css`:

```css
:root {
  --primary: #B894E8;     /* Lavanda */
  --secondary: #FFB3C6;   /* Coral/Rosa */
  --background: #FAF8FF;  /* Pérola */
}
```

### Avatar

Substitua a URL da imagem da Sena:
- Em `App.tsx`
- Em `WelcomeScreen.tsx`
- Em `manifest.json`

## 🔒 Privacidade

Sena respeita sua privacidade:
- ✅ Processamento local de dados
- ✅ Sem coleta de PII (Informações Pessoais Identificáveis)
- ✅ Termos de Uso transparentes
- ✅ Política de Privacidade clara

Links:
- [Termos de Uso](https://termos.orpheostudio.com.br)
- [Políticas de Privacidade](https://politicas.orpheostudio.com.br)

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

**Orpheo Studio**
- Website: [orpheostudio.com.br](https://orpheostudio.com.br)
- GitHub: [@orpheostudio](https://github.com/orpheostudio)

## 🙏 Agradecimentos

- Design kawaii inspirado em cultura otaku
- Comunidade de acessibilidade digital
- Todos que tornam a tecnologia mais inclusiva

## 📞 Suporte

Precisa de ajuda? Entre em contato:
- 📧 Email: suporte@orpheostudio.com.br
- 💬 Issues: [GitHub Issues](https://github.com/seu-usuario/sena/issues)

---

<div align="center">
  
  **Feito com 💜 por Orpheo Studio**
  
  ⭐ Se este projeto te ajudou, considere dar uma estrela!
  
</div>
