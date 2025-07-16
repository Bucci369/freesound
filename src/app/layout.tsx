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
  title: "Freesound Explorer | Free Samples & High Quality Music Production Sounds",
  description: "Free, high quality samples and sounds for music production, beatmaking, podcasts, videos and more. Discover and download free samples, loops, sound effects and audio presets for your next music project!",
  keywords: [
    "Free Samples", "Music Production Samples", "High Quality Samples", "Freesound", "Download", "Audio", "Sound Effects", "Loops", "Drum Samples", "Vocal Samples", "Instrument Samples", "Sound Library", "Royalty Free", "Sample Packs", "Music Producer", "Podcast Sound", "Video Soundtrack", "FX", "WAV", "MP3", "Remix", "Beatmaking", "EDM Samples", "Trap Samples", "Hip Hop Samples", "House Samples", "Ambient Sounds", "Field Recording", "Sound Design", "Sample Database", "Kostenlose Samples", "Musik kostenlos", "Sample Download", "Sample Suche", "Sample Qualität", "Sample Plattform", "Sample Sharing", "Sample Community", "free samples", "music production", "high quality samples", "audio samples", "download samples", "royalty free", "sound fx", "sound effects", "sample packs", "music producer", "podcast audio", "video soundtrack", "wav samples", "mp3 samples", "remix tools", "edm samples", "trap samples", "hip hop samples", "house samples", "ambient sounds", "field recordings", "sound design", "sample database", "sample platform", "sample sharing", "sample community"
  ],
  openGraph: {
    title: "Freesound Explorer | Free Samples & High Quality Music Production Sounds",
    description: "Free, high quality samples and sounds for music production, beatmaking, podcasts, videos and more. Discover and download free samples, loops, sound effects and audio presets for your next music project!",
    url: "https://freesound.bucci369.de/",
    siteName: "Freesound Explorer",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/musicstudio.jpg",
        width: 1200,
        height: 630,
        alt: "Free samples for music production, free sounds, high quality audio"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Freesound Explorer | Free Samples & High Quality Music Production Sounds",
    description: "Free, high quality samples and sounds for music production, beatmaking, podcasts, videos and more. Discover and download free samples, loops, sound effects and audio presets for your next music project!",
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
