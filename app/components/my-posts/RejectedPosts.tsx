"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { getMyRejectedPosts } from "@/app/services/myPosts/myPostsService";
import { NewsResponse } from "@/app/services/news/newsService";
import { EventResponse } from "@/app/services/events/eventAppService";

const LIMIT = 10;

interface RejectedPostsProps {
  hideTitle?: boolean;
  currentEvent?: EventResponse | null;
}

export default function RejectedPosts({ hideTitle = false, currentEvent }: RejectedPostsProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<NewsResponse[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadPosts = async (reset = false) => {
    if (loading) return;

    setLoading(true);
    const nextOffset = reset ? 0 : offset;
    const eventId = currentEvent?.id;

    try {
      const data = await getMyRejectedPosts(eventId, LIMIT, nextOffset);

      setPosts((prev) => {
        const merged = reset ? data : [...prev, ...data];
        const unique = Array.from(
          new Map(merged.map((item) => [item.id, item])).values()
        );
        return unique;
      });

      setOffset(nextOffset + data.length);

      if (data.length < LIMIT) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Erro ao carregar posts rejeitados", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    setPosts([]);
    loadPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEvent?.id]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadPosts(false);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, offset]);

  if (loading && posts.length === 0) {
    return (
      <Box 
        padding={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: "800px" },
          }}
        >
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, marginBottom: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <Box 
        padding={2} 
        textAlign="center"
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: "800px" },
          }}
        >
          <Typography variant="body1" fontWeight={500} sx={{ color: "#fff", marginBottom: 1, fontSize: "0.9375rem" }}>
            Nenhum post rejeitado
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>
            Você ainda não rejeitou nenhum post.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      padding={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "100%", md: "800px" },
        }}
      >
        {!hideTitle && (
          <Typography
            variant="h6"
            fontWeight={500}
            sx={{ color: "#fff", marginBottom: 2, fontSize: "1rem" }}
          >
            Rejeitados por Mim
          </Typography>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          {posts.map((post, index) => (
            <Box key={post.id}>
              <Card
                onClick={() => {
                  const eventIdParam = post.event_id ? `?eventId=${post.event_id}` : '';
                  router.push(`/pages/news/${post.id}${eventIdParam}`);
                }}
                sx={{
                  display: "flex",
                  gap: 2,
                  backgroundColor: "transparent",
                  boxShadow: "none",
                  color: "#fff",
                  paddingBottom: 1,
                  cursor: "pointer",
                  opacity: 0.6,
                  transition: "opacity 0.2s",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                {post.images && post.images.length > 0 && (
                  <CardMedia
                    component="img"
                    image={post.images[0].image_url}
                    alt={post.title}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 1,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                )}

                <CardContent sx={{ padding: 1, flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography fontWeight={500} sx={{ color: "#fff", fontSize: "0.9375rem", flex: 1 }}>
                      {post.title}
                    </Typography>
                    <Chip
                      label="Rejeitado"
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255, 48, 64, 0.2)",
                        color: "#ff3040",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 20,
                        border: "1px solid rgba(255, 48, 64, 0.3)",
                        "& .MuiChip-label": {
                          padding: "0 8px",
                        },
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.6)", marginTop: 0.5, fontSize: "0.875rem" }}
                  >
                    {new Date(post.created_at).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>
                </CardContent>
              </Card>

              {index !== posts.length - 1 && (
                <Divider
                  sx={{
                    borderColor: "rgba(255,255,255,0.15)",
                    marginTop: 2,
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        {hasMore && (
          <Box
            ref={loaderRef}
            display="flex"
            justifyContent="center"
            padding={2}
          >
            {loading && <CircularProgress size={24} sx={{ color: "#ffcc01" }} />}
          </Box>
        )}
      </Box>
    </Box>
  );
}

