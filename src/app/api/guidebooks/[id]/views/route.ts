// @TASK P2-T2.7 - 조회수 증가 API
// @SPEC docs/planning/06-tasks.md#P2-T2.7

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * IP 해시 생성 (익명화)
 */
function hashIP(ip: string | null): string | null {
  if (!ip) return null;
  return createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

/**
 * POST /api/guidebooks/[id]/views
 *
 * 가이드북 조회수를 증가시킵니다.
 * 인증 불필요 (게스트 접근 허용)
 *
 * @param request - NextRequest
 * @param params - { id: string } (guidebook ID)
 * @returns { success: boolean }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: guidebookId } = await params;

    if (!guidebookId) {
      return NextResponse.json(
        { error: '가이드북 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(guidebookId)) {
      return NextResponse.json(
        { error: '잘못된 가이드북 ID 형식입니다' },
        { status: 400 }
      );
    }

    // 요청 정보 추출
    const body = await request.json().catch(() => ({}));
    const visitorId = body.visitor_id || null;

    // 헤더에서 정보 추출
    const userAgent = request.headers.get('user-agent') || null;
    const referrer = request.headers.get('referer') || null;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIP || null;
    const ipHash = hashIP(ip);

    // Admin client 사용 (RLS 우회)
    const supabase = createAdminClient();

    // 1. 가이드북 존재 여부 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, status')
      .eq('id', guidebookId)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        { error: '가이드북을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 2. 비공개 가이드북 체크 (draft 상태에서도 조회수는 증가 가능)
    // if (guidebook.status !== 'published') {
    //   return NextResponse.json(
    //     { error: '비공개 가이드북입니다' },
    //     { status: 403 }
    //   );
    // }

    // 3. RPC 함수 호출하여 조회수 증가 및 로그 삽입
    const { error: rpcError } = await supabase.rpc('increment_guidebook_view_count', {
      p_guidebook_id: guidebookId,
      p_visitor_id: visitorId ?? undefined,
      p_ip_hash: ipHash ?? undefined,
      p_user_agent: userAgent?.substring(0, 500) ?? undefined, // 최대 500자
      p_referrer: referrer?.substring(0, 500) ?? undefined,
    });

    if (rpcError) {
      console.error('조회수 증가 RPC 에러:', rpcError);

      // RPC가 없는 경우 직접 업데이트
      const { error: updateError } = await supabase
        .from('guidebooks')
        .update({ view_count: (guidebook as any).view_count + 1 })
        .eq('id', guidebookId);

      if (updateError) {
        console.error('조회수 직접 업데이트 에러:', updateError);
        return NextResponse.json(
          { error: '조회수 업데이트에 실패했습니다' },
          { status: 500 }
        );
      }

      // 로그는 별도로 삽입 시도 (실패해도 무시)
      try {
        await supabase.from('guidebook_views').insert({
          guidebook_id: guidebookId,
          visitor_id: visitorId,
          ip_hash: ipHash,
          user_agent: userAgent?.substring(0, 500),
          referrer: referrer?.substring(0, 500),
        });
      } catch {
        // 로그 삽입 실패는 무시 (테이블이 없을 수 있음)
      }
    }

    return NextResponse.json({
      success: true,
      message: '조회수가 증가했습니다',
    });
  } catch (error) {
    console.error('조회수 증가 에러:', error);
    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
