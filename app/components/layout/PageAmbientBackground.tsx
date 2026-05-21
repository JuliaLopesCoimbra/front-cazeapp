"use client";

import { Box } from "@mui/material";
import { COLORS } from "@/app/constants/designTokens";

/**
 * Fundo fixo da Home — cor sólida apenas (sem círculo/gradiente decorativo).
 * O vidro fosco (PAGE_GLASS_SURFACE) fica no <main> por cima desta camada.
 */
export default function PageAmbientBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: COLORS.bg,
      }}
    />
  );
}
