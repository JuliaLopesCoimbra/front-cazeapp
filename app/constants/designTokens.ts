/**
 * Design tokens — escala 4px, referência Instagram / apps sociais 2024–2026.
 * Use em sx: `px: SPACING.px.lg` ou `var(--caze-page-px)` no CSS.
 */
export const SPACING = {
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px — gap entre posts, chips */
  md: 12,
  /** 16px — padding lateral do feed (Instagram) */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px — entre seções */
  xxl: 24,
  /** 32px */
  section: 32,
} as const;

export const LAYOUT = {
  /** Barra superior (logo / menu) — compacta */
  headerToolbar: 40,
  /** Zona mascote + linha Brasil */
  headerMascotZone: 28,
  /** Faixa compacta de jogo no header */
  matchStripHeight: 56,
  /** Padding horizontal padrão */
  pagePaddingX: 16,
  /** Clearance bottom nav + safe area */
  bottomNavClearance: 88,
  /** Largura máxima do feed mobile */
  feedMaxWidth: 480,
  /** Patrocinador */
  sponsorHeight: 96,
  /** Mídia do post no feed (story / vertical) */
  postMediaAspectRatio: "9 / 16",
  /** Margem lateral mínima do card de post */
  postCardMarginX: 8,
  /** Touch target mínimo */
  touchTarget: 44,
  /** Banner HeroMatchBanner */
  heroMatchBannerHeight: 96,
} as const;

export const TYPOGRAPHY = {
  /** Meta, timestamps — IG secondary */
  caption: {
    fontSize: 12,
    lineHeight: 16 / 12,
    fontWeight: 400,
    letterSpacing: "0.01em",
  },
  /** Corpo, inputs labels */
  body: {
    fontSize: 14,
    lineHeight: 20 / 14,
    fontWeight: 400,
  },
  /** Nome de usuário, tabs ativas */
  bodyStrong: {
    fontSize: 14,
    lineHeight: 20 / 14,
    fontWeight: 600,
  },
  /** Subtítulos de card */
  subtitle: {
    fontSize: 15,
    lineHeight: 20 / 15,
    fontWeight: 600,
  },
  /** Títulos de seção */
  title: {
    fontSize: 16,
    lineHeight: 22 / 16,
    fontWeight: 700,
  },
  /** Placar / destaque */
  score: {
    fontSize: 18,
    lineHeight: 1,
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums" as const,
  },
} as const;

/** Superfície vidro fosco — header e corpo da home */
export const PAGE_GLASS_SURFACE = {
  backgroundColor: "rgba(27, 61, 232, 0.06)",
  backdropFilter: "blur(12px) saturate(1.3)",
  WebkitBackdropFilter: "blur(12px) saturate(1.3)",
  borderBottom: "1px solid rgba(27, 61, 232, 0.15)",
  boxShadow: "inset 0 1px 0 rgba(27, 61, 232, 0.10)",
} as const;

/** Azul canarinho — glows e sombras para elementos de destaque Copa */
export const BLUE_COPA_GLOW = {
  light: "0 0 14px rgba(27, 61, 232, 0.35)",
  medium: "0 0 20px rgba(27, 61, 232, 0.50), 0 0 40px rgba(27, 61, 232, 0.15)",
  border: "1px solid rgba(27, 61, 232, 0.30)",
  borderStrong: "1px solid rgba(27, 61, 232, 0.60)",
} as const;

/** Vidro da BottomNav — reutilizar em header/comentários do post */
export const NAV_DOCK_GLASS = {
  blurPx: 20,
  fillAlpha: 0.92,
  fillRgb: "21, 28, 46",
  saturate: 1.4,
  border: "1px solid rgba(255, 255, 255, 0.08)",
  shadow: "0 -2px 16px rgba(0, 0, 0, 0.35), 0 8px 32px rgba(0, 0, 0, 0.40)",
} as const;

/** `sx` do FrostedGlass alinhado à navbar */
export const NAV_DOCK_GLASS_SX = {
  backgroundColor: `rgba(${NAV_DOCK_GLASS.fillRgb}, ${NAV_DOCK_GLASS.fillAlpha})`,
  backdropFilter: `blur(${NAV_DOCK_GLASS.blurPx}px) saturate(${NAV_DOCK_GLASS.saturate})`,
  WebkitBackdropFilter: `blur(${NAV_DOCK_GLASS.blurPx}px) saturate(${NAV_DOCK_GLASS.saturate})`,
  border: NAV_DOCK_GLASS.border,
  boxShadow: NAV_DOCK_GLASS.shadow,
} as const;

/** Alphas do liquid glass (LiquidGlass.tsx — presets distintos da navbar) */
export const LIQUID_GLASS_ALPHA = {
  postHeader: 0.07,
  postCaption: 0.07,
  postCommentsCollapsed: 0.08,
  postCommentsExpanded: 0.4,
  dock: NAV_DOCK_GLASS.fillAlpha,
} as const;

export const COLORS = {
  // Backgrounds — dark theme
  bg:          "#0A1128",
  bgDark:      "#0A1128",
  surface:     "#151c2e",
  surfaceDark: "#151c2e",

  // Marca
  green:    "#008542",
  yellow:   "#FFD100",
  red:      "#E8175D",
  blue:     "#1B3DE8",    // broadcast blue — headlines, banners, match day
  blueCopa: "#0055B8",    // fundo de posts Copa (mantido separado)
  pink:     "#FF6FAE",    // stickers CTA, meme bubbles
  black:    "#000000",

  // Texto — dark theme (branco sobre fundo escuro)
  muted:         "rgba(255, 255, 255, 0.45)",
  text:          "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.72)",

  // Texto — aliases (mantidos para não quebrar componentes existentes)
  textOnDark:          "#FFFFFF",
  textSecondaryOnDark: "rgba(255, 255, 255, 0.70)",
  mutedOnDark:         "rgba(255, 255, 255, 0.45)",
} as const;
