// @TASK P8-R4: Upsell 요청 생성 API (게스트용)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createUpsellRequestSchema } from '@/lib/validations/upsell';
import type { CreateUpsellRequestRequest, UpsellRequestResponse } from '@/types/upsell';

/**
 * POST /api/upsell/requests
 * 게스트가 Upsell 아이템 요청 생성
 * - 인증 불필요 (공개 API)
 * - RLS: 누구나 삽입 가능
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateUpsellRequestRequest = await request.json();

    // 1. 유효성 검증
    const validationResult = createUpsellRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.errors[0]?.message || '입력값이 올바르지 않습니다',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { upsell_item_id, guest_name, guest_contact, message } = validationResult.data;

    const supabase = await createClient();

    // 2. upsell_item 존재 및 활성화 확인
    const { data: item, error: itemError } = await supabase
      .from('upsell_items')
      .select('id, guidebook_id, is_active')
      .eq('id', upsell_item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        {
          error: {
            code: 'ITEM_NOT_FOUND',
            message: '요청하신 아이템을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    if (!item.is_active) {
      return NextResponse.json(
        {
          error: {
            code: 'ITEM_INACTIVE',
            message: '현재 이용할 수 없는 아이템입니다',
          },
        },
        { status: 400 }
      );
    }

    // 3. 요청 생성
    const { data: newRequest, error: insertError } = await supabase
      .from('upsell_requests')
      .insert({
        upsell_item_id,
        guidebook_id: item.guidebook_id,
        guest_name,
        guest_contact,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Upsell request creation error:', insertError);
      return NextResponse.json(
        {
          error: {
            code: 'CREATE_ERROR',
            message: '요청 생성 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }

    const response: UpsellRequestResponse = {
      request: newRequest,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('POST /api/upsell/requests error:', error);
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
