// @TASK P8-S12-T1 - 리뷰 설정 API
// @SPEC P8 Screen 12 - Review Settings
// @ts-nocheck - review_settings 테이블은 아직 DB에 생성되지 않음 (P8-S12-T1)

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  ReviewSettings,
  UpdateReviewSettingsRequest,
} from '@/types/review';

/**
 * GET /api/review-settings/[guidebookId]
 * 가이드북의 리뷰 설정 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guidebookId: string }> }
) {
  try {
    const { guidebookId } = await params;
    const supabase = await createServerClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id')
      .eq('id', guidebookId)
      .eq('user_id', user.id)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        { error: 'Guidebook not found' },
        { status: 404 }
      );
    }

    // 리뷰 설정 조회 (없으면 기본값 반환)
    // @ts-ignore - review_settings 테이블은 아직 DB에 생성되지 않음 (P8-S12-T1)
    const { data: settings, error: settingsError } = await supabase
      .from('review_settings')
      .select('*')
      .eq('guidebook_id', guidebookId)
      .single();

    // 설정이 없으면 기본값 반환
    if (settingsError || !settings) {
      const defaultSettings: Partial<ReviewSettings> = {
        guidebook_id: guidebookId,
        is_enabled: false,
        airbnb_review_url: null,
        naver_place_url: null,
        google_maps_url: null,
        show_timing: 'checkout_day',
        popup_title: '즐거운 시간 보내셨나요?',
        popup_message:
          '경험을 공유해주시면 더 많은 분들이 좋은 추억을 만들 수 있어요!',
        total_shown: 0,
        total_clicked: 0,
      };

      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching review settings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/review-settings/[guidebookId]
 * 리뷰 설정 업데이트
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ guidebookId: string }> }
) {
  try {
    const { guidebookId } = await params;
    const supabase = await createServerClient();

    // 인증 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id')
      .eq('id', guidebookId)
      .eq('user_id', user.id)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        { error: 'Guidebook not found' },
        { status: 404 }
      );
    }

    // 요청 본문 파싱
    const body: UpdateReviewSettingsRequest = await request.json();

    // 기존 설정 확인
    // @ts-ignore - review_settings 테이블은 아직 DB에 생성되지 않음 (P8-S12-T1)
    const { data: existingSettings } = await supabase
      .from('review_settings')
      .select('id')
      .eq('guidebook_id', guidebookId)
      .single();

    let result;

    if (existingSettings) {
      // 업데이트
      // @ts-ignore - review_settings 테이블은 아직 DB에 생성되지 않음 (P8-S12-T1)
      const { data, error } = await supabase
        .from('review_settings')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('guidebook_id', guidebookId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    } else {
      // 생성
      // @ts-ignore - review_settings 테이블은 아직 DB에 생성되지 않음 (P8-S12-T1)
      const { data, error } = await supabase
        .from('review_settings')
        .insert({
          guidebook_id: guidebookId,
          ...body,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating review settings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
