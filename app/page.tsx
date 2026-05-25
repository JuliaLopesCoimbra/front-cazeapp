// /components/auth/LoginForm.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Skeleton,
} from "@mui/material";
import {
  Google,
  Facebook,
  Visibility,
  VisibilityOff,
  Email,
} from "@mui/icons-material";
import { loginUser, resendVerificationEmail } from "@/app/services/auth/authService";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  initGoogleLogin,
  initFacebookLogin,
} from "@/app/services/auth/authService";
import LoginVideoBackground from "@/app/components/auth/LoginVideoBackground";
import LoginBrandHeader from "@/app/components/auth/LoginBrandHeader";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import {
  LOGIN_PANEL_CLASS,
  loginColors,
  loginFieldSx,
  loginLabelSx,
  loginPageSx,
} from "@/app/constants/loginTheme";

interface LoginData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  const { login } = useAuth();

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  const { showToast } = useToast();
  const router = useRouter();

  // Simula o carregamento inicial da página
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 500); // 500ms de delay para mostrar o skeleton

    return () => clearTimeout(timer);
  }, []);

  // Controla animações quando a página carrega
  useEffect(() => {
    if (!isInitialLoading) {
      setShouldAnimate(true);
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoading]);

  // Efeito para o cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownSeconds]);

  const handleLogin = async () => {
    setLoading(true);
    setShowResendEmail(false);

    try {
      const loginData: LoginData = {
        email,
        password,
      };
      const response = await loginUser(loginData);

      // sucesso → reseta tentativas
      setShowForgotPassword(false);
      setShowResendEmail(false);

      showToast("Login realizado com sucesso!", "success");

      const { access_token, refresh_token } = response;

      login(access_token, refresh_token, false);

      router.push("/pages/user/home");
    } catch (err: unknown) {
      setShowForgotPassword(true);

      if (err instanceof Error) {
        // Verificar se precisa completar perfil
        if (err.message === "PROFILE_COMPLETION_REQUIRED" && (err as any).tempToken) {
          const tempToken = (err as any).tempToken;
          // Redirecionar para página de completar perfil
          router.push(`/pages/auth/complete-profile?temp_token=${tempToken}&requires_profile_completion=true`);
          return;
        }
        
        // Verificar se precisa verificar idade
        if (err.message === "AGE_VERIFICATION_REQUIRED" && (err as any).tempToken) {
          const tempToken = (err as any).tempToken;
          // Redirecionar para página de verificação de idade
          router.push(`/pages/auth/age-verification?temp_token=${tempToken}&requires_age_verification=true`);
          return;
        }

        const errorMessage = err.message.toLowerCase();
        // Verifica se o erro é de email não confirmado
        if (
          errorMessage.includes("confirme seu e-mail") ||
          errorMessage.includes("confirme seu email") ||
          errorMessage.includes("email não confirmado")
        ) {
          setShowResendEmail(true);
        }
        showToast(err.message, "error");
      } else {
        showToast("Erro ao fazer login. Tente novamente.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      showToast("Por favor, insira seu email primeiro", "error");
      return;
    }

    if (cooldownSeconds > 0) {
      return;
    }

    setResendLoading(true);
    try {
      await resendVerificationEmail(email);
      setCooldownSeconds(60); // 1 minuto de cooldown
      showToast("Email de verificação reenviado! Verifique também sua pasta de spam.", "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase();
        // Se o erro contém informações sobre cooldown, extrair os segundos
        const cooldownMatch = err.message.match(/(\d+)\s*segundos?/i);
        if (cooldownMatch) {
          const seconds = parseInt(cooldownMatch[1]);
          setCooldownSeconds(seconds);
        }
        showToast(err.message, "error");
      } else {
        showToast("Erro ao reenviar email. Tente novamente.", "error");
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && email && password && !loading) {
      handleLogin();
    }
  };

  // Skeleton component
  if (isInitialLoading) {
    return (
      <>
        <LoginVideoBackground />
        <Box sx={loginPageSx.root}>
          <Box sx={loginPageSx.stack}>
            <LoginBrandHeader />
        <Box
          className={LOGIN_PANEL_CLASS}
          sx={{
            ...loginPageSx.panel,
            textAlign: "left",
          }}
        >
          {/* Título Skeleton */}
          <Skeleton
            variant="text"
            width="40%"
            height={40}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              marginBottom: { xs: "16px", md: "20px" },
              marginX: "auto",
            }}
          />
          
          {/* Subtítulo Skeleton */}
          <Skeleton
            variant="text"
            width="80%"
            height={20}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              marginBottom: { xs: "24px", md: "28px" },
              marginX: "auto",
            }}
          />

          {/* Campo Email Skeleton */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={56}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              borderRadius: CAZE_RADIUS.sm,
              marginBottom: 2,
            }}
          />

          {/* Campo Senha Skeleton */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={56}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              borderRadius: CAZE_RADIUS.sm,
              marginBottom: { xs: 2, md: 3 },
            }}
          />

          {/* Botão Skeleton */}
          <Skeleton
            variant="rectangular"
            width="100%"
            height={48}
            sx={{
              bgcolor: "rgba(255, 204, 1, 0.2)",
              borderRadius: CAZE_RADIUS.sm,
              marginBottom: 2,
            }}
          />

          {/* Divisor Skeleton */}
          <Box sx={{ display: "flex", alignItems: "center", marginY: 2 }}>
            <Skeleton
              variant="text"
              width="30%"
              height={1}
              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={20}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                marginX: 2,
              }}
            />
            <Skeleton
              variant="text"
              width="30%"
              height={1}
              sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
            />
          </Box>

          {/* Botões Social Skeleton */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 1.5, md: 2 },
              marginBottom: 2,
            }}
          >
            <Skeleton
              variant="rectangular"
              width="50%"
              height={44}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderRadius: CAZE_RADIUS.sm,
              }}
            />
            <Skeleton
              variant="rectangular"
              width="50%"
              height={44}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderRadius: CAZE_RADIUS.sm,
              }}
            />
          </Box>

          {/* Link Cadastro Skeleton */}
          <Skeleton
            variant="text"
            width="60%"
            height={20}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              marginX: "auto",
              marginTop: { xs: "20px", md: "24px" },
            }}
          />
        </Box>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <LoginVideoBackground />
      <Box sx={loginPageSx.root}>
        <Box sx={loginPageSx.stack}>
          <LoginBrandHeader />
      <Box
        className={`${LOGIN_PANEL_CLASS}${shouldAnimate ? " slide-up-animation" : ""}`}
        sx={{
          ...loginPageSx.panel,
          textAlign: "left",
          transition: "all 0.3s ease",
        }}
      >
        <Typography
          className={shouldAnimate ? "slide-up-delay-1" : ""}
          variant="h4"
          sx={{
            fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif',
            fontWeight: 400,
            fontSize: { xs: "28px", md: "34px" },
            textAlign: "left",
            letterSpacing: "0.04em",
            marginBottom: { xs: 1, md: 1.25 },
          }}
        >
          Login
        </Typography>
        <Typography
          className={shouldAnimate ? "slide-up-delay-1" : ""}
          variant="body2"
          sx={{
            marginBottom: { xs: "24px", md: "28px" },
            textAlign: "left",
            color: loginColors.muted,
            fontSize: { xs: "13px", md: "14px" },
            fontFamily: 'var(--font-inter), Inter, sans-serif',
          }}
        >
          Bem-vindo à Casa CazéTV. Entre com suas credenciais para acessar a Copa.
        </Typography>

        {/* Formulário de login */}
        <Box className={shouldAnimate ? "slide-up-delay-2" : ""}>
          <TextField
          fullWidth
          label="Endereço de e-mail"
          variant="outlined"
          margin="normal"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          inputProps={{
            autoCapitalize: "none",
            autoCorrect: "off",
            spellCheck: false,
          }}
          InputLabelProps={{
            shrink: true,
            sx: loginLabelSx,
          }}
          sx={loginFieldSx}
        />

        <TextField
          fullWidth
          label="Senha"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          error={Boolean(password && password.length < 6)}
          helperText={
            password && password.length < 6
              ? "A senha deve ter no mínimo 6 caracteres"
              : ""
          }
          InputLabelProps={{
            shrink: true,
            sx: loginLabelSx,
          }}
          FormHelperTextProps={{
            sx: { color: loginColors.error, fontSize: 12 },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  sx={{ color: "#fff" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mt: 2, ...loginFieldSx }}
        />
        </Box>

        <Box className={shouldAnimate ? "slide-up-delay-2" : ""}>
          <Button
          fullWidth
          variant="contained"
          sx={{
            mt: { xs: 2, md: 3 },
            mb: 1,
            backgroundColor: loginColors.yellow,
            color: loginColors.black,
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            fontWeight: 700,
            borderRadius: CAZE_RADIUS.sm,
            textTransform: "none",
            fontSize: { xs: "15px", md: "16px" },
            padding: { xs: "12px", md: "14px" },
            boxShadow: "0 4px 16px rgba(255, 209, 0, 0.35)",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: loginColors.yellowHover,
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(255, 209, 0, 0.45)",
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(255, 209, 0, 0.35)",
              color: "rgba(0,0,0,0.5)",
            },
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Carregando..." : "Continuar"}
        </Button>
        </Box>

        {showResendEmail && (
          <Box
            className={shouldAnimate ? "slide-up-delay-3" : ""}
            sx={{
              mt: 2,
              p: { xs: 2, md: 2.5 },
              backgroundColor: "rgba(255, 203, 0, 0.12)",
              borderRadius: CAZE_RADIUS.md,
              border: `1px solid ${loginColors.yellow}`,
              backdropFilter: "blur(10px)",
              transition: "all 0.2s ease",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#fff",
                mb: 1.5,
                fontSize: 14,
              }}
            >
              Seu email ainda não foi confirmado. Clique no botão abaixo para reenviar o email de verificação.
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Email />}
              onClick={handleResendEmail}
              disabled={resendLoading || cooldownSeconds > 0}
              sx={{
                color: loginColors.yellow,
                borderColor: loginColors.yellow,
                backgroundColor: "transparent",
                borderRadius: CAZE_RADIUS.sm,
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "13px", md: "14px" },
                padding: { xs: "10px", md: "12px" },
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 203, 0, 0.15)",
                  borderColor: loginColors.yellow,
                  transform: "translateY(-2px)",
                },
                "&.Mui-disabled": {
                  color: "rgba(255, 203, 0, 0.5)",
                  borderColor: "rgba(255, 203, 0, 0.3)",
                },
              }}
            >
              {resendLoading
                ? "Enviando..."
                : cooldownSeconds > 0
                ? `Aguarde ${cooldownSeconds}s`
                : "Reenviar email de verificação"}
            </Button>
            {cooldownSeconds === 0 && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: 12,
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Verifique também sua pasta de spam
              </Typography>
            )}
          </Box>
        )}

        {showForgotPassword && (
          <Typography
            className={shouldAnimate ? "slide-up-delay-3" : ""}
            variant="body2"
            sx={{
              mt: 2,
              color: loginColors.yellow,
              cursor: "pointer",
              textAlign: "center",
              fontSize: { xs: "13px", md: "14px" },
              fontWeight: 500,
              transition: "all 0.2s ease",
              "&:hover": {
                color: loginColors.yellowHover,
                textDecoration: "underline",
              },
            }}
            onClick={() => router.push("/pages/auth/forgot-password")}
          >
            Esqueceu a senha?
          </Typography>
        )}
        <Typography
          className={shouldAnimate ? "slide-up-delay-3" : ""}
          sx={{
            mt: { xs: 3, md: 3.5 },
            mb: 1.5,
            textAlign: "center",
            color: "rgba(255,255,255,0.7)",
            fontSize: { xs: 12, md: 13 },
            fontWeight: 500,
            position: "relative",
            "&::before, &::after": {
              content: '""',
              position: "absolute",
              top: "50%",
              width: "30%",
              height: "1px",
              backgroundColor: "rgba(255,255,255,0.2)",
            },
            "&::before": {
              left: 0,
            },
            "&::after": {
              right: 0,
            },
          }}
        >
          ou logue com
        </Typography>
        <Box
          className={shouldAnimate ? "slide-up-delay-3" : ""}
          sx={{
            display: "flex",
            gap: { xs: 1.5, md: 2 },
            mt: 2,
          }}
        >
          <Button
            variant="outlined"
            disabled
            startIcon={<Google />}
            sx={{
              flex: 1,
              color: "#fff",
              borderColor: "rgba(255, 255, 255, 0.3)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: CAZE_RADIUS.sm,
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "13px", md: "14px" },
              padding: { xs: "10px", md: "12px" },
              transition: "all 0.2s ease",
              "& .MuiSvgIcon-root": {
                color: "#fff",
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255, 255, 255, 0.5)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Google
          </Button>

          <Button
            variant="outlined"
            disabled
            startIcon={<Facebook />}
            sx={{
              flex: 1,
              color: "#fff",
              borderColor: "rgba(255, 255, 255, 0.3)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: CAZE_RADIUS.sm,
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "13px", md: "14px" },
              padding: { xs: "10px", md: "12px" },
              transition: "all 0.2s ease",
              "& .MuiSvgIcon-root": {
                color: "#fff",
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255, 255, 255, 0.5)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Facebook
          </Button>
        </Box>

        <Typography
          className={shouldAnimate ? "slide-up-delay-3" : ""}
          variant="body2"
          sx={{
            marginTop: { xs: "20px", md: "24px" },
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: { xs: "13px", md: "14px" },
          }}
        >
          Não tem uma conta?{" "}
          <span
            style={{
              textDecoration: "none",
              color: "rgba(255,203,0,0.4)",
              fontWeight: 600,
              cursor: "default",
              pointerEvents: "none",
            }}
          >
            Cadastre-se aqui
          </span>
        </Typography>
      </Box>
        </Box>
      </Box>
    </>
  );
};

export default LoginForm;
