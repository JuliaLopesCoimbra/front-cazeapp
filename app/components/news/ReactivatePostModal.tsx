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
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ReactivatePostModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reactivating: boolean;
}

export default function ReactivatePostModal({
  open,
  onClose,
  onConfirm,
  reactivating,
}: ReactivatePostModalProps) {
  return (
    <Dialog
      open={open}
      onClose={() => !reactivating && onClose()}
      PaperProps={{
        sx: {
          backgroundColor: "rgba(26, 26, 26, 0.95)",
          backdropFilter: "blur(20px)",
          color: "white",
          borderRadius: 3,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          minWidth: { xs: "90%", sm: "400px" },
          maxWidth: "500px",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
        Reativar Post
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{
            color: "rgba(255,255,255,0.8)",
            mb: 2,
          }}
        >
          Tem certeza que deseja reativar este post? O post voltará a ser visível no feed e poderá receber curtidas e comentários novamente.
        </DialogContentText>
        <Box
          sx={{
            display: "block",
            p: 2,
            mt: 2,
            backgroundColor: "rgba(76, 175, 80, 0.1)",
            borderRadius: 2,
            border: "1px solid rgba(76, 175, 80, 0.2)",
          }}
        >
          O post será aprovado e voltará a aparecer no feed.
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          disabled={reactivating}
          sx={{
            color: "rgba(255,255,255,0.7)",
            textTransform: "none",
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={reactivating}
          variant="contained"
          startIcon={reactivating ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <CheckCircleIcon />}
          sx={{
            backgroundColor: "#4CAF50",
            color: "white",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#45a049",
            },
          }}
        >
          {reactivating ? "Reativando..." : "Reativar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

