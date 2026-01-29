/**
 * @file tests/components/Comments.test.tsx
 * @description 댓글 컴포넌트 테스트 (댓글 목록, 대댓글, 작성/수정 폼)
 * @author frontend-specialist
 * @date 2026-01-25
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentList from '@/components/comments/comment-list';
import CommentItem from '@/components/comments/comment-item';
import CommentForm from '@/components/comments/comment-form';
import type { CommentWithAuthor } from '@/types/comment';

// Mock fetch
global.fetch = vi.fn();

const mockUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  nickname: 'Test User',
  avatar_url: null,
  role: 'user' as const,
};

const mockComments: CommentWithAuthor[] = [
  {
    id: '00000000-0000-0000-0000-000000000002',
    commentable_type: 'review',
    commentable_id: '00000000-0000-0000-0000-000000000003',
    parent_id: null,
    user_id: mockUser.id,
    content: 'This is a test comment',
    like_count: 5,
    created_at: '2026-01-25T10:00:00Z',
    updated_at: '2026-01-25T10:00:00Z',
    author: mockUser,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    commentable_type: 'review',
    commentable_id: '00000000-0000-0000-0000-000000000003',
    parent_id: '00000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000005',
    content: 'This is a reply',
    like_count: 2,
    created_at: '2026-01-25T11:00:00Z',
    updated_at: '2026-01-25T11:00:00Z',
    author: {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'other@example.com',
      nickname: 'Other User',
      avatar_url: null,
      role: 'user',
    },
  },
];

describe('CommentList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no comments', () => {
    render(
      <CommentList
        commentableType="review"
        commentableId="test-id"
        comments={[]}
        currentUserId={null}
      />
    );

    expect(screen.getByText(/아직 댓글이 없습니다/i)).toBeInTheDocument();
  });

  it('should render comments list', () => {
    render(
      <CommentList
        commentableType="review"
        commentableId="test-id"
        comments={mockComments}
        currentUserId={mockUser.id}
      />
    );

    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText('This is a reply')).toBeInTheDocument();
  });

  it('should show reply form when reply button clicked', async () => {
    const user = userEvent.setup();
    render(
      <CommentList
        commentableType="review"
        commentableId="test-id"
        comments={mockComments}
        currentUserId={mockUser.id}
      />
    );

    const replyButtons = screen.getAllByText(/답글/i);
    await user.click(replyButtons[0]);

    expect(screen.getByPlaceholderText(/답글을 입력하세요/i)).toBeInTheDocument();
  });

  it('should indent nested replies', () => {
    const { container } = render(
      <CommentList
        commentableType="review"
        commentableId="test-id"
        comments={mockComments}
        currentUserId={mockUser.id}
      />
    );

    // Check for indentation class on reply
    const replyElement = container.querySelector('[data-comment-id="00000000-0000-0000-0000-000000000004"]');
    expect(replyElement?.className).toMatch(/ml-|pl-/);
  });
});

describe('CommentItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render comment content', () => {
    render(
      <CommentItem
        comment={mockComments[0]}
        currentUserId={mockUser.id}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onLike={vi.fn()}
      />
    );

    expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    expect(screen.getByText(mockUser.nickname!)).toBeInTheDocument();
  });

  it('should show edit and delete buttons for own comment', () => {
    render(
      <CommentItem
        comment={mockComments[0]}
        currentUserId={mockUser.id}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onLike={vi.fn()}
      />
    );

    expect(screen.getByText(/수정/i)).toBeInTheDocument();
    expect(screen.getByText(/삭제/i)).toBeInTheDocument();
  });

  it('should not show edit and delete buttons for others comment', () => {
    render(
      <CommentItem
        comment={mockComments[1]}
        currentUserId={mockUser.id}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onLike={vi.fn()}
      />
    );

    expect(screen.queryByText(/수정/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/삭제/i)).not.toBeInTheDocument();
  });

  it('should call onLike when like button clicked', async () => {
    const onLike = vi.fn();
    const user = userEvent.setup();

    render(
      <CommentItem
        comment={mockComments[0]}
        currentUserId={mockUser.id}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onLike={onLike}
      />
    );

    const likeButton = screen.getByRole('button', { name: /좋아요/i });
    await user.click(likeButton);

    expect(onLike).toHaveBeenCalledWith(mockComments[0].id);
  });

  it('should display like count', () => {
    render(
      <CommentItem
        comment={mockComments[0]}
        currentUserId={mockUser.id}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onLike={vi.fn()}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should show deleted message for deleted comment', () => {
    const deletedComment = {
      ...mockComments[0],
      content: '[삭제된 댓글입니다]',
    };

    render(
      <CommentItem
        comment={deletedComment}
        currentUserId={mockUser.id}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onLike={vi.fn()}
      />
    );

    expect(screen.getByText('[삭제된 댓글입니다]')).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();

    render(
      <CommentItem
        comment={mockComments[0]}
        currentUserId={mockUser.id}
        onReply={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onLike={vi.fn()}
      />
    );

    const editButton = screen.getByText(/수정/i);
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockComments[0]);
  });

  it('should call onDelete when delete button clicked with confirmation', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    global.confirm = vi.fn(() => true);

    render(
      <CommentItem
        comment={mockComments[0]}
        currentUserId={mockUser.id}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onLike={vi.fn()}
      />
    );

    const deleteButton = screen.getByText(/삭제/i);
    await user.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith(mockComments[0].id);
  });
});

describe('CommentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render comment form', () => {
    render(
      <CommentForm
        commentableType="review"
        commentableId="test-id"
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/댓글을 입력하세요/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /등록/i })).toBeInTheDocument();
  });

  it('should render reply form with different placeholder', () => {
    render(
      <CommentForm
        commentableType="review"
        commentableId="test-id"
        parentId="parent-id"
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/답글을 입력하세요/i)).toBeInTheDocument();
  });

  it('should call onSubmit with content', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <CommentForm
        commentableType="review"
        commentableId="test-id"
        onSubmit={onSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText(/댓글을 입력하세요/i);
    await user.type(textarea, 'New comment content');

    const submitButton = screen.getByRole('button', { name: /등록/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('New comment content');
    });
  });

  it('should clear form after successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <CommentForm
        commentableType="review"
        commentableId="test-id"
        onSubmit={onSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText(/댓글을 입력하세요/i) as HTMLTextAreaElement;
    await user.type(textarea, 'New comment');

    const submitButton = screen.getByRole('button', { name: /등록/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('should show error for empty content', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <CommentForm
        commentableType="review"
        commentableId="test-id"
        onSubmit={onSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /등록/i });
    await user.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should show character count', async () => {
    const user = userEvent.setup();

    render(
      <CommentForm
        commentableType="review"
        commentableId="test-id"
        onSubmit={vi.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText(/댓글을 입력하세요/i);
    await user.type(textarea, 'Test');

    expect(screen.getByText(/4 \/ 1000/i)).toBeInTheDocument();
  });

  it('should render edit mode with initial value', () => {
    render(
      <CommentForm
        commentableType="review"
        commentableId="test-id"
        editingComment={mockComments[0]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText(/댓글을 입력하세요/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe('This is a test comment');
    expect(screen.getByRole('button', { name: /수정/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /취소/i })).toBeInTheDocument();
  });

  it('should call onCancel in edit mode', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <CommentForm
        commentableType="review"
        commentableId="test-id"
        editingComment={mockComments[0]}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /취소/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should disable submit button while submitting', async () => {
    const onSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const user = userEvent.setup();

    render(
      <CommentForm
        commentableType="review"
        commentableId="test-id"
        onSubmit={onSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText(/댓글을 입력하세요/i);
    await user.type(textarea, 'Test comment');

    const submitButton = screen.getByRole('button', { name: /등록/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
