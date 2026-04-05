# AWS S3 Migration Guide - Cloudinary to S3

## Overview

This guide documents the migration from Cloudinary to AWS S3 for image storage in the Carmella platform. All image uploads are now handled through AWS S3 with backend-generated signed URLs.

---

## Architecture Changes

### Before (Cloudinary)
- Frontend directly uploads to Cloudinary using unsigned preset
- Images stored on Cloudinary CDN
- Image deletion via Cloudinary Admin API

### After (AWS S3)
- Frontend requests signed upload URL from backend (`/api/upload/get-signed-url`)
- Backend generates temporary signed S3 URL (60 minutes expiry)
- Frontend uploads directly to S3 using signed URL
- Public URLs returned from S3 bucket
- Image deletion via AWS S3 SDK

---

## Setup Instructions

### 1. Create AWS S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://carmella-images --region us-east-1

# Configure bucket CORS
cat > cors.json << 'EOF'
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
EOF

aws s3api put-bucket-cors --bucket carmella-images --cors-configuration file://cors.json

# Make bucket publicly readable
cat > policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::carmella-images/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket carmella-images --policy file://policy.json
```

### 2. Create IAM User with S3 Permissions

```bash
# Create user for backend
aws iam create-user --user-name carmella-s3-user

# Create programmatic access keys
aws iam create-access-key --user-name carmella-s3-user

# Attach S3 permissions (full access to carmella-images bucket)
cat > s3-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::carmella-images/*",
        "arn:aws:s3:::carmella-images"
      ]
    }
  ]
}
EOF

aws iam put-user-policy --user-name carmella-s3-user --policy-name S3Access --policy-document file://s3-policy.json
```

### 3. Configure Environment Variables

#### Backend (.env)
```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your-key-id...
AWS_SECRET_ACCESS_KEY=...your-secret-key...
AWS_S3_BUCKET_NAME=carmella-images
```

#### Frontend (.env)
```env
# S3 is handled via backend - no frontend configuration needed
VITE_API_URL=http://localhost:5000/api
```

#### Vercel Deployment
Set in Vercel Dashboard → Project Settings → Environment Variables:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install @aws-sdk/client-s3
npm install
npm run build
```

---

## API Endpoints

### Get Signed Upload URL

**Endpoint:** `POST /api/upload/get-signed-url`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "filename": "product-image.jpg",
  "fileType": "product"  // or "category"
}
```

**Response:**
```json
{
  "signedUrl": "https://carmella-images.s3.us-east-1.amazonaws.com/carmella/products/1234567890-abc123.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
  "publicUrl": "https://carmella-images.s3.us-east-1.amazonaws.com/carmella/products/1234567890-abc123.jpg",
  "key": "carmella/products/1234567890-abc123.jpg"
}
```

### Upload to S3

The frontend uses the `signedUrl` to upload directly:

```javascript
fetch(signedUrl, {
  method: "PUT",
  body: file,
  headers: {
    "Content-Type": file.type || "image/jpeg",
  }
})
```

---

## File Structure

New S3 objects are organized in the bucket:

```
s3://carmella-images/
├── carmella/
│   ├── products/
│   │   ├── 1234567890-abc123.jpg
│   │   ├── 1234567891-def456.jpg
│   │
│   └── category/
│       ├── 1234567892-ghi789.jpg
```

**Naming Convention:** `{timestamp}-{randomHex}.{ext}`

---

## Image Deletion

### Backend Cleanup (Automatic)

When a product or category is deleted:

```typescript
// Product deletion automatically deletes all images
deleteProduct() → deleteMultipleFromS3(imageUrls)

// Category deletion automatically deletes image
deleteCategory() → deleteFromS3(imageUrl)
```

### Manual Deletion (if needed)

```typescript
import { deleteFromS3 } from "../utils/s3.js"

// Delete single image
await deleteFromS3("https://carmella-images.s3.us-east-1.amazonaws.com/carmella/products/123.jpg")

// Delete multiple images
await deleteMultipleFromS3([ "url1", "url2", "url3" ])
```

---

## Frontend Upload Flow

The image manager component in `frontend/src/components/admin/image-manager.tsx` handles:

1. **File Selection** - User selects/drags images
2. **Validation** - Check file type, size (max 10MB)
3. **Get Signed URL** - Call `/api/upload/get-signed-url`
4. **Upload to S3** - PUT request with signed URL
5. **Store URL** - Save returned `publicUrl` to database

---

## Removed Files

The following Cloudinary-related files can be kept for reference but are no longer used:

- `backend/src/utils/cloudinary.ts` - Original Cloudinary utilities (archived)
- `setup-cloudinary.js` - Cloudinary setup script
- `test-cloudinary.js` - Cloudinary test script
- `test-cloudinary-setup.html` - Cloudinary test page

---

## Migration Checklist

- [x] Create AWS S3 bucket
- [x] Configure IAM user and access keys
- [x] Update backend config
- [x] Create S3 utilities (`backend/src/utils/s3.ts`)
- [x] Update controllers (product, category)
- [x] Create upload endpoints (`POST /api/upload/get-signed-url`)
- [x] Update frontend image manager component
- [x] Update environment variables (.env files)
- [x] Update package.json (add @aws-sdk/client-s3)
- [ ] Test uploads locally
- [ ] Test deletion functionality
- [ ] Deploy to staging
- [ ] Verify production deployment
- [ ] Monitor S3 costs

---

## Troubleshooting

### Issue: "Missing AWS credentials"
**Solution:** Verify all AWS_* environment variables are set correctly
```bash
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $AWS_S3_BUCKET_NAME
```

### Issue: "Upload fails with 403 Forbidden"
**Solution:** Check S3 bucket CORS configuration and ensure bucket policy allows public reads

### Issue: "Cannot access uploaded image"
**Solution:** Verify bucket policy includes `s3:GetObject` permission for all users

### Issue: "Signed URL expires too quickly"
**Solution:** Default is 60 minutes (3600 seconds). Adjust in `backend/src/utils/s3.ts` line: `expiresIn: 3600`

---

## Performance Optimization

### S3 Features Enabled
- **Bucket versioning:** Not required (can be enabled for safety)
- **Server-side encryption:** Optional (AES-256 default)
- **Object lifecycle:** Could delete old versions after 30 days

### Frontend Optimization
- Images are displayed with `object-cover` for consistent sizing
- Max 5 images per product (configurable)
- Sequential uploads to prevent race conditions
- Client-side validation before upload

---

## Cost Estimation

### AWS S3 Pricing (us-east-1, as of 2024)
- **Storage:** $0.023 per GB/month
- **Upload requests:** $0.005 per 1,000 requests
- **Download requests:** $0.0004 per 1,000 requests
- **Data transfer out:** $0.09 per GB (to internet)
- **Data transfer in:** Free

### Estimate (1000 products × 5 images)
- 50,000 images × 2MB average = 100 GB
- Monthly cost: ~$2.50 storage + request costs

---

## References

- [AWS S3 SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/BestPractices.html)

---

## Support

For issues or questions about S3 migration:
1. Check console logs for detailed error messages
2. Review AWS CloudWatch logs
3. Verify IAM permissions
4. Test with AWS CLI: `aws s3 ls s3://carmella-images/`
