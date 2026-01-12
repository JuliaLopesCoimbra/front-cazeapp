"use client";

import { Box} from "@mui/material";

interface CTVAdProps {
  title?: string;
  description?: string;
}

export default function CTVAd({
 
}: CTVAdProps) {
  return (
      <Box
        sx={{
          mt: 0.3,
          height: 120,
          borderRadius: 1,
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          opacity: 0.6,
          
        }}
      >
        📺 Espaço reservado para CTV Ad (mock)
      </Box>
  
  );
}
