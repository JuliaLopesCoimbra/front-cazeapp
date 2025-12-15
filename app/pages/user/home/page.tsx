"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import HomeHeader from "@/app/components/home/HeaderHome";
import HomeTabs from "@/app/components/home/HomeTabs";
import HamburgerMenu from "@/app/components/layout/HamburgerMenu";
import { EventResponse, getEvents } from "@/app/services/events/eventservice";
import NewsFeed from "@/app/components/home/NewsFeed";

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "home" | "eventos" | "foto" | "enredo"
  >("home");
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventResponse | null>(null);

  const router = useRouter();

  useEffect(() => {
    getEvents()
      .then((data) => {
        setEvents(data);
        if (data.length > 0) {
          setCurrentEvent(data[0]);
        }
      })
      .catch(() => {
        router.push("/");
      });
  }, []);

  if (!currentEvent) {
    return <div>Carregando evento...</div>;
  }

  return (
    <Box>
      {/* Menu Hamburguer */}
      <HamburgerMenu
        events={events}
        currentEvent={currentEvent}
        onSelectEvent={setCurrentEvent}
      />
      {/* Header com nome, foto e data */}
      <HomeHeader />
      {/* Tabs */}
      <HomeTabs active={activeTab} onChange={setActiveTab} />

      {/* Conteúdo baseado na aba selecionada */}
      {activeTab === "home" && currentEvent && (
        <NewsFeed eventId={currentEvent.id} />
      )}
      {activeTab === "eventos" && (
        <div>Detalhes do evento: {currentEvent?.description}</div>
      )}

      {activeTab === "foto" && <div>Foto IA — {currentEvent?.title}</div>}

      {activeTab === "enredo" && <div>Enredo — {currentEvent?.title}</div>}
    </Box>
  );
};

export default Home;
