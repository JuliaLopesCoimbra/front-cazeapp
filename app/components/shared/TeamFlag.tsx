"use client";

import { Box } from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";

/** Mesmo mapa usado em WorldCupGames / jogos */
export const TEAM_FLAGS: Record<string, string> = {
  Brasil: "br",
  Argentina: "ar",
  Colômbia: "co",
  Equador: "ec",
  Uruguai: "uy",
  Venezuela: "ve",
  Paraguai: "py",
  Bolívia: "bo",
  Peru: "pe",
  Chile: "cl",
  "Estados Unidos": "us",
  México: "mx",
  Canadá: "ca",
  Alemanha: "de",
  França: "fr",
  Espanha: "es",
  Portugal: "pt",
  Itália: "it",
  "Países Baixos": "nl",
  Bélgica: "be",
  Croácia: "hr",
  Suíça: "ch",
  Dinamarca: "dk",
  Polônia: "pl",
  Sérvia: "rs",
  Inglaterra: "gb-eng",
  Escócia: "gb-sct",
  Gales: "gb-wls",
  Japão: "jp",
  "Coreia do Sul": "kr",
  Austrália: "au",
  "Arábia Saudita": "sa",
  Irã: "ir",
  Catar: "qa",
  Marrocos: "ma",
  Senegal: "sn",
  Nigéria: "ng",
  Camarões: "cm",
  Gana: "gh",
  Egito: "eg",
  Argélia: "dz",
  "Costa do Marfim": "ci",
  "África do Sul": "za",
  Tunísia: "tn",
};

export function getTeamFlagCode(name: string): string | undefined {
  return TEAM_FLAGS[name];
}

interface TeamFlagProps {
  name: string;
  /** Largura em px; altura = ~67% (proporção bandeira) */
  width?: number;
  fallbackLogo?: string;
  round?: boolean;
}

export default function TeamFlag({
  name,
  width = 18,
  fallbackLogo,
  round = true,
}: TeamFlagProps) {
  const code = getTeamFlagCode(name);
  const height = Math.max(12, Math.round(width * 0.67));

  if (!code && !fallbackLogo) {
    return (
      <Box
        sx={{
          width,
          height,
          bgcolor: "rgba(255,255,255,0.08)",
          borderRadius: round ? "50%" : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <SportsSoccerIcon sx={{ fontSize: width * 0.5, color: "rgba(255,255,255,0.25)" }} />
      </Box>
    );
  }

  const src = code
    ? `https://flagcdn.com/w80/${code}.png`
    : fallbackLogo!;

  return (
    <Box
      component="img"
      src={src}
      alt={name}
      sx={{
        width,
        height: round ? width : height,
        objectFit: "cover",
        borderRadius: round ? "50%" : 1,
        flexShrink: 0,
        border: "1px solid rgba(255, 255, 255, 0.18)",
        display: "block",
        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
      }}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        const el = e.currentTarget;
        if (fallbackLogo && el.src !== fallbackLogo) {
          el.src = fallbackLogo;
          return;
        }
        el.style.display = "none";
      }}
    />
  );
}
