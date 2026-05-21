"use client";

import { Box, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "./BottomNav";
import BrazilDivider from "./BrazilDivider";

interface SidebarProps {
  bolaoHasPendingBets?: boolean;
  stickersHasUnopened?: number;
}

const SIDEBAR_WIDTH = 240;

export default function Sidebar({
  bolaoHasPendingBets = false,
  stickersHasUnopened = 0,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getBadge = (path: string): number => {
    if (path === "/pages/user/bolao" && bolaoHasPendingBets) return 1;
    if (path === "/pages/user/figurinhas" && stickersHasUnopened > 0) return stickersHasUnopened;
    return 0;
  };

  return (
    <Box
      component="nav"
      aria-label="Navegação principal"
      sx={{
        display: { xs: "none", md: "flex" },
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: `${SIDEBAR_WIDTH}px`,
        backgroundColor: "#282828",
        borderRight: "1px solid rgba(0,148,64,0.25)",
        flexDirection: "column",
        zIndex: 1200,
      }}
    >
      {/* Logo + título no topo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 3,
        }}
      >
        <Image
          src="/assets/casa-cazetv/logo-circle.png"
          alt="Casa CazéTV"
          width={36}
          height={34}
          priority
          style={{ objectFit: "contain" }}
        />
        <Typography
          sx={{
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: 900,
            fontSize: "1rem",
            color: "#FFFFFF",
            letterSpacing: "0.01em",
          }}
        >
          Casa CazéTV
        </Typography>
      </Box>

      <BrazilDivider />

      {/* Lista de itens */}
      <Box sx={{ display: "flex", flexDirection: "column", py: 2 }}>
        {NAV_ITEMS.map((item, index) => {
          const isActive = pathname?.startsWith(item.path) ?? false;
          const Icon = isActive ? item.IconActive : item.IconInactive;
          const badgeCount = getBadge(item.path);

          return (
            <motion.button
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "glass-green" : undefined}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25, ease: "easeOut" }}
              whileHover={isActive ? undefined : { backgroundColor: "rgba(0,148,64,0.08)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 24px",
                borderLeft: isActive ? "4px solid #009440" : "4px solid transparent",
                color: isActive ? "#FFFFFF" : "#9E9E9E",
                cursor: "pointer",
                borderRight: "none",
                borderTop: "none",
                borderBottom: "none",
                textAlign: "left",
                width: "100%",
                transition: "background 0.2s ease, color 0.2s ease",
              }}
            >
              <Icon
                style={{
                  fontSize: 24,
                  color: isActive ? "#009440" : "#9E9E9E",
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontFamily: '"Montserrat", Arial, sans-serif',
                  fontWeight: 700,
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
                    minWidth: 20,
                    height: 20,
                    px: 0.75,
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
    </Box>
  );
}

export const SIDEBAR_WIDTH_PX = SIDEBAR_WIDTH;
