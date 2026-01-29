// @TASK P0-T0.2, P7-T7.8 - Roomy 레이아웃 + Pretendard 폰트 + 최적화
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "./providers";

// @TASK P7-T7.8 - Pretendard 폰트 (CDN 방식)
// globals.css에서 CDN으로 Pretendard 폰트 로드

// @TASK P7-T7.4 - 메타데이터 및 SEO 최적화
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.co.kr'
  ),
  title: {
    default: 'Roomy - 게스트 가이드북',
    template: '%s | Roomy',
  },
  description:
    '에어비앤비 링크 하나로 게스트 가이드북을 자동 생성하세요. AI가 숙소 정보를 분석하여 모바일 친화적인 가이드북을 만들어드립니다.',
  keywords: [
    '게스트 가이드북',
    '에어비앤비',
    '숙소 관리',
    'AI',
    '가이드북 생성',
    '펜션',
    '글램핑',
    '호스팅',
    '디지털 가이드북',
  ],
  authors: [{ name: 'Roomy' }],
  creator: 'Roomy',
  publisher: 'Roomy',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: 'Roomy',
    title: 'Roomy - 게스트 가이드북',
    description:
      '에어비앤비 링크 하나로 게스트 가이드북을 자동 생성하세요. AI가 숙소 정보를 분석하여 모바일 친화적인 가이드북을 만들어드립니다.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Roomy - 게스트 가이드북',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roomy - 게스트 가이드북',
    description:
      '에어비앤비 링크 하나로 게스트 가이드북을 자동 생성하세요.',
    images: ['/og-image.png'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'naver-site-verification':
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || '',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard 폰트 CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
