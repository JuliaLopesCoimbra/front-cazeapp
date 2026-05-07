import { EventResponse } from "@/app/services/events/eventAppService";

export type EventBrandKey = "default" | "n1_torcida";

export interface EventBrandTheme {
  key: EventBrandKey;
  backgroundMobile: string;
  backgroundDesktop: string;
  tabActiveColor: string;
  footerActiveColor: string;
  primaryButtonBg: string;
  primaryButtonText: string;
  primaryButtonHover: string;
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const EVENT_BRAND_THEMES: Record<EventBrandKey, EventBrandTheme> = {
  default: {
    key: "default",
    backgroundMobile: "/background/dashboard.png",
    backgroundDesktop: "/background/prizebackgroundpc.png",
    tabActiveColor: "#ffc91f",
    footerActiveColor: "#ffc91f",
    primaryButtonBg: "#FFD600",
    primaryButtonText: "#000000",
    primaryButtonHover: "#FFC400",
  },
  n1_torcida: {
    key: "n1_torcida",
    backgroundMobile: "/background/fundo-copa.png",
    backgroundDesktop: "/background/fundo-copa.png",
    tabActiveColor: "#0f935d",
    footerActiveColor: "#0f935d",
    primaryButtonBg: "#0f935d",
    primaryButtonText: "#FFFFFF",
    primaryButtonHover: "#0b7a4e",
  },
};

export const getEventBrandKey = (event?: Pick<EventResponse, "brand_key" | "title"> | null): EventBrandKey => {
  if (!event) return "default";
  if (event.brand_key === "n1_torcida") return "n1_torcida";

  const normalizedTitle = normalize(event.title ?? "");
  if (normalizedTitle === "n1 torcida") return "n1_torcida";

  return "default";
};

export const getEventTheme = (event?: Pick<EventResponse, "brand_key" | "title"> | null): EventBrandTheme =>
  EVENT_BRAND_THEMES[getEventBrandKey(event)];

export const getEventThemeByKey = (brandKey: EventBrandKey = "default"): EventBrandTheme =>
  EVENT_BRAND_THEMES[brandKey] ?? EVENT_BRAND_THEMES.default;

const STORED_EVENT_BRAND_KEY = "selectedEventBrandKey";

export const getStoredEventBrandKey = (): EventBrandKey | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORED_EVENT_BRAND_KEY);
  return stored === "n1_torcida" || stored === "default" ? stored : null;
};

export const setStoredEventBrandKey = (event?: Pick<EventResponse, "brand_key" | "title"> | null): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORED_EVENT_BRAND_KEY, getEventBrandKey(event));
};

export const getEventBackgroundSx = (event?: Pick<EventResponse, "brand_key" | "title"> | null) => {
  const theme = getEventTheme(event);
  return {
    backgroundImage: `url(${theme.backgroundMobile})`,
    backgroundSize: "100% 100vh",
    backgroundRepeat: "repeat",
    backgroundPosition: "0 0",
    backgroundAttachment: "scroll",
    width: "100%",
    boxSizing: "border-box",
    "@media (min-width: 1024px)": {
      backgroundImage: `url(${theme.backgroundDesktop})`,
      backgroundSize: "100% 100svh",
    },
  } as const;
};

export const getEventBackgroundSxByKey = (brandKey: EventBrandKey = "default") => {
  const theme = getEventThemeByKey(brandKey);
  return {
    backgroundImage: `url(${theme.backgroundMobile})`,
    backgroundSize: "100% 100vh",
    backgroundRepeat: "repeat",
    backgroundPosition: "0 0",
    backgroundAttachment: "scroll",
    width: "100%",
    boxSizing: "border-box",
    "@media (min-width: 1024px)": {
      backgroundImage: `url(${theme.backgroundDesktop})`,
      backgroundSize: "100% 100svh",
    },
  } as const;
};

/** Cor de ícones / destaques na UI (ex.: Torcida = verde #0f935d). */
export const getBrandIconColor = (event?: Pick<EventResponse, "brand_key" | "title"> | null): string =>
  getEventTheme(event).footerActiveColor;
