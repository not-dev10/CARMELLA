# Cloudinary CLI Setup Guide

## Quick Setup (Automated)

Run the setup script to automatically configure Cloudinary:

```bash
node setup-cloudinary.js
```

The script will:
1. Prompt for your Cloudinary credentials
2. Create an unsigned upload preset
3. Update all .env files automatically

## Manual Setup (Using Cloudinary CLI)

### Step 1: Install Cloudinary CLI

```bash
npm install -g cloudinary-cli
```

### Step 2: Login to Cloudinary

```bash
cloudinary config
```

This will prompt you for:
- Cloud Name
- API Key
- API Secret

Get these from: https://cloudinary.com/console

### Step 3: Create Upload Preset

```bash
cloudinary admin create_upload_preset carmella_products unsigned=true folder=carmella/products
```

This creates an unsigned upload preset named `carmella_products`.

### Step 4: Verify Configuration

```bash
# Check your config
cloudinary config

# List upload presets
cloudinary admin upload_presets
```

### Step 5: Update Environment Files

#### Backend (.env)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env and .env.local)
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=carmella_products
```

### Step 6: Test Upload

```bash
# Test upload from CLI
cloudinary uploader upload test-image.jpg upload_preset=carmella_products
```

## Useful Cloudinary CLI Commands

```bash
# Show current configuration
cloudinary config

# List all upload presets
cloudinary admin upload_presets

# Get details of a specific preset
cloudinary admin upload_preset carmella_products

# Upload a test image
cloudinary uploader upload image.jpg upload_preset=carmella_products

# List uploaded images
cloudinary admin resources

# Delete an image
cloudinary admin delete_resources public_id1 public_id2
```

## Troubleshooting

### "Command not found: cloudinary"

**Solution:**
```bash
# Reinstall globally
npm install -g cloudinary-cli

# Or use npx
npx cloudinary-cli config
```

### "Unauthorized" Error

**Solution:**
1. Verify your API credentials are correct
2. Re-run `cloudinary config` with correct credentials
3. Check https://cloudinary.com/console for your credentials

### Upload Preset Not Found

**Solution:**
```bash
# List all presets
cloudinary admin upload_presets

# Create the preset if missing
cloudinary admin create_upload_preset carmella_products unsigned=true
```

## Alternative: Web Dashboard Setup

If CLI doesn't work, use the web dashboard:

1. Go to https://cloudinary.com/console
2. Settings → Upload → Upload presets
3. Click "Add upload preset"
4. Configure:
   - Name: `carmella_products`
   - Signing Mode: **Unsigned**
   - Folder: `carmella/products`
5. Save
6. Copy the preset name to your .env files

## Production Deployment

For production, set environment variables in your hosting platform:

### Vercel/Netlify (Frontend)
```
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=carmella_products
```

### Railway/Render (Backend)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Security Notes

- ✅ Upload preset MUST be "Unsigned" for frontend uploads
- ✅ Never commit .env files to git
- ✅ Use different presets for dev/staging/production
- ✅ Set folder restrictions in preset settings
- ✅ Enable file size limits in preset

## Resources

- Cloudinary CLI Docs: https://cloudinary.com/documentation/cloudinary_cli
- Upload Presets: https://cloudinary.com/documentation/upload_presets
- Unsigned Uploads: https://cloudinary.com/documentation/upload_images#unsigned_upload

---

**Need Help?** Check the browser console for detailed error messages when testing uploads.
