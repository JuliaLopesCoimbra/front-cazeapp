"use client";

import {
  Drawer,
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
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
  const bgColor = isTorcida ? "#0d2244" : "#1a1a1a";

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
    <Drawer
      anchor="bottom"
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: "20px 20px 0 0",
          bgcolor: bgColor,
          overflow: "hidden",
        },
      }}
      slotProps={{
        root: { sx: { zIndex: 1600 } },
      }}
    >
      {/* Handle */}
      <Box sx={{ pt: 1.5, pb: 0.5, display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: 40, height: 4, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 2 }} />
      </Box>

      {/* Header */}
      <Box sx={{
        px: 2.5, py: 1.5,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: "50%",
            bgcolor: "rgba(229,57,53,0.12)",
          }}>
            <DeleteOutlineIcon sx={{ fontSize: 20, color: "#e53935" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
            Excluir notícia
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{ bgcolor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14, mb: 2 }}>
          Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.
        </Typography>
        <Box sx={{
          bgcolor: "rgba(255,255,255,0.05)",
          borderRadius: 1.5,
          p: 1.5,
          borderLeft: "3px solid rgba(229,57,53,0.6)",
        }}>
          <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600, wordBreak: "break-word" }}>
            {newsTitle}
          </Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ px: 2.5, pt: 2, pb: 3.5, display: "flex", gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          fullWidth
          variant="outlined"
          sx={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.8)",
            borderRadius: 2,
            py: 1.2,
            fontWeight: 600,
            "&:hover": { borderColor: "rgba(255,255,255,0.3)", bgcolor: "rgba(255,255,255,0.04)" },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#e53935",
            color: "#fff",
            borderRadius: 2,
            py: 1.2,
            fontWeight: 700,
            "&:hover": { bgcolor: "#c62828" },
            "&:disabled": { bgcolor: "rgba(229,57,53,0.35)", color: "rgba(255,255,255,0.4)" },
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Excluir"}
        </Button>
      </Box>
    </Drawer>
  );
}
