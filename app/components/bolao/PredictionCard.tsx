"use client";

import { Box, Typography, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import type { SvgIconComponent } from "@mui/icons-material";
import type { BolaoFixture, UserPredictionSummary } from "@/app/types/bolao";

type StatusConfig = {
  label: string;
  Icon: SvgIconComponent;
  chipBg: string;
  chipText: string;
};

const STATUS_CONFIG: Record<UserPredictionSummary["status"], StatusConfig> = {
  exact:     { label: "Placar exato",     Icon: TrackChangesIcon, chipBg: "#F5C900", chipText: "#000000" },
  outcome:   { label: "Resultado certo",  Icon: CheckCircleIcon,  chipBg: "#0055B8", chipText: "#FFFFFF" },
  wrong:     { label: "Errou",            Icon: ErrorOutlineIcon, chipBg: "#333333", chipText: "#9E9E9E" },
  pending:   { label: "Aguardando",       Icon: ErrorOutlineIcon, chipBg: "#1A1A1A", chipText: "#9E9E9E" },
  cancelled: { label: "Cancelada",        Icon: ErrorOutlineIcon, chipBg: "#1A1A1A", chipText: "#9E9E9E" },
};

interface PredictionCardProps {
  fixture: BolaoFixture;
}

export function PredictionCard({ fixture }: PredictionCardProps) {
  const pred = fixture.user_prediction;
  if (!pred) return null;

  const config = STATUS_CONFIG[pred.status];

  return (
    <Box
      sx={{
        backgroundColor: "#1A1A1A",
        borderRadius: "12px",
        p: 2,
        border:
          pred.status === "exact"
            ? "1px solid rgba(245,201,0,0.4)"
            : "1px solid #2A2A2A",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Typography
          sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.875rem", flex: 1, pr: 1 }}
        >
          {fixture.home_team} × {fixture.away_team}
        </Typography>
        <Chip
          icon={<config.Icon sx={{ color: `${config.chipText} !important`, fontSize: "0.9rem" }} />}
          label={config.label}
          size="small"
          sx={{
            backgroundColor: config.chipBg,
            color: config.chipText,
            fontSize: "0.65rem",
            fontWeight: 700,
            height: 22,
          }}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ color: "#9E9E9E", fontSize: "0.75rem" }}>Palpite:</Typography>
        <Typography
          sx={{
            color: "#F5C900",
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontWeight: 700,
            fontSize: "0.9375rem",
          }}
        >
          {pred.home_score} × {pred.away_score}
        </Typography>
        {pred.points_earned > 0 && (
          <Typography
            sx={{
              color: "#F5C900",
              fontWeight: 700,
              fontSize: "0.875rem",
              ml: "auto",
            }}
          >
            +{pred.points_earned}pts
          </Typography>
        )}
      </Box>
    </Box>
  );
}
