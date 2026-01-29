// @TASK P5-T5.4 - 단축 URL 리다이렉트 페이지
// @SPEC docs/planning/06-tasks.md#P5-T5.4

import { redirect, notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';

// Edge Runtime 사용 (빠른 리다이렉트)
export const runtime = 'edge';

interface PageProps {
  params: Promise<{ code: string }>;
}

/**
 * 메타데이터 생성 (SEO 최적화)
 * 크롤러가 리다이렉트 전에 메타 정보를 수집할 수 있도록 함
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const supabase = await createServerClient();

  // short_code로 guidebook 정보 조회
  const { data: shortUrl } = await supabase
    .from('short_urls')
    .select(`
      guidebook_id,
      guidebooks (
        title,
        description,
        og_image_url
      )
    `)
    .eq('short_code', code)
    .eq('is_active', true)
    .single();

  if (!shortUrl || !shortUrl.guidebooks) {
    return {
      title: '링크를 찾을 수 없습니다 - Roomy',
      description: '요청하신 가이드북 링크가 존재하지 않습니다.',
    };
  }

  const guidebook = shortUrl.guidebooks as {
    title: string;
    description: string | null;
    og_image_url: string | null;
  };

  return {
    title: `${guidebook.title} - Roomy`,
    description: guidebook.description || `${guidebook.title} 가이드북`,
    openGraph: {
      title: guidebook.title,
      description: guidebook.description || undefined,
      images: guidebook.og_image_url
        ? [{ url: guidebook.og_image_url }]
        : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: guidebook.title,
      description: guidebook.description || undefined,
      images: guidebook.og_image_url ? [guidebook.og_image_url] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * 단축 URL 리다이렉트 페이지
 *
 * 1. short_code로 가이드북 조회
 * 2. 클릭 수 증가 (RPC 함수)
 * 3. 만료/비활성화 체크
 * 4. /g/[slug]로 리다이렉트
 */
export default async function ShortUrlRedirect({ params }: PageProps) {
  const { code } = await params;
  const supabase = await createServerClient();

  // RPC 함수로 클릭 수 증가 및 slug 조회
  const { data: result, error } = await supabase.rpc('increment_short_url_clicks', {
    p_code: code,
  });

  // RPC 함수 실행 실패 시 폴백 로직
  if (error) {
    console.error('RPC error:', error);
    // 폴백: 직접 조회
    return await fallbackRedirect(supabase, code);
  }

  // RPC 결과 처리
  const redirectInfo = result?.[0];

  // 존재하지 않는 코드
  if (!redirectInfo || redirectInfo.guidebook_slug === null) {
    // 만료된 링크인지 확인
    if (redirectInfo?.is_expired === true) {
      return <ExpiredLinkPage />;
    }
    notFound();
  }

  // 만료된 링크
  if (redirectInfo.is_expired === true) {
    return <ExpiredLinkPage />;
  }

  // 성공: 가이드북 페이지로 리다이렉트 (301 Permanent Redirect)
  redirect(`/g/${redirectInfo.guidebook_slug}`);
}

/**
 * RPC 함수 실패 시 폴백 로직
 */
async function fallbackRedirect(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  code: string
) {
  // 단축 URL 정보 조회
  const { data: shortUrl } = await supabase
    .from('short_urls')
    .select(`
      id,
      guidebook_id,
      expires_at,
      is_active,
      guidebooks (
        slug,
        status
      )
    `)
    .eq('short_code', code)
    .single();

  // 존재하지 않는 코드
  if (!shortUrl) {
    notFound();
  }

  // 비활성화된 링크
  if (!shortUrl.is_active) {
    return <ExpiredLinkPage />;
  }

  // 만료 체크
  if (shortUrl.expires_at && new Date(shortUrl.expires_at) < new Date()) {
    return <ExpiredLinkPage />;
  }

  const guidebook = shortUrl.guidebooks as {
    slug: string;
    status: string;
  } | null;

  // 가이드북이 없거나 미공개
  if (!guidebook || guidebook.status !== 'published') {
    notFound();
  }

  // 클릭 수 증가 (폴백)
  await supabase
    .from('short_urls')
    .update({ clicks: (shortUrl as { clicks?: number }).clicks ? ((shortUrl as { clicks: number }).clicks + 1) : 1 })
    .eq('id', shortUrl.id);

  // 리다이렉트
  redirect(`/g/${guidebook.slug}`);
}

/**
 * 만료된 링크 안내 페이지
 */
function ExpiredLinkPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          링크가 만료되었습니다
        </h1>
        <p className="text-gray-600 mb-6">
          이 공유 링크는 더 이상 유효하지 않습니다.
          <br />
          호스트에게 새로운 링크를 요청해 주세요.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Roomy 홈으로
        </a>
      </div>
    </div>
  );
}
