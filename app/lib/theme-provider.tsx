"use client";

import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";
import { cazeTheme } from "./theme";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return <MUIThemeProvider theme={cazeTheme}>{children}</MUIThemeProvider>;
}
