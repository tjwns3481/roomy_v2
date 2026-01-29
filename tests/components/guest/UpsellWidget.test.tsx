// @TASK P8-S2-T3 - Upsell 위젯 테스트
// @SPEC specs/screens/guest-viewer.yaml

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpsellWidget } from '@/components/guest/UpsellWidget';
import type { UpsellItem } from '@/types/upsell';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock toast
jest.mock('@/lib/toast', () => ({
  toastMessages: {
    upsell: {
      requestSuccess: '요청이 완료되었습니다',
      requestError: '요청 중 오류가 발생했습니다',
    },
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    promise: jest.fn((promise, options) => promise),
  },
}));

describe('UpsellWidget', () => {
  const mockItems: UpsellItem[] = [
    {
      id: 'item-1',
      guidebook_id: 'guidebook-1',
      name: '조식 서비스',
      description: '신선한 재료로 만든 건강한 아침식사',
      price: 15000,
      image_url: 'https://example.com/breakfast.jpg',
      is_active: true,
      sort_order: 0,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'item-2',
      guidebook_id: 'guidebook-1',
      name: '공항 픽업',
      description: '편안한 차량으로 공항까지 모셔드립니다',
      price: 50000,
      image_url: 'https://example.com/pickup.jpg',
      is_active: true,
      sort_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'item-3',
      guidebook_id: 'guidebook-1',
      name: '객실 업그레이드',
      description: null,
      price: 30000,
      image_url: null,
      is_active: true,
      sort_order: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('아이템 로딩 및 표시', () => {
    it('아이템을 로딩하여 캐러셀로 표시해야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockItems, total: 3 }),
      });

      render(<UpsellWidget guidebookId="guidebook-1" />);

      // API 호출 확인
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/guidebooks/guidebook-1/upsell/items'
        );
      });

      // 모든 아이템이 렌더링되는지 확인
      await waitFor(() => {
        expect(screen.getByText('조식 서비스')).toBeInTheDocument();
        expect(screen.getByText('공항 픽업')).toBeInTheDocument();
        expect(screen.getByText('객실 업그레이드')).toBeInTheDocument();
      });

      // 가격이 올바르게 포맷되는지 확인
      expect(screen.getByText('₩15,000')).toBeInTheDocument();
      expect(screen.getByText('₩50,000')).toBeInTheDocument();
      expect(screen.getByText('₩30,000')).toBeInTheDocument();
    });

    it('아이템이 없을 때 위젯을 표시하지 않아야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [], total: 0 }),
      });

      const { container } = render(<UpsellWidget guidebookId="guidebook-1" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // 위젯이 렌더링되지 않아야 함
      expect(container.firstChild).toBeNull();
    });

    it('로딩 중 스켈레톤을 표시해야 함', () => {
      mockFetch.mockImplementation(
        () => new Promise(() => {}) // 무한 대기
      );

      render(<UpsellWidget guidebookId="guidebook-1" />);

      // 스켈레톤 요소 확인
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('API 에러 시 위젯을 표시하지 않아야 함', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'API Error' } }),
      });

      const { container } = render(<UpsellWidget guidebookId="guidebook-1" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(container.firstChild).toBeNull();
    });
  });

  describe('아이템 상세 모달', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockItems, total: 3 }),
      });
    });

    it('아이템 클릭 시 상세 모달이 열려야 함', async () => {
      const user = userEvent.setup();

      render(<UpsellWidget guidebookId="guidebook-1" />);

      await waitFor(() => {
        expect(screen.getByText('조식 서비스')).toBeInTheDocument();
      });

      // 첫 번째 아이템 클릭
      await user.click(screen.getByText('조식 서비스'));

      // 모달이 열리고 상세 정보가 표시되는지 확인
      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
        expect(
          within(modal).getByText('신선한 재료로 만든 건강한 아침식사')
        ).toBeInTheDocument();
      });
    });

    it('모달에서 "요청하기" 버튼 클릭 시 요청 폼이 표시되어야 함', async () => {
      const user = userEvent.setup();

      render(<UpsellWidget guidebookId="guidebook-1" />);

      await waitFor(() => {
        expect(screen.getByText('조식 서비스')).toBeInTheDocument();
      });

      // 아이템 클릭하여 모달 열기
      await user.click(screen.getByText('조식 서비스'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // "요청하기" 버튼 클릭
      const requestButton = screen.getByRole('button', { name: /요청하기/i });
      await user.click(requestButton);

      // 요청 폼이 표시되는지 확인
      await waitFor(() => {
        expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/연락처/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/메시지/i)).toBeInTheDocument();
      });
    });
  });

  describe('요청 생성', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockItems, total: 3 }),
      });
    });

    it('유효한 정보 입력 시 요청이 생성되어야 함', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          request: {
            id: 'req-1',
            upsell_item_id: 'item-1',
            guidebook_id: 'guidebook-1',
            guest_name: '홍길동',
            guest_contact: '010-1234-5678',
            message: '2박 3일 조식 신청합니다',
            status: 'pending',
            created_at: '2024-01-01T00:00:00Z',
          },
        }),
      });

      render(<UpsellWidget guidebookId="guidebook-1" />);

      await waitFor(() => {
        expect(screen.getByText('조식 서비스')).toBeInTheDocument();
      });

      // 아이템 클릭하여 모달 열기
      await user.click(screen.getByText('조식 서비스'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // "요청하기" 버튼 클릭
      const requestButton = screen.getByRole('button', { name: /요청하기/i });
      await user.click(requestButton);

      // 폼 입력
      await waitFor(() => {
        expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/이름/i), '홍길동');
      await user.type(screen.getByLabelText(/연락처/i), '010-1234-5678');
      await user.type(
        screen.getByLabelText(/메시지/i),
        '2박 3일 조식 신청합니다'
      );

      // 제출 버튼 클릭
      const submitButton = screen.getByRole('button', { name: /제출/i });
      await user.click(submitButton);

      // API 호출 확인
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/upsell/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            upsell_item_id: 'item-1',
            guest_name: '홍길동',
            guest_contact: '010-1234-5678',
            message: '2박 3일 조식 신청합니다',
          }),
        });
      });

      // 성공 메시지 확인
      await waitFor(() => {
        expect(screen.getByText(/요청이 완료되었습니다/i)).toBeInTheDocument();
        expect(
          screen.getByText(/곧 연락드리겠습니다/i)
        ).toBeInTheDocument();
      });
    });

    it('필수 필드 누락 시 에러 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();

      render(<UpsellWidget guidebookId="guidebook-1" />);

      await waitFor(() => {
        expect(screen.getByText('조식 서비스')).toBeInTheDocument();
      });

      // 아이템 클릭하여 모달 열기
      await user.click(screen.getByText('조식 서비스'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // "요청하기" 버튼 클릭
      const requestButton = screen.getByRole('button', { name: /요청하기/i });
      await user.click(requestButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
      });

      // 필수 필드 없이 제출
      const submitButton = screen.getByRole('button', { name: /제출/i });
      await user.click(submitButton);

      // 에러 메시지 확인
      await waitFor(() => {
        expect(screen.getByText(/이름은 필수입니다/i)).toBeInTheDocument();
        expect(screen.getByText(/연락처는 필수입니다/i)).toBeInTheDocument();
      });

      // API 호출이 발생하지 않아야 함
      expect(mockFetch).toHaveBeenCalledTimes(1); // 초기 아이템 로딩만
    });

    it('API 에러 시 에러 토스트가 표시되어야 함', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { code: 'ITEM_INACTIVE', message: '현재 이용할 수 없는 아이템입니다' },
        }),
      });

      render(<UpsellWidget guidebookId="guidebook-1" />);

      await waitFor(() => {
        expect(screen.getByText('조식 서비스')).toBeInTheDocument();
      });

      // 아이템 클릭하여 모달 열기
      await user.click(screen.getByText('조식 서비스'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // "요청하기" 버튼 클릭
      const requestButton = screen.getByRole('button', { name: /요청하기/i });
      await user.click(requestButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
      });

      // 폼 입력
      await user.type(screen.getByLabelText(/이름/i), '홍길동');
      await user.type(screen.getByLabelText(/연락처/i), '010-1234-5678');

      // 제출
      const submitButton = screen.getByRole('button', { name: /제출/i });
      await user.click(submitButton);

      // 에러 토스트 확인
      await waitFor(() => {
        const toast = require('sonner').toast;
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('AirBnB 스타일 디자인', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockItems, total: 3 }),
      });
    });

    it('캐러셀이 수평 스크롤 가능해야 함', async () => {
      render(<UpsellWidget guidebookId="guidebook-1" />);

      await waitFor(() => {
        expect(screen.getByText('조식 서비스')).toBeInTheDocument();
      });

      // 스크롤 컨테이너 확인
      const scrollContainer = screen
        .getByText('조식 서비스')
        .closest('[class*="overflow-x"]');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('카드에 AirBnB 스타일 그림자와 호버 효과가 있어야 함', async () => {
      render(<UpsellWidget guidebookId="guidebook-1" />);

      await waitFor(() => {
        expect(screen.getByText('조식 서비스')).toBeInTheDocument();
      });

      const card = screen
        .getByText('조식 서비스')
        .closest('[class*="shadow-airbnb"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(/hover:shadow-airbnb/);
    });

    it('이미지가 4:3 비율로 표시되어야 함', async () => {
      render(<UpsellWidget guidebookId="guidebook-1" />);

      await waitFor(() => {
        expect(screen.getByText('조식 서비스')).toBeInTheDocument();
      });

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);

      // 첫 번째 이미지의 컨테이너 확인
      const imageContainer = images[0].closest('[class*="aspect-"]');
      expect(imageContainer).toHaveClass(/aspect-\[4\/3\]/);
    });
  });
});
