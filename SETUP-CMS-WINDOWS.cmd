@echo off
cd /d "%~dp0"
echo ========================================
echo  JUARAMETACORP - SETUP CMS
echo ========================================
echo Folder aktif: %CD%
echo Periksa file .env SMTP Anda sebelum melanjutkan.
echo.
call npm install
if errorlevel 1 (
 echo ERROR: npm install gagal. Periksa koneksi internet atau Node.js.
 pause
 exit /b 1
)
echo.
echo Buat password CMS (minimal 12 karakter):
call npm run cms:setup
if errorlevel 1 (
 echo ERROR: Setup admin gagal.
 pause
 exit /b 1
)
echo.
echo Selesai. Jalankan JALANKAN-WEBSITE-WINDOWS.cmd
pause
