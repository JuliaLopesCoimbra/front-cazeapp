"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import HomeHeader from "@/app/components/home/HeaderHome";
import HomeTabs from "@/app/components/home/HomeTabs";
import BottomNav from "@/app/components/layout/BottomNav";
import { EventResponse, getEvents } from "@/app/services/events/eventService";
import { Skeleton } from "@mui/material";
import NewsFeed from "@/app/components/home/NewsFeed";
import CTVAd from "@/app/components/ads/CTVAd";
import EventDetails from "@/app/components/home/EventDetails";

import PhotoAI from "@/app/components/home/PhotoAI";
import Enredo from "@/app/components/home/Enredo";

const STORAGE_KEY = "selectedEventId";

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "home" | "eventos" | "foto" | "enredo"
  >("home");
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventResponse | null>(null);
  const router = useRouter();

  // Função para salvar evento selecionado no localStorage
  const handleSelectEvent = (event: EventResponse) => {
    localStorage.setItem(STORAGE_KEY, event.id.toString());
    setCurrentEvent(event);
  };

  useEffect(() => {
    getEvents()
      .then((data) => {
        setEvents(data);
        if (data.length > 0) {
          // Tenta carregar o evento salvo do localStorage
          const savedEventId = localStorage.getItem(STORAGE_KEY);
          if (savedEventId) {
            const savedId = parseInt(savedEventId, 10);
            const savedEvent = data.find((event) => event.id === savedId);
            if (savedEvent) {
              setCurrentEvent(savedEvent);
              return;
            }
          }
          // Se não encontrou evento salvo ou não existe mais, usa o primeiro
          setCurrentEvent(data[0]);
        }
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  if (!currentEvent) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          paddingBottom: "72px",
          backgroundColor: "#f4f7fc",
          backgroundImage: "url(/background/dashboard.png)",
        }}
      >
        {/* Header Skeleton */}
        <Box
          sx={{
            padding: 2,
            borderBottom: "solid 1px rgba(255,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Skeleton
                variant="rectangular"
                width={40}
                height={40}
                sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 1 }}
              />
              <Skeleton
                variant="text"
                width={150}
                height={32}
                sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
              />
            </Box>
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.4,
            }}
          >
            <Skeleton
              variant="text"
              width={200}
              height={24}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
            <Skeleton
              variant="text"
              width={120}
              height={20}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
          </Box>
        </Box>

        {/* Tabs Skeleton */}
        <Box sx={{ display: "flex", gap: 1, padding: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={100}
              height={36}
              sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "999px" }}
            />
          ))}
        </Box>

        {/* Content Skeleton */}
        <Box padding={2}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 2, mb: 2 }}
          />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={150}
            sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: 2 }}
          />
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box
        style={{
          minHeight: "100vh",
          paddingBottom: "72px", // espaço pro rodapé
          backgroundColor: "#f4f7fc",
          backgroundImage: "url(/background/dashboard.png)",
        }}
      >
        {/* Header com nome, foto e data */}
        <HomeHeader
          event={currentEvent}
          events={events}
          currentEvent={currentEvent}
          onSelectEvent={handleSelectEvent}
        />

        {/* Tabs */}
        <HomeTabs active={activeTab} onChange={setActiveTab} />

        {/* Conteúdo baseado na aba selecionada */}
        {activeTab === "home" && currentEvent && (
          <>
            <CTVAd />
            <NewsFeed eventId={currentEvent.id} />
          </>
        )}
        {activeTab === "eventos" && <EventDetails event={currentEvent} />}

        {activeTab === "foto" && currentEvent && (
          <PhotoAI eventId={currentEvent.id} />
        )}

        {activeTab === "enredo" && currentEvent && (
          <Enredo eventId={currentEvent.id} />
        )}
      </Box>
      <BottomNav />
    </>
  );
};

export default Home;
