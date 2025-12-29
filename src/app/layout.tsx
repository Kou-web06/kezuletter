import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "KezuLetter",
  description: "Crete your original message card",
  icons: {
    icon: "/images/favicon.png",
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
  openGraph: {
    title: "KezuLetter",
    description: "プレーリードッグが届ける秘密のスクラッチレター",
    images: ["/images/ogp.png"],
    siteName: "KezuLetter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KezuLetter",
    description: "プレーリードッグが届ける秘密のスクラッチレター",
    images: ["/images/ogp.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
