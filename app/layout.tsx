import type { Metadata } from "next";
import { Roboto, Montserrat, Poppins } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { FeedCacheProvider } from './context/FeedCacheContext';
import EmotionCacheProvider from './lib/emotion-cache';
import ThemeProvider from './lib/theme-provider';
import QueryProvider from './lib/query-provider';
import ScrollRestorer from './components/layout/ScrollRestorer';
import PageTracker from './components/layout/PageTracker';

const gaId = process.env.NEXT_PUBLIC_GA_ID;

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Casa CazéTV",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo/logo-n1.png",
    apple: "/logo/logo-apple.png",
  },
  appleWebApp: {
    title: "Casa CazéTV",
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
        className={`${roboto.variable} ${montserrat.variable} ${poppins.variable} antialiased`}
        style={{ fontFamily: 'var(--font-roboto), Roboto, -apple-system, sans-serif' }}
      >
        <EmotionCacheProvider>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <ToastProvider>
                  <FeedCacheProvider>
                    <ScrollRestorer />
                    <PageTracker />
                    {children}
                  </FeedCacheProvider>
                </ToastProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </EmotionCacheProvider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">{`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID}",
              promptOptions: {
                slidedown: {
                  prompts: [{
                    type: "push",
                    autoPrompt: true,
                    text: {
                      actionMessage: "Ative as notificações para receber atualizações da Casa CazéTV",
                      acceptButton: "Ativar",
                      cancelButton: "Agora não"
                    },
                    delay: { pageViews: 1, timeDelay: 1 }
                  }]
                }
              }
            });
          });
        `}</Script>
      </body>
    </html>
  );
}
