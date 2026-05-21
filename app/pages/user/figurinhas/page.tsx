"use client";

import { Box, Typography } from "@mui/material";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";

export default function FigurinhasPage() {
  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
      <TopBar title="Figurinhas" />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          px: 4,
          textAlign: "center",
          gap: 2,
        }}
      >
        <CollectionsOutlinedIcon sx={{ fontSize: 72, color: "#F5C900", opacity: 0.6 }} />

        <Typography
          sx={{
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: 900,
            fontSize: "1.5rem",
            color: "#FFFFFF",
          }}
        >
          Álbum chegando em breve!
        </Typography>

        <Typography sx={{ color: "#9E9E9E", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: 280 }}>
          As figurinhas da Copa 2026 vão estar aqui. Fique de olho! 🎴⚽
        </Typography>
      </Box>

      <BottomNav />
    </Box>
  );
}
