"use client";

import { use } from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import { PredictionInput } from "@/app/components/bolao/PredictionInput";
import { useBolaoFixtures } from "@/app/hooks/useBolao";
import type { BolaoFixture } from "@/app/types/bolao";

interface Props {
  params: Promise<{ fixtureId: string }>;
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
  "Irã": "ir", "Arábia Saudita": "sa", "Catar": "qa", "A Definir": "",
};

function getCountryCode(name: string): string {
  return COUNTRY_CODES[name] ?? "";
}

function TeamFlag({ name }: { name: string }) {
  const code = getCountryCode(name);
  if (!code) {
    return (
      <Box sx={{
        width: 64, height: 44, borderRadius: "6px", backgroundColor: "#2A2A2A",
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
      width={64}
      height={44}
      style={{ borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.12)" }}
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
    />
  );
}

function MatchHero({ fixture }: { fixture: BolaoFixture }) {
  const matchDate = parseISO(fixture.match_date);
  const isClosed = new Date() >= new Date(fixture.betting_closes_at);

  return (
    <Box sx={{
      background: "linear-gradient(160deg, #161616 0%, #1E1E1E 100%)",
      border: "1px solid rgba(245,201,0,0.2)",
      borderRadius: "20px",
      p: "24px 20px",
      mb: 2,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* glow central decorativo */}
      <Box sx={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 120, height: 120, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,201,0,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* data + round */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Box sx={{
          backgroundColor: "rgba(245,201,0,0.1)",
          border: "1px solid rgba(245,201,0,0.3)",
          borderRadius: "100px",
          px: 1.5, py: 0.4,
          display: "inline-flex", alignItems: "center", gap: 0.75,
        }}>
          {isClosed ? (
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#E63946" }} />
          ) : (
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22c55e" }} />
          )}
          <Typography sx={{ color: "#F5C900", fontSize: "0.65rem", fontWeight: 700, fontFamily: '"Montserrat"' }}>
            {format(matchDate, "dd 'de' MMM · HH'h'mm", { locale: ptBR }).toUpperCase()}
          </Typography>
        </Box>
      </Box>

      {/* times */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        {/* home */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <TeamFlag name={fixture.home_team} />
          <Typography sx={{
            color: "#FFF", fontWeight: 700, fontSize: "0.8rem", textAlign: "center",
            fontFamily: '"Montserrat"', lineHeight: 1.2, maxWidth: 80,
          }}>
            {fixture.home_team}
          </Typography>
        </Box>

        {/* VS */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 48 }}>
          <Typography sx={{
            color: "#F5C900", fontFamily: '"Montserrat"', fontWeight: 900,
            fontSize: "1.75rem", lineHeight: 1,
          }}>
            VS
          </Typography>
        </Box>

        {/* away */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <TeamFlag name={fixture.away_team} />
          <Typography sx={{
            color: "#FFF", fontWeight: 700, fontSize: "0.8rem", textAlign: "center",
            fontFamily: '"Montserrat"', lineHeight: 1.2, maxWidth: 80,
          }}>
            {fixture.away_team}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function ScoringGuide() {
  return (
    <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
      {[
        { pts: "10 pts", label: "Placar exato", bg: "rgba(245,201,0,0.1)", border: "rgba(245,201,0,0.35)", color: "#F5C900" },
        { pts: "5 pts",  label: "Resultado",    bg: "rgba(0,85,184,0.1)",  border: "rgba(0,85,184,0.35)",  color: "#5B9CF6" },
        { pts: "0 pts",  label: "Errou",        bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", color: "#9E9E9E" },
      ].map(({ pts, label, bg, border, color }) => (
        <Box key={pts} sx={{
          flex: 1, backgroundColor: bg, border: `1px solid ${border}`,
          borderRadius: "12px", p: "10px 8px", textAlign: "center",
        }}>
          <Typography sx={{ color, fontFamily: '"Montserrat"', fontWeight: 900, fontSize: "0.95rem", lineHeight: 1 }}>
            {pts}
          </Typography>
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.6rem", mt: 0.5, lineHeight: 1.2 }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function PageSkeleton() {
  return (
    <Box sx={{ px: 2, pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Skeleton variant="rectangular" height={148} sx={{ borderRadius: "20px", backgroundColor: "#1A1A1A" }} />
      <Box sx={{ display: "flex", gap: 1 }}>
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="rectangular" height={60} sx={{ flex: 1, borderRadius: "12px", backgroundColor: "#1A1A1A" }} />)}
      </Box>
      <Skeleton variant="rectangular" height={240} sx={{ borderRadius: "20px", backgroundColor: "#1A1A1A" }} />
    </Box>
  );
}

export default function BolaoFixturePage({ params }: Props) {
  const { fixtureId } = use(params);
  const router = useRouter();
  const { data: fixtures, isLoading } = useBolaoFixtures();

  const fixture = fixtures?.find((f) => f.fixture_id === Number(fixtureId));

  if (isLoading) {
    return (
      <Box sx={{ backgroundColor: "#000", minHeight: "100vh" }}>
        <TopBar title="Apostar" showBack />
        <PageSkeleton />
        <BottomNav />
      </Box>
    );
  }

  if (!fixture) {
    return (
      <Box sx={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <TopBar title="Apostar" showBack />
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ color: "#9E9E9E" }}>Jogo não encontrado</Typography>
        </Box>
        <BottomNav />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
      <TopBar title="Apostar" showBack />

      <Box sx={{ px: 2, pt: 2 }}>
        {/* Match header */}
        <Box
          sx={{
            backgroundColor: "#1A1A1A",
            borderRadius: "16px",
            p: 3,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <TeamLogo src={fixture.home_logo} name={fixture.home_team} />
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.8rem", textAlign: "center", maxWidth: 80 }}>
              {fixture.home_team}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#9E9E9E", fontSize: "0.7rem", mb: 0.5 }}>
              {new Date(fixture.match_date).toLocaleString("pt-BR", {
                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
              })}
            </Typography>
            <Typography sx={{ color: "#9E9E9E", fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 800, fontSize: "1.5rem" }}>
              VS
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <TeamLogo src={fixture.away_logo} name={fixture.away_team} />
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.8rem", textAlign: "center", maxWidth: 80 }}>
              {fixture.away_team}
            </Typography>
          </Box>
        </Box>

        {/* Scoring guide */}
        <Box
          sx={{
            backgroundColor: "#1A1A1A",
            borderRadius: "12px",
            p: 2,
            mb: 3,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          {[
            { pts: "10pts", label: "Placar exato", color: "#F5C900" },
            { pts: "5pts",  label: "Resultado certo", color: "#0055B8" },
            { pts: "0pts",  label: "Errou", color: "#9E9E9E" },
          ].map(({ pts, label, color }, i, arr) => (
            <Box key={pts} sx={{ display: "flex", alignItems: "center", gap: 0 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color, fontFamily: 'var(--font-space-mono), "Space Mono", monospace', fontWeight: 700, fontSize: "1.5rem", lineHeight: 1 }}>
                  {pts}
                </Typography>
                <Typography sx={{ color: "#9E9E9E", fontSize: "0.65rem", mt: 0.5 }}>{label}</Typography>
              </Box>
              {i < arr.length - 1 && (
                <Box sx={{ width: 1, height: 36, backgroundColor: "#2A2A2A", mx: 2 }} />
              )}
            </Box>
          ))}
        </Box>

        <MatchHero fixture={fixture} />
        <ScoringGuide />
        <PredictionInput
          fixture={fixture}
          onSuccess={() => router.push("/pages/user/bolao")}
        />
      </Box>

      <BottomNav />
    </Box>
  );
}
