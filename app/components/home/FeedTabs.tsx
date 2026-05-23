"use client";

import { useRouter } from "next/navigation";
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
  | { kind: "tab";          label: string; value: FeedTab }
  | { kind: "nav";          label: string; href: string }
  | { kind: "featured-tab"; label: string; value: FeedTab };

const TAB_ENTRIES: TabEntry[] = [
  { kind: "tab",          label: "Feed",            value: "all" },
  { kind: "tab",          label: "Evento",          value: "games" },
  { kind: "featured-tab", label: "Jogos do Brasil", value: "brasil" },
  { kind: "nav",          label: "Finder Photo",    href: "/pages/user/foto" },
  { kind: "nav",          label: "Mapa",            href: "/pages/user/mapa" },
];

function activeTabSx() {
  return {
    backgroundColor: COLORS.green,
    color: "#FFFFFF",
    border: "none",
    boxShadow: "0 2px 8px rgba(0,148,64,0.30)",
  };
}

function inactiveTabSx() {
  return {
    backgroundColor: "#FFFFFF",
    color: COLORS.muted,
    border: "1px solid rgba(0,0,0,0.10)",
  };
}

export default function FeedTabs({ active, onChange }: FeedTabsProps) {
  const router = useRouter();

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
        pr: `${LAYOUT.pagePaddingX}px`,
      }}
    >
      {TAB_ENTRIES.map((entry) => {
        if (entry.kind === "featured-tab") {
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
                flexShrink: 0,
                scrollSnapAlign: "start",
                minWidth: 72,
                height: TAB_HEIGHT,
                px: `${SPACING.md}px`,
                borderRadius: CAZE_RADIUS.md,
                cursor: "pointer",
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: TYPOGRAPHY.caption.fontSize,
                lineHeight: TYPOGRAPHY.caption.lineHeight,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s ease, box-shadow 0.2s ease",
                ...(isActive ? activeTabSx() : inactiveTabSx()),
                "&:hover": { backgroundColor: isActive ? "#007a33" : "rgba(0,0,0,0.04)" },
              }}
            >
              {entry.label}
            </Box>
          );
        }

        if (entry.kind === "nav") {
          return (
            <Box
              key={entry.href}
              component="button"
              type="button"
              onClick={() => router.push(entry.href)}
              sx={{
                flexShrink: 0,
                scrollSnapAlign: "start",
                minWidth: 72,
                height: TAB_HEIGHT,
                px: `${SPACING.md}px`,
                borderRadius: CAZE_RADIUS.md,
                cursor: "pointer",
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: TYPOGRAPHY.caption.fontSize,
                lineHeight: TYPOGRAPHY.caption.lineHeight,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s ease, background-color 0.2s ease",
                ...inactiveTabSx(),
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
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
