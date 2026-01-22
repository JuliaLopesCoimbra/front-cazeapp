"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { EventResponse } from "@/app/services/events/eventAppService";
import { useFeedCache } from "@/app/context/FeedCacheContext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import MapIcon from "@mui/icons-material/Map";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import { formatEventDates } from "@/app/utils/eventDateFormatter";

interface Props {
  event: EventResponse;
}

export default function EventDetails({ event }: Props) {
  // ===== SCROLL RESTORATION (Instagram/TikTok style) =====
  const { getCache, setCache } = useFeedCache();
  const cacheKey = `event-details-${event.id}`;
  const lastScrollPositionRef = useRef(0);
  
  // Restaura scroll ao montar
  useEffect(() => {
   
    const cached = getCache(cacheKey);
    
    if (cached && cached.scrollPosition > 0) {
      console.log('✅ [EventDetails] Cache encontrado! Scroll:', cached.scrollPosition);
      const targetPosition = cached.scrollPosition;
      
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      
      let attempts = 0;
      const maxAttempts = 20;
      
      const attemptRestore = () => {
        attempts++;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'instant' as ScrollBehavior
        });
        
        const currentScroll = window.scrollY;
        const diff = Math.abs(currentScroll - targetPosition);
        
        if (diff < 10) {
          console.log(`✅ [EventDetails] SUCESSO! Scroll restaurado em ${attempts} tentativas: ${currentScroll}px`);
        } else if (attempts < maxAttempts) {
          console.log(`⏳ [EventDetails] Tentativa ${attempts}: atual=${currentScroll}, target=${targetPosition}, diff=${diff}`);
          requestAnimationFrame(attemptRestore);
        } else {
          console.log(`⚠️ [EventDetails] Máximo de tentativas. Posição final: ${currentScroll}px`);
        }
      };
      
      requestAnimationFrame(attemptRestore);
      
      [50, 100, 200, 400, 800, 1600].forEach(delay => {
        setTimeout(() => {
          window.scrollTo({
            top: targetPosition,
            behavior: 'instant' as ScrollBehavior
          });
        }, delay);
      });
    } else {
      console.log('❌ [EventDetails] Sem cache ou scroll = 0');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);
  
  // Salva scroll ao rolar/sair
  useEffect(() => {
    console.log('📌 [EventDetails] Iniciando listeners de scroll para:', cacheKey);
    let throttleTimeout: NodeJS.Timeout | null = null;
    const THROTTLE_MS = 400; // Otimizado para performance
    
    const updateScrollPosition = () => {
      const windowScroll = window.scrollY || window.pageYOffset;
      const docScroll = document.documentElement.scrollTop;
      const bodyScroll = document.body.scrollTop;
      
      console.log(`📊 [EventDetails] SCROLL DETECTADO:`, {
        windowScrollY: window.scrollY,
        windowPageYOffset: window.pageYOffset,
        docScroll,
        bodyScroll,
        maxScroll: document.documentElement.scrollHeight - window.innerHeight
      });
      
      const currentScroll = windowScroll || docScroll || bodyScroll;
      lastScrollPositionRef.current = currentScroll;
      
      if (throttleTimeout) clearTimeout(throttleTimeout);
      
      throttleTimeout = setTimeout(() => {
        setCache(cacheKey, [], currentScroll);
        console.log(`💾 [EventDetails] Cache atualizado (scroll): ${currentScroll}px`);
      }, THROTTLE_MS);
    };
    
    const handleScroll = () => {
      console.log('🔔 [EventDetails] Evento de scroll disparado!');
      updateScrollPosition();
    };
    
    const handlePageHide = () => {
      const finalScroll = lastScrollPositionRef.current;
      setCache(cacheKey, [], finalScroll);
      console.log(`💾 [EventDetails] Cache salvo (pagehide): ${finalScroll}px`);
    };
    
    const handleBeforeUnload = () => {
      const finalScroll = lastScrollPositionRef.current;
      setCache(cacheKey, [], finalScroll);
      console.log(`💾 [EventDetails] Cache salvo (beforeunload): ${finalScroll}px`);
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const finalScroll = lastScrollPositionRef.current;
        setCache(cacheKey, [], finalScroll);
        console.log(`💾 [EventDetails] Cache salvo (visibilitychange): ${finalScroll}px`);
      }
    };
    
    const handleBlur = () => {
      const finalScroll = lastScrollPositionRef.current;
      setCache(cacheKey, [], finalScroll);
      console.log(`💾 [EventDetails] Cache salvo (blur): ${finalScroll}px`);
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
      
      const finalScroll = lastScrollPositionRef.current;
      setCache(cacheKey, [], finalScroll);
      console.log(`💾 [EventDetails] Cache salvo (cleanup final): ${finalScroll}px`);
    };
  }, [cacheKey, setCache]);
  // ======================================================
    const startDate = new Date(event.starts_at);
const endDate = new Date(event.ends_at);

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const vanDepartureTime = event.van_departure_time 
  ? new Date(event.van_departure_time)
  : null;
  return (
     <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#f4f7fc",
            backgroundImage: "url(/background/dashboard.png)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Container centralizado para desktop */}
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px 32px",
              }}
            >
              {/* LOGO + TEXTO */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <strong style={{ fontSize: 22, color: "white" }}>Informações do Evento</strong>
              </div>
            </div>
    
            <main
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
           {event.banner_image && (
        <Box
          component="img"
          src={event.banner_image}
          alt={event.title}
          sx={{
            width: "100%",
            maxWidth: 700,
            maxHeight: 280,
            objectFit: "cover",
            borderRadius: 2,
          }}
        />
      )}
    
            <Box
              sx={{
                maxWidth: 700,
                width: "100%",
                marginTop: 3,
                padding: { xs: "20px", md: "30px" },
                textAlign: "center",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(24px, 5vw, 42px)",
                  fontWeight: 800,
                  color: "#FFD600",
                  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 214, 0, 0.3)",
                  letterSpacing: "0.5px",
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                }}
              >
                {event.title}
              </h1>
            </Box>
    
            <p
              style={{
                maxWidth: 700,
                marginTop: 2,
                fontSize: 16,
                padding: "30px",
                color: "#000",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  color: "white",
                  padding: "6px 10px",
                  fontWeight: 600,
                  display: "inline",
                
                }}
              >
                {event.description}
              </span>
            </p>
            <Box
              sx={{
                maxWidth: 700,
                width: "100%",
                padding: "30px",
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "flex-start", md: "center" },
                gap: 1.5,
              }}
            >
              {/* DIAS DO EVENTO */}
              {event.event_dates && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EventIcon style={{ color: "yellow" }} />
                  <p style={{ margin: 0, fontSize: 15 }}>
                    {formatEventDates(event)}
                  </p>
                </Box>
              )}

              {/* DATA E HORÁRIO DE INÍCIO */}
              {event.starts_at && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon style={{ color: "yellow" }} />
                  <p style={{ margin: 0, fontSize: 15 }}>
                    Início: {new Date(event.starts_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Box>
              )}

              {/* DATA E HORÁRIO DE TÉRMINO */}
              {event.ends_at && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon style={{ color: "yellow" }} />
                  <p style={{ margin: 0, fontSize: 15 }}>
                    Término: {new Date(event.ends_at).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Box>
              )}

              {/* HORÁRIO DE SAÍDA DAS VANS */}
              {vanDepartureTime && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DirectionsBusIcon style={{ color: "yellow" }} />
                  <p style={{ margin: 0, fontSize: 15 }}>
                    Saída das Vans: {new Date(event.van_departure_time!).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Box>
              )}

              {/* LOCAL */}
              {event.location && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnIcon style={{ color: "yellow" }} />
                  <p style={{ margin: 0, fontSize: 15 }}>{event.location}</p>
                </Box>
              )}
            </Box>

            {/* MAPA DO EVENTO */}
            {event.image_map && (
              <Box
                sx={{
                  maxWidth: 700,
                  width: "100%",
                
                  padding: "20px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, marginBottom: 2 }}>
                  <MapIcon style={{ color: "yellow" }} />
                  <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 600 }}>
                    Mapa do Evento
                  </h3>
                </Box>
                <Box
                  component="img"
                  src={event.image_map}
                  alt="Mapa do Evento"
                  sx={{
                    width: "100%",
                    maxHeight: 400,
                    objectFit: "contain",
                    borderRadius: 2,
                  }}
                />
              </Box>
            )}

            {/* LINE UP / PROGRAMAÇÃO */}
            {event.line_up && (
              <Box
                sx={{
                  maxWidth: 700,
                  width: "100%",
                
                  padding: "20px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, marginBottom: 2 }}>
                  <MusicNoteIcon style={{ color: "yellow" }} />
                  <h3 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 600 }}>
                    Programação (Line Up)
                  </h3>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    padding: 3,
                    color: "white",
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontSize: 14,
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                      fontFamily: "inherit",
                    }}
                  >
                    {event.line_up}
                  </pre>
                </Box>
              </Box>
            )}
          
            </main>
          </div>
        </div>
  );
}
