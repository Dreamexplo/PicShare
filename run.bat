New-Item -ItemType File -Path "E:\XML\picture_books\uploads\.gitkeep" -Force | Out-Null
New-Item -ItemType File -Path "E:\XML\picture_books\uploads\originals\.gitkeep" -Force | Out-Null
New-Item -ItemType File -Path "E:\XML\picture_books\uploads\thumbnails\.gitkeep" -Force | Out-Null

@'
@echo off
echo Installing dependencies...
call npm install
echo Initializing database...
call npm run db:init
echo Starting PicShare...
npm run dev
