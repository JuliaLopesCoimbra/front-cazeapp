"use client";

import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
}

export default function TopBar({ title, showBack = false, onBack, rightSlot }: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        backgroundColor: "#000000",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1,
        borderBottom: "1px solid rgba(245,201,0,0.1)",
      }}
    >
      <Box sx={{ width: 40, display: "flex", alignItems: "center" }}>
        {showBack && (
          <IconButton
            aria-label="Voltar"
            onClick={handleBack}
            sx={{ color: "#FFFFFF", padding: "8px" }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        {title ? (
          <Typography
            sx={{
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontWeight: 700,
              fontSize: "1rem",
              color: "#FFFFFF",
              letterSpacing: "0.02em",
            }}
          >
            {title}
          </Typography>
        ) : (
          <Image
            src="/assets/cazetv-logo-white.svg"
            alt="Casa CazéTV"
            width={120}
            height={32}
            priority
            style={{ objectFit: "contain" }}
          />
        )}
      </Box>

      <Box sx={{ width: 40, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        {rightSlot}
      </Box>
    </Box>
  );
}
