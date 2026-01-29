/**
 * @TASK P6-T6.3 - 결제 내역 API
 * @SPEC docs/planning/02-trd.md#payment-history
 *
 * GET - 결제 내역 조회 (페이지네이션 지원)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getPaymentHistory } from '@/lib/subscription';

// ============================================================
// GET: 결제 내역 조회
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    // 결제 내역 조회
    const { payments, total, hasMore } = await getPaymentHistory(user.id, page, limit);

    // 통계 계산
    const totalAmount = payments.reduce(
      (sum, p) => (p.status === 'succeeded' ? sum + p.amount : sum),
      0
    );

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore,
      },
      summary: {
        totalPayments: total,
        totalAmount,
        currency: 'KRW',
      },
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: '결제 내역을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
