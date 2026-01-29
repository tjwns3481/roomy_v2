// @TASK P4-T4.6 - 이미지 업로드 API
// @SPEC docs/planning/06-tasks.md#P4-T4.6

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import sharp from 'sharp';

/**
 * POST /api/upload
 * 이미지 업로드 (프로필 사진, 가이드북 이미지)
 */
export async function POST(request: Request) {
  try {
    // 1. 세션 확인
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // 2. FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar' | 'guidebook'

    if (!file) {
      return NextResponse.json({ error: '파일이 필요합니다' }, { status: 400 });
    }

    // 3. 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '이미지 파일만 업로드할 수 있습니다' }, { status: 400 });
    }

    // 4. 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다' }, { status: 400 });
    }

    // 5. 파일을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. 이미지 리사이즈
    let processedBuffer = buffer;
    let maxSize = 1920; // 기본값

    if (type === 'avatar') {
      // 프로필 사진: 200x200
      maxSize = 200;
      processedBuffer = await sharp(buffer)
        .resize(maxSize, maxSize, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toBuffer();
    } else if (type === 'guidebook') {
      // 가이드북 이미지: 최대 1920px
      processedBuffer = await sharp(buffer)
        .resize(maxSize, maxSize, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
    }

    // 7. Supabase Storage에 업로드
    const supabase = await createServerClient();
    const fileExt = 'webp';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = type === 'avatar'
      ? `avatars/${session.user.id}/${fileName}`
      : `guidebook-images/${session.user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(type === 'avatar' ? 'avatars' : 'guidebook-images')
      .upload(filePath, processedBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: '이미지 업로드에 실패했습니다' }, { status: 500 });
    }

    // 8. 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(type === 'avatar' ? 'avatars' : 'guidebook-images')
      .getPublicUrl(filePath);

    // 9. 성공 응답
    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
