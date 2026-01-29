/**
 * Supabase Server Client
 *
 * 서버 컴포넌트 및 API Routes에서 사용하는 Supabase 클라이언트
 * - 서버 환경에서만 실행
 * - 쿠키 기반 인증 처리
 * - RLS 정책 자동 적용
 */

import { createServerClient as createSSRServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './types';

/**
 * 서버 컴포넌트용 Supabase 클라이언트 생성
 *
 * @example
 * ```tsx
 * // Server Component
 * export default async function Page() {
 *   const supabase = createServerClient();
 *   const { data } = await supabase.from('products').select('*');
 *   return <div>{data?.length} products</div>;
 * }
 * ```
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 서버 컴포넌트에서 set 호출 시 무시
            // 미들웨어나 Route Handler에서만 쿠키 설정 가능
          }
        },
      },
    }
  );
}

/**
 * 관리자용 Supabase 클라이언트 (Service Role Key 사용)
 *
 * ⚠️ 주의: RLS 정책을 우회하므로 신중하게 사용
 * - 관리자 전용 작업에만 사용
 * - API Routes에서만 사용 (클라이언트 노출 금지)
 *
 * @example
 * ```tsx
 * // API Route
 * export async function POST(request: Request) {
 *   const supabase = createAdminClient();
 *   // RLS 우회하여 모든 데이터 접근 가능
 *   const { data } = await supabase.from('products').select('*');
 *   return NextResponse.json({ data });
 * }
 * ```
 */
export function createAdminClient() {
  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // Service Role Key 사용 시 쿠키 불필요
        },
      },
    }
  );
}
