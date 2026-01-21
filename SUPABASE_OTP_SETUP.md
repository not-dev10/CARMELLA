# Supabase OTP Email Configuration Guide

## Problem
Getting "Token has expired or is invalid" error when trying to verify OTP during signup.

## Root Cause
Supabase Email provider is not properly configured to send OTP codes.

## Solution: Configure Supabase Email OTP

### Step 1: Enable Email Provider
1. Go to your Supabase Dashboard
2. Navigate to **Authentication → Providers**
3. Find **Email** provider
4. Toggle **Enable Email Provider** to ON
5. Make sure **Email/Password** is enabled

### Step 2: Configure Email Settings
1. Go to **Authentication → Email Templates**
2. You should see these templates:
   - Confirm signup
   - Invite user
   - Magic Link
   - Change Email
   - Reset Password

### Step 3: Set OTP Expiration (Optional)
1. Go to **Authentication → Providers → Email**
2. Look for **OTP Expiry Duration** setting
3. Default is 900 seconds (15 minutes)
4. You can adjust if needed

### Step 4: Update Email Template
1. Go to **Authentication → Email Templates**
2. Click on **Confirm signup** template
3. Replace the default template with your custom HTML from `email-template.html`
4. Make sure the template includes `{{ .Token }}` or `{{ .ConfirmationURL }}`

### Step 5: Test Configuration
1. Try signing up with a test email
2. Check your email for the OTP code
3. Enter the code in the verification step

## If Still Getting "Token Expired" Error

### Option A: Use Email Link Instead of OTP
If OTP is not working, switch to email confirmation link:

```typescript
// In Signup.tsx
const { error: err } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

Then update verification to use the redirect link instead of OTP code.

### Option B: Disable Email Confirmation
If you want to skip email verification temporarily:

1. Go to **Authentication → Providers → Email**
2. Toggle **Confirm email** to OFF
3. Users will be auto-confirmed on signup

⚠️ **Note**: This is less secure. Only use for testing.

### Option C: Use Magic Link
Switch to magic link authentication:

```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

## Troubleshooting

### "Invalid OTP" Error
- OTP code is incorrect
- OTP has expired (15 minutes default)
- User hasn't received the email yet

**Solution**: Request a new OTP code

### "Email not confirmed" Error
- User hasn't verified their email
- Email confirmation is required in Supabase settings

**Solution**: Check email for confirmation code

### Email Not Arriving
- Check spam/junk folder
- Verify email address is correct
- Check Supabase email logs in dashboard

## Current Implementation

Your app currently uses:
- **Signup**: Email + Password with OTP verification
- **Login**: Email + Password (no OTP)
- **OAuth**: Google Sign-In

## Next Steps

1. Configure Supabase Email Provider (steps above)
2. Test signup flow with a real email
3. Verify OTP code is received
4. If issues persist, switch to email link confirmation

## Files to Update If Changing Auth Method

- `carmella/frontend/src/pages/Signup.tsx` - Verification logic
- `carmella/frontend/src/pages/AuthCallback.tsx` - Callback handling
- `carmella/email-template.html` - Email template
