"use client";

import { Box, Typography, Divider, Skeleton } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import MatchCard from "@/app/components/jogos/MatchCard";
import MatchEvents from "@/app/components/jogos/MatchEvents";
import CazeButton from "@/app/components/shared/CazeButton";
import { useBrazilFixtures, useFixtureEvents } from "@/app/hooks/useFixtures";
import { isLive, isFinished } from "@/app/services/football/footballService";

export default function FixtureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fixtureId = Number(params.fixtureId);

  const { data: fixtures, isLoading: loadingFixtures } = useBrazilFixtures();
  const fixture = fixtures?.find((f) => f.fixture.id === fixtureId);

  const started = fixture ? (isLive(fixture) || isFinished(fixture)) : false;
  const { data: events, isLoading: loadingEvents } = useFixtureEvents(started ? fixtureId : null);

  if (loadingFixtures) {
    return (
      <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
        <TopBar showBack />
        <Box sx={{ px: 2, pt: 2 }}>
          <Skeleton variant="rectangular" height={140} sx={{ borderRadius: "12px", backgroundColor: "#1A1A1A", mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: "12px", backgroundColor: "#1A1A1A" }} />
        </Box>
        <BottomNav />
      </Box>
    );
  }

  if (!fixture) {
    return (
      <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
        <TopBar showBack />
        <Typography sx={{ color: "#9E9E9E", textAlign: "center", pt: 8 }}>
          Jogo não encontrado 😅
        </Typography>
        <BottomNav />
      </Box>
    );
  }

  const matchDate = parseISO(fixture.fixture.date);
  const live = isLive(fixture);
  const finished = isFinished(fixture);

  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
      <TopBar showBack title={`${fixture.teams.home.name} × ${fixture.teams.away.name}`} />

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Match card (large) */}
        <MatchCard fixture={fixture} />

        {/* Date / venue info */}
        <Box sx={{ mt: 2, mb: 3, textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.8rem", color: "#9E9E9E", fontFamily: '"Roboto"' }}>
            {format(matchDate, "EEEE, dd 'de' MMMM 'de' yyyy · HH'h'mm", { locale: ptBR })}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#9E9E9E", mt: 0.5 }}>
            {fixture.fixture.venue.name} · {fixture.fixture.venue.city}
          </Typography>
        </Box>

        {/* CTA bolão */}
        {!finished && (
          <Box sx={{ mb: 3 }}>
            <CazeButton
              fullWidth
              onClick={() => router.push(`/pages/user/bolao/${fixtureId}`)}
            >
              {live ? "Ver sua aposta ⚽" : "Apostar nesse jogo ⚽"}
            </CazeButton>
          </Box>
        )}

        {/* Events timeline */}
        {started && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 2 }} />
            <Typography
              sx={{
                fontFamily: '"Montserrat"',
                fontWeight: 700,
                fontSize: "0.875rem",
                color: "#FFF",
                mb: 2,
              }}
            >
              Lances da partida
            </Typography>
            <MatchEvents
              events={events ?? []}
              homeTeamName={fixture.teams.home.name}
              isLoading={loadingEvents}
            />
          </>
        )}

        {!started && (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              backgroundColor: "#1A1A1A",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Typography sx={{ fontSize: "1.5rem", mb: 1 }}>⚽</Typography>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.875rem" }}>
              O jogo ainda não começou.
            </Typography>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.8rem", mt: 0.5 }}>
              Acompanhe os lances em tempo real aqui!
            </Typography>
          </Box>
        )}
      </Box>

      <BottomNav />
    </Box>
  );
}
