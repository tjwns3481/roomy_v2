// @TASK P8-S12-T1 - 리뷰 클릭 트래킹 API
// @SPEC P8 Screen 12 - Review Settings

// @ts-nocheck - review 관련 RPC 함수는 아직 DB에 생성되지 않음 (P8-S12-T1)
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { ReviewPlatform } from '@/types/review';
import crypto from 'crypto';

interface TrackReviewClickRequest {
  platform: ReviewPlatform;
  action: 'shown' | 'clicked';
}

/**
 * POST /api/review-settings/[guidebookId]/track
 * 리뷰 팝업 표시 및 클릭 트래킹
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guidebookId: string }> }
) {
  try {
    const { guidebookId } = await params;
    const supabase = await createServerClient();

    const body: TrackReviewClickRequest = await request.json();
    const { platform, action } = body;

    // IP 해싱 (개인정보 보호)
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (action === 'shown') {
      // 팝업 표시 기록
      const { error } = await supabase.rpc('track_review_popup_shown', {
        p_guidebook_id: guidebookId,
      });

      if (error) {
        console.error('Error tracking review popup shown:', error);
        // 실패해도 계속 진행 (통계 누락은 치명적이지 않음)
      }
    } else if (action === 'clicked') {
      // 클릭 기록
      const { error } = await supabase.rpc('track_review_click', {
        p_guidebook_id: guidebookId,
        p_platform: platform,
        p_user_agent: userAgent,
        p_ip_hash: ipHash,
      });

      if (error) {
        console.error('Error tracking review click:', error);
        // 실패해도 계속 진행
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking review:', error);
    // 트래킹 실패는 사용자에게 영향을 주지 않음
    return NextResponse.json({ success: true });
  }
}
