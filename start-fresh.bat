@echo off
REM Smart Startup - Auto-detects free port and starts fresh session
REM Usage:
REM   start-fresh.bat           - Auto-detect free port
REM   start-fresh.bat 9002      - Use specific port 9002

if "%1"=="" (
    powershell -ExecutionPolicy Bypass -File start-fresh.ps1
) else (
    powershell -ExecutionPolicy Bypass -File start-fresh.ps1 -Port %1
)
