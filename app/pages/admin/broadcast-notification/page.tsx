"use client";
import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  IconButton,
} from "@mui/material";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import { broadcastNotification } from "@/app/services/notifications/notificationService";
import { getEventBackgroundSxByKey, getStoredEventBrandKey } from "@/app/utils/eventBranding";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CampaignIcon from "@mui/icons-material/Campaign";
import SendIcon from "@mui/icons-material/Send";
import PreviewIcon from "@mui/icons-material/Preview";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: "12px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.15)", borderWidth: 1.5 },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.35)" },
    "&.Mui-focused fieldset": { borderColor: "#ffc91f", borderWidth: 2 },
  },
  "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.35)", opacity: 1 },
};

export default function BroadcastNotificationPage() {
  const { isAdminMaster, isSubadmin, authReady } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [storedBrandKey, setStoredBrandKey] = useState<"default" | "n1_torcida">(
    () => getStoredEventBrandKey() ?? "default"
  );

  useEffect(() => {
    if (!isAdminMaster && !isSubadmin) {
      router.push("/pages/user/home");
    }
  }, [isAdminMaster, isSubadmin, router]);

  useEffect(() => {
    const refreshBrand = () => setStoredBrandKey(getStoredEventBrandKey() ?? "default");
    refreshBrand();
    window.addEventListener("storage", refreshBrand);
    return () => window.removeEventListener("storage", refreshBrand);
  }, []);

  const pageBackgroundSx = getEventBackgroundSxByKey(storedBrandKey);

  if (!authReady) {
    return (
      <Box sx={{ minHeight: "100vh", ...pageBackgroundSx, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#ffcc01" }} />
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { showToast("Preencha todos os campos", "error"); return; }
    setConfirmModalOpen(true);
  };

  const handleConfirmSend = async () => {
    setLoading(true);
    try {
      const response = await broadcastNotification({ title: title.trim(), message: message.trim() });
      showToast(response.message, "success");
      setTitle("");
      setMessage("");
      setConfirmModalOpen(false);
    } catch (error: any) {
      showToast(error?.response?.data?.detail || "Erro ao enviar notificação", "error");
    } finally {
      setLoading(false);
    }
  };

  const hasContent = title.trim() || message.trim();

  return (
    <Box sx={{ minHeight: "100vh", ...pageBackgroundSx, pb: "72px" }}>
      <Container maxWidth="md" sx={{ pt: { xs: 0, sm: 2 }, pb: 4, px: { xs: 0, sm: 2 }, maxWidth: "100%" }}>
        <Paper
          sx={{
            backgroundColor: "transparent",
            backdropFilter: "none",
            boxShadow: "none",
            borderRadius: 0,
          }}
        >
          {/* Compact header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 1.25,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              gap: 1,
            }}
          >
            <IconButton onClick={() => router.back()} sx={{ color: "white" }}>
              <ArrowBackIosIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                backgroundColor: "rgba(255,201,31,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CampaignIcon sx={{ color: "#ffc91f", fontSize: 18 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }}>
                Enviar Notificação
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.72rem", lineHeight: 1.2 }}>
                Para todos os usuários ativos
              </Typography>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ px: 2, py: 2.5 }}>
            {/* Warning banner */}
            <Paper
              sx={{
                backgroundColor: "rgba(255,201,31,0.07)",
                border: "1px solid rgba(255,201,31,0.25)",
                borderRadius: "14px",
                p: 1.75,
                mb: 3,
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
              }}
            >
              <NotificationsActiveIcon sx={{ color: "#ffc91f", fontSize: 18, mt: 0.1, flexShrink: 0 }} />
              <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.82rem", lineHeight: 1.5 }}>
                Esta notificação será enviada para <strong>todos os usuários ativos</strong> do sistema.
                Certifique-se de que o conteúdo está correto antes de enviar.
              </Typography>
            </Paper>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {/* Title field */}
                <Box>
                  <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem", fontWeight: 600, mb: 0.75 }}>
                    Título da Notificação
                  </Typography>
                  <TextField
                    placeholder="Ex: Manutenção programada"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                    required
                    disabled={loading}
                    sx={textFieldSx}
                    inputProps={{ maxLength: 255 }}
                  />
                  <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", mt: 0.5, textAlign: "right" }}>
                    {title.length}/255
                  </Typography>
                </Box>

                {/* Message field */}
                <Box>
                  <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.82rem", fontWeight: 600, mb: 0.75 }}>
                    Mensagem
                  </Typography>
                  <TextField
                    placeholder="Digite a mensagem que será enviada para todos os usuários..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    fullWidth
                    required
                    multiline
                    rows={6}
                    disabled={loading}
                    sx={textFieldSx}
                  />
                  <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", mt: 0.5, textAlign: "right" }}>
                    {message.length} caracteres
                  </Typography>
                </Box>

                {/* Preview */}
                {hasContent && (
                  <Paper
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "14px",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.25, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <PreviewIcon sx={{ color: "#ffc91f", fontSize: 16 }} />
                      <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", fontWeight: 600 }}>
                        Preview
                      </Typography>
                    </Box>
                    <Box sx={{ px: 2, py: 1.75 }}>
                      {title.trim() && (
                        <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", mb: 0.75 }}>
                          {title}
                        </Typography>
                      )}
                      {message.trim() && (
                        <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                          {message}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                )}

                {/* Actions */}
                <Box sx={{ display: "flex", gap: 1.5, pt: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={loading}
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      borderColor: "rgba(255,255,255,0.2)",
                      borderRadius: "999px",
                      textTransform: "none",
                      px: 3,
                      "&:hover": { borderColor: "rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.05)" },
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !title.trim() || !message.trim()}
                    startIcon={loading ? <CircularProgress size={18} sx={{ color: "#000" }} /> : <SendIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      flex: 1,
                      backgroundColor: "#ffc91f",
                      color: "#000",
                      fontWeight: 700,
                      borderRadius: "999px",
                      textTransform: "none",
                      fontSize: "0.95rem",
                      "&:hover": { backgroundColor: "#ffd54f" },
                      "&:disabled": { backgroundColor: "rgba(255,201,31,0.3)", color: "rgba(0,0,0,0.3)" },
                    }}
                  >
                    {loading ? "Enviando..." : "Enviar Notificação"}
                  </Button>
                </Box>
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmModalOpen}
        onClose={loading ? undefined : () => setConfirmModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgba(18,18,18,0.97)",
            backdropFilter: "blur(24px)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                backgroundColor: "rgba(255,201,31,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CampaignIcon sx={{ color: "#ffc91f", fontSize: 22 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>
                Confirmar Envio
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
                Esta ação enviará a notificação para todos os usuários
              </Typography>
            </Box>
            <IconButton
              onClick={() => setConfirmModalOpen(false)}
              disabled={loading}
              sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <DialogContent sx={{ pt: 2.5 }}>
          <DialogContentText sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", mb: 2.5 }}>
            Você está prestes a enviar uma notificação para{" "}
            <strong style={{ color: "#fff" }}>todos os usuários ativos</strong> do sistema. Deseja continuar?
          </DialogContentText>

          <Paper
            sx={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                Título
              </Typography>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
                {title}
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                Mensagem
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.82rem", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {message}
              </Typography>
            </Box>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmModalOpen(false)}
            disabled={loading}
            sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none", borderRadius: "999px", px: 2, "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" } }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmSend}
            disabled={loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} sx={{ color: "#000" }} /> : <SendIcon sx={{ fontSize: 16 }} />}
            sx={{
              backgroundColor: "#ffc91f",
              color: "#000",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "999px",
              px: 3,
              "&:hover": { backgroundColor: "#ffd54f" },
              transition: "all 0.2s ease",
            }}
          >
            {loading ? "Enviando..." : "Confirmar e Enviar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
