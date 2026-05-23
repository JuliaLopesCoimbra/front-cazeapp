"use client";

import React from "react";
import { Box, Typography, Avatar, Skeleton } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import type { BolaoRankingEntry } from "@/app/types/bolao";

const MEDAL_COLORS = ["#F5C900", "#C0C0C0", "#CD7F32"] as const;

interface RankingTableProps {
  entries: BolaoRankingEntry[];
  isLoading?: boolean;
  currentUserId?: number | string;
}

function RankingSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={64}
          sx={{ borderRadius: "12px", backgroundColor: "rgba(0,0,0,0.07)" }}
        />
      ))}
    </Box>
  );
}

interface RankingRowProps {
  entry: BolaoRankingEntry;
  currentUserId?: number | string;
}

const RankingRow = React.memo(function RankingRow({ entry, currentUserId }: RankingRowProps) {
  const isMe = currentUserId != null && entry.user_id === currentUserId;
  const medalColor = entry.rank <= 3 ? MEDAL_COLORS[entry.rank - 1] : undefined;
  const isTop3 = entry.rank <= 3;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        backgroundColor: isMe
          ? "rgba(0,148,64,0.07)"
          : isTop3
          ? "rgba(255,255,255,0.8)"
          : "rgba(255,255,255,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius: "12px",
        p: 1.5,
        border: isMe
          ? "1px solid rgba(0,148,64,0.35)"
          : isTop3
          ? `1px solid ${medalColor}44`
          : "1px solid rgba(0,0,0,0.07)",
        boxShadow: isTop3
          ? `0 2px 8px ${medalColor}22`
          : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.15s",
      }}
    >
      {/* Rank / medal */}
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
          backgroundColor: isTop3 ? `${medalColor}33` : "#E8E8E8",
          color: isTop3 ? medalColor : "#6B6B6B",
          fontSize: "0.875rem",
          fontWeight: 700,
        }}
      >
        {(entry.display_name ?? "?")[0]?.toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {entry.country_code && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://flagcdn.com/w20/${entry.country_code}.png`}
              width={18}
              height={13}
              alt=""
              style={{ borderRadius: 2, objectFit: "cover", flexShrink: 0 }}
            />
          )}
          <Typography
            noWrap
            sx={{
              color: isMe ? "#009440" : "#0A0A0A",
              fontWeight: isMe || isTop3 ? 700 : 500,
              fontSize: "0.875rem",
            }}
          >
            {entry.display_name ?? "Usuário"}{isMe ? " (você)" : ""}
          </Typography>
        </Box>
        <Typography sx={{ color: "#9E9E9E", fontSize: "0.7rem" }}>
          {entry.exact_predictions} exatos · {entry.correct_outcomes} certos
        </Typography>
      </Box>

      <Typography
        sx={{
          color: isTop3 ? medalColor : "#009440",
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
      <Typography sx={{ color: "#6B6B6B", textAlign: "center", py: 4 }}>
        Ranking ainda vazio. Seja o primeiro a apostar!
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
