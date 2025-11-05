# 📊 Microsoft Clarity - Guia de Configuração

## O que é Microsoft Clarity?

Microsoft Clarity é uma ferramenta gratuita de analytics que oferece:

- 📹 **Session Recordings**: Gravações das sessões dos usuários
- 🗺️ **Heatmaps**: Mapas de calor mostrando onde os usuários clicam
- 📊 **Insights**: Análises de comportamento
- 🆓 **Gratuito**: Sem limites de uso
- 🔒 **Privacidade**: Compatível com LGPD/GDPR

## 🚀 Configuração Rápida

### Passo 1: Criar Conta

1. Acesse [clarity.microsoft.com](https://clarity.microsoft.com/)
2. Clique em "Sign up free"
3. Entre com conta Microsoft (ou crie uma)

### Passo 2: Criar Projeto

1. Clique em "Add new project"
2. Preencha:
   - **Name**: Sena Chatbot
   - **Website URL**: https://seu-usuario.github.io/sena
   - **Site category**: Education ou Technology
3. Clique em "Add new project"

### Passo 3: Obter Project ID

1. Após criar o projeto, você verá o código de instalação
2. Localize o **Project ID** (algo como `abc123def456`)
3. Copie esse ID

### Passo 4: Instalar no Projeto

Edite o arquivo `index.html` na linha 54:

**Antes:**
```javascript
})(window, document, "clarity", "script", "YOUR_CLARITY_PROJECT_ID");
```

**Depois:**
```javascript
})(window, document, "clarity", "script", "abc123def456");
```

### Passo 5: Deploy

```bash
npm run build
npm run deploy
```

### Passo 6: Verificar

1. Acesse seu site: https://seu-usuario.github.io/sena
2. Navegue por algumas páginas
3. Volte ao dashboard do Clarity
4. Aguarde alguns minutos
5. Verifique se apareceram dados em "Dashboard"

## 📊 Recursos Principais

### 1. Dashboard

Visão geral com métricas:
- Sessions
- Pages per session
- Rage clicks
- Dead clicks
- Excessive scrolling

### 2. Recordings

Veja gravações das sessões:
- Reproduza interações dos usuários
- Identifique problemas de UX
- Veja onde os usuários têm dificuldades

### 3. Heatmaps

Mapas visuais mostrando:
- **Click**: Onde os usuários clicam
- **Scroll**: Até onde os usuários rolam
- **Area**: Áreas mais vistas

### 4. Insights

Análises automáticas:
- Rage clicks (cliques frustrados)
- Dead clicks (cliques sem resposta)
- Quick backs (voltas rápidas)
- JavaScript errors

## 🎯 Métricas Importantes para Sena

### Acessibilidade

- **Rage clicks**: Indicam frustração
  - Podem indicar problemas de acessibilidade
  - Botões difíceis de clicar
  - Áreas clicáveis muito pequenas

- **Dead clicks**: Cliques que não fazem nada
  - Elementos que parecem clicáveis mas não são
  - Problemas de UX

### Usabilidade

- **Session duration**: Tempo de sessão
  - Usuários engajados = sessões longas
  - Problemas = sessões curtas

- **Pages per session**: Páginas visitadas
  - Exploração do app
  - Navegação intuitiva

### Conversão

- **Scroll depth**: Até onde rolam
  - Usuários leem conteúdo completo?
  - Mensagens da Sena são lidas?

- **Click patterns**: Padrões de clique
  - Quais features são mais usadas?
  - Quais botões de acessibilidade?

## 🔧 Configurações Avançadas

### Filtros

Filtre dados por:
- Device (Desktop, Mobile, Tablet)
- Country
- Browser
- OS
- Session duration
- Pages visited

### Segmentos Customizados

Crie segmentos para:
- Usuários mobile vs desktop
- Primeira visita vs retorno
- Sessions longas vs curtas
- Com vs sem erros JavaScript

### Alertas

Configure alertas para:
- Aumento de rage clicks
- JavaScript errors
- Quedas de engagement

## 🔒 Privacidade e LGPD

### Clarity e Privacidade

- ✅ Não coleta PII automaticamente
- ✅ Respeita Do Not Track
- ✅ Compatível com LGPD/GDPR
- ✅ IP anonymization disponível

### Configurar Privacidade

No dashboard do Clarity:

1. Settings > Privacy
2. Ative:
   - **Mask user input**: Oculta dados sensíveis
   - **IP anonymization**: Anonimiza IPs
   - **Respect DNT**: Respeita Do Not Track

### Política de Privacidade

Adicione na sua política:

```
Utilizamos Microsoft Clarity para entender como os usuários 
interagem com nosso site. O Clarity coleta dados de uso anônimos 
incluindo movimentos do mouse, cliques e scroll. 

Os dados são processados de forma agregada e não identificam 
usuários individuais. Para mais informações, veja a 
Política de Privacidade da Microsoft.
```

## 📈 Melhores Práticas

### Para Sena

1. **Monitore Acessibilidade**
   - Rage clicks em botões de acessibilidade
   - Uso de TTS/STT
   - Navegação por teclado

2. **Analise Engajamento**
   - Quais tutoriais são mais acessados?
   - Usuários completam conversas?
   - Quick Actions mais usadas?

3. **Identifique Problemas**
   - Erros JavaScript
   - Páginas com alta taxa de saída
   - Elementos que confundem usuários

4. **Otimize Mobile**
   - Heatmaps mobile específicos
   - Touch vs click patterns
   - Scroll behavior

## 🎨 Dashboard Personalizado

### Widgets Recomendados

1. **Session Recordings**
   - Últimas 10 sessões
   - Sessões com erros
   - Sessões longas (engajamento)

2. **Heatmaps**
   - Click heatmap da página inicial
   - Scroll depth do chat
   - Mobile vs Desktop

3. **Insights**
   - Rage clicks (últimos 7 dias)
   - JavaScript errors (últimas 24h)
   - Dead clicks (últimos 30 dias)

## 🆘 Troubleshooting

### Clarity não está coletando dados

1. ✅ Verifique se o Project ID está correto
2. ✅ Abra DevTools > Network e procure por "clarity"
3. ✅ Certifique-se que não há bloqueadores
4. ✅ Aguarde 10-15 minutos para dados aparecerem

### Recordings não aparecem

1. ✅ Verifique configurações de privacidade
2. ✅ Certifique-se que o site está em HTTPS
3. ✅ Teste em navegador privado

### Heatmaps vazios

1. ✅ Precisa de pelo menos 100 pageviews
2. ✅ Aguarde mais dados
3. ✅ Verifique filtros aplicados

## 📚 Recursos

- [Documentação Oficial](https://docs.microsoft.com/en-us/clarity/)
- [Vídeos Tutoriais](https://www.youtube.com/c/MicrosoftClarity)
- [Blog](https://clarity.microsoft.com/blog/)
- [Suporte](https://clarity.microsoft.com/support/)

## 🎯 Metas para Sena

### Curto Prazo (30 dias)

- [ ] 100+ sessões registradas
- [ ] Taxa de rage clicks < 2%
- [ ] 0 JavaScript errors
- [ ] Session duration > 3 minutos

### Médio Prazo (90 dias)

- [ ] 1000+ sessões
- [ ] Identificar top 3 features
- [ ] Otimizar mobile UX
- [ ] Reduzir dead clicks em 50%

### Longo Prazo (1 ano)

- [ ] 10.000+ sessões
- [ ] NPS tracking
- [ ] A/B testing com Clarity
- [ ] Documentação de melhores práticas

---

**💡 Dica**: Revise os insights do Clarity semanalmente para melhorar continuamente a experiência dos usuários da Sena! 💜✨

**Desenvolvido com 💜 por Orpheo Studio**
