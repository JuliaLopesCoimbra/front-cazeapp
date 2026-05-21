"use client";

import { useState } from "react";
import { Box, Typography, Tab, Tabs, Skeleton } from "@mui/material";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import MatchCard from "@/app/components/jogos/MatchCard";
import LiveScoreBanner from "@/app/components/jogos/LiveScoreBanner";
import { useBrazilLive, useFixturesByPhase } from "@/app/hooks/useFixtures";

const PHASES = [
  { key: "grupos", label: "Grupos" },
  { key: "oitavas", label: "Oitavas" },
  { key: "quartas", label: "Quartas" },
  { key: "semi", label: "Semi" },
  { key: "final", label: "Final" },
] as const;

type PhaseKey = typeof PHASES[number]["key"];

function MatchListSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={110}
          sx={{ borderRadius: "12px", backgroundColor: "#1A1A1A" }}
        />
      ))}
    </Box>
  );
}

export default function JogosPage() {
  const [activePhase, setActivePhase] = useState<PhaseKey>("grupos");
  const { data: liveFixtures } = useBrazilLive();
  const { grouped, isLoading, isError } = useFixturesByPhase();

  const liveGame = liveFixtures && liveFixtures.length > 0 ? liveFixtures[0] : null;
  const phaseFixtures = grouped[activePhase] ?? [];

  // Auto-select phase that has live or upcoming games
  const availablePhases = PHASES.filter((p) => (grouped[p.key]?.length ?? 0) > 0);

  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
      <TopBar title="Copa do Mundo 2026" />

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Live banner */}
        {liveGame && <LiveScoreBanner fixture={liveGame} />}

        {/* Phase tabs */}
        <Tabs
          value={activePhase}
          onChange={(_, v) => setActivePhase(v)}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            mb: 2,
            "& .MuiTabs-indicator": { backgroundColor: "#F5C900" },
            "& .MuiTab-root": {
              color: "#9E9E9E",
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontWeight: 700,
              fontSize: "0.75rem",
              textTransform: "none",
              minWidth: "auto",
              px: 1.5,
            },
            "& .Mui-selected": { color: "#F5C900" },
          }}
        >
          {PHASES.map((phase) => (
            <Tab
              key={phase.key}
              value={phase.key}
              label={phase.label}
              disabled={(grouped[phase.key]?.length ?? 0) === 0 && !isLoading}
            />
          ))}
        </Tabs>

        {/* Match list */}
        {isLoading ? (
          <MatchListSkeleton />
        ) : isError ? (
          <Typography sx={{ color: "#9E9E9E", textAlign: "center", py: 4 }}>
            Algo deu errado. Tenta de novo! 😅
          </Typography>
        ) : phaseFixtures.length === 0 ? (
          <Typography sx={{ color: "#9E9E9E", textAlign: "center", py: 4 }}>
            Nenhum jogo nessa fase ainda. ⚽
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {phaseFixtures.map((fixture) => (
              <MatchCard key={fixture.fixture.id} fixture={fixture} />
            ))}
          </Box>
        )}
      </Box>

      <BottomNav />
    </Box>
  );
}
