"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  Chip,
} from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getWorldCupGames, WorldCupGameResponse } from "@/app/services/worldCupGames/worldCupGameService";

interface Props {
  eventId: number;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return "";
  // "HH:mm:ss" → "HH:mm"
  return timeStr.slice(0, 5);
}

export default function WorldCupGames({ eventId }: Props) {
  const [games, setGames] = useState<WorldCupGameResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getWorldCupGames(eventId)
      .then((data) => {
        if (!cancelled) setGames(data);
      })
      .catch(() => {
        // silently fail — empty list is fine
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [eventId]);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 800,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        pb: 4,
      }}
    >
      {/* Section header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <SportsSoccerIcon sx={{ color: "#ffc91f", fontSize: 22 }} />
        <Typography
          variant="h6"
          sx={{ color: "#ffc91f", fontWeight: 700, fontSize: "1rem" }}
        >
          Jogos
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width="100%"
              height={120}
              sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: 2 }}
            />
          ))}
        </Box>
      ) : games.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          <SportsSoccerIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography variant="body2">Nenhum jogo cadastrado ainda.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {games.map((game) => (
            <Card
              key={game.id}
              sx={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.1)",
                overflow: "hidden",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              {game.photo_url && (
                <CardMedia
                  component="img"
                  image={game.photo_url}
                  alt={game.title}
                  sx={{
                    width: { xs: "100%", sm: 140 },
                    height: { xs: 160, sm: 140 },
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              )}
              <CardContent
                sx={{
                  flex: 1,
                  p: { xs: 1.5, sm: 2 },
                  "&:last-child": { pb: { xs: 1.5, sm: 2 } },
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    lineHeight: 1.3,
                  }}
                >
                  {game.title}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                  {game.game_date && (
                    <Chip
                      icon={<CalendarTodayIcon sx={{ fontSize: "0.75rem !important" }} />}
                      label={formatDate(game.game_date)}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,201,31,0.15)",
                        color: "#ffc91f",
                        border: "1px solid rgba(255,201,31,0.35)",
                        fontSize: "0.75rem",
                        height: 24,
                        "& .MuiChip-icon": { color: "#ffc91f" },
                      }}
                    />
                  )}
                  {game.game_time && (
                    <Chip
                      icon={<AccessTimeIcon sx={{ fontSize: "0.75rem !important" }} />}
                      label={formatTime(game.game_time)}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        fontSize: "0.75rem",
                        height: 24,
                        "& .MuiChip-icon": { color: "rgba(255,255,255,0.6)" },
                      }}
                    />
                  )}
                </Box>

                {game.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: "0.82rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {game.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
