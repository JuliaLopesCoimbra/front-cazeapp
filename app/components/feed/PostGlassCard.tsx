"use client";

import { ReactNode } from "react";
import LiquidGlass from "@/app/components/shared/LiquidGlass";

interface PostGlassCardProps {
  children: ReactNode;
  className?: string;
  /** Borda verde sólida (Figma caption) ou gradiente Brasil */
  border?: "green" | "gradient-brazil";
  /** Blur do vidro — legenda sobre imagem usa valor baixo (ex.: 8) */
  blurPx?: number;
}

/** Wrapper Liquid Glass — Figma rgba(217,217,217,0.2) + blobs verde/amarelo */
export default function PostGlassCard({
  children,
  className = "",
  border = "green",
  blurPx = 18,
}: PostGlassCardProps) {
  return (
    <LiquidGlass
      className={className}
      border={border === "gradient-brazil" ? "gradient-brazil" : "green"}
      brazilGlow={false}
      blurPx={blurPx}
      noPadding
    >
      {children}
    </LiquidGlass>
  );
}
