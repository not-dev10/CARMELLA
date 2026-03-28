# Product Image Management Setup

## Overview

The Carmella product admin panel now has a **multi-image upload system** with:
- 🖼️ Cloudinary integration for reliable image hosting
- 🎯 Drag-and-drop reordering interface
- 📸 Support for up to 5 images per product
- ✨ Auto-featured image (first image is primary)
- 🎨 Thumbnail previews with edit/delete controls
- 📱 Responsive image gallery on product pages

## Quick Setup

### 1. Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Go to **Dashboard** and note your **Cloud Name**

### 2. Create Upload Preset
1. In Cloudinary dashboard, go to **Settings** → **Upload**
2. Click **"Add upload preset"**
3. Configure:
   - **Name**: `carmella_products` (or your choice)
   - **Mode**: Select **"Unsigned"** (important for frontend uploads)
   - **Folder**: `products` (optional, for organization)
   - **Save**: Click **Save**
4. Copy the **Upload Preset** name

### 3. Configure Frontend Environment
Update `frontend/.env.local`:
```env
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset-name
```

## How to Use

### In Admin Panel

1. **Navigate to Products section** in admin panel
2. **Click "Add Product"** or **Edit** an existing product
3. **Scroll to "Product Images"** section
4. **Upload images** by:
   - Dragging files onto the upload area, OR
   - Clicking the upload area to select files
5. **Reorder images** by dragging the 🔲 grip handle
6. **Remove images** by clicking the ❌ button
7. **First image is always featured** (appears on product listings)
8. **Save Product** - all images are automatically included

### Features
- **Max 5 images per product**
- **Drag to reorder** - drag anywhere on the image card
- **Individual image delete** - click X button
- **Image preview** - see thumbnails before saving
- **Auto-sync** - first image becomes `image_url` field
- **All images stored** in `gallery_urls` array

## Database Schema

The `products` table supports multiple images:

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  -- ... other fields ...
  image_url TEXT,              -- Primary/featured image
  gallery_urls TEXT[] DEFAULT '{}',  -- All images (ordered)
  -- ... other fields ...
);
```

## Product Detail Page Display

The product page automatically displays:

1. **Main Image Viewer** (full-screen aspect)
   - Left/Right arrows to navigate
   - Dot indicators at bottom
   
2. **Image Thumbnails** (4-column grid below)
   - Click any thumbnail to jump to that image
   - Highlighted border for current image

3. **Image Indicators**
   - Animated dots show current position
   - Click dot to jump to image

## API Integration

When creating/updating products via the admin API:

```typescript
const productData = {
  name: "Ceramic Vase",
  base_price: 49.99,
  image_url: "first-image-url",      // Featured image (auto-set)
  gallery_urls: [                     // All images in order
    "image-1.jpg",
    "image-2.jpg",
    "image-3.jpg"
  ],
  // ... other fields ...
}
```

## Troubleshooting

### Images not uploading?
- Check `VITE_CLOUDINARY_CLOUD_NAME` in .env
- Check `VITE_CLOUDINARY_UPLOAD_PRESET` is unsigned
- Check browser console for specific error

### Images not showing on product page?
- Ensure `gallery_urls` was saved to database
- Check image URLs are publicly accessible
- Verify Cloudinary CDN is not region-blocked

### Max images exceeded?
- The component limits to 5 images per product
- Delete an image to add a new one

## Limitations & Future Improvements

**Current:**
- Max 5 images per product (configurable in ImageManager)
- Unsigned uploads only (no auth required)
- Manual ordering via drag-drop

**Future Enhancements:**
- Crop/edit images before upload
- Image compression for faster loading
- Bulk image upload for multiple products
- AI-powered alt text generation
- Image variations (colors, sizes)

## File References

- **Component**: `frontend/src/components/admin/image-manager.tsx`
- **Products Section**: `frontend/src/components/admin/products-section.tsx`
- **Product Detail**: `frontend/src/pages/ProductDetail.tsx`
- **Environment**: `frontend/.env.example`

---

For questions or issues, check the admin panel console for errors or contact support.
