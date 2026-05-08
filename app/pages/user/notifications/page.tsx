"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Container,
  Paper,
  Switch,
  Button,
  CircularProgress,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { EventResponse, getEvents } from "@/app/services/events/eventAppService";
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  ArrowBackIos as ArrowBackIosIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  Event as EventIcon,
  Article as ArticleIcon,
  MusicNote as MusicNoteIcon,
  Comment as CommentIcon,
  Favorite as FavoriteIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import { useToast } from "@/app/context/ToastContext";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from "@/app/services/notifications/notificationPreferenceService";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  AppNotification,
} from "@/app/services/notifications/notificationService";
import {
  EventBrandKey,
  getBrandIconColor,
  getEventBackgroundSx,
  getEventThemeByKey,
  getStoredEventBrandKey,
  setStoredEventBrandKey,
} from "@/app/utils/eventBranding";

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<EventResponse | null>(null);
  const [storedBrandKey, setStoredBrandKeyState] = useState<EventBrandKey>(
    () => getStoredEventBrandKey() ?? "default"
  );
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const PAGE_SIZE = 10;
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [localPreferences, setLocalPreferences] = useState({
    lineup_updated: true,
    news_feed: true,
    interactions: true,
    new_events: true,
    push_enabled: false,
  });
  const [pushLoading, setPushLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"enable" | "disable" | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await getNotificationPreferences();
        setPreferences(data);
        setLocalPreferences((prev) => ({
          ...prev,
          lineup_updated: data.lineup_updated,
          news_feed: data.news_feed,
          interactions: data.interactions,
          new_events: data.new_events,
          // push_enabled não vem do banco — é gerenciado exclusivamente pelo OneSignal
        }));
      } catch (error) {
        console.error("Erro ao buscar preferências:", error);
        showToast("Erro ao carregar preferências", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [showToast]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyStatus = (OS: any) => {
      const enabled =
        OS.Notifications?.permission === true &&
        OS.User?.PushSubscription?.optedIn === true;
      setLocalPreferences((prev) => ({ ...prev, push_enabled: enabled }));
    };

    // Callback via deferred (roda quando OneSignal estiver pronto)
    (window as any).OneSignalDeferred = (window as any).OneSignalDeferred || [];
    (window as any).OneSignalDeferred.push(applyStatus);

    // Fallback: verifica diretamente após 2s caso OneSignal já esteja inicializado
    const timer = setTimeout(() => {
      const OS = (window as any).OneSignal;
      if (OS?.Notifications) applyStatus(OS);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadCurrentEvent = async () => {
      try {
        const allEvents = await getEvents();
        const savedEventId = localStorage.getItem("selectedEventId");
        const savedId = savedEventId ? parseInt(savedEventId, 10) : NaN;
        const selectedEvent = allEvents.find((event) => event.id === savedId);
        if (selectedEvent) {
          setCurrentEvent(selectedEvent);
          setStoredEventBrandKey(selectedEvent);
          setStoredBrandKeyState(selectedEvent.brand_key === "n1_torcida" ? "n1_torcida" : "default");
        }
      } catch (error) {
        console.error("Erro ao carregar evento atual", error);
      }
    };
    loadCurrentEvent();
  }, []);

  useEffect(() => {
    if (tabValue === 0) {
      fetchNotifications();
    }
  }, [tabValue]);

  useEffect(() => {
    setShouldAnimate(true);
    const timer = setTimeout(() => {
      setShouldAnimate(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [tabValue]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    setNotifications([]);
    setTotal(0);
    try {
      const response = await getNotifications(PAGE_SIZE, 0, false);
      setNotifications(response.notifications);
      setTotal(response.total);
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      showToast("Erro ao carregar notificações", "error");
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchMore = async (offset: number) => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const response = await getNotifications(PAGE_SIZE, offset, false);
      setNotifications((prev) => [...prev, ...response.notifications]);
      setTotal(response.total);
    } catch (error) {
      console.error("Erro ao buscar mais notificações:", error);
      showToast("Erro ao carregar notificações", "error");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  // Infinite scroll — observa o sentinela no fim da lista
  useEffect(() => {
    if (tabValue !== 0) return;
    const sentinel = sentinelRef.current;
    const hasMore = notifications.length < total && total > 0;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore(notifications.length);
        }
      },
      { rootMargin: "120px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [tabValue, notifications.length, total]);

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
      }
    }

    if (notification.related_news_id) {
      if (notification.related_comment_id) {
        router.push(`/pages/news/${notification.related_news_id}?commentId=${notification.related_comment_id}`);
      } else {
        router.push(`/pages/news/${notification.related_news_id}`);
      }
    } else if (notification.related_event_id) {
      if (notification.type === "lineup_updated") {
        router.push(`/pages/events/${notification.related_event_id}/lineup`);
        return;
      }

      try {
        const { getEventById } = await import("@/app/services/events/eventAppService");
        const event = await getEventById(notification.related_event_id);

        if (!event.is_active || event.deleted_at) {
          showToast("Este evento não está disponível no momento", "error");
          setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
          return;
        }

        router.push(`/pages/user/home?event=${notification.related_event_id}&tab=eventos`);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          showToast("Este evento não está disponível ou foi removido", "error");
        } else {
          showToast("Erro ao verificar evento. Tente novamente.", "error");
        }
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast("Todas as notificações foram marcadas como lidas", "success");
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
      showToast("Erro ao marcar notificações como lidas", "error");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("pt-BR");
  };

  const handleToggle = (key: keyof typeof localPreferences) => {
    if (key === "push_enabled") {
      setConfirmAction(localPreferences.push_enabled ? "disable" : "enable");
      return;
    }
    setLocalPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePushToggleConfirm = async () => {
    setConfirmAction(null);
    setPushLoading(true);
    try {
      if (localPreferences.push_enabled) {
        const OS = (window as any).OneSignal;
        if (OS?.User?.PushSubscription) await OS.User.PushSubscription.optOut();
        const updated = { push_enabled: false, lineup_updated: false, news_feed: false, interactions: false, new_events: false };
        await updateNotificationPreferences(updated);
        setLocalPreferences(updated);
        showToast("Notificações push desativadas.", "success");
      } else {
        if (typeof Notification !== "undefined" && Notification.permission === "denied") {
          showToast("Notificações bloqueadas no navegador. Acesse as configurações do site para reativar.", "error");
          return;
        }
        const OS = (window as any).OneSignal;
        if (OS) {
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            await OS.User?.PushSubscription?.optIn?.();
          } else {
            await OS.Slidedown?.promptPush?.();
          }
        }
        const updated = { push_enabled: true, lineup_updated: true, news_feed: true, interactions: true, new_events: true };
        await updateNotificationPreferences(updated);
        setLocalPreferences(updated);
        showToast("Notificações push ativadas!", "success");
      }
    } catch (e: any) {
      showToast("Erro ao atualizar notificações push.", "error");
    } finally {
      setPushLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateNotificationPreferences(localPreferences);
      setPreferences(updated);
      showToast("Preferências salvas com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      showToast("Erro ao salvar preferências", "error");
    } finally {
      setSaving(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_event":
        return <EventIcon sx={{ fontSize: 20, color: "#ffcc01" }} />;
      case "new_post":
        return <ArticleIcon sx={{ fontSize: 20, color: "#ffcc01" }} />;
      case "lineup_updated":
        return <MusicNoteIcon sx={{ fontSize: 20, color: "#ffcc01" }} />;
      case "comment_reply":
      case "post_comment":
        return <CommentIcon sx={{ fontSize: 20, color: "#ffcc01" }} />;
      case "comment_like":
      case "post_like":
        return <FavoriteIcon sx={{ fontSize: 20, color: "#ffcc01" }} />;
      case "post_approved":
      case "post_approved_admin":
        return <CheckCircleIcon sx={{ fontSize: 20, color: "#4caf50" }} />;
      case "post_rejected":
        return <CancelIcon sx={{ fontSize: 20, color: "#f44336" }} />;
      case "post_deactivated":
        return <BlockIcon sx={{ fontSize: 20, color: "#ff9800" }} />;
      default:
        return <NotificationsIcon sx={{ fontSize: 20, color: "#ffcc01" }} />;
    }
  };

  const fallbackTheme = getEventThemeByKey(storedBrandKey);
  const pageBackgroundSx = currentEvent
    ? getEventBackgroundSx(currentEvent)
    : {
        backgroundImage: `url(${fallbackTheme.backgroundMobile})`,
        backgroundSize: "100% 100vh",
        backgroundRepeat: "repeat",
        backgroundPosition: "0 0",
        backgroundAttachment: "scroll",
        width: "100%",
        boxSizing: "border-box",
      };
  const iconAccent = currentEvent ? getBrandIconColor(currentEvent) : fallbackTheme.footerActiveColor;

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", ...pageBackgroundSx }}>
        <CircularProgress sx={{ color: iconAccent }} />
      </Box>
    );
  }

  const prefItems = [
    {
      key: "lineup_updated" as const,
      icon: <MusicNoteIcon sx={{ fontSize: 20, color: "#ffcc01" }} />,
      label: "Atualização de Line Up",
      description: "Quando o line up de um evento for atualizado",
    },
    {
      key: "news_feed" as const,
      icon: <ArticleIcon sx={{ fontSize: 20, color: "#ffcc01" }} />,
      label: "Feed de Notícias",
      description: "Quando novos posts forem publicados",
    },
    {
      key: "interactions" as const,
      icon: <FavoriteIcon sx={{ fontSize: 20, color: "#ffcc01" }} />,
      label: "Interações",
      description: "Curtidas e comentários no seu conteúdo",
    },
    {
      key: "new_events" as const,
      icon: <EventIcon sx={{ fontSize: 20, color: "#ffcc01" }} />,
      label: "Novos Eventos",
      description: "Quando novos eventos forem criados",
    },
  ];

  const switchSx = {
    flexShrink: 0,
    "& .MuiSwitch-switchBase.Mui-checked": { color: "#ffcc01" },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#ffcc01" },
  };

  return (
    <Box sx={{ minHeight: "100vh", ...pageBackgroundSx, paddingBottom: "72px" }}>
      <Container
        maxWidth="md"
        sx={{ pt: { xs: 0, sm: 2 }, pb: 4, px: { xs: 0, sm: 2 }, maxWidth: "100%" }}
      >
        <Box className={shouldAnimate ? "slide-up-animation" : ""}>
          {/* Compact header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 1.25,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              gap: 1,
            }}
          >
            <IconButton onClick={() => router.back()} sx={{ color: "white" }}>
              <ArrowBackIosIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, flex: 1, fontSize: "1.1rem" }}>
              Notificações
            </Typography>
            {tabValue === 0 && unreadCount > 0 && (
              <Chip
                label={unreadCount > 99 ? "99+" : unreadCount}
                size="small"
                sx={{
                  backgroundColor: "#ffcc01",
                  color: "#000",
                  fontWeight: 700,
                  height: 22,
                  fontSize: "0.75rem",
                  mr: 0.5,
                }}
              />
            )}
          </Box>

          {/* Pill tab selector */}
          <Box
            className={shouldAnimate ? "slide-up-delay-1" : ""}
            sx={{ px: 2, pt: 2, pb: 1 }}
          >
            <Box
              sx={{
                display: "flex",
                backgroundColor: "rgba(255,255,255,0.07)",
                borderRadius: "12px",
                p: "4px",
                gap: "4px",
              }}
            >
              {[
                {
                  label: "Notificações",
                  icon: <NotificationsIcon sx={{ fontSize: 16 }} />,
                  badge: unreadCount,
                },
                {
                  label: "Preferências",
                  icon: <SettingsIcon sx={{ fontSize: 16 }} />,
                  badge: 0,
                },
              ].map((t, i) => (
                <Box
                  key={i}
                  onClick={() => setTabValue(i)}
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.75,
                    py: 0.875,
                    borderRadius: "9px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    backgroundColor: tabValue === i ? "rgba(255,204,1,0.18)" : "transparent",
                    border: `1px solid ${tabValue === i ? "rgba(255,204,1,0.35)" : "transparent"}`,
                    userSelect: "none",
                  }}
                >
                  <Box sx={{ color: tabValue === i ? "#ffcc01" : "rgba(255,255,255,0.4)", display: "flex" }}>
                    {t.icon}
                  </Box>
                  <Typography
                    sx={{
                      color: tabValue === i ? "#ffcc01" : "rgba(255,255,255,0.5)",
                      fontSize: "0.85rem",
                      fontWeight: tabValue === i ? 600 : 400,
                      lineHeight: 1,
                    }}
                  >
                    {t.label}
                  </Typography>
                  {i === 0 && t.badge > 0 && (
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        backgroundColor: "#ffcc01",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ color: "#000", fontSize: "0.65rem", fontWeight: 700, lineHeight: 1 }}>
                        {t.badge > 99 ? "99+" : t.badge}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Content */}
          <Box
            className={shouldAnimate ? "slide-up-delay-2" : ""}
            sx={{ px: 2, pb: 3, pt: 1.5 }}
          >
            {tabValue === 0 ? (
              /* ── NOTIFICATIONS TAB ── */
              <>
                {unreadCount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
                    <Button
                      startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
                      size="small"
                      onClick={handleMarkAllAsRead}
                      sx={{
                        color: "#ffcc01",
                        fontSize: "0.8rem",
                        textTransform: "none",
                        "&:hover": { backgroundColor: "rgba(255,204,1,0.08)" },
                      }}
                    >
                      Marcar todas como lidas
                    </Button>
                  </Box>
                )}

                {loadingNotifications ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress sx={{ color: "#ffcc01" }} />
                  </Box>
                ) : notifications.length === 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,204,1,0.08)",
                        border: "1px solid rgba(255,204,1,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <NotificationsIcon sx={{ fontSize: 34, color: "rgba(255,204,1,0.45)" }} />
                    </Box>
                    <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem" }}>
                      Nenhuma notificação por aqui
                    </Typography>
                  </Box>
                ) : (
                  <Paper
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <List sx={{ p: 0 }}>
                      {notifications.map((notification, index) => (
                        <Box key={notification.id}>
                          <ListItem
                            disablePadding
                            sx={{
                              borderLeft: notification.is_read
                                ? "3px solid transparent"
                                : "3px solid #ffcc01",
                              backgroundColor: notification.is_read
                                ? "transparent"
                                : "rgba(255,204,1,0.04)",
                              transition: "background-color 0.2s",
                            }}
                          >
                            <ListItemButton
                              onClick={() => handleNotificationClick(notification)}
                              sx={{
                                py: 1.5,
                                px: 2,
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
                              }}
                            >
                              <Box sx={{ display: "flex", gap: 1.5, width: "100%", minWidth: 0 }}>
                                {/* Avatar or icon */}
                                {notification.related_user || notification.broadcast_sender ? (
                                  <Avatar
                                    src={
                                      (notification.related_user?.profile_photo ||
                                        notification.broadcast_sender?.profile_photo) ||
                                      undefined
                                    }
                                    sx={{ width: 40, height: 40, bgcolor: "rgba(255,204,1,0.2)", flexShrink: 0 }}
                                  >
                                    {(
                                      (notification.related_user?.name ||
                                        notification.broadcast_sender?.name)?.[0] || "U"
                                    ).toUpperCase()}
                                  </Avatar>
                                ) : (
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: "50%",
                                      backgroundColor: "rgba(255,204,1,0.1)",
                                      border: "1px solid rgba(255,204,1,0.18)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {getNotificationIcon(notification.type)}
                                  </Box>
                                )}

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      mb: 0.25,
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        color: "white",
                                        fontWeight: notification.is_read ? 400 : 600,
                                        fontSize: "0.875rem",
                                        flex: 1,
                                        minWidth: 0,
                                      }}
                                    >
                                      {notification.title}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        color: "rgba(255,255,255,0.35)",
                                        fontSize: "0.72rem",
                                        flexShrink: 0,
                                        mt: 0.25,
                                      }}
                                    >
                                      {formatDate(notification.created_at)}
                                    </Typography>
                                  </Box>
                                  <Typography
                                    sx={{
                                      color: "rgba(255,255,255,0.55)",
                                      fontSize: "0.8rem",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {notification.message}
                                  </Typography>
                                </Box>
                              </Box>
                            </ListItemButton>
                          </ListItem>
                          {index < notifications.length - 1 && (
                            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", ml: 7 }} />
                          )}
                        </Box>
                      ))}
                    </List>
                  </Paper>
                )}

                {/* Sentinela de scroll + spinner de "carregando mais" */}
                {notifications.length > 0 && (
                  <>
                    <Box ref={sentinelRef} sx={{ height: 1 }} />
                    {loadingMore && (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 2.5 }}>
                        <CircularProgress size={24} sx={{ color: "#ffcc01" }} />
                      </Box>
                    )}
                    {!loadingMore && notifications.length >= total && total > 0 && (
                      <Typography
                        sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", textAlign: "center", py: 2 }}
                      >
                        Você está em dia com suas notificações
                      </Typography>
                    )}
                  </>
                )}
              </>
            ) : (
              /* ── PREFERENCES TAB ── */
              <>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", mb: 2, textAlign: "center" }}
                >
                  Escolha quais notificações você deseja receber
                </Typography>

                {/* Push master toggle — PRIMEIRO */}
                <Paper
                  sx={{
                    backgroundColor: localPreferences.push_enabled ? "rgba(255,204,1,0.06)" : "rgba(255,255,255,0.04)",
                    borderRadius: "16px",
                    border: `1px solid ${localPreferences.push_enabled ? "rgba(255,204,1,0.2)" : "rgba(255,255,255,0.08)"}`,
                    overflow: "hidden",
                    mb: 2,
                    transition: "background-color 0.2s, border-color 0.2s",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.75, gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        backgroundColor: localPreferences.push_enabled ? "rgba(255,204,1,0.15)" : "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "background-color 0.2s",
                      }}
                    >
                      <NotificationsActiveIcon
                        sx={{ fontSize: 20, color: localPreferences.push_enabled ? "#ffcc01" : "rgba(255,255,255,0.4)" }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
                        Notificações push
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>
                        {localPreferences.push_enabled
                          ? "Notificações ativas neste dispositivo"
                          : "Ative para receber avisos no dispositivo"}
                      </Typography>
                    </Box>
                    {pushLoading ? (
                      <CircularProgress size={20} sx={{ color: "#ffcc01", flexShrink: 0 }} />
                    ) : (
                      <Switch
                        checked={localPreferences.push_enabled}
                        onChange={() => handleToggle("push_enabled")}
                        sx={switchSx}
                      />
                    )}
                  </Box>
                </Paper>

                {/* Sub-preferências — desabilitadas quando push está off */}
                <Paper
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.08)",
                    mb: 3,
                    opacity: localPreferences.push_enabled ? 1 : 0.4,
                    transition: "opacity 0.2s",
                  }}
                >
                  {prefItems.map((item, index) => (
                    <Box key={item.key}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          px: 2,
                          py: 1.75,
                          gap: 1.5,
                          pointerEvents: localPreferences.push_enabled ? "auto" : "none",
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            backgroundColor: "rgba(255,204,1,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ color: "#fff", fontWeight: 500, fontSize: "0.9rem" }}>
                            {item.label}
                          </Typography>
                          <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem" }}>
                            {item.description}
                          </Typography>
                        </Box>
                        <Switch
                          checked={localPreferences[item.key]}
                          onChange={() => handleToggle(item.key)}
                          sx={switchSx}
                        />
                      </Box>
                      {index < prefItems.length - 1 && (
                        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 2 }} />
                      )}
                    </Box>
                  ))}
                </Paper>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSave}
                  disabled={saving || !localPreferences.push_enabled}
                  sx={{
                    borderRadius: "999px",
                    backgroundColor: "#ffc91f",
                    color: "#000",
                    fontWeight: 700,
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    "&:hover": { backgroundColor: "#ffd54f" },
                    "&:disabled": {
                      backgroundColor: "rgba(255,201,31,0.35)",
                      color: "rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  {saving ? (
                    <CircularProgress size={22} sx={{ color: "#000" }} />
                  ) : (
                    "Salvar preferências"
                  )}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Container>

      {/* Modal de confirmação push */}
      <Dialog
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        PaperProps={{
          sx: {
            backgroundColor: "#1a1a2e",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            mx: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: "#fff", fontWeight: 700, pb: 1 }}>
          {confirmAction === "enable" ? "Ativar notificações push" : "Desativar notificações push"}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}>
            {confirmAction === "enable"
              ? "Você receberá notificações do N1 diretamente neste dispositivo. Todas as categorias serão ativadas."
              : "Você não receberá mais nenhuma notificação push do N1 neste dispositivo."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmAction(null)}
            sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none", borderRadius: "8px" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePushToggleConfirm}
            variant="contained"
            sx={{
              backgroundColor: confirmAction === "enable" ? "#ffcc01" : "#f44336",
              color: confirmAction === "enable" ? "#000" : "#fff",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 700,
              "&:hover": {
                backgroundColor: confirmAction === "enable" ? "#ffd54f" : "#d32f2f",
              },
            }}
          >
            {confirmAction === "enable" ? "Ativar" : "Desativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationsPage;
