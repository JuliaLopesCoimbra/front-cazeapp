"use client";

import { Box } from "@mui/material";
import { motion } from "framer-motion";

export type FeedTab = "all" | "games" | "bolao" | "stickers";

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}

const TABS: { label: string; value: FeedTab }[] = [
  { label: "Tudo", value: "all" },
  { label: "Jogos", value: "games" },
  { label: "Bolão", value: "bolao" },
  { label: "Figurinhas", value: "stickers" },
];

export default function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <Box
      role="tablist"
      aria-label="Filtros do feed"
      sx={{
        backgroundColor: "#282828",
        px: "14px",
        py: "14px",
        display: "flex",
        gap: 1,
        overflowX: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.value;
        return (
          <Box
            key={tab.value}
            component="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            sx={{
              position: "relative",
              flexShrink: 0,
              minWidth: 93,
              height: 29,
              px: 2,
              borderRadius: "15px",
              backgroundColor: "#363636",
              border: "none",
              cursor: "pointer",
              color: isActive ? "#FFFFFF" : "#9E9E9E",
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontWeight: 700,
              fontSize: "0.75rem",
              transition: "color 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isActive && (
              <motion.span
                layoutId="activeTabBorder"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "15px",
                  border: "1px solid #009440",
                  pointerEvents: "none",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>{tab.label}</span>
          </Box>
        );
      })}
    </Box>
  );
}
