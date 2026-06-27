Write-Host "Installing dependencies..." -ForegroundColor Green
& npm.cmd install
Write-Host "Initializing database..." -ForegroundColor Green
& npm.cmd run db:init
Write-Host "Starting PicShare..." -ForegroundColor Green
& npm.cmd run dev
