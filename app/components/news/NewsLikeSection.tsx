"use client";

import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

interface NewsLikeSectionProps {
  likesCount: number;
  userLiked: boolean;
  onLike: () => void;
  disabled?: boolean;
}

export default function NewsLikeSection({
  likesCount,
  userLiked,
  onLike,
  disabled = false,
}: NewsLikeSectionProps) {
  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
        <IconButton
          onClick={onLike}
          disabled={disabled}
          sx={{ color: userLiked ? "#ff3040" : "#fff" }}
        >
          {userLiked ? (
            <FavoriteIcon />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
        <IconButton sx={{ color: "#fff" }}>
          <ChatBubbleOutlineIcon />
        </IconButton>
      </Box>

      {likesCount > 0 && (
        <Typography
          fontWeight={600}
          fontSize={14}
          sx={{ color: "#fff", mb: 1.5 }}
        >
          {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
        </Typography>
      )}
    </>
  );
}




