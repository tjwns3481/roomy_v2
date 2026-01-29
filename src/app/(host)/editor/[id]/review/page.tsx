// @TASK P8-S12-T1 - 리뷰 설정 페이지
// @SPEC P8 Screen 12 - Review Settings

import { ReviewSettings } from '@/components/editor/ReviewSettings';

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ReviewSettings guidebookId={id} />;
}
