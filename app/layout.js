import { Geist } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import { SettingsProvider } from "./context/SettingsContext";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Church Finance",
  description: "Tolosa Church Finance Recorder",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Church Finance",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
      <body className={`${geist.variable} font-sans min-h-screen antialiased`}>
        <ThemeProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}