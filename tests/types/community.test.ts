import { describe, it, expect } from 'vitest';
import {
  ReviewSchema,
  CreateReviewSchema,
  UpdateReviewSchema,
  ReviewFilterSchema,
  ReviewStatsSchema,
  REVIEW_RATING_LABELS,
  REVIEW_SORT_OPTIONS,
} from '@/types/review';
import {
  InquirySchema,
  CreateInquirySchema,
  UpdateInquirySchema,
  AnswerInquirySchema,
  InquiryFilterSchema,
  InquiryStatsSchema,
  INQUIRY_CATEGORIES,
  INQUIRY_STATUS,
  INQUIRY_SORT_OPTIONS,
} from '@/types/inquiry';
import {
  CommentSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
  CommentFilterSchema,
  LikeSchema,
  ToggleLikeSchema,
  LikeStateSchema,
  COMMENTABLE_TYPES,
  LIKEABLE_TYPES,
  MAX_COMMENT_DEPTH,
} from '@/types/comment';

// ============================================================
// Review Type Tests
// ============================================================

describe('Review Types', () => {
  describe('ReviewSchema', () => {
    it('should validate valid review data', () => {
      const validReview = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        order_item_id: '123e4567-e89b-12d3-a456-426614174003',
        rating: 5,
        title: '정말 좋은 상품입니다',
        content: '디테일이 훌륭하고 실용적입니다. 강력 추천합니다!',
        images: ['https://example.com/image1.jpg'],
        like_count: 10,
        view_count: 100,
        is_best: true,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T10:00:00Z',
      };

      const result = ReviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
    });

    it('should reject invalid rating (out of range)', () => {
      const invalidReview = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        order_item_id: '123e4567-e89b-12d3-a456-426614174003',
        rating: 6, // Invalid: max is 5
        title: '제목',
        content: '내용',
        images: [],
        like_count: 0,
        view_count: 0,
        is_best: false,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T10:00:00Z',
      };

      const result = ReviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
    });

    it('should enforce maximum 5 images', () => {
      const validReview = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        order_item_id: '123e4567-e89b-12d3-a456-426614174003',
        rating: 5,
        title: '제목',
        content: '내용',
        images: [
          'https://example.com/1.jpg',
          'https://example.com/2.jpg',
          'https://example.com/3.jpg',
          'https://example.com/4.jpg',
          'https://example.com/5.jpg',
          'https://example.com/6.jpg', // 6th image
        ],
        like_count: 0,
        view_count: 0,
        is_best: false,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T10:00:00Z',
      };

      const result = ReviewSchema.safeParse(validReview);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateReviewSchema', () => {
    it('should validate valid review creation input', () => {
      const validInput = {
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        order_item_id: '123e4567-e89b-12d3-a456-426614174003',
        rating: 5,
        title: '훌륭한 상품',
        content: '매우 만족스럽습니다. 재구매 의사 100%입니다.',
        images: ['https://example.com/image.jpg'],
      };

      const result = CreateReviewSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject short content', () => {
      const invalidInput = {
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        order_item_id: '123e4567-e89b-12d3-a456-426614174003',
        rating: 5,
        title: '제목',
        content: '짧음', // Too short
      };

      const result = CreateReviewSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('ReviewStatsSchema', () => {
    it('should validate review statistics', () => {
      const validStats = {
        total_count: 150,
        average_rating: 4.5,
        rating_distribution: {
          '1': 5,
          '2': 10,
          '3': 20,
          '4': 50,
          '5': 65,
        },
        has_images_count: 80,
        best_reviews_count: 10,
      };

      const result = ReviewStatsSchema.safeParse(validStats);
      expect(result.success).toBe(true);
    });
  });

  describe('REVIEW_RATING_LABELS', () => {
    it('should have labels for all ratings 1-5', () => {
      expect(REVIEW_RATING_LABELS[1]).toBe('매우 불만족');
      expect(REVIEW_RATING_LABELS[2]).toBe('불만족');
      expect(REVIEW_RATING_LABELS[3]).toBe('보통');
      expect(REVIEW_RATING_LABELS[4]).toBe('만족');
      expect(REVIEW_RATING_LABELS[5]).toBe('매우 만족');
    });
  });
});

// ============================================================
// Inquiry Type Tests
// ============================================================

describe('Inquiry Types', () => {
  describe('InquirySchema', () => {
    it('should validate valid inquiry data', () => {
      const validInquiry = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        category: 'product' as const,
        title: '배송 기간이 궁금합니다',
        content: '주문 후 며칠 정도 소요되나요?',
        is_private: false,
        status: 'pending' as const,
        answer: null,
        answered_by: null,
        answered_at: null,
        view_count: 5,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T10:00:00Z',
      };

      const result = InquirySchema.safeParse(validInquiry);
      expect(result.success).toBe(true);
    });

    it('should validate answered inquiry', () => {
      const answeredInquiry = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        category: 'shipping' as const,
        title: '배송 문의',
        content: '언제 배송되나요?',
        is_private: false,
        status: 'answered' as const,
        answer: '결제 후 2~3일 이내 배송됩니다.',
        answered_by: '123e4567-e89b-12d3-a456-426614174010',
        answered_at: '2024-01-25T12:00:00Z',
        view_count: 10,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T12:00:00Z',
      };

      const result = InquirySchema.safeParse(answeredInquiry);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateInquirySchema', () => {
    it('should validate valid inquiry creation input', () => {
      const validInput = {
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        category: 'product' as const,
        title: '사이즈 문의',
        content: '제품의 실제 크기가 어떻게 되나요?',
        is_private: true,
      };

      const result = CreateInquirySchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject short content', () => {
      const invalidInput = {
        product_id: '123e4567-e89b-12d3-a456-426614174001',
        category: 'product' as const,
        title: '문의',
        content: '짧음', // Too short
      };

      const result = CreateInquirySchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('INQUIRY_CATEGORIES', () => {
    it('should have all category types', () => {
      expect(INQUIRY_CATEGORIES.product).toBe('상품 정보');
      expect(INQUIRY_CATEGORIES.shipping).toBe('배송 문의');
      expect(INQUIRY_CATEGORIES.refund).toBe('환불/교환');
      expect(INQUIRY_CATEGORIES.etc).toBe('기타');
    });
  });

  describe('INQUIRY_STATUS', () => {
    it('should have all status types', () => {
      expect(INQUIRY_STATUS.pending).toBe('답변 대기');
      expect(INQUIRY_STATUS.answered).toBe('답변 완료');
    });
  });
});

// ============================================================
// Comment Type Tests
// ============================================================

describe('Comment Types', () => {
  describe('CommentSchema', () => {
    it('should validate valid comment data', () => {
      const validComment = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        commentable_type: 'review' as const,
        commentable_id: '123e4567-e89b-12d3-a456-426614174001',
        parent_id: null,
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        content: '유익한 후기 감사합니다!',
        like_count: 5,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T10:00:00Z',
      };

      const result = CommentSchema.safeParse(validComment);
      expect(result.success).toBe(true);
    });

    it('should validate reply (with parent_id)', () => {
      const validReply = {
        id: '123e4567-e89b-12d3-a456-426614174010',
        commentable_type: 'review' as const,
        commentable_id: '123e4567-e89b-12d3-a456-426614174001',
        parent_id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174003',
        content: '저도 동의합니다!',
        like_count: 2,
        created_at: '2024-01-25T11:00:00Z',
        updated_at: '2024-01-25T11:00:00Z',
      };

      const result = CommentSchema.safeParse(validReply);
      expect(result.success).toBe(true);
    });

    it('should support both review and inquiry comments', () => {
      const reviewComment = CommentSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        commentable_type: 'review',
        commentable_id: '123e4567-e89b-12d3-a456-426614174001',
        parent_id: null,
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        content: '후기 댓글',
        like_count: 0,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T10:00:00Z',
      });

      const inquiryComment = CommentSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174010',
        commentable_type: 'inquiry',
        commentable_id: '123e4567-e89b-12d3-a456-426614174011',
        parent_id: null,
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        content: '문의 댓글',
        like_count: 0,
        created_at: '2024-01-25T10:00:00Z',
        updated_at: '2024-01-25T10:00:00Z',
      });

      expect(reviewComment.success).toBe(true);
      expect(inquiryComment.success).toBe(true);
    });
  });

  describe('CreateCommentSchema', () => {
    it('should validate comment creation input', () => {
      const validInput = {
        commentable_type: 'review' as const,
        commentable_id: '123e4567-e89b-12d3-a456-426614174001',
        parent_id: null,
        content: '좋은 후기 감사합니다.',
      };

      const result = CreateCommentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should enforce max length', () => {
      const invalidInput = {
        commentable_type: 'review' as const,
        commentable_id: '123e4567-e89b-12d3-a456-426614174001',
        content: 'a'.repeat(1001), // Too long
      };

      const result = CreateCommentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('MAX_COMMENT_DEPTH', () => {
    it('should be set to 1 (only 1-level replies allowed)', () => {
      expect(MAX_COMMENT_DEPTH).toBe(1);
    });
  });
});

// ============================================================
// Like Type Tests
// ============================================================

describe('Like Types', () => {
  describe('LikeSchema', () => {
    it('should validate valid like data', () => {
      const validLike = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        likeable_type: 'review' as const,
        likeable_id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        created_at: '2024-01-25T10:00:00Z',
      };

      const result = LikeSchema.safeParse(validLike);
      expect(result.success).toBe(true);
    });

    it('should support both review and comment likes', () => {
      const reviewLike = LikeSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        likeable_type: 'review',
        likeable_id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        created_at: '2024-01-25T10:00:00Z',
      });

      const commentLike = LikeSchema.safeParse({
        id: '123e4567-e89b-12d3-a456-426614174010',
        likeable_type: 'comment',
        likeable_id: '123e4567-e89b-12d3-a456-426614174011',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        created_at: '2024-01-25T10:00:00Z',
      });

      expect(reviewLike.success).toBe(true);
      expect(commentLike.success).toBe(true);
    });
  });

  describe('ToggleLikeSchema', () => {
    it('should validate like toggle input', () => {
      const validInput = {
        likeable_type: 'review' as const,
        likeable_id: '123e4567-e89b-12d3-a456-426614174001',
      };

      const result = ToggleLikeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe('LikeStateSchema', () => {
    it('should validate like state response', () => {
      const validState = {
        is_liked: true,
        like_count: 42,
      };

      const result = LikeStateSchema.safeParse(validState);
      expect(result.success).toBe(true);
    });
  });

  describe('LIKEABLE_TYPES', () => {
    it('should have all likeable types', () => {
      expect(LIKEABLE_TYPES.review).toBe('후기');
      expect(LIKEABLE_TYPES.comment).toBe('댓글');
    });
  });
});

// ============================================================
// Constants & Enums Tests
// ============================================================

describe('Community Constants', () => {
  it('should have all review sort options', () => {
    expect(REVIEW_SORT_OPTIONS.latest.label).toBe('최신순');
    expect(REVIEW_SORT_OPTIONS.rating_high.label).toBe('별점 높은순');
    expect(REVIEW_SORT_OPTIONS.rating_low.label).toBe('별점 낮은순');
    expect(REVIEW_SORT_OPTIONS.likes.label).toBe('좋아요순');
    expect(REVIEW_SORT_OPTIONS.helpful.label).toBe('도움순');
  });

  it('should have all inquiry sort options', () => {
    expect(INQUIRY_SORT_OPTIONS.latest.label).toBe('최신순');
    expect(INQUIRY_SORT_OPTIONS.oldest.label).toBe('오래된순');
    expect(INQUIRY_SORT_OPTIONS.unanswered.label).toBe('답변 대기');
    expect(INQUIRY_SORT_OPTIONS.most_viewed.label).toBe('조회수순');
  });

  it('should have commentable types', () => {
    expect(COMMENTABLE_TYPES.review).toBe('후기');
    expect(COMMENTABLE_TYPES.inquiry).toBe('문의');
  });
});
