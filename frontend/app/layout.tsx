import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Providers from "@/components/Providers";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cocospice | Premium Indian Cuisine",
  description: "Authentic Indian flavours delivered to your doorstep.",
  icons: {
    icon: [
      {
        url: '/coco-logo.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/coco-logo.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    apple: {
      url: '/coco-logo.png',
      sizes: '180x180',
      type: 'image/png',
    },
    shortcut: '/coco-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/coco-logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/coco-logo.png" />
        <style>{`
          link[rel="icon"] {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
