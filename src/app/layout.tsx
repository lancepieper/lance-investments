import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.lance.investments";

export const metadata: Metadata = {
  title: {
    default: "lance.investments",
    template: "%s | lance.investments",
  },
  description:
    "Investment insights, market analysis, and financial commentary by Lance Pieper.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "lance.investments",
    title: "lance.investments — Investment Insights by Lance Pieper",
    description:
      "Frameworks and analysis on macroeconomics, technology, and long-term investing. Helping investors navigate complexity with clarity.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "lance.investments — Investment Insights by Lance Pieper",
    description:
      "Frameworks and analysis on macroeconomics, technology, and long-term investing. Helping investors navigate complexity with clarity.",
    creator: "@lancepieper1",
  },
  verification: {
    google: "Mw2Z8m8IeCMJ3yU4gMtjV7RBX7_5i8Z3qdEsDgXiHlo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col`}
      >
        <Header />
        <div className="w-full overflow-hidden h-[120px] md:h-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/banner.png"
            alt="lance.investments banner"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </div>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
