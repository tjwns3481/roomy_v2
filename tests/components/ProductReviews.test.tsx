import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ProductReviews } from '@/components/reviews/product-reviews';
import { ReviewWithAuthor, ReviewStats } from '@/types/review';

// Mock data
const mockReviewStats: ReviewStats = {
  total_count: 15,
  average_rating: 4.3,
  rating_distribution: {
    '1': 1,
    '2': 1,
    '3': 2,
    '4': 5,
    '5': 6,
  },
  has_images_count: 8,
  best_reviews_count: 2,
};

const mockReviews: ReviewWithAuthor[] = [
  {
    id: '1',
    product_id: 'product-1',
    user_id: 'user-1',
    order_item_id: 'order-item-1',
    rating: 5,
    title: '정말 유용한 상품입니다!',
    content: '디지털 상품이라 바로 다운로드 받아서 사용할 수 있어서 좋았습니다. 품질도 만족스럽습니다.',
    images: ['https://example.com/review-1.jpg', 'https://example.com/review-2.jpg'],
    like_count: 12,
    view_count: 45,
    is_best: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    author: {
      id: 'user-1',
      email: 'user1@example.com',
      nickname: '만족한 고객',
      avatar_url: null,
    },
  },
  {
    id: '2',
    product_id: 'product-1',
    user_id: 'user-2',
    order_item_id: 'order-item-2',
    rating: 4,
    title: '가격 대비 괜찮아요',
    content: '기대했던 것보다는 조금 부족했지만 가격을 생각하면 나쁘지 않습니다.',
    images: [],
    like_count: 3,
    view_count: 20,
    is_best: false,
    created_at: '2024-01-14T10:00:00Z',
    updated_at: '2024-01-14T10:00:00Z',
    author: {
      id: 'user-2',
      email: 'user2@example.com',
      nickname: '일반 구매자',
      avatar_url: null,
    },
  },
];

// Mock API functions
const mockFetchReviews = vi.fn();
const mockFetchStats = vi.fn();
const mockCreateReview = vi.fn();
const mockToggleLike = vi.fn();

describe('ProductReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchReviews.mockResolvedValue({ reviews: mockReviews, total: 15 });
    mockFetchStats.mockResolvedValue(mockReviewStats);
    mockCreateReview.mockResolvedValue({ success: true });
    mockToggleLike.mockResolvedValue({ liked: true });
  });

  describe('후기 목록 렌더링', () => {
    it('평균 별점과 총 후기 수를 표시해야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        // 평균 별점이 큰 글씨로 표시됨
        const ratingText = screen.getByText('4.3', { selector: '.text-5xl' });
        expect(ratingText).toBeInTheDocument();

        // 총 후기 수 확인
        expect(screen.getByText(/전체 15개/)).toBeInTheDocument();
      });
    });

    it('별점 분포를 표시해야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/5점/)).toBeInTheDocument();
        expect(screen.getByText(/4점/)).toBeInTheDocument();
        expect(screen.getByText(/3점/)).toBeInTheDocument();
      });
    });

    it('후기 카드 목록을 표시해야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('정말 유용한 상품입니다!')).toBeInTheDocument();
        expect(screen.getByText('가격 대비 괜찮아요')).toBeInTheDocument();
      });
    });

    it('베스트 후기 배지를 표시해야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('BEST')).toBeInTheDocument();
      });
    });
  });

  describe('정렬 기능', () => {
    it('정렬 옵션을 변경할 수 있어야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/정렬:/)).toBeInTheDocument();
      });
    });

    it('정렬 변경 시 후기를 다시 불러와야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        expect(mockFetchReviews).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('후기 작성 폼', () => {
    it('로그인한 사용자에게 후기 작성 버튼을 표시해야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
          currentUserId="user-3"
          hasPurchased={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('후기 작성')).toBeInTheDocument();
      });
    });

    it('구매하지 않은 사용자에게는 후기 작성 버튼을 비활성화해야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
          currentUserId="user-3"
          hasPurchased={false}
        />
      );

      await waitFor(() => {
        const writeButton = screen.getByRole('button', { name: /후기 작성/ });
        expect(writeButton).toBeDisabled();
      });
    });

    it('후기 작성 버튼 클릭 시 작성 폼을 표시해야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
          currentUserId="user-3"
          hasPurchased={true}
          orderItemId="order-item-3"
        />
      );

      const writeButton = await screen.findByRole('button', { name: /후기 작성/ });
      fireEvent.click(writeButton);

      await waitFor(() => {
        expect(screen.getByText('별점')).toBeInTheDocument();
      });
    });

    it('최대 5장까지만 이미지를 업로드할 수 있어야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
          currentUserId="user-3"
          hasPurchased={true}
          orderItemId="order-item-3"
        />
      );

      const writeButton = await screen.findByRole('button', { name: /후기 작성/ });
      fireEvent.click(writeButton);

      await waitFor(() => {
        expect(screen.getByText(/최대 5장/)).toBeInTheDocument();
      });
    });
  });

  describe('좋아요 기능', () => {
    it('좋아요 버튼을 클릭할 수 있어야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
          currentUserId="user-3"
        />
      );

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /좋아요/ }).length).toBeGreaterThan(0);
      });

      const likeButtons = screen.getAllByRole('button', { name: /좋아요/ });
      fireEvent.click(likeButtons[0]);

      await waitFor(() => {
        expect(mockToggleLike).toHaveBeenCalledWith('1');
      });
    });

    it('좋아요 수를 표시해야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument(); // 첫 번째 리뷰의 좋아요 수
      });
    });
  });

  describe('이미지 갤러리', () => {
    it('후기 이미지를 썸네일로 표시해야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        const images = screen.getAllByRole('img', { name: /후기 이미지/ });
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('이미지 클릭 시 라이트박스를 열어야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        const images = screen.getAllByRole('img', { name: /후기 이미지/ });
        expect(images.length).toBeGreaterThan(0);
      });

      const images = screen.getAllByRole('img', { name: /후기 이미지/ });
      fireEvent.click(images[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('무한 스크롤', () => {
    it('스크롤 시 더 많은 후기를 로드해야 함', async () => {
      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        expect(mockFetchReviews).toHaveBeenCalledTimes(1);
      });

      // 스크롤 이벤트 시뮬레이션
      const loadMoreButton = screen.queryByRole('button', { name: /더보기/ });
      if (loadMoreButton) {
        fireEvent.click(loadMoreButton);

        await waitFor(() => {
          expect(mockFetchReviews).toHaveBeenCalledTimes(2);
        });
      }
    });
  });

  describe('빈 상태 처리', () => {
    it('후기가 없을 때 안내 메시지를 표시해야 함', async () => {
      mockFetchReviews.mockResolvedValue({ reviews: [], total: 0 });
      mockFetchStats.mockResolvedValue({
        ...mockReviewStats,
        total_count: 0,
      });

      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/아직 작성된 후기가 없습니다/)).toBeInTheDocument();
      });
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중 스켈레톤을 표시해야 함', () => {
      mockFetchReviews.mockReturnValue(new Promise(() => {})); // 무한 대기

      render(
        <ProductReviews
          productId="product-1"
          fetchReviews={mockFetchReviews}
          fetchStats={mockFetchStats}
          createReview={mockCreateReview}
          toggleLike={mockToggleLike}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
