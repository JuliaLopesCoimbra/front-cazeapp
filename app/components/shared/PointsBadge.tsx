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
        sx={{ borderRadius: "12px", backgroundColor: "rgba(0,0,0,0.07)" }}
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
            fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
            fontWeight: 700,
            fontSize: "0.875rem",
            fontVariantNumeric: "tabular-nums",
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
        backgroundColor: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius: "16px",
        p: 2,
        border: "1px solid rgba(0,148,64,0.2)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <EmojiEventsIcon sx={{ color: "#009440", fontSize: "2rem" }} />

      <Box>
        <Typography
          sx={{
            color: "#009440",
            fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
            fontWeight: 700,
            fontSize: "1.75rem",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {points?.total_points ?? 0}
        </Typography>
        <Typography sx={{ color: "#6B6B6B", fontSize: "0.75rem" }}>pontos</Typography>
      </Box>

      {points?.rank != null && (
        <Box sx={{ ml: "auto", textAlign: "right" }}>
          <Typography
            sx={{
              color: "#0A0A0A",
              fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
              fontWeight: 700,
              fontSize: "1.25rem",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            #{points.rank}
          </Typography>
          <Typography sx={{ color: "#6B6B6B", fontSize: "0.75rem" }}>ranking</Typography>
        </Box>
      )}
    </Box>
  );
}
