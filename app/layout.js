import { Geist } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import { SettingsProvider } from "./context/SettingsContext";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tolosa Church Finance",
  description: "Church Finance Recorder",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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