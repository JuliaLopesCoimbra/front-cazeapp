"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Skeleton, Typography } from "@mui/material";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import HomeScreenHeader from "@/app/components/home/HomeScreenHeader";
import HeroMatchBanner from "@/app/components/home/HeroMatchBanner";
import PageAmbientBackground from "@/app/components/layout/PageAmbientBackground";
import { LAYOUT, PAGE_GLASS_SURFACE, SPACING } from "@/app/constants/designTokens";
import Sidebar, { SIDEBAR_WIDTH_PX } from "@/app/components/layout/Sidebar";
import BrazilDivider from "@/app/components/layout/BrazilDivider";
import RainbowDivider from "@/app/components/layout/RainbowDivider";
import FeedTabs, { type FeedTab } from "@/app/components/home/FeedTabs";
import { motion } from "framer-motion";
import SponsorCarousel, { getMockSponsors } from "@/app/components/feed/SponsorCarousel";
import BottomNav from "@/app/components/layout/BottomNav";
import { EventResponse, getEvents } from "@/app/services/events/eventAppService";
import NewsFeed from "@/app/components/home/NewsFeed";
import { useAuth } from "@/app/context/AuthContext";
import WorldCupGames from "@/app/components/home/WorldCupGames";
import EventIndisponivel from "@/app/components/event/EventIndisponivel";
import {
  getProfile,
  type ProfileResponse,
} from "@/app/services/profile/profileService";

const STORAGE_KEY = "selectedEventId";
const SCROLL_KEY = "homeScrollY";
const TAB_KEY = "homeActiveTab";

const VALID_TABS: FeedTab[] = ["all", "games", "bolao", "stickers"];

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
      <Box sx={{ position: "relative", minHeight: "100vh", pb: "100px" }}>
        <PageAmbientBackground />
        <Sidebar />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
            minHeight: "100vh",
            ...PAGE_GLASS_SURFACE,
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
      <Box sx={{ position: "relative", minHeight: "100vh" }}>
        <PageAmbientBackground />
        <Sidebar />

        <Box
          component="main"
          sx={{
            position: "relative",
            zIndex: 1,
            ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
            minHeight: "100vh",
            pb: `${LAYOUT.bottomNavClearance}px`,
            ...PAGE_GLASS_SURFACE,
          }}
        >
          <HomeScreenHeader
            events={events}
            currentEvent={currentEvent}
            onSelectEvent={handleSelectEvent}
            profile={profile}
          />

          <SponsorCarousel banners={getMockSponsors()} edgeToEdge />
          <BrazilDivider />

          <Box
            sx={{
              px: `${LAYOUT.pagePaddingX}px`,
              maxWidth: LAYOUT.feedMaxWidth,
              mx: "auto",
              width: "100%",
              mt: `${SPACING.xxl}px`,
            }}
          >
            <HeroMatchBanner />
          </Box>

          <Box
            sx={{
              pl: `${LAYOUT.pagePaddingX}px`,
              pr: 0,
              maxWidth: LAYOUT.feedMaxWidth,
              mx: "auto",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: `${SPACING.lg}px`,
              pt: `${SPACING.lg}px`,
              pb: `${SPACING.sm}px`,
              mb: `${SPACING.md}px`,
            }}
          >
            <Box
              sx={{
                mr: `-${LAYOUT.pagePaddingX}px`,
                width: `calc(100% + ${LAYOUT.pagePaddingX}px)`,
              }}
            >
              <FeedTabs active={activeTab} onChange={handleTabChange} />
            </Box>
            <Box
              sx={{
                ml: `-${LAYOUT.pagePaddingX}px`,
                width: `calc(100% + ${LAYOUT.pagePaddingX}px)`,
              }}
            >
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
          </Box>

          {/* Conteúdo da aba */}
          {activeTab === "all" && currentEvent && (
            <NewsFeed eventId={currentEvent.id} event={currentEvent} />
          )}

          {activeTab === "games" && currentEvent && (
            <WorldCupGames eventId={currentEvent.id} />
          )}

          {(activeTab === "bolao" || activeTab === "stickers") && (
            <>
              <BrazilDivider />
              <Box sx={{ display: "flex", justifyContent: "center", px: 2 }}>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                  style={{ width: "100%", maxWidth: 480 }}
                >
                  <Box
                    className="glass-green"
                    sx={{
                      mx: 0,
                      mt: 4,
                      mb: 4,
                      p: 4,
                      borderRadius: "15px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <SportsSoccerOutlinedIcon sx={{ fontSize: 56, color: "#009440" }} />
                    <Typography
                      sx={{
                        color: "#FFFFFF",
                        fontFamily: '"Montserrat", sans-serif',
                        fontWeight: 700,
                        fontSize: "1.125rem",
                      }}
                    >
                      Em breve.
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        fontFamily: '"Roboto", sans-serif',
                        fontSize: "0.875rem",
                      }}
                    >
                      Aguarde a Copa 2026.
                    </Typography>
                  </Box>
                </motion.div>
              </Box>
              <BrazilDivider />
            </>
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
