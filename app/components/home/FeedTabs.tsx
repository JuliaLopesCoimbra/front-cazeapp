"use client";

import { Box } from "@mui/material";
import { motion } from "framer-motion";
import type { FeedTab } from "@/app/components/home/FeedTabs.types";

export type { FeedTab } from "@/app/components/home/FeedTabs.types";

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}

type TabEntry =
  | { kind: "tab"; label: string; value: FeedTab }
  | { kind: "soon"; label: string };

/** Categorias scrolláveis — alinhado ao Figma (Home, Evento, …) + abas do app */
const TAB_ENTRIES: TabEntry[] = [
  { kind: "tab", label: "Home", value: "all" },
  { kind: "tab", label: "Evento", value: "games" },
  { kind: "tab", label: "Bolão", value: "bolao" },
  { kind: "tab", label: "Figurinhas", value: "stickers" },
  { kind: "soon", label: "Fotos" },
  { kind: "soon", label: "Mapa" },
];

export default function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <Box
      role="tablist"
      aria-label="Categorias do feed"
      sx={{
        backgroundColor: "#282828",
        px: "14px",
        pt: 0,
        pb: 0,
        display: "flex",
        gap: "16px",
        overflowX: "auto",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        scrollSnapType: "x proximity",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {TAB_ENTRIES.map((entry) => {
        if (entry.kind === "soon") {
          return (
            <Box
              key={entry.label}
              component="span"
              sx={{
                flexShrink: 0,
                scrollSnapAlign: "start",
                minWidth: 93,
                height: 29,
                px: 2,
                borderRadius: "15px",
                backgroundColor: "#363636",
                color: "#9E9E9E",
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.65,
              }}
            >
              {entry.label}
            </Box>
          );
        }

        const isActive = active === entry.value;
        return (
          <Box
            key={entry.value}
            component="button"
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(entry.value)}
            sx={{
              position: "relative",
              flexShrink: 0,
              scrollSnapAlign: "start",
              minWidth: 93,
              height: 29,
              px: 2,
              border: "none",
              borderRadius: "15px",
              backgroundColor: "#363636",
              cursor: "pointer",
              color: isActive ? "#FFFFFF" : "#9E9E9E",
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontWeight: 800,
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "visible",
            }}
          >
            {isActive && (
              <>
                <Box
                  aria-hidden
                  sx={{
                    position: "absolute",
                    inset: -3,
                    borderRadius: "16px",
                    background:
                      "linear-gradient(90deg, rgba(0,148,64,0.22) 0%, rgba(255,203,0,0.16) 76.923%)",
                    filter: "blur(4px)",
                    zIndex: 0,
                    pointerEvents: "none",
                  }}
                />
                <motion.span
                  layoutId="feedTabBorder"
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 15,
                    border: "1px solid #009440",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              </>
            )}
            <span style={{ position: "relative", zIndex: 2 }}>{entry.label}</span>
          </Box>
        );
      })}
      <Box sx={{ flexShrink: 0, width: 8 }} aria-hidden />
    </Box>
  );
}
