"use client";

import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import type { FeedTab } from "@/app/components/home/FeedTabs.types";
import { TYPOGRAPHY } from "@/app/constants/designTokens";

export type { FeedTab } from "@/app/components/home/FeedTabs.types";

const TAB_HEIGHT = 46;
const ACTIVE_COLOR = "#F5C900";
const HOVER_COLOR = "#0055B8";

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}

type TabEntry =
  | { kind: "tab";          label: string; value: FeedTab }
  | { kind: "nav";          label: string; href: string }
  | { kind: "featured-tab"; label: string; value: FeedTab };

const TAB_ENTRIES: TabEntry[] = [
  { kind: "tab",          label: "Feed",   value: "all"    },
  { kind: "tab",          label: "Evento", value: "games"  },
  { kind: "featured-tab", label: "Jogos",  value: "brasil" },
  { kind: "nav",          label: "Fotos",  href: "/pages/user/foto" },
  { kind: "nav",          label: "Mapa",   href: "/pages/user/mapa" },
];

function tabButtonSx(isActive: boolean) {
  return {
    position: "relative",
    flex: "1 1 0",
    minWidth: 0,
    height: TAB_HEIGHT,
    px: 0.5,
    border: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
    color: isActive ? ACTIVE_COLOR : "rgba(255,255,255,0.44)",
    cursor: "pointer",
    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
    fontWeight: isActive ? 800 : 700,
    fontSize: 12,
    lineHeight: TYPOGRAPHY.caption.lineHeight,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    textShadow: isActive ? "0 0 5px rgba(245,201,0,0.28)" : "none",
    transition: "color 0.18s ease, text-shadow 0.18s ease",
    "&::after": {
      content: '""',
      position: "absolute",
      left: "16%",
      right: "16%",
      bottom: 0,
      height: 3,
      borderRadius: 999,
      backgroundColor: isActive ? ACTIVE_COLOR : "transparent",
      boxShadow: isActive ? "0 0 6px rgba(245,201,0,0.42)" : "none",
      transition: "background-color 0.18s ease, box-shadow 0.18s ease",
    },
    "&:hover": {
      color: isActive ? ACTIVE_COLOR : HOVER_COLOR,
    },
  };
}

export default function FeedTabs({ active, onChange }: FeedTabsProps) {
  const router = useRouter();

  return (
    <Box
      role="tablist"
      aria-label="Categorias do feed"
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        minHeight: TAB_HEIGHT,
        backgroundColor: "rgba(10,17,40,0.96)",
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
              sx={tabButtonSx(isActive)}
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
              sx={tabButtonSx(false)}
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
            sx={tabButtonSx(isActive)}
          >
            {entry.label}
          </Box>
        );
      })}
    </Box>
  );
}
