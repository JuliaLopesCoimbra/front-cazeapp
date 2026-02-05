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
          backgroundImage: "url(/background/fundopftbrinde.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "428px",
            height: "100vh",
            backgroundImage: "url(/background/fundopftbrinde.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 2,
            pb: 4,
            overflow: "hidden",
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              mb: 3,
              bgcolor: "rgba(255,255,255,0.2)",
            }}
          />
          <Skeleton
            variant="rectangular"
            sx={{
              width: 180,
              height: 48,
              borderRadius: "14px",
              mb: 4,
              bgcolor: "rgba(255,204,1,0.4)",
            }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url(/background/fundopftbrinde.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "428px",
          height: "100vh",
          backgroundImage: "url(/background/fundopftbrinde.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          px: 2,
          pb: 4,
          overflow: "hidden",
        }}
      >
        {prize.image_url && (
          <Box
            component="img"
            src={prize.image_url}
            alt={prize.name || "Prêmio"}
            sx={{
              width: "100%",
              maxWidth: 80,
              height: "auto",
              borderRadius: 2,
              mb: 2,
              objectFit: "cover",
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
            borderRadius: "14px",
            textTransform: "none",
            px: 4,
            py: 0.5,
            fontSize: "0.875rem",
            minWidth: 180,
            minHeight: 48,
            mb: 1,
            "&:hover": {
              backgroundColor: "#e6b800",
            },
            transition: "all 0.3s ease",
          }}
        >
          Resgatar Cupom
        </Button>
      </Box>
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
            backgroundImage: "url(/background/fundopftbrinde.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
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

