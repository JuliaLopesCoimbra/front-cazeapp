"use client";

import { Box } from "@mui/material";
import type { FeedTab } from "@/app/components/home/FeedTabs.types";
import { CAZE_RADIUS } from "@/app/constants/cazeRadius";
import { COLORS, LAYOUT, SPACING, TYPOGRAPHY } from "@/app/constants/designTokens";

export type { FeedTab } from "@/app/components/home/FeedTabs.types";

const BRASIL_BORDER_GRADIENT =
  "linear-gradient(90deg, #009440 0%, #FFCB00 76.923%)";

const TAB_HEIGHT = 30;
const TAB_BORDER_WIDTH = 1;

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
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    border: `${TAB_BORDER_WIDTH}px solid transparent`,
    backgroundImage: `linear-gradient(${COLORS.surface}, ${COLORS.surface}), ${BRASIL_BORDER_GRADIENT}`,
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  };
}

function inactiveTabSx() {
  return {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    color: COLORS.textSecondary,
    border: `1px solid rgba(0, 0, 0, 0.1)`,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
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
