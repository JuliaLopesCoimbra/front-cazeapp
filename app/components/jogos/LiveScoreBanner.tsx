"use client";

import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
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
        background: "linear-gradient(135deg, rgba(232,23,93,0.15) 0%, rgba(10,17,40,0.98) 100%)",
        border: "1.5px solid #E8175D",
        borderRadius: "16px",
        padding: "16px",
        mb: 2,
        boxShadow: "0 0 24px rgba(232,23,93,0.25)",
        cursor: "pointer",
      }}
      onClick={() => router.push(`/pages/user/jogos/${fixture.fixture.id}`)}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", fontFamily: 'var(--font-inter), Inter' }}>
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
            <Typography sx={{ fontSize: "0.7rem", color: "#E8175D", fontWeight: 700, mt: 0.5 }}>
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
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
            <SportsSoccerIcon sx={{ fontSize: "1rem" }} />
            Ver palpite
          </Box>
        </CazeButton>
      </Box>
    </Box>
  );
}
