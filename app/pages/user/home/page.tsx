"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Skeleton, Typography } from "@mui/material";
import HomeScreenHeader from "@/app/components/home/HomeScreenHeader";
import { COLORS, LAYOUT, SPACING } from "@/app/constants/designTokens";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import BrazilDivider from "@/app/components/layout/BrazilDivider";
import RainbowDivider from "@/app/components/layout/RainbowDivider";
import FeedTabs, { type FeedTab } from "@/app/components/home/FeedTabs";
import { motion } from "framer-motion";
import SponsorLogosBar from "@/app/components/home/SponsorLogosBar";
import MatchBannerCarousel from "@/app/components/home/MatchBannerCarousel";
import BottomNav from "@/app/components/layout/BottomNav";
import { EventResponse, getEvents } from "@/app/services/events/eventAppService";
import NewsFeed from "@/app/components/home/NewsFeed";
import { useAuth } from "@/app/context/AuthContext";
import EventDetail from "@/app/components/home/EventDetail";
import WorldCupGames from "@/app/components/home/WorldCupGames";
import EventIndisponivel from "@/app/components/event/EventIndisponivel";
import {
  getProfile,
  type ProfileResponse,
} from "@/app/services/profile/profileService";

const STORAGE_KEY = "selectedEventId";
const SCROLL_KEY = "homeScrollY";
const TAB_KEY = "homeActiveTab";

const VALID_TABS: FeedTab[] = ["all", "games", "brasil"];

function isFeedTab(value: string): value is FeedTab {
  return (VALID_TABS as string[]).includes(value);
}

const HomeContent: React.FC = () => {
  // Inicializa sempre "all" para evitar hydration mismatch (server vs client).
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventResponse | null>(null);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const currentEventIdRef = useRef<number | null>(null);
  const isCheckingRef = useRef(false);
  const router = useRouter();
  const { isAdmin, authReady } = useAuth();

  // Persist tab selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(TAB_KEY, activeTab);
    }
  }, [activeTab]);

  // Sincroniza aba via URL (?tab=) e sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlTab = urlParams.get("tab");
    const urlEventId = urlParams.get("eventId") || urlParams.get("event");

    const targetTab: FeedTab =
      urlTab && isFeedTab(urlTab)
        ? urlTab
        : (() => {
            const saved = sessionStorage.getItem(TAB_KEY);
            return saved && isFeedTab(saved) ? saved : "all";
          })();
    if (activeTab !== targetTab) {
      setActiveTab(targetTab);
    }

    // Atualiza o evento se houver parâmetro na URL e eventos já carregados
    if (urlEventId && events.length > 0) {
      const urlId = parseInt(urlEventId, 10);
      const urlEvent = events.find((event) => event.id === urlId);
      if (urlEvent && (!currentEvent || currentEvent.id !== urlEvent.id)) {
        setCurrentEvent(urlEvent);
        currentEventIdRef.current = urlEvent.id;
        localStorage.setItem(STORAGE_KEY, urlEvent.id.toString());

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("event");
        newUrl.searchParams.delete("eventId");
        window.history.replaceState({}, "", newUrl.toString());
      }
    }
  }, [events, currentEvent, activeTab]);

  // Verifica e atualiza eventos
  const checkAndUpdateEvents = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      const data = await getEvents();
      setEvents(data);

      const currentId = currentEventIdRef.current;
      if (currentId) {
        const updatedEvent = data.find((event) => event.id === currentId);

        if (!updatedEvent) {
          const activeEvent = data.find((event) => event.is_active);
          if (activeEvent) {
            setCurrentEvent(activeEvent);
            currentEventIdRef.current = activeEvent.id;
            localStorage.setItem(STORAGE_KEY, activeEvent.id.toString());
          } else {
            setCurrentEvent(null);
            currentEventIdRef.current = null;
            localStorage.removeItem(STORAGE_KEY);
          }
        } else if (!updatedEvent.is_active && !isAdmin) {
          const activeEvent = data.find((event) => event.is_active);
          if (activeEvent) {
            setCurrentEvent(activeEvent);
            currentEventIdRef.current = activeEvent.id;
            localStorage.setItem(STORAGE_KEY, activeEvent.id.toString());
          } else {
            setCurrentEvent(null);
            currentEventIdRef.current = null;
          }
        } else if (updatedEvent) {
          setCurrentEvent(updatedEvent);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar eventos:", error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [isAdmin]);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem(SCROLL_KEY);
    if (savedScroll && activeTab !== "all") {
      setTimeout(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedScroll, 10) || 0);
        });
      }, 100);
    }
    const onScroll = () => {
      if (activeTab !== "all") {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      }
    };
    window.addEventListener("scroll", onScroll);

    const forceRestore = sessionStorage.getItem("forceHomeRestore");
    if (forceRestore) {
      sessionStorage.removeItem("forceHomeRestore");
    }

    if (!authReady) {
      return () => window.removeEventListener("scroll", onScroll);
    }

    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setProfileLoaded(true);
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        setProfileLoaded(true);
      }
    };

    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
        setEventsLoaded(true);

        if (data.length > 0) {
          const urlParams = new URLSearchParams(window.location.search);
          const urlEventId = urlParams.get("eventId") || urlParams.get("event");
          if (urlEventId) {
            const urlId = parseInt(urlEventId, 10);
            const urlEvent = data.find((event) => event.id === urlId);
            if (urlEvent) {
              setCurrentEvent(urlEvent);
              currentEventIdRef.current = urlEvent.id;
              localStorage.setItem(STORAGE_KEY, urlEvent.id.toString());
              const urlTab = urlParams.get("tab");
              if (urlTab && isFeedTab(urlTab)) {
                setActiveTab(urlTab);
              }

              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete("event");
              newUrl.searchParams.delete("eventId");
              window.history.replaceState({}, "", newUrl.toString());

              return;
            }
          }

          const savedEventId = localStorage.getItem(STORAGE_KEY);
          if (savedEventId) {
            const savedId = parseInt(savedEventId, 10);
            const savedEvent = data.find((event) => event.id === savedId);
            if (savedEvent) {
              if (!savedEvent.is_active && !isAdmin) {
                const activeEvent = data.find((event) => event.is_active);
                if (activeEvent) {
                  setCurrentEvent(activeEvent);
                  currentEventIdRef.current = activeEvent.id;
                  localStorage.setItem(STORAGE_KEY, activeEvent.id.toString());
                } else {
                  setCurrentEvent(savedEvent);
                  currentEventIdRef.current = savedEvent.id;
                }
              } else {
                setCurrentEvent(savedEvent);
                currentEventIdRef.current = savedEvent.id;
              }
              return;
            }
          }
          const activeEvent = data.find((event) => event.is_active);
          const selectedEvent = activeEvent || (isAdmin ? data[0] : null);
          if (selectedEvent) {
            setCurrentEvent(selectedEvent);
            currentEventIdRef.current = selectedEvent.id;
          }
        } else {
          setEventsLoaded(true);
        }
      } catch {
        setEventsLoaded(true);
        router.push("/");
      }
    };

    Promise.all([fetchEvents(), fetchProfile()]);

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
      window.removeEventListener("scroll", onScroll);
    };
  }, [router, isAdmin, authReady, checkAndUpdateEvents, activeTab]);

  // Se não há eventos ativos para usuário não-admin, mostra Evento Indisponível
  if (eventsLoaded && !currentEvent) {
    const hasActiveEvents = events.some((event) => event.is_active);
    if (!isAdmin && !hasActiveEvents) {
      return <EventIndisponivel />;
    }
  }

  const handleTabChange = (newTab: FeedTab) => {
    setActiveTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newTab);
    window.history.replaceState({}, "", url.toString());
  };

  const handleSelectEvent = (event: EventResponse) => {
    setCurrentEvent(event);
    currentEventIdRef.current = event.id;
    localStorage.setItem(STORAGE_KEY, event.id.toString());
  };

  // Skeleton enquanto carrega evento + perfil
  if (!currentEvent || !profileLoaded) {
    return (
      <Box sx={{ position: "relative", minHeight: "100vh", pb: "100px", bgcolor: COLORS.bg }}>
        <Sidebar />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
            minHeight: "100vh",
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height={128}
            sx={{ bgcolor: "rgba(255,255,255,0.06)" }}
          />
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={98} sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: 0 }} />
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={93}
                  height={29}
                  sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: "15px" }}
                />
              ))}
            </Box>
            <Skeleton
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: "15px", mt: 2 }}
            />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={150}
              sx={{ bgcolor: "rgba(255,255,255,0.08)", borderRadius: "15px", mt: 2 }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ position: "relative", minHeight: "100vh", bgcolor: COLORS.bg }}>
        <Sidebar />

        <Box
          component="main"
          sx={{
            position: "relative",
            zIndex: 1,
            ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
            minHeight: "100vh",
            pb: `${LAYOUT.bottomNavClearance}px`,
          }}
        >
          <HomeScreenHeader
            events={events}
            currentEvent={currentEvent}
            onSelectEvent={handleSelectEvent}
            profile={profile}
          />

          <SponsorLogosBar />
          <MatchBannerCarousel />
          <BrazilDivider />

          <Box
            sx={{
              px: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: 0,
              pt: `${SPACING.lg}px`,
              pb: 0,
              mb: `${SPACING.md}px`,
            }}
          >
            <FeedTabs active={activeTab} onChange={handleTabChange} />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: "left", width: "100%" }}
            >
              <RainbowDivider />
            </motion.div>
          </Box>

          {/* Conteúdo da aba */}
          {activeTab === "all" && currentEvent && (
            <NewsFeed eventId={currentEvent.id} event={currentEvent} />
          )}

          {activeTab === "games" && currentEvent && (
            <EventDetail event={currentEvent} />
          )}

          {activeTab === "brasil" && currentEvent && (
            <WorldCupGames eventId={currentEvent.id} />
          )}

        </Box>
      </Box>

      <BottomNav />
    </>
  );
};

const Home: React.FC = () => {
  return <HomeContent />;
};

export default Home;
