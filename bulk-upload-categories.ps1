# Bulk Category Image Upload Script (PowerShell)
#
# Uploads all images from Downloads/CATEGORIES folder to S3 via API
#
# Usage:
#   .\bulk-upload-categories.ps1 -Token "jwt_token_here"
#   .\bulk-upload-categories.ps1 -Email "admin@example.com" -Password "password"
#
# Examples:
#   .\bulk-upload-categories.ps1 -Token "eyJhbGciOiJIUzI1NiI..."
#   .\bulk-upload-categories.ps1 -Email admin@example.com -Password mypassword

param(
    [string]$Token,
    [string]$Email,
    [string]$Password,
    [switch]$Local
)

# Configuration
$DownloadsFolder = Join-Path $env:USERPROFILE "Downloads" "CATEGORIES"
$ApiBaseUrl = "https://api.carmellawholesale.uk/api"
$ApiUrl = if ($Local) { "http://localhost:5000/api" } else { $ApiBaseUrl }
$SupportedFormats = @('.jpg', '.jpeg', '.png', '.gif', '.webp')

Write-Host "`n📦 Carmella Bulk Category Upload`n" -ForegroundColor Cyan
Write-Host "API URL: $ApiUrl" -ForegroundColor Gray
Write-Host "Source: $DownloadsFolder`n" -ForegroundColor Gray

# Check if Categories folder exists
if (-not (Test-Path $DownloadsFolder)) {
    Write-Host "❌ Error: Categories folder not found at $DownloadsFolder" -ForegroundColor Red
    Write-Host "Please create the folder and add your category images." -ForegroundColor Red
    exit 1
}

# Login function
function Login-User {
    param([string]$Email, [string]$Password)
    
    try {
        Write-Host "🔐 Logging in as $Email..." -ForegroundColor Yellow
        
        $body = @{
            email = $Email
            password = $Password
        } | ConvertTo-Json

        $response = Invoke-WebRequest `
            -Uri "$ApiUrl/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -UseBasicParsing

        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            Write-Host "✅ Login successful" -ForegroundColor Green
            if ($data.token) { return $data.token } else { return $data.access_token }
        }
        else {
            throw "Login failed"
        }
    }
    catch {
        Write-Host "❌ Login error: $_" -ForegroundColor Red
        exit 1
    }
}

# Get presigned URL function
function Get-PresignedUrl {
    param([string]$Filename, [string]$AuthToken)
    
    try {
        $body = @{
            filename = $Filename
            fileType = "category"
        } | ConvertTo-Json

        $headers = @{
            "Authorization" = "Bearer $AuthToken"
            "Content-Type" = "application/json"
        }

        $response = Invoke-WebRequest `
            -Uri "$ApiUrl/upload/get-signed-url" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -UseBasicParsing

        if ($response.StatusCode -eq 200) {
            return $response.Content | ConvertFrom-Json
        }
        else {
            throw "Failed to get signed URL"
        }
    }
    catch {
        Write-Host "❌ Error getting signed URL for $Filename : $_" -ForegroundColor Red
        return $null
    }
}

# Upload to S3 function
function Upload-ToS3 {
    param([string]$FilePath, [string]$SignedUrl)
    
    try {
        $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
        $contentType = Get-ContentType $FilePath

        $response = Invoke-WebRequest `
            -Uri $SignedUrl `
            -Method PUT `
            -Headers @{ "Content-Type" = $contentType } `
            -Body $fileBytes `
            -UseBasicParsing

        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 204) {
            return $true
        }
        else {
            Write-Host "❌ Upload failed: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error uploading to S3: $_" -ForegroundColor Red
        return $false
    }
}

# Get content type
function Get-ContentType {
    param([string]$FilePath)
    
    $ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $types = @{
        '.jpg' = 'image/jpeg'
        '.jpeg' = 'image/jpeg'
        '.png' = 'image/png'
        '.gif' = 'image/gif'
        '.webp' = 'image/webp'
    }
    
    if ($types[$ext]) { return $types[$ext] } else { return 'application/octet-stream' }
}

# Validate authentication
if (-not $Token) {
    if ($Email -and $Password) {
        $Token = Login-User -Email $Email -Password $Password
    }
    else {
        Write-Host "❌ Error: No authentication provided`n" -ForegroundColor Red
        Write-Host "Usage:" -ForegroundColor Yellow
        Write-Host "  .\bulk-upload-categories.ps1 -Token `"jwt_token`"" -ForegroundColor Gray
        Write-Host "  .\bulk-upload-categories.ps1 -Email `"email`" -Password `"password`""  -ForegroundColor Gray
        Write-Host ""
        Write-Host "Example:" -ForegroundColor Yellow
        Write-Host '  .\bulk-upload-categories.ps1 -Token "eyJhbGciOiJIUzI1NiI..."' -ForegroundColor Gray
        exit 1
    }
}

# Get image files
$files = Get-ChildItem -Path $DownloadsFolder -File
$imageFiles = $files | Where-Object { $SupportedFormats -contains $_.Extension.ToLower() }

if ($imageFiles.Count -eq 0) {
    Write-Host "❌ No image files found in $DownloadsFolder" -ForegroundColor Red
    Write-Host "Supported formats: $($SupportedFormats -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "📸 Found $($imageFiles.Count) image(s) to upload:`n" -ForegroundColor Cyan
$imageFiles | ForEach-Object -Begin { $i = 1 } -Process { 
    Write-Host "  $i. $($_.Name)" -ForegroundColor Gray
    $i++
}
Write-Host ""

# Upload files
$successCount = 0
$failureCount = 0
$uploadedUrls = @()

for ($i = 0; $i -lt $imageFiles.Count; $i++) {
    $file = $imageFiles[$i]
    $filePath = $file.FullName
    $filename = $file.Name
    $fileSizeMB = [math]::Round($file.Length / 1MB, 2)

    Write-Host ("`n[" + ($i + 1) + "/" + $imageFiles.Count + "] Uploading: " + $filename + " (" + $fileSizeMB + " MB)") -ForegroundColor Cyan
    
    # Get presigned URL
    Write-Host "  Getting presigned URL..." -ForegroundColor Gray
    $urlData = Get-PresignedUrl -Filename $filename -AuthToken $Token

    if (-not $urlData -or -not $urlData.signedUrl) {
        Write-Host "  ❌ Failed to get presigned URL" -ForegroundColor Red
        $failureCount++
        continue
    }

    # Upload to S3
    Write-Host "  Uploading to S3..." -ForegroundColor Gray
    $uploadSuccess = Upload-ToS3 -FilePath $filePath -SignedUrl $urlData.signedUrl

    if ($uploadSuccess) {
        Write-Host "  [OK] Upload successful" -ForegroundColor Green
        Write-Host "  [URL] Public URL: $($urlData.publicUrl)" -ForegroundColor Green
        
        $uploadedUrls += @{
            filename = $filename
            publicUrl = $urlData.publicUrl
            s3Key = $urlData.key
        }
        
        $successCount++
    }
    else {
        Write-Host "  [FAILED] Upload failed" -ForegroundColor Red
        $failureCount++
    }

    # Add delay between uploads
    if ($i -lt $imageFiles.Count - 1) {
        Start-Sleep -Milliseconds 500
    }
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "[SUMMARY] Upload Results" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "[SUCCESS] Successful: $successCount" -ForegroundColor Green
Write-Host "[FAILED] Failed: $failureCount" -ForegroundColor $(if ($failureCount -gt 0) { "Red" } else { "Gray" })
Write-Host "[TOTAL] Total: $($imageFiles.Count)" -ForegroundColor Gray
Write-Host ("=" * 60) -ForegroundColor Gray

# Save results
if ($uploadedUrls.Count -gt 0) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd")
    $resultsFile = Join-Path $PWD "upload-results-$timestamp.json"
    $uploadedUrls | ConvertTo-Json -Depth 10 | Set-Content $resultsFile
    Write-Host ("`n[SAVED] Results saved to: " + $resultsFile + "`n") -ForegroundColor Green
}

exit $(if ($failureCount -gt 0) { 1 } else { 0 })
