"use client";

import { Box, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getStoredEventBrandKey } from "@/app/utils/eventBranding";
import { useAuth } from "@/app/context/AuthContext";

interface BottomNavProps {
  activeColor?: string;
  eventId?: number;
}

export default function BottomNav({ activeColor = "#ffc91f", eventId }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const LAST_PATH_KEY = "bottomNavLastPath";
  const { canCreatePost } = useAuth();
  const [storedBrandKey, setStoredBrandKey] = useState<"default" | "n1_torcida">(
    () => getStoredEventBrandKey() ?? "default"
  );
  const [shrunk, setShrunk] = useState(false);
  const lastScrollY = useRef(0);

  const resolvedActiveColor =
    activeColor === "#ffc91f" && storedBrandKey === "n1_torcida"
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

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current + 4) {
        setShrunk(true);
      } else if (currentY < lastScrollY.current - 4) {
        setShrunk(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { path: "/pages/user/home", icon: <HomeIcon /> },
    { path: "/pages/user/liked", icon: <FavoriteIcon /> },
    ...(canCreatePost && eventId
      ? [{ path: "__add_post__", icon: <AddCircleOutlineIcon />, isAdd: true }]
      : []),
    { path: "/pages/user/store", icon: <ShoppingBagIcon /> },
    { path: "/pages/user/my-photos", icon: <PhotoLibraryIcon /> },
  ] as Array<{ path: string; icon: React.ReactNode; isAdd?: boolean }>;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: shrunk ? "calc(env(safe-area-inset-bottom) + 20px)" : "calc(env(safe-area-inset-bottom) + 32px)",
        left: "50%",
        transform: "translateX(-50%)",
        width: shrunk ? "55%" : "74%",
        maxWidth: 480,
        minWidth: 240,
        height: shrunk ? 48 : 60,
        backgroundColor: shrunk ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.11)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderRadius: "999px",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: shrunk
          ? "0 2px 12px rgba(0,0,0,0.18)"
          : "0 4px 24px rgba(0,0,0,0.22)",
        zIndex: 9999,
        willChange: "transform, width, height, bottom",
        paddingBottom: 0,
        boxSizing: "border-box",
        transition: "bottom 0.3s ease, width 0.3s ease, height 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
        touchAction: "none",
        pointerEvents: "auto",
        overflow: "hidden",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path;

        if (item.isAdd) {
          return (
            <IconButton
              key="add-post"
              onClick={() => router.push(`/pages/news/create?eventId=${eventId}`)}
              sx={{
                color: "#ffe066",
                padding: shrunk ? "6px" : "10px",
                "& svg": {
                  fontSize: shrunk ? 26 : 32,
                  transition: "font-size 0.3s ease",
                },
                transition: "all 0.3s ease",
              }}
            >
              {item.icon}
            </IconButton>
          );
        }

        return (
          <IconButton
            key={item.path}
            onClick={() => {
              if (item.path === "/pages/user/home" && typeof window !== "undefined") {
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
              color: isActive ? "#ffe066" : "#ffc91f",
              padding: shrunk ? "6px" : "10px",
              "& svg": {
                fontSize: isActive ? (shrunk ? 22 : 26) : (shrunk ? 18 : 22),
                transition: "font-size 0.3s ease",
              },
              transition: "all 0.3s ease",
            }}
          >
            {item.icon}
          </IconButton>
        );
      })}
    </Box>
  );
}
