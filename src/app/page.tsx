// @TASK P7-T7.3 - Roomy 서비스 소개 랜딩 페이지
// @TASK P7-T7.4 - 메타데이터 및 JSON-LD 추가
// @SPEC docs/planning/06-tasks.md#P7-T7.3

import { Metadata } from 'next';
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/seo';
import { LandingHeader } from '@/components/landing/LandingHeader';
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  FAQSection,
  CTASection,
  Footer,
} from '@/components/landing';

export const metadata: Metadata = {
  title: 'Roomy - 게스트 가이드북',
  description:
    '에어비앤비 링크 하나로 게스트 가이드북을 자동 생성하세요. AI가 숙소 정보를 분석하여 모바일 친화적인 가이드북을 만들어드립니다.',
  openGraph: {
    title: 'Roomy - 게스트 가이드북',
    description:
      '에어비앤비 링크 하나로 게스트 가이드북을 자동 생성하세요.',
    images: ['/og-image.png'],
  },
};

export default function Home() {
  return (
    <>
      {/* JSON-LD 구조화된 데이터 */}
      <WebsiteJsonLd />
      <OrganizationJsonLd />

      <div className="flex flex-col min-h-screen">
        {/* 헤더 */}
        <LandingHeader />

        {/* 히어로 섹션 */}
        <HeroSection />

        {/* 기능 소개 섹션 */}
        <FeaturesSection />

        {/* 작동 방식 섹션 */}
        <HowItWorksSection />

        {/* 플랜 비교 섹션 */}
        <PricingSection />

        {/* FAQ 섹션 */}
        <FAQSection />

        {/* CTA 섹션 */}
        <CTASection />

        {/* 푸터 */}
        <Footer />
      </div>
    </>
  );
}
