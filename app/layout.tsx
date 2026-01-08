import type { Metadata } from "next";
import { Geist, Geist_Mono, Patrick_Hand } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { PlayerProvider } from "@/context/PlayerContext";
import GlobalPlayer from "@/components/GlobalPlayer";
import PageLoader from "@/components/PageLoader";
import AuthGuard from "@/components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-patrick-hand",
});

export const metadata: Metadata = {
  title: "Mazzo",
  description: "Discover latest trending songs free on Mazzo",
  icons: {
    icon: [
      {
        url: "/mazzo.png?v=2",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${patrickHand.variable} antialiased`}
      >
        <PlayerProvider>
          <AuthGuard>
            <PageLoader />
            {children}
            <GlobalPlayer />
            <BottomNav />
          </AuthGuard>
        </PlayerProvider>
      </body>
    </html>
  );
}
