"use client";

import { Box, Typography, Button } from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EventResponse } from "@/app/services/events/eventAppService";
import { LAYOUT } from "@/app/constants/designTokens";

interface EventDetailProps {
  event: EventResponse;
}

const GLASS_CARD = {
  backgroundColor: "#151c2e",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 2px 12px rgba(0,0,0,0.32)",
} as const;

function formatEventDate(iso: string) {
  try {
    return format(parseISO(iso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

function formatEventTime(iso: string) {
  try {
    return format(parseISO(iso), "HH'h'mm", { locale: ptBR });
  } catch {
    return "";
  }
}

export default function EventDetail({ event }: EventDetailProps) {
  return (
    <Box sx={{ px: `${LAYOUT.pagePaddingX}px`, pt: 2, pb: 4, maxWidth: LAYOUT.feedMaxWidth, mx: "auto", backgroundColor: "#0A1128", minHeight: "100%" }}>

      {/* Banner */}
      {event.banner_image && (
        <Box sx={{
          position: "relative",
          width: "100%",
          height: 220,
          borderRadius: "20px",
          overflow: "hidden",
          mb: 2.5,
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        }}>
          <Box
            component="img"
            src={event.banner_image}
            alt={event.title}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <Box sx={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)",
          }} />
          <Box sx={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
            <Typography sx={{
              color: "#FFFFFF",
              fontFamily: '"Montserrat"',
              fontWeight: 900,
              fontSize: "1.4rem",
              lineHeight: 1.2,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}>
              {event.title}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Info cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

        {/* Data */}
        <Box sx={{ ...GLASS_CARD, p: "14px 16px", display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <CalendarTodayOutlinedIcon sx={{ color: "#008542", fontSize: "1.25rem", mt: 0.25, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.25 }}>
              Data
            </Typography>
            <Typography sx={{ color: "#FFFFFF", fontSize: "0.9rem", fontWeight: 600, fontFamily: '"Montserrat"' }}>
              13 de junho de 2026
            </Typography>
          </Box>
        </Box>

        {/* Horário */}
        <Box sx={{ ...GLASS_CARD, p: "14px 16px", display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <AccessTimeOutlinedIcon sx={{ color: "#008542", fontSize: "1.25rem", mt: 0.25, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.25 }}>
              Horário
            </Typography>
            <Typography sx={{ color: "#FFFFFF", fontSize: "0.9rem", fontWeight: 600, fontFamily: '"Montserrat"' }}>
              19h00 — 23h00
            </Typography>
          </Box>
        </Box>

        {/* Localização */}
        {event.location && (
          <Box sx={{ ...GLASS_CARD, p: "14px 16px", display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <LocationOnOutlinedIcon sx={{ color: "#008542", fontSize: "1.25rem", mt: 0.25, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.25 }}>
                Local
              </Typography>
              <Typography sx={{ color: "#FFFFFF", fontSize: "0.9rem", fontWeight: 600, fontFamily: '"Montserrat"', lineHeight: 1.4 }}>
                {event.location}
              </Typography>
            </Box>
          </Box>
        )}


        {/* Botão ingresso */}
        {event.ticket_url && (
          <Button
            component="a"
            href={event.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            fullWidth
            startIcon={<ConfirmationNumberOutlinedIcon />}
            sx={{
              mt: 1,
              py: 1.75,
              borderRadius: "14px",
              backgroundColor: "#008542",
              color: "#FFFFFF",
              fontFamily: '"Montserrat"',
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "none",
              boxShadow: "0 4px 16px rgba(0,133,66,0.3)",
              "&:hover": {
                backgroundColor: "#006b2c",
                boxShadow: "0 6px 20px rgba(0,133,66,0.4)",
              },
            }}
          >
            Comprar ingresso
          </Button>
        )}
      </Box>
    </Box>
  );
}
