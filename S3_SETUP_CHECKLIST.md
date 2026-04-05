# 🚀 S3 Migration - Action Items & Next Steps

## ✅ Completed

All code changes have been made:
- ✅ Backend configuration updated for AWS S3
- ✅ S3 utility functions created
- ✅ Upload endpoints implemented
- ✅ Controllers updated for S3 deletion
- ✅ Frontend image manager refactored
- ✅ Environment variables updated
- ✅ Dependencies added to package.json
- ✅ Documentation created

---

## 🔄 TODO - Immediate Actions Required

### 1. Install Dependencies (5 minutes)

```bash
# Terminal 1
cd backend
npm install

# Terminal 2
cd frontend  
npm install
```

### 2. Create AWS Account & S3 Bucket (10 minutes)

**Create AWS Account** (if not already done)
- Go to https://aws.amazon.com
- Sign up or log in

**Create S3 Bucket** (via AWS Console or CLI):

```bash
# Using AWS CLI (easiest)
aws configure  # Enter your AWS Access Key and Secret Key

# Create bucket
aws s3 mb s3://carmella-images --region us-east-1

# Configure CORS (copy the highlighted section below)
```

**If using AWS Console:**
1. Go to https://console.aws.amazon.com/s3
2. Click "Create bucket"
3. Name: `carmella-images`
4. Region: `us-east-1`
5. Uncheck "Block all public access"
6. Create bucket

### 3. Set Up CORS (5 minutes)

```bash
# Save this to cors.json
cat > cors.json << 'EOF'
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:5000",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
EOF

# Apply CORS
aws s3api put-bucket-cors --bucket carmella-images --cors-configuration file://cors.json
```

### 4. Create IAM User & Get Credentials (5 minutes)

```bash
# Create IAM user
aws iam create-user --user-name carmella-s3-user

# Create access keys
aws iam create-access-key --user-name carmella-s3-user
# 👆 Save the Access Key ID and Secret Access Key!

# Create and attach policy (copy highlighted)
```

**If using AWS Console:**
1. Go to https://console.aws.amazon.com/iam
2. Select "Users"
3. Create user: `carmella-s3-user`
4. Click user, go to "Security credentials"
5. Create access key
6. Save both keys securely
7. Go to "Add permissions" → "Attach policies directly"
8. Search for and create custom policy (see below)

**Create S3 Policy:**

```json
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
```

### 5. Configure Backend Environment Variables (2 minutes)

Update `backend/.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...{your-key-from-step-4}
AWS_SECRET_ACCESS_KEY={your-secret-from-step-4}
AWS_S3_BUCKET_NAME=carmella-images
```

**⚠️ CRITICAL:** Never commit AWS credentials to git!

### 6. Make Bucket Public (Readable) (2 minutes)

```bash
# Save this to policy.json
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

# Apply bucket policy
aws s3api put-bucket-policy --bucket carmella-images --policy file://policy.json
```

---

## 🧪 Testing Locally (10 minutes)

### Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Should see: ✅ Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Should see: ✅ Local: http://localhost:5173
```

**Terminal 3 - Monitor AWS (optional):**
```bash
# Watch for uploaded files in S3
aws s3 ls s3://carmella-images/ --recursive --human-readable --summarize
```

### Test Upload Flow

1. Open http://localhost:5173
2. Login to admin panel
3. Go to "Products" or "Categories"
4. Click "Add Image" or drag image
5. **EXPECTED:** 
   - ✅ Image uploads to S3
   - ✅ Image appears in form
   - ✅ Can save product with image

### Verify in S3

```bash
# List uploaded images
aws s3 ls s3://carmella-images/carmella/

# Download and view
aws s3 cp s3://carmella-images/carmella/products/... ./test-image.jpg
```

### Test Deletion

1. Delete the product/category with image
2. **EXPECTED:** Image removed from S3

```bash
# Verify deletion
aws s3 ls s3://carmella-images/carmella/
# Should be empty if you deleted the product
```

---

## 🚢 Deploy to Vercel (5 minutes)

### 1. Update Vercel Environment Variables

1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Select your Carmella project
3. Settings → Environment Variables
4. Add these variables:

```
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = [your-key-from-IAM]
AWS_SECRET_ACCESS_KEY = [your-secret-from-IAM]
AWS_S3_BUCKET_NAME = carmella-images
```

### 2. Update S3 CORS for Production

```bash
# Update cors.json to include production domain
cat > cors.json << 'EOF'
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:5000",
      "https://yourdomain.com",
      "https://your-vercel-domain.vercel.app"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
EOF

# Reapply
aws s3api put-bucket-cors --bucket carmella-images --cors-configuration file://cors.json
```

### 3. Push to Repository

```bash
git add -A
git commit -m "feat: migrate from Cloudinary to AWS S3"
git push
```

Vercel will auto-deploy!

### 4. Verify Deployment

1. Once build completes, test upload at https://your-domain.com
2. Check S3 console for uploaded image
3. Monitor Vercel logs for errors

---

## 📊 Monitoring & Costs

### View Uploaded Images

```bash
# List all images
aws s3 ls s3://carmella-images/carmella/ --recursive

# Get total size
aws s3 ls s3://carmella-images/ --recursive --summarize
```

### Monitor Costs

AWS S3 costs (us-east-1):
- **Storage:** $0.023/GB/month
- **Uploads:** $0.005 per 1,000 requests
- **Downloads:** $0.0004 per 1,000 requests (free within region)

For 1,000 products × 5 images = ~2.5GB stored = ~$0.06/month

---

## ⚠️ Troubleshooting

### Upload Fails with 403 Forbidden
✅ Check bucket policy is applied:
```bash
aws s3api get-bucket-policy --bucket carmella-images
```

### Signed URL Expires Too Quickly
✅ Default is 60 minutes. To increase, edit `backend/src/utils/s3.ts` line:
```typescript
expiresIn: 3600  // Change to 7200 for 2 hours
```

### Cannot See Uploaded Images
✅ Verify CORS configuration:
```bash
aws s3api get-bucket-cors --bucket carmella-images
```

### AWS Credentials Not Working
✅ Verify credentials are correct:
```bash
aws sts get-caller-identity
# Should return your AWS account info
```

### Backend Errors in Logs
✅ Check AWS SDK is installed:
```bash
cd backend && npm list @aws-sdk/client-s3
```

---

## 📝 Documentation References

- **Full Setup:** [S3_MIGRATION_GUIDE.md](./S3_MIGRATION_GUIDE.md)
- **Change Summary:** [S3_MIGRATION_SUMMARY.md](./S3_MIGRATION_SUMMARY.md)
- **AWS Docs:** https://docs.aws.amazon.com/s3/
- **AWS SDK JS:** https://docs.aws.amazon.com/sdk-for-javascript/

---

## ✅ Checklist

Complete these in order:

- [ ] npm install (backend & frontend)
- [ ] Create AWS S3 bucket
- [ ] Configure CORS
- [ ] Create IAM user
- [ ] Get AWS credentials
- [ ] Update backend/.env with credentials
- [ ] Test locally (upload & delete)
- [ ] Deploy to Vercel
- [ ] Add Vercel env vars
- [ ] Update S3 CORS for production domain
- [ ] Test production upload
- [ ] Monitor S3 bucket

---

## 🎯 Timeline

| Task | Time | Status |
|------|------|--------|
| Install dependencies | 5 min | ⬜ TODO |
| Create AWS resources | 15 min | ⬜ TODO |
| Local testing | 10 min | ⬜ TODO |
| Deploy to Vercel | 5 min | ⬜ TODO |
| Verify production | 5 min | ⬜ TODO |
| **Total** | **40 min** | ⬜ TODO |

---

**Migration ready!** Follow the checklist above to complete setup. 🚀
