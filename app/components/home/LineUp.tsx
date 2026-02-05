"use client";

import { Box } from "@mui/material";
import LineupView from "@/app/components/lineup/LineupView";

interface LineUpProps {
  eventId: number;
}

export default function LineUp({ eventId }: LineUpProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        paddingBottom: { xs: "calc(80px + env(safe-area-inset-bottom))", sm: 6 },
      }}
    >
      <LineupView eventId={eventId} />
    </Box>
  );
}

