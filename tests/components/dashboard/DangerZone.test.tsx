// @TASK P4-T4.4 - 위험 구역 컴포넌트 테스트
// @TEST tests/components/dashboard/DangerZone.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DangerZone } from '@/components/dashboard/DangerZone';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('DangerZone', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockSupabase = {
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (createClient as any).mockReturnValue(mockSupabase);
  });

  it('위험 구역 UI를 표시한다', () => {
    render(
      <DangerZone guidebookId="guidebook-1" guidebookTitle="테스트 가이드북" />
    );

    expect(screen.getByText('위험 구역')).toBeInTheDocument();
    expect(screen.getByText('가이드북 삭제')).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 확인 다이얼로그를 연다', () => {
    render(
      <DangerZone guidebookId="guidebook-1" guidebookTitle="테스트 가이드북" />
    );

    const deleteButton = screen.getAllByText('가이드북 삭제')[0];
    fireEvent.click(deleteButton);

    expect(screen.getByText('정말로 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('확인 텍스트를 정확히 입력해야 삭제 버튼이 활성화된다', () => {
    render(
      <DangerZone guidebookId="guidebook-1" guidebookTitle="테스트 가이드북" />
    );

    // 다이얼로그 열기
    const deleteButton = screen.getAllByText('가이드북 삭제')[0];
    fireEvent.click(deleteButton);

    // 확인 버튼은 비활성화 상태
    const confirmButton = screen.getByText('영구 삭제');
    expect(confirmButton).toBeDisabled();

    // 잘못된 텍스트 입력
    const input = screen.getByPlaceholderText('가이드북 삭제');
    fireEvent.change(input, { target: { value: '틀린 텍스트' } });
    expect(confirmButton).toBeDisabled();

    // 올바른 텍스트 입력
    fireEvent.change(input, { target: { value: '가이드북 삭제' } });
    expect(confirmButton).not.toBeDisabled();
  });

  it('가이드북을 삭제하고 대시보드로 이동한다', async () => {
    render(
      <DangerZone guidebookId="guidebook-1" guidebookTitle="테스트 가이드북" />
    );

    // 다이얼로그 열기
    const deleteButton = screen.getAllByText('가이드북 삭제')[0];
    fireEvent.click(deleteButton);

    // 확인 텍스트 입력
    const input = screen.getByPlaceholderText('가이드북 삭제');
    fireEvent.change(input, { target: { value: '가이드북 삭제' } });

    // 삭제 실행
    const confirmButton = screen.getByText('영구 삭제');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('guidebooks');
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard?deleted=true');
    });
  });

  it('삭제 실패 시 에러 메시지를 표시한다', async () => {
    const errorSupabase = {
      from: vi.fn(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Delete failed' },
          }),
        })),
      })),
    };

    (createClient as any).mockReturnValue(errorSupabase);

    render(
      <DangerZone guidebookId="guidebook-1" guidebookTitle="테스트 가이드북" />
    );

    // 다이얼로그 열기 및 삭제 실행
    const deleteButton = screen.getAllByText('가이드북 삭제')[0];
    fireEvent.click(deleteButton);

    const input = screen.getByPlaceholderText('가이드북 삭제');
    fireEvent.change(input, { target: { value: '가이드북 삭제' } });

    const confirmButton = screen.getByText('영구 삭제');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(
        screen.getByText('삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
      ).toBeInTheDocument();
    });
  });

  it('취소 버튼으로 다이얼로그를 닫을 수 있다', () => {
    render(
      <DangerZone guidebookId="guidebook-1" guidebookTitle="테스트 가이드북" />
    );

    // 다이얼로그 열기
    const deleteButton = screen.getAllByText('가이드북 삭제')[0];
    fireEvent.click(deleteButton);

    expect(screen.getByText('정말로 삭제하시겠습니까?')).toBeInTheDocument();

    // 취소 클릭
    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);

    // 다이얼로그가 닫혀야 함
    expect(screen.queryByText('정말로 삭제하시겠습니까?')).not.toBeInTheDocument();
  });
});
