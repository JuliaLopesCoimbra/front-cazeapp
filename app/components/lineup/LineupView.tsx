"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Avatar,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { getLineupItemsByEvent, LineupItemResponse } from "@/app/services/lineup/lineupService";

interface LineupViewProps {
  eventId: number;
}

export default function LineupView({ eventId }: LineupViewProps) {
  const [lineupItems, setLineupItems] = useState<LineupItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        setLoading(true);
        const items = await getLineupItemsByEvent(eventId);
        setLineupItems(items);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar lineup:", err);
        // Se for 404, pode ser que não há lineup ainda ou a rota não existe
        // Tratamos como lista vazia ao invés de erro
        if (err?.response?.status === 404) {
          setLineupItems([]);
          setError(null);
        } else {
          setError("Erro ao carregar programação");
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchLineup();
    }
  }, [eventId]);

  const formatTime = (timeString: string): string => {
    // Formato esperado: HH:mm:ss ou HH:mm
    const parts = timeString.split(":");
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeString;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <CircularProgress sx={{ color: "#ffc91f" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>{error}</Typography>
      </Box>
    );
  }

  if (lineupItems.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
          Nenhum artista cadastrado no lineup ainda.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 700,
        width: "100%",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          marginBottom: 3,
        }}
      >
        <MusicNoteIcon style={{ color: "#ffc91f" }} />
        <Typography
          variant="h6"
          sx={{
            margin: 0,
            color: "white",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Programação (Line Up)
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {lineupItems.map((item) => (
          <Paper
            key={item.id}
            elevation={0}
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              padding: 3,
              display: "flex",
              alignItems: "flex-start",
              gap: 3,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Foto do Artista - Esquerda */}
            {item.artist_image_url ? (
              <Avatar
                src={item.artist_image_url}
                alt={item.artist_name}
                sx={{
                  width: 100,
                  height: 100,
                  border: "3px solid rgba(255, 201, 31, 0.3)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  backgroundColor: "rgba(255, 201, 31, 0.2)",
                  border: "3px solid rgba(255, 201, 31, 0.3)",
                  flexShrink: 0,
                }}
              >
                <MusicNoteIcon sx={{ fontSize: "2.5rem" }} />
              </Avatar>
            )}

            {/* Informações - Direita */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                flex: 1,
              }}
            >
              {/* Nome do Artista */}
              <Typography
                sx={{
                  color: "white",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                }}
              >
                {item.artist_name}
              </Typography>

              {/* Horário */}
              <Typography
                sx={{
                  color: "#ffc91f",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {formatTime(item.performance_time)}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

