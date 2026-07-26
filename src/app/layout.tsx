import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MambaQR - Generador de Menú QR y Cartas Digitales",
  description: "Crea tu menú QR en segundos. El mejor generador de cartas digitales con Inteligencia Artificial para restaurantes, bares y cafeterías. Mamba QR te ahorra tiempo.",
  keywords: ["qr", "mamba qr", "menu qr", "generador de menu qr", "carta digital", "menu restaurante qr", "carta qr", "crear menu qr gratis", "mambaqr"],
  authors: [{ name: "MambaQR" }],
  creator: "MambaQR",
  openGraph: {
    title: "MambaQR - Menú QR y Cartas Digitales",
    description: "Generador de cartas digitales con códigos QR e Inteligencia Artificial para tu negocio.",
    siteName: "MambaQR",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MambaQR - Generador de Menú QR",
    description: "Crea y administra cartas digitales con códigos QR para tu negocio con IA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader
          color="#6366f1"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #6366f1,0 0 5px #6366f1"
        />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
