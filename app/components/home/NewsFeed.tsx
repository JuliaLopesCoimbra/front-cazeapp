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
  Avatar,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PostGlassCard from "@/app/components/feed/PostGlassCard";
import CopaStoryPostCard from "@/app/components/feed/CopaStoryPostCard";
import { motion } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { useFeedCache } from "@/app/context/FeedCacheContext";
import { getEventNews, NewsResponse } from "@/app/services/news/newsService";
import { EventResponse } from "@/app/services/events/eventAppService";
import EmptyNews from "./EmptyNews";
import { useRouter } from "next/navigation";
import AdBanner from "../ads/AdBanner";
import { getEventBrandKey } from "@/app/utils/eventBranding";

interface Props {
  eventId: number;
  event?: EventResponse;
}

const LIMIT = 5;

// Função para formatar data relativa ou extensa
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Se for menos de 24 horas, mostra relativo
  if (diffHours < 24) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) {
      return "há menos de 1 minuto";
    } else if (diffMinutes < 60) {
      return `há ${diffMinutes} ${diffMinutes === 1 ? "minuto" : "minutos"} atrás`;
    } else {
      const hours = Math.floor(diffHours);
      return `há ${hours} ${hours === 1 ? "hora" : "horas"} atrás`;
    }
  }

  // Se for mais de 24 horas, mostra data extensa
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsFeed({ eventId, event }: Props) {
  const { authVersion } = useAuth();
  const router = useRouter();

  const { getCache, setCache } = useFeedCache();
  const cacheKey = `feed-event-${eventId}`;
  const [initialized, setInitialized] = useState(false);

  const [news, setNews] = useState<NewsResponse[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const isTorcida = getEventBrandKey(event) === "n1_torcida";
  const isWorldCup = event?.event_type === "world_cup";

  const loadNews = async (reset = false) => {
    if (loading) return;

    setLoading(true);

    const nextOffset = reset ? 0 : offset;

    try {
      const data = await getEventNews(eventId, LIMIT, nextOffset);

      setNews((prev) => {
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
      console.error("Erro ao carregar notícias", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized) {
      setNews([]);
      setOffset(0);
      setHasMore(true);
      setInitialized(false);
      return;
    }

    const cached = getCache(cacheKey);
    
    if (cached && cached.data.length > 0) {
      setNews(cached.data);
      setOffset(cached.data.length);
      setHasMore(cached.data.length >= LIMIT);
      setInitialized(true);
      
      const targetPosition = cached.scrollPosition;
      
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      
      // Flag para prevenir restauração se o usuário já fez scroll
      let userScrolled = false;
      let restoreCompleted = false;
      const timeouts: NodeJS.Timeout[] = [];
      
      // Detecta se o usuário fez scroll manualmente
      const handleUserScroll = () => {
        if (!restoreCompleted) {
          userScrolled = true;
        }
      };
      
      // Adiciona listener temporário para detectar scroll do usuário
      window.addEventListener('scroll', handleUserScroll, { passive: true, once: false });
      
      let attempts = 0;
      const maxAttempts = 10; // Reduzido de 20 para 10
      
      const attemptRestore = () => {
        if (userScrolled || restoreCompleted) return;
        
        attempts++;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'instant' as ScrollBehavior
        });
        
        const currentScroll = window.scrollY;
        const diff = Math.abs(currentScroll - targetPosition);
        
        if (diff < 10) {
          restoreCompleted = true;
          window.removeEventListener('scroll', handleUserScroll);
        } else if (attempts < maxAttempts && !userScrolled) {
          requestAnimationFrame(attemptRestore);
        } else {
          restoreCompleted = true;
          window.removeEventListener('scroll', handleUserScroll);
        }
      };
      
      // Aguarda um pouco antes de começar a restaurar
      const initialTimeout = setTimeout(() => {
        if (!userScrolled) {
          requestAnimationFrame(attemptRestore);
        }
      }, 100);
      timeouts.push(initialTimeout);
      
      // Reduzido para apenas alguns delays essenciais
      [200, 500].forEach(delay => {
        const timeout = setTimeout(() => {
          if (!userScrolled && !restoreCompleted) {
            window.scrollTo({
              top: targetPosition,
              behavior: 'instant' as ScrollBehavior
            });
            restoreCompleted = true;
            window.removeEventListener('scroll', handleUserScroll);
          }
        }, delay);
        timeouts.push(timeout);
      });
      
      (async () => {
        try {
          const limit = cached.data.length + (LIMIT * 3);
          const freshData = await getEventNews(eventId, limit, 0);
          
          const cachedIds = cached.data.map((n: NewsResponse) => n.id).sort().join(',');
          const freshIds = freshData.map((n: NewsResponse) => n.id).sort().join(',');
          
          if (cachedIds !== freshIds || cached.data.length !== freshData.length) {
            setNews(freshData);
            setOffset(freshData.length);
            setHasMore(freshData.length >= limit);
            const shouldResetScroll = freshData.length > cached.data.length;
            const currentScroll = window.scrollY;
            // Só reseta scroll se o usuário estiver no topo ou muito próximo
            const shouldReset = shouldResetScroll && currentScroll < 100;
            setCache(cacheKey, freshData, shouldReset ? 0 : currentScroll);
            
            if (shouldReset) {
              setTimeout(() => {
                // Só faz scroll para o topo se o usuário não estiver fazendo scroll
                if (window.scrollY < 100) {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }
              }, 500);
            }
          }
        } catch (err) {
          console.error('Erro ao revalidar cache:', err);
        }
      })();
      
      // Cleanup: remove listeners e cancela timeouts
      return () => {
        window.removeEventListener('scroll', handleUserScroll);
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    } else {
      setNews([]);
      setOffset(0);
      setHasMore(true);
      loadNews(true);
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const lastScrollPositionRef = useRef(0);
  
  useEffect(() => {
    let throttleTimeout: NodeJS.Timeout | null = null;
    const THROTTLE_MS = 400;
    
    const updateScrollPosition = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      lastScrollPositionRef.current = currentScroll;
      
      if (throttleTimeout) clearTimeout(throttleTimeout);
      
      throttleTimeout = setTimeout(() => {
        if (news.length > 0) {
          setCache(cacheKey, news, currentScroll);
        }
      }, THROTTLE_MS);
    };
    
    const handleScroll = () => {
      updateScrollPosition();
    };
    
    const handlePageHide = () => {
      if (news.length > 0) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, news, finalScroll);
      }
    };
    
    const handleBeforeUnload = () => {
      if (news.length > 0) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, news, finalScroll);
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden && news.length > 0) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, news, finalScroll);
      }
    };
    
    const handleBlur = () => {
      if (news.length > 0) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, news, finalScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      if (throttleTimeout) clearTimeout(throttleTimeout);
      
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      
      if (news.length > 0) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, news, finalScroll);
      }
    };
  }, [news, cacheKey, setCache]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNews(false);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, offset]);

  const [featured, ...others] = news; // mantido para compatibilidade mas não usado para diferenciar layout

  const handleNewsClick = (newsId: number) => {
    router.push(`/pages/news/${newsId}?eventId=${eventId}`);
  };

  const handleUpdate = () => {
    loadNews(true);
  };

  return (
    <Box
      key={authVersion}
      sx={{
        maxWidth: { xs: "100%", md: "800px", lg: "900px" },
        margin: { xs: 0, md: "0 auto" },
        width: "100%",
        pt: 0,
        pb: 2,
      }}
    >
      {loading && news.length === 0 && <FeaturedNewsSkeleton isTorcida={isTorcida} />}

      {!loading && news.length === 0 && <EmptyNews />}

      {news.length > 0 && (
        <Box display="flex" flexDirection="column" sx={{ gap: "12px" }}>
          {news.map((item, index) => (
            <Box key={item.id}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {isWorldCup ? (
                  <CopaStoryPostCard
                    newsId={item.id}
                    authorName={item.author?.name || "@casacazetv"}
                    authorPhoto={item.author?.profile_photo}
                    caption={item.title}
                    body={item.content}
                    createdAtLabel={formatDate(item.created_at)}
                    likesCount={item.likes_count ?? 0}
                    commentsCount={item.comments_count ?? 0}
                    onClick={() => handleNewsClick(item.id)}
                    postArtUrl={
                      item.images && item.images.length > 0
                        ? item.images[0].image_url
                        : undefined
                    }
                  />
                ) : (
                <Card
                  onClick={() => handleNewsClick(item.id)}
                  sx={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    color: "#fff",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    "&:hover": { opacity: 0.85 },
                  }}
                >
                  {/* Header: avatar + @nome + menu (Liquid Glass com borda gradiente Brasil) */}
                  <PostGlassCard className="mx-[14px] mt-2" border="green">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: 1.75,
                        py: 1,
                      }}
                    >
                      <Avatar
                        src={item.author?.profile_photo || undefined}
                        alt={item.author?.name || "Autor"}
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: "rgba(255,255,255,0.2)",
                          border: "2px solid #009440",
                        }}
                      />
                      <Typography
                        sx={{
                          color: "#fff",
                          fontFamily: '"Montserrat", sans-serif',
                          fontWeight: 800,
                          fontSize: 12,
                          letterSpacing: 0.2,
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.author?.name || "@casacazetv"}
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.55)",
                          fontSize: 10,
                          fontFamily: '"Roboto", sans-serif',
                          flexShrink: 0,
                          mr: 0.5,
                        }}
                      >
                        {formatDate(item.created_at)}
                      </Typography>
                      <MoreHorizIcon sx={{ color: "#fff", fontSize: 18, opacity: 0.85 }} />
                    </Box>
                  </PostGlassCard>

                  {item.images && item.images.length > 0 ? (
                    <Box sx={{ position: "relative", mt: 1.5, mx: 1 }}>
                      <CardMedia
                        component="img"
                        image={item.images[0].image_url}
                        alt={item.title}
                        sx={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          objectFit: "cover",
                          borderRadius: "15px",
                          border: "1px solid rgba(0,148,64,0.4)",
                        }}
                      />

                      {/* Likes e comentários — overlay lado direito */}
                      <Box
                        sx={{
                          position: "absolute",
                          right: 12,
                          bottom: 16,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1.5,
                          zIndex: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.3 }}>
                          <FavoriteBorderIcon
                            sx={{ fontSize: 26, color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.8))" }}
                          />
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#fff",
                              fontWeight: 700,
                              lineHeight: 1,
                              textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                            }}
                          >
                            {item.likes_count ?? 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.3 }}>
                          <ChatBubbleOutlineIcon
                            sx={{ fontSize: 24, color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.8))" }}
                          />
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#fff",
                              fontWeight: 700,
                              lineHeight: 1,
                              textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                            }}
                          >
                            {item.comments_count ?? 0}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Caption overlay com título — Liquid Glass + borda gradiente Brasil */}
                      <PostGlassCard className="absolute bottom-3 left-3 max-w-[68%]" blurPx={8}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            px: 1.5,
                            py: 1.25,
                          }}
                        >
                          <Avatar
                            src={item.author?.profile_photo || undefined}
                            alt=""
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "rgba(255,255,255,0.2)",
                              border: "2px solid #009440",
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            sx={{
                              color: "#fff",
                              fontFamily: '"Montserrat", sans-serif',
                              fontWeight: 800,
                              fontSize: 12,
                              lineHeight: 1.3,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                            }}
                          >
                            {item.title}
                          </Typography>
                        </Box>
                      </PostGlassCard>
                    </Box>
                  ) : (
                    /* Sem imagem: título em card glass standalone */
                    <PostGlassCard className="mx-2 mt-2 mb-2">
                      <Box sx={{ px: 2, py: 2 }}>
                        <Typography
                          sx={{
                            color: "#fff",
                            fontFamily: '"Montserrat", sans-serif',
                            fontWeight: 800,
                            fontSize: { xs: "1rem", md: "1.15rem" },
                            lineHeight: 1.35,
                            wordWrap: "break-word",
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Box>
                    </PostGlassCard>
                  )}
                </Card>
                )}
              </motion.div>

              {/* Ad a cada 3 posts */}
              {(index + 1) % 3 === 0 && index !== news.length - 1 && (
                <>
                  <Box
                    sx={{
                      "& > div": {
                        mx: "0 !important",
                        maxWidth: "100% !important",
                        width: "100% !important",
                      },
                    }}
                  >
                    <AdBanner eventId={eventId} />
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", marginY: 1.5 }} />
                </>
              )}
            </Box>
          ))}

          {loading &&
            Array.from({ length: 2 }).map((_, i) => (
              <FeaturedNewsSkeleton key={i} isTorcida={isTorcida} />
            ))}
        </Box>
      )}

      {hasMore && <div ref={loaderRef} />}
    </Box>
  );
}

function FeaturedNewsSkeleton({ isTorcida }: { isTorcida: boolean }) {
  const cardBg = isTorcida ? "#123b6b" : "#0f0f0f";
  const skeletonBg = isTorcida ? "#2f5f96" : "#2a2a2a";
  return (
    <Card
      sx={{
        marginBottom: 3,
        backgroundColor: cardBg,
        borderRadius: 2,
      }}
    >
      <Skeleton
        variant="rectangular"
        sx={{
          width: "100%",
          aspectRatio: "1 / 1",
          bgcolor: skeletonBg,
        }}
      />

      <CardContent>
        <Skeleton height={28} width="80%" sx={{ bgcolor: skeletonBg }} />

        <Skeleton
          height={18}
          width="40%"
          sx={{ bgcolor: skeletonBg, marginTop: 1 }}
        />
      </CardContent>
    </Card>
  );
}

function NewsItemSkeleton({ isTorcida }: { isTorcida: boolean }) {
  const cardBg = isTorcida ? "#123b6b" : "#0f0f0f";
  const skeletonBg = isTorcida ? "#2f5f96" : "#2a2a2a";
  return (
    <Card
      sx={{
        display: "flex",
        gap: 2,
        padding: 1,
        backgroundColor: cardBg,
        borderRadius: 2,
      }}
    >
      <Skeleton
        variant="rectangular"
        width={100}
        height={100}
        sx={{ bgcolor: skeletonBg, borderRadius: 1 }}
      />

      <CardContent sx={{ padding: 1, width: "100%" }}>
        <Skeleton height={20} width="90%" sx={{ bgcolor: skeletonBg }} />

        <Skeleton
          height={14}
          width="40%"
          sx={{ bgcolor: skeletonBg, marginTop: 1 }}
        />
      </CardContent>
    </Card>
  );
}
