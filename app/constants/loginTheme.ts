import { CAZE_RADIUS } from "./cazeRadius";

/** Casa CazéTV — fundo da tela de login (9∶19,5 — iPhone / mobile alto) */
export const LOGIN_BG_IMAGE = "/assets/casa-cazetv/Login Bg - cazépp.png";

/** Proporção alvo 9∶19,5; arquivo atual 704×1520. Export retina: 1170×2532 */
export const LOGIN_BG_SIZE = {
  width: 704,
  height: 1520,
  aspectRatio: 9 / 19.5,
} as const;

/** @deprecated Vídeo anterior — mantido só se precisar reverter */
export const LOGIN_BG_VIDEO = "/assets/casa-cazetv/login_bg.mp4";

export const loginColors = {
  yellow: "#FFD100",
  yellowHover: "#E8C000",
  green: "#008542",
  greenHover: "#006d35",
  blue: "#1B3DE8",
  black: "#000000",
  white: "#FFFFFF",
  muted: "rgba(255, 255, 255, 0.85)",
  mutedDim: "rgba(255, 255, 255, 0.7)",
  glassBorder: "rgba(255, 209, 0, 0.15)",
  fieldBg: "rgba(26, 26, 46, 0.6)",
  fieldBgFocus: "rgba(26, 26, 46, 0.85)",
  fieldBorder: "rgba(255, 255, 255, 0.28)",
  fieldBorderHover: "rgba(255, 255, 255, 0.45)",
  error: "#E8175D",
} as const;

export const loginPageSx = {
  root: {
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: { xs: "16px", md: "40px" },
    overflow: "hidden",
  },
  stack: {
    width: "100%",
    maxWidth: { xs: "100%", sm: "420px", md: "450px" },
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
  },
  panel: {
    position: "relative",
    zIndex: 1,
    isolation: "isolate",
    width: "100%",
    maxWidth: { xs: "100%", sm: "420px", md: "450px" },
    padding: { xs: "24px", md: "32px" },
    color: loginColors.white,
    borderRadius: CAZE_RADIUS.md,
    border: `1px solid ${loginColors.glassBorder}`,
    "& > *": {
      position: "relative",
      zIndex: 1,
    },
  },
} as const;

export const LOGIN_PANEL_CLASS = "glass-dark";

export const loginFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: loginColors.fieldBg,
    color: loginColors.white,
    borderRadius: CAZE_RADIUS.sm,
    transition: "all 0.2s ease",
    fontFamily: 'var(--font-inter), Inter, Arial, sans-serif',
    "& fieldset": {
      borderColor: loginColors.fieldBorder,
      borderWidth: "1.5px",
    },
    "&:hover fieldset": {
      borderColor: loginColors.fieldBorderHover,
    },
    "&.Mui-focused fieldset": {
      borderColor: loginColors.yellow,
      borderWidth: "2px",
    },
    "&.Mui-error fieldset": {
      borderColor: loginColors.error,
      borderWidth: "2px",
    },
    "&.Mui-focused": {
      backgroundColor: loginColors.fieldBgFocus,
    },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: `0 0 0 1000px ${loginColors.fieldBg} inset`,
      WebkitTextFillColor: loginColors.white,
      transition: "background-color 9999s ease-in-out 0s",
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: `0 0 0 1000px ${loginColors.fieldBgFocus} inset`,
      WebkitTextFillColor: loginColors.white,
    },
  },
} as const;

export const loginLabelSx = {
  color: loginColors.white,
  fontSize: 13,
  fontFamily: 'var(--font-inter), Inter, Arial, sans-serif',
  transform: "translate(14px, -9px) scale(1)",
  "&.Mui-focused": { color: loginColors.yellow },
} as const;
