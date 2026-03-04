# Healthcare Backend Server Manager
Write-Host ""
Write-Host "Healthcare Backend Server Manager" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Gray

# Check if server is running
function Test-ServerRunning {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 2 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Kill processes on port 5000
function Stop-ServerOnPort {
    Write-Host ""
    Write-Host "Checking for processes on port 5000..." -ForegroundColor Yellow
    
    try {
        $connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
            foreach ($pid in $pids) {
                Write-Host "  Stopping process $pid..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 2
            Write-Host "  Port 5000 cleaned up" -ForegroundColor Green
        } else {
            Write-Host "  Port 5000 is free" -ForegroundColor Green
        }
    } catch {
        Write-Host "  Port 5000 is free" -ForegroundColor Green
    }
}

# Main
Write-Host ""
Write-Host "Current Status:" -ForegroundColor Cyan

if (Test-ServerRunning) {
    Write-Host "  Backend server is RUNNING" -ForegroundColor Green
    Write-Host "  URL: http://localhost:5000" -ForegroundColor Cyan
} else {
    Write-Host "  Backend server is NOT running" -ForegroundColor Red
    
    Stop-ServerOnPort
    
    Write-Host ""
    Write-Host "Starting backend server..." -ForegroundColor Cyan
    Write-Host ("=" * 80) -ForegroundColor Gray
    
    Set-Location -Path $PSScriptRoot
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm start"
    
    Write-Host ""
    Write-Host "Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    if (Test-ServerRunning) {
        Write-Host "Backend server started successfully!" -ForegroundColor Green
    } else {
        Write-Host "Server is starting... Check the new window" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host ("=" * 80) -ForegroundColor Gray
Write-Host "Quick Commands:" -ForegroundColor Cyan
Write-Host "  Test API: node testEndpoints.js" -ForegroundColor Gray
Write-Host ""
