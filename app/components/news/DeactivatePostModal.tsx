"use client";

import React from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import CloseIcon from "@mui/icons-material/Close";
import { getStoredEventBrandKey } from "@/app/utils/eventBranding";

interface DeactivatePostModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deactivating: boolean;
}

export default function DeactivatePostModal({
  open,
  onClose,
  onConfirm,
  deactivating,
}: DeactivatePostModalProps) {
  const isTorcida = getStoredEventBrandKey() === "n1_torcida";
  const bgColor = isTorcida ? "#0d2244" : "#1a1a1a";

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={deactivating ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: "20px 20px 0 0",
          bgcolor: bgColor,
          overflow: "hidden",
        },
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
            bgcolor: "rgba(255,152,0,0.12)",
          }}>
            <BlockIcon sx={{ fontSize: 20, color: "#ff9800" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
            Desativar post
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={deactivating}
          size="small"
          sx={{ bgcolor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14, mb: 2 }}>
          Tem certeza que deseja desativar este post? Ele não será mais visível no feed.
        </Typography>
        <Box sx={{
          bgcolor: "rgba(255,152,0,0.07)",
          borderRadius: 1.5,
          p: 1.5,
          borderLeft: "3px solid rgba(255,152,0,0.5)",
        }}>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            O post ficará desativado e poderá ser reativado posteriormente.
          </Typography>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ px: 2.5, pt: 2, pb: 3.5, display: "flex", gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={deactivating}
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
          onClick={onConfirm}
          disabled={deactivating}
          fullWidth
          variant="contained"
          sx={{
            bgcolor: "#ff9800",
            color: "#fff",
            borderRadius: 2,
            py: 1.2,
            fontWeight: 700,
            "&:hover": { bgcolor: "#e65100" },
            "&:disabled": { bgcolor: "rgba(255,152,0,0.35)", color: "rgba(255,255,255,0.4)" },
          }}
        >
          {deactivating ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Desativar"}
        </Button>
      </Box>
    </Drawer>
  );
}
