"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Box, Typography, Chip, Skeleton, Drawer, IconButton } from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SquareIcon from "@mui/icons-material/Square";
import TvIcon from "@mui/icons-material/Tv";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import {
  getBrazilFixtures,
  getBrazilLive,
  getBrazilStats,
  getFixtureEvents,
  getWcStandings,
  mockLiveOn,
  mockLiveOff,
  isLive,
  isFinished,
  ROUND_TO_PHASE,
  BrazilFixture,
  BrazilStats,
  FixtureEvent,
  StandingTeam,
  FixtureTeam,
} from "@/app/services/football/footballService";

interface Props {
  eventId: number;
}

const BRAZIL_TEAM_ID = 6;

const PHASES = [
  { key: "grupos",     label: "Grupos"   },
  { key: "dezesseis",  label: "16 avos"  },
  { key: "oitavas",    label: "Oitavas"  },
  { key: "quartas",    label: "Quartas"  },
  { key: "semi",       label: "Semi"     },
  { key: "final",      label: "Final"    },
];

const PHASE_LABEL: Record<string, string> = {
  grupos:    "Fase de Grupos",
  dezesseis: "16 avos de Final",
  oitavas:   "Oitavas de Final",
  quartas:   "Quartas de Final",
  semi:      "Semifinal",
  final:     "Final",
};

// ─── Flags ────────────────────────────────────────────────────────────────────

const TEAM_FLAGS: Record<string, string> = {
  "Brasil": "br", "Argentina": "ar", "Colômbia": "co", "Equador": "ec",
  "Uruguai": "uy", "Venezuela": "ve", "Paraguai": "py", "Bolívia": "bo",
  "Peru": "pe", "Chile": "cl",
  "Estados Unidos": "us", "México": "mx", "Canadá": "ca", "Costa Rica": "cr",
  "Honduras": "hn", "Panamá": "pa", "Jamaica": "jm", "Trinidad e Tobago": "tt", "Haiti": "ht",
  "Alemanha": "de", "França": "fr", "Espanha": "es", "Portugal": "pt",
  "Itália": "it", "Países Baixos": "nl", "Bélgica": "be", "Croácia": "hr",
  "Suíça": "ch", "Dinamarca": "dk", "Polônia": "pl", "Sérvia": "rs",
  "República Tcheca": "cz", "Eslováquia": "sk", "Hungria": "hu",
  "Romênia": "ro", "Grécia": "gr", "Turquia": "tr", "Ucrânia": "ua",
  "Rússia": "ru", "Suécia": "se", "Noruega": "no", "Finlândia": "fi",
  "Áustria": "at", "Albânia": "al", "Islândia": "is", "Irlanda": "ie",
  "Macedônia do Norte": "mk", "Eslovênia": "si", "Bósnia e Herzegovina": "ba",
  "Inglaterra": "gb-eng", "Escócia": "gb-sct", "Gales": "gb-wls",
  "Japão": "jp", "Coreia do Sul": "kr", "Austrália": "au",
  "Arábia Saudita": "sa", "Irã": "ir", "Catar": "qa", "China": "cn",
  "Índia": "in", "Tailândia": "th", "Vietnã": "vn", "Indonésia": "id",
  "Filipinas": "ph", "Iraque": "iq", "Síria": "sy", "Jordânia": "jo",
  "Omã": "om", "Emirados Árabes Unidos": "ae",
  "Marrocos": "ma", "Senegal": "sn", "Nigéria": "ng", "Camarões": "cm",
  "Gana": "gh", "Egito": "eg", "Argélia": "dz", "Costa do Marfim": "ci",
  "África do Sul": "za", "Mali": "ml", "Tunísia": "tn",
  "Nova Zelândia": "nz",
};

function FlagImage({ name, size = 48 }: { name: string; size?: number }) {
  const code = TEAM_FLAGS[name];
  const h = Math.round(size * 0.67);
  if (!code) {
    return (
      <Box sx={{ width: size, height: h, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SportsSoccerIcon sx={{ fontSize: size * 0.35, color: "rgba(255,255,255,0.25)" }} />
      </Box>
    );
  }
  return (
    <Box
      component="img"
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={name}
      sx={{
        width: size, height: h,
        objectFit: "cover", borderRadius: 1, display: "block",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
      }}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { date: `${dd}/${mm}`, time: `${hh}:${min}` };
}

function EventTypeIcon({ ev }: { ev: FixtureEvent }) {
  const type = (ev.type as string)?.toLowerCase() ?? "";
  const detail = ev.detail?.toLowerCase() ?? "";
  const sx = { color: eventColor(ev), fontSize: 16, flexShrink: 0, mt: 0.15 };
  if (type === "gol" || type === "goal") return <SportsSoccerIcon sx={sx} />;
  if (type === "cartão" || type === "card") {
    return <SquareIcon sx={sx} />;
  }
  if (detail.includes("falta") || detail.includes("foul")) return <ReportProblemOutlinedIcon sx={sx} />;
  if (type === "substituição" || type === "subst") return <CompareArrowsIcon sx={sx} />;
  if (type === "var") return <TvIcon sx={sx} />;
  return <DescriptionOutlinedIcon sx={sx} />;
}

function eventLabel(ev: FixtureEvent) {
  const type = (ev.type as string)?.toLowerCase() ?? "";
  const detail = ev.detail?.toLowerCase() ?? "";
  if (type === "gol" || type === "goal") return `GOOOOL! ${ev.team.name.toUpperCase()}!`;
  if ((type === "cartão" || type === "card") && (detail.includes("vermelho") || detail.includes("red"))) return "Cartão vermelho";
  if (type === "cartão" || type === "card") return "Cartão amarelo";
  if (detail.includes("falta") || detail.includes("foul")) return "Falta";
  if (type === "substituição" || type === "subst") return "Substituição";
  return ev.detail;
}

function eventColor(ev: FixtureEvent) {
  const type = (ev.type as string)?.toLowerCase() ?? "";
  const detail = ev.detail?.toLowerCase() ?? "";
  if (type === "gol" || type === "goal") return "#31E46A";
  if ((type === "cartão" || type === "card") && (detail.includes("vermelho") || detail.includes("red"))) return "#E8175D";
  if (type === "cartão" || type === "card") return "#FFD100";
  return "rgba(255,255,255,0.72)";
}

// ─── StatusChip ───────────────────────────────────────────────────────────────

function StatusChip({ fixture }: { fixture: BrazilFixture }) {
  if (isLive(fixture)) {
    return (
      <Chip
        label={fixture.fixture.status.elapsed ? `${fixture.fixture.status.elapsed}'` : "AO VIVO"}
        size="small"
        sx={{
          bgcolor: "#008542", color: "#fff", fontWeight: 800, fontSize: 10, height: 20,
          animation: "blink 1.4s ease-in-out infinite",
          "@keyframes blink": { "0%": { opacity: 1 }, "50%": { opacity: 0.65 }, "100%": { opacity: 1 } },
        }}
      />
    );
  }
  if (isFinished(fixture)) {
    return (
      <Chip
        label="Encerrado"
        size="small"
        sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", fontWeight: 600, fontSize: 10, height: 20 }}
      />
    );
  }
  const { date, time } = formatDate(fixture.fixture.date);
  return (
    <Chip
      label={`${date} · ${time}`}
      size="small"
      sx={{ bgcolor: "rgba(0,133,66,0.12)", color: "#008542", fontWeight: 700, fontSize: 10, height: 20 }}
    />
  );
}

// ─── ScoreDisplay ─────────────────────────────────────────────────────────────

function ScoreDisplay({ fixture }: { fixture: BrazilFixture }) {
  const live = isLive(fixture);
  const done = isFinished(fixture);
  const { home, away } = fixture.goals;

  if (live || done) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: 30, fontWeight: 900, color: live ? "#008542" : "#FFD100", letterSpacing: 3 }}>
          {home ?? 0} x {away ?? 0}
        </Typography>
        {live && (
          <Typography sx={{ fontSize: 9, color: "#008542", fontWeight: 800 }}>
            {fixture.fixture.status.elapsed ? `${fixture.fixture.status.elapsed}'` : "AO VIVO"}
          </Typography>
        )}
        {done && (
          <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>Encerrado</Typography>
        )}
      </Box>
    );
  }

  const { time } = formatDate(fixture.fixture.date);
  return (
    <Box sx={{ textAlign: "center" }}>
      <Box sx={{ bgcolor: "rgba(0,133,66,0.12)", borderRadius: 2, px: 1.5, py: 0.8, mb: 0.5 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#008542", letterSpacing: 2 }}>VS</Typography>
      </Box>
      <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>{time}</Typography>
    </Box>
  );
}

// ─── GameCard ─────────────────────────────────────────────────────────────────

function GameCard({
  fixture,
  phase,
  index,
  onClick,
}: {
  fixture: BrazilFixture;
  phase: string;
  index: number;
  onClick: () => void;
}) {
  const live = isLive(fixture);
  const { home, away } = fixture.teams;

  return (
    <Box
      onClick={onClick}
      sx={{
        mb: 2, borderRadius: CAZE_RADIUS.md, overflow: "hidden", cursor: "pointer",
        boxShadow: "0 2px 12px rgba(0,0,0,0.32)",
        bgcolor: "#151c2e",
        border: "1px solid rgba(255,255,255,0.08)",
        "&:active": { transform: "scale(0.985)" },
        transition: "all 0.15s",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2, py: 0.8,
          background: index === 0 ? "rgba(0,133,66,0.12)" : "#1A1A2E",
          display: "flex", alignItems: "center", justifyContent: live ? "center" : "space-between",
        }}
      >
        {live ? (
          <Typography sx={{ fontSize: 10, fontWeight: 800, color: "#008542", letterSpacing: 1 }}>
            JOGO AO VIVO
          </Typography>
        ) : (
          <>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.72)", letterSpacing: 0.5 }}>
              {PHASE_LABEL[phase]}
            </Typography>
            <StatusChip fixture={fixture} />
          </>
        )}
      </Box>

      {/* Times */}
      <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8 }}>
          <FlagImage name={home.name} size={56} />
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#FFFFFF", textAlign: "center" }}>{home.name}</Typography>
        </Box>
        <Box sx={{ flex: "0 0 auto", px: 2 }}>
          <ScoreDisplay fixture={fixture} />
        </Box>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.8 }}>
          <FlagImage name={away.name} size={56} />
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#FFFFFF", textAlign: "center" }}>{away.name}</Typography>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2, py: 0.8, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
          <LocationOnIcon sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }} />
          <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.35)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fixture.fixture.venue.name}, {fixture.fixture.venue.city}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
          <Typography sx={{ fontSize: 10, color: "#008542", fontWeight: 700 }}>
            {live ? "Ver ao vivo" : "Ver detalhes"}
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 13, color: "#008542" }} />
        </Box>
      </Box>
    </Box>
  );
}

const ELIM_PHASES = PHASES.filter((p) => p.key !== "grupos");

// ─── StandingsTable ───────────────────────────────────────────────────────────

function buildMockStandingsGroup(grupoFixtures: BrazilFixture[]): StandingTeam[] {
  const map = new Map<number, FixtureTeam>();
  for (const f of grupoFixtures) {
    map.set(f.teams.home.id, f.teams.home);
    map.set(f.teams.away.id, f.teams.away);
  }
  const sorted = [
    ...Array.from(map.values()).filter((t) => t.id === BRAZIL_TEAM_ID),
    ...Array.from(map.values()).filter((t) => t.id !== BRAZIL_TEAM_ID),
  ];
  const mock = [
    { w: 2, d: 0, l: 0, gf: 5, ga: 1 },
    { w: 1, d: 0, l: 1, gf: 2, ga: 3 },
    { w: 0, d: 1, l: 1, gf: 1, ga: 3 },
    { w: 0, d: 1, l: 1, gf: 1, ga: 2 },
  ];
  return sorted.map((team, i) => {
    const s = mock[i] ?? mock[mock.length - 1];
    return {
      rank: i + 1,
      team: { id: team.id, name: team.name, logo: team.logo },
      points: s.w * 3 + s.d,
      goalsDiff: s.gf - s.ga,
      group: "",
      form: "",
      all: { played: s.w + s.d + s.l, win: s.w, draw: s.d, lose: s.l, goals: { for: s.gf, against: s.ga } },
    };
  });
}

function buildGroupFromFixtures(fixtures: BrazilFixture[]): StandingTeam[] {
  const map = new Map<number, FixtureTeam>();
  for (const f of fixtures) {
    map.set(f.teams.home.id, f.teams.home);
    map.set(f.teams.away.id, f.teams.away);
  }
  return Array.from(map.values()).map((t, i) => ({
    rank: i + 1,
    team: { id: t.id, name: t.name, logo: t.logo },
    points: 0, goalsDiff: 0, group: "", form: "",
    all: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
  }));
}

function StandingsTable({
  standings,
  grupoFixtures = [],
  dark = false,
}: {
  standings: StandingTeam[][];
  grupoFixtures?: BrazilFixture[];
  dark?: boolean;
}) {
  const apiGroup = standings.find((g) => g.some((t) => t.team.id === BRAZIL_TEAM_ID)) ?? [];
  const group: StandingTeam[] = apiGroup.length > 0 ? apiGroup : buildGroupFromFixtures(grupoFixtures);
  const groupLabel = apiGroup[0]?.group ?? "";
  const hasRealData = apiGroup.length > 0;

  const c = {
    title: dark ? "#fff" : "#111",
    empty: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)",
    header: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)",
    rowBg: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    rowBorder: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    rank: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
    name: dark ? "#fff" : "#111",
    brazilName: dark ? "#008542" : "#8a6500",
    val: dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
    pts: dark ? "#fff" : "#111",
    brazilPts: dark ? "#008542" : "#8a6500",
    dash: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)",
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box sx={{ width: 4, height: 16, bgcolor: "#2196f3", borderRadius: 1 }} />
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: c.title }}>
          {groupLabel ? `Classificação — ${groupLabel}` : "Classificação do Grupo"}
        </Typography>
      </Box>

      {group.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography sx={{ fontSize: 12, color: c.empty }}>
            Disponível após o início da fase de grupos
          </Typography>
        </Box>
      ) : (
        <>
          {/* Cabeçalho */}
          <Box sx={{ display: "grid", gridTemplateColumns: "22px 1fr 26px 26px 26px 26px 30px", gap: 0.5, px: 1, mb: 0.5 }}>
            {["", "Time", "J", "V", "E", "D", "Pts"].map((h, i) => (
              <Typography key={i} sx={{ fontSize: 9, fontWeight: 700, color: c.header, textAlign: h && h !== "Time" ? "center" : "left" }}>
                {h}
              </Typography>
            ))}
          </Box>
          {group.map((team) => {
            const isBrazil = team.team.id === BRAZIL_TEAM_ID;
            return (
              <Box
                key={team.team.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "22px 1fr 26px 26px 26px 26px 30px",
                  alignItems: "center",
                  gap: 0.5, px: 1, py: 0.8, mb: 0.3, borderRadius: 1.5,
                  bgcolor: isBrazil ? "rgba(0,148,64,0.08)" : c.rowBg,
                  border: `1px solid ${isBrazil ? "rgba(0,148,64,0.3)" : c.rowBorder}`,
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: c.rank, textAlign: "center" }}>
                  {team.rank}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, overflow: "hidden" }}>
                  <FlagImage name={team.team.name} size={26} />
                  <Typography sx={{ fontSize: 11, fontWeight: isBrazil ? 800 : 500, color: isBrazil ? c.brazilName : c.name, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {team.team.name}
                  </Typography>
                </Box>
                {hasRealData
                  ? [team.all.played, team.all.win, team.all.draw, team.all.lose, team.points].map((val, i) => (
                      <Typography key={i} sx={{ fontSize: 11, fontWeight: i === 4 ? 800 : 400, color: i === 4 ? (isBrazil ? c.brazilPts : c.pts) : c.val, textAlign: "center" }}>
                        {val}
                      </Typography>
                    ))
                  : Array.from({ length: 5 }).map((_, i) => (
                      <Typography key={i} sx={{ fontSize: 11, color: c.dash, textAlign: "center" }}>—</Typography>
                    ))
                }
              </Box>
            );
          })}
        </>
      )}
    </Box>
  );
}

// ─── EventsDrawer ─────────────────────────────────────────────────────────────

function EventsDrawer({
  fixture,
  events,
  loading,
  standings,
  fixturesByPhase,
  onPhaseSelect,
  onClose,
}: {
  fixture: BrazilFixture;
  events: FixtureEvent[];
  loading: boolean;
  standings: StandingTeam[][];
  fixturesByPhase: Record<string, BrazilFixture[]>;
  onPhaseSelect: (key: string) => void;
  onClose: () => void;
}) {
  const live = isLive(fixture);
  const { home, away } = fixture.teams;

  return (
    <>
      {/* Handle + header */}
      <Box
        sx={{
          px: 2, pt: 1.5, pb: 1, bgcolor: "#151c2e",
          position: "sticky", top: 0, zIndex: 1,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box sx={{ width: 40, height: 4, bgcolor: "rgba(255,255,255,0.12)", borderRadius: 2, mx: "auto", mb: 1.5 }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#FFFFFF" }}>
                {live ? "Ao vivo agora" : "Resumo da partida"}
              </Typography>
              {live && (
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 0.5,
                  bgcolor: "rgba(0,133,66,0.15)", borderRadius: 1, px: 0.8, py: 0.2,
                }}>
                  <Box sx={{
                    width: 6, height: 6, borderRadius: "50%", bgcolor: "#008542",
                    animation: "blink 1.2s ease-in-out infinite",
                    "@keyframes blink": { "0%": { opacity: 1 }, "50%": { opacity: 0.2 }, "100%": { opacity: 1 } },
                  }} />
                  <Typography sx={{ fontSize: 9, color: "#008542", fontWeight: 800 }}>AO VIVO</Typography>
                </Box>
              )}
            </Box>
            <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              {fixture.league.round} · Copa do Mundo 2026
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: "rgba(255,255,255,0.08)" }}>
            <CloseIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.6)" }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ overflowY: "auto", p: 2, bgcolor: "#151c2e", flex: 1 }}>
        {/* Placar */}
        <Box
          sx={{
            background: live ? "rgba(232,23,93,0.08)" : "#1A1A2E",
            borderRadius: CAZE_RADIUS.md, p: 2.5, mb: 3,
            border: `1px solid ${live ? "rgba(232,23,93,0.2)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <FlagImage name={home.name} size={68} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>{home.name}</Typography>
            </Box>
            <Box sx={{ textAlign: "center", px: 2 }}>
              <Typography sx={{ fontSize: 40, fontWeight: 900, color: live ? "#008542" : "#FFD100", letterSpacing: 4 }}>
                {fixture.goals.home ?? 0} x {fixture.goals.away ?? 0}
              </Typography>
              {live && (
                <Typography sx={{ fontSize: 11, color: "#008542", fontWeight: 800 }}>
                  AO VIVO · {fixture.fixture.status.elapsed}'
                </Typography>
              )}
              {isFinished(fixture) && (
                <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Encerrado</Typography>
              )}
            </Box>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <FlagImage name={away.name} size={68} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>{away.name}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 1.5 }}>
            <LocationOnIcon sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }} />
            <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              {fixture.fixture.venue.name}, {fixture.fixture.venue.city}
            </Typography>
          </Box>
        </Box>

        {/* Eventos */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={42} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1.5 }} />
            ))}
          </Box>
        ) : events.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <SportsSoccerIcon sx={{ fontSize: 40, color: "rgba(255,255,255,0.12)", mb: 1 }} />
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              {live ? "Aguardando eventos…" : "Sem eventos registrados"}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box sx={{ width: 4, height: 16, bgcolor: "#008542", borderRadius: 1 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>Eventos da partida</Typography>
            </Box>
            <Box sx={{ position: "relative" }}>
              {/* Linha vertical */}
              <Box sx={{ position: "absolute", left: 30, top: 0, bottom: 0, width: 2, bgcolor: "rgba(255,255,255,0.08)", zIndex: 0 }} />
              {events.map((ev, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5, position: "relative", zIndex: 1 }}>
                  <Box sx={{ width: 40, flexShrink: 0, textAlign: "right" }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: eventColor(ev) }}>
                      {ev.time.elapsed}{ev.time.extra ? `+${ev.time.extra}` : ""}'
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, pt: 0.3 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                      <EventTypeIcon ev={ev} />
                      <Typography sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: eventColor(ev),
                        lineHeight: 1.3,
                      }}>
                        {eventLabel(ev)}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", mt: 0.3 }}>
                      {ev.player.name}
                      {ev.assist?.name ? ` · assist: ${ev.assist.name}` : ""}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.8, mt: 0.3, flexShrink: 0 }}>
                    <FlagImage name={ev.team.name} size={22} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ─── Tabela de classificação ──────────────────────────────── */}
        <Box sx={{ mb: 3 }}>
          <StandingsTable standings={standings} grupoFixtures={fixturesByPhase["grupos"] ?? []} dark />
        </Box>

        {/* ─── Fase eliminatória ────────────────────────────────────── */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 4, height: 16, bgcolor: "#ff9800", borderRadius: 1 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#FFFFFF" }}>Fase eliminatória</Typography>
          </Box>
          {ELIM_PHASES.map((p) => {
            const count = fixturesByPhase[p.key]?.length ?? 0;
            return (
              <Box
                key={p.key}
                onClick={() => onPhaseSelect(p.key)}
                sx={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  px: 1.5, py: 1.2, mb: 0.5, borderRadius: CAZE_RADIUS.sm, cursor: "pointer",
                  bgcolor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  "&:active": { transform: "scale(0.98)" },
                  transition: "all 0.15s",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF" }}>{PHASE_LABEL[p.key]}</Typography>
                  {count === 0 ? (
                    <Chip label="Em breve" size="small" sx={{ height: 18, fontSize: 9, bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }} />
                  ) : (
                    <Chip label={`${count} ${count === 1 ? "jogo" : "jogos"}`} size="small" sx={{ height: 18, fontSize: 9, bgcolor: "rgba(0,133,66,0.15)", color: "#FFD100" }} />
                  )}
                </Box>
                <ChevronRightIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }} />
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function WorldCupGames({ eventId: _eventId }: Props) {
  const [fixtures, setFixtures] = useState<BrazilFixture[]>([]);
  const [liveFixtures, setLiveFixtures] = useState<BrazilFixture[]>([]);
  const [stats, setStats] = useState<BrazilStats | null>(null);
  const [standings, setStandings] = useState<StandingTeam[][]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState("grupos");
  const [selectedFixture, setSelectedFixture] = useState<BrazilFixture | null>(null);
  const [fixtureEvents, setFixtureEvents] = useState<FixtureEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
  const { isAdmin } = useAuth();

  // Carga inicial — chamadas independentes para que uma falha não bloqueie as outras
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [fix, live, st, stand] = await Promise.all([
        getBrazilFixtures().catch(() => [] as BrazilFixture[]),
        getBrazilLive().catch(() => [] as BrazilFixture[]),
        getBrazilStats().catch(() => null),
        getWcStandings().catch(() => [] as StandingTeam[][]),
      ]);
      if (cancelled) return;

      // Garante que jogos ao vivo aparecem mesmo se /fixtures falhou
      const liveIds = new Set(fix.map((f) => f.fixture.id));
      const merged = [...fix, ...live.filter((f) => !liveIds.has(f.fixture.id))];

      setFixtures(merged);
      setLiveFixtures(live);
      if (st) setStats(st);
      if (stand.length) setStandings(stand);

      if (live.length > 0) {
        const phase = ROUND_TO_PHASE[live[0].league.round];
        if (phase) setActivePhase(phase);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function toggleMock() {
    setMockLoading(true);
    try {
      if (liveFixtures.length > 0) {
        await mockLiveOff();
        const live: BrazilFixture[] = [];
        setLiveFixtures(live);
        setFixtures((prev) => prev.filter((f) => f.fixture.id !== 855744));
      } else {
        await mockLiveOn();
        const live = await getBrazilLive();
        setLiveFixtures(live);
        setFixtures((prev) => {
          const ids = new Set(prev.map((f) => f.fixture.id));
          return [...live.filter((f) => !ids.has(f.fixture.id)), ...prev];
        });
        const phase = ROUND_TO_PHASE[live[0]?.league.round];
        if (phase) setActivePhase(phase);
      }
    } catch {
      // silencia erros de rede
    } finally {
      setMockLoading(false);
    }
  }


  // Poll ao vivo a cada 30s
  useEffect(() => {
    const id = setInterval(() => {
      getBrazilLive().then(setLiveFixtures).catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Carrega eventos ao abrir drawer
  useEffect(() => {
    if (!selectedFixture) { setFixtureEvents([]); return; }
    let cancelled = false;
    setEventsLoading(true);
    getFixtureEvents(selectedFixture.fixture.id)
      .then((ev) => { if (!cancelled) setFixtureEvents(ev); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setEventsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedFixture]);

  // Re-poll eventos se o jogo selecionado estiver ao vivo
  useEffect(() => {
    if (!selectedFixture || !isLive(selectedFixture)) return;
    const id = setInterval(() => {
      getFixtureEvents(selectedFixture.fixture.id).then(setFixtureEvents).catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, [selectedFixture]);

  // Agrupamento por fase
  const fixturesByPhase = fixtures.reduce<Record<string, BrazilFixture[]>>((acc, f) => {
    const phase = ROUND_TO_PHASE[f.league.round] ?? "grupos";
    (acc[phase] = acc[phase] ?? []).push(f);
    return acc;
  }, {});

  const availablePhases = PHASES;

  // Mock: quando simulando ao vivo, substituir stats e standings por dados realistas
  const mockActive = liveFixtures.length > 0;
  const grupoFixturesForMock = fixturesByPhase["grupos"] ?? [];
  const displayStats: BrazilStats | null = mockActive
    ? { jogos: 2, vitorias: 2, empates: 0, gols: 5, grupo: stats?.grupo ?? "E", pontos: 6 }
    : stats;
  const displayStandings: StandingTeam[][] = mockActive && grupoFixturesForMock.length > 0
    ? [buildMockStandingsGroup(grupoFixturesForMock)]
    : standings;

  // Merge dados ao vivo nos fixtures do painel ativo
  const liveById = Object.fromEntries(liveFixtures.map((f) => [f.fixture.id, f]));
  const basePhaseFixtures = fixturesByPhase[activePhase] ?? [];
  const dedupedFixtures = mockActive && activePhase === "grupos" && basePhaseFixtures.length > 1
    ? [basePhaseFixtures[0], ...basePhaseFixtures.slice(2)]
    : basePhaseFixtures;
  const displayFixtures = dedupedFixtures.map((f) => liveById[f.fixture.id] ?? f);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ px: 2, pb: 4 }}>
        <Skeleton variant="rectangular" height={36} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: 1, mb: 3, width: "60%" }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={130} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: CAZE_RADIUS.md, mb: 2 }} />
        ))}
      </Box>
    );
  }

  // ─── Empty ─────────────────────────────────────────────────────────────────
  if (fixtures.length === 0) {
    return (
      <Box sx={{ px: 2, pb: 4, textAlign: "center", pt: 8 }}>
        <SportsSoccerIcon sx={{ fontSize: 52, color: "rgba(255,255,255,0.12)", mb: 1.5 }} />
        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
          Jogos da Copa do Mundo 2026 em breve
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>

      {/* Header de stats */}
      <Box sx={{ px: 2, mb: 2 }}>
        {/* Título */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <SportsSoccerIcon sx={{ color: "#008542", fontSize: 18 }} />
          <Box>
            <Typography sx={{ fontSize: 10, color: "#008542", fontWeight: 700, letterSpacing: 1.2 }}>
              COPA DO MUNDO 2026
            </Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.2 }}>
              Seleção Brasileira
            </Typography>
          </Box>
          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
            {displayStats && (
              <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
                Grupo {displayStats.grupo}
              </Typography>
            )}
            {/* Botão AO VIVO / desligar — visível só para admin */}
            {isAdmin && liveFixtures.length > 0 ? (
              <Box
                onClick={mockLoading ? undefined : toggleMock}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.5,
                  px: 1, py: 0.4, borderRadius: 1.5, cursor: mockLoading ? "default" : "pointer",
                  bgcolor: "rgba(0,133,66,0.2)", border: "1px solid rgba(0,133,66,0.5)",
                  "&:active": { transform: "scale(0.93)" }, opacity: mockLoading ? 0.5 : 1,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#008542", animation: "blink 1.2s ease-in-out infinite", "@keyframes blink": { "0%": { opacity: 1 }, "50%": { opacity: 0.2 }, "100%": { opacity: 1 } } }} />
                <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: "#008542" }}>AO VIVO</Typography>
              </Box>
            ) : isAdmin ? (
              <Box
                onClick={mockLoading ? undefined : toggleMock}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.5,
                  px: 1, py: 0.4, borderRadius: 1.5, cursor: mockLoading ? "default" : "pointer",
                  bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  "&:active": { transform: "scale(0.93)" }, opacity: mockLoading ? 0.5 : 1,
                }}
              >
                <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                <Typography sx={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.3, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>SIMULAR AO VIVO</Typography>
              </Box>
            ) : null}
          </Box>
        </Box>

        {/* Stat boxes */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {[
            { label: "Jogos",    value: displayStats ? String(displayStats.jogos)    : "—" },
            { label: "Vitórias", value: displayStats ? String(displayStats.vitorias) : "—" },
            { label: "Gols",     value: displayStats ? String(displayStats.gols)     : "—" },
            { label: "Pontos",   value: displayStats ? String(displayStats.pontos)   : "—" },
          ].map((s) => (
            <Box
              key={s.label}
              sx={{
                flex: 1, textAlign: "center",
                bgcolor: "rgba(255,255,255,0.04)",
                borderRadius: CAZE_RADIUS.sm, py: 0.9,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#008542" }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 600, mt: 0.1 }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Banner ao vivo */}
      {liveFixtures.length > 0 && (
        <Box
          onClick={() => setSelectedFixture(liveFixtures[0])}
          sx={{
            mx: 2, mb: 2, px: 2, py: 1.2, borderRadius: CAZE_RADIUS.md, cursor: "pointer",
            background: "linear-gradient(90deg, #006630, #009440)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 8, height: 8, borderRadius: "50%", bgcolor: "#fff",
              animation: "blink 1.2s ease-in-out infinite",
              "@keyframes blink": { "0%": { opacity: 1 }, "50%": { opacity: 0.2 }, "100%": { opacity: 1 } },
            }} />
            <Box>
              <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 700, letterSpacing: 1 }}>
                AO VIVO AGORA
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#fff", fontWeight: 900 }}>
                {liveFixtures[0].teams.home.name}{" "}
                {liveFixtures[0].goals.home ?? 0} x {liveFixtures[0].goals.away ?? 0}{" "}
                {liveFixtures[0].teams.away.name}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
              {liveFixtures[0].fixture.status.elapsed}'
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.75)" }} />
          </Box>
        </Box>
      )}

      {/* Tabs de fase */}
      <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)", mb: 2 }}>
        <Box sx={{ display: "flex", overflowX: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
          {availablePhases.map((p) => {
            const active = activePhase === p.key;
            const count = fixturesByPhase[p.key]?.length ?? 0;
            return (
              <Box
                key={p.key}
                onClick={() => setActivePhase(p.key)}
                sx={{
                  flex: "0 0 auto", px: 2.5, py: 1.2, cursor: "pointer", textAlign: "center",
                  borderBottom: active ? "2px solid #008542" : "2px solid transparent",
                  transition: "border-color 0.2s",
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: active ? 800 : 500, color: active ? "#008542" : "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
                  {p.label}
                </Typography>
                <Typography sx={{ fontSize: 9, color: active ? "#008542" : "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                  {count > 0 ? `${count} ${count === 1 ? "jogo" : "jogos"}` : "em breve"}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Cards de jogo */}
      <Box sx={{ px: 2 }}>
        {displayFixtures.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <SportsSoccerIcon sx={{ fontSize: 48, color: "#008542" }} />
            <Box>
              <Typography sx={{ color: "#008542", fontSize: 16, fontWeight: 900, letterSpacing: 0.5 }}>
                É HEXA, BRASIL!
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 13, mt: 0.5 }}>
                Aguardando os jogos da {PHASE_LABEL[activePhase]}
              </Typography>
            </Box>
            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12, maxWidth: 220 }}>
              Os classificados serão definidos conforme a Copa avança. Torça muito!
            </Typography>
          </Box>
        ) : displayFixtures.map((fixture, i) => (
          <GameCard
            key={fixture.fixture.id}
            fixture={fixture}
            phase={activePhase}
            index={i}
            onClick={() => setSelectedFixture(fixture)}
          />
        ))}
      </Box>

      {/* Tabela de classificação — visível no tab Grupos */}
      {activePhase === "grupos" && (
        <Box sx={{ px: 2, mt: 1, mb: 2 }}>
          <StandingsTable standings={displayStandings} grupoFixtures={fixturesByPhase["grupos"] ?? []} dark />
        </Box>
      )}

      {/* Drawer de eventos */}
      <Drawer
        anchor="bottom"
        open={!!selectedFixture}
        onClose={() => setSelectedFixture(null)}
        sx={{ zIndex: 10000 }}
        PaperProps={{
          sx: {
            borderRadius: `${CAZE_RADIUS.md} ${CAZE_RADIUS.md} 0 0`,
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#151c2e",
          },
        }}
      >
        {selectedFixture && (
          <EventsDrawer
            fixture={selectedFixture}
            events={fixtureEvents}
            loading={eventsLoading}
            standings={displayStandings}
            fixturesByPhase={fixturesByPhase}
            onPhaseSelect={(key) => { setSelectedFixture(null); setActivePhase(key); }}
            onClose={() => setSelectedFixture(null)}
          />
        )}
      </Drawer>
    </Box>
  );
}
