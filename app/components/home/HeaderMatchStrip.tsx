"use client";

import { Box, Skeleton, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useBrazilFixtures, useBrazilLive, useNextFixture } from "@/app/hooks/useFixtures";
import { isLive } from "@/app/services/football/footballService";
import TeamFlag from "@/app/components/shared/TeamFlag";
import { COLORS } from "@/app/constants/designTokens";

const FLAG_SIZE = 16;
const ISLAND_HEIGHT = 30;
const ISLAND_RADIUS = "100px";
const ISLAND_BORDER_WIDTH = 1;

/** Degradê Brasil — igual BrazilDivider (só na borda) */
const BRASIL_BORDER_GRADIENT =
  "linear-gradient(90deg, #009440 0%, #FFCB00 76.923%)";

const islandSurfaceSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  height: ISLAND_HEIGHT,
  px: "10px",
  borderRadius: ISLAND_RADIUS,
  border: `${ISLAND_BORDER_WIDTH}px solid transparent`,
  backgroundImage: `linear-gradient(${COLORS.bg}, ${COLORS.bg}), ${BRASIL_BORDER_GRADIENT}`,
  backgroundOrigin: "border-box",
  backgroundClip: "padding-box, border-box",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
} as const;

interface HeaderMatchStripProps {
  /** Centralizado sobre a toolbar (Dynamic Island) */
  embedded?: boolean;
}

/**
 * Dynamic Island — bandeiras flagcdn + data/placar.
 */
export default function HeaderMatchStrip({ embedded = false }: HeaderMatchStripProps) {
  const router = useRouter();
  const { isLoading: fixturesLoading } = useBrazilFixtures();
  const { isLoading: liveLoading } = useBrazilLive();
  const featured = useNextFixture();

  if (fixturesLoading || liveLoading) {
    return (
      <Box
        sx={
          embedded
            ? {
                display: "flex",
                justifyContent: "center",
                width: "100%",
                py: 0.25,
              }
            : { display: "flex", justifyContent: "center", py: 0.5 }
        }
      >
        <Skeleton
          variant="rounded"
          width={168}
          height={ISLAND_HEIGHT}
          sx={{ borderRadius: ISLAND_RADIUS, bgcolor: "rgba(0,0,0,0.06)" }}
        />
      </Box>
    );
  }

  if (!featured) return null;

  const live = isLive(featured);
  const matchDate = parseISO(featured.fixture.date);
  const dateLabel = format(matchDate, "dd/MM · HH:mm", { locale: ptBR });

  const island = (
    <Box
      component="button"
      type="button"
      aria-label={
        live
          ? `Jogo ao vivo: ${featured.teams.home.name} ${featured.goals.home ?? 0} a ${featured.goals.away ?? 0} ${featured.teams.away.name}`
          : `Próximo jogo: ${featured.teams.home.name} x ${featured.teams.away.name}, ${dateLabel}`
      }
      onClick={() => router.push(`/pages/user/jogos/${featured.fixture.id}`)}
      sx={{
        border: "none",
        cursor: "pointer",
        padding: 0,
        background: "transparent",
        display: "block",
      }}
    >
      <Box sx={islandSurfaceSx}>
          {live && (
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: COLORS.red,
                flexShrink: 0,
                animation: "live-pulse 1.5s ease-in-out infinite",
                "@keyframes live-pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.35 },
                },
              }}
            />
          )}

          <TeamFlag
            name={featured.teams.home.name}
            width={FLAG_SIZE}
            fallbackLogo={featured.teams.home.logo}
          />

          {live ? (
            <Typography
              component="span"
              sx={{
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontSize: 12,
                fontWeight: 800,
                color: COLORS.text,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
              }}
            >
              {featured.goals.home ?? 0}–{featured.goals.away ?? 0}
            </Typography>
          ) : null}

          <TeamFlag
            name={featured.teams.away.name}
            width={FLAG_SIZE}
            fallbackLogo={featured.teams.away.logo}
          />

          <Typography
            component="span"
            sx={{
              fontSize: 9,
              fontWeight: 700,
              color: COLORS.textSecondary,
              lineHeight: 1,
            }}
          >
            ·
          </Typography>

          <Typography
            component="span"
            noWrap
            sx={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: 10,
              fontWeight: 500,
              color: COLORS.textSecondary,
              lineHeight: 1,
              maxWidth: 76,
            }}
          >
            {live
              ? featured.fixture.status.short === "HT"
                ? "INT"
                : featured.fixture.status.elapsed != null
                  ? `${featured.fixture.status.elapsed}'`
                  : "LIVE"
              : dateLabel}
          </Typography>
      </Box>
    </Box>
  );

  if (embedded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          py: 0.25,
          pointerEvents: "auto",
        }}
      >
        {island}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 0.5 }}>
      {island}
    </Box>
  );
}
