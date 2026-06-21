import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import { ChurchProvider } from "./context/ChurchContext";
import { SettingsProvider } from "./context/SettingsContext";
import { CacheProvider } from "./context/CacheContext";
import { ToastProvider } from "./components/Toast";

export const metadata = {
  title: "Church Finance",
  description: "Tolosa Church Finance Recorder",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Church Finance",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Church Finance" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-sans min-h-screen antialiased">
        <ThemeProvider>
          <ChurchProvider>
            <SettingsProvider>
              <CacheProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </CacheProvider>
            </SettingsProvider>
          </ChurchProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
