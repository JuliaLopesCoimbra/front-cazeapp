"use client";

import { Box, Typography } from "@mui/material";

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

      <Typography variant="body2" sx={{ marginTop: 1 }}>
        Em breve teremos novidades por aqui 👀✨
      </Typography>
    </Box>
  );
}
