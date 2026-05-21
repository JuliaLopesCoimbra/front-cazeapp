"use client";

import { Box, Typography, Skeleton } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useBrazilFixtures, useBrazilLive } from "@/app/hooks/useFixtures";
import { isLive, isFinished } from "@/app/services/football/footballService";
import LiveBadge from "@/app/components/shared/LiveBadge";
import TeamFlag from "@/app/components/shared/TeamFlag";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import { COLORS } from "@/app/constants/designTokens";

const FLAG_SIZE = 40;
const BANNER_MIN_HEIGHT = 52;

function PalpiteButton({
  onClick,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label="Palpitar no bolão"
      sx={{
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        py: 0.5,
        pl: 0.5,
        pr: 0,
        color: "rgba(255, 255, 255, 0.55)",
        "&:hover": {
          color: COLORS.yellow,
        },
      }}
    >
      <Typography
        component="span"
        sx={{
          fontFamily: 'var(--font-roboto), Roboto, sans-serif',
          fontWeight: 600,
          fontSize: "0.75rem",
          lineHeight: 1,
        }}
      >
        Palpitar
      </Typography>
      <ChevronRightIcon sx={{ fontSize: 20 }} />
    </Box>
  );
}

export default function HeroMatchBanner() {
  const router = useRouter();
  const { data: fixtures, isLoading } = useBrazilFixtures();
  const { data: liveFixtures } = useBrazilLive();

  const goToBolao = (fixtureId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/pages/user/bolao/${fixtureId}`);
  };

  if (isLoading) {
    return (
      <Skeleton
        variant="rectangular"
        sx={{
          borderRadius: CAZE_RADIUS.md,
          height: BANNER_MIN_HEIGHT,
          width: "100%",
          bgcolor: "rgba(255,255,255,0.06)",
        }}
      />
    );
  }

  const liveGame = liveFixtures && liveFixtures.length > 0 ? liveFixtures[0] : null;
  const nextGame =
    !liveGame && fixtures
      ? fixtures
          .filter((f) => !isFinished(f))
          .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())[0]
      : null;

  const featured = liveGame ?? nextGame;
  if (!featured) return null;

  const live = isLive(featured);
  const matchDate = parseISO(featured.fixture.date);
  const dateShort = format(matchDate, "dd/MM · HH'h'mm", { locale: ptBR });

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => goToBolao(featured.fixture.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToBolao(featured.fixture.id);
        }
      }}
      aria-label={`Bolão: palpite ${featured.teams.home.name} x ${featured.teams.away.name}`}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
        minHeight: BANNER_MIN_HEIGHT,
        pl: 1.25,
        pr: 0.75,
        py: 0.75,
        borderRadius: CAZE_RADIUS.md,
        cursor: "pointer",
        border: "none",
        background: live
          ? "rgba(229, 37, 84, 0.12)"
          : "rgba(40, 40, 40, 0.42)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 0.25,
          flexShrink: 0,
          textAlign: "left",
          minWidth: 0,
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 0.5 }}>
          <Typography
            noWrap
            sx={{
              fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: "0.625rem",
              color: COLORS.yellow,
              letterSpacing: "0.02em",
              lineHeight: 1.1,
            }}
          >
            Bolão Cazé TV
          </Typography>
          {live && <LiveBadge variant="compact" />}
        </Box>
        <Typography
          noWrap
          sx={{
            fontSize: "0.625rem",
            color: COLORS.textSecondary,
            lineHeight: 1.1,
          }}
        >
          {live ? "Ao vivo" : dateShort}
        </Typography>
      </Box>

      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.75,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <TeamFlag
          name={featured.teams.home.name}
          width={FLAG_SIZE}
          fallbackLogo={featured.teams.home.logo}
        />

        {live ? (
          <Typography
            sx={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontWeight: 900,
              fontSize: "1rem",
              color: COLORS.red,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {featured.goals.home ?? 0}–{featured.goals.away ?? 0}
          </Typography>
        ) : (
          <Typography
            sx={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontWeight: 900,
              fontSize: "0.6875rem",
              color: COLORS.muted,
              flexShrink: 0,
            }}
          >
            VS
          </Typography>
        )}

        <TeamFlag
          name={featured.teams.away.name}
          width={FLAG_SIZE}
          fallbackLogo={featured.teams.away.logo}
        />
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          ml: "auto",
          alignSelf: "stretch",
          display: "flex",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <PalpiteButton onClick={(e) => goToBolao(featured.fixture.id, e)} />
      </Box>
    </Box>
  );
}
