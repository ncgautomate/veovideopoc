# DEEP CLEAN - Kill all processes, clear Python cache, ensure fresh start

Write-Host "=========================================" -ForegroundColor Magenta
Write-Host "  DEEP CLEAN - Complete Reset" -ForegroundColor Magenta
Write-Host "=========================================" -ForegroundColor Magenta
Write-Host ""

# Step 1: Kill CMD windows
Write-Host "Step 1: Killing old server CMD windows..." -ForegroundColor Yellow
taskkill /FI "WINDOWTITLE eq Veo Backend*" /F 2>$null | Out-Null
taskkill /FI "WINDOWTITLE eq Veo Frontend*" /F 2>$null | Out-Null
Write-Host " [OK] CMD windows killed" -ForegroundColor Green
Write-Host ""

# Step 2: Kill Python and Node
Write-Host "Step 2: Killing all Python and Node processes..." -ForegroundColor Yellow
Get-Process python,node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host " [OK] Python and Node killed" -ForegroundColor Green
Write-Host ""

# Step 3: Clear Python cache
Write-Host "Step 3: Clearing Python __pycache__ directories..." -ForegroundColor Yellow
$pycacheCount = 0

Get-ChildItem -Path "backend" -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  Removing: $($_.FullName)" -ForegroundColor Gray
    Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    $pycacheCount++
}

if ($pycacheCount -eq 0) {
    Write-Host " [OK] No __pycache__ directories found" -ForegroundColor Green
} else {
    Write-Host " [OK] Removed $pycacheCount __pycache__ directories" -ForegroundColor Green
}
Write-Host ""

# Step 4: Clear .pyc files
Write-Host "Step 4: Clearing .pyc files..." -ForegroundColor Yellow
$pycCount = 0

Get-ChildItem -Path "backend" -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-Item -Path $_.FullName -Force -ErrorAction SilentlyContinue
    $pycCount++
}

if ($pycCount -eq 0) {
    Write-Host " [OK] No .pyc files found" -ForegroundColor Green
} else {
    Write-Host " [OK] Removed $pycCount .pyc files" -ForegroundColor Green
}
Write-Host ""

# Step 5: Verify ports are free
Write-Host "Step 5: Verifying ports..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

$port9001 = netstat -ano | Select-String ":9001.*LISTENING"
$port5173 = netstat -ano | Select-String ":5173.*LISTENING"

$allClear = $true

if (-not $port9001) {
    Write-Host " [OK] Port 9001 (Backend) is FREE!" -ForegroundColor Green
} else {
    Write-Host " [ERROR] Port 9001 (Backend) still in use!" -ForegroundColor Red
    $allClear = $false
}

if (-not $port5173) {
    Write-Host " [OK] Port 5173 (Frontend) is FREE!" -ForegroundColor Green
} else {
    Write-Host " [ERROR] Port 5173 (Frontend) still in use!" -ForegroundColor Red
    $allClear = $false
}

Write-Host ""

if ($allClear) {
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "  DEEP CLEAN COMPLETE!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Python cache cleared, all processes killed." -ForegroundColor White
    Write-Host "Now run: start-dev.bat" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After starting, press Ctrl+Shift+R in browser to hard refresh!" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "WARNING: Some ports still in use" -ForegroundColor Yellow
    Write-Host "Wait 30 seconds and try again." -ForegroundColor Yellow
    exit 1
}
