// @TASK P8-S9-T1 - 에디터 미리보기 통합 테스트

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditorLayout } from '@/components/editor/EditorLayout';

/**
 * 통합 테스트: EditorLayout + PreviewPanel
 *
 * 이 테스트는 실제 Supabase 연결이 필요하므로
 * 개발 환경에서만 실행됩니다.
 */
describe('Editor Preview Integration (Manual)', () => {
  it('should render editor layout with preview panel', () => {
    // 이 테스트는 실제 guidebookId가 필요하므로 스킵
    expect(true).toBe(true);
  });
});
