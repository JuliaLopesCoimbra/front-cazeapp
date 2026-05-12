"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Divider,
  CircularProgress,
  Typography,
} from "@mui/material";
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
  return (
    <Dialog
      open={open}
      onClose={() => !deactivating && onClose()}
      PaperProps={{
        sx: {
          backgroundColor: isTorcida ? "#d4a400" : "rgba(26, 26, 26, 0.95)",
          backdropFilter: isTorcida ? "none" : "blur(20px)",
          color: "white",
          borderRadius: 3,
          border: isTorcida ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255, 255, 255, 0.1)",
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CloseIcon sx={{ fontSize: 28, color: "#fff" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Desativar Post
          </Typography>
        </Box>
      </DialogTitle>
      <Divider sx={{ borderColor: isTorcida ? "rgba(255,255,255,0.2)" : "rgba(255, 255, 255, 0.1)", mx: 3 }} />
      <DialogContent sx={{ pt: 3 }}>
        <DialogContentText sx={{ color: "rgba(255,255,255,0.9)", fontSize: "1rem" }}>
          Tem certeza que deseja <strong style={{ color: "#fff" }}>desativar</strong> este post?
          <br />
          <br />
          <Box
            component="span"
            sx={{
              display: "block",
              p: 2,
              mt: 2,
              backgroundColor: isTorcida ? "rgba(255,255,255,0.12)" : "rgba(255, 68, 68, 0.1)",
              borderRadius: 2,
              border: isTorcida ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255, 68, 68, 0.2)",
            }}
          >
            O post será desativado e não será mais visível no feed.
          </Box>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          disabled={deactivating}
          sx={{
            color: "rgba(255,255,255,0.95)",
            textTransform: "none",
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={deactivating}
          variant="contained"
          startIcon={deactivating ? <CircularProgress size={16} sx={{ color: isTorcida ? "#000" : "#fff" }} /> : <CloseIcon />}
          sx={{
            backgroundColor: isTorcida ? "#fff" : "#ff3040",
            color: isTorcida ? "#000" : "white",
            textTransform: "none",
            "&:hover": {
              backgroundColor: isTorcida ? "rgba(255,255,255,0.85)" : "#cc0000",
            },
          }}
        >
          {deactivating ? "Desativando..." : "Desativar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

