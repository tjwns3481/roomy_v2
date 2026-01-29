#!/bin/bash

# ============================================
# Migration 011 Verification Script
# ============================================

echo "🔍 Verifying Migration 011: Extend Profiles & User Grades"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check file exists
echo "📁 Checking migration file..."
if [ -f "supabase/migrations/011_extend_profiles.sql" ]; then
    echo -e "${GREEN}✓${NC} Migration file exists"
    LINES=$(wc -l < supabase/migrations/011_extend_profiles.sql)
    echo -e "  Lines: $LINES"
else
    echo -e "${RED}✗${NC} Migration file not found"
    exit 1
fi

echo ""

# Check for key components
echo "🔎 Checking migration components..."

REQUIRED_TABLES=("user_grades" "grade_histories" "point_histories")
REQUIRED_FUNCTIONS=("calculate_user_grade" "update_user_grade" "add_user_points" "use_user_points" "update_last_login")
REQUIRED_VIEWS=("user_grade_benefits")

for table in "${REQUIRED_TABLES[@]}"; do
    if grep -q "CREATE TABLE.*$table" supabase/migrations/011_extend_profiles.sql; then
        echo -e "${GREEN}✓${NC} Table: $table"
    else
        echo -e "${RED}✗${NC} Missing table: $table"
    fi
done

echo ""

for func in "${REQUIRED_FUNCTIONS[@]}"; do
    if grep -q "CREATE.*FUNCTION.*$func" supabase/migrations/011_extend_profiles.sql; then
        echo -e "${GREEN}✓${NC} Function: $func"
    else
        echo -e "${RED}✗${NC} Missing function: $func"
    fi
done

echo ""

for view in "${REQUIRED_VIEWS[@]}"; do
    if grep -q "CREATE.*VIEW.*$view" supabase/migrations/011_extend_profiles.sql; then
        echo -e "${GREEN}✓${NC} View: $view"
    else
        echo -e "${RED}✗${NC} Missing view: $view"
    fi
done

echo ""

# Check profiles table extensions
echo "🔧 Checking profiles table extensions..."
REQUIRED_COLUMNS=("grade" "points" "total_order_amount" "is_blocked" "blocked_reason" "blocked_at" "last_login_at")

for col in "${REQUIRED_COLUMNS[@]}"; do
    if grep -q "ADD COLUMN.*$col" supabase/migrations/011_extend_profiles.sql; then
        echo -e "${GREEN}✓${NC} Column: $col"
    else
        echo -e "${RED}✗${NC} Missing column: $col"
    fi
done

echo ""

# Check RLS policies
echo "🔒 Checking RLS policies..."
if grep -q "ENABLE ROW LEVEL SECURITY" supabase/migrations/011_extend_profiles.sql; then
    RLS_COUNT=$(grep -c "ENABLE ROW LEVEL SECURITY" supabase/migrations/011_extend_profiles.sql)
    echo -e "${GREEN}✓${NC} RLS enabled on $RLS_COUNT tables"
fi

POLICY_COUNT=$(grep -c "CREATE POLICY" supabase/migrations/011_extend_profiles.sql)
echo -e "${GREEN}✓${NC} $POLICY_COUNT RLS policies created"

echo ""

# Check default grades
echo "📊 Checking default grade data..."
GRADES=("bronze" "silver" "gold" "vip")
for grade in "${GRADES[@]}"; do
    if grep -q "'$grade'" supabase/migrations/011_extend_profiles.sql; then
        echo -e "${GREEN}✓${NC} Grade: $grade"
    else
        echo -e "${RED}✗${NC} Missing grade: $grade"
    fi
done

echo ""

# Check documentation
echo "📚 Checking documentation..."
if [ -f "supabase/migrations/011_extend_profiles_test.md" ]; then
    echo -e "${GREEN}✓${NC} Test plan exists"
else
    echo -e "${YELLOW}!${NC} Test plan missing"
fi

if [ -f "docs/USER_GRADE_SYSTEM.md" ]; then
    echo -e "${GREEN}✓${NC} Quick reference guide exists"
else
    echo -e "${YELLOW}!${NC} Quick reference guide missing"
fi

if [ -f "P7-T7.1-COMPLETION.md" ]; then
    echo -e "${GREEN}✓${NC} Completion report exists"
else
    echo -e "${YELLOW}!${NC} Completion report missing"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ Migration 011 Verification Complete${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Review migration file: supabase/migrations/011_extend_profiles.sql"
echo "2. Review test plan: supabase/migrations/011_extend_profiles_test.md"
echo "3. Apply migration to Supabase"
echo "4. Run test scenarios from test plan"
echo ""
echo "To apply migration:"
echo "  psql -h <supabase-host> -d postgres -f supabase/migrations/011_extend_profiles.sql"
echo ""
