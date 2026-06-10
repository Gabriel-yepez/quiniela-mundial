import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { StructuredData } from "@/components/structured-data";
import { PublicBackground } from "@/components/public-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quiniela-mundial.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Quiniela Mundial — Predice los resultados",
    template: "%s | Quiniela Mundial",
  },
  description:
    "Participa en la quiniela del Mundial de Fútbol 2026. Predice marcadores de los 104 partidos, compite contra amigos y escala en el ranking. Estados Unidos, México y Canadá.",
  keywords: [
    "quiniela",
    "mundial 2026",
    "predicciones fútbol",
    "world cup 2026",
    "FIFA",
    "pronósticos",
    "marcadores",
    "copa del mundo",
  ],
  authors: [{ name: "Legendsoft" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Quiniela Mundial",
    title: "Quiniela Mundial — Predice los resultados",
    description:
      "Predice los marcadores de los 104 partidos del Mundial. Compite contra amigos y escala en el ranking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiniela Mundial",
    description:
      "Predice los marcadores del Mundial y compite por el primer lugar.",
  },
  robots: {
    index: true,
    follow: true,
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
      <body className="min-h-full bg-[#03030f] font-[family-name:var(--font-geist-sans)] text-white">
        <StructuredData />
        <Providers>
          <div className="relative isolate flex min-h-full flex-col">
            <PublicBackground />
            <div className="relative z-10 flex min-h-full flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
