"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Paper,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { createWorldCupGame } from "@/app/services/worldCupGames/worldCupGameService";
import { useToast } from "@/app/context/ToastContext";
import { dashboardBackgroundSx } from "@/app/utils/backgroundStyles";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#fff",
    "& input": {
      color: "#fff",
      padding: "13px 16px",
      "&::-webkit-calendar-picker-indicator": { filter: "invert(1)", cursor: "pointer" },
    },
    "& textarea": { color: "#fff", padding: "13px 16px" },
    "& fieldset": { borderColor: "rgba(255,255,255,0.12)", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#ffc91f", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.6)",
    "&.Mui-focused": { color: "#ffc91f" },
  },
  "& .MuiFormHelperText-root": { color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" },
};

export default function CreateWorldCupGamePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const eventId = Number(params.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gameDate, setGameDate] = useState("");
  const [gameTime, setGameTime] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Imagem muito grande. Máximo 5MB.", "error");
      return;
    }
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("O título é obrigatório", "error");
      return;
    }
    setLoading(true);
    try {
      await createWorldCupGame(eventId, {
        title: title.trim(),
        description: description.trim() || undefined,
        game_date: gameDate || undefined,
        game_time: gameTime || undefined,
        photo: photo || undefined,
      });
      showToast("Jogo cadastrado com sucesso!", "success");
      router.push(`/pages/admin/events/${eventId}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erro ao cadastrar jogo", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        ...dashboardBackgroundSx,
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={() => router.back()}
          size="medium"
          sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}
        >
          <ArrowBackIosIcon fontSize="small" sx={{ ml: 0.5 }} />
        </IconButton>
        <SportsSoccerIcon sx={{ color: "#ffc91f" }} />
        <Typography fontWeight={700} sx={{ color: "#fff", fontSize: { xs: "0.95rem", sm: "1.1rem" } }}>
          Novo Jogo
        </Typography>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 640,
          width: "100%",
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 2, background: "rgba(255,201,31,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <SportsSoccerIcon sx={{ color: "#ffc91f", fontSize: "1.1rem" }} />
            <Typography fontWeight={700} sx={{ color: "#fff", fontSize: "0.9rem" }}>Informações do Jogo</Typography>
          </Box>

          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Photo upload */}
            <Box>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", mb: 1 }}>
                Foto (opcional)
              </Typography>
              <label htmlFor="game-photo-input" style={{ cursor: "pointer", display: "block" }}>
                <Box
                  sx={{
                    width: "100%",
                    height: preview ? "auto" : 140,
                    borderRadius: 2,
                    border: `2px dashed ${preview ? "rgba(255,201,31,0.4)" : "rgba(255,255,255,0.18)"}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "#ffc91f" },
                  }}
                >
                  {preview ? (
                    <Box component="img" src={preview} alt="preview" sx={{ width: "100%", maxHeight: 240, objectFit: "cover" }} />
                  ) : (
                    <>
                      <CloudUploadIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 32 }} />
                      <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem" }}>
                        Clique para selecionar
                      </Typography>
                    </>
                  )}
                </Box>
                <input
                  id="game-photo-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
              </label>
              {preview && (
                <Button
                  size="small"
                  onClick={() => { setPhoto(null); setPreview(null); }}
                  sx={{ mt: 0.5, color: "rgba(255,255,255,0.5)", textTransform: "none", fontSize: "0.78rem" }}
                >
                  Remover foto
                </Button>
              )}
            </Box>

            <TextField
              fullWidth
              label="Título *"
              value={title}
              onChange={(e) => e.target.value.length <= 255 && setTitle(e.target.value)}
              disabled={loading}
              required
              inputProps={{ maxLength: 255 }}
              helperText={`${title.length}/255`}
              sx={fieldSx}
            />

            <TextField
              fullWidth
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              disabled={loading}
              sx={fieldSx}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                fullWidth
                label="Data do Jogo"
                type="date"
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Horário"
                type="time"
                value={gameTime}
                onChange={(e) => setGameTime(e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
            </Box>
          </Box>
        </Paper>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          fullWidth
          sx={{
            backgroundColor: "#ffc91f",
            color: "#000",
            fontWeight: 700,
            fontSize: "1rem",
            py: 1.5,
            borderRadius: "999px",
            textTransform: "none",
            "&:hover": { backgroundColor: "#e6b800" },
            "&:disabled": { backgroundColor: "rgba(255,201,31,0.35)", color: "rgba(0,0,0,0.4)" },
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: "#000" }} /> : "Cadastrar Jogo"}
        </Button>
      </Box>
    </Box>
  );
}
