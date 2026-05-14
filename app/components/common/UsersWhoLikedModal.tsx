"use client";

import { useState, useEffect, useRef } from "react";
import {
  Drawer,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { getUsersWhoLiked, UserWhoLiked } from "@/app/services/likes/likeService";
import { getUsersWhoLikedComment, UserWhoLikedComment } from "@/app/services/comments/commentService";
import UserProfileModal from "@/app/components/user/UserProfileModal";

interface UsersWhoLikedModalProps {
  open: boolean;
  onClose: () => void;
  type: "post" | "comment";
  id: number;
  likesCount: number;
  title?: string;
  isTorcida?: boolean;
}

const USERS_PER_PAGE = 10;

export default function UsersWhoLikedModal({
  open,
  onClose,
  type,
  id,
  likesCount,
  title,
  isTorcida,
}: UsersWhoLikedModalProps) {
  const [users, setUsers] = useState<(UserWhoLiked | UserWhoLikedComment)[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId);
    setProfileModalOpen(true);
  };

  const handleProfileModalClose = () => {
    setProfileModalOpen(false);
    setSelectedUserId(null);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    setUsers([]);
    setOffset(0);
    setHasMore(true);
    setSelectedUserId(null);
    setProfileModalOpen(false);
    setLoading(true);

    const fetch = type === "post"
      ? getUsersWhoLiked(id, USERS_PER_PAGE, 0)
      : getUsersWhoLikedComment(id, USERS_PER_PAGE, 0);

    fetch
      .then((data) => {
        setUsers(data);
        setOffset(data.length);
        setHasMore(data.length === USERS_PER_PAGE);
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  }, [open, id, type]);

  useEffect(() => {
    if (!open || !hasMore || loading || loadingMore) return;
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return;
      setLoadingMore(true);
      try {
        const data = type === "post"
          ? await getUsersWhoLiked(id, USERS_PER_PAGE, offset)
          : await getUsersWhoLikedComment(id, USERS_PER_PAGE, offset);
        if (data.length > 0) {
          setUsers((prev) => [...prev, ...data]);
          setOffset((prev) => prev + data.length);
          setHasMore(data.length === USERS_PER_PAGE);
        } else {
          setHasMore(false);
        }
      } catch {
        setHasMore(false);
      } finally {
        setLoadingMore(false);
      }
    }, { threshold: 0.1 });

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [open, hasMore, loading, loadingMore, id, offset, type]);

  const modalTitle = title || `${likesCount} ${likesCount === 1 ? "curtida" : "curtidas"}`;

  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: "20px 20px 0 0",
            bgcolor: isTorcida ? "#0d2244" : "#111",
            maxHeight: "75vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        {/* Handle */}
        <Box sx={{ pt: 1.5, pb: 0.5, display: "flex", justifyContent: "center" }}>
          <Box sx={{ width: 40, height: 4, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 2 }} />
        </Box>

        {/* Header */}
        <Box sx={{
          px: 2.5, py: 1.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FavoriteIcon sx={{ fontSize: 18, color: "#e53935" }} />
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
              {modalTitle}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Lista */}
        <Box sx={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={28} sx={{ color: "rgba(255,255,255,0.25)" }} />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6, gap: 1 }}>
              <FavoriteIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.1)" }} />
              <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
                Nenhuma curtida ainda
              </Typography>
            </Box>
          ) : (
            <>
              {users.map((user) => (
                <Box
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    px: 2.5, py: 1.4,
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    "&:active": { bgcolor: "rgba(255,255,255,0.04)" },
                    transition: "background 0.15s",
                  }}
                >
                  <Avatar
                    src={user.profile_photo || undefined}
                    alt={user.name || "Usuário"}
                    sx={{ width: 44, height: 44, bgcolor: "rgba(255,255,255,0.1)", fontSize: 16 }}
                  >
                    {user.name?.[0]?.toUpperCase() || "?"}
                  </Avatar>
                  <Typography sx={{ color: "#fff", fontWeight: 500, fontSize: 15, flex: 1 }}>
                    {user.name || "Usuário sem nome"}
                  </Typography>
                </Box>
              ))}

              {hasMore && (
                <Box ref={loadMoreRef} sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  {loadingMore && (
                    <CircularProgress size={22} sx={{ color: "rgba(255,255,255,0.25)" }} />
                  )}
                </Box>
              )}

              {!hasMore && users.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2.5 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                    — fim —
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Drawer>

      {selectedUserId !== null && (
        <UserProfileModal
          open={profileModalOpen}
          onClose={handleProfileModalClose}
          userId={selectedUserId}
        />
      )}
    </>
  );
}
