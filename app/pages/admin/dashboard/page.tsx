"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
} from "@mui/material";
import {
  People as PeopleIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  CameraAlt as CameraAltIcon,
  CloudSync as CloudSyncIcon,
  Article as ArticleIcon,
  Casino as RouletteIcon,
  Notifications as NotifIcon,
  TrendingUp as TrendingUpIcon,
  Memory as CpuIcon,
  ArrowBackIos as ArrowBackIosIcon,
} from "@mui/icons-material";
import { useAuth } from "@/app/context/AuthContext";
import { getEventBackgroundSxByKey, getStoredEventBrandKey } from "@/app/utils/eventBranding";

const SECTIONS = [
  {
    slug: "usuarios",
    label: "Usuários",
    icon: <PeopleIcon sx={{ fontSize: 22 }} />,
    color: "#ffcc01",
    description: "Total, novos e crescimento",
  },
  {
    slug: "interacoes",
    label: "Interações",
    icon: <FavoriteIcon sx={{ fontSize: 22 }} />,
    color: "#f48fb1",
    description: "Curtidas e comentários",
  },
  {
    slug: "anuncios",
    label: "Anúncios",
    icon: <VisibilityIcon sx={{ fontSize: 22 }} />,
    color: "#80cbc4",
    description: "Views, cliques e CTR",
  },
  {
    slug: "photo-finder",
    label: "Photo Finder",
    icon: <CameraAltIcon sx={{ fontSize: 22 }} />,
    color: "#ce93d8",
    description: "Uploads, reconhecimentos e downloads",
  },
  {
    slug: "robo-fotos",
    label: "Robô de Fotos",
    icon: <CloudSyncIcon sx={{ fontSize: 22 }} />,
    color: "#a78bfa",
    description: "Status e histórico de indexação",
  },
  {
    slug: "posts",
    label: "Posts",
    icon: <ArticleIcon sx={{ fontSize: 22 }} />,
    color: "#ffb74d",
    description: "Publicados, pendentes e rejeitados",
  },
  {
    slug: "roleta",
    label: "Roleta",
    icon: <RouletteIcon sx={{ fontSize: 22 }} />,
    color: "#aed581",
    description: "Giros e participantes",
  },
  {
    slug: "notificacoes",
    label: "Notificações",
    icon: <NotifIcon sx={{ fontSize: 22 }} />,
    color: "#4fc3f7",
    description: "Envios, taxa de leitura e push",
  },
  {
    slug: "acessos",
    label: "Acessos",
    icon: <TrendingUpIcon sx={{ fontSize: 22 }} />,
    color: "#81d4fa",
    description: "Pageviews, picos e telas populares",
  },
  {
    slug: "infraestrutura",
    label: "Infraestrutura",
    icon: <CpuIcon sx={{ fontSize: 22 }} />,
    color: "#ef9a9a",
    description: "CPU, rede e saúde dos servidores",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isAdminMaster, isSubadmin, authReady } = useAuth();

  const storedBrandKey = getStoredEventBrandKey() ?? "default";
  const backgroundSx = getEventBackgroundSxByKey(storedBrandKey);

  useEffect(() => {
    if (!authReady) return;
    if (!isAdminMaster && !isSubadmin) {
      router.replace("/pages/user/home");
    }
  }, [authReady, isAdminMaster, isSubadmin, router]);

  if (!authReady) return null;

  return (
    <Box sx={{ minHeight: "100vh", paddingBottom: "80px", ...backgroundSx }}>
      <Container maxWidth="md" sx={{ pt: 0, pb: 4, px: { xs: 0, sm: 2 } }}>
        {/* Header */}
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
          <Box>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
              Dashboard
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>
              O que você quer acompanhar?
            </Typography>
          </Box>
        </Box>

        {/* Grid de seções */}
        <Box sx={{ px: 2, pt: 2.5 }}>
          <Grid container spacing={1.5}>
            {SECTIONS.map((section) => (
              <Grid size={6} key={section.slug}>
                <Paper
                  onClick={() => router.push(`/pages/admin/dashboard/${section.slug}`)}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    p: 2,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.09)",
                      border: `1px solid ${section.color}50`,
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 20px ${section.color}15`,
                    },
                    "&:active": { transform: "translateY(0)" },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      backgroundColor: `${section.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ color: section.color, display: "flex" }}>{section.icon}</Box>
                  </Box>
                  <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem", mb: 0.5 }}>
                    {section.label}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", lineHeight: 1.4 }}>
                    {section.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
