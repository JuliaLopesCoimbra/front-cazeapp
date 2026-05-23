"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Box, Typography, Tab, Tabs } from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import PageAmbientBackground from "@/app/components/layout/PageAmbientBackground";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { LAYOUT } from "@/app/constants/designTokens";
import LiveScoreBanner from "@/app/components/jogos/LiveScoreBanner";
import { useBrazilLive } from "@/app/hooks/useFixtures";
import { getSavedBets, type SavedBet } from "@/app/lib/betStore";

// ── Design tokens ─────────────────────────────────────────────────────────────

const GLASS_CARD = {
  backgroundColor: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
} as const;

// ── Phases ────────────────────────────────────────────────────────────────────

const PHASES = [
  { key: "grupos",    label: "Grupos"  },
  { key: "dezesseis", label: "16 Avos" },
  { key: "oitavas",   label: "Oitavas" },
  { key: "quartas",   label: "Quartas" },
  { key: "semi",      label: "Semi"    },
  { key: "final",     label: "Final"   },
] as const;

type PhaseKey = typeof PHASES[number]["key"];

// ── Venues ────────────────────────────────────────────────────────────────────

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

// ── Groups & Teams ────────────────────────────────────────────────────────────

type GroupKey = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

interface Team {
  name: string;
  code: string;
}

const GROUPS_TEAMS: Record<GroupKey, [Team, Team, Team, Team]> = {
  A: [{ name: "EUA", code: "us" }, { name: "Inglaterra", code: "gb-eng" }, { name: "Irã", code: "ir" }, { name: "País de Gales", code: "gb-wls" }],
  B: [{ name: "México", code: "mx" }, { name: "Polônia", code: "pl" }, { name: "Arábia Saudita", code: "sa" }, { name: "Camarões", code: "cm" }],
  C: [{ name: "Canadá", code: "ca" }, { name: "Bélgica", code: "be" }, { name: "Croácia", code: "hr" }, { name: "Marrocos", code: "ma" }],
  D: [{ name: "Brasil", code: "br" }, { name: "Alemanha", code: "de" }, { name: "Japão", code: "jp" }, { name: "Costa Rica", code: "cr" }],
  E: [{ name: "França", code: "fr" }, { name: "Dinamarca", code: "dk" }, { name: "Tunísia", code: "tn" }, { name: "Austrália", code: "au" }],
  F: [{ name: "Espanha", code: "es" }, { name: "Portugal", code: "pt" }, { name: "Uruguai", code: "uy" }, { name: "Gana", code: "gh" }],
  G: [{ name: "Holanda", code: "nl" }, { name: "Senegal", code: "sn" }, { name: "Equador", code: "ec" }, { name: "Suíça", code: "ch" }],
  H: [{ name: "Argentina", code: "ar" }, { name: "Sérvia", code: "rs" }, { name: "Colômbia", code: "co" }, { name: "Catar", code: "qa" }],
  I: [{ name: "Itália", code: "it" }, { name: "Chile", code: "cl" }, { name: "Coreia do Sul", code: "kr" }, { name: "Turquia", code: "tr" }],
  J: [{ name: "Ucrânia", code: "ua" }, { name: "Áustria", code: "at" }, { name: "Argélia", code: "dz" }, { name: "Egito", code: "eg" }],
  K: [{ name: "Costa do Marfim", code: "ci" }, { name: "Peru", code: "pe" }, { name: "Mali", code: "ml" }, { name: "Bolívia", code: "bo" }],
  L: [{ name: "Paraguai", code: "py" }, { name: "Venezuela", code: "ve" }, { name: "Honduras", code: "hn" }, { name: "Jamaica", code: "jm" }],
};

// ── Group Matches ─────────────────────────────────────────────────────────────

interface GroupMatch {
  id: number;
  group: GroupKey;
  matchday: 1 | 2 | 3;
  home: Team;
  away: Team;
  date: string;
  venue: string;
  city: string;
}

function buildGroupMatches(): GroupMatch[] {
  const keys = Object.keys(GROUPS_TEAMS) as GroupKey[];
  const matches: GroupMatch[] = [];
  keys.forEach((group, gi) => {
    const teams = GROUPS_TEAMS[group];
    const md1Day = 12 + Math.floor(gi / 2);
    const md2Day = 20 + Math.floor(gi / 2);
    const md3Day = 26 + Math.floor(gi / 6);
    const baseId = (gi + 1) * 100;
    const v = (n: number) => VENUES[(gi * 6 + n) % VENUES.length];
    matches.push(
      { id: baseId + 1, group, matchday: 1, home: teams[0], away: teams[1], date: `2026-06-${String(md1Day).padStart(2, "0")}T17:00:00Z`, venue: v(0).name, city: v(0).city },
      { id: baseId + 2, group, matchday: 1, home: teams[2], away: teams[3], date: `2026-06-${String(md1Day).padStart(2, "0")}T20:00:00Z`, venue: v(1).name, city: v(1).city },
      { id: baseId + 3, group, matchday: 2, home: teams[0], away: teams[2], date: `2026-06-${String(md2Day).padStart(2, "0")}T18:00:00Z`, venue: v(2).name, city: v(2).city },
      { id: baseId + 4, group, matchday: 2, home: teams[1], away: teams[3], date: `2026-06-${String(md2Day).padStart(2, "0")}T21:00:00Z`, venue: v(3).name, city: v(3).city },
      { id: baseId + 5, group, matchday: 3, home: teams[0], away: teams[3], date: `2026-06-${String(md3Day).padStart(2, "0")}T20:00:00Z`, venue: v(4).name, city: v(4).city },
      { id: baseId + 6, group, matchday: 3, home: teams[1], away: teams[2], date: `2026-06-${String(md3Day).padStart(2, "0")}T20:00:00Z`, venue: v(5).name, city: v(5).city },
    );
  });
  return matches;
}

const GROUP_MATCHES = buildGroupMatches();

// ── Knockout Matches ──────────────────────────────────────────────────────────

interface KnockoutMatch {
  id: number;
  homeLabel: string;
  awayLabel: string;
  date: string;
  venue: string;
  city: string;
}

const KNOCKOUT: Partial<Record<PhaseKey, KnockoutMatch[]>> = {
  dezesseis: [
    { id: 9001, homeLabel: "1º Grupo A",                      awayLabel: "2º Grupo C",                      date: "2026-07-01T17:00:00Z", venue: "SoFi Stadium",            city: "Los Angeles"      },
    { id: 9002, homeLabel: "1º Grupo B",                      awayLabel: "2º Grupo D",                      date: "2026-07-01T20:00:00Z", venue: "MetLife Stadium",          city: "Nova York"        },
    { id: 9003, homeLabel: "1º Grupo E",                      awayLabel: "2º Grupo G",                      date: "2026-07-02T17:00:00Z", venue: "AT&T Stadium",             city: "Dallas"           },
    { id: 9004, homeLabel: "1º Grupo F",                      awayLabel: "2º Grupo H",                      date: "2026-07-02T20:00:00Z", venue: "Rose Bowl",                city: "Los Angeles"      },
    { id: 9005, homeLabel: "1º Grupo I",                      awayLabel: "2º Grupo K",                      date: "2026-07-03T17:00:00Z", venue: "Levi's Stadium",           city: "São Francisco"    },
    { id: 9006, homeLabel: "1º Grupo J",                      awayLabel: "2º Grupo L",                      date: "2026-07-03T20:00:00Z", venue: "Arrowhead Stadium",        city: "Kansas City"      },
    { id: 9007, homeLabel: "1º Grupo C",                      awayLabel: "2º Grupo A",                      date: "2026-07-04T17:00:00Z", venue: "Gillette Stadium",         city: "Boston"           },
    { id: 9008, homeLabel: "1º Grupo D",                      awayLabel: "2º Grupo B",                      date: "2026-07-04T20:00:00Z", venue: "Hard Rock Stadium",        city: "Miami"            },
    { id: 9009, homeLabel: "1º Grupo G",                      awayLabel: "2º Grupo E",                      date: "2026-07-05T17:00:00Z", venue: "Mercedes-Benz Stadium",    city: "Atlanta"          },
    { id: 9010, homeLabel: "1º Grupo H",                      awayLabel: "2º Grupo F",                      date: "2026-07-05T20:00:00Z", venue: "Lincoln Financial Field",  city: "Philadelphia"     },
    { id: 9011, homeLabel: "1º Grupo K",                      awayLabel: "2º Grupo I",                      date: "2026-07-06T17:00:00Z", venue: "BMO Field",                city: "Toronto"          },
    { id: 9012, homeLabel: "1º Grupo L",                      awayLabel: "2º Grupo J",                      date: "2026-07-06T20:00:00Z", venue: "BC Place",                 city: "Vancouver"        },
    { id: 9013, homeLabel: "3º melhor Grupo A/B/C/D",         awayLabel: "3º melhor Grupo E/F/G/H",         date: "2026-07-07T17:00:00Z", venue: "Estadio Azteca",           city: "Cidade do México" },
    { id: 9014, homeLabel: "3º melhor Grupo E/F/G/H",         awayLabel: "3º melhor Grupo I/J/K/L",         date: "2026-07-07T20:00:00Z", venue: "Estadio BBVA",             city: "Monterrey"        },
    { id: 9015, homeLabel: "3º melhor Grupo A/B/C/D",         awayLabel: "3º melhor Grupo I/J/K/L",         date: "2026-07-08T17:00:00Z", venue: "Estadio Akron",            city: "Guadalajara"      },
    { id: 9016, homeLabel: "3º Grupo restante",               awayLabel: "3º Grupo restante",               date: "2026-07-08T20:00:00Z", venue: "MetLife Stadium",          city: "Nova York"        },
  ],
  oitavas: [
    { id: 9017, homeLabel: "Venc. Jogo 1 (16 Avos)",  awayLabel: "Venc. Jogo 2 (16 Avos)",  date: "2026-07-10T17:00:00Z", venue: "SoFi Stadium",          city: "Los Angeles"      },
    { id: 9018, homeLabel: "Venc. Jogo 3 (16 Avos)",  awayLabel: "Venc. Jogo 4 (16 Avos)",  date: "2026-07-10T20:00:00Z", venue: "MetLife Stadium",        city: "Nova York"        },
    { id: 9019, homeLabel: "Venc. Jogo 5 (16 Avos)",  awayLabel: "Venc. Jogo 6 (16 Avos)",  date: "2026-07-11T17:00:00Z", venue: "AT&T Stadium",           city: "Dallas"           },
    { id: 9020, homeLabel: "Venc. Jogo 7 (16 Avos)",  awayLabel: "Venc. Jogo 8 (16 Avos)",  date: "2026-07-11T20:00:00Z", venue: "Rose Bowl",              city: "Los Angeles"      },
    { id: 9021, homeLabel: "Venc. Jogo 9 (16 Avos)",  awayLabel: "Venc. Jogo 10 (16 Avos)", date: "2026-07-12T17:00:00Z", venue: "Mercedes-Benz Stadium",  city: "Atlanta"          },
    { id: 9022, homeLabel: "Venc. Jogo 11 (16 Avos)", awayLabel: "Venc. Jogo 12 (16 Avos)", date: "2026-07-12T20:00:00Z", venue: "Hard Rock Stadium",      city: "Miami"            },
    { id: 9023, homeLabel: "Venc. Jogo 13 (16 Avos)", awayLabel: "Venc. Jogo 14 (16 Avos)", date: "2026-07-13T17:00:00Z", venue: "BMO Field",              city: "Toronto"          },
    { id: 9024, homeLabel: "Venc. Jogo 15 (16 Avos)", awayLabel: "Venc. Jogo 16 (16 Avos)", date: "2026-07-13T20:00:00Z", venue: "Estadio Azteca",         city: "Cidade do México" },
  ],
  quartas: [
    { id: 9025, homeLabel: "Venc. Oitavas Jogo 1", awayLabel: "Venc. Oitavas Jogo 2", date: "2026-07-15T17:00:00Z", venue: "MetLife Stadium", city: "Nova York"    },
    { id: 9026, homeLabel: "Venc. Oitavas Jogo 3", awayLabel: "Venc. Oitavas Jogo 4", date: "2026-07-15T20:00:00Z", venue: "SoFi Stadium",    city: "Los Angeles"  },
    { id: 9027, homeLabel: "Venc. Oitavas Jogo 5", awayLabel: "Venc. Oitavas Jogo 6", date: "2026-07-16T17:00:00Z", venue: "AT&T Stadium",    city: "Dallas"       },
    { id: 9028, homeLabel: "Venc. Oitavas Jogo 7", awayLabel: "Venc. Oitavas Jogo 8", date: "2026-07-16T20:00:00Z", venue: "Estadio Azteca",  city: "Cidade do México" },
  ],
  semi: [
    { id: 9029, homeLabel: "Venc. Quartas Jogo 1", awayLabel: "Venc. Quartas Jogo 2", date: "2026-07-19T20:00:00Z", venue: "MetLife Stadium", city: "Nova York"   },
    { id: 9030, homeLabel: "Venc. Quartas Jogo 3", awayLabel: "Venc. Quartas Jogo 4", date: "2026-07-20T20:00:00Z", venue: "SoFi Stadium",    city: "Los Angeles" },
  ],
  final: [
    { id: 9031, homeLabel: "Venc. Semifinal 1", awayLabel: "Venc. Semifinal 2", date: "2026-07-26T20:00:00Z", venue: "MetLife Stadium", city: "Nova York" },
  ],
};

// ── Sub-components ────────────────────────────────────────────────────────────


interface GroupMatchCardProps {
  match: GroupMatch;
}

function GroupMatchCard({ match }: GroupMatchCardProps) {
  const dateObj = new Date(match.date);
  const dateStr = dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const timeStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link href={`/pages/user/bolao/${match.id}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          cursor: "pointer",
          mb: 1.5,
          transition: "transform 0.15s, box-shadow 0.15s",
          "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", p: 2, gap: 1.5 }}>
          {/* Home team */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.75 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://flagcdn.com/w40/${match.home.code}.png`}
              width={32}
              height={22}
              style={{ borderRadius: 3, objectFit: "cover" }}
              alt={match.home.name}
            />
            <Typography sx={{ color: "#0A0A0A", fontWeight: 700, fontSize: "0.8rem" }} noWrap>
              {match.home.name}
            </Typography>
          </Box>

          {/* Center */}
          <Box sx={{ textAlign: "center", flexShrink: 0 }}>
            <Typography sx={{ color: "#6B6B6B", fontSize: "0.65rem" }}>
              {dateStr} · {timeStr}
            </Typography>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.6rem", mt: 0.5 }}>
              {match.venue} · {match.city}
            </Typography>
            <Box
              sx={{
                mt: 0.5,
                backgroundColor: "rgba(0,148,64,0.07)",
                border: "1px solid rgba(0,148,64,0.15)",
                borderRadius: "6px",
                px: 1,
                py: 0.25,
                display: "inline-block",
              }}
            >
              <Typography sx={{ color: "#009440", fontSize: "0.58rem", fontWeight: 700 }}>
                Rodada {match.matchday}
              </Typography>
            </Box>
          </Box>

          {/* Away team */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.75 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://flagcdn.com/w40/${match.away.code}.png`}
              width={32}
              height={22}
              style={{ borderRadius: 3, objectFit: "cover" }}
              alt={match.away.name}
            />
            <Typography sx={{ color: "#0A0A0A", fontWeight: 700, fontSize: "0.8rem", textAlign: "right" }} noWrap>
              {match.away.name}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Link>
  );
}

interface KnockoutMatchCardProps {
  match: KnockoutMatch;
}

function KnockoutMatchCard({ match }: KnockoutMatchCardProps) {
  const dateObj = new Date(match.date);
  const dateStr = dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <Box sx={{ ...GLASS_CARD, p: 2, mb: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
        <Typography sx={{ color: "#6B6B6B", fontSize: "0.65rem", fontWeight: 700, flexShrink: 0 }}>
          {dateStr} · {timeStr}
        </Typography>
        <Typography sx={{ color: "#9E9E9E", fontSize: "0.62rem", textAlign: "right" }}>
          {match.venue} · {match.city}
        </Typography>
      </Box>

      {/* Teams */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: "#0A0A0A", fontWeight: 700, fontSize: "0.875rem" }}>A Definir</Typography>
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.68rem", fontStyle: "italic" }}>
            {match.homeLabel}
          </Typography>
        </Box>
        <Typography sx={{ color: "#9E9E9E", fontWeight: 700, fontSize: "0.875rem", flexShrink: 0 }}>
          ×
        </Typography>
        <Box sx={{ flex: 1, textAlign: "right" }}>
          <Typography sx={{ color: "#0A0A0A", fontWeight: 700, fontSize: "0.875rem" }}>A Definir</Typography>
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.68rem", fontStyle: "italic" }}>
            {match.awayLabel}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ── Minhas Apostas ────────────────────────────────────────────────────────────

function BetCard({ bet }: { bet: SavedBet }) {
  return (
    <Link href={`/pages/user/bolao/${bet.fixture_id}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          ...GLASS_CARD,
          flexShrink: 0,
          width: 180,
          p: 1.5,
          cursor: "pointer",
          transition: "transform 0.15s, box-shadow 0.15s",
          "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
        }}
      >
        {/* Times */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, flex: 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://flagcdn.com/w40/${bet.home_code}.png`} width={28} height={19} style={{ borderRadius: 3, objectFit: "cover" }} alt={bet.home_team} />
            <Typography sx={{ color: "#0A0A0A", fontWeight: 700, fontSize: "0.6rem", textAlign: "center" }} noWrap>
              {bet.home_team}
            </Typography>
          </Box>

          {/* Placar */}
          <Box sx={{ textAlign: "center", px: 0.5 }}>
            <Typography sx={{
              color: "#009440", fontFamily: '"Montserrat"',
              fontWeight: 900, fontSize: "1.3rem", lineHeight: 1,
              letterSpacing: "-1px",
            }}>
              {bet.home_score}×{bet.away_score}
            </Typography>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.55rem", mt: 0.25 }}>
              seu palpite
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, flex: 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://flagcdn.com/w40/${bet.away_code}.png`} width={28} height={19} style={{ borderRadius: 3, objectFit: "cover" }} alt={bet.away_team} />
            <Typography sx={{ color: "#0A0A0A", fontWeight: 700, fontSize: "0.6rem", textAlign: "center" }} noWrap>
              {bet.away_team}
            </Typography>
          </Box>
        </Box>

        {/* Badge pendente */}
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5,
          backgroundColor: "rgba(0,148,64,0.07)", borderRadius: "6px",
          border: "1px solid rgba(0,148,64,0.18)", py: 0.4,
        }}>
          <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#009440" }} />
          <Typography sx={{ color: "#009440", fontSize: "0.58rem", fontWeight: 700, fontFamily: '"Montserrat"' }}>
            Aposta confirmada
          </Typography>
        </Box>
      </Box>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JogosPage() {
  const [activePhase, setActivePhase] = useState<PhaseKey>("grupos");
  const [selectedGroup, setSelectedGroup] = useState<GroupKey>("A");
  const [savedBets, setSavedBets] = useState<SavedBet[]>([]);

  const { data: liveFixtures } = useBrazilLive();
  const liveGame = liveFixtures?.[0] ?? null;

  useEffect(() => { setSavedBets(getSavedBets()); }, []);

  const groupMatches = GROUP_MATCHES.filter((m) => m.group === selectedGroup);
  const knockoutMatches = KNOCKOUT[activePhase] ?? [];

  return (
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
            backgroundColor: "#FFFFFF",
          }}
        >
          <TopBar title="Quer apostar?" light />

          <Box
            sx={{
              px: `${LAYOUT.pagePaddingX}px`,
              pt: 2,
              maxWidth: LAYOUT.feedMaxWidth,
              mx: "auto",
            }}
          >
            {liveGame && <LiveScoreBanner fixture={liveGame} />}

            {/* Minhas Apostas */}
            {savedBets.length > 0 && (
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
                  <EmojiEventsOutlinedIcon sx={{ fontSize: "1rem", color: "#009440" }} />
                  <Typography sx={{ color: "#0A0A0A", fontWeight: 700, fontSize: "0.875rem", fontFamily: '"Montserrat"' }}>
                    Minhas apostas
                  </Typography>
                  <Box sx={{
                    ml: "auto", backgroundColor: "#009440", borderRadius: "100px",
                    px: 1, py: 0.25,
                  }}>
                    <Typography sx={{ color: "#fff", fontSize: "0.65rem", fontWeight: 700, fontFamily: '"Montserrat"' }}>
                      {savedBets.length}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{
                  display: "flex", gap: 1.25, overflowX: "auto", pb: 1,
                  "&::-webkit-scrollbar": { display: "none" },
                }}>
                  {savedBets.map((bet) => (
                    <BetCard key={bet.fixture_id} bet={bet} />
                  ))}
                </Box>
              </Box>
            )}

            {/* Phase tabs */}
            <Tabs
              value={activePhase}
              onChange={(_, v: PhaseKey) => setActivePhase(v)}
              variant="scrollable"
              scrollButtons={false}
              sx={{
                mb: 2,
                "& .MuiTabs-indicator": { backgroundColor: "#009440" },
                "& .MuiTab-root": {
                  color: "#6B6B6B",
                  fontFamily: "var(--font-syne), Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "none",
                  minWidth: "auto",
                  px: 1.5,
                },
                "& .Mui-selected": { color: "#009440" },
              }}
            >
              {PHASES.map((phase) => (
                <Tab key={phase.key} value={phase.key} label={phase.label} />
              ))}
            </Tabs>

            {/* Groups tab */}
            {activePhase === "grupos" && (
              <>
                {/* Group selector pills */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    overflowX: "auto",
                    pb: 1,
                    mb: 2,
                    "&::-webkit-scrollbar": { display: "none" },
                  }}
                >
                  {(Object.keys(GROUPS_TEAMS) as GroupKey[]).map((g) => (
                    <Box
                      key={g}
                      onClick={() => setSelectedGroup(g)}
                      sx={{
                        flexShrink: 0,
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        backgroundColor: selectedGroup === g ? "#009440" : "rgba(255,255,255,0.6)",
                        border: selectedGroup === g ? "1px solid #009440" : "1px solid rgba(0,0,0,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <Typography
                        sx={{
                          color: selectedGroup === g ? "#FFF" : "#0A0A0A",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                        }}
                      >
                        {g}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Group label */}
                <Typography
                  sx={{
                    color: "#0A0A0A",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    mb: 1.5,
                  }}
                >
                  Grupo {selectedGroup}
                </Typography>

                {/* Group match cards */}
                {groupMatches.map((match) => (
                  <GroupMatchCard key={match.id} match={match} />
                ))}
              </>
            )}

            {/* Knockout tabs */}
            {activePhase !== "grupos" && (
              <>
                {knockoutMatches.length === 0 ? (
                  <Typography sx={{ color: "#6B6B6B", textAlign: "center", py: 4 }}>
                    Confrontos a confirmar após a fase de grupos.
                  </Typography>
                ) : (
                  knockoutMatches.map((match) => (
                    <KnockoutMatchCard key={match.id} match={match} />
                  ))
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
      <BottomNav />
    </>
  );
}
