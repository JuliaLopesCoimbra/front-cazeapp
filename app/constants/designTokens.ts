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
  headerMascotZone: 20,
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
  /** Touch target mínimo */
  touchTarget: 44,
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
  backgroundColor: "rgba(40, 40, 40, 0.22)",
  backdropFilter: "blur(10px) saturate(1.1)",
  WebkitBackdropFilter: "blur(10px) saturate(1.1)",
} as const;

export const COLORS = {
  bg: "#282828",
  surface: "#363636",
  green: "#009440",
  yellow: "#FFCB00",
  red: "#E52554",
  blue: "#0055B8",
  muted: "#9E9E9E",
  text: "#FFFFFF",
  textSecondary: "rgba(255, 255, 255, 0.55)",
} as const;
