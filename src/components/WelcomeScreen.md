# 🌸 Tela de Boas-Vindas - Sena

## 📋 Descrição

A tela de boas-vindas é a primeira interação do usuário com a Sena. Ela apresenta a assistente, explica suas funcionalidades e solicita aceite dos termos de uso e políticas de privacidade.

## ✨ Características

### Design
- 💜 Gradiente kawaii de fundo (lavanda → rosa → lavanda)
- 🖼️ Avatar da Sena com borda circular e sombra
- 🎨 Cards com hover effects
- ✅ Checkbox customizado
- 🔒 Botão de aceite com estados visuais

### Conteúdo

1. **Header**
   - Avatar da Sena (https://i.imgur.com/Dc3f5ZQ.jpeg)
   - Título: "Bem-vinda à Sena! ✨"
   - Subtítulo: "Sua assistente digital kawaii e acessível 💜"

2. **O que posso fazer**
   - Lista de funcionalidades principais
   - Ícones kawaii para cada item
   - Cards interativos com hover

3. **Especialidades**
   - Público-alvo destacado
   - Pessoas 60+
   - Pessoas com necessidades especiais
   - Iniciantes em tecnologia

4. **Termos e Políticas**
   - Links para:
     - [Termos de Uso](https://termos.orpheostudio.com.br)
     - [Políticas de Privacidade](https://politicas.orpheostudio.com.br)
   - Checkbox de aceitação obrigatório
   - Nota sobre processamento local

5. **Botão de Aceite**
   - Desabilitado até marcar checkbox
   - Gradiente kawaii quando habilitado
   - Feedback visual de hover

## 🔧 Funcionamento

### localStorage

A tela usa `localStorage` para lembrar se o usuário já aceitou os termos:

```javascript
// Verifica se já aceitou
const showWelcome = !localStorage.getItem('sena-welcome-accepted');

// Salva aceite
localStorage.setItem('sena-welcome-accepted', 'true');
```

### Resetar Tela

Para mostrar novamente a tela (útil para testes):

```javascript
localStorage.removeItem('sena-welcome-accepted');
// Recarregue a página
```

## 🎨 Customização

### Alterar Avatar

Em `WelcomeScreen.tsx` linha 24:

```tsx
<img 
  src="SUA_URL_AQUI" 
  alt="Sena - Assistente Digital"
  className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
/>
```

### Alterar Links

Em `WelcomeScreen.tsx` linhas 78-95:

```tsx
<a
  href="https://SEU-LINK-TERMOS"
  target="_blank"
  rel="noopener noreferrer"
>
  Termos de Uso
</a>
```

### Adicionar/Remover Funcionalidades

Em `WelcomeScreen.tsx` linhas 44-49:

```tsx
<FeatureItem icon="📱" text="Ensinar a usar o celular" />
<FeatureItem icon="💬" text="Ajudar com WhatsApp" />
// Adicione mais aqui...
```

## 🎯 Responsividade

A tela é totalmente responsiva:

- **Desktop**: Modal centralizado com largura máxima
- **Tablet**: Adapta padding e espaçamento
- **Mobile**: Ocupa tela inteira com scroll vertical

## ♿ Acessibilidade

- ✅ Navegação por teclado
- ✅ Labels descritivos
- ✅ Alto contraste
- ✅ Links com `rel="noopener noreferrer"` para segurança
- ✅ Botões com estados disabled claros
- ✅ Scroll suave no conteúdo

## 🔒 Privacidade

A tela deixa claro:
- Processamento local de dados
- Não coleta de PII
- Links transparentes para políticas
- Checkbox obrigatório

## 📱 UX

### Fluxo do Usuário

1. Usuário abre app pela primeira vez
2. Vê tela de boas-vindas
3. Lê sobre funcionalidades
4. Acessa termos e políticas (opcional)
5. Marca checkbox
6. Clica em "Começar a conversar"
7. Tela some e salva no localStorage
8. Nunca mais vê a tela (a menos que limpe localStorage)

### Feedback Visual

- Checkbox marca/desmarca com animação
- Botão muda cor quando habilitado
- Hover effects em todos os elementos interativos
- Transições suaves (300ms)

## 🧪 Testes

### Testar Primeira Visita

```javascript
// Console do navegador
localStorage.removeItem('sena-welcome-accepted');
location.reload();
```

### Testar Aceite

1. Não marque checkbox → botão desabilitado ✓
2. Marque checkbox → botão habilitado ✓
3. Clique no botão → tela desaparece ✓
4. Recarregue página → tela não aparece mais ✓

## 🎨 Cores Personalizadas

Gradientes usados:

```css
/* Header */
background: linear-gradient(135deg, #B894E8 0%, #FFB3C6 100%);

/* Container */
background: linear-gradient(135deg, #FAF8FF 0%, #FFF5F8 50%, #F5F0FF 100%);

/* Botão habilitado */
background: linear-gradient(135deg, #B894E8 0%, #FFB3C6 100%);

/* Botão desabilitado */
background: linear-gradient(135deg, #E8D5F5 0%, #FFE5EC 100%);
```

## 📝 Notas

- A tela só aparece na primeira visita
- Pode ser resetada limpando localStorage
- Links externos abrem em nova aba
- Checkbox é obrigatório para continuar
- Design totalmente kawaii e acessível

---

**Desenvolvido com 💜 por Orpheo Studio**
