// @TASK P1-T1.1 - 에디터 페이지 (서버 컴포넌트)
// @SPEC docs/planning/06-tasks.md#P1-T1.1

import { EditorLayout } from '@/components/editor/EditorLayout';

// 임시 데이터 (P2에서 Supabase 연동)
const mockGuide = {
  id: '123',
  title: '서울 게스트하우스',
  slug: 'seoul-guesthouse',
  blocks: [
    {
      id: '1',
      type: 'hero',
      order: 0,
      data: {
        title: '환영합니다',
        subtitle: '편안한 숙박을 위한 안내',
        imageUrl: '',
      },
    },
    {
      id: '2',
      type: 'info',
      order: 1,
      data: {
        text: '체크인: 15:00 / 체크아웃: 11:00',
      },
    },
    {
      id: '3',
      type: 'wifi',
      order: 2,
      data: {
        ssid: 'Guest-WiFi',
        password: 'password123',
      },
    },
  ],
};

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO: P2에서 Supabase에서 가이드북 로드
  // const guide = await getGuide(id);

  return <EditorLayout guide={mockGuide} />;
}
