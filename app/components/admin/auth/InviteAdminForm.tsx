"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { inviteAdmin, resendAdminInvite } from "@/app/services/auth/authAdminService";
import { useToast } from "@/app/context/ToastContext";

interface InviteAdminFormProps {
  onSuccess?: () => void;
}

export default function InviteAdminForm({ onSuccess }: InviteAdminFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [lastInvitedEmail, setLastInvitedEmail] = useState<string | null>(null);
  const { showToast } = useToast();

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleInvite = async () => {
    if (!name.trim() || !email.trim()) {
      showToast("Preencha todos os campos", "error");
      return;
    }

    setLoading(true);

    try {
      await inviteAdmin({ name: name.trim(), email: email.trim() });
      showToast("Convite enviado com sucesso!", "success");
      setLastInvitedEmail(email.trim());
      setCooldown(60); // 1 minuto de cooldown
      setName("");
      setEmail("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Erro ao enviar convite", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!lastInvitedEmail) {
      showToast("Nenhum email foi convidado ainda", "error");
      return;
    }

    if (cooldown > 0) {
      showToast(`Aguarde ${cooldown} segundos para reenviar`, "warning");
      return;
    }

    setLoading(true);

    try {
      await resendAdminInvite({ email: lastInvitedEmail });
      showToast("Convite reenviado com sucesso!", "success");
      setCooldown(60); // 1 minuto de cooldown
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Erro ao reenviar convite", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Convidar Administrador
      </Typography>

      <TextField
        fullWidth
        label="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
        disabled={loading}
      />

      <TextField
        fullWidth
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        disabled={loading}
      />

      <Button
        fullWidth
        variant="contained"
        onClick={handleInvite}
        disabled={loading || cooldown > 0}
        sx={{ mt: 2 }}
      >
        {loading ? "Enviando..." : cooldown > 0 ? `Aguarde ${cooldown}s` : "Enviar convite"}
      </Button>

      {lastInvitedEmail && cooldown > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Convite enviado para {lastInvitedEmail}. Aguarde {cooldown} segundos para reenviar.
        </Alert>
      )}

      {lastInvitedEmail && cooldown === 0 && (
        <Button
          fullWidth
          variant="outlined"
          onClick={handleResend}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          Reenviar convite para {lastInvitedEmail}
        </Button>
      )}
    </Box>
  );
}

