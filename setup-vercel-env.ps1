# PowerShell script to add Vercel environment variables
# Run this from the carmella directory

Write-Host "🚀 Setting up Vercel Environment Variables..." -ForegroundColor Green
Write-Host ""

# Change to frontend directory
Set-Location -Path "frontend"

# Environment variables to add
$envVars = @{
    "VITE_SUPABASE_URL" = "https://wrfagwidnhxrafemqwkq.supabase.co"
    "VITE_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZmFnd2lkbmh4cmFmZW1xd2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTc2ODgsImV4cCI6MjA4NDIzMzY4OH0.NFxtALeuXfhFnRh7ZK-lmWbmbCbdaaSQkE9K8pcktD8"
    "VITE_GOOGLE_CLIENT_ID" = "477250176734"
    "VITE_CLOUDINARY_CLOUD_NAME" = "dwis8ote1"
    "VITE_CLOUDINARY_UPLOAD_PRESET" = "carmella_products"
    "VITE_API_URL" = "http://localhost:5000/api"
}

foreach ($key in $envVars.Keys) {
    Write-Host "Adding $key..." -ForegroundColor Yellow
    $value = $envVars[$key]
    
    # Use echo to pipe value to vercel env add
    $value | vercel env add $key production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $key added successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to add $key" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "✅ All environment variables processed!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Update VITE_API_URL after deploying backend" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next: Redeploy with 'vercel --prod'" -ForegroundColor Cyan
