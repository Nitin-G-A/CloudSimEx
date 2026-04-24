@echo off
echo ==========================================
echo   Building Cloud Simulation JAR...
echo ==========================================

cd /d "%~dp0simulation"

echo [1/3] Cleaning previous build...
call mvn clean -q

echo [2/3] Downloading dependencies and compiling...
call mvn compile -q
if errorlevel 1 (
    echo [ERROR] Compilation failed! Check Java version with: java -version
    pause
    exit /b 1
)

echo [3/3] Packaging into fat JAR...
call mvn package -q -DskipTests
if errorlevel 1 (
    echo [ERROR] Packaging failed!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   SUCCESS! JAR built at:
echo   simulation\target\cloud-simulation-1.0-shaded.jar
echo ==========================================
echo.
echo Testing with default config (3 VMs, 10 Cloudlets)...
echo.

mkdir ..\simulation\output 2>nul
java -jar target\cloud-simulation-1.0-shaded.jar 3 10 1000 2048 1000 10000 TimeShared ..\simulation\output\results.csv

echo.
echo If you see a table above with cloudlet results, Phase 2 is COMPLETE!
pause
