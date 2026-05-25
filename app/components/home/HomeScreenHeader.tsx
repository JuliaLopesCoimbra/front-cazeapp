"use client";

import { Box, IconButton, Typography } from "@mui/material";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BrazilDivider from "@/app/components/layout/BrazilDivider";
import BrazilGradientAvatar from "@/app/components/shared/BrazilGradientAvatar";
import { EventResponse } from "@/app/services/events/eventAppService";
import type { ProfileResponse } from "@/app/services/profile/profileService";
import { COLORS, LAYOUT, SPACING } from "@/app/constants/designTokens";
import { useMobileMenu } from "@/app/context/MobileMenuContext";
import MenuIcon from "@mui/icons-material/Menu";

const HEADER_AVATAR_SRC = "/assets/figma/avatar-header.png";
const HEADER_CENTER_LOGO_SRC = "/assets/casa-cazetv/caz%C3%A9%20-%20tm1.png";
const MASCOT_WIDTH = 76;
const MASCOT_HEIGHT = 42;
const MASCOT_ZONE = 20;
const AVATAR_SIZE = 32;

interface HomeScreenHeaderProps {
  events: EventResponse[];
  currentEvent: EventResponse;
  onSelectEvent: (event: EventResponse) => void;
  profile?: ProfileResponse | null;
}

export default function HomeScreenHeader({
  events: _events,
  currentEvent: _currentEvent,
  onSelectEvent: _onSelectEvent,
  profile,
}: HomeScreenHeaderProps) {
  const router = useRouter();
  const { setMenuOpen } = useMobileMenu();
  const displayName = profile?.name?.trim() || profile?.email || "Visitante";
  const firstName = displayName.split(" ")[0];

  return (
    <Box
      component={motion.div}
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        isolation: "isolate",
        pt: `${SPACING.sm}px`,
        backgroundColor: COLORS.surface,
      }}
    >
      {/* ── Linha única: avatar+saudação | placar | hambúrguer ── */}
      <Box
        component="header"
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          px: `${LAYOUT.pagePaddingX}px`,
          minHeight: 46,
          mb: `${SPACING.xs}px`,
        }}
      >
        {/* Coluna esquerda — Avatar + "Olá, nome" */}
        <Box
          role="button"
          tabIndex={0}
          aria-label="Ir para perfil"
          onClick={() => router.push("/pages/user/profile")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") router.push("/pages/user/profile");
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.75,
            cursor: "pointer",
            width: "fit-content",
            background: "none",
            border: "none",
            p: 0,
          }}
        >
          <BrazilGradientAvatar
            size={AVATAR_SIZE}
            src={HEADER_AVATAR_SRC}
            alt={firstName}
          />
          <Typography
            sx={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 11,
              fontWeight: 500,
              color: COLORS.muted,
              lineHeight: 1,
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            Olá, {firstName}
          </Typography>
        </Box>

        {/* Coluna central — logo Casa CazéTV */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            lineHeight: 0,
            transform: "translateY(-4px)",
          }}
        >
          <Image
            src={HEADER_CENTER_LOGO_SRC}
            alt="Casa CazéTV"
            width={76}
            height={76}
            priority
            unoptimized
            style={{
              display: "block",
              objectFit: "contain",
            }}
          />
        </Box>

        {/* Coluna direita — hambúrguer (mobile) / logo (desktop) */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <IconButton
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
            sx={{ color: COLORS.muted, padding: "8px", display: { xs: "flex", md: "none" } }}
          >
            <MenuIcon sx={{ fontSize: 22 }} />
          </IconButton>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            <Image
              src="/assets/figma/logo-top.png"
              alt="Casa CazéTV"
              width={24}
              height={22}
              style={{ objectFit: "contain" }}
            />
          </Box>
        </Box>
      </Box>

      {/* Mascote + BrazilDivider */}
      <Box
        sx={{
          position: "relative",
          height: MASCOT_ZONE,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            transform: "translate(-50%, 50%)",
            zIndex: 3,
            lineHeight: 0,
          }}
        >
          <Image
            src="/assets/figma/mascot-center.png"
            alt="Mascote Casa CazéTV"
            width={MASCOT_WIDTH}
            height={MASCOT_HEIGHT}
            priority
            style={{ objectFit: "contain", display: "block" }}
          />
        </Box>
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
          }}
        >
          <BrazilDivider />
        </Box>
      </Box>
    </Box>
  );
}
