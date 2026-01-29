// @TASK P1-T1.1 - 에디터 페이지 (서버 컴포넌트)
// @TASK Editor-Fix - 실제 가이드북 데이터 연동
// @SPEC docs/planning/06-tasks.md#P1-T1.1

import { EditorLayout } from '@/components/editor/EditorLayout';

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditorLayout guidebookId={id} />;
}
