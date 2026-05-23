"use client";

import { Badge } from "@mui/material";
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
import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import FrostedGlass from "@/app/components/shared/FrostedGlass";
import { NAV_DOCK_GLASS, COLORS } from "@/app/constants/designTokens";
import { useMobileMenu } from "@/app/context/MobileMenuContext";

/** Abaixo do Drawer do menu (1400) e da sidebar desktop (1200) */
const BOTTOM_NAV_Z_INDEX = 1100;

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
    path: "/pages/user/bolao/ranking",
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

/** Scroll (px) até compactação total */
const SCROLL_COMPACT_RANGE = 120;

const SPRING = { stiffness: 400, damping: 32, mass: 0.32 };

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function useCompactMotion(scrollY: ReturnType<typeof useMotionValue<number>>) {
  const target = useTransform(scrollY, (y) => {
    const t = Math.min(1, Math.max(0, y / SCROLL_COMPACT_RANGE));
    return easeOutCubic(t);
  });
  return useSpring(target, SPRING);
}

/** Navbar flutuante — encolhe e aproxima ícones conforme o scroll */
export default function BottomNav({
  bolaoHasPendingBets = false,
  stickersHasUnopened = 0,
}: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMenuOpen } = useMobileMenu();
  const scrollY = useMotionValue(0);
  const compact = useCompactMotion(scrollY);

  useEffect(() => {
    const onScroll = () => scrollY.set(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollY]);

  const dockHeight = useTransform(compact, [0, 1], [58, 40]);
  const dockMaxWidth = useTransform(compact, [0, 1], [400, 268]);
  const dockMinWidth = useTransform(compact, [0, 1], [280, 220]);
  const dockWidthPercent = useTransform(compact, [0, 1], [86, 68]);
  const bottomOffset = useTransform(compact, [0, 1], [24, 10]);
  const dockScale = useTransform(compact, [0, 1], [1, 0.94]);
  const itemGap = useTransform(compact, [0, 1], [22, 6]);
  const dockPaddingX = useTransform(compact, [0, 1], [22, 10]);
  const activeSlot = useTransform(compact, [0, 1], [44, 30]);
  const iconScale = useTransform(compact, [0, 1], [1, 0.82]);
  const activeRadius = useTransform(compact, [0, 1], [12, 9]);

  const bottom = useTransform(
    bottomOffset,
    (v) => `calc(env(safe-area-inset-bottom) + ${v}px)`
  );
  const width = useTransform(dockWidthPercent, (p) => `${p}%`);

  const getBadge = (path: string) => {
    if (path === "/pages/user/bolao/ranking" && bolaoHasPendingBets) return 1;
    if (path === "/pages/user/figurinhas" && stickersHasUnopened > 0)
      return stickersHasUnopened;
    return 0;
  };

  return (
    <motion.nav
      role="navigation"
      aria-label="Navegação principal"
      aria-hidden={isMenuOpen}
      className="block md:hidden"
      initial={false}
      animate={{
        opacity: isMenuOpen ? 0 : 1,
        y: isMenuOpen ? 16 : 0,
      }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        bottom,
        left: "50%",
        x: "-50%",
        width,
        maxWidth: dockMaxWidth,
        minWidth: dockMinWidth,
        scale: dockScale,
        zIndex: BOTTOM_NAV_Z_INDEX,
        touchAction: "none",
        pointerEvents: isMenuOpen ? "none" : "auto",
        visibility: isMenuOpen ? "hidden" : "visible",
      }}
    >
      <FrostedGlass
        borderRadius={999}
        blurPx={NAV_DOCK_GLASS.blurPx}
        fillAlpha={0.04}
        noPadding
        sx={{
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.90)",
          backdropFilter: `blur(${NAV_DOCK_GLASS.blurPx}px) saturate(1.2)`,
          WebkitBackdropFilter: `blur(${NAV_DOCK_GLASS.blurPx}px) saturate(1.2)`,
          border: "1px solid rgba(0,0,0,0.09)",
          boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        <motion.div
          style={{
            height: dockHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: itemGap,
            paddingLeft: dockPaddingX,
            paddingRight: dockPaddingX,
          }}
        >
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === "/pages/user/bolao/ranking"
            ? (pathname?.startsWith("/pages/user/bolao") ?? false)
            : (pathname?.startsWith(item.path) ?? false);
          const badgeCount = getBadge(item.path);
          const Icon = isActive ? item.IconActive : item.IconInactive;

          return (
            <Badge
              key={item.path}
              variant={badgeCount === 1 ? "dot" : "standard"}
              badgeContent={badgeCount > 1 ? badgeCount : undefined}
              invisible={badgeCount === 0}
              overlap="circular"
              sx={{
                flexShrink: 0,
                "& .MuiBadge-badge": {
                  backgroundColor: "#E52554",
                  color: "#fff",
                  fontSize: badgeCount > 1 ? "9px" : undefined,
                  minWidth: badgeCount > 1 ? 14 : 8,
                  height: badgeCount > 1 ? 14 : 8,
                  width: badgeCount > 1 ? undefined : 8,
                  borderRadius: "50%",
                  top: 5,
                  right: 5,
                  border: "1.5px solid #e4d2b7",
                },
              }}
            >
              <motion.button
                type="button"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => router.push(item.path)}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 480, damping: 22 }}
                style={{
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: activeSlot,
                  height: activeSlot,
                  borderRadius: activeRadius,
                  background: isActive
                    ? COLORS.yellow
                    : "transparent",
                }}
              >
                <motion.span
                  style={{
                    display: "inline-flex",
                    scale: iconScale,
                    lineHeight: 0,
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 24,
                      color: isActive ? COLORS.black : COLORS.muted,
                    }}
                  />
                </motion.span>
              </motion.button>
            </Badge>
          );
        })}
        </motion.div>
      </FrostedGlass>
    </motion.nav>
  );
}
