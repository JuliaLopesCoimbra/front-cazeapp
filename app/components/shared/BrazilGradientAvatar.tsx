"use client";

import { Avatar, Box } from "@mui/material";

const BRASIL_BORDER_GRADIENT =
  "linear-gradient(90deg, #009440 0%, #FFCB00 76.923%)";

interface BrazilGradientAvatarProps {
  src?: string | null;
  alt?: string;
  /** Diâmetro da foto (sem a borda) */
  size?: number;
  fallbackLetter?: string;
  onClick?: () => void;
}

export default function BrazilGradientAvatar({
  src,
  alt = "",
  size = 40,
  fallbackLetter,
  onClick,
}: BrazilGradientAvatarProps) {
  const ring = 2.5;

  return (
    <Box
      onClick={onClick}
      sx={{
        flexShrink: 0,
        p: `${ring}px`,
        borderRadius: "50%",
        background: BRASIL_BORDER_GRADIENT,
        display: "inline-flex",
        cursor: onClick ? "pointer" : "default",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Avatar
        src={src || undefined}
        alt={alt}
        sx={{
          width: size,
          height: size,
          bgcolor: "#363636",
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontWeight: 700,
          fontSize: size * 0.38,
        }}
      >
        {fallbackLetter}
      </Avatar>
    </Box>
  );
}
