// @TASK P7-T7.4 - JSON-LD 구조화된 데이터
// @SPEC docs/planning/03-user-flow.md

/**
 * JSON-LD 구조화된 데이터 컴포넌트
 * - 검색 엔진에 페이지 정보를 명확히 전달
 */

interface WebsiteJsonLdProps {
  url?: string;
}

/**
 * 웹사이트 JSON-LD (홈페이지용)
 */
export function WebsiteJsonLd({ url }: WebsiteJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.co.kr';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Roomy',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      '에어비앤비 링크 하나로 게스트 가이드북을 자동 생성하세요. AI가 숙소 정보를 분석하여 모바일 친화적인 가이드북을 만들어드립니다.',
    url: url || baseUrl,
    offers: {
      '@type': 'Offer',
      category: 'SaaS',
    },
    inLanguage: 'ko-KR',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface GuidebookJsonLdProps {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
}

/**
 * 가이드북 JSON-LD (게스트 페이지용)
 */
export function GuidebookJsonLd({
  title,
  description,
  url,
  imageUrl,
  author,
  datePublished,
  dateModified,
}: GuidebookJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description || title,
    url,
    image: imageUrl,
    author: author
      ? {
          '@type': 'Person',
          name: author,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Roomy',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.co.kr'}/logo.png`,
      },
    },
    datePublished,
    dateModified,
    inLanguage: 'ko-KR',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface OrganizationJsonLdProps {
  name?: string;
  url?: string;
  logo?: string;
}

/**
 * 조직 JSON-LD (전역 사용)
 */
export function OrganizationJsonLd({
  name = 'Roomy',
  url,
  logo,
}: OrganizationJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.co.kr';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: url || baseUrl,
    logo: logo || `${baseUrl}/logo.png`,
    sameAs: [
      // 소셜 미디어 링크 (나중에 추가)
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: {
    name: string;
    url: string;
  }[];
}

/**
 * 브레드크럼 JSON-LD (네비게이션 표시)
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
