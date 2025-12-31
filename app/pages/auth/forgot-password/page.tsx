"use client";
import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useToast } from "@/app/context/ToastContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { showToast } = useToast();

  const startCooldown = () => {
    setCooldown(60);

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    if (cooldown > 0) return;

    if (!isValidEmail(email)) {
      setEmailError(true);
      showToast("Informe um e-mail válido.", "error");
      return;
    }

    setEmailError(false);
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });

      showToast(
        "Se o email existir, enviaremos um link para recuperação.",
        "success"
      );

      startCooldown();
    } catch {
      showToast(
        "Se o email existir, enviaremos um link para recuperação.",
        "success"
      );

      startCooldown();
    } finally {
      setLoading(false);
    }
  };

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
          Recuperar senha
        </Typography>

        <Typography variant="body2" mb={2}>
          Informe seu e-mail para receber o link de redefinição.
        </Typography>

        <TextField
          fullWidth
          label="E-mail"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(false);
          }}
          margin="normal"
          error={emailError}
          helperText={emailError ? "Digite um e-mail válido" : ""}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={loading || cooldown > 0}
        >
          {loading
            ? "Enviando..."
            : cooldown > 0
            ? `Aguarde ${cooldown}s`
            : "Enviar link"}
        </Button>
      </Box>
    </Box>
  );
}
