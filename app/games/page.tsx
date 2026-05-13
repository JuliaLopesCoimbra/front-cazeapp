"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Drawer,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LockClockIcon from "@mui/icons-material/LockClock";
import SensorsIcon from "@mui/icons-material/Sensors";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Game {
  id: number;
  phase: string;
  phaseLabel: string;
  team1: string;
  team2: string;
  code1: string;
  code2: string;
  date: string;
  time: string;
  venue: string;
  group: string;
}

interface GroupTeam {
  name: string;
  code: string;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  pts: number;
  isBrazil?: boolean;
}

interface LiveEvent {
  min: string;
  type: "goal" | "card" | "period" | "now";
  title: string;
  detail: string;
  icon: string;
}

// ─── Flag image ───────────────────────────────────────────────────────────────

function Flag({ code, size = 40 }: { code: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={code}
      width={size}
      height={Math.round(size * 0.67)}
      style={{
        borderRadius: 6,
        border: "1.5px solid rgba(0,0,0,0.1)",
        objectFit: "cover",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const brazilGames: Game[] = [
  {
    id: 1,
    phase: "grupos",
    phaseLabel: "Grupo C",
    team1: "Brasil",
    team2: "Marrocos",
    code1: "br",
    code2: "ma",
    date: "13 Jun",
    time: "19:00",
    venue: "SoFi Stadium, Los Angeles",
    group: "C",
  },
  {
    id: 2,
    phase: "grupos",
    phaseLabel: "Grupo C",
    team1: "Brasil",
    team2: "Haiti",
    code1: "br",
    code2: "ht",
    date: "19 Jun",
    time: "21:00",
    venue: "Hard Rock Stadium, Miami",
    group: "C",
  },
  {
    id: 3,
    phase: "grupos",
    phaseLabel: "Grupo C",
    team1: "Brasil",
    team2: "Escócia",
    code1: "br",
    code2: "gb-sct",
    date: "24 Jun",
    time: "19:00",
    venue: "MetLife Stadium, New York",
    group: "C",
  },
  {
    id: 4,
    phase: "oitavas",
    phaseLabel: "Oitavas de Final",
    team1: "Brasil",
    team2: "México",
    code1: "br",
    code2: "mx",
    date: "2 Jul",
    time: "19:00",
    venue: "AT&T Stadium, Dallas",
    group: "",
  },
  {
    id: 5,
    phase: "quartas",
    phaseLabel: "Quartas de Final",
    team1: "Brasil",
    team2: "Alemanha",
    code1: "br",
    code2: "de",
    date: "10 Jul",
    time: "21:00",
    venue: "Lumen Field, Seattle",
    group: "",
  },
  {
    id: 6,
    phase: "semi",
    phaseLabel: "Semifinal",
    team1: "Brasil",
    team2: "Espanha",
    code1: "br",
    code2: "es",
    date: "15 Jul",
    time: "20:00",
    venue: "MetLife Stadium, New York",
    group: "",
  },
];

const standingsDefault: GroupTeam[] = [
  { name: "Brasil",   code: "br",     p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, isBrazil: true },
  { name: "Marrocos", code: "ma",     p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
  { name: "Haiti",    code: "ht",     p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
  { name: "Escócia",  code: "gb-sct", p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
];

const standingsLive: GroupTeam[] = [
  { name: "Brasil",   code: "br",     p: 1, w: 1, d: 0, l: 0, gf: 1, ga: 0, pts: 3, isBrazil: true },
  { name: "Marrocos", code: "ma",     p: 1, w: 0, d: 0, l: 1, gf: 0, ga: 1, pts: 0 },
  { name: "Haiti",    code: "ht",     p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
  { name: "Escócia",  code: "gb-sct", p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 },
];

const oitavasTeams: GroupTeam[] = [
  { name: "França",         code: "fr",     p: 3, w: 3, d: 0, l: 0, gf: 7, ga: 1, pts: 9 },
  { name: "Brasil",         code: "br",     p: 3, w: 2, d: 1, l: 0, gf: 5, ga: 1, pts: 7, isBrazil: true },
  { name: "Argentina",      code: "ar",     p: 3, w: 2, d: 1, l: 0, gf: 6, ga: 2, pts: 7 },
  { name: "Espanha",        code: "es",     p: 3, w: 2, d: 1, l: 0, gf: 5, ga: 2, pts: 7 },
  { name: "Portugal",       code: "pt",     p: 3, w: 2, d: 1, l: 0, gf: 5, ga: 2, pts: 7 },
  { name: "Alemanha",       code: "de",     p: 3, w: 2, d: 0, l: 1, gf: 6, ga: 3, pts: 6 },
  { name: "Japão",          code: "jp",     p: 3, w: 2, d: 0, l: 1, gf: 5, ga: 4, pts: 6 },
  { name: "Uruguai",        code: "uy",     p: 3, w: 2, d: 0, l: 1, gf: 3, ga: 2, pts: 6 },
  { name: "Inglaterra",     code: "gb-eng", p: 3, w: 2, d: 0, l: 1, gf: 4, ga: 2, pts: 6 },
  { name: "Países Baixos",  code: "nl",     p: 3, w: 2, d: 0, l: 1, gf: 4, ga: 3, pts: 6 },
  { name: "México",         code: "mx",     p: 3, w: 1, d: 2, l: 0, gf: 3, ga: 2, pts: 5 },
  { name: "Colômbia",       code: "co",     p: 3, w: 1, d: 2, l: 0, gf: 2, ga: 1, pts: 5 },
  { name: "Bélgica",        code: "be",     p: 3, w: 1, d: 2, l: 0, gf: 3, ga: 3, pts: 5 },
  { name: "Marrocos",       code: "ma",     p: 3, w: 1, d: 1, l: 1, gf: 2, ga: 3, pts: 4 },
  { name: "Senegal",        code: "sn",     p: 3, w: 1, d: 1, l: 1, gf: 2, ga: 3, pts: 4 },
  { name: "Estados Unidos", code: "us",     p: 3, w: 1, d: 1, l: 1, gf: 3, ga: 4, pts: 4 },
];

const quartasTeams: GroupTeam[] = [
  { name: "França",     code: "fr",     p: 4, w: 4, d: 0, l: 0, gf: 9,  ga: 2, pts: 12 },
  { name: "Brasil",     code: "br",     p: 4, w: 3, d: 1, l: 0, gf: 7,  ga: 1, pts: 10, isBrazil: true },
  { name: "Argentina",  code: "ar",     p: 4, w: 3, d: 1, l: 0, gf: 8,  ga: 3, pts: 10 },
  { name: "Espanha",    code: "es",     p: 4, w: 3, d: 1, l: 0, gf: 7,  ga: 3, pts: 10 },
  { name: "Portugal",   code: "pt",     p: 4, w: 3, d: 1, l: 0, gf: 7,  ga: 3, pts: 10 },
  { name: "Alemanha",   code: "de",     p: 4, w: 3, d: 0, l: 1, gf: 8,  ga: 4, pts: 9 },
  { name: "Marrocos",   code: "ma",     p: 4, w: 2, d: 1, l: 1, gf: 4,  ga: 4, pts: 7 },
  { name: "Inglaterra", code: "gb-eng", p: 4, w: 2, d: 0, l: 2, gf: 5,  ga: 5, pts: 6 },
];

const semiTeams: GroupTeam[] = [
  { name: "França",   code: "fr",   p: 5, w: 5, d: 0, l: 0, gf: 12, ga: 3, pts: 15 },
  { name: "Brasil",   code: "br",   p: 5, w: 4, d: 1, l: 0, gf: 9,  ga: 2, pts: 13, isBrazil: true },
  { name: "Espanha",  code: "es",   p: 5, w: 4, d: 1, l: 0, gf: 10, ga: 4, pts: 13 },
  { name: "Marrocos", code: "ma",   p: 5, w: 3, d: 1, l: 1, gf: 6,  ga: 5, pts: 10 },
];

const liveEvents: LiveEvent[] = [
  {
    min: "67'",
    type: "now",
    title: "Jogo em andamento",
    detail: "BRA 1 x 0 MAR",
    icon: "🔴",
  },
  {
    min: "46'",
    type: "period",
    title: "2º Tempo iniciado",
    detail: "Equipes voltam ao campo",
    icon: "⚽",
  },
  {
    min: "45+2'",
    type: "period",
    title: "Fim do 1º Tempo",
    detail: "Intervalo — BRA 1 x 0 MAR",
    icon: "🔔",
  },
  {
    min: "23'",
    type: "goal",
    title: "GOOOOL! BRASIL! 🇧🇷",
    detail: "Endrick recebe na área, domina e chuta no canto — 1 x 0!",
    icon: "⚽",
  },
  {
    min: "5'",
    type: "card",
    title: "Cartão Amarelo",
    detail: "Aguerd (Marrocos) — falta em Vinicius Jr.",
    icon: "🟡",
  },
  {
    min: "1'",
    type: "period",
    title: "Início do Jogo",
    detail: "SoFi Stadium, Los Angeles — Copa do Mundo 2026",
    icon: "🏁",
  },
];

const phases = [
  { key: "grupos",  label: "Grupos",  sublabel: "3 jogos" },
  { key: "oitavas", label: "Oitavas", sublabel: "1 jogo" },
  { key: "quartas", label: "Quartas", sublabel: "1 jogo" },
  { key: "semi",    label: "Semi",    sublabel: "1 jogo" },
];

// ─── Estado de fase bloqueada ─────────────────────────────────────────────────

function PhaseLockedState({ phase }: { phase: string }) {
  const messages: Record<string, { title: string; sub: string; emoji: string }> = {
    oitavas: { emoji: "⚔️", title: "Oitavas de Final", sub: "O Brasil precisa avançar da fase de grupos para jogar aqui. Torça muito!" },
    quartas: { emoji: "⚽", title: "Quartas de Final", sub: "Os 8 melhores times do mundo se enfrentam. O Brasil quer estar aqui." },
    semi:    { emoji: "🔥", title: "Semifinal",        sub: "Só os 4 melhores chegam até aqui. A final está logo ali." },
  };
  const info = messages[phase];
  if (!info) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, px: 3, textAlign: "center" }}>
      <Box sx={{
        width: 90, height: 90, borderRadius: "50%",
        background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        mb: 2.5, fontSize: 40, boxShadow: "0 4px 20px rgba(0,151,57,0.15)",
      }}>
        {info.emoji}
      </Box>
      <Chip
        icon={<LockClockIcon sx={{ fontSize: "14px !important" }} />}
        label="Fase não iniciada"
        size="small"
        sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: 700, fontSize: 11, mb: 2 }}
      />
      <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#111", mb: 1 }}>{info.title}</Typography>
      <Typography sx={{ fontSize: 13, color: "#777", lineHeight: 1.65, maxWidth: 260 }}>{info.sub}</Typography>
      <Box sx={{
        mt: 3, px: 2.5, py: 1.5,
        border: "2px dashed #009739", borderRadius: 3, bgcolor: "#f0faf3",
        display: "flex", alignItems: "center", gap: 1.5,
      }}>
        <Flag code="br" size={28} />
        <Typography sx={{ fontSize: 13, color: "#009739", fontWeight: 700 }}>Brasil está na briga!</Typography>
      </Box>
    </Box>
  );
}

// ─── Feed ao vivo ─────────────────────────────────────────────────────────────

function LiveFeed() {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Título */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 4, height: 18, bgcolor: "#d32f2f", borderRadius: 1 }} />
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#111" }}>Acompanhamento ao vivo</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Box sx={{
            width: 7, height: 7, borderRadius: "50%", bgcolor: "#d32f2f",
            "@keyframes blink": { "0%": { opacity: 1 }, "50%": { opacity: 0.2 }, "100%": { opacity: 1 } },
            animation: "blink 1.2s ease-in-out infinite",
          }} />
          <Typography sx={{ fontSize: 11, color: "#d32f2f", fontWeight: 800 }}>67'</Typography>
        </Box>
      </Box>

      {/* Placar grande */}
      <Box sx={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        borderRadius: 3, p: 2, mb: 2,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Flag code="br" size={40} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Brasil</Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: 36, fontWeight: 900, color: "#FEDF00", letterSpacing: 4 }}>1 x 0</Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mt: 0.5 }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: "50%", bgcolor: "#d32f2f",
              "@keyframes blink": { "0%": { opacity: 1 }, "50%": { opacity: 0.2 }, "100%": { opacity: 1 } },
              animation: "blink 1.2s ease-in-out infinite",
            }} />
            <Typography sx={{ fontSize: 11, color: "#d32f2f", fontWeight: 800 }}>AO VIVO · 67'</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Flag code="ma" size={40} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Marrocos</Typography>
        </Box>
      </Box>

      {/* Timeline de eventos */}
      <Box sx={{ position: "relative" }}>
        {/* Linha vertical */}
        <Box sx={{
          position: "absolute", left: 30, top: 0, bottom: 0,
          width: 2, bgcolor: "#f0f0f0", zIndex: 0,
        }} />

        {liveEvents.map((ev, i) => (
          <Box
            key={i}
            sx={{
              display: "flex", alignItems: "flex-start", gap: 1.5,
              mb: 1.5, position: "relative", zIndex: 1,
            }}
          >
            {/* Minuto */}
            <Box sx={{ width: 40, flexShrink: 0, textAlign: "right" }}>
              <Typography sx={{
                fontSize: 10, fontWeight: 700,
                color: ev.type === "now" ? "#d32f2f" : ev.type === "goal" ? "#009739" : "#aaa",
              }}>
                {ev.min}
              </Typography>
            </Box>

            {/* Ícone */}
            <Box sx={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ev.type === "goal" ? 18 : 14,
              bgcolor:
                ev.type === "now"    ? "#ffebee" :
                ev.type === "goal"   ? "#e8f5e9" :
                ev.type === "card"   ? "#fff8e1" :
                "#f5f5f5",
              border:
                ev.type === "now"  ? "2px solid #d32f2f" :
                ev.type === "goal" ? "2px solid #009739" :
                "2px solid #ebebeb",
              ...(ev.type === "now" && {
                "@keyframes blink": { "0%": { opacity: 1 }, "50%": { opacity: 0.4 }, "100%": { opacity: 1 } },
                animation: "blink 1.2s ease-in-out infinite",
              }),
            }}>
              {ev.icon}
            </Box>

            {/* Texto */}
            <Box sx={{ flex: 1, pt: 0.3 }}>
              <Typography sx={{
                fontSize: 13, fontWeight: ev.type === "goal" || ev.type === "now" ? 800 : 600,
                color: ev.type === "goal" ? "#009739" : ev.type === "now" ? "#d32f2f" : "#333",
                lineHeight: 1.3,
              }}>
                {ev.title}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#888", mt: 0.2, lineHeight: 1.4 }}>
                {ev.detail}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── Drawer de chaveamento ────────────────────────────────────────────────────

function BracketDrawer({ game, isLive, onClose }: { game: Game; isLive: boolean; onClose: () => void }) {
  const isThisGameLive = isLive && game.id === 1;
  const isKnockout = game.phase !== "grupos";

  const standings =
    game.phase === "oitavas" ? oitavasTeams :
    game.phase === "quartas" ? quartasTeams :
    game.phase === "semi"    ? semiTeams    :
    isThisGameLive ? standingsLive : standingsDefault;

  const standingsTitle =
    game.phase === "oitavas" ? "Oitavas de Final — 16 Seleções" :
    game.phase === "quartas" ? "Quartas de Final — 8 Seleções"  :
    game.phase === "semi"    ? "Semifinal — 4 Seleções"         :
    "Classificação — Grupo C";

  const drawerSubtitle =
    game.phase === "grupos" ? "Grupo C — Copa do Mundo 2026" :
    "Fase Eliminatória — Copa do Mundo 2026";

  return (
    <>
      {/* Handle + Header */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1, bgcolor: "#fff", position: "sticky", top: 0, zIndex: 1, boxShadow: "0 1px 0 #f0f0f0" }}>
        <Box sx={{ width: 40, height: 4, bgcolor: "#e0e0e0", borderRadius: 2, mx: "auto", mb: 1.5 }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#111" }}>
                {isThisGameLive ? "Ao vivo agora" : "Chaveamento"}
              </Typography>
              {isThisGameLive && (
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 0.5,
                  bgcolor: "#ffebee", borderRadius: 1, px: 0.8, py: 0.2,
                }}>
                  <Box sx={{
                    width: 6, height: 6, borderRadius: "50%", bgcolor: "#d32f2f",
                    "@keyframes blink": { "0%": { opacity: 1 }, "50%": { opacity: 0.2 }, "100%": { opacity: 1 } },
                    animation: "blink 1.2s ease-in-out infinite",
                  }} />
                  <Typography sx={{ fontSize: 10, color: "#d32f2f", fontWeight: 800 }}>AO VIVO</Typography>
                </Box>
              )}
            </Box>
            <Typography sx={{ fontSize: 12, color: "#777" }}>{drawerSubtitle}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: "#f5f5f5" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ overflowY: "auto", p: 2, flex: 1 }}>

        {/* Feed ao vivo OU card do próximo jogo */}
        {isThisGameLive ? (
          <LiveFeed />
        ) : (
          <Box sx={{
            background: "linear-gradient(135deg, #009739 0%, #005f28 100%)",
            borderRadius: 3, p: 2, mb: 3,
          }}>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, mb: 1.5 }}>
              PRÓXIMO JOGO · {game.date} ÀS {game.time}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <Flag code={game.code1} size={44} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{game.team1}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ bgcolor: "rgba(254,223,0,0.2)", borderRadius: 2, px: 2, py: 0.8 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#FEDF00", letterSpacing: 2 }}>VS</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <Flag code={game.code2} size={44} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{game.team2}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1.5, justifyContent: "center" }}>
              <LocationOnIcon sx={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }} />
              <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{game.venue}</Typography>
            </Box>
          </Box>
        )}

        {/* Classificação Grupo C */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 4, height: 18, bgcolor: "#009739", borderRadius: 1 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#111" }}>{standingsTitle}</Typography>
            {isThisGameLive && (
              <Chip label="Atualizado" size="small" sx={{ bgcolor: "#e8f5e9", color: "#009739", fontSize: 9, fontWeight: 700, height: 18, ml: "auto" }} />
            )}
          </Box>

          <Box sx={{ border: "1px solid #ebebeb", borderRadius: 2.5, overflow: "hidden" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "24px 1fr 26px 26px 26px 26px 30px", px: 1.5, py: 0.8, bgcolor: "#002776" }}>
              {["#", "Seleção", "J", "V", "E", "D", "Pts"].map((h) => (
                <Typography key={h} sx={{ fontSize: 10, fontWeight: 700, color: "#FEDF00", textAlign: "center" }}>{h}</Typography>
              ))}
            </Box>
            {standings.map((team, i) => (
              <Box
                key={team.name}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "24px 1fr 26px 26px 26px 26px 30px",
                  px: 1.5, py: 1,
                  bgcolor: team.isBrazil ? "#f0faf3" : i % 2 === 0 ? "#fff" : "#fafafa",
                  borderTop: "1px solid #f0f0f0",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontSize: 11, color: i < 2 ? "#009739" : "#bbb", fontWeight: 700, textAlign: "center" }}>{i + 1}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Flag code={team.code} size={22} />
                  <Typography sx={{ fontSize: 12, fontWeight: team.isBrazil ? 800 : 500, color: team.isBrazil ? "#009739" : "#333" }}>
                    {team.name}
                  </Typography>
                </Box>
                {[team.p, team.w, team.d, team.l, team.pts].map((val, vi) => (
                  <Typography key={vi} sx={{ fontSize: 12, textAlign: "center", fontWeight: vi === 4 ? 800 : 400, color: vi === 4 ? "#002776" : "#888" }}>
                    {val}
                  </Typography>
                ))}
              </Box>
            ))}
          </Box>
          {!isKnockout && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.8, px: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#009739" }} />
              <Typography sx={{ fontSize: 10, color: "#777" }}>Top 2 avançam para as Oitavas</Typography>
            </Box>
          )}
        </Box>

        {/* Fase eliminatória preview */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Box sx={{ width: 4, height: 18, bgcolor: "#FEDF00", borderRadius: 1 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#111" }}>Fase Eliminatória</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[
              { label: "Oitavas de Final", date: "Jul 2026",    icon: "⚔️" },
              { label: "Quartas de Final", date: "Jul 2026",    icon: "🥊" },
              { label: "Semifinal",        date: "Jul 2026",    icon: "🔥" },
              { label: "Final",            date: "19 Jul 2026", icon: "🏆" },
            ].map((fase, i) => (
              <Box
                key={fase.label}
                sx={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  p: 1.5, border: "1px dashed #e0e0e0", borderRadius: 2,
                  bgcolor: i === 3 ? "#fffbec" : "#fafafa",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography sx={{ fontSize: 22 }}>{fase.icon}</Typography>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{fase.label}</Typography>
                    <Typography sx={{ fontSize: 11, color: "#aaa" }}>{fase.date}</Typography>
                  </Box>
                </Box>
                <Chip label="Em breve" size="small" sx={{ fontSize: 10, bgcolor: "#f0f0f0", color: "#aaa" }} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Rodapé */}
        <Box sx={{ p: 2, background: "linear-gradient(135deg, #FEDF00, #ffc107)", borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <Flag code="br" size={40} />
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 900, color: "#002776" }}>Bora Brasil! 🙌</Typography>
            <Typography sx={{ fontSize: 11, color: "#002776", opacity: 0.75 }}>Acompanhe cada jogo aqui</Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function GamesPage() {
  const [activePhase, setActivePhase] = useState("grupos");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isLive, setIsLive] = useState(false);

  const filteredGames = brazilGames.filter((g) => g.phase === activePhase);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pb: 4 }}>
      {/* Header */}
      <Box sx={{
        background: "linear-gradient(135deg, #009739 0%, #005f28 100%)",
        pt: 5, pb: 3, px: 2,
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -30, right: -30, width: 130, height: 130, borderRadius: "50%", bgcolor: "rgba(254,223,0,0.1)" }} />
        <Box sx={{ position: "absolute", bottom: -30, left: -20, width: 90, height: 90, borderRadius: "50%", bgcolor: "rgba(254,223,0,0.07)" }} />

        {/* Botão "Mudar para ao vivo" */}
        <Box
          onClick={() => setIsLive((v) => !v)}
          sx={{
            position: "absolute", top: 16, right: 16,
            display: "flex", alignItems: "center", gap: 0.6,
            bgcolor: isLive ? "rgba(211,47,47,0.9)" : "rgba(255,255,255,0.18)",
            border: isLive ? "1.5px solid #ef9a9a" : "1.5px solid rgba(255,255,255,0.35)",
            borderRadius: 5, px: 1.2, py: 0.6,
            cursor: "pointer", backdropFilter: "blur(4px)",
            transition: "all 0.2s",
            zIndex: 2,
          }}
        >
          {isLive ? (
            <>
              <Box sx={{
                width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff",
                "@keyframes blink": { "0%": { opacity: 1 }, "50%": { opacity: 0.2 }, "100%": { opacity: 1 } },
                animation: "blink 1.2s ease-in-out infinite",
              }} />
              <Typography sx={{ fontSize: 11, color: "#fff", fontWeight: 800 }}>Ao vivo agora</Typography>
            </>
          ) : (
            <>
              <SensorsIcon sx={{ fontSize: 13, color: "#fff" }} />
              <Typography sx={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>Mudar para ao vivo</Typography>
            </>
          )}
        </Box>

        {/* Título */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, position: "relative" }}>
          <Box sx={{
            width: 46, height: 46, borderRadius: "50%",
            bgcolor: "rgba(254,223,0,0.2)", border: "2px solid rgba(254,223,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <EmojiEventsIcon sx={{ color: "#FEDF00", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ color: "#FEDF00", fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>COPA DO MUNDO 2026</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Flag code="br" size={26} />
              <Typography sx={{ color: "#fff", fontSize: 20, fontWeight: 900 }}>Seleção Brasileira</Typography>
            </Box>
          </Box>
        </Box>

        <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 12, mt: 0.5 }}>
          Grupo C · 3 jogos na fase de grupos
        </Typography>

        {/* Stats */}
        <Box sx={{ display: "flex", gap: 1.5, mt: 2.5, position: "relative" }}>
          {[
            { label: "Jogos",    value: "3" },
            { label: "Vitórias", value: isLive ? "1" : "—" },
            { label: "Gols",     value: isLive ? "1" : "—" },
            { label: "Grupo",    value: "C" },
          ].map((s) => (
            <Box key={s.label} sx={{ flex: 1, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 2, px: 1, py: 0.8, textAlign: "center" }}>
              <Typography sx={{ color: "#FEDF00", fontSize: 17, fontWeight: 900 }}>{s.value}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 9, mt: 0.1 }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
        <Box sx={{ display: "flex", overflowX: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
          {phases.map((p) => {
            const isActive = activePhase === p.key;
            return (
              <Box
                key={p.key}
                onClick={() => setActivePhase(p.key)}
                sx={{
                  flex: "0 0 auto", px: 2.5, pt: 1.2, pb: 1.2,
                  cursor: "pointer", textAlign: "center",
                  borderBottom: isActive ? "3px solid #009739" : "3px solid transparent",
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: isActive ? 800 : 500, color: isActive ? "#009739" : "#888", whiteSpace: "nowrap" }}>
                  {p.label}
                </Typography>
                <Typography sx={{ fontSize: 9, color: isActive ? "#009739" : "#bbb", fontWeight: 600 }}>
                  {p.sublabel}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Conteúdo */}
      <Box sx={{ px: 2, pt: 2.5 }}>
        {filteredGames.length > 0 ? (
          filteredGames.map((game, index) => {
            const gameIsLive = isLive && game.id === 1;
            return (
              <Card
                key={game.id}
                onClick={() => setSelectedGame(game)}
                sx={{
                  mb: 2, borderRadius: 3,
                  boxShadow: gameIsLive ? "0 4px 20px rgba(211,47,47,0.2)" : "0 2px 10px rgba(0,0,0,0.07)",
                  border: gameIsLive ? "1.5px solid #ef9a9a" : "1px solid #f0f0f0",
                  cursor: "pointer",
                  "&:active": { transform: "scale(0.985)" },
                  transition: "all 0.15s",
                }}
              >
                <CardContent sx={{ p: "0 !important" }}>
                  {/* Cabeçalho */}
                  <Box sx={{
                    px: 2, py: 1,
                    background: gameIsLive
                      ? "linear-gradient(90deg, #b71c1c, #d32f2f)"
                      : index === 0 ? "linear-gradient(90deg, #002776, #003a9e)" : "#f7f7f7",
                    borderRadius: "12px 12px 0 0",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <Chip
                      label={`Jogo ${index + 1} · ${game.phaseLabel}`}
                      size="small"
                      sx={{
                        bgcolor: gameIsLive ? "rgba(255,255,255,0.2)" : index === 0 ? "rgba(254,223,0,0.2)" : "#ebebeb",
                        color: gameIsLive || index === 0 ? "#fff" : "#666",
                        fontSize: 10, fontWeight: 700, height: 20,
                      }}
                    />
                    {gameIsLive ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                        <Box sx={{
                          width: 6, height: 6, borderRadius: "50%", bgcolor: "#fff",
                          "@keyframes blink": { "0%": { opacity: 1 }, "50%": { opacity: 0.2 }, "100%": { opacity: 1 } },
                          animation: "blink 1.2s ease-in-out infinite",
                        }} />
                        <Typography sx={{ fontSize: 11, color: "#fff", fontWeight: 800 }}>AO VIVO · 67'</Typography>
                      </Box>
                    ) : (
                      <Chip label="Em breve" size="small" sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontSize: 10, fontWeight: 700, height: 20 }} />
                    )}
                  </Box>

                  {/* Times */}
                  <Box sx={{ px: 2, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <Flag code={game.code1} size={52} />
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#111" }}>{game.team1}</Typography>
                    </Box>

                    <Box sx={{ flex: "0 0 auto", px: 2, textAlign: "center" }}>
                      {gameIsLive ? (
                        <>
                          <Typography sx={{ fontSize: 30, fontWeight: 900, color: "#d32f2f", letterSpacing: 3 }}>1 x 0</Typography>
                          <Typography sx={{ fontSize: 10, color: "#d32f2f", fontWeight: 700 }}>2º Tempo</Typography>
                        </>
                      ) : (
                        <>
                          <Box sx={{ bgcolor: "#002776", borderRadius: 2, px: 1.5, py: 0.8, mb: 0.5 }}>
                            <Typography sx={{ fontSize: 16, fontWeight: 900, color: "#FEDF00", letterSpacing: 3 }}>VS</Typography>
                          </Box>
                          <Typography sx={{ fontSize: 11, color: "#888", fontWeight: 600 }}>{game.time}</Typography>
                        </>
                      )}
                    </Box>

                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <Flag code={game.code2} size={52} />
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#111" }}>{game.team2}</Typography>
                    </Box>
                  </Box>

                  {/* Gol info no card ao vivo */}
                  {gameIsLive && (
                    <Box sx={{ mx: 2, mb: 1.5, p: 1, bgcolor: "#e8f5e9", borderRadius: 2, display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: 16 }}>⚽</Typography>
                      <Typography sx={{ fontSize: 12, color: "#2e7d32", fontWeight: 700 }}>23' Endrick</Typography>
                      <Flag code="br" size={18} />
                    </Box>
                  )}

                  {/* Rodapé */}
                  <Box sx={{ px: 2, py: 1, borderTop: "1px solid #f5f5f5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <CalendarTodayIcon sx={{ fontSize: 11, color: "#bbb" }} />
                        <Typography sx={{ fontSize: 11, color: "#777" }}>{game.date}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <LocationOnIcon sx={{ fontSize: 11, color: "#bbb" }} />
                        <Typography sx={{ fontSize: 11, color: "#777", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {game.venue.split(",")[0]}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                      <Typography sx={{ fontSize: 11, color: gameIsLive ? "#d32f2f" : "#009739", fontWeight: 700 }}>
                        {gameIsLive ? "Ver ao vivo" : "Ver chaveamento"}
                      </Typography>
                      <ChevronRightIcon sx={{ fontSize: 15, color: gameIsLive ? "#d32f2f" : "#009739" }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <PhaseLockedState phase={activePhase} />
        )}
      </Box>

      {/* Drawer */}
      <Drawer
        anchor="bottom"
        open={!!selectedGame}
        onClose={() => setSelectedGame(null)}
        PaperProps={{
          sx: {
            borderRadius: "20px 20px 0 0",
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {selectedGame && (
          <BracketDrawer
            game={selectedGame}
            isLive={isLive}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </Drawer>
    </Box>
  );
}
