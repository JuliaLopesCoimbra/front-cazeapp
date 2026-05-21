"use client";

import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CazeButton from "@/app/components/shared/CazeButton";
import { useCreatePrediction } from "@/app/hooks/useBolao";
import type { BolaoFixture } from "@/app/types/bolao";

interface ScoreControlProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}

function ScoreControl({ label, value, onChange, disabled }: ScoreControlProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <Typography sx={{ color: "#9E9E9E", fontSize: "0.75rem", fontWeight: 600 }}>
        {label}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={disabled || value === 0}
          size="small"
          sx={{
            color: "#F5C900",
            border: "1px solid #F5C900",
            borderRadius: "8px",
            width: 36,
            height: 36,
            "&:disabled": { borderColor: "#444", color: "#444" },
          }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>

        <Typography
          sx={{
            fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
            fontWeight: 700,
            fontSize: "2.25rem",
            color: "#FFFFFF",
            minWidth: "48px",
            textAlign: "center",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </Typography>

        <IconButton
          onClick={() => onChange(Math.min(20, value + 1))}
          disabled={disabled}
          size="small"
          sx={{
            color: "#F5C900",
            border: "1px solid #F5C900",
            borderRadius: "8px",
            width: 36,
            height: 36,
            "&:disabled": { borderColor: "#444", color: "#444" },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

interface PredictionInputProps {
  fixture: BolaoFixture;
  onSuccess?: () => void;
}

export function PredictionInput({ fixture, onSuccess }: PredictionInputProps) {
  const existing = fixture.user_prediction;
  const [homeScore, setHomeScore] = useState(existing?.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(existing?.away_score ?? 0);
  const { mutate, isPending } = useCreatePrediction();

  const isClosed = new Date() >= new Date(fixture.betting_closes_at);
  const isSettled = existing != null && existing.status !== "pending";
  const disabled = isClosed || isSettled || isPending;

  function handleSubmit() {
    mutate(
      {
        fixture_id: fixture.fixture_id,
        home_score_prediction: homeScore,
        away_score_prediction: awayScore,
      },
      { onSuccess }
    );
  }

  return (
    <Box sx={{ backgroundColor: "#1A1A1A", borderRadius: "16px", p: 3 }}>
      <Typography
        sx={{
          color: "#9E9E9E",
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          mb: 3,
          textAlign: "center",
        }}
      >
        {existing ? "Sua aposta" : "Faça sua aposta"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          mb: 3,
        }}
      >
        <ScoreControl
          label={fixture.home_team}
          value={homeScore}
          onChange={setHomeScore}
          disabled={disabled}
        />

        <Typography
          sx={{
            color: "#9E9E9E",
            fontWeight: 700,
            fontSize: "1.5rem",
            mt: 2.5,
          }}
        >
          ×
        </Typography>

        <ScoreControl
          label={fixture.away_team}
          value={awayScore}
          onChange={setAwayScore}
          disabled={disabled}
        />
      </Box>

      {isSettled ? (
        <Box sx={{ textAlign: "center" }}>
          {existing!.status === "exact" && (
            <Typography sx={{ color: "#F5C900", fontWeight: 700 }}>
              Placar exato! +{existing!.points_earned}pts 🎯
            </Typography>
          )}
          {existing!.status === "outcome" && (
            <Typography sx={{ color: "#0055B8", fontWeight: 700 }}>
              Resultado certo! +{existing!.points_earned}pts ✅
            </Typography>
          )}
          {existing!.status === "wrong" && (
            <Typography sx={{ color: "#9E9E9E" }}>Não foi dessa vez 😅</Typography>
          )}
          {existing!.status === "cancelled" && (
            <Typography sx={{ color: "#9E9E9E" }}>Aposta cancelada</Typography>
          )}
        </Box>
      ) : isClosed ? (
        <Typography
          sx={{ color: "#E63946", textAlign: "center", fontSize: "0.875rem", fontWeight: 600 }}
        >
          Apostas encerradas para este jogo
        </Typography>
      ) : (
        <CazeButton fullWidth loading={isPending} onClick={handleSubmit}>
          {existing ? "Atualizar aposta ✏️" : "Confirmar aposta ⚽"}
        </CazeButton>
      )}
    </Box>
  );
}
