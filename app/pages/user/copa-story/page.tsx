"use client";

import { Box } from "@mui/material";
import TopBar from "@/app/components/layout/TopBar";
import BottomNav from "@/app/components/layout/BottomNav";
import BrazilDivider from "@/app/components/layout/BrazilDivider";
import CopaStoryPostCard from "@/app/components/feed/CopaStoryPostCard";

/**
 * Preview do frame Figma node 1:2 — post Copa com liquid glass.
 * Rota: /pages/user/copa-story (ou conforme rewrite do projeto).
 */
export default function CopaStoryPreviewPage() {
  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#282828", pb: "72px" }}>
      <TopBar title="Casa CazéTV" hideDivider />
      <BrazilDivider />
      <Box sx={{ px: 2, py: 2, maxWidth: 520, mx: "auto" }}>
        <CopaStoryPostCard
          newsId={1}
          authorName="@casacazetv"
          caption="Valendo um total de ZERO reais e..."
          body="Valendo um total de ZERO reais e zero centavos na disputa do bolão da Copa!"
          createdAtLabel="há 2 horas"
          likesCount={1284}
          commentsCount={42}
        />
      </Box>
      <BottomNav />
    </Box>
  );
}
