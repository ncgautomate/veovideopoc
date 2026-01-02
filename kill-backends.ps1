# Kill all processes listening on port 9001
# Run this before starting the backend to ensure port is free

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Cleaning up port 9001" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Find all processes listening on port 9001
Write-Host "Checking for processes on port 9001..." -ForegroundColor Yellow

$netstatOutput = netstat -ano | Select-String ":9001.*LISTENING"

if (-not $netstatOutput) {
    Write-Host " [OK] Port 9001 is already free!" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# Extract PIDs from netstat output
$pids = @()
foreach ($line in $netstatOutput) {
    # netstat output format: TCP    0.0.0.0:9001    0.0.0.0:0    LISTENING    12345
    # We want the last field (PID)
    $fields = $line -split '\s+' | Where-Object { $_ -ne '' }
    $processId = $fields[-1]
    if ($processId -match '^\d+$') {
        $pids += [int]$processId
    }
}

# Remove duplicates
$pids = $pids | Select-Object -Unique

Write-Host "Found $($pids.Count) process(es) using port 9001" -ForegroundColor Yellow
Write-Host ""

# Kill each process with retry
$killed = 0
$failed = 0
$retryDelay = 500  # milliseconds

foreach ($processId in $pids) {
    $attempts = 0
    $maxAttempts = 3
    $processKilled = $false

    while ($attempts -lt $maxAttempts -and -not $processKilled) {
        try {
            $attempts++
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue

            if ($process) {
                $processName = $process.Name
                if ($attempts -eq 1) {
                    Write-Host "Killing PID $processId ($processName)..." -ForegroundColor Red
                } else {
                    Write-Host "  Retry $attempts/$maxAttempts..." -ForegroundColor Yellow
                }

                Stop-Process -Id $processId -Force -ErrorAction Stop
                Start-Sleep -Milliseconds $retryDelay

                # Verify it's actually dead
                $stillAlive = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if (-not $stillAlive) {
                    Write-Host " [OK] Killed PID $processId" -ForegroundColor Green
                    $killed++
                    $processKilled = $true
                }
            } else {
                Write-Host " [SKIP] PID $processId already terminated" -ForegroundColor Gray
                $processKilled = $true
            }
        } catch {
            if ($attempts -ge $maxAttempts) {
                Write-Host " [FAIL] Could not kill PID $processId after $maxAttempts attempts" -ForegroundColor Red
                Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
                $failed++
            }
        }
    }
}

Write-Host ""
Write-Host "Waiting 2 seconds for cleanup..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Verify port is free
Write-Host ""
Write-Host "Verifying port 9001..." -ForegroundColor Yellow

$stillListening = netstat -ano | Select-String ":9001.*LISTENING"

if (-not $stillListening) {
    Write-Host " [OK] Port 9001 is now FREE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  Killed: $killed process(es)" -ForegroundColor Green
    if ($failed -gt 0) {
        Write-Host "  Failed: $failed process(es)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "You can now start the backend safely." -ForegroundColor White
    exit 0
} else {
    Write-Host " [WARNING] Port 9001 still has active listeners!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Remaining processes:" -ForegroundColor Red
    $stillListening | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "You may need to manually close backend terminal windows." -ForegroundColor Yellow
    exit 1
}
