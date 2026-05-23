"use client";

import React from "react";
import { Box, Skeleton, Divider } from "@mui/material";

export default function NewsDetailSkeleton() {
  const s = "rgba(0,0,0,0.08)";

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#FFFFFF", display: "flex", flexDirection: "column" }}>
      {/* TopBar placeholder */}
      <Box sx={{ height: 56, borderBottom: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", px: 2 }}>
        <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: s }} />
      </Box>

      {/* Author row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <Skeleton variant="circular" width={38} height={38} sx={{ bgcolor: s }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="35%" height={18} sx={{ bgcolor: s, mb: 0.5 }} />
          <Skeleton variant="text" width="22%" height={14} sx={{ bgcolor: s }} />
        </Box>
      </Box>

      <Box sx={{ flex: 1, pb: 4 }}>
        {/* Image */}
        <Box sx={{ mb: 2, mt: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={320} sx={{ bgcolor: s }} />
        </Box>

        {/* Content */}
        <Box sx={{ px: 2, maxWidth: { xs: "100%", sm: "600px", md: "700px" }, mx: "auto", width: "100%" }}>
          <Skeleton variant="text" width="88%" height={30} sx={{ bgcolor: s, mb: 1 }} />
          <Skeleton variant="text" width="100%" height={18} sx={{ bgcolor: s, mb: 0.75 }} />
          <Skeleton variant="text" width="100%" height={18} sx={{ bgcolor: s, mb: 0.75 }} />
          <Skeleton variant="text" width="80%" height={18} sx={{ bgcolor: s, mb: 2.5 }} />

          {/* Likes */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: s }} />
            <Skeleton variant="text" width={70} height={18} sx={{ bgcolor: s }} />
          </Box>

          {/* Comments */}
          <Skeleton variant="text" width={140} height={18} sx={{ bgcolor: s, mb: 1.5 }} />
          <Divider sx={{ borderColor: "rgba(0,0,0,0.08)", mb: 1.5 }} />

          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: s }} />
                <Box flex={1}>
                  <Box sx={{ backgroundColor: "rgba(0,0,0,0.03)", p: 1.5, borderRadius: 2 }}>
                    <Skeleton variant="text" width="30%" height={14} sx={{ bgcolor: s, mb: 0.5 }} />
                    <Skeleton variant="text" width="100%" height={13} sx={{ bgcolor: s, mb: 0.4 }} />
                    <Skeleton variant="text" width="75%" height={13} sx={{ bgcolor: s }} />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, ml: 1 }}>
                    <Skeleton variant="text" width={55} height={12} sx={{ bgcolor: s }} />
                    <Skeleton variant="circular" width={18} height={18} sx={{ bgcolor: s, ml: 0.5 }} />
                    <Skeleton variant="circular" width={18} height={18} sx={{ bgcolor: s, ml: 0.5 }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}

          {/* Comment input */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 2 }}>
            <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: s }} />
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ bgcolor: s, borderRadius: 2 }} />
            <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: s }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
