"use client";

import { Box, CircularProgress } from "@mui/material";
import EditEventForm from "@/app/components/admin/events/EditEventForm";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { getThemedPageBackgroundSx } from "@/app/utils/backgroundStyles";

export default function EditEventPage() {
  const pageBackgroundSx = getThemedPageBackgroundSx();
  const { isAdmin, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.id);

  useEffect(() => {
    if (authReady && !isAdmin) {
      router.push("/pages/user/home");
    }
  }, [isAdmin, router, authReady]);

  if (!authReady) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#ffc91f" }} />
      </Box>
    );
  }

  if (!isAdmin || !eventId) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        ...pageBackgroundSx,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <EditEventForm eventId={eventId} />
    </Box>
  );
}

