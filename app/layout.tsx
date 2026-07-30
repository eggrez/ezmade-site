import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import {
  cabinet,
  montreal,
  satoshi,
  switzer,
} from "@/app/fonts";

import PageTransitionProvider from "@/components/transitions/PageTransitionProvider";
import ProjectTransitionProvider from "@/components/transitions/ProjectTransitionProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import GrainOverlay from "@/components/ui/GrainOverlay";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EZ Production",
  description: "Made easy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={[
        geistSans.variable,
        geistMono.variable,
        montreal.variable,
        cabinet.variable,
        switzer.variable,
        satoshi.variable,
        "h-full antialiased",
      ].join(" ")}
    >
      <body className="min-h-full">
        <PageTransitionProvider>
          <ProjectTransitionProvider>
            {children}
          </ProjectTransitionProvider>
        </PageTransitionProvider>

        <GrainOverlay />
        <CustomCursor />
      </body>
    </html>
  );
}