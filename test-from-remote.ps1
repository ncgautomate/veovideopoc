# Network Connectivity Test Script
# Run this script from the REMOTE COMPUTER to test connectivity to the host

$hostIP = "192.168.1.35"
$backendPort = 9000
$frontendPort = 5173

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  CleverCreator.ai Network Test" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Ping
Write-Host "Test 1: Ping $hostIP" -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName $hostIP -Count 2 -ErrorAction Stop
    Write-Host "✓ SUCCESS: Host is reachable" -ForegroundColor Green
    Write-Host "  Average response time: $($ping[0].ResponseTime)ms" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Cannot ping host" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Backend Port
Write-Host "Test 2: Backend Port $backendPort" -ForegroundColor Yellow
try {
    $portTest = Test-NetConnection -ComputerName $hostIP -Port $backendPort -WarningAction SilentlyContinue
    if ($portTest.TcpTestSucceeded) {
        Write-Host "✓ SUCCESS: Port $backendPort is OPEN" -ForegroundColor Green
    } else {
        Write-Host "✗ FAILED: Port $backendPort is CLOSED" -ForegroundColor Red
        Write-Host "  This means the firewall is blocking connections" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ FAILED: Cannot test port" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Frontend Port
Write-Host "Test 3: Frontend Port $frontendPort" -ForegroundColor Yellow
try {
    $portTest = Test-NetConnection -ComputerName $hostIP -Port $frontendPort -WarningAction SilentlyContinue
    if ($portTest.TcpTestSucceeded) {
        Write-Host "✓ SUCCESS: Port $frontendPort is OPEN" -ForegroundColor Green
    } else {
        Write-Host "✗ FAILED: Port $frontendPort is CLOSED" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ FAILED: Cannot test port" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Backend Health Endpoint
Write-Host "Test 4: Backend Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://${hostIP}:${backendPort}/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ SUCCESS: Backend is responding" -ForegroundColor Green
    Write-Host "  Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Cannot reach backend health endpoint" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    if ($_.Exception.Message -like "*Unable to connect*") {
        Write-Host "  >> Connection refused - Backend may not be running or firewall is blocking" -ForegroundColor Red
    } elseif ($_.Exception.Message -like "*timed out*") {
        Write-Host "  >> Request timed out - Check firewall rules" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Backend Root Endpoint
Write-Host "Test 5: Backend Root Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://${hostIP}:${backendPort}/" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ SUCCESS: Backend root is responding" -ForegroundColor Green
    Write-Host "  Service: $($response.message)" -ForegroundColor Gray
    Write-Host "  Version: $($response.version)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Cannot reach backend root endpoint" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Video List Endpoint
Write-Host "Test 6: Video List Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://${hostIP}:${backendPort}/api/videos" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ SUCCESS: Video list endpoint responding" -ForegroundColor Green
    Write-Host "  Videos found: $($response.count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Cannot reach video list endpoint" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed:" -ForegroundColor Green
Write-Host "  ✓ Network connectivity is working" -ForegroundColor Green
Write-Host "  ✓ Open browser to: http://${hostIP}:${frontendPort}" -ForegroundColor Green
Write-Host ""
Write-Host "If port tests failed:" -ForegroundColor Red
Write-Host "  ✗ Windows Firewall is blocking connections" -ForegroundColor Red
Write-Host "  ✗ Ask host computer user to check firewall rules" -ForegroundColor Red
Write-Host ""
Write-Host "If endpoint tests failed but ports are open:" -ForegroundColor Yellow
Write-Host "  ⚠ Backend may not be running on host computer" -ForegroundColor Yellow
Write-Host "  ⚠ Check that backend is started: start-dev.bat" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Save this output" -ForegroundColor White
Write-Host "  2. Try opening in browser: http://${hostIP}:${frontendPort}" -ForegroundColor White
Write-Host "  3. Try network test page: http://${hostIP}:${frontendPort}/network-test.html" -ForegroundColor White
Write-Host ""
