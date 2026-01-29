// @TASK P7-T7.4 - Sitemap 생성
// @SPEC docs/planning/03-user-flow.md

import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';

/**
 * 동적 사이트맵 생성
 * - 정적 페이지 + 공개된 가이드북 페이지
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.co.kr';
  const supabase = await createServerClient();

  // 공개된 가이드북 조회
  const { data: guidebooks } = await supabase
    .from('guidebooks')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // 동적 가이드북 페이지
  const guidebookPages: MetadataRoute.Sitemap =
    guidebooks?.map((guidebook) => ({
      url: `${baseUrl}/g/${guidebook.slug}`,
      lastModified: new Date(guidebook.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })) || [];

  return [...staticPages, ...guidebookPages];
}
