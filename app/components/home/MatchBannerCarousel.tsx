"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { motion, AnimatePresence } from "framer-motion";
import {
  getBrazilFixtures,
  type BrazilFixture,
  LIVE_STATUSES,
  FINISHED_STATUSES,
} from "@/app/services/football/footballService";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// ── types ──────────────────────────────────────────────────────────────────────

interface CarouselFixture {
  id: number;
  homeTeam: string;
  homeLogo?: string;
  homeScore: number | null;
  awayTeam: string;
  awayLogo?: string;
  awayScore: number | null;
  date: string;
  statusShort: string;
  elapsed: number | null;
  round: string;
  isMock: boolean;
}

// ── flag URL helpers ───────────────────────────────────────────────────────────

const FLAG_CODES: Record<string, string> = {
  // Portuguese names
  Brasil:          "br",
  França:          "fr",
  Alemanha:        "de",
  Argentina:       "ar",
  Espanha:         "es",
  Portugal:        "pt",
  Itália:          "it",
  Holanda:         "nl",
  Inglaterra:      "gb-eng",
  Croácia:         "hr",
  Marrocos:        "ma",
  Japão:           "jp",
  México:          "mx",
  Bélgica:         "be",
  Suíça:           "ch",
  Sérvia:          "rs",
  Uruguai:         "uy",
  Colômbia:        "co",
  Equador:         "ec",
  Austrália:       "au",
  Senegal:         "sn",
  // English names (API-Sports returns English)
  Brazil:          "br",
  France:          "fr",
  Germany:         "de",
  Spain:           "es",
  Italy:           "it",
  Netherlands:     "nl",
  England:         "gb-eng",
  Croatia:         "hr",
  Morocco:         "ma",
  Japan:           "jp",
  Mexico:          "mx",
  Belgium:         "be",
  Switzerland:     "ch",
  Serbia:          "rs",
  Uruguay:         "uy",
  Colombia:        "co",
  Ecuador:         "ec",
  Australia:       "au",
  Ghana:           "gh",
  Cameroon:        "cm",
  "South Korea":   "kr",
  "Korea Republic":"kr",
  "United States": "us",
  USA:             "us",
};

function flagUrl(teamName: string): string | undefined {
  const code = FLAG_CODES[teamName];
  return code ? `https://flagcdn.com/w80/${code}.png` : undefined;
}

// ── mock data for other featured nations ───────────────────────────────────────

// First game of each featured nation (França, Argentina, Alemanha)
const MOCK_FIXTURES: CarouselFixture[] = [
  {
    id: 90001,
    homeTeam: "França",
    homeLogo: flagUrl("França"),
    homeScore: null,
    awayTeam: "Uruguai",
    awayLogo: flagUrl("Uruguai"),
    awayScore: null,
    date: "2026-06-12T18:00:00Z",
    statusShort: "NS",
    elapsed: null,
    round: "Fase de Grupos",
    isMock: true,
  },
  {
    id: 90002,
    homeTeam: "Argentina",
    homeLogo: flagUrl("Argentina"),
    homeScore: null,
    awayTeam: "Equador",
    awayLogo: flagUrl("Equador"),
    awayScore: null,
    date: "2026-06-13T21:00:00Z",
    statusShort: "NS",
    elapsed: null,
    round: "Fase de Grupos",
    isMock: true,
  },
  {
    id: 90003,
    homeTeam: "Alemanha",
    homeLogo: flagUrl("Alemanha"),
    homeScore: null,
    awayTeam: "México",
    awayLogo: flagUrl("México"),
    awayScore: null,
    date: "2026-06-14T15:00:00Z",
    statusShort: "NS",
    elapsed: null,
    round: "Fase de Grupos",
    isMock: true,
  },
];

// ── helpers ────────────────────────────────────────────────────────────────────

function toCarousel(f: BrazilFixture): CarouselFixture {
  return {
    id: f.fixture.id,
    homeTeam: f.teams.home.name,
    homeLogo: flagUrl(f.teams.home.name),
    homeScore: f.goals.home,
    awayTeam: f.teams.away.name,
    awayLogo: flagUrl(f.teams.away.name),
    awayScore: f.goals.away,
    date: f.fixture.date,
    statusShort: f.fixture.status.short,
    elapsed: f.fixture.status.elapsed,
    round: f.league.round,
    isMock: false,
  };
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM · HH:mm", { locale: ptBR });
  } catch {
    return "";
  }
}

// ── TeamBlock ──────────────────────────────────────────────────────────────────

function TeamBlock({ name, logo }: { name: string; logo?: string }) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {logo ? (
        <Box
          component="img"
          src={logo}
          alt={name}
          sx={{
            width: 34,
            height: 34,
            objectFit: "cover",
            borderRadius: "4px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }}
        />
      ) : (
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "4px",
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SportsSoccerIcon sx={{ color: "rgba(255,255,255,0.4)", fontSize: 18 }} />
        </Box>
      )}
      <Typography
        sx={{
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontSize: "0.6875rem",
          fontWeight: 700,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {name}
      </Typography>
    </Box>
  );
}

// ── MatchBannerCarousel ────────────────────────────────────────────────────────

export default function MatchBannerCarousel() {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<CarouselFixture[]>(MOCK_FIXTURES);
  const [current, setCurrent] = useState(0);

  // Fetch only Brazil's first game, then append one game per featured nation
  useEffect(() => {
    getBrazilFixtures()
      .then((data) => {
        if (data.length > 0) {
          setFixtures([toCarousel(data[0]), ...MOCK_FIXTURES]);
        }
      })
      .catch(() => {
        // keep mock fallback
      });
  }, []);

  const total = fixtures.length;

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  useEffect(() => {
    const timer = setInterval(advance, 4500);
    return () => clearInterval(timer);
  }, [advance]);

  const fixture = fixtures[current];
  if (!fixture) return null;

  const live = LIVE_STATUSES.has(fixture.statusShort);
  const finished = FINISHED_STATUSES.has(fixture.statusShort);
  const showScore =
    (live || finished) &&
    fixture.homeScore !== null &&
    fixture.awayScore !== null;

  const handleCTA = () => {
    if (!fixture.isMock) {
      router.push(`/pages/user/bolao/${fixture.id}`);
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 0.5 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={fixture.id}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <Box
            sx={{
              px: 2,
              pt: 1.25,
              pb: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {/* ── Row 1: round + status ── */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {fixture.round}
              </Typography>

              {live ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    backgroundColor: "#E8175D",
                    borderRadius: "100px",
                    px: 1,
                    py: 0.3,
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: "#FFF",
                      "@keyframes livePulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.25 },
                      },
                      animation: "livePulse 1.4s ease-in-out infinite",
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                      fontSize: "0.525rem",
                      fontWeight: 800,
                      color: "#FFF",
                      letterSpacing: "0.12em",
                    }}
                  >
                    AO VIVO{fixture.elapsed ? ` · ${fixture.elapsed}'` : ""}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontFamily:
                      "var(--font-montserrat), Montserrat, sans-serif",
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    color: finished
                      ? "rgba(255,255,255,0.38)"
                      : "rgba(255,255,255,0.55)",
                  }}
                >
                  {finished ? "Encerrado" : formatDate(fixture.date)}
                </Typography>
              )}
            </Box>

            {/* ── Row 2: teams + score ── */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TeamBlock name={fixture.homeTeam} logo={fixture.homeLogo} />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  px: 1,
                }}
              >
                {showScore ? (
                  <Typography
                    sx={{
                      fontFamily: "var(--font-anton), Anton, sans-serif",
                      fontSize: "1.75rem",
                      fontWeight: 400,
                      color: "#FFD100",
                      lineHeight: 1,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {fixture.homeScore}&nbsp;–&nbsp;{fixture.awayScore}
                  </Typography>
                ) : (
                  <Typography
                    sx={{
                      fontFamily: "var(--font-anton), Anton, sans-serif",
                      fontSize: "1.1rem",
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.28)",
                      lineHeight: 1,
                      letterSpacing: "0.06em",
                    }}
                  >
                    VS
                  </Typography>
                )}
              </Box>

              <TeamBlock name={fixture.awayTeam} logo={fixture.awayLogo} />
            </Box>

            {/* ── Row 3: CTA ── */}
            <Box
              component="button"
              onClick={handleCTA}
              sx={{
                width: "100%",
                py: 0.85,
                backgroundColor: "#FFD100",
                border: 0,
                borderRadius: "8px",
                cursor: fixture.isMock ? "default" : "pointer",
                fontFamily:
                  "var(--font-montserrat), Montserrat, sans-serif",
                fontWeight: 800,
                fontSize: "0.75rem",
                color: "#000",
                letterSpacing: "0.02em",
                opacity: fixture.isMock ? 0.6 : 1,
                transition: "opacity 0.15s, transform 0.1s",
                "&:hover": !fixture.isMock
                  ? { opacity: 0.88, transform: "translateY(-1px)" }
                  : {},
                "&:active": !fixture.isMock
                  ? { transform: "translateY(0)" }
                  : {},
              }}
            >
              {live
                ? "Ver Placar ao Vivo"
                : finished
                ? "Ver Resultado"
                : "Dar Palpite"}
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* ── Pagination dots ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.75,
          mt: 0.75,
          mb: 0,
        }}
      >
        {fixtures.map((_, i) => (
          <Box
            key={i}
            component="button"
            onClick={() => setCurrent(i)}
            aria-label={`Jogo ${i + 1}`}
            sx={{
              width: i === current ? 18 : 6,
              height: 6,
              borderRadius: "100px",
              backgroundColor:
                i === current ? "#FFD100" : "rgba(255,255,255,0.18)",
              border: 0,
              cursor: "pointer",
              p: 0,
              transition: "width 0.22s ease, background-color 0.22s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
