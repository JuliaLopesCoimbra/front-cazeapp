/**
 * Fundo fixo: sempre dashboard.png (Home e Enredo).
 */
export const dashboardOnlySx = {
  backgroundImage: "url(/background/dashboard.png)",
  backgroundSize: "100% 100vh",
  backgroundRepeat: "repeat",
  backgroundPosition: "0 0",
  backgroundAttachment: "scroll",
  width: "100%",
  boxSizing: "border-box",
} as const;

/**
 * Fundo responsivo (Eventos e Foto IA):
 * - Tela estreita → dashboard.png
 * - Tela larga (min-width 1024px) → prizebackgroundpc.png
 */
export const dashboardBackgroundSx = {
  ...dashboardOnlySx,
  /* Horizontal/largo (PC): prizebackgroundpc.png - min-width mais confiável que orientation no desktop */
  "@media (min-width: 1024px)": {
    backgroundImage: "url(/background/prizebackgroundpc.png)",
    /* 100svh = altura visível da viewport no PC, evita telha “cortar” no meio da tela */
    backgroundSize: "100% 100svh",
  },
} as const;
