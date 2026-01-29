"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getUsersWhoLiked, UserWhoLiked } from "@/app/services/likes/likeService";
import UserProfileModal from "@/app/components/user/UserProfileModal";

interface LikesModalProps {
  open: boolean;
  onClose: () => void;
  newsId: number;
  likesCount: number;
}

const USERS_PER_PAGE = 10;

export default function LikesModal({
  open,
  onClose,
  newsId,
  likesCount,
}: LikesModalProps) {
  const [users, setUsers] = useState<UserWhoLiked[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const handleUserClick = (userId: number) => {
    // Fecha a modal de curtidas primeiro
    onClose();
    // Abre a modal de perfil após um pequeno delay para garantir que a modal de curtidas feche primeiro
    setTimeout(() => {
      setSelectedUserId(userId);
      setProfileModalOpen(true);
    }, 150);
  };

  const loadUsers = useCallback(
    async (reset = false) => {
      if (loading || loadingMore) return;

      const currentOffset = reset ? 0 : offset;
      const isLoadingMore = !reset && currentOffset > 0;

      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const newUsers = await getUsersWhoLiked(
          newsId,
          USERS_PER_PAGE,
          currentOffset
        );

        if (reset) {
          setUsers(newUsers);
          setOffset(newUsers.length);
        } else {
          setUsers((prev) => [...prev, ...newUsers]);
          setOffset((prev) => prev + newUsers.length);
        }

        setHasMore(newUsers.length === USERS_PER_PAGE);
      } catch (error) {
        console.error("Erro ao carregar usuários que curtiram", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [newsId, offset, loading, loadingMore]
  );

  // Carrega usuários quando a modal abre
  useEffect(() => {
    if (open) {
      setUsers([]);
      setOffset(0);
      setHasMore(true);
      // Reset loading states
      setLoading(false);
      setLoadingMore(false);
      // Load initial users
      const loadInitial = async () => {
        setLoading(true);
        try {
          const newUsers = await getUsersWhoLiked(newsId, USERS_PER_PAGE, 0);
          setUsers(newUsers);
          setOffset(newUsers.length);
          setHasMore(newUsers.length === USERS_PER_PAGE);
        } catch (error) {
          console.error("Erro ao carregar usuários que curtiram", error);
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      };
      loadInitial();
    }
  }, [open, newsId]);

  // Configura o Intersection Observer para infinite scroll
  useEffect(() => {
    if (!open || !hasMore || loading || loadingMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const handleIntersection = async (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
        setLoadingMore(true);
        try {
          const newUsers = await getUsersWhoLiked(newsId, USERS_PER_PAGE, offset);
          if (newUsers.length > 0) {
            setUsers((prev) => [...prev, ...newUsers]);
            setOffset((prev) => prev + newUsers.length);
            setHasMore(newUsers.length === USERS_PER_PAGE);
          } else {
            setHasMore(false);
          }
        } catch (error) {
          console.error("Erro ao carregar mais usuários", error);
          setHasMore(false);
        } finally {
          setLoadingMore(false);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [open, hasMore, loading, loadingMore, newsId, offset]);

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#1a1a1a",
          color: "#fff",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          pb: 2,
          fontWeight: 600,
        }}
      >
        {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
        <IconButton
          onClick={onClose}
          sx={{ color: "#fff" }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, maxHeight: "60vh", overflowY: "auto" }}>
        {loading && users.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress sx={{ color: "#ffcc01" }} />
          </Box>
        ) : users.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
              Nenhum usuário encontrado
            </Typography>
          </Box>
        ) : (
          <>
            {users.map((user) => (
              <Box
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <Avatar
                  src={user.profile_photo || undefined}
                  alt={user.name || "Usuário"}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "rgba(255,255,255,0.2)",
                  }}
                >
                  {user.name?.[0]?.toUpperCase() || "?"}
                </Avatar>
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {user.name || "Usuário sem nome"}
                </Typography>
              </Box>
            ))}

            {/* Elemento para detectar quando chegar ao final */}
            {hasMore && (
              <Box
                ref={loadMoreRef}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 2,
                }}
              >
                {loadingMore && (
                  <CircularProgress size={24} sx={{ color: "#ffcc01" }} />
                )}
              </Box>
            )}

            {/* Mensagem quando chegar ao final */}
            {!hasMore && users.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 3,
                }}
              >
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 14,
                  }}
                >
                  Todos os usuários que curtiram esta notícia
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>

    {/* Modal de perfil - renderizada fora do Dialog para evitar sobreposição */}
    {selectedUserId !== null && (
      <UserProfileModal
        open={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
      />
    )}
  </>
  );
}

