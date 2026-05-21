"use client";

import { useState } from "react";
import { Box, Typography, Tab, Tabs, Skeleton } from "@mui/material";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import MatchCard from "@/app/components/jogos/MatchCard";
import LiveScoreBanner from "@/app/components/jogos/LiveScoreBanner";
import { useBrazilLive, useFixturesByPhase } from "@/app/hooks/useFixtures";
import type { BrazilFixture } from "@/app/services/football/footballService";

const PHASES = [
  { key: "grupos",    label: "Grupos" },
  { key: "dezesseis", label: "16 Avos" },
  { key: "oitavas",   label: "Oitavas" },
  { key: "quartas",   label: "Quartas" },
  { key: "semi",      label: "Semi" },
  { key: "final",     label: "Final" },
] as const;

type PhaseKey = typeof PHASES[number]["key"];

// ── Mock knockout fixtures (exibidos enquanto os reais não existem) ─────────────

function makeFixture(
  id: number,
  home: string,
  away: string,
  date: string,
  round: string,
  venue = "A Definir",
  city = "EUA"
): BrazilFixture {
  return {
    fixture: {
      id,
      date,
      status: { short: "NS", elapsed: null, long: "Not Started" },
      venue: { name: venue, city },
    },
    league: { round, season: 2026 },
    teams: {
      home: { id: 0, name: home, logo: "", winner: null },
      away: { id: 0, name: away, logo: "", winner: null },
    },
    goals: { home: null, away: null },
    score: {
      halftime:  { home: null, away: null },
      fulltime:  { home: null, away: null },
      extratime: { home: null, away: null },
      penalty:   { home: null, away: null },
    },
  };
}

const MOCK_KNOCKOUT: Partial<Record<PhaseKey, BrazilFixture[]>> = {
  dezesseis: [
    makeFixture(9001, "Brasil",    "México",         "2026-07-01T22:00:00Z", "Round of 32", "SoFi Stadium",    "Los Angeles"),
    makeFixture(9002, "Argentina", "Equador",        "2026-07-01T18:00:00Z", "Round of 32", "MetLife Stadium", "Nova York"),
    makeFixture(9003, "França",    "Senegal",        "2026-07-02T18:00:00Z", "Round of 32", "AT&T Stadium",    "Dallas"),
    makeFixture(9004, "Alemanha",  "Japão",          "2026-07-02T22:00:00Z", "Round of 32", "Rose Bowl",       "Los Angeles"),
    makeFixture(9005, "Espanha",   "Marrocos",       "2026-07-03T18:00:00Z", "Round of 32", "Levi's Stadium",  "São Francisco"),
    makeFixture(9006, "Portugal",  "Estados Unidos", "2026-07-03T22:00:00Z", "Round of 32", "Arrowhead",       "Kansas City"),
    makeFixture(9007, "Inglaterra","Colômbia",       "2026-07-04T18:00:00Z", "Round of 32", "Gillette Stadium","Boston"),
    makeFixture(9008, "Holanda",   "Uruguai",        "2026-07-04T22:00:00Z", "Round of 32", "Lincoln FR",      "Miami"),
  ],
  oitavas: [
    makeFixture(9009, "Brasil",    "A Definir", "2026-07-08T22:00:00Z", "Round of 16"),
    makeFixture(9010, "Argentina", "A Definir", "2026-07-08T18:00:00Z", "Round of 16"),
    makeFixture(9011, "França",    "A Definir", "2026-07-09T18:00:00Z", "Round of 16"),
    makeFixture(9012, "Alemanha",  "A Definir", "2026-07-09T22:00:00Z", "Round of 16"),
    makeFixture(9013, "Espanha",   "A Definir", "2026-07-10T18:00:00Z", "Round of 16"),
    makeFixture(9014, "Portugal",  "A Definir", "2026-07-10T22:00:00Z", "Round of 16"),
    makeFixture(9015, "Inglaterra","A Definir", "2026-07-11T18:00:00Z", "Round of 16"),
    makeFixture(9016, "Holanda",   "A Definir", "2026-07-11T22:00:00Z", "Round of 16"),
  ],
  quartas: [
    makeFixture(9017, "Brasil",    "A Definir", "2026-07-14T22:00:00Z", "Quarter-finals"),
    makeFixture(9018, "Argentina", "A Definir", "2026-07-14T18:00:00Z", "Quarter-finals"),
    makeFixture(9019, "França",    "A Definir", "2026-07-15T18:00:00Z", "Quarter-finals"),
    makeFixture(9020, "Portugal",  "A Definir", "2026-07-15T22:00:00Z", "Quarter-finals"),
  ],
  semi: [
    makeFixture(9021, "Brasil",    "A Definir", "2026-07-20T22:00:00Z", "Semi-finals"),
    makeFixture(9022, "França",    "A Definir", "2026-07-21T22:00:00Z", "Semi-finals"),
  ],
  final: [
    makeFixture(9023, "Brasil",    "A Definir", "2026-07-27T22:00:00Z", "Final", "MetLife Stadium", "Nova York"),
  ],
};

// ── Componente ─────────────────────────────────────────────────────────────────

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

  // Usa dados reais; fallback para mock nas fases sem jogos ainda
  const phaseFixtures: BrazilFixture[] =
    (grouped[activePhase]?.length ?? 0) > 0
      ? grouped[activePhase]
      : (MOCK_KNOCKOUT[activePhase] ?? []);

  const isMocked =
    (grouped[activePhase]?.length ?? 0) === 0 &&
    (MOCK_KNOCKOUT[activePhase]?.length ?? 0) > 0;

  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
      <TopBar title="Quer apostar?" />

      <Box sx={{ px: 2, pt: 2 }}>
        {liveGame && <LiveScoreBanner fixture={liveGame} />}

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
            <Tab key={phase.key} value={phase.key} label={phase.label} />
          ))}
        </Tabs>

        {isMocked && (
          <Typography
            sx={{
              color: "#9E9E9E",
              fontSize: "0.7rem",
              mb: 1.5,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            Confrontos a confirmar após a fase de grupos
          </Typography>
        )}

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
              <MatchCard
                key={fixture.fixture.id}
                fixture={fixture}
                href={`/pages/user/bolao/${fixture.fixture.id}`}
              />
            ))}
          </Box>
        )}
      </Box>

      <BottomNav />
    </Box>
  );
}
