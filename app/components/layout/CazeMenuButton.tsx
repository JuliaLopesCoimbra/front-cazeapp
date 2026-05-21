"use client";

import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface CazeMenuButtonProps {
  onClick: () => void;
  "aria-label"?: string;
}

/** Botão hamburger minimalista — ícone discreto, sem borda decorativa. */
export default function CazeMenuButton({
  onClick,
  "aria-label": ariaLabel = "Abrir menu",
}: CazeMenuButtonProps) {
  return (
    <IconButton
      onClick={onClick}
      aria-label={ariaLabel}
      disableRipple
      sx={{
        width: 32,
        height: 32,
        p: 0,
        color: "#9E9E9E",
        borderRadius: "8px",
        "&:hover": {
          color: "#FFFFFF",
          backgroundColor: "rgba(255, 255, 255, 0.06)",
        },
      }}
    >
      <MenuIcon sx={{ fontSize: 20 }} />
    </IconButton>
  );
}
