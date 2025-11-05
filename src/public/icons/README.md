# 🎨 Ícones PWA - Sena

Esta pasta deve conter os ícones da Sena em diferentes tamanhos para PWA.

## 📏 Tamanhos Necessários

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## 🛠️ Como Gerar

### Opção 1: Online (Recomendado)

Use o [Real Favicon Generator](https://realfavicongenerator.net/):

1. Faça upload da imagem da Sena (https://i.imgur.com/Dc3f5ZQ.jpeg)
2. Configure as opções de PWA
3. Baixe o pacote de ícones
4. Extraia todos os ícones para esta pasta

### Opção 2: Manual com ImageMagick

Se você tem o ImageMagick instalado:

```bash
# Baixar imagem original
curl -o sena-original.jpg https://i.imgur.com/Dc3f5ZQ.jpeg

# Gerar todos os tamanhos
convert sena-original.jpg -resize 72x72 icon-72x72.png
convert sena-original.jpg -resize 96x96 icon-96x96.png
convert sena-original.jpg -resize 128x128 icon-128x128.png
convert sena-original.jpg -resize 144x144 icon-144x144.png
convert sena-original.jpg -resize 152x152 icon-152x152.png
convert sena-original.jpg -resize 192x192 icon-192x192.png
convert sena-original.jpg -resize 384x384 icon-384x384.png
convert sena-original.jpg -resize 512x512 icon-512x512.png
```

### Opção 3: Node.js Script

Execute o script `generate-icons.js` na raiz do projeto:

```bash
npm install sharp
node generate-icons.js
```

## ✨ Dicas

- Use imagens quadradas para melhor resultado
- PNG com fundo transparente funciona melhor
- Certifique-se de que os ícones são nítidos em todos os tamanhos
- Teste em diferentes dispositivos

## 🎨 Design

Os ícones devem:
- Ter fundo com gradiente kawaii (lavanda → rosa)
- Incluir a imagem da Sena centralizada
- Bordas arredondadas para iOS
- Cores vibrantes que representam a marca
