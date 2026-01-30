// @TASK P8-S11-T1: 브랜딩 이미지 업로드 API
// @SPEC specs/screens/editor-branding.yaml

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

/**
 * POST /api/upload/branding
 * @description 브랜딩 이미지 업로드 (로고, 파비콘)
 * @auth Pro+ 플랜 사용자만
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // 1. 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
        { status: 401 }
      );
    }

    // 2. FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const guidebookId = formData.get('guidebookId') as string;

    if (!file || !guidebookId) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: '파일과 가이드북 ID가 필요합니다' } },
        { status: 400 }
      );
    }

    // 3. 가이드북 소유권 확인
    const { data: guidebook, error: guidebookError } = await supabase
      .from('guidebooks')
      .select('id, user_id')
      .eq('id', guidebookId)
      .eq('user_id', user.id)
      .single();

    if (guidebookError || !guidebook) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: '권한이 없습니다' } },
        { status: 403 }
      );
    }

    // 4. 파일 검증
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: { code: 'FILE_TOO_LARGE', message: '파일 크기는 5MB 이하여야 합니다' } },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: { code: 'INVALID_FILE_TYPE', message: '이미지 파일만 업로드 가능합니다' } },
        { status: 400 }
      );
    }

    // 5. 파일 업로드 (Storage)
    const ext = file.name.split('.').pop();
    const fileName = `${nanoid()}.${ext}`;
    const filePath = `${user.id}/${guidebookId}/branding/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('guidebook-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload Error]', uploadError);
      return NextResponse.json(
        { error: { code: 'UPLOAD_ERROR', message: uploadError.message } },
        { status: 500 }
      );
    }

    // 6. Public URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from('guidebook-images').getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('[Branding Upload Error]', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: '업로드 중 오류가 발생했습니다',
        },
      },
      { status: 500 }
    );
  }
}
