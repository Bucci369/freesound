import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";
import { UserProvider } from "../context/UserProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Freesound Explorer | Sounds entdecken & downloaden",
  description: "Entdecke, suche und lade einzigartige Sounds und Samples von Freesound.org. Perfekt für Musikproduktion, Podcasts, Videos und mehr!",
  keywords: [
    "Freesound", "Sounds", "Samples", "Download", "Musik", "Soundeffekte", "Audio", "kostenlos", "Datenbank", "Suche"
  ],
  openGraph: {
    title: "Freesound Explorer | Sounds entdecken & downloaden",
    description: "Entdecke, suche und lade einzigartige Sounds und Samples von Freesound.org. Perfekt für Musikproduktion, Podcasts, Videos und mehr!",
    url: "https://freesound.bucci369.de/",
    siteName: "Freesound Explorer",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/musicstudio.jpg",
        width: 1200,
        height: 630,
        alt: "Freesound Explorer - Sounds entdecken & downloaden"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Freesound Explorer | Sounds entdecken & downloaden",
    description: "Entdecke, suche und lade einzigartige Sounds und Samples von Freesound.org. Perfekt für Musikproduktion, Podcasts, Videos und mehr!",
    images: ["/musicstudio.jpg"]
  },
  alternates: {
    canonical: "https://freesound.bucci369.de/"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="google" content="sitelinkssearchbox" />
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <UserProvider>
          {children}
          <CookieConsent />
        </UserProvider>
      </body>
    </html>
  );
}
