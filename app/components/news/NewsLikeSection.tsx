"use client";

import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import UsersWhoLikedModal from "@/app/components/common/UsersWhoLikedModal";

interface NewsLikeSectionProps {
  likesCount: number;
  userLiked: boolean;
  onLike: () => void;
  disabled?: boolean;
  newsId?: number;
}

export default function NewsLikeSection({
  likesCount,
  userLiked,
  onLike,
  disabled = false,
  newsId,
}: NewsLikeSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleLikesClick = () => {
    if (likesCount > 0 && newsId) {
      setModalOpen(true);
    }
  };

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
          sx={{
            color: "#fff",
            mb: 1.5,
            cursor: newsId ? "pointer" : "default",
            "&:hover": newsId
              ? {
                  opacity: 0.8,
                  textDecoration: "underline",
                }
              : {},
          }}
          onClick={handleLikesClick}
        >
          {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
        </Typography>
      )}

      {newsId && (
        <UsersWhoLikedModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          type="post"
          id={newsId}
          likesCount={likesCount}
        />
      )}
    </>
  );
}




