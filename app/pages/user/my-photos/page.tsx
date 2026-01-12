"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography, Divider } from "@mui/material";
import { useAuth } from "@/app/context/AuthContext";
import BottomNav from "@/app/components/layout/BottomNav";
import HomeHeader from "@/app/components/home/HeaderHome";
import { EventResponse, getEvents } from "@/app/services/events/eventService";
import MyPosts from "@/app/components/my-posts/MyPosts";
import MyPhotos from "@/app/components/my-photos/MyPhotos";

export default function MyPhotosPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/pages/auth/login");
      return;
    }

    // Carrega eventos para o header
    getEvents()
      .then((data) => {
        setEvents(data);
        if (data.length > 0) {
          setCurrentEvent(data[0]);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar eventos", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isAuthenticated, router]);

  if (!isAuthenticated || loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        gap={2}
      >
        <CircularProgress size={48} sx={{ color: "#ffcc01" }} />
        <Typography variant="body1" sx={{ color: "#fff" }}>
          Carregando...
        </Typography>
      </Box>
    );
  }

  if (!currentEvent) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        gap={2}
      >
        <CircularProgress size={48} sx={{ color: "#ffcc01" }} />
        <Typography variant="body1" sx={{ color: "#fff" }}>
          Carregando evento...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        style={{
          minHeight: "100vh",
          paddingBottom: "72px",
          backgroundColor: "#f4f7fc",
          backgroundImage: "url(/background/dashboard.png)",
        }}
      >
        {/* Header com nome, foto e data */}
        <HomeHeader
          event={currentEvent}
          events={events}
          currentEvent={currentEvent}
          onSelectEvent={setCurrentEvent}
        />

        {/* Conteúdo baseado no tipo de usuário */}
        {isAdmin ? (
          <>
            {/* Para admin: mostra posts primeiro */}
            <MyPosts />
            
            {/* Divisor */}
            <Divider
              sx={{
                borderColor: "rgba(255,255,255,0.35)",
                borderWidth: "1px",
                marginY: 2,
              }}
            />

            {/* Depois mostra histórico de compras */}
            <MyPhotos />
          </>
        ) : (
          // Para usuário: mostra apenas fotos compradas
          <MyPhotos />
        )}
      </Box>
      <BottomNav />
    </>
  );
}

