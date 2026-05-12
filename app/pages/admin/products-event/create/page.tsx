"use client";

import { Box, CircularProgress } from "@mui/material";
import CreateProductForm from "@/app/components/admin/products-event/CreateProductForm";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { getThemedPageBackgroundSx } from "@/app/utils/backgroundStyles";

function CreateProductContent() {
  const pageBackgroundSx = getThemedPageBackgroundSx();
  const { isAdmin, authReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ? Number(searchParams.get("eventId")) : undefined;

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
          ...pageBackgroundSx,
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
        minHeight: "100vh",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CreateProductForm eventId={eventId} />
    </Box>
  );
}

export default function CreateProductPage() {
  const pageBackgroundSx = getThemedPageBackgroundSx();

  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            ...pageBackgroundSx,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ color: "#ffc91f" }} />
        </Box>
      }
    >
      <CreateProductContent />
    </Suspense>
  );
}

