"use client";

import { useState } from "react";
import { Box, Typography, Drawer, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {
  CamisetaSVG,
  COR_MEDIDAS as COR,
  medidasPorTamanho,
  QRCodeImg,
} from "@/app/components/tshirt/camisetaGuideCore";

const SIZES = ["PP", "P", "M", "G", "GG", "XG"] as const;
type Size = (typeof SIZES)[number];

type Genero = "masculino" | "feminino";
type DrawerStep = "escolha" | "qrcode";

function gerarId() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
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
