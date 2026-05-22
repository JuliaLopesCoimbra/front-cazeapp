"use client";

import { Box } from "@mui/material";
import type { FeedTab } from "@/app/components/home/FeedTabs.types";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from "@/app/constants/designTokens";

export type { FeedTab } from "@/app/components/home/FeedTabs.types";

const TAB_HEIGHT = 32;

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}

type TabEntry =
  | { kind: "tab"; label: string; value: FeedTab }
  | { kind: "soon"; label: string };

const TAB_ENTRIES: TabEntry[] = [
  { kind: "tab", label: "Home", value: "all" },
  { kind: "tab", label: "Evento", value: "games" },
  { kind: "tab", label: "Bolão", value: "bolao" },
  { kind: "tab", label: "Figurinhas", value: "stickers" },
  { kind: "soon", label: "Fotos" },
  { kind: "soon", label: "Mapa" },
];

function activeTabSx() {
  return {
    backgroundColor: COLORS.yellow,
    color: COLORS.black,
    border: "none",
    boxShadow: "0 2px 8px rgba(246, 196, 0, 0.35)",
  };
}

function inactiveTabSx() {
  return {
    backgroundColor: "#f5efde",
    color: COLORS.textSecondary,
    border: "1px solid #e4d2b7",
  };
}

export default function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <Box
      role="tablist"
      aria-label="Categorias do feed"
      sx={{
        display: "flex",
        gap: `${SPACING.sm}px`,
        overflowX: "auto",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        scrollSnapType: "x proximity",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
        /** Respiro só após o último chip ao rolar até o fim */
        pr: `${LAYOUT.pagePaddingX}px`,
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
                minWidth: 72,
                height: TAB_HEIGHT,
                px: `${SPACING.md}px`,
                borderRadius: CAZE_RADIUS.md,
                ...inactiveTabSx(),
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: TYPOGRAPHY.caption.fontSize,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.5,
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
              minWidth: 72,
              height: TAB_HEIGHT,
              px: `${SPACING.md}px`,
              borderRadius: CAZE_RADIUS.md,
              cursor: "pointer",
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontWeight: isActive ? 700 : 600,
              fontSize: TYPOGRAPHY.caption.fontSize,
              lineHeight: TYPOGRAPHY.caption.lineHeight,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s ease, background-color 0.2s ease",
              ...(isActive ? activeTabSx() : inactiveTabSx()),
            }}
          >
            {entry.label}
          </Box>
        );
      })}
    </Box>
  );
}
