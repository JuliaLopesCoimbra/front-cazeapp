"use client";

import { use, type ReactNode } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import PageAmbientBackground from "@/app/components/layout/PageAmbientBackground";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { LAYOUT } from "@/app/constants/designTokens";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import { PredictionInput } from "@/app/components/bolao/PredictionInput";
import { useBolaoFixtures } from "@/app/hooks/useBolao";
import { saveBet } from "@/app/lib/betStore";
import type { BolaoFixture } from "@/app/types/bolao";

interface Props {
  params: Promise<{ fixtureId: string }>;
}

// ── Replicar exatamente os grupos do jogos page ───────────────────────────────

const VENUES = [
  { name: "MetLife Stadium",         city: "Nova York"        },
  { name: "Rose Bowl",               city: "Los Angeles"      },
  { name: "AT&T Stadium",            city: "Dallas"           },
  { name: "SoFi Stadium",            city: "Los Angeles"      },
  { name: "Levi's Stadium",          city: "São Francisco"    },
  { name: "Arrowhead Stadium",       city: "Kansas City"      },
  { name: "Gillette Stadium",        city: "Boston"           },
  { name: "Mercedes-Benz Stadium",   city: "Atlanta"          },
  { name: "Lincoln Financial Field", city: "Philadelphia"     },
  { name: "Hard Rock Stadium",       city: "Miami"            },
  { name: "BMO Field",               city: "Toronto"          },
  { name: "BC Place",                city: "Vancouver"        },
  { name: "Estadio Azteca",          city: "Cidade do México" },
  { name: "Estadio BBVA",            city: "Monterrey"        },
  { name: "Estadio Akron",           city: "Guadalajara"      },
] as const;

interface Team { name: string; code: string; }

type GroupKey = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

const GROUPS_TEAMS: Record<GroupKey, [Team, Team, Team, Team]> = {
  A: [{ name: "EUA", code: "us" }, { name: "Inglaterra", code: "gb-eng" }, { name: "Irã", code: "ir" }, { name: "País de Gales", code: "gb-wls" }],
  B: [{ name: "México", code: "mx" }, { name: "Polônia", code: "pl" }, { name: "Arábia Saudita", code: "sa" }, { name: "Camarões", code: "cm" }],
  C: [{ name: "Brasil", code: "br" }, { name: "Marrocos", code: "ma" }, { name: "Haiti", code: "ht" }, { name: "Escócia", code: "gb-sct" }],
  D: [{ name: "Canadá", code: "ca" }, { name: "Bélgica", code: "be" }, { name: "Croácia", code: "hr" }, { name: "Marrocos", code: "ma" }],
  E: [{ name: "França", code: "fr" }, { name: "Dinamarca", code: "dk" }, { name: "Tunísia", code: "tn" }, { name: "Austrália", code: "au" }],
  F: [{ name: "Espanha", code: "es" }, { name: "Portugal", code: "pt" }, { name: "Uruguai", code: "uy" }, { name: "Gana", code: "gh" }],
  G: [{ name: "Holanda", code: "nl" }, { name: "Senegal", code: "sn" }, { name: "Equador", code: "ec" }, { name: "Suíça", code: "ch" }],
  H: [{ name: "Argentina", code: "ar" }, { name: "Sérvia", code: "rs" }, { name: "Colômbia", code: "co" }, { name: "Catar", code: "qa" }],
  I: [{ name: "Itália", code: "it" }, { name: "Chile", code: "cl" }, { name: "Coreia do Sul", code: "kr" }, { name: "Turquia", code: "tr" }],
  J: [{ name: "Ucrânia", code: "ua" }, { name: "Áustria", code: "at" }, { name: "Argélia", code: "dz" }, { name: "Egito", code: "eg" }],
  K: [{ name: "Costa do Marfim", code: "ci" }, { name: "Peru", code: "pe" }, { name: "Mali", code: "ml" }, { name: "Bolívia", code: "bo" }],
  L: [{ name: "Paraguai", code: "py" }, { name: "Venezuela", code: "ve" }, { name: "Honduras", code: "hn" }, { name: "Jamaica", code: "jm" }],
};

function buildMockFixtures(): BolaoFixture[] {
  const keys = Object.keys(GROUPS_TEAMS) as GroupKey[];
  const fixtures: BolaoFixture[] = [];
  keys.forEach((group, gi) => {
    const teams = GROUPS_TEAMS[group];
    const md1Day = 12 + Math.floor(gi / 2);
    const md2Day = 20 + Math.floor(gi / 2);
    const md3Day = 26 + Math.floor(gi / 6);
    const baseId = (gi + 1) * 100;
    const v = (n: number) => VENUES[(gi * 6 + n) % VENUES.length];

    const makeFixture = (id: number, home: Team, away: Team, date: string): BolaoFixture => ({
      fixture_id: id,
      home_team: home.name,
      away_team: away.name,
      home_logo: `https://flagcdn.com/w80/${home.code}.png`,
      away_logo: `https://flagcdn.com/w80/${away.code}.png`,
      match_date: date,
      status: "NS",
      betting_closes_at: new Date(new Date(date).getTime() - 5 * 60_000).toISOString(),
      user_prediction: null,
    });

    fixtures.push(
      makeFixture(baseId + 1, teams[0], teams[1], `2026-06-${String(md1Day).padStart(2, "0")}T17:00:00Z`),
      makeFixture(baseId + 2, teams[2], teams[3], `2026-06-${String(md1Day).padStart(2, "0")}T20:00:00Z`),
      makeFixture(baseId + 3, teams[0], teams[2], `2026-06-${String(md2Day).padStart(2, "0")}T18:00:00Z`),
      makeFixture(baseId + 4, teams[1], teams[3], `2026-06-${String(md2Day).padStart(2, "0")}T21:00:00Z`),
      makeFixture(baseId + 5, teams[0], teams[3], `2026-06-${String(md3Day).padStart(2, "0")}T20:00:00Z`),
      makeFixture(baseId + 6, teams[1], teams[2], `2026-06-${String(md3Day).padStart(2, "0")}T20:00:00Z`),
    );

    void v; // used implicitly via closure
    void group;
  });
  return fixtures;
}

const MOCK_FIXTURES = buildMockFixtures();

// ── Sub-componentes ───────────────────────────────────────────────────────────

const GLASS_CARD = {
  backgroundColor: "rgba(21,28,46,0.92)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  borderRadius: CAZE_RADIUS.md,
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
} as const;

function TeamFlag({ name, code }: { name: string; code: string }) {
  if (!code) {
    return (
      <Box sx={{
        width: 72, height: 50, borderRadius: CAZE_RADIUS.sm,
        backgroundColor: "rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Typography sx={{ color: "#9E9E9E", fontSize: "0.7rem" }}>?</Typography>
      </Box>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={name}
      width={72}
      height={50}
      style={{ borderRadius: 8, objectFit: "cover", border: "1px solid rgba(255,255,255,0.12)" }}
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
    />
  );
}

function getTeamCode(teamName: string): string {
  for (const teams of Object.values(GROUPS_TEAMS)) {
    const found = teams.find((t) => t.name === teamName);
    if (found) return found.code;
  }
  return "";
}

function MatchHero({ fixture }: { fixture: BolaoFixture }) {
  const matchDate = parseISO(fixture.match_date);
  const isClosed = new Date() >= new Date(fixture.betting_closes_at);
  const homeCode = getTeamCode(fixture.home_team);
  const awayCode = getTeamCode(fixture.away_team);

  return (
    <Box
      sx={{
        ...GLASS_CARD,
        p: "20px 20px",
        mb: 2,
        background:
          "linear-gradient(135deg, rgba(0,85,184,0.24), rgba(21,28,46,0.96) 52%, rgba(245,201,0,0.14))",
      }}
    >
      {/* data */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Box sx={{
          backgroundColor: isClosed ? "rgba(230,57,70,0.08)" : "rgba(0,148,64,0.08)",
          border: `1px solid ${isClosed ? "rgba(230,57,70,0.3)" : "rgba(0,148,64,0.3)"}`,
          borderRadius: CAZE_RADIUS.pill,
          px: 1.5, py: 0.5,
          display: "inline-flex", alignItems: "center", gap: 0.75,
        }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: "50%",
            backgroundColor: isClosed ? "#E63946" : "#009440",
          }} />
          <Typography sx={{
            color: isClosed ? "#E63946" : "#009440",
            fontSize: "0.65rem", fontWeight: 700,
            fontFamily: '"Montserrat"',
          }}>
            {format(matchDate, "dd 'de' MMM · HH'h'mm", { locale: ptBR }).toUpperCase()}
            {isClosed ? " · ENCERRADO" : " · ABERTO"}
          </Typography>
        </Box>
      </Box>

      {/* times */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <TeamFlag name={fixture.home_team} code={homeCode} />
          <Typography sx={{
            color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem", textAlign: "center",
            fontFamily: '"Montserrat"', lineHeight: 1.2, maxWidth: 90,
          }}>
            {fixture.home_team}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 48 }}>
          <Typography sx={{
            color: "#F5C900", fontFamily: '"Montserrat"', fontWeight: 900,
            fontSize: "1.75rem", lineHeight: 1,
          }}>
            VS
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <TeamFlag name={fixture.away_team} code={awayCode} />
          <Typography sx={{
            color: "#FFFFFF", fontWeight: 700, fontSize: "0.85rem", textAlign: "center",
            fontFamily: '"Montserrat"', lineHeight: 1.2, maxWidth: 90,
          }}>
            {fixture.away_team}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}


function PageSkeleton() {
  return (
    <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Skeleton variant="rectangular" height={160} sx={{ borderRadius: CAZE_RADIUS.md, backgroundColor: "rgba(255,255,255,0.06)" }} />
      <Box sx={{ display: "flex", gap: 1 }}>
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={60} sx={{ flex: 1, borderRadius: CAZE_RADIUS.md, backgroundColor: "rgba(255,255,255,0.06)" }} />)}
      </Box>
      <Skeleton variant="rectangular" height={260} sx={{ borderRadius: CAZE_RADIUS.md, backgroundColor: "rgba(255,255,255,0.06)" }} />
    </Box>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function BolaoFixturePage({ params }: Props) {
  const { fixtureId } = use(params);
  const router = useRouter();
  const { data: apiFixtures, isLoading } = useBolaoFixtures();

  const idNum = Number(fixtureId);
  const fixture =
    apiFixtures?.find((f) => f.fixture_id === idNum) ??
    MOCK_FIXTURES.find((f) => f.fixture_id === idNum);

  const mainContent = (children: ReactNode) => (
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
            backgroundColor: "#0A1128",
          }}
        >
          <TopBar title="Palpite" showBack />
          <Box sx={{ px: `${LAYOUT.pagePaddingX}px`, pt: 2, maxWidth: LAYOUT.feedMaxWidth, mx: "auto" }}>
            {children}
          </Box>
        </Box>
      </Box>
      <BottomNav />
    </>
  );

  if (isLoading) return mainContent(<PageSkeleton />);

  if (!fixture) {
    return mainContent(
      <Typography sx={{ color: "#9E9E9E", textAlign: "center", pt: 8 }}>
        Jogo não encontrado
      </Typography>
    );
  }

  return mainContent(
    <>
      <MatchHero fixture={fixture} />
      <PredictionInput
        fixture={fixture}
        onSuccess={({ home, away }) => {
          saveBet({
            fixture_id: fixture.fixture_id,
            home_team: fixture.home_team,
            away_team: fixture.away_team,
            home_code: getTeamCode(fixture.home_team),
            away_code: getTeamCode(fixture.away_team),
            home_score: home,
            away_score: away,
          });
          router.push("/pages/user/jogos");
        }}
      />
    </>
  );
}
