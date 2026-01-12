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
} else {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
}

# Check if Redis is running
Write-Host "`n📦 Checking Redis..." -ForegroundColor Yellow
$redisProcess = Get-Process redis-server -ErrorAction SilentlyContinue
if ($null -eq $redisProcess) {
    Write-Host "❌ Redis is not running!" -ForegroundColor Red
    Write-Host "Please start Redis first:" -ForegroundColor Yellow
    Write-Host "  - Windows: Run 'redis-server' in a separate terminal" -ForegroundColor Gray
    Write-Host "  - Or use Redis Cloud service" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "✅ Redis is running" -ForegroundColor Green
}

# Check if .env exists
Write-Host "`n⚙️  Checking Configuration..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ backend/.env not found!" -ForegroundColor Red
    Write-Host "Please create backend/.env from backend/.env.example" -ForegroundColor Yellow
    Write-Host "See QUICKSTART.md for detailed instructions" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "✅ Backend configuration found" -ForegroundColor Green
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "⚠️  frontend/.env not found (creating default)..." -ForegroundColor Yellow
    "VITE_API_URL=http://localhost:5000" | Out-File -FilePath "frontend\.env" -Encoding UTF8
    Write-Host "✅ Frontend configuration created" -ForegroundColor Green
}

Write-Host "`n" + "=" * 60
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure MongoDB and Redis are running" -ForegroundColor White
Write-Host "2. Configure backend/.env with your WhatsApp API credentials" -ForegroundColor White
Write-Host "3. Open 2 terminals and run:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open your browser to http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed setup instructions, see QUICKSTART.md" -ForegroundColor Cyan
Write-Host "=" * 60 + "`n"
