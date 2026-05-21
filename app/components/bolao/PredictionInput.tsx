"use client";

import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import CazeButton from "@/app/components/shared/CazeButton";
import { useCreatePrediction } from "@/app/hooks/useBolao";
import type { BolaoFixture } from "@/app/types/bolao";

interface ScoreControlProps {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}

function ScoreControl({ value, onChange, disabled }: ScoreControlProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
      {/* + */}
      <IconButton
        onClick={() => onChange(Math.min(20, value + 1))}
        disabled={disabled}
        sx={{
          width: 44, height: 44, borderRadius: "50%",
          backgroundColor: disabled ? "rgba(255,255,255,0.04)" : "rgba(245,201,0,0.12)",
          border: `1.5px solid ${disabled ? "#2A2A2A" : "#F5C900"}`,
          color: disabled ? "#333" : "#F5C900",
          "&:hover": { backgroundColor: "rgba(245,201,0,0.2)" },
          "&:disabled": { borderColor: "#2A2A2A", color: "#333" },
          transition: "all 0.15s ease",
        }}
      >
        <AddIcon sx={{ fontSize: "1.25rem" }} />
      </IconButton>

      {/* score number */}
      <Typography sx={{
        fontFamily: '"Montserrat", Arial, sans-serif',
        fontWeight: 900,
        fontSize: "4rem",
        lineHeight: 1,
        color: disabled ? "#555" : "#FFFFFF",
        minWidth: 72,
        textAlign: "center",
        userSelect: "none",
        transition: "color 0.15s ease",
      }}>
        {value}
      </Typography>

      {/* - */}
      <IconButton
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value === 0}
        sx={{
          width: 44, height: 44, borderRadius: "50%",
          backgroundColor: "transparent",
          border: `1.5px solid ${disabled || value === 0 ? "#2A2A2A" : "rgba(255,255,255,0.2)"}`,
          color: disabled || value === 0 ? "#333" : "#9E9E9E",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.3)" },
          "&:disabled": { borderColor: "#2A2A2A", color: "#333" },
          transition: "all 0.15s ease",
        }}
      >
        <RemoveIcon sx={{ fontSize: "1.25rem" }} />
      </IconButton>
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
      { fixture_id: fixture.fixture_id, home_score_prediction: homeScore, away_score_prediction: awayScore },
      { onSuccess }
    );
  }

  const hasExisting = existing != null && !isSettled;

  return (
    <Box sx={{
      background: "linear-gradient(160deg, #161616 0%, #1C1C1C 100%)",
      border: isSettled
        ? existing!.status === "exact"   ? "1.5px solid rgba(245,201,0,0.5)"
          : existing!.status === "outcome" ? "1.5px solid rgba(91,156,246,0.5)"
          : "1.5px solid rgba(255,255,255,0.1)"
        : "1.5px solid rgba(255,255,255,0.08)",
      borderRadius: "20px",
      p: 3,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* título */}
      <Typography sx={{
        color: "#9E9E9E",
        fontSize: "0.7rem",
        fontWeight: 700,
        fontFamily: '"Montserrat"',
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        textAlign: "center",
        mb: 3,
      }}>
        {isSettled ? "Resultado da sua aposta" : hasExisting ? "Alterar sua aposta" : "Seu palpite"}
      </Typography>

      {/* labels dos times */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, px: 1 }}>
        <Typography sx={{ color: "#9E9E9E", fontSize: "0.7rem", fontWeight: 600, fontFamily: '"Montserrat"', flex: 1, textAlign: "center" }}>
          {fixture.home_team}
        </Typography>
        <Box sx={{ minWidth: 40 }} />
        <Typography sx={{ color: "#9E9E9E", fontSize: "0.7rem", fontWeight: 600, fontFamily: '"Montserrat"', flex: 1, textAlign: "center" }}>
          {fixture.away_team}
        </Typography>
      </Box>

      {/* controles de placar */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 3 }}>
        <ScoreControl value={homeScore} onChange={setHomeScore} disabled={disabled} />

        <Typography sx={{
          color: "rgba(255,255,255,0.2)",
          fontFamily: '"Montserrat"',
          fontWeight: 900,
          fontSize: "2rem",
          lineHeight: 1,
          userSelect: "none",
          mt: 0.5,
        }}>
          ×
        </Typography>

        <ScoreControl value={awayScore} onChange={setAwayScore} disabled={disabled} />
      </Box>

      {/* estado do resultado */}
      {isSettled ? (
        <Box sx={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "12px", p: 2,
        }}>
          {existing!.status === "exact" && (
            <>
              <EmojiEventsOutlinedIcon sx={{ color: "#F5C900", fontSize: "1.75rem" }} />
              <Typography sx={{ color: "#F5C900", fontFamily: '"Montserrat"', fontWeight: 900, fontSize: "1rem" }}>
                Placar exato!
              </Typography>
              <Typography sx={{ color: "#F5C900", fontSize: "0.8rem" }}>
                +{existing!.points_earned} pontos ganhos
              </Typography>
            </>
          )}
          {existing!.status === "outcome" && (
            <>
              <CheckCircleOutlineIcon sx={{ color: "#5B9CF6", fontSize: "1.75rem" }} />
              <Typography sx={{ color: "#5B9CF6", fontFamily: '"Montserrat"', fontWeight: 900, fontSize: "1rem" }}>
                Resultado certo!
              </Typography>
              <Typography sx={{ color: "#5B9CF6", fontSize: "0.8rem" }}>
                +{existing!.points_earned} pontos ganhos
              </Typography>
            </>
          )}
          {existing!.status === "wrong" && (
            <>
              <CancelOutlinedIcon sx={{ color: "#9E9E9E", fontSize: "1.75rem" }} />
              <Typography sx={{ color: "#9E9E9E", fontFamily: '"Montserrat"', fontWeight: 700, fontSize: "1rem" }}>
                Não foi dessa vez
              </Typography>
            </>
          )}
          {existing!.status === "cancelled" && (
            <Typography sx={{ color: "#9E9E9E" }}>Aposta cancelada</Typography>
          )}
        </Box>
      ) : isClosed ? (
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
          backgroundColor: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.2)",
          borderRadius: "12px", p: 1.5,
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#E63946" }} />
          <Typography sx={{ color: "#E63946", fontSize: "0.8rem", fontWeight: 600 }}>
            Apostas encerradas
          </Typography>
        </Box>
      ) : (
        <CazeButton fullWidth loading={isPending} onClick={handleSubmit}>
          {hasExisting ? "Atualizar aposta" : "Confirmar aposta"}
        </CazeButton>
      )}
    </Box>
  );
}
