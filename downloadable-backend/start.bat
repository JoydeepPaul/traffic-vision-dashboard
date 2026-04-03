@echo off
REM ============================================================
REM  TrafficVision AI — Auto-Setup & Start Script (Windows)
REM  Automatically installs dependencies, detects/enables GPU,
REM  downloads YOLO model, and starts the FastAPI backend server.
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
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

for /f "tokens=2 delims= " %%a in ('python --version 2^>^&1') do set PYVER=%%a
echo [OK] Python %PYVER% found

REM Create virtual environment if it doesn't exist
echo.
echo [2/6] Setting up virtual environment...
if not exist "venv" (
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

REM Install dependencies
echo.
echo [3/6] Installing dependencies (this may take a few minutes)...
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some packages may have failed. Attempting individual installs...
    pip install flask flask-cors ultralytics opencv-python numpy pandas torch scipy scikit-learn fastapi uvicorn pydantic
)
echo [OK] Dependencies installed

REM Download YOLO model if not present
echo.
echo [4/6] Checking YOLO model...
if not exist "yolo12m.pt" (
    echo Downloading YOLO model (this may take a moment)...
    python -c "from ultralytics import YOLO; model = YOLO('yolo11m.pt'); print('Model downloaded successfully')"
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Could not download default model. The system will download it on first run.
    ) else (
        echo [OK] YOLO model ready
    )
) else (
    echo [OK] YOLO model already present
)

REM GPU Detection and Enablement
echo.
echo [5/6] Detecting and configuring GPU...
echo.

REM Create a Python script for GPU detection and configuration
python -c "
import sys
import subprocess
import os

def detect_and_enable_gpu():
    gpu_info = {
        'available': False,
        'name': 'CPU',
        'vram': 'N/A',
        'cuda_version': 'N/A',
        'driver_version': 'N/A',
        'compute_capability': 'N/A'
    }
    
    try:
        import torch
        
        if torch.cuda.is_available():
            gpu_info['available'] = True
            gpu_info['name'] = torch.cuda.get_device_name(0)
            
            # Get VRAM
            total_memory = torch.cuda.get_device_properties(0).total_memory
            gpu_info['vram'] = f'{total_memory / (1024**3):.1f} GB'
            
            # Get CUDA version
            gpu_info['cuda_version'] = torch.version.cuda or 'N/A'
            
            # Get compute capability
            props = torch.cuda.get_device_properties(0)
            gpu_info['compute_capability'] = f'{props.major}.{props.minor}'
            
            print(f'[GPU DETECTED]')
            print(f'  Name: {gpu_info[\"name\"]}')
            print(f'  VRAM: {gpu_info[\"vram\"]}')
            print(f'  CUDA: {gpu_info[\"cuda_version\"]}')
            print(f'  Compute Capability: {gpu_info[\"compute_capability\"]}')
            print('[OK] NVIDIA GPU is active and ready!')
        else:
            print('[INFO] No CUDA-capable GPU detected.')
            print('[INFO] Attempting to enable NVIDIA GPU...')
            
            # Try to enable NVIDIA GPU via Windows commands
            try:
                # Check if NVIDIA driver exists
                result = subprocess.run(['nvidia-smi'], capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    print('[INFO] NVIDIA driver found. GPU may be disabled in PyTorch.')
                    print('[INFO] Try reinstalling PyTorch with CUDA support:')
                    print('       pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121')
                else:
                    print('[INFO] NVIDIA driver not found. Install from:')
                    print('       https://www.nvidia.com/drivers')
            except Exception as e:
                print(f'[INFO] Could not check NVIDIA driver: {e}')
                print('[INFO] Will proceed with CPU processing.')
            
            print('[INFO] Backend will use CPU for processing.')
            
    except ImportError:
        print('[WARNING] PyTorch not installed yet. GPU check will be done after dependency installation.')
    except Exception as e:
        print(f'[WARNING] GPU detection error: {e}')
        print('[INFO] Backend will use CPU for processing.')
    
    return gpu_info

if __name__ == '__main__':
    detect_and_enable_gpu()
"

REM Start the backend server
echo.
echo [6/6] Starting TrafficVision AI Backend Server...
echo.
echo ============================================================
echo   Backend server starting on http://localhost:5000
echo   
echo   IMPORTANT: Keep this window open while using the website!
echo   
echo   Once you see "Uvicorn running on http://0.0.0.0:5000"
echo   go to https://trafficvision-ai-joydeep.netlify.app/
echo   The website will automatically detect your local backend.
echo   
echo   Press Ctrl+C to stop the server.
echo ============================================================
echo.

python app_fastapi.py

ENDLOCAL
pause
