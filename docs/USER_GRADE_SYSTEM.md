# User Grade System - Quick Reference

## Grade Tiers

| Grade | Min Purchase | Discount | Point Rate | Color |
|-------|-------------|----------|------------|-------|
| 🥉 Bronze | ₩0 | 0% | 1% | #CD7F32 |
| 🥈 Silver | ₩100,000 | 3% | 2% | #C0C0C0 |
| 🥇 Gold | ₩500,000 | 5% | 3% | #FFD700 |
| 💎 VIP | ₩1,000,000 | 10% | 5% | #B9F2FF |

## Usage Examples

### 1. Get User's Current Grade & Benefits
```typescript
// API endpoint: GET /api/user/grade
const response = await fetch('/api/user/grade');
const data = await response.json();
// {
//   grade: 'silver',
//   grade_name: '실버',
//   discount_rate: 3,
//   point_rate: 2,
//   points: 5000,
//   total_order_amount: 150000,
//   next_grade: 'gold',
//   next_grade_amount: 500000,
//   progress_percentage: 30
// }
```

### 2. Apply Grade Discount to Order
```typescript
const originalPrice = 50000;
const discountRate = data.discount_rate; // 3 for silver
const discountedPrice = originalPrice * (1 - discountRate / 100);
// ₩50,000 → ₩48,500 (3% off)
```

### 3. Calculate Points Earned from Order
```typescript
const orderAmount = 50000;
const pointRate = data.point_rate; // 2 for silver
const pointsEarned = Math.floor(orderAmount * pointRate / 100);
// ₩50,000 × 2% = 1,000 points
```

### 4. Use Points for Payment
```typescript
// API endpoint: POST /api/user/points/use
const response = await fetch('/api/user/points/use', {
  method: 'POST',
  body: JSON.stringify({
    amount: 5000,
    orderId: 'ORD-20260125-0001'
  })
});
// Returns new balance or error if insufficient
```

### 5. Admin: Grant Points to User
```typescript
// API endpoint: POST /api/admin/users/:userId/points
const response = await fetch(`/api/admin/users/${userId}/points`, {
  method: 'POST',
  body: JSON.stringify({
    amount: 10000,
    reason: 'Compensation for issue',
    expiresAt: '2027-01-25T00:00:00Z' // Optional
  })
});
```

### 6. Admin: Manually Change User Grade
```typescript
// API endpoint: PATCH /api/admin/users/:userId/grade
const response = await fetch(`/api/admin/users/${userId}/grade`, {
  method: 'PATCH',
  body: JSON.stringify({
    grade: 'vip',
    reason: 'VIP upgrade promotion'
  })
});
// This bypasses automatic calculation
```

### 7. Block/Unblock User
```typescript
// API endpoint: POST /api/admin/users/:userId/block
const response = await fetch(`/api/admin/users/${userId}/block`, {
  method: 'POST',
  body: JSON.stringify({
    blocked: true,
    reason: 'Terms violation'
  })
});
```

## Database Queries

### Check All User Grades
```sql
SELECT
  email,
  grade_name,
  discount_rate,
  point_rate,
  points,
  total_order_amount
FROM user_grade_benefits
ORDER BY total_order_amount DESC;
```

### Find Users Close to Next Grade
```sql
SELECT
  email,
  grade_name,
  total_order_amount,
  next_grade_amount,
  ROUND((total_order_amount / next_grade_amount * 100)::numeric, 1) as progress_pct
FROM user_grade_benefits
WHERE next_grade_amount IS NOT NULL
  AND total_order_amount >= next_grade_amount * 0.8
ORDER BY progress_pct DESC;
```

### Point Expiration Report
```sql
SELECT
  p.email,
  ph.amount,
  ph.expires_at,
  DATE_PART('day', ph.expires_at - NOW()) as days_until_expiration
FROM point_histories ph
JOIN profiles p ON ph.user_id = p.id
WHERE ph.type = 'earn'
  AND ph.expires_at IS NOT NULL
  AND ph.expires_at > NOW()
  AND ph.expires_at < NOW() + INTERVAL '30 days'
ORDER BY ph.expires_at;
```

## Frontend Components

### Grade Badge Component
```tsx
// components/user/grade-badge.tsx
interface GradeBadgeProps {
  grade: 'bronze' | 'silver' | 'gold' | 'vip';
  showName?: boolean;
}

export function GradeBadge({ grade, showName = true }: GradeBadgeProps) {
  const config = {
    bronze: { icon: '🥉', name: '브론즈', color: 'text-amber-700' },
    silver: { icon: '🥈', name: '실버', color: 'text-gray-400' },
    gold: { icon: '🥇', name: '골드', color: 'text-yellow-500' },
    vip: { icon: '💎', name: 'VIP', color: 'text-blue-400' }
  };

  const { icon, name, color } = config[grade];

  return (
    <span className={cn('inline-flex items-center gap-1', color)}>
      <span>{icon}</span>
      {showName && <span className="font-semibold">{name}</span>}
    </span>
  );
}
```

### Grade Progress Bar
```tsx
// components/user/grade-progress.tsx
interface GradeProgressProps {
  currentAmount: number;
  nextGradeAmount: number | null;
  currentGrade: string;
  nextGrade: string | null;
}

export function GradeProgress({
  currentAmount,
  nextGradeAmount,
  currentGrade,
  nextGrade
}: GradeProgressProps) {
  if (!nextGradeAmount || !nextGrade) {
    return <p className="text-sm text-muted-foreground">최고 등급입니다!</p>;
  }

  const progress = (currentAmount / nextGradeAmount) * 100;
  const remaining = nextGradeAmount - currentAmount;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{currentGrade} 등급</span>
        <span className="text-muted-foreground">
          {nextGrade} 등급까지 ₩{remaining.toLocaleString()}
        </span>
      </div>
      <Progress value={Math.min(progress, 100)} className="h-2" />
      <p className="text-xs text-muted-foreground text-right">
        {progress.toFixed(1)}% 달성
      </p>
    </div>
  );
}
```

## Automation Ideas

### 1. Birthday Points
```sql
-- Add to cron job or scheduled function
SELECT add_user_points(
  id,
  5000,
  'Birthday gift points',
  'manual',
  NULL,
  NOW() + INTERVAL '1 year',
  NULL
)
FROM profiles
WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
  AND EXTRACT(DAY FROM created_at) = EXTRACT(DAY FROM NOW());
```

### 2. Point Expiration Reminder
```sql
-- Send email to users with points expiring soon
SELECT
  p.email,
  SUM(ph.amount) as expiring_points,
  MIN(ph.expires_at) as earliest_expiration
FROM point_histories ph
JOIN profiles p ON ph.user_id = p.id
WHERE ph.type = 'earn'
  AND ph.expires_at BETWEEN NOW() + INTERVAL '7 days' AND NOW() + INTERVAL '8 days'
GROUP BY p.id, p.email;
```

### 3. Grade Downgrade (Optional)
```sql
-- Reset grades annually based on last 12 months
WITH yearly_totals AS (
  SELECT
    user_id,
    SUM(total_amount) as yearly_amount
  FROM orders
  WHERE status = 'completed'
    AND created_at >= NOW() - INTERVAL '1 year'
  GROUP BY user_id
)
UPDATE profiles p
SET total_order_amount = COALESCE(yt.yearly_amount, 0)
FROM yearly_totals yt
WHERE p.id = yt.user_id;
-- This will trigger automatic grade recalculation
```

## Best Practices

1. **Point Expiration**: Set points to expire after 1 year to encourage usage
2. **Grade Calculation**: Use `total_order_amount` from completed orders only
3. **Admin Actions**: Always log manual grade/point changes with reason
4. **User Communication**: Send email notifications for:
   - Grade upgrades
   - Points earned/used
   - Points expiring soon
5. **Performance**: Use the `user_grade_benefits` view for dashboard displays
6. **Security**: Never allow direct SQL access to point/grade tables from frontend

## Migration Checklist

- [x] Create `user_grades` table with 4 default tiers
- [x] Extend `profiles` with grade/points/blocking columns
- [x] Create `grade_histories` for audit trail
- [x] Create `point_histories` for transaction log
- [x] Add automatic grade upgrade trigger
- [x] Add point management functions
- [x] Set up RLS policies for data security
- [x] Create `user_grade_benefits` view
- [x] Add last login tracking
