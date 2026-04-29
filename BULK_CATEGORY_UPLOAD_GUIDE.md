# 📦 Bulk Category Upload Script - Complete Guide

## Overview

This guide will help you upload all your category images from your Downloads folder to your Carmella website using automated scripts.

## What You Need

1. **Category Images**: Place all your category images in:
   ```
   C:\Users\[YourUsername]\Downloads\CATEGORIES\
   ```

2. **API Credentials**: Either:
   - JWT Authentication Token (recommended if you have it), OR
   - Email and password for your admin account

3. **Required Tools**:
   - **PowerShell** (built-in on Windows) - RECOMMENDED
   - OR **Node.js** (if you prefer JavaScript)

## Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`

## Method 1: PowerShell (RECOMMENDED for Windows)

### Step 1: Prepare Your Images

1. Create a folder: `C:\Users\[YourUsername]\Downloads\CATEGORIES`
2. Move all your category images into this folder
3. Make sure filenames are clear (e.g., `electronics.jpg`, `fashion.png`)

### Step 2: Get Your JWT Token

You have two options:

**Option A: Use Email & Password (Easiest)**
- You'll need your admin email and password
- The script will log in automatically

**Option B: Use JWT Token (If you have one)**
- Find your JWT token (usually in browser LocalStorage or from your admin account)

### Step 3: Run the Upload Script

**Using Email/Password (Easiest):**
```powershell
.\bulk-upload-categories.ps1 -Email "admin@example.com" -Password "yourpassword"
```

**Using JWT Token:**
```powershell
.\bulk-upload-categories.ps1 -Token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Local Testing (if running backend locally):**
```powershell
.\bulk-upload-categories.ps1 -Token "your_token" -Local
```

### Step 4: Monitor Progress

The script will show:
- 📸 Number of images found
- 🔐 Authentication status
- ⬆️ Upload progress for each file
- ✅ Success/failure count
- 📍 Public URLs for each uploaded image

### Step 5: View Results

After upload completes, check:
- **Console output** - see which images uploaded successfully
- **upload-results-YYYY-MM-DD.json** - saved in current directory with all URLs

## Method 2: Node.js Script

### Step 1: Ensure Node.js is Installed

```bash
node --version
```

If not installed, download from https://nodejs.org

### Step 2: Run the Node.js Script

**Using Email/Password:**
```bash
node bulk-upload-categories.js --email admin@example.com --password yourpassword
```

**Using JWT Token:**
```bash
node bulk-upload-categories.js --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Local Testing:**
```bash
node bulk-upload-categories.js --token "your_token" --local
```

## Method 3: Easy Batch File (Windows)

If you prefer a simple double-click method:

### Step 1: Create a Batch Launcher

The file `bulk-upload-categories.bat` is already included.

### Step 2: Run It

```bash
bulk-upload-categories.bat -email admin@example.com -password mypassword
```

## Getting Your JWT Token

If you already have a token:

### Option 1: From Browser Console
1. Open your Carmella admin panel in browser
2. Press `F12` to open Developer Tools
3. Go to "Application" tab → "LocalStorage"
4. Look for the token value

### Option 2: Direct Login
1. Use your email and password (script will handle login)
2. Script will automatically get a token for you

## Troubleshooting

### ❌ "Categories folder not found"
- Create: `C:\Users\[YourUsername]\Downloads\CATEGORIES\`
- Add your images to this folder
- Make sure path is exactly correct

### ❌ "No image files found"
- Check file extensions (.jpg, .png, etc.)
- Files must be in the CATEGORIES folder directly
- No subfolders - images should be at the top level

### ❌ "Login failed"
- Verify email and password are correct
- Make sure your account has admin access
- Try with a direct JWT token instead

### ❌ "Upload failed (403)"
- Check if token is expired
- Try logging in again with email/password
- Verify API URL is correct (should be `https://api.carmellawholesale.uk/api`)

### ❌ "Network error"
- Check your internet connection
- Verify API is reachable: `https://api.carmellawholesale.uk/api`
- Try with `--Local` flag if running backend locally

### ❌ Files uploaded but "Public URL" is wrong
- Check the `upload-results-YYYY-MM-DD.json` file for correct URLs
- URLs should be in S3 format: `https://s3.amazonaws.com/...`

## What Gets Uploaded

Each image will be:
1. ✅ Uploaded to AWS S3
2. ✅ Stored with category prefix in S3
3. ✅ Return a public URL you can use
4. ✅ Saved in upload results file

## Performance Notes

- **Upload speed** depends on:
  - Your internet connection
  - Image file sizes
  - S3 availability

- **Typical performance**:
  - Small images (< 1MB): ~2-5 seconds each
  - Large images (5-10MB): ~10-30 seconds each
  - Script adds 500ms delay between uploads to avoid rate limiting

- **For 100+ images**:
  - May take 5-15 minutes total
  - All uploads happen automatically
  - Script shows progress for each file

## After Upload

### Verify Uploads in Admin Panel

1. Log in to Carmella Admin
2. Go to Categories section
3. Images should appear with their public S3 URLs

### Using the URLs

Each uploaded image will have a public URL like:
```
https://carmella-uploads.s3.amazonaws.com/categories/electronics_1234567890.jpg
```

You can:
- Copy URLs directly for your website
- Use in the admin panel
- Share publicly

## Need Help?

Check:
1. **Console output** - shows detailed error messages
2. **upload-results-YYYY-MM-DD.json** - lists all uploads with URLs
3. **Error messages** - usually indicate exact problem

## Script Features

### PowerShell Version
- ✅ Full Windows compatibility
- ✅ Progress indicators with colors
- ✅ Automatic token handling
- ✅ JSON results file
- ✅ No additional dependencies needed

### Node.js Version
- ✅ Cross-platform (Windows, Mac, Linux)
- ✅ Can be customized further
- ✅ Same features as PowerShell version
- ✅ Requires Node.js installed

## Advanced Options

### Skip Authentication Prompt
```powershell
.\bulk-upload-categories.ps1 -Token "your_token" -Email "" -Password ""
```

### Test with Local API
```powershell
.\bulk-upload-categories.ps1 -Email "admin@example.com" -Password "pass" -Local
```

### View Just Token (Don't Upload)
Modify the script to return token without uploading (for debugging)

## Security Notes

- ⚠️ **Never commit tokens to git**
- ⚠️ **Don't share tokens in messages/emails**
- ⚠️ **Delete results JSON file if it contains sensitive URLs**
- ✅ Use email/password and let script get token instead
- ✅ Tokens expire automatically

## Summary

1. **Prepare**: Create `Downloads/CATEGORIES` folder and add images
2. **Authenticate**: Choose token or email/password method
3. **Run**: Execute PowerShell or Node.js script with auth
4. **Monitor**: Watch progress and confirm uploads
5. **Verify**: Check results file and admin panel

That's it! Your category images are now uploaded to S3 and ready to use! 🎉
