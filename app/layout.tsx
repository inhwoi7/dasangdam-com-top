import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "다상담",
  description: "써니와 함께하는 인생의 지혜로운 쉼터",
  verification: {
    google: "W0-t8K56UwaiZXNMr9KFJC7uf8D86ojgRTurzg9kqO0",
  },
  openGraph: {
    title: "다상담",
    description: "써니와 함께하는 인생의 지혜로운 쉼터",
    url: "https://dasangdam.com",
    siteName: "다상담",
    images: [
      {
        url: "https://dasangdam.com/og-image.png?v=2",
        width: 1200,
        height: 630,
        alt: "다상담",
      },
    ],
    locale: "ko_KR",
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
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* 네이버 서치어드바이저 인증 */}
        <meta name="naver-site-verification" content="e8e8ec3de6a4457cd84e5f5752897beddce17ace" />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S51L4W52NK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S51L4W52NK');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
