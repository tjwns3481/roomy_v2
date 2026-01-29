// @TASK P8-S11-T1: 브랜딩 설정 페이지
// @SPEC specs/screens/editor-branding.yaml

import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import BrandingEditor from '@/components/editor/BrandingEditor';

interface BrandingPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 브랜딩 설정 페이지 (Pro+ 전용)
 */
export default async function BrandingPage({ params }: BrandingPageProps) {
  const { id } = await params;
  const supabase = createServerClient();

  // 1. 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // 2. 가이드북 조회 (RLS로 소유자 확인)
  const { data: guidebook, error: guidebookError } = await supabase
    .from('guidebooks')
    .select('id, title, slug, user_id')
    .eq('id', id)
    .single();

  if (guidebookError || !guidebook) {
    notFound();
  }

  // 3. 사용자 플랜 조회
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, plan')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new Error('사용자 정보를 불러올 수 없습니다.');
  }

  // 4. 브랜딩 조회 (없으면 null)
  const { data: branding } = await supabase
    .from('brandings')
    .select('*')
    .eq('guidebook_id', id)
    .single();

  return (
    <div className="container mx-auto py-8 px-4">
      <BrandingEditor
        guidebookId={id}
        guidebookTitle={guidebook.title}
        guidebookSlug={guidebook.slug}
        userPlan={userData.plan}
        initialBranding={branding}
      />
    </div>
  );
}
