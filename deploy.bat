@echo off
REM CleverCreator.ai - Quick Deploy Script for Windows
REM This script helps you quickly deploy the application using Docker

echo ==========================================
echo   CleverCreator.ai - Docker Deployment
echo ==========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo X Docker is not installed!
    echo Please install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo X Docker Compose is not installed!
    echo Please install Docker Compose
    pause
    exit /b 1
)

echo [OK] Docker and Docker Compose are installed
echo.

REM Check if .env file exists
if not exist .env (
    echo [!] .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo Please edit .env file and add your Google API keys:
    echo    - GOOGLE_GENAI_API_KEY
    echo    - GOOGLE_API_KEY
    echo.
    echo After updating .env, run this script again.
    pause
    exit /b 1
)

echo [OK] .env file found
echo.

REM Check if API keys are set
findstr /C:"your_google_veo_api_key_here" .env >nul 2>&1
if not errorlevel 1 (
    echo [!] API keys not configured!
    echo Please edit .env and add your actual Google API keys.
    pause
    exit /b 1
)

echo [OK] API keys configured
echo.

echo What would you like to do?
echo 1) Build and start containers
echo 2) Stop containers
echo 3) Restart containers
echo 4) View logs
echo 5) Rebuild containers (fresh build)
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto build
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto rebuild
echo Invalid choice
pause
exit /b 1

:build
echo.
echo Building Docker images...
docker-compose build
echo.
echo Starting containers...
docker-compose up -d
echo.
echo [OK] Deployment complete!
echo.
echo Container status:
docker-compose ps
echo.
echo Access your application:
echo    Frontend: http://localhost
echo    Backend:  http://localhost:9000
goto end

:stop
echo.
echo Stopping containers...
docker-compose down
echo.
echo [OK] Containers stopped
goto end

:restart
echo.
echo Restarting containers...
docker-compose restart
echo.
echo [OK] Containers restarted
echo.
docker-compose ps
goto end

:logs
echo.
echo Showing logs (Ctrl+C to exit)...
docker-compose logs -f
goto end

:rebuild
echo.
echo Rebuilding containers (no cache)...
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo.
echo [OK] Rebuild complete!
echo.
docker-compose ps
goto end

:end
echo.
echo ==========================================
echo For more information, see DEPLOYMENT.md
echo ==========================================
pause
