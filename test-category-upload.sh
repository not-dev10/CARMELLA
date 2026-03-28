#!/bin/bash

echo "🧪 Carmella Category Upload Test"
echo "================================"
echo ""

# Check if .env file exists
if [ ! -f "frontend/.env" ]; then
    echo "❌ Error: frontend/.env file not found"
    exit 1
fi

# Read Cloudinary config
CLOUD_NAME=$(grep VITE_CLOUDINARY_CLOUD_NAME frontend/.env | cut -d '=' -f2)
UPLOAD_PRESET=$(grep VITE_CLOUDINARY_UPLOAD_PRESET frontend/.env | cut -d '=' -f2)

echo "📋 Configuration Check:"
echo "----------------------"
if [ -z "$CLOUD_NAME" ]; then
    echo "❌ VITE_CLOUDINARY_CLOUD_NAME: NOT SET"
else
    echo "✅ VITE_CLOUDINARY_CLOUD_NAME: $CLOUD_NAME"
fi

if [ -z "$UPLOAD_PRESET" ]; then
    echo "❌ VITE_CLOUDINARY_UPLOAD_PRESET: NOT SET"
else
    echo "✅ VITE_CLOUDINARY_UPLOAD_PRESET: $UPLOAD_PRESET"
fi

echo ""
echo "🔍 Testing Cloudinary API:"
echo "-------------------------"

# Test if Cloudinary API is reachable
UPLOAD_URL="https://api.cloudinary.com/v1_1/$CLOUD_NAME/image/upload"
echo "Testing URL: $UPLOAD_URL"

# Try to reach Cloudinary (this will fail without a file, but confirms connectivity)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$UPLOAD_URL")

if [ "$HTTP_CODE" == "400" ]; then
    echo "✅ Cloudinary API is reachable (400 = missing file, which is expected)"
elif [ "$HTTP_CODE" == "000" ]; then
    echo "❌ Cannot reach Cloudinary API (network issue?)"
else
    echo "⚠️  Unexpected response code: $HTTP_CODE"
fi

echo ""
echo "📝 Next Steps:"
echo "-------------"
echo "1. Restart frontend server:"
echo "   cd frontend && npm run dev"
echo ""
echo "2. Open test page in browser:"
echo "   open test-cloudinary-frontend.html"
echo ""
echo "3. Or test in admin panel:"
echo "   http://localhost:5173/admin"
echo ""
echo "4. Check browser console for detailed logs"
