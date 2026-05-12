"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Skeleton, Typography } from "@mui/material";

interface AdPlacement {
  image_url: string;
  redirect_url: string;
  viewable_url?: string;
  alt_text: string;
}

const MOCK_ADS: AdPlacement[] = [
  {
    image_url: "/ads/1.png",
    redirect_url: "https://www.pernod-ricard.com/pt/locations/brasil",
    alt_text: "Beefeater",
  },
  {
    image_url: "/ads/2.png",
    redirect_url: "https://www.friboi.com.br/marcas/maturatta-friboi/",
    alt_text: "Maturatta - Oferta Exclusiva N1",
  },
  {
    image_url: "/ads/3.png",
    redirect_url: "https://www.pernod-ricard.com",
    alt_text: "Brahma",
  },
  {
    image_url: "/ads/5.png",
    redirect_url: "https://www.pernod-ricard.com/pt/locations/brasil",
    alt_text: "Ballantines",
  },
];

const getRandomMockAd = (): AdPlacement => {
  const randomIndex = Math.floor(Math.random() * MOCK_ADS.length);
  return MOCK_ADS[randomIndex];
};

const getFirstAd = (): AdPlacement => {
  return MOCK_ADS.find(ad => ad.image_url === "/ads/3.png") || MOCK_ADS[2];
};

interface AdBannerProps {
  isFirst?: boolean;
  eventId?: number; // ID do evento para tracking de cliques
}

export default function AdBanner({ isFirst = false, eventId }: AdBannerProps = {}) {
  const [ad, setAd] = useState<AdPlacement | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Função helper para obter identificador do anúncio
  const getAdIdentifier = useCallback((adData: AdPlacement): string => {
    let adIdentifier = adData.image_url;
    if (adIdentifier.startsWith("/ads/")) {
      adIdentifier = adIdentifier.replace("/ads/", "").replace(".png", "");
    } else if (adIdentifier.includes("/")) {
      // Se for URL completa, pega a última parte
      adIdentifier = adIdentifier.split("/").pop() || adIdentifier;
      // Remove extensão se houver
      adIdentifier = adIdentifier.replace(/\.(png|jpg|jpeg|gif)$/i, "");
    }
    return adIdentifier;
  }, []);

  // Função para lidar com o clique
  const handleAdClick = () => {
    if (!ad) return;

    // Abre o link (sempre executa, mesmo se o registro falhar)
    window.open(ad.redirect_url, "_blank");
  };

  useEffect(() => {
    const fetchAd = async () => {
      if (isFirst) {
        setAd(getFirstAd());
        setLoading(false);
        return;
      }

      setAd(getRandomMockAd());
      setLoading(false);
    };

    fetchAd();
  }, [isFirst]);

  // Mantém assinatura do componente sem depender de métricas.
  void eventId;
  void getAdIdentifier;

  if (loading) {
    return (
      <Box sx={{ mx: { xs: 2, md: "auto" }, mt: 2, mb: 2, maxWidth: { xs: "100%", md: "800px", lg: "900px" }, width: { xs: "calc(100% - 32px)", md: "100%" } }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!ad) return null;

  return (
    <Box
      ref={bannerRef}
      sx={{
        mt: 0, mb: 1, mx: { xs: 2, md: "auto" },
        maxWidth: { xs: "100%", md: "800px", lg: "900px" },
        width: { xs: "calc(100% - 32px)", md: "100%" },
        borderRadius: "16px", overflow: "hidden", position: "relative", cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(255, 201, 31, 0.2)" },
      }}
      onClick={handleAdClick}
    >
      <Box sx={{ position: "relative", width: "100%", height: { xs: 100, sm: 250, md: 300 }, backgroundColor: "rgba(0, 0, 0, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!imageError ? (
          <img
            src={ad.image_url}
            alt={ad.alt_text}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 47%" }}
          />
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color: "#fff" }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>Anúncio indisponível</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}