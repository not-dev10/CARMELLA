# Production Deployment Checklist

## Google OAuth Configuration
- [ ] Add production domain to Google OAuth authorized JavaScript origins
  - Go to Google Cloud Console → APIs & Services → Credentials
  - Find your OAuth 2.0 Client ID
  - Add: `https://your-production-domain.com`

## Supabase Configuration
- [ ] Update Site URL in Supabase
  - Go to Authentication → URL Configuration
  - Set Site URL to: `https://your-production-domain.com`

- [ ] Add production redirect URI
  - Go to Authentication → URL Configuration
  - Add Redirect URL: `https://your-production-domain.com/auth/callback`

## Environment Variables
- [ ] Update `.env.local` with production Supabase credentials
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-production-anon-key
  ```

## Frontend Build
- [ ] Run `npm run build` to verify no errors
- [ ] Test production build locally: `npm run preview`

## Security
- [ ] Ensure HTTPS is enabled on production domain
- [ ] Verify `.env.local` is in `.gitignore` (never commit secrets)
- [ ] Check that sensitive data is not exposed in build

## Testing
- [ ] Test Google OAuth sign-in on production
- [ ] Test sign-out functionality
- [ ] Verify user session persists across page refreshes
- [ ] Test on mobile devices

## Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Monitor Supabase logs for auth errors
- [ ] Check Google OAuth logs for failed attempts

---

**Last Updated**: [DATE]
**Production Domain**: [YOUR-DOMAIN.COM]
**Supabase Project**: [PROJECT-NAME]
