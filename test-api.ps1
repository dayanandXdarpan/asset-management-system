$baseUrl = "https://asset-management-system-z92r.onrender.com"

Write-Host "`n🧪 Testing Asset Management API" -ForegroundColor Cyan
Write-Host "=" * 50

# Test 1: Base URL
Write-Host "`n1️⃣ Testing Base URL..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing
    Write-Host "   ✅ Status: $($response.StatusCode) - $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login with WRONG credentials
Write-Host "`n2️⃣ Testing Login (Wrong Credentials)..." -ForegroundColor Yellow
try {
    $body = @{
        email = "wrong@test.com"
        password = "wrongpass"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    Write-Host "   ✅ Unexpected Success: $($response.StatusCode)" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ✅ Expected 401: Got $statusCode" -ForegroundColor Green
}

# Test 3: Login with CORRECT credentials
Write-Host "`n3️⃣ Testing Login (Admin Credentials)..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@test.com"
        password = "password123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    
    if ($token) {
        Write-Host "   ✅ Login Successful! Token received" -ForegroundColor Green
        Write-Host "   👤 User: $($loginResponse.user.name) ($($loginResponse.user.role))" -ForegroundColor Cyan
        
        # Test 4: Protected endpoint with token
        Write-Host "`n4️⃣ Testing Protected API (Stats)..." -ForegroundColor Yellow
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $statsResponse = Invoke-RestMethod -Uri "$baseUrl/api/stats" -Method GET -Headers $headers
        Write-Host "   ✅ Stats Retrieved:" -ForegroundColor Green
        Write-Host "      📊 Total Assets: $($statsResponse.totalAssets)" -ForegroundColor White
        Write-Host "      ✅ Active Assets: $($statsResponse.activeAssets)" -ForegroundColor White
        Write-Host "      🔧 Maintenance Records: $($statsResponse.maintenanceCount)" -ForegroundColor White
        Write-Host "      📍 Locations: $($statsResponse.locations)" -ForegroundColor White
        
        # Test 5: Locations API
        Write-Host "`n5️⃣ Testing Locations API..." -ForegroundColor Yellow
        $locationsResponse = Invoke-RestMethod -Uri "$baseUrl/api/locations" -Method GET -Headers $headers
        Write-Host "   ✅ Found $($locationsResponse.Count) locations" -ForegroundColor Green
        
        # Test 6: Assets API
        Write-Host "`n6️⃣ Testing Assets API..." -ForegroundColor Yellow
        $assetsResponse = Invoke-RestMethod -Uri "$baseUrl/api/assets" -Method GET -Headers $headers
        Write-Host "   ✅ Found $($assetsResponse.data.Count) assets (Page $($assetsResponse.meta.page)/$($assetsResponse.meta.totalPages))" -ForegroundColor Green
        
        # Test 7: Vendors API
        Write-Host "`n7️⃣ Testing Vendors API..." -ForegroundColor Yellow
        $vendorsResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendors" -Method GET -Headers $headers
        Write-Host "   ✅ Found $($vendorsResponse.Count) vendors" -ForegroundColor Green
        
    } else {
        Write-Host "   ❌ Login failed - No token received" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Error Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 8: Protected endpoint without token
Write-Host "`n8️⃣ Testing Protected API (No Auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/stats" -Method GET -UseBasicParsing
    Write-Host "   ❌ Unexpected Success: $($response.StatusCode)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ✅ Expected 401: Got $statusCode (Auth Required)" -ForegroundColor Green
}

Write-Host "`n" + ("=" * 50)
Write-Host "API Testing Complete!" -ForegroundColor Cyan
Write-Host ""
