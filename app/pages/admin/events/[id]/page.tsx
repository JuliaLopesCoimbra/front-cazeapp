"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { getEventById, EventResponse } from "@/app/services/events/eventService";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
      } catch (err) {
        console.error("Erro ao buscar evento", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box p={4}>
        <Typography>Evento não encontrado.</Typography>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      px={{ xs: 2, md: 6 }}
      py={4}
      sx={{
        backgroundColor: "#f4f7fc",
        backgroundImage: "url(/background/dashboard.png)",
        backgroundSize: "cover",
      }}
    >
      {/* HEADER */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIosIcon />}
          onClick={() => router.back()}
          sx={{ textTransform: "none", color: "white" }}
        >
          
        </Button>

        <Typography variant="h5" fontWeight={700}>
          Detalhes do evento
        </Typography>
      </Box>
        {event.banner_image && (
<Box mt={4} display="flex" justifyContent="center">
  <Box
    component="img"
    src={event.banner_image}
    alt={event.title}
    sx={{
      width: 280,
      height: 280,
      objectFit: "cover",
      borderRadius: "50%",
    }}
  />
</Box>

        )}

      {/* CARD PRINCIPAL */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderRadius: 3,
          p: 3,
          maxWidth: 900,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* TÍTULO + STATUS */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" fontWeight={700}>
            {event.title}
          </Typography>

          <Chip
            label={event.is_active ? "Ativo" : "Inativo"}
            color={event.is_active ? "success" : "default"}
            variant={event.is_active ? "filled" : "outlined"}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* DESCRIÇÃO */}
        <Box mb={3}>
          <Typography fontWeight={600} mb={0.5}>
            Descrição
          </Typography>
          <Typography color="text.secondary">
            {event.description || "Sem descrição"}
          </Typography>
        </Box>

        {/* DATAS */}
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <Box>
            <Typography fontWeight={600} mb={0.5}>
              Início
            </Typography>
            <Typography color="text.secondary">
              {event.starts_at
                ? new Date(event.starts_at).toLocaleString("pt-BR")
                : "-"}
            </Typography>
          </Box>

          <Box>
            <Typography fontWeight={600} mb={0.5}>
              Fim
            </Typography>
            <Typography color="text.secondary">
              {event.ends_at
                ? new Date(event.ends_at).toLocaleString("pt-BR")
                : "-"}
            </Typography>
          </Box>
        </Box>

        
      
      </Box>
    </Box>
  );
}
