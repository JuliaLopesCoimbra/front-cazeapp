"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StadiumIcon from "@mui/icons-material/Stadium";
import { Button } from "@mui/material";
import { getLineupItemsByEvent, LineupItemResponse } from "@/app/services/lineup/lineupService";
import { getParadeLineupItemsByEvent, ParadeLineupItemResponse } from "@/app/services/paradeLineup/paradeLineupService";

interface LineupViewProps {
  eventId: number;
  accentColor?: string;
  onlyShows?: boolean;
}

export default function LineupView({ eventId, accentColor = "#ffc91f", onlyShows = false }: LineupViewProps) {
  const [lineupType, setLineupType] = useState<'shows' | 'parade'>('shows');
  const [lineupItems, setLineupItems] = useState<LineupItemResponse[]>([]);
  const [paradeLineupItems, setParadeLineupItems] = useState<ParadeLineupItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (onlyShows && lineupType !== "shows") {
      setLineupType("shows");
      return;
    }

    const fetchLineup = async () => {
      try {
        setLoading(true);
        if (lineupType === 'shows') {
          const items = await getLineupItemsByEvent(eventId).catch(() => []);
          setLineupItems(items || []);
        } else {
          const items = await getParadeLineupItemsByEvent(eventId).catch(() => []);
          setParadeLineupItems(items || []);
        }
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar lineup:", err);
        if (err?.response?.status === 404) {
          if (lineupType === 'shows') setLineupItems([]);
          else setParadeLineupItems([]);
          setError(null);
        } else {
          setError("Erro ao carregar programação");
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchLineup();
  }, [eventId, lineupType, onlyShows]);

  const formatTime = (timeString: string): string => {
    const parts = timeString.split(":");
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeString;
  };

  const formatDateOnly = (dateStr: string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }) =>
    new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", options);

  const { dates, filteredItems, filteredParadeItems } = useMemo(() => {
    const itemsToProcess = lineupType === 'shows' ? lineupItems : paradeLineupItems;
    const datesSet = new Set<string>();
    itemsToProcess.forEach((item) => { if (item.event_date) datesSet.add(item.event_date); });
    const datesArray = Array.from(datesSet).sort();

    let filtered: LineupItemResponse[] = [];
    let filteredParade: ParadeLineupItemResponse[] = [];

    if (lineupType === 'shows') {
      filtered = selectedDate
        ? lineupItems.filter((item) => item.event_date === selectedDate)
        : datesArray.length > 0
          ? lineupItems.filter((item) => !item.event_date)
          : lineupItems;
    } else {
      filteredParade = selectedDate
        ? paradeLineupItems.filter((item) => item.event_date === selectedDate)
        : datesArray.length > 0
          ? paradeLineupItems.filter((item) => !item.event_date)
          : paradeLineupItems;
    }

    return { dates: datesArray, filteredItems: filtered, filteredParadeItems: filteredParade };
  }, [lineupItems, paradeLineupItems, selectedDate, lineupType]);

  useEffect(() => { setSelectedDate(null); }, [lineupType]);

  useEffect(() => {
    if (dates.length > 0) {
      if (selectedDate === null || !dates.includes(selectedDate)) setSelectedDate(dates[0]);
    } else {
      setSelectedDate(null);
    }
  }, [dates, selectedDate]);

  const currentItems = lineupType === 'shows' ? filteredItems : filteredParadeItems;
  const isEmpty = lineupType === 'shows' ? lineupItems.length === 0 : paradeLineupItems.length === 0;

  const cardSx = {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 3,
    display: "flex",
    alignItems: "stretch",
    border: "1px solid rgba(255,255,255,0.08)",
    borderLeft: `3px solid ${accentColor}`,
    overflow: "hidden",
    transition: "background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.08)",
      transform: "translateY(-2px)",
      boxShadow: `0 8px 24px rgba(0,0,0,0.35)`,
    },
  };

  const renderShowCard = (showItem: LineupItemResponse) => (
    <Box key={showItem.id} sx={cardSx}>
      {/* Imagem */}
      <Box
        sx={{
          width: { xs: 88, sm: 120, md: 140 },
          minWidth: { xs: 88, sm: 120, md: 140 },
          position: "relative",
          overflow: "hidden",
          backgroundColor: `${accentColor}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {showItem.artist_image_url ? (
          <Box
            component="img"
            src={showItem.artist_image_url}
            alt={showItem.artist_name}
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <MusicNoteIcon sx={{ fontSize: { xs: 28, md: 36 }, color: `${accentColor}50` }} />
        )}
        {/* Badge de ordem */}
        {showItem.display_order != null && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: accentColor,
              color: "#000",
              borderRadius: "50%",
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {showItem.display_order}
          </Box>
        )}
      </Box>

      {/* Conteúdo */}
      <Box
        sx={{
          flex: 1,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.25, sm: 1.75 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 0.5,
          minHeight: { xs: 88, sm: 120, md: 140 },
        }}
      >
        <Box>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 800,
              fontSize: { xs: "0.9rem", sm: "1.05rem", md: "1.2rem" },
              textTransform: "uppercase",
              lineHeight: 1.2,
              letterSpacing: "0.02em",
            }}
          >
            {showItem.artist_name}
          </Typography>

          {showItem.stage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
              <StadiumIcon sx={{ fontSize: 13, color: accentColor }} />
              <Typography
                sx={{
                  color: accentColor,
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  fontWeight: 600,
                }}
              >
                {showItem.stage}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Chip de horário */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: "8px",
            px: 1.25,
            py: 0.5,
            alignSelf: "flex-start",
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 13, color: accentColor }} />
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontFamily: "monospace",
              fontSize: { xs: "0.9rem", sm: "1rem" },
              letterSpacing: "0.05em",
            }}
          >
            {formatTime(showItem.performance_time)}
          </Typography>
          {showItem.performance_end_time && (
            <Typography
              sx={{
                color: "rgba(255,255,255,0.5)",
                fontFamily: "monospace",
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              → {formatTime(showItem.performance_end_time)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );

  const renderParadeCard = (paradeItem: ParadeLineupItemResponse) => (
    <Box key={paradeItem.id} sx={cardSx}>
      {/* Imagem */}
      <Box
        sx={{
          width: { xs: 88, sm: 120, md: 140 },
          minWidth: { xs: 88, sm: 120, md: 140 },
          position: "relative",
          overflow: "hidden",
          backgroundColor: `${accentColor}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {paradeItem.samba_school_image_url ? (
          <Box
            component="img"
            src={paradeItem.samba_school_image_url}
            alt={paradeItem.samba_school_name}
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <MusicNoteIcon sx={{ fontSize: { xs: 28, md: 36 }, color: `${accentColor}50` }} />
        )}
        {paradeItem.display_order != null && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: accentColor,
              color: "#000",
              borderRadius: "50%",
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {paradeItem.display_order}
          </Box>
        )}
      </Box>

      {/* Conteúdo */}
      <Box
        sx={{
          flex: 1,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.25, sm: 1.75 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 0.5,
          minHeight: { xs: 88, sm: 120, md: 140 },
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: { xs: "0.9rem", sm: "1.05rem", md: "1.2rem" },
            textTransform: "uppercase",
            lineHeight: 1.2,
            letterSpacing: "0.02em",
          }}
        >
          {paradeItem.samba_school_name || "Escola de Samba"}
        </Typography>

        {paradeItem.event_date !== "2026-02-21" && paradeItem.performance_time && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: "8px",
              px: 1.25,
              py: 0.5,
              alignSelf: "flex-start",
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 13, color: accentColor }} />
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontFamily: "monospace",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                letterSpacing: "0.05em",
              }}
            >
              {formatTime(paradeItem.performance_time)}
            </Typography>
            {paradeItem.performance_end_time && (
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "monospace",
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                }}
              >
                → {formatTime(paradeItem.performance_end_time)}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        pt: 3,
        pb: { xs: 4, sm: 2 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 800,
        mx: "auto",
        width: "100%",
      }}
    >
      {/* Toggle shows / desfile */}
      {!onlyShows && (
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            mb: 3,
            px: { xs: 1, sm: 2 },
            width: "100%",
          }}
        >
          {(["shows", "parade"] as const).map((type) => {
            const active = lineupType === type;
            return (
              <Button
                key={type}
                onClick={() => setLineupType(type)}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: active ? 700 : 500,
                  px: { xs: 2, md: 3 },
                  height: { xs: 40, md: 44 },
                  flex: 1,
                  fontSize: { xs: "0.875rem", md: "0.95rem" },
                  backgroundColor: active ? accentColor : "rgba(255,255,255,0.06)",
                  color: "#fff",
                  border: `1px solid ${active ? accentColor : "rgba(255,255,255,0.15)"}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: active ? accentColor : "rgba(255,255,255,0.1)",
                    borderColor: active ? accentColor : "rgba(255,255,255,0.3)",
                    color: "#fff",
                  },
                }}
              >
                {type === "shows" ? "Line Up de Shows" : "Line Up de Desfile"}
              </Button>
            );
          })}
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: accentColor }} />
        </Box>
      ) : error ? (
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            p: 4,
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.1)",
            width: "100%",
          }}
        >
          <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>{error}</Typography>
        </Paper>
      ) : isEmpty ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <MusicNoteIcon sx={{ fontSize: 56, color: "rgba(255,255,255,0.15)", mb: 2 }} />
          <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>
            {lineupType === "shows"
              ? "Nenhum artista cadastrado no lineup ainda."
              : "Nenhuma escola de samba cadastrada no lineup de desfile ainda."}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
            px: { xs: 1, sm: 2 },
          }}
        >
          {/* Seletor de datas em pills */}
          {dates.length > 0 && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                pb: 0.5,
              }}
            >
              {dates.map((date) => {
                const active = selectedDate === date;
                return (
                  <Box
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    sx={{
                      flexShrink: 0,
                      px: 2,
                      py: 0.75,
                      borderRadius: "999px",
                      cursor: "pointer",
                      border: `1px solid ${active ? accentColor : "rgba(255,255,255,0.2)"}`,
                      backgroundColor: active ? accentColor : "transparent",
                      color: active ? "#000" : "rgba(255,255,255,0.75)",
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      fontWeight: active ? 700 : 500,
                      transition: "all 0.15s ease",
                      userSelect: "none",
                      "&:hover": {
                        borderColor: accentColor,
                        color: active ? "#000" : accentColor,
                      },
                    }}
                  >
                    {formatDateOnly(date, { weekday: "short", day: "2-digit", month: "short" })}
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Lista de itens */}
          {currentItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
                {lineupType === "shows"
                  ? "Nenhum artista cadastrado para esta data."
                  : "Nenhuma escola de samba cadastrada para esta data."}
              </Typography>
            </Box>
          ) : (
            currentItems.map((item) =>
              lineupType === "shows"
                ? renderShowCard(item as LineupItemResponse)
                : renderParadeCard(item as ParadeLineupItemResponse)
            )
          )}
        </Box>
      )}
    </Box>
  );
}
