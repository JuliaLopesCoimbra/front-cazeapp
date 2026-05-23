"use client";

import { Box, Typography, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useBrazilFixtures } from "@/app/hooks/useFixtures";
import { isFinished } from "@/app/services/football/footballService";
import TeamFlag from "@/app/components/shared/TeamFlag";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import { COLORS } from "@/app/constants/designTokens";

const FLAG_SIZE = 36;
const BANNER_MIN_HEIGHT = 80;

export default function HeroMatchBanner() {
  const router = useRouter();
  const { data: fixtures, isLoading } = useBrazilFixtures();

  if (isLoading) {
    return (
      <Skeleton
        variant="rectangular"
        sx={{
          borderRadius: CAZE_RADIUS.md,
          height: BANNER_MIN_HEIGHT,
          width: "100%",
          bgcolor: "rgba(0,0,0,0.06)",
        }}
      />
    );
  }

  const featured = fixtures
    ? fixtures
        .filter((f) => !isFinished(f))
        .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())[0] ?? null
    : null;

  if (!featured) return null;

  const live = false;
  const matchDate = parseISO(featured.fixture.date);
  const dateShort = format(matchDate, "dd/MM · HH'h'mm", { locale: ptBR });
  const isGameToday = !live && isToday(matchDate);

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: BANNER_MIN_HEIGHT,
        px: 2,
        pt: 1,
        pb: 1.25,
        gap: 0.75,
        borderRadius: CAZE_RADIUS.md,
        background: live ? "rgba(229, 37, 84, 0.05)" : "#f5efde",
        border: `1px solid ${live ? "rgba(229, 37, 84, 0.28)" : "#e4d2b7"}`,
        boxShadow: live
          ? "0 2px 16px rgba(229, 37, 84, 0.10), 0 1px 4px rgba(0,0,0,0.04)"
          : "0 2px 10px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
      }}
    >
      {/* ── Linha 1: status/data + botão palpitar ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1,
        }}
      >
        {/* Status + data */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {isGameToday && (
            <Box
              component="span"
              sx={{
                fontFamily: 'var(--font-sports), "Bebas Neue", sans-serif',
                fontSize: "0.6rem",
                letterSpacing: "0.06em",
                lineHeight: 1.2,
                color: "#000",
                bgcolor: COLORS.yellow,
                borderRadius: "100px",
                px: 0.75,
                py: 0.15,
                display: "inline-flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              HOJE
            </Box>
          )}
          <Typography
            sx={{
              fontFamily: 'var(--font-inter), Inter, sans-serif',
              fontSize: "0.7rem",
              color: COLORS.muted,
              lineHeight: 1,
            }}
          >
            {live ? "Ao vivo" : dateShort}
          </Typography>
        </Box>

        {/* Botão palpitar */}
        <Box
          component="button"
          type="button"
          aria-label={`Palpitar no jogo ${featured.teams.home.name} x ${featured.teams.away.name}`}
          onClick={() => router.push(`/pages/user/bolao/${featured.fixture.id}`)}
          sx={{
            fontFamily: 'var(--font-sports), "Bebas Neue", sans-serif',
            fontSize: "0.75rem",
            letterSpacing: "0.06em",
            lineHeight: 1,
            color: "#000",
            bgcolor: COLORS.yellow,
            border: "none",
            borderRadius: "100px",
            px: 1.5,
            py: 0.6,
            cursor: "pointer",
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            transition: "background-color 0.15s ease",
            "&:hover": { bgcolor: "#e0b200" },
            "&:active": { transform: "scale(0.96)" },
          }}
        >
          PALPITAR
        </Box>
      </Box>

      {/* ── Linha 2: bandeiras + placar/VS ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          zIndex: 1,
        }}
      >
        {/* Time casa */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.4 }}>
          <TeamFlag
            name={featured.teams.home.name}
            width={FLAG_SIZE}
            fallbackLogo={featured.teams.home.logo}
          />
          <Typography
            noWrap
            sx={{
              fontFamily: 'var(--font-sports), "Bebas Neue", sans-serif',
              fontSize: "0.6rem",
              color: COLORS.muted,
              letterSpacing: "0.05em",
              lineHeight: 1,
              maxWidth: 60,
            }}
          >
            {featured.teams.home.name.toUpperCase()}
          </Typography>
        </Box>

        {/* Placar / VS */}
        {live ? (
          <Typography
            sx={{
              fontFamily: 'var(--font-sports), "Bebas Neue", sans-serif',
              fontSize: "2.25rem",
              color: COLORS.red,
              lineHeight: 1,
              flexShrink: 0,
              letterSpacing: "0.02em",
            }}
          >
            {featured.goals.home ?? 0}–{featured.goals.away ?? 0}
          </Typography>
        ) : (
          <Typography
            sx={{
              fontFamily: 'var(--font-sports), "Bebas Neue", sans-serif',
              fontSize: "1.5rem",
              color: COLORS.muted,
              flexShrink: 0,
              lineHeight: 1,
              letterSpacing: "0.08em",
            }}
          >
            VS
          </Typography>
        )}

        {/* Time visitante */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.4 }}>
          <TeamFlag
            name={featured.teams.away.name}
            width={FLAG_SIZE}
            fallbackLogo={featured.teams.away.logo}
          />
          <Typography
            noWrap
            sx={{
              fontFamily: 'var(--font-sports), "Bebas Neue", sans-serif',
              fontSize: "0.6rem",
              color: COLORS.muted,
              letterSpacing: "0.05em",
              lineHeight: 1,
              maxWidth: 60,
            }}
          >
            {featured.teams.away.name.toUpperCase()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
