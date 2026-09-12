@echo off
title Face Reaction AI Game Launcher
color 0b
echo ====================================================================
echo             STARTING FACE REACTION AI (PYTHON GPU SERVER)
echo ====================================================================
echo.
echo 1. Launching Python GPU Server on http://localhost:8003 ...
start "Face Reaction Python Server" cmd /k "python gpu_server.py"

echo 2. Waiting 2 seconds for server to initialize...
timeout /t 2 /nobreak >nul

echo 3. Opening browser at http://localhost:8003 ...
start http://localhost:8003

echo.
echo ====================================================================
echo  Server is now running! You can close this launcher window anytime.
echo ====================================================================
timeout /t 3
exit
