@echo off
REM Windows batch script to run the backend server
REM Activates virtual environment and starts uvicorn

echo Starting Veo Video Generation API Backend...
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then: venv\Scripts\activate
    echo Then: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if .env file exists
if not exist "..\env" (
    echo WARNING: .env file not found in project root!
    echo Please create .env file with your GEMINI_API_KEY
    echo.
)

REM Run the server
python run.py
