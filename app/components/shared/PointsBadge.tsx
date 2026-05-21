"use client";

import { Box, Typography, Skeleton } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import type { BolaoMyPoints } from "@/app/types/bolao";

interface PointsBadgeProps {
  points?: BolaoMyPoints;
  isLoading?: boolean;
  compact?: boolean;
}

export function PointsBadge({ points, isLoading, compact = false }: PointsBadgeProps) {
  if (isLoading) {
    return (
      <Skeleton
        variant="rectangular"
        width={compact ? 80 : "100%"}
        height={compact ? 36 : 72}
        sx={{ borderRadius: "12px", backgroundColor: "#2A2A2A" }}
      />
    );
  }

  if (compact) {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          backgroundColor: "rgba(245,201,0,0.12)",
          borderRadius: "20px",
          px: 1.5,
          py: 0.5,
          border: "1px solid rgba(245,201,0,0.3)",
        }}
      >
        <EmojiEventsIcon sx={{ color: "#F5C900", fontSize: "1rem" }} />
        <Typography
          sx={{
            color: "#F5C900",
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: 700,
            fontSize: "0.875rem",
          }}
        >
          {points?.total_points ?? 0}pts
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#1A1A1A",
        borderRadius: "16px",
        p: 2,
        border: "1px solid rgba(245,201,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <EmojiEventsIcon sx={{ color: "#F5C900", fontSize: "2rem" }} />

      <Box>
        <Typography
          sx={{
            color: "#F5C900",
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontWeight: 900,
            fontSize: "1.75rem",
            lineHeight: 1,
          }}
        >
          {points?.total_points ?? 0}
        </Typography>
        <Typography sx={{ color: "#9E9E9E", fontSize: "0.75rem" }}>pontos</Typography>
      </Box>

      {points?.rank != null && (
        <Box sx={{ ml: "auto", textAlign: "right" }}>
          <Typography
            sx={{
              color: "#FFFFFF",
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontWeight: 700,
              fontSize: "1.25rem",
              lineHeight: 1,
            }}
          >
            #{points.rank}
          </Typography>
          <Typography sx={{ color: "#9E9E9E", fontSize: "0.75rem" }}>ranking</Typography>
        </Box>
      )}
    </Box>
  );
}
