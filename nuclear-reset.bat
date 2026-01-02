@echo off
REM NUCLEAR RESET - Complete fresh start with new ports
REM Clears all caches, uses fresh ports to avoid browser/Python caching

powershell -ExecutionPolicy Bypass -File nuclear-reset.ps1
