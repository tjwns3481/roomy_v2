-- ============================================
-- Migration: Extend Profiles & Create User Grades
-- Description: Add user grade system with points, blocking, and login tracking
-- Version: 011
-- ============================================

-- ============================================
-- 1. Create user_grades table
-- ============================================
CREATE TABLE IF NOT EXISTS user_grades (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE CHECK (code IN ('bronze', 'silver', 'gold', 'vip')),
  name TEXT NOT NULL,
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  discount_rate NUMERIC(5, 2) DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 100),
  point_rate NUMERIC(5, 2) DEFAULT 0 CHECK (point_rate >= 0 AND point_rate <= 100),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default grades
INSERT INTO user_grades (code, name, min_order_amount, discount_rate, point_rate, description, sort_order) VALUES
  ('bronze', '브론즈', 0, 0, 1, '신규 회원 등급', 1),
  ('silver', '실버', 100000, 3, 2, '구매액 10만원 이상', 2),
  ('gold', '골드', 500000, 5, 3, '구매액 50만원 이상', 3),
  ('vip', 'VIP', 1000000, 10, 5, '구매액 100만원 이상', 4)
ON CONFLICT (code) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_grades_code ON user_grades(code);
CREATE INDEX IF NOT EXISTS idx_user_grades_sort_order ON user_grades(sort_order);

-- Add comments
COMMENT ON TABLE user_grades IS 'User grade definitions with benefits';
COMMENT ON COLUMN user_grades.code IS 'Unique grade code: bronze/silver/gold/vip';
COMMENT ON COLUMN user_grades.discount_rate IS 'Discount percentage for this grade';
COMMENT ON COLUMN user_grades.point_rate IS 'Point accumulation percentage';
COMMENT ON COLUMN user_grades.min_order_amount IS 'Minimum total order amount to reach this grade';

-- ============================================
-- 2. Extend profiles table
-- ============================================

-- Add new columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS grade TEXT DEFAULT 'bronze' REFERENCES user_grades(code),
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0 CHECK (points >= 0),
  ADD COLUMN IF NOT EXISTS total_order_amount NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_profiles_grade ON profiles(grade);
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON profiles(is_blocked);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login_at ON profiles(last_login_at);

-- Add comments
COMMENT ON COLUMN profiles.grade IS 'User grade code (references user_grades.code)';
COMMENT ON COLUMN profiles.points IS 'Accumulated points (can be used as store credit)';
COMMENT ON COLUMN profiles.total_order_amount IS 'Total amount of all completed orders';
COMMENT ON COLUMN profiles.is_blocked IS 'Whether user is blocked from access';
COMMENT ON COLUMN profiles.blocked_reason IS 'Reason for blocking (admin note)';
COMMENT ON COLUMN profiles.blocked_at IS 'Timestamp when user was blocked';
COMMENT ON COLUMN profiles.last_login_at IS 'Last login timestamp';

-- ============================================
-- 3. Create grade_histories table (track grade changes)
-- ============================================
CREATE TABLE IF NOT EXISTS grade_histories (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_grade TEXT REFERENCES user_grades(code),
  to_grade TEXT NOT NULL REFERENCES user_grades(code),
  reason TEXT DEFAULT 'auto_upgrade',
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grade_histories_user_id ON grade_histories(user_id);
CREATE INDEX IF NOT EXISTS idx_grade_histories_created_at ON grade_histories(created_at);

-- Add comments
COMMENT ON TABLE grade_histories IS 'History of user grade changes';
COMMENT ON COLUMN grade_histories.reason IS 'Reason for grade change: auto_upgrade, manual, promotion, etc.';
COMMENT ON COLUMN grade_histories.changed_by IS 'Admin user who made the change (NULL for automatic)';

-- ============================================
-- 4. Create point_histories table (track point transactions)
-- ============================================
CREATE TABLE IF NOT EXISTS point_histories (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn', 'use', 'expire', 'adjust', 'refund')),
  amount INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('order', 'review', 'manual', 'expiration')),
  reference_id TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_point_histories_user_id ON point_histories(user_id);
CREATE INDEX IF NOT EXISTS idx_point_histories_type ON point_histories(type);
CREATE INDEX IF NOT EXISTS idx_point_histories_created_at ON point_histories(created_at);
CREATE INDEX IF NOT EXISTS idx_point_histories_expires_at ON point_histories(expires_at);

-- Add comments
COMMENT ON TABLE point_histories IS 'History of all point transactions';
COMMENT ON COLUMN point_histories.type IS 'Transaction type: earn/use/expire/adjust/refund';
COMMENT ON COLUMN point_histories.amount IS 'Point amount (positive for earn, negative for use)';
COMMENT ON COLUMN point_histories.balance IS 'Point balance after this transaction';
COMMENT ON COLUMN point_histories.reference_type IS 'Related entity type';
COMMENT ON COLUMN point_histories.reference_id IS 'Related entity ID';
COMMENT ON COLUMN point_histories.expires_at IS 'Point expiration date (NULL for permanent)';

-- ============================================
-- 5. Functions for automatic grade upgrades
-- ============================================

-- Function to calculate appropriate grade based on total order amount
CREATE OR REPLACE FUNCTION calculate_user_grade(p_total_order_amount NUMERIC)
RETURNS TEXT AS $$
DECLARE
  v_grade TEXT;
BEGIN
  -- Get the highest grade that user qualifies for
  SELECT code INTO v_grade
  FROM user_grades
  WHERE is_active = TRUE
    AND min_order_amount <= p_total_order_amount
  ORDER BY min_order_amount DESC
  LIMIT 1;

  -- Default to bronze if no match
  RETURN COALESCE(v_grade, 'bronze');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_user_grade IS 'Calculate appropriate grade based on total order amount';

-- Function to update user grade automatically
CREATE OR REPLACE FUNCTION update_user_grade(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_current_grade TEXT;
  v_new_grade TEXT;
  v_total_amount NUMERIC;
BEGIN
  -- Get current grade and total amount
  SELECT grade, total_order_amount
  INTO v_current_grade, v_total_amount
  FROM profiles
  WHERE id = p_user_id;

  -- Calculate new grade
  v_new_grade := calculate_user_grade(v_total_amount);

  -- Update if grade changed
  IF v_current_grade != v_new_grade THEN
    UPDATE profiles
    SET grade = v_new_grade
    WHERE id = p_user_id;

    -- Record grade change history
    INSERT INTO grade_histories (user_id, from_grade, to_grade, reason)
    VALUES (p_user_id, v_current_grade, v_new_grade, 'auto_upgrade');
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_user_grade IS 'Update user grade based on total order amount';

-- ============================================
-- 6. Trigger for automatic grade update
-- ============================================

-- Trigger function to update grade when total_order_amount changes
CREATE OR REPLACE FUNCTION trigger_update_user_grade()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if total_order_amount changed
  IF NEW.total_order_amount != OLD.total_order_amount THEN
    PERFORM update_user_grade(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS profiles_grade_update ON profiles;
CREATE TRIGGER profiles_grade_update
AFTER UPDATE OF total_order_amount ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_update_user_grade();

-- ============================================
-- 7. Function to add/subtract points
-- ============================================

-- Function to add points to user account
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Update user points
  UPDATE profiles
  SET points = points + p_amount
  WHERE id = p_user_id
  RETURNING points INTO v_new_balance;

  -- Record transaction
  INSERT INTO point_histories (
    user_id, type, amount, balance, reason,
    reference_type, reference_id, expires_at, created_by
  ) VALUES (
    p_user_id, 'earn', p_amount, v_new_balance, p_reason,
    p_reference_type, p_reference_id, p_expires_at, p_created_by
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION add_user_points IS 'Add points to user account and record history';

-- Function to use points from user account
CREATE OR REPLACE FUNCTION use_user_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Check current balance
  SELECT points INTO v_current_balance
  FROM profiles
  WHERE id = p_user_id;

  -- Ensure sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient points: % available, % required', v_current_balance, p_amount;
  END IF;

  -- Update user points
  UPDATE profiles
  SET points = points - p_amount
  WHERE id = p_user_id
  RETURNING points INTO v_new_balance;

  -- Record transaction
  INSERT INTO point_histories (
    user_id, type, amount, balance, reason,
    reference_type, reference_id, created_by
  ) VALUES (
    p_user_id, 'use', -p_amount, v_new_balance, p_reason,
    p_reference_type, p_reference_id, p_created_by
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION use_user_points IS 'Deduct points from user account and record history';

-- ============================================
-- 8. RLS Policies for new tables
-- ============================================

-- Enable RLS
ALTER TABLE user_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_histories ENABLE ROW LEVEL SECURITY;

-- user_grades policies (read-only for all)
CREATE POLICY "Anyone can view active grades"
ON user_grades FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Admins can manage grades"
ON user_grades FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- grade_histories policies
CREATE POLICY "Users can view own grade history"
ON grade_histories FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all grade histories"
ON grade_histories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only system can insert grade histories"
ON grade_histories FOR INSERT
WITH CHECK (FALSE); -- Only triggers/functions can insert

-- point_histories policies
CREATE POLICY "Users can view own point history"
ON point_histories FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all point histories"
ON point_histories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only system can insert point histories"
ON point_histories FOR INSERT
WITH CHECK (FALSE); -- Only triggers/functions can insert

-- ============================================
-- 9. Update trigger for user_grades
-- ============================================
CREATE TRIGGER user_grades_updated_at
BEFORE UPDATE ON user_grades
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. Function to update last_login_at
-- ============================================
CREATE OR REPLACE FUNCTION update_last_login(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET last_login_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_last_login IS 'Update last login timestamp for user';

-- ============================================
-- 11. Helper view for user grade benefits
-- ============================================
CREATE OR REPLACE VIEW user_grade_benefits AS
SELECT
  p.id AS user_id,
  p.email,
  p.nickname,
  p.grade,
  p.points,
  p.total_order_amount,
  ug.name AS grade_name,
  ug.discount_rate,
  ug.point_rate,
  ug.min_order_amount AS grade_min_amount,
  (SELECT min_order_amount
   FROM user_grades
   WHERE code > p.grade
     AND is_active = TRUE
   ORDER BY min_order_amount
   LIMIT 1) AS next_grade_amount,
  p.is_blocked,
  p.last_login_at
FROM profiles p
LEFT JOIN user_grades ug ON p.grade = ug.code
WHERE ug.is_active = TRUE OR ug.is_active IS NULL;

COMMENT ON VIEW user_grade_benefits IS 'Combined view of user profiles with grade benefits';

-- Grant SELECT permission on view
GRANT SELECT ON user_grade_benefits TO authenticated;

-- ============================================
-- Migration Complete
-- ============================================
