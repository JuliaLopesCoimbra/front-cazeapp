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
        sx={{
          color: "#0A0A0A",
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          mb: 1,
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#4A4A4A",
          fontFamily: "var(--font-inter), Inter, sans-serif",
          mb: 2,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {content}
      </Typography>
    </Box>
  );
}




