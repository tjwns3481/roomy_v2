// @TASK P8-S13-T1: Upsell 설정 페이지
// @SPEC screens/s13-upsell-settings
// @AUTH Business 플랜만 접근 가능

import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UpsellSettingsClient } from '@/components/editor/UpsellSettingsClient';
import { EditorNav } from '@/components/editor/EditorNav';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import Link from 'next/link';

interface UpsellSettingsPageProps {
  params: Promise<{ id: string }>;
}

export default async function UpsellSettingsPage({
  params,
}: UpsellSettingsPageProps) {
  const { id: guidebookId } = await params;
  const supabase = await createServerClient();

  // 1. 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. 가이드북 소유권 확인
  const { data: guidebook, error: guidebookError } = await supabase
    .from('guidebooks')
    .select('id, user_id, title')
    .eq('id', guidebookId)
    .single();

  if (guidebookError || !guidebook) {
    redirect('/dashboard');
  }

  if (guidebook.user_id !== user.id) {
    redirect('/dashboard');
  }

  // 2.5 사용자 플랜 조회
  const { data: userData } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const userPlan = userData?.plan || 'free';

  // 3. Business 플랜 확인
  // TODO: can_create_upsell_item RPC 함수 마이그레이션 필요
  // const { data: canCreate } = await supabase.rpc('can_create_upsell_item', {
  //   p_user_id: user.id,
  // });
  const canCreate = userPlan === 'business';

  // Business 플랜이 아니면 업그레이드 안내
  if (!canCreate) {
    return (
      <>
        <EditorNav guidebookId={guidebookId} />
        <div className="container max-w-4xl py-8">
          <Alert className="border-amber-200 bg-amber-50">
            <Crown className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-h4 text-amber-900">
              Business 플랜 업그레이드 필요
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p className="text-body text-amber-800">
                Upsell 기능은 Business 플랜에서만 사용할 수 있습니다.
                게스트에게 추가 서비스를 판매하고 수익을 늘려보세요.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="default">
                  <Link href="/settings/subscription">
                    플랜 업그레이드
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/editor/${guidebookId}`}>
                    에디터로 돌아가기
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  // 4. 초기 데이터 로드
  // TODO: upsell_items, upsell_requests 테이블 마이그레이션 필요
  // const { data: items } = await supabase
  //   .from('upsell_items')
  //   .select('*')
  //   .eq('guidebook_id', guidebookId)
  //   .order('sort_order', { ascending: true });
  const items: any[] = [];

  // const { data: requests } = await supabase
  //   .from('upsell_requests')
  //   .select(
  //     `
  //     *,
  //     upsell_items (
  //       name,
  //       price
  //     )
  //   `
  //   )
  //   .eq('guidebook_id', guidebookId)
  //   .order('created_at', { ascending: false })
  //   .limit(50);
  const requests: any[] = [];

  // 통계 조회
  // TODO: get_upsell_request_stats RPC 함수 마이그레이션 필요
  // const { data: stats } = await supabase
  //   .rpc('get_upsell_request_stats', { p_guidebook_id: guidebookId })
  //   .single();
  const stats = {
    total_requests: 0,
    pending_requests: 0,
    confirmed_requests: 0,
    cancelled_requests: 0,
    total_revenue: 0,
  };

  return (
    <>
      <EditorNav guidebookId={guidebookId} />
      <UpsellSettingsClient
        guidebookId={guidebookId}
        guidebookTitle={guidebook.title}
        initialItems={items || []}
        initialRequests={requests || []}
        initialStats={
          stats || {
            pending_requests: 0,
            confirmed_requests: 0,
            cancelled_requests: 0,
          }
        }
      />
    </>
  );
}
