"use client";

import { Box, Typography, Skeleton } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import PageAmbientBackground from "@/app/components/layout/PageAmbientBackground";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { LAYOUT, PAGE_GLASS_SURFACE } from "@/app/constants/designTokens";
import MatchCard from "@/app/components/jogos/MatchCard";
import CazeButton from "@/app/components/shared/CazeButton";
import { useBrazilFixtures } from "@/app/hooks/useFixtures";
import { isLive, isFinished } from "@/app/services/football/footballService";

export default function FixtureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = Number(params.fixtureId);

  const { data: fixtures, isLoading } = useBrazilFixtures();
  const fixture = fixtures?.find((f) => f.fixture.id === fixtureId);

  if (isLoading) {
    return (
      <>
        <Box sx={{ position: "relative", minHeight: "100vh" }}>
          <PageAmbientBackground />
          <Sidebar />
          <Box
            component="main"
            sx={{
              position: "relative",
              zIndex: 1,
              ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
              minHeight: "100vh",
              pb: `${LAYOUT.bottomNavClearance}px`,
              ...PAGE_GLASS_SURFACE,
            }}
          >
            <TopBar showBack />
            <Box sx={{ px: `${LAYOUT.pagePaddingX}px`, pt: 2, maxWidth: LAYOUT.feedMaxWidth, mx: "auto" }}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: "12px", backgroundColor: "#1A1A1A", mb: 2 }} />
              <Skeleton variant="rectangular" height={52} sx={{ borderRadius: "8px", backgroundColor: "#1A1A1A" }} />
            </Box>
          </Box>
        </Box>
        <BottomNav />
      </>
    );
  }

  if (!fixture) {
    return (
      <>
        <Box sx={{ position: "relative", minHeight: "100vh" }}>
          <PageAmbientBackground />
          <Sidebar />
          <Box
            component="main"
            sx={{
              position: "relative",
              zIndex: 1,
              ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
              minHeight: "100vh",
              pb: `${LAYOUT.bottomNavClearance}px`,
              ...PAGE_GLASS_SURFACE,
            }}
          >
            <TopBar showBack />
            <Typography sx={{ color: "#6B6B6B", textAlign: "center", pt: 8 }}>
              Jogo não encontrado
            </Typography>
          </Box>
        </Box>
        <BottomNav />
      </>
    );
  }

  const matchDate = parseISO(fixture.fixture.date);
  const live = isLive(fixture);
  const finished = isFinished(fixture);

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "100vh" }}>
        <PageAmbientBackground />
        <Sidebar />
        <Box
          component="main"
          sx={{
            position: "relative",
            zIndex: 1,
            ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
            minHeight: "100vh",
            pb: `${LAYOUT.bottomNavClearance}px`,
            ...PAGE_GLASS_SURFACE,
          }}
        >
          <TopBar showBack title={`${fixture.teams.home.name} × ${fixture.teams.away.name}`} />

          <Box sx={{ px: `${LAYOUT.pagePaddingX}px`, pt: 2, maxWidth: LAYOUT.feedMaxWidth, mx: "auto" }}>
            <MatchCard fixture={fixture} />

            <Box sx={{ mt: 2, mb: 3, textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.8rem", color: "#6B6B6B" }}>
                {format(matchDate, "EEEE, dd 'de' MMMM 'de' yyyy · HH'h'mm", { locale: ptBR })}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#6B6B6B", mt: 0.5 }}>
                {fixture.fixture.venue.name} · {fixture.fixture.venue.city}
              </Typography>
            </Box>

            {!finished && (
              <CazeButton
                fullWidth
                onClick={() => router.push(`/pages/user/bolao/${fixtureId}`)}
              >
                {live ? "Ver sua aposta" : "Apostar nesse jogo"}
              </CazeButton>
            )}
          </Box>
        </Box>
      </Box>
      <BottomNav />
    </>
  );
}
