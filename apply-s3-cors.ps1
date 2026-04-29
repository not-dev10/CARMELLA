param(
    [string]$BucketName = "carmella-bucket",
    [string]$Region = "eu-north-1"
)

Write-Host ""
Write-Host "Apply S3 CORS Configuration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Gray
Write-Host "Bucket: $BucketName" -ForegroundColor Gray
Write-Host "Region: $Region" -ForegroundColor Gray
Write-Host ""

# Check if AWS CLI is installed
$aws = Get-Command aws -ErrorAction SilentlyContinue
if (-not $aws) {
    Write-Host "Error: AWS CLI is not installed" -ForegroundColor Red
    Write-Host "Install it from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Applying CORS rules..." -ForegroundColor Yellow

# Apply CORS configuration
$corsConfig = Get-Content -Path "s3-cors.json" -Raw
aws s3api put-bucket-cors `
    --bucket $BucketName `
    --cors-configuration $corsConfig `
    --region $Region

if ($LASTEXITCODE -eq 0) {
    Write-Host "CORS configuration applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifying configuration..." -ForegroundColor Yellow
    aws s3api get-bucket-cors `
        --bucket $BucketName `
        --region $Region | ConvertFrom-Json | ConvertTo-Json -Depth 10
} else {
    Write-Host "Failed to apply CORS configuration" -ForegroundColor Red
    Write-Host "Make sure your AWS credentials are configured" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Done! Your S3 bucket now allows uploads from:" -ForegroundColor Green
Write-Host "  - http://localhost:5173" -ForegroundColor Gray
Write-Host "  - http://localhost:3000" -ForegroundColor Gray
Write-Host "  - https://carmella-mu.vercel.app" -ForegroundColor Gray
Write-Host "  - https://carmellawholesale.uk" -ForegroundColor Gray
Write-Host "  - https://www.carmellawholesale.uk" -ForegroundColor Gray
Write-Host ""
