"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
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

function formatCpf(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

export default function TshirtScanPage() {
  const { isAdminMaster, isSubadmin, isPromotor, authReady } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [cpf, setCpf] = useState("");
  const [cpfLoading, setCpfLoading] = useState(false);
  const [cpfResult, setCpfResult] = useState<CpfLookupState>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);

  const scannerRef = useRef<{ isScanning?: boolean; stop?: () => Promise<void> } | null>(null);
  const processingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current?.isScanning && scannerRef.current.stop) {
        await scannerRef.current.stop();
      }
    } catch {}
    scannerRef.current = null;
  }, []);

  const handleQrScan = useCallback(async (rawText: string) => {
    setScanLoading(true);
    try {
      const result = await redeemTshirtReservation(rawText);
      setScanResult({
        kind: "success",
        userName: result.reservation.user_name_snapshot,
        size: result.reservation.size,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao validar QR code";
      if (msg.includes("já foi retirada") || msg.includes("encerrada")) {
        setScanResult({ kind: "already_picked_up" });
      } else {
        setScanResult({ kind: "error", message: msg });
      }
    } finally {
      setScanLoading(false);
    }
  }, []);

  const startCamera = useCallback(
    async (mode: "environment" | "user") => {
      processingRef.current = false;
      setScanResult(null);
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
        setScanResult({
          kind: "error",
          message: "Não foi possível acessar a câmera. Verifique as permissões.",
        });
      }
    },
    [stopScanner, handleQrScan]
  );

  useEffect(() => {
    if (!authReady || (!isAdminMaster && !isSubadmin && !isPromotor)) return;
    const t = setTimeout(() => startCamera("environment"), 200);
    return () => {
      clearTimeout(t);
      stopScanner();
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

  const scanAgain = async () => {
    await startCamera(facing);
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
      setCpfResult({
        kind: "not_found",
        message: e instanceof Error ? e.message : "CPF não encontrado",
      });
    } finally {
      setCpfLoading(false);
    }
  };

  const handleCpfRedeem = async () => {
    if (cpfResult?.kind !== "found") return;
    setRedeemLoading(true);
    try {
      await redeemTshirtReservation(cpfResult.data.qr_token);
      showToast(
        `${cpfResult.data.user_name} camiseta ${cpfResult.data.size} entrega validada`,
        "success"
      );
      setCpfResult(null);
      setCpf("");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao registrar retirada", "error");
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <Box sx={{ ...bg, minHeight: "100vh", py: 3 }}>
      <Container maxWidth="sm">
        <Box display="flex" alignItems="center" gap={1} mb={2.5}>
          <IconButton onClick={() => router.back()} sx={{ color: "#ffcc01", p: 0.5 }}>
            <ArrowBackIcon />
          </IconButton>
          <QrCodeScannerIcon sx={{ color: "#ffcc01" }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff" }}>
            Scanner de Camisetas
          </Typography>
        </Box>

        {/* Camera */}
        <Paper sx={{ p: 1.5, bgcolor: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", mb: 2 }}>
          <Box position="relative">
            <Box
              id={SCANNER_ID}
              sx={{ width: "100%", borderRadius: 1.5, overflow: "hidden", minHeight: 250 }}
            />
            <IconButton
              onClick={flipCamera}
              title="Trocar câmera"
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                bgcolor: "rgba(0,0,0,0.6)",
                color: "#ffcc01",
                "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
              }}
            >
              <FlipCameraAndroidIcon />
            </IconButton>
          </Box>

          {scanLoading && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress sx={{ color: "#ffcc01" }} size={32} />
            </Box>
          )}

          {scanResult?.kind === "success" && (
            <Box
              sx={{
                mt: 1.5, p: 2, borderRadius: 2,
                bgcolor: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)",
                textAlign: "center",
              }}
            >
              <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 38 }} />
              <Typography sx={{ color: "#7bed9f", fontWeight: 700, mt: 0.5 }}>
                {scanResult.userName} camiseta {scanResult.size} entrega validada
              </Typography>
            </Box>
          )}

          {scanResult?.kind === "already_picked_up" && (
            <Box
              sx={{
                mt: 1.5, p: 2, borderRadius: 2,
                bgcolor: "rgba(255,152,0,0.1)", border: "1px solid rgba(255,152,0,0.3)",
                textAlign: "center",
              }}
            >
              <WarningAmberIcon sx={{ color: "#ff9800", fontSize: 38 }} />
              <Typography sx={{ color: "#ff9800", fontWeight: 700, mt: 0.5 }}>
                Camiseta já retirada anteriormente
              </Typography>
            </Box>
          )}

          {scanResult?.kind === "error" && (
            <Box
              sx={{
                mt: 1.5, p: 2, borderRadius: 2,
                bgcolor: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)",
                textAlign: "center",
              }}
            >
              <ErrorIcon sx={{ color: "#f44336", fontSize: 38 }} />
              <Typography sx={{ color: "#f44336", fontWeight: 700, mt: 0.5 }}>
                {scanResult.message}
              </Typography>
            </Box>
          )}

          {scanResult && (
            <Button
              fullWidth
              variant="outlined"
              onClick={scanAgain}
              sx={{ mt: 1.5, color: "#ffcc01", borderColor: "rgba(255,204,1,0.4)" }}
            >
              Escanear outro
            </Button>
          )}
        </Paper>

        {/* CPF Search */}
        <Paper sx={{ p: 2, bgcolor: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.6)", fontWeight: 700, mb: 1.5,
              fontSize: 12, textTransform: "uppercase", letterSpacing: "0.07em",
            }}
          >
            Buscar por CPF
          </Typography>

          <TextField
            fullWidth
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && handleCpfSearch()}
            inputProps={{ inputMode: "numeric" }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "rgba(255,204,1,0.5)" },
                "&.Mui-focused fieldset": { borderColor: "#ffcc01" },
              },
              "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.3)" },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleCpfSearch}
                    disabled={cpfLoading}
                    sx={{ color: "#ffcc01" }}
                  >
                    {cpfLoading ? (
                      <CircularProgress size={20} sx={{ color: "#ffcc01" }} />
                    ) : (
                      <SearchIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {cpfResult?.kind === "found" && (
            <Box
              sx={{
                mt: 2, p: 2, borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>
                {cpfResult.data.user_name}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 13, mt: 0.5 }}>
                Camiseta{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "#ffcc01" }}>
                  {cpfResult.data.size}
                </Box>{" "}
                ·{" "}
                {cpfResult.data.status === "pending_pickup"
                  ? "Aguardando retirada"
                  : "Já retirada"}
              </Typography>

              {cpfResult.data.status === "pending_pickup" ? (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleCpfRedeem}
                  disabled={redeemLoading}
                  sx={{ mt: 1.5, bgcolor: "#ffcc01", color: "#111", fontWeight: 800, py: 1.2 }}
                >
                  {redeemLoading ? (
                    <CircularProgress size={22} sx={{ color: "#111" }} />
                  ) : (
                    "Confirmar retirada"
                  )}
                </Button>
              ) : (
                <Typography
                  sx={{
                    mt: 1.5, color: "#ff9800", fontWeight: 700,
                    textAlign: "center", fontSize: 14,
                  }}
                >
                  Esta reserva já foi retirada
                </Typography>
              )}
            </Box>
          )}

          {cpfResult?.kind === "not_found" && (
            <Box
              sx={{
                mt: 2, p: 2, borderRadius: 2,
                bgcolor: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.25)",
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "#f44336", fontWeight: 700 }}>
                {cpfResult.message}
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
