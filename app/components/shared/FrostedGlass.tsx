"use client";

import { Box, type SxProps, type Theme } from "@mui/material";
import { ReactNode } from "react";

export interface FrostedGlassProps {
  children: ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
  borderRadius?: string | number;
  /** Blur do fundo atrás do painel */
  blurPx?: number;
  /** Opacidade do fill branco (0–1) */
  fillAlpha?: number;
  noPadding?: boolean;
}

/**
 * Vidro fosco (glassmorphism) — blur + tinte leve, sem reflexos fortes nem displacement.
 * Referência: cards “Apple Glass” / UI minimalista com backdrop-filter.
 */
export default function FrostedGlass({
  children,
  className = "",
  sx,
  borderRadius = 15,
  blurPx = 18,
  fillAlpha = 0.08,
  noPadding = false,
}: FrostedGlassProps) {
  const radius =
    typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;

  return (
    <Box
      className={className}
      sx={{
        position: "relative",
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: `rgba(255, 255, 255, ${fillAlpha})`,
        backdropFilter: `blur(${blurPx}px) saturate(1.2)`,
        WebkitBackdropFilter: `blur(${blurPx}px) saturate(1.2)`,
        border: "1px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
        padding: noPadding ? 0 : undefined,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
