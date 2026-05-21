"use client";

import { Button, CircularProgress } from "@mui/material";
import { ReactNode } from "react";

interface CazeButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit" | "reset";
  className?: string;
}

export default function CazeButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  fullWidth = false,
  variant = "primary",
  type = "button",
  className,
}: CazeButtonProps) {
  const styles = {
    primary: {
      backgroundColor: "#F5C900",
      color: "#000000",
      fontFamily: '"Montserrat", Arial, sans-serif',
      fontWeight: 700,
      "&:hover": { backgroundColor: "#D4A800" },
      "&:disabled": { backgroundColor: "#9E9E9E", color: "#1A1A1A" },
    },
    secondary: {
      backgroundColor: "transparent",
      color: "#0055B8",
      fontFamily: '"Montserrat", Arial, sans-serif',
      fontWeight: 700,
      border: "2px solid #0055B8",
      "&:hover": { borderColor: "#003E8A", color: "#003E8A", backgroundColor: "rgba(0,85,184,0.04)" },
      "&:disabled": { borderColor: "#9E9E9E", color: "#9E9E9E" },
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#FFFFFF",
      fontFamily: '"Montserrat", Arial, sans-serif',
      fontWeight: 600,
      textDecoration: "underline",
      "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
      "&:disabled": { color: "#9E9E9E" },
    },
  } as const;

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      className={className}
      sx={{
        ...styles[variant],
        borderRadius: "8px",
        textTransform: "none",
        fontSize: "0.9375rem",
        paddingY: "10px",
        paddingX: "24px",
        minHeight: "44px",
        position: "relative",
        transition: "all 0.2s ease",
      }}
    >
      {loading ? (
        <CircularProgress
          size={20}
          sx={{ color: variant === "primary" ? "#000" : "#F5C900" }}
        />
      ) : (
        children
      )}
    </Button>
  );
}
