"use client";

import { Box } from "@mui/material";
import { COLORS } from "@/app/constants/designTokens";

/**
 * Fundo fixo da Home — cor sólida + textura esportiva sutil (4% opacidade).
 * A textura é um grid de pontos que evoca gramado/iluminação de estádio.
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
        /* Mancha quente no canto inferior-direito */
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: [
            "radial-gradient(ellipse at 88% 92%, rgba(228, 210, 183, 0.55) 0%, transparent 45%)",
            "radial-gradient(ellipse at 12% 8%,  rgba(228, 210, 183, 0.30) 0%, transparent 38%)",
          ].join(", "),
          pointerEvents: "none",
        },
        /* Grid de pontos esportivo */
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(0, 148, 64, 0.16) 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
          opacity: 0.20,
          pointerEvents: "none",
        },
      }}
    />
  );
}
