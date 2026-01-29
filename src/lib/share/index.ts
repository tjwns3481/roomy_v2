// @TASK P5-T5.1 - 공유 링크 유틸리티
// @SPEC docs/planning/02-trd.md#공유-시스템

import { createAdminClient } from '@/lib/supabase/server';
import type {
  ShareLinkResponse,
  CreateShortUrlResult,
  IncrementClicksResult,
  ShortUrlRow,
} from './types';

/**
 * 앱의 기본 URL을 가져옵니다
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://roomy.app';
}

/**
 * 가이드북의 전체 URL을 생성합니다
 *
 * @param slug - 가이드북 슬러그
 * @returns 전체 URL (예: https://roomy.app/g/my-guesthouse)
 *
 * @example
 * ```ts
 * const url = getGuidebookUrl('my-guesthouse');
 * // => 'https://roomy.app/g/my-guesthouse'
 * ```
 */
export function getGuidebookUrl(slug: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/g/${slug}`;
}

/**
 * 단축 URL을 생성합니다
 *
 * @param shortCode - 단축 코드
 * @returns 단축 URL (예: https://roomy.app/s/abc123)
 *
 * @example
 * ```ts
 * const url = getShortUrl('abc123');
 * // => 'https://roomy.app/s/abc123'
 * ```
 */
export function getShortUrl(shortCode: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/s/${shortCode}`;
}

/**
 * 가이드북에 대한 단축 URL을 생성합니다
 *
 * @param guidebookId - 가이드북 ID
 * @param expiresInDays - 만료 기간 (일) - null이면 무기한
 * @returns 생성된 단축 URL 정보
 * @throws Error - Supabase 오류 발생 시
 *
 * @example
 * ```ts
 * const result = await createShortUrl('uuid-123');
 * // => { id: '...', shortCode: 'abc123', expiresAt: null }
 * ```
 */
export async function createShortUrl(
  guidebookId: string,
  expiresInDays?: number | null
): Promise<CreateShortUrlResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('create_short_url', {
    p_guidebook_id: guidebookId,
    p_expires_in_days: expiresInDays ?? null,
  });

  if (error) {
    console.error('단축 URL 생성 오류:', error);
    throw new Error(`단축 URL 생성 실패: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error('단축 URL 생성 결과가 없습니다');
  }

  return data[0] as CreateShortUrlResult;
}

/**
 * 가이드북의 기존 단축 URL을 조회합니다
 *
 * @param guidebookId - 가이드북 ID
 * @returns 단축 URL 정보 또는 null
 */
export async function getExistingShortUrl(
  guidebookId: string
): Promise<ShortUrlRow | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('short_urls')
    .select('*')
    .eq('guidebook_id', guidebookId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error('단축 URL 조회 오류:', error);
    return null;
  }

  return data as ShortUrlRow;
}

/**
 * 가이드북의 공유 링크 정보를 조회하거나 생성합니다
 *
 * @param guidebookId - 가이드북 ID
 * @param createIfNotExists - 없으면 생성할지 여부 (기본: true)
 * @param expiresInDays - 새로 생성 시 만료 기간 (일)
 * @returns 공유 링크 정보 또는 null
 *
 * @example
 * ```ts
 * const shareInfo = await getShareLinks('uuid-123');
 * // => { fullUrl: '...', shortUrl: '...', shortCode: '...', ... }
 * ```
 */
export async function getShareLinks(
  guidebookId: string,
  createIfNotExists: boolean = true,
  expiresInDays?: number | null
): Promise<ShareLinkResponse | null> {
  const supabase = createAdminClient();

  // 가이드북 정보 조회
  const { data: guidebook, error: guidebookError } = await supabase
    .from('guidebooks')
    .select('slug, status')
    .eq('id', guidebookId)
    .single();

  if (guidebookError || !guidebook) {
    console.error('가이드북 조회 오류:', guidebookError);
    return null;
  }

  // 기존 단축 URL 조회
  let shortUrl = await getExistingShortUrl(guidebookId);

  // 없으면 생성
  if (!shortUrl && createIfNotExists) {
    try {
      const result = await createShortUrl(guidebookId, expiresInDays);
      shortUrl = {
        id: result.id,
        guidebook_id: guidebookId,
        short_code: result.short_code,
        expires_at: result.expires_at,
        clicks: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('단축 URL 생성 오류:', error);
      return null;
    }
  }

  if (!shortUrl) {
    return null;
  }

  return {
    fullUrl: getGuidebookUrl(guidebook.slug),
    shortUrl: getShortUrl(shortUrl.short_code),
    shortCode: shortUrl.short_code,
    clicks: shortUrl.clicks,
    expiresAt: shortUrl.expires_at,
    isActive: shortUrl.is_active,
    createdAt: shortUrl.created_at,
  };
}

/**
 * 단축 코드로 가이드북 slug를 조회하고 클릭 수를 증가시킵니다
 *
 * @param shortCode - 단축 코드
 * @returns 가이드북 slug 또는 null (만료된 경우 isExpired: true)
 *
 * @example
 * ```ts
 * const result = await resolveShortCode('abc123');
 * // => { slug: 'my-guesthouse', isExpired: false }
 * ```
 */
export async function resolveShortCode(
  shortCode: string
): Promise<{ slug: string | null; isExpired: boolean | null }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('increment_short_url_clicks', {
    p_code: shortCode,
  });

  if (error) {
    console.error('단축 코드 해석 오류:', error);
    return { slug: null, isExpired: null };
  }

  if (!data || data.length === 0) {
    return { slug: null, isExpired: null };
  }

  const result = data[0] as IncrementClicksResult;
  return {
    slug: result.guidebook_slug,
    isExpired: result.is_expired,
  };
}

/**
 * 가이드북의 단축 URL 통계를 조회합니다
 *
 * @param guidebookId - 가이드북 ID
 * @returns 통계 정보 목록
 */
export async function getShortUrlStats(guidebookId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('short_urls')
    .select('short_code, clicks, created_at, updated_at, expires_at, is_active')
    .eq('guidebook_id', guidebookId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('단축 URL 통계 조회 오류:', error);
    return [];
  }

  return data.map((row) => ({
    shortCode: row.short_code,
    clicks: row.clicks,
    createdAt: row.created_at,
    lastClickedAt: row.updated_at,
    expiresAt: row.expires_at,
    isActive: row.is_active,
  }));
}

/**
 * 단축 URL을 비활성화합니다
 *
 * @param shortCode - 단축 코드
 */
export async function deactivateShortUrl(shortCode: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('short_urls')
    .update({ is_active: false })
    .eq('short_code', shortCode);

  if (error) {
    console.error('단축 URL 비활성화 오류:', error);
    return false;
  }

  return true;
}

// 타입 re-export
export * from './types';
