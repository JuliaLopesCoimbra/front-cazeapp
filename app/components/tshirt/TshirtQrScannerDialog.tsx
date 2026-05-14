"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { redeemTshirtReservation } from "@/app/services/admin/tshirtReservationAdminService";

const SCANNER_ELEMENT_ID = "tshirt-qr-feed";

type ScanPhase =
  | { phase: "scanning" }
  | { phase: "loading" }
  | { phase: "success"; userName: string; size: string }
  | { phase: "already_picked_up" }
  | { phase: "invalid"; message: string };

function ResultCard({
  borderColor,
  icon,
  children,
}: {
  borderColor: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        pt: 3,
        pb: 2,
        px: 2,
        borderRadius: 2,
        border: `1px solid ${borderColor}55`,
        bgcolor: `${borderColor}12`,
      }}
    >
      {icon}
      {children}
    </Box>
  );
}

export function TshirtQrScannerDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [phase, setPhase] = useState<ScanPhase>({ phase: "scanning" });
  const scannerRef = useRef<{ isScanning?: boolean; stop?: () => Promise<void> } | null>(null);
  const processingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current?.isScanning && scannerRef.current.stop) {
        await scannerRef.current.stop();
      }
    } catch {
      // ignore cleanup errors
    }
    scannerRef.current = null;
  }, []);

  const handleScan = useCallback(
    async (rawText: string) => {
      setPhase({ phase: "loading" });
      try {
        const result = await redeemTshirtReservation(rawText);
        setPhase({
          phase: "success",
          userName: result.reservation.user_name_snapshot,
          size: result.reservation.size,
        });
        onSuccess?.();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao validar QR code";
        if (msg.includes("já foi retirada") || msg.includes("encerrada")) {
          setPhase({ phase: "already_picked_up" });
        } else {
          setPhase({ phase: "invalid", message: msg });
        }
      }
    },
    [onSuccess]
  );

  const startScanner = useCallback(async () => {
    processingRef.current = false;
    setPhase({ phase: "scanning" });
    await stopScanner();

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = html5QrCode as typeof scannerRef.current;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 12, qrbox: { width: 220, height: 220 } },
        async (decodedText: string) => {
          if (processingRef.current) return;
          processingRef.current = true;
          await stopScanner();
          await handleScan(decodedText);
        },
        () => {} // silent per-frame failures
      );
    } catch {
      setPhase({ phase: "invalid", message: "Não foi possível acessar a câmera. Verifique as permissões." });
    }
  }, [stopScanner, handleScan]);

  useEffect(() => {
    if (!open) {
      stopScanner();
      setPhase({ phase: "scanning" });
      return;
    }
    const t = setTimeout(() => startScanner(), 150);
    return () => clearTimeout(t);
  }, [open, startScanner, stopScanner]);

  const handleClose = useCallback(() => {
    stopScanner();
    onClose();
  }, [stopScanner, onClose]);

  const isResult =
    phase.phase === "success" ||
    phase.phase === "already_picked_up" ||
    phase.phase === "invalid";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { bgcolor: "#111", color: "#fff", borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <QrCodeScannerIcon sx={{ color: "#ffcc01", fontSize: 22 }} />
          <Typography fontWeight={700}>Escanear QR code</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: "rgba(255,255,255,0.55)" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, pb: 3 }}>
        {/* Camera feed — always in DOM while scanning so the element exists */}
        <Box
          id={SCANNER_ELEMENT_ID}
          sx={{
            display: phase.phase === "scanning" ? "block" : "none",
            width: "100%",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "#000",
            minHeight: 280,
            "& video": { width: "100% !important", display: "block" },
            "& canvas": { display: "none" },
          }}
        />

        {phase.phase === "scanning" && (
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.45)", textAlign: "center", display: "block", mt: 1.5 }}
          >
            Aponte a câmera para o QR code do participante
          </Typography>
        )}

        {phase.phase === "loading" && (
          <Box display="flex" flexDirection="column" alignItems="center" py={7} gap={2}>
            <CircularProgress sx={{ color: "#ffcc01" }} />
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>Validando...</Typography>
          </Box>
        )}

        {phase.phase === "success" && (
          <ResultCard borderColor="#4caf50" icon={<CheckCircleIcon sx={{ fontSize: 54, color: "#4caf50" }} />}>
            <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#fff", textAlign: "center" }}>
              {phase.userName}
            </Typography>
            <Box
              sx={{
                px: 2.5,
                py: 1,
                bgcolor: "rgba(123,237,159,0.12)",
                borderRadius: 2,
                border: "1px solid rgba(123,237,159,0.3)",
              }}
            >
              <Typography sx={{ color: "#7bed9f", fontWeight: 700, textAlign: "center", fontSize: 15 }}>
                Retire a camiseta tamanho{" "}
                <Box component="span" sx={{ fontSize: 20, fontWeight: 900 }}>
                  {phase.size}
                </Box>{" "}
                com o promotor
              </Typography>
            </Box>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              Retirada registrada com sucesso
            </Typography>
          </ResultCard>
        )}

        {phase.phase === "already_picked_up" && (
          <ResultCard borderColor="#ff9800" icon={<WarningAmberIcon sx={{ fontSize: 54, color: "#ff9800" }} />}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#fff", textAlign: "center" }}>
              Já retirado
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>
              Esta camiseta já foi retirada anteriormente.
              <br />O QR code está expirado.
            </Typography>
          </ResultCard>
        )}

        {phase.phase === "invalid" && (
          <ResultCard borderColor="#f44336" icon={<ErrorIcon sx={{ fontSize: 54, color: "#f44336" }} />}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#fff", textAlign: "center" }}>
              QR code inválido
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 12, textAlign: "center" }}>
              {phase.message}
            </Typography>
          </ResultCard>
        )}

        {isResult && (
          <Button
            fullWidth
            variant="outlined"
            onClick={startScanner}
            startIcon={<QrCodeScannerIcon />}
            sx={{
              mt: 2.5,
              borderColor: "rgba(255,204,1,0.45)",
              color: "#ffcc01",
              fontWeight: 700,
              "&:hover": { borderColor: "#ffcc01", bgcolor: "rgba(255,204,1,0.07)" },
            }}
          >
            Escanear outro
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
