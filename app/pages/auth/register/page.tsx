"use client";
import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { registerUser } from "@/app/services/auth/authService";
import { useToast } from "@/app/context/ToastContext";
import RegisterSuccess from "@/app/components/auth/RegisterSuccess";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

const RegisterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
const router = useRouter();

  const { showToast } = useToast();

  const passwordsMatch = password === confirmPassword;

  const handleRegister = async () => {
    if (!passwordsMatch) {
      showToast("As senhas não conferem", "error");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name, email, password });

      showToast(
        "Cadastro realizado! Verifique seu e-mail para confirmar a conta.",
        "success"
      );

      setRegistered(true); 
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Erro ao realizar cadastro", "error");
      }
    } finally {
      setLoading(false);
    }
  };

 const inputStyle = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "transparent",
    color: "#fff",
    borderRadius: "14px",

    "& fieldset": {
      borderColor: "#fff",
    },
    "&:hover fieldset": {
      borderColor: "#fff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#fff",
    },

   
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px transparent inset",
      WebkitTextFillColor: "#fff",
      transition: "background-color 9999s ease-in-out 0s",
    },

    "& input:-webkit-autofill:hover": {
      WebkitBoxShadow: "0 0 0 1000px transparent inset",
      WebkitTextFillColor: "#fff",
    },

    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: "0 0 0 1000px transparent inset",
      WebkitTextFillColor: "#fff",
    },
  },
};


  const labelStyle = {
    shrink: true,
    sx: {
      color: "#fff",
      fontSize: 13,
      transform: "translate(14px, -9px) scale(1)",
      "&.Mui-focused": { color: "#fff" },
    },
  };
if (registered) {
  return <RegisterSuccess email={email} />;
}

  return (
<Box
  sx={{
    position: "relative",
    display: "flex",
    justifyContent: "center",
    height: "100vh",
    backgroundImage: "url(/background/dashboard.png)",
    padding: "20px",
    paddingTop: "72px", // espaço para o botão
  }}
>

      <Button
  onClick={() => router.push("/pages/auth/login")}
  sx={{
    position: "absolute",
    top: 20,
    left: 20,
    minWidth: "auto",
    padding: "6px",
    color: "#fff",
    borderRadius: "50%",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
  }}
>
  <ArrowBackIcon />
</Button>

      <Box sx={{ width: "100%", maxWidth: 400, color: "#fff" }}>
        <Typography variant="h5" mb={2}>
          Criar conta
        </Typography>
        <Typography variant="body2" mb={3}>
          Preencha os dados abaixo para criar sua conta.
        </Typography>

        <TextField
          fullWidth
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          InputLabelProps={labelStyle}
          sx={inputStyle}
        />

        <TextField
          fullWidth
          label="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputLabelProps={labelStyle}
          sx={{ mt: 2, ...inputStyle }}
        />

        <TextField
          fullWidth
          label="Senha"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={Boolean(password && password.length < 6)}
          helperText={
            password && password.length < 6 ? "Mínimo de 6 caracteres" : ""
          }
          InputLabelProps={labelStyle}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  sx={{ color: "#fff" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          FormHelperTextProps={{ sx: { color: "#ff6b6b" } }}
          sx={{ mt: 2, ...inputStyle }}
        />

        <TextField
          fullWidth
          label="Confirmar senha"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={Boolean(confirmPassword && !passwordsMatch)}
          helperText={
            confirmPassword && !passwordsMatch ? "As senhas não conferem" : ""
          }
          InputLabelProps={labelStyle}
          FormHelperTextProps={{ sx: { color: "#ff6b6b" } }}
          sx={{ mt: 2, ...inputStyle }}
        />

        <Button
          fullWidth
          sx={{
            mt: 3,
            backgroundColor: "#ffcc01",
            color: "#000",
            fontWeight: 600,
            borderRadius: "14px",
            textTransform: "none",
          }}
          disabled={loading}
          onClick={handleRegister}
        >
          {loading ? "Criando conta..." : "Cadastrar"}
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterForm;
