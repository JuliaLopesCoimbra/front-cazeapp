"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Box, Typography, LinearProgress, IconButton } from "@mui/material";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CasinoIcon from "@mui/icons-material/Casino";
import ReplayIcon from "@mui/icons-material/Replay";

// ── types ──────────────────────────────────────────────────────────────────────

type Stage = "list" | "video" | "wheel" | "result";

interface Prize {
  id: string;
  label: string;
  color: string;
  segBg: string;
  textColor: string;
  description: string;
  emoji: string;
  logo: string;
}

// ── data ───────────────────────────────────────────────────────────────────────

const PRIZES: Prize[] = [
  { id: "coca",  label: "Coca-Cola",     color: "#B71C1C", segBg: "#B71C1C", textColor: "#fff",                    description: "Cupom de desconto Coca-Cola 20% OFF",  emoji: "🥤", logo: "/brands/coca-cola.png"       },
  { id: "ml",    label: "Mercado Livre", color: "#F9A825", segBg: "#FFE600", textColor: "#1A1A1A",                 description: "Cupom de desconto Mercado Livre R$30",  emoji: "🛍️", logo: "/brands/mercado-livre.png"   },
  { id: "visa",  label: "VISA",          color: "#1565C0", segBg: "#1A1F71", textColor: "#fff",                    description: "Cupom de benefício VISA exclusivo",     emoji: "💳", logo: "/brands/visa.png"            },
  { id: "retry", label: "Tente de novo", color: "#1A2540", segBg: "#ffffff", textColor: "rgba(255,255,255,0.75)", description: "Sorte da próxima vez!",                 emoji: "😅", logo: "/brands/logo-apple.png" },
];

// 8 segments: 2 of each prize, interleaved
const SEGMENTS: Prize[] = [
  PRIZES[0], PRIZES[1], PRIZES[2], PRIZES[3],
  PRIZES[0], PRIZES[1], PRIZES[2], PRIZES[3],
];

const SEG_COUNT = SEGMENTS.length;
const SEG_ANGLE = (Math.PI * 2) / SEG_COUNT;

const AD_VIDEO_URL = "/video/coca.mp4";

// ── canvas helpers ─────────────────────────────────────────────────────────────

function drawWheel(
  ctx: CanvasRenderingContext2D,
  size: number,
  rotation: number,
  images: Record<string, HTMLImageElement>
) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 18;
  const innerR = outerR * 0.20;
  const logoR  = outerR * 0.64;
  const logoMax = outerR * 0.30;

  ctx.clearRect(0, 0, size, size);

  // ── outer ring ──
  ctx.beginPath();
  ctx.arc(cx, cy, outerR + 6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fill();

  // ── segments with logo ──
  for (let i = 0; i < SEG_COUNT; i++) {
    const startAngle = rotation + i * SEG_ANGLE;
    const endAngle   = startAngle + SEG_ANGLE;
    const midAngle   = startAngle + SEG_ANGLE / 2;
    const prize = SEGMENTS[i];

    // segment fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = prize.segBg;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // logo or fallback text
    const img = images[prize.id];
    const lx = cx + Math.cos(midAngle) * logoR;
    const ly = cy + Math.sin(midAngle) * logoR;

    if (img?.complete && img.naturalWidth > 0) {
      ctx.save();
      // clip to segment so logo doesn't overflow
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outerR - 1, startAngle, endAngle);
      ctx.closePath();
      ctx.clip();

      const aspect = img.naturalWidth / img.naturalHeight;
      let lw = logoMax, lh = logoMax / aspect;
      if (lh > logoMax) { lh = logoMax; lw = logoMax * aspect; }

      ctx.drawImage(img, lx - lw / 2, ly - lh / 2, lw, lh);
      ctx.restore();
    } else {
      // fallback text
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const fs = Math.max(8, Math.round(size * 0.032));
      ctx.font = `700 ${fs}px Arial, sans-serif`;
      ctx.fillStyle = prize.textColor;
      ctx.fillText(prize.label, 0, 0);
      ctx.restore();
    }
  }

  // ── outer stroke ──
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── center disc ──
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = "#060d1a";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,209,0,0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, innerR * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD100";
  ctx.fill();

  // ── pointer pin ──
  const pinY = cy - outerR - 5;
  const pinW = 8;
  const pinH = 15;

  ctx.beginPath();
  ctx.moveTo(cx, pinY + pinH);
  ctx.lineTo(cx - pinW, pinY);
  ctx.lineTo(cx + pinW, pinY);
  ctx.closePath();
  ctx.fillStyle = "#FFD100";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, pinY - 1, pinW * 0.9, 0, Math.PI * 2);
  ctx.fillStyle = "#FFD100";
  ctx.fill();
  ctx.strokeStyle = "#060d1a";
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ── PrizeListCard ──────────────────────────────────────────────────────────────

function PrizeListCard({ prize }: { prize: Prize }) {
  return (
    <Box sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      px: 2,
      py: 1.5,
      bgcolor: "rgba(255,255,255,0.05)",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <Box sx={{
        width: 52,
        height: 44,
        borderRadius: "10px",
        bgcolor: prize.segBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        p: 0.75,
      }}>
        <Box
          component="img"
          src={prize.logo}
          alt={prize.label}
          sx={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </Box>
      <Box>
        <Typography sx={{ fontFamily: '"Montserrat",sans-serif', fontWeight: 700, fontSize: "0.85rem", color: "#fff" }}>
          {prize.label}
        </Typography>
        <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", mt: 0.2 }}>
          {prize.description}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Stage: list ────────────────────────────────────────────────────────────────

const MAX_SPINS = 3;

function ListStage({ onStart, spinsUsed }: { onStart: () => void; spinsUsed: number }) {
  const uniquePrizes = PRIZES.filter((p) => p.id !== "retry");
  const exhausted = spinsUsed >= MAX_SPINS;

  return (
    <Box sx={{ px: 2, pt: 2, pb: 4 }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography sx={{
          fontFamily: '"Montserrat",sans-serif',
          fontWeight: 900,
          fontSize: "1.3rem",
          color: "#FFD100",
          lineHeight: 1.2,
        }}>
          Gire e Ganhe!
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", mt: 0.5 }}>
          Assista ao anúncio e concorra a prêmios exclusivos
        </Typography>

        {/* Spin counter */}
        <Typography sx={{
          fontFamily: '"Montserrat",sans-serif',
          fontWeight: 700,
          fontSize: "0.78rem",
          color: exhausted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.55)",
          mt: 1,
        }}>
          {exhausted ? "Você esgotou suas chances de hoje" : `Você tem ${spinsUsed}/${MAX_SPINS} chances de ganhar hoje`}
        </Typography>
      </Box>

      {/* Prize list */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 3 }}>
        {uniquePrizes.map((p) => (
          <PrizeListCard key={p.id} prize={p} />
        ))}
      </Box>

      <Box
        component="button"
        onClick={exhausted ? undefined : onStart}
        disabled={exhausted}
        sx={{
          width: "100%",
          py: 1.4,
          bgcolor: exhausted ? "rgba(255,209,0,0.25)" : "#FFD100",
          border: 0,
          borderRadius: "12px",
          fontFamily: '"Montserrat",sans-serif',
          fontWeight: 900,
          fontSize: "1rem",
          color: exhausted ? "rgba(0,0,0,0.4)" : "#000",
          cursor: exhausted ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          transition: "opacity 0.15s, transform 0.1s",
          "&:hover": !exhausted ? { opacity: 0.88, transform: "translateY(-1px)" } : {},
          "&:active": !exhausted ? { transform: "translateY(0)" } : {},
        }}
      >
        {exhausted ? "Sem chances restantes" : "Gire"}
      </Box>
    </Box>
  );
}

// ── Stage: video ───────────────────────────────────────────────────────────────

function VideoStage({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTimeRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  // Prevent seeking forward
  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    if (v.currentTime > lastTimeRef.current + 0.5) {
      v.currentTime = lastTimeRef.current;
    } else {
      lastTimeRef.current = v.currentTime;
    }
    if (v.duration > 0) {
      setProgress((v.currentTime / v.duration) * 100);
    }
  }

  function handleEnded() {
    setProgress(100);
    setTimeout(onDone, 400);
  }

  const content = (
    <Box sx={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      bgcolor: "#000",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Progress bar pinned to top */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 3,
            borderRadius: 0,
            bgcolor: "rgba(255,255,255,0.15)",
            "& .MuiLinearProgress-bar": { bgcolor: "#00C853", borderRadius: 0 },
          }}
        />
      </Box>

      {/* Video fills all available space */}
      <Box sx={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <video
          ref={videoRef}
          src={AD_VIDEO_URL}
          autoPlay
          playsInline
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onCanPlay={() => setReady(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Top label */}
        <Box sx={{
          position: "absolute",
          top: 20,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}>
          <Box sx={{ bgcolor: "rgba(0,0,0,0.55)", borderRadius: "100px", px: 2, py: 0.5 }}>
            <Typography sx={{
              fontFamily: '"Montserrat",sans-serif',
              fontWeight: 700,
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              Assista ao anúncio para continuar
            </Typography>
          </Box>
        </Box>

        {!ready && (
          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
              Carregando...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

// ── Stage: wheel ───────────────────────────────────────────────────────────────

function WheelStage({ onResult }: { onResult: (prize: Prize) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const rotationRef = useRef(0);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const [spinning, setSpinning] = useState(false);
  const [canvasSize, setCanvasSize] = useState(300);
  const [imagesReady, setImagesReady] = useState(false);

  // Pre-load all logos
  useEffect(() => {
    let loaded = 0;
    const total = PRIZES.length;
    PRIZES.forEach((prize) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imagesRef.current[prize.id] = img;
        loaded++;
        if (loaded === total) setImagesReady(true);
      };
      img.onerror = () => {
        loaded++;
        if (loaded === total) setImagesReady(true);
      };
      img.src = prize.logo;
    });
  }, []);

  useEffect(() => {
    const s = Math.min(window.innerWidth - 48, 340);
    setCanvasSize(s);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawWheel(ctx, canvasSize, rotationRef.current, imagesRef.current);
  }, [canvasSize, imagesReady]);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    // Pick winner deterministically before animation
    const winnerIndex = Math.floor(Math.random() * SEG_COUNT);
    const winnerAngle = winnerIndex * SEG_ANGLE;

    // Target rotation: many full spins + land so pointer (top = -π/2) aligns with winner
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * Math.PI * 2;
    // Pointer is at top (-π/2). Segment i starts at rotation + i*SEG_ANGLE.
    // We want rotation + winnerAngle + SEG_ANGLE/2 = -π/2 + 2πk => rotation = -π/2 - SEG_ANGLE/2 - winnerAngle
    const targetRot = rotationRef.current + fullSpins + ((-Math.PI / 2 - SEG_ANGLE / 2 - winnerAngle - rotationRef.current) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

    const startRot = rotationRef.current;
    const delta = targetRot - startRot;
    const duration = 4000;
    let start: number | null = null;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function frame(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      rotationRef.current = startRot + delta * easeOut(t);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) drawWheel(ctx, canvasSize, rotationRef.current, imagesRef.current);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rotationRef.current = startRot + delta;
        setSpinning(false);
        onResult(SEGMENTS[winnerIndex]);
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }, [spinning, canvasSize, onResult]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const content = (
    <Box sx={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: `
        radial-gradient(ellipse 70% 55% at 50% 42%, rgba(255,209,0,0.13) 0%, transparent 70%),
        radial-gradient(ellipse 90% 60% at 80% 10%, rgba(21,101,192,0.18) 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 10% 90%, rgba(183,28,28,0.14) 0%, transparent 60%),
        linear-gradient(160deg, #0d1526 0%, #060d1a 100%)
      `,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      px: 2,
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
        pointerEvents: "none",
      },
    }}>
      <Typography sx={{
        fontFamily: '"Montserrat",sans-serif',
        fontWeight: 900,
        fontSize: "1.2rem",
        color: "#FFD100",
        textAlign: "center",
      }}>
        Gire e veja o que você vai ganhar!
      </Typography>

      <Box sx={{ position: "relative", width: canvasSize, height: canvasSize }}>
        <canvas ref={canvasRef} width={canvasSize} height={canvasSize} style={{ display: "block" }} />
      </Box>

      <Box
        component="button"
        onClick={spin}
        disabled={spinning}
        sx={{
          width: "100%",
          maxWidth: 280,
          py: 1.4,
          bgcolor: spinning ? "rgba(255,209,0,0.35)" : "#FFD100",
          border: 0,
          borderRadius: "12px",
          fontFamily: '"Montserrat",sans-serif',
          fontWeight: 900,
          fontSize: "1rem",
          color: "#000",
          cursor: spinning ? "default" : "pointer",
          transition: "opacity 0.15s, background-color 0.25s",
        }}
      >
        {spinning ? "Girando..." : "Girar!"}
      </Box>
    </Box>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

// ── Stage: result ──────────────────────────────────────────────────────────────

function ResultStage({ prize, onReset }: { prize: Prize; onReset: () => void }) {
  const isRetry = prize.id === "retry";

  const content = (
    <Box sx={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: `
        radial-gradient(ellipse 70% 55% at 50% 42%, ${prize.color}22 0%, transparent 70%),
        linear-gradient(160deg, #0d1526 0%, #060d1a 100%)
      `,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      px: 3,
      gap: 0,
    }}>
      {/* Brand logo */}
      <Box
        component="img"
        src={prize.logo}
        alt={prize.label}
        sx={{
          width: 160,
          height: 100,
          objectFit: "contain",
          mb: 3,
          filter: "drop-shadow(0 0 24px rgba(0,0,0,0.4))",
        }}
      />

      <Typography sx={{
        fontFamily: '"Montserrat",sans-serif',
        fontWeight: 900,
        fontSize: "1.7rem",
        color: isRetry ? "rgba(255,255,255,0.7)" : "#FFD100",
        lineHeight: 1.2,
        mb: 0.5,
      }}>
        {isRetry ? "Quase lá!" : "Parabéns!"}
      </Typography>

      {!isRetry && (
        <Typography sx={{
          fontFamily: '"Montserrat",sans-serif',
          fontWeight: 600,
          fontSize: "1rem",
          color: "rgba(255,255,255,0.8)",
          mb: 0.5,
        }}>
          Você ganhou um cupom da:
        </Typography>
      )}

      <Typography sx={{
        fontFamily: '"Montserrat",sans-serif',
        fontWeight: 800,
        fontSize: "1.15rem",
        color: "#fff",
        mb: 0.5,
      }}>
        {prize.label}
      </Typography>

      <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", mb: 3.5 }}>
        {prize.description}
      </Typography>

      {!isRetry && (
        <Box sx={{
          width: "100%",
          maxWidth: 320,
          py: 1.4,
          bgcolor: "rgba(255,255,255,0.06)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.12)",
          mb: 3,
          px: 2,
        }}>
          <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", mb: 0.4 }}>
            Código do cupom
          </Typography>
          <Typography sx={{
            fontFamily: '"Montserrat",sans-serif',
            fontWeight: 800,
            fontSize: "1.2rem",
            color: "#FFD100",
            letterSpacing: "0.18em",
          }}>
            CASACAZE{Math.random().toString(36).slice(2, 8).toUpperCase()}
          </Typography>
        </Box>
      )}

      <Box
        component="button"
        onClick={onReset}
        sx={{
          width: "100%",
          maxWidth: 320,
          py: 1.3,
          bgcolor: "transparent",
          border: "1.5px solid rgba(255,255,255,0.2)",
          borderRadius: "12px",
          fontFamily: '"Montserrat",sans-serif',
          fontWeight: 700,
          fontSize: "0.9rem",
          color: "rgba(255,255,255,0.65)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          "&:hover": { borderColor: "#FFD100", color: "#FFD100" },
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        <ReplayIcon sx={{ fontSize: 18 }} />
        Voltar
      </Box>
    </Box>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}

// ── BrindesTab ─────────────────────────────────────────────────────────────────

export default function BrindesTab() {
  const [stage, setStage] = useState<Stage>("list");
  const [winner, setWinner] = useState<Prize | null>(null);
  const [spinsUsed, setSpinsUsed] = useState(0);

  function handleStart() { setSpinsUsed((n) => n + 1); setStage("video"); }
  function handleVideoDone() { setStage("wheel"); }
  function handleResult(prize: Prize) { setWinner(prize); setStage("result"); }
  function handleReset() { setWinner(null); setStage("list"); }

  return (
    <Box sx={{
      minHeight: "60vh",
      bgcolor: "rgba(10,17,40,0.98)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    }}>
      {stage === "list"   && <ListStage  onStart={handleStart} spinsUsed={spinsUsed} />}
      {stage === "video"  && <VideoStage onDone={handleVideoDone} />}
      {stage === "wheel"  && <WheelStage onResult={handleResult} />}
      {stage === "result" && winner && <ResultStage prize={winner} onReset={handleReset} />}
    </Box>
  );
}
