// @TASK P8-R4: Upsell 요청 상태 변경 API (호스트용)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateUpsellRequestSchema } from '@/lib/validations/upsell';
import type { UpdateUpsellRequestRequest, UpsellRequestResponse } from '@/types/upsell';

/**
 * PATCH /api/guidebooks/[id]/upsell/requests/[reqId]
 * 호스트가 Upsell 요청 상태 변경
 * - 인증 필요
 * - RLS: 본인 가이드북의 요청만 수정 가능
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; reqId: string } }
) {
  try {
    const { id: guidebookId, reqId } = params;
    const body: UpdateUpsellRequestRequest = await request.json();

    // 1. 유효성 검증
    const validationResult = updateUpsellRequestSchema.safeParse(body);
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

    const { status } = validationResult.data;

    const supabase = await createClient();

    // 2. 사용자 인증 확인
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

    // 3. 가이드북 소유권 확인
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

    // 4. 요청 존재 확인
    const { data: existingRequest, error: fetchError } = await supabase
      .from('upsell_requests')
      .select('id, guidebook_id, status')
      .eq('id', reqId)
      .eq('guidebook_id', guidebookId)
      .single();

    if (fetchError || !existingRequest) {
      return NextResponse.json(
        {
          error: {
            code: 'REQUEST_NOT_FOUND',
            message: '요청을 찾을 수 없습니다',
          },
        },
        { status: 404 }
      );
    }

    // 5. 상태 업데이트
    const { data: updatedRequest, error: updateError } = await supabase
      .from('upsell_requests')
      .update({ status })
      .eq('id', reqId)
      .eq('guidebook_id', guidebookId)
      .select()
      .single();

    if (updateError) {
      console.error('Upsell request update error:', updateError);
      return NextResponse.json(
        {
          error: {
            code: 'UPDATE_ERROR',
            message: '요청 상태 변경 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }

    const response: UpsellRequestResponse = {
      request: updatedRequest,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('PATCH /api/guidebooks/[id]/upsell/requests/[reqId] error:', error);
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

/**
 * DELETE /api/guidebooks/[id]/upsell/requests/[reqId]
 * 호스트가 Upsell 요청 삭제
 * - 인증 필요
 * - RLS: 본인 가이드북의 요청만 삭제 가능
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; reqId: string } }
) {
  try {
    const { id: guidebookId, reqId } = params;

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

    // 3. 요청 삭제
    const { error: deleteError } = await supabase
      .from('upsell_requests')
      .delete()
      .eq('id', reqId)
      .eq('guidebook_id', guidebookId);

    if (deleteError) {
      console.error('Upsell request delete error:', deleteError);
      return NextResponse.json(
        {
          error: {
            code: 'DELETE_ERROR',
            message: '요청 삭제 중 오류가 발생했습니다',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/guidebooks/[id]/upsell/requests/[reqId] error:', error);
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
