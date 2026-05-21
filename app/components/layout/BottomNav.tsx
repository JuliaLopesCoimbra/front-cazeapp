"use client";

import { Box, Badge } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import CollectionsIcon from "@mui/icons-material/Collections";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RAINBOW_GRADIENT_CSS } from "@/app/constants/rainbowGradient";
import RainbowGradientDefs from "@/app/components/shared/RainbowGradientDefs";
import { RAINBOW_ICON_GRADIENT_ID } from "@/app/constants/rainbowGradient";

interface BottomNavProps {
  bolaoHasPendingBets?: boolean;
  stickersHasUnopened?: number;
  activeColor?: string;
  eventId?: number;
}

export const NAV_ITEMS = [
  {
    label: "Home",
    path: "/pages/user/home",
    IconActive: HomeIcon,
    IconInactive: HomeOutlinedIcon,
  },
  {
    label: "Jogos",
    path: "/pages/user/jogos",
    IconActive: SportsSoccerIcon,
    IconInactive: SportsSoccerOutlinedIcon,
  },
  {
    label: "Bolão",
    path: "/pages/user/bolao",
    IconActive: EmojiEventsIcon,
    IconInactive: EmojiEventsOutlinedIcon,
  },
  {
    label: "Figurinhas",
    path: "/pages/user/figurinhas",
    IconActive: CollectionsIcon,
    IconInactive: CollectionsOutlinedIcon,
  },
  {
    label: "Perfil",
    path: "/pages/user/profile",
    IconActive: PersonIcon,
    IconInactive: PersonOutlinedIcon,
  },
] as const;

/** Navbar flutuante com borda arco-íris e ícone ativo em gradiente */
export default function BottomNav({
  bolaoHasPendingBets = false,
  stickersHasUnopened = 0,
}: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [shrunk, setShrunk] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current + 4) setShrunk(true);
      else if (currentY < lastScrollY.current - 4) setShrunk(false);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getBadge = (path: string) => {
    if (path === "/pages/user/bolao" && bolaoHasPendingBets) return 1;
    if (path === "/pages/user/figurinhas" && stickersHasUnopened > 0) return stickersHasUnopened;
    return 0;
  };

  const dockWidth = shrunk ? "min(72%, 320px)" : "min(74%, 360px)";
  const dockHeight = shrunk ? 48 : 60;

  return (
    <>
      <RainbowGradientDefs />
      <Box
        role="navigation"
        aria-label="Navegação principal"
        sx={{
          position: "fixed",
          bottom: shrunk
            ? "calc(env(safe-area-inset-bottom) + 20px)"
            : "calc(env(safe-area-inset-bottom) + 32px)",
          left: "50%",
          transform: "translateX(-50%)",
          width: dockWidth,
          maxWidth: 480,
          minWidth: 240,
          p: "2px",
          borderRadius: "999px",
          background: RAINBOW_GRADIENT_CSS,
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.45)",
          zIndex: 9999,
          touchAction: "none",
          transition: "bottom 0.3s ease, width 0.3s ease",
          display: { xs: "block", md: "none" },
        }}
      >
        <Box
          sx={{
            height: dockHeight,
            borderRadius: "999px",
            backgroundColor: "#363636",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            px: 1,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.path) ?? false;
            const badgeCount = getBadge(item.path);
            const Icon = isActive ? item.IconActive : item.IconInactive;
            const iconSize = isActive ? (shrunk ? 22 : 26) : shrunk ? 18 : 22;

            return (
              <Badge
                key={item.path}
                badgeContent={badgeCount || undefined}
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#E52554",
                    color: "#fff",
                    fontSize: "10px",
                    minWidth: "16px",
                    height: "16px",
                    top: 4,
                    right: 4,
                  },
                }}
              >
                <motion.button
                  type="button"
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => router.push(item.path)}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: shrunk ? "6px" : "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: iconSize,
                      color: isActive ? "transparent" : "#9E9E9E",
                      ...(isActive && {
                        "& path": {
                          fill: `url(#${RAINBOW_ICON_GRADIENT_ID})`,
                        },
                      }),
                    }}
                  />
                </motion.button>
              </Badge>
            );
          })}
        </Box>
      </Box>
    </>
  );
}
