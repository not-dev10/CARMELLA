#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this from the carmella/frontend directory

echo "🚀 Setting up Vercel Environment Variables..."
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit

# Add environment variables
echo "Adding VITE_SUPABASE_URL..."
echo "https://wrfagwidnhxrafemqwkq.supabase.co" | vercel env add VITE_SUPABASE_URL production

echo "Adding VITE_SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZmFnd2lkbmh4cmFmZW1xd2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTc2ODgsImV4cCI6MjA4NDIzMzY4OH0.NFxtALeuXfhFnRh7ZK-lmWbmbCbdaaSQkE9K8pcktD8" | vercel env add VITE_SUPABASE_ANON_KEY production

echo "Adding VITE_GOOGLE_CLIENT_ID..."
echo "477250176734" | vercel env add VITE_GOOGLE_CLIENT_ID production

echo "Adding VITE_CLOUDINARY_CLOUD_NAME..."
echo "dwis8ote1" | vercel env add VITE_CLOUDINARY_CLOUD_NAME production

echo "Adding VITE_CLOUDINARY_UPLOAD_PRESET..."
echo "carmella_products" | vercel env add VITE_CLOUDINARY_UPLOAD_PRESET production

echo "Adding VITE_API_URL..."
echo "http://localhost:5000/api" | vercel env add VITE_API_URL production

echo ""
echo "✅ All environment variables added!"
echo ""
echo "⚠️  IMPORTANT: You need to update VITE_API_URL with your deployed backend URL"
echo ""
echo "Next steps:"
echo "1. Deploy your backend"
echo "2. Update VITE_API_URL with: vercel env rm VITE_API_URL production"
echo "3. Then add it again with the correct URL"
echo "4. Redeploy: vercel --prod"
