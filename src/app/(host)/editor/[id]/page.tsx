// @TASK P1-T1.1 - 에디터 페이지 (서버 컴포넌트)
// @TASK Editor-Fix - 실제 가이드북 데이터 연동
// @TASK P8-S13-T1 - 에디터 네비게이션 추가
// @SPEC docs/planning/06-tasks.md#P1-T1.1

import { EditorLayout } from '@/components/editor/EditorLayout';
import { EditorNav } from '@/components/editor/EditorNav';

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="h-screen flex flex-col">
      <EditorNav guidebookId={id} />
      <div className="flex-1 overflow-hidden">
        <EditorLayout guidebookId={id} />
      </div>
    </div>
  );
}
