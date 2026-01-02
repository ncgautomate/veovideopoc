# Quick Endpoint Check Script
Write-Host "Checking CleverCreator.ai Endpoints..." -ForegroundColor Cyan
Write-Host ""

# Check backend
Write-Host "1. Backend Health:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:9000/api/health" -Method GET
    Write-Host " [OK] Backend is running" -ForegroundColor Green
    Write-Host "  Service: $($health.service)" -ForegroundColor Gray
} catch {
    Write-Host " [FAIL] Backend not running" -ForegroundColor Red
    exit 1
}

# Check chat endpoint
Write-Host ""
Write-Host "2. Chat Endpoint (/api/chat):" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:9000/api/chat" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"message":"test"}' -ErrorAction Stop
    Write-Host " [OK] Chat endpoint is working!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host " [MISSING] Chat endpoint returns 404 - Backend needs RESTART" -ForegroundColor Red
        Write-Host "  >> Close the backend terminal and run start-dev.bat again" -ForegroundColor Yellow
    } elseif ($_.Exception.Response.StatusCode.value__ -eq 500) {
        Write-Host " [ERROR] Chat endpoint exists but has an error" -ForegroundColor Yellow
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    } else {
        Write-Host " [FAIL] Unknown error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check optimize-prompt endpoint
Write-Host ""
Write-Host "3. Optimize Prompt Endpoint (/api/optimize-prompt):" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:9000/api/optimize-prompt" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"original_prompt":"test"}' -ErrorAction Stop
    Write-Host " [OK] Optimize endpoint is working!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host " [MISSING] Optimize endpoint returns 404 - Backend needs RESTART" -ForegroundColor Red
    } elseif ($_.Exception.Response.StatusCode.value__ -eq 500) {
        Write-Host " [ERROR] Optimize endpoint exists but has an error" -ForegroundColor Yellow
    } else {
        Write-Host " [OK] Optimize endpoint registered (may have validation error)" -ForegroundColor Green
    }
}

# Check OpenAPI docs
Write-Host ""
Write-Host "4. API Documentation:" -ForegroundColor Yellow
try {
    $openapi = Invoke-RestMethod -Uri "http://localhost:9000/openapi.json" -Method GET
    $paths = $openapi.paths.PSObject.Properties.Name

    Write-Host "  Registered endpoints:" -ForegroundColor Gray
    foreach ($path in $paths | Sort-Object) {
        Write-Host "    $path" -ForegroundColor Gray
    }

    if ($paths -contains "/api/chat") {
        Write-Host ""
        Write-Host " [OK] /api/chat is registered in OpenAPI" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host " [MISSING] /api/chat NOT in OpenAPI - RESTART BACKEND" -ForegroundColor Red
    }
} catch {
    Write-Host " [WARN] Could not fetch OpenAPI spec" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SOLUTION:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "1. Close all terminal windows running the app" -ForegroundColor White
Write-Host "2. Run: start-dev.bat" -ForegroundColor White
Write-Host "3. Wait for both backend and frontend to fully start" -ForegroundColor White
Write-Host "4. Verify /api/chat appears in: http://localhost:9000/docs" -ForegroundColor White
Write-Host ""
