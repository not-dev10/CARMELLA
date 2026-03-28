# Cloudinary Image Upload Setup Guide

## Overview
This guide will help you set up Cloudinary for product and category image uploads in the Carmella admin panel.

## Prerequisites
- Cloudinary account (free tier available)
- Access to both frontend and backend `.env` files

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. Verify your email address
4. Log in to your Cloudinary dashboard

## Step 2: Get Your Cloudinary Credentials

### A. Get Cloud Name
1. Go to https://cloudinary.com/console
2. Find your **Cloud Name** in the dashboard (top-left corner)
3. Copy it (example: `dxyz123abc`)

### B. Create Upload Preset (IMPORTANT!)
1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Configure the preset:
   - **Preset name**: `carmella_products` (or any name you prefer)
   - **Signing Mode**: Select **Unsigned** (CRITICAL!)
   - **Folder**: `carmella/products` (optional, for organization)
   - **Access mode**: Public
   - **Unique filename**: Enable (recommended)
   - **Overwrite**: Disable (recommended)
4. Click **Save**
5. Copy the preset name

### C. Get API Credentials (Backend Only - Optional)
1. Go to **Settings** → **API Keys**
2. Find your **API Key** and **API Secret**
3. These are only needed if you want server-side uploads (not currently used)

## Step 3: Configure Environment Variables

### Frontend Configuration

Edit `carmella/frontend/.env` and `carmella/frontend/.env.local`:

```env
# Cloudinary Configuration (for product image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name-here
VITE_CLOUDINARY_UPLOAD_PRESET=carmella_products
```

**Example:**
```env
VITE_CLOUDINARY_CLOUD_NAME=dxyz123abc
VITE_CLOUDINARY_UPLOAD_PRESET=carmella_products
```

### Backend Configuration (Optional)

Edit `carmella/backend/.env`:

```env
# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Note:** Backend Cloudinary config is optional and only needed for server-side operations.

## Step 4: Restart Servers

After updating environment variables:

```bash
# Stop both servers (Ctrl+C)

# Restart backend
cd carmella/backend
npm run dev

# Restart frontend (in new terminal)
cd carmella/frontend
npm run dev
```

## Step 5: Test Image Upload

1. Log in to admin panel: http://localhost:5173/admin
2. Go to **Products** or **Categories** section
3. Click **Add New Product** or **Add New Category**
4. Try uploading an image:
   - Drag & drop an image file
   - OR click the upload area to select a file
5. Check browser console for upload logs:
   - `[CLOUDINARY] Upload starting:` - Shows config
   - `[CLOUDINARY] Upload success:` - Shows uploaded URL

## Troubleshooting

### Issue: "Missing Cloudinary config"

**Cause:** Environment variables not loaded

**Solution:**
1. Verify `.env` files have correct variable names:
   - Frontend: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
   - Backend: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
2. Restart both servers after changing `.env` files
3. Check browser console: `import.meta.env.VITE_CLOUDINARY_CLOUD_NAME` should show your cloud name

### Issue: "Upload preset must be whitelisted"

**Cause:** Upload preset is not set to "Unsigned" mode

**Solution:**
1. Go to Cloudinary dashboard → Settings → Upload → Upload presets
2. Find your preset
3. Change **Signing Mode** to **Unsigned**
4. Save changes

### Issue: "Invalid signature"

**Cause:** Using signed upload without proper authentication

**Solution:**
1. Ensure upload preset is set to **Unsigned** mode
2. Do NOT include `api_key` or `signature` in the upload request
3. Only send `file` and `upload_preset` in FormData

### Issue: Images not showing after upload

**Cause:** CORS or URL issues

**Solution:**
1. Check if Cloudinary URL is valid (starts with `https://res.cloudinary.com/`)
2. Verify image URL in browser console
3. Check if image loads directly in browser

### Issue: "Upload failed (401)"

**Cause:** Invalid cloud name or upload preset

**Solution:**
1. Double-check cloud name matches your Cloudinary dashboard
2. Verify upload preset name is correct (case-sensitive)
3. Ensure upload preset exists and is enabled

## Security Best Practices

### Frontend (Public)
- ✅ Use unsigned upload presets
- ✅ Set folder restrictions in preset
- ✅ Enable file size limits in preset
- ✅ Restrict file types to images only

### Backend (Private)
- ❌ Never expose API Secret in frontend
- ✅ Keep API credentials in backend `.env` only
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables in production

## Production Deployment

### Vercel/Netlify (Frontend)
1. Go to project settings → Environment Variables
2. Add:
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
3. Redeploy

### Railway/Render (Backend)
1. Go to project settings → Environment Variables
2. Add:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Redeploy

## Additional Resources

- Cloudinary Documentation: https://cloudinary.com/documentation
- Upload Presets Guide: https://cloudinary.com/documentation/upload_presets
- Unsigned Uploads: https://cloudinary.com/documentation/upload_images#unsigned_upload
- React Integration: https://cloudinary.com/documentation/react_integration

## Support

If you encounter issues:
1. Check browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure upload preset is configured as "Unsigned"
4. Test upload directly on Cloudinary dashboard first
5. Check Cloudinary dashboard → Media Library to see if images are uploading

---

**Last Updated:** March 29, 2026
