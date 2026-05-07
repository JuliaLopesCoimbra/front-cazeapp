"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { EventResponse } from "@/app/services/events/eventAppService";
import {
  getEventBrandKey,
  getEventThemeByKey,
  getStoredEventBrandKey,
} from "@/app/utils/eventBranding";

interface NotificationPermissionPopupProps {
  open: boolean;
  onClose: () => void;
  onAllow: () => Promise<void>;
  loading: boolean;
  event?: Pick<EventResponse, "brand_key" | "title"> | null;
}

const NotificationPermissionPopup: React.FC<NotificationPermissionPopupProps> = ({
  open,
  onClose,
  onAllow,
  loading,
  event,
}) => {
  const handleAllow = async () => {
    await onAllow();
  };
  const brandKey = event ? getEventBrandKey(event) : getStoredEventBrandKey() ?? "default";
  const isTorcida = brandKey === "n1_torcida";
  const theme = getEventThemeByKey(brandKey);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: isTorcida ? "#0f935d" : "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: isTorcida ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid rgba(255, 255, 255, 0.1)",
          color: "#fff",
        },
      }}
    >
      <DialogTitle component="div" sx={{ textAlign: "center", pt: 3, pb: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <NotificationsActiveIcon sx={{ fontSize: 48, color: "#fff" }} />
        </Box>
        <Typography variant="h6" component="span" sx={{ fontWeight: 600, color: "#fff" }}>
          Ative as notificações push
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Receba avisos sobre interações nas suas publicações e atualizações dos
          eventos diretamente no navegador. É possível desativar a qualquer
          momento nas preferências de notificações.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: "16px 24px", flexDirection: "column", gap: 1 }}>
        <Button
          onClick={handleAllow}
          disabled={loading}
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: isTorcida ? "rgba(255,255,255,0.2)" : theme.primaryButtonBg,
            color: "#fff",
            fontWeight: 600,
            borderRadius: "14px",
            textTransform: "none",
            py: 1.25,
            "&:hover": {
              backgroundColor: isTorcida ? "rgba(255,255,255,0.28)" : theme.primaryButtonHover,
            },
            "&:disabled": {
              backgroundColor: isTorcida ? "rgba(255,255,255,0.14)" : "rgba(255, 204, 1, 0.5)",
              color: "rgba(255,255,255,0.7)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Ativar notificações"
          )}
        </Button>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="text"
          fullWidth
          sx={{
            color: "#fff",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.12)",
            },
          }}
        >
          Agora não
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPermissionPopup;
