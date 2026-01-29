// @TASK P4-T4.4 - 가이드북 설정 컴포넌트 테스트
// @TEST tests/components/dashboard/GuidebookSettings.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GuidebookSettings } from '@/components/dashboard/GuidebookSettings';
import { createClient } from '@/lib/supabase/client';
import type { Guidebook } from '@/types/guidebook';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

const mockGuidebook: Guidebook = {
  id: 'guidebook-1',
  user_id: 'user-1',
  title: '테스트 가이드북',
  slug: 'test-guidebook',
  description: null,
  airbnb_url: null,
  property_type: null,
  address: null,
  latitude: null,
  longitude: null,
  status: 'draft',
  is_password_protected: false,
  theme: 'modern',
  primary_color: '#2563EB',
  secondary_color: '#F97316',
  hero_image_url: null,
  og_image_url: null,
  view_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('GuidebookSettings', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          neq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: mockGuidebook, error: null }),
      })),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockReturnValue(mockSupabase);
  });

  it('가이드북 정보를 표시한다', () => {
    render(<GuidebookSettings guidebook={mockGuidebook} />);

    expect(screen.getByDisplayValue('테스트 가이드북')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-guidebook')).toBeInTheDocument();
  });

  it('제목을 수정할 수 있다', () => {
    render(<GuidebookSettings guidebook={mockGuidebook} />);

    const titleInput = screen.getByLabelText('숙소 이름');
    fireEvent.change(titleInput, { target: { value: '새로운 제목' } });

    expect(titleInput).toHaveValue('새로운 제목');
  });

  it('slug는 소문자, 숫자, 하이픈만 허용한다', () => {
    render(<GuidebookSettings guidebook={mockGuidebook} />);

    const slugInput = screen.getByLabelText('URL 슬러그');
    fireEvent.change(slugInput, { target: { value: 'New-Guidebook-123!@#' } });

    expect(slugInput).toHaveValue('new-guidebook-123');
  });

  it('변경사항을 저장할 수 있다', async () => {
    render(<GuidebookSettings guidebook={mockGuidebook} />);

    const titleInput = screen.getByLabelText('숙소 이름');
    fireEvent.change(titleInput, { target: { value: '새로운 제목' } });

    const saveButton = screen.getByText('변경사항 저장');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('guidebooks');
    });

    await waitFor(() => {
      expect(screen.getByText('변경사항이 저장되었습니다')).toBeInTheDocument();
    });
  });

  it('제목이 비어있으면 에러를 표시한다', async () => {
    render(<GuidebookSettings guidebook={mockGuidebook} />);

    const titleInput = screen.getByLabelText('숙소 이름');
    fireEvent.change(titleInput, { target: { value: '' } });

    const saveButton = screen.getByText('변경사항 저장');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('제목을 입력해주세요')).toBeInTheDocument();
    });
  });

  it('slug가 중복되면 에러를 표시한다', async () => {
    const duplicateSupabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => ({
              single: vi
                .fn()
                .mockResolvedValue({ data: { id: 'other-id' }, error: null }),
            })),
          })),
        })),
      })),
    };

    (createClient as any).mockReturnValue(duplicateSupabase);

    render(<GuidebookSettings guidebook={mockGuidebook} />);

    const slugInput = screen.getByLabelText('URL 슬러그');
    fireEvent.change(slugInput, { target: { value: 'duplicate-slug' } });

    const saveButton = screen.getByText('변경사항 저장');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText('이미 사용 중인 URL입니다. 다른 URL을 선택해주세요.')
      ).toBeInTheDocument();
    });
  });
});
