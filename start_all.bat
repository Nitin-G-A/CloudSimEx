@echo off
echo ==========================================
echo   Cloud Simulation Platform
echo   Starting all services...
echo ==========================================
echo.

cd /d "%~dp0"

:: Check JAR exists
if not exist "simulation\target\cloud-simulation-1.0.jar" (
    echo [ERROR] JAR not found! Run build.bat first.
    pause
    exit /b 1
)

echo [1/2] Starting Flask Backend on port 5000...
start "Cloud Sim Backend" cmd /k "cd /d %~dp0backend && python app.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo [2/2] Starting React Frontend on port 3000...
start "Cloud Sim Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ==========================================
echo   Both services starting!
echo   Backend:  http://localhost:5000/health
echo   Frontend: http://localhost:3000
echo ==========================================
echo.
echo Close the two terminal windows to stop.
pause
