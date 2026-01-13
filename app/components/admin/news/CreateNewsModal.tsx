"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createNews } from "@/app/services/news/newsService";
import { useToast } from "@/app/context/ToastContext";

interface Props {
  open: boolean;
  eventId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateNewsModal({
  open,
  eventId,
  onClose,
  onSuccess,
}: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("O título é obrigatório", "error");
      return;
    }

    if (!content.trim()) {
      showToast("O conteúdo é obrigatório", "error");
      return;
    }

    if (!image) {
      showToast("A imagem é obrigatória", "error");
      return;
    }

    setLoading(true);

    try {
      await createNews(eventId, {
        title: title.trim(),
        content: content.trim(),
        images: [image],
        event_id: eventId,
      });

      showToast("Notícia criada com sucesso!", "success");
      
      // Limpa o formulário
      setTitle("");
      setContent("");
      setImage(null);
      setImagePreview(null);

      onSuccess();
      onClose();
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Erro ao criar notícia";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setContent("");
      setImage(null);
      setImagePreview(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          pb: 2,
          fontWeight: 600,
        }}
      >
        Criar Nova Notícia
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ minWidth: "auto", p: 0.5, color: "#fff" }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Título */}
            <TextField
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#ffc91f",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                  "&.Mui-focused": {
                    color: "#ffc91f",
                  },
                },
              }}
            />

            {/* Conteúdo */}
            <TextField
              label="Conteúdo"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              fullWidth
              multiline
              rows={6}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#ffc91f",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                  "&.Mui-focused": {
                    color: "#ffc91f",
                  },
                },
              }}
            />

            {/* Upload de imagem */}
            <Box>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
                disabled={loading}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={loading}
                  fullWidth
                  sx={{
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    py: 1.5,
                    "&:hover": {
                      borderColor: "#ffc91f",
                      backgroundColor: "rgba(255,201,31,0.1)",
                    },
                  }}
                >
                  {image ? "Alterar Imagem" : "Selecionar Imagem"}
                </Button>
              </label>

              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: 1,
                    mt: 2,
                  }}
                />
              )}
            </Box>
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
            onClick={handleClose}
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
            type="submit"
            variant="contained"
            disabled={loading || !title.trim() || !content.trim() || !image}
            sx={{
              backgroundColor: "#ffc91f",
              color: "#000",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#e6b800",
              },
              "&:disabled": {
                backgroundColor: "rgba(255,201,31,0.3)",
                color: "rgba(0,0,0,0.3)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: "#000" }} />
            ) : (
              "Criar"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

