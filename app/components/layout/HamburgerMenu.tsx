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
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import EventIcon from "@mui/icons-material/Event";

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
  const [open, setOpen] = useState(false);
  const [openEvents, setOpenEvents] = useState(false);

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <MenuIcon sx={{ color: "white" }} />
      </IconButton>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <List sx={{ width: 320 }}>
          {/* AMBIENTE ATUAL */}
          <ListItem>
            <ListItemText
              primary="Ambiente atual"
              secondary={currentEvent?.title ?? "Nenhum evento"}
            />
          </ListItem>

          <Divider />

          {/* BOTÃO EVENTOS */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenEvents(!openEvents)}>
              <EventIcon sx={{ mr: 2 }} />
              <ListItemText primary="Eventos" />
              {openEvents ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          {/* SUBMENU EVENTOS */}
          <Collapse in={openEvents} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {events.map((event) => (
                <ListItem disablePadding key={event.id}>
                  <ListItemButton
                    selected={currentEvent?.id === event.id}
                    onClick={() => {
                      onSelectEvent(event);
                      setOpen(false);
                    }}
                    sx={{
                      pl: 4,
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <Avatar
                      src={event.banner_image}
                      variant="rounded"
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: "#eee",
                      }}
                    />

                    <Box>
                      <Typography fontWeight={600} fontSize={13}>
                        {event.title}
                      </Typography>

                      <Typography fontSize={11} color="text.secondary">
                        {new Date(event.starts_at).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>

          <Divider />

          {/* CONFIGURAÇÕES */}
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemText primary="Configurações" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}
