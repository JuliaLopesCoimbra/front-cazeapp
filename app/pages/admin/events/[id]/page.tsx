"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Switch,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import StoreIcon from '@mui/icons-material/Store';
import RefreshIcon from '@mui/icons-material/Refresh';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { getThemedPageBackgroundSx } from "@/app/utils/backgroundStyles";
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import { useFeedCache } from "@/app/context/FeedCacheContext";
import {
  getEventById,
  EventResponse,
  deleteEvent,
  updatePostApprovalRequirement,
  getPendingPostsCount,
} from "@/app/services/events/eventAppService";
import {
  getSambaSchoolsByEvent,
  SambaSchoolResponse,
} from "@/app/services/sambaSchools/sambaSchoolService";
import {
  getMusicLyricsByEvent,
  MusicLyricsResponse,
} from "@/app/services/musicLyrics/musicLyricsService";
import {
  getWorldCupGames,
  createWorldCupGame,
  WorldCupGameResponse,
} from "@/app/services/worldCupGames/worldCupGameService";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import DeleteEventModal from "@/app/components/admin/events/DeleteEventModal";
import { formatEventDates } from "@/app/utils/eventDateFormatter";

// ─── Info row inside a section card ─────────────────────────────────────────
function InfoRow({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Typography sx={{ color: "#ffc91f", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 0.5 }}>
        {icon}
        {label}
      </Typography>
      <Box sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
        {children}
      </Box>
    </Box>
  );
}

// ─── Section card (read-only display) ────────────────────────────────────────
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 2, background: "rgba(255,201,31,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Box sx={{ color: "#ffc91f", display: "flex", alignItems: "center" }}>{icon}</Box>
        <Typography fontWeight={700} sx={{ color: "#fff", fontSize: "0.9rem", letterSpacing: "0.02em" }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>{children}</Box>
    </Paper>
  );
}

export default function EventDetailsPage() {
  const pageBackgroundSx = getThemedPageBackgroundSx();
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  // ===== CACHE =====
  const { getCache, setCache, clearCache } = useFeedCache();
  const cacheKey = `admin-event-details-${eventId}`;
  const [initialized, setInitialized] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [event, setEvent] = useState<EventResponse | null>(null);
  const [schools, setSchools] = useState<SambaSchoolResponse[]>([]);
  const [musics, setMusics] = useState<MusicLyricsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [updatingApproval, setUpdatingApproval] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loadingPendingCount, setLoadingPendingCount] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [schoolsOffset, setSchoolsOffset] = useState(0);
  const [musicsOffset, setMusicsOffset] = useState(0);
  const [hasMoreSchools, setHasMoreSchools] = useState(false);
  const [hasMoreMusics, setHasMoreMusics] = useState(false);
  const [loadingMoreSchools, setLoadingMoreSchools] = useState(false);
  const [loadingMoreMusics, setLoadingMoreMusics] = useState(false);
  const [worldCupGames, setWorldCupGames] = useState<WorldCupGameResponse[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  // ── Create game dialog state ──────────────────────────────────────────────
  const [createGameOpen, setCreateGameOpen] = useState(false);
  const [cgTitle, setCgTitle] = useState("");
  const [cgDescription, setCgDescription] = useState("");
  const [cgDate, setCgDate] = useState("");
  const [cgTime, setCgTime] = useState("");
  const [cgPhoto, setCgPhoto] = useState<File | null>(null);
  const [cgPreview, setCgPreview] = useState<string | null>(null);
  const [cgLoading, setCgLoading] = useState(false);
  const ITEMS_PER_PAGE = 100;

  useEffect(() => {
    if (!eventId || isDeleted) return;
    const fetchEvent = async () => {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
      } catch (err: any) {
        console.error("Erro ao buscar evento", err);
        if (err?.response?.status === 404) {
          showToast("Evento não encontrado ou foi deletado", "error");
          router.replace("/pages/user/home");
        } else {
          showToast("Erro ao carregar evento", "error");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, showToast, router, isDeleted]);

  useEffect(() => {
    if (!eventId || !isAdmin) return;
    const fetchPendingCount = async () => {
      try {
        setLoadingPendingCount(true);
        const data = await getPendingPostsCount(eventId);
        setPendingCount(data.pending_count);
      } catch (err) {
        console.error("Erro ao buscar contagem de posts pendentes", err);
      } finally {
        setLoadingPendingCount(false);
      }
    };
    fetchPendingCount();
  }, [eventId, isAdmin]);

  // ===== Jogos da Copa (apenas world_cup) =====
  useEffect(() => {
    if (!event || event.event_type !== "world_cup") return;
    let cancelled = false;
    setLoadingGames(true);
    getWorldCupGames(eventId)
      .then((data) => { if (!cancelled) setWorldCupGames(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingGames(false); });
    return () => { cancelled = true; };
  }, [event, eventId]);

  // ===== CACHE: Carregar escolas e músicas =====
  useEffect(() => {
    if (!eventId || initialized) return;
    const cached = getCache(cacheKey);
    if (cached && cached.data.length > 0) {
      const [cachedSchools, cachedMusics] = cached.data;
      setSchools(cachedSchools || []);
      setMusics(cachedMusics || []);
      setSchoolsOffset(cachedSchools?.length || 0);
      setMusicsOffset(cachedMusics?.length || 0);
      setHasMoreSchools((cachedSchools?.length || 0) >= ITEMS_PER_PAGE);
      setHasMoreMusics((cachedMusics?.length || 0) >= ITEMS_PER_PAGE);
      setLoadingSchools(false);
      setInitialized(true);
      const targetPosition = cached.scrollPosition;
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      scrollRestoreTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      scrollRestoreTimeoutsRef.current = [];
      isRestoringScrollRef.current = true;
      userInteractedRef.current = false;
      const stopRestoreIfUserInteracted = () => {
        if (userInteractedRef.current) {
          isRestoringScrollRef.current = false;
          scrollRestoreTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
          scrollRestoreTimeoutsRef.current = [];
        }
      };
      const attemptRestore = () => {
        if (!isRestoringScrollRef.current || userInteractedRef.current) return;
        const container = containerElementRef.current;
        if (container && !userInteractedRef.current) container.scrollTop = targetPosition;
      };
      [100, 300, 600].forEach(delay => {
        const timeout = setTimeout(() => {
          stopRestoreIfUserInteracted();
          if (isRestoringScrollRef.current && !userInteractedRef.current) attemptRestore();
        }, delay);
        scrollRestoreTimeoutsRef.current.push(timeout);
      });
      const finalTimeout = setTimeout(() => {
        isRestoringScrollRef.current = false;
        scrollRestoreTimeoutsRef.current = [];
      }, 2000);
      scrollRestoreTimeoutsRef.current.push(finalTimeout);
    } else {
      const fetchSchoolsAndMusics = async () => {
        try {
          setLoadingSchools(true);
          const [schoolsData, musicsData] = await Promise.all([
            getSambaSchoolsByEvent(eventId, ITEMS_PER_PAGE, 0),
            getMusicLyricsByEvent(eventId, ITEMS_PER_PAGE, 0),
          ]);
          setSchools(schoolsData);
          setMusics(musicsData);
          setSchoolsOffset(schoolsData.length);
          setMusicsOffset(musicsData.length);
          setHasMoreSchools(schoolsData.length >= ITEMS_PER_PAGE);
          setHasMoreMusics(musicsData.length >= ITEMS_PER_PAGE);
        } catch (err) {
          console.error("Erro ao buscar escolas e músicas", err);
        } finally {
          setLoadingSchools(false);
        }
      };
      fetchSchoolsAndMusics();
      setInitialized(true);
    }
    return () => {
      scrollRestoreTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      scrollRestoreTimeoutsRef.current = [];
      isRestoringScrollRef.current = false;
      userInteractedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // ===== CACHE: Salvar scroll position =====
  const lastScrollPositionRef = useRef(0);
  const schoolsRef = useRef(schools);
  const musicsRef = useRef(musics);
  const cleanupFnRef = useRef<(() => void) | null>(null);
  const containerElementRef = useRef<HTMLDivElement | null>(null);
  const isRestoringScrollRef = useRef(false);
  const userInteractedRef = useRef(false);
  const scrollRestoreTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    schoolsRef.current = schools;
    musicsRef.current = musics;
  }, [schools, musics]);

  const scrollContainerRef = useCallback((container: HTMLDivElement | null) => {
    containerElementRef.current = container;
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
      cleanupFnRef.current = null;
    }
    if (!container) return;
    let throttleTimeout: NodeJS.Timeout | null = null;
    const THROTTLE_MS = 400;
    const updateScrollPosition = () => {
      lastScrollPositionRef.current = container.scrollTop;
      if (throttleTimeout) clearTimeout(throttleTimeout);
      throttleTimeout = setTimeout(() => {
        const currentSchools = schoolsRef.current;
        const currentMusics = musicsRef.current;
        if (currentSchools.length > 0 || currentMusics.length > 0) {
          setCache(cacheKey, [currentSchools, currentMusics], container.scrollTop);
        }
      }, THROTTLE_MS);
    };
    const handleScroll = () => {
      if (isRestoringScrollRef.current) {
        userInteractedRef.current = true;
        isRestoringScrollRef.current = false;
        scrollRestoreTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        scrollRestoreTimeoutsRef.current = [];
      }
      updateScrollPosition();
    };
    const saveCache = () => {
      const s = schoolsRef.current; const m = musicsRef.current;
      if (s.length > 0 || m.length > 0) setCache(cacheKey, [s, m], lastScrollPositionRef.current);
    };
    const handleVisibilityChange = () => { if (document.hidden) saveCache(); };
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', saveCache);
    window.addEventListener('beforeunload', saveCache);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', saveCache);
    cleanupFnRef.current = () => {
      if (throttleTimeout) clearTimeout(throttleTimeout);
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', saveCache);
      window.removeEventListener('beforeunload', saveCache);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', saveCache);
      saveCache();
    };
  }, [cacheKey, setCache]);

  const loadMoreSchools = async () => {
    if (!eventId || loadingMoreSchools || !hasMoreSchools) return;
    setLoadingMoreSchools(true);
    try {
      const newSchools = await getSambaSchoolsByEvent(eventId, ITEMS_PER_PAGE, schoolsOffset);
      if (newSchools.length > 0) {
        setSchools((prev) => [...prev, ...newSchools]);
        setSchoolsOffset((prev) => prev + newSchools.length);
        setHasMoreSchools(newSchools.length >= ITEMS_PER_PAGE);
      } else {
        setHasMoreSchools(false);
      }
    } catch (err) {
      showToast("Erro ao carregar mais escolas", "error");
    } finally {
      setLoadingMoreSchools(false);
    }
  };

  const loadMoreMusics = async () => {
    if (!eventId || loadingMoreMusics || !hasMoreMusics) return;
    setLoadingMoreMusics(true);
    try {
      const newMusics = await getMusicLyricsByEvent(eventId, ITEMS_PER_PAGE, musicsOffset);
      if (newMusics.length > 0) {
        setMusics((prev) => [...prev, ...newMusics]);
        setMusicsOffset((prev) => prev + newMusics.length);
        setHasMoreMusics(newMusics.length >= ITEMS_PER_PAGE);
      } else {
        setHasMoreMusics(false);
      }
    } catch (err) {
      showToast("Erro ao carregar mais músicas", "error");
    } finally {
      setLoadingMoreMusics(false);
    }
  };

  const refreshSchoolsAndMusics = async () => {
    if (!eventId || refreshing) return;
    setRefreshing(true);
    try {
      clearCache(cacheKey);
      setLoadingSchools(true);
      const [schoolsData, musicsData] = await Promise.all([
        getSambaSchoolsByEvent(eventId, ITEMS_PER_PAGE, 0),
        getMusicLyricsByEvent(eventId, ITEMS_PER_PAGE, 0),
      ]);
      setSchools(schoolsData);
      setMusics(musicsData);
      setSchoolsOffset(schoolsData.length);
      setMusicsOffset(musicsData.length);
      setHasMoreSchools(schoolsData.length >= ITEMS_PER_PAGE);
      setHasMoreMusics(musicsData.length >= ITEMS_PER_PAGE);
    } catch (err) {
      showToast("Erro ao atualizar escolas de samba", "error");
    } finally {
      setLoadingSchools(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!eventId || !initialized) return;
    let lastRefreshTime = 0;
    const MIN_REFRESH_INTERVAL = 2000;
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const now = Date.now();
        if (now - lastRefreshTime > MIN_REFRESH_INTERVAL) {
          lastRefreshTime = now;
          refreshSchoolsAndMusics();
        }
      }
    };
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastRefreshTime > MIN_REFRESH_INTERVAL) {
        lastRefreshTime = now;
        refreshSchoolsAndMusics();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, initialized]);

  const handleDelete = async () => {
    if (!event) return;
    setDeleting(true);
    try {
      await deleteEvent(eventId);
      setIsDeleted(true);
      showToast("Evento excluído com sucesso!", "success");
      setDeleteModalOpen(false);
      router.replace("/pages/user/home");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erro ao excluir evento", "error");
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  const handleApprovalChange = async (newValue: boolean) => {
    if (!event) return;
    if (!newValue && pendingCount && pendingCount > 0) {
      setApprovalModalOpen(true);
      return;
    }
    await updateApprovalRequirement(newValue);
  };

  const updateApprovalRequirement = async (requiresApproval: boolean) => {
    if (!event) return;
    setUpdatingApproval(true);
    try {
      const updatedEvent = await updatePostApprovalRequirement(eventId, requiresApproval);
      setEvent(updatedEvent);
      showToast(
        requiresApproval
          ? "Aprovação de posts ativada com sucesso!"
          : "Aprovação desativada. Posts pendentes aprovados automaticamente.",
        "success"
      );
      setApprovalModalOpen(false);
      if (!requiresApproval) {
        setPendingCount(0);
      } else {
        const data = await getPendingPostsCount(eventId);
        setPendingCount(data.pending_count);
      }
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Erro ao atualizar configuração de aprovação", "error");
    } finally {
      setUpdatingApproval(false);
    }
  };

  // ─── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#ffc91f" }} />
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
        <Typography>Evento não encontrado.</Typography>
        <IconButton onClick={() => router.push("/pages/user/home")} sx={{ color: "#fff" }}>
          <ArrowBackIosIcon />
        </IconButton>
      </Box>
    );
  }

  const hasVanInfo = event.van_arrival_time_start || event.van_arrival_time_end || event.van_departure_time_start || event.van_departure_time_end;
  const hasMeetingPoint = event.meeting_point_location || (event.meeting_point_schedule && event.meeting_point_schedule.length > 0);

  const cgFieldSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255,255,255,0.05)",
      color: "#fff",
      "& input": { color: "#fff", "&::-webkit-calendar-picker-indicator": { filter: "invert(1)", cursor: "pointer" } },
      "& textarea": { color: "#fff" },
      "& fieldset": { borderColor: "rgba(255,255,255,0.15)", borderWidth: "1.5px" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
      "&.Mui-focused fieldset": { borderColor: "#ffc91f", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.55)", "&.Mui-focused": { color: "#ffc91f" } },
  };

  const handleCreateGame = async () => {
    if (!cgTitle.trim()) { showToast("O título é obrigatório", "error"); return; }
    setCgLoading(true);
    try {
      await createWorldCupGame(eventId, {
        title: cgTitle.trim(),
        description: cgDescription.trim() || undefined,
        game_date: cgDate || undefined,
        game_time: cgTime || undefined,
        photo: cgPhoto || undefined,
      });
      showToast("Jogo cadastrado com sucesso!", "success");
      // Refresh games list
      const updated = await getWorldCupGames(eventId);
      setWorldCupGames(updated);
      // Reset form and close
      setCgTitle(""); setCgDescription(""); setCgDate(""); setCgTime("");
      setCgPhoto(null); setCgPreview(null);
      setCreateGameOpen(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Erro ao cadastrar jogo", "error");
    } finally {
      setCgLoading(false);
    }
  };

  return (
    <Box
      ref={scrollContainerRef}
      sx={{ ...pageBackgroundSx, minHeight: "100vh", color: "#fff", display: "flex", flexDirection: "column" }}
    >
      {/* ── Sticky header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            onClick={() => router.push("/pages/user/home")}
            size="medium"
            sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" } }}
          >
            <ArrowBackIosIcon fontSize="small" sx={{ ml: 0.5 }} />
          </IconButton>
          <Box>
            <Typography fontWeight={700} sx={{ color: "#fff", fontSize: { xs: "0.95rem", sm: "1.1rem" }, lineHeight: 1.2 }}>
              Detalhes do Evento
            </Typography>
          </Box>
        </Box>

        {isAdmin && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => router.push(`/pages/admin/events/${eventId}/edit`)}
              size="medium"
              sx={{
                color: "#ffc91f",
                border: "1px solid rgba(255,201,31,0.25)",
                borderRadius: 2,
                "&:hover": { backgroundColor: "rgba(255,201,31,0.1)" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setDeleteModalOpen(true)}
              disabled={deleting}
              size="medium"
              sx={{
                color: "#ff3040",
                border: "1px solid rgba(255,48,64,0.25)",
                borderRadius: 2,
                "&:hover": { backgroundColor: "rgba(255,48,64,0.1)" },
              }}
            >
              {deleting ? <CircularProgress size={18} sx={{ color: "#ff3040" }} /> : <DeleteIcon fontSize="small" />}
            </IconButton>
          </Box>
        )}
      </Box>

      {/* ── Hero banner ── */}
      <Box sx={{ position: "relative", width: "100%", height: { xs: 220, sm: 300 }, flexShrink: 0, overflow: "hidden" }}>
        {event.banner_image ? (
          <Box
            component="img"
            src={event.banner_image}
            alt={event.title}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box sx={{ width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(255,201,31,0.15) 0%, rgba(0,0,0,0.8) 100%)" }} />
        )}
        {/* Gradient overlay */}
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }} />
        {/* Title overlay */}
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, px: 3, pb: 3, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2 }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: "#fff", lineHeight: 1.2, textShadow: "0 2px 8px rgba(0,0,0,0.5)", maxWidth: "80%" }}>
            {event.title}
          </Typography>
          <Chip
            label={event.is_active ? "Ativo" : "Inativo"}
            size="small"
            sx={{
              backgroundColor: event.is_active ? "rgba(46,204,113,0.2)" : "rgba(158,158,158,0.2)",
              color: event.is_active ? "#2ecc71" : "#9e9e9e",
              fontWeight: 700,
              border: `1px solid ${event.is_active ? "rgba(46,204,113,0.4)" : "rgba(158,158,158,0.4)"}`,
              backdropFilter: "blur(6px)",
              flexShrink: 0,
            }}
          />
        </Box>
      </Box>

      {/* ── Page content ── */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, maxWidth: 900, width: "100%", mx: "auto", display: "flex", flexDirection: "column", gap: 2.5 }}>

        {/* Sobre o Evento */}
        <SectionCard title="Sobre o Evento" icon={<EventNoteIcon fontSize="small" />}>
          {event.description && (
            <InfoRow label="Descrição">
              <Typography sx={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }}>{event.description}</Typography>
            </InfoRow>
          )}

          {event.location && (
            <InfoRow label="Localização" icon={<LocationOnIcon sx={{ fontSize: "0.8rem" }} />}>
              <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>{event.location}</Typography>
            </InfoRow>
          )}

          {event.event_dates && (
            <InfoRow label="Dias do Evento">
              <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>{formatEventDates(event)}</Typography>
            </InfoRow>
          )}

          {!event.description && !event.location && !event.event_dates && (
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>Sem informações adicionais.</Typography>
          )}
        </SectionCard>

        {/* Período */}
        {(event.starts_at || event.ends_at) && (
          <SectionCard title="Período" icon={<ScheduleIcon fontSize="small" />}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              {event.starts_at && (
                <InfoRow label="Início">
                  <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
                    {new Date(event.starts_at).toLocaleString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                </InfoRow>
              )}
              {event.ends_at && (
                <InfoRow label="Término">
                  <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
                    {new Date(event.ends_at).toLocaleString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                </InfoRow>
              )}
            </Box>
          </SectionCard>
        )}

        {/* Transporte */}
        {hasVanInfo && (
          <SectionCard title="Transporte — Vans" icon={<DirectionsBusIcon fontSize="small" />}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              {(event.van_arrival_time_start || event.van_arrival_time_end) && (
                <InfoRow label="Ida">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={event.van_arrival_time_start ? event.van_arrival_time_start.substring(0, 5) : "—"}
                      size="small"
                      sx={{ backgroundColor: "rgba(255,201,31,0.15)", color: "#ffc91f", fontWeight: 700, border: "1px solid rgba(255,201,31,0.3)" }}
                    />
                    {event.van_arrival_time_start && event.van_arrival_time_end && (
                      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>→</Typography>
                    )}
                    {event.van_arrival_time_end && (
                      <Chip
                        label={event.van_arrival_time_end.substring(0, 5)}
                        size="small"
                        sx={{ backgroundColor: "rgba(255,201,31,0.15)", color: "#ffc91f", fontWeight: 700, border: "1px solid rgba(255,201,31,0.3)" }}
                      />
                    )}
                  </Box>
                </InfoRow>
              )}
              {(event.van_departure_time_start || event.van_departure_time_end) && (
                <InfoRow label="Volta">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={event.van_departure_time_start ? event.van_departure_time_start.substring(0, 5) : "—"}
                      size="small"
                      sx={{ backgroundColor: "rgba(255,201,31,0.15)", color: "#ffc91f", fontWeight: 700, border: "1px solid rgba(255,201,31,0.3)" }}
                    />
                    {event.van_departure_time_start && event.van_departure_time_end && (
                      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>→</Typography>
                    )}
                    {event.van_departure_time_end && (
                      <Chip
                        label={event.van_departure_time_end.substring(0, 5)}
                        size="small"
                        sx={{ backgroundColor: "rgba(255,201,31,0.15)", color: "#ffc91f", fontWeight: 700, border: "1px solid rgba(255,201,31,0.3)" }}
                      />
                    )}
                  </Box>
                </InfoRow>
              )}
            </Box>
          </SectionCard>
        )}

        {/* Meeting Point */}
        {hasMeetingPoint && (
          <SectionCard title="Meeting Point" icon={<MeetingRoomIcon fontSize="small" />}>
            {event.meeting_point_location && (
              <InfoRow label="Local" icon={<LocationOnIcon sx={{ fontSize: "0.8rem" }} />}>
                <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>{event.meeting_point_location}</Typography>
              </InfoRow>
            )}

            {event.meeting_point_schedule && event.meeting_point_schedule.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography sx={{ color: "#ffc91f", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Horários de Funcionamento
                </Typography>
                {event.meeting_point_schedule.map((schedule, index) => (
                  <Box
                    key={index}
                    sx={{ p: 2, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
                      {schedule.days.map((day) => (
                        <Chip
                          key={day}
                          label={`Dia ${day}`}
                          size="small"
                          sx={{ backgroundColor: "rgba(255,201,31,0.1)", color: "#ffc91f", border: "1px solid rgba(255,201,31,0.25)", fontWeight: 700, fontSize: "0.75rem" }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }} />
                      <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>
                        {schedule.start_time} às {schedule.end_time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </SectionCard>
        )}

        {/* Admin: Configurações */}
        {isAdmin && (
          <SectionCard title="Configurações" icon={<ScheduleIcon fontSize="small" />}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: "0.9rem", fontWeight: 600 }}>
                  Aprovação de posts
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", mt: 0.25 }}>
                  {event.requires_post_approval
                    ? "Posts precisam de aprovação antes de aparecer no feed"
                    : "Posts são publicados automaticamente no feed"}
                </Typography>
                {pendingCount !== null && pendingCount > 0 && (
                  <Chip
                    label={`${pendingCount} ${pendingCount === 1 ? "post pendente" : "posts pendentes"}`}
                    size="small"
                    sx={{ mt: 1, backgroundColor: "rgba(255,193,7,0.15)", color: "#ffc107", border: "1px solid rgba(255,193,7,0.3)", fontWeight: 600 }}
                  />
                )}
              </Box>
              <Switch
                checked={event.requires_post_approval}
                onChange={(e) => handleApprovalChange(e.target.checked)}
                disabled={updatingApproval}
                sx={{
                  flexShrink: 0,
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#ffc91f" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#ffc91f" },
                }}
              />
            </Box>
          </SectionCard>
        )}

        {/* Admin: Ações rápidas */}
        {isAdmin && (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1.5 }}>
            {/* Loja */}
            <Button
              variant="outlined"
              startIcon={<StoreIcon fontSize="small" />}
              endIcon={<ChevronRightIcon fontSize="small" />}
              onClick={() => router.push(`/pages/admin/events/${eventId}/products`)}
              sx={{ borderColor: "rgba(255,201,31,0.25)", borderWidth: "1.5px", color: "#ffc91f", fontWeight: 600, py: 1.5, fontSize: "0.875rem", textTransform: "none", borderRadius: 2, justifyContent: "space-between", "&:hover": { borderColor: "#ffc91f", backgroundColor: "rgba(255,201,31,0.07)" } }}
            >
              Loja do Evento
            </Button>
            {/* Adicionar Jogo (world_cup) ou Adicionar Escola (carnival) */}
            {event.event_type === "world_cup" ? (
              <Button
                variant="outlined"
                startIcon={<SportsSoccerIcon fontSize="small" />}
                endIcon={<AddIcon fontSize="small" />}
                onClick={() => setCreateGameOpen(true)}
                sx={{ borderColor: "rgba(255,201,31,0.25)", borderWidth: "1.5px", color: "#ffc91f", fontWeight: 600, py: 1.5, fontSize: "0.875rem", textTransform: "none", borderRadius: 2, justifyContent: "space-between", "&:hover": { borderColor: "#ffc91f", backgroundColor: "rgba(255,201,31,0.07)" } }}
              >
                Adicionar Jogo
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<SchoolIcon fontSize="small" />}
                endIcon={<ChevronRightIcon fontSize="small" />}
                onClick={() => router.push(`/pages/admin/samba-schools/create/${eventId}`)}
                sx={{ borderColor: "rgba(255,201,31,0.25)", borderWidth: "1.5px", color: "#ffc91f", fontWeight: 600, py: 1.5, fontSize: "0.875rem", textTransform: "none", borderRadius: 2, justifyContent: "space-between", "&:hover": { borderColor: "#ffc91f", backgroundColor: "rgba(255,201,31,0.07)" } }}
              >
                Adicionar Escola
              </Button>
            )}
            {/* Line Up */}
            <Button
              variant="outlined"
              startIcon={<QueueMusicIcon fontSize="small" />}
              endIcon={<ChevronRightIcon fontSize="small" />}
              onClick={() => router.push(`/pages/admin/events/${eventId}/lineup`)}
              sx={{ borderColor: "rgba(255,201,31,0.25)", borderWidth: "1.5px", color: "#ffc91f", fontWeight: 600, py: 1.5, fontSize: "0.875rem", textTransform: "none", borderRadius: 2, justifyContent: "space-between", "&:hover": { borderColor: "#ffc91f", backgroundColor: "rgba(255,201,31,0.07)" } }}
            >
              Line Up
            </Button>
          </Box>
        )}

        {/* Jogos da Copa (world_cup only) */}
        {event.event_type === "world_cup" && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <SportsSoccerIcon sx={{ color: "#ffc91f", fontSize: "1.1rem" }} />
                <Typography fontWeight={700} sx={{ color: "#fff", fontSize: "1rem" }}>
                  Jogos
                </Typography>
                {!loadingGames && (
                  <Chip
                    label={worldCupGames.length}
                    size="small"
                    sx={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", height: 20 }}
                  />
                )}
              </Box>
              <IconButton
                onClick={() => {
                  setLoadingGames(true);
                  getWorldCupGames(eventId)
                    .then(setWorldCupGames)
                    .catch(() => {})
                    .finally(() => setLoadingGames(false));
                }}
                disabled={loadingGames}
                size="small"
                sx={{
                  color: "#ffc91f",
                  border: "1px solid rgba(255,201,31,0.2)",
                  borderRadius: 2,
                  "&:hover": { backgroundColor: "rgba(255,201,31,0.08)" },
                  "&:disabled": { color: "rgba(255,201,31,0.3)", borderColor: "rgba(255,201,31,0.1)" },
                }}
              >
                {loadingGames ? <CircularProgress size={16} sx={{ color: "#ffc91f" }} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </Box>

            {loadingGames ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress sx={{ color: "#ffc91f" }} />
              </Box>
            ) : worldCupGames.length === 0 ? (
              <Paper elevation={0} sx={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 3, p: 4, textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)" }}>
                <SportsSoccerIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.2)", mb: 1 }} />
                <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>
                  Nenhum jogo cadastrado.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {worldCupGames.map((game) => (
                  <Paper
                    key={game.id}
                    elevation={0}
                    onClick={() => router.push(`/pages/admin/events/${eventId}/world-cup-games/${game.id}/edit`)}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderRadius: 2.5,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      border: "1px solid rgba(255,255,255,0.07)",
                      display: "flex",
                      alignItems: "center",
                      gap: 0,
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.07)",
                        transform: "translateY(-1px)",
                        border: "1px solid rgba(255,201,31,0.25)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    {game.photo_url && (
                      <Box
                        component="img"
                        src={game.photo_url}
                        alt={game.title}
                        sx={{ width: 72, height: 72, objectFit: "cover", flexShrink: 0 }}
                      />
                    )}
                    {!game.photo_url && (
                      <Box sx={{ width: 72, height: 72, backgroundColor: "rgba(255,201,31,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <SportsSoccerIcon sx={{ color: "#ffc91f", fontSize: "1.6rem" }} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0, px: 2, py: 1.5 }}>
                      <Typography fontWeight={700} sx={{ color: "#fff", fontSize: "0.9375rem", mb: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {game.title}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                        {game.game_date && (
                          <Chip
                            icon={<CalendarTodayIcon sx={{ fontSize: "0.7rem !important" }} />}
                            label={game.game_date.split("-").reverse().join("/")}
                            size="small"
                            sx={{ bgcolor: "rgba(255,201,31,0.12)", color: "#ffc91f", border: "1px solid rgba(255,201,31,0.3)", fontSize: "0.72rem", height: 22, "& .MuiChip-icon": { color: "#ffc91f" } }}
                          />
                        )}
                        {game.game_time && (
                          <Chip
                            icon={<AccessTimeIcon sx={{ fontSize: "0.7rem !important" }} />}
                            label={game.game_time.slice(0, 5)}
                            size="small"
                            sx={{ bgcolor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.14)", fontSize: "0.72rem", height: 22, "& .MuiChip-icon": { color: "rgba(255,255,255,0.5)" } }}
                          />
                        )}
                      </Box>
                    </Box>
                    <ChevronRightIcon sx={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, mr: 1.5 }} />
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Escolas de Samba (carnival only) */}
        {event.event_type !== "world_cup" && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <SchoolIcon sx={{ color: "#ffc91f", fontSize: "1.1rem" }} />
              <Typography fontWeight={700} sx={{ color: "#fff", fontSize: "1rem" }}>
                Escolas de Samba
              </Typography>
              {!loadingSchools && (
                <Chip
                  label={schools.length}
                  size="small"
                  sx={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", height: 20 }}
                />
              )}
            </Box>
            <IconButton
              onClick={refreshSchoolsAndMusics}
              disabled={refreshing || loadingSchools}
              size="small"
              sx={{
                color: "#ffc91f",
                border: "1px solid rgba(255,201,31,0.2)",
                borderRadius: 2,
                "&:hover": { backgroundColor: "rgba(255,201,31,0.08)" },
                "&:disabled": { color: "rgba(255,201,31,0.3)", borderColor: "rgba(255,201,31,0.1)" },
              }}
              title="Atualizar lista"
            >
              {refreshing || loadingSchools ? <CircularProgress size={16} sx={{ color: "#ffc91f" }} /> : <RefreshIcon fontSize="small" />}
            </IconButton>
          </Box>

          {loadingSchools ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress sx={{ color: "#ffc91f" }} />
            </Box>
          ) : schools.length === 0 ? (
            <Paper elevation={0} sx={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 3, p: 4, textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <SchoolIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.2)", mb: 1 }} />
              <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>
                Nenhuma escola de samba cadastrada.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {schools.map((school) => (
                <Paper
                  key={school.id}
                  elevation={0}
                  onClick={() => router.push(`/pages/admin/samba-schools/${eventId}/${school.id}`)}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderRadius: 2.5,
                    p: 2,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.07)",
                      transform: "translateY(-1px)",
                      border: "1px solid rgba(255,201,31,0.25)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  {school.image_url && (
                    <Box
                      component="img"
                      src={school.image_url}
                      alt={school.name}
                      sx={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,201,31,0.2)" }}
                    />
                  )}
                  {!school.image_url && (
                    <Box sx={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: "rgba(255,201,31,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(255,201,31,0.15)" }}>
                      <SchoolIcon sx={{ color: "#ffc91f", fontSize: "1.4rem" }} />
                    </Box>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} sx={{ color: "#fff", fontSize: "0.9375rem", mb: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {school.name}
                    </Typography>
                    {school.description && (
                      <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                        {school.description}
                      </Typography>
                    )}
                  </Box>
                  <ChevronRightIcon sx={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                </Paper>
              ))}

              {hasMoreSchools && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <Button
                    onClick={loadMoreSchools}
                    disabled={loadingMoreSchools}
                    variant="outlined"
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      borderColor: "rgba(255,255,255,0.15)",
                      borderWidth: "1.5px",
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 2,
                      px: 4,
                      "&:hover": { borderColor: "rgba(255,255,255,0.3)", backgroundColor: "rgba(255,255,255,0.05)" },
                    }}
                  >
                    {loadingMoreSchools ? <><CircularProgress size={14} sx={{ color: "#ffc91f", mr: 1 }} />Carregando...</> : "Carregar mais"}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
        )}

        {/* Hidden musics section — keeping structure intact */}
        {false && (
          <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, mb: 3 }}>
            {musics.map((music) => (
              <Paper key={music.id} elevation={0} sx={{ mb: 2, cursor: "pointer" }}
                onClick={() => router.push(`/pages/admin/music-lyrics/${eventId}/${music.id}`)}>
                <Typography>{music.song_name}</Typography>
              </Paper>
            ))}
            {hasMoreMusics && (
              <Button onClick={loadMoreMusics} disabled={loadingMoreMusics}>
                {loadingMoreMusics ? <CircularProgress size={16} sx={{ color: "#ffc91f" }} /> : "Carregar mais músicas"}
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ pb: 2 }} />
      </Box>

      {/* Delete modal */}
      {event && (
        <DeleteEventModal
          open={deleteModalOpen}
          eventTitle={event.title}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}

      {/* ── Create World Cup Game dialog ── */}
      <Dialog
        open={createGameOpen}
        onClose={() => !cgLoading && setCreateGameOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { backgroundColor: "rgba(12,12,12,0.98)", color: "#fff", border: "1px solid rgba(255,201,31,0.18)", borderRadius: 3, backdropFilter: "blur(24px)" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <SportsSoccerIcon sx={{ color: "#ffc91f" }} />
          <Typography fontWeight={700} sx={{ color: "#fff", fontSize: "1.05rem" }}>Novo Jogo</Typography>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          {/* Photo upload */}
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", mb: 0.75 }}>Foto (opcional)</Typography>
            <label htmlFor="cg-photo-input" style={{ cursor: "pointer", display: "block" }}>
              <Box sx={{
                width: "100%", height: cgPreview ? "auto" : 110, borderRadius: 2,
                border: `2px dashed ${cgPreview ? "rgba(255,201,31,0.4)" : "rgba(255,255,255,0.15)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.75,
                backgroundColor: "rgba(255,255,255,0.03)", overflow: "hidden", transition: "border-color 0.2s",
                "&:hover": { borderColor: "#ffc91f" },
              }}>
                {cgPreview ? (
                  <Box component="img" src={cgPreview} alt="preview" sx={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
                ) : (
                  <>
                    <CloudUploadIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 28 }} />
                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>Clique para selecionar</Typography>
                  </>
                )}
              </Box>
              <input id="cg-photo-input" type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) { showToast("Imagem muito grande. Máximo 5MB.", "error"); return; }
                  setCgPhoto(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setCgPreview(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            {cgPreview && (
              <Button size="small" onClick={() => { setCgPhoto(null); setCgPreview(null); }}
                sx={{ mt: 0.5, color: "rgba(255,255,255,0.45)", textTransform: "none", fontSize: "0.75rem" }}>
                Remover foto
              </Button>
            )}
          </Box>

          <TextField
            fullWidth label="Título *" value={cgTitle}
            onChange={(e) => e.target.value.length <= 255 && setCgTitle(e.target.value)}
            disabled={cgLoading} required inputProps={{ maxLength: 255 }}
            helperText={`${cgTitle.length}/255`}
            sx={cgFieldSx}
          />

          <TextField
            fullWidth label="Descrição" value={cgDescription}
            onChange={(e) => setCgDescription(e.target.value)}
            multiline rows={2} disabled={cgLoading}
            sx={cgFieldSx}
          />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <TextField
              fullWidth label="Data" type="date" value={cgDate}
              onChange={(e) => setCgDate(e.target.value)}
              disabled={cgLoading} InputLabelProps={{ shrink: true }} sx={cgFieldSx}
            />
            <TextField
              fullWidth label="Horário" type="time" value={cgTime}
              onChange={(e) => setCgTime(e.target.value)}
              disabled={cgLoading} InputLabelProps={{ shrink: true }} sx={cgFieldSx}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          <Button onClick={() => setCreateGameOpen(false)} disabled={cgLoading}
            sx={{ color: "rgba(255,255,255,0.55)", textTransform: "none", fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateGame}
            variant="contained"
            disabled={cgLoading || !cgTitle.trim()}
            sx={{ backgroundColor: "#ffc91f", color: "#000", fontWeight: 700, textTransform: "none", borderRadius: "999px", px: 3, "&:hover": { backgroundColor: "#e6b800" }, "&:disabled": { backgroundColor: "rgba(255,201,31,0.3)", color: "rgba(0,0,0,0.4)" } }}
          >
            {cgLoading ? <CircularProgress size={18} sx={{ color: "#000" }} /> : "Cadastrar Jogo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval confirmation dialog */}
      <Dialog
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        PaperProps={{ sx: { backgroundColor: "rgba(15,15,15,0.97)", color: "#fff", border: "1px solid rgba(255,201,31,0.2)", borderRadius: 3, backdropFilter: "blur(20px)" } }}
      >
        <DialogTitle sx={{ color: "#ffc91f", fontWeight: 700 }}>Desativar Aprovação de Posts</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255,255,255,0.85)", mb: 2 }}>
            Ao desativar, todos os posts pendentes serão automaticamente aprovados e publicados no feed.
          </DialogContentText>
          {pendingCount !== null && pendingCount > 0 && (
            <Chip
              label={`${pendingCount} ${pendingCount === 1 ? "post pendente será aprovado" : "posts pendentes serão aprovados"}`}
              sx={{ backgroundColor: "rgba(255,193,7,0.15)", color: "#ffc107", border: "1px solid rgba(255,193,7,0.3)", fontWeight: 600 }}
            />
          )}
          <DialogContentText sx={{ color: "rgba(255,255,255,0.55)", mt: 2, fontSize: "0.875rem" }}>
            Deseja continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setApprovalModalOpen(false)} disabled={updatingApproval} sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={() => updateApprovalRequirement(false)}
            variant="contained"
            disabled={updatingApproval}
            sx={{ backgroundColor: "#ffc91f", color: "#000", fontWeight: 700, textTransform: "none", borderRadius: "999px", px: 3, "&:hover": { backgroundColor: "#e6b800" } }}
          >
            {updatingApproval ? <CircularProgress size={18} sx={{ color: "#000" }} /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
