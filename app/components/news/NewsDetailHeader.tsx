"use client";

import React from "react";
import { Box, Avatar, Typography, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useRouter } from "next/navigation";
import { formatDate } from "@/app/utils/dateUtils";

interface NewsDetailHeaderProps {
  authorName?: string;
  authorPhoto?: string;
  createdAt: string;
  onBack?: () => void;
}

export default function NewsDetailHeader({
  authorName,
  authorPhoto,
  createdAt,
  onBack,
}: NewsDetailHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/pages/user/home");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        position: "sticky",
        top: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(10px)",
        zIndex: 10,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <IconButton
          onClick={handleBack}
          size="small"
          sx={{ color: "#fff" }}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={authorPhoto}
            sx={{ width: 40, height: 40 }}
          >
            {authorName?.[0]?.toUpperCase() || "?"}
          </Avatar>
          <Box>
            <Typography fontWeight={600} fontSize={14}>
              {authorName || "Autor desconhecido"}
            </Typography>
            <Typography fontSize={12} color="rgba(255,255,255,0.6)">
              {formatDate(createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

