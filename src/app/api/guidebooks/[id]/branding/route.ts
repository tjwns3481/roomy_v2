// @TASK P8-R2: Branding API Routes
// @SPEC specs/domain/resources.yaml - branding resource
// @ENDPOINTS GET, PUT /api/guidebooks/[id]/branding

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { BrandingUpdateSchema, Branding } from '@/lib/validations/branding';
import { z } from 'zod';

/**
 * GET /api/guidebooks/[id]/branding
 * @description 가이드북 브랜딩 설정 조회
 * @auth 소유자만 조회 가능 (RLS)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createServerClient();

    // TODO: brandings 테이블 마이그레이션 필요
    // const { data, error } = await supabase
    //   .from('brandings')
    //   .select('*')
    //   .eq('guidebook_id', id)
    //   .single();
    const data = null;
    const error: any = null;

    if (error) {
      // PGRST116 = Not found
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: '브랜딩 설정이 없습니다.',
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: {
            code: 'FETCH_ERROR',
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[Branding GET Error]', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '브랜딩 조회 중 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/guidebooks/[id]/branding
 * @description 가이드북 브랜딩 설정 생성/수정 (Upsert)
 * @auth Pro+ 플랜 소유자만 수정 가능 (RLS)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Zod 검증
    const validatedData = BrandingUpdateSchema.parse(body);

    const supabase = await createServerClient();

    // Upsert (guidebook_id 기준으로 충돌 시 업데이트)
    // TODO: brandings 테이블 마이그레이션 필요
    // const { data, error } = await supabase
    //   .from('brandings')
    //   .upsert(
    //     {
    //       guidebook_id: id,
    //       ...validatedData,
    //     },
    //     { onConflict: 'guidebook_id' }
    //   )
    //   .eq('guidebook_id', id)
    //   .select()
    //   .single();
    const data = { guidebook_id: id, ...validatedData };
    const error: any = null;

    if (error) {
      // RLS 권한 에러 (Pro+ 플랜 아님)
      if (error.code === '42501') {
        return NextResponse.json(
          {
            error: {
              code: 'PERMISSION_DENIED',
              message: '브랜딩 설정은 Pro 이상 플랜에서만 사용할 수 있습니다.',
            },
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: {
            code: 'UPDATE_ERROR',
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    // Zod 검증 에러
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값이 올바르지 않습니다.',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error('[Branding PUT Error]', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '브랜딩 저장 중 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
