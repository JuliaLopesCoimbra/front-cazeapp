"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { LOGIN_BG_VIDEO } from "@/app/constants/loginTheme";

export default function LoginVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.play().catch(() => {
        /* autoplay blocked — poster/overlay still visible */
      });
    };

    play();
    video.addEventListener("loadeddata", play);
    return () => video.removeEventListener("loadeddata", play);
  }, []);

  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        backgroundColor: "#000000",
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center center",
          "@media (prefers-reduced-motion: reduce)": {
            display: "none",
          },
        }}
      >
        <source src={LOGIN_BG_VIDEO} type="video/mp4" />
      </Box>

      {/* Overlay — legibilidade do formulário + cores discretas Brasil / Cazé */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.35) 0%,
              rgba(0, 0, 0, 0.25) 40%,
              rgba(0, 0, 0, 0.4) 70%,
              rgba(0, 0, 0, 0.65) 100%
            )
          `,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 80% 50% at 15% 40%, rgba(0, 148, 64, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 70% 45% at 88% 25%, rgba(255, 203, 0, 0.1) 0%, transparent 72%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0, 85, 184, 0.08) 0%, transparent 65%)
          `,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          boxShadow: "inset 0 0 120px rgba(0, 0, 0, 0.65)",
        }}
      />

      {/* Fallback estático quando movimento reduzido */}
      <Box
        sx={{
          display: "none",
          position: "absolute",
          inset: 0,
          backgroundColor: "#000000",
          backgroundImage: "url(/background/fundo-copa.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          "@media (prefers-reduced-motion: reduce)": {
            display: "block",
          },
        }}
      />
    </Box>
  );
}
