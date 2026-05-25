"use client";

import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { COLORS, LAYOUT } from "@/app/constants/designTokens";
import InteractiveMap from "@/app/components/map/InteractiveMap";

export default function MapaPage() {
  const router = useRouter();

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "100vh", bgcolor: COLORS.surface }}>
        <Sidebar />

        <Box
          component="main"
          sx={{
            position: "relative",
            zIndex: 1,
            ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
            minHeight: "100vh",
            pb: `${LAYOUT.bottomNavClearance}px`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TopBar title="Mapa do Evento" showBack onBack={() => router.back()} />

          <Box sx={{ flex: 1, px: 2, pt: 1.5, pb: 2 }}>
            <Box sx={{ width: "100%", maxWidth: 520, mx: "auto" }}>
              <InteractiveMap />
            </Box>
          </Box>
        </Box>
      </Box>

      <BottomNav />
    </>
  );
}
