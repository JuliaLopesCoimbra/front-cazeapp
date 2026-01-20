"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Box, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";
import { getPublicEvents, EventResponse } from "./services/events/eventAppService";
import EventIndisponivel from "./components/event/EventIndisponivel";

export default function HomePage() {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Função para normalizar título para URL
  const normalizeForUrl = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/ /g, "-")
      .trim();
  };

  // Carrega os eventos ao montar o componente
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getPublicEvents(); // Chama o endpoint público para pegar os eventos
        const activeEvents = events.filter((event: EventResponse) => event.is_active); // Filtra eventos ativos
        setEvents(activeEvents);
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        setEvents([]); // Em caso de erro, define como array vazio
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f4f7fc",
          backgroundImage: "url(/background/dashboard.png)",
        }}
      >
        {/* Header Skeleton */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Skeleton
              variant="rectangular"
              width={60}
              height={60}
              sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 1 }}
            />
            <Skeleton
              variant="text"
              width={180}
              height={32}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
          </div>
          <Skeleton
            variant="rectangular"
            width={80}
            height={36}
            sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 1 }}
          />
        </div>

        {/* Main Content Skeleton */}
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              width: "100%",
              maxWidth: 900,
            }}
          >
            {/* Event Card Skeletons */}
            {[1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 3,
                  width: "100%",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={400}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 2 }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  height={32}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)", mt: 2, mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="90%"
                  height={20}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 0.5 }}
                />
                <Skeleton
                  variant="text"
                  width="75%"
                  height={20}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 2 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={150}
                  height={48}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "30px", mt: 1 }}
                />
              </Box>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Se não houver eventos ou todos estiverem indisponíveis, mostra o componente EventIndisponivel
  if (events.length === 0) {
    return <EventIndisponivel />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f7fc",
        backgroundImage: "url(/background/dashboard.png)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 32px",
        }}
      >
        {/* LOGO + TEXTO */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src="/logo/logo-n1.png"
            alt="Camarote N1"
            width={60}
            height={60}
          />
          <strong style={{ fontSize: 22, color: "white" }}>Camarote N1</strong>
        </div>
        <Button
          onClick={() => router.push("/pages/auth/login")}
          sx={{
            color: "white",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          Login
        </Button>
      </div>

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px",
        }}
      >
    

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
            width: "100%",
            maxWidth: 900,
          }}
        >
          {events.map((event) => (
            <Box
              key={event.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 3,
                width: "100%",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
              onClick={() => {
                router.push(`/pages/${normalizeForUrl(event.title)}`);
              }}
            >
              <Image
                src={event.banner_image || "/components/dashboard-component.png"}
                alt={event.title}
                width={900}
                height={400}
                style={{
                  borderRadius: 12,
                  objectFit: "cover",
                  width: "100%",
                  height: "auto",
                }}
              />
              <h2
                style={{
                  marginTop: 16,
                  marginBottom: 8,
                  fontSize: 24,
                  fontWeight: 700,
                  color: "white",
                  textAlign: "center",
                }}
              >
                {event.title}
              </h2>
              {event.description && (
                <p
                  style={{
                    marginTop: 8,
                    marginBottom: 16,
                    fontSize: 14,
                    color: "white",
                    textAlign: "center",
                    maxWidth: 700,
                    lineHeight: 1.6,
                  }}
                >
                  {event.description}
                </p>
              )}
              <Button
                sx={{
                  marginTop: 2,
                  backgroundColor: "#FFD600",
                  color: "#000",
                  fontWeight: 700,
                  padding: "12px 32px",
                  borderRadius: "30px",
                  textTransform: "none",
                  fontSize: 16,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  "&:hover": {
                    backgroundColor: "#FFC400",
                  },
                }}
              >
                Ver Evento
              </Button>
            </Box>
          ))}
        </div>
      </main>
    </div>
  );
}
