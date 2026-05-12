"use client";

import { Box } from "@mui/material";
import LineupView from "@/app/components/lineup/LineupView";
import { EventResponse } from "@/app/services/events/eventAppService";
import { getEventBrandKey } from "@/app/utils/eventBranding";

interface LineUpProps {
  eventId: number;
  event?: EventResponse;
}

export default function LineUp({ eventId, event }: LineUpProps) {
  const isTorcida = getEventBrandKey(event) === "n1_torcida";
  const accentColor = isTorcida ? "#0f935d" : "#ffc91f";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        paddingBottom: { xs: "calc(80px + env(safe-area-inset-bottom))", sm: 6 },
      }}
    >
      <LineupView eventId={eventId} accentColor={accentColor} onlyShows={isTorcida} />
    </Box>
  );
}

