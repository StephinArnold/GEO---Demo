@echo off
title Citelytics Launcher
echo ========================================================
echo   Citelytics - Citation Likelihood Prediction System
echo ========================================================
echo.
echo [1/2] Starting Python FastAPI Backend (Port 8000)...
start "Citelytics Backend" cmd /k "cd /d %~dp0citation-predictor\backend && python -m uvicorn main:app --reload --port 8000"

echo [2/2] Starting React + Vite Frontend (Port 5173)...
start "Citelytics Frontend" cmd /k "cd /d %~dp0citation-predictor\frontend && npm run dev"

echo.
echo Citelytics is launching!
echo  - Frontend Dashboard: http://localhost:5173
echo  - Backend API Docs:   http://localhost:8000/docs
echo.
echo Keep both terminal windows open while using the app.
echo ========================================================
pause
