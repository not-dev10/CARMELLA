# Quick Vercel Environment Setup Guide

**Your Live Site:** https://carmella-mu.vercel.app/

## 🎯 Quick Setup (5 Minutes)

### Step 1: Add Environment Variables in Vercel Dashboard

1. **Go to:** https://vercel.com/not-dev10s-projects/carmella/settings/environment-variables

2. **Add these 6 variables** (click "Add" for each):

#### Variable 1: VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://wrfagwidnhxrafemqwkq.supabase.co
Environment: Production ✓ Preview ✓ Development ✓
```

#### Variable 2: VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZmFnd2lkbmh4cmFmZW1xd2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTc2ODgsImV4cCI6MjA4NDIzMzY4OH0.NFxtALeuXfhFnRh7ZK-lmWbmbCbdaaSQkE9K8pcktD8
Environment: Production ✓ Preview ✓ Development ✓
```

#### Variable 3: VITE_GOOGLE_CLIENT_ID
```
Name: VITE_GOOGLE_CLIENT_ID
Value: 477250176734
Environment: Production ✓ Preview ✓ Development ✓
```

#### Variable 4: VITE_CLOUDINARY_CLOUD_NAME
```
Name: VITE_CLOUDINARY_CLOUD_NAME
Value: dwis8ote1
Environment: Production ✓ Preview ✓ Development ✓
```

#### Variable 5: VITE_CLOUDINARY_UPLOAD_PRESET
```
Name: VITE_CLOUDINARY_UPLOAD_PRESET
Value: carmella_products
Environment: Production ✓ Preview ✓ Development ✓
```

#### Variable 6: VITE_API_URL
```
Name: VITE_API_URL
Value: http://localhost:5000/api
Environment: Production ✓ Preview ✓ Development ✓
```

⚠️ **Note:** You'll need to update `VITE_API_URL` after deploying your backend!

---

### Step 2: Redeploy Your Site

After adding all variables:

1. Go to: https://vercel.com/not-dev10s-projects/carmella
2. Click on "Deployments" tab
3. Click the three dots (...) on the latest deployment
4. Click "Redeploy"
5. Wait for deployment to complete

---

### Step 3: Update Supabase Settings

1. **Go to:** https://app.supabase.com/project/wrfagwidnhxrafemqwkq/auth/url-configuration

2. **Update Site URL:**
   ```
   https://carmella-mu.vercel.app
   ```

3. **Add Redirect URLs** (add these to the list):
   ```
   https://carmella-mu.vercel.app/auth/callback
   https://carmella-mu.vercel.app
   ```

4. Click "Save"

---

### Step 4: Update Google OAuth Settings

1. **Go to:** https://console.cloud.google.com/apis/credentials

2. **Find your OAuth 2.0 Client ID** and click edit

3. **Add to "Authorized JavaScript origins":**
   ```
   https://carmella-mu.vercel.app
   ```

4. **Add to "Authorized redirect URIs":**
   ```
   https://carmella-mu.vercel.app/auth/callback
   ```

5. Click "Save"

---

## ✅ Verification

After completing all steps, test your site:

1. Visit: https://carmella-mu.vercel.app/
2. Try to sign up/login
3. Check if products load
4. Try adding items to cart

---

## 🚀 Next: Deploy Backend

Your frontend is now configured, but you need to deploy the backend separately.

### Option 1: Deploy Backend to Vercel

```bash
cd carmella/backend
vercel --prod
```

When prompted:
- Framework: Node.js
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install

### Option 2: Deploy Backend to Railway

1. Go to https://railway.app/
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your carmella repository
5. Set root directory to `backend`
6. Add environment variables (see VERCEL_ENV_SETUP.md)
7. Deploy

### After Backend Deployment:

1. Get your backend URL (e.g., `https://your-backend.railway.app`)
2. Go back to Vercel dashboard
3. Update `VITE_API_URL` environment variable to: `https://your-backend.railway.app/api`
4. Redeploy frontend

---

## 🐛 Troubleshooting

### Site loads but shows errors?
- Check browser console (F12)
- Verify all 6 environment variables are set in Vercel
- Make sure you redeployed after adding variables

### Login not working?
- Verify Supabase redirect URLs are correct
- Check Google OAuth settings
- Clear browser cache and try again

### Products not loading?
- Backend is not deployed yet (expected)
- Once backend is deployed, update VITE_API_URL

---

## 📞 Quick Links

- **Your Site:** https://carmella-mu.vercel.app/
- **Vercel Dashboard:** https://vercel.com/not-dev10s-projects/carmella
- **Environment Variables:** https://vercel.com/not-dev10s-projects/carmella/settings/environment-variables
- **Supabase Dashboard:** https://app.supabase.com/project/wrfagwidnhxrafemqwkq
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials

---

**Last Updated:** March 29, 2026
