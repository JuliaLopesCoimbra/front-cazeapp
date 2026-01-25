"use client";

import { Box, CircularProgress } from "@mui/material";
import EditProductForm from "@/app/components/admin/products-event/EditProductForm";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditProductPage() {
  const { isAdmin, authReady } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

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
      <EditProductForm productId={productId} />
    </Box>
  );
}

