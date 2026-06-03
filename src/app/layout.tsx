import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "متجر سندك - للبرمجيات والمنتجات الرقمية",
  description: "متجرك الموثوق للبرمجيات والمنتجات الرقمية. كتب إلكترونية، أنظمة إدارة فنادق، وأدوات تقنية احترافية بأسعار مناسبة.",
  keywords: ["متجر سندك", "برمجيات", "كتب إلكترونية", "نظام فندقي", "منتجات رقمية", "اليمن", "صنعاء"],
  authors: [{ name: "متجر سندك" }],
  openGraph: {
    title: "متجر سندك - للبرمجيات والمنتجات الرقمية",
    description: "متجرك الموثوق للبرمجيات والمنتجات الرقمية",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
