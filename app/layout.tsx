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
import {
  DEFAULT_SOCIAL_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "creative production",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 3840,
        height: 2160,
        alt: "Fractal Design film by EZ Production",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl("/logo.svg"),
      description: SITE_DESCRIPTION,
      sameAs: [
        "https://www.instagram.com/ez.prdct",
        "https://www.behance.net/eggrez",
        "https://vimeo.com/eggrez",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "en",
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
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
