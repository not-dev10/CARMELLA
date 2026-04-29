#!/bin/bash

# Apply S3 CORS Configuration
# This script updates your S3 bucket to allow uploads from your frontend

BUCKET_NAME="carmella-bucket"
REGION="eu-north-1"

echo "🔧 Applying S3 CORS Configuration"
echo "===================================="
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Apply CORS configuration
echo "📝 Applying CORS rules..."
aws s3api put-bucket-cors \
  --bucket "$BUCKET_NAME" \
  --cors-configuration file://s3-cors.json \
  --region "$REGION"

if [ $? -eq 0 ]; then
    echo "✅ CORS configuration applied successfully!"
    echo ""
    echo "🔍 Verifying configuration..."
    aws s3api get-bucket-cors \
      --bucket "$BUCKET_NAME" \
      --region "$REGION"
else
    echo "❌ Failed to apply CORS configuration"
    echo "Make sure your AWS credentials are configured"
    exit 1
fi

echo ""
echo "✨ Done! Your S3 bucket now allows uploads from:"
echo "  - http://localhost:5173"
echo "  - http://localhost:3000"
echo "  - https://carmella-mu.vercel.app"
echo "  - https://carmellawholesale.uk"
echo "  - https://www.carmellawholesale.uk"
