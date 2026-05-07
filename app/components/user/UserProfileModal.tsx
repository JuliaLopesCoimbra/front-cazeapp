"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { getUserProfile, ProfileResponse } from "@/app/services/profile/profileService";
import { useToast } from "@/app/context/ToastContext";
import { getEventThemeByKey, getStoredEventBrandKey } from "@/app/utils/eventBranding";

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
  const theme = getEventThemeByKey(brandKey);

  useEffect(() => {
    if (open && userId) {
      loadProfile();
    } else {
      // Limpa o perfil quando fecha
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
      maxWidth="sm"
      fullWidth
      sx={{
        zIndex: 1500, // Z-index maior para ficar acima de outras modais
      }}
      PaperProps={{
        sx: {
          backgroundColor: isTorcida ? "#d4a400" : "#1a1a1a",
          color: isTorcida ? "#000" : "#fff",
          borderRadius: 2,
          boxShadow: isTorcida ? "0 8px 32px rgba(212, 164, 0, 0.55)" : "0 8px 32px rgba(0, 0, 0, 0.5)",
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.85)", // Backdrop mais escuro para destacar
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          pb: 2,
        }}
      >
        Perfil do Usuário
        <IconButton
          onClick={onClose}
          sx={{ color: isTorcida ? "#000" : "#fff" }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress sx={{ color: isTorcida ? "#000" : theme.footerActiveColor }} />
          </Box>
        ) : profile ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Foto de perfil */}
            <Avatar
              src={profile.profile_photo || undefined}
              alt={profile.name || "Usuário"}
              sx={{
                width: 120,
                height: 120,
                bgcolor: "rgba(255,255,255,0.2)",
                border: "3px solid rgba(255,255,255,0.1)",
              }}
            >
              {profile.name?.[0]?.toUpperCase() || "?"}
            </Avatar>

            {/* Nome */}
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{ color: isTorcida ? "#000" : "#fff", textAlign: "center" }}
            >
              {profile.name || "Usuário sem nome"}
            </Typography>

            {/* Membro desde */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1,
              }}
            >
              <CalendarTodayIcon sx={{ color: isTorcida ? "#000" : theme.footerActiveColor, fontSize: 20 }} />
              <Typography
                sx={{
                  color: isTorcida ? "rgba(0,0,0,0.78)" : "rgba(255,255,255,0.7)",
                  fontSize: 14,
                }}
              >
                Membro desde {formatDate(profile.created_at)}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

