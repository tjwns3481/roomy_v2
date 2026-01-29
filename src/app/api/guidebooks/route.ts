// @TASK P4-T4.3 - 가이드북 생성 API
// @TASK P6-T6.7 - 플랜별 가이드북 생성 제한 체크
// @SPEC docs/planning/03-user-flow.md#가이드북-생성-플로우

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { withGuidebookLimit } from '@/lib/subscription/middleware';

/**
 * 가이드북 생성 요청 스키마
 */
const createGuidebookSchema = z.object({
  title: z.string().min(1, '숙소 이름을 입력해주세요').max(100),
  slug: z
    .string()
    .min(3, '슬러그는 최소 3자 이상이어야 합니다')
    .max(50, '슬러그는 최대 50자까지 가능합니다')
    .regex(
      /^[a-z0-9-]+$/,
      '슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다'
    ),
  theme: z.enum(['modern', 'cozy', 'minimal', 'nature', 'luxury']).optional().default('modern'),
});

/**
 * POST /api/guidebooks
 * 새 가이드북 생성
 */
export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    // 요청 본문 검증
    const body = await req.json();
    const validatedData = createGuidebookSchema.parse(body);

    const supabase = createAdminClient();

    // 슬러그 중복 확인
    const { data: existingGuidebook } = await supabase
      .from('guidebooks')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();

    if (existingGuidebook) {
      return NextResponse.json(
        { error: '이미 사용 중인 슬러그입니다' },
        { status: 409 }
      );
    }

    // @TASK P6-T6.7 - 플랜별 가이드북 생성 제한 확인 (미들웨어 사용)
    const limitResult = await withGuidebookLimit(session.user.id);

    if (!limitResult.success) {
      // 402 Payment Required - 제한 초과 시 업그레이드 유도
      return NextResponse.json(limitResult.response, { status: 402 });
    }

    // 테마별 기본 색상 설정
    const themeColors: Record<string, { primary: string; secondary: string }> = {
      modern: { primary: '#2563EB', secondary: '#F97316' },
      cozy: { primary: '#D97706', secondary: '#DC2626' },
      minimal: { primary: '#374151', secondary: '#6B7280' },
      nature: { primary: '#059669', secondary: '#10B981' },
      luxury: { primary: '#7C3AED', secondary: '#A855F7' },
    };

    const colors = themeColors[validatedData.theme];

    // 가이드북 생성
    const { data: guidebook, error: createError } = await supabase
      .from('guidebooks')
      .insert({
        user_id: session.user.id,
        title: validatedData.title,
        slug: validatedData.slug,
        theme: validatedData.theme,
        primary_color: colors.primary,
        secondary_color: colors.secondary,
        status: 'draft',
        is_password_protected: false,
      })
      .select()
      .single();

    if (createError) {
      console.error('가이드북 생성 오류:', createError);
      return NextResponse.json(
        { error: '가이드북 생성 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 기본 Hero 블록 생성
    const { error: heroError } = await supabase.from('blocks').insert({
      guidebook_id: guidebook.id,
      type: 'hero',
      order_index: 0,
      is_visible: true,
      content: {
        type: 'hero',
        imageUrl: '',
        title: validatedData.title,
        subtitle: '환영합니다',
      },
    });

    if (heroError) {
      console.error('Hero 블록 생성 오류:', heroError);
      // Hero 블록 생성 실패는 치명적이지 않으므로 계속 진행
    }

    return NextResponse.json(
      {
        guidebook,
        message: '가이드북이 생성되었습니다',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues?.[0]?.message || '입력 데이터가 유효하지 않습니다';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    console.error('가이드북 생성 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/guidebooks
 * 사용자의 가이드북 목록 조회
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: guidebooks, error } = await supabase
      .from('guidebooks')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('가이드북 조회 오류:', error);
      return NextResponse.json(
        { error: '가이드북 조회 중 오류가 발생했습니다', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ guidebooks });
  } catch (error) {
    console.error('가이드북 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
