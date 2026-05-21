"use client";

import { Box } from "@mui/material";
import { LOGIN_BG_IMAGE, LOGIN_BG_SIZE } from "@/app/constants/loginTheme";

const { width: BG_W, height: BG_H } = LOGIN_BG_SIZE;

const BG_SRC = encodeURI(LOGIN_BG_IMAGE);

const LOGIN_BG_FILL = "#F6C400";

/**
 * Fundo da login — PNG 9∶19,5. `contain` + dimensões da arte: encaixa em ~390×844 sem cortar.
 */
export default function LoginVideoBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        backgroundColor: LOGIN_BG_FILL,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
      }}
    >
      <Box
        component="img"
        src={BG_SRC}
        alt=""
        decoding="async"
        fetchPriority="high"
        sx={{
          display: "block",
          width: `min(100vw, calc(100dvh * ${BG_W} / ${BG_H}))`,
          height: `min(100dvh, calc(100vw * ${BG_H} / ${BG_W}))`,
          maxWidth: "100%",
          maxHeight: "100dvh",
          objectFit: "contain",
          objectPosition: "center center",
          flexShrink: 0,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.08) 0%,
              rgba(0, 0, 0, 0.03) 45%,
              rgba(0, 0, 0, 0.12) 75%,
              rgba(0, 0, 0, 0.25) 100%
            )
          `,
        }}
      />
    </Box>
  );
}
