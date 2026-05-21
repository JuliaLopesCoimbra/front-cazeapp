"use client";

import { Box } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";

export interface SponsorBanner {
  id: string;
  image_url: string;
  sponsor_name: string;
  link_url?: string;
}

interface SponsorCarouselProps {
  banners: SponsorBanner[];
  /** Intervalo de auto-play em ms (default 5000). */
  autoPlayInterval?: number;
  /**
   * Quando true, o carrossel ocupa 100vw em desktop (md+), passando por cima
   * da sidebar. Em mobile (xs/sm), permanece full-width do container pai.
   */
  edgeToEdge?: boolean;
}

const BANNER_HEIGHT = 98;

export default function SponsorCarousel({
  banners,
  autoPlayInterval = 5000,
  edgeToEdge = false,
}: SponsorCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, autoPlayInterval);
    return () => window.clearInterval(id);
  }, [banners.length, autoPlayInterval]);

  if (banners.length === 0) return null;

  const current = banners[index];

  const handleClick = () => {
    if (!current?.link_url) return;
    window.open(current.link_url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      aria-label="Carrossel de patrocinadores"
      sx={{
        width: edgeToEdge
          ? { xs: "100%", md: "100vw" }
          : "100%",
        // Em desktop, "sai" do container pai (que tem ml = SIDEBAR_WIDTH_PX)
        // para ocupar a viewport inteira, passando por cima da Sidebar.
        marginLeft: edgeToEdge
          ? { xs: 0, md: `-${SIDEBAR_WIDTH_PX}px` }
          : 0,
        position: "relative",
        // Sidebar é z-index 1200; banner precisa ficar acima quando edgeToEdge.
        zIndex: edgeToEdge ? { xs: "auto", md: 1300 } : "auto",
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: `${BANNER_HEIGHT}px`,
          overflow: "hidden",
          cursor: current?.link_url ? "pointer" : "default",
        }}
        onClick={handleClick}
        role={current?.link_url ? "link" : undefined}
        aria-label={current?.link_url ? `Patrocinador ${current.sponsor_name}` : undefined}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={current.image_url}
              alt={`Patrocinador ${current.sponsor_name}`}
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Dots de paginação */}
      {banners.length > 1 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
            alignItems: "center",
            py: 1,
            backgroundColor: "#000000",
            width: "100%",
          }}
        >
          {banners.map((banner, i) => {
            const dotActive = i === index;
            return (
              <Box
                key={banner.id}
                component="button"
                type="button"
                aria-label={`Ir para banner ${i + 1}`}
                onClick={() => setIndex(i)}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: dotActive ? "#009440" : "rgba(255,255,255,0.3)",
                  transition: "background-color 0.2s ease",
                  padding: 0,
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/**
 * Mock para desenvolvimento. Substituir por consumo da API quando endpoint estiver pronto.
 */
export function getMockSponsors(): SponsorBanner[] {
  return [
    {
      id: "sponsor-coca-cola",
      image_url: "/assets/figma/sponsor-banner.png",
      sponsor_name: "Coca-Cola Zero",
      link_url: "https://www.coca-cola.com.br",
    },
    {
      id: "sponsor-placeholder-2",
      image_url: "/assets/figma/sponsor-banner.png",
      sponsor_name: "Patrocinador 2",
    },
    {
      id: "sponsor-placeholder-3",
      image_url: "/assets/figma/sponsor-banner.png",
      sponsor_name: "Patrocinador 3",
    },
  ];
}
