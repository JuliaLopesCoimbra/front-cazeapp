"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { getMyPosts } from "@/app/services/myPosts/myPostsService";
import { NewsResponse } from "@/app/services/news/newsService";

const LIMIT = 10;

export default function MyPosts() {
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

    try {
      const data = await getMyPosts(LIMIT, nextOffset);

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
      console.error("Erro ao carregar meus posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // infinite scroll
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

  const handlePostClick = (newsId: number) => {
    router.push(`/pages/news/${newsId}`);
  };

  if (loading && posts.length === 0) {
    return (
      <Box padding={2}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2, marginBottom: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <Box padding={2} textAlign="center">
        <Typography variant="h6" sx={{ color: "#fff", marginBottom: 1 }}>
          Nenhum post encontrado
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
          Você ainda não postou nenhuma notícia.
        </Typography>
      </Box>
    );
  }

  return (
    <Box padding={2}>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ color: "#fff", marginBottom: 2 }}
      >
        Meus Posts
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        {posts.map((post, index) => (
          <Box key={post.id}>
            <Card
              onClick={() => handlePostClick(post.id)}
              sx={{
                display: "flex",
                gap: 2,
                backgroundColor: "transparent",
                boxShadow: "none",
                color: "#fff",
                paddingBottom: 1,
                cursor: "pointer",
                transition: "opacity 0.2s",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              {post.image_url && (
                <CardMedia
                  component="img"
                  image={post.image_url}
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
                <Typography fontWeight={600} sx={{ color: "#fff" }}>
                  {post.title}
                </Typography>

                <Typography
                  fontSize={12}
                  sx={{ color: "rgba(255,255,255,0.6)", marginTop: 0.5 }}
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
  );
}

