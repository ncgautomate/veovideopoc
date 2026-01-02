# NUCLEAR RESET - Complete fresh start with new ports
# This script clears everything and starts on fresh ports to avoid ALL caching

Write-Host "=========================================" -ForegroundColor Red
Write-Host "  NUCLEAR RESET - Fresh Ports" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""

# Get script directory
$scriptPath = $PSScriptRoot
if (-not $scriptPath) {
    $scriptPath = Get-Location
}
Set-Location $scriptPath

# Step 1: Kill everything
Write-Host "Step 1: Killing all processes..." -ForegroundColor Yellow
taskkill /FI "WINDOWTITLE eq Veo Backend*" /F 2>$null | Out-Null
taskkill /FI "WINDOWTITLE eq Veo Frontend*" /F 2>$null | Out-Null
Get-Process python,node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host " [OK] All processes killed" -ForegroundColor Green
Write-Host ""

# Step 2: Clear Python cache
Write-Host "Step 2: Clearing Python __pycache__..." -ForegroundColor Yellow
Get-ChildItem -Path "backend" -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "backend" -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host " [OK] Python cache cleared" -ForegroundColor Green
Write-Host ""

# Step 3: Use fresh ports
$backendPort = 9005
$frontendPort = 5175

Write-Host "Step 3: Using fresh ports..." -ForegroundColor Yellow
Write-Host "  Backend:  $backendPort" -ForegroundColor Cyan
Write-Host "  Frontend: $frontendPort" -ForegroundColor Cyan
Write-Host ""

# Get local IP
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "172.*" -or $_.IPAddress -like "10.*"} | Select-Object -First 1).IPAddress
if (-not $localIP) {
    $localIP = "192.168.1.35"
}

Write-Host "Local IP: $localIP" -ForegroundColor White
Write-Host ""

# Step 4: Update backend/.env
Write-Host "Step 4: Updating backend/.env..." -ForegroundColor Yellow
$backendEnvPath = Join-Path $scriptPath "backend\.env"
$envContent = Get-Content $backendEnvPath
$newContent = $envContent | ForEach-Object {
    if ($_ -match "^BACKEND_PORT=") {
        "BACKEND_PORT=$backendPort"
    } else {
        $_
    }
}
$newContent | Set-Content $backendEnvPath
Write-Host " [OK] Backend port set to $backendPort" -ForegroundColor Green
Write-Host ""

# Step 5: Update frontend/.env
Write-Host "Step 5: Updating frontend/.env..." -ForegroundColor Yellow
$frontendEnvPath = Join-Path $scriptPath "frontend\.env"
$envContent = Get-Content $frontendEnvPath
$newContent = $envContent | ForEach-Object {
    if ($_ -match "^VITE_BACKEND_URL=") {
        "VITE_BACKEND_URL=http://${localIP}:${backendPort}"
    } else {
        $_
    }
}
$newContent | Set-Content $frontendEnvPath
Write-Host " [OK] Frontend backend URL set to http://${localIP}:${backendPort}" -ForegroundColor Green
Write-Host ""

# Step 6: Update frontend vite config for custom port
Write-Host "Step 6: Checking Vite config..." -ForegroundColor Yellow
$viteConfigPath = Join-Path $scriptPath "frontend\vite.config.ts"

if (Test-Path $viteConfigPath) {
    $viteContent = Get-Content $viteConfigPath -Raw

    # Check if server config exists
    if ($viteContent -match "server:\s*\{") {
        # Update existing port
        $viteContent = $viteContent -replace "(port:\s*)\d+", "`${1}$frontendPort"
    } else {
        # Add server config
        $viteContent = $viteContent -replace "(export default defineConfig\(\{)", "`$1`n  server: {`n    port: $frontendPort,`n    strictPort: true,`n  },"
    }

    $viteContent | Set-Content $viteConfigPath
    Write-Host " [OK] Vite port set to $frontendPort" -ForegroundColor Green
} else {
    Write-Host " [SKIP] Vite config not found, will use npm run dev -- --port $frontendPort" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Add firewall rules
Write-Host "Step 7: Adding firewall rules..." -ForegroundColor Yellow
try {
    New-NetFirewallRule -DisplayName "CleverCreator Backend Port $backendPort" -Direction Inbound -Action Allow -Protocol TCP -LocalPort $backendPort -ErrorAction SilentlyContinue | Out-Null
    Write-Host " [OK] Firewall rule added for backend port $backendPort" -ForegroundColor Green
} catch {
    Write-Host " [SKIP] Firewall rule (run as Administrator if needed)" -ForegroundColor Yellow
}
Write-Host ""

# Step 8: Start servers
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Starting Fresh Servers" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://${localIP}:${backendPort}" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:${frontendPort}" -ForegroundColor Cyan
Write-Host "Network:  http://${localIP}:${frontendPort}" -ForegroundColor Cyan
Write-Host ""

# Prepare paths
$backendPath = Join-Path $scriptPath "backend"
$frontendPath = Join-Path $scriptPath "frontend"
$venvPath = Join-Path $scriptPath "venv\Scripts\activate"

# Start backend
Write-Host "Starting backend on port $backendPort..." -ForegroundColor Yellow
$backendCmd = "cd /d `"$backendPath`" && title Veo Backend [Port $backendPort] && `"$venvPath`" && uvicorn app.main:app --host 0.0.0.0 --port $backendPort --reload && pause"
Start-Process cmd -ArgumentList "/c $backendCmd"

Start-Sleep -Seconds 3

# Start frontend with custom port
Write-Host "Starting frontend on port $frontendPort..." -ForegroundColor Yellow
$frontendCmd = "cd /d `"$frontendPath`" && title Veo Frontend [Port $frontendPort] && npm run dev -- --port $frontendPort && pause"
Start-Process cmd -ArgumentList "/c $frontendCmd"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  SERVERS STARTING!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Open browser to:" -ForegroundColor Yellow
Write-Host "  http://localhost:$frontendPort" -ForegroundColor Cyan
Write-Host ""
Write-Host "This is a FRESH port - no browser cache!" -ForegroundColor Green
Write-Host ""
Write-Host "You should see 0/4096 (new limit)" -ForegroundColor White
Write-Host "Chat should work correctly" -ForegroundColor White
Write-Host ""
