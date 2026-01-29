// @TASK P5-T5.5 - 공유 이벤트 기록 API
// @SPEC docs/planning/06-tasks.md#P5-T5.5

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { TrackShareEventRequest, ShareEventType } from '@/types/share';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// 유효한 이벤트 타입
const VALID_EVENT_TYPES: ShareEventType[] = [
  'link_copy',
  'qr_download',
  'social_share',
  'short_url_click',
];

// UUID 형식 검증
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * IP 주소 해시화 (개인정보 보호)
 */
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

/**
 * 방문자 ID 생성 (세션 기반)
 */
function generateVisitorId(): string {
  return crypto.randomUUID();
}

/**
 * POST /api/share/track
 *
 * 공유 이벤트를 기록합니다.
 * 인증 불필요 (게스트 사용자도 이벤트 기록 가능)
 *
 * @param request - NextRequest
 * @returns 성공 여부
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackShareEventRequest;
    const { guidebookId, eventType, eventData } = body;

    // 1. 필수 필드 검증
    if (!guidebookId) {
      return NextResponse.json(
        { error: '가이드북 ID가 필요합니다' },
        { status: 400 }
      );
    }

    if (!eventType) {
      return NextResponse.json(
        { error: '이벤트 타입이 필요합니다' },
        { status: 400 }
      );
    }

    // 2. UUID 형식 검증
    if (!UUID_REGEX.test(guidebookId)) {
      return NextResponse.json(
        { error: '잘못된 가이드북 ID 형식입니다' },
        { status: 400 }
      );
    }

    // 3. 이벤트 타입 검증
    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: `유효하지 않은 이벤트 타입입니다. 허용: ${VALID_EVENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // 4. social_share인 경우 platform 검증
    if (eventType === 'social_share') {
      const platform = eventData?.platform;
      if (!platform || !['kakao', 'twitter', 'facebook'].includes(platform)) {
        return NextResponse.json(
          { error: 'social_share 이벤트에는 유효한 platform이 필요합니다 (kakao, twitter, facebook)' },
          { status: 400 }
        );
      }
    }

    // 5. 방문자 정보 수집 (익명화)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const ipHash = hashIP(ip);
    const userAgent = request.headers.get('user-agent') || null;
    const visitorId = generateVisitorId();

    // 6. Admin client로 이벤트 기록 (RLS 우회)
    const supabase = createAdminClient();

    // 가이드북 존재 여부 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id')
      .eq('id', guidebookId)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        { error: '가이드북을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // RPC 함수 호출 시도
    const { data: eventId, error: rpcError } = await supabase.rpc(
      'track_share_event',
      {
        p_guidebook_id: guidebookId,
        p_event_type: eventType,
        p_event_data: eventData || {},
        p_visitor_id: visitorId,
        p_ip_hash: ipHash,
        p_user_agent: userAgent,
      }
    );

    if (rpcError) {
      // RPC가 없는 경우 직접 삽입
      const { data: insertedEvent, error: insertError } = await supabase
        .from('share_events')
        .insert({
          guidebook_id: guidebookId,
          event_type: eventType,
          event_data: eventData || {},
          visitor_id: visitorId,
          ip_hash: ipHash,
          user_agent: userAgent,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('공유 이벤트 기록 실패:', insertError);
        return NextResponse.json(
          { error: '이벤트 기록 중 오류가 발생했습니다' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { eventId: insertedEvent.id },
      });
    }

    return NextResponse.json({
      success: true,
      data: { eventId },
    });
  } catch (error) {
    console.error('공유 이벤트 API 에러:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: '잘못된 JSON 형식입니다' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '서버 에러가 발생했습니다' },
      { status: 500 }
    );
  }
}
