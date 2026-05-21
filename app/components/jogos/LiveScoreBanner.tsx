"use client";

import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import type { BrazilFixture } from "@/app/services/football/footballService";
import LiveBadge from "@/app/components/shared/LiveBadge";
import CazeButton from "@/app/components/shared/CazeButton";

interface LiveScoreBannerProps {
  fixture: BrazilFixture;
}

export default function LiveScoreBanner({ fixture }: LiveScoreBannerProps) {
  const router = useRouter();

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, rgba(230,57,70,0.15) 0%, rgba(0,0,0,0.95) 100%)",
        border: "1.5px solid #E63946",
        borderRadius: "16px",
        padding: "16px",
        mb: 2,
        boxShadow: "0 0 24px rgba(230,57,70,0.25)",
        cursor: "pointer",
      }}
      onClick={() => router.push(`/pages/user/jogos/${fixture.fixture.id}`)}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography sx={{ fontSize: "0.7rem", color: "#9E9E9E", fontFamily: 'var(--font-inter), Inter' }}>
          {fixture.league.round}
        </Typography>
        <LiveBadge variant="compact" />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Home team */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}>
          <Typography sx={{ fontFamily: 'var(--font-syne), Syne', fontWeight: 700, fontSize: "0.875rem", color: "#FFF", textAlign: "center" }}>
            {fixture.teams.home.name}
          </Typography>
        </Box>

        {/* Score */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mx: 2 }}>
          <LiveBadge
            variant="expanded"
            score={{ home: fixture.goals.home ?? 0, away: fixture.goals.away ?? 0 }}
          />
          {fixture.fixture.status.elapsed != null && (
            <Typography sx={{ fontSize: "0.7rem", color: "#E63946", fontWeight: 700, mt: 0.5 }}>
              {fixture.fixture.status.short === "HT" ? "Intervalo" : `${fixture.fixture.status.elapsed}'`}
            </Typography>
          )}
        </Box>

        {/* Away team */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flex: 1 }}>
          <Typography sx={{ fontFamily: 'var(--font-syne), Syne', fontWeight: 700, fontSize: "0.875rem", color: "#FFF", textAlign: "center" }}>
            {fixture.teams.away.name}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <CazeButton
          variant="secondary"
          onClick={(e) => {
            e?.stopPropagation();
            router.push(`/pages/user/bolao/${fixture.fixture.id}`);
          }}
        >
          Ver aposta ⚽
        </CazeButton>
      </Box>
    </Box>
  );
}
