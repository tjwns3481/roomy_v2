// @TASK P4-T4.4 - 가이드북 설정 페이지
// @SPEC docs/planning/06-tasks.md#p4-t44

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { GuidebookSettings } from '@/components/dashboard/GuidebookSettings';
import { ShareSettings } from '@/components/dashboard/ShareSettings';
import { DangerZone } from '@/components/dashboard/DangerZone';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GuidebookSettingsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  // 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 가이드북 조회 (RLS로 본인 소유만 조회 가능)
  const { data: guidebook, error } = await supabase
    .from('guidebooks')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !guidebook) {
    redirect('/dashboard');
  }

  // 현재 플랜 조회
  const { data: planData } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const userPlan = planData?.plan || 'free';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <a
            href={`/editor/${id}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 inline-block"
          >
            ← 에디터로 돌아가기
          </a>
          <h1 className="text-3xl font-bold text-gray-900">가이드북 설정</h1>
          <p className="text-gray-600 mt-1">
            {guidebook.title}의 설정을 관리하세요
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* 기본 정보 */}
          <GuidebookSettings guidebook={guidebook} />

          {/* 공유 설정 */}
          <ShareSettings guidebook={guidebook} />

          {/* 위험 구역 */}
          <DangerZone guidebookId={id} guidebookTitle={guidebook.title} />
        </div>
      </div>
    </div>
  );
}
