@echo off
echo =============================================
echo  Citelytics - Starting Backend Server
echo =============================================
cd /d "%~dp0backend"
python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0
