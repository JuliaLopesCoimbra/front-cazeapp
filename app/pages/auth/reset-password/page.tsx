"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Resetnew_passwordPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const [new_password, setnew_password] = useState("");
  const [confirmnew_password, setConfirmnew_password] = useState("");
  const [shownew_password, setShownew_password] = useState(false);
  const [showConfirmnew_password, setShowConfirmnew_password] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const new_passwordsMatch =
    new_password.length > 0 &&
    confirmnew_password.length > 0 &&
    new_password === confirmnew_password;

  const handleReset = async () => {
    if (new_password.length < 6) {
      showToast("A senha deve ter no mínimo 6 caracteres.", "error");
      return;
    }

    if (new_password !== confirmnew_password) {
      showToast("As senhas não coincidem.", "error");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        new_password,
      });

      showToast("Senha redefinida com sucesso!", "success");

      setTimeout(() => {
        router.push("/pages/auth/login");
      }, 1500);
    } catch {
      showToast("Token inválido ou expirado.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <Typography>Token inválido.</Typography>;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        padding: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 400, color: "black" }}>
        <Typography variant="h5" mb={2}>
          Redefinir senha
        </Typography>

        {/* Nova senha */}
        <TextField
          fullWidth
          label="Nova senha"
          type={shownew_password ? "text" : "new_password"}
          value={new_password}
          onChange={(e) => setnew_password(e.target.value)}
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShownew_password((prev) => !prev)}
                  edge="end"
                >
                  {shownew_password ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Confirmar senha */}
        <TextField
          fullWidth
          label="Confirmar nova senha"
          type={showConfirmnew_password ? "text" : "new_password"}
          value={confirmnew_password}
          onChange={(e) => setConfirmnew_password(e.target.value)}
          margin="normal"
          error={confirmnew_password.length > 0 && !new_passwordsMatch}
          helperText={
            confirmnew_password.length > 0 && !new_passwordsMatch
              ? "As senhas não coincidem"
              : ""
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmnew_password((prev) => !prev)}
                  edge="end"
                >
                  {showConfirmnew_password ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Redefinir senha"}
        </Button>
      </Box>
    </Box>
  );
}
