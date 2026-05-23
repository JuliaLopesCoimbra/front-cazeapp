"use client";

import React, { useState } from "react";
import { Box, Avatar, Typography, IconButton, Paper } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import { CommentResponse } from "@/app/services/comments/commentService";
import { formatDate } from "@/app/utils/dateUtils";
import UserProfileModal from "@/app/components/user/UserProfileModal";
import UsersWhoLikedModal from "@/app/components/common/UsersWhoLikedModal";

interface ReplyItemProps {
  reply: CommentResponse;
  isAuthenticated: boolean;
  isAdminMaster: boolean;
  isSubadmin: boolean;
  currentUserId?: number;
  onLike: () => void;
  onDelete: () => void;
  liking: boolean;
  isTorcida?: boolean;
}

export default function ReplyItem({
  reply,
  isAuthenticated,
  isAdminMaster,
  isSubadmin,
  currentUserId,
  onLike,
  onDelete,
  liking,
  isTorcida,
}: ReplyItemProps) {
  const canDelete = isAuthenticated && (isAdminMaster || isSubadmin || reply.user.id === currentUserId);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [likesModalOpen, setLikesModalOpen] = useState(false);

  const handleUserClick = () => {
    setProfileModalOpen(true);
  };

  const handleLikesClick = () => {
    if (reply.likes.count > 0) {
      setLikesModalOpen(true);
    }
  };

  return (
    <Box 
      id={`comment-${reply.id}`}
      sx={{ 
        mb: 1.5,
        scrollMarginTop: "100px",
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <Avatar
          src={reply.user.profile_photo}
          onClick={handleUserClick}
          sx={{
            width: 24,
            height: 24,
            cursor: "pointer",
            transition: "opacity 0.2s",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          {reply.user.name[0]?.toUpperCase()}
        </Avatar>
        <Box flex={1}>
          <Paper
            elevation={0}
            sx={{
              backgroundColor: "rgba(0,0,0,0.02)",
              p: 1,
              borderRadius: 1.5,
            }}
          >
            <Typography
              fontWeight={700}
              fontSize={12}
              onClick={handleUserClick}
              sx={{ color: "#0A0A0A", mb: 0.3, cursor: "pointer", "&:hover": { opacity: 0.7 } }}
            >
              {reply.user.name}
            </Typography>
            <Typography
              fontSize={13}
              sx={{
                color: "#4A4A4A",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {reply.content}
            </Typography>
          </Paper>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3, ml: 0.5 }}>
            <Typography fontSize={10} sx={{ color: "#9E9E9E" }}>
              {formatDate(reply.created_at)}
            </Typography>
            <IconButton
              size="small"
              onClick={onLike}
              disabled={!isAuthenticated || liking}
              sx={{ color: reply.likes.user_liked ? "#E63946" : "#9E9E9E", padding: "2px" }}
            >
              <FavoriteIcon fontSize="small" />
            </IconButton>
            {reply.likes.count > 0 && (
              <Typography
                fontSize={10}
                onClick={handleLikesClick}
                sx={{
                  color: "#9E9E9E",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                  "&:hover": {
                    opacity: 0.8,
                    textDecoration: "underline",
                  },
                }}
              >
                {reply.likes.count}
              </Typography>
            )}
            {canDelete && (
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  color: "#9E9E9E",
                  padding: "2px",
                  ml: 0.5,
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>

      <UserProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={reply.user.id}
      />

      {/* Modal de usuários que curtiram a resposta */}
      <UsersWhoLikedModal
        open={likesModalOpen}
        onClose={() => setLikesModalOpen(false)}
        type="comment"
        id={reply.id}
        likesCount={reply.likes.count}
        isTorcida={isTorcida}
      />
    </Box>
  );
}

