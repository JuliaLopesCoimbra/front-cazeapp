"use client";

import { useState, useCallback } from "react";
import { Box, Typography, Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";

// ─── Tipos e dados ────────────────────────────────────────────────────────────

const SIZES = ["PP", "P", "M", "G", "GG", "XG"] as const;
type Size = (typeof SIZES)[number];

interface Medidas {
  ombro: number;
  manga: number;
  torax: number;
  comprimento: number;
}

const medidasPorTamanho: Record<Size, Medidas> = {
  PP: { ombro: 38, manga: 17, torax: 86, comprimento: 63 },
  P:  { ombro: 40, manga: 18, torax: 90, comprimento: 65 },
  M:  { ombro: 42, manga: 20, torax: 94, comprimento: 68 },
  G:  { ombro: 44, manga: 21, torax: 98, comprimento: 70 },
  GG: { ombro: 46, manga: 22, torax: 102, comprimento: 73 },
  XG: { ombro: 48, manga: 23, torax: 106, comprimento: 75 },
};

// Cores de cada medida
const COR = {
  ombro:       "#1565c0",
  manga:       "#e65100",
  torax:       "#6a1b9a",
  comprimento: "#009739",
};

// ─── SVG da camiseta ──────────────────────────────────────────────────────────

function CamisetaSVG({ medidas }: { medidas: Medidas }) {
  const svgW = 320;
  const svgH = 330;
  const svgTopPad = 22; // espaço extra para o label do Ombro não ser cortado

  // Pontos estruturais da camiseta
  const collarL    = { x: 116, y: 26 };
  const collarR    = { x: 204, y: 26 };
  const shoulderL  = { x: 76,  y: 56 };
  const shoulderR  = { x: 244, y: 56 };
  const sleeveOutL = { x: 22,  y: 102 };
  const sleeveOutR = { x: 298, y: 102 };
  const sleeveInL  = { x: 50,  y: 130 };
  const sleeveInR  = { x: 270, y: 130 };
  const bodyTL     = { x: 76,  y: 80 };
  const bodyTR     = { x: 244, y: 80 };
  const bodyBL     = { x: 76,  y: 286 };
  const bodyBR     = { x: 244, y: 286 };

  // Path da camiseta
  const shirtPath = [
    `M ${collarL.x} ${collarL.y}`,
    `Q 160 54 ${collarR.x} ${collarR.y}`,   // gola interna (curva pra baixo)
    `L ${shoulderR.x} ${shoulderR.y}`,
    `L ${sleeveOutR.x} ${sleeveOutR.y}`,
    `L ${sleeveInR.x} ${sleeveInR.y}`,
    `L ${bodyTR.x} ${bodyTR.y}`,
    `L ${bodyBR.x} ${bodyBR.y}`,
    `L ${bodyBL.x} ${bodyBL.y}`,
    `L ${bodyTL.x} ${bodyTL.y}`,
    `L ${sleeveInL.x} ${sleeveInL.y}`,
    `L ${sleeveOutL.x} ${sleeveOutL.y}`,
    `L ${shoulderL.x} ${shoulderL.y}`,
    "Z",
  ].join(" ");

  // Gola (collar) - forma separada com cor diferente
  const collarPath = [
    `M ${collarL.x} ${collarL.y}`,
    `L ${shoulderL.x} ${shoulderL.y}`,
    `Q 116 32 116 26`,                        // borda exterior esquerda
    `Q 160 0 204 26`,                          // borda exterior topo
    `Q 204 32 ${shoulderR.x} ${shoulderR.y}`,
    `L ${collarR.x} ${collarR.y}`,
    `Q 160 54 ${collarL.x} ${collarL.y}`,    // neckline interna
    "Z",
  ].join(" ");

  // Listra horizontal decorativa no peito
  const stripeY = 140;

  // ── Posições das linhas de medida ──

  // OMBRO: linha horizontal nos ombros
  const ombroY   = 42;
  const ombroX1  = shoulderL.x;
  const ombroX2  = shoulderR.x;

  // MANGA: linha diagonal da ponta do ombro até a ponta da manga (lado esquerdo)
  const mangaX1 = shoulderL.x;
  const mangaY1 = shoulderL.y;
  const mangaX2 = sleeveOutL.x;
  const mangaY2 = sleeveOutL.y;

  // TÓRAX: linha horizontal no meio do corpo
  const toraxY  = 178;
  const toraxX1 = bodyTL.x;
  const toraxX2 = bodyTR.x;

  // COMPRIMENTO: linha vertical no lado direito, da gola até a barra
  const compX  = 268;
  const compY1 = collarR.y;
  const compY2 = bodyBR.y;

  function ArrowH({ x1, x2, y, cor }: { x1: number; x2: number; y: number; cor: string }) {
    return (
      <g>
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={cor} strokeWidth={1.5} strokeDasharray="5,3" />
        {/* seta esquerda */}
        <path d={`M ${x1 + 6} ${y - 4} L ${x1} ${y} L ${x1 + 6} ${y + 4}`} fill="none" stroke={cor} strokeWidth={1.5} strokeLinecap="round" />
        {/* seta direita */}
        <path d={`M ${x2 - 6} ${y - 4} L ${x2} ${y} L ${x2 - 6} ${y + 4}`} fill="none" stroke={cor} strokeWidth={1.5} strokeLinecap="round" />
      </g>
    );
  }

  function ArrowDiag({ x1, y1, x2, y2, cor }: { x1: number; y1: number; x2: number; y2: number; cor: string }) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ax1x = x1 + 6 * Math.cos(ang + 0.5);
    const ax1y = y1 + 6 * Math.sin(ang + 0.5);
    const ax2x = x2 - 6 * Math.cos(ang - 0.5);
    const ax2y = y2 - 6 * Math.sin(ang - 0.5);
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={1.5} strokeDasharray="5,3" />
        <path d={`M ${ax1x} ${ax1y} L ${x1} ${y1} L ${x1 + 6 * Math.cos(ang - 0.5)} ${y1 + 6 * Math.sin(ang - 0.5)}`} fill="none" stroke={cor} strokeWidth={1.5} strokeLinecap="round" />
        <path d={`M ${ax2x} ${ax2y} L ${x2} ${y2} L ${x2 - 6 * Math.cos(ang + 0.5)} ${y2 - 6 * Math.sin(ang + 0.5)}`} fill="none" stroke={cor} strokeWidth={1.5} strokeLinecap="round" />
      </g>
    );
  }

  function ArrowV({ x, y1, y2, cor }: { x: number; y1: number; y2: number; cor: string }) {
    return (
      <g>
        <line x1={x} y1={y1} x2={x} y2={y2} stroke={cor} strokeWidth={1.5} strokeDasharray="5,3" />
        <path d={`M ${x - 4} ${y1 + 6} L ${x} ${y1} L ${x + 4} ${y1 + 6}`} fill="none" stroke={cor} strokeWidth={1.5} strokeLinecap="round" />
        <path d={`M ${x - 4} ${y2 - 6} L ${x} ${y2} L ${x + 4} ${y2 - 6}`} fill="none" stroke={cor} strokeWidth={1.5} strokeLinecap="round" />
      </g>
    );
  }

  function Label({ x, y, valor, unidade, cor, align = "center" }: {
    x: number; y: number; valor: number; unidade: string; cor: string; align?: "center" | "left" | "right";
  }) {
    const text = `${valor} ${unidade}`;
    const tw = text.length * 7 + 10;
    const tx = align === "left" ? x : align === "right" ? x - tw : x - tw / 2;
    return (
      <g>
        <rect x={tx} y={y - 10} width={tw} height={18} rx={4} fill={cor} opacity={0.92} />
        <text
          x={tx + tw / 2} y={y + 3}
          textAnchor="middle"
          fill="white"
          fontSize={11}
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          {text}
        </text>
      </g>
    );
  }

  // Ponto médio manga (para label)
  const mangaMidX = (mangaX1 + mangaX2) / 2 - 24;
  const mangaMidY = (mangaY1 + mangaY2) / 2 - 4;

  return (
    <svg
      viewBox={`0 -${svgTopPad} ${svgW} ${svgH + svgTopPad}`}
      overflow="visible"
      style={{ width: "100%", maxWidth: 340, display: "block", margin: "0 auto" }}
    >
      {/* Sombra suave */}
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(0,0,0,0.15)" />
        </filter>
        {/* Gradiente verde da camiseta */}
        <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#009739" />
          <stop offset="100%" stopColor="#006728" />
        </linearGradient>
        {/* Gradiente da gola */}
        <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEDF00" />
          <stop offset="100%" stopColor="#ffc107" />
        </linearGradient>
      </defs>

      {/* Camiseta - corpo */}
      <path d={shirtPath} fill="url(#greenGrad)" filter="url(#shadow)" />

      {/* Listra amarela decorativa */}
      <rect x={76} y={stripeY} width={168} height={6} fill="#FEDF00" opacity={0.85} rx={1} />
      <rect x={76} y={stripeY + 9} width={168} height={2} fill="#002776" opacity={0.6} rx={1} />

      {/* Gola */}
      <path d={collarPath} fill="url(#yellowGrad)" />

      {/* Badge CBF (círculo no peito) */}
      <circle cx={160} cy={110} r={18} fill="#002776" opacity={0.9} />
      <text x={160} y={107} textAnchor="middle" fill="#FEDF00" fontSize={8} fontWeight="bold" fontFamily="Inter, sans-serif">CBF</text>
      <text x={160} y={118} textAnchor="middle" fill="#fff" fontSize={6} fontFamily="Inter, sans-serif">BRASIL</text>

      {/* Número na camiseta */}
      <text x={160} y={238} textAnchor="middle" fill="rgba(255,255,255,0.18)" fontSize={68} fontWeight="900" fontFamily="Inter, sans-serif">10</text>

      {/* ── Linhas de medida ── */}

      {/* OMBRO */}
      <ArrowH x1={ombroX1} x2={ombroX2} y={ombroY} cor={COR.ombro} />
      <Label x={(ombroX1 + ombroX2) / 2} y={ombroY - 14} valor={medidas.ombro} unidade="cm" cor={COR.ombro} />

      {/* MANGA */}
      <ArrowDiag x1={mangaX1} y1={mangaY1} x2={mangaX2} y2={mangaY2} cor={COR.manga} />
      <Label x={mangaMidX - 2} y={mangaMidY} valor={medidas.manga} unidade="cm" cor={COR.manga} align="right" />

      {/* TÓRAX */}
      <ArrowH x1={toraxX1} x2={toraxX2} y={toraxY} cor={COR.torax} />
      <Label x={(toraxX1 + toraxX2) / 2} y={toraxY + 16} valor={medidas.torax} unidade="cm" cor={COR.torax} />

      {/* COMPRIMENTO */}
      <ArrowV x={compX} y1={compY1} y2={compY2} cor={COR.comprimento} />
      <Label x={compX + 6} y={(compY1 + compY2) / 2} valor={medidas.comprimento} unidade="cm" cor={COR.comprimento} align="left" />
    </svg>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

type Genero = "masculino" | "feminino";
type DrawerStep = "escolha" | "qrcode";

function gerarId() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

function QRCodeImg({ data }: { data: string }) {
  const encoded = encodeURIComponent(data);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=002776&data=${encoded}`}
      alt="QR Code de reserva"
      width={220}
      height={220}
      style={{ display: "block", borderRadius: 12, border: "6px solid #fff", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
    />
  );
}

function ReservaDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep]         = useState<DrawerStep>("escolha");
  const [genero, setGenero]     = useState<Genero | null>(null);
  const [tamReserva, setTam]    = useState<Size | null>(null);
  const [reservaId]             = useState(gerarId);

  const podeConfirmar = genero !== null && tamReserva !== null;

  const handleConfirmar = () => {
    if (!podeConfirmar) return;
    setStep("qrcode");
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep("escolha"); setGenero(null); setTam(null); }, 400);
  };

  const qrData = `COPA2026|RESERVA:${reservaId}|TAM:${tamReserva}|${genero?.toUpperCase()}`;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: "20px 20px 0 0",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Handle */}
      <Box sx={{ pt: 1.5, pb: 0.5, textAlign: "center" }}>
        <Box sx={{ width: 40, height: 4, bgcolor: "#e0e0e0", borderRadius: 2, mx: "auto" }} />
      </Box>

      {step === "escolha" ? (
        <Box sx={{ overflowY: "auto", px: 2.5, pt: 1, pb: 4, flex: 1 }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#111" }}>Reservar Camiseta</Typography>
              <Typography sx={{ fontSize: 12, color: "#777" }}>Escolha o modelo e o tamanho</Typography>
            </Box>
            <IconButton onClick={handleClose} size="small" sx={{ bgcolor: "#f5f5f5" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Gênero */}
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#444", mb: 1.2 }}>Modelo</Typography>
          <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
            {(["masculino", "feminino"] as Genero[]).map((g) => {
              const active = genero === g;
              const Icon = g === "masculino" ? MaleIcon : FemaleIcon;
              const cor = g === "masculino" ? "#1565c0" : "#c2185b";
              return (
                <Box
                  key={g}
                  onClick={() => setGenero(g)}
                  sx={{
                    flex: 1, py: 2, borderRadius: 3, cursor: "pointer", textAlign: "center",
                    border: active ? `2px solid ${cor}` : "2px solid #e0e0e0",
                    bgcolor: active ? `${cor}12` : "#fff",
                    transition: "all 0.15s",
                    "&:active": { transform: "scale(0.96)" },
                  }}
                >
                  <Icon sx={{ fontSize: 32, color: active ? cor : "#bbb", mb: 0.5 }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: active ? cor : "#888", textTransform: "capitalize" }}>
                    {g}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Tamanho */}
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#444", mb: 1.2 }}>Tamanho</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3.5 }}>
            {SIZES.map((s) => {
              const active = tamReserva === s;
              return (
                <Box
                  key={s}
                  onClick={() => setTam(s)}
                  sx={{
                    width: "calc(33.3% - 6px)", py: 1.4, textAlign: "center",
                    borderRadius: 2, cursor: "pointer",
                    border: active ? "2px solid #009739" : "2px solid #e0e0e0",
                    bgcolor: active ? "#009739" : "#fff",
                    boxShadow: active ? "0 2px 10px rgba(0,151,57,0.25)" : "none",
                    transition: "all 0.15s",
                    "&:active": { transform: "scale(0.94)" },
                  }}
                >
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: active ? "#fff" : "#555" }}>
                    {s}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Botão confirmar */}
          <Box
            onClick={handleConfirmar}
            sx={{
              py: 1.8, borderRadius: 3, textAlign: "center", cursor: podeConfirmar ? "pointer" : "default",
              background: podeConfirmar
                ? "linear-gradient(135deg, #009739, #005f28)"
                : "#e0e0e0",
              boxShadow: podeConfirmar ? "0 4px 16px rgba(0,151,57,0.3)" : "none",
              transition: "all 0.2s",
              "&:active": podeConfirmar ? { transform: "scale(0.98)" } : {},
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 900, color: podeConfirmar ? "#fff" : "#aaa" }}>
              {podeConfirmar ? "Confirmar Reserva ✓" : "Selecione modelo e tamanho"}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ overflowY: "auto", px: 2.5, pt: 1.5, pb: 5, flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", mb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon sx={{ color: "#009739", fontSize: 22 }} />
              <Typography sx={{ fontSize: 17, fontWeight: 900, color: "#111" }}>Reserva Confirmada!</Typography>
            </Box>
            <IconButton onClick={handleClose} size="small" sx={{ bgcolor: "#f5f5f5" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Detalhes da reserva */}
          <Box sx={{
            display: "flex", gap: 1, mb: 3, flexWrap: "wrap", justifyContent: "center",
          }}>
            <Box sx={{ bgcolor: "#e8f5e9", borderRadius: 2, px: 1.5, py: 0.6, display: "flex", alignItems: "center", gap: 0.5 }}>
              {genero === "masculino" ? <MaleIcon sx={{ fontSize: 16, color: "#1565c0" }} /> : <FemaleIcon sx={{ fontSize: 16, color: "#c2185b" }} />}
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#2e7d32", textTransform: "capitalize" }}>{genero}</Typography>
            </Box>
            <Box sx={{ bgcolor: "#e8f5e9", borderRadius: 2, px: 1.5, py: 0.6 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#2e7d32" }}>Tam. {tamReserva}</Typography>
            </Box>
            <Box sx={{ bgcolor: "#e3f2fd", borderRadius: 2, px: 1.5, py: 0.6 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1565c0" }}>#{reservaId}</Typography>
            </Box>
          </Box>

          {/* QR Code */}
          <Box sx={{
            p: 3, bgcolor: "#fff",
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            width: "100%", maxWidth: 300,
          }}>
            <QRCodeImg data={qrData} />
            <Typography sx={{ fontSize: 11, color: "#aaa", fontWeight: 600, letterSpacing: 1 }}>
              RESERVA #{reservaId}
            </Typography>
          </Box>

          {/* Instrução */}
          <Box sx={{
            mt: 3, p: 2,
            background: "linear-gradient(135deg, #009739, #005f28)",
            borderRadius: 3, width: "100%",
            display: "flex", gap: 1.5, alignItems: "flex-start",
          }}>
            <StorefrontIcon sx={{ color: "#FEDF00", fontSize: 26, flexShrink: 0, mt: 0.3 }} />
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#FEDF00", mb: 0.5 }}>
                Como retirar sua camiseta
              </Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.88)", lineHeight: 1.6 }}>
                Vá ao estande de retirada de camisetas e apresente este QR code para o promotor.
              </Typography>
            </Box>
          </Box>

          {/* Aviso */}
          <Typography sx={{ fontSize: 11, color: "#bbb", textAlign: "center", mt: 2, lineHeight: 1.6 }}>
            Este QR code é válido por 24h.{"\n"}Apresente na chegada ao evento.
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}

export default function CamisetaPage() {
  const [tamanho, setTamanho] = useState<Size>("M");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const medidas = medidasPorTamanho[tamanho];

  const linhas = [
    { key: "ombro",       label: "Ombro",       valor: medidas.ombro,       cor: COR.ombro },
    { key: "manga",       label: "Manga",        valor: medidas.manga,       cor: COR.manga },
    { key: "torax",       label: "Tórax",        valor: medidas.torax,       cor: COR.torax },
    { key: "comprimento", label: "Comprimento",  valor: medidas.comprimento, cor: COR.comprimento },
  ] as const;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pb: 20 }}>
      {/* Header */}
      <Box sx={{
        background: "linear-gradient(135deg, #009739 0%, #005f28 100%)",
        pt: 5, pb: 2.5, px: 2,
        position: "relative", overflow: "hidden",
      }}>
        <Box sx={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", bgcolor: "rgba(254,223,0,0.1)" }} />
        <Typography sx={{ color: "#FEDF00", fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>
          COPA DO MUNDO 2026
        </Typography>
        <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 900, mt: 0.2 }}>
          Camiseta Oficial 🇧🇷
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 12, mt: 0.3 }}>
          Guia de tamanhos e medidas
        </Typography>
      </Box>

      {/* Camiseta */}
      <Box sx={{
        bgcolor: "#fff",
        px: 2, pt: 3, pb: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <CamisetaSVG medidas={medidas} />

        {/* Legenda de cores */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center", mt: 2 }}>
          {linhas.map((l) => (
            <Box key={l.key} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: l.cor }} />
              <Typography sx={{ fontSize: 11, color: "#555" }}>{l.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Seletor de tamanho */}
      <Box sx={{ px: 2, pt: 2.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#444", mb: 1.2 }}>
          Selecione o tamanho:
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {SIZES.map((s) => {
            const active = tamanho === s;
            return (
              <Box
                key={s}
                onClick={() => setTamanho(s)}
                sx={{
                  flex: 1, py: 1.2, textAlign: "center",
                  borderRadius: 2, cursor: "pointer",
                  border: active ? "2px solid #009739" : "2px solid #e0e0e0",
                  bgcolor: active ? "#009739" : "#fff",
                  boxShadow: active ? "0 2px 10px rgba(0,151,57,0.25)" : "none",
                  transition: "all 0.15s",
                  "&:active": { transform: "scale(0.94)" },
                }}
              >
                <Typography sx={{
                  fontSize: 13, fontWeight: 800,
                  color: active ? "#fff" : "#555",
                }}>
                  {s}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Tabela de medidas */}
      <Box sx={{ px: 2, pt: 2.5 }}>
        <Box sx={{
          bgcolor: "#fff", borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>
          {/* Cabeçalho */}
          <Box sx={{
            px: 2, py: 1.2,
            background: "linear-gradient(90deg, #002776, #003a9e)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
              Medidas — Tamanho {tamanho}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>em centímetros</Typography>
          </Box>

          {/* Linhas */}
          {linhas.map((l, i) => (
            <Box
              key={l.key}
              sx={{
                px: 2, py: 1.4,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                bgcolor: i % 2 === 0 ? "#fafafa" : "#fff",
                borderBottom: i < linhas.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              {/* Label com bolinha colorida */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: l.cor, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{l.label}</Typography>
              </Box>

              {/* Valor com underline colorido */}
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  sx={{
                    fontSize: 18, fontWeight: 900, color: l.cor,
                    borderBottom: `3px solid ${l.cor}`,
                    pb: 0.1, lineHeight: 1.3,
                    display: "inline-block",
                  }}
                >
                  {l.valor} cm
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Nota de rodapé */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography sx={{ fontSize: 11, color: "#aaa", textAlign: "center", lineHeight: 1.6 }}>
          Medidas aproximadas. Tolerância de ±1 cm.{"\n"}
          Em caso de dúvida, prefira o tamanho maior.
        </Typography>
      </Box>

      {/* Botão fixo — Reservar Camiseta */}
      <Box sx={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        px: 2, pt: 1.5, pb: 3.5,
        background: "linear-gradient(to top, #f5f5f5 70%, transparent)",
        zIndex: 10,
      }}>
        <Box
          onClick={() => setDrawerOpen(true)}
          sx={{
            py: 2, borderRadius: 3, textAlign: "center", cursor: "pointer",
            background: "linear-gradient(135deg, #009739 0%, #005f28 100%)",
            boxShadow: "0 6px 24px rgba(0,151,57,0.4)",
            transition: "transform 0.15s",
            "&:active": { transform: "scale(0.97)" },
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 900, color: "#fff", letterSpacing: 0.5 }}>
            👕  Reservar Camiseta
          </Typography>
        </Box>
      </Box>

      <ReservaDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
}
