import "@fontsource-variable/funnel-sans";
import "@fontsource-variable/funnel-display";
import "@fontsource-variable/literata";
import "@fontsource-variable/literata/wght-italic.css";
import "./styles/style.css";
import "./styles/refine.css";
import "./styles/theme.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Toaster } from "@/components/Toaster";
import { STORE } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

const description =
  "Ondine: toko aquascape dengan tanaman, batu, kayu, soil, ikan, udang, akuarium, dan peralatan. Pesan lewat WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${STORE.name}: toko aquascape dan studio rangkai`, template: `%s | ${STORE.name}` },
  description,
  applicationName: STORE.name,
  keywords: ["aquascape", "tanaman air", "akuarium", "aquasoil", "ikan hias", "udang hias", "Bandung"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: STORE.name,
    title: `${STORE.name}: toko aquascape dan studio rangkai`,
    description,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#00323e",
  width: "device-width",
  initialScale: 1,
};

const storeLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: STORE.name,
  description: STORE.tagline,
  url: SITE_URL,
  email: STORE.email,
  telephone: STORE.phoneLabel,
  address: { "@type": "PostalAddress", streetAddress: STORE.address, addressCountry: "ID" },
  openingHours: "Mo-Su 10:00-19:00",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a className="skip" href="#app">
          Lewati ke konten
        </a>
        <Header />
        <main id="app" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <Toaster />
        <JsonLd data={storeLd} />
      </body>
    </html>
  );
}
