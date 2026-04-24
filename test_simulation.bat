@echo off
echo ==========================================
echo   Testing Cloud Simulation JAR
echo ==========================================

cd /d "%~dp0simulation"

if not exist "target\cloud-simulation-1.0-shaded.jar" (
    echo [ERROR] JAR not found! Run build.bat first.
    pause
    exit /b 1
)

mkdir output 2>nul

echo.
echo Test 1: Small (2 VMs, 5 Cloudlets, TimeShared)
java -jar target\cloud-simulation-1.0-shaded.jar 2 5 1000 1024 500 5000 TimeShared output\test1.csv
echo.

echo Test 2: Medium (5 VMs, 15 Cloudlets, SpaceShared)
java -jar target\cloud-simulation-1.0-shaded.jar 5 15 2000 4096 1000 10000 SpaceShared output\test2.csv
echo.

echo Test 3: Large (10 VMs, 30 Cloudlets, TimeShared)
java -jar target\cloud-simulation-1.0-shaded.jar 10 30 3000 8192 2000 20000 TimeShared output\test3.csv
echo.

echo ==========================================
echo   All tests done! CSV files saved in:
echo   simulation\output\
echo ==========================================
pause
