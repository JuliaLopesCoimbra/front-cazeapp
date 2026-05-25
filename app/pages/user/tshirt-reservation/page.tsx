"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import {
  CamisetaSVG,
  COR_MEDIDAS as COR,
  medidasPorTamanho,
  QRCodeImg,
} from "@/app/components/tshirt/camisetaGuideCore";
import { ALLOWED_SIZES } from "@/app/services/admin/tshirtStockService";
import {
  createTshirtReservation,
  getMyTshirtReservation,
  getTshirtAvailability,
  type TshirtReservationMine,
  type TshirtSizeAvailability,
} from "@/app/services/user/tshirtReservationUserService";

const SIZES = [...ALLOWED_SIZES];

function QrSuccessBlock({ reservation }: { reservation: TshirtReservationMine }) {
  const pickedUp = reservation.status === "picked_up";

  return (
    <Box sx={{ px: 2, pt: 3, pb: 4 }}>
      {/* Status header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <CheckCircleIcon sx={{ color: pickedUp ? "#aaa" : "#009739", fontSize: 32, flexShrink: 0 }} />
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#111", lineHeight: 1.2 }}>
            {pickedUp ? "Camiseta retirada" : "Reserva confirmada!"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#888", mt: 0.3 }}>
            {pickedUp ? "Retirada registrada" : `Tamanho ${reservation.size} · Reserva #${reservation.id}`}
          </Typography>
        </Box>
      </Box>

      {/* QR code card — grande */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 4,
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          position: "relative",
          overflow: "hidden",
          border: pickedUp ? "2px solid #e0e0e0" : "2px solid #c8ecd4",
        }}
      >
        {/* Faixa superior */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: pickedUp
              ? "linear-gradient(90deg, #aaa, #888)"
              : "linear-gradient(90deg, #009739, #FEDF00, #009739)",
          }}
        />

        <Box sx={{ pt: 0.5, textAlign: "center" }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: pickedUp ? "#aaa" : "#009739", letterSpacing: 1.2 }}>
            {pickedUp ? "JÁ RETIRADO" : "QR CODE DE RETIRADA"}
          </Typography>
        </Box>

        <Box
          sx={{
            filter: pickedUp ? "grayscale(1) opacity(0.3)" : "none",
            transition: "filter 0.3s",
            width: "100%",
            maxWidth: 280,
            "& img, & canvas, & svg": { width: "100% !important", height: "auto !important" },
          }}
        >
          <QRCodeImg data={reservation.qr_payload} />
        </Box>

        {pickedUp && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <CheckCircleIcon sx={{ color: "#009739", fontSize: 56 }} />
            <Box
              sx={{
                px: 2.5,
                py: 0.8,
                border: "3px solid #009739",
                borderRadius: 1.5,
                transform: "rotate(-8deg)",
                bgcolor: "rgba(255,255,255,0.9)",
              }}
            >
              <Typography sx={{ fontSize: 22, fontWeight: 900, color: "#009739", letterSpacing: 4 }}>
                RETIRADO
              </Typography>
            </Box>
            {reservation.picked_up_by_name && (
              <Typography sx={{ fontSize: 12, color: "#555", fontWeight: 600 }}>
                por {reservation.picked_up_by_name}
              </Typography>
            )}
          </Box>
        )}

        {!pickedUp && (
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 12, color: "#888", lineHeight: 1.6, maxWidth: 240 }}>
              Apresente ao promotor no estande N1 para retirar sua camiseta.
            </Typography>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 1.2, bgcolor: "#fff3e0", borderRadius: 2, px: 1.4, py: 0.5 }}>
              <LockOutlinedIcon sx={{ fontSize: 14, color: "#e65100" }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#e65100" }}>
                Não compartilhe este QR code com ninguém
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Info card */}
      {!pickedUp && (
        <Box
          sx={{
            mt: 2.5,
            p: 2,
            background: "linear-gradient(135deg, #009739, #005f28)",
            borderRadius: 3,
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          <StorefrontIcon sx={{ color: "#FEDF00", fontSize: 28, flexShrink: 0, mt: 0.2 }} />
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#FEDF00", mb: 0.3 }}>
              Retirada no evento N1
            </Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
              Guarde este código. Ao escanear, sua camiseta tamanho{" "}
              <Box component="span" sx={{ fontWeight: 800, color: "#fff" }}>
                {reservation.size}
              </Box>{" "}
              será separada para você.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default function TshirtReservationPage() {
  const router = useRouter();
  const { isAuthenticated, authReady } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [avail, setAvail] = useState<TshirtSizeAvailability[]>([]);
  const [reservation, setReservation] = useState<TshirtReservationMine | null>(null);
  const [tamanho, setTamanho] = useState<string>("M");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ticketDate, setTicketDate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [a, r] = await Promise.all([getTshirtAvailability(), getMyTshirtReservation()]);
      setAvail(a);
      setReservation(r);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao carregar", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      router.replace("/pages/auth/login");
      return;
    }
    load();
  }, [authReady, isAuthenticated, router, load]);

  const availBySize = useMemo(() => {
    const m = new Map<string, TshirtSizeAvailability>();
    avail.forEach((x) => m.set(x.size, x));
    return m;
  }, [avail]);

  const medidas = medidasPorTamanho[tamanho] ?? medidasPorTamanho.M;
  const linhas = [
    { key: "ombro",       label: "Ombro",       valor: medidas.ombro,       cor: COR.ombro },
    { key: "manga",       label: "Manga",        valor: medidas.manga,       cor: COR.manga },
    { key: "torax",       label: "Tórax",        valor: medidas.torax,       cor: COR.torax },
    { key: "comprimento", label: "Comprimento",  valor: medidas.comprimento, cor: COR.comprimento },
  ] as const;

  const openReserve = () => {
    setTicketDate(null);
    setDrawerOpen(true);
  };

  const confirmReserve = async () => {
    if (!ticketDate) return;
    setSubmitting(true);
    try {
      const created = await createTshirtReservation(tamanho, ticketDate);
      setReservation(created);
      setDrawerOpen(false);
      showToast("Reserva realizada!", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authReady || !isAuthenticated) return null;

  const hasPending = reservation?.status === "pending_pickup";
  const pickedUp = reservation?.status === "picked_up";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6f4", pb: 22 }}>
      <AppBar position="sticky" elevation={0} sx={{ background: "linear-gradient(90deg, #009739, #005f28)" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, fontSize: 17 }}>
            Camiseta N1
          </Typography>
          <CheckroomIcon sx={{ color: "#FEDF00" }} />
        </Toolbar>
      </AppBar>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress sx={{ color: "#009739" }} />
        </Box>
      ) : (pickedUp || hasPending) && reservation ? (
        <QrSuccessBlock reservation={reservation} />
      ) : (
        <>
          {/* Hero */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #009739 0%, #005f28 100%)",
              pt: 3.5,
              pb: 4,
              px: 2.5,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* círculos decorativos */}
            <Box sx={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", bgcolor: "rgba(254,223,0,0.07)" }} />
            <Box sx={{ position: "absolute", bottom: -20, right: 40, width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(254,223,0,0.05)" }} />

            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.7, bgcolor: "rgba(254,223,0,0.15)", borderRadius: 10, px: 1.2, py: 0.4, mb: 1.5 }}>
              <CheckroomIcon sx={{ fontSize: 12, color: "#FEDF00" }} />
              <Typography sx={{ color: "#FEDF00", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>EVENTO N1</Typography>
            </Box>
            <Typography sx={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1.15 }}>
              Camiseta oficial
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: 13, mt: 0.8 }}>
              Gratuita para participantes · Escolha seu tamanho
            </Typography>
          </Box>

          {/* SVG + legenda */}
          <Box
            sx={{
              bgcolor: "#fff",
              mx: 2,
              mt: -1.5,
              borderRadius: 3,
              px: 2,
              pt: 3,
              pb: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <CamisetaSVG medidas={medidas} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center", mt: 2 }}>
              {linhas.map((l) => (
                <Box key={l.key} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: l.cor }} />
                  <Typography sx={{ fontSize: 11, color: "#666", fontWeight: 500 }}>{l.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Seletor de tamanho */}
          <Box sx={{ px: 2, pt: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#222", mb: 1.5 }}>
              Selecione o tamanho
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {SIZES.map((s) => {
                const active = tamanho === s;
                const free = availBySize.get(s)?.available_to_reserve ?? 0;
                return (
                  <Box
                    key={s}
                    onClick={() => setTamanho(s)}
                    sx={{
                      minWidth: "14%",
                      flex: "1 1 14%",
                      py: 1.4,
                      textAlign: "center",
                      borderRadius: 2.5,
                      cursor: "pointer",
                      border: active ? "2.5px solid #009739" : "2px solid #e0e0e0",
                      bgcolor: active ? "#009739" : "#fff",
                      boxShadow: active ? "0 4px 14px rgba(0,151,57,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                      transition: "all 0.15s",
                      opacity: free < 1 ? 0.5 : 1,
                    }}
                  >
                    <Typography sx={{ fontSize: 14, fontWeight: 900, color: active ? "#fff" : "#444" }}>
                      {s}
                    </Typography>
                    <Typography sx={{ fontSize: 9, fontWeight: 600, color: active ? "rgba(255,255,255,0.8)" : free < 1 ? "#d32f2f" : "#888", mt: 0.3 }}>
                      {free < 1 ? "esgotado" : `${free} livre${free > 1 ? "s" : ""}`}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Tabela de medidas */}
          <Box sx={{ px: 2, pt: 3 }}>
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 1.4,
                  background: "linear-gradient(90deg, #002776, #003a9e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                  Medidas — {tamanho}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>cm</Typography>
              </Box>
              {linhas.map((l, i) => (
                <Box
                  key={l.key}
                  sx={{
                    px: 2.5,
                    py: 1.6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: i % 2 === 0 ? "#fafafa" : "#fff",
                    borderBottom: i < linhas.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Box sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: l.cor, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{l.label}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 900, color: l.cor, borderBottom: `3px solid ${l.cor}`, pb: 0.1, lineHeight: 1.3 }}>
                    {l.valor} cm
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography sx={{ fontSize: 11, color: "#bbb", textAlign: "center", lineHeight: 1.7 }}>
              Medidas aproximadas. Em dúvida, prefira o tamanho maior com disponibilidade.
            </Typography>
          </Box>
        </>
      )}

      {/* Botão fixo */}
      {!loading && !pickedUp && !hasPending && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            px: 2,
            pt: 2,
            pb: 4,
            background: "linear-gradient(to top, #f4f6f4 70%, transparent)",
            zIndex: 10,
          }}
        >
          <Box
            onClick={() => {
              const free = availBySize.get(tamanho)?.available_to_reserve ?? 0;
              if (free < 1) {
                showToast("Sem estoque disponível para este tamanho", "error");
                return;
              }
              openReserve();
            }}
            sx={{
              py: 2,
              borderRadius: 3,
              textAlign: "center",
              cursor: "pointer",
              background: "linear-gradient(135deg, #009739, #005f28)",
              boxShadow: "0 8px 28px rgba(0,151,57,0.4)",
              "&:active": { transform: "scale(0.98)" },
              transition: "all 0.15s",
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>
              Reservar camiseta — tamanho {tamanho}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Drawer de revisão */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { borderRadius: "20px 20px 0 0", maxHeight: "92vh" } }}
      >
        <Box sx={{ pt: 1.5, pb: 0.5, textAlign: "center" }}>
          <Box sx={{ width: 40, height: 4, bgcolor: "#e0e0e0", borderRadius: 2, mx: "auto" }} />
        </Box>

        <Box sx={{ px: 2.5, pt: 1, pb: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#111" }}>Revisão do pedido</Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ bgcolor: "#f5f5f5" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ px: 2.5, pt: 2, pb: 5, overflowY: "auto" }}>
          {/* Card da camiseta */}
          <Box
            sx={{
              bgcolor: "#f0faf4",
              border: "1.5px solid #c8ecd4",
              borderRadius: 3,
              p: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ width: 80, flexShrink: 0, "& svg": { width: "100%", height: "auto" } }}>
              <CamisetaSVG medidas={medidas} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#009739", letterSpacing: 1 }}>
                CAMISETA OFICIAL
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 900, color: "#111", mt: 0.2 }}>
                Evento N1
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#666", mt: 0.2 }}>Unissex</Typography>
              <Box sx={{ display: "inline-flex", bgcolor: "#009739", borderRadius: 1.5, px: 1.2, py: 0.3, mt: 0.8 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>
                  Tamanho {tamanho}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Data do ingresso */}
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#444", mb: 1.2 }}>
            Quando você comprou o ingresso?
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            {["13/06", "19/06", "24/06"].map((date) => {
              const active = ticketDate === date;
              return (
                <Box
                  key={date}
                  onClick={() => setTicketDate(date)}
                  sx={{
                    flex: 1,
                    py: 1.6,
                    textAlign: "center",
                    borderRadius: 2.5,
                    cursor: "pointer",
                    border: active ? "2.5px solid #009739" : "2px solid #e0e0e0",
                    bgcolor: active ? "#009739" : "#fff",
                    boxShadow: active ? "0 4px 12px rgba(0,151,57,0.25)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: active ? "#fff" : "#555" }}>
                    {date}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Button
            fullWidth
            variant="contained"
            disabled={!ticketDate || submitting}
            onClick={confirmReserve}
            sx={{
              py: 1.8,
              fontWeight: 900,
              fontSize: 15,
              background: "linear-gradient(135deg, #009739, #005f28)",
              borderRadius: 2.5,
              boxShadow: "0 6px 20px rgba(0,151,57,0.35)",
              textTransform: "none",
              "&:hover": { background: "linear-gradient(135deg, #007a2f, #004d20)" },
              "&.Mui-disabled": { bgcolor: "#e0e0e0", color: "#aaa" },
            }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : "Confirmar reserva"}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
