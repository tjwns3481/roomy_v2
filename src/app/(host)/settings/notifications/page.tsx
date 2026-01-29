// @TASK P4-T4.6 - 알림 설정 전용 페이지 (옵션)
// @SPEC docs/planning/06-tasks.md#P4-T4.6

import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { auth } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '알림 설정 - Roomy',
  description: '알림 수신 설정',
};

export default async function NotificationsPage() {
  // 인증 확인
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // 알림 설정 가져오기
  const supabase = await createServerClient();
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">알림 설정</h1>
        <p className="text-muted-foreground mt-2">이메일 알림 수신 설정을 관리하세요</p>
      </div>

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
