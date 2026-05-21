"use client";

import { Box } from "@mui/material";
import { COLORS } from "@/app/constants/designTokens";

/**
 * Camada base fixa da Home — #282828 + manchas sutis (sem foto de gramado).
 * O vidro fosco fica no <main>; esta camada fica por baixo do blur.
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
        overflow: "hidden",
        backgroundColor: COLORS.bg,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-12%",
          right: "-8%",
          width: "55%",
          height: "38%",
          background: `radial-gradient(ellipse, rgba(0, 148, 64, 0.12) 0%, transparent 68%)`,
          filter: "blur(48px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "8%",
          left: "-10%",
          width: "48%",
          height: "32%",
          background: `radial-gradient(ellipse, rgba(255, 203, 0, 0.07) 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 120% 80% at 50% 100%, rgba(0, 0, 0, 0.12) 0%, transparent 55%)`,
        }}
      />
    </Box>
  );
}
