-- =====================================================
-- Migration: 010_create_comments_likes.sql
-- Description: 댓글 및 좋아요 테이블 생성 (다형성 지원)
-- Author: database-specialist
-- Date: 2026-01-25
-- =====================================================

-- =====================================================
-- 1. comments 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commentable_type VARCHAR(20) NOT NULL CHECK (commentable_type IN ('review', 'inquiry')),
  commentable_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 대댓글 1단계만 허용하는 트리거 함수
CREATE OR REPLACE FUNCTION check_comment_depth()
RETURNS TRIGGER AS $$
DECLARE
  parent_parent_id UUID;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    SELECT parent_id INTO parent_parent_id FROM comments WHERE id = NEW.parent_id;
    IF parent_parent_id IS NOT NULL THEN
      RAISE EXCEPTION 'Comments can only be nested one level deep';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_comment_depth_trigger
  BEFORE INSERT OR UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION check_comment_depth();

-- =====================================================
-- 2. likes 테이블 생성
-- =====================================================

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  likeable_type VARCHAR(20) NOT NULL CHECK (likeable_type IN ('review', 'comment')),
  likeable_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- 중복 좋아요 방지 (동일 사용자가 동일 대상에 1번만 좋아요)
  CONSTRAINT likes_unique_user_likeable UNIQUE (likeable_type, likeable_id, user_id)
);

-- =====================================================
-- 3. comments 인덱스 생성
-- =====================================================

-- 다형성 조회 최적화 (commentable_type + commentable_id)
CREATE INDEX idx_comments_commentable ON comments(commentable_type, commentable_id);

-- 대댓글 조회 최적화
CREATE INDEX idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- 사용자별 댓글 조회
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- 최신순 정렬
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 좋아요순 정렬 (인기 댓글)
CREATE INDEX idx_comments_like_count ON comments(commentable_type, commentable_id, like_count DESC);

-- =====================================================
-- 4. likes 인덱스 생성
-- =====================================================

-- 다형성 조회 최적화 (likeable_type + likeable_id)
CREATE INDEX idx_likes_likeable ON likes(likeable_type, likeable_id);

-- 사용자별 좋아요 조회
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- 최신순 정렬
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- =====================================================
-- 5. updated_at 자동 갱신 트리거 (comments)
-- =====================================================

CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. 좋아요 수 동기화 트리거
-- =====================================================

-- 후기 좋아요 수 자동 갱신
CREATE OR REPLACE FUNCTION sync_review_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.likeable_type = 'review' THEN
    UPDATE reviews SET like_count = like_count + 1 WHERE id = NEW.likeable_id;
  ELSIF TG_OP = 'DELETE' AND OLD.likeable_type = 'review' THEN
    UPDATE reviews SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.likeable_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 댓글 좋아요 수 자동 갱신
CREATE OR REPLACE FUNCTION sync_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.likeable_type = 'comment' THEN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.likeable_id;
  ELSIF TG_OP = 'DELETE' AND OLD.likeable_type = 'comment' THEN
    UPDATE comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.likeable_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용 (reviews)
CREATE TRIGGER on_like_review_insert
  AFTER INSERT ON likes
  FOR EACH ROW
  WHEN (NEW.likeable_type = 'review')
  EXECUTE FUNCTION sync_review_like_count();

CREATE TRIGGER on_like_review_delete
  AFTER DELETE ON likes
  FOR EACH ROW
  WHEN (OLD.likeable_type = 'review')
  EXECUTE FUNCTION sync_review_like_count();

-- 트리거 적용 (comments)
CREATE TRIGGER on_like_comment_insert
  AFTER INSERT ON likes
  FOR EACH ROW
  WHEN (NEW.likeable_type = 'comment')
  EXECUTE FUNCTION sync_comment_like_count();

CREATE TRIGGER on_like_comment_delete
  AFTER DELETE ON likes
  FOR EACH ROW
  WHEN (OLD.likeable_type = 'comment')
  EXECUTE FUNCTION sync_comment_like_count();

-- =====================================================
-- 7. RLS 정책 활성화
-- =====================================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. comments RLS 정책
-- =====================================================

-- 댓글 조회: 공개 문의의 댓글 또는 후기 댓글, 비밀글은 본인/관리자만
CREATE POLICY "Anyone can view comments on public content"
ON comments FOR SELECT
USING (
  commentable_type = 'review'
  OR (
    commentable_type = 'inquiry'
    AND (
      EXISTS (
        SELECT 1 FROM inquiries
        WHERE id = commentable_id
        AND (is_private = false OR user_id = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  )
);

-- 로그인 사용자만 댓글 작성
CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 본인 댓글만 수정
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 본인 댓글만 삭제
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- 관리자는 모든 댓글 관리
CREATE POLICY "Admins can manage all comments"
ON comments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- 9. likes RLS 정책
-- =====================================================

-- 누구나 좋아요 목록 조회 가능 (누가 좋아요 했는지 확인용)
CREATE POLICY "Anyone can view likes"
ON likes FOR SELECT
USING (true);

-- 로그인 사용자만 좋아요 추가
CREATE POLICY "Authenticated users can create likes"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 본인 좋아요만 삭제 (좋아요 취소)
CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 10. 헬퍼 함수: 좋아요 토글
-- =====================================================

CREATE OR REPLACE FUNCTION toggle_like(
  p_likeable_type VARCHAR(20),
  p_likeable_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  existing_like_id UUID;
  result JSONB;
BEGIN
  -- 기존 좋아요 확인
  SELECT id INTO existing_like_id
  FROM likes
  WHERE likeable_type = p_likeable_type
  AND likeable_id = p_likeable_id
  AND user_id = p_user_id;

  IF existing_like_id IS NOT NULL THEN
    -- 좋아요 취소
    DELETE FROM likes WHERE id = existing_like_id;
    result := jsonb_build_object('action', 'unliked', 'like_id', existing_like_id);
  ELSE
    -- 좋아요 추가
    INSERT INTO likes (likeable_type, likeable_id, user_id)
    VALUES (p_likeable_type, p_likeable_id, p_user_id)
    RETURNING jsonb_build_object('action', 'liked', 'like_id', id) INTO result;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. 헬퍼 함수: 대댓글 트리 조회
-- =====================================================

CREATE OR REPLACE FUNCTION get_comment_tree(
  p_commentable_type VARCHAR(20),
  p_commentable_id UUID
)
RETURNS TABLE(
  id UUID,
  parent_id UUID,
  user_id UUID,
  content TEXT,
  like_count INTEGER,
  created_at TIMESTAMPTZ,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- 최상위 댓글 (parent_id가 NULL)
    SELECT
      c.id,
      c.parent_id,
      c.user_id,
      c.content,
      c.like_count,
      c.created_at,
      1 AS level
    FROM comments c
    WHERE c.commentable_type = p_commentable_type
    AND c.commentable_id = p_commentable_id
    AND c.parent_id IS NULL

    UNION ALL

    -- 대댓글 (1단계만)
    SELECT
      c.id,
      c.parent_id,
      c.user_id,
      c.content,
      c.like_count,
      c.created_at,
      ct.level + 1
    FROM comments c
    INNER JOIN comment_tree ct ON c.parent_id = ct.id
    WHERE ct.level < 2 -- 최대 2레벨 (댓글 + 대댓글)
  )
  SELECT * FROM comment_tree
  ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. 헬퍼 함수: 사용자 좋아요 상태 확인
-- =====================================================

CREATE OR REPLACE FUNCTION check_user_liked(
  p_likeable_type VARCHAR(20),
  p_likeable_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  liked BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM likes
    WHERE likeable_type = p_likeable_type
    AND likeable_id = p_likeable_id
    AND user_id = p_user_id
  ) INTO liked;

  RETURN liked;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 13. 검증 쿼리
-- =====================================================

-- 테이블 존재 확인
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comments') THEN
    RAISE EXCEPTION 'comments table not created';
  END IF;

  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'likes') THEN
    RAISE EXCEPTION 'likes table not created';
  END IF;

  RAISE NOTICE '✅ comments and likes tables created successfully';
END $$;

-- =====================================================
-- 완료
-- =====================================================

-- 마이그레이션 완료 로그
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 010_create_comments_likes.sql completed successfully';
  RAISE NOTICE '   - comments table created with polymorphic support';
  RAISE NOTICE '   - likes table created with unique constraint';
  RAISE NOTICE '   - 8 indexes created (5 for comments, 3 for likes)';
  RAISE NOTICE '   - RLS policies enabled (5 for comments, 3 for likes)';
  RAISE NOTICE '   - 5 triggers created (like count sync, updated_at)';
  RAISE NOTICE '   - 4 helper functions created';
END $$;
