"use client";

import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import BrazilDivider from "./BrazilDivider";
import { useMobileMenu } from "@/app/context/MobileMenuContext";

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
  /** Quando true, usa fundo branco com texto/ícones escuros. */
  light?: boolean;
}

export default function TopBar({
  title,
  showBack = false,
  onBack,
  rightSlot,
  hideDivider = false,
  light = false,
}: TopBarProps) {
  const router = useRouter();
  const { setMenuOpen } = useMobileMenu();

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
          backgroundColor: light ? "#FFFFFF" : "#0A1128",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: light
            ? "0 1px 0 rgba(0,0,0,0.08)"
            : "0 1px 0 rgba(255,255,255,0.06)",
          borderBottom: light ? "none" : "1px solid rgba(255,255,255,0.08)",
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
              sx={{ color: light ? "#0A0A0A" : "#FFFFFF", padding: "8px" }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 20 }} />
            </IconButton>
          ) : (
            <Image
              src="/assets/figma/logo-top.png"
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
                color: light ? "#0A0A0A" : "#FFFFFF",
                letterSpacing: "0.02em",
              }}
            >
              {title}
            </Typography>
          ) : (
            <Image
              src="/assets/figma/mascot-center.png"
              alt="Mascote Casa CazéTV"
              width={89}
              height={50}
              priority
              style={{ objectFit: "contain" }}
            />
          )}
        </Box>

        {/* Lado direito: slot livre + hambúrguer mobile */}
        <Box
          sx={{
            width: 80,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            pr: 0.5,
            gap: 0.25,
          }}
        >
          {rightSlot}
          <IconButton
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
            sx={{
              color: light ? "#0A0A0A" : "#FFFFFF",
              padding: "8px",
              display: { xs: "flex", md: "none" },
            }}
          >
            <MenuIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
      </Box>

      {!hideDivider && <BrazilDivider />}
    </Box>
  );
}
