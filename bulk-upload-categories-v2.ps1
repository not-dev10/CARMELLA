param(
    [string]$Token,
    [string]$Email,
    [string]$Password,
    [switch]$Local
)

$DownloadsFolder = Join-Path -Path $env:USERPROFILE -ChildPath "Downloads" | Join-Path -ChildPath "CATEGORIES"
$ApiUrl = if ($Local) { "http://localhost:5000/api" } else { "https://api.carmellawholesale.uk/api" }
$SupportedFormats = @('.jpg', '.jpeg', '.png', '.gif', '.webp')

Write-Host ""
Write-Host "Package Carmella Bulk Category Upload" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: $ApiUrl" -ForegroundColor Gray
Write-Host "Source: $DownloadsFolder" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $DownloadsFolder)) {
    Write-Host "Error: Categories folder not found at $DownloadsFolder" -ForegroundColor Red
    exit 1
}

function Login-User {
    param([string]$Email, [string]$Password)
    
    Write-Host "Logging in as $Email..." -ForegroundColor Yellow
    
    $body = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest `
            -Uri "$ApiUrl/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -UseBasicParsing
        
        $data = $response.Content | ConvertFrom-Json
        Write-Host "Login successful" -ForegroundColor Green
        
        if ($data.session.access_token) {
            return $data.session.access_token
        } elseif ($data.access_token) {
            return $data.access_token
        } elseif ($data.token) {
            return $data.token
        } else {
            Write-Host "Could not extract token from response" -ForegroundColor Red
            return $null
        }
    }
    catch {
        Write-Host "Login error: $_" -ForegroundColor Red
        exit 1
    }
}

function Get-PresignedUrl {
    param([string]$Filename, [string]$AuthToken)
    
    $body = @{
        filename = $Filename
        fileType = "category"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $AuthToken"
        "Content-Type" = "application/json"
    }

    try {
        $response = Invoke-WebRequest `
            -Uri "$ApiUrl/upload/get-signed-url" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -UseBasicParsing
        
        return $response.Content | ConvertFrom-Json
    }
    catch {
        Write-Host "Error getting signed URL for $Filename : $_" -ForegroundColor Red
        return $null
    }
}

function Upload-ToS3 {
    param([string]$FilePath, [string]$SignedUrl)
    
    try {
        $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
        $ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
        
        $contentTypes = @{
            '.jpg' = 'image/jpeg'
            '.jpeg' = 'image/jpeg'
            '.png' = 'image/png'
            '.gif' = 'image/gif'
            '.webp' = 'image/webp'
        }
        
        $contentType = $contentTypes[$ext]
        if (-not $contentType) { $contentType = 'application/octet-stream' }

        $response = Invoke-WebRequest `
            -Uri $SignedUrl `
            -Method PUT `
            -Headers @{ "Content-Type" = $contentType } `
            -Body $fileBytes `
            -UseBasicParsing
        
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 204) {
            return $true
        }
        return $false
    }
    catch {
        Write-Host "Error uploading to S3: $_" -ForegroundColor Red
        return $false
    }
}

if (-not $Token) {
    if ($Email -and $Password) {
        $Token = Login-User -Email $Email -Password $Password
    } else {
        Write-Host "Error: No authentication provided" -ForegroundColor Red
        Write-Host "Usage:" -ForegroundColor Yellow
        Write-Host "  bulk-upload-categories-v2.ps1 -Token 'jwt_token'" -ForegroundColor Gray
        Write-Host "  bulk-upload-categories-v2.ps1 -Email 'email' -Password 'password'" -ForegroundColor Gray
        exit 1
    }
}

$files = Get-ChildItem -Path $DownloadsFolder -File
$imageFiles = @()
foreach ($file in $files) {
    if ($SupportedFormats -contains $file.Extension.ToLower()) {
        $imageFiles += $file
    }
}

if ($imageFiles.Count -eq 0) {
    Write-Host "Error: No image files found in $DownloadsFolder" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($imageFiles.Count) image(s) to upload:" -ForegroundColor Cyan
Write-Host ""
for ($i = 0; $i -lt $imageFiles.Count; $i++) {
    Write-Host "  $($i + 1). $($imageFiles[$i].Name)" -ForegroundColor Gray
}
Write-Host ""

$successCount = 0
$failureCount = 0
$uploadedUrls = @()

for ($i = 0; $i -lt $imageFiles.Count; $i++) {
    $file = $imageFiles[$i]
    $filePath = $file.FullName
    $filename = $file.Name
    $fileSizeMB = [math]::Round($file.Length / 1MB, 2)

    Write-Host ""
    Write-Host "[$($i + 1)/$($imageFiles.Count)] Uploading: $filename ($fileSizeMB MB)" -ForegroundColor Cyan
    
    Write-Host "  Getting presigned URL..." -ForegroundColor Gray
    $urlData = Get-PresignedUrl -Filename $filename -AuthToken $Token

    if (-not $urlData -or -not $urlData.signedUrl) {
        Write-Host "  Failed to get presigned URL" -ForegroundColor Red
        $failureCount++
        continue
    }

    Write-Host "  Uploading to S3..." -ForegroundColor Gray
    $uploadSuccess = Upload-ToS3 -FilePath $filePath -SignedUrl $urlData.signedUrl

    if ($uploadSuccess) {
        Write-Host "  Upload successful" -ForegroundColor Green
        Write-Host "  Public URL: $($urlData.publicUrl)" -ForegroundColor Green
        
        $uploadedUrls += @{
            filename = $filename
            publicUrl = $urlData.publicUrl
            s3Key = $urlData.key
        }
        
        $successCount++
    } else {
        Write-Host "  Upload failed" -ForegroundColor Red
        $failureCount++
    }

    if ($i -lt $imageFiles.Count - 1) {
        Start-Sleep -Milliseconds 500
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Gray
Write-Host "Upload Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Gray
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failureCount" -ForegroundColor $(if ($failureCount -gt 0) { "Red" } else { "Gray" })
Write-Host "Total: $($imageFiles.Count)" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Gray

if ($uploadedUrls.Count -gt 0) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd")
    $resultsFile = Join-Path $PWD "upload-results-$timestamp.json"
    $uploadedUrls | ConvertTo-Json -Depth 10 | Set-Content $resultsFile
    Write-Host ""
    Write-Host "Results saved to: $resultsFile" -ForegroundColor Green
}

Write-Host ""
exit $(if ($failureCount -gt 0) { 1 } else { 0 })
