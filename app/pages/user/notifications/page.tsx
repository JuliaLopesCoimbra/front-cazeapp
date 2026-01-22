"use client";

import React from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";

const NotificationsPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        paddingBottom: "72px",
        backgroundColor: "#f4f7fc",
        backgroundImage: "url(/background/dashboard.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Container maxWidth="md" sx={{ paddingTop: 4, paddingBottom: 4 }}>
        <Paper
          sx={{
            padding: 4,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              textAlign: "center",
            }}
          >
            <NotificationsIcon
              sx={{
                fontSize: 64,
                color: "#ffcc01",
                marginBottom: 2,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                color: "#fff",
                fontWeight: 700,
                marginBottom: 1,
              }}
            >
              Notificações
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "1.1rem",
              }}
            >
              Esta é uma página de teste para notificações.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                marginTop: 2,
              }}
            >
              Em breve você receberá suas notificações aqui.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotificationsPage;

