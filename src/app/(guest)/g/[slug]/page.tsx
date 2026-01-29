// @TASK P2-T2.1 - 게스트 가이드북 뷰어 페이지
// @TASK P2-T2.7 - 조회수 추적 연동
// @TASK P7-T7.4 - 동적 메타데이터 및 JSON-LD 추가
// @TASK P7-T7.8 - API 캐싱 최적화
// @SPEC docs/planning/03-user-flow.md#게스트-가이드북-조회

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import type { GuidebookWithBlocks, BlockType } from '@/types/guidebook';
import { BottomNav } from '@/components/guest/BottomNav';
import { ViewTracker } from '@/components/guest/ViewTracker';
import { GuidebookJsonLd, BreadcrumbJsonLd } from '@/components/seo';

// @TASK P7-T7.8 - API 캐싱 설정 (1시간 캐싱)
// 가이드북 내용은 자주 변경되지 않으므로 1시간 캐싱 적용
export const revalidate = 3600; // 1시간

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 메타데이터 생성 (SEO 최적화)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();

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
 * 게스트 가이드북 페이지
 */
export default async function GuestGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerClient();

  // 1. slug로 가이드북 조회 (블록 포함)
  const { data: guidebook, error } = await supabase
    .from('guidebooks')
    .select(
      `
      *,
      blocks (
        id,
        guidebook_id,
        type,
        order_index,
        content,
        is_visible,
        created_at,
        updated_at
      )
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single<GuidebookWithBlocks>();

  // 2. 가이드북이 없거나 에러 발생 시 404
  if (error || !guidebook) {
    notFound();
  }

  // 3. 블록 정렬 (order_index 기준)
  const sortedBlocks = guidebook.blocks
    ? [...guidebook.blocks]
        .filter((block) => block.is_visible)
        .sort((a, b) => a.order_index - b.order_index)
    : [];

  // 4. 조회수 증가는 클라이언트 컴포넌트(ViewTracker)에서 처리
  // - 세션당 1회만 증가 (중복 방지)
  // - API 호출로 처리하여 더 정확한 통계 수집

  // 5. 존재하는 블록 타입 추출 (BottomNav에 전달)
  const availableBlockTypes: BlockType[] = sortedBlocks.map(
    (block) => block.type
  );

  // 6. JSON-LD 데이터 준비
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

      <div className="min-h-screen bg-white pb-20 md:pb-0">
        {/* 조회수 추적 */}
        <ViewTracker guidebookId={guidebook.id} />

      {/* Top Anchor */}
      <div id="top" className="absolute top-0 left-0 w-full h-1" />

      {/* Header */}
      <header id="header" className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{guidebook.title}</h1>
          {guidebook.description && (
            <p className="text-gray-600 mt-1">{guidebook.description}</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {sortedBlocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">아직 작성된 내용이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedBlocks.map((block) => (
              <section
                key={block.id}
                id={`block-${block.type}`}
                className="p-6 border rounded-lg bg-white shadow-sm scroll-mt-20"
              >
                <div className="mb-2">
                  <span className="text-xs text-gray-500 uppercase">
                    {block.type}
                  </span>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(block.content, null, 2)}
                </pre>
              </section>
            ))}
          </div>
        )}

        {/* Contact Section (문의 섹션) */}
        <section id="contact" className="mt-8 scroll-mt-20">
          <div className="p-6 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">문의하기</h2>
            <p className="text-gray-600 text-sm">
              궁금한 점이 있으시면 호스트에게 문의하세요.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          Powered by <span className="font-semibold">Roomy</span>
        </div>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav availableBlocks={availableBlockTypes} />
      </div>
    </>
  );
}
