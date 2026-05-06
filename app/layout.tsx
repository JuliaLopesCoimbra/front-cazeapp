import type { Metadata } from "next";
import { Roboto, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { FeedCacheProvider } from './context/FeedCacheContext';
import EmotionCacheProvider from './lib/emotion-cache';
import ThemeProvider from './lib/theme-provider';
import ScrollRestorer from './components/layout/ScrollRestorer';

const gaId = process.env.NEXT_PUBLIC_GA_ID;

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "N1 - Application Event",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo/logo-n1.png", // Caminho do ícone
    apple: "/logo/logo-apple.png",
  },
  // define o nome curto que aparece abaixo do ícone na Home do iOS
  appleWebApp: {
    title: "N1 App",
    statusBarStyle: "default",
    capable: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`${roboto.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      >
        <EmotionCacheProvider>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <FeedCacheProvider>
                  <ScrollRestorer />
                  {children}
                </FeedCacheProvider>
              </ToastProvider>
            </AuthProvider>
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
            await OneSignal.init({ appId: "a5de4e1c-4080-42aa-b221-4b842db43645" });
          });
        `}</Script>
      </body>
    </html>
  );
}
