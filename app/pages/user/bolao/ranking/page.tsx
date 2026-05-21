"use client";

import { Box, Typography } from "@mui/material";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import { RankingTable } from "@/app/components/bolao/RankingTable";
import { PointsBadge } from "@/app/components/shared/PointsBadge";
import { useBolaoRanking, useBolaoMyPoints } from "@/app/hooks/useBolao";

export default function RankingPage() {
  const { data: ranking, isLoading, isError } = useBolaoRanking();
  const { data: myPoints, isLoading: loadingPoints } = useBolaoMyPoints();

  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
      <TopBar title="Ranking" showBack />

      <Box sx={{ px: 2, pt: 2 }}>
        <Typography
          sx={{
            color: "#9E9E9E",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            mb: 1,
          }}
        >
          Sua posição
        </Typography>
        <Box sx={{ mb: 3 }}>
          <PointsBadge points={myPoints} isLoading={loadingPoints} />
        </Box>

        <Typography
          sx={{
            color: "#FFFFFF",
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: 700,
            fontSize: "1rem",
            mb: 2,
          }}
        >
          Top 50 🏆
        </Typography>

        {isError ? (
          <Typography sx={{ color: "#9E9E9E", textAlign: "center", py: 4 }}>
            Algo deu errado. Tenta de novo! 😅
          </Typography>
        ) : (
          <RankingTable entries={ranking ?? []} isLoading={isLoading} />
        )}
      </Box>

      <BottomNav />
    </Box>
  );
}
