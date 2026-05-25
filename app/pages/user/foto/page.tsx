"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box, Typography, CircularProgress, IconButton,
  Dialog, DialogContent, DialogActions, Button,
} from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import { COLORS, LAYOUT, SPACING } from "@/app/constants/designTokens";
import { searchFace } from "@/app/services/ai/searchFaceService";
import { getEvents } from "@/app/services/events/eventAppService";
import { useToast } from "@/app/context/ToastContext";
import api from "@/app/services/auth/axiosConfig";

// ── types ─────────────────────────────────────────────────────────────────────

type Stage = "intro" | "camera" | "results";

interface PhotoResult {
  url: string;
  similarity?: number;
  label?: string;
}

interface BorderOption {
  id: string;
  frameType: "brasil" | "ouro" | "copa" | "none";
  label: string;
}

// ── constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "selectedEventId";

const BORDER_OPTIONS: BorderOption[] = [
  { id: "brasil", frameType: "brasil", label: "Brasil"    },
  { id: "ouro",   frameType: "ouro",   label: "Ouro"      },
  { id: "copa",   frameType: "copa",   label: "Copa"      },
  { id: "none",   frameType: "none",   label: "Sem borda" },
];

// ── canvas helper ─────────────────────────────────────────────────────────────

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = src;
  });
}

async function buildBorderedBlob(imageBlob: Blob, frameType: string): Promise<Blob> {
  if (frameType === "none") return imageBlob;

  const objectUrl = URL.createObjectURL(imageBlob);
  const [img, mascot] = await Promise.all([
    loadImg(objectUrl),
    loadImg("/assets/figma/mascot-center.png"),
  ]);
  URL.revokeObjectURL(objectUrl);

  const FRAME = 22;
  const canvas = document.createElement("canvas");
  canvas.width  = img.naturalWidth  + FRAME * 2;
  canvas.height = img.naturalHeight + FRAME * 2;
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;

  if (frameType === "brasil") {
    ctx.fillStyle = "#009440"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#FFCB00"; ctx.fillRect(14, 14, W - 28, H - 28);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(18, 18, W - 36, H - 36);
  } else if (frameType === "ouro") {
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,    "#7A4F00");
    grad.addColorStop(0.3,  "#FFCB00");
    grad.addColorStop(0.55, "#FFE066");
    grad.addColorStop(0.8,  "#FFCB00");
    grad.addColorStop(1,    "#7A4F00");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(18, 18, W - 36, H - 36);
  } else if (frameType === "copa") {
    ctx.fillStyle = "#0055B8"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#FFCB00"; ctx.fillRect(14, 14, W - 28, H - 28);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(18, 18, W - 36, H - 36);
  }

  ctx.drawImage(img, FRAME, FRAME);

  // Mascot watermark — large, centered at bottom of photo
  const mascotW = Math.min(Math.round(img.naturalWidth * 0.38), 260);
  const mascotH = Math.round(mascotW * mascot.naturalHeight / mascot.naturalWidth);
  const mx = Math.round((W - mascotW) / 2);
  const my = Math.round(FRAME + img.naturalHeight - mascotH - 18);
  ctx.globalAlpha = 0.92;
  ctx.drawImage(mascot, mx, my, mascotW, mascotH);
  ctx.globalAlpha = 1;

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("canvas empty"))),
      "image/jpeg", 0.92
    )
  );
}

// ── frame preview helper ──────────────────────────────────────────────────────

interface FramePreviewProps {
  frameType: string;
  large?: boolean;
  maxWidth?: number;
  children: React.ReactNode;
}

const FRAME_SHADOWS: Record<string, { sm: string; lg: string }> = {
  brasil: {
    sm: "0 0 0 2px #fff, 0 0 0 5px #FFCB00, 0 0 0 9px #009440",
    lg: "0 0 0 3px #fff, 0 0 0 7px #FFCB00, 0 0 0 13px #009440",
  },
  ouro: {
    sm: "0 0 0 2px #fff, 0 0 0 7px #FFCB00",
    lg: "0 0 0 3px #fff, 0 0 0 11px #FFCB00",
  },
  copa: {
    sm: "0 0 0 2px #fff, 0 0 0 5px #FFCB00, 0 0 0 9px #0055B8",
    lg: "0 0 0 3px #fff, 0 0 0 7px #FFCB00, 0 0 0 13px #0055B8",
  },
};

function FramePreview({ frameType, large = false, maxWidth, children }: FramePreviewProps) {
  const shadow = FRAME_SHADOWS[frameType]?.[large ? "lg" : "sm"];
  const m = large ? "15px" : "11px";
  const wrapSx = { display: "inline-block", ...(maxWidth ? { maxWidth, width: "100%" } : {}) };

  if (!shadow) return <Box sx={wrapSx}>{children}</Box>;

  return (
    <Box sx={{ ...wrapSx, m }}>
      <Box sx={{ lineHeight: 0, boxShadow: shadow }}>{children}</Box>
    </Box>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function FotoPage() {
  const { showToast } = useToast();

  const [eventId, setEventId]           = useState<number | null>(null);
  const [stage, setStage]               = useState<Stage>("intro");
  const [countdown, setCountdown]       = useState<number | null>(null);
  const [searching, setSearching]       = useState(false);
  const [cameraError, setCameraError]   = useState<string | null>(null);
  const [results, setResults]           = useState<PhotoResult[]>([]);

  const [selected, setSelected]         = useState<PhotoResult | null>(null);
  const [activeBorder, setActiveBorder] = useState<BorderOption>(BORDER_OPTIONS[0]);
  const [downloading, setDownloading]   = useState(false);

  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setEventId(parseInt(saved, 10)); return; }
    getEvents()
      .then((evs) => {
        const ev = evs.find((e) => e.is_active) ?? evs[0];
        if (ev) { setEventId(ev.id); localStorage.setItem(STORAGE_KEY, ev.id.toString()); }
      })
      .catch(() => {});
  }, []);

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    if (stage === "camera" && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [stage]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function openCamera() {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Câmera indisponível. Acesse via HTTPS no Chrome ou Safari.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setStage("camera");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 80);
    } catch {
      setCameraError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
  }

  function captureAndSearch() {
    setCountdown(3);
    let n = 3;
    const iv = setInterval(() => {
      n -= 1;
      if (n > 0) { setCountdown(n); return; }
      clearInterval(iv);
      setCountdown(null);
      runSearch();
    }, 1000);
  }

  async function runSearch() {
    if (!videoRef.current) return;
    setSearching(true);
    const canvas = document.createElement("canvas");
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);

    const file = await new Promise<File | null>((res) =>
      canvas.toBlob(
        (b) => res(b ? new File([b], "selfie.jpg", { type: "image/jpeg" }) : null),
        "image/jpeg", 0.9
      )
    );

    stopCamera();

    if (!file) {
      setSearching(false);
      showToast("Não foi possível capturar a foto.", "error");
      return;
    }
    try {
      const resp = await searchFace(file, "caze-rostos");
      const photos: PhotoResult[] =
        resp.images?.map((u) => ({ url: u })) ??
        resp.matches
          ?.map((m) => ({ url: m.image_url ?? m.url ?? m.image ?? "", similarity: m.similarity, label: m.name ?? m.external_image_id }))
          .filter((r) => r.url) ?? [];
      setResults(photos);
      setStage("results");
      if (resp.message) showToast(resp.message, "info");
    } catch {
      showToast("Erro ao buscar fotos. Tente novamente.", "error");
      setStage("intro");
    } finally {
      setSearching(false);
    }
  }

  async function handleDownload() {
    if (!selected || !eventId) return;
    setDownloading(true);
    try {
      const res = await api.get("/photo-ai/download-image", {
        params: { url: selected.url, event_id: eventId },
        responseType: "blob",
      });
      const blob = await buildBorderedBlob(res.data as Blob, activeBorder.frameType);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `foto-copa-${Date.now()}.jpg`;
      a.click();
      showToast("Foto baixada!", "success");
      setSelected(null);
    } catch {
      showToast("Não foi possível baixar a foto.", "error");
    } finally {
      setDownloading(false);
    }
  }

  // ── layout shell ─────────────────────────────────────────────────────────────

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "100vh", bgcolor: "#0A1128" }}>
        <Sidebar />

        <Box
          component="main"
          sx={{
            position: "relative",
            zIndex: 1,
            ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
            minHeight: "100vh",
            pb: `${LAYOUT.bottomNavClearance}px`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── INTRO ── */}
          {stage === "intro" && (
            <>
              <TopBar title="Finder Photo" showBack />
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: `${LAYOUT.pagePaddingX}px`, gap: `${SPACING.section}px` }}>

                {/* Ícone */}
                <Box sx={{ width: 96, height: 96, borderRadius: "50%", bgcolor: COLORS.surface, border: `2px solid ${COLORS.green}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 20px rgba(0,148,64,0.15)` }}>
                  <CameraAltOutlinedIcon sx={{ fontSize: 44, color: COLORS.green }} />
                </Box>

                {/* Texto */}
                <Box sx={{ textAlign: "center", maxWidth: 320 }}>
                  <Typography sx={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 900, fontSize: "1.5rem", color: COLORS.text, lineHeight: 1.2, mb: `${SPACING.sm}px` }}>
                    Procure suas fotos aqui
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: "0.875rem", color: COLORS.muted, lineHeight: 1.6 }}>
                    Tire uma selfie e encontramos todas as suas fotos tiradas no evento usando reconhecimento facial.
                  </Typography>
                </Box>

                {cameraError && (
                  <Box sx={{ bgcolor: "rgba(229,37,84,0.08)", border: "1px solid rgba(229,37,84,0.25)", borderRadius: 2, px: 2, py: 1.5, maxWidth: 320, width: "100%" }}>
                    <Typography sx={{ color: COLORS.red, fontSize: "0.8rem", textAlign: "center", lineHeight: 1.5 }}>
                      {cameraError}
                    </Typography>
                  </Box>
                )}

                {/* Botão */}
                <Box
                  component="button"
                  onClick={openCamera}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1, px: 5, py: 1.5,
                    borderRadius: "100px", border: "none", cursor: "pointer",
                    bgcolor: COLORS.green, color: "#fff",
                    fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 800, fontSize: "0.95rem",
                    boxShadow: "0 4px 16px rgba(0,148,64,0.3)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    "&:active": { transform: "scale(0.97)" },
                  }}
                >
                  <CameraAltOutlinedIcon sx={{ fontSize: 18 }} />
                  Abrir câmera
                </Box>
              </Box>
            </>
          )}

          {/* ── CAMERA ── */}
          {stage === "camera" && (
            <>
              <TopBar title="Finder Photo" light showBack onBack={() => { stopCamera(); setStage("intro"); }} />
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", pt: `${SPACING.xxl}px`, px: `${LAYOUT.pagePaddingX}px`, gap: `${SPACING.xxl}px` }}>

                <Box sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 800, fontSize: "1rem", color: COLORS.text }}>
                    Posicione seu rosto
                  </Typography>
                  <Typography sx={{ fontSize: "0.8rem", color: COLORS.muted, mt: 0.5 }}>
                    Sozinho, bem iluminado e de frente para a câmera
                  </Typography>
                </Box>

                {/* Oval */}
                <Box sx={{ position: "relative", width: 260, height: 340, borderRadius: "50%", overflow: "hidden", border: `3px solid ${COLORS.green}`, bgcolor: "#1a1a1a", flexShrink: 0, boxShadow: `0 0 28px rgba(0,148,64,0.2)` }}>
                  <video
                    ref={videoRef}
                    playsInline autoPlay muted
                    onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {countdown !== null && (
                    <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography sx={{ color: "#FFCB00", fontSize: 96, fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 900, lineHeight: 1 }}>
                        {countdown}
                      </Typography>
                    </Box>
                  )}
                  {searching && (
                    <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
                      <CircularProgress sx={{ color: "#FFCB00" }} size={44} />
                      <Typography sx={{ color: "#fff", fontSize: "0.85rem", fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 700 }}>
                        Buscando...
                      </Typography>
                    </Box>
                  )}
                </Box>

                {!searching && countdown === null && (
                  <Box
                    component="button"
                    onClick={captureAndSearch}
                    sx={{
                      px: 6, py: 1.5, borderRadius: "100px", border: "none", cursor: "pointer",
                      bgcolor: COLORS.green, color: "#fff",
                      fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 800, fontSize: "0.95rem",
                      boxShadow: "0 4px 16px rgba(0,148,64,0.3)",
                      "&:active": { transform: "scale(0.97)" },
                    }}
                  >
                    Pronto
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* ── RESULTS ── */}
          {stage === "results" && (
            <>
              <TopBar title="Finder Photo" light showBack onBack={() => { setResults([]); setStage("intro"); }} />
              <Box sx={{ flex: 1, px: `${LAYOUT.pagePaddingX}px`, pt: `${SPACING.lg}px` }}>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: `${SPACING.lg}px` }}>
                  <Typography sx={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 800, fontSize: "0.95rem", color: COLORS.text }}>
                    {results.length > 0
                      ? `${results.length} foto${results.length > 1 ? "s" : ""} encontrada${results.length > 1 ? "s" : ""}`
                      : "Nenhuma foto encontrada"}
                  </Typography>
                  <Box
                    component="button"
                    onClick={() => { setResults([]); setStage("intro"); }}
                    sx={{ bgcolor: "transparent", border: `1px solid ${COLORS.green}`, borderRadius: "100px", px: 2, py: 0.6, cursor: "pointer", color: COLORS.green, fontSize: "0.75rem", fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 700 }}
                  >
                    Buscar novamente
                  </Box>
                </Box>

                {results.length === 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 8, gap: 2 }}>
                    <CameraAltOutlinedIcon sx={{ fontSize: 52, color: "rgba(255,255,255,0.18)" }} />
                    <Typography sx={{ color: COLORS.muted, fontSize: "0.875rem", textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>
                      Nenhuma foto encontrada. Tente novamente com melhor iluminação ou ângulo diferente.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
                    {results.map((photo, i) => (
                      <Box
                        key={i}
                        onClick={() => { setSelected(photo); setActiveBorder(BORDER_OPTIONS[0]); }}
                        sx={{ borderRadius: 2, overflow: "hidden", cursor: "pointer", bgcolor: COLORS.surface, border: "2px solid transparent", background: "linear-gradient(#151c2e, #151c2e) padding-box, linear-gradient(135deg, #009440, #FFCB00) border-box", boxShadow: "0 1px 6px rgba(0,0,0,0.35)", "&:active": { opacity: 0.85 }, transition: "opacity 0.15s" }}
                      >
                        <img
                          src={photo.url}
                          alt={`Foto ${i + 1}`}
                          style={{ width: "100%", display: "block", aspectRatio: "3/4", objectFit: "cover" }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>

      <BottomNav />

      {/* ── BORDER SELECTION MODAL ── */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: COLORS.surface, borderRadius: 3, m: 1.5, overflow: "hidden" } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, pt: 2, pb: 1 }}>
          <Typography sx={{ color: COLORS.text, fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 800, fontSize: "0.95rem" }}>
            Escolha a borda
          </Typography>
          <IconButton onClick={() => setSelected(null)} sx={{ color: COLORS.muted, p: 0.5 }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 2.5, pb: 2, pt: 0 }}>
          {/* Preview com borda CSS */}
          {selected && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2.5 }}>
              <FramePreview frameType={activeBorder.frameType} large maxWidth={200}>
                <img
                  src={selected.url}
                  alt="Preview"
                  style={{ width: "100%", display: "block", aspectRatio: "3/4", objectFit: "cover" }}
                />
              </FramePreview>
            </Box>
          )}

          {/* Opções de borda */}
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
            {BORDER_OPTIONS.map((opt) => {
              const isActive = activeBorder.id === opt.id;
              return (
                <Box
                  key={opt.id}
                  onClick={() => setActiveBorder(opt)}
                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, cursor: "pointer" }}
                >
                  <Box
                    sx={{
                      outline: isActive ? `2px solid ${COLORS.green}` : "2px solid transparent",
                      outlineOffset: "2px",
                      borderRadius: 1.5,
                      transition: "outline-color 0.15s",
                      display: "inline-block",
                    }}
                  >
                    <FramePreview frameType={opt.frameType}>
                      {selected && (
                        <img
                          src={selected.url}
                          alt={opt.label}
                          style={{ width: 52, height: 52, objectFit: "cover", display: "block" }}
                        />
                      )}
                    </FramePreview>
                  </Box>
                  <Typography sx={{ fontSize: "0.65rem", color: isActive ? COLORS.green : COLORS.muted, fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 700 }}>
                    {opt.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={downloading ? undefined : <DownloadIcon />}
            onClick={handleDownload}
            disabled={downloading}
            sx={{ bgcolor: COLORS.green, color: "#fff", fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 800, borderRadius: "100px", py: 1.3, fontSize: "0.9rem", "&:hover": { bgcolor: "#007a33" }, boxShadow: "0 4px 16px rgba(0,148,64,0.3)", "&.Mui-disabled": { bgcolor: "rgba(0,148,64,0.25)", color: "rgba(0,0,0,0.3)" } }}
          >
            {downloading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Baixar foto"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
