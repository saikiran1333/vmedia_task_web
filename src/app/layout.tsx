import type { Metadata, Viewport } from "next";
import { Fraunces, Montserrat, Outfit } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

function siteUrl() {
  const value = process.env.SITE_URL?.trim();
  if (value) {
    try {
      return new URL(value);
    } catch {
      return new URL("http://localhost:3000");
    }
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "TribeGreen corporate gifting",
    template: "%s · TribeGreen",
  },
  description: "Browse TribeGreen corporate gifts and send an enquiry. Prices and products come from the Vmedia catalogue.",
  icons: { icon: "/assets/icons/tribegreen-favicon.png" },
  openGraph: {
    title: "TribeGreen corporate gifting",
    description: "Browse the catalogue and send a corporate gifting enquiry.",
    images: ["/assets/banners/home-banner-tablet.webp"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#A33E20",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${montserrat.variable}`}>{children}</body>
    </html>
  );
}
