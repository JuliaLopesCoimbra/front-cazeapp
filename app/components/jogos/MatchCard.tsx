"use client";

import { Box, Typography, Chip } from "@mui/material";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { BrazilFixture } from "@/app/services/football/footballService";
import { isLive, isFinished } from "@/app/services/football/footballService";
import LiveBadge from "@/app/components/shared/LiveBadge";

interface MatchCardProps {
  fixture: BrazilFixture;
  compact?: boolean;
  href?: string;
  fieldBg?: boolean;
}

function TeamLogo({ name, logo, darkText = false }: { name: string; logo: string; darkText?: boolean }) {
  const flagUrl = `https://flagcdn.com/w40/${getCountryCode(name)}.png`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: 64 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagUrl}
        alt={name}
        width={36}
        height={24}
        style={{
          borderRadius: 3,
          objectFit: "cover",
          border: darkText ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(255,255,255,0.1)",
        }}
        onError={(e) => { (e.target as HTMLImageElement).src = logo; }}
      />
      <Typography
        sx={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontWeight: 500,
          fontSize: "0.7rem",
          color: darkText ? "#282828" : "#FFFFFF",
          textAlign: "center",
          maxWidth: 64,
          lineHeight: 1.2,
        }}
      >
        {name}
      </Typography>
    </Box>
  );
}

function ScoreDisplay({ fixture, darkText = false }: { fixture: BrazilFixture; darkText?: boolean }) {
  const live = isLive(fixture);
  const finished = isFinished(fixture);

  if (!live && !finished) {
    return (
      <Typography
        sx={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontWeight: 900,
          fontSize: "1.25rem",
          color: darkText ? "#9E9E9E" : "#9E9E9E",
        }}
      >
        VS
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
          fontWeight: 700,
          fontSize: "1.75rem",
          color: live ? "#E63946" : (darkText ? "#009440" : "#F5C900"),
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {fixture.goals.home ?? 0} – {fixture.goals.away ?? 0}
      </Typography>
      {live && fixture.fixture.status.elapsed != null && (
        <Typography
          sx={{
            fontSize: "0.65rem",
            color: "#E63946",
            fontWeight: 700,
            fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fixture.fixture.status.elapsed}&apos;
        </Typography>
      )}
    </Box>
  );
}

export default function MatchCard({ fixture, compact = false, href, fieldBg = false }: MatchCardProps) {
  const router = useRouter();
  const live = isLive(fixture);
  const finished = isFinished(fixture);
  const matchDate = parseISO(fixture.fixture.date);
  const darkText = !fieldBg;

  const destination = href ?? `/pages/user/jogos/${fixture.fixture.id}`;

  return (
    <Box
      onClick={() => router.push(destination)}
      sx={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: fieldBg
          ? (live ? "rgba(14,40,20,0.95)" : "#111a14")
          : (live ? "rgba(230,57,70,0.06)" : "rgba(255,255,255,0.55)"),
        backdropFilter: fieldBg ? "none" : "blur(8px)",
        WebkitBackdropFilter: fieldBg ? "none" : "blur(8px)",
        border: live
          ? "1.5px solid #E63946"
          : fieldBg
          ? "1px solid rgba(0,148,64,0.25)"
          : "1px solid rgba(0,0,0,0.09)",
        borderRadius: "12px",
        padding: compact ? "12px" : "16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: live ? "#E63946" : "#009440",
          backgroundColor: fieldBg
            ? (live ? "rgba(14,40,20,0.95)" : "#111a14")
            : (live ? "rgba(230,57,70,0.09)" : "rgba(255,255,255,0.75)"),
          transform: "translateY(-1px)",
          boxShadow: !fieldBg && !live ? "0 4px 12px rgba(0,148,64,0.12)" : undefined,
        },
        boxShadow: live
          ? "0 0 12px rgba(230,57,70,0.2)"
          : !fieldBg
          ? "0 1px 4px rgba(0,0,0,0.06)"
          : "none",
      }}
    >
      {/* Football field background — only for group stage */}
      {fieldBg && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: live ? 0.22 : 0.18,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 200"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
          >
            <rect width="400" height="200" fill="#2d7a3a" />
            <rect x="0"   width="50" height="200" fill="#267032" />
            <rect x="100" width="50" height="200" fill="#267032" />
            <rect x="200" width="50" height="200" fill="#267032" />
            <rect x="300" width="50" height="200" fill="#267032" />
            <rect x="6" y="6" width="388" height="188" fill="none" stroke="white" strokeWidth="2.5" />
            <line x1="200" y1="6" x2="200" y2="194" stroke="white" strokeWidth="2" />
            <circle cx="200" cy="100" r="40" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="200" cy="100" r="3" fill="white" />
            <rect x="6"   y="58" width="58" height="84" fill="none" stroke="white" strokeWidth="2" />
            <rect x="336" y="58" width="58" height="84" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </Box>
      )}

      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Header: round + badge */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Typography sx={{ fontSize: "0.7rem", color: darkText ? "#6B6B6B" : "rgba(255,255,255,0.55)", fontFamily: 'var(--font-inter), Inter' }}>
            {fixture.league.round}
          </Typography>
          {live ? (
            <LiveBadge variant="compact" />
          ) : finished ? (
            <Chip
              label="Encerrado"
              size="small"
              sx={{
                backgroundColor: darkText ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
                color: "#9E9E9E",
                fontSize: "0.6rem",
                height: 18,
                fontFamily: 'var(--font-syne), Syne',
                fontWeight: 700,
              }}
            />
          ) : (
            <Typography sx={{ fontSize: "0.7rem", color: darkText ? "#6B6B6B" : "rgba(255,255,255,0.55)" }}>
              {format(matchDate, "dd/MM · HH'h'mm", { locale: ptBR })}
            </Typography>
          )}
        </Box>

        {/* Teams + Score */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <TeamLogo name={fixture.teams.home.name} logo={fixture.teams.home.logo} darkText={darkText} />
          <ScoreDisplay fixture={fixture} darkText={darkText} />
          <TeamLogo name={fixture.teams.away.name} logo={fixture.teams.away.logo} darkText={darkText} />
        </Box>

        {/* Venue */}
        {!compact && (
          <Typography
            sx={{
              fontSize: "0.65rem",
              color: darkText ? "#9E9E9E" : "rgba(255,255,255,0.45)",
              textAlign: "center",
              mt: 1.5,
              fontFamily: 'var(--font-inter), Inter',
            }}
          >
            {fixture.fixture.venue.name}, {fixture.fixture.venue.city}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

const COUNTRY_CODES: Record<string, string> = {
  "Brasil": "br", "Argentina": "ar", "França": "fr", "Alemanha": "de",
  "Inglaterra": "gb-eng", "Espanha": "es", "Portugal": "pt", "Holanda": "nl",
  "Bélgica": "be", "Croácia": "hr", "Marrocos": "ma", "Senegal": "sn",
  "Japão": "jp", "Coreia do Sul": "kr", "Austrália": "au", "Suíça": "ch",
  "Estados Unidos": "us", "México": "mx", "Canadá": "ca", "Uruguai": "uy",
  "Colômbia": "co", "Equador": "ec", "Chile": "cl", "Peru": "pe",
  "Sérvia": "rs", "Polônia": "pl", "Dinamarca": "dk", "Suécia": "se",
  "Noruega": "no", "Tunísia": "tn", "Nigéria": "ng", "Gana": "gh",
  "Camarões": "cm", "Itália": "it", "Turquia": "tr", "Ucrânia": "ua",
  "Irã": "ir", "Arábia Saudita": "sa", "Catar": "qa",
};

function getCountryCode(name: string): string {
  return COUNTRY_CODES[name] ?? "un";
}
