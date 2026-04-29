param(
    [string]$Token,
    [string]$Email,
    [string]$Password,
    [switch]$Local
)

$ApiUrl = if ($Local) { "http://localhost:5000/api" } else { "https://api.carmellawholesale.uk/api" }
$ResultsFile = "upload-results-2026-04-29.json"

Write-Host ""
Write-Host "Link Category Images to Database" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: $ApiUrl" -ForegroundColor Gray
Write-Host "Results File: $ResultsFile" -ForegroundColor Gray
Write-Host ""

function Login-User {
    param([string]$Email, [string]$Password)
    
    Write-Host "Authenticating as $Email..." -ForegroundColor Yellow
    
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
        Write-Host "Authentication successful" -ForegroundColor Green
        
        if ($data.session.access_token) {
            return $data.session.access_token
        } elseif ($data.access_token) {
            return $data.access_token
        } else {
            return $data.token
        }
    }
    catch {
        Write-Host "Auth error: $_" -ForegroundColor Red
        exit 1
    }
}

function Create-Or-Update-Category {
    param([string]$Name, [string]$ImageUrl, [string]$AuthToken)
    
    $slug = $Name.ToLower() -replace '[^a-z0-9]+', '-' -replace '^-+|-+$', ''
    
    Write-Host "  Creating/updating: $Name (slug: $slug)" -ForegroundColor Gray
    
    # Try to create
    try {
        $body = @{
            name = $Name.Trim()
            description = ""
            imageUrl = $ImageUrl
        } | ConvertTo-Json

        $headers = @{
            "Authorization" = "Bearer $AuthToken"
            "Content-Type" = "application/json"
        }

        $createResponse = Invoke-WebRequest `
            -Uri "$ApiUrl/categories" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -UseBasicParsing

        $data = $createResponse.Content | ConvertFrom-Json
        Write-Host "    [OK] Created: $($data.id)" -ForegroundColor Green
        return @{ id = $data.id; created = $true }
    }
    catch {
        # Try to update existing
        try {
            $getResponse = Invoke-WebRequest `
                -Uri "$ApiUrl/categories" `
                -Method GET `
                -Headers @{ "Authorization" = "Bearer $AuthToken" } `
                -UseBasicParsing

            $allData = $getResponse.Content | ConvertFrom-Json
            $existing = $allData.categories | Where-Object { $_.name -eq $Name }

            if ($existing) {
                $updateBody = @{
                    name = $Name.Trim()
                    imageUrl = $ImageUrl
                } | ConvertTo-Json

                $updateResponse = Invoke-WebRequest `
                    -Uri "$ApiUrl/categories/$($existing.id)" `
                    -Method PUT `
                    -Headers $headers `
                    -Body $updateBody `
                    -UseBasicParsing

                $updateData = $updateResponse.Content | ConvertFrom-Json
                Write-Host "    [OK] Updated: $($updateData.id)" -ForegroundColor Green
                return @{ id = $updateData.id; created = $false }
            } else {
                Write-Host "    [FAILED] Category not found" -ForegroundColor Red
                return @{ error = "Not found" }
            }
        }
        catch {
            Write-Host "    [ERROR] $_" -ForegroundColor Red
            return @{ error = $_.Exception.Message }
        }
    }
}

if (-not $Token) {
    if ($Email -and $Password) {
        $Token = Login-User -Email $Email -Password $Password
    } else {
        Write-Host "Error: No authentication provided" -ForegroundColor Red
        Write-Host ""
        Write-Host "Usage:" -ForegroundColor Yellow
        Write-Host "  .\link-categories-to-db.ps1 -Token 'jwt_token'" -ForegroundColor Gray
        Write-Host "  .\link-categories-to-db.ps1 -Email 'email' -Password 'password'" -ForegroundColor Gray
        exit 1
    }
}

if (-not (Test-Path $ResultsFile)) {
    Write-Host "Error: $ResultsFile not found" -ForegroundColor Red
    exit 1
}

$results = Get-Content $ResultsFile -Raw | ConvertFrom-Json
Write-Host "Found $($results.Count) uploaded categories" -ForegroundColor Cyan
Write-Host ""
Write-Host "Processing...`n" -ForegroundColor Gray

$successCount = 0
$errorCount = 0
$processedCategories = @()

for ($i = 0; $i -lt $results.Count; $i++) {
    $result = $results[$i]
    $filename = $result.filename
    $publicUrl = $result.publicUrl
    
    $categoryName = $filename -replace '\.(png|jpg|jpeg|gif|webp)$', ''
    
    Write-Host "[$($i + 1)/$($results.Count)] $categoryName" -ForegroundColor Cyan
    
    $createResult = Create-Or-Update-Category -Name $categoryName -ImageUrl $publicUrl -AuthToken $Token
    
    if ($createResult.error) {
        $errorCount++
    } else {
        $successCount++
        $processedCategories += @{
            name = $categoryName
            imageUrl = $publicUrl
            id = $createResult.id
            created = $createResult.created
        }
    }
    
    if ($i -lt $results.Count - 1) {
        Start-Sleep -Milliseconds 300
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Gray
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Gray
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Gray" })
Write-Host "Total: $($results.Count)" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Gray

if ($processedCategories.Count -gt 0) {
    $processedCategories | ConvertTo-Json -Depth 10 | Set-Content "categories-linked.json"
    Write-Host ""
    Write-Host "Categories linked to database!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Details saved to: categories-linked.json" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Your categories are now visible in:" -ForegroundColor Yellow
    Write-Host "   - Admin panel → Categories section" -ForegroundColor Gray
    Write-Host "   - Website homepage → Categories showcase" -ForegroundColor Gray
}

Write-Host ""
exit $(if ($errorCount -gt 0) { 1 } else { 0 })
