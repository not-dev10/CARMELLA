# ⚡ QUICK START - Category Upload in 2 Minutes

## Step 1️⃣: Prepare Your Images (1 minute)

Create this folder on your computer:
```
C:\Users\[YourUsername]\Downloads\CATEGORIES
```

Put all your category images here. Supported formats:
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`

## Step 2️⃣: Open PowerShell

Press `Win + R` and type:
```
powershell
```

Then press Enter.

## Step 3️⃣: Navigate to Your Project

```powershell
cd "C:\Users\[YourUsername]\OneDrive\Desktop\New folder\carmella"
```

## Step 4️⃣: Run Upload (Choose One)

### Option A: Using Email/Password (EASIEST)
```powershell
.\bulk-upload-categories.ps1 -Email "admin@example.com" -Password "yourpassword"
```

### Option B: Using JWT Token
```powershell
.\bulk-upload-categories.ps1 -Token "your_jwt_token_here"
```

## Step 5️⃣: Watch the Magic ✨

Script will show:
- 📸 How many images found
- ⬆️ Upload progress for each
- ✅ Success count
- 📍 Public S3 URLs for each image

## That's It! 🎉

Your images are now uploaded to your website!

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Command not recognized" | Make sure you're in the right folder |
| "No images found" | Check folder path is exactly: `C:\Users\[YourUsername]\Downloads\CATEGORIES` |
| "Login failed" | Verify email/password are correct |
| "No token provided" | Add `-Email "..."` and `-Password "..."` |

## Need the Detailed Guide?

See: `BULK_CATEGORY_UPLOAD_GUIDE.md` for full documentation.

## Passwords Appear in Terminal?

Don't worry! The PowerShell script doesn't show passwords in the output.

---

**Questions? Check the full guide or the console output - it explains errors clearly!**
