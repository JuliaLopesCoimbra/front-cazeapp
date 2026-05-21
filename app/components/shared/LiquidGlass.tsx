"use client";

import { Box, type SxProps, type Theme } from "@mui/material";
import { ReactNode } from "react";

export type LiquidGlassBorder = "none" | "green" | "gradient-brazil";

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
  /** Borda conforme Figma: verde 2px (caption) ou gradiente Brasil (tab ativa / destaque) */
  border?: LiquidGlassBorder;
  borderRadius?: string | number;
  /** Blobs verde/amarelo desfocados atrás do vidro — tema Copa Brasil */
  brazilGlow?: boolean;
  /** Intensidade do blur (px) */
  blurPx?: number;
  /** Altura mínima do painel de vidro */
  minHeight?: number | string;
  /** Padding interno; omitir quando children controlam layout */
  noPadding?: boolean;
  /** Opacidade do fundo vidro (0–1). Padrão Figma: 0.2 */
  glassAlpha?: number;
}

const GLOW_GREEN = "#009440";
const GLOW_YELLOW = "#FFCB00";
const GLOW_GREEN_LIGHT = "#31E46A";

/**
 * Liquid Glass — Figma node 1:2 (rgba(217,217,217,0.2) + backdrop blur + blobs Brasil).
 */
export default function LiquidGlass({
  children,
  className = "",
  sx,
  border = "green",
  borderRadius = "15px",
  brazilGlow = false,
  blurPx = 20,
  minHeight,
  noPadding = false,
  glassAlpha = 0.2,
}: LiquidGlassProps) {
  const radius = typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;
  const insetHighlight = Math.min(0.2, glassAlpha + 0.06);

  const innerSx: SxProps<Theme> = {
    position: "relative",
    zIndex: 1,
    borderRadius: border === "gradient-brazil" ? `calc(${radius} - 1px)` : radius,
    minHeight,
    padding: noPadding ? 0 : undefined,
    backgroundColor: `rgba(217, 217, 217, ${glassAlpha})`,
    backdropFilter: `blur(${blurPx}px) saturate(1.8) brightness(1.05)`,
    WebkitBackdropFilter: `blur(${blurPx}px) saturate(1.8) brightness(1.05)`,
    boxShadow:
      glassAlpha <= 0.12
        ? `inset 0 1px 0 rgba(255, 255, 255, ${insetHighlight})`
        : [
            `inset 0 1px 0 rgba(255, 255, 255, ${insetHighlight})`,
            "0 4px 24px rgba(0, 0, 0, 0.25)",
          ].join(", "),
    overflow: "hidden",
    ...(border === "green"
      ? { border: "2px solid #009440" }
      : border === "none"
        ? { border: "none" }
        : {}),
  };

  if (border === "gradient-brazil") {
    return (
      <Box
        className={className}
        sx={{
          position: "relative",
          borderRadius: radius,
          p: "1.5px",
          background: `linear-gradient(90deg, ${GLOW_GREEN} 0%, ${GLOW_YELLOW} 76.923%)`,
          ...sx,
        }}
      >
        {brazilGlow && <BrazilGlowLayer borderRadius={radius} />}
        <Box sx={innerSx}>{children}</Box>
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        position: "relative",
        borderRadius: radius,
        overflow: "hidden",
        ...sx,
      }}
    >
      {brazilGlow && <BrazilGlowLayer borderRadius={radius} />}
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
