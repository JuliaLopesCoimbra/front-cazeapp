"use client";

import { Box, Typography, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useBrazilFixtures, useBrazilLive } from "@/app/hooks/useFixtures";
import { isLive, isFinished } from "@/app/services/football/footballService";
import LiveBadge from "@/app/components/shared/LiveBadge";
import CazeButton from "@/app/components/shared/CazeButton";

export default function HeroMatchBanner() {
  const router = useRouter();
  const { data: fixtures, isLoading } = useBrazilFixtures();
  const { data: liveFixtures } = useBrazilLive();

  if (isLoading) {
    return (
      <Skeleton
        variant="rectangular"
        sx={{ borderRadius: "16px", mb: 2, height: 160, backgroundColor: "#1A1A1A" }}
      />
    );
  }

  const liveGame = liveFixtures && liveFixtures.length > 0 ? liveFixtures[0] : null;
  const nextGame = !liveGame && fixtures
    ? fixtures
        .filter((f) => !isFinished(f))
        .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())[0]
    : null;

  const featured = liveGame ?? nextGame;
  if (!featured) return null;

  const live = isLive(featured);
  const matchDate = parseISO(featured.fixture.date);

  return (
    <Box
      onClick={() => router.push(`/pages/user/jogos/${featured.fixture.id}`)}
      sx={{
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        mb: 2,
        cursor: "pointer",
        background: live
          ? "linear-gradient(135deg, rgba(230,57,70,0.2) 0%, #0A0A0A 60%)"
          : "linear-gradient(135deg, #0055B8 0%, #000000 70%)",
        border: live ? "1.5px solid #E63946" : "1px solid rgba(245,201,0,0.2)",
        boxShadow: live
          ? "0 4px 24px rgba(230,57,70,0.3)"
          : "0 4px 16px rgba(0,0,0,0.5)",
        minHeight: 156,
        padding: "16px",
      }}
    >
      {/* Tag: próximo jogo ou fase */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography
          sx={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontWeight: 600,
            fontSize: "0.7rem",
            color: live ? "#E63946" : "#F5C900",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {live ? "Jogando agora" : "Próximo jogo 🇧🇷"}
        </Typography>
        {live ? (
          <LiveBadge variant="compact" />
        ) : (
          <Typography sx={{ fontSize: "0.7rem", color: "#9E9E9E" }}>
            {format(matchDate, "dd 'de' MMMM · HH'h'mm", { locale: ptBR })}
          </Typography>
        )}
      </Box>

      {/* Teams row */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography
          sx={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontWeight: 900,
            fontSize: "1.125rem",
            color: "#FFFFFF",
            flex: 1,
          }}
        >
          {featured.teams.home.name}
        </Typography>

        {live ? (
          <Box sx={{ mx: 1.5, textAlign: "center" }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-syne), Syne',
                fontWeight: 900,
                fontSize: "2rem",
                color: "#E63946",
                lineHeight: 1,
              }}
            >
              {featured.goals.home ?? 0} – {featured.goals.away ?? 0}
            </Typography>
            {featured.fixture.status.elapsed != null && (
              <Typography sx={{ fontSize: "0.65rem", color: "#E63946", fontWeight: 700 }}>
                {featured.fixture.status.short === "HT" ? "Intervalo" : `${featured.fixture.status.elapsed}'`}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography
            sx={{
              mx: 2,
              fontFamily: 'var(--font-syne), Syne',
              fontWeight: 900,
              fontSize: "1.25rem",
              color: "#F5C900",
            }}
          >
            VS
          </Typography>
        )}

        <Typography
          sx={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontWeight: 900,
            fontSize: "1.125rem",
            color: "#FFFFFF",
            flex: 1,
            textAlign: "right",
          }}
        >
          {featured.teams.away.name}
        </Typography>
      </Box>

      {/* Round + CTA */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "0.7rem", color: "#9E9E9E" }}>
          {featured.league.round}
        </Typography>
        <CazeButton
          variant="primary"
          onClick={(e) => {
            e?.stopPropagation();
            router.push(`/pages/user/bolao/${featured.fixture.id}`);
          }}
        >
          Apostar agora ⚽
        </CazeButton>
      </Box>
    </Box>
  );
}
