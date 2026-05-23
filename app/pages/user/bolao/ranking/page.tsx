"use client";

import { useState } from "react";
import { Box, Typography, Tabs, Tab, Chip, Avatar } from "@mui/material";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import PageAmbientBackground from "@/app/components/layout/PageAmbientBackground";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { LAYOUT } from "@/app/constants/designTokens";
import { RankingTable } from "@/app/components/bolao/RankingTable";
import { PointsBadge } from "@/app/components/shared/PointsBadge";
import { useBolaoRanking, useBolaoMyPoints } from "@/app/hooks/useBolao";
import type { BolaoRankingEntry } from "@/app/types/bolao";

// ── Países mock ──────────────────────────────────────────────────────────────

const NATIONAL_TEAMS = [
  { code: "br" }, { code: "ar" }, { code: "fr" }, { code: "de" },
  { code: "es" }, { code: "pt" }, { code: "gb-eng" }, { code: "nl" },
  { code: "mx" }, { code: "us" }, { code: "uy" }, { code: "co" },
  { code: "sn" }, { code: "ma" }, { code: "jp" }, { code: "kr" },
];

const GAME_CODES: Record<string, string> = {
  "Brasil": "br", "México": "mx", "Canadá": "ca", "Marrocos": "ma",
  "Argentina": "ar", "Equador": "ec", "França": "fr", "Senegal": "sn",
  "Portugal": "pt", "Coreia do Sul": "kr", "Alemanha": "de", "Japão": "jp",
  "Espanha": "es", "EUA": "us",
};

// ── Nomes mock ────────────────────────────────────────────────────────────────

const NAMES = [
  "Gabriel M.", "Julia C.", "Pedro A.", "Ana Beatriz", "Lucas F.",
  "Fernanda C.", "Rafael S.", "Maria Silva", "Diego R.", "Camila T.",
  "Bruno L.", "Larissa P.", "Thiago N.", "Isabela M.", "Mateus G.",
  "Beatriz A.", "Felipe O.", "Natalia R.", "Henrique B.", "Carolina S.",
  "Eduardo V.", "Amanda K.", "Leonardo C.", "Leticia F.", "Rodrigo M.",
  "Vanessa L.", "Daniel P.", "Priscila N.", "Gustavo A.", "Bianca T.",
  "Alexandre R.", "Juliana C.", "Marcelo S.", "Renata M.", "Paulo H.",
  "Aline B.", "Ricardo G.", "Monique F.", "André L.", "Tatiane R.",
  "Vitor M.", "Sabrina A.", "Caio P.", "Claudia N.", "Igor S.",
  "Patricia V.", "Leandro F.", "Simone C.", "Fábio R.", "Roberta T.",
  "João V.", "Mariana L.", "Carlos E.", "Luciana P.", "Sergio N.",
  "Débora M.", "Alan C.", "Elaine S.", "Marcos T.", "Cristina R.",
  "Nelson F.", "Raquel B.", "Evandro M.", "Denise A.", "Adriano C.",
  "Viviane P.", "Wellington S.", "Andreia N.", "Rogerio T.", "Silvia R.",
  "Gilberto M.", "Karina F.", "Cesar A.", "Marcia L.", "Danilo P.",
  "Sonia C.", "Ronaldo B.", "Vera S.", "Herbert M.", "Cintia T.",
  "Mauricio R.", "Elisa F.", "Cleber A.", "Fatima N.", "Nilton P.",
  "Sueli C.", "Edson M.", "Luana S.", "Waldir T.", "Giovana R.",
  "Rubens F.", "Tereza A.", "Afonso L.", "Eliane P.", "Dirceu N.",
  "Tânia C.", "Almir S.", "Eunice M.", "Hermes T.", "Ieda R.",
];

// ── Ranking global mock ───────────────────────────────────────────────────────

const CURRENT_USER_ID = "current-user";

const MOCK_RANKING: BolaoRankingEntry[] = NAMES.map((name, i) => ({
  rank:              i + 1,
  user_id:           i === 96 ? CURRENT_USER_ID : `mock-${i}`,
  display_name:      name,
  avatar_url:        `https://i.pravatar.cc/40?img=${(i % 70) + 1}`,
  country_code:      NATIONAL_TEAMS[i % NATIONAL_TEAMS.length].code,
  total_points:      Math.max(5, Math.round(185 - i * 1.82)),
  exact_predictions: Math.max(0, 13 - Math.floor(i / 8)),
  correct_outcomes:  Math.max(0, 20 - Math.floor(i / 5)),
}));

const MOCK_MY_POINTS = {
  total_points:      MOCK_RANKING[96].total_points,
  rank:              226,
  exact_predictions: MOCK_RANKING[96].exact_predictions,
  correct_outcomes:  MOCK_RANKING[96].correct_outcomes,
};

interface MyGameHighlight {
  gameId: number;
  home: string;
  away: string;
  rank: number;
  points: number;
  status: "exact" | "outcome";
}

const MOCK_MY_HIGHLIGHTS: MyGameHighlight[] = [
  { gameId: 3, home: "Brasil", away: "Marrocos", rank: 3,  points: 10, status: "exact"   },
  { gameId: 5, home: "França", away: "Senegal",  rank: 15, points: 5,  status: "outcome" },
];

// ── Jogos encerrados mock ─────────────────────────────────────────────────────

interface MockGame {
  id: number;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  date: string;
  round: string;
}

const MOCK_GAMES: MockGame[] = [
  { id: 1, home: "Brasil",    away: "México",        homeScore: 2, awayScore: 0, date: "15/06", round: "Grupo D" },
  { id: 2, home: "Brasil",    away: "Canadá",        homeScore: 3, awayScore: 1, date: "19/06", round: "Grupo D" },
  { id: 3, home: "Brasil",    away: "Marrocos",      homeScore: 1, awayScore: 1, date: "24/06", round: "Grupo D" },
  { id: 4, home: "Argentina", away: "Equador",       homeScore: 3, awayScore: 0, date: "14/06", round: "Grupo A" },
  { id: 5, home: "França",    away: "Senegal",       homeScore: 2, awayScore: 1, date: "18/06", round: "Grupo C" },
  { id: 6, home: "Portugal",  away: "Coreia do Sul", homeScore: 3, awayScore: 0, date: "20/06", round: "Grupo E" },
  { id: 7, home: "Alemanha",  away: "Japão",         homeScore: 2, awayScore: 1, date: "22/06", round: "Grupo B" },
  { id: 8, home: "Espanha",   away: "EUA",           homeScore: 1, awayScore: 0, date: "23/06", round: "Grupo F" },
];

// ── Per-game participant ──────────────────────────────────────────────────────

interface GameParticipant {
  rank: number;
  name: string;
  avatarUrl: string;
  isMe: boolean;
  predHome: number;
  predAway: number;
  status: "exact" | "outcome" | "wrong";
  points: number;
}

function buildGameParticipants(game: MockGame): GameParticipant[] {
  const participants = NAMES.map((name, i) => {
    const seed = (i * 7 + game.id * 13) % 100;
    let predHome: number;
    let predAway: number;
    let status: "exact" | "outcome" | "wrong";
    let points: number;

    if (seed < 18) {
      // placar exato
      predHome = game.homeScore;
      predAway = game.awayScore;
      status = "exact";
      points = 10;
    } else if (seed < 55) {
      // resultado certo, placar diferente
      const extra = (seed % 3) + 1;
      if (game.homeScore > game.awayScore) {
        predHome = game.homeScore + (extra % 2);
        predAway = game.awayScore === 0 ? 0 : game.awayScore - 1 + (seed % 2);
        if (predHome <= predAway) predHome = predAway + 1;
      } else if (game.awayScore > game.homeScore) {
        predAway = game.awayScore + (extra % 2);
        predHome = game.homeScore === 0 ? 0 : game.homeScore - 1 + (seed % 2);
        if (predAway <= predHome) predAway = predHome + 1;
      } else {
        predHome = 1 + (extra % 2);
        predAway = predHome;
      }
      status = "outcome";
      points = 5;
    } else {
      // errou
      if (game.homeScore > game.awayScore) {
        predHome = (seed % 2);
        predAway = 1 + (seed % 3);
      } else if (game.awayScore > game.homeScore) {
        predAway = (seed % 2);
        predHome = 1 + (seed % 3);
      } else {
        predHome = 1 + (seed % 2);
        predAway = predHome + 1;
      }
      status = "wrong";
      points = 0;
    }

    return { name, avatarUrl: `https://i.pravatar.cc/40?img=${(i % 70) + 1}`, isMe: i === 96, predHome, predAway, status, points };
  });

  // ordena por pontos desc, depois por nome
  participants.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  return participants.map((p, i) => ({ ...p, rank: i + 1 }));
}

// ── STATUS helpers ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = { exact: "Exato", outcome: "Resultado", wrong: "Errou" };
const STATUS_COLOR: Record<string, string> = { exact: "#009440", outcome: "#0055B8", wrong: "#9E9E9E" };
const STATUS_BG:    Record<string, string> = {
  exact:   "rgba(0,148,64,0.1)",
  outcome: "rgba(0,85,184,0.1)",
  wrong:   "rgba(0,0,0,0.05)",
};

// ── Por Jogo UI ───────────────────────────────────────────────────────────────

function GameParticipantRow({ p }: { p: GameParticipant }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        backgroundColor: p.isMe ? "rgba(0,148,64,0.07)" : "rgba(255,255,255,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius: "12px",
        px: 2,
        py: 1.25,
        border: p.isMe ? "1px solid rgba(0,148,64,0.35)" : "1px solid rgba(0,0,0,0.07)",
      }}
    >
      {/* rank */}
      <Typography
        sx={{
          minWidth: 24,
          color: "#9E9E9E",
          fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
          fontWeight: 700,
          fontSize: "0.8rem",
          fontVariantNumeric: "tabular-nums",
          textAlign: "center",
        }}
      >
        {p.rank}
      </Typography>

      {/* avatar */}
      <Avatar
        src={p.avatarUrl}
        sx={{ width: 32, height: 32, flexShrink: 0 }}
      >
        {p.name[0]}
      </Avatar>

      {/* nome */}
      <Typography sx={{ flex: 1, color: p.isMe ? "#009440" : "#0A0A0A", fontWeight: p.isMe ? 700 : 500, fontSize: "0.875rem" }} noWrap>
        {p.name}{p.isMe ? " (você)" : ""}
      </Typography>

      {/* palpite */}
      <Typography
        sx={{
          color: STATUS_COLOR[p.status],
          fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
          fontWeight: 700,
          fontSize: "0.875rem",
          fontVariantNumeric: "tabular-nums",
          minWidth: 40,
          textAlign: "center",
        }}
      >
        {p.predHome} × {p.predAway}
      </Typography>

      {/* status chip */}
      <Chip
        label={STATUS_LABEL[p.status]}
        size="small"
        sx={{
          backgroundColor: STATUS_BG[p.status],
          color: STATUS_COLOR[p.status],
          fontWeight: 700,
          fontSize: "0.6rem",
          height: 20,
          minWidth: 66,
        }}
      />

      {/* pontos */}
      <Typography
        sx={{
          minWidth: 28,
          textAlign: "right",
          color: STATUS_COLOR[p.status],
          fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
          fontWeight: 700,
          fontSize: "0.875rem",
        }}
      >
        {p.points}
      </Typography>
    </Box>
  );
}

function PerGameTab() {
  const [selectedId, setSelectedId] = useState(MOCK_GAMES[0].id);
  const game = MOCK_GAMES.find((g) => g.id === selectedId)!;
  const participants = buildGameParticipants(game);

  return (
    <Box>
      {/* seletor horizontal de jogos */}
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
        {MOCK_GAMES.map((g) => {
          const active = g.id === selectedId;
          return (
            <Box
              key={g.id}
              onClick={() => setSelectedId(g.id)}
              sx={{
                flexShrink: 0,
                backgroundColor: active ? "#009440" : "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderRadius: "10px",
                border: active ? "1px solid #009440" : "1px solid rgba(0,0,0,0.08)",
                px: 1.5,
                py: 1,
                cursor: "pointer",
                transition: "all 0.15s",
                textAlign: "center",
                minWidth: 96,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.25 }}>
                {GAME_CODES[g.home] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`https://flagcdn.com/w20/${GAME_CODES[g.home]}.png`} width={16} height={11} alt="" style={{ borderRadius: 1 }} />
                )}
                <Typography sx={{ color: active ? "#FFF" : "#0A0A0A", fontWeight: 700, fontSize: "0.68rem", lineHeight: 1.2 }}>
                  {g.home.split(" ")[0]}
                </Typography>
              </Box>
              <Typography sx={{ color: active ? "rgba(255,255,255,0.6)" : "#9E9E9E", fontSize: "0.58rem", lineHeight: 1.3 }}>
                vs
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 0.25 }}>
                {GAME_CODES[g.away] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`https://flagcdn.com/w20/${GAME_CODES[g.away]}.png`} width={16} height={11} alt="" style={{ borderRadius: 1 }} />
                )}
                <Typography sx={{ color: active ? "rgba(255,255,255,0.7)" : "#6B6B6B", fontSize: "0.65rem" }}>
                  {g.away.split(" ")[0]}
                </Typography>
              </Box>
              <Typography sx={{ color: active ? "rgba(255,255,255,0.55)" : "#9E9E9E", fontSize: "0.55rem", mt: 0.5 }}>
                {g.date}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* card do resultado */}
      <Box
        sx={{
          backgroundColor: "rgba(0,148,64,0.07)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: "14px",
          border: "1px solid rgba(0,148,64,0.2)",
          p: 2,
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: "#6B6B6B", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {game.round} · {game.date}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
            {GAME_CODES[game.home] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`https://flagcdn.com/w20/${GAME_CODES[game.home]}.png`} width={20} height={14} alt="" style={{ borderRadius: 2 }} />
            )}
            <Typography sx={{ color: "#0A0A0A", fontWeight: 700, fontSize: "0.9rem" }}>
              {game.home}
            </Typography>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.8rem" }}>×</Typography>
            {GAME_CODES[game.away] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`https://flagcdn.com/w20/${GAME_CODES[game.away]}.png`} width={20} height={14} alt="" style={{ borderRadius: 2 }} />
            )}
            <Typography sx={{ color: "#0A0A0A", fontWeight: 700, fontSize: "0.9rem" }}>
              {game.away}
            </Typography>
          </Box>
        </Box>
        <Typography
          sx={{
            color: "#009440",
            fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
            fontWeight: 900,
            fontSize: "1.5rem",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {game.homeScore} – {game.awayScore}
        </Typography>
      </Box>

      {/* cabeçalho da tabela */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, mb: 1 }}>
        <Typography sx={{ minWidth: 28, color: "#9E9E9E", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>#</Typography>
        <Typography sx={{ flex: 1, color: "#9E9E9E", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>Participante</Typography>
        <Typography sx={{ minWidth: 40, textAlign: "center", color: "#9E9E9E", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>Palpite</Typography>
        <Typography sx={{ minWidth: 66, textAlign: "center", color: "#9E9E9E", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>Status</Typography>
        <Typography sx={{ minWidth: 28, textAlign: "right", color: "#9E9E9E", fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>Pts</Typography>
      </Box>

      {/* linhas */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {participants.map((p) => (
          <GameParticipantRow key={p.name} p={p} />
        ))}
      </Box>
    </Box>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

type TabValue = "geral" | "porjogo";

export default function RankingPage() {
  const [tab, setTab] = useState<TabValue>("geral");
  useBolaoRanking();   // mantém o cache aquecido
  useBolaoMyPoints();  // mantém o cache aquecido

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
          <TopBar title="Ranking" light />

          <Box sx={{ px: `${LAYOUT.pagePaddingX}px`, pt: 2, maxWidth: LAYOUT.feedMaxWidth, mx: "auto" }}>
            {/* Posição geral */}
            <Typography sx={{ color: "#6B6B6B", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
              Posição geral
            </Typography>
            <Box sx={{ mb: 2 }}>
              <PointsBadge points={MOCK_MY_POINTS} isLoading={false} />
            </Box>

            {/* Bolões por jogo */}
            <Typography sx={{ color: "#6B6B6B", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
              Suas apostas
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
              {MOCK_MY_HIGHLIGHTS.map((h) => (
                <Box
                  key={h.gameId}
                  sx={{
                    flex: 1,
                    backgroundColor: h.status === "exact" ? "rgba(0,148,64,0.07)" : "rgba(0,85,184,0.06)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    borderRadius: "12px",
                    border: h.status === "exact" ? "1px solid rgba(0,148,64,0.25)" : "1px solid rgba(0,85,184,0.2)",
                    p: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    {GAME_CODES[h.home] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`https://flagcdn.com/w20/${GAME_CODES[h.home]}.png`} width={14} height={10} alt="" style={{ borderRadius: 1 }} />
                    )}
                    <Typography sx={{ color: "#6B6B6B", fontSize: "0.62rem", fontWeight: 700 }} noWrap>
                      {h.home}
                    </Typography>
                    <Typography sx={{ color: "#9E9E9E", fontSize: "0.6rem" }}>×</Typography>
                    {GAME_CODES[h.away] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`https://flagcdn.com/w20/${GAME_CODES[h.away]}.png`} width={14} height={10} alt="" style={{ borderRadius: 1 }} />
                    )}
                    <Typography sx={{ color: "#6B6B6B", fontSize: "0.62rem", fontWeight: 700 }} noWrap>
                      {h.away}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      color: h.status === "exact" ? "#009440" : "#0055B8",
                      fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
                      fontWeight: 900,
                      fontSize: "1.4rem",
                      lineHeight: 1,
                    }}
                  >
                    #{h.rank}
                  </Typography>
                  <Typography sx={{ color: "#9E9E9E", fontSize: "0.62rem", mt: 0.25 }}>
                    {h.status === "exact" ? "Placar exato" : "Resultado certo"} · +{h.points}pts
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Tabs */}
            <Tabs
              value={tab}
              onChange={(_, v: TabValue) => setTab(v)}
              sx={{
                mb: 2.5,
                "& .MuiTabs-indicator": { backgroundColor: "#009440" },
                "& .MuiTab-root": {
                  color: "#6B6B6B",
                  fontFamily: 'var(--font-syne), Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  minWidth: "auto",
                  px: 1.5,
                },
                "& .Mui-selected": { color: "#009440" },
              }}
            >
              <Tab value="geral"   label="Geral" />
              <Tab value="porjogo" label="Por Jogo" />
            </Tabs>

            {tab === "geral" && (
              <RankingTable entries={MOCK_RANKING} isLoading={false} currentUserId={CURRENT_USER_ID} />
            )}

            {tab === "porjogo" && <PerGameTab />}
          </Box>
        </Box>
      </Box>
      <BottomNav />
    </>
  );
}
