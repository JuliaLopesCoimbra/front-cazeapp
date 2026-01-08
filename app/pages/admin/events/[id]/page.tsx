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
  IconButton,
  Paper,
} from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  getEventById, 
  EventResponse, 
  deleteEvent 
} from "@/app/services/events/eventService";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import DeleteEventModal from "@/app/components/admin/events/DeleteEventModal";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
      } catch (err) {
        console.error("Erro ao buscar evento", err);
        showToast("Erro ao carregar evento", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, showToast]);

  const handleDelete = async () => {
    if (!event) return;

    setDeleting(true);
    try {
      await deleteEvent(eventId);
      showToast("Evento excluído com sucesso!", "success");
      setDeleteModalOpen(false);
      router.push("/pages/user/home");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Erro ao excluir evento", "error");
      }
      throw err; // Re-throw para o modal tratar
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#ffc91f" }} />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography>Evento não encontrado.</Typography>
        <IconButton onClick={() => router.back()} sx={{ color: "#fff" }}>
          <ArrowBackIosIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header com botão de voltar */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        borderBottom="1px solid rgba(255,255,255,0.1)"
        position="sticky"
        top={0}
        backgroundColor="#000"
        zIndex={10}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton
            onClick={() => router.back()}
            size="small"
            sx={{ color: "#fff" }}
          >
            <ArrowBackIosIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700} sx={{ color: "#fff" }}>
            Detalhes do Evento
          </Typography>
        </Box>

        {/* BOTÕES ADMIN */}
        {isAdmin && (
          <Box display="flex" gap={1}>
            <IconButton
              onClick={() => router.push(`/pages/admin/events/${eventId}/edit`)}
              sx={{ color: "#ffc91f" }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => setDeleteModalOpen(true)}
              disabled={deleting}
              sx={{ color: "#ff3040" }}
            >
              {deleting ? (
                <CircularProgress size={20} sx={{ color: "#ff3040" }} />
              ) : (
                <DeleteIcon />
              )}
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Conteúdo */}
      <Box sx={{ p: 3, flex: 1 }}>
        {/* Banner */}
        {event.banner_image && (
          <Box mb={3} display="flex" justifyContent="center">
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

        {/* Card Principal */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 2,
            p: 3,
            maxWidth: 900,
            mx: "auto",
          }}
        >
          {/* TÍTULO + STATUS */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
            flexWrap="wrap"
            gap={2}
          >
            <Typography variant="h4" fontWeight={700} sx={{ color: "#fff" }}>
              {event.title}
            </Typography>

            <Chip
              label={event.is_active ? "Ativo" : "Inativo"}
              sx={{
                backgroundColor: event.is_active
                  ? "rgba(76, 175, 80, 0.2)"
                  : "rgba(158, 158, 158, 0.2)",
                color: event.is_active ? "#4caf50" : "#9e9e9e",
                fontWeight: 600,
              }}
            />
          </Box>

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />

          {/* DESCRIÇÃO */}
          <Box mb={3}>
            <Typography fontWeight={600} mb={1} sx={{ color: "#ffc91f" }}>
              Descrição
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
              {event.description || "Sem descrição"}
            </Typography>
          </Box>

          {/* LOCALIZAÇÃO */}
          {event.location && (
            <Box mb={3}>
              <Typography fontWeight={600} mb={1} sx={{ color: "#ffc91f" }}>
                Localização
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
                {event.location}
              </Typography>
            </Box>
          )}

          {/* DATAS */}
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
            <Box>
              <Typography fontWeight={600} mb={1} sx={{ color: "#ffc91f" }}>
                Data de Início
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
                {event.starts_at
                  ? new Date(event.starts_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </Typography>
            </Box>

            <Box>
              <Typography fontWeight={600} mb={1} sx={{ color: "#ffc91f" }}>
                Data de Término
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
                {event.ends_at
                  ? new Date(event.ends_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Modal de Exclusão */}
      {event && (
        <DeleteEventModal
          open={deleteModalOpen}
          eventTitle={event.title}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </Box>
  );
}
