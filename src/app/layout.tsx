import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
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
  metadataBase: new URL("https://jaratrade.com"),
  title: {
    default: "Jaratrade - Source authentic Nigerian goods, ship to the UK",
    template: "%s · Jaratrade",
  },
  description:
    "Direct trade between Nigerian exporters and UK importers. Source authentic FMCGs from verified Nigerian markets - Alaba, Aba, Onitsha, Mushin, Balogun and more - with secure payments and integrated logistics.",
  keywords: [
    "Nigerian exports",
    "UK imports",
    "Nigerian wholesalers",
    "Africa to UK trade",
    "B2B marketplace",
    "FMCG marketplace",
    "import export Nigeria",
  ],
  applicationName: "Jaratrade",
  authors: [{ name: "Jaratrade" }],
  creator: "Jaratrade",
  publisher: "Jaratrade",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://jaratrade.com",
    siteName: "Jaratrade",
    title: "Jaratrade - Source authentic Nigerian goods, ship to the UK",
    description:
      "The marketplace that connects verified Nigerian exporters with UK importers. Browse, order, pay and ship - all in one place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaratrade",
    description:
      "Source authentic Nigerian goods, ship to the UK. The trusted B2B marketplace for Nigeria-UK trade.",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
