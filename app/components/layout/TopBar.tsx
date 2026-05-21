"use client";

import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import BrazilDivider from "./BrazilDivider";

interface TopBarProps {
  /** Quando definido, substitui o mascote central por um título em texto. */
  title?: string;
  /** Mostra o botão de voltar à esquerda no lugar do logo. */
  showBack?: boolean;
  onBack?: () => void;
  /** Slot livre à direita (notificações, perfil etc.). */
  rightSlot?: React.ReactNode;
  /** Quando true, esconde o BrazilDivider abaixo. */
  hideDivider?: boolean;
}

export default function TopBar({
  title,
  showBack = false,
  onBack,
  rightSlot,
  hideDivider = false,
}: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <Box
      component={motion.div}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      <Box
        component="header"
        sx={{
          backgroundColor: "#282828",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Lado esquerdo: logo Casa CazéTV ou botão voltar */}
        <Box
          sx={{
            width: 80,
            display: "flex",
            alignItems: "center",
            pl: showBack ? 1 : "22px",
          }}
        >
          {showBack ? (
            <IconButton
              aria-label="Voltar"
              onClick={handleBack}
              sx={{ color: "#FFFFFF", padding: "8px" }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 20 }} />
            </IconButton>
          ) : (
            <Image
              src="/assets/casa-cazetv/logo-circle.png"
              alt="Casa CazéTV"
              width={32}
              height={30}
              priority
              style={{ objectFit: "contain" }}
            />
          )}
        </Box>

        {/* Centro: mascote ou título */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
              src="/assets/casa-cazetv/mascot-center.png"
              alt="Mascote Casa CazéTV"
              width={89}
              height={50}
              priority
              style={{ objectFit: "contain" }}
            />
          )}
        </Box>

        {/* Lado direito: slot livre */}
        <Box
          sx={{
            width: 80,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            pr: 1,
          }}
        >
          {rightSlot}
        </Box>
      </Box>

      {!hideDivider && <BrazilDivider />}
    </Box>
  );
}
