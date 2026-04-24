@echo off
echo ==========================================
echo   Cloud Simulation Backend
echo   Starting Flask API on port 5000...
echo ==========================================

cd /d "%~dp0backend"

echo [1/2] Installing dependencies...
pip install -r requirements.txt -q

echo [2/2] Starting Flask server...
echo.
echo   API running at: http://localhost:5000
echo   Test it at:     http://localhost:5000/health
echo   Press Ctrl+C to stop
echo.

python app.py
pause
