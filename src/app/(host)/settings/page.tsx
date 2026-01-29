// @TASK P4-T4.6 - 프로필 설정 페이지
// @SPEC docs/planning/06-tasks.md#P4-T4.6

import { Separator } from '@/components/ui/separator';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { PasswordForm } from '@/components/settings/PasswordForm';
import { PlanCard } from '@/components/settings/PlanCard';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '설정 - Roomy',
  description: '프로필 및 계정 설정',
};

export default async function SettingsPage() {
  // 인증 확인
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // 프로필 정보 가져오기
  const supabase = await createServerClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    console.error('Failed to fetch profile:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">프로필을 불러오는데 실패했습니다</p>
      </div>
    );
  }

  // 알림 설정 가져오기 (기본값 제공)
  const { data: notificationData } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  // DB 필드는 snake_case, 컴포넌트는 camelCase 사용
  const notificationSettings = notificationData
    ? {
        dailyStats: notificationData.daily_stats,
        newFeatures: notificationData.new_features,
        marketing: notificationData.marketing,
      }
    : {
        dailyStats: true,
        newFeatures: true,
        marketing: false,
      };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
        <p className="text-muted-foreground mt-2">회원님의 계정 및 프로필을 관리하세요</p>
      </div>

      <Separator />

      {/* 프로필 설정 */}
      <ProfileForm
        initialData={{
          display_name: profile.display_name,
          email: profile.email,
          avatar_url: profile.avatar_url,
        }}
      />

      {/* 비밀번호 변경 */}
      <PasswordForm />

      {/* 구독 플랜 */}
      <PlanCard currentPlan={profile.plan || 'free'} />

      {/* 알림 설정 */}
      <NotificationSettings
        initialData={{
          dailyStats: notificationSettings.dailyStats ?? true,
          newFeatures: notificationSettings.newFeatures ?? true,
          marketing: notificationSettings.marketing ?? false,
        }}
      />
    </div>
  );
}
