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
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useToast } from "@/app/context/ToastContext";
import { getStoredEventBrandKey } from "@/app/utils/eventBranding";

interface Props {
  open: boolean;
  newsTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function DeleteNewsModal({
  open,
  newsTitle,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  const { showToast } = useToast();
  const isTorcida = getStoredEventBrandKey() === "n1_torcida";

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Erro ao excluir notícia";
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
          backgroundColor: isTorcida ? "#d4a400" : "#1a1a1a",
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
          borderBottom: isTorcida ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.1)",
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
            backgroundColor: isTorcida ? "rgba(255,255,255,0.18)" : "rgba(255, 48, 64, 0.1)",
          }}
        >
          <WarningAmberIcon sx={{ color: "#fff", fontSize: 28 }} />
        </Box>
        Excluir Notícia
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Typography
          variant="body1"
          sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}
        >
          Tem certeza que deseja excluir esta notícia?
        </Typography>
        <Box
          sx={{
            backgroundColor: isTorcida ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
            borderRadius: 1,
            p: 2,
            borderLeft: "3px solid #fff",
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ color: "#fff", mb: 0.5 }}
          >
            {newsTitle}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.6)" }}
          >
            Esta ação não pode ser desfeita.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: isTorcida ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.1)",
          p: 2,
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "rgba(255,255,255,0.95)",
            "&:hover": {
              backgroundColor: isTorcida ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
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
            backgroundColor: isTorcida ? "#ffffff" : "#ff3040",
            color: isTorcida ? "#000" : "#fff",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: isTorcida ? "rgba(255,255,255,0.85)" : "#e02e3a",
            },
            "&:disabled": {
              backgroundColor: isTorcida ? "rgba(255,255,255,0.35)" : "rgba(255, 48, 64, 0.3)",
              color: isTorcida ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: isTorcida ? "#000" : "#fff" }} />
          ) : (
            "Excluir"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

