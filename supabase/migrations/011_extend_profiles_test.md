# Migration 011: Extend Profiles & User Grades - Test Plan

## Overview
This migration extends the `profiles` table and creates a comprehensive user grade system with points, blocking, and login tracking.

## Key Components

### 1. User Grades Table
- **Grades**: bronze, silver, gold, vip
- **Benefits**:
  - Bronze: 0% discount, 1% points (default)
  - Silver: 3% discount, 2% points (₩100,000+)
  - Gold: 5% discount, 3% points (₩500,000+)
  - VIP: 10% discount, 5% points (₩1,000,000+)

### 2. Extended Profiles Columns
- `grade` - User's current grade (default: bronze)
- `points` - Accumulated points/store credit
- `total_order_amount` - Total of all completed orders
- `is_blocked` - Block status
- `blocked_reason` - Admin note for blocking
- `blocked_at` - Timestamp of blocking
- `last_login_at` - Last login tracking

### 3. History Tables
- `grade_histories` - Track all grade changes (auto & manual)
- `point_histories` - Track all point transactions

### 4. Automatic Grade Upgrades
- Trigger automatically updates grade when `total_order_amount` changes
- Grade is calculated based on minimum order thresholds
- Changes are logged in `grade_histories`

### 5. Point Management Functions
- `add_user_points()` - Add points and record history
- `use_user_points()` - Deduct points with balance check
- All transactions logged in `point_histories`

### 6. Helper Functions
- `calculate_user_grade()` - Determine grade from order amount
- `update_user_grade()` - Manually trigger grade recalculation
- `update_last_login()` - Update login timestamp

### 7. Views
- `user_grade_benefits` - Combined view of users with grade info
  - Includes current benefits (discount_rate, point_rate)
  - Shows next grade threshold
  - Useful for dashboards and user profile displays

## Test Scenarios

### Test 1: Default Grade Assignment
```sql
-- New users should get bronze grade
SELECT grade, points FROM profiles WHERE email = 'test@example.com';
-- Expected: grade='bronze', points=0
```

### Test 2: Automatic Grade Upgrade
```sql
-- Update total_order_amount to trigger upgrade
UPDATE profiles
SET total_order_amount = 150000
WHERE email = 'test@example.com';

-- Should auto-upgrade to silver
SELECT grade FROM profiles WHERE email = 'test@example.com';
-- Expected: grade='silver'

-- Check history
SELECT from_grade, to_grade, reason
FROM grade_histories
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@example.com')
ORDER BY created_at DESC
LIMIT 1;
-- Expected: from_grade='bronze', to_grade='silver', reason='auto_upgrade'
```

### Test 3: Point Transactions
```sql
-- Add points
SELECT add_user_points(
  (SELECT id FROM profiles WHERE email = 'test@example.com'),
  1000,
  'Welcome bonus',
  'manual',
  NULL,
  NOW() + INTERVAL '1 year',
  auth.uid()
);
-- Expected: Returns new balance (1000)

-- Use points
SELECT use_user_points(
  (SELECT id FROM profiles WHERE email = 'test@example.com'),
  500,
  'Order discount',
  'order',
  'ORD-20260125-0001',
  auth.uid()
);
-- Expected: Returns new balance (500)

-- Check history
SELECT type, amount, balance, reason
FROM point_histories
WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@example.com')
ORDER BY created_at DESC;
-- Expected: 2 rows (earn: +1000, use: -500)
```

### Test 4: Insufficient Points
```sql
-- Should fail
SELECT use_user_points(
  (SELECT id FROM profiles WHERE email = 'test@example.com'),
  1000,
  'Large order discount',
  'order',
  'ORD-20260125-0002',
  auth.uid()
);
-- Expected: ERROR - Insufficient points
```

### Test 5: User Blocking
```sql
-- Block user
UPDATE profiles
SET
  is_blocked = TRUE,
  blocked_reason = 'Suspicious activity',
  blocked_at = NOW()
WHERE email = 'test@example.com';

-- Verify
SELECT is_blocked, blocked_reason
FROM profiles
WHERE email = 'test@example.com';
-- Expected: is_blocked=TRUE
```

### Test 6: Grade Benefits View
```sql
-- Check user benefits
SELECT
  email,
  grade_name,
  discount_rate,
  point_rate,
  total_order_amount,
  next_grade_amount
FROM user_grade_benefits
WHERE email = 'test@example.com';
-- Expected: Shows current grade with discount/point rates and next threshold
```

### Test 7: RLS Policies
```sql
-- As regular user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO '<user_id>';

-- Can view own grade history
SELECT * FROM grade_histories WHERE user_id = '<user_id>';
-- Expected: Success

-- Cannot view other users' history
SELECT * FROM grade_histories WHERE user_id != '<user_id>';
-- Expected: Empty result

-- Can view active grades
SELECT * FROM user_grades WHERE is_active = TRUE;
-- Expected: 4 rows (bronze, silver, gold, vip)
```

### Test 8: Last Login Update
```sql
-- Update last login
SELECT update_last_login((SELECT id FROM profiles WHERE email = 'test@example.com'));

-- Verify
SELECT last_login_at FROM profiles WHERE email = 'test@example.com';
-- Expected: Current timestamp
```

## Integration Points

### With Orders System
When an order is completed:
```sql
-- Update total order amount (triggers grade upgrade)
UPDATE profiles
SET total_order_amount = total_order_amount + <order_amount>
WHERE id = <user_id>;

-- Award points based on grade
SELECT add_user_points(
  <user_id>,
  FLOOR(<order_amount> * (SELECT point_rate FROM user_grades WHERE code = <current_grade>) / 100),
  'Order purchase points',
  'order',
  <order_id>,
  NOW() + INTERVAL '1 year',
  NULL
);
```

### With Auth System
On user login:
```sql
-- Update last login timestamp
SELECT update_last_login(<user_id>);

-- Check if blocked
SELECT is_blocked, blocked_reason
FROM profiles
WHERE id = <user_id> AND is_blocked = FALSE;
```

### With Checkout System
Apply grade discount:
```sql
-- Get user's discount rate
SELECT discount_rate
FROM user_grade_benefits
WHERE user_id = <user_id>;

-- Calculate discounted price
SELECT <original_price> * (1 - discount_rate / 100);
```

## Expected Outcomes
✅ New profiles default to bronze grade with 0 points
✅ Automatic grade upgrades based on total_order_amount
✅ Grade changes logged in grade_histories
✅ Point transactions tracked in point_histories
✅ Insufficient points prevented with clear error
✅ User blocking system functional
✅ RLS policies protect user data
✅ Helper view simplifies grade benefit queries

## Rollback Plan
```sql
-- If migration needs to be rolled back:
DROP VIEW IF EXISTS user_grade_benefits;
DROP TRIGGER IF EXISTS profiles_grade_update ON profiles;
DROP FUNCTION IF EXISTS trigger_update_user_grade();
DROP FUNCTION IF EXISTS update_user_grade(UUID);
DROP FUNCTION IF EXISTS calculate_user_grade(NUMERIC);
DROP FUNCTION IF EXISTS add_user_points(UUID, INTEGER, TEXT, TEXT, TEXT, TIMESTAMPTZ, UUID);
DROP FUNCTION IF EXISTS use_user_points(UUID, INTEGER, TEXT, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS update_last_login(UUID);
DROP TABLE IF EXISTS point_histories;
DROP TABLE IF EXISTS grade_histories;
DROP TABLE IF EXISTS user_grades CASCADE;
ALTER TABLE profiles
  DROP COLUMN IF EXISTS grade,
  DROP COLUMN IF EXISTS points,
  DROP COLUMN IF EXISTS total_order_amount,
  DROP COLUMN IF EXISTS is_blocked,
  DROP COLUMN IF EXISTS blocked_reason,
  DROP COLUMN IF EXISTS blocked_at,
  DROP COLUMN IF EXISTS last_login_at;
```
