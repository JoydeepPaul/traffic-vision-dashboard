@echo off
title TrafficVision AI — Backend Server
color 0A
echo.
echo  ############################################################
echo  #   TrafficVision AI  ^|  Python Flask Backend  ^|  v1.0    #
echo  ############################################################
echo.
echo  Starting backend API server on http://localhost:5000
echo  Press Ctrl+C to stop.
echo.

cd /d "%~dp0backend"

echo  [1/2] Installing / verifying dependencies...
pip install -r requirements.txt -q --disable-pip-version-check
if %errorlevel% neq 0 (
    echo  [ERROR] pip install failed. Make sure Python and pip are in PATH.
    pause
    exit /b 1
)

echo  [2/2] Launching Flask server...
echo.
python app.py

pause
