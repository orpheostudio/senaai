# ✅ Guia de Teste - Sena V6.0

## 🎯 Objetivo

Verificar se todas as correções críticas foram implementadas corretamente.

## 📋 Checklist Completo

### 1️⃣ Tela de Boas-Vindas

**Acessar:**
1. Abra o navegador em modo anônimo
2. Acesse o app
3. Deve aparecer a tela de boas-vindas automaticamente

**Verificar:**
- [ ] Logo da Sena aparece (https://i.imgur.com/Dc3f5ZQ.jpeg)
- [ ] Título "Sena ✨" está visível
- [ ] Slogan "Tecnologia com alma gentil" está no header
- [ ] Mensagem de boas-vindas completa
- [ ] Card amarelo com disclaimer de erros
- [ ] Texto menciona "pode ocasionalmente cometer erros"
- [ ] Link "Termos de Uso" aponta para termos.orpheostudio.com.br
- [ ] Link "Políticas de Privacidade" aponta para politicas.orpheostudio.com.br
- [ ] Links abrem em nova aba
- [ ] Checkbox de aceite está desmarcado
- [ ] Botão "Começar" está desabilitado
- [ ] Ao marcar checkbox, botão habilita
- [ ] Cor do botão muda ao habilitar
- [ ] Rodapé mostra "Sena - V6.0 Powered by AmplaAI"
- [ ] Ao clicar "Começar", entra no chat

**Resetar teste:**
```javascript
// No console do navegador:
localStorage.removeItem('sena-welcome-accepted');
location.reload();
```

### 2️⃣ Header Principal

**Verificar:**
- [ ] Fundo do header tem cor uniforme com o background (não gradiente)
- [ ] Logo da Sena (circular) está visível
- [ ] Nome "Sena ✨" está ao lado do logo
- [ ] Slogan "Tecnologia com alma gentil" está abaixo do nome
- [ ] APENAS o ícone de menu hambúrguer está visível
- [ ] Não há outros botões no header
- [ ] Header é responsivo (mobile e desktop)

### 3️⃣ Menu Hambúrguer

**Abrir:**
- Clicar no ícone de menu (≡) no canto superior direito

**Verificar:**
- [ ] Painel abre da direita para esquerda
- [ ] Título "Menu 🌸" está visível
- [ ] 4 opções principais:
  - [ ] Ativar/Desativar Voz
  - [ ] Modo Claro/Escuro
  - [ ] Acessibilidade
  - [ ] Nova Conversa
- [ ] Cada opção tem ícone + título + descrição
- [ ] Card de informações de atalhos no final
- [ ] Ao clicar em qualquer opção, menu fecha
- [ ] Funcionalidades executam corretamente

**Testar cada função:**
1. **Voz:** Deve ativar/desativar TTS
2. **Modo:** Deve alternar claro/escuro
3. **Acessibilidade:** Abre painel de acessibilidade
4. **Nova Conversa:** Limpa chat

### 4️⃣ Sistema de Abas

**Verificar:**
- [ ] Há 2 abas visíveis abaixo do header
- [ ] Aba 1: "Conversa" (ícone MessageSquare)
- [ ] Aba 2: "Ajuda Rápida" (ícone Sparkles)
- [ ] Aba "Conversa" está ativa por padrão
- [ ] Ao clicar em aba, conteúdo muda
- [ ] Aba ativa tem visual diferente (borda inferior colorida)
- [ ] Transição suave entre abas

**Aba Conversa:**
- [ ] Mostra chat principal
- [ ] Mensagens da Sena
- [ ] Campo de input
- [ ] Ações rápidas (se primeira mensagem)

**Aba Ajuda Rápida:**
- [ ] Título "Ajuda Rápida 💜"
- [ ] 6 cards informativos:
  - [ ] 📱 Usar o Celular
  - [ ] 💬 WhatsApp
  - [ ] 📧 E-mail
  - [ ] 🏦 PIX e Banco Digital
  - [ ] 🛒 Compras Online
  - [ ] 📸 Fotos e Câmera
- [ ] Cards têm hover effect
- [ ] Card de dica no final

### 5️⃣ Rodapé

**Verificar:**
- [ ] Rodapé fixo na parte inferior
- [ ] Texto exato: "Sena - V6.0 Powered by AmplaAI"
- [ ] Cor de fundo uniforme com background
- [ ] Texto centralizado
- [ ] Borda superior sutil
- [ ] Responsivo (visível em mobile)

### 6️⃣ Chat Funcional

**Testar:**
1. Digite "olá" e envie
   - [ ] Mensagem aparece do lado direito
   - [ ] Sena responde (pode ser fallback se Mistral não configurado)
   
2. Clique em ação rápida (ex: WhatsApp)
   - [ ] Resposta aparece
   - [ ] Formatação está correta
   
3. Teste comando de voz (se disponível)
   - [ ] Ícone de microfone funciona
   - [ ] Reconhece fala
   
4. Teste TTS
   - [ ] Botão "Ouvir" nas mensagens
   - [ ] Voz reproduz texto

### 7️⃣ Mistral AI (se configurado)

**Verificar:**
1. Configure API Key em `/services/mistral-service.ts`
2. Reinicie o servidor
3. Envie mensagem
   - [ ] Resposta é gerada pela Mistral
   - [ ] Resposta é contextual e inteligente
   - [ ] Tom é kawaii e gentil
   - [ ] Usa emojis
   
4. Console não mostra erros de API
5. Resposta demora 2-5 segundos (normal)

**Se não configurado:**
- [ ] Sistema de fallback funciona
- [ ] Respostas locais aparecem
- [ ] Não há erros no console

### 8️⃣ Responsividade

**Desktop (>1024px):**
- [ ] Layout amplo
- [ ] Abas lado a lado
- [ ] Menu hambúrguer funcional

**Tablet (768px-1024px):**
- [ ] Layout adaptado
- [ ] Abas responsivas
- [ ] Leitura confortável

**Mobile (<768px):**
- [ ] Layout vertical
- [ ] Header compacto
- [ ] Abas empilhadas
- [ ] Menu hambúrguer acessível
- [ ] Footer visível
- [ ] Input teclado-friendly

### 9️⃣ Acessibilidade

**Verificar:**
- [ ] Tab navigation funciona
- [ ] Enter em botões ativa ação
- [ ] F1 abre acessibilidade
- [ ] Ctrl+Enter nova conversa
- [ ] Esc fecha painéis
- [ ] Alto contraste disponível
- [ ] Fontes ajustáveis
- [ ] Screen reader friendly

### 🔟 Cores e Tema

**Modo Claro:**
- [ ] Background: #FAF8FF (pérola)
- [ ] Texto: #4A3B5C (roxo escuro)
- [ ] Primária: #B894E8 (lavanda)
- [ ] Secundária: #FFB3C6 (coral)
- [ ] Header/Footer: mesma cor do background

**Modo Escuro:**
- [ ] Background: #1A1625 (roxo muito escuro)
- [ ] Texto: #F5F0FF (quase branco)
- [ ] Cores ajustadas para contraste
- [ ] Header/Footer: mesma cor do background

**Alto Contraste:**
- [ ] Preto e branco
- [ ] Bordas marcadas
- [ ] Legibilidade máxima

## 🐛 Problemas Comuns

### Tela de boas-vindas não aparece
**Solução:**
```javascript
localStorage.removeItem('sena-welcome-accepted');
location.reload();
```

### Mistral AI não responde
**Verificar:**
1. API Key está configurada?
2. Tem créditos na conta Mistral?
3. Internet está funcionando?
4. Console mostra erros?

**Solução temporária:** Sistema de fallback deve funcionar

### Menu hambúrguer não abre
**Verificar:**
1. Componente Sheet está importado?
2. Estado `open` está funcionando?
3. Erro no console?

### Abas não alternam
**Verificar:**
1. Componente Tabs do shadcn está correto?
2. `defaultValue` está definido?
3. CSS está carregado?

### Rodapé não aparece
**Verificar:**
1. Tag `<footer>` existe no App.tsx?
2. CSS não está escondendo?
3. Posição não está fixed incorretamente?

## 📊 Relatório de Teste

Após completar todos os testes, preencha:

```
Data: ___________
Testador: ___________

✅ Tela de Boas-Vindas: [ ] OK [ ] Falhou
✅ Header: [ ] OK [ ] Falhou
✅ Menu Hambúrguer: [ ] OK [ ] Falhou
✅ Abas: [ ] OK [ ] Falhou
✅ Rodapé: [ ] OK [ ] Falhou
✅ Chat: [ ] OK [ ] Falhou
✅ Mistral AI: [ ] OK [ ] Falhou [ ] Não configurado
✅ Responsividade: [ ] OK [ ] Falhou
✅ Acessibilidade: [ ] OK [ ] Falhou
✅ Temas: [ ] OK [ ] Falhou

Problemas encontrados:
_________________________________
_________________________________
_________________________________

Observações:
_________________________________
_________________________________
_________________________________
```

## ✅ Critérios de Aprovação

Para aprovar a V6.0, TODOS devem estar OK:

- ✅ Tela de boas-vindas completa com disclaimer
- ✅ Header limpo com menu hambúrguer
- ✅ Rodapé com "V6.0 Powered by AmplaAI"
- ✅ Sistema de abas funcional
- ✅ Chat responde (Mistral ou fallback)
- ✅ Cores uniformes em header/footer
- ✅ Links de termos e políticas corretos
- ✅ Responsivo em todos dispositivos
- ✅ Zero erros críticos no console

## 🎉 Testes Aprovados?

Parabéns! A Sena V6.0 está pronta para uso! 🚀💜

Próximos passos:
1. Configure Mistral AI (se ainda não fez)
2. Faça deploy
3. Monitore uso
4. Colete feedback

---

**Desenvolvido com 💜 por Orpheo Studio**
