# Hero Section Image Management Implementation

## Overview
Implemented a complete hero section image management system that allows admins to upload and manage separate images for desktop and mobile views via the admin panel. Images are stored on S3 and delivered through CDN.

## Files Created

### 1. **Frontend: Hero Section Editor Component**
**File**: `frontend/src/components/admin/hero-section-editor.tsx`

A comprehensive component that includes:
- **Drag-and-drop image upload** for both desktop and mobile images
- **S3 integration** using signed URLs for secure uploads
- **Separate image management**:
  - Desktop image (1920x1080 recommended)
  - Mobile image (540x720 recommended)
- **Text editing fields**:
  - Hero title
  - Hero subtitle
- **Real-time preview** of uploaded images
- **Image removal and change functionality**
- **Save handler** that sends data to backend

### 2. **Frontend: Admin Panel Updates**
**File**: `frontend/src/pages/Admin.tsx`

Updates include:
- Imported `HeroSectionEditor` component
- Added hero data state management
- Created `/admin?tab=content` route that uses the new HeroSectionEditor
- Integrated S3 upload with Supabase authentication
- Connected save functionality to backend API endpoint: `/homepage/content/hero`
- Added responsive design info card

### 3. **Frontend: Hero Section Component Updates**
**File**: `frontend/src/components/sections/hero.tsx`

Changes:
- Fetches hero content from backend (`/homepage/content/hero`)
- Dynamically displays hero title and subtitle from backend
- **Responsive image switching**:
  - Desktop view (≥1024px): Shows desktop image
  - Mobile view (<1024px): Shows mobile image
- Smooth image transitions with Ken Burns effect
- Fallback to default content if API call fails
- View indicator badge (📱/🖥️) for debugging

## Backend Integration

### Endpoint Used
- **Route**: `PUT /homepage/content/hero`
- **Authentication**: Requires admin middleware + auth middleware
- **Endpoint Handler**: Uses existing `updateSection` from homepageController
- **Database**: Stores in `admin_content` table with `section_name = "hero"`

### Data Structure
```json
{
  "content": {
    "title": "Artistry in Every Detail",
    "subtitle": "Handcrafted ceramics...",
    "desktopImage": "https://s3.amazonaws.com/...",
    "mobileImage": "https://s3.amazonaws.com/...",
    "updatedAt": "2026-04-30T..."
  }
}
```

## Features

### ✅ Desktop & Mobile Image Support
- Separate uploads for each device type
- Automatic switching based on viewport width
- Optimized dimensions recommended for each

### ✅ S3 Upload Integration
- Signed URLs for secure upload
- File validation (type and size)
- Error handling and user feedback

### ✅ Admin Panel Interface
- Clean, modern UI with side-by-side uploads
- Image preview with change/remove options
- Success/error messages
- Responsive layout

### ✅ Content Management
- Edit hero title and subtitle from admin panel
- No code changes required
- Changes go live immediately

### ✅ Responsive Delivery
- Images are served from S3 CDN
- Automatic selection based on device/viewport
- Fallback to default images if upload fails

## How to Use

### Admin Usage (Upload Images)
1. Go to `/admin` panel
2. Click "Homepage Content" in sidebar
3. In the Hero Section Editor:
   - Enter hero title and subtitle
   - Upload desktop image (drag/drop or click)
   - Upload mobile image (drag/drop or click)
   - Click "Save Hero Section"
4. Changes appear live on homepage within seconds

### Frontend Display
- Homepage automatically displays appropriate image based on device
- Images are optimized with S3 CDN
- Smooth transitions and professional animations

## Image Recommendations

### Desktop Image
- **Resolution**: 1920x1080 or larger
- **Aspect Ratio**: 16:9
- **Format**: JPG, PNG, or WebP
- **Max Size**: 10MB

### Mobile Image
- **Resolution**: 540x720 or larger
- **Aspect Ratio**: 3:4
- **Format**: JPG, PNG, or WebP
- **Max Size**: 10MB

## Technical Details

### Security
- S3 signed URLs prevent direct access
- Supabase authentication required for uploads
- Admin middleware protects backend endpoint
- File type validation on frontend

### Performance
- Images served via S3 CDN
- Client-side image preview
- Responsive image switching with no full page reload
- Lazy loading support in Image component

### Error Handling
- Validation for file type and size
- Error messages for upload failures
- Graceful fallback to defaults
- Console logging for debugging

## Database Schema
Uses existing `admin_content` table:
```sql
admin_content {
  id: UUID
  section_name: "hero"
  content: JSONB (contains title, subtitle, desktopImage, mobileImage)
  updated_by: UUID
  updated_at: timestamp
}
```

## Testing Checklist
- [ ] Upload desktop image via admin panel
- [ ] Upload mobile image via admin panel
- [ ] Edit hero title and subtitle
- [ ] Click Save and verify success message
- [ ] Visit homepage and see desktop image on desktop
- [ ] Resize to mobile and see mobile image
- [ ] Verify images load from S3 CDN
- [ ] Check console for any errors
- [ ] Test image preview in admin panel
- [ ] Test drag-and-drop functionality

## Future Enhancements
- Add image cropping tool
- Support for multiple hero slide variations
- A/B testing different hero images
- Hero image analytics
- Video background support
- Animation customization options
