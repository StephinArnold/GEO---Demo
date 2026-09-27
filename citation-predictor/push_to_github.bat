@echo off
REM ======================================================
REM  Citelytics — Push to GitHub
REM  Run this after creating the repo at github.com/new
REM ======================================================

echo.
echo [1/3] Setting remote origin...
git remote add origin https://github.com/StephinArnold/citelytics.git

echo.
echo [2/3] Renaming branch to main...
git branch -M main

echo.
echo [3/3] Pushing to GitHub...
git push -u origin main

echo.
echo Done! Visit: https://github.com/StephinArnold/citelytics
pause
