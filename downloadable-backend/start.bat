@echo off
REM ============================================================
REM  TrafficVision AI - Auto-Setup & Start Script (Windows)
REM ============================================================

title TrafficVision AI - Backend Setup

echo.
echo ============================================================
echo   TrafficVision AI - Local Backend Auto-Setup
echo ============================================================
echo.

REM Check for Python
echo [1/6] Checking for Python installation...
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo [OK] Python found

REM Create virtual environment if it doesn't exist
echo.
echo [2/6] Setting up virtual environment...
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
)
echo [OK] Virtual environment ready

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check for NVIDIA GPU
echo.
echo [3/6] Checking for NVIDIA GPU...
set "HAS_NVIDIA=0"
nvidia-smi >nul 2>&1
if not errorlevel 1 (
    echo [OK] NVIDIA GPU detected!
    set "HAS_NVIDIA=1"
) else (
    echo [INFO] No NVIDIA GPU detected. Will use CPU mode.
)

REM Install dependencies
echo.
echo [4/6] Installing dependencies (this may take several minutes on first run)...
echo.

python -m pip install --upgrade pip >nul 2>&1

REM Install PyTorch - use GOTO to avoid nested if issues
if "%HAS_NVIDIA%"=="1" goto :install_cuda
goto :install_cpu

:install_cuda
echo Installing PyTorch with CUDA support...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
goto :install_rest

:install_cpu
echo Installing PyTorch (CPU version)...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
goto :install_rest

:install_rest
echo Installing other dependencies...
pip install -r requirements.txt
echo.
echo [OK] Dependencies installed

REM GPU Verification
echo.
echo [5/6] Verifying GPU Setup...
python -c "import torch; print('[GPU] CUDA Available:', torch.cuda.is_available())"

REM Start the backend server
echo.
echo [6/6] Starting TrafficVision AI Backend Server...
echo.
echo ============================================================
echo   Server URL: http://localhost:5000
echo   KEEP THIS WINDOW OPEN while using the website!
echo   Website: https://trafficvision-ai-joydeep.netlify.app/
echo   Press Ctrl+C to stop the server.
echo ============================================================
echo.

python app_fastapi.py

echo.
echo Server stopped.
pause
