"use client";

import { ReactNode } from "react";
import LiquidGlass from "@/app/components/shared/LiquidGlass";

interface PostGlassCardProps {
  children: ReactNode;
  className?: string;
  /** Preset Apple iOS 26 — header strip ou caption overlay sobre imagem */
  variant?: "header" | "caption-overlay";
  /** Override de borda — gradiente Brasil é o default Apple-fidelity */
  border?: "green" | "gradient-brazil";
  /** Override de blur (não passar para herdar do preset Apple-calibrado) */
  blurPx?: number;
}

/**
 * Wrapper Liquid Glass com calibração Apple iOS 26.
 * Por default usa preset `post-caption-overlay` (drop-shadow direcional + inner highlight Apple + specular).
 * Passe `variant="header"` para usar `post-header` (calibração mais sutil).
 */
export default function PostGlassCard({
  children,
  className = "",
  variant = "caption-overlay",
  border,
  blurPx,
}: PostGlassCardProps) {
  return (
    <LiquidGlass
      className={className}
      preset={variant === "header" ? "post-header" : "post-caption-overlay"}
      border={border ?? "gradient-brazil"}
      blurPx={blurPx}
      noPadding
    >
      {children}
    </LiquidGlass>
  );
}
