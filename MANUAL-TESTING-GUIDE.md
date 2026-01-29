# Manual Testing Guide - NextAuth Migration

**Version**: 1.0
**Last Updated**: 2026-01-26
**Purpose**: Manual verification of NextAuth.js migration

---

## Prerequisites

### 1. Start Development Server

```bash
npm run dev
```

Server should start at: http://localhost:3000

### 2. Have Test Credentials Ready

**Regular User**:
- Email: test@example.com
- Password: (set during signup)

**Admin User**:
- Email: admin@example.com
- Password: (use create-admin script)

Create admin user if needed:
```bash
npx tsx scripts/create-admin.ts
```

---

## Test Suite 1: Basic Authentication

### Test 1.1: Login Page Access

**Steps**:
1. Navigate to http://localhost:3000/auth/login
2. Verify page loads without errors

**Expected**:
- Login form displays
- Email and password fields visible
- "Login" button present
- No console errors

**Status**: [ ]

---

### Test 1.2: Login with Email/Password

**Steps**:
1. Go to http://localhost:3000/auth/login
2. Enter valid email: `test@example.com`
3. Enter valid password
4. Click "Login"

**Expected**:
- No form validation errors
- Redirects to home page or redirect URL
- Header shows "My Page" or user info
- No console errors

**Status**: [ ]

**Notes**: _______________________________________________

---

### Test 1.3: Login with Invalid Credentials

**Steps**:
1. Go to http://localhost:3000/auth/login
2. Enter email: `invalid@example.com`
3. Enter password: `wrongpassword`
4. Click "Login"

**Expected**:
- Error message displays
- User stays on login page
- Form fields still editable

**Status**: [ ]

---

### Test 1.4: Form Validation

**Steps**:
1. Go to http://localhost:3000/auth/login
2. Click "Login" without entering anything
3. Then enter invalid email format: `notanemail`
4. Click "Login"

**Expected**:
- Required field errors show
- Invalid email format error shows
- Form does not submit

**Status**: [ ]

---

## Test Suite 2: Signup Flow

### Test 2.1: Signup Page Access

**Steps**:
1. Navigate to http://localhost:3000/signup

**Expected**:
- Signup form displays
- Fields: name, email, password, confirm password
- "Sign Up" button present

**Status**: [ ]

---

### Test 2.2: Create New Account

**Steps**:
1. Go to http://localhost:3000/signup
2. Fill in:
   - Name: "Test User"
   - Email: "newuser@example.com"
   - Password: "Test123!@#"
   - Confirm Password: "Test123!@#"
3. Click "Sign Up"

**Expected**:
- Account created successfully
- Auto-login after signup
- Redirects to home or my page
- User appears logged in (header shows user info)

**Status**: [ ]

**Notes**: _______________________________________________

---

### Test 2.3: Signup Validation

**Steps**:
1. Go to http://localhost:3000/signup
2. Try to sign up with:
   - Passwords that don't match
   - Weak password (e.g., "123")
   - Existing email

**Expected**:
- Appropriate error messages
- Form does not submit
- User stays on signup page

**Status**: [ ]

---

## Test Suite 3: Protected Routes

### Test 3.1: My Page - Logged In

**Steps**:
1. Ensure you're logged in
2. Navigate to http://localhost:3000/my

**Expected**:
- Page loads successfully
- User information displays
- No redirect to login

**Status**: [ ]

---

### Test 3.2: My Page - Not Logged In

**Steps**:
1. Ensure you're NOT logged in (use incognito or logout)
2. Navigate to http://localhost:3000/my

**Expected**:
- Redirects to `/auth/login`
- URL includes redirect parameter: `/auth/login?redirect=/my`
- After login, returns to `/my`

**Status**: [ ]

---

### Test 3.3: Downloads Page

**Steps**:
1. Login as user with purchases
2. Navigate to http://localhost:3000/my/downloads

**Expected**:
- Page loads
- Shows purchased products
- Download buttons available

**Status**: [ ]

---

## Test Suite 4: Admin Access Control

### Test 4.1: Admin Dashboard - Admin User

**Steps**:
1. Login as admin user
2. Navigate to http://localhost:3000/admin

**Expected**:
- Dashboard loads successfully
- Admin navigation visible
- Shows analytics/summary

**Status**: [ ]

**Notes**: _______________________________________________

---

### Test 4.2: Admin Dashboard - Regular User

**Steps**:
1. Login as regular user (not admin)
2. Navigate to http://localhost:3000/admin

**Expected**:
- Redirects to home page
- Does NOT show 403 error page
- Cannot access admin area

**Status**: [ ]

---

### Test 4.3: Admin Dashboard - Not Logged In

**Steps**:
1. Ensure you're NOT logged in
2. Navigate to http://localhost:3000/admin

**Expected**:
- Redirects to `/auth/login`
- URL includes redirect parameter
- After admin login, returns to `/admin`

**Status**: [ ]

---

### Test 4.4: Admin API Routes

**Steps**:
1. Login as regular user
2. Open browser console
3. Try to fetch admin API:
```javascript
fetch('/api/admin/products').then(r => r.json()).then(console.log)
```

**Expected**:
- Returns 403 Forbidden
- Error message in response

**Status**: [ ]

---

## Test Suite 5: Logout Functionality

### Test 5.1: Logout Button Visibility

**Steps**:
1. Login as any user
2. Check header/navigation

**Expected**:
- Logout button visible in navigation
- Or user menu with logout option

**Status**: [ ]

---

### Test 5.2: Logout Action

**Steps**:
1. Login as any user
2. Click logout button
3. Verify session cleared

**Expected**:
- Redirects to home page
- Header shows "Login" button (not user info)
- Cannot access protected pages
- Session cookie cleared

**Status**: [ ]

---

### Test 5.3: Logout Then Access Protected Page

**Steps**:
1. Login, then logout
2. Try to navigate to `/my`

**Expected**:
- Redirects to login page
- Session properly cleared

**Status**: [ ]

---

## Test Suite 6: Session Persistence

### Test 6.1: Page Refresh

**Steps**:
1. Login as any user
2. Navigate to `/my`
3. Refresh page (F5)

**Expected**:
- User stays logged in
- No redirect to login
- Page loads normally

**Status**: [ ]

---

### Test 6.2: New Tab

**Steps**:
1. Login in one tab
2. Open new tab to http://localhost:3000/my

**Expected**:
- User is already logged in new tab
- Session shared across tabs
- Can access protected pages

**Status**: [ ]

---

### Test 6.3: Browser Restart (Optional)

**Steps**:
1. Login with "Remember Me" or default session
2. Close browser completely
3. Reopen and navigate to site

**Expected**:
- User still logged in (if session not expired)
- Or redirects to login (if session expired)

**Status**: [ ]

---

## Test Suite 7: Edge Cases

### Test 7.1: Rapid Login/Logout

**Steps**:
1. Login
2. Immediately logout
3. Login again
4. Repeat 3-4 times

**Expected**:
- No race conditions
- No console errors
- Auth state always consistent

**Status**: [ ]

---

### Test 7.2: Direct API Access

**Steps**:
1. Open browser console (not logged in)
2. Try:
```javascript
fetch('/api/profile/me').then(r => r.json()).then(console.log)
```

**Expected**:
- Returns 401 Unauthorized or appropriate error
- Does not expose user data

**Status**: [ ]

---

### Test 7.3: Expired Session

**Steps**:
1. Login
2. Manually delete session cookie in browser DevTools
3. Navigate to `/my`

**Expected**:
- Redirects to login
- No crash or error page

**Status**: [ ]

---

## Test Suite 8: Admin Functions

### Test 8.1: Product Management

**Steps**:
1. Login as admin
2. Navigate to http://localhost:3000/admin/products
3. Try to create/edit/delete product

**Expected**:
- CRUD operations work
- API calls succeed
- No 403 errors

**Status**: [ ]

---

### Test 8.2: User Management

**Steps**:
1. Login as admin
2. Navigate to http://localhost:3000/admin/users
3. View user list

**Expected**:
- User list displays
- Can view user details
- Admin functions available

**Status**: [ ]

---

### Test 8.3: Analytics Access

**Steps**:
1. Login as admin
2. Navigate to http://localhost:3000/admin/analytics

**Expected**:
- Analytics dashboard loads
- Charts/data display
- No permission errors

**Status**: [ ]

---

## Test Suite 9: User Profile

### Test 9.1: View Profile

**Steps**:
1. Login as any user
2. Navigate to http://localhost:3000/my

**Expected**:
- User info displays (name, email)
- Purchase history visible
- Profile editable

**Status**: [ ]

---

### Test 9.2: Edit Profile

**Steps**:
1. Login
2. Go to profile settings
3. Change name or other info
4. Save

**Expected**:
- Changes saved
- Success message
- Updated info persists after refresh

**Status**: [ ]

---

### Test 9.3: Change Password

**Steps**:
1. Login
2. Navigate to http://localhost:3000/my/settings
3. Change password form
4. Submit new password

**Expected**:
- Password updated
- Can login with new password
- Old password no longer works

**Status**: [ ]

---

## Test Suite 10: Integration Points

### Test 10.1: Product Purchase Flow

**Steps**:
1. Login as regular user
2. Add product to cart
3. Checkout
4. Verify purchase in `/my`

**Expected**:
- Full flow works
- Purchase recorded
- Download available

**Status**: [ ]

---

### Test 10.2: Review System

**Steps**:
1. Login as user with purchases
2. Write review on purchased product
3. Submit

**Expected**:
- Review created
- Associated with logged-in user
- Displays on product page

**Status**: [ ]

---

### Test 10.3: Inquiry System

**Steps**:
1. Login
2. Create inquiry
3. Check inquiry in `/my` or `/inquiries`

**Expected**:
- Inquiry created
- User can view own inquiries
- Admin can see and respond

**Status**: [ ]

---

## Summary Checklist

### Critical (Must Pass)

- [ ] Login with valid credentials works
- [ ] Protected routes redirect to login when not authenticated
- [ ] Admin routes only accessible by admin users
- [ ] Logout clears session properly
- [ ] Session persists across page refresh

### Important (Should Pass)

- [ ] Signup creates new user and auto-logs in
- [ ] Form validation works on login/signup
- [ ] Admin can access all admin pages
- [ ] Regular user cannot access admin pages
- [ ] API routes properly protected

### Nice to Have

- [ ] Session persists across browser tabs
- [ ] Password change works
- [ ] Profile editing works
- [ ] All edge cases handled gracefully

---

## Issues Found During Testing

| Test | Issue Description | Severity | Status |
|------|------------------|----------|--------|
| | | | |
| | | | |

---

## Notes

### Console Errors to Watch For

- Authentication errors
- 403 Forbidden (unexpected)
- 401 Unauthorized (check if expected)
- Session storage errors
- Cookie errors

### Browser DevTools Tips

1. **Check Cookies**: Application > Cookies > localhost
   - Look for NextAuth session cookies
2. **Check Network**: Network tab
   - Watch for auth API calls
   - Check response status codes
3. **Check Console**: Console tab
   - Look for React/Next.js errors
   - Auth-related warnings

---

**Test Completed By**: _______________
**Date**: _______________
**Overall Status**: [ ] PASS / [ ] FAIL / [ ] PARTIAL
