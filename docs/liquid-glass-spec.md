# Liquid Glass Spec — Casa CazéTV Copa 2026

Status: v1.0 — design-ready, FE pode implementar.
Owner: UI Designer (este arquivo é a fonte de verdade).
Referência técnica: `polidario/liquid-glass-vue` (feTurbulence + feDisplacementMap).
Referência visual: Figma `VZ2fPhIG5zVt0XUlzaYyFm`, nó raiz `1:2`.

---

## 1. Análise do Figma — valores extraídos

Todos os elementos com glass na home (`1:2`) compartilham **uma única receita de fill**, com variações apenas em borda, raio e contexto. Os valores abaixo foram lidos diretamente do Figma (não estimados).

### 1.1 Inventário dos elementos glass

| Node ID | Nome no Figma | Função | Tamanho |
|--------|--------------|--------|---------|
| `18:21` | Rectangle 3 | Header strip do card de post (top) | 357 × 42 |
| `18:15` | Rectangle 2 | Caption overlay sobre imagem do post | 247 × 74 |
| `18:37` | Rectangle 6 | Header strip do segundo card de post | 357 × 42 |
| `18:34` | Rectangle 5 | Caption overlay do segundo card | 247 × 74 |
| `21:91` | Rectangle 11 | Dock/pill flutuante no rodapé | 202 × 46 |
| `16:14` | Rectangle 1 | Frame do card do post (border + imagem) | 357 × 496 |
| `18:56` | Rectangle 7 | Tab pill do segmented control "Home" (ativa) | 93 × 29 |
| `18:63` / `18:65` | Rectangle 8 / 9 | Tab pills inativas | 93 × 29 |

### 1.2 Valores exatos lidos do export CSS

| Propriedade | Valor |
|-------------|-------|
| Fill universal do glass | `rgba(217, 217, 217, 0.2)` — 20% de off-white (#D9D9D9 a 20% alpha) |
| Cor de borda Cazé/Brasil | `#009440` — verde Brasileira oficial (NÃO usar `#10b981` / Tailwind green) |
| Espessura de borda fina (card frame) | `1px solid #009440` |
| Espessura de borda forte (caption) | `2px solid #009440` |
| Border-radius padrão do glass | `15px` |
| Border-radius corner-specific | header strip: `15px 15px 0 0` (apenas top) |
| Fundo "non-glass" (tab ativa, área inferior do segmented) | `#363636` opaco — usar como fallback sólido |
| Brand yellow (texto/destaque) | `#FECB04` (atual no projeto) — não-aplicável ao Liquid Glass mas referência |

**Observação crítica sobre a borda do caption (`18:15`):**
O CSS export do Figma simplifica para `border-2 border-[#009440] border-solid`. Mas o **render visual** do Figma mostra a borda como gradiente bi-tonal — amarelo no canto superior-direito, verde no canto inferior-esquerdo. Confirmado por screenshot do nó isolado: há um halo amarelo visível na borda superior. Isso significa que a borda **é especificada como sólida verde mas o designer espera renderização com tom secundário amarelo na luz superior**. A implementação correta no app é a borda gradiente Brasil (verde → amarelo → verde) já presente no `LiquidGlass` atual.

### 1.3 O que NÃO existe no Figma (mas existe no app atual)

- O **drop shadow** atrás dos glass elements não está modelado no Figma. O app pode adicionar para reforçar a tridimensionalidade — está bem.
- O **inner highlight** (`box-shadow: inset`) também não existe no export. É um enriquecimento legítimo para o efeito Liquid Glass real (Apple WWDC 2025).
- O **displacement filter SVG** é zero presença no Figma. É exclusivamente uma decisão de implementação na web.
- O **BrazilGlowLayer** (orbs verde/amarelo no fundo) não existe no Figma — é um enriquecimento de marca no app. Aprovado como complemento opcional via prop `brazilGlow`.

### 1.4 Cores derivadas para uso no spec

```
--lg-fill:                rgba(217, 217, 217, 0.20)
--lg-fill-strong:         rgba(217, 217, 217, 0.30)
--lg-fill-dark:           rgba(0, 0, 0, 0.30)
--lg-border-green:        #009440
--lg-border-yellow:       #FECB04
--lg-inner-highlight:     rgba(255, 255, 255, 0.55)
--lg-inner-highlight-soft: rgba(255, 255, 255, 0.18)
--lg-drop-shadow:         rgba(0, 0, 0, 0.35)
--lg-radius-card:         15px
--lg-radius-pill:         9999px
--lg-radius-modal:        20px
```

---

## 2. Presets do componente `LiquidGlass`

Cinco presets nomeados. Cada um mapeia para um conjunto exato de props no componente. O FE deve expor uma prop `preset` que aplica esses valores; props individuais continuam disponíveis para override caso a caso.

### 2.1 Tabela canônica de presets

| Preset | Onde usar | borderType | borderColor | borderWidth | borderRadius | backdropBlur | backdropSaturate | backdropBrightness | displacement | bgAlpha | bgTint | innerHighlight | dropShadow | brazilGlow |
|--------|-----------|------------|-------------|-------------|--------------|--------------|------------------|--------------------|--------------|---------|--------|----------------|------------|------------|
| `post-header` | Header strip de cards do feed (avatar + handle + menu) | `gradient-brazil` | — | `1.5px` | `15px 15px 0 0` | `16px` | `1.7` | `1.05` | **off** | `0.20` | `#D9D9D9` | inset 0.5 white (soft) | `none` (card já tem sombra) | off |
| `post-caption-overlay` | Caption sobre imagem do post (3-linhas, ZERO reais, etc) | `gradient-brazil` | — | `2px` | `15px` | `14px` | `1.6` | `1.02` | optional, `scale: 30` | `0.20` | `#D9D9D9` | inset 1 white (sutil) | `0 8px 24px rgba(0,0,0,0.35)` | off |
| `dock-bottom-nav` | Pill flutuante de navegação no rodapé mobile | `none` (Figma não usa borda; ver §2.4) | — | — | `9999px` (pill) | `24px` | `1.5` | `1.10` | **off** (custo em redraw constante) | `0.20` | `#D9D9D9` | inset 1 white (top 50%) | `0 12px 40px rgba(0,0,0,0.45)` | on (`BrazilDockGlow`) |
| `sidebar-active-item` | Item ativo da sidebar desktop | `left-only` (faixa 4px verde) | `#009440` | `4px` (apenas border-left) | `0` | `16px` | `1.4` | `1.05` | **off** | `0.12` | `#009440` | inset 0.5 white-soft | `none` | off |
| `modal-sheet` | Modais centrais e bottom sheets (figurinhas, pack opening, prêmios) | `none` ou `gradient-brazil` opcional | — | `1px` (se opcional) | `20px` | `28px` | `1.6` | `1.00` | **on**, `scale: 40` | `0.15` | `#D9D9D9` | inset 1 white | `0 24px 60px rgba(0,0,0,0.55)` | optional |

**Notas:**
- `bgAlpha` é o alpha aplicado sobre `bgTint`. O resultado final do fill no preset `post-header` é exatamente `rgba(217,217,217,0.20)` — bate com Figma.
- `backdropBlur` em `px`, `backdropSaturate` e `backdropBrightness` em multiplicador, encadeados via `backdrop-filter: blur(Xpx) saturate(Y) brightness(Z)`.
- `displacement` é o filtro SVG (ver §3). Quando `off`, omitir do `backdrop-filter`.

### 2.2 Mapeamento para props atuais do componente

O `LiquidGlass.tsx` já tem `border`, `borderRadius`, `brazilGlow`, `blurPx`, `minHeight`, `noPadding`, `glassAlpha`. Sugestão de evolução mínima da API:

```ts
type LiquidGlassPreset =
  | "post-header"
  | "post-caption-overlay"
  | "dock-bottom-nav"
  | "sidebar-active-item"
  | "modal-sheet";

type LiquidGlassProps = {
  preset?: LiquidGlassPreset;          // novo: aplica preset, props abaixo sobrescrevem
  border?: "none" | "green" | "gradient-brazil" | "left-only";  // adicionar "left-only"
  borderWidth?: number;                 // novo: em px, default por preset
  borderRadius?: number | string;       // permitir string ("15px 15px 0 0")
  brazilGlow?: boolean;
  blurPx?: number;
  saturate?: number;                    // novo
  brightness?: number;                  // novo
  displacement?: false | { baseFrequency: number; numOctaves: number; scale: number }; // novo
  glassAlpha?: number;
  bgTint?: string;                      // novo: hex, default "#D9D9D9"
  innerHighlight?: "none" | "soft" | "normal" | "strong"; // novo
  dropShadow?: "none" | "sm" | "md" | "lg" | "xl"; // novo
  minHeight?: number;
  noPadding?: boolean;
};
```

### 2.3 Defaults por preset (referência para o FE)

```ts
const PRESETS: Record<LiquidGlassPreset, Partial<LiquidGlassProps>> = {
  "post-header": {
    border: "gradient-brazil",
    borderWidth: 1.5,
    borderRadius: "15px 15px 0 0",
    blurPx: 16,
    saturate: 1.7,
    brightness: 1.05,
    displacement: false,
    glassAlpha: 0.20,
    bgTint: "#D9D9D9",
    innerHighlight: "soft",
    dropShadow: "none",
    brazilGlow: false,
  },
  "post-caption-overlay": {
    border: "gradient-brazil",
    borderWidth: 2,
    borderRadius: 15,
    blurPx: 14,
    saturate: 1.6,
    brightness: 1.02,
    displacement: false,            // ver §3 — opt-in via flag global
    glassAlpha: 0.20,
    bgTint: "#D9D9D9",
    innerHighlight: "normal",
    dropShadow: "md",
    brazilGlow: false,
  },
  "dock-bottom-nav": {
    border: "none",
    borderRadius: 9999,
    blurPx: 24,
    saturate: 1.5,
    brightness: 1.10,
    displacement: false,
    glassAlpha: 0.20,
    bgTint: "#D9D9D9",
    innerHighlight: "normal",
    dropShadow: "lg",
    brazilGlow: true,
  },
  "sidebar-active-item": {
    border: "left-only",
    borderWidth: 4,
    borderRadius: 0,
    blurPx: 16,
    saturate: 1.4,
    brightness: 1.05,
    displacement: false,
    glassAlpha: 0.12,
    bgTint: "#009440",
    innerHighlight: "soft",
    dropShadow: "none",
    brazilGlow: false,
  },
  "modal-sheet": {
    border: "none",
    borderRadius: 20,
    blurPx: 28,
    saturate: 1.6,
    brightness: 1.00,
    displacement: { baseFrequency: 0.008, numOctaves: 2, scale: 40 },
    glassAlpha: 0.15,
    bgTint: "#D9D9D9",
    innerHighlight: "normal",
    dropShadow: "xl",
    brazilGlow: false,
  },
};
```

### 2.4 Decisões de divergência do Figma

Onde o spec diverge do Figma, sempre com motivo:

| Item | Figma diz | Spec diz | Motivo |
|------|-----------|----------|--------|
| Caption border (`18:15`) | `2px solid #009440` no CSS export | `gradient-brazil` 2px | O render do Figma mostra halo amarelo na borda superior; o gradiente Brasil reproduz a intenção visual e está alinhado com a marca Cazé/Brasil. |
| Dock (`21:91`) | Sem borda visível | Sem borda + `brazilGlow` ativo | Figma não mostra glow; é enriquecimento aprovado para a sensação fanzone. |
| Post header (`18:21`) | Sem borda própria (herda do card 16:14 `1px #009440`) | `1.5px gradient-brazil` | O card `16:14` tem `border-radius` bottom-only e overflow-clip; o header strip dentro dele precisa da borda própria para destacar a separação com a imagem. |
| Saturate / brightness | Não modelado no Figma | Definido | Liquid Glass real (Apple) eleva saturação do que está atrás para parecer "mais vivo" através do vidro. Sem isso, o glass parece um overlay cinza chapado. |

---

## 3. Displacement filter — recomendação por preset

A técnica `feTurbulence + feDisplacementMap` distorce o conteúdo atrás do vidro (efeito "água"). É o que diferencia o Liquid Glass do Apple WWDC 2025 de um simples backdrop-blur.

### 3.1 Filtro SVG canônico (compartilhado)

Adicionar **uma única vez** no `app/layout.tsx`, fora do fluxo visual:

```html
<svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden;">
  <defs>
    <!-- Sutil — caption, header -->
    <filter id="lg-displace-soft" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" seed="4" result="turb" />
      <feDisplacementMap in="SourceGraphic" in2="turb" scale="20" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <!-- Médio — modais -->
    <filter id="lg-displace-medium" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" seed="7" result="turb" />
      <feDisplacementMap in="SourceGraphic" in2="turb" scale="40" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <!-- Forte — apenas hero/welcome experience -->
    <filter id="lg-displace-strong" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.012" numOctaves="2" seed="11" result="turb" />
      <feDisplacementMap in="SourceGraphic" in2="turb" scale="80" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
</svg>
```

Uso em CSS: `backdrop-filter: blur(14px) saturate(1.6) brightness(1.02) url(#lg-displace-soft);`

### 3.2 Decisão por preset

| Preset | Usa displacement? | Filtro recomendado | Justificativa |
|--------|-------------------|--------------------|---------------|
| `post-header` | **Não** | — | Altura 42px — efeito quase imperceptível, não vale o custo em uma lista que pode ter dezenas de posts visíveis. |
| `post-caption-overlay` | **Opt-in** (flag global) | `lg-displace-soft` (scale 20) | A imagem do post abaixo da caption tem contraste alto (azul/amarelo Brasil), então um displacement de scale 20 cria uma distorção visível e bonita. Mas como o feed tem muitos cards, mantemos default off e ligamos via flag `NEXT_PUBLIC_LG_DISPLACEMENT=true` para experimentação. |
| `dock-bottom-nav` | **Não** | — | O dock fica sobre conteúdo que rola continuamente; recompor displacement a cada scroll é caríssimo em mobile. Drop-shadow + blur já entrega tridimensionalidade suficiente. |
| `sidebar-active-item` | **Não** | — | Sidebar é desktop-only, mas o item é pequeno e o fundo dele raramente tem textura interessante para distorcer. |
| `modal-sheet` | **Sim** | `lg-displace-medium` (scale 40) | Modais cobrem grande área, o fundo (página de feed/figurinhas) tem cor/imagem; displacement aqui justifica o custo e cria o "uau" Apple-like. Acontece uma vez por interação, não a cada scroll. |

### 3.3 Calibração dos valores vs. polidario/liquid-glass-vue

O exemplo Vue usa `baseFrequency=0.01` + `scale=200`. Isso é **catastroficamente intenso** para mobile e distorce o conteúdo a ponto de ficar ilegível. Nossa calibração:

- `baseFrequency`: `0.008` (frequência mais baixa = ondas mais largas, sensação de água parada vs. água agitada)
- `numOctaves`: `2` (suficiente para textura natural; 3+ aumenta custo sem ganho visual claro)
- `scale` por contexto: 20 / 40 / 80 — bem abaixo do 200 do exemplo, mas adequado a elementos UI (não a hero gigante de landing page)

---

## 4. Animações de entrada e estados

Todos os tempos em ms, easing CSS. Respeitar `prefers-reduced-motion: reduce` desativando transforms e reduzindo durações para 0 (mantendo apenas opacity em 80ms).

### 4.1 Por preset

| Preset | Trigger | Duração | Easing | Propriedades animadas | Reduced-motion |
|--------|---------|---------|--------|----------------------|----------------|
| `post-header` | Card entra na viewport (IntersectionObserver) | 320ms | `cubic-bezier(0.22, 1, 0.36, 1)` | `opacity 0→1`, `translateY 8px→0` | apenas opacity, 80ms |
| `post-caption-overlay` | Mesmo trigger do card | 400ms | `cubic-bezier(0.22, 1, 0.36, 1)` | `opacity 0→1`, `translateY 12px→0`, `blur 24px→14px` | apenas opacity, 80ms |
| `dock-bottom-nav` | Mount inicial / scroll-up (auto-hide) | 240ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `translateY 100%→0`, `opacity 0→1` | translateY mantido (acessibilidade não impede slide curto), duração 120ms |
| `sidebar-active-item` | Mudança de rota | 180ms | `ease-out` | `bgAlpha 0→0.12`, `border-left-width 0→4px` | apenas bgAlpha |
| `modal-sheet` | Open | 360ms | `cubic-bezier(0.22, 1, 0.36, 1)` | `opacity 0→1`, `scale 0.96→1`, `blur 32px→28px` | apenas opacity, 120ms |
| `modal-sheet` | Close | 220ms | `cubic-bezier(0.4, 0, 1, 1)` | `opacity 1→0`, `scale 1→0.98` | opacity, 120ms |

### 4.2 Micro-interactions

- **Hover em pill ativa do dock** (desktop): `transform: scale(1.05)`, 160ms `ease-out`
- **Press/active em qualquer glass**: `transform: scale(0.98)`, 80ms — feedback tátil curto
- **Live badge dentro do header** (`LiveBadge.tsx`): dot vermelho `animate-pulse` 1.4s ease-in-out infinite — não tocar

### 4.3 Sem animação contínua

Nunca animar continuamente `backdrop-filter`, `filter url(...)`, ou propriedades que disparam repaint global. Toda animação é uma transição com início e fim definidos.

---

## 5. Performance

### 5.1 Quando aplicar `will-change`

- **`will-change: transform, opacity`** — apenas durante a animação de entrada/saída do `modal-sheet` e do `dock-bottom-nav`. Remover após `transitionend`.
- **NÃO usar `will-change` em `post-header` / `post-caption-overlay`** — o feed renderiza muitos cards e o ganho não compensa o custo de memória de compositor.
- **Nunca usar `will-change: backdrop-filter`** — não é suportado de forma consistente e força layers extras.

### 5.2 `contain`

- `modal-sheet`: `contain: paint;` — limita o repaint à área do modal.
- `post-header` e `post-caption-overlay`: `contain: layout paint;` — o card já é um container previsível, isso ajuda o feed a manter 60fps no scroll.
- `dock-bottom-nav`: `contain: paint;`.
- `sidebar-active-item`: não precisa.

### 5.3 Fallback para browsers sem `backdrop-filter`

Firefox <103 e iOS Safari muito antigo (<14) não suportam `backdrop-filter`. Detecção e fallback:

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .liquid-glass {
    background-color: rgba(54, 54, 54, 0.85); /* #363636 a 85% — bate com tab inativa do Figma */
    backdrop-filter: none;
  }
  .liquid-glass--light {
    background-color: rgba(217, 217, 217, 0.85);
  }
}
```

O `#363636` foi escolhido porque é exatamente o fundo opaco que o próprio Figma usa para a tab ativa (`18:56`) — então o fallback é uma decisão já validada pelo designer.

### 5.4 Custo do SVG displacement em mobile — quando NÃO usar

`feDisplacementMap` é renderizado pela CPU em iOS Safari (não pela GPU) e custa em torno de **2-4ms por frame** para áreas de ~200×200px com `scale=40`. Em listas que rolam (feed), isso quebra os 60fps.

Regras:
- **Nunca** em elementos que aparecem em listas (post header, post caption no scroll, items de figurinha no álbum).
- **Nunca** em elementos `position: fixed` que ficam sempre visíveis durante scroll (dock).
- **Sim** em modais e bottom sheets — eles aparecem uma vez por interação e não rolam junto com o conteúdo.
- **Sim**, opcionalmente, em hero banners da home — uma instância só, fora do scroll do feed.

### 5.5 Limite de instâncias simultâneas

- `backdrop-filter: blur()`: **até 12 instâncias simultâneas** na viewport sem queda perceptível. Acima disso, considerar virtualização do feed.
- `backdrop-filter` com `url(#displace)`: **máximo 2 instâncias simultâneas**. Modal aberto + dock = limite.

### 5.6 Z-index e stacking

O `backdrop-filter` cria um stacking context próprio. Cuidados:
- O dock (`position: fixed; z-index: 50`) sempre acima de tudo.
- Modais `z-index: 100`, com `backdrop-filter` no overlay e no painel; o overlay usa apenas blur (sem displacement), só o painel central usa displacement.
- Cards do feed: z-index não declarado (auto) — o `LiquidGlass` dentro do card cria seu próprio stacking.

---

## 6. Acessibilidade

- **Contraste de texto sobre glass**: validado a 4.5:1 sobre fundo `#0055B8` (azul do post). Texto branco `#FFFFFF` passa folgado; texto cinza `#9E9E9E` reprova — **sempre branco ou amarelo `#FECB04` sobre glass**.
- **Focus ring**: `outline: 2px solid #FECB04; outline-offset: 2px;` sobre elementos glass interativos. O amarelo Cazé funciona como focus state visível em qualquer fundo.
- **`prefers-reduced-transparency`**: para usuários que ativarem essa preferência do SO (iOS / macOS), aplicar o fallback opaco do §5.3 mesmo se `backdrop-filter` for suportado:
  ```css
  @media (prefers-reduced-transparency: reduce) {
    .liquid-glass { backdrop-filter: none; background-color: rgba(54,54,54,0.92); }
  }
  ```
- **Toque mínimo**: qualquer pill/botão glass interativo respeita 44×44px de área tocável (pode ter padding invisível para atingir isso).

---

## 7. Plano de migração das classes CSS legadas

O `globals.css` tem hoje classes `.glass`, `.glass-green`, `.glass-dark`, `.glass-caption`. Plano:

1. Manter as classes CSS apenas como **fallback** referenciado pelo `@supports not` do §5.3.
2. Todos os usos atuais devem migrar para `<LiquidGlass preset="...">` correspondente:
   - `.glass` em uso genérico → `preset="post-header"` ou `"modal-sheet"` dependendo do contexto
   - `.glass-green` (sidebar item ativo) → `preset="sidebar-active-item"`
   - `.glass-green` (empty state Bolão/Figurinhas) → `preset="post-caption-overlay"` ou novo preset `empty-state` (ver dúvidas)
   - `.glass-dark` → mapear caso a caso (provavelmente `modal-sheet` com `bgTint="#000000"` e `glassAlpha: 0.3`)
   - `.glass-caption` → `preset="post-caption-overlay"`
3. Após migração completa, remover as classes legadas exceto as do bloco `@supports not`.

---

## DÚVIDAS

Decisões que precisam do PO/Design Lead antes do FE codar:

1. **Displacement default global**: deixar `displacement: false` no preset `post-caption-overlay` por default e oferecer flag de feature `NEXT_PUBLIC_LG_DISPLACEMENT` para experimentar, OK? Ou já habilitar por default e medir performance em campo?

2. **Empty state (Bolão e Figurinhas)** usa hoje `.glass-green`. Devemos:
   - (a) reaproveitar `post-caption-overlay` (gradient-brazil, fill 20%), ou
   - (b) criar um sexto preset `empty-state` com bgTint verde claro (semelhante ao sidebar item) e ilustração centralizada?
   Recomendação minha: **(a)** — mantém consistência visual com o feed e reduz superfície de manutenção.

3. **Tab pills do segmented control** (Figma: `#363636` opaco com border verde, **não-glass**). Confirmar que mantemos isso como **componente separado** (não-glass) e não tentamos transformar em Liquid Glass. Recomendação: manter opaco — segmented control precisa de leitura imediata, transparência atrapalha.

4. **Dock — borda**: Figma não mostra borda, mas o `LiquidGlass` atual aceita `border: "green"`. Confirmar que dock é `border: "none"` definitivo ou se queremos uma borda super-sutil (`1px rgba(0,148,64,0.3)`) para dar definição em fundos muito claros (improvável no app, dado que o feed tem imagens dominantes).

5. **Drop shadow universal**: o Figma não modela sombras. Os valores propostos (`md/lg/xl`) são minha calibração. Pedir validação visual em uma tela real do app antes do merge.

6. **Modal-sheet** ainda não tem implementação no app. O preset está spec'ado mas não tem tela existente como referência — quando a primeira tela com modal (Pack Opening de figurinhas, p.ex.) entrar em design, revalidar o preset.

---

*Última atualização: 2026-05-21. Documento técnico — atualizar quando os presets evoluírem ou novos contextos surgirem.*

---

## 8. Apple iOS 26 Calibration (v2)

Revisão dos presets a partir do `deep-research-report (1).md` (§§3.2, 3.3, 7) e da releitura do Apple HIG "Materials" pós-WWDC 2025. A v1 ficava com blur alto + saturação alta criando a sensação de "overlay fosco". A v2 reduz blur, ajusta saturação para os valores Apple (1.3–1.5), e introduz inner highlight `apple` + drop-shadow direcional que são o que dá a sensação de "vidro real".

### 8.1 Mudança nos defaults dos presets

| Preset | blur (v1 → v2) | saturate (v1 → v2) | brightness (v1 → v2) | innerHighlight (v2) | dropShadow (v2) | specular (v2) |
|--------|----------------|---------------------|----------------------|----------------------|------------------|----------------|
| `post-header` | 16 → **6** | 1.7 → **1.35** | 1.05 → **1.08** | `normal` | `sm` | `false` |
| `post-caption-overlay` | 14 → **4** | 1.6 → **1.4** | 1.02 → **1.05** | `apple` | `lg` | `true` |
| `dock-bottom-nav` | 24 → **12** | 1.5 → **1.5** | 1.10 → **1.10** | `apple` | `xl` | `true` |
| `sidebar-active-item` | 16 → **8** | 1.4 → **1.3** | 1.05 → **1.05** | `soft` | `none` | `false` |
| `modal-sheet` | 28 → **20** | 1.6 → **1.4** | 1.00 → **1.00** | `apple` | `xl` | `true` |

Justificativa do blur baixo: blur alto borra a hierarquia do que está atrás e faz o glass parecer "fosco genérico". Apple usa blur baixo (2–4px no iOS 26 para tab bars / pills) e compensa a sensação de profundidade com **saturate moderado + brightness leve + drop-shadow direcional**.

### 8.2 Drop shadow direcional (luz upper-left)

Aplicado via `filter: drop-shadow(...)` no **wrapper externo** do `LiquidGlass` (não no painel interno, para o `backdrop-filter` interno não sofrer isolamento de stacking context).

```
sm:  drop-shadow(-2px 3px  8px rgba(0,0,0,0.20))
md:  drop-shadow(-4px 6px 16px rgba(0,0,0,0.30))
lg:  drop-shadow(-6px 8px 24px rgba(0,0,0,0.35))
xl:  drop-shadow(-8px 10px 46px rgba(0,0,0,0.40))
```

A direção `-Xpx +Ypx` simula a luz Apple vinda do canto superior-esquerdo, com a sombra projetada para baixo-direita. Isso vincula visualmente os elementos glass à mesma fonte de luz, criando coerência em qualquer composição.

### 8.3 Inner highlight `"apple"` — receita completa

Os 3 box-shadows internos que reproduzem o cantilever de luz Apple iOS 26 (referência: `polidario/liquid-glass-vue` §3.2 da pesquisa):

```css
box-shadow:
  inset  6px  6px 0 -6px rgba(255,255,255,0.7),   /* (1) Cantilever upper-left  */
  inset  0    0   8px 1px rgba(255,255,255,0.55), /* (2) Ring glow interno      */
  inset -3px -3px 6px -3px rgba(0,0,0,0.15);      /* (3) Sombra inferior-direita */
```

- **(1)** é a gota de luz refletida no canto superior-esquerdo — o efeito visual mais característico do iOS 26.
- **(2)** é o "halo" interno onde a luz invade toda a borda — dá a sensação de que o vidro "respira" luz.
- **(3)** complementa o drop-shadow externo: simula que o vidro tem espessura física e a luz não atravessa uniformemente.

### 8.4 Specular highlight (prop `specular`)

Gradiente diagonal aplicado via pseudo `::before` quando `specular === true`:

```css
&::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 35%);
  pointer-events: none;
  mix-blend-mode: overlay;
}
```

Quando usar: `post-caption-overlay`, `dock-bottom-nav`, `modal-sheet` (áreas maiores onde o destaque do canto superior-esquerdo é visível e reforça a leitura "glass real"). Evitar em headers de 42px — o gradiente fica claustrofóbico em alturas pequenas.

### 8.5 Apple easing — `APPLE_EASE`

Exportado do `LiquidGlass.tsx`:

```ts
export const APPLE_EASE = "cubic-bezier(0.6, 0.05, 0.1, 0.95)";
```

Usar em transitions de hover/active de componentes glass (dock, pills, modais). Já aplicado internamente no `LiquidGlass` em `transition: box-shadow 240ms / transform 160ms`.

### 8.6 Breathing animation — `breathing?: boolean`

Animação contínua e sutil do `box-shadow` interno (6s ease-in-out infinite, atenua e restaura o highlight). Desligada por default — opt-in via prop. Sempre desligada automaticamente sob `prefers-reduced-motion: reduce`.

Quando usar: hero banners, modal-sheet em estado idle, dock em telas muito quietas. Nunca em listas longas (custo de paint contínuo).

### 8.7 `appleRound?: boolean`

Força `borderRadius: 24px` mesmo se o preset tiver valor menor. Útil quando o componente deve ficar mais "iOS-ish" em vez de seguir o Figma (que padroniza 15px). Default `false` — opt-in por instância. NÃO usar nos presets default, manter como decisão de produto por tela.

### 8.8 Crédito

Esta calibração v2 é baseada em:
- `D:\deep-research-report (1).md` — análise técnica do `polidario/liquid-glass-vue` (CSS `.card` linhas 472–480 e 498–504; receita Apple-like na §7)
- Apple HIG "Materials" (atualizado pós-WWDC 2025) — diretrizes de specular highlights, edge lighting, tinting adaptativo e espessura simulada por shadow direcional
- Verificação visual no projeto `liquid-glass-vue` confirmando que `blur(2px) + brightness(1.1)` com `inset 6px 6px 0 -6px rgba(255,255,255,0.7)` reproduz o look iOS 26 fielmente

