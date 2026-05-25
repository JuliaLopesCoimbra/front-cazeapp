import type { Metadata } from "next";
import { Montserrat, Poppins, Roboto } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { FeedCacheProvider } from './context/FeedCacheContext';
import { MobileMenuProvider } from './context/MobileMenuContext';
import EmotionCacheProvider from './lib/emotion-cache';
import ThemeProvider from './lib/theme-provider';
import QueryProvider from './lib/query-provider';
import ScrollRestorer from './components/layout/ScrollRestorer';
import PageTracker from './components/layout/PageTracker';
import OneSignalInit from './components/onesignal/OneSignalInit';
import LiquidGlassFilters from './components/shared/LiquidGlassFilters';

const gaId = process.env.NEXT_PUBLIC_GA_ID;

// Brand kit: títulos, nav, badges e CTAs.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

// Brand kit: subtítulos, labels e textos auxiliares.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600"],
});

// Brand kit: texto corrido, inputs e conteúdo longo.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Caze App",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/figma/mascot-center.png",
    apple: "/assets/figma/mascot-center.png",
  },
  appleWebApp: {
    title: "Caze App",
    statusBarStyle: "black-translucent",
    capable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${montserrat.variable} ${poppins.variable} ${roboto.variable} antialiased`}
        style={{ fontFamily: 'var(--font-roboto), Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }}
      >
        <LiquidGlassFilters />
        <EmotionCacheProvider>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <ToastProvider>
                  <FeedCacheProvider>
                    <MobileMenuProvider>
                      <ScrollRestorer />
                      <PageTracker />
                      {children}
                    </MobileMenuProvider>
                  </FeedCacheProvider>
                </ToastProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </EmotionCacheProvider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        <OneSignalInit />
      </body>
    </html>
  );
}
