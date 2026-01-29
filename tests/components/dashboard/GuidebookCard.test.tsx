// @TASK P8-S5-T1 - 대시보드 가이드북 카드 테스트
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuidebookCard } from '@/components/dashboard/GuidebookCard';
import type { Guidebook } from '@/types/guidebook';

const mockGuidebook: Guidebook = {
  id: '1',
  user_id: 'user-1',
  title: '서울 게스트하우스',
  slug: 'seoul-guesthouse',
  status: 'published',
  hero_image_url: 'https://example.com/hero.jpg',
  view_count: 123,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  published_at: '2024-01-10T00:00:00Z',
};

describe('GuidebookCard', () => {
  it('가이드북 정보를 표시해야 함', () => {
    render(<GuidebookCard guidebook={mockGuidebook} />);

    expect(screen.getByText('서울 게스트하우스')).toBeInTheDocument();
    expect(screen.getByText(/seoul-guesthouse/)).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('상태 뱃지를 표시해야 함', () => {
    render(<GuidebookCard guidebook={mockGuidebook} />);
    expect(screen.getByText('공개')).toBeInTheDocument();
  });

  it('썸네일 이미지를 표시해야 함', () => {
    render(<GuidebookCard guidebook={mockGuidebook} />);
    const img = screen.getByAltText('서울 게스트하우스');
    expect(img).toHaveAttribute('src', 'https://example.com/hero.jpg');
  });

  it('썸네일이 없을 때 기본 아이콘을 표시해야 함', () => {
    const guidebookWithoutImage = { ...mockGuidebook, hero_image_url: null };
    render(<GuidebookCard guidebook={guidebookWithoutImage} />);

    // svg 아이콘이 표시되는지 확인
    const container = screen.getByTestId('thumbnail-container');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('AirBnB 스타일 그림자를 적용해야 함', () => {
    const { container } = render(<GuidebookCard guidebook={mockGuidebook} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('shadow-airbnb-sm');
  });

  it('호버 시 그림자가 강해져야 함', () => {
    const { container } = render(<GuidebookCard guidebook={mockGuidebook} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('hover:shadow-airbnb-md');
  });

  it('편집 버튼 클릭 시 onEdit 콜백을 호출해야 함', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();

    render(<GuidebookCard guidebook={mockGuidebook} onEdit={onEdit} />);

    const editButton = screen.getByText('편집');
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockGuidebook.id);
  });

  it('미리보기 버튼 클릭 시 onPreview 콜백을 호출해야 함', async () => {
    const user = userEvent.setup();
    const onPreview = jest.fn();

    render(<GuidebookCard guidebook={mockGuidebook} onPreview={onPreview} />);

    const previewButton = screen.getByText('미리보기');
    await user.click(previewButton);

    expect(onPreview).toHaveBeenCalledWith(mockGuidebook.slug);
  });
});
