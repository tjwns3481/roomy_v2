/**
 * @TASK P7-T7.1 - OAuth 콜백 API Route
 * @SPEC Supabase Auth OAuth 콜백 처리
 *
 * 기능:
 * - OAuth 인증 코드 교환
 * - 세션 설정
 * - 리다이렉트
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/types';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // OAuth 에러 처리
  if (error) {
    console.error('OAuth callback error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Server Component에서 호출된 경우 무시
            }
          },
        },
      }
    );

    // 인증 코드를 세션으로 교환
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }

    // 사용자 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 프로필 존재 여부 확인 및 생성
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // 프로필이 없으면 생성
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          '사용자';

        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email!,
          nickname: displayName,
          avatar_url: user.user_metadata?.avatar_url || null,
        });
      }
    }

    // 성공 시 리다이렉트
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // code가 없으면 로그인 페이지로
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
