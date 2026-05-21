"use client";

import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

interface StickerBubbleProps {
  color?: "pink" | "blue" | "yellow" | "green";
  size?: number;
  sx?: SxProps<Theme>;
  /** Desativar a animação de morphing */
  animated?: boolean;
}

const COLOR_MAP: Record<NonNullable<StickerBubbleProps["color"]>, string> = {
  pink:   "#FF6FAE",
  blue:   "#173BFF",
  yellow: "#F6C400",
  green:  "#009440",
};

/**
 * Bolha orgânica decorativa — blob com morphing CSS.
 * Usar como elemento de fundo/acento em telas de alto impacto.
 * aria-hidden sempre — apenas decoração.
 */
export default function StickerBubble({
  color = "yellow",
  size = 80,
  sx,
  animated = true,
}: StickerBubbleProps) {
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
        backgroundColor: COLOR_MAP[color],
        opacity: 0.18,
        pointerEvents: "none",
        flexShrink: 0,
        ...(animated && {
          animation: "stickerBlobMorph 10s ease-in-out infinite",
          "@keyframes stickerBlobMorph": {
            "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
            "25%":       { borderRadius: "40% 60% 70% 30% / 30% 70% 40% 60%" },
            "50%":       { borderRadius: "30% 60% 40% 70% / 70% 40% 60% 30%" },
            "75%":       { borderRadius: "70% 30% 60% 40% / 40% 60% 30% 70%" },
          },
        }),
        ...sx,
      }}
    />
  );
}
