#!/bin/bash
# ============================================================
#  TrafficVision AI — Auto-Setup & Start Script (macOS/Linux)
#  Automatically installs dependencies, detects GPU,
#  and starts the FastAPI backend server.
# ============================================================

echo ""
echo "============================================================"
echo "  TrafficVision AI - Local Backend Auto-Setup"
echo "============================================================"
echo ""

# Check for Python
echo "[1/5] Checking for Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python is not installed or not in PATH."
    echo "Please install Python 3.10+ from https://www.python.org/downloads/"
    exit 1
fi

PYVER=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
echo "[OK] Python $PYVER found"

# Create virtual environment if it doesn't exist
echo ""
echo "[2/5] Setting up virtual environment..."
if [ ! -f "venv/bin/activate" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
source venv/bin/activate
echo "[OK] Virtual environment ready"

# Check for NVIDIA GPU first
echo ""
echo "[3/6] Checking for NVIDIA GPU..."
HAS_NVIDIA=0
if command -v nvidia-smi &> /dev/null; then
    nvidia-smi &> /dev/null
    if [ $? -eq 0 ]; then
        echo "[OK] NVIDIA GPU detected! Will install CUDA-enabled PyTorch."
        HAS_NVIDIA=1
    fi
fi

if [ $HAS_NVIDIA -eq 0 ]; then
    echo "[INFO] No NVIDIA GPU detected. Will use CPU mode."
fi

# Install dependencies
echo ""
echo "[4/6] Installing dependencies (this may take several minutes on first run)..."
echo "     Please wait..."
echo ""

# Upgrade pip
python -m pip install --upgrade pip > /dev/null 2>&1

# Install PyTorch with CUDA support if NVIDIA GPU is available
if [ $HAS_NVIDIA -eq 1 ]; then
    echo "Installing PyTorch with CUDA support..."
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
    if [ $? -ne 0 ]; then
        echo "[WARNING] CUDA 12.1 install failed, trying CUDA 11.8..."
        pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
        if [ $? -ne 0 ]; then
            echo "[WARNING] CUDA install failed, falling back to CPU..."
            pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
        fi
    fi
else
    echo "Installing PyTorch (CPU version)..."
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
fi

# Install other dependencies
echo "Installing other dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo ""
    echo "[WARNING] Some packages failed. Trying alternative install..."
    pip install flask flask-cors ultralytics opencv-python numpy pandas scipy scikit-learn fastapi uvicorn pydantic
fi
echo ""
echo "[OK] Dependencies installed"

# GPU Detection
echo ""
echo "[5/6] Verifying GPU Setup..."
echo ""

python -c "import torch; cuda_ok = torch.cuda.is_available(); print('[GPU] CUDA Available:', cuda_ok); print('[GPU] Device:', torch.cuda.get_device_name(0) if cuda_ok else 'CPU (No CUDA)'); print('[GPU] CUDA Version:', torch.version.cuda if cuda_ok else 'N/A')" 2>/dev/null || echo "[INFO] GPU verification skipped"

# Start the backend server
echo ""
echo "[6/6] Starting TrafficVision AI Backend Server..."
echo ""
echo "============================================================"
echo ""
echo "  Server URL: http://localhost:5000"
echo ""
echo "  KEEP THIS WINDOW OPEN while using the website!"
echo ""
echo "  Website: https://trafficvision-ai-joydeep.netlify.app/"
echo ""
echo "  Press Ctrl+C to stop the server."
echo ""
echo "============================================================"
echo ""
echo "Starting server..."
echo ""

python app_fastapi.py
