// Script para gerar ícones PWA automaticamente
// Uso: npm install sharp && node generate-icons.js

const sharp = require('sharp');
const https = require('https');
const fs = require('fs');
const path = require('path');

const ICON_URL = 'https://i.imgur.com/Dc3f5ZQ.jpeg';
const OUTPUT_DIR = path.join(__dirname, 'public', 'icons');
const TEMP_FILE = path.join(__dirname, 'temp-icon.jpg');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Criar diretório se não existir
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎨 Gerando ícones PWA para Sena...\n');

// Baixar imagem
const file = fs.createWriteStream(TEMP_FILE);
https.get(ICON_URL, (response) => {
  response.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log('✅ Imagem baixada com sucesso!\n');
    
    // Gerar todos os tamanhos
    generateIcons();
  });
}).on('error', (err) => {
  fs.unlink(TEMP_FILE);
  console.error('❌ Erro ao baixar imagem:', err.message);
});

async function generateIcons() {
  try {
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      
      await sharp(TEMP_FILE)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png({
          quality: 90,
          compressionLevel: 9
        })
        .toFile(outputPath);
      
      console.log(`✨ Gerado: icon-${size}x${size}.png`);
    }
    
    // Limpar arquivo temporário
    fs.unlinkSync(TEMP_FILE);
    
    console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
    console.log(`📁 Localização: ${OUTPUT_DIR}\n`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    
    // Limpar arquivo temporário em caso de erro
    if (fs.existsSync(TEMP_FILE)) {
      fs.unlinkSync(TEMP_FILE);
    }
  }
}
