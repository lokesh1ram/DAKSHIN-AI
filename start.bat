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

if not exist dist (
    echo Building frontend...
    call npm.cmd run build
)

start "" http://localhost:5000
echo Server starting on http://localhost:5000 ...
node server/index.js
pause
