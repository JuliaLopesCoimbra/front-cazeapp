"use client";

import { useState } from "react";
import { Box, Typography, Skeleton, Snackbar, Alert } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BottomNav from "@/app/components/layout/BottomNav";
import TopBar from "@/app/components/layout/TopBar";
import { PrizeCard } from "@/app/components/bolao/PrizeCard";
import { PointsBadge } from "@/app/components/shared/PointsBadge";
import { useBolaoPrizes, useBolaoMyPoints, useRedeemPrize } from "@/app/hooks/useBolao";

function PrizeSkeleton() {
  return (
    <Skeleton
      variant="rectangular"
      height={290}
      sx={{ borderRadius: "16px", backgroundColor: "#1A1A1A" }}
    />
  );
}

interface SnackState {
  message: string;
  severity: "success" | "error";
}

export default function PremiosPage() {
  const { data: prizes, isLoading: loadingPrizes } = useBolaoPrizes();
  const { data: myPoints, isLoading: loadingPoints } = useBolaoMyPoints();
  const {
    mutate: redeemPrize,
    isPending: isRedeeming,
    variables: redeemingPrizeId,
  } = useRedeemPrize();
  const [snack, setSnack] = useState<SnackState | null>(null);

  function handleRedeem(prizeId: number) {
    redeemPrize(prizeId, {
      onSuccess: () =>
        setSnack({ message: "Prêmio resgatado! Aguarde a confirmação.", severity: "success" }),
      onError: () =>
        setSnack({ message: "Não foi possível resgatar. Tenta de novo.", severity: "error" }),
    });
  }

  const activePrizes = prizes?.filter((p) => p.is_active) ?? [];

  return (
    <Box sx={{ backgroundColor: "#000", minHeight: "100vh", pb: "100px" }}>
      <TopBar title="Prêmios" showBack />

      <Box sx={{ px: 2, pt: 2 }}>
        <Typography
          sx={{
            color: "#9E9E9E",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            mb: 1,
          }}
        >
          Seus pontos
        </Typography>
        <Box sx={{ mb: 3 }}>
          <PointsBadge points={myPoints} isLoading={loadingPoints} />
        </Box>

        <Typography
          sx={{
            color: "#FFFFFF",
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontWeight: 700,
            fontSize: "1rem",
            mb: 2,
          }}
        >
          Catálogo de prêmios
        </Typography>

        {loadingPrizes ? (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <PrizeSkeleton key={i} />
            ))}
          </Box>
        ) : activePrizes.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <EmojiEventsIcon sx={{ color: "#F5C900", fontSize: 40, mb: 1 }} />
            <Typography sx={{ color: "#9E9E9E" }}>
              Nenhum prêmio disponível no momento. Fique ligado!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {activePrizes.map((prize) => (
              <PrizeCard
                key={prize.id}
                prize={prize}
                userPoints={myPoints?.total_points ?? 0}
                onRedeem={handleRedeem}
                isRedeeming={isRedeeming && redeemingPrizeId === prize.id}
              />
            ))}
          </Box>
        )}
      </Box>

      <Snackbar
        open={snack != null}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {snack != null ? (
          <Alert
            severity={snack.severity}
            onClose={() => setSnack(null)}
            sx={{ width: "100%" }}
          >
            {snack.message}
          </Alert>
        ) : undefined}
      </Snackbar>

      <BottomNav />
    </Box>
  );
}
