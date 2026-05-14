"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  IconButton,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { getUserProfile, ProfileResponse } from "@/app/services/profile/profileService";
import { useToast } from "@/app/context/ToastContext";
import { getStoredEventBrandKey } from "@/app/utils/eventBranding";

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  userId: number;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function UserProfileModal({
  open,
  onClose,
  userId,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const brandKey = getStoredEventBrandKey() ?? "default";
  const isTorcida = brandKey === "n1_torcida";

  const bgColor = isTorcida ? "#0d2244" : "#1c1c1c";
  const bannerColor = isTorcida ? "#0a1a38" : "#141414";
  const accentColor = isTorcida ? "#1e4a8a" : "#2a2a2a";
  const avatarRing = isTorcida ? "#1e4a8a" : "#333";

  useEffect(() => {
    if (open && userId) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [open, userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile(userId);
      setProfile(data);
    } catch (error: any) {
      console.error("Erro ao carregar perfil do usuário", error);
      if (error.response?.status === 404) {
        showToast("Usuário não encontrado", "error");
      } else {
        showToast("Erro ao carregar perfil", "error");
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{ zIndex: 1500 }}
      PaperProps={{
        sx: {
          backgroundColor: bgColor,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          border: "1px solid rgba(255,255,255,0.06)",
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(6px)",
          },
        },
      }}
    >
      {/* Faixa superior + botão fechar */}
      <Box sx={{ position: "relative", bgcolor: bannerColor, height: 72 }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            bgcolor: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.7)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Conteúdo */}
      <Box sx={{ px: 3, pb: 3.5 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={32} sx={{ color: "rgba(255,255,255,0.3)" }} />
          </Box>
        ) : profile ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Avatar overlapping the banner */}
            <Avatar
              src={profile.profile_photo || undefined}
              alt={profile.name || "Usuário"}
              sx={{
                width: 88,
                height: 88,
                mt: "-44px",
                bgcolor: accentColor,
                border: `3px solid ${avatarRing}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              {profile.name?.[0]?.toUpperCase() || "?"}
            </Avatar>

            {/* Nome */}
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 20,
                mt: 1.5,
                textAlign: "center",
                letterSpacing: "-0.2px",
              }}
            >
              {profile.name || "Usuário sem nome"}
            </Typography>

            {/* Membro desde */}
            <Chip
              icon={<CalendarTodayIcon sx={{ fontSize: "14px !important", color: "rgba(255,255,255,0.5) !important" }} />}
              label={`Membro desde ${formatDate(profile.created_at)}`}
              size="small"
              sx={{
                mt: 1.5,
                bgcolor: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.55)",
                fontSize: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                "& .MuiChip-icon": { ml: 0.5 },
              }}
            />
          </Box>
        ) : null}
      </Box>
    </Dialog>
  );
}
