# WhatsApp Bulk Sender - Startup Script
# This script helps you start all services easily

Write-Host "🚀 WhatsApp Bulk Sender - Starting Services" -ForegroundColor Cyan
Write-Host "=" * 60

# Check if MongoDB is running
Write-Host "`n📦 Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($null -eq $mongoProcess) {
    Write-Host "❌ MongoDB is not running!" -ForegroundColor Red
    Write-Host "Please start MongoDB first:" -ForegroundColor Yellow
    Write-Host "  - Windows: Run 'mongod' in a separate terminal" -ForegroundColor Gray
    Write-Host "  - Or use MongoDB Atlas cloud service" -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
}

# Check if Redis is running
Write-Host "`n📦 Checking Redis..." -ForegroundColor Yellow

$redisService = Get-Service -Name "Redis" -ErrorAction SilentlyContinue
$redisProcess = Get-Process redis-server -ErrorAction SilentlyContinue

if ($redisService.Status -eq 'Running') {
    Write-Host "✅ Redis is running (Windows Service)" -ForegroundColor Green
}
elseif ($null -ne $redisProcess) {
    Write-Host "✅ Redis is running (Process)" -ForegroundColor Green
}
else {
    Write-Host "❌ Redis is not running!" -ForegroundColor Red
    Write-Host "Please start Redis first:" -ForegroundColor Yellow
    Write-Host "  - Windows: Run 'redis-server' in a separate terminal" -ForegroundColor Gray
    Write-Host "  - Or check if 'Redis' service is installed and started" -ForegroundColor Gray
    Write-Host ""
}

# Check if .env exists
Write-Host "`n⚙️  Checking Configuration..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ backend/.env not found!" -ForegroundColor Red
    Write-Host "Please create backend/.env from backend/.env.example" -ForegroundColor Yellow
    Write-Host "See QUICKSTART.md for detailed instructions" -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host "✅ Backend configuration found" -ForegroundColor Green
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "⚠️  frontend/.env not found (creating default)..." -ForegroundColor Yellow
    "VITE_API_URL=http://localhost:5000" | Out-File -FilePath "frontend\.env" -Encoding UTF8
    Write-Host "✅ Frontend configuration created" -ForegroundColor Green
}

Write-Host "`n" + "=" * 60
Write-Host "🚀 Launching Services..." -ForegroundColor Cyan
Write-Host "1. Starting Backend Server... (New Window)" -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Write-Host "2. Starting Frontend... (New Window)" -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "3. Opening Browser..." -ForegroundColor White
Start-Process "http://localhost:5173"

Write-Host "`n✅ All services started!" -ForegroundColor Green
Write-Host "⚠️  Note: Keep the two new PowerShell windows open." -ForegroundColor Yellow
Write-Host "=" * 60 + "`n"
