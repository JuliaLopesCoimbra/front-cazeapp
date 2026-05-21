"use client";

import { Box } from "@mui/material";
import Image from "next/image";
import { motion } from "framer-motion";
import BrazilDivider from "@/app/components/layout/BrazilDivider";
import HamburgerMenu from "@/app/components/layout/HamburgerMenu";
import { EventResponse } from "@/app/services/events/eventAppService";

const MASCOT_WIDTH = 89;
const MASCOT_HEIGHT = 50;

interface HomeScreenHeaderProps {
  events: EventResponse[];
  currentEvent: EventResponse;
  onSelectEvent: (event: EventResponse) => void;
}

/**
 * Cabeçalho da home — Figma: logo + hamburger, mascote sobre a linha Brasil, sem divider duplicado abaixo.
 */
export default function HomeScreenHeader({
  events,
  currentEvent,
  onSelectEvent,
}: HomeScreenHeaderProps) {
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
        backgroundColor: "#282828",
      }}
    >
      {/* Linha superior: logo | hamburger (mobile) */}
      <Box
        component="header"
        sx={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: "22px",
        }}
      >
        <Image
          src="/assets/figma/logo-top.png"
          alt="Casa CazéTV"
          width={32}
          height={30}
          priority
          style={{ objectFit: "contain" }}
        />

        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
          }}
        >
          <HamburgerMenu
            events={events}
            currentEvent={currentEvent}
            onSelectEvent={onSelectEvent}
            triggerVariant="caze"
          />
        </Box>

        {/* Espaço simétrico no desktop (sidebar cobre navegação) */}
        <Box sx={{ width: 32, display: { xs: "none", md: "block" } }} aria-hidden />
      </Box>

      {/* Mascote centralizado sobre a linha divisória Brasil */}
      <Box
        sx={{
          position: "relative",
          height: 28,
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
