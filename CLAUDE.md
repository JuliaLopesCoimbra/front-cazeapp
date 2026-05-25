# CLAUDE.md — Frontend · Casa CazéTV Copa 2026

> Guia autoritativo para o Claude Code CLI no projeto **front-end/front-cazeapp**.
> Leia por completo antes de tocar em qualquer arquivo. Regras são não-negociáveis.
>
> **REGRA DE CONFIANÇA**: Antes de implementar qualquer componente visual, tela ou lógica de produto,
> avalie internamente sua confiança (0–100%). Se estiver abaixo de 85%, PARE e abra uma caixa de
> perguntas ao usuário antes de escrever código. Nunca assuma — pergunte.

---

## Índice

1. [Stack e Dependências](#1-stack-e-dependências)
2. [Design System — Fonte da Verdade](#2-design-system--fonte-da-verdade)
3. [Liquid Glass — Implementação Apple WWDC 2025](#3-liquid-glass--implementação-apple-wwdc-2025)
4. [Sistema de Gradientes](#4-sistema-de-gradientes)
5. [Sistema de Border Radius](#5-sistema-de-border-radius)
6. [Carrossel de Patrocinadores](#6-carrossel-de-patrocinadores)
7. [Anatomia das Telas Confirmadas](#7-anatomia-das-telas-confirmadas)
8. [Arquitetura de Estado](#8-arquitetura-de-estado)
9. [Estrutura de Pastas e Convenções](#9-estrutura-de-pastas-e-convenções)
10. [Padrões de Componentes](#10-padrões-de-componentes)
11. [Padrões de Serviços e API](#11-padrões-de-serviços-e-api)
12. [Performance e Escalabilidade](#12-performance-e-escalabilidade)
13. [Animações — Framer Motion](#13-animações--framer-motion)
14. [Ícones — Regras Absolutas](#14-ícones--regras-absolutas)
15. [Roteamento e Navegação](#15-roteamento-e-navegação)
16. [TypeScript — Regras Estritas](#16-typescript--regras-estritas)
17. [Regras de Qualidade e Tom Visual](#17-regras-de-qualidade-e-tom-visual)
18. [Variáveis de Ambiente](#18-variáveis-de-ambiente)

---

## 0. Protocolo de Confiança (Leia Primeiro)

Antes de implementar qualquer coisa, responda internamente:

| Pergunta | Se a resposta for NÃO → |
|---|---|
| Sei exatamente quais cores usar neste componente? | Perguntar ao usuário |
| Sei o comportamento exato desta interação? | Perguntar ao usuário |
| Tenho o design desta tela no Figma ou descrito aqui? | Perguntar ao usuário |
| Sei qual dado vem da API e qual é local? | Perguntar ao usuário |
| A tela tem estado de loading/empty/error definido? | Perguntar ao usuário |

**Formato obrigatório de pergunta** quando confiança < 85%:
```
Antes de implementar [nome do componente/tela], preciso confirmar:
1. [Pergunta objetiva 1]
2. [Pergunta objetiva 2]
```

---

## 1. Stack e Dependências

### Core
| Lib | Versão | Propósito |
|---|---|---|
| Next.js | 16.x | Framework App Router |
| React | 19.x | UI |
| TypeScript | 5.x strict | Linguagem |

### UI e Estilização
| Lib | Versão | Propósito |
|---|---|---|
| Material UI (MUI) | v7.x | Componentes estruturais |
| Emotion | latest | CSS-in-JS para MUI theme |
| Tailwind CSS | 4.x | Layout, espaçamento, classes utilitárias |

### Estado e Dados
| Lib | Versão | Propósito |
|---|---|---|
| TanStack Query v5 | ^5.x | Estado de servidor — OBRIGATÓRIO para toda chamada de API |
| React Context API | — | Estado global de UI (auth, preferências) |

### Mapa
| Lib | Versão | Propósito |
|---|---|---|
| react-map-gl | ^7.x | Wrapper Mapbox GL JS |
| mapbox-gl | latest | Engine do mapa |

### Animações
| Lib | Versão | Propósito |
|---|---|---|
| Framer Motion | ^11.x | Animações declarativas (pack opening, transições, stagger) |

### Utilitários
| Lib | Versão | Propósito |
|---|---|---|
| Axios | latest | HTTP client (sempre via `/services/`) |
| date-fns | 4.x | Formatação de datas |
| html5-qrcode | 2.x | Scanner QR code |
| jwt-decode | latest | Decode de JWT no cliente |

### Instalação das novas dependências
```bash
cd front-end/front-cazeapp
npm install @tanstack/react-query@5 @tanstack/react-query-devtools framer-motion react-map-gl mapbox-gl
```

---

## 2. Design System — Fonte da Verdade

> Paleta definida e validada pelo usuário durante o desenvolvimento (dark navy theme).
> Estes valores estão em `app/constants/designTokens.ts` e são a única fonte de verdade.
> **NÃO usar os valores antigos do Figma (#282828, #363636) — foram substituídos pela paleta abaixo.**

### Paleta de Cores — Valores Atuais

```css
/* Backgrounds */
--color-bg-base:           #0A1128;   /* Fundo principal de todas as telas (dark navy) */
--color-bg-surface:        #151c2e;   /* Surface de cards, drawers, overlays */
--color-bg-surface-2:      #1A1A2E;   /* Surface secundária */
--color-bg-overlay:        rgba(217, 217, 217, 0.20); /* Overlay de headers de post */
--color-bg-black:          #000000;   /* Fundo de banners de patrocinador */

/* Primária — Verde Brasil */
--color-green:             #008542;   /* Bordas de cards, dividers, acentos */
--color-green-light:       #31E46A;   /* Usado no gradiente arco-íris */

/* Secundária — Amarelo Brasil */
--color-yellow:            #FFD100;   /* Ponto final do gradiente Brasil, destaques, ativo nav */
--color-yellow-alt:        #F7B521;   /* Usado no gradiente arco-íris */

/* Azul Canarinho — broadcast blue, destaque Copa */
--color-blue:              #1B3DE8;   /* Azul canarinho — headlines, banners, tabs Copa */
--color-blue-copa:         #0055B8;   /* Fundo de posts Copa */

/* Accent */
--color-red:               #E8175D;   /* Alertas, badges */
--color-red-rainbow:       #E52554;   /* Início do gradiente arco-íris */
--color-pink:              #FF6FAE;   /* Stickers CTA */

/* Texto */
--color-text-primary:      #FFFFFF;
--color-text-secondary:    rgba(255, 255, 255, 0.72);
--color-text-muted:        rgba(255, 255, 255, 0.45);

/* Bordas */
--color-border-subtle:     rgba(255, 255, 255, 0.08);
--color-border-blue:       rgba(27, 61, 232, 0.25);

/* Gradiente arco-íris (separador decorativo) */
--gradient-rainbow: linear-gradient(
  90deg,
  #E52554  24.519%,
  #F7B521  38.462%,
  #31E46A  58.173%,
  #29BAEB  62.981%,
  #432B9D  76.923%
);
```

### Tokens Tailwind — obrigatórios em `tailwind.config.ts`

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'caze-bg':         '#0A1128',
      'caze-surface':    '#151c2e',
      'caze-surface-2':  '#1A1A2E',
      'caze-green':      '#008542',
      'caze-green-light':'#31E46A',
      'caze-yellow':     '#FFD100',
      'caze-yellow-alt': '#F7B521',
      'caze-blue':       '#1B3DE8',
      'caze-blue-copa':  '#0055B8',
      'caze-red':        '#E8175D',
      'caze-pink':       '#FF6FAE',
      'caze-cyan':       '#29BAEB',
      'caze-purple':     '#432B9D',
      'caze-muted':      'rgba(255,255,255,0.45)',
    },
    fontFamily: {
      headline: ['var(--font-anton)',      'Anton',      'sans-serif'], // Super headlines CAPS
      sports:   ['var(--font-bebas)',      'Bebas Neue', 'sans-serif'], // Placares, timers, AO VIVO
      ui:       ['var(--font-montserrat)', 'Montserrat', 'sans-serif'], // Botões, nav, CTAs
      sans:     ['var(--font-inter)',      'Inter',      'sans-serif'], // Texto geral, feed
      // Aliases
      heading:  ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      display:  ['var(--font-anton)',      'Anton',      'sans-serif'],
    },
    borderRadius: {
      'caze-sm':   '8px',    /* botões pequenos, inputs */
      'caze-md':   '15px',   /* cards, tabs, posts, modais */
      'caze-lg':   '20px',   /* bottom sheet, modais grandes */
      'caze-pill': '100px',  /* chips, badges, pills de status */
    },
    backdropBlur: {
      'glass': '20px',
    },
  },
}
```

### MUI Theme — Configuração obrigatória

```typescript
// lib/theme.ts
import { createTheme } from '@mui/material/styles';

export const cazeTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#008542',          // Verde Brasil — acentos, bordas, dividers
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFD100',          // Amarelo Brasil — destaques, nav ativa, CTAs
      contrastText: '#000000',
    },
    info: {
      main: '#1B3DE8',          // Azul canarinho — tabs Copa, banners
    },
    error: {
      main: '#E8175D',
    },
    background: {
      default: '#0A1128',       // Fundo base dark navy
      paper:   '#151c2e',       // Surface de cards e components elevados
    },
    text: {
      primary:   '#FFFFFF',
      secondary: '#9E9E9E',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), Inter, Arial, sans-serif',
    h1: { fontFamily: 'var(--font-anton), Anton, sans-serif',      fontWeight: 400, fontSize: '28px', lineHeight: 1.1 }, // Anton — super headline
    h2: { fontFamily: 'var(--font-anton), Anton, sans-serif',      fontWeight: 400, fontSize: '22px', lineHeight: 1.2 },
    h3: { fontFamily: 'var(--font-montserrat), Montserrat, sans-serif', fontWeight: 700, fontSize: '18px', lineHeight: 1.4 },
    h4: { fontFamily: 'var(--font-anton), Anton, sans-serif',      fontWeight: 400, fontSize: '32px', lineHeight: 1.0 }, // Posts impactantes
    body1: { fontFamily: 'var(--font-inter), Inter, Arial, sans-serif', fontWeight: 400, fontSize: '16px', lineHeight: 1.6 },
    body2: { fontFamily: 'var(--font-inter), Inter, Arial, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: 1.6 },
    caption: { fontFamily: 'var(--font-inter), Inter, Arial, sans-serif', fontWeight: 500, fontSize: '12px' },
    button: {
      fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
      fontWeight: 700,
      fontSize: '14px',
      textTransform: 'none',
    },
  },
  shape: { borderRadius: 15 }, // Border radius base do Figma
  components: {
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(5,8,14,0.94)',
          height: '60px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.45)',
          '&.Mui-selected': { color: '#FFD100' },
          minWidth: 'unset',
        },
        label: {
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          fontWeight: 700,
          fontSize: '10px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          backgroundColor: '#151c2e',
          borderRadius: '15px',
          color: 'rgba(255,255,255,0.45)',
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          fontWeight: 700,
          fontSize: '12px',
          minHeight: '29px',
          padding: '0 16px',
          '&.Mui-selected': {
            color: '#FFFFFF',
            border: '1px solid #008542',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { display: 'none' }, // A borda do tab é o indicador, não a linha padrão
        root: { gap: '8px', minHeight: 'unset' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#151c2e',
          borderRadius: '15px',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
  },
});
```

### Divisão de responsabilidade MUI vs Tailwind

| Responsabilidade | Use |
|---|---|
| Componentes interativos (Button, TextField, Dialog, Tab, BottomNav, Card) | **MUI + theme** |
| Layout, grid, flexbox, margens, paddings | **Tailwind** |
| Cores custom e tokens do Design System | **Tailwind** (`text-caze-green`, `bg-caze-bg`) |
| Responsividade | **Tailwind** (`md:`, `lg:`) |
| Liquid Glass, gradientes, efeitos visuais | **Tailwind** + classes custom |

**NUNCA** usar `style={{}}` inline para valores estáticos.
**NUNCA** usar `sx={{ margin: '16px' }}` quando Tailwind resolve (`className="m-4"`).

---

## 3. Liquid Glass — Implementação Apple WWDC 2025

### O que é e onde usar

Liquid Glass é o efeito de material translúcido introduzido pela Apple no WWDC 2025. Combina:
- **Blur de fundo** (`backdrop-filter: blur`)
- **Saturação aumentada** (cores do conteúdo por baixo ficam mais vivas)
- **Borda de luz** (borda superior/lateral com branco translúcido simulando reflexo de luz)
- **Sombra interna** (efeito de profundidade)

### Onde APLICAR no app
- Headers de posts do feed (overlay `@casacazetv` + caption)
- Modais e bottom sheets
- Cards de bolão sobrepostos a imagens
- POI popup no mapa
- Overlay de check-in gate
- Badge de pontos flutuante no perfil

### Onde NÃO aplicar
- Telas com fundo `#282828` sólido sem imagem por baixo (o efeito não funciona sem conteúdo para borrar)
- Bottom navigation (usar `#363636` sólido conforme Figma)
- Tabs de filtro do feed (usar `#363636` sólido conforme Figma)

### Classes Tailwind customizadas — adicionar em `globals.css`

```css
/* globals.css */

/* --- Liquid Glass Base --- */
.glass {
  backdrop-filter: blur(20px) saturate(1.8) brightness(1.05);
  -webkit-backdrop-filter: blur(20px) saturate(1.8) brightness(1.05);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15);
}

/* --- Liquid Glass com tint verde (cards de destaque Copa) --- */
.glass-green {
  backdrop-filter: blur(20px) saturate(2) brightness(1.05);
  -webkit-backdrop-filter: blur(20px) saturate(2) brightness(1.05);
  background: rgba(0, 148, 64, 0.12);
  border: 1px solid rgba(0, 148, 64, 0.35);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(0, 148, 64, 0.25),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15);
}

/* --- Liquid Glass escuro (overlays sobre imagens de jogo) --- */
.glass-dark {
  backdrop-filter: blur(16px) saturate(1.5) brightness(0.85);
  -webkit-backdrop-filter: blur(16px) saturate(1.5) brightness(0.85);
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* --- Post caption overlay (extraído do Figma) --- */
.glass-caption {
  backdrop-filter: blur(12px) saturate(1.6);
  -webkit-backdrop-filter: blur(12px) saturate(1.6);
  background: rgba(217, 217, 217, 0.20);
  border: 2px solid #008542;
  border-radius: 15px;
}

/* --- Fallback para browsers sem suporte a backdrop-filter --- */
@supports not (backdrop-filter: blur(1px)) {
  .glass, .glass-green, .glass-dark, .glass-caption {
    background: rgba(10, 17, 40, 0.96);
  }
}
```

### Uso no JSX

```tsx
// Header de post (extraído do Figma)
<div className="glass-caption rounded-t-[15px] px-4 py-2 flex items-center gap-2">
  <Avatar src={avatarUrl} sx={{ width: 28, height: 28 }} />
  <span className="font-heading font-extrabold text-xs text-white">@casacazetv</span>
  <MoreHorizIcon className="ml-auto text-white" sx={{ fontSize: 16 }} />
</div>

// Modal / Bottom sheet
<div className="glass rounded-[20px] p-4">
  {children}
</div>

// Card de bolão sobre imagem de jogo
<div className="glass-green rounded-[15px] p-4">
  {children}
</div>
```

---

## 4. Sistema de Gradientes

### Gradiente 1 — Brasil (divider principal)

Extraído do Figma. Usado como linha divisória entre seções.

```css
/* 4px de altura, full-width */
background: linear-gradient(90deg, #009440 0%, #FFCB00 76.923%);
```

```tsx
// Componente reutilizável
export function BrazilDivider() {
  return <div className="h-[4px] w-full bg-gradient-to-r from-caze-green to-caze-yellow" />;
}
```

### Gradiente 2 — Arco-íris (separador decorativo de posts)

Extraído do Figma. Linha de 2px entre cards do feed.

```css
background: linear-gradient(
  90deg,
  #E52554  24.519%,
  #F7B521  38.462%,
  #31E46A  58.173%,
  #29BAEB  62.981%,
  #432B9D  76.923%
);
```

```tsx
export function RainbowDivider() {
  return (
    <div
      className="h-[2px] w-full"
      style={{
        backgroundImage: 'linear-gradient(90deg, #E52554 24.519%, #F7B521 38.462%, #31E46A 58.173%, #29BAEB 62.981%, #432B9D 76.923%)',
      }}
    />
  );
}
```

### Gradiente 3 — Hero Banner Copa

Apenas em banners hero e backgrounds de telas full-bleed.

```css
background: linear-gradient(135deg, #F5C900 0%, #0055B8 100%);
```

### Gradiente 4 — Overlay de imagem (fanzone)

Overlay escuro sobre fotos de estádio/evento. Cria profundidade e legibilidade do texto.

```css
background: linear-gradient(
  to bottom,
  rgba(0, 0, 0, 0)    0%,
  rgba(0, 0, 0, 0.3)  40%,
  rgba(0, 0, 0, 0.75) 100%
);
```

### Gradiente 5 — Glow verde (elementos ao vivo)

Halo sutil em cards com jogo ao vivo.

```css
box-shadow: 0 0 20px rgba(0, 148, 64, 0.4), 0 0 40px rgba(0, 148, 64, 0.15);
```

### Regras de uso de gradientes

| Gradiente | Onde usar | Onde NUNCA usar |
|---|---|---|
| Brasil (1) | Divisor entre header e feed, entre seções | Como fundo de tela inteira |
| Arco-íris (2) | Entre posts do feed, entre tabs | Como cor de texto |
| Hero Copa (3) | Banner hero da home, splash screens | Cards pequenos |
| Overlay (4) | Sobre qualquer imagem de fundo | Sobre fundo sólido |
| Glow verde (5) | Card de jogo ao vivo, badge live | Elementos estáticos |

---

## 5. Sistema de Border Radius

Todos os valores extraídos do Figma. Usar **sempre** os tokens — nunca valores arbitrários.

| Token | Valor | Onde usar |
|---|---|---|
| `rounded-[8px]` | 8px | Inputs, botões pequenos, tooltips |
| `rounded-[15px]` | 15px | **Padrão** — cards de post, tabs, modais, bottom sheets, cards de bolão, figurinhas |
| `rounded-[20px]` | 20px | Modais grandes, drawers, full-screen overlays |
| `rounded-[100px]` | 100px | Chips de status, badges de raridade, pills de pontos, avatares pequenos |
| `rounded-full` | 50% | Avatares circulares, ícones em círculo |

### Padrão de card (extraído do Figma)

```tsx
// Card de post — padrão exato do Figma
<div className="rounded-t-[15px] rounded-b-[15px] border border-caze-green overflow-hidden">
  {/* Header com Liquid Glass */}
  <div className="glass-caption rounded-t-[15px] px-4 h-[42px] flex items-center gap-2">
    ...
  </div>
  {/* Conteúdo do post */}
  <div className="relative">
    <img className="w-full object-cover" />
    {/* Caption na base */}
    <div className="glass-caption absolute bottom-3 left-3 px-3 py-2 rounded-[15px] w-[247px]">
      ...
    </div>
  </div>
</div>
```

---

## 6. Carrossel de Patrocinadores

### Comportamento: dois pontos de inserção

**Ponto 1 — Banner fixo no topo da Home** (acima das tabs do feed)
- Full-width, altura fixa `98px` (extraído do Figma)
- Auto-play a cada `5000ms`
- Sem pause no hover (mobile-first, sem hover state)
- Dots de paginação embaixo do banner
- Transição: slide horizontal suave (`300ms ease-in-out`)
- Bounded com `BrazilDivider` acima e abaixo

**Ponto 2 — Inserção automática no scroll do feed**
- A cada 5 posts, injetar 1 `SponsorCard`
- `SponsorCard` tem altura similar ao card de post mas layout horizontal
- Label "Patrocinado" (ícone `CampaignOutlined` + texto `caption`) no canto superior direito
- Não é clicável como post — abre link externo em nova aba

### Componente `SponsorCarousel`

```tsx
// components/feed/SponsorCarousel.tsx
interface SponsorBanner {
  id: string;
  image_url: string;
  sponsor_name: string;
  link_url: string;
  link_label?: string; // ex: "Saiba mais"
}

interface SponsorCarouselProps {
  banners: SponsorBanner[];
  autoPlayInterval?: number; // default 5000
}
```

**Estrutura visual do banner (extraído do Figma — Coca-Cola):**
```
┌─────────────────────────────────────┐  ← altura 98px, fundo preto
│  [Texto esquerda]   [Imagem]  [Texto direita]  │
│  "Coca-Cola         [garrafa]  "Zero calorias   │
│   Sem açúcar"                  e Zero açúcar"   │
└─────────────────────────────────────┘
        ●  ○  ○   ← dots de paginação
```

### Componente `SponsorCard` (intercalado no feed)

```tsx
// components/feed/SponsorCard.tsx
// Card horizontal dentro do feed — NÃO confundir com o banner do topo
interface SponsorCardProps {
  banner: SponsorBanner;
}
// Layout: imagem à esquerda (80x80), texto à direita, label "Patrocinado" no topo direito
```

### Lógica de injeção no feed

```tsx
// hooks/useNewsFeed.ts
function injectSponsors(posts: NewsPost[], sponsors: SponsorBanner[]): FeedItem[] {
  const result: FeedItem[] = [];
  let sponsorIndex = 0;
  posts.forEach((post, index) => {
    result.push({ type: 'post', data: post });
    if ((index + 1) % 5 === 0 && sponsors.length > 0) {
      result.push({
        type: 'sponsor',
        data: sponsors[sponsorIndex % sponsors.length],
      });
      sponsorIndex++;
    }
  });
  return result;
}
```

---

## 7. Anatomia das Telas Confirmadas

> Telas com design validado no Figma. Para telas ainda não visualizadas, abrir caixa de perguntas
> antes de implementar.

### 7.1 Home / Feed (`/home`)

**Estrutura vertical (de cima para baixo):**

```
┌─────────────────────────────────────┐
│ TopBar (56px)                        │  bg: #0A1128
│  [Logo Casa CazéTV]  [Mascote]       │  logo: canto esquerdo, mascote: centro
├─────────────────────────────────────┤
│ BrazilDivider (4px)                  │  gradiente verde → amarelo
├─────────────────────────────────────┤
│ SponsorCarousel (98px + 12px dots)   │  banner patrocinador auto-play
├─────────────────────────────────────┤
│ BrazilDivider (4px)                  │
├─────────────────────────────────────┤
│ FeedTabs (29px + 8px padding)        │  bg: #0A1128, pills: #151c2e
│  [Tudo]  [Jogos]  [Bolão]  [Figur.]  │  ativa: border #008542 | tab Copa: bg #1B3DE8
├─────────────────────────────────────┤
│ RainbowDivider (2px)                 │
├─────────────────────────────────────┤
│ Feed de Posts (scroll infinito)      │  gap: 8px entre posts
│  ├── PostCard (@casacazetv)          │  border: 1px #008542, radius: 15px
│  ├── PostCard                        │
│  ├── PostCard                        │
│  ├── PostCard                        │
│  ├── PostCard                        │
│  ├── SponsorCard                     │  a cada 5 posts
│  └── ...                             │
└─────────────────────────────────────┘
│ BottomNav (60px)                     │  bg: rgba(5,8,14,0.94), ativo: pill branca + ícone #FFD100
```

**Regras visuais da `TopBar`:**
- `height: 56px`, `background: #282828`
- Logo Casa CazéTV: círculo 32x30px, canto esquerdo, `margin-left: 22px`
- Mascote centralizado: 89x50px — imagem asset
- Sem título de texto na top bar da home

**Regras visuais das `FeedTabs`:**
- Container: `background: #282828`, `padding: 8px 14px`
- Cada pill: `background: #363636`, `border-radius: 15px`, `height: 29px`, `min-width: 93px`
- Tab ativa: `border: 1px solid #009440`, texto `#FFFFFF`
- Tab inativa: sem borda, texto `rgba(255,255,255,0.45)`
- Tabs: `Tudo`, `Jogos`, `Bolão`, `Figurinhas`
- Scroll horizontal se não couber (sem overflow visible)

**Regras visuais do `PostCard`:**
```
┌─────────────────────────────────────┐
│ [glass-caption] Header              │  h: 42px, radius-top: 15px
│  [Avatar 28px]  @casacazetv  [···]  │  Montserrat 800 12px (font-ui)
├─────────────────────────────────────┤
│ RainbowDivider (2px)                 │
├─────────────────────────────────────┤
│ Imagem do post (496px altura)        │  object-cover, radius-bottom: 15px
│                                      │
│  [Logo Casa CazéTV]  [CazéTV|tm1]   │  logos sobre a imagem, topo
│                                      │
│  TEXTO IMPACTANTE                    │  Anton (font-headline), amarelo #FFCB00
│  (tipografia grande, copa)           │  sobre fundo azul copa #0055B8
│                                      │
│ [glass-caption] Caption             │  absolute bottom-3 left-3
│  [Avatar] Valendo um total de...     │  w: 247px, border: 2px #009440
└─────────────────────────────────────┘
```

**Regras do rodapé do `PostCard` (caption):**
- Posição: `absolute`, `bottom: 12px`, `left: 12px`
- Largura: `247px` fixo (extraído do Figma)
- Altura: `74px`
- Estilo: `glass-caption` (Liquid Glass verde)
- Avatar: 28x27px, círculo
- Texto: Montserrat 800 12px (font-ui), branco, max 2 linhas

### 7.2 BottomNav (todas as telas)

```tsx
const navItems = [
  { label: 'Home',       href: '/home',       icon: 'HomeOutlined',        iconActive: 'Home'        },
  { label: 'Jogos',      href: '/jogos',       icon: 'SportsSoccerOutlined', iconActive: 'SportsSoccer'},
  { label: 'Bolão',      href: '/bolao',       icon: 'EmojiEventsOutlined', iconActive: 'EmojiEvents' },
  { label: 'Figurinhas', href: '/figurinhas',  icon: 'CollectionsOutlined', iconActive: 'Collections' },
  { label: 'Perfil',     href: '/perfil',      icon: 'PersonOutlined',      iconActive: 'Person'      },
];
```

- Ícone inativo: `outlined`, cor `rgba(255,255,255,0.45)`
- Ícone ativo: `filled`, cor `#FFFFFF` (dentro da pill branca ativa)
- Pill ativa: `rgba(255,255,255,0.22)`, border-radius dinâmico
- Badge numérico em `Bolão` quando há apostas abertas (MUI Badge, cor `#E8175D`)
- Badge numérico em `Figurinhas` quando há pacotes não abertos

### 7.3 Telas ainda sem design visualizado no Figma

Para estas telas, **PARAR e perguntar** antes de implementar detalhes visuais:
- `/jogos` e `/jogos/[id]`
- `/bolao` e sub-rotas
- `/figurinhas` e `/figurinhas/trocas`
- `/mapa`
- `/perfil`

**Pergunta padrão** ao iniciar uma dessas telas:
```
Antes de implementar a tela [nome], preciso confirmar:
1. Existe design no Figma para essa tela? Se sim, me envie o link do frame.
2. Quais são os elementos obrigatórios na tela?
3. Tem alguma interação específica que devo implementar?
```

---

## 8. Arquitetura de Estado

### Princípio fundamental

| Tipo de estado | Onde fica |
|---|---|
| Dados do servidor (API) | **TanStack Query v5** |
| Estado de UI local | `useState` / `useReducer` |
| Estado global de UI | React Context (auth, toast) |
| Formulários | `useState` local |

**NUNCA** armazenar resposta de API em `useState`.

### Configuração do QueryClient

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});
```

### Query Keys centralizadas

```typescript
// lib/queryKeys.ts
export const QueryKeys = {
  fixtures:          ['fixtures'] as const,
  fixtureById:       (id: number) => ['fixtures', id] as const,
  liveFixtures:      ['fixtures', 'live'] as const,
  bolaoFixtures:     ['bolao', 'fixtures'] as const,
  bolaoRanking:      ['bolao', 'ranking'] as const,
  bolaoMyPoints:     ['bolao', 'my-points'] as const,
  bolaoPrizes:       ['bolao', 'prizes'] as const,
  bolaoMyPrediction: (fixtureId: number) => ['bolao', 'prediction', fixtureId] as const,
  stickerAlbum:      ['stickers', 'album'] as const,
  stickerPacks:      ['stickers', 'packs'] as const,
  stickerTrades:     ['stickers', 'trades'] as const,
  newsFeed:          (tab: string, page: number) => ['news', tab, page] as const,
  sponsorBanners:    ['sponsors', 'banners'] as const,
  venuePOIs:         (city: 'SP' | 'RJ') => ['venue-map', city] as const,
  myProfile:         ['auth', 'profile'] as const,
} as const;
```

### Polling para dados ao vivo

```typescript
// hooks/useLiveScore.ts — polling só durante jogo ao vivo
export function useLiveScore(fixtureId: number) {
  return useQuery({
    queryKey: QueryKeys.fixtureById(fixtureId),
    queryFn: () => footballService.getFixtureById(fixtureId),
    refetchInterval: (query) => {
      const isLive = ['1H', '2H', 'ET', 'P', 'HT'].includes(query.state.data?.status ?? '');
      return isLive ? 30_000 : false;
    },
    staleTime: 0,
  });
}
```

---

## 9. Estrutura de Pastas e Convenções

```
front-end/front-cazeapp/
├── app/
│   ├── layout.tsx              # ThemeProvider + QueryClientProvider + fontes Google
│   ├── globals.css             # Classes Liquid Glass + tokens CSS + base Tailwind
│   ├── (auth)/                 # Reutilizar sem alteração
│   └── (user)/
│       ├── home/page.tsx
│       ├── jogos/
│       │   ├── page.tsx
│       │   └── [fixtureId]/page.tsx
│       ├── bolao/
│       │   ├── page.tsx
│       │   ├── [fixtureId]/page.tsx
│       │   ├── ranking/page.tsx
│       │   └── premios/page.tsx
│       ├── figurinhas/
│       │   ├── page.tsx
│       │   └── trocas/page.tsx
│       ├── mapa/page.tsx
│       ├── feed/page.tsx       # mesma que home mas sem sponsor no topo
│       ├── foto/page.tsx       # Reutilizar
│       └── perfil/page.tsx
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx          # Logo + mascote, sem texto
│   │   ├── BottomNav.tsx       # 5 tabs, ícones MUI, badges
│   │   └── BrazilDivider.tsx   # Linha 4px gradiente verde-amarelo
│   │   └── RainbowDivider.tsx  # Linha 2px gradiente arco-íris
│   ├── home/
│   │   ├── FeedTabs.tsx        # Pills: Tudo, Jogos, Bolão, Figurinhas
│   │   ├── PostCard.tsx        # Card de post com Liquid Glass
│   │   └── PostFeed.tsx        # Lista infinita com injeção de sponsors
│   ├── feed/
│   │   ├── SponsorCarousel.tsx # Banner auto-play topo
│   │   └── SponsorCard.tsx     # Card intercalado no feed
│   ├── jogos/
│   │   ├── MatchCard.tsx
│   │   ├── LiveScoreBanner.tsx
│   │   └── MatchEvents.tsx
│   ├── bolao/
│   │   ├── PredictionInput.tsx
│   │   ├── PredictionCard.tsx
│   │   ├── RankingTable.tsx
│   │   ├── PointsBreakdown.tsx
│   │   └── PrizeCard.tsx
│   ├── stickers/
│   │   ├── StickerCard.tsx
│   │   ├── AlbumGrid.tsx
│   │   ├── PackOpening.tsx
│   │   ├── TradeOfferCard.tsx
│   │   └── StickerRarityBadge.tsx
│   ├── map/
│   │   ├── VenueMap.tsx
│   │   ├── POIMarker.tsx
│   │   └── POIPopup.tsx
│   └── shared/
│       ├── CazeButton.tsx      # Botão primário padrão
│       ├── CheckInGate.tsx     # Gate de feature presencial
│       ├── LoadingSkeleton.tsx # Skeleton de cards (nunca spinner)
│       ├── EmptyState.tsx      # Estado vazio padronizado
│       ├── LiveBadge.tsx       # Badge "AO VIVO" pulsante
│       └── PointsBadge.tsx     # Pontos do usuário
├── hooks/
│   ├── useBolao.ts
│   ├── useStickers.ts
│   ├── useFixtures.ts
│   ├── useLiveScore.ts
│   ├── useVenueMap.ts
│   ├── useNewsFeed.ts          # inclui lógica de injeção de sponsors
│   └── useAuth.ts
├── services/
│   ├── api.ts                  # Instância Axios configurada
│   ├── bolao.service.ts
│   ├── stickers.service.ts
│   ├── venueMap.service.ts
│   ├── football.service.ts
│   └── news.service.ts
├── types/
│   ├── bolao.ts
│   ├── sticker.ts
│   ├── venueMap.ts
│   ├── fixture.ts
│   ├── feed.ts                 # NewsPost, SponsorBanner, FeedItem
│   └── auth.ts
└── lib/
    ├── theme.ts
    ├── queryClient.ts
    ├── queryKeys.ts
    └── formatters.ts
```

---

## 10. Padrões de Componentes

### Anatomia obrigatória

```tsx
// 1. Imports externos primeiro, internos depois
// 2. Interface [ComponentName]Props
// 3. Export named (não default)
// 4. Loading + error states obrigatórios se consome query

export function PostCard({ post }: PostCardProps) {
  // ...
}
```

### Regras

1. **Máx 150 linhas** — se passar, dividir
2. **Sem lógica de negócio** — componente só renderiza, hook cuida da lógica
3. **Loading obrigatório** — `<LoadingSkeleton />` nunca spinner centralizado
4. **Error obrigatório** — `<EmptyState message="..." onRetry={refetch} />`
5. **`React.memo`** em componentes de lista (PostCard, StickerCard, RankingRow)

### `CazeButton` — único botão primário

```tsx
interface CazeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  startIcon?: React.ReactNode; // Sempre ícone MUI, nunca emoji
  size?: 'sm' | 'md' | 'lg';
}
```

---

## 11. Padrões de Serviços e API

### Regras absolutas

1. Zero chamadas de `axios` fora de `/services/`
2. Todo service retorna tipo explícito — nunca `Promise<any>`
3. Service não trata erro — lança, hook/React Query captura

```typescript
// services/api.ts — instância configurada
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 12. Performance e Escalabilidade

### Lazy loading obrigatório para módulos pesados

```tsx
const VenueMap = dynamic(() => import('@/components/map/VenueMap'), { ssr: false });
const PackOpening = dynamic(() => import('@/components/stickers/PackOpening'));
const SponsorCarousel = dynamic(() => import('@/components/feed/SponsorCarousel'));
```

### Imagens

- `next/image` com `width` e `height` explícitos — sempre
- Domínios S3/CloudFront já configurados em `next.config.ts`
- Figurinhas fora do viewport: `loading="lazy"`
- Nunca `<img>` diretamente

### Listas longas

- Feed: `useInfiniteQuery`
- Ranking: paginação por offset (50/página)
- Álbum: virtual scroll se > 100 figurinhas (`react-window`)

---

## 13. Animações — Framer Motion

### Quando usar Framer Motion vs CSS

| Usar Framer Motion | Usar CSS/Tailwind |
|---|---|
| Pack opening (flip de cartas) | Badge "AO VIVO" pulsante (`animate-pulse`) |
| Entrada de figurinha lendária | Hover states de botões |
| Transições de página | Loading skeletons |
| Stagger de listas (ranking) | Transições de cor |
| Modais e bottom sheets | |

### Badge "AO VIVO" — implementação

```tsx
// Usar CSS puro — nunca Framer Motion para este
export function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-caze-red rounded-[100px] px-2 py-0.5">
      <span className="size-1.5 rounded-full bg-white animate-pulse" />
      <span className="font-sports text-[10px] text-white tracking-wider">AO VIVO</span>
    </div>
  );
}
```

### Pack Opening — variantes

```tsx
const cardVariants = {
  hidden: { rotateY: 180, opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    rotateY: 0, opacity: 1, scale: 1,
    transition: { delay: i * 0.4, duration: 0.6, type: 'spring', bounce: 0.3 },
  }),
};

const legendaryVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [1, 1.3, 1], opacity: 1,
    transition: { duration: 0.9, type: 'spring', bounce: 0.6 },
  },
};
```

### Regras

1. Sem animações em `useEffect` — usar `AnimatePresence` e variantes
2. Respeitar `prefers-reduced-motion` (Framer Motion faz automaticamente)
3. Duração máx: 600ms para ações de usuário, 1000ms para reveals especiais

---

## 14. Ícones — Regras Absolutas

### Biblioteca: Material Icons (MUI) — única fonte de ícones

```tsx
// CORRETO
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

// ERRADO — nunca usar
<span>⚽</span>   // emoji
<span>🏆</span>   // emoji
```

### Convenção de estilo

| Contexto | Estilo | Tamanho |
|---|---|---|
| BottomNav inativo | `Outlined` | `28px` |
| BottomNav ativo | `Filled` | `28px` |
| Dentro de botões | `Filled` ou `Outlined` | `18px` |
| TopBar / Header | `Outlined` | `24px` |
| Cards e listas | `Outlined` | `20px` |
| Badges e chips | `Filled` | `14px` |

### Proibições

- **Zero emojis** em qualquer texto renderizado na UI — sem exceção
- **Zero emojis** em notificações push exibidas no app
- Notificações push podem ter emoji no payload do OneSignal (fora do código), mas o app não exibe emoji diretamente
- Textos de copy da UI: tom Cazé TV mas sem emoji — usar ícone inline quando precisar de elemento visual

---

## 15. Roteamento e Navegação

### Estrutura de rotas

```
/              → redirect → /home
/home          → Home + Feed com sponsor carousel
/jogos         → Lista jogos da Copa
/jogos/[id]    → Detalhe + placar ao vivo
/bolao         → Lista jogos para apostar
/bolao/[id]    → Fazer/ver aposta
/bolao/ranking → Leaderboard
/bolao/premios → Catálogo de prêmios
/figurinhas    → Álbum + abrir pacotes
/figurinhas/trocas → Mercado de trocas
/mapa          → Mapbox venue map
/feed          → Feed editorial completo
/foto          → Photo Finder (reutilizar)
/perfil        → Perfil + pontos + coleção
```

### Proteção de rotas

Todas as rotas em `/(user)/` requerem autenticação. Usar middleware existente — não recriar.

---

## 16. TypeScript — Regras Estritas

- `"strict": true` — nunca desabilitar
- Sem `any` — usar `unknown` com type guard
- Sem `@ts-ignore` sem comentário explicativo
- Todos os tipos de API em `types/` — nunca inline
- `interface` para objetos, `type` para unions
- Generics explícitos em `useQuery<TipoRetorno>`

---

## 17. Regras de Qualidade e Tom Visual

### Filosofia visual — "Fanzone íntimo"

O app deve sempre transmitir:
- **Proximidade** com o torcedor — não é um app corporativo, é a Casa CazéTV
- **Energia** de estádio — tipografia grande, cores vibrantes, movimento
- **Profundidade** — Liquid Glass cria camadas, não telas planas
- **Legibilidade** — texto sempre legível sobre qualquer fundo (usar overlay quando necessário)

### Tom de voz na UI — sem emojis, sempre icons

| Contexto | Texto ERRADO | Texto CORRETO |
|---|---|---|
| Empty state bolão | "Nenhuma aposta encontrada. ⚽" | "Você ainda não apostou. Vai ficar de fora?" + `<SportsSoccer />` |
| Erro genérico | "Algo deu errado! 😅" | "Algo deu errado. Tenta de novo." + `<ErrorOutline />` |
| Sucesso aposta | "Aposta feita! 🤞🇧🇷" | "Aposta registrada. Agora é torcer." + `<CheckCircleOutline />` |
| Pack aberto | "Você ganhou 3 figurinhas! 🎴" | "3 figurinhas novas desbloqueadas" + `<CollectionsOutlined />` |
| Figurinha lendária | "LENDÁRIO! 🔥" | "LENDÁRIO" + animação Framer Motion + glow verde |

### Acessibilidade mínima

- `aria-label` em todo botão sem texto visível
- Imagens decorativas: `alt=""`; conteúdo: `alt` descritivo
- Contraste mínimo 4.5:1 (WCAG AA)
- BottomNav: `role="navigation"` + `aria-label="Navegação principal"`

### Proibições absolutas

- `console.log` em código commitado
- Emojis em qualquer texto da UI
- Chamadas de API diretas em componentes
- Hardcode de URLs — sempre `process.env.NEXT_PUBLIC_API_URL`
- Hardcode de cores fora dos tokens Tailwind e MUI theme
- Valores de border-radius arbitrários — sempre usar os tokens definidos

---

## 18. Variáveis de Ambiente

```bash
# front-end/front-cazeapp/.env.local

# Existente
NEXT_PUBLIC_API_URL=http://localhost:8000

# Novos
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
NEXT_PUBLIC_ENV=development
```

**Regras de env:**
- `NEXT_PUBLIC_` é exposto no browser — nunca colocar secrets
- Sem Supabase keys, JWT secrets ou service keys no frontend

---

*Última atualização: 2026-05-21 | Figma: `VZ2fPhIG5zVt0XUlzaYyFm` | Parte integrante do guia em `../../CLAUDE.md`*
