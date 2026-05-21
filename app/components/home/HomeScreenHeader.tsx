"use client";

import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import BrazilDivider from "@/app/components/layout/BrazilDivider";
import HamburgerMenu from "@/app/components/layout/HamburgerMenu";
import HeaderMatchStrip from "@/app/components/home/HeaderMatchStrip";
import BrazilGradientAvatar from "@/app/components/shared/BrazilGradientAvatar";
import { EventResponse } from "@/app/services/events/eventAppService";
import type { ProfileResponse } from "@/app/services/profile/profileService";
import {
  COLORS,
  LAYOUT,
  PAGE_GLASS_SURFACE,
  SPACING,
  TYPOGRAPHY,
} from "@/app/constants/designTokens";

const HEADER_AVATAR_SRC = "/assets/figma/avatar-header.png";
const MASCOT_WIDTH = 76;
const MASCOT_HEIGHT = 42;
const ISLAND_ROW_HEIGHT = 36;
const PROFILE_ROW_HEIGHT = 48;
const MASCOT_ZONE = 22;
const AVATAR_SIZE = 40;

interface HomeScreenHeaderProps {
  events: EventResponse[];
  currentEvent: EventResponse;
  onSelectEvent: (event: EventResponse) => void;
  profile?: ProfileResponse | null;
}

/**
 * Cabeçalho — placar (linha 1), avatar + nome completo (linha 2), mascote.
 */
export default function HomeScreenHeader({
  events,
  currentEvent,
  onSelectEvent,
  profile,
}: HomeScreenHeaderProps) {
  const router = useRouter();
  const displayName = profile?.name?.trim() || profile?.email || "Visitante";

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
        pt: `${SPACING.md}px`,
        ...PAGE_GLASS_SURFACE,
        borderBottom: `1px solid rgba(255, 255, 255, 0.03)`,
        boxShadow: "0 1px 0 rgba(0, 148, 64, 0.06)",
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.green}1A 50%, transparent 100%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Box
        component="header"
        sx={{
          display: "flex",
          flexDirection: "column",
          px: `${LAYOUT.pagePaddingX}px`,
          mb: `${SPACING.sm}px`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: ISLAND_ROW_HEIGHT,
            flexShrink: 0,
          }}
        >
          <HeaderMatchStrip embedded />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: PROFILE_ROW_HEIGHT,
            gap: `${SPACING.sm}px`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: `${SPACING.md}px`,
              minWidth: 0,
              flex: 1,
            }}
          >
            <BrazilGradientAvatar
              size={AVATAR_SIZE}
              src={HEADER_AVATAR_SRC}
              alt={displayName}
              onClick={() => router.push("/pages/user/profile")}
            />
            <Typography
              onClick={() => router.push("/pages/user/profile")}
              sx={{
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                ...TYPOGRAPHY.bodyStrong,
                fontSize: 15,
                color: "#FFFFFF",
                cursor: "pointer",
                lineHeight: 1.25,
                minWidth: 0,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <HamburgerMenu
              events={events}
              currentEvent={currentEvent}
              onSelectEvent={onSelectEvent}
              triggerVariant="caze"
            />
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Image
              src="/assets/figma/logo-top.png"
              alt="Casa CazéTV"
              width={28}
              height={26}
              style={{ objectFit: "contain" }}
            />
          </Box>
        </Box>
      </Box>

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
            opacity: 0.5,
          }}
        >
          <BrazilDivider />
        </Box>
      </Box>
    </Box>
  );
}
