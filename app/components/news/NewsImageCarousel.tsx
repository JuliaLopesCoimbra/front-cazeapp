"use client";

import React, { useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { keyframes } from "@emotion/react";
import { NewsImage } from "@/app/services/news/newsService";

const heartPop = keyframes`
  0%   { transform: scale(0) rotate(-15deg); opacity: 1; }
  40%  { transform: scale(1.5) rotate(-5deg); opacity: 1; }
  70%  { transform: scale(1.2) rotate(0deg);  opacity: 1; }
  100% { transform: scale(1.3) rotate(0deg);  opacity: 0; }
`;

interface NewsImageCarouselProps {
  images: NewsImage[];
  alt?: string;
  onDoubleTap?: () => void;
}

export default function NewsImageCarousel({
  images,
  alt = "Imagem",
  onDoubleTap,
}: NewsImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef<number>(0);
  const heartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!images || images.length === 0) return null;

  const sortedImages = [...images].sort((a, b) => a.image_order - b.image_order);

  const handlePrevious = () =>
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));

  const handleNext = () =>
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));

  const handleImageTap = () => {
    const now = Date.now();
    const gap = now - lastTapRef.current;
    lastTapRef.current = now;

    if (gap < 300 && gap > 0) {
      // Double-tap detectado
      if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
      setShowHeart(true);
      onDoubleTap?.();
      heartTimerRef.current = setTimeout(() => setShowHeart(false), 750);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        borderRadius: { xs: 0, sm: 2 },
        overflow: "hidden",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        mb: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          paddingTop: { xs: 0, md: "56.25%" },
          height: { xs: "auto", md: 0 },
          cursor: "pointer",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onClick={handleImageTap}
      >
        <Box
          component="img"
          src={sortedImages[currentIndex]?.image_url}
          alt={`${alt} - Imagem ${currentIndex + 1}`}
          draggable={false}
          sx={{
            position: { xs: "relative", md: "absolute" },
            top: { xs: "auto", md: 0 },
            left: { xs: "auto", md: 0 },
            width: "100%",
            height: { xs: "auto", md: "100%" },
            maxHeight: { xs: "none", md: "100%" },
            objectFit: { xs: "contain", md: "cover" },
            display: "block",
            pointerEvents: "none",
          }}
        />

        {/* Animação do coração */}
        {showHeart && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            <FavoriteIcon
              sx={{
                fontSize: { xs: 90, md: 110 },
                color: "#fff",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
                animation: `${heartPop} 0.75s ease forwards`,
              }}
            />
          </Box>
        )}

        {/* Botões de navegação */}
        {sortedImages.length > 1 && (
          <>
            <IconButton
              onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "#fff",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                zIndex: 10,
              }}
              size="small"
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "#fff",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
                zIndex: 10,
              }}
              size="small"
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>

      {/* Indicadores de página */}
      {sortedImages.length > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            p: 1.5,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          {sortedImages.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: index === currentIndex ? "#ffc91f" : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: index === currentIndex ? "#ffd54f" : "rgba(255,255,255,0.5)",
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
