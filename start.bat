@echo off
title ActiveLife Wellness Assistant AI
echo =======================================================
echo   Starting ActiveLife Wellness Assistant AI...
echo =======================================================
cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    call npm.cmd install
)

echo Building frontend...
call npm.cmd run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b 1
)

start "" http://localhost:5000
echo Server starting on http://localhost:5000 ...
node server/index.js
pause
