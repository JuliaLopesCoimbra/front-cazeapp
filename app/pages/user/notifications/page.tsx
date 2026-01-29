"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Container,
  Paper,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  ArrowBackIos as ArrowBackIosIcon,
} from "@mui/icons-material";
import { useToast } from "@/app/context/ToastContext";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from "@/app/services/notifications/notificationPreferenceService";

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localPreferences, setLocalPreferences] = useState({
    lineup_updated: true,
    news_feed: true,
    interactions: true,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await getNotificationPreferences();
        setPreferences(data);
        setLocalPreferences({
          lineup_updated: data.lineup_updated,
          news_feed: data.news_feed,
          interactions: data.interactions,
        });
      } catch (error) {
        console.error("Erro ao buscar preferências:", error);
        showToast("Erro ao carregar preferências", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [showToast]);

  const handleToggle = (key: keyof typeof localPreferences) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4f7fc",
          backgroundImage: "url(/background/dashboard.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <CircularProgress sx={{ color: "#ffcc01" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        paddingBottom: "72px",
        backgroundColor: "#f4f7fc",
        backgroundImage: "url(/background/dashboard.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Container maxWidth="md" sx={{ paddingTop: 2, paddingBottom: 4 }}>
        {/* Header com botão voltar */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, pl: 1 }}>
          <IconButton
            onClick={() => router.back()}
            sx={{
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <ArrowBackIosIcon />
          </IconButton>
        </Box>

        <Paper
          sx={{
            padding: 4,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              marginBottom: 4,
            }}
          >
            <NotificationsIcon
              sx={{
                fontSize: 64,
                color: "#ffcc01",
              }}
            />
            <Typography
              variant="h4"
              sx={{
                color: "#fff",
                fontWeight: 700,
              }}
            >
              Preferências de Notificações
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                textAlign: "center",
              }}
            >
              Escolha quais tipos de notificações você deseja receber
            </Typography>
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)", mb: 3 }} />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              marginBottom: 4,
            }}
          >
            <Paper
              sx={{
                padding: 3,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localPreferences.lineup_updated}
                    onChange={() => handleToggle("lineup_updated")}
                    sx={{
                      color: "#ffcc01",
                      "&.Mui-checked": {
                        color: "#ffcc01",
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        mb: 0.5,
                      }}
                    >
                      Atualização de Line Up
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Receba notificações quando o line up de um evento for atualizado
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            <Paper
              sx={{
                padding: 3,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localPreferences.news_feed}
                    onChange={() => handleToggle("news_feed")}
                    sx={{
                      color: "#ffcc01",
                      "&.Mui-checked": {
                        color: "#ffcc01",
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        mb: 0.5,
                      }}
                    >
                      Feed de Notícias
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Receba notificações quando novos posts forem publicados
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            <Paper
              sx={{
                padding: 3,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localPreferences.interactions}
                    onChange={() => handleToggle("interactions")}
                    sx={{
                      color: "#ffcc01",
                      "&.Mui-checked": {
                        color: "#ffcc01",
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        mb: 0.5,
                      }}
                    >
                      Interações
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Receba notificações quando alguém curtir ou comentar seu comentário
                    </Typography>
                  </Box>
                }
              />
            </Paper>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            disabled={saving}
            sx={{
              backgroundColor: "#ffcc01",
              color: "#000",
              fontWeight: 700,
              padding: 1.5,
              fontSize: "1.1rem",
              "&:hover": {
                backgroundColor: "#ffd633",
              },
              "&:disabled": {
                backgroundColor: "rgba(255, 204, 1, 0.5)",
                color: "rgba(0, 0, 0, 0.5)",
              },
            }}
          >
            {saving ? <CircularProgress size={24} sx={{ color: "#000" }} /> : "Salvar Preferências"}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotificationsPage;
