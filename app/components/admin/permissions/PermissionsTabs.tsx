"use client";

import { Box, Typography } from "@mui/material";
import { AdminPanelSettings, EditNote, People } from "@mui/icons-material";

interface PermissionsTabsProps {
  value: number;
  onChange: (newValue: number) => void;
  isAdminMaster: boolean;
}

export default function PermissionsTabs({ value, onChange, isAdminMaster }: PermissionsTabsProps) {
  const tabs = [
    ...(isAdminMaster
      ? [{ label: "Admins", icon: <AdminPanelSettings sx={{ fontSize: 16 }} /> }]
      : []),
    { label: "Colunistas", icon: <EditNote sx={{ fontSize: 16 }} /> },
    { label: "Usuários", icon: <People sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(20px)",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.1)",
        p: "4px",
        gap: "4px",
        mb: 3,
      }}
    >
      {tabs.map((tab, i) => (
        <Box
          key={i}
          onClick={() => onChange(i)}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            py: 1,
            borderRadius: "11px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            backgroundColor: value === i ? "rgba(255,204,1,0.18)" : "transparent",
            border: `1px solid ${value === i ? "rgba(255,204,1,0.35)" : "transparent"}`,
            userSelect: "none",
          }}
        >
          <Box sx={{ color: value === i ? "#ffcc01" : "rgba(255,255,255,0.4)", display: "flex" }}>
            {tab.icon}
          </Box>
          <Typography
            sx={{
              color: value === i ? "#ffcc01" : "rgba(255,255,255,0.55)",
              fontSize: { xs: "0.78rem", sm: "0.875rem" },
              fontWeight: value === i ? 600 : 400,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
