// @TASK P8-S2-T1 - AirBnB 스타일 게스트 뷰어 페이지
// @SPEC specs/screens/guest-viewer.yaml

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/server';
import type { BlockType } from '@/types/guidebook';
import { BottomNav } from '@/components/guest/BottomNav';
import { ViewTracker } from '@/components/guest/ViewTracker';
import { BlockList } from '@/components/guest/BlockRenderer';
import { GuidebookJsonLd, BreadcrumbJsonLd } from '@/components/seo';

export const revalidate = 3600; // 1시간

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 메타데이터 생성 (SEO 최적화)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: guidebook } = await supabase
    .from('guidebooks')
    .select('title, description, og_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!guidebook) {
    return {
      title: '가이드북을 찾을 수 없습니다',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.co.kr';
  const guidebookUrl = `${baseUrl}/g/${slug}`;

  return {
    title: guidebook.title,
    description: guidebook.description || `${guidebook.title} 가이드북`,
    openGraph: {
      type: 'article',
      locale: 'ko_KR',
      url: guidebookUrl,
      siteName: 'Roomy',
      title: guidebook.title,
      description: guidebook.description || `${guidebook.title} 가이드북`,
      images: guidebook.og_image_url
        ? [
            {
              url: guidebook.og_image_url,
              width: 1200,
              height: 630,
              alt: guidebook.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: guidebook.title,
      description: guidebook.description || `${guidebook.title} 가이드북`,
      images: guidebook.og_image_url ? [guidebook.og_image_url] : undefined,
    },
    alternates: {
      canonical: guidebookUrl,
    },
  };
}

/**
 * AirBnB 스타일 게스트 가이드북 페이지
 * - 풀스크린 히어로
 * - 부드러운 곡선 & 그림자
 * - 모바일 최적화
 */
export default async function GuestGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createAdminClient();

  // 1. slug로 가이드북 조회
  const { data: guidebook, error } = await supabase
    .from('guidebooks')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  // 2. 가이드북이 없거나 에러 발생 시 404
  if (error || !guidebook) {
    notFound();
  }

  // 3. 블록 조회
  const { data: blocksData } = await supabase
    .from('blocks')
    .select('*')
    .eq('guideId', guidebook.id)
    .order('order', { ascending: true });

  // 4. DB 타입(대문자)을 TypeScript 타입(소문자)으로 변환
  const typeMapping: Record<string, string> = {
    HERO: 'hero',
    QUICK_INFO: 'quickInfo',
    AMENITIES: 'amenities',
    RULES: 'rules',
    MAP: 'map',
    GALLERY: 'gallery',
    NOTICE: 'notice',
    CUSTOM: 'custom',
  };

  // 5. 블록 정렬 및 변환
  const sortedBlocks = (blocksData || [])
    .filter((block: any) => block.is_visible !== false)
    .map((block: any) => ({
      id: block.id,
      guidebook_id: block.guideId || block.guidebook_id,
      type: typeMapping[block.type] || block.type.toLowerCase(),
      order_index: block.order ?? block.order_index ?? 0,
      content: block.content,
      is_visible: block.is_visible ?? true,
      created_at: block.createdAt || block.created_at,
      updated_at: block.updatedAt || block.updated_at,
    }))
    .sort((a: any, b: any) => a.order_index - b.order_index);

  // 6. 존재하는 블록 타입 추출
  const availableBlockTypes: BlockType[] = sortedBlocks.map(
    (block: any) => block.type as BlockType
  );

  // 7. JSON-LD 데이터 준비
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.co.kr';
  const guidebookUrl = `${baseUrl}/g/${slug}`;

  return (
    <>
      {/* JSON-LD 구조화된 데이터 */}
      <GuidebookJsonLd
        title={guidebook.title}
        description={guidebook.description || undefined}
        url={guidebookUrl}
        imageUrl={guidebook.og_image_url || undefined}
        datePublished={guidebook.created_at}
        dateModified={guidebook.updated_at}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: baseUrl },
          { name: guidebook.title, url: guidebookUrl },
        ]}
      />

      {/* AirBnB 스타일 레이아웃 */}
      <div className="min-h-screen bg-surface pb-20 md:pb-0">
        {/* 조회수 추적 */}
        <ViewTracker guidebookId={guidebook.id} />

        {/* Top Anchor */}
        <div id="top" className="absolute top-0 left-0 w-full h-1" />

        {/* Hero 블록이 없을 때만 헤더 표시 */}
        {!sortedBlocks.some((b: any) => b.type === 'hero') && (
          <header id="header" className="bg-white border-b border-border">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <h1 className="text-h1 text-text-primary">{guidebook.title}</h1>
              {guidebook.description && (
                <p className="text-body text-text-secondary mt-2">
                  {guidebook.description}
                </p>
              )}
            </div>
          </header>
        )}

        {/* Main Content - 블록 렌더러 */}
        <main className="max-w-4xl mx-auto">
          <BlockList blocks={sortedBlocks} />

          {/* Contact Section */}
          <section id="contact" className="mt-8 scroll-mt-20 px-4 pb-8">
            <div className="bg-white border border-border rounded-xl p-6 shadow-airbnb-sm">
              <h2 className="text-h3 font-semibold text-text-primary mb-2">
                문의하기
              </h2>
              <p className="text-body text-text-secondary">
                궁금한 점이 있으시면 호스트에게 문의하세요.
              </p>
            </div>
          </section>
        </main>

        {/* Footer - AirBnB 스타일 */}
        <footer className="border-t border-border mt-12 py-8 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-body-sm text-text-secondary">
              Powered by{' '}
              <span className="font-semibold text-text-primary">Roomy</span>
            </p>
          </div>
        </footer>

        {/* Bottom Navigation */}
        <BottomNav availableBlocks={availableBlockTypes} />
      </div>
    </>
  );
}
