@echo off
REM Windows startup script for Veo Video Generator
REM Starts both backend and frontend servers

echo ============================================
echo   Veo Video Generator - Development Mode
echo ============================================
echo.

REM Clean up ALL old sessions to ensure fresh start
echo Cleaning up old server sessions...

REM Kill old CMD windows first
taskkill /FI "WINDOWTITLE eq Veo Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Veo Frontend*" /F >nul 2>&1

REM Kill Python and Node processes
powershell -ExecutionPolicy Bypass -Command "Get-Process python,node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"

timeout /t 3 /nobreak >nul
echo Cleanup complete - all old sessions killed.
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file with your GEMINI_API_KEY
    echo.
    pause
    exit /b 1
)

REM Check if backend venv exists
if not exist "backend\venv\" (
    echo ERROR: Backend virtual environment not found!
    echo Please run: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules\" (
    echo ERROR: Frontend node_modules not found!
    echo Please run: cd frontend ^&^& npm install
    echo.
    pause
    exit /b 1
)

echo Starting Backend Server...
echo Backend will run on: http://localhost:9001
echo API Docs: http://localhost:9001/docs
echo.

start "Veo Backend" cmd /k "cd backend && venv\Scripts\activate && python run.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
echo Frontend will run on: http://localhost:5173
echo.

start "Veo Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ============================================
echo   Both servers are starting...
echo ============================================
echo.
echo Backend:  http://localhost:9001
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:9001/docs
echo.
echo Press Ctrl+C in each window to stop servers
echo.

timeout /t 5 /nobreak >nul

REM Open browser
start http://localhost:5173

echo Browser opened to http://localhost:5173
echo.
echo Development servers are running!
echo Check the separate terminal windows for logs.
echo.
pause
