# 🚀 Início Rápido - Sena

Este guia te levará de zero ao deploy em minutos!

## 📦 Passo 1: Clone e Instale

```bash
git clone https://github.com/seu-usuario/sena.git
cd sena
npm install
```

## 🎨 Passo 2: Gere os Ícones PWA

```bash
npm run generate-icons
```

Isso baixará a imagem da Sena e criará todos os ícones necessários automaticamente.

## 🔧 Passo 3: Configure Microsoft Clarity (Opcional)

1. Acesse [clarity.microsoft.com](https://clarity.microsoft.com/)
2. Crie um projeto
3. Copie o Project ID
4. Edite `index.html` na linha 54:

```javascript
})(window, document, "clarity", "script", "SEU_PROJECT_ID_AQUI");
```

## 💻 Passo 4: Execute Localmente

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🌐 Passo 5: Deploy no GitHub Pages

### 5.1 Configure o Repositório

```bash
# Crie um repositório no GitHub
# Depois execute:

git remote add origin https://github.com/SEU-USUARIO/sena.git
git add .
git commit -m "Initial commit - Sena Chatbot"
git push -u origin main
```

### 5.2 Atualize as URLs

**vite.config.ts** (linha 7):
```typescript
base: '/sena/', // Substitua 'sena' pelo nome do seu repositório
```

**package.json** (linha 26):
```json
"homepage": "https://SEU-USUARIO.github.io/sena",
```

**index.html** (linhas 21-22):
```html
<meta property="og:url" content="https://SEU-USUARIO.github.io/sena/">
<meta property="twitter:url" content="https://SEU-USUARIO.github.io/sena/">
```

### 5.3 Habilite GitHub Pages

1. Vá em `Settings` > `Pages` no seu repositório
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` / `/ (root)`
4. Salve

### 5.4 Deploy

```bash
npm run deploy
```

Aguarde alguns minutos e acesse: `https://SEU-USUARIO.github.io/sena/`

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Ícones PWA gerados
- [ ] Microsoft Clarity configurado (opcional)
- [ ] URLs atualizadas
- [ ] GitHub Pages habilitado
- [ ] Deploy executado com sucesso
- [ ] Site acessível online
- [ ] PWA instalável

## 🎉 Pronto!

Sua Sena está no ar! 💜✨

### Próximos Passos

- 📱 Teste a instalação PWA no celular
- 🎨 Personalize as cores em `styles/globals.css`
- 📊 Verifique analytics no Clarity Dashboard
- 🔒 Revise Termos e Políticas

## 🆘 Problemas Comuns

### PWA não instala
- Certifique-se de estar usando HTTPS (GitHub Pages já usa)
- Verifique se todos os ícones foram gerados
- Abra DevTools > Application > Manifest

### Deploy falhou
- Verifique se o nome do repositório está correto em todas as configurações
- Certifique-se de que o branch `gh-pages` existe
- Veja os logs de erro no GitHub Actions

### Service Worker não registra
- Limpe o cache do navegador
- Verifique se está em HTTPS
- Abra DevTools > Application > Service Workers

## 📚 Recursos

- [Documentação Completa](README.md)
- [Guia de Deploy](DEPLOY_GITHUB_PAGES.md)
- [Termos de Uso](https://termos.orpheostudio.com.br)
- [Políticas](https://politicas.orpheostudio.com.br)

---

**Precisa de ajuda?** Abra uma [issue](https://github.com/seu-usuario/sena/issues) 💜
