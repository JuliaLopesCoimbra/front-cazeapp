"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BadgeIcon from "@mui/icons-material/Badge";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import { getEventBackgroundSxByKey } from "@/app/utils/eventBranding";
import {
  lookupTshirtReservationByCpf,
  redeemTshirtReservation,
  type TshirtCpfLookupResult,
} from "@/app/services/admin/tshirtReservationAdminService";

const bg = getEventBackgroundSxByKey("n1_torcida");
const SCANNER_ID = "tshirt-scan-camera";

type ScanResult =
  | { kind: "success"; userName: string; size: string }
  | { kind: "already_picked_up" }
  | { kind: "error"; message: string }
  | null;

type CpfLookupState =
  | { kind: "found"; data: TshirtCpfLookupResult }
  | { kind: "not_found"; message: string }
  | null;

interface RecentEntry {
  name: string;
  size: string;
  ts: Date;
}

function formatCpf(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function ScanCorners() {
  const corners = [
    { top: 0, left: 0, borderRadius: "4px 0 0 0", borderTop: "3px solid #ffc91f", borderLeft: "3px solid #ffc91f" },
    { top: 0, right: 0, borderRadius: "0 4px 0 0", borderTop: "3px solid #ffc91f", borderRight: "3px solid #ffc91f" },
    { bottom: 0, left: 0, borderRadius: "0 0 0 4px", borderBottom: "3px solid #ffc91f", borderLeft: "3px solid #ffc91f" },
    { bottom: 0, right: 0, borderRadius: "0 0 4px 0", borderBottom: "3px solid #ffc91f", borderRight: "3px solid #ffc91f" },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <Box key={i} sx={{ position: "absolute", width: 28, height: 28, ...c }} />
      ))}
    </>
  );
}

export default function TshirtScanPage() {
  const { isAdminMaster, isSubadmin, isPromotor, authReady } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [cpfDrawerOpen, setCpfDrawerOpen] = useState(false);
  const [cpf, setCpf] = useState("");
  const [cpfLoading, setCpfLoading] = useState(false);
  const [cpfResult, setCpfResult] = useState<CpfLookupState>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentEntry[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  const scannerRef = useRef<{ isScanning?: boolean; stop?: () => Promise<void> } | null>(null);
  const processingRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current?.isScanning && scannerRef.current.stop) {
        await scannerRef.current.stop();
      }
    } catch {}
    scannerRef.current = null;
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  }, []);

  const handleQrScan = useCallback(async (rawText: string) => {
    setScanLoading(true);
    try {
      const result = await redeemTshirtReservation(rawText);
      setRecentScans((prev) =>
        [{ name: result.reservation.user_name_snapshot, size: result.reservation.size, ts: new Date() }, ...prev].slice(0, 10)
      );
      setScanResult({ kind: "success", userName: result.reservation.user_name_snapshot, size: result.reservation.size });
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([80, 40, 80]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao validar QR code";
      if (msg.includes("já foi retirada") || msg.includes("encerrada")) {
        setScanResult({ kind: "already_picked_up" });
      } else {
        setScanResult({ kind: "error", message: msg });
      }
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(400);
    } finally {
      setScanLoading(false);
    }
  }, []);

  const startCamera = useCallback(
    async (mode: "environment" | "user") => {
      processingRef.current = false;
      setScanResult(null);
      clearCountdown();
      await stopScanner();

      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = scanner as typeof scannerRef.current;

        await scanner.start(
          { facingMode: mode },
          { fps: 12, qrbox: { width: 220, height: 220 } },
          async (decodedText: string) => {
            if (processingRef.current) return;
            processingRef.current = true;
            await stopScanner();
            await handleQrScan(decodedText);
          },
          () => {}
        );
      } catch {
        setScanResult({ kind: "error", message: "Não foi possível acessar a câmera. Verifique as permissões." });
      }
    },
    [stopScanner, handleQrScan, clearCountdown]
  );

  const scanAgain = useCallback(async () => {
    clearCountdown();
    await startCamera(facing);
  }, [facing, startCamera, clearCountdown]);

  // Auto-resume 3s after success
  useEffect(() => {
    if (scanResult?.kind !== "success") return;
    let remaining = 3;
    setCountdown(remaining);
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        setCountdown(null);
        startCamera(facing);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [scanResult]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!authReady || (!isAdminMaster && !isSubadmin && !isPromotor)) return;
    const t = setTimeout(() => startCamera("environment"), 200);
    return () => {
      clearTimeout(t);
      stopScanner();
      clearCountdown();
    };
  }, [authReady]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!authReady) return null;
  if (!isAdminMaster && !isSubadmin && !isPromotor) {
    router.replace("/pages/user/home");
    return null;
  }

  const flipCamera = async () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    await startCamera(next);
  };

  const handleCpfSearch = async () => {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) {
      showToast("CPF inválido. Informe os 11 dígitos.", "error");
      return;
    }
    setCpfLoading(true);
    setCpfResult(null);
    try {
      const data = await lookupTshirtReservationByCpf(digits);
      setCpfResult({ kind: "found", data });
    } catch (e) {
      setCpfResult({ kind: "not_found", message: e instanceof Error ? e.message : "CPF não encontrado" });
    } finally {
      setCpfLoading(false);
    }
  };

  const handleCpfRedeem = async () => {
    if (cpfResult?.kind !== "found") return;
    setRedeemLoading(true);
    try {
      await redeemTshirtReservation(cpfResult.data.qr_token);
      setRecentScans((prev) =>
        [{ name: cpfResult.data.user_name, size: cpfResult.data.size, ts: new Date() }, ...prev].slice(0, 10)
      );
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([80, 40, 80]);
      showToast(`${cpfResult.data.user_name} · tamanho ${cpfResult.data.size} registrado!`, "success");
      setCpfResult(null);
      setCpf("");
      setCpfDrawerOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao registrar retirada", "error");
    } finally {
      setRedeemLoading(false);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <Box sx={{ ...bg, minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pt: 2.5, pb: 1.5 }}>
        <IconButton onClick={() => router.back()} sx={{ color: "rgba(255,255,255,0.6)", p: 0.5 }}>
          <ArrowBackIcon />
        </IconButton>
        <CheckroomIcon sx={{ color: "#ffc91f", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 800, color: "#fff", fontSize: 17, flex: 1 }}>
          Entrega de camisetas
        </Typography>
        {recentScans.length > 0 && (
          <Box
            sx={{
              bgcolor: "rgba(255,201,31,0.15)",
              border: "1px solid rgba(255,201,31,0.3)",
              borderRadius: "999px",
              px: 1.5, py: 0.4,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#ffc91f" }}>
              {recentScans.length} {recentScans.length === 1 ? "entrega" : "entregas"}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Camera container */}
      <Box sx={{ flex: 1, px: 2, mb: 2 }}>
        <Box
          sx={{
            position: "relative",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#000",
            minHeight: 300,
          }}
        >
          {/* html5-qrcode mounts here */}
          <Box id={SCANNER_ID} sx={{ width: "100%" }} />

          {/* Corner scan frame — visible while actively scanning */}
          {!scanResult && !scanLoading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              <Box sx={{ position: "relative", width: 220, height: 220 }}>
                <ScanCorners />
              </Box>
            </Box>
          )}

          {/* Flip camera */}
          {!scanLoading && !scanResult && (
            <IconButton
              onClick={flipCamera}
              title="Trocar câmera"
              sx={{
                position: "absolute",
                bottom: 12, right: 12,
                zIndex: 6,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(4px)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
              }}
            >
              <FlipCameraAndroidIcon />
            </IconButton>
          )}

          {/* Loading overlay */}
          {scanLoading && (
            <Box
              sx={{
                position: "absolute", inset: 0, zIndex: 10,
                bgcolor: "rgba(0,0,0,0.75)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 2,
              }}
            >
              <CircularProgress sx={{ color: "#ffc91f" }} size={52} />
              <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600 }}>
                Validando...
              </Typography>
            </Box>
          )}

          {/* Success overlay */}
          {scanResult?.kind === "success" && (
            <Box
              onClick={() => scanAgain()}
              sx={{
                position: "absolute", inset: 0, zIndex: 10,
                bgcolor: "rgba(10, 110, 50, 0.97)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 1.5, cursor: "pointer", px: 3,
                textAlign: "center",
              }}
            >
              <CheckCircleIcon sx={{ color: "#fff", fontSize: 80 }} />
              <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.2, mt: 0.5 }}>
                {scanResult.userName}
              </Typography>
              <Box
                sx={{
                  bgcolor: "rgba(255,255,255,0.18)",
                  borderRadius: "999px",
                  px: 2.5, py: 0.7, mt: 0.5,
                }}
              >
                <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>
                  Camiseta {scanResult.size}
                </Typography>
              </Box>
              <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 13, mt: 1 }}>
                {countdown !== null
                  ? `Próximo em ${countdown}s · toque para adiantar`
                  : "Toque para continuar"}
              </Typography>
            </Box>
          )}

          {/* Already picked up overlay */}
          {scanResult?.kind === "already_picked_up" && (
            <Box
              onClick={scanAgain}
              sx={{
                position: "absolute", inset: 0, zIndex: 10,
                bgcolor: "rgba(160, 70, 0, 0.97)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 1.5, cursor: "pointer", px: 3,
                textAlign: "center",
              }}
            >
              <WarningAmberIcon sx={{ color: "#fff", fontSize: 80 }} />
              <Typography sx={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
                Já retirada
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.5 }}>
                Esta camiseta já foi entregue anteriormente
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  mt: 1, color: "#fff", borderColor: "rgba(255,255,255,0.5)",
                  borderRadius: "999px", textTransform: "none", fontWeight: 700,
                  "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                }}
              >
                Escanear outro
              </Button>
            </Box>
          )}

          {/* Error overlay */}
          {scanResult?.kind === "error" && (
            <Box
              onClick={scanAgain}
              sx={{
                position: "absolute", inset: 0, zIndex: 10,
                bgcolor: "rgba(140, 15, 15, 0.97)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 1.5, cursor: "pointer", px: 3,
                textAlign: "center",
              }}
            >
              <ErrorIcon sx={{ color: "#fff", fontSize: 80 }} />
              <Typography sx={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>
                QR code inválido
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.5 }}>
                {scanResult.message}
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  mt: 1, color: "#fff", borderColor: "rgba(255,255,255,0.5)",
                  borderRadius: "999px", textTransform: "none", fontWeight: 700,
                  "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
                }}
              >
                Tentar novamente
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Bottom actions */}
      <Box sx={{ px: 2, pb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<BadgeIcon />}
          onClick={() => { setCpfResult(null); setCpf(""); setCpfDrawerOpen(true); }}
          sx={{
            color: "rgba(255,255,255,0.8)",
            borderColor: "rgba(255,255,255,0.2)",
            borderRadius: 2.5,
            py: 1.3,
            textTransform: "none",
            fontWeight: 600,
            fontSize: 14,
            "&:hover": { borderColor: "rgba(255,255,255,0.5)", bgcolor: "rgba(255,255,255,0.04)" },
          }}
        >
          Buscar por CPF
        </Button>

        {/* Recent scans */}
        {recentScans.length > 0 && (
          <Box>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 10, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.08em",
                mb: 1,
              }}
            >
              Últimas entregas desta sessão
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {recentScans.map((entry, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    bgcolor: "rgba(255,255,255,0.05)",
                    borderRadius: 2, px: 1.5, py: 1,
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 18, flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: "#fff", fontWeight: 700, fontSize: 13,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                    >
                      {entry.name}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                      Tamanho {entry.size}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 11, flexShrink: 0 }}>
                    {formatTime(entry.ts)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* CPF Drawer */}
      <Drawer
        anchor="bottom"
        open={cpfDrawerOpen}
        onClose={() => setCpfDrawerOpen(false)}
        sx={{ zIndex: 10000 }}
        PaperProps={{
          sx: {
            borderRadius: "20px 20px 0 0",
            bgcolor: "#1a1a1a",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 4 }}>
          <Box
            sx={{
              width: 40, height: 4, bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2, mx: "auto", mb: 2,
            }}
          />
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#fff", mb: 2 }}>
            Buscar por CPF
          </Typography>

          <TextField
            fullWidth
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => { setCpf(formatCpf(e.target.value)); setCpfResult(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleCpfSearch()}
            inputProps={{ inputMode: "numeric" }}
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "rgba(255,204,1,0.5)" },
                "&.Mui-focused fieldset": { borderColor: "#ffc91f" },
              },
              "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.3)" },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCpfSearch} disabled={cpfLoading} sx={{ color: "#ffc91f" }}>
                    {cpfLoading
                      ? <CircularProgress size={20} sx={{ color: "#ffc91f" }} />
                      : <SearchIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {cpfResult?.kind === "found" && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  p: 2, borderRadius: 2, mb: 2,
                  bgcolor: cpfResult.data.status === "pending_pickup"
                    ? "rgba(76,175,80,0.12)"
                    : "rgba(255,152,0,0.1)",
                  border: `1px solid ${cpfResult.data.status === "pending_pickup"
                    ? "rgba(76,175,80,0.35)"
                    : "rgba(255,152,0,0.35)"}`,
                }}
              >
                <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>
                  {cpfResult.data.user_name}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13, mt: 0.5 }}>
                  Tamanho{" "}
                  <Box component="span" sx={{ fontWeight: 700, color: "#ffc91f" }}>
                    {cpfResult.data.size}
                  </Box>
                  {" · "}
                  {cpfResult.data.status === "pending_pickup" ? "Aguardando retirada" : "Já retirada"}
                </Typography>
              </Box>

              {cpfResult.data.status === "pending_pickup" ? (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCpfRedeem}
                  disabled={redeemLoading}
                  sx={{
                    bgcolor: "#ffc91f", color: "#111", fontWeight: 800,
                    py: 1.4, borderRadius: 2, textTransform: "none", fontSize: 15,
                    "&:hover": { bgcolor: "#ffd84d" },
                    "&.Mui-disabled": { bgcolor: "rgba(255,201,31,0.3)", color: "rgba(0,0,0,0.5)" },
                  }}
                >
                  {redeemLoading
                    ? <CircularProgress size={22} sx={{ color: "#111" }} />
                    : "Confirmar entrega"}
                </Button>
              ) : (
                <Typography sx={{ color: "#ff9800", fontWeight: 700, textAlign: "center", fontSize: 14 }}>
                  Esta camiseta já foi entregue
                </Typography>
              )}
            </Box>
          )}

          {cpfResult?.kind === "not_found" && (
            <Box
              sx={{
                mt: 2, p: 2, borderRadius: 2,
                bgcolor: "rgba(244,67,54,0.08)",
                border: "1px solid rgba(244,67,54,0.25)",
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "#f44336", fontWeight: 700 }}>
                {cpfResult.message}
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
