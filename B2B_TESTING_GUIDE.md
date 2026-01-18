# B2B Pricing System - Data Flow & Testing Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Application                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Pages/Components                                       │
│  ├─ Product Grid                                             │
│  ├─ Product Detail                                           │
│  ├─ Product Showcase                                         │
│  ├─ Cart (future)                                            │
│  └─ Checkout (future)                                        │
│                                                              │
│                     ↓ uses                                   │
│                                                              │
│         PricingDisplay Component                             │
│  ├─ Props: basePrice, salePrice, b2bStatus                  │
│  └─ Logic: Conditional rendering based on approval status   │
│                                                              │
│                     ↑ gets data from                         │
│                                                              │
│         AuthContext (useAuth hook)                           │
│  ├─ Data: user, approvalStatus, b2bApprovalDetails          │
│  └─ Updates: On login, logout, approval status change       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP Call ↑
              (Supabase Auth + Custom API)
┌─────────────────────────────────────────────────────────────┐
│                   Backend API / Supabase                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Supabase Auth                                               │
│  └─ Manages: login, logout, sessions, JWT tokens            │
│                                                              │
│  Custom API Endpoints                                        │
│  └─ GET /api/users/{userId}/b2b-status                      │
│     Returns: { user_id, status, requested_at, ... }         │
│                                                              │
│  PostgreSQL Database                                         │
│  ├─ Table: auth.users (managed by Supabase)                 │
│  ├─ Table: public.users (custom profiles)                   │
│  ├─ Table: public.b2b_requests (approval workflow)           │
│  │  Fields: id, user_id, status, requested_at,              │
│  │          approved_at, rejection_reason, ...              │
│  └─ Table: public.products (product catalog)                │
│     Fields: id, name, base_price, sale_price, moq, ...      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

### 1. User Login Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Supabase OAuth flow redirects to Google
   ↓
3. User authorizes, returns to app
   ↓
4. AuthContext detects session change in useEffect
   ↓
5. AuthContext calls fetchApprovalStatus(userId, token)
   ↓
6. API call: GET /api/users/{userId}/b2b-status
   ↓
7. Backend queries: SELECT * FROM b2b_requests 
                    WHERE user_id = ? 
                    ORDER BY requested_at DESC LIMIT 1
   ↓
8. Backend returns: { id, user_id, status: "pending|approved|rejected", ... }
   OR empty object if no request exists (status = "none")
   ↓
9. AuthContext extracts status and updates state
   ↓
10. Components using useAuth() re-render with new status
    ↓
11. PricingDisplay receives b2bStatus and renders appropriate message
```

### 2. Product Display Flow

```
Product Page Loads
   ↓
Component calls useAuth()
   ├─ Gets: user { id, email, ... }
   └─ Gets: approvalStatus "none" | "pending" | "approved" | "rejected"
   ↓
Component renders PricingDisplay with:
   ├─ basePrice: 45.00 (from product)
   ├─ salePrice: 35.00 (from product)
   ├─ b2bStatus: approvalStatus (from auth context)
   ├─ pricingLocked: !user (true if guest, false if logged in)
   └─ isBulkEligible: approvalStatus === "approved"
   ↓
PricingDisplay renders based on status:
   ├─ Guest: "Pricing Locked" message
   ├─ "pending": "⏳ Pending Approval" message
   ├─ "approved": "✅ B2B Approved" + MOQ info
   ├─ "rejected": "❌ Application Rejected" message
   └─ "none": Standard pricing + discount badge
```

### 3. B2B Approval Request Flow (User Initiated)

```
User clicks "Request B2B Access"
   ↓
Form submits to: POST /api/b2b-requests
   ├─ Headers: Authorization: Bearer {token}
   └─ Body: { message: "..." }
   ↓
Backend creates row in b2b_requests:
   user_id: {userId}
   status: "pending"
   requested_at: NOW()
   ↓
User is redirected/notified
   ↓
Next time user views products, PricingDisplay shows:
   "⏳ Pending Approval - Awaiting review"
   ↓
[Admin approves in dashboard]
   ↓
Admin updates: UPDATE b2b_requests 
               SET status = 'approved', approved_at = NOW() 
               WHERE id = ?
   ↓
User refreshes page → API fetches latest status
   ↓
PricingDisplay shows: "✅ B2B Approved" + MOQ info
```

## Component State Diagram

```
                    ┌──────────────┐
                    │    GUEST     │
                    │  (not logged)│
                    └──────┬───────┘
                           │ Login
                           ↓
                    ┌──────────────┐
                    │   LOGGED-IN  │
                    │  (No B2B yet)│
                    └──────┬───────┘
                           │ Request B2B
                           ↓
                    ┌──────────────┐
                    │   PENDING    │
                    │  (Awaiting)  │
                    └──────┬───────┘
                     ↙     │     ↘
              Approve      │      Reject
                 ↙         │       ↘
    ┌──────────────┐       │     ┌──────────────┐
    │  APPROVED    │       │     │  REJECTED    │
    │ (Full Access)│       │     │(Deny Request)│
    └──────────────┘       │     └──────────────┘
                           │
                      Logout/Clear
                           ↓
                    Back to GUEST
```

## Testing Scenarios

### Test 1: Guest User Price Display
**Steps**:
1. Open app in incognito/private window
2. Navigate to product grid or detail page
3. **Expected**: See "🔒 Pricing Locked" message with sign-in link
4. **Verify**: No prices are visible, lock icon displays

**Result**: ✅ / ❌

---

### Test 2: Logged-in User (No B2B Request)
**Steps**:
1. Log in with test account
2. Navigate to product
3. **Expected**: See standard pricing (e.g., "$35.00 $45.00 Save 22%")
4. **Verify**: No approval messages, just prices

**Result**: ✅ / ❌

---

### Test 3: B2B Pending Approval
**Steps**:
1. Create B2B request via API or admin panel:
   ```sql
   INSERT INTO b2b_requests (user_id, status, requested_at) 
   VALUES ('user-id', 'pending', NOW());
   ```
2. Log in as that user
3. Navigate to product
4. **Expected**: See "⏳ Pending B2B Approval - Pricing locked" (yellow badge)
5. **Verify**: Clock icon, yellow color, pending message displays

**Result**: ✅ / ❌

---

### Test 4: B2B Approved
**Steps**:
1. Set approval status:
   ```sql
   UPDATE b2b_requests SET status = 'approved', approved_at = NOW() 
   WHERE user_id = 'user-id';
   ```
2. Log in as that user
3. Navigate to product
4. **Expected**: See "✅ B2B Approved ✓" (green badge)
5. **Verify**: Check icon, green color, approval message displays

**Result**: ✅ / ❌

---

### Test 5: B2B Rejected
**Steps**:
1. Set rejection status:
   ```sql
   UPDATE b2b_requests SET status = 'rejected', rejection_reason = 'Invalid business' 
   WHERE user_id = 'user-id';
   ```
2. Log in as that user
3. Navigate to product
4. **Expected**: See "❌ B2B Application Rejected" (red badge)
5. **Verify**: X icon, red color, rejection message + contact link displays

**Result**: ✅ / ❌

---

### Test 6: Logout Clears Status
**Steps**:
1. Log in as approved B2B user (see test 4)
2. Verify products show B2B approved status
3. Click logout
4. Navigate to same product page
5. **Expected**: Back to guest pricing locked message
6. **Verify**: Auth context clears status on logout

**Result**: ✅ / ❌

---

### Test 7: Discount Calculation
**Steps**:
1. Log in as regular user
2. View product with basePrice: 100, salePrice: 75
3. **Expected**: Shows "$75.00" + strikethrough "$100.00" + badge "Save 25%"
4. **Verify**: Discount percentage calculates correctly

**Calculation**: (100 - 75) / 100 = 0.25 = 25%

**Result**: ✅ / ❌

---

### Test 8: MOQ Display
**Steps**:
1. Log in as B2B approved user
2. View product with moq: 10
3. **Expected**: MOQ info should be visible in pricing section (if component shows it)
4. **Verify**: "Bulk orders available" message displays

**Result**: ✅ / ❌

---

### Test 9: Cross-Page Consistency
**Steps**:
1. Log in as B2B pending user
2. Visit product grid → See pending message
3. Click to product detail → See pending message
4. Go back to grid → See pending message
5. **Expected**: Consistent display across all pages
6. **Verify**: Same status message on different pages

**Result**: ✅ / ❌

---

### Test 10: Status Change During Session
**Steps**:
1. Log in as pending user
2. Verify pending message displays
3. **In admin panel**: Approve the request
4. Go back to product page (without logout)
5. **Expected**: Still shows pending (until page refresh or context updates)
6. **Verify**: Refresh page → Now shows approved

**Note**: Real-time updates would require WebSocket/polling

**Result**: ✅ / ❌

---

## SQL Test Queries

### Check if user has B2B request
```sql
SELECT * FROM b2b_requests 
WHERE user_id = 'USER-ID-HERE'
ORDER BY requested_at DESC 
LIMIT 1;
```

### Check all pending requests (admin)
```sql
SELECT br.*, u.email 
FROM b2b_requests br
JOIN public.users u ON br.user_id = u.id
WHERE br.status = 'pending'
ORDER BY br.requested_at;
```

### Approve a request
```sql
UPDATE b2b_requests 
SET status = 'approved', approved_at = NOW() 
WHERE user_id = 'USER-ID-HERE';
```

### Reject a request
```sql
UPDATE b2b_requests 
SET status = 'rejected', rejection_reason = 'Reason here' 
WHERE user_id = 'USER-ID-HERE';
```

## API Testing with cURL

### Get B2B Status
```bash
curl -X GET http://localhost:5000/api/users/USER-ID/b2b-status \
  -H "Authorization: Bearer JWT-TOKEN" \
  -H "Content-Type: application/json"

# Response if pending:
{
  "id": "req-123",
  "user_id": "user-456",
  "status": "pending",
  "requested_at": "2024-01-15T10:30:00Z"
}

# Response if approved:
{
  "id": "req-123",
  "user_id": "user-456",
  "status": "approved",
  "approved_at": "2024-01-16T14:22:00Z"
}

# Response if no request:
null or empty object
```

## Browser DevTools Debugging

### Check Auth Context State
In browser console:
```javascript
// If using React DevTools, inspect AuthContext provider
// Should show:
// {
//   user: { id, email, ... },
//   approvalStatus: "pending|approved|rejected|none",
//   b2bApprovalDetails: { ... }
// }
```

### Check Network Calls
1. Open DevTools → Network tab
2. Filter by "b2b-status"
3. Look for GET request to `/api/users/{id}/b2b-status`
4. Check response contains `status` field

### Check Component Props
1. Open DevTools → React tab
2. Select PricingDisplay component
3. Check props:
   - basePrice: number
   - salePrice: number or null
   - b2bStatus: string or null
   - pricingLocked: boolean

## Performance Considerations

- B2B status fetched **once on login**, cached in context
- PricingDisplay is a **pure component** (no internal state)
- Status updates require page refresh (no real-time polling)
- Consider adding WebSocket for real-time approvals (future enhancement)

## Deployment Checklist

- [ ] All 3 seed files run successfully on Supabase
- [ ] API endpoint `/api/users/{id}/b2b-status` returns correct data
- [ ] AuthContext properly parses response
- [ ] PricingDisplay renders all 5 status states correctly
- [ ] All tests pass in browser
- [ ] No console errors in browser DevTools
- [ ] Mobile responsiveness verified
- [ ] Accessibility check (icons + text labels)
- [ ] Performance test (load 20+ products)

---

**Document**: B2B Pricing System Testing Guide
**Status**: Ready for Testing
**Last Updated**: Current Session
