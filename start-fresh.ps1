# Smart Startup Script - Use a custom or auto-detected port
# This allows multiple instances or fresh starts without killing old sessions

param(
    [int]$Port = 0  # 0 means auto-detect
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CleverCreator.ai - Smart Startup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-PortInUse {
    param([int]$PortNumber)
    $connections = netstat -ano | Select-String ":$PortNumber.*LISTENING"
    return $null -ne $connections
}

# Function to find a free port
function Find-FreePort {
    param([int]$StartPort = 9001)

    $testPort = $StartPort
    while (Test-PortInUse -PortNumber $testPort) {
        $testPort++
        if ($testPort -gt 9100) {
            Write-Host "ERROR: No free ports found in range 9001-9100" -ForegroundColor Red
            exit 1
        }
    }
    return $testPort
}

# Determine which port to use
if ($Port -eq 0) {
    # Auto-detect mode
    Write-Host "Auto-detecting free port..." -ForegroundColor Yellow
    $selectedPort = Find-FreePort
    Write-Host "Found free port: $selectedPort" -ForegroundColor Green

    # Ask user for confirmation
    Write-Host ""
    $response = Read-Host "Use port $selectedPort? (Y/n)"
    if ($response -eq "n" -or $response -eq "N") {
        $customPort = Read-Host "Enter custom port number (9001-9999)"
        $selectedPort = [int]$customPort

        if (Test-PortInUse -PortNumber $selectedPort) {
            Write-Host "ERROR: Port $selectedPort is already in use!" -ForegroundColor Red
            exit 1
        }
    }
} else {
    # User specified port
    $selectedPort = $Port

    if (Test-PortInUse -PortNumber $selectedPort) {
        Write-Host "ERROR: Port $selectedPort is already in use!" -ForegroundColor Red
        Write-Host "Finding alternative..." -ForegroundColor Yellow
        $selectedPort = Find-FreePort
        Write-Host "Will use port $selectedPort instead" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Starting on Port: $selectedPort" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Get local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "172.*" -or $_.IPAddress -like "10.*"} | Select-Object -First 1).IPAddress

if (-not $localIP) {
    $localIP = "192.168.1.35"  # Fallback
}

Write-Host "Local IP: $localIP" -ForegroundColor White
Write-Host ""

# Get script directory and ensure we're in the project root
$scriptPath = $PSScriptRoot
if (-not $scriptPath) {
    $scriptPath = Get-Location
}
Set-Location $scriptPath

Write-Host "Working directory: $scriptPath" -ForegroundColor Gray
Write-Host ""

# Update backend/.env
Write-Host "Updating backend/.env..." -ForegroundColor Yellow
$backendEnvPath = Join-Path $scriptPath "backend\.env"

if (Test-Path $backendEnvPath) {
    $envContent = Get-Content $backendEnvPath
    $newContent = $envContent | ForEach-Object {
        if ($_ -match "^BACKEND_PORT=") {
            "BACKEND_PORT=$selectedPort"
        } else {
            $_
        }
    }
    $newContent | Set-Content $backendEnvPath
    Write-Host " [OK] backend/.env updated with port $selectedPort" -ForegroundColor Green
} else {
    Write-Host " [ERROR] backend/.env not found!" -ForegroundColor Red
    exit 1
}

# Update frontend/.env
Write-Host "Updating frontend/.env..." -ForegroundColor Yellow
$frontendEnvPath = Join-Path $scriptPath "frontend\.env"

if (Test-Path $frontendEnvPath) {
    $envContent = Get-Content $frontendEnvPath
    $newContent = $envContent | ForEach-Object {
        if ($_ -match "^VITE_BACKEND_URL=") {
            "VITE_BACKEND_URL=http://${localIP}:${selectedPort}"
        } else {
            $_
        }
    }
    $newContent | Set-Content $frontendEnvPath
    Write-Host " [OK] frontend/.env updated with URL http://${localIP}:${selectedPort}" -ForegroundColor Green
} else {
    Write-Host " [ERROR] frontend/.env not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Add Windows Firewall rule
Write-Host "Checking Windows Firewall..." -ForegroundColor Yellow
$ruleName = "CleverCreator Backend Port $selectedPort"

$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if (-not $existingRule) {
    try {
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $selectedPort | Out-Null
        Write-Host " [OK] Firewall rule added for port $selectedPort" -ForegroundColor Green
    } catch {
        Write-Host " [WARNING] Could not add firewall rule (run as Administrator)" -ForegroundColor Yellow
    }
} else {
    Write-Host " [OK] Firewall rule already exists for port $selectedPort" -ForegroundColor Green
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Configuration Updated!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend Port:  $selectedPort" -ForegroundColor White
Write-Host "Frontend URL:  http://localhost:5173" -ForegroundColor White
Write-Host "Backend API:   http://${localIP}:${selectedPort}" -ForegroundColor White
Write-Host "Network URL:   http://${localIP}:5173" -ForegroundColor White
Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host ""

# Prepare paths
$backendPath = Join-Path $scriptPath "backend"
$frontendPath = Join-Path $scriptPath "frontend"
$venvPath = Join-Path $scriptPath "venv\Scripts\activate"

# Start backend in new window
$backendCmd = "cd /d `"$backendPath`" && title Veo Backend [Port $selectedPort] && `"$venvPath`" && uvicorn app.main:app --host 0.0.0.0 --port $selectedPort --reload && pause"
Start-Process cmd -ArgumentList "/c $backendCmd"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
$frontendCmd = "cd /d `"$frontendPath`" && title Veo Frontend && npm run dev && pause"
Start-Process cmd -ArgumentList "/c $frontendCmd"

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Servers Starting!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: Port $selectedPort (check new window)" -ForegroundColor Cyan
Write-Host "Frontend: Port 5173 (check new window)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open in browser: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Network access:  http://${localIP}:5173" -ForegroundColor Yellow
Write-Host ""
