"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useToast } from "@/app/context/ToastContext";
import { formatCPF, validateEmailTLD } from "@/app/utils/registerValidators";
import { getEventBackgroundSxByKey } from "@/app/utils/eventBranding";
import {
  checkDataRemovalIdentity,
  requestDataRemoval,
} from "@/app/services/privacy/privacyService";

const torcidaBackgroundSx = getEventBackgroundSxByKey("n1_torcida");

const whiteFieldSx = {
  mb: 2,
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.06)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.45)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.75)" },
    "&.Mui-focused fieldset": { borderColor: "#ffcc01", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.9)",
    "&.Mui-focused": { color: "#ffcc01" },
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "rgba(255,255,255,0.45)",
    opacity: 1,
  },
};

const alertSx = {
  mb: 2,
  bgcolor: "rgba(0,0,0,0.35)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
  "& .MuiAlert-icon": { color: "#ffcc01" },
};

export default function DataRemovalRequestPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [exists, setExists] = useState<boolean | null>(null);
  const [checkMessage, setCheckMessage] = useState<string>("");
  const [checkedIdentity, setCheckedIdentity] = useState(false);
  const [confirmRemoval, setConfirmRemoval] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateFields = () => {
    if (!email || !validateEmailTLD(email)) {
      showToast("Informe um e-mail válido", "error");
      return false;
    }

    if (cpf.replace(/\D/g, "").length !== 11) {
      showToast("Informe um CPF válido com 11 dígitos", "error");
      return false;
    }

    return true;
  };

  const handleCheckIdentity = async () => {
    if (!validateFields()) return;

    setIsChecking(true);
    setCheckedIdentity(false);
    setExists(null);
    setCheckMessage("");
    setSuccessMessage("");

    try {
      const response = await checkDataRemovalIdentity({
        email: email.trim().toLowerCase(),
        cpf: cpf.replace(/\D/g, ""),
      });

      setCheckedIdentity(true);
      setExists(response.exists);
      setCheckMessage(response.message?.trim() || "");

      if (response.exists) {
        showToast("Cadastro encontrado. Você já pode confirmar a solicitação.", "success");
      } else {
        const msg =
          response.message?.trim() ||
          "Não foi possível localizar o cadastro com os dados informados.";
        showToast(msg, "warning");
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Falha ao validar os dados", "error");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmitRemoval = async () => {
    if (!validateFields()) return;

    if (!checkedIdentity || !exists) {
      showToast("Valide os dados antes de solicitar a remoção", "error");
      return;
    }

    if (!confirmRemoval) {
      showToast("Confirme a solicitação para continuar", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestDataRemoval({
        email: email.trim().toLowerCase(),
        cpf: cpf.replace(/\D/g, ""),
        confirmed: true,
      });

      setSuccessMessage(
        response.message ||
          "Solicitação registrada com sucesso. Nossa equipe irá analisar e concluir a remoção conforme a LGPD."
      );
      showToast("Solicitação de remoção enviada", "success");
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "Não foi possível enviar a solicitação", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        ...torcidaBackgroundSx,
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            p: { xs: 3, md: 4 },
            color: "#fff",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#fff" }}>
            Solicitação de remoção de dados
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.88)", mb: 3 }}>
            Informe e-mail e CPF para verificar seu cadastro e solicitar a exclusão dos dados.
          </Typography>

          <TextField
            fullWidth
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={whiteFieldSx}
          />

          <TextField
            fullWidth
            label="CPF"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => {
              const formatted = formatCPF(e.target.value);
              if (formatted.replace(/\D/g, "").length <= 11) {
                setCpf(formatted);
              }
            }}
            InputLabelProps={{ shrink: true }}
            sx={whiteFieldSx}
          />

          <Button
            fullWidth
            variant="outlined"
            onClick={handleCheckIdentity}
            disabled={isChecking || isSubmitting}
            sx={{
              mb: 2,
              textTransform: "none",
              borderRadius: "12px",
              color: "#fff",
              borderColor: "rgba(255,255,255,0.55)",
              "&:hover": { borderColor: "#ffcc01", color: "#ffcc01", bgcolor: "rgba(255,204,1,0.08)" },
            }}
          >
            {isChecking ? <CircularProgress size={20} sx={{ color: "#ffcc01" }} /> : "Verificar cadastro"}
          </Button>

          {checkedIdentity && exists === false && checkMessage && (
            <Alert severity="warning" sx={alertSx}>
              {checkMessage}
            </Alert>
          )}

          {checkedIdentity && exists === true && (
            <Alert severity="success" sx={{ ...alertSx, "& .MuiAlert-icon": { color: "#81c784" } }}>
              Cadastro localizado. Confirme abaixo para registrar a solicitação.
            </Alert>
          )}

          <FormControlLabel
            sx={{
              mb: 2,
              alignItems: "flex-start",
              color: "#fff",
              "& .MuiFormControlLabel-label": { color: "#fff", fontSize: "0.9rem", lineHeight: 1.4 },
            }}
            control={
              <Checkbox
                checked={confirmRemoval}
                onChange={(e) => setConfirmRemoval(e.target.checked)}
                disabled={!exists || !checkedIdentity}
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  "&.Mui-checked": { color: "#ffcc01" },
                }}
              />
            }
            label="Confirmo que desejo solicitar a remoção dos meus dados pessoais"
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmitRemoval}
            disabled={!exists || !checkedIdentity || isSubmitting}
            sx={{
              textTransform: "none",
              borderRadius: "12px",
              backgroundColor: "#ffcc01",
              color: "#000",
              fontWeight: 700,
              "&:hover": {
                backgroundColor: "#e6b800",
              },
            }}
          >
            {isSubmitting ? <CircularProgress size={20} sx={{ color: "#000" }} /> : "Solicitar remoção de dados"}
          </Button>

          {successMessage && (
            <Alert
              severity="success"
              sx={{ ...alertSx, mt: 2, "& .MuiAlert-icon": { color: "#81c784" } }}
            >
              {successMessage}
            </Alert>
          )}
        </Box>
      </Container>
    </Box>
  );
}
