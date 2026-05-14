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
    <Box sx={{ px: 2, pt: 2, pb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <CheckCircleIcon sx={{ color: pickedUp ? "#aaa" : "#009739", fontSize: 28 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#111" }}>
          {pickedUp ? "Camiseta retirada" : "Reserva confirmada"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Box sx={{ bgcolor: pickedUp ? "#f5f5f5" : "#e8f5e9", borderRadius: 2, px: 1.5, py: 0.6 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: pickedUp ? "#888" : "#2e7d32" }}>
            Unissex · Tam. {reservation.size}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: "#e3f2fd", borderRadius: 2, px: 1.5, py: 0.6 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1565c0" }}>
            #{reservation.id}
          </Typography>
        </Box>
      </Box>

      {/* QR code — expirado visualmente quando já retirado */}
      <Box
        sx={{
          p: 3,
          bgcolor: "#fff",
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          maxWidth: 320,
          mx: "auto",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ filter: pickedUp ? "grayscale(1) opacity(0.35)" : "none", transition: "filter 0.3s" }}>
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
              gap: 1,
            }}
          >
            <CheckCircleIcon sx={{ color: "#009739", fontSize: 48 }} />
            <Box
              sx={{
                px: 2,
                py: 0.6,
                border: "2.5px solid #009739",
                borderRadius: 1,
                transform: "rotate(-8deg)",
              }}
            >
              <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#009739", letterSpacing: 3 }}>
                RETIRADO
              </Typography>
            </Box>
            {reservation.picked_up_by_name && (
              <Typography sx={{ fontSize: 11, color: "#555", mt: 0.5 }}>
                por {reservation.picked_up_by_name}
              </Typography>
            )}
          </Box>
        )}

        {!pickedUp && (
          <Typography sx={{ fontSize: 11, color: "#888", textAlign: "center", lineHeight: 1.5 }}>
            Apresente este QR code ao promotor no estande. Ao escanear, a retirada será registrada e o
            estoque atualizado.
          </Typography>
        )}
      </Box>

      {!pickedUp && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            background: "linear-gradient(135deg, #009739, #005f28)",
            borderRadius: 3,
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          <StorefrontIcon sx={{ color: "#FEDF00", fontSize: 26, flexShrink: 0, mt: 0.3 }} />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#FEDF00", mb: 0.5 }}>
              Retirada no evento N1
            </Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>
              Guarde este código até a retirada da camiseta.
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
  const [selSize, setSelSize] = useState<string | null>(null);
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
    { key: "ombro", label: "Ombro", valor: medidas.ombro, cor: COR.ombro },
    { key: "manga", label: "Manga", valor: medidas.manga, cor: COR.manga },
    { key: "torax", label: "Tórax", valor: medidas.torax, cor: COR.torax },
    { key: "comprimento", label: "Comprimento", valor: medidas.comprimento, cor: COR.comprimento },
  ] as const;

  const openReserve = () => {
    setSelSize(tamanho);
    setDrawerOpen(true);
  };

  const confirmReserve = async () => {
    if (!selSize) return;
    setSubmitting(true);
    try {
      const created = await createTshirtReservation(selSize);
      setReservation(created);
      setDrawerOpen(false);
      showToast("Reserva realizada!", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authReady || !isAuthenticated) {
    return null;
  }

  const hasPending = reservation && reservation.status === "pending_pickup";
  const pickedUp = reservation?.status === "picked_up";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pb: 22 }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#009739" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, fontSize: 17 }}>
            Reserva de camiseta N1
          </Typography>
        </Toolbar>
      </AppBar>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress sx={{ color: "#009739" }} />
        </Box>
      ) : (pickedUp || hasPending) && reservation ? (
        <QrSuccessBlock reservation={reservation} />
      ) : (
        <>
          <Box
            sx={{
              background: "linear-gradient(135deg, #009739 0%, #005f28 100%)",
              pt: 3,
              pb: 2.5,
              px: 2,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Typography sx={{ color: "#FEDF00", fontSize: 11, fontWeight: 700, letterSpacing: 1.2 }}>
              EVENTO N1
            </Typography>
            <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 900, mt: 0.2 }}>
              Camiseta unissex
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 12, mt: 0.5 }}>
              Guia de tamanhos — escolha um tamanho com estoque disponível para reservar
            </Typography>
          </Box>

          <Box sx={{ bgcolor: "#fff", px: 2, pt: 3, pb: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <CamisetaSVG medidas={medidas} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center", mt: 2 }}>
              {linhas.map((l) => (
                <Box key={l.key} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: l.cor }} />
                  <Typography sx={{ fontSize: 11, color: "#555" }}>{l.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ px: 2, pt: 2.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#444", mb: 1.2 }}>
              Selecione o tamanho:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {SIZES.map((s) => {
                const active = tamanho === s;
                const row = availBySize.get(s);
                const free = row?.available_to_reserve ?? 0;
                return (
                  <Box
                    key={s}
                    onClick={() => setTamanho(s)}
                    sx={{
                      minWidth: "14%",
                      flex: "1 1 14%",
                      py: 1.2,
                      textAlign: "center",
                      borderRadius: 2,
                      cursor: "pointer",
                      border: active ? "2px solid #009739" : "2px solid #e0e0e0",
                      bgcolor: active ? "#009739" : "#fff",
                      boxShadow: active ? "0 2px 10px rgba(0,151,57,0.25)" : "none",
                      transition: "all 0.15s",
                      opacity: free < 1 ? 0.55 : 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: active ? "#fff" : "#555",
                      }}
                    >
                      {s}
                    </Typography>
                    <Typography sx={{ fontSize: 9, color: active ? "rgba(255,255,255,0.85)" : "#888", mt: 0.3 }}>
                      {free} livre(s)
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ px: 2, pt: 2.5 }}>
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.2,
                  background: "linear-gradient(90deg, #002776, #003a9e)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                  Medidas — {tamanho}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>cm</Typography>
              </Box>
              {linhas.map((l, i) => (
                <Box
                  key={l.key}
                  sx={{
                    px: 2,
                    py: 1.4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: i % 2 === 0 ? "#fafafa" : "#fff",
                    borderBottom: i < linhas.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: l.cor, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#333" }}>{l.label}</Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: l.cor,
                      borderBottom: `3px solid ${l.cor}`,
                      pb: 0.1,
                      lineHeight: 1.3,
                      display: "inline-block",
                    }}
                  >
                    {l.valor} cm
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography sx={{ fontSize: 11, color: "#aaa", textAlign: "center", lineHeight: 1.6 }}>
              Medidas aproximadas. Em dúvida, prefira o maior tamanho com disponibilidade.
            </Typography>
          </Box>
        </>
      )}

      {!loading && !pickedUp && !hasPending && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            px: 2,
            pt: 1.5,
            pb: 3.5,
            background: "linear-gradient(to top, #f5f5f5 75%, transparent)",
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
              background: "linear-gradient(135deg, #009739 0%, #005f28 100%)",
              boxShadow: "0 6px 24px rgba(0,151,57,0.35)",
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>
              Reservar camiseta ({tamanho})
            </Typography>
          </Box>
        </Box>
      )}

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px 20px 0 0",
            maxHeight: "88vh",
          },
        }}
      >
        <Box sx={{ pt: 1.5, pb: 0.5, textAlign: "center" }}>
          <Box sx={{ width: 40, height: 4, bgcolor: "#e0e0e0", borderRadius: 2, mx: "auto" }} />
        </Box>
        <Box sx={{ px: 2.5, pt: 1, pb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 900 }}>Confirmar reserva</Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ bgcolor: "#f5f5f5" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography sx={{ fontSize: 13, color: "#666", mb: 2 }}>
            Modelo unissex. Confirme o tamanho. A reserva bloqueia uma unidade até a retirada com QR
            code.
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#444", mb: 1 }}>Tamanho</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
            {SIZES.map((s) => {
              const active = selSize === s;
              const free = availBySize.get(s)?.available_to_reserve ?? 0;
              const disabled = free < 1;
              return (
                <Box
                  key={s}
                  onClick={() => !disabled && setSelSize(s)}
                  sx={{
                    width: "calc(33.3% - 6px)",
                    py: 1.4,
                    textAlign: "center",
                    borderRadius: 2,
                    cursor: disabled ? "not-allowed" : "pointer",
                    border: active ? "2px solid #009739" : "2px solid #e0e0e0",
                    bgcolor: active ? "#009739" : "#fff",
                    opacity: disabled ? 0.45 : 1,
                  }}
                >
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: active ? "#fff" : "#555" }}>
                    {s}
                  </Typography>
                  <Typography sx={{ fontSize: 10, color: active ? "rgba(255,255,255,0.85)" : "#999" }}>
                    {free} disp.
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Button
            fullWidth
            variant="contained"
            disabled={!selSize || submitting || (availBySize.get(selSize)?.available_to_reserve ?? 0) < 1}
            onClick={confirmReserve}
            sx={{ py: 1.5, fontWeight: 900, bgcolor: "#009739" }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : "Confirmar reserva"}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}
