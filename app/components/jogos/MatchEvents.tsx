"use client";

import { Box, Typography, CircularProgress } from "@mui/material";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import StyleIcon from "@mui/icons-material/Style";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import type { FixtureEvent } from "@/app/services/football/footballService";

interface MatchEventsProps {
  events: FixtureEvent[];
  homeTeamName: string;
  isLoading?: boolean;
}

function getEventIcon(type: FixtureEvent["type"], detail: string) {
  if (type === "Goal") return <SportsSoccerIcon sx={{ fontSize: 16 }} />;
  if (type === "Card") return <StyleIcon sx={{ fontSize: 16 }} />;
  if (type === "subst") return <SwapHorizIcon sx={{ fontSize: 16 }} />;
  return <Box sx={{ width: 16, height: 16 }} />;
}

function getEventColor(type: FixtureEvent["type"], detail: string): string {
  if (type === "Goal") return "#4CAF50";
  if (type === "Card") {
    if (detail.includes("Vermelho")) return "#E63946";
    return "#F5C900";
  }
  if (type === "subst") return "#0055B8";
  return "#9E9E9E";
}

function getEventLabel(event: FixtureEvent): string {
  if (event.type === "Goal") {
    if (event.detail === "Own Goal") return `Gol contra — ${event.player.name}`;
    return event.player.name + (event.assist.name ? ` (${event.assist.name})` : "");
  }
  if (event.type === "Card") return `${event.detail} — ${event.player.name}`;
  if (event.type === "subst") return `${event.assist.name ?? "?"} ↑  ${event.player.name} ↓`;
  return event.detail;
}

export default function MatchEvents({ events, homeTeamName, isLoading = false }: MatchEventsProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={28} sx={{ color: "#F5C900" }} />
      </Box>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Typography sx={{ color: "#9E9E9E", textAlign: "center", py: 3, fontSize: "0.875rem" }}>
        Nenhum evento registrado ainda.
      </Typography>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      {/* Vertical timeline line */}
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: "1px",
          backgroundColor: "rgba(255,209,0,0.15)",
          transform: "translateX(-50%)",
        }}
      />

      {events.map((event, i) => {
        const isHome = event.team.name === homeTeamName;
        const color = getEventColor(event.type, event.detail);

        return (
          <Box
            key={i}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: isHome ? "flex-end" : "flex-start",
              mb: 1.5,
              position: "relative",
            }}
          >
            {/* Event block */}
            <Box
              sx={{
                maxWidth: "42%",
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: "8px",
                px: "10px",
                py: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexDirection: isHome ? "row-reverse" : "row",
              }}
            >
              <Box sx={{ color, display: "flex", alignItems: "center", flexShrink: 0 }}>
                {getEventIcon(event.type, event.detail)}
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.7rem", color: "#9E9E9E" }}>
                  {event.time.elapsed}&apos;{event.time.extra ? `+${event.time.extra}` : ""}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#FFF", fontWeight: 500, lineHeight: 1.3 }}>
                  {getEventLabel(event)}
                </Typography>
              </Box>
            </Box>

            {/* Center dot */}
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: color,
                border: "2px solid #0A1128",
                zIndex: 1,
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
