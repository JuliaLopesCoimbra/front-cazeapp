"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import { getEventBackgroundSxByKey } from "@/app/utils/eventBranding";
import { redeemTshirtReservation } from "@/app/services/admin/tshirtReservationAdminService";

const bg = getEventBackgroundSxByKey("n1_torcida");

export default function TshirtScanAdminPage() {
  const { isAdminMaster, isSubadmin, authReady } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  if (!authReady) return null;
  if (!isAdminMaster && !isSubadmin) {
    router.replace("/pages/user/home");
    return null;
  }

  const submit = async () => {
    const t = token.trim();
    if (!t) {
      showToast("Cole o conteúdo do QR code ou o token", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await redeemTshirtReservation(t);
      showToast(res.message, "success");
      setToken("");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ ...bg, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="sm">
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <QrCodeScannerIcon sx={{ color: "#ffcc01", fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>
            Baixa de camiseta (QR)
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}>
          Cole o texto lido do QR code do participante (ex.: N1SHIRT|...) ou apenas o token após o
          pipe. A retirada desconta 1 unidade do estoque físico e encerra a reserva.
        </Typography>
        <Paper sx={{ p: 2, bgcolor: "rgba(0,0,0,0.35)", backdropFilter: "blur(8px)" }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="QR / token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="N1SHIRT|..."
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
            }}
          />
          <Button
            variant="contained"
            fullWidth
            disabled={loading}
            onClick={submit}
            sx={{ bgcolor: "#ffcc01", color: "#111", fontWeight: 800, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#111" }} /> : "Registrar retirada"}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
