# FORCE CLEANUP - Kill ALL Python, Node processes AND their CMD windows
# Use this when you need a complete fresh start

Write-Host "=========================================" -ForegroundColor Red
Write-Host "  FORCE CLEANUP - Killing ALL Processes" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""

# Step 0: Kill CMD windows with our server titles
Write-Host "Killing old server CMD windows..." -ForegroundColor Yellow

# Kill "Veo Backend" window
taskkill /FI "WINDOWTITLE eq Veo Backend*" /F 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host " [OK] Killed 'Veo Backend' CMD window" -ForegroundColor Green
}

# Kill "Veo Frontend" window
taskkill /FI "WINDOWTITLE eq Veo Frontend*" /F 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host " [OK] Killed 'Veo Frontend' CMD window" -ForegroundColor Green
}

Start-Sleep -Seconds 1
Write-Host ""

# Step 1: List and kill all Python processes (Backend)
Write-Host "Finding all Python processes..." -ForegroundColor Yellow
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue

if (-not $pythonProcesses) {
    Write-Host " [OK] No Python processes found!" -ForegroundColor Green
} else {
    $count = @($pythonProcesses).Count
    Write-Host "Found $count Python process(es)" -ForegroundColor Yellow

    # Show what we're about to kill
    $pythonProcesses | ForEach-Object {
        Write-Host "  PID $($_.Id): $($_.ProcessName) (Started: $($_.StartTime))" -ForegroundColor Gray
    }

    # Kill all Python processes
    Write-Host "Killing all Python processes..." -ForegroundColor Red
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1

    $stillAlive = Get-Process python -ErrorAction SilentlyContinue
    if (-not $stillAlive) {
        Write-Host " [OK] All Python processes killed!" -ForegroundColor Green
    } else {
        Write-Host " [WARNING] Some Python processes still running!" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 2: List and kill all Node processes (Frontend)
Write-Host "Finding all Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if (-not $nodeProcesses) {
    Write-Host " [OK] No Node processes found!" -ForegroundColor Green
} else {
    $count = @($nodeProcesses).Count
    Write-Host "Found $count Node process(es)" -ForegroundColor Yellow

    # Show what we're about to kill
    $nodeProcesses | ForEach-Object {
        Write-Host "  PID $($_.Id): $($_.ProcessName) (Started: $($_.StartTime))" -ForegroundColor Gray
    }

    # Kill all Node processes
    Write-Host "Killing all Node processes..." -ForegroundColor Red
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1

    $stillAlive = Get-Process node -ErrorAction SilentlyContinue
    if (-not $stillAlive) {
        Write-Host " [OK] All Node processes killed!" -ForegroundColor Green
    } else {
        Write-Host " [WARNING] Some Node processes still running!" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 3: Verify ports are free
Write-Host "Verifying ports..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

$port9001 = netstat -ano | Select-String ":9001.*LISTENING"
$port5173 = netstat -ano | Select-String ":5173.*LISTENING"

$allClear = $true

if (-not $port9001) {
    Write-Host " [OK] Port 9001 (Backend) is FREE!" -ForegroundColor Green
} else {
    Write-Host " [ERROR] Port 9001 (Backend) still in use!" -ForegroundColor Red
    $port9001 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    $allClear = $false
}

if (-not $port5173) {
    Write-Host " [OK] Port 5173 (Frontend) is FREE!" -ForegroundColor Green
} else {
    Write-Host " [ERROR] Port 5173 (Frontend) still in use!" -ForegroundColor Red
    $port5173 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    $allClear = $false
}

Write-Host ""

if ($allClear) {
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "  CLEANUP COMPLETE - Ready to start!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run start-dev.bat" -ForegroundColor White
    exit 0
} else {
    Write-Host "=========================================" -ForegroundColor Yellow
    Write-Host "  WARNING - Some ports still in use" -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This may be stuck TCP connections from Windows." -ForegroundColor Yellow
    Write-Host "Wait 30 seconds and try again, or restart your computer." -ForegroundColor Yellow
    exit 1
}
