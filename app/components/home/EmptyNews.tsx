"use client";

import { Box, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function EmptyNews() {
  return (
    <Box
      sx={{
        padding: 4,
        textAlign: "center",
        color: "white",
      }}
    >
      <Typography variant="h6" fontWeight={600}>
        Esse evento ainda não tem postagens
      </Typography>

      <Typography variant="body2" sx={{ marginTop: 1, display: "inline-flex", alignItems: "center", gap: 0.75 }}>
        <InfoOutlinedIcon sx={{ fontSize: 18 }} />
        Em breve teremos novidades por aqui
      </Typography>
    </Box>
  );
}
