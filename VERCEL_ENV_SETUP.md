# Vercel Environment Variables Setup

**Production URL:** https://carmella-mu.vercel.app/

## 🔧 Required Environment Variables

You need to add these environment variables in your Vercel dashboard:

### How to Add Environment Variables in Vercel:

1. Go to https://vercel.com/dashboard
2. Click on your "carmella" project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below

---

## 📋 Environment Variables to Add

### 1. Supabase Configuration

**Variable Name:** `VITE_SUPABASE_URL`  
**Value:** `https://wrfagwidnhxrafemqwkq.supabase.co`  
**Environment:** Production, Preview, Development

**Variable Name:** `VITE_SUPABASE_ANON_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZmFnd2lkbmh4cmFmZW1xd2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTc2ODgsImV4cCI6MjA4NDIzMzY4OH0.NFxtALeuXfhFnRh7ZK-lmWbmbCbdaaSQkE9K8pcktD8`  
**Environment:** Production, Preview, Development

---

### 2. Google OAuth

**Variable Name:** `VITE_GOOGLE_CLIENT_ID`  
**Value:** `477250176734`  
**Environment:** Production, Preview, Development

---

### 3. Cloudinary Configuration

**Variable Name:** `VITE_CLOUDINARY_CLOUD_NAME`  
**Value:** `dwis8ote1`  
**Environment:** Production, Preview, Development

**Variable Name:** `VITE_CLOUDINARY_UPLOAD_PRESET`  
**Value:** `carmella_products`  
**Environment:** Production, Preview, Development

---

### 4. Backend API URL

**Variable Name:** `VITE_API_URL`  
**Value:** `https://your-backend-url.vercel.app/api` (or your deployed backend URL)  
**Environment:** Production, Preview, Development

⚠️ **IMPORTANT:** You need to deploy your backend separately and update this URL!

---

## 🚀 Backend Deployment Options

Your backend needs to be deployed separately. Here are your options:

### Option 1: Deploy Backend to Vercel (Recommended)

1. Create a new Vercel project for the backend
2. Set root directory to `backend`
3. Add backend environment variables (see below)
4. Deploy and get the URL
5. Update `VITE_API_URL` in frontend with the backend URL

### Option 2: Deploy Backend to Railway/Render/Heroku

1. Create account on Railway/Render/Heroku
2. Deploy the `backend` folder
3. Add environment variables
4. Get the deployment URL
5. Update `VITE_API_URL` in frontend

---

## 🔐 Backend Environment Variables

When deploying the backend, you'll need these variables:

```env
# Supabase
SUPABASE_URL=https://wrfagwidnhxrafemqwkq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT
JWT_SECRET=your-jwt-secret-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=dwis8ote1
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
PORT=5000
NODE_ENV=production
```

---

## 📝 Step-by-Step Setup

### Step 1: Add Frontend Environment Variables

1. Go to https://vercel.com/dashboard
2. Click on "carmella" project
3. Settings → Environment Variables
4. Add all 6 variables listed above
5. Make sure to select "Production", "Preview", and "Development" for each

### Step 2: Update Supabase Redirect URLs

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Authentication → URL Configuration
4. Add these URLs to "Redirect URLs":
   - `https://carmella-mu.vercel.app/auth/callback`
   - `https://carmella-mu.vercel.app`
5. Update "Site URL" to: `https://carmella-mu.vercel.app`

### Step 3: Update Google OAuth

1. Go to https://console.cloud.google.com/
2. Select your project
3. APIs & Services → Credentials
4. Edit your OAuth 2.0 Client ID
5. Add to "Authorized JavaScript origins":
   - `https://carmella-mu.vercel.app`
6. Add to "Authorized redirect URIs":
   - `https://carmella-mu.vercel.app/auth/callback`

### Step 4: Deploy Backend

Choose one of the backend deployment options above and deploy your backend.

### Step 5: Update Frontend API URL

1. Once backend is deployed, get its URL
2. Go back to Vercel dashboard
3. Update `VITE_API_URL` environment variable
4. Redeploy frontend (Deployments → Redeploy)

---

## ✅ Verification Checklist

After setting up all environment variables:

- [ ] All 6 frontend environment variables added in Vercel
- [ ] Supabase redirect URLs updated
- [ ] Google OAuth URLs updated
- [ ] Backend deployed and URL obtained
- [ ] Frontend `VITE_API_URL` updated with backend URL
- [ ] Frontend redeployed
- [ ] Test login functionality
- [ ] Test product image uploads
- [ ] Test cart and checkout flow

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" errors

**Solution:** Check that `VITE_API_URL` points to your deployed backend URL, not localhost.

### Issue: Google login not working

**Solution:** Verify that `https://carmella-mu.vercel.app` is added to Google OAuth authorized origins.

### Issue: Supabase auth errors

**Solution:** Check that redirect URLs are correctly configured in Supabase dashboard.

### Issue: Images not uploading

**Solution:** Verify Cloudinary credentials are correct and upload preset is set to "unsigned".

---

## 📞 Need Help?

If you encounter issues:

1. Check Vercel deployment logs: Deployments → Click on deployment → View Function Logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Make sure backend is deployed and accessible

---

**Last Updated:** March 29, 2026  
**Production URL:** https://carmella-mu.vercel.app/
