"use client";

import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Divider,
  Avatar,
  Box,
  Typography,
  Collapse,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useAuth } from "@/app/context/AuthContext";
import { EventResponse } from "@/app/services/events/eventservice";
import { useState } from "react";

interface Props {
  events: EventResponse[];
  currentEvent: EventResponse | null;
  onSelectEvent: (event: EventResponse) => void;
}

export default function HamburgerMenu({
  events,
  currentEvent,
  onSelectEvent,
}: Props) {
  const { isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [openEvents, setOpenEvents] = useState(false);
  const router = useRouter();

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <MenuIcon sx={{ color: "white" }} />
      </IconButton>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        sx={{ zIndex: 1400 }}
        PaperProps={{
          sx: {
            minHeight: "100vh",
            backgroundImage: "url(/background/settings.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#000",
          },
        }}
      >
        <List sx={{ width: 320, color: "#fff" }}>
          {/* ───────── HEADER DO DRAWER ───────── */}
          <Box display="flex" alignItems="center" px={2} py={1.5}>
            <IconButton onClick={() => setOpen(false)}>
              <MenuIcon sx={{ color: "white" }} />
            </IconButton>

            <IconButton>
              <Typography fontSize={22} sx={{ color: "#fff" }}>
                Configurações
              </Typography>
            </IconButton>
          </Box>

          {/* ───────── AMBIENTE ATIVO ───────── */}
          <ListItem sx={{ px: 2 }}>
            <Box
              sx={{
                width: "100%",
                backgroundColor: "#6b4eff",
                borderRadius: 2,
                padding: 2,
                display: "flex",
                flexDirection: "column",
                gap: 0.8,
              }}
            >
              {/* TÍTULO */}
              <Typography fontWeight={600} sx={{ color: "#fff", fontSize: 14 }}>
                {currentEvent?.title ?? "Nenhum evento"}
              </Typography>

              {/* STATUS */}
              <Box display="flex" alignItems="center" gap={0.6}>
                <Typography fontSize={12} sx={{ color: "#fff", opacity: 0.9 }}>
                  Ambiente ativo
                </Typography>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#2ecc71",
                    boxShadow: "0 0 6px rgba(46, 204, 113, 0.8)",
                  }}
                />
              </Box>
            </Box>
          </ListItem>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }} />

          {/* ───────── EVENTOS / MUDAR AMBIENTE ───────── */}
          <ListItem disablePadding sx={{ px: 1 }}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* BOTÃO DE ABRIR LISTA */}
              <ListItemButton
                onClick={() => setOpenEvents(!openEvents)}
                sx={{ flex: 1 }}
              >
                <EventIcon sx={{ mr: 2, color: "white" }} />

                <ListItemText
                  primary="Eventos"
                  secondary="Mude de ambiente"
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{
                    sx: { color: "rgba(255,255,255,0.6)" },
                  }}
                />

                {openEvents ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              {/* BOTÃO + (ADMIN) */}
              {isAdmin && (
                <IconButton
                  onClick={() => {
                    console.log("Adicionar evento ou post");
                    // router.push("/admin/events/create") ou news/create
                  }}
                  sx={{
                    mr: 1,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.15)",
                    },
                  }}
                >
                  <AddIcon sx={{ color: "#ffc91f" }} />
                </IconButton>
              )}
            </Box>
          </ListItem>
          {/* ───────── LISTA DE EVENTOS ───────── */}
          <Collapse in={openEvents} timeout="auto" unmountOnExit>
            <ListItemText
              primary="Tudo que você precisa saber"
              secondary="Fique por dentro das notícias de cada evento"
              sx={{
                px: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
              primaryTypographyProps={{
                fontWeight: 600,
                sx: { color: "#fff", lineHeight: 1.2, margin: 1 },
              }}
              secondaryTypographyProps={{
                sx: {
                  color: "rgba(255,255,255,0.6)",
                  margin: 1, // REMOVE margin automático
                  lineHeight: 1.3,
                },
              }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1.5,
                px: 2,
                pb: 2,
                margin: 1,
              }}
            >
              {events.map((event) => {
                const isActive = currentEvent?.id === event.id;

                return (
                  <Box
                    key={event.id}
                    onClick={() => {
                      onSelectEvent(event);
                      setOpen(false);
                    }}
                    sx={{
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    {/* IMAGEM */}
                    <Avatar
                      src={event.banner_image}
                      variant="rounded"
                      sx={{
                        width: "100%",
                        height: 110,
                        borderRadius: 2,
                        backgroundColor: "#222",
                      }}
                    />

                    {/* STATUS (BOLINHA) */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 6,
                        right: 6,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: isActive ? "#2ecc71" : "#9e9e9e",
                        border: "2px solid rgba(0,0,0,0.6)",
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Collapse>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                console.log("Ir para perfil");
                // router.push("/profile")
              }}
            >
              <AccountCircleIcon sx={{ mr: 2, color: "white" }} />

              <ListItemText
                primary="Perfil"
                secondary="Ver e editar perfil"
                primaryTypographyProps={{ fontWeight: 600 }}
                secondaryTypographyProps={{
                  sx: { color: "rgba(255,255,255,0.6)" },
                }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                console.log("Ir para histórico de prêmios");
                // router.push("/rewards/history")
              }}
            >
              <EmojiEventsIcon sx={{ mr: 2, color: "white" }} />

              <ListItemText
                primary="Histórico de prêmios"
                secondary="Prêmios conquistados"
                primaryTypographyProps={{ fontWeight: 600 }}
                secondaryTypographyProps={{
                  sx: { color: "rgba(255,255,255,0.6)" },
                }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                console.log("Ir para conta");
                // router.push("/account/profile")
              }}
            >
              <PersonIcon sx={{ mr: 2, color: "white" }} />

              <ListItemText
                primary="Conta"
                secondary="Dados do perfil"
                primaryTypographyProps={{ fontWeight: 600 }}
                secondaryTypographyProps={{
                  sx: { color: "rgba(255,255,255,0.6)" },
                }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", my: 1 }} />

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                console.log("Ir para ajuda");
                // router.push("/help")
              }}
            >
              <HelpOutlineIcon sx={{ mr: 2, color: "white" }} />

              <ListItemText
                primary="Ajuda"
                secondary="Suporte e dúvidas"
                primaryTypographyProps={{ fontWeight: 600 }}
                secondaryTypographyProps={{
                  sx: { color: "rgba(255,255,255,0.6)" },
                }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

          {/* ───────── SAIR ───────── */}
          <Box display="flex" justifyContent="center" py={2}>
            <ListItemButton
              onClick={() => {
                logout();
                router.replace("/pages/auth/login");
              }}
              sx={{
                justifyContent: "center",
                gap: 1,
                color: "#ffc91f",
              }}
            >
              <LogoutIcon fontSize="small" />
              <Typography fontSize={14}>Sair</Typography>
            </ListItemButton>
          </Box>
        </List>
      </Drawer>
    </>
  );
}
