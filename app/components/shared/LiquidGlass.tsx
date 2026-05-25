"use client";

import { Box, type SxProps, type Theme } from "@mui/material";
import { ReactNode } from "react";

/**
 * LiquidGlass — Casa CazéTV
 *
 * Calibração v2 (Apple iOS 26 / WWDC 2025).
 * Diferenças vs. v1:
 *  - drop-shadow direcional (luz vinda do upper-left)
 *  - innerHighlight "apple" (cantilever de luz + ring glow + sombra de volume)
 *  - blur baixo (2–12px) + saturate alto (1.3–1.5) + brightness leve (1.0–1.1)
 *  - specular highlight opt-in (pseudo `::before` com gradiente diagonal)
 *  - easing Apple exportado como APPLE_EASE
 *  - "breathing" animation opt-in, respeitando prefers-reduced-motion
 *
 * Fonte: deep-research-report.md §§3.2, 3.3, 7 + Apple HIG "Materials" (iOS 26).
 * Spec de presets: docs/liquid-glass-spec.md §8.
 */

export type LiquidGlassBorder = "none" | "green" | "gradient-brazil" | "left-only";
export type LiquidGlassInnerHighlight = "none" | "soft" | "normal" | "strong" | "apple";
export type LiquidGlassDropShadow = "none" | "sm" | "md" | "lg" | "xl";
export type LiquidGlassDisplacement =
  | false
  | { baseFrequency: number; numOctaves: number; scale: number };

export type LiquidGlassPreset =
  | "post-header"
  | "post-caption-overlay"
  | "dock-bottom-nav"
  | "sidebar-active-item"
  | "modal-sheet";

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
  /** Preset Apple-calibrated. Props individuais sobrescrevem o preset. */
  preset?: LiquidGlassPreset;
  /** Borda do painel. `left-only`: faixa 4px à esquerda (sidebar item ativo). */
  border?: LiquidGlassBorder;
  /** Espessura da borda em px. Default por preset. */
  borderWidth?: number;
  /** Aceita number (px) ou string ("15px 15px 0 0"). */
  borderRadius?: string | number;
  /** Força borderRadius 24px (look Apple). Default false — opt-in por componente. */
  appleRound?: boolean;
  /** Blobs verde/amarelo desfocados atrás do vidro (Brasil). */
  brazilGlow?: boolean;
  /** Intensidade do blur do backdrop em px. */
  blurPx?: number;
  /** Saturação do backdrop (multiplicador). Apple usa 1.3–1.5. */
  saturate?: number;
  /** Brightness do backdrop. Apple usa 1.0–1.1. */
  brightness?: number;
  /** Filtro SVG de displacement aplicado no backdrop-filter. */
  displacement?: LiquidGlassDisplacement;
  /** Altura mínima do painel. */
  minHeight?: number | string;
  /** Omitir padding interno (quando children controlam layout). */
  noPadding?: boolean;
  /** Opacidade do fill (0–1). */
  glassAlpha?: number;
  /** Cor base do fill antes do alpha. */
  bgTint?: string;
  /** Receita de luz interna. `apple` reproduz o look polidario/iOS 26. */
  innerHighlight?: LiquidGlassInnerHighlight;
  /** Drop shadow direcional (luz upper-left). Aplicado via filter no wrapper. */
  dropShadow?: LiquidGlassDropShadow;
  /** Specular highlight (gota de luz diagonal no canto superior-esquerdo). */
  specular?: boolean;
  /** Respiração sutil do highlight (6s). Respeita prefers-reduced-motion. */
  breathing?: boolean;
  /** contain: paint para isolar repaint (presets dock/modal). */
  containPaint?: boolean;
}

const GLOW_GREEN = "#008542";
const GLOW_YELLOW = "#FFD100";
const GLOW_GREEN_LIGHT = "#31E46A";

/** Easing oficial Apple (WWDC). Usar em transitions de componentes glass. */
export const APPLE_EASE = "cubic-bezier(0.6, 0.05, 0.1, 0.95)";

const PRESETS: Record<LiquidGlassPreset, Required<Pick<
  LiquidGlassProps,
  | "border"
  | "borderWidth"
  | "borderRadius"
  | "blurPx"
  | "saturate"
  | "brightness"
  | "displacement"
  | "glassAlpha"
  | "bgTint"
  | "innerHighlight"
  | "dropShadow"
  | "specular"
  | "brazilGlow"
  | "containPaint"
>>> = {
  "post-header": {
    border: "gradient-brazil",
    borderWidth: 1.5,
    borderRadius: "15px 15px 0 0",
    blurPx: 6,
    saturate: 1.35,
    brightness: 1.08,
    displacement: false,
    glassAlpha: 0.07,
    bgTint: "#FFFFFF",
    innerHighlight: "normal",
    dropShadow: "sm",
    specular: false,
    brazilGlow: false,
    containPaint: true,
  },
  "post-caption-overlay": {
    border: "gradient-brazil",
    borderWidth: 2,
    borderRadius: 15,
    blurPx: 4,
    saturate: 1.4,
    brightness: 1.05,
    displacement: false,
    glassAlpha: 0.07,
    bgTint: "#FFFFFF",
    innerHighlight: "apple",
    dropShadow: "lg",
    specular: true,
    brazilGlow: false,
    containPaint: true,
  },
  "dock-bottom-nav": {
    border: "none",
    borderWidth: 0,
    borderRadius: 9999,
    blurPx: 12,
    saturate: 1.5,
    brightness: 1.1,
    displacement: false,
    glassAlpha: 0.12,
    bgTint: "#FFFFFF",
    innerHighlight: "apple",
    dropShadow: "xl",
    specular: true,
    brazilGlow: true,
    containPaint: true,
  },
  "sidebar-active-item": {
    border: "left-only",
    borderWidth: 4,
    borderRadius: 0,
    blurPx: 8,
    saturate: 1.3,
    brightness: 1.05,
    displacement: false,
    glassAlpha: 0.12,
    bgTint: "#008542",
    innerHighlight: "soft",
    dropShadow: "none",
    specular: false,
    brazilGlow: false,
    containPaint: false,
  },
  "modal-sheet": {
    border: "none",
    borderWidth: 0,
    borderRadius: 20,
    blurPx: 20,
    saturate: 1.4,
    brightness: 1.0,
    displacement: { baseFrequency: 0.008, numOctaves: 2, scale: 40 },
    glassAlpha: 0.15,
    bgTint: "#D9D9D9",
    innerHighlight: "apple",
    dropShadow: "xl",
    specular: true,
    brazilGlow: false,
    containPaint: true,
  },
};

/** Drop-shadow direcional Apple (luz vinda do upper-left, sombra projetada bottom-right). */
function buildDropShadowFilter(level: LiquidGlassDropShadow): string {
  switch (level) {
    case "sm":
      return "drop-shadow(-2px 3px 8px rgba(0,0,0,0.20))";
    case "md":
      return "drop-shadow(-4px 6px 16px rgba(0,0,0,0.30))";
    case "lg":
      return "drop-shadow(-6px 8px 24px rgba(0,0,0,0.35))";
    case "xl":
      return "drop-shadow(-8px 10px 46px rgba(0,0,0,0.40))";
    case "none":
    default:
      return "";
  }
}

/** Box-shadow de inner highlight (camadas que simulam o cantilever de luz Apple). */
function buildInnerHighlight(level: LiquidGlassInnerHighlight): string {
  switch (level) {
    case "soft":
      return "inset 0 1px 0 rgba(255,255,255,0.18)";
    case "normal":
      return [
        "inset 2px 2px 0 -2px rgba(255,255,255,0.55)",
        "inset 0 0 6px 1px rgba(255,255,255,0.18)",
      ].join(", ");
    case "strong":
      return [
        "inset 4px 4px 0 -4px rgba(255,255,255,0.65)",
        "inset 0 0 8px 1px rgba(255,255,255,0.35)",
      ].join(", ");
    case "apple":
      // Receita iOS 26 / polidario:
      // 1) cantilever upper-left (gota de luz refletida)
      // 2) ring glow interno (luz que invade toda a borda)
      // 3) sombra interna bottom-right (volume / espessura)
      return [
        "inset 6px 6px 0 -6px rgba(255,255,255,0.7)",
        "inset 0 0 8px 1px rgba(255,255,255,0.55)",
        "inset -3px -3px 6px -3px rgba(0,0,0,0.15)",
      ].join(", ");
    case "none":
    default:
      return "";
  }
}

/** Versão atenuada do highlight (usado no keyframe de respiração). */
function buildInnerHighlightWeak(level: LiquidGlassInnerHighlight): string {
  switch (level) {
    case "soft":
      return "inset 0 1px 0 rgba(255,255,255,0.10)";
    case "normal":
      return [
        "inset 2px 2px 0 -2px rgba(255,255,255,0.40)",
        "inset 0 0 6px 1px rgba(255,255,255,0.12)",
      ].join(", ");
    case "strong":
      return [
        "inset 4px 4px 0 -4px rgba(255,255,255,0.50)",
        "inset 0 0 8px 1px rgba(255,255,255,0.22)",
      ].join(", ");
    case "apple":
      return [
        "inset 6px 6px 0 -6px rgba(255,255,255,0.55)",
        "inset 0 0 8px 1px rgba(255,255,255,0.38)",
        "inset -3px -3px 6px -3px rgba(0,0,0,0.10)",
      ].join(", ");
    case "none":
    default:
      return "";
  }
}

function hexWithAlpha(hex: string, alpha: number): string {
  // hex "#RRGGBB" ou "#RGB" → rgba()
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Liquid Glass — Apple iOS 26 calibration.
 */
export default function LiquidGlass({
  children,
  className = "",
  sx,
  preset,
  border,
  borderWidth,
  borderRadius,
  appleRound = false,
  brazilGlow,
  blurPx,
  saturate,
  brightness,
  displacement,
  minHeight,
  noPadding = false,
  glassAlpha,
  bgTint,
  innerHighlight,
  dropShadow,
  specular,
  breathing = false,
  containPaint,
}: LiquidGlassProps) {
  const p = preset ? PRESETS[preset] : null;

  // Resolve cada prop: explícita > preset > default fallback.
  const resolvedBorder: LiquidGlassBorder = border ?? p?.border ?? "green";
  const resolvedBorderWidth = borderWidth ?? p?.borderWidth ?? 1.5;
  const resolvedRadiusRaw = borderRadius ?? p?.borderRadius ?? "15px";
  const resolvedBlur = blurPx ?? p?.blurPx ?? 12;
  const resolvedSaturate = saturate ?? p?.saturate ?? 1.4;
  const resolvedBrightness = brightness ?? p?.brightness ?? 1.05;
  const resolvedDisplacement: LiquidGlassDisplacement =
    displacement ?? p?.displacement ?? false;
  const resolvedGlassAlpha = glassAlpha ?? p?.glassAlpha ?? 0.07;
  const resolvedBgTint = bgTint ?? p?.bgTint ?? "#FFFFFF";
  const resolvedInnerHighlight: LiquidGlassInnerHighlight =
    innerHighlight ?? p?.innerHighlight ?? "normal";
  const resolvedDropShadow: LiquidGlassDropShadow =
    dropShadow ?? p?.dropShadow ?? "none";
  const resolvedSpecular = specular ?? p?.specular ?? false;
  const resolvedBrazilGlow = brazilGlow ?? p?.brazilGlow ?? false;
  const resolvedContain = containPaint ?? p?.containPaint ?? false;

  // appleRound força radius generoso (24px) — opt-in por componente.
  const effectiveRadius = appleRound
    ? "24px"
    : typeof resolvedRadiusRaw === "number"
      ? `${resolvedRadiusRaw}px`
      : resolvedRadiusRaw;

  // Compõe backdrop-filter conforme spec §3.
  const displacementUrl =
    resolvedDisplacement === false
      ? ""
      : resolvedDisplacement.scale >= 60
        ? " url(#lg-displace-strong)"
        : resolvedDisplacement.scale >= 30
          ? " url(#lg-displace-medium)"
          : " url(#lg-displace-soft)";
  const backdrop = `blur(${resolvedBlur}px) saturate(${resolvedSaturate}) brightness(${resolvedBrightness})${displacementUrl}`;

  // Inner highlight + breathing animation.
  const baseHighlight = buildInnerHighlight(resolvedInnerHighlight);
  const weakHighlight = buildInnerHighlightWeak(resolvedInnerHighlight);

  // SX do painel interno (com o backdrop-filter aplicado).
  const innerSx: SxProps<Theme> = {
    position: "relative",
    zIndex: 1,
    borderRadius:
      resolvedBorder === "gradient-brazil"
        ? `calc(${effectiveRadius} - ${resolvedBorderWidth}px)`
        : effectiveRadius,
    minHeight,
    padding: noPadding ? 0 : undefined,
    backgroundColor: hexWithAlpha(resolvedBgTint, resolvedGlassAlpha),
    backdropFilter: backdrop,
    WebkitBackdropFilter: backdrop,
    boxShadow: baseHighlight || undefined,
    overflow: "hidden",
    transition: `box-shadow 240ms ${APPLE_EASE}, transform 160ms ${APPLE_EASE}`,
    ...(resolvedBorder === "green"
      ? { border: `${resolvedBorderWidth}px solid ${GLOW_GREEN}` }
      : resolvedBorder === "left-only"
        ? { borderLeft: `${resolvedBorderWidth}px solid ${GLOW_GREEN}` }
        : resolvedBorder === "none"
          ? { border: "none" }
          : {}),
    ...(resolvedContain ? { contain: "paint" } : {}),
    // Specular highlight (gota de luz diagonal canto superior-esquerdo).
    ...(resolvedSpecular
      ? {
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 35%)",
            pointerEvents: "none",
            mixBlendMode: "overlay",
            zIndex: 1,
          },
        }
      : {}),
    // Breathing animation — só se solicitada e sem reduce-motion.
    ...(breathing && baseHighlight
      ? {
          animation: `lg-breathe 6s ${APPLE_EASE} infinite`,
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
          "@keyframes lg-breathe": {
            "0%, 100%": { boxShadow: baseHighlight },
            "50%": { boxShadow: weakHighlight || baseHighlight },
          },
        }
      : {}),
    // Acessibilidade: fallback opaco quando o usuário pediu reduced-transparency.
    "@media (prefers-reduced-transparency: reduce)": {
      backgroundColor: "rgba(10, 17, 40, 0.96)",
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
    },
  };

  // Wrapper externo — recebe o drop-shadow (filter) para respeitar o recorte do glass.
  const wrapperFilter = buildDropShadowFilter(resolvedDropShadow);

  if (resolvedBorder === "gradient-brazil") {
    return (
      <Box
        className={className}
        sx={{
          position: "relative",
          borderRadius: effectiveRadius,
          padding: `${resolvedBorderWidth}px`,
          background: `linear-gradient(90deg, ${GLOW_GREEN} 0%, ${GLOW_YELLOW} 76.923%)`,
          filter: wrapperFilter || undefined,
          ...sx,
        }}
      >
        {resolvedBrazilGlow && <BrazilGlowLayer borderRadius={effectiveRadius} />}
        <Box sx={innerSx}>{children}</Box>
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        position: "relative",
        borderRadius: effectiveRadius,
        overflow: "hidden",
        filter: wrapperFilter || undefined,
        ...sx,
      }}
    >
      {resolvedBrazilGlow && <BrazilGlowLayer borderRadius={effectiveRadius} />}
      <Box sx={innerSx}>{children}</Box>
    </Box>
  );
}

function BrazilGlowLayer({ borderRadius }: { borderRadius: string }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        borderRadius,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: "-12%",
          top: "20%",
          width: "45%",
          height: "70%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GLOW_GREEN} 0%, ${GLOW_GREEN_LIGHT} 40%, transparent 70%)`,
          opacity: 0.32,
          filter: "blur(18px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: "-8%",
          top: "5%",
          width: "40%",
          height: "65%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GLOW_YELLOW} 0%, #F7B521 35%, transparent 72%)`,
          opacity: 0.28,
          filter: "blur(20px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "30%",
          bottom: "-20%",
          width: "50%",
          height: "50%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GLOW_GREEN} 0%, transparent 65%)`,
          opacity: 0.2,
          filter: "blur(16px)",
        }}
      />
    </Box>
  );
}

/** Orbs decorativos para dock inferior (posições do Figma — ellipses 9–14) */
export function BrazilDockGlow() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: "8%",
          bottom: "8%",
          width: 35,
          height: 20,
          borderRadius: "50%",
          bgcolor: GLOW_GREEN,
          opacity: 0.75,
          filter: "blur(14px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: "6%",
          top: "18%",
          width: 26,
          height: 24,
          borderRadius: "50%",
          bgcolor: GLOW_YELLOW,
          opacity: 0.7,
          filter: "blur(16px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "42%",
          bottom: "2%",
          width: 37,
          height: 16,
          borderRadius: "50%",
          background: `linear-gradient(90deg, ${GLOW_GREEN}, ${GLOW_YELLOW})`,
          opacity: 0.65,
          filter: "blur(18px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: "22%",
          bottom: "0%",
          width: 13,
          height: 12,
          borderRadius: "50%",
          bgcolor: GLOW_GREEN_LIGHT,
          opacity: 0.8,
          filter: "blur(10px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: "28%",
          bottom: "4%",
          width: 14,
          height: 12,
          borderRadius: "50%",
          bgcolor: GLOW_YELLOW,
          opacity: 0.85,
          filter: "blur(10px)",
        }}
      />
    </Box>
  );
}
