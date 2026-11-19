@echo off
cd /d "%~dp0"
echo ========================================
echo  JUARAMETACORP - CEK FOLDER CMS
echo ========================================
echo Folder aktif: %CD%
echo.
echo Jika benar, tampil juarametacorp-website@2.0.0 dan cms:setup:
call npm runnn
echo.
pause
