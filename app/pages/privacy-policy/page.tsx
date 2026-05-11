"use client";

import { Box, Container } from "@mui/material";
import { getEventBackgroundSxByKey } from "@/app/utils/eventBranding";
import PrivacyPolicyContent from "@/app/components/auth/RegisterForm/PrivacyPolicyContent";

const torcidaBackgroundSx = getEventBackgroundSxByKey("n1_torcida");

export default function PrivacyPolicyPage() {
  return (
    <Box sx={{ ...torcidaBackgroundSx, minHeight: "100vh", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            p: { xs: 3, md: 5 },
          }}
        >
          <PrivacyPolicyContent />
        </Box>
      </Container>
    </Box>
  );
}
