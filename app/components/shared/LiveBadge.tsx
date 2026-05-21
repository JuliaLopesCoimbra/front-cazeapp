"use client";

import { Box, Typography } from "@mui/material";

interface LiveBadgeProps {
  variant?: "compact" | "expanded";
  score?: { home: number; away: number };
  homeTeam?: string;
  awayTeam?: string;
}

export default function LiveBadge({
  variant = "compact",
  score,
  homeTeam,
  awayTeam,
}: LiveBadgeProps) {
  if (variant === "compact") {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          backgroundColor: "#E63946",
          borderRadius: "999px",
          px: "8px",
          py: "3px",
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            animation: "live-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            "@keyframes live-pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.3 },
            },
          }}
        />
        <Typography
          sx={{
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: 700,
            fontSize: "0.625rem",
            color: "#FFFFFF",
            letterSpacing: "0.08em",
          }}
        >
          AO VIVO
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: "rgba(230,57,70,0.12)",
        border: "1px solid #E63946",
        borderRadius: "12px",
        px: "12px",
        py: "8px",
      }}
    >
      {homeTeam && (
        <Typography
          sx={{
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: 700,
            fontSize: "0.875rem",
            color: "#FFFFFF",
          }}
        >
          {homeTeam}
        </Typography>
      )}

      {score !== undefined && (
        <Typography
          sx={{
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: 900,
            fontSize: "1.25rem",
            color: "#F5C900",
            letterSpacing: "0.05em",
          }}
        >
          {score.home} – {score.away}
        </Typography>
      )}

      {awayTeam && (
        <Typography
          sx={{
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: 700,
            fontSize: "0.875rem",
            color: "#FFFFFF",
          }}
        >
          {awayTeam}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          backgroundColor: "#E63946",
          borderRadius: "999px",
          px: "8px",
          py: "3px",
          ml: "4px",
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            animation: "live-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            "@keyframes live-pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.3 },
            },
          }}
        />
        <Typography
          sx={{
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: 700,
            fontSize: "0.625rem",
            color: "#FFFFFF",
            letterSpacing: "0.08em",
          }}
        >
          AO VIVO
        </Typography>
      </Box>
    </Box>
  );
}
