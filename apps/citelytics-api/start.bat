@echo off
echo ============================================
echo   Citelytics API - Startup Script
echo ============================================
echo.

cd /d "%~dp0"

if not exist ".venv\Scripts\uvicorn.exe" (
    echo [ERROR] Virtual environment not set up.
    echo Run: python -m venv .venv ^&^& .venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)

echo [OK] Virtual environment found.
echo Starting Citelytics API on http://localhost:8000 ...
echo Docs available at http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop.
echo.

.venv\Scripts\uvicorn.exe main:app --reload --port 8000 --host 0.0.0.0
