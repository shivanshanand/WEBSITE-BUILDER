import { Funnel_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/session-provider";

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bloomsite - Build with Prompts",
  description: "Build amazing websites with simple prompts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${funnelSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-100`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
