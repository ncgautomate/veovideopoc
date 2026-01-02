# Host Computer Configuration Verification
# Run this script from the HOST COMPUTER (192.168.1.35) to verify setup

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Host Configuration Verification" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "Test 1: Backend Status" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9000/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host " [OK] Backend is RUNNING" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host " [FAIL] Backend is NOT RUNNING" -ForegroundColor Red
    Write-Host "  Please start backend with start-dev.bat" -ForegroundColor Red
}
Write-Host ""

# Test 2: Check if frontend is running
Write-Host "Test 2: Frontend Status" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host " [OK] Frontend is RUNNING" -ForegroundColor Green
} catch {
    Write-Host " [FAIL] Frontend is NOT RUNNING" -ForegroundColor Red
    Write-Host "  Please start frontend with start-dev.bat" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check backend .env file
Write-Host "Test 3: Backend .env Configuration" -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host " [OK] backend\.env file exists" -ForegroundColor Green
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match "BACKEND_HOST\s*=\s*0\.0\.0\.0") {
        Write-Host " [OK] BACKEND_HOST=0.0.0.0 (Correct)" -ForegroundColor Green
    } else {
        Write-Host " [WARN] BACKEND_HOST is not set to 0.0.0.0" -ForegroundColor Yellow
    }
    if ($envContent -match "BACKEND_PORT\s*=\s*9000") {
        Write-Host " [OK] BACKEND_PORT=9000 (Correct)" -ForegroundColor Green
    }
    if ($envContent -match "GEMINI_API_KEY\s*=\s*\w+") {
        Write-Host " [OK] GEMINI_API_KEY is set" -ForegroundColor Green
    }
} else {
    Write-Host " [FAIL] backend\.env file NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# Test 4: Check frontend .env file
Write-Host "Test 4: Frontend .env Configuration" -ForegroundColor Yellow
if (Test-Path "frontend\.env") {
    Write-Host " [OK] frontend\.env file exists" -ForegroundColor Green
    $frontendEnv = Get-Content "frontend\.env" -Raw
    if ($frontendEnv -match "VITE_BACKEND_URL\s*=\s*http://192\.168\.1\.35:9000") {
        Write-Host " [OK] VITE_BACKEND_URL=http://192.168.1.35:9000 (Network mode)" -ForegroundColor Green
    } else {
        Write-Host " [WARN] VITE_BACKEND_URL not set to network IP" -ForegroundColor Yellow
        Write-Host "  Current: $($frontendEnv -replace '(?s).*VITE_BACKEND_URL\s*=\s*([^\r\n]+).*', '$1')" -ForegroundColor Gray
    }
} else {
    Write-Host " [FAIL] frontend\.env file NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# Test 5: Check firewall rules
Write-Host "Test 5: Windows Firewall Rules" -ForegroundColor Yellow
$backendRuleOutput = netsh advfirewall firewall show rule name="CleverCreator Backend" 2>&1 | Out-String
if ($backendRuleOutput -match "CleverCreator Backend") {
    Write-Host " [OK] Backend firewall rule exists" -ForegroundColor Green
} else {
    Write-Host " [WARN] Backend firewall rule NOT FOUND" -ForegroundColor Yellow
}

$frontendRuleOutput = netsh advfirewall firewall show rule name="CleverCreator Frontend" 2>&1 | Out-String
if ($frontendRuleOutput -match "CleverCreator Frontend") {
    Write-Host " [OK] Frontend firewall rule exists" -ForegroundColor Green
} else {
    Write-Host " [WARN] Frontend firewall rule NOT FOUND" -ForegroundColor Yellow
}
Write-Host ""

# Test 6: Check local IP address
Write-Host "Test 6: Network Configuration" -ForegroundColor Yellow
$ipConfig = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" }
if ($ipConfig) {
    foreach ($ip in $ipConfig) {
        Write-Host "  IP Address: $($ip.IPAddress)" -ForegroundColor Gray
    }
}

$profile = Get-NetConnectionProfile | Select-Object -First 1
if ($profile.NetworkCategory -eq "Private") {
    Write-Host " [OK] Network Profile: Private" -ForegroundColor Green
} else {
    Write-Host " [WARN] Network Profile: $($profile.NetworkCategory)" -ForegroundColor Yellow
}
Write-Host ""

# Test 7: Test backend from network IP
Write-Host "Test 7: Backend Accessibility via Network IP" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://192.168.1.35:9000/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host " [OK] Backend accessible via 192.168.1.35:9000" -ForegroundColor Green
} catch {
    Write-Host " [FAIL] Backend NOT accessible via network IP" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Remote users should access:" -ForegroundColor Cyan
Write-Host "  Frontend: http://192.168.1.35:5173" -ForegroundColor White
Write-Host "  Test Page: http://192.168.1.35:5173/network-test.html" -ForegroundColor White
Write-Host ""
Write-Host "Next steps for troubleshooting:" -ForegroundColor Yellow
Write-Host "  1. Make sure both servers are running" -ForegroundColor White
Write-Host "  2. Have remote user run: test-from-remote.ps1" -ForegroundColor White
Write-Host "  3. Check this output for any [FAIL] or [WARN] messages" -ForegroundColor White
Write-Host ""
