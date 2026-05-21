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

interface BottomNavProps {
  bolaoHasPendingBets?: boolean;
  stickersHasUnopened?: number;
  /** @deprecated — ignorado, mantido para compatibilidade com páginas legadas */
  activeColor?: string;
  /** @deprecated — ignorado, mantido para compatibilidade com páginas legadas */
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

  return (
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
        width: shrunk ? "55%" : "74%",
        maxWidth: 480,
        minWidth: 240,
        height: shrunk ? 48 : 60,
        backgroundColor: shrunk ? "rgba(40,40,40,0.85)" : "rgba(40,40,40,0.92)",
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        display: { xs: "flex", md: "none" },
        justifyContent: "space-around",
        alignItems: "center",
        borderRadius: "999px",
        border: "1px solid rgba(0,148,64,0.25)",
        boxShadow: shrunk
          ? "0 2px 12px rgba(0,0,0,0.4)"
          : "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,148,64,0.15)",
        zIndex: 9999,
        transition:
          "bottom 0.3s ease, width 0.3s ease, height 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
        touchAction: "none",
        overflow: "hidden",
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
                color: isActive ? "#009440" : "#9E9E9E",
                transition: "color 0.2s ease, padding 0.3s ease",
              }}
            >
              <Icon style={{ fontSize: iconSize, transition: "font-size 0.3s ease" }} />
            </motion.button>
          </Badge>
        );
      })}
    </Box>
  );
}
