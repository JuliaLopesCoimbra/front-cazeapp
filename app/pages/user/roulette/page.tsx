"use client";

import { Box, Typography, Button } from "@mui/material";
import { useState } from "react";

export default function Roulette() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);

    // gira entre 5 e 8 voltas
    const randomRotation = 360 * (5 + Math.floor(Math.random() * 3));
    setRotation((prev) => prev + randomRotation);

    setTimeout(() => {
      setSpinning(false);
    }, 4000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        paddingBottom: "72px",
        backgroundColor: "#f4f7fc",
        backgroundImage: "url(/background/dashboard.png)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      {/* TEXTOS */}
      <Typography variant="h5" fontWeight={700} mb={1}>
        Você desbloqueou um giro na roleta!
      </Typography>

      <Typography variant="h6" fontWeight={500} mb={4}>
        Cada compra aumenta suas chances de conquistar prêmios ainda melhores.
      </Typography>

      {/* CONTAINER DA ROLETA */}
      <Box
        sx={{
          position: "relative",
          width: 260,
          height: 260,
          mb: 3,
        }}
      >
        {/* PONTEIRO */}
        <Box
          component="img"
          src="/components/roulette-items/ponteiro.png"
          alt="Ponteiro"
          sx={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 40,
            zIndex: 2,
          }}
        />

        {/* ROLETA */}
        <Box
          component="img"
          src="/components/roulette-items/roleta.png"
          alt="Roleta"
          sx={{
            width: "100%",
            height: "100%",
            transition: "transform 4s cubic-bezier(0.17, 0.67, 0.83, 0.67)",
            transform: `rotate(${rotation}deg)`,
          }}
        />
      </Box>

      {/* BOTÃO */}
      <Button
        variant="contained"
        size="large"
        onClick={handleSpin}
        disabled={spinning}
        sx={{
          borderRadius: "20px",
          px: 4,
          py: 1.5,
          fontWeight: 700,
          textTransform: "none",
        }}
      >
        {spinning ? "Girando..." : "Girar roleta"}
      </Button>
    </Box>
  );
}
