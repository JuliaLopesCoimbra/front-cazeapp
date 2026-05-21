"use client";

import React from "react";
import { Box, Typography, Avatar, Skeleton } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import type { BolaoRankingEntry } from "@/app/types/bolao";

const MEDAL_COLORS = ["#F5C900", "#C0C0C0", "#CD7F32"] as const;

interface RankingTableProps {
  entries: BolaoRankingEntry[];
  isLoading?: boolean;
  currentUserId?: number;
}

function RankingSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={64}
          sx={{ borderRadius: "12px", backgroundColor: "#1A1A1A" }}
        />
      ))}
    </Box>
  );
}

interface RankingRowProps {
  entry: BolaoRankingEntry;
  currentUserId?: number;
}

const RankingRow = React.memo(function RankingRow({ entry, currentUserId }: RankingRowProps) {
  const isMe = currentUserId != null && entry.user_id === currentUserId;
  const medalColor = entry.rank <= 3 ? MEDAL_COLORS[entry.rank - 1] : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        backgroundColor: isMe ? "rgba(245, 201, 0, 0.08)" : "#1A1A1A",
        borderRadius: "12px",
        p: 1.5,
        border: isMe ? "1px solid rgba(245,201,0,0.3)" : "1px solid transparent",
      }}
    >
      <Box sx={{ minWidth: 32, textAlign: "center" }}>
        {medalColor ? (
          <EmojiEventsIcon sx={{ color: medalColor, fontSize: "1.25rem" }} />
        ) : (
          <Typography
            sx={{
              color: "#9E9E9E",
              fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
              fontWeight: 700,
              fontSize: "0.875rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {entry.rank}
          </Typography>
        )}
      </Box>

      <Avatar
        src={entry.avatar_url ?? undefined}
        sx={{
          width: 36,
          height: 36,
          backgroundColor: "#333",
          fontSize: "0.875rem",
        }}
      >
        {(entry.display_name ?? "?")[0]?.toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          noWrap
          sx={{
            color: isMe ? "#F5C900" : "#FFFFFF",
            fontWeight: isMe ? 700 : 500,
            fontSize: "0.875rem",
          }}
        >
          {entry.display_name ?? "Usuário"}{isMe ? " (você)" : ""}
        </Typography>
        <Typography sx={{ color: "#9E9E9E", fontSize: "0.7rem" }}>
          {entry.exact_predictions} exatos · {entry.correct_outcomes} certos
        </Typography>
      </Box>

      <Typography
        sx={{
          color: "#F5C900",
          fontFamily: 'var(--font-space-mono), "Space Mono", monospace',
          fontWeight: 700,
          fontSize: "1rem",
          flexShrink: 0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {entry.total_points}
      </Typography>
    </Box>
  );
});

export function RankingTable({ entries, isLoading, currentUserId }: RankingTableProps) {
  if (isLoading) return <RankingSkeleton />;

  if (entries.length === 0) {
    return (
      <Typography sx={{ color: "#9E9E9E", textAlign: "center", py: 4 }}>
        Ranking ainda vazio. Seja o primeiro a apostar! 🏆
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {entries.map((entry) => (
        <RankingRow key={entry.user_id} entry={entry} currentUserId={currentUserId} />
      ))}
    </Box>
  );
}
