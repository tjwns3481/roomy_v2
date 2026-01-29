// @TASK P8-R4: Upsell 요청 목록 조회 API (호스트용)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { UpsellRequestsResponse } from '@/types/upsell';

/**
 * GET /api/guidebooks/[id]/upsell/requests
 * 호스트가 자신의 가이드북에 대한 Upsell 요청 목록 조회
 * - 인증 필요
 * - RLS: 본인 가이드북만 조회 가능
 * - 쿼리 파라미터:
 *   - status: 'pending' | 'confirmed' | 'cancelled' (선택)
 *   - limit: 개수 제한 (기본 50)
 *   - offset: 페이지네이션 (기본 0)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: guidebookId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const supabase = await createClient();

    // 1. 사용자 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: '로그인이 필요합니다',
          },
        },
        { status: 401 }
      );
    }

    // 2. 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id')
      .eq('id', guidebookId)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        {
          error: {
            code: 'GUIDEBOOK_NOT_FOUND',
            message: '가이드북을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    if (guidebook.user_id !== user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: '이 가이드북에 접근할 권한이 없습니다',
          },
        },
        { status: 403 }
      );
    }

    // 3. 요청 목록 조회 (아이템 정보와 함께)
    let query = supabase
      .from('upsell_requests')
      .select(
        `
        *,
        upsell_items (
          name,
          price
        )
      `,
        { count: 'exact' }
      )
      .eq('guidebook_id', guidebookId)
      .order('created_at', { ascending: false });

    // 상태 필터링
    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      query = query.eq('status', status);
    }

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data: requests, error: requestsError, count } = await query;

    if (requestsError) {
      console.error('Upsell requests fetch error:', requestsError);
      return NextResponse.json(
        {
          error: {
            code: 'FETCH_ERROR',
            message: '요청 목록 조회 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }

    // 4. 통계 조회 (RPC 함수 사용)
    const { data: stats, error: statsError } = await supabase
      .rpc('get_upsell_request_stats', { p_guidebook_id: guidebookId })
      .single();

    if (statsError) {
      console.error('Stats fetch error:', statsError);
    }

    // 5. 응답 데이터 변환
    const formattedRequests = (requests || []).map((req: any) => ({
      ...req,
      item_name: req.upsell_items?.name || '',
      item_price: req.upsell_items?.price || 0,
      upsell_items: undefined, // 중첩 객체 제거
    }));

    const response: UpsellRequestsResponse = {
      requests: formattedRequests,
      total: count || 0,
      stats: {
        pending: stats?.pending_requests || 0,
        confirmed: stats?.confirmed_requests || 0,
        cancelled: stats?.cancelled_requests || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/guidebooks/[id]/upsell/requests error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
