/**
 * @file tests/api/comments.test.ts
 * @description 댓글/대댓글 API 테스트 (다형성 지원)
 * @author backend-specialist
 * @date 2026-01-25
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/comments/route';
import { PATCH, DELETE } from '@/app/api/comments/[id]/route';
import { NextRequest } from 'next/server';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Test data
const testUserId = '00000000-0000-0000-0000-000000000001';
const testReviewId = '00000000-0000-0000-0000-000000000002';
const testInquiryId = '00000000-0000-0000-0000-000000000003';
const testCommentId = '00000000-0000-0000-0000-000000000004';
const testParentId = '00000000-0000-0000-0000-000000000005';

describe('Comments API', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default auth mock
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: testUserId, email: 'test@example.com' } },
      error: null,
    });
  });

  describe('POST /api/comments', () => {
    it('should create a comment on a review', async () => {
      const mockComment = {
        id: testCommentId,
        commentable_type: 'review',
        commentable_id: testReviewId,
        parent_id: null,
        user_id: testUserId,
        content: 'Test comment',
        like_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockProfile = {
        id: testUserId,
        display_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockComment, error: null }),
          }),
        }),
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          commentable_type: 'review',
          commentable_id: testReviewId,
          content: 'Test comment',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.comment).toBeDefined();
      expect(data.comment.content).toBe('Test comment');
      expect(data.comment.user).toBeDefined();
    });

    it('should create a reply (대댓글)', async () => {
      const mockParentComment = {
        id: testParentId,
        parent_id: null,
      };

      const mockReply = {
        id: testCommentId,
        commentable_type: 'review',
        commentable_id: testReviewId,
        parent_id: testParentId,
        user_id: testUserId,
        content: 'Reply comment',
        like_count: 0,
        created_at: new Date().toISOString(),
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'comments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockParentComment, error: null }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockReply, error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: testUserId, display_name: 'Test' }, error: null }),
            }),
          }),
        };
      });

      const request = new NextRequest('http://localhost:3000/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          commentable_type: 'review',
          commentable_id: testReviewId,
          parent_id: testParentId,
          content: 'Reply comment',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.comment.parent_id).toBe(testParentId);
    });

    it('should reject nested replies (only 1 level allowed)', async () => {
      const mockNestedParent = {
        id: testParentId,
        parent_id: 'some-other-id', // Already a reply
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockNestedParent, error: null }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          commentable_type: 'review',
          commentable_id: testReviewId,
          parent_id: testParentId,
          content: 'Nested reply',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('1단계까지만');
    });

    it('should require authentication', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Unauthorized' },
      });

      const request = new NextRequest('http://localhost:3000/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          commentable_type: 'review',
          commentable_id: testReviewId,
          content: 'Test',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/comments', () => {
    it('should return comments with tree structure', async () => {
      const mockComments = [
        {
          id: testCommentId,
          parent_id: null,
          user_id: testUserId,
          content: 'Parent comment',
          like_count: 5,
          created_at: new Date().toISOString(),
          level: 1,
        },
        {
          id: testParentId,
          parent_id: testCommentId,
          user_id: testUserId,
          content: 'Child comment',
          like_count: 2,
          created_at: new Date().toISOString(),
          level: 2,
        },
      ];

      const mockProfiles = [
        { id: testUserId, display_name: 'Test User', avatar_url: null },
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockComments, error: null });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
        }),
      });

      const request = new NextRequest(
        `http://localhost:3000/api/comments?commentable_type=review&commentable_id=${testReviewId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.comments).toHaveLength(2);
      expect(data.comments[0].user).toBeDefined();
    });

    it('should include user profile information', async () => {
      const mockComments = [
        {
          id: testCommentId,
          user_id: testUserId,
          content: 'Test',
          created_at: new Date().toISOString(),
          level: 1,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockComments, error: null });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [{ id: testUserId, display_name: 'User', avatar_url: null }],
            error: null,
          }),
        }),
      });

      const request = new NextRequest(
        `http://localhost:3000/api/comments?commentable_type=review&commentable_id=${testReviewId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data.comments[0].user).toHaveProperty('display_name');
    });
  });

  describe('PATCH /api/comments/[id]', () => {
    it('should update own comment', async () => {
      const mockComment = {
        id: testCommentId,
        user_id: testUserId,
        content: 'Updated content',
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'comments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { user_id: testUserId },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockComment, error: null }),
                }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: testUserId, display_name: 'Test' },
                error: null,
              }),
            }),
          }),
        };
      });

      const request = new NextRequest(`http://localhost:3000/api/comments/${testCommentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Updated content' }),
      });

      const response = await PATCH(request, { params: { id: testCommentId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.comment.content).toBe('Updated content');
    });

    it('should reject update from non-owner', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'other-user-id', role: 'user' },
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest(`http://localhost:3000/api/comments/${testCommentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: 'Unauthorized' }),
      });

      const response = await PATCH(request, { params: { id: testCommentId } });
      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/comments/[id]', () => {
    it('should delete comment without replies', async () => {
      const selectMock = vi.fn();
      selectMock
        .mockReturnValueOnce({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: testUserId },
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        });

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'comments') {
          return {
            select: selectMock,
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const request = new NextRequest(`http://localhost:3000/api/comments/${testCommentId}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: testCommentId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
    });

    it('should mark as deleted if comment has replies', async () => {
      const mockReplies = [{ id: 'reply-id' }];

      const selectMock = vi.fn();
      selectMock
        .mockReturnValueOnce({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: testUserId },
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          eq: vi.fn().mockResolvedValue({ data: mockReplies, error: null }),
        });

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'comments') {
          return {
            select: selectMock,
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { content: '[삭제된 댓글입니다]' },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const request = new NextRequest(`http://localhost:3000/api/comments/${testCommentId}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: testCommentId } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.comment.content).toBe('[삭제된 댓글입니다]');
    });

    it('should reject delete from non-owner', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'other-user-id', role: 'user' },
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest(`http://localhost:3000/api/comments/${testCommentId}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: testCommentId } });
      expect(response.status).toBe(403);
    });
  });
});
