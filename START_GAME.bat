@echo off
title Face Reaction AI Game Launcher
color 0b

echo [1/2] Checking Python AI Server on port 8003...
netstat -ano | findstr :8003 >nul
if %errorlevel% neq 0 (
    echo Starting Python GPU server in background...
    start "Face Reaction Python Server" /min cmd /k "python gpu_server.py"
    timeout /t 2 /nobreak >nul
) else (
    echo Server is already active on port 8003.
)

echo [2/2] Opening in single dedicated window (no extra tabs)...
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    start msedge --app=http://localhost:8003
    exit
)

where chrome >nul 2>nul
if %errorlevel% equ 0 (
    start chrome --app=http://localhost:8003
    exit
)

start http://localhost:8003
exit
