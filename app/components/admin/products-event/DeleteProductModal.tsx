"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

interface DeleteProductModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
  loading: boolean;
}

export default function DeleteProductModal({
  open,
  onClose,
  onConfirm,
  productName,
  loading,
}: DeleteProductModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: "#1a1a1a",
          color: "#fff",
        },
      }}
    >
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "rgba(255,255,255,0.7)" }}>
          Tem certeza que deseja excluir o produto <strong>{productName}</strong>?
          Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} sx={{ color: "#fff" }}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color="error"
          sx={{
            backgroundColor: "#d32f2f",
            "&:hover": {
              backgroundColor: "#c62828",
            },
          }}
        >
          {loading ? <CircularProgress size={20} /> : "Excluir"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

