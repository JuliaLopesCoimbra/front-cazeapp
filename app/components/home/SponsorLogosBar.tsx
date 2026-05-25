"use client";

import { Box } from "@mui/material";

const SPONSORS = [
  { name: "Coca-Cola",     src: encodeURI("/assets/casa-cazetv/patrocinadores/coca cola.png")     },
  { name: "Mercado Livre", src: encodeURI("/assets/casa-cazetv/patrocinadores/mercado livre.png") },
  { name: "Visa",          src: encodeURI("/assets/casa-cazetv/patrocinadores/visa.png")          },
];

export default function SponsorLogosBar() {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#0A1128",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        py: 1.5,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      {SPONSORS.map((sponsor) => (
        <Box
          key={sponsor.name}
          component="img"
          src={sponsor.src}
          alt={sponsor.name}
          sx={{
            height: 48,
            maxWidth: "28%",
            objectFit: "contain",
            display: "block",
          }}
        />
      ))}
    </Box>
  );
}
