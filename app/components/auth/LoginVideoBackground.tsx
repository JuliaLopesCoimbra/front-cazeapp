"use client";

import { Box, Typography } from "@mui/material";
import Image from "next/image";

const BG_COLOR  = "#e7e1d1";
const TEXT_COLOR = "#7a4e28"; // warm brown — matches the original image tone

const PERSONA_FILTER = "drop-shadow(0 8px 28px rgba(0,0,0,0.22))";
const PERSONA_SX = {
  position: "absolute",
  pointerEvents: "none",
  userSelect: "none",
  display: "block",
  filter: PERSONA_FILTER,
} as const;

const PERSONA_1_SRC = encodeURI("/assets/casa-cazetv/personas/magnific_3G5aBK8REY (1).svg");
const PERSONA_2_SRC = encodeURI("/assets/casa-cazetv/personas/magnific_KjDG6sVkqp (2).svg");
const PERSONA_3_SRC = "/assets/casa-cazetv/personas/magnific_cDg5E8I0eP.png";

export default function LoginVideoBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        backgroundColor: BG_COLOR,
        minHeight: "100dvh",
      }}
    >
      {/* ── Headline text ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 28, sm: 44 },
          left: { xs: 22, sm: 36 },
          zIndex: 2,
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        {["A EMOÇÃO", "DO BRASIL", "É SUA!"].map((line) => (
          <Typography
            key={line}
            component="span"
            sx={{
              display: "block",
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: { xs: "clamp(38px, 11vw, 70px)", sm: "68px" },
              fontWeight: 400,
              color: TEXT_COLOR,
              lineHeight: 0.95,
              letterSpacing: "0.01em",
              opacity: 0.5,
            }}
          >
            {line}
          </Typography>
        ))}
      </Box>

      {/* ── CazéTV logo — top right ────────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 28, sm: 40 },
          right: { xs: 20, sm: 32 },
          zIndex: 3,
          pointerEvents: "none",
          lineHeight: 0,
        }}
      >
        <Image
          src="/assets/casa-cazetv/logo-circle.png"
          alt="Casa CazéTV"
          width={54}
          height={54}
          priority
          style={{ borderRadius: "50%", display: "block" }}
        />
      </Box>

      {/* ── "BATE NO PEITO" badge — bottom center ─────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 56, sm: 72 },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          pointerEvents: "none",
          width:  { xs: 92, sm: 104 },
          height: { xs: 92, sm: 104 },
          borderRadius: "50%",
          backgroundColor: "#0A1128",
          border: "2.5px solid rgba(255,255,255,0.14)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.28)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        <Typography sx={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: { xs: "9px", sm: "10px" },
          color: "#FFD100",
          letterSpacing: "0.18em",
          lineHeight: 1.2,
        }}>
          ★ ★ ★
        </Typography>
        <Typography sx={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: { xs: "17px", sm: "19px" },
          color: "#FFFFFF",
          letterSpacing: "0.05em",
          lineHeight: 1.05,
        }}>
          BATE
        </Typography>
        <Typography sx={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: { xs: "11px", sm: "12px" },
          color: "rgba(255,255,255,0.72)",
          letterSpacing: "0.12em",
          lineHeight: 1.05,
        }}>
          NO
        </Typography>
        <Typography sx={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: { xs: "17px", sm: "19px" },
          color: "#FFFFFF",
          letterSpacing: "0.05em",
          lineHeight: 1.05,
        }}>
          PEITO
        </Typography>
        <Typography sx={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: { xs: "9px", sm: "10px" },
          color: "#FFD100",
          letterSpacing: "0.18em",
          lineHeight: 1.2,
        }}>
          ★ ★ ★
        </Typography>
      </Box>

      {/* ── Persona 1 (SVG) — right side, faces inward ────────────────── */}
      <Box
        component="img"
        src={PERSONA_1_SRC}
        alt=""
        decoding="async"
        sx={{
          ...PERSONA_SX,
          width: { xs: "155px", sm: "230px", md: "265px" },
          top:   { xs: "auto", sm: "50%", md: "50%" },
          bottom:{ xs: "80px", sm: "auto" },
          right: { xs: "-28px", sm: "-42px", md: "-50px" },
          left:  "auto",
          transform: {
            xs: "scaleX(-1)",
            sm: "translateY(-50%) scaleX(-1)",
            md: "translateY(-50%) scaleX(-1)",
          },
          opacity: { xs: 0.82, sm: 0.92, md: 1 },
        }}
      />

      {/* ── Persona 2 (SVG) — left side, faces inward ─────────────────── */}
      <Box
        component="img"
        src={PERSONA_2_SRC}
        alt=""
        decoding="async"
        sx={{
          ...PERSONA_SX,
          width: { xs: "0px", sm: "215px", md: "250px" },
          top:   { xs: "auto", sm: "50%", md: "50%" },
          left:  { xs: "auto", sm: "-42px", md: "-48px" },
          right: "auto",
          transform: {
            xs: "none",
            sm: "translateY(-50%)",
            md: "translateY(-50%)",
          },
          opacity:    { xs: 0, sm: 0.88, md: 1 },
          visibility: { xs: "hidden", sm: "visible" },
        }}
      />

      {/* ── Persona 3 (PNG) — bottom area ─────────────────────────────── */}
      <Box
        component="img"
        src={PERSONA_3_SRC}
        alt=""
        decoding="async"
        sx={{
          ...PERSONA_SX,
          width:  { xs: "164px", sm: "230px", md: "268px" },
          bottom: { xs: "-18px", sm: "-26px", md: "-30px" },
          top:    "auto",
          left:   { xs: "-14px", sm: "auto" },
          right:  { xs: "auto", sm: "10%",   md: "13%" },
          opacity:{ xs: 0.85, sm: 0.92, md: 1 },
        }}
      />

      {/* ── Vignette overlay — subtle depth ────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.06) 100%)",
        }}
      />
    </Box>
  );
}
