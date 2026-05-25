"use client";

import { Box, Drawer, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "./BottomNav";
import BrazilDivider from "./BrazilDivider";
import LogoutButton from "@/app/components/auth/LogoutButton";
import RainbowGradientDefs from "@/app/components/shared/RainbowGradientDefs";
import { RAINBOW_GRADIENT_CSS } from "@/app/constants/rainbowGradient";
import { useMobileMenu } from "@/app/context/MobileMenuContext";

interface SidebarProps {
  bolaoHasPendingBets?: boolean;
  stickersHasUnopened?: number;
}

const SIDEBAR_WIDTH = 200;
const MOBILE_DRAWER_WIDTH = 236;

export default function Sidebar({
  bolaoHasPendingBets = false,
  stickersHasUnopened = 0,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMenuOpen, setMenuOpen } = useMobileMenu();

  const getBadge = (path: string): number => {
    if (path === "/pages/user/bolao" && bolaoHasPendingBets) return 1;
    if (path === "/pages/user/figurinhas" && stickersHasUnopened > 0) return stickersHasUnopened;
    return 0;
  };

  const isNavActive = (path: string): boolean => {
    if (path === "/pages/user/bolao/ranking") {
      return pathname?.startsWith("/pages/user/bolao") ?? false;
    }
    return pathname?.startsWith(path) ?? false;
  };

  const navContent = (isMobileDrawer = false) => (
    <>
      {/* Logo + título no topo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 2.25 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
          <Image
            src="/assets/figma/logo-top.png"
            alt="Casa CazéTV"
            width={36}
            height={34}
            priority
            style={{ objectFit: "contain" }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: '"Montserrat", Arial, sans-serif',
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "#FFFFFF",
                letterSpacing: "0.01em",
                lineHeight: 1.1,
              }}
            >
              Casa CazéTV
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.46)",
                fontSize: "0.68rem",
                fontWeight: 500,
                mt: 0.25,
              }}
            >
              Copa 2026
            </Typography>
          </Box>
        </Box>

        {isMobileDrawer && (
          <IconButton
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            sx={{
              color: "#FFFFFF",
              bgcolor: "rgba(255,255,255,0.08)",
              width: 34,
              height: 34,
              "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      <BrazilDivider />

      {/* Lista de itens */}
      <Box sx={{ display: "flex", flexDirection: "column", py: 2.25, gap: 1 }}>
        {NAV_ITEMS.map((item, index) => {
          const isActive = isNavActive(item.path);
          const Icon = isActive ? item.IconActive : item.IconInactive;
          const badgeCount = getBadge(item.path);

          return (
            <motion.button
              key={item.path}
              type="button"
              onClick={() => { router.push(item.path); setMenuOpen(false); }}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              initial={{ opacity: 0, x: isMobileDrawer ? 16 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
              whileHover={isActive ? undefined : { backgroundColor: "rgba(255,255,255,0.07)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "13px 14px",
                margin: "0 12px",
                borderRadius: 16,
                borderLeft: !isMobileDrawer && isActive ? "3px solid #0055B8" : "3px solid transparent",
                borderRight: isMobileDrawer && isActive ? "3px solid #0055B8" : "3px solid transparent",
                background: isActive
                  ? "linear-gradient(135deg, rgba(0,85,184,0.92), rgba(0,85,184,0.66))"
                  : "transparent",
                boxShadow: isActive ? "inset 0 0 0 1px rgba(255,255,255,0.12)" : "none",
                color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                cursor: "pointer",
                borderTop: "none",
                borderBottom: "none",
                textAlign: "left",
                width: "calc(100% - 24px)",
                transition: "background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <Icon
                sx={{
                  fontSize: 24,
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontFamily: '"Montserrat", Arial, sans-serif',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "0.875rem",
                  color: "inherit",
                  flex: 1,
                }}
              >
                {item.label}
              </Typography>
              {badgeCount > 0 && (
                <Box
                  component="span"
                  sx={{
                    minWidth: 20, height: 20, px: 0.75,
                    borderRadius: "999px",
                    backgroundColor: "#E52554",
                    color: "#FFFFFF",
                    fontSize: "0.6875rem",
                    fontFamily: '"Montserrat", Arial, sans-serif',
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {badgeCount}
                </Box>
              )}
            </motion.button>
          );
        })}
      </Box>

      <Box sx={{ mt: "auto", pt: 1.5, pb: 1.75 }}>
        <LogoutButton variant="sidebar" />
      </Box>

      <Box
        sx={{
          mx: 2, mb: 2, mt: 0, height: 2, borderRadius: 1,
          backgroundImage: RAINBOW_GRADIENT_CSS, opacity: 0.85,
        }}
        aria-hidden
      />
    </>
  );

  return (
    <>
      <RainbowGradientDefs />

      {/* Desktop sidebar */}
      <Box
        component="nav"
        aria-label="Navegação principal"
        sx={{
          display: { xs: "none", md: "flex" },
          position: "fixed",
          left: 0, top: 0, bottom: 0,
          width: `${SIDEBAR_WIDTH}px`,
          backgroundColor: "#0A1128",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          flexDirection: "column",
          zIndex: 1200,
        }}
      >
        {navContent(false)}
      </Box>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
        PaperProps={{
          sx: {
            width: `${MOBILE_DRAWER_WIDTH}px`,
            background:
              "linear-gradient(180deg, rgba(10,17,40,0.98), rgba(15,23,42,0.98))",
            borderLeft: "1px solid rgba(255,255,255,0.10)",
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "-18px 0 40px rgba(0,0,0,0.42)",
          },
        }}
      >
        {navContent(true)}
      </Drawer>
    </>
  );
}

export const SIDEBAR_WIDTH_PX = SIDEBAR_WIDTH;
