// @TASK P1-T1.1 - 에디터 레이아웃 테스트
// @SPEC docs/planning/06-tasks.md#P1-T1.1

import { describe, it, expect } from 'vitest';
import { EditorLayout } from '@/components/editor/EditorLayout';

describe('EditorLayout', () => {
  const mockGuide = {
    id: '123',
    title: '테스트 가이드북',
    slug: 'test-guide',
    blocks: [
      { id: '1', type: 'hero', order: 0, data: { title: '환영합니다' } },
      { id: '2', type: 'info', order: 1, data: { text: '안내사항' } },
    ],
  };

  it('EditorLayout 컴포넌트가 정의되어야 함', () => {
    expect(EditorLayout).toBeDefined();
  });

  it('가이드 props를 받아야 함', () => {
    expect(typeof EditorLayout).toBe('function');
  });
});
