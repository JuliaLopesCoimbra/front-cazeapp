"use client";

import React from "react";
import { Box, Avatar, Typography, IconButton, Paper } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import { CommentResponse } from "@/app/services/comments/commentService";
import { formatDate } from "@/app/utils/dateUtils";

interface ReplyItemProps {
  reply: CommentResponse;
  isAuthenticated: boolean;
  isAdminMaster: boolean;
  isSubadmin: boolean;
  currentUserId?: number;
  onLike: () => void;
  onDelete: () => void;
  liking: boolean;
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
}: ReplyItemProps) {
  const canDelete = isAuthenticated && (isAdminMaster || isSubadmin || reply.user.id === currentUserId);

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
          sx={{ width: 24, height: 24 }}
        >
          {reply.user.name[0]?.toUpperCase()}
        </Avatar>
        <Box flex={1}>
          <Paper
            elevation={0}
            sx={{
              backgroundColor: "rgba(255,255,255,0.03)",
              p: 1,
              borderRadius: 1.5,
            }}
          >
            <Typography
              fontWeight={600}
              fontSize={12}
              sx={{ color: "#fff", mb: 0.3 }}
            >
              {reply.user.name}
            </Typography>
            <Typography
              fontSize={13}
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              {reply.content}
            </Typography>
          </Paper>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.3, ml: 0.5 }}>
            <Typography
              fontSize={10}
              sx={{ color: "rgba(255,255,255,0.4)" }}
            >
              {formatDate(reply.created_at)}
            </Typography>
            <IconButton
              size="small"
              onClick={onLike}
              disabled={!isAuthenticated || liking}
              sx={{
                color: reply.likes.user_liked ? "#ff3040" : "rgba(255,255,255,0.4)",
                padding: "2px",
              }}
            >
              <FavoriteIcon fontSize="small" />
            </IconButton>
            {reply.likes.count > 0 && (
              <Typography
                fontSize={10}
                sx={{ color: "rgba(255,255,255,0.4)" }}
              >
                {reply.likes.count}
              </Typography>
            )}
            {canDelete && (
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  color: "rgba(255,255,255,0.4)",
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
    </Box>
  );
}

