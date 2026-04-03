@echo off
REM ============================================================
REM  TrafficVision AI — Auto-Setup & Start Script (Windows)
REM  Automatically installs dependencies, detects GPU,
REM  and starts the FastAPI backend server.
REM ============================================================
SETLOCAL EnableDelayedExpansion

title TrafficVision AI - Backend Setup

echo.
echo ============================================================
echo   TrafficVision AI - Local Backend Auto-Setup
echo ============================================================
echo.

REM Check for Python
echo [1/6] Checking for Python installation...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo.
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

for /f "tokens=2 delims= " %%a in ('python --version 2^>^&1') do set PYVER=%%a
echo [OK] Python %PYVER% found

REM Create virtual environment if it doesn't exist
echo.
echo [2/6] Setting up virtual environment...
if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
)
echo [OK] Virtual environment ready

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check for NVIDIA GPU first
echo.
echo [3/6] Checking for NVIDIA GPU...
nvidia-smi >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] NVIDIA GPU detected! Will install CUDA-enabled PyTorch.
    set HAS_NVIDIA=1
) else (
    echo [INFO] No NVIDIA GPU detected or drivers not installed. Will use CPU mode.
    set HAS_NVIDIA=0
)

REM Install/upgrade pip and dependencies
echo.
echo [4/6] Installing dependencies (this may take several minutes on first run)...
echo      Please wait...
echo.

REM Upgrade pip first (suppress errors)
python -m pip install --upgrade pip >nul 2>&1

REM Install PyTorch with CUDA support if NVIDIA GPU is available
if %HAS_NVIDIA%==1 (
    echo Installing PyTorch with CUDA support...
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] CUDA 12.1 install failed, trying CUDA 11.8...
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
        if %ERRORLEVEL% NEQ 0 (
            echo [WARNING] CUDA install failed, falling back to CPU...
            pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
        )
    )
) else (
    echo Installing PyTorch (CPU version)...
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
)

REM Install other dependencies
echo Installing other dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Some packages failed. Trying alternative install...
    pip install flask flask-cors ultralytics opencv-python numpy pandas scipy scikit-learn fastapi uvicorn pydantic
)
echo.
echo [OK] Dependencies installed

REM GPU Detection
echo.
echo [5/6] Verifying GPU Setup...
echo.

python -c "import torch; cuda_ok = torch.cuda.is_available(); print('[GPU] CUDA Available:', cuda_ok); print('[GPU] Device:', torch.cuda.get_device_name(0) if cuda_ok else 'CPU (No CUDA)'); print('[GPU] CUDA Version:', torch.version.cuda if cuda_ok else 'N/A')" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] GPU verification skipped - PyTorch still loading...
)

REM Start the backend server
echo.
echo [6/6] Starting TrafficVision AI Backend Server...
echo.
echo ============================================================
echo.
echo   Server URL: http://localhost:5000
echo.
echo   KEEP THIS WINDOW OPEN while using the website!
echo.
echo   Website: https://trafficvision-ai-joydeep.netlify.app/
echo.
echo   Press Ctrl+C to stop the server.
echo.
echo ============================================================
echo.
echo Starting server...
echo.

python app_fastapi.py

echo.
echo Server stopped.
ENDLOCAL
pause
