"use client";

import { Button, ListItemButton, Typography } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

type LogoutButtonVariant = "profile" | "sidebar" | "menu";

interface LogoutButtonProps {
  variant?: LogoutButtonVariant;
  fullWidth?: boolean;
  onAfterLogout?: () => void;
}

export default function LogoutButton({
  variant = "profile",
  fullWidth = true,
  onAfterLogout,
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    onAfterLogout?.();
    router.replace("/");
  };

  if (variant === "menu") {
    return (
      <ListItemButton
        onClick={handleLogout}
        sx={{
          justifyContent: "center",
          gap: 1,
          color: "#FFCB00",
          borderRadius: "12px",
          mx: 1,
          "&:hover": {
            backgroundColor: "rgba(255, 203, 0, 0.1)",
          },
        }}
      >
        <LogoutIcon fontSize="small" />
        <Typography fontSize={14} fontWeight={600}>
          Sair
        </Typography>
      </ListItemButton>
    );
  }

  if (variant === "sidebar") {
    return (
      <Button
        variant="outlined"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{
          width: "calc(100% - 32px)",
          mx: 2,
          mb: 0,
          color: "#FFCB00",
          borderColor: "rgba(255, 203, 0, 0.40)",
          borderRadius: "999px",
          textTransform: "none",
          fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
          fontWeight: 600,
          fontSize: "0.78rem",
          minHeight: 38,
          py: 0.75,
          bgcolor: "rgba(0,85,184,0.10)",
          boxShadow: "inset 0 0 0 1px rgba(0,85,184,0.16)",
          "& .MuiButton-startIcon": {
            mr: 0.75,
            "& svg": { fontSize: 16 },
          },
          "&:hover": {
            borderColor: "rgba(255, 203, 0, 0.72)",
            backgroundColor: "rgba(0,85,184,0.22)",
          },
        }}
      >
        Sair
      </Button>
    );
  }

  return (
    <Button
      fullWidth={fullWidth}
      variant="outlined"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
      sx={{
        mt: 2,
        color: "#E52554",
        borderColor: "rgba(229, 37, 84, 0.55)",
        borderRadius: "12px",
        textTransform: "none",
        fontFamily: 'var(--font-syne), Syne, sans-serif',
        fontWeight: 600,
        fontSize: "0.9375rem",
        py: 1.25,
        "&:hover": {
          borderColor: "#E52554",
          backgroundColor: "rgba(229, 37, 84, 0.1)",
        },
      }}
    >
      Sair da conta
    </Button>
  );
}
