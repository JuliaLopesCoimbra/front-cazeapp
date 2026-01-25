"use client";

import React from "react";
import { Box, Typography } from "@mui/material";

interface NewsContentProps {
  title: string;
  content: string;
}

export default function NewsContent({ title, content }: NewsContentProps) {
  return (
    <Box
      sx={{
        p: 2,
        maxWidth: { xs: "100%", sm: "600px", md: "700px" },
        margin: "0 auto",
        width: "100%",
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        sx={{ color: "#fff", mb: 1 }}
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: "rgba(255,255,255,0.9)", mb: 2, whiteSpace: "pre-wrap" }}
      >
        {content}
      </Typography>
    </Box>
  );
}


