@echo off
echo Pulling latest stealth configs from Git...
git pull origin main
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Git pull failed. Starting browser anyway...
    timeout /t 3
)
start "" "firefox.exe"
