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
}

function TeamLogo({ name, logo }: { name: string; logo: string }) {
  const iso = name.toLowerCase().replace(/\s/g, "-");
  const flagUrl = `https://flagcdn.com/w40/${getCountryCode(name)}.png`;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: 64 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagUrl}
        alt={name}
        width={36}
        height={24}
        style={{ borderRadius: 3, objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = logo;
        }}
      />
      <Typography
        sx={{
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          fontWeight: 500,
          fontSize: "0.7rem",
          color: "#FFFFFF",
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

function ScoreDisplay({ fixture }: { fixture: BrazilFixture }) {
  const live = isLive(fixture);
  const finished = isFinished(fixture);

  if (!live && !finished) {
    return (
      <Typography
        sx={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontWeight: 900,
          fontSize: "1.25rem",
          color: "#9E9E9E",
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
          color: live ? "#E63946" : "#F5C900",
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

export default function MatchCard({ fixture, compact = false, href }: MatchCardProps) {
  const router = useRouter();
  const live = isLive(fixture);
  const finished = isFinished(fixture);
  const matchDate = parseISO(fixture.fixture.date);

  const destination = href ?? `/pages/user/jogos/${fixture.fixture.id}`;

  return (
    <Box
      onClick={() => router.push(destination)}
      sx={{
        backgroundColor: live ? "rgba(230,57,70,0.08)" : "#1A1A1A",
        border: live
          ? "1.5px solid #E63946"
          : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: compact ? "12px" : "16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: live ? "#E63946" : "#F5C900",
          backgroundColor: live ? "rgba(230,57,70,0.12)" : "#242424",
          transform: "translateY(-1px)",
        },
        boxShadow: live ? "0 0 12px rgba(230,57,70,0.2)" : "none",
      }}
    >
      {/* Header: round + badge */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography sx={{ fontSize: "0.7rem", color: "#9E9E9E", fontFamily: 'var(--font-inter), Inter' }}>
          {fixture.league.round}
        </Typography>
        {live ? (
          <LiveBadge variant="compact" />
        ) : finished ? (
          <Chip
            label="Encerrado"
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "#9E9E9E",
              fontSize: "0.6rem",
              height: 18,
              fontFamily: 'var(--font-syne), Syne',
              fontWeight: 700,
            }}
          />
        ) : (
          <Typography sx={{ fontSize: "0.7rem", color: "#9E9E9E" }}>
            {format(matchDate, "dd/MM · HH'h'mm", { locale: ptBR })}
          </Typography>
        )}
      </Box>

      {/* Teams + Score */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <TeamLogo name={fixture.teams.home.name} logo={fixture.teams.home.logo} />
        <ScoreDisplay fixture={fixture} />
        <TeamLogo name={fixture.teams.away.name} logo={fixture.teams.away.logo} />
      </Box>

      {/* Venue */}
      {!compact && (
        <Typography
          sx={{
            fontSize: "0.65rem",
            color: "#9E9E9E",
            textAlign: "center",
            mt: 1.5,
            fontFamily: 'var(--font-inter), Inter',
          }}
        >
          {fixture.fixture.venue.name}, {fixture.fixture.venue.city}
        </Typography>
      )}
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
