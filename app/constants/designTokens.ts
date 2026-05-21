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
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(12px) saturate(1.15)",
  WebkitBackdropFilter: "blur(12px) saturate(1.15)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
} as const;

/** Vidro da BottomNav — reutilizar em header/comentários do post */
export const NAV_DOCK_GLASS = {
  blurPx: 20,
  fillAlpha: 0.32,
  fillRgb: "255, 255, 255",
  saturate: 1.1,
  border: "1px solid rgba(0, 0, 0, 0.08)",
  shadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
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
  // Backgrounds
  bg:          "#FFF6E8",
  bgDark:      "#282828",
  surface:     "#FFFFFF",
  surfaceDark: "#363636",

  // Marca
  green:    "#009440",
  yellow:   "#F6C400",
  red:      "#E52554",
  blue:     "#173BFF",    // broadcast blue — headlines, banners, match day
  blueCopa: "#0055B8",    // fundo de posts Copa (mantido separado)
  pink:     "#FF6FAE",    // stickers CTA, meme bubbles
  black:    "#000000",

  // Texto — contexto claro (sobre #FFF6E8 / #FFFFFF)
  muted:         "#6B6B6B",
  text:          "#0A0A0A",
  textSecondary: "rgba(0, 0, 0, 0.72)",

  // Texto — contexto escuro (sobre imagens, overlays, fundos sólidos #282828+)
  textOnDark:          "#FFFFFF",
  textSecondaryOnDark: "rgba(255, 255, 255, 0.70)",
  mutedOnDark:         "rgba(255, 255, 255, 0.45)",
} as const;
