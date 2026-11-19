@echo off
cd /d "%~dp0"
echo ========================================
echo  JUARAMETACORP - WEBSITE + CMS
echo ========================================
echo Website: http://localhost:3000/
echo Admin:   http://localhost:3000/admin
echo Tekan Ctrl+C untuk menghentikan server.
echo.
call npm run dev
pause
