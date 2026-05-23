"use client";

import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import CazeButton from "@/app/components/shared/CazeButton";
import { useCreatePrediction } from "@/app/hooks/useBolao";
import type { BolaoFixture } from "@/app/types/bolao";

// ── ScoreControl ──────────────────────────────────────────────────────────────

interface ScoreControlProps {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
  label: string;
}

function ScoreControl({ value, onChange, disabled, label }: ScoreControlProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flex: 1 }}>
      <Typography sx={{
        color: "#9E9E9E", fontSize: "0.68rem", fontWeight: 700,
        fontFamily: '"Montserrat"', textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        {label}
      </Typography>

      {/* número */}
      <Typography sx={{
        fontFamily: '"Montserrat", Arial, sans-serif',
        fontWeight: 900,
        fontSize: "4.5rem",
        lineHeight: 1,
        color: disabled ? "#C0C0C0" : "#009440",
        minWidth: 80,
        textAlign: "center",
        userSelect: "none",
        transition: "color 0.15s ease",
        letterSpacing: "-2px",
      }}>
        {value}
      </Typography>

      {/* botões + e - lado a lado */}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <IconButton
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={disabled || value === 0}
          sx={{
            width: 48, height: 48, borderRadius: "50%",
            backgroundColor: "transparent",
            border: `2px solid ${disabled || value === 0 ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.18)"}`,
            color: disabled || value === 0 ? "#D0D0D0" : "#6B6B6B",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.28)" },
            "&:disabled": { borderColor: "rgba(0,0,0,0.08)", color: "#D0D0D0" },
            transition: "all 0.15s ease",
          }}
        >
          <RemoveIcon sx={{ fontSize: "1.3rem" }} />
        </IconButton>

        <IconButton
          onClick={() => onChange(Math.min(20, value + 1))}
          disabled={disabled}
          sx={{
            width: 48, height: 48, borderRadius: "50%",
            backgroundColor: disabled ? "rgba(0,0,0,0.04)" : "#FFFFFF",
            border: `2px solid ${disabled ? "rgba(0,0,0,0.08)" : "#009440"}`,
            color: disabled ? "#C0C0C0" : "#009440",
            boxShadow: disabled ? "none" : "0 2px 10px rgba(0,148,64,0.18)",
            "&:hover": { backgroundColor: disabled ? undefined : "rgba(0,148,64,0.06)" },
            "&:disabled": { backgroundColor: "rgba(0,0,0,0.04)", color: "#C0C0C0", borderColor: "rgba(0,0,0,0.08)" },
            transition: "all 0.15s ease",
          }}
        >
          <AddIcon sx={{ fontSize: "1.4rem" }} />
        </IconButton>
      </Box>
    </Box>
  );
}

// ── ScoringGuide ──────────────────────────────────────────────────────────────

function ScoringGuide() {
  return (
    <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
      {/* 10 pontos */}
      <Box sx={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
        backgroundColor: "rgba(0,148,64,0.06)", borderRadius: "12px",
        border: "1px solid rgba(0,148,64,0.2)", p: "14px 8px",
      }}>
        <EmojiEventsIcon sx={{ color: "#009440", fontSize: "1.5rem" }} />
        <Typography sx={{ color: "#009440", fontFamily: '"Montserrat"', fontWeight: 900, fontSize: "1.4rem", lineHeight: 1 }}>
          10
        </Typography>
        <Typography sx={{ color: "#009440", fontSize: "0.65rem", fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
          Placar exato
        </Typography>
        <Typography sx={{ color: "#6B6B6B", fontSize: "0.6rem", textAlign: "center", lineHeight: 1.3 }}>
          Acertou os dois números. Ex: apostou 2×1 e terminou 2×1
        </Typography>
      </Box>

      {/* 5 pontos */}
      <Box sx={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
        backgroundColor: "rgba(0,85,184,0.06)", borderRadius: "12px",
        border: "1px solid rgba(0,85,184,0.2)", p: "14px 8px",
      }}>
        <CheckCircleOutlineIcon sx={{ color: "#0055B8", fontSize: "1.5rem" }} />
        <Typography sx={{ color: "#0055B8", fontFamily: '"Montserrat"', fontWeight: 900, fontSize: "1.4rem", lineHeight: 1 }}>
          5
        </Typography>
        <Typography sx={{ color: "#0055B8", fontSize: "0.65rem", fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
          Resultado certo
        </Typography>
        <Typography sx={{ color: "#6B6B6B", fontSize: "0.6rem", textAlign: "center", lineHeight: 1.3 }}>
          Acertou quem ganhou, mas errou o placar. Ex: apostou 2×1, terminou 3×0
        </Typography>
      </Box>

      {/* 0 pontos */}
      <Box sx={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
        backgroundColor: "rgba(0,0,0,0.03)", borderRadius: "12px",
        border: "1px solid rgba(0,0,0,0.07)", p: "14px 8px",
      }}>
        <CancelOutlinedIcon sx={{ color: "#9E9E9E", fontSize: "1.5rem" }} />
        <Typography sx={{ color: "#9E9E9E", fontFamily: '"Montserrat"', fontWeight: 900, fontSize: "1.4rem", lineHeight: 1 }}>
          0
        </Typography>
        <Typography sx={{ color: "#9E9E9E", fontSize: "0.65rem", fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>
          Errou
        </Typography>
        <Typography sx={{ color: "#9E9E9E", fontSize: "0.6rem", textAlign: "center", lineHeight: 1.3 }}>
          Nem o resultado nem o placar foram acertados
        </Typography>
      </Box>
    </Box>
  );
}

// ── PredictionInput ───────────────────────────────────────────────────────────

interface PredictionInputProps {
  fixture: BolaoFixture;
  onSuccess?: (scores: { home: number; away: number }) => void;
}

export function PredictionInput({ fixture, onSuccess }: PredictionInputProps) {
  const existing = fixture.user_prediction;
  const [homeScore, setHomeScore] = useState(existing?.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(existing?.away_score ?? 0);
  const { mutate, isPending } = useCreatePrediction();

  const isClosed = new Date() >= new Date(fixture.betting_closes_at);
  const isSettled = existing != null && existing.status !== "pending";
  const disabled = isClosed || isSettled || isPending;
  const hasExisting = existing != null && !isSettled;

  function handleSubmit() {
    mutate(
      { fixture_id: fixture.fixture_id, home_score_prediction: homeScore, away_score_prediction: awayScore },
      { onSettled: () => onSuccess?.({ home: homeScore, away: awayScore }) }
    );
  }

  return (
    <Box>
      {/* Explicação de pontos */}
      <ScoringGuide />

      {/* Card de palpite */}
      <Box
        sx={{
          backgroundColor: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "16px",
          border: isSettled
            ? existing!.status === "exact"   ? "1.5px solid rgba(0,148,64,0.4)"
              : existing!.status === "outcome" ? "1.5px solid rgba(0,85,184,0.4)"
              : "1.5px solid rgba(0,0,0,0.08)"
            : "1.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          p: 3,
          mb: 2,
        }}
      >
        {/* cabeçalho */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2.5 }}>
          <SportsSoccerIcon sx={{ fontSize: "1.1rem", color: "#009440" }} />
          <Typography sx={{
            color: "#0A0A0A",
            fontSize: "0.75rem",
            fontWeight: 700,
            fontFamily: '"Montserrat"',
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}>
            {isSettled ? "Resultado da sua aposta" : hasExisting ? "Alterar seu palpite" : "Qual vai ser o placar?"}
          </Typography>
        </Box>

        {/* controles */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
          <ScoreControl value={homeScore} onChange={setHomeScore} disabled={disabled} label={fixture.home_team} />

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", px: 1, mb: 1 }}>
            <Typography sx={{
              color: "rgba(0,0,0,0.15)",
              fontFamily: '"Montserrat"',
              fontWeight: 900,
              fontSize: "2.5rem",
              lineHeight: 1,
              userSelect: "none",
            }}>
              ×
            </Typography>
          </Box>

          <ScoreControl value={awayScore} onChange={setAwayScore} disabled={disabled} label={fixture.away_team} />
        </Box>

        {/* divider */}
        <Box sx={{ height: "1px", backgroundColor: "rgba(0,0,0,0.06)", my: 1.5 }} />

        {/* estado / botão */}
        {isSettled ? (
          <Box sx={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            borderRadius: "14px", p: 2,
            backgroundColor: existing!.status === "exact"
              ? "rgba(0,148,64,0.06)"
              : existing!.status === "outcome"
              ? "rgba(0,85,184,0.06)"
              : "rgba(0,0,0,0.03)",
            border: existing!.status === "exact"
              ? "1px solid rgba(0,148,64,0.2)"
              : existing!.status === "outcome"
              ? "1px solid rgba(0,85,184,0.2)"
              : "1px solid rgba(0,0,0,0.07)",
          }}>
            {existing!.status === "exact" && (
              <>
                <EmojiEventsIcon sx={{ color: "#009440", fontSize: "2rem" }} />
                <Typography sx={{ color: "#009440", fontFamily: '"Montserrat"', fontWeight: 900, fontSize: "1rem" }}>
                  Placar exato!
                </Typography>
                <Typography sx={{ color: "#009440", fontSize: "0.8rem", fontWeight: 600 }}>
                  +{existing!.points_earned} pontos ganhos
                </Typography>
              </>
            )}
            {existing!.status === "outcome" && (
              <>
                <CheckCircleOutlineIcon sx={{ color: "#0055B8", fontSize: "2rem" }} />
                <Typography sx={{ color: "#0055B8", fontFamily: '"Montserrat"', fontWeight: 900, fontSize: "1rem" }}>
                  Resultado certo!
                </Typography>
                <Typography sx={{ color: "#0055B8", fontSize: "0.8rem", fontWeight: 600 }}>
                  +{existing!.points_earned} pontos ganhos
                </Typography>
              </>
            )}
            {existing!.status === "wrong" && (
              <>
                <CancelOutlinedIcon sx={{ color: "#9E9E9E", fontSize: "2rem" }} />
                <Typography sx={{ color: "#6B6B6B", fontFamily: '"Montserrat"', fontWeight: 700, fontSize: "1rem" }}>
                  Nao foi dessa vez
                </Typography>
              </>
            )}
            {existing!.status === "cancelled" && (
              <Typography sx={{ color: "#9E9E9E", fontSize: "0.875rem" }}>Aposta cancelada</Typography>
            )}
          </Box>
        ) : isClosed ? (
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
            backgroundColor: "rgba(230,57,70,0.06)", border: "1px solid rgba(230,57,70,0.2)",
            borderRadius: "12px", p: 1.5,
          }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#E63946" }} />
            <Typography sx={{ color: "#E63946", fontSize: "0.8rem", fontWeight: 700, fontFamily: '"Montserrat"' }}>
              Apostas encerradas para este jogo
            </Typography>
          </Box>
        ) : (
          <CazeButton fullWidth loading={isPending} onClick={handleSubmit}>
            {hasExisting ? "Atualizar aposta" : "Confirmar aposta"}
          </CazeButton>
        )}
      </Box>
    </Box>
  );
}
