"use client";

import { Box, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredEventBrandKey } from "@/app/utils/eventBranding";

interface BottomNavProps {
  activeColor?: string;
}

export default function BottomNav({ activeColor = "#ffc91f" }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const LAST_PATH_KEY = "bottomNavLastPath";
  const [storedBrandKey, setStoredBrandKey] = useState<"default" | "n1_torcida">(
    () => getStoredEventBrandKey() ?? "default"
  );
  const isTorcidaTheme =
    activeColor.toLowerCase() === "#0f935d" || storedBrandKey === "n1_torcida";
  const resolvedActiveColor =
    activeColor.toLowerCase() === "#ffc91f" && storedBrandKey === "n1_torcida"
      ? "#0f935d"
      : activeColor;

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(LAST_PATH_KEY, pathname);
    }
  }, [pathname]);

  useEffect(() => {
    const refreshBrand = () => setStoredBrandKey(getStoredEventBrandKey() ?? "default");
    refreshBrand();
    window.addEventListener("storage", refreshBrand);
    return () => window.removeEventListener("storage", refreshBrand);
  }, []);

  const items = [
    { path: "/pages/user/home", icon: <HomeIcon /> },
    { path: "/pages/user/liked", icon: <FavoriteIcon /> },
    { path: "/pages/user/store", icon: <ShoppingBagIcon /> },
    { path: "/pages/user/my-photos", icon: <PhotoLibraryIcon /> },
  ];

  return (
    <Box
      data-fixed-bottom="true"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "calc(64px + env(safe-area-inset-bottom))",
        minHeight: 64,
        backgroundColor: isTorcidaTheme ? "#d4a400" : "rgba(0,0,0,0.85)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderTop: isTorcidaTheme ? "1px solid rgba(0,0,0,0.18)" : "1px solid rgba(255,255,255,0.1)",
        zIndex: 9999,
        transform: "translateZ(0)",
        willChange: "transform",
        WebkitTransform: "translateZ(0)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxSizing: "border-box",
        margin: 0,
        flexShrink: 0,
        touchAction: "none",
        pointerEvents: "auto",
      }}
    >
      {items.map((item) => {
        const isActive = pathname === item.path;

        return (
          <IconButton
            key={item.path}
            onClick={() => {
              if (item.path === "/pages/user/home" && typeof window !== "undefined") {
                // Força restaurar aba/tela anterior da home
                sessionStorage.setItem("forceHomeRestore", "1");
                const lastPath = sessionStorage.getItem(LAST_PATH_KEY);
                if (window.history.length > 1 && lastPath && lastPath !== pathname) {
                  router.back();
                  return;
                }
              }
              router.push(item.path);
            }}
            sx={{
              color: isActive ? resolvedActiveColor : isTorcidaTheme ? "#000" : "#fff",
              "& svg": {
                fontSize: isActive ? 28 : 24,
              },
              transition: "all 0.2s ease",
            }}
          >
            {item.icon}
          </IconButton>
        );
      })}
    </Box>
  );
}
