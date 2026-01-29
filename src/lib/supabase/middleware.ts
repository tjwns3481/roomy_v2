/**
 * Supabase Middleware Client
 *
 * ⚠️ DEPRECATED: NextAuth.js로 마이그레이션 완료 (P0-T0.3)
 *
 * 이 파일은 더 이상 middleware.ts에서 사용되지 않습니다.
 * 대신 NextAuth의 auth() 함수를 사용하여 인증을 처리합니다.
 *
 * 보관 이유:
 * - API 라우트에서 Supabase DB 접근 시 여전히 필요
 * - 향후 Supabase Auth와 NextAuth 병행 사용 시 참고용
 *
 * Next.js 미들웨어에서 사용하는 Supabase 클라이언트
 * - 인증 상태 확인 및 세션 갱신
 * - 보호된 라우트 처리
 */

import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from './types';

/**
 * 미들웨어용 Supabase 클라이언트 생성
 *
 * @example
 * ```tsx
 * // middleware.ts
 * export async function middleware(request: NextRequest) {
 *   const { supabase, response } = createMiddlewareClient(request);
 *
 *   const { data: { session } } = await supabase.auth.getSession();
 *
 *   if (!session && request.nextUrl.pathname.startsWith('/admin')) {
 *     return NextResponse.redirect(new URL('/login', request.url));
 *   }
 *
 *   return response;
 * }
 * ```
 */
export function createMiddlewareClient(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response: supabaseResponse };
}
