import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sillettix.com"),
  title: "SillettiX — Acquiring Businesses Built to Last",
  description:
    "SillettiX is a permanent-capital holding company acquiring profitable, founder-led businesses and operating them for decades — not private equity, not a broker.",
  openGraph: {
    title: "SillettiX — Acquiring Businesses Built to Last",
    description:
      "A permanent-capital holding company acquiring profitable, founder-led businesses and operating them for decades.",
    type: "website",
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
      className={`${spaceGrotesk.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body antialiased">
        {children}
      </body>
    </html>
  );
}
