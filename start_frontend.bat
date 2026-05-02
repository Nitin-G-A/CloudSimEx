@echo off
echo ==========================================
echo   Cloud Simulation Frontend
echo   Starting React on port 3000...
echo ==========================================

cd /d "%~dp0frontend"

echo [1/2] Installing dependencies (first time takes 2-3 mins)...
call npm install

echo [2/2] Starting React app...
echo.
echo   Frontend: http://localhost:3000
echo   Backend must be running on: http://localhost:5000
echo   Press Ctrl+C to stop
echo.

set ALLOWED_HOSTS=all
npm start
