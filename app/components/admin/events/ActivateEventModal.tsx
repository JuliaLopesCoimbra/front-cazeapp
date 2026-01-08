"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useToast } from "@/app/context/ToastContext";

interface Props {
  open: boolean;
  eventTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function ActivateEventModal({
  open,
  eventTitle,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  const { showToast } = useToast();

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Erro ao ativar evento";
      showToast(message, "error");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {},
        root: {
          sx: {
            zIndex: 1600,
          },
        },
      }}
      PaperProps={{
        sx: {
          backgroundColor: "#1a1a1a",
          color: "#fff",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          pb: 2,
          fontWeight: 600,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "rgba(76, 175, 80, 0.1)",
          }}
        >
          <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 28 }} />
        </Box>
        Ativar Evento
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography
          variant="body1"
          sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}
        >
          Tem certeza que deseja ativar este evento?
        </Typography>
        <Box
          sx={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 1,
            p: 2,
            borderLeft: "3px solid #4caf50",
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ color: "#fff", mb: 0.5 }}
          >
            {eventTitle}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.6)" }}
          >
            O evento ficará visível para todos os usuários e poderá ser selecionado.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          p: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "rgba(255,255,255,0.7)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.05)",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            backgroundColor: "#4caf50",
            color: "#fff",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#45a049",
            },
            "&:disabled": {
              backgroundColor: "rgba(76, 175, 80, 0.3)",
              color: "rgba(255,255,255,0.3)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#fff" }} />
          ) : (
            "Ativar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

