# CLAUDE.md — Frontend · Casa CazéTV Copa 2026

> Guia autoritativo para o Claude Code CLI no projeto **front-end/front-cazeapp**.
> Leia por completo antes de tocar em qualquer arquivo. Regras são não-negociáveis.

---

## Índice

1. [Stack e Dependências](#1-stack-e-dependências)
2. [Design System — Regras de Implementação](#2-design-system--regras-de-implementação)
3. [Arquitetura de Estado](#3-arquitetura-de-estado)
4. [Estrutura de Pastas e Convenções de Arquivo](#4-estrutura-de-pastas-e-convenções-de-arquivo)
5. [Padrões de Componentes](#5-padrões-de-componentes)
6. [Padrões de Serviços e API](#6-padrões-de-serviços-e-api)
7. [Performance e Escalabilidade](#7-performance-e-escalabilidade)
8. [Animações](#8-animações)
9. [Roteamento e Navegação](#9-roteamento-e-navegação)
10. [TypeScript — Regras Estritas](#10-typescript--regras-estritas)
11. [Regras de Qualidade](#11-regras-de-qualidade)
12. [Variáveis de Ambiente](#12-variáveis-de-ambiente)

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
| Material UI (MUI) | v7.x | Componentes (inputs, modais, botões, tabelas) |
| Emotion | latest | CSS-in-JS para MUI theme |
| Tailwind CSS | 4.x | Layout, espaçamento, cores custom, responsividade |

### Estado e Dados
| Lib | Versão | Propósito |
|---|---|---|
| **TanStack Query v5** | ^5.x | **Estado de servidor — OBRIGATÓRIO para toda chamada de API** |
| React Context API | — | Estado de UI local e global (auth, tema) |

### Mapa e Geolocalização
| Lib | Versão | Propósito |
|---|---|---|
| react-map-gl | ^7.x | Wrapper React para Mapbox GL JS |
| mapbox-gl | latest | Engine do mapa |

### Animações
| Lib | Versão | Propósito |
|---|---|---|
| **Framer Motion** | ^11.x | Animações declarativas (pack opening, transições de página, stagger) |

### Utilitários
| Lib | Versão | Propósito |
|---|---|---|
| Axios | latest | HTTP client (sempre via `/services/`) |
| date-fns | 4.x | Formatação de datas |
| html5-qrcode | 2.x | Scanner de QR code |
| jwt-decode | latest | Decode de tokens JWT no cliente |

### Instalação das novas dependências

```bash
cd front-end/front-cazeapp
npm install @tanstack/react-query@5 @tanstack/react-query-devtools framer-motion react-map-gl mapbox-gl
```

---

## 2. Design System — Regras de Implementação

### Divisão de responsabilidade MUI vs Tailwind

**REGRA ABSOLUTA:**
- **MUI** → componentes interativos: `Button`, `TextField`, `Dialog`, `Drawer`, `Snackbar`, `Table`, `Card`, `Chip`, `Avatar`, `Skeleton`
- **Tailwind** → layout, espaçamento, grid, cores Cazé TV custom, responsividade, posicionamento

**NUNCA MISTURAR:** Não usar `sx={{ margin: '16px' }}` quando Tailwind resolve (`className="m-4"`). Não usar `className="bg-yellow-400"` quando MUI theme já tem a cor.

```tsx
// CORRETO
<Button variant="contained" className="w-full mt-4">
  Apostar agora
</Button>

// ERRADO — duplicando responsabilidades
<Button sx={{ width: '100%', marginTop: '16px' }}>
  Apostar agora
</Button>
```

### MUI Theme — Configuração obrigatória

Criar e importar o tema centralizado em `lib/theme.ts`. **Todo** componente MUI deve herdar as cores Cazé TV via theme — nunca sobreescrever cor em component level.

```typescript
// lib/theme.ts
import { createTheme } from '@mui/material/styles';

export const cazeTheme = createTheme({
  palette: {
    primary: {
      main: '#F5C900',        // Amarelo Cazé
      dark: '#D4A800',
      contrastText: '#000000',
    },
    secondary: {
      main: '#0055B8',        // Azul Royal
      dark: '#003E8A',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E63946',        // Vermelho Tomate
    },
    background: {
      default: '#000000',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9E9E9E',
    },
  },
  typography: {
    fontFamily: '"Roboto", Arial, sans-serif',
    h1: { fontFamily: '"Montserrat", Arial, sans-serif', fontWeight: 900 },
    h2: { fontFamily: '"Montserrat", Arial, sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Poppins", Arial, sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Montserrat", Arial, sans-serif', fontWeight: 700, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#F5C900',
          color: '#000000',
          '&:hover': { backgroundColor: '#D4A800' },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: { backgroundColor: '#000000', height: '60px' },
      },
    },
  },
});
```

### Tokens Tailwind — obrigatórios em `tailwind.config.ts`

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'caze-yellow':  '#F5C900',
      'caze-yellow-dark': '#D4A800',
      'caze-blue':    '#0055B8',
      'caze-blue-dark': '#003E8A',
      'caze-red':     '#E63946',
      'caze-black':   '#000000',
      'caze-surface': '#1A1A1A',  // fundo de cards em tema escuro
      'caze-muted':   '#9E9E9E',  // texto desabilitado
    },
    fontFamily: {
      heading: ['Montserrat', 'Arial', 'sans-serif'],
      sub:     ['Poppins', 'Arial', 'sans-serif'],
      body:    ['Roboto', 'Arial', 'sans-serif'],
    },
    animation: {
      'live-pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
  },
}
```

### Regras de cores por contexto

| Contexto | Classe Tailwind |
|---|---|
| Botão primário | `bg-caze-yellow text-caze-black hover:bg-caze-yellow-dark` |
| Badge "AO VIVO" | `bg-caze-red text-white animate-live-pulse` |
| Nav item ativo | `text-caze-yellow` |
| Nav item inativo | `text-caze-muted` |
| Card/surface | `bg-caze-surface` ou `bg-white` (modo claro) |
| Score destaque bolão | `text-caze-yellow font-heading font-bold` |

### Tipografia — regras de uso

```tsx
// Título de seção
<Typography variant="h2" className="font-heading">Bolão da Copa</Typography>

// Subtítulo / label
<Typography variant="h3" className="font-sub">Próximos Jogos</Typography>

// Corpo de texto
<Typography variant="body1" className="font-body">...</Typography>

// Badge/chip pequeno
<Typography variant="caption" className="font-body font-medium">...</Typography>
```

---

## 3. Arquitetura de Estado

### Princípio fundamental

| Tipo de estado | Onde fica | Por quê |
|---|---|---|
| Dados do servidor (API) | **TanStack Query** | Cache, revalidation, deduplicação, retry automático |
| Estado de UI local | `useState` / `useReducer` | Simples, scoped no componente |
| Estado global de UI | React Context | Auth, toast/snackbar, preferências do usuário |
| Formulários | `useState` local | Sem lib extra — manter simples |

**NUNCA** armazenar resposta de API em `useState` — isso é exatamente o que React Query resolve.

### Configuração do QueryClient — obrigatória

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s — dados ficam frescos por 30s
      gcTime: 5 * 60_000,       // 5min — cache persiste 5min sem uso
      retry: 2,                 // 2 retries automáticos em falha
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000), // exponential backoff
      refetchOnWindowFocus: false, // não revalidar no foco (evita requests desnecessários)
    },
    mutations: {
      retry: 0, // mutations não fazem retry automático
    },
  },
});
```

Envolver o app com `<QueryClientProvider client={queryClient}>` no `layout.tsx` raiz.

### Query Keys — convenção obrigatória

Todas as query keys definidas em `lib/queryKeys.ts`. Nunca escrever string inline.

```typescript
// lib/queryKeys.ts
export const QueryKeys = {
  // Jogos
  fixtures:         ['fixtures'] as const,
  fixtureById:      (id: number) => ['fixtures', id] as const,
  liveFixtures:     ['fixtures', 'live'] as const,

  // Bolão
  bolaoFixtures:    ['bolao', 'fixtures'] as const,
  bolaoRanking:     ['bolao', 'ranking'] as const,
  bolaoMyPoints:    ['bolao', 'my-points'] as const,
  bolaoPrizes:      ['bolao', 'prizes'] as const,
  bolaoMyPrediction: (fixtureId: number) => ['bolao', 'prediction', fixtureId] as const,

  // Figurinhas
  stickerAlbum:     ['stickers', 'album'] as const,
  stickerPacks:     ['stickers', 'packs'] as const,
  stickerTrades:    ['stickers', 'trades'] as const,

  // Feed
  newsFeed:         (page: number) => ['news', page] as const,

  // Mapa
  venuePOIs:        (city: 'SP' | 'RJ') => ['venue-map', city] as const,

  // Perfil
  myProfile:        ['auth', 'profile'] as const,
} as const;
```

### Hooks por módulo — padrão

Cada módulo tem seu próprio hook file em `hooks/`. O componente nunca chama `useQuery` diretamente — sempre usa o hook do módulo.

```typescript
// hooks/useBolao.ts — exemplo de padrão
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/lib/queryKeys';
import * as bolaoService from '@/services/bolao.service';

export function useBolaoRanking() {
  return useQuery({
    queryKey: QueryKeys.bolaoRanking,
    queryFn: bolaoService.getRanking,
    staleTime: 60_000, // ranking atualiza a cada 1min
  });
}

export function useCreatePrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bolaoService.createPrediction,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: QueryKeys.bolaoMyPrediction(variables.fixture_id) });
      qc.invalidateQueries({ queryKey: QueryKeys.bolaoMyPoints });
    },
  });
}
```

### Polling para dados ao vivo

Placar ao vivo usa polling a cada 30s. **Nunca** usar `setInterval` nos componentes.

```typescript
// hooks/useLiveScore.ts
export function useLiveScore(fixtureId: number) {
  return useQuery({
    queryKey: QueryKeys.fixtureById(fixtureId),
    queryFn: () => footballService.getFixtureById(fixtureId),
    refetchInterval: (query) => {
      // Só pollar se o jogo estiver ao vivo
      const isLive = ['1H', '2H', 'ET', 'P', 'HT'].includes(query.state.data?.status ?? '');
      return isLive ? 30_000 : false;
    },
    staleTime: 0, // dados ao vivo nunca ficam em stale
  });
}
```

---

## 4. Estrutura de Pastas e Convenções de Arquivo

```
front-end/front-cazeapp/
├── app/
│   ├── layout.tsx                 # ThemeProvider + QueryClientProvider + fontes
│   ├── (auth)/                    # Reutilizar sem alteração
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
│       ├── feed/page.tsx
│       ├── foto/page.tsx          # Reutilizar
│       └── perfil/page.tsx
├── components/
│   ├── layout/                    # BottomNav, TopBar, LiveBadge
│   ├── home/                      # HeroMatchBanner, FeatureCards
│   ├── jogos/                     # MatchCard, LiveScoreBanner, MatchEvents
│   ├── bolao/                     # PredictionInput, PredictionCard, RankingTable, PrizeCard, PointsBadge
│   ├── stickers/                  # StickerCard, AlbumGrid, PackOpening, TradeOfferCard, StickerRarityBadge
│   ├── map/                       # VenueMap, POIMarker, POIPopup
│   ├── feed/                      # NewsCard, SponsorBanner
│   └── shared/                    # CazeButton, CheckInGate, LoadingSkeleton, EmptyState
├── hooks/
│   ├── useBolao.ts
│   ├── useStickers.ts
│   ├── useFixtures.ts
│   ├── useLiveScore.ts
│   ├── useVenueMap.ts
│   ├── useNewsFeed.ts
│   └── useAuth.ts                 # Reutilizar
├── services/
│   ├── bolao.service.ts
│   ├── stickers.service.ts
│   ├── venueMap.service.ts
│   ├── football.service.ts        # Atualizar para 2026
│   └── news.service.ts
├── types/
│   ├── bolao.ts
│   ├── sticker.ts
│   ├── venueMap.ts
│   ├── fixture.ts
│   └── auth.ts                    # Reutilizar
├── lib/
│   ├── theme.ts                   # MUI theme Cazé TV
│   ├── queryClient.ts             # TanStack Query config
│   ├── queryKeys.ts               # Todas as query keys
│   └── formatters.ts              # formatDate, formatScore, formatPoints
└── public/
    └── assets/
        ├── cazetv-logo-white.svg
        ├── cazetv-logo-color.svg
        └── stickers/              # Imagens base das figurinhas
```

### Convenções de nomeação de arquivo

| Item | Convenção | Exemplo |
|---|---|---|
| Componente | `PascalCase.tsx` | `PredictionInput.tsx` |
| Hook | `camelCase` com prefixo `use` | `useBolao.ts` |
| Service | `camelCase.service.ts` | `bolao.service.ts` |
| Types | `camelCase.ts` | `bolao.ts` |
| Lib/util | `camelCase.ts` | `formatters.ts` |
| Page (App Router) | `page.tsx` | `page.tsx` |

---

## 5. Padrões de Componentes

### Anatomia obrigatória de um componente

```tsx
// components/bolao/PredictionInput.tsx

// 1. Imports — externos primeiro, internos depois
import { useState } from 'react';
import { motion } from 'framer-motion';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCreatePrediction } from '@/hooks/useBolao';
import type { Fixture } from '@/types/fixture';

// 2. Interface de props — sempre [ComponentName]Props
interface PredictionInputProps {
  fixture: Fixture;
  existingPrediction?: { homeScore: number; awayScore: number } | null;
  disabled?: boolean;
}

// 3. Componente — export named, não default quando possível
export function PredictionInput({ fixture, existingPrediction, disabled = false }: PredictionInputProps) {
  const [homeScore, setHomeScore] = useState(existingPrediction?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(existingPrediction?.awayScore ?? 0);
  const { mutate: createPrediction, isPending } = useCreatePrediction();

  // lógica aqui...

  return (
    // JSX aqui
  );
}
```

### Regras de componentes

1. **Máx 150 linhas** — se passar, dividir em sub-componentes
2. **Um único propósito** — `PredictionInput` só gerencia o input, não submete nem exibe resultados
3. **Props explícitas** — nunca `{...props}` spread em componentes custom
4. **Sem lógica de negócio nos componentes** — lógica vai no hook, componente só renderiza
5. **Loading e error states obrigatórios** — todo componente que consome query mostra skeleton e erro

```tsx
// OBRIGATÓRIO em todo componente que usa useQuery
const { data, isLoading, isError } = useBolaoRanking();

if (isLoading) return <RankingTableSkeleton />;
if (isError) return <EmptyState message="Não foi possível carregar o ranking 😅" onRetry={refetch} />;
```

### Componentes compartilhados obrigatórios

**`CazeButton`** — Único botão primário do app. Nunca usar `<Button variant="contained">` diretamente nos módulos novos.

```tsx
// components/shared/CazeButton.tsx
interface CazeButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}
```

**`EmptyState`** — Toda lista vazia usa este componente com tom de voz Cazé TV.

**`LoadingSkeleton`** — Todo estado de carregamento usa skeleton, nunca spinner centralizado.

**`CheckInGate`** — Wrapper para features de visitantes presenciais.

---

## 6. Padrões de Serviços e API

### Service layer — regras absolutas

1. **Zero chamadas de `axios` fora de `/services/`** — componentes e hooks importam de services
2. **Todo service retorna tipo explícito** — nunca `Promise<any>`
3. **Service não faz tratamento de erro** — lança o erro, o hook/React Query trata

```typescript
// services/bolao.service.ts
import api from './api'; // instância Axios configurada
import type { BolaoRankingEntry, CreatePredictionPayload, BolaoMyPoints } from '@/types/bolao';

export async function getRanking(): Promise<BolaoRankingEntry[]> {
  const { data } = await api.get<BolaoRankingEntry[]>('/bolao/ranking');
  return data;
}

export async function createPrediction(payload: CreatePredictionPayload): Promise<void> {
  await api.post('/bolao/predictions', payload);
}

export async function getMyPoints(): Promise<BolaoMyPoints> {
  const { data } = await api.get<BolaoMyPoints>('/bolao/my-points');
  return data;
}
```

### Instância Axios — configuração

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: injetar JWT em todo request autenticado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: refresh token em 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      // Lógica de refresh existente — não alterar
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 7. Performance e Escalabilidade

Dado que o app terá **muitos usuários simultâneos**, estas regras são obrigatórias:

### Lazy loading obrigatório para módulos pesados

```tsx
// Mapbox, PackOpening com Framer Motion e álbum de figurinhas são pesados
const VenueMap = dynamic(() => import('@/components/map/VenueMap'), {
  ssr: false,              // Mapbox não funciona no SSR
  loading: () => <MapSkeleton />,
});

const PackOpening = dynamic(() => import('@/components/stickers/PackOpening'), {
  loading: () => <PackOpeningSkeleton />,
});
```

### Memoização — quando usar

```tsx
// useCallback para callbacks passados como prop a componentes filho
const handlePrediction = useCallback((score: { home: number; away: number }) => {
  createPrediction({ fixture_id: fixture.id, ...score });
}, [fixture.id, createPrediction]);

// useMemo para cálculos pesados
const sortedRanking = useMemo(
  () => ranking?.sort((a, b) => b.total_points - a.total_points) ?? [],
  [ranking]
);

// React.memo para listas longas (ranking, álbum)
export const StickerCard = React.memo(function StickerCard({ sticker }: StickerCardProps) {
  // ...
});
```

### Regras de re-render

- Não criar objetos/arrays inline nas props — causam re-render desnecessário
- Componentes de lista (ranking, álbum) **devem** usar `React.memo`
- Evitar Context que muda frequentemente — não colocar dados de API no Context

### Imagens

- Usar sempre `next/image` com `width` e `height` explícitos
- Domínios de S3 e CloudFront já configurados em `next.config.ts` — não alterar
- Figurinhas: usar `loading="lazy"` quando fora do viewport
- Nunca usar `<img>` diretamente

### Paginação e listas longas

- Feed de notícias: infinite scroll com `useInfiniteQuery`
- Ranking: paginação por offset (50 por vez)
- Álbum de figurinhas: virtual scroll se > 100 itens (usar `react-window` se necessário)

---

## 8. Animações

### Biblioteca: Framer Motion 11

**Quando usar Framer Motion:**
- Abertura de pacote de figurinhas (flip de cartas, reveal)
- Entrada de figurinha lendária (partículas, glow)
- Transições de página
- Aparecimento de modais/sheets
- Stagger de listas (ranking, feed)

**Quando usar CSS/Tailwind:**
- Badge "AO VIVO" pulsante → `animate-live-pulse` (Tailwind)
- Hover states em botões → `transition-colors duration-150`
- Loading skeletons → `animate-pulse` (Tailwind)

### Padrão de animação de pacote (PackOpening)

```tsx
// components/stickers/PackOpening.tsx
const cardVariants = {
  hidden: { rotateY: 180, opacity: 0 },
  visible: (i: number) => ({
    rotateY: 0,
    opacity: 1,
    transition: { delay: i * 0.4, duration: 0.6, type: 'spring' },
  }),
};

// Lendária — variante especial
const legendaryVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [1, 1.2, 1],
    opacity: 1,
    transition: { duration: 0.8, type: 'spring', bounce: 0.5 },
  },
};
```

### Regras de animação

1. **Não animar em `useEffect`** — usar `AnimatePresence` e variantes declarativas
2. **Respeitar `prefers-reduced-motion`** — Framer Motion faz isso automaticamente via `useReducedMotion`
3. **Duração máxima: 600ms** para ações de usuário, 1000ms para reveals especiais (lendária)
4. **Não bloquear interação** — usar `pointer-events: none` apenas durante a animação de reveal

---

## 9. Roteamento e Navegação

### Estrutura de rotas (App Router)

```
/              → redirect → /home
/home          → Home com HeroMatchBanner
/jogos         → Lista de jogos da Copa
/jogos/[id]    → Detalhe + placar ao vivo
/bolao         → Lista de jogos para apostar
/bolao/[id]    → Fazer/ver aposta do jogo
/bolao/ranking → Leaderboard
/bolao/premios → Catálogo de prêmios
/figurinhas    → Álbum de figurinhas
/figurinhas/trocas → Mercado de trocas
/mapa          → Mapbox venue map
/feed          → Feed de notícias + patrocínios
/foto          → Photo Finder (reutilizar)
/perfil        → Perfil + pontos + coleção
```

### BottomNav — 5 tabs fixas

```tsx
const navItems = [
  { label: 'Home',       href: '/home',       icon: 'house' },
  { label: 'Jogos',      href: '/jogos',       icon: 'sports_soccer' },
  { label: 'Bolão',      href: '/bolao',       icon: 'emoji_events' },
  { label: 'Figurinhas', href: '/figurinhas',  icon: 'collections' },
  { label: 'Perfil',     href: '/perfil',      icon: 'person' },
];
```

### Proteção de rotas autenticadas

Todas as rotas em `/(user)/` requerem autenticação. Usar o middleware existente — não recriar.

---

## 10. TypeScript — Regras Estritas

- `"strict": true` no `tsconfig.json` — nunca desabilitar
- Sem `any` — usar `unknown` com type guard se shape é desconhecida
- Sem `@ts-ignore` ou `@ts-expect-error` sem comentário explicando o motivo
- Todos os tipos de API response definidos em `types/` — nunca inline
- Interface para objeto shapes, `type` para unions e tipos computados
- Generics explícitos em `useQuery<TipoRetorno>` — não inferir de função anônima

```typescript
// types/bolao.ts — exemplo de estrutura
export interface BolaoRankingEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  exact_predictions: number;
  correct_outcomes: number;
}

export interface CreatePredictionPayload {
  fixture_id: number;
  home_score_prediction: number;
  away_score_prediction: number;
}

export interface BolaoMyPoints {
  total_points: number;
  rank: number;
  exact_predictions: number;
  correct_outcomes: number;
}
```

---

## 11. Regras de Qualidade

### Tom de voz na UI — obrigatório

Todos os textos visíveis ao usuário seguem o tom Cazé TV: informal, empolgante, emojis em notificações.

| Contexto | Texto ERRADO | Texto CORRETO |
|---|---|---|
| Empty state bolão | "Nenhuma aposta encontrada." | "Você ainda não apostou. Vai ficar de fora? ⚽" |
| Erro genérico | "Erro ao processar solicitação." | "Algo deu errado. Tenta de novo! 😅" |
| Sucesso aposta | "Aposta registrada com sucesso." | "Aposta feita! Agora é torcer 🤞🇧🇷" |
| Pack aberto | "Você recebeu 3 figurinhas." | "3 figurinhas novas! Abre aí 🎴" |
| Figurinha lendária | "Figurinha rara obtida." | "LENDÁRIO! Você tirou o Vini Jr.! 🔥" |

### Acessibilidade mínima

- Todo botão de ação tem `aria-label` descritivo
- Imagens decorativas têm `alt=""`; imagens de conteúdo têm `alt` descritivo
- Contraste mínimo 4.5:1 (WCAG AA) — verificar especialmente amarelo sobre branco
- Bottom nav: `role="navigation"` e `aria-label="Navegação principal"`

### Regras de comentários

- **Sem comentários** que explicam o que o código faz — nomes de variáveis/funções devem ser autoexplicativos
- Comentário só quando o **POR QUÊ** é não-óbvio: contornos de bugs, invariantes, decisões de produto
- Sem docstrings multi-linha em funções simples

### Proibições absolutas

- `console.log` em código commitado — usar em dev, remover antes de PR
- `debugger` em código commitado
- Chamadas de API diretas nos componentes (sem passar por service + hook)
- Hardcode de URLs — sempre usar `process.env.NEXT_PUBLIC_API_URL`
- Hardcode de cores fora do theme e tailwind config

---

## 12. Variáveis de Ambiente

```bash
# front-end/front-cazeapp/.env.local

# Existente
NEXT_PUBLIC_API_URL=http://localhost:8000

# NOVO — obrigatório para o mapa
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...

# NOVO — apenas para build/CI se necessário
NEXT_PUBLIC_ENV=development
```

**Regras de env:**
- Variáveis com `NEXT_PUBLIC_` são expostas no browser — nunca colocar secrets aqui
- Sem Supabase keys, sem JWT secrets, sem service keys no frontend
- Validar presença das env vars no start do app se forem críticas

---

*Última atualização: 2026-05-21 | Parte integrante do guia principal em `../../CLAUDE.md`*
