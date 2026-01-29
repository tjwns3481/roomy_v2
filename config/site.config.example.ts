/**
 * Site Configuration Example
 *
 * 이 파일은 site.config.ts의 예시입니다.
 * npm run setup을 실행하면 실제 site.config.ts가 생성됩니다.
 */

export const siteConfig = {
  name: "Vibe Store",
  url: "http://localhost:3000",
  adminEmail: "admin@example.com",
  description: "Vibe Store - 디지털 상품 쇼핑몰",

  // 소셜 미디어 링크 (선택사항)
  links: {
    youtube: "",
    github: "",
    twitter: "",
  },

  // 메타데이터
  metadata: {
    title: "Vibe Store",
    description: "Vibe Store - 디지털 상품 쇼핑몰",
    keywords: ["디지털 상품", "쇼핑몰", "다운로드"],
  },
} as const;

export type SiteConfig = typeof siteConfig;
