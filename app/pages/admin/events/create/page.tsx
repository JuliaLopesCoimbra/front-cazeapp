"use client";

import { Box, CircularProgress } from "@mui/material";
import CreateEventForm from "@/app/components/admin/events/CreateEventForm";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getThemedPageBackgroundSx } from "@/app/utils/backgroundStyles";

export default function CreateEventPage() {
  const pageBackgroundSx = getThemedPageBackgroundSx();
  const { isAdmin, authReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authReady && !isAdmin) {
      router.push("/pages/user/home");
    }
  }, [isAdmin, router, authReady]);

  if (!authReady) {
    return (
      <Box
        sx={{
          ...pageBackgroundSx,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#ffc91f" }} />
      </Box>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Box
      sx={{
        ...pageBackgroundSx,
        minHeight: "100vh",
        height: "100vh",
        overflowY: "auto",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CreateEventForm />
    </Box>
  );
}

