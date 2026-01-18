# Auth State Changes - Debugging Guide

## Issues Found & Fixed

### 1. ✅ AuthContext Type Mismatch (FIXED)
**Problem**: When logging out, setting `approvalStatus(null)` but type expects `"none"`
**Location**: `frontend/src/contexts/AuthContext.tsx` line 80
**Fix**: Changed `setApprovalStatus(null)` to `setApprovalStatus("none")` on logout

**Before**:
```tsx
} else {
  setApprovalStatus(null)  // ❌ Type mismatch
}
```

**After**:
```tsx
} else {
  setApprovalStatus("none")  // ✅ Correct type
  setB2bApprovalDetails(null)
}
```

---

## Common Issues & Solutions

### Issue 1: Backend Not Starting (Exit Code 1)
**Symptoms**: `npm run backend` fails with exit code 1
**Common Causes**:
1. Missing `.env` file with Supabase credentials
2. Missing environment variables
3. Port 5000 already in use

**Solution**:
```bash
# Create .env file in backend root
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_key
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Issue 2: Frontend Not Compiling (Exit Code 1)
**Symptoms**: `npm run dev` fails with exit code 1
**Common Causes**:
1. Missing dependencies
2. TypeScript compilation errors
3. Missing environment variables

**Solution**:
```bash
cd frontend
npm install
npm run dev
```

### Issue 3: Auth State Not Changing
**Symptoms**: 
- Login doesn't update approvalStatus
- Logout doesn't clear status
- PricingDisplay still shows wrong status

**Debugging Steps**:

1. **Check Browser Console**:
   - Open DevTools → Console
   - Look for errors from AuthContext
   - Check network calls to `/api/users/{id}/b2b-status`

2. **Verify API Endpoint**:
   ```bash
   # With valid JWT token
   curl -X GET http://localhost:5000/api/users/USER-ID/b2b-status \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json"
   ```

3. **Check Supabase Connection**:
   - Verify VITE_API_URL points to backend
   - Check Supabase credentials are loaded
   - Verify JWT token is valid

4. **Monitor State Changes**:
   ```javascript
   // In browser console with React DevTools
   // Select AuthContext.Provider
   // Watch for value changes on each action
   ```

---

## Auth State Flow Verification

### Expected Flow on Login:
```
1. User clicks login → Supabase OAuth
2. Redirects back with session
3. AuthContext detects change in onAuthStateChange
4. Fetches user profile from auth.users
5. Calls /api/users/{id}/b2b-status
6. Gets status: "pending" | "approved" | "rejected" | "none"
7. Updates state → PricingDisplay re-renders
```

### Expected Flow on Logout:
```
1. User clicks logout → signOut() called
2. Clears session from Supabase Auth
3. AuthContext detects change in onAuthStateChange
4. Sets approvalStatus = "none"
5. Sets b2bApprovalDetails = null
6. Updates state → PricingDisplay re-renders as guest
```

---

## Checking State Changes in Real-Time

### Method 1: Browser Console
```javascript
// Access auth context via window (if exposed in dev)
// Or use React DevTools extension to inspect components
```

### Method 2: Add Console Logging
Edit `AuthContext.tsx` to add logging:

```tsx
useEffect(() => {
  if (!supabase) return

  supabase.auth.getSession().then(({ data: { session } }: any) => {
    console.log('✅ Initial session:', session?.user?.email)
    setSession(session)
    setUser(session?.user ?? null)
    if (session?.user?.id) {
      console.log('📍 Fetching B2B status for:', session.user.id)
      fetchApprovalStatus(session.user.id, session?.access_token)
    }
  }).catch((err) => {
    console.error('❌ Failed to get session:', err)
  })

  try {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      console.log('🔄 Auth state changed:', _event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user?.id) {
        console.log('📍 Fetching B2B status for:', session.user.id)
        fetchApprovalStatus(session.user.id, session?.access_token)
      } else {
        console.log('🚪 No session, clearing B2B status')
        setApprovalStatus("none")
        setB2bApprovalDetails(null)
      }
    })
    return () => subscription?.unsubscribe()
  } catch (err) {
    console.error('❌ Auth listener failed:', err)
  }
}, [])
```

### Method 3: Check PricingDisplay Props
```typescript
// In product-grid.tsx, add debugging
<PricingDisplay
  basePrice={product.basePrice}
  salePrice={product.salePrice}
  b2bStatus={(() => {
    console.log('PricingDisplay b2bStatus:', approvalStatus, 'user:', user?.email)
    return user ? (approvalStatus || "none") : null
  })()}
  pricingLocked={!user}
  isBulkEligible={approvalStatus === "approved"}
  showSavings={true}
/>
```

---

## API Endpoint Issues

### Endpoint: GET /api/users/{id}/b2b-status

**Expected Behavior**:
1. Accepts user ID in URL
2. Checks Authorization header for JWT
3. Queries b2b_requests table for latest record
4. Returns status: "pending" | "approved" | "rejected" | null

**If Returning Empty**:
```sql
-- Check if user has any B2B requests
SELECT * FROM b2b_requests 
WHERE user_id = 'user-id' 
ORDER BY requested_at DESC 
LIMIT 1;
```

**If User Has No Requests**:
- Status should default to "none"
- AuthContext should set `approvalStatus = "none"`

---

## Quick Fixes

### Fix 1: Auth State Type Error
```diff
- setApprovalStatus(null)
+ setApprovalStatus("none")
```
✅ **Status**: Fixed in AuthContext

### Fix 2: Missing Logout Cleanup
```diff
  } else {
    setApprovalStatus("none")
+   setB2bApprovalDetails(null)
  }
```
✅ **Status**: Fixed in AuthContext

### Fix 3: Environment Variables
Create `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

---

## Testing Auth State Changes

### Test 1: Login → Check Status
1. Start app (logged out)
2. Open DevTools Console
3. Click login
4. Watch for "Auth state changed" logs
5. Check `approvalStatus` value
6. Verify PricingDisplay changes

### Test 2: Logout → Check Status
1. Log in first
2. Click logout
3. Check console for "Auth state changed"
4. Verify `approvalStatus = "none"`
5. Check PricingDisplay shows guest message

### Test 3: Manual B2B Status Change
```sql
-- Grant user B2B approval
INSERT INTO b2b_requests (user_id, status, requested_at)
VALUES ('user-id', 'pending', NOW())
ON CONFLICT DO NOTHING;

-- Refresh page → Should show pending message
```

---

## Troubleshooting Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Environment variables set (.env file)
- [ ] Supabase credentials valid
- [ ] Database tables exist (users, b2b_requests)
- [ ] RLS policies allow queries
- [ ] No console errors in DevTools
- [ ] Network tab shows successful API calls
- [ ] Auth context provider wraps entire app
- [ ] useAuth hook called inside AuthProvider

---

**Last Fixed**: Type mismatch on logout (setApprovalStatus(null) → setApprovalStatus("none"))
**Status**: ✅ Auth state changes should now work correctly
