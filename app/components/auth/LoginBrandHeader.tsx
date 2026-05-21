"use client";

import { Box } from "@mui/material";
import Image from "next/image";
import { motion } from "framer-motion";
import BrazilDivider from "@/app/components/layout/BrazilDivider";

const MASCOT_SRC = "/assets/figma/mascot-center.png";
const MASCOT_WIDTH = 89;
const MASCOT_HEIGHT = 50;

/**
 * Mascote sobre a linha Brasil — acima do painel de login, fundo transparente (vídeo visível).
 */
export default function LoginBrandHeader() {
  return (
    <Box
      component={motion.div}
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      sx={{
        width: "100%",
        flexShrink: 0,
        backgroundColor: "transparent",
        mb: { xs: 0.5, md: 1 },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 28,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            transform: "translate(-50%, 50%)",
            zIndex: 3,
            lineHeight: 0,
          }}
        >
          <Image
            src={MASCOT_SRC}
            alt="Mascote Casa CazéTV"
            width={MASCOT_WIDTH}
            height={MASCOT_HEIGHT}
            priority
            style={{ objectFit: "contain", display: "block" }}
          />
        </Box>
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
          }}
        >
          <BrazilDivider />
        </Box>
      </Box>
    </Box>
  );
}
