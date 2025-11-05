# 🚀 Deploy no GitHub Pages - Sena

Este guia mostra como fazer deploy da Sena no GitHub Pages com PWA funcional.

## 📋 Pré-requisitos

- Conta no GitHub
- Repositório criado
- Node.js instalado (para build)

## 🔧 Configuração

### 1. Preparar o Projeto

Certifique-se de que todos os arquivos estão no repositório:

```bash
git add .
git commit -m "Preparar deploy para GitHub Pages"
git push origin main
```

### 2. Configurar GitHub Pages

1. Vá para `Settings` do seu repositório
2. Na seção `Pages`:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (ou `gh-pages`)
   - **Folder**: `/ (root)` ou `/docs`
3. Clique em `Save`

### 3. Atualizar URLs no código

Atualize os seguintes arquivos com a URL do seu GitHub Pages:

#### `index.html`
```html
<!-- Linha 21-22 -->
<meta property="og:url" content="https://SEU-USUARIO.github.io/SEU-REPO/">
<meta property="twitter:url" content="https://SEU-USUARIO.github.io/SEU-REPO/">
```

#### `manifest.json`
```json
{
  "start_url": "/SEU-REPO/",
  "scope": "/SEU-REPO/"
}
```

#### `vite.config.ts` (se estiver usando Vite)
```typescript
export default defineConfig({
  base: '/SEU-REPO/',
  // ...
})
```

### 4. Microsoft Clarity

1. Crie uma conta em [Microsoft Clarity](https://clarity.microsoft.com/)
2. Crie um novo projeto
3. Copie o Project ID
4. Cole no `index.html`:

```html
<!-- Linha 54 -->
})(window, document, "clarity", "script", "SEU_PROJECT_ID_AQUI");
```

### 5. Ícones PWA

Crie os ícones nas seguintes dimensões e coloque em `/public/icons/`:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

**Dica**: Use [https://realfavicongenerator.net/](https://realfavicongenerator.net/) para gerar todos os tamanhos automaticamente a partir da imagem da Sena.

## 🏗️ Build e Deploy

### Opção 1: Deploy Manual

Se estiver usando Vite:

```bash
npm run build
```

Isso gerará uma pasta `dist/`. Faça commit e push dessa pasta:

```bash
git add dist -f
git commit -m "Build para produção"
git push origin main
```

### Opção 2: GitHub Actions (Recomendado)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy Sena to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v3
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: './dist'
          
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

## ✅ Verificação

Após o deploy, verifique:

1. ✨ **Site Online**: `https://SEU-USUARIO.github.io/SEU-REPO/`
2. 💜 **PWA Funcionando**: Abra no Chrome/Edge e verifique se aparece o botão de instalação
3. 📊 **Microsoft Clarity**: Acesse o dashboard do Clarity e verifique se está recebendo dados
4. 🔒 **HTTPS**: Certifique-se de que o site está rodando em HTTPS
5. 📱 **Service Worker**: Abra DevTools > Application > Service Workers

## 🐛 Troubleshooting

### PWA não instala

- Certifique-se de que está usando HTTPS
- Verifique se o `manifest.json` está sendo servido corretamente
- Abra DevTools > Application > Manifest para ver erros

### Service Worker não registra

- Verifique se o caminho do `service-worker.js` está correto
- Abra DevTools > Console para ver erros
- Certifique-se de que está usando HTTPS

### Ícones não aparecem

- Verifique se todos os ícones estão na pasta `/public/icons/`
- Verifique se os caminhos no `manifest.json` estão corretos
- Use caminhos absolutos se necessário

### Microsoft Clarity não funciona

- Verifique se o Project ID está correto
- Aguarde alguns minutos para os dados aparecerem
- Certifique-se de que não há bloqueadores de analytics

## 📱 Testando PWA Localmente

```bash
# Instalar serve globalmente
npm install -g serve

# Build do projeto
npm run build

# Servir com HTTPS (necessário para PWA)
serve -s dist -l 3000 --ssl-cert certificado.pem --ssl-key chave.pem
```

## 🎉 Deploy Concluído!

Sua Sena agora está online e pronta para ajudar pessoas! 💜✨

Para questões ou suporte, visite [Orpheo Studio](https://orpheostudio.com.br)
