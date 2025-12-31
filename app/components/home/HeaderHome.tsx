"use client";

import { Box, Typography, Avatar } from "@mui/material";
import { useEffect, useState } from "react";
import { getMe, MeResponse } from "@/app/services/auth/authService";
import { EventResponse } from "@/app/services/events/eventservice";
import HamburgerMenu from "@/app/components/layout/HamburgerMenu";

interface Props {
  event: EventResponse;
  events: EventResponse[];
  onSelectEvent: (event: EventResponse) => void;
  currentEvent: EventResponse;
}

export default function HomeHeader({
  event,
  events,
  onSelectEvent,
  currentEvent,
}: Props) {
  const [user, setUser] = useState<MeResponse | null>(null);

  useEffect(() => {
    getMe().then(setUser).catch(console.error);
  }, []);

  // const today = new Date().toLocaleDateString("pt-BR", {
  //   weekday: "long",
  //   day: "numeric",
  //   month: "long",
  // });

  if (!user) return null;

  return (
    <Box
      sx={{
        padding: 2,
        borderBottom: "solid 1px rgba(255,255,255,0.2)",
        display: "flex",
        flexDirection: "column",
        gap: 1,
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
        <Box display="flex" alignItems="center" gap={1}>
          <HamburgerMenu
            events={events}
            currentEvent={currentEvent}
            onSelectEvent={onSelectEvent}
          />

          <Typography variant="h6" fontWeight={700}>
            {user.name}
          </Typography>
        </Box>

        {/* DIREITA: AVATAR */}
        <Avatar src={user.photo_url} sx={{ width: 40, height: 40 }} />
      </Box>

      {/* DATA */}
      {/* <Typography variant="body2" sx={{ color: "white" }}>
        {today}
      </Typography> */}

      {/* EVENTO + STATUS */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.4,
        }}
      >
        <Typography
          variant="body1"
          fontWeight={600}
          sx={{ color: "#fff" }}
        >
          {event.title}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.6}>
          <Typography variant="body2" sx={{ color: "white" }}>
            Ambiente ao vivo
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
    </Box>
  );
}
