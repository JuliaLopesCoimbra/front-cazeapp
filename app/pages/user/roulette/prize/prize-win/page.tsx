"use client";

import { Box, Typography, Button, Skeleton } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function PrizeWinContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [prize, setPrize] = useState<{
    id: string | null;
    name: string | null;
    image_url?: string | null;
    position: string | null;
  } | null>(null);

  useEffect(() => {
    const prizeId = params.get("prize_id");
    const prizeName = params.get("prize_name");
    const prizeImage = params.get("prize_image");
    const prizePosition = params.get("prize_position");

    if (!prizeName) {
      router.replace("/pages/user/home");
      return;
    }

    setPrize({
      id: prizeId,
      name: prizeName,
      image_url: prizeImage,
      position: prizePosition,
    });
  }, [params, router]);

  if (!prize) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: "url(/background/prize.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 4,
        }}
      >
        {/* Skeleton da imagem do prêmio */}
        <Skeleton
          variant="rectangular"
          sx={{
            width: { xs: 80, sm: 120, md: 180, lg: 240 },
            height: { xs: 80, sm: 120, md: 180, lg: 240 },
            borderRadius: 2,
            marginTop: { xs: "470px", sm: "400px", md: "300px", lg: "200px" },
            mb: { xs: 3, md: 4 },
            bgcolor: "rgba(255,255,255,0.2)",
          }}
        />

        {/* Skeleton do botão */}
        <Skeleton
          variant="rectangular"
          sx={{
            width: { xs: 180, sm: 220, md: 280, lg: 320 },
            height: { xs: 48, sm: 56, md: 64, lg: 72 },
            borderRadius: "14px",
            marginTop: { xs: "10px", md: "20px" },
            bgcolor: "rgba(255,204,1,0.4)",
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url(/background/prize.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
      }}
    >
      {prize.image_url && (
        <Box
          component="img"
          src={prize.image_url}
          alt={prize.name || "Prêmio"}
          sx={{
            width: "100%",
            maxWidth: { xs: 80, sm: 120, md: 180, lg: 240, xl: 300 },
            height: "auto",
            borderRadius: { xs: 2, md: 3 },
            marginTop: { xs: "470px", sm: "400px", md: "300px", lg: "200px", xl: "150px" },
            mb: { xs: 3, md: 4, lg: 5 },
            objectFit: "cover",
            boxShadow: { xs: "none", md: "0 8px 32px rgba(0,0,0,0.3)" },
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: { xs: "none", md: "scale(1.05)" },
            },
          }}
        />
      )}

      <Button
        variant="contained"
        size="large"
        onClick={() => router.push("/pages/user/home")}
        sx={{
          backgroundColor: "#ffcc01",
          color: "#000",
          fontWeight: 600,
          marginTop: { xs: "10px", md: "20px" },
          borderRadius: "14px",
          textTransform: "none",
          px: { xs: 4, sm: 5, md: 6, lg: 8 },
          py: { xs: 0.5, sm: 1, md: 1.5, lg: 2 },
          fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem", lg: "1.25rem" },
          minWidth: { xs: 180, sm: 220, md: 280, lg: 320 },
          minHeight: { xs: 48, sm: 56, md: 64, lg: 72 },
          "&:hover": {
            backgroundColor: "#e6b800",
            transform: { xs: "none", md: "scale(1.05)" },
          },
          transition: "all 0.3s ease",
          boxShadow: { xs: "none", md: "0 4px 16px rgba(255,204,1,0.4)" },
        }}
      >
        Resgatar Cupom
      </Button>
    </Box>
  );
}

export default function PrizeWinPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            backgroundImage: "url(/background/dashboard.png)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="white">Carregando...</Typography>
        </Box>
      }
    >
      <PrizeWinContent />
    </Suspense>
  );
}

