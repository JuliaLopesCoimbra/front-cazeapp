"use client";

import { Box, Typography, Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Skeleton, Badge, List, ListItem, ListItemButton, Divider, Button, CircularProgress, Paper, Drawer, Checkbox, FormControlLabel } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import EventIcon from "@mui/icons-material/Event";
import ArticleIcon from "@mui/icons-material/Article";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import CommentIcon from "@mui/icons-material/Comment";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import CloseIcon from "@mui/icons-material/Close";
import { getMyTshirtReservation, TshirtReservationMine } from "@/app/services/user/tshirtReservationUserService";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EventResponse } from "@/app/services/events/eventAppService";
import { getProfile, ProfileResponse } from "@/app/services/profile/profileService";
import HamburgerMenu from "@/app/components/layout/HamburgerMenu";
import { useAuth } from "@/app/context/AuthContext";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, AppNotification } from "@/app/services/notifications/notificationService";
import { useToast } from "@/app/context/ToastContext";
import { getEventBrandKey } from "@/app/utils/eventBranding";
import PendingPostsNotification from "@/app/components/admin/pending-posts/PendingPostsNotification";

interface Props {
  event: EventResponse | null;
  events: EventResponse[];
  onSelectEvent: (event: EventResponse) => void;
  currentEvent: EventResponse | null;
  profile?: ProfileResponse | null;
}

export default function HomeHeader({
  event,
  events,
  onSelectEvent,
  currentEvent,
  profile: profileProp,
}: Props) {
  const router = useRouter();
  const { logout, isAuthenticated, isAdminMaster, isSubadmin } = useAuth();
  const canApprovePosts = isAdminMaster || isSubadmin;
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileResponse | null>(profileProp || null);
  const [loadingProfile, setLoadingProfile] = useState(!profileProp);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const notificationsOpen = Boolean(notificationsAnchorEl);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const brandKey = getEventBrandKey(currentEvent || event);
  const isTorcida = brandKey === "n1_torcida";
  const torcidaPopupBg = "#d4a400";
  const [shirtReservation, setShirtReservation] = useState<TshirtReservationMine | null>(null);
  const [shirtLoading, setShirtLoading] = useState(false);
  const [shirtWidgetDismissed, setShirtWidgetDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("shirtWidgetDismissed") === "1";
  });
  const [shirtConfirmOpen, setShirtConfirmOpen] = useState(false);
  const [shirtTicketAck, setShirtTicketAck] = useState(false);

  useEffect(() => {
    // Se o perfil foi passado como prop, não precisa buscar
    if (profileProp) {
      setProfile(profileProp);
      setLoadingProfile(false);
      return;
    }
    
    // Caso contrário, busca o perfil (compatibilidade com outros usos)
    setLoadingProfile(true);
    getProfile()
      .then((data) => {
        setProfile(data);
        setLoadingProfile(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar perfil:", error);
        setLoadingProfile(false);
      });
  }, [profileProp]);

  useEffect(() => {
    if (!isTorcida || !canApprovePosts) return;
    setShirtLoading(true);
    getMyTshirtReservation()
      .then(setShirtReservation)
      .catch(() => setShirtReservation(null))
      .finally(() => setShirtLoading(false));
  }, [isTorcida, canApprovePosts]);

  // Buscar contador de notificações não lidas (apenas se autenticado)
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Erro ao buscar contador de notificações:", error);
      }
    };

    fetchUnreadCount();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Escuta evento de remoção de notificação
    const handleNotificationRemoved = (event: CustomEvent) => {
      const { commentId, type } = event.detail;
      
      if (type === 'comment_like') {
        // Remove a notificação de like da lista local
        setNotifications((prev) => {
          const filtered = prev.filter(
            (n) => !(n.type === 'comment_like' && n.related_comment_id === commentId)
          );
          // Atualiza o contador se a notificação removida não estava lida
          const removedNotification = prev.find(
            (n) => n.type === 'comment_like' && n.related_comment_id === commentId
          );
          if (removedNotification && !removedNotification.is_read) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          return filtered;
        });
        // Atualiza o contador total
        setTotalNotifications((prev) => Math.max(0, prev - 1));
      } else if (type === 'comment_deleted') {
        // Remove todas as notificações relacionadas a este comentário (like, reply e post_comment)
        setNotifications((prev) => {
          const filtered = prev.filter(
            (n) => !(n.related_comment_id === commentId && 
                    (n.type === 'comment_like' || n.type === 'comment_reply' || n.type === 'post_comment'))
          );
          // Conta quantas notificações não lidas foram removidas
          const removedUnreadCount = prev.filter(
            (n) => n.related_comment_id === commentId && 
                   (n.type === 'comment_like' || n.type === 'comment_reply' || n.type === 'post_comment') &&
                   !n.is_read
          ).length;
          if (removedUnreadCount > 0) {
            setUnreadCount((count) => Math.max(0, count - removedUnreadCount));
          }
          // Atualiza o contador total
          const removedCount = prev.filter(
            (n) => n.related_comment_id === commentId && 
                   (n.type === 'comment_like' || n.type === 'comment_reply' || n.type === 'post_comment')
          ).length;
          setTotalNotifications((total) => Math.max(0, total - removedCount));
          return filtered;
        });
      } else if (type === 'post_deleted') {
        // Remove todas as notificações relacionadas a este post (new_post e post_approved)
        const { newsId } = event.detail;
        setNotifications((prev) => {
          const filtered = prev.filter(
            (n) => !(n.related_news_id === newsId && 
                    (n.type === 'new_post' || n.type === 'post_approved'))
          );
          // Conta quantas notificações não lidas foram removidas
          const removedUnreadCount = prev.filter(
            (n) => n.related_news_id === newsId && 
                   (n.type === 'new_post' || n.type === 'post_approved') &&
                   !n.is_read
          ).length;
          if (removedUnreadCount > 0) {
            setUnreadCount((count) => Math.max(0, count - removedUnreadCount));
          }
          // Atualiza o contador total
          const removedCount = prev.filter(
            (n) => n.related_news_id === newsId && 
                   (n.type === 'new_post' || n.type === 'post_approved')
          ).length;
          setTotalNotifications((total) => Math.max(0, total - removedCount));
          return filtered;
        });
      }
    };
    
    window.addEventListener('notificationRemoved', handleNotificationRemoved as EventListener);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationRemoved', handleNotificationRemoved as EventListener);
    };
  }, [isAuthenticated]);

  // Buscar notificações quando o menu abrir
  useEffect(() => {
    if (notificationsOpen) {
      const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
          const response = await getNotifications(20, 0, false);
          setNotifications(response.notifications);
          setUnreadCount(response.unread_count);
          setTotalNotifications(response.total);
          setOffset(20);
          setHasMore(response.notifications.length < response.total);
        } catch (error) {
          console.error("Erro ao buscar notificações:", error);
          showToast("Erro ao carregar notificações", "error");
        } finally {
          setLoadingNotifications(false);
        }
      };
      fetchNotifications();
    } else {
      // Reset quando fechar o popup
      setOffset(0);
      setHasMore(true);
      setNotifications([]);
      setTotalNotifications(0);
    }
  }, [notificationsOpen, showToast]);

  const handleNotificationClick = (notification: AppNotification) => {
    // Fecha o menu imediatamente para melhor UX
    setNotificationsAnchorEl(null);

    // Marcar como lida em background (não bloqueia a navegação)
    if (!notification.is_read) {
      // Atualiza o estado local imediatamente (otimista)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      // Faz a chamada da API em background (fire and forget)
      markAsRead(notification.id).catch((error) => {
        console.error("Erro ao marcar notificação como lida:", error);
        // Reverte o estado se falhar
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: false } : n
          )
        );
        setUnreadCount((prev) => prev + 1);
      });
    }

    // Navega imediatamente sem esperar nada
    if (notification.related_news_id) {
      // Navega diretamente para o post - a página de detalhes tratará se o post não existir
      if (notification.related_comment_id) {
        router.push(`/pages/news/${notification.related_news_id}?commentId=${notification.related_comment_id}`);
      } else {
        router.push(`/pages/news/${notification.related_news_id}`);
      }
    } else if (notification.related_event_id) {
      // Se for notificação de line up, navega diretamente para a página de lineup
      if (notification.type === 'lineup_updated') {
        router.push(`/pages/events/${notification.related_event_id}/lineup`);
      } else {
        router.push(`/pages/user/home?eventId=${notification.related_event_id}&tab=eventos`);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
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
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  const getNotificationIcon = (type: string) => {
    const iconStyle = {
      fontSize: 24,
      color: isTorcida ? "#000000" : "#ffcc01",
    };

    switch (type) {
      case "new_event":
        return <EventIcon sx={iconStyle} />;
      case "new_post":
        return <ArticleIcon sx={iconStyle} />;
      case "lineup_updated":
        return <MusicNoteIcon sx={iconStyle} />;
      case "comment_reply":
      case "post_comment":
        return <CommentIcon sx={iconStyle} />;
      case "comment_like":
        return <FavoriteIcon sx={iconStyle} />;
      case "post_approved":
      case "post_approved_admin":
        return <CheckCircleIcon sx={{ ...iconStyle, color: "#4caf50" }} />;
      case "post_rejected":
        return <CancelIcon sx={{ ...iconStyle, color: "#f44336" }} />;
      case "post_deactivated":
        return <BlockIcon sx={{ ...iconStyle, color: "#ff9800" }} />;
      default:
        return <NotificationsIcon sx={iconStyle} />;
    }
  };

  // Função para carregar mais notificações
  const loadMoreNotifications = async () => {
    if (loadingNotifications || !hasMore) return;
    
    setLoadingNotifications(true);
    try {
      const response = await getNotifications(20, offset, false);
      setNotifications((prev) => {
        const newNotifications = [...prev, ...response.notifications];
        // Verifica se ainda há mais notificações para carregar
        setHasMore(newNotifications.length < totalNotifications);
        return newNotifications;
      });
      setOffset((prev) => prev + 20);
    } catch (error) {
      console.error("Erro ao carregar mais notificações:", error);
      showToast("Erro ao carregar mais notificações", "error");
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Handler para detectar quando chegou no final do scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    // Carrega mais quando está a 100px do final
    if (scrollBottom < 100 && hasMore && !loadingNotifications) {
      loadMoreNotifications();
    }
  };

  // Se está carregando o perfil, mostra skeleton
  if (loadingProfile || !profile) {
    return (
      <Box
        sx={{
          padding: { xs: 2, md: 3, lg: 4 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1, md: 1.5, lg: 2 },
          boxShadow: "inset 0 -20px 24px -12px rgba(0,0,0,0.3)",
        }}
      >
        {/* LINHA SUPERIOR - Skeleton */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* ESQUERDA: HAMBURGER + NOME - Skeleton */}
          <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5, lg: 2 }}>
            <HamburgerMenu
              events={events}
              currentEvent={currentEvent || event}
              onSelectEvent={onSelectEvent}
            />
            <Skeleton
              variant="text"
              width={150}
              height={32}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
          </Box>

          {/* DIREITA: NOTIFICAÇÕES + AVATAR - Skeleton */}
          <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5, lg: 2 }}>
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
          </Box>
        </Box>

        {isTorcida && canApprovePosts && (
          <Skeleton variant="rectangular" height={56} sx={{ bgcolor: "rgba(255,255,255,0.07)", borderRadius: 2 }} />
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: { xs: 2, md: 3, lg: 4 },
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1, md: 1.5, lg: 2 },
        boxShadow: "inset 0 -20px 24px -12px rgba(0,0,0,0.3)",
      }}
    >
      {/* LINHA SUPERIOR */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* ESQUERDA: HAMBURGER + NOME */}
        <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5, lg: 2 }}>
          <HamburgerMenu
            events={events}
            currentEvent={currentEvent || event}
            onSelectEvent={onSelectEvent}
          />

          <Typography 
            variant="h6" 
            fontWeight={700} 
            sx={{ 
              color: "white",
              fontSize: { xs: "1.25rem", md: "1.5rem", lg: "1.75rem" },
            }}
          >
            {profile.name || profile.email}
          </Typography>
        </Box>

        {/* DIREITA: POSTS PENDENTES + NOTIFICAÇÕES + AVATAR */}
        <Box display="flex" alignItems="center" gap={{ xs: 1, md: 1.5, lg: 2 }}>
          {canApprovePosts && currentEvent && (
            <PendingPostsNotification eventId={currentEvent.id} />
          )}
          {isTorcida && canApprovePosts && shirtWidgetDismissed && (
            <IconButton
              onClick={() => {
                if (shirtReservation) {
                  router.push("/pages/user/tshirt-reservation");
                } else {
                  setShirtTicketAck(false);
                  setShirtConfirmOpen(true);
                }
              }}
              sx={{
                color: "rgba(255,255,255,0.6)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                fontSize: { xs: "1.5rem", md: "1.75rem", lg: "2rem" },
              }}
            >
              <CheckroomIcon sx={{ fontSize: "inherit" }} />
            </IconButton>
          )}
          <IconButton
            onClick={(e) => setNotificationsAnchorEl(e.currentTarget)}
            sx={{
              color: "#ffc91f",
              "&:hover": {
                backgroundColor: "rgba(255, 201, 31, 0.14)",
              },
              fontSize: { xs: "1.5rem", md: "1.75rem", lg: "2rem" },
            }}
          >
            <Badge badgeContent={unreadCount > 0 ? unreadCount : 0} color="error" max={99}>
            <NotificationsIcon sx={{ fontSize: "inherit" }} />
            </Badge>
          </IconButton>
          
          <Avatar 
            src={profile.profile_photo || undefined} 
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ 
              width: { xs: 40, md: 56, lg: 64 }, 
              height: { xs: 40, md: 56, lg: 64 },
              border: "2px solid #FFD600",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            {!profile.profile_photo && (profile.name?.[0] || profile.email[0]).toUpperCase()}
          </Avatar>
        </Box>
      </Box>

      {/* DATA */}
      {/* <Typography variant="body2" sx={{ color: "white" }}>
        {today}
      </Typography> */}

      {isTorcida && canApprovePosts && !shirtWidgetDismissed && (
        <Box>
          {shirtLoading ? (
            <Skeleton variant="rectangular" height={62} sx={{ bgcolor: "rgba(255,255,255,0.07)", borderRadius: 2.5 }} />
          ) : shirtReservation ? (
            (() => {
              const isPending = shirtReservation.status === "pending_pickup";
              return (
                <Box
                  onClick={() => router.push("/pages/user/tshirt-reservation")}
                  sx={{
                    display: "flex", alignItems: "center", gap: 1.5,
                    cursor: "pointer",
                    bgcolor: isPending ? "rgba(0,151,57,0.1)" : "rgba(255,255,255,0.04)",
                    borderRadius: 2.5,
                    px: 1.5, py: 1.2,
                    border: isPending ? "1px solid rgba(0,151,57,0.3)" : "1px solid rgba(255,255,255,0.08)",
                    transition: "transform 0.15s",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, bgcolor: isPending ? "#4caf50" : "rgba(255,255,255,0.15)", borderRadius: "3px 0 0 3px" }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, color: isPending ? "#4caf50" : "rgba(255,255,255,0.45)" }}>
                      {isPending ? "Reserva confirmada" : "Camiseta retirada"}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)", mt: 0.3, lineHeight: 1.3 }}>
                      {isPending ? `Tamanho ${shirtReservation.size} · Retire na entrada do evento` : `Tamanho ${shirtReservation.size} · Obrigado pela participação`}
                    </Typography>
                  </Box>
                  <ChevronRightIcon sx={{ color: "rgba(255,255,255,0.2)", fontSize: 17, flexShrink: 0 }} />
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); localStorage.setItem("shirtWidgetDismissed", "1"); setShirtWidgetDismissed(true); }} sx={{ color: "rgba(255,255,255,0.25)", p: 0.3, flexShrink: 0, "&:hover": { color: "rgba(255,255,255,0.6)", bgcolor: "transparent" } }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              );
            })()
          ) : (
            <Box
              onClick={() => { setShirtTicketAck(false); setShirtConfirmOpen(true); }}
              sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2.5, px: 1.5, py: 1.2, border: "1px solid rgba(255,255,255,0.1)", transition: "transform 0.15s", overflow: "hidden", position: "relative" }}
            >
              <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, bgcolor: "rgba(255,255,255,0.2)", borderRadius: "3px 0 0 3px" }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>Camiseta oficial do evento</Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.4)", mt: 0.3, lineHeight: 1.3 }}>Disponível gratuitamente para participantes</Typography>
              </Box>
              <Box sx={{ flexShrink: 0, bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 1.5, px: 1.1, py: 0.5 }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 0.6 }}>GARANTIR</Typography>
              </Box>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); localStorage.setItem("shirtWidgetDismissed", "1"); setShirtWidgetDismissed(true); }} sx={{ color: "rgba(255,255,255,0.25)", p: 0.3, flexShrink: 0, "&:hover": { color: "rgba(255,255,255,0.6)", bgcolor: "transparent" } }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      {/* MENU DE NOTIFICAÇÕES (POPUP) */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={notificationsOpen}
        onClose={() => setNotificationsAnchorEl(null)}
        PaperProps={{
          sx: {
            backgroundColor: isTorcida ? "rgba(240,230,180,0.92)" : "rgba(14,14,14,0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            color: "white",
            borderRadius: "20px",
            width: { xs: "90vw", sm: 380 },
            maxWidth: 380,
            maxHeight: "80vh",
            mt: 1.5,
            boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
            border: isTorcida ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        MenuListProps={{
          sx: { p: 0 },
        }}
      >
        {/* HEADER DO MENU */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2.5,
            py: 2,
            borderBottom: isTorcida ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              sx={{
                color: isTorcida ? "#000" : "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "-0.01em",
              }}
            >
              Notificações
            </Typography>
            {unreadCount > 0 && (
              <Box sx={{
                backgroundColor: "#ffc91f",
                color: "#000",
                borderRadius: "999px",
                fontSize: "0.7rem",
                fontWeight: 700,
                px: 0.8,
                py: 0.1,
                lineHeight: 1.6,
              }}>
                {unreadCount}
              </Box>
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{
                color: isTorcida ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.45)",
                fontSize: "0.72rem",
                textTransform: "none",
                minWidth: "auto",
                px: 1,
                fontWeight: 400,
                "&:hover": {
                  backgroundColor: "transparent",
                  color: isTorcida ? "#000" : "#fff",
                },
              }}
            >
              limpar tudo
            </Button>
          )}
        </Box>

        {/* CONTEÚDO */}
        <Box 
          sx={{ 
            maxHeight: "60vh", 
            overflowY: "auto",
            // Estilização do scrollbar para ficar mais bonito
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "3px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.3)",
              },
            },
          }}
          onScroll={handleScroll}
        >
          {loadingNotifications && notifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress sx={{ color: isTorcida ? "#000" : "#ffcc01" }} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                px: 2,
              }}
            >
              <NotificationsIcon
                sx={{ fontSize: 48, color: isTorcida ? "rgba(0,0,0,0.5)" : "rgba(255, 255, 255, 0.3)", mb: 2 }}
              />
              <Typography
                sx={{
                  color: isTorcida ? "rgba(0,0,0,0.8)" : "rgba(255, 255, 255, 0.7)",
                  textAlign: "center",
                }}
              >
            Ainda não há notificações.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      backgroundColor: notification.is_read
                        ? "transparent"
                        : isTorcida ? "rgba(0,0,0,0.05)" : "rgba(255,201,31,0.05)",
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        py: 1.5,
                        px: 2.5,
                        "&:hover": {
                          backgroundColor: isTorcida ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)",
                        },
                      }}
                    >
                      <Box sx={{ width: "100%", display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                        {/* Ícone ou avatar */}
                        {notification.related_user ? (
                          <Avatar
                            src={notification.related_user.profile_photo || undefined}
                            sx={{
                              width: 38, height: 38,
                              bgcolor: isTorcida ? "rgba(0,0,0,0.14)" : "rgba(255,201,31,0.15)",
                              flexShrink: 0,
                              fontSize: "0.9rem",
                            }}
                          >
                            {!notification.related_user.profile_photo &&
                              (notification.related_user.name?.[0] || "U").toUpperCase()}
                          </Avatar>
                        ) : notification.broadcast_sender ? (
                          <Avatar
                            src={notification.broadcast_sender.profile_photo || undefined}
                            sx={{
                              width: 38, height: 38,
                              bgcolor: isTorcida ? "rgba(0,0,0,0.14)" : "rgba(255,201,31,0.15)",
                              flexShrink: 0,
                              fontSize: "0.9rem",
                            }}
                          >
                            {!notification.broadcast_sender.profile_photo &&
                              (notification.broadcast_sender.name?.[0] || "A").toUpperCase()}
                          </Avatar>
                        ) : (
                          <Box
                            sx={{
                              width: 38, height: 38,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              bgcolor: isTorcida ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)",
                              borderRadius: "50%",
                              flexShrink: 0,
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </Box>
                        )}

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.3}>
                            <Typography
                              sx={{
                                color: isTorcida ? "#000" : "#fff",
                                fontWeight: notification.is_read ? 500 : 700,
                                fontSize: "0.875rem",
                                lineHeight: 1.3,
                              }}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.is_read && (
                              <Box sx={{
                                width: 7, height: 7,
                                borderRadius: "50%",
                                backgroundColor: "#ffc91f",
                                ml: 1, flexShrink: 0,
                              }} />
                            )}
                          </Box>
                          <Typography
                            sx={{
                              color: isTorcida ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.55)",
                              fontSize: "0.8rem",
                              mb: 0.4,
                              lineHeight: 1.4,
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            sx={{
                              color: isTorcida ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.3)",
                              fontSize: "0.7rem",
                            }}
                          >
                            {formatDate(notification.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider sx={{ borderColor: isTorcida ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.05)", mx: 2.5 }} />
                  )}
                </Box>
              ))}
            </List>
          )}
          
          {/* Indicador de carregamento no final (quando está carregando mais) */}
          {loadingNotifications && notifications.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 2,
              }}
            >
              <CircularProgress size={20} sx={{ color: isTorcida ? "#000" : "#ffcc01" }} />
            </Box>
          )}
          
          {/* Mensagem quando não há mais notificações */}
          {!hasMore && notifications.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
              <Typography sx={{
                color: isTorcida ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.2)",
                fontSize: "0.7rem",
              }}>
                — fim —
              </Typography>
            </Box>
          )}
        </Box>
      </Menu>

      {/* MENU DO PERFIL */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            backgroundColor: isTorcida ? "rgba(240,230,180,0.92)" : "rgba(14,14,14,0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "16px",
            minWidth: 180,
            mt: 1.5,
            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            border: isTorcida ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.08)",
            overflow: "hidden",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            router.push("/pages/user/profile");
          }}
          sx={{
            color: isTorcida ? "#000" : "#fff",
            px: 2, py: 1.5,
            gap: 1.5,
            fontSize: "0.9rem",
            "&:hover": {
              backgroundColor: isTorcida ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: "unset" }}>
            <PersonIcon sx={{ color: isTorcida ? "#000" : "rgba(255,255,255,0.7)" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: "0.9rem" }}>Ver Perfil</ListItemText>
        </MenuItem>
        <Divider sx={{ borderColor: isTorcida ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)", mx: 1.5 }} />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            logout();
            router.replace("/");
          }}
          sx={{
            color: isTorcida ? "#000" : "#ffc91f",
            px: 2, py: 1.5,
            gap: 1.5,
            fontSize: "0.9rem",
            "&:hover": {
              backgroundColor: isTorcida ? "rgba(0,0,0,0.06)" : "rgba(255,201,31,0.07)",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: "unset" }}>
            <LogoutIcon sx={{ color: isTorcida ? "#000" : "#ffc91f" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: "0.9rem" }}>Sair</ListItemText>
        </MenuItem>
      </Menu>

      {/* DRAWER DE CONFIRMAÇÃO DE CAMISETA */}
      <Drawer
        anchor="bottom"
        open={shirtConfirmOpen}
        onClose={() => setShirtConfirmOpen(false)}
        sx={{ zIndex: 10000 }}
        PaperProps={{
          sx: {
            borderRadius: "20px 20px 0 0",
            bgcolor: "#fff",
            overflow: "hidden",
          },
        }}
      >
        {/* Handle + header */}
        <Box sx={{ px: 2, pt: 1.5, pb: 1, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <Box sx={{ width: 40, height: 4, bgcolor: "rgba(0,0,0,0.1)", borderRadius: 2, mx: "auto", mb: 1.5 }} />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#111" }}>Reserva de camiseta</Typography>
            <IconButton onClick={() => setShirtConfirmOpen(false)} size="small" sx={{ bgcolor: "rgba(0,0,0,0.06)" }}>
              <CloseIcon fontSize="small" sx={{ color: "rgba(0,0,0,0.6)" }} />
            </IconButton>
          </Box>
        </Box>

        {/* Conteúdo */}
        <Box sx={{ px: 2, pt: 2, pb: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.6)", lineHeight: 1.7 }}>
            A reserva de camisetas é exclusiva para quem comprou ingresso para participar do evento N1.
            Ao confirmar, você declara que está elegível conforme as regras do evento.
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={shirtTicketAck}
                onChange={(_, checked) => setShirtTicketAck(checked)}
                sx={{ color: "rgba(0,0,0,0.3)", "&.Mui-checked": { color: "#111" } }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "rgba(0,0,0,0.75)", lineHeight: 1.5 }}>
                Confirmo que comprei o ingresso para o evento N1
              </Typography>
            }
          />

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setShirtConfirmOpen(false)}
              sx={{
                borderColor: "rgba(0,0,0,0.15)",
                color: "rgba(0,0,0,0.5)",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { borderColor: "rgba(0,0,0,0.3)", bgcolor: "transparent" },
              }}
            >
              Cancelar
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={!shirtTicketAck}
              onClick={() => {
                setShirtConfirmOpen(false);
                router.push("/pages/user/tshirt-reservation");
              }}
              sx={{
                bgcolor: "#ffc91f",
                color: "#000",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
                "&:hover": { bgcolor: "#ffd84d", boxShadow: "none" },
                "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.3)" },
              }}
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
