"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import { getEventNews, NewsResponse } from "@/app/services/news/newsService";

interface Props {
  eventId: number;
}

export default function NewsFeed({ eventId }: Props) {
  const [news, setNews] = useState<NewsResponse[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 10;

  const loadNews = async (reset = false) => {
    if (loading) return;

    setLoading(true);

    const nextOffset = reset ? 0 : offset;

    try {
      const data = await getEventNews(eventId, LIMIT, nextOffset);

      setNews((prev) => (reset ? data : [...prev, ...data]));
      setOffset(nextOffset + data.length);

      if (data.length < LIMIT) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Erro ao carregar notícias", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    setHasMore(true);
    loadNews(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  if (news.length === 0 && loading) {
    return <Typography padding={2}>Carregando notícias...</Typography>;
  }

  const [featured, ...others] = news;

  return (
    <Box padding={2}>
      {/* 🔥 NOTÍCIA PRINCIPAL */}
      {featured && (
        <Card sx={{ marginBottom: 3 }}>
          {featured.image_url && (
            <CardMedia
              component="img"
              height="240"
              image={featured.image_url}
              alt={featured.title}
            />
          )}
          <CardContent>
            <Typography variant="h6" fontWeight={700}>
              {featured.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" marginTop={1}>
              {new Date(featured.created_at).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 🔹 OUTRAS NOTÍCIAS */}
      <Box display="flex" gap={2} flexWrap="wrap">
        {others.map((item) => (
          <Card key={item.id} sx={{ width: 160 }}>
            {item.image_url && (
              <CardMedia
                component="img"
                height="100"
                image={item.image_url}
                alt={item.title}
              />
            )}
            <CardContent sx={{ padding: 1 }}>
              <Typography fontSize={13} fontWeight={600}>
                {item.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* 🔽 PAGINAÇÃO */}
      {hasMore && (
        <Box textAlign="center" marginTop={3}>
          <Button
            variant="outlined"
            onClick={() => loadNews(false)}
            disabled={loading}
          >
            {loading ? "Carregando..." : "Carregar mais"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
