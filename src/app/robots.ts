// @TASK P7-T7.4 - Robots.txt 생성
// @SPEC docs/planning/03-user-flow.md

import { MetadataRoute } from 'next';

/**
 * Robots.txt 생성
 * - 공개 페이지: 크롤링 허용
 * - 인증 페이지: 크롤링 차단
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.co.kr';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/', // 홈
          '/g/', // 게스트 가이드북 페이지
          '/pricing', // 가격 페이지
        ],
        disallow: [
          '/api/', // API
          '/dashboard/', // 대시보드
          '/editor/', // 에디터
          '/settings/', // 설정
          '/checkout/', // 결제
          '/demo/', // 데모 페이지
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/g/',
          '/pricing',
        ],
        disallow: [
          '/api/',
          '/dashboard/',
          '/editor/',
          '/settings/',
          '/checkout/',
          '/demo/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
