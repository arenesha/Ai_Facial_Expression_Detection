@echo off
title Face Reaction AI Launcher
color 0b

:: Check if Python server is already running on port 8003
netstat -ano | findstr :8003 >nul
if %errorlevel% neq 0 (
    echo [1/2] Starting Python AI Server on port 8003...
    start "Face Reaction Python Server" /min cmd /k "python gpu_server.py"
    timeout /t 2 /nobreak >nul
) else (
    echo [1/2] Python server is already running on port 8003.
)

echo [2/2] Focusing single game window (never opens extra tabs)...

:: 1. Try Microsoft Edge App Mode (Strictly single-window, reuses existing window)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:8003
    exit
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:8003
    exit
)

:: 2. Try Google Chrome App Mode
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:8003
    exit
)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --app=http://localhost:8003
    exit
)

:: 3. Fallback
start http://localhost:8003
exit
