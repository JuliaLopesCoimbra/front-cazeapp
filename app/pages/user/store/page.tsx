"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
} from "@mui/material";
import { useAuth } from "@/app/context/AuthContext";
import BottomNav from "@/app/components/layout/BottomNav";
import HomeHeader from "@/app/components/home/HeaderHome";
import { EventResponse, getEvents } from "@/app/services/events/eventAppService";
import { getProductsByEvent, ProductEventResponse } from "@/app/services/productsEvent/productEventService";
import { useToast } from "@/app/context/ToastContext";

const STORAGE_KEY = "selectedEventId";

export default function StorePage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, authReady } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventResponse | null>(null);
  const [products, setProducts] = useState<ProductEventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Função para atualizar o evento atual baseado no localStorage
  const updateCurrentEventFromStorage = useCallback((eventsList: EventResponse[]) => {
    const savedEventId = localStorage.getItem(STORAGE_KEY);
    if (savedEventId) {
      const savedId = parseInt(savedEventId, 10);
      const savedEvent = eventsList.find((event) => event.id === savedId);
      if (savedEvent) {
        setCurrentEvent(savedEvent);
        return;
      }
    }
    // Se não encontrou evento salvo, usa o primeiro disponível (preferencialmente ativo)
    const activeEvent = eventsList.find((event) => event.is_active);
    const selectedEvent = activeEvent || (eventsList.length > 0 ? eventsList[0] : null);
    if (selectedEvent) {
      setCurrentEvent(selectedEvent);
      localStorage.setItem(STORAGE_KEY, selectedEvent.id.toString());
    }
  }, []);

  // Função para carregar produtos do evento atual
  const loadProducts = useCallback(async (eventId: number) => {
    try {
      setLoadingProducts(true);
      const productsData = await getProductsByEvent(eventId);
      // Filtra apenas produtos ativos
      const activeProducts = productsData.filter(p => p.status === "active");
      setProducts(activeProducts);
    } catch (err: any) {
      console.error("Erro ao carregar produtos", err);
      if (err?.response?.status !== 404) {
        showToast("Erro ao carregar produtos", "error");
      }
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [showToast]);

  // Função para verificar e atualizar eventos
  const checkAndUpdateEvents = useCallback(async () => {
    try {
      const data = await getEvents();
      setEvents(data);
      
      if (currentEvent?.id) {
        const updatedEvent = data.find((event) => event.id === currentEvent.id);
        
        // Se o evento não foi encontrado (foi deletado), troca para um ativo
        if (!updatedEvent) {
          const activeEvent = data.find((event) => event.is_active);
          if (activeEvent) {
            setCurrentEvent(activeEvent);
            localStorage.setItem(STORAGE_KEY, activeEvent.id.toString());
          } else if (data.length > 0) {
            setCurrentEvent(data[0]);
            localStorage.setItem(STORAGE_KEY, data[0].id.toString());
          } else {
            setCurrentEvent(null);
            localStorage.removeItem(STORAGE_KEY);
          }
        }
        // Se o evento atual foi desativado e o usuário NÃO é admin/subadmin, troca para um ativo
        else if (!updatedEvent.is_active && !isAdmin) {
          const activeEvent = data.find((event) => event.is_active);
          if (activeEvent) {
            setCurrentEvent(activeEvent);
            localStorage.setItem(STORAGE_KEY, activeEvent.id.toString());
          }
        } else if (updatedEvent) {
          setCurrentEvent(updatedEvent);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar eventos:", error);
    }
  }, [currentEvent, isAdmin]);

  // Função para lidar com seleção de evento
  const handleSelectEvent = useCallback((event: EventResponse) => {
    localStorage.setItem(STORAGE_KEY, event.id.toString());
    setCurrentEvent(event);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/pages/auth/login");
      return;
    }

    // Carrega eventos para o header
    setLoadingEvents(true);
    getEvents()
      .then((data) => {
        setEvents(data);
        updateCurrentEventFromStorage(data);
      })
      .catch((error) => {
        console.error("Erro ao carregar eventos", error);
      })
      .finally(() => {
        setLoadingEvents(false);
      });
  }, [isAuthenticated, router, updateCurrentEventFromStorage]);

  // Carrega produtos quando o evento atual muda
  useEffect(() => {
    if (currentEvent?.id) {
      loadProducts(currentEvent.id);
    } else {
      setProducts([]);
      setLoadingProducts(false);
    }
  }, [currentEvent?.id, loadProducts]);

  // Escuta mudanças no localStorage (quando o evento é alterado em outra aba/componente)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedEventId = localStorage.getItem(STORAGE_KEY);
      if (savedEventId) {
        const savedId = parseInt(savedEventId, 10);
        if (currentEvent?.id !== savedId) {
          const event = events.find((e) => e.id === savedId);
          if (event) {
            setCurrentEvent(event);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Também verifica periodicamente (para mudanças na mesma aba)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [currentEvent, events]);

  // Verifica eventos quando a página fica visível
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndUpdateEvents();
      }
    };

    const handleFocus = () => {
      checkAndUpdateEvents();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkAndUpdateEvents]);

  if (!authReady) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#ffc91f" }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          paddingBottom: "72px",
          backgroundColor: "#000",
          backgroundImage: "url(/background/dashboard.png)",
        }}
      >
        {/* Header */}
        <HomeHeader
          event={currentEvent}
          events={events}
          currentEvent={currentEvent}
          onSelectEvent={handleSelectEvent}
        />

        {/* Conteúdo */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: 1000,
            width: "100%",
            mx: "auto",
          }}
        >
          {loadingEvents ? (
            // Skeleton Loader
            <Box>
              {/* Skeleton do título do evento */}
              <Box sx={{ mb: 4, pb: 2, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={40}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 1,
                  }}
                />
              </Box>

              {/* Skeleton dos cards de produtos */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                  gap: 2,
                }}
              >
                {[...Array(8)].map((_, index) => (
                  <Card
                    key={index}
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      overflow: "hidden",
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={80}
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      }}
                    />
                    <CardContent sx={{ p: 1 }}>
                      <Skeleton
                        variant="text"
                        width="80%"
                        height={16}
                        sx={{
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          mb: 0.5,
                          borderRadius: 1,
                        }}
                      />
                      <Skeleton
                        variant="text"
                        width="60%"
                        height={14}
                        sx={{
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          mb: 0.5,
                          borderRadius: 1,
                        }}
                      />
                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.75, pt: 0.75, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <Skeleton
                          variant="text"
                          width={60}
                          height={16}
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: 1,
                          }}
                        />
                        <Skeleton
                          variant="text"
                          width={40}
                          height={14}
                          sx={{
                            bgcolor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: 1,
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          ) : !currentEvent ? (
            <Paper
              elevation={0}
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                borderRadius: 3,
                p: 6,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Nenhum evento selecionado
              </Typography>
            </Paper>
          ) : loadingProducts ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#ffc91f" }} />
            </Box>
          ) : products.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                borderRadius: 3,
                p: 6,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="h5" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Ainda não há produtos disponíveis
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                Os produtos deste evento aparecerão aqui quando estiverem disponíveis.
              </Typography>
            </Paper>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                  pb: 2,
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    color: "#fff",
                    fontSize: { xs: "1.1rem", sm: "1.5rem", md: "2rem" },
                    letterSpacing: "0.5px",
                  }}
                >
                  {currentEvent.title}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
                  gap: 2,
                }}
              >
                {products.map((product) => (
                  <Card
                    key={product.id}
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "#fff",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      overflow: "hidden",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 24px rgba(255, 201, 31, 0.25)",
                        borderColor: "rgba(255, 201, 31, 0.3)",
                      },
                    }}
                    onClick={() => router.push(`/pages/user/store/${product.id}`)}
                  >
                    {product.images && product.images.length > 0 ? (
                      <Box
                        sx={{
                          width: "100%",
                          height: 80,
                          overflow: "hidden",
                          position: "relative",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "30%",
                            background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={product.images[0].image_url}
                          alt={product.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s ease",
                            "&:hover": {
                              transform: "scale(1.05)",
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: 80,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderBottom: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.4)",
                            fontSize: "0.688rem",
                            fontWeight: 500,
                          }}
                        >
                          Sem imagem
                        </Typography>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, p: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          mb: 0,
                          fontSize: "0.75rem",
                          lineHeight: 1.2,
                          color: "#fff",
                          letterSpacing: "0.05px",
                        }}
                      >
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.65)",
                            mb: 0,
                            fontSize: "0.625rem",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            minHeight: "1.6rem",
                          }}
                        >
                          {product.description}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                          mt: "auto",
                          pt: 0.75,
                          borderTop: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#ffc91f",
                              fontWeight: 800,
                              fontSize: "0.875rem",
                              lineHeight: 1,
                              mb: 0.25,
                            }}
                          >
                            R$ {parseFloat(product.price).toFixed(2).replace(".", ",")}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "rgba(255,255,255,0.5)",
                              fontSize: "0.563rem",
                              fontWeight: 500,
                              mb: 0.125,
                              textTransform: "uppercase",
                              letterSpacing: "0.2px",
                            }}
                          >
                            Estoque
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: product.stock > 0 ? "#4caf50" : "#f44336",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                            }}
                          >
                            {product.stock}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>
      <BottomNav />
    </>
  );
}

