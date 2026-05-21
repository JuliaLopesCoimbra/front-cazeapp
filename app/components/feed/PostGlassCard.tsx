"use client";

import { ReactNode } from "react";

interface PostGlassCardProps {
  children: ReactNode;
  /**
   * Classes adicionais aplicadas no container externo (borda gradiente).
   * Útil para posicionamento absoluto (ex.: "absolute bottom-3 left-3").
   */
  className?: string;
}

/**
 * Card com efeito Liquid Glass + borda gradiente do Brasil (verde-amarelo-verde).
 *
 * Estrutura em 2 camadas:
 *  1. Container externo: gradiente do Brasil com `p-[1.5px]` cria a borda fina.
 *  2. Container interno: fundo azul-marinho semi-transparente com `backdrop-blur-lg`
 *     simula a refração de luz; borda branca sutil + shadow interno reforçam o vidro.
 *
 * Visual de referência: caption "Valendo um total de ZERO reais e..." do Figma Casa CazéTV.
 */
export default function PostGlassCard({ children, className = "" }: PostGlassCardProps) {
  return (
    <div
      className={[
        "rounded-[15px]",
        "p-[1.5px]",
        "bg-gradient-to-r from-[#009440] via-[#FFCB00] to-[#009440]",
        "shadow-2xl shadow-black/50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "rounded-[14px]",
          "backdrop-blur-lg",
          "bg-[#172554]/40",
          "border border-white/10",
          // shadow interno simula reflexo de luz no topo do vidro
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
          "overflow-hidden",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
