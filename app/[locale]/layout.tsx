import type { Metadata, Viewport } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import LangSwitch from "@/components/LangSwitch";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`h-full antialiased ${locale === "en" ? "font-en" : ""}`}>
      <head>
        <meta
          name="naver-site-verification"
          content="e8e8ec3de6a4457cd84e5f5752897beddce17ace"
        />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.css"
        />
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <header className="fixed top-2 right-4 z-50">
            <LangSwitch />
          </header>
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
