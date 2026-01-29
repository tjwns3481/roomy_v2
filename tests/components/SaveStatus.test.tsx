// @TASK P1-T1.8 - SaveStatus 컴포넌트 테스트
// @SPEC docs/planning/06-tasks.md#P1-T1.8

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SaveStatus } from '@/components/editor/SaveStatus';

describe('SaveStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-28T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('idle 상태에서 클라우드 아이콘만 표시되어야 함', () => {
    render(<SaveStatus status="idle" />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    // idle 상태에서는 텍스트가 비어있음
  });

  it('saving 상태에서 "저장 중..."을 표시해야 함', () => {
    render(<SaveStatus status="saving" />);

    expect(screen.getByText('저장 중...')).toBeInTheDocument();
  });

  it('saved 상태에서 "저장됨"을 표시해야 함', () => {
    render(<SaveStatus status="saved" />);

    expect(screen.getByText('저장됨')).toBeInTheDocument();
  });

  it('error 상태에서 에러 메시지를 표시해야 함', () => {
    render(<SaveStatus status="error" error="네트워크 오류" />);

    expect(screen.getByText('네트워크 오류')).toBeInTheDocument();
  });

  it('isPending=true일 때 "변경사항 감지..."를 표시해야 함', () => {
    render(<SaveStatus status="idle" isPending />);

    expect(screen.getByText('변경사항 감지...')).toBeInTheDocument();
  });

  it('saved 상태에서 마지막 저장 시간을 표시해야 함', () => {
    const lastSavedAt = new Date('2024-01-28T11:59:55Z'); // 5초 전
    render(<SaveStatus status="saved" lastSavedAt={lastSavedAt} />);

    // "방금" 또는 "5초 전" 형식으로 표시
    expect(screen.getByText(/방금|5초 전/)).toBeInTheDocument();
  });

  it('compact 모드에서는 텍스트가 표시되지 않아야 함', () => {
    render(<SaveStatus status="saving" compact />);

    // 텍스트가 없어야 함
    expect(screen.queryByText('저장 중...')).not.toBeInTheDocument();
  });

  it('aria-live="polite" 속성이 있어야 함', () => {
    render(<SaveStatus status="saved" />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  describe('시간 포맷팅', () => {
    it('5초 이내면 "방금"을 표시해야 함', () => {
      const lastSavedAt = new Date('2024-01-28T11:59:58Z'); // 2초 전
      render(<SaveStatus status="saved" lastSavedAt={lastSavedAt} />);

      expect(screen.getByText(/방금/)).toBeInTheDocument();
    });

    it('1분 이내면 "N초 전"을 표시해야 함', () => {
      const lastSavedAt = new Date('2024-01-28T11:59:30Z'); // 30초 전
      render(<SaveStatus status="saved" lastSavedAt={lastSavedAt} />);

      expect(screen.getByText(/30초 전/)).toBeInTheDocument();
    });

    it('1시간 이내면 "N분 전"을 표시해야 함', () => {
      const lastSavedAt = new Date('2024-01-28T11:45:00Z'); // 15분 전
      render(<SaveStatus status="saved" lastSavedAt={lastSavedAt} />);

      expect(screen.getByText(/15분 전/)).toBeInTheDocument();
    });
  });
});
