#!/bin/bash
# ============================================================
#  TrafficVision AI — Auto-Setup & Start Script (macOS/Linux)
#  Automatically installs dependencies, detects/enables GPU,
#  downloads YOLO model, and starts the FastAPI backend server.
# ============================================================

set -e

echo ""
echo "============================================================"
echo "  TrafficVision AI - Local Backend Auto-Setup"
echo "============================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check for Python
echo -e "${BLUE}[1/6] Checking for Python installation...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    PIP_CMD="pip"
else
    echo -e "${RED}[ERROR] Python is not installed or not in PATH.${NC}"
    echo "Please install Python 3.10+ from https://www.python.org/downloads/"
    exit 1
fi

PYVER=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}[OK] Python $PYVER found${NC}"

# Create virtual environment if it doesn't exist
echo ""
echo -e "${BLUE}[2/6] Setting up virtual environment...${NC}"
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate virtual environment
source venv/bin/activate
echo -e "${GREEN}[OK] Virtual environment ready${NC}"

# Install dependencies
echo ""
echo -e "${BLUE}[3/6] Installing dependencies (this may take a few minutes)...${NC}"
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt || {
    echo -e "${YELLOW}[WARNING] Some packages may have failed. Attempting individual installs...${NC}"
    pip install flask flask-cors ultralytics opencv-python numpy pandas torch scipy scikit-learn fastapi uvicorn pydantic
}
echo -e "${GREEN}[OK] Dependencies installed${NC}"

# Download YOLO model if not present
echo ""
echo -e "${BLUE}[4/6] Checking YOLO model...${NC}"
if [ ! -f "yolo12m.pt" ]; then
    echo "Downloading YOLO model (this may take a moment)..."
    python3 -c "from ultralytics import YOLO; model = YOLO('yolo11m.pt'); print('Model downloaded successfully')" || {
        echo -e "${YELLOW}[WARNING] Could not download default model. The system will download it on first run.${NC}"
    }
else
    echo -e "${GREEN}[OK] YOLO model already present${NC}"
fi

# GPU Detection and Enablement
echo ""
echo -e "${BLUE}[5/6] Detecting and configuring GPU...${NC}"
echo ""

python3 << 'EOF'
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
            print(f'  Name: {gpu_info["name"]}')
            print(f'  VRAM: {gpu_info["vram"]}')
            print(f'  CUDA: {gpu_info["cuda_version"]}')
            print(f'  Compute Capability: {gpu_info["compute_capability"]}')
            print('[OK] NVIDIA GPU is active and ready!')
        
        # Check for AMD GPU (ROCm)
        elif hasattr(torch.version, 'hip') and torch.version.hip:
            gpu_info['available'] = True
            gpu_info['name'] = 'AMD GPU (ROCm)'
            print('[GPU DETECTED] AMD GPU with ROCm support')
        
        # Check for Apple Silicon
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            gpu_info['available'] = True
            gpu_info['name'] = 'Apple Silicon (MPS)'
            print('[GPU DETECTED] Apple Silicon with MPS support')
            print('[OK] Apple Silicon GPU is active and ready!')
            
        else:
            print('[INFO] No GPU detected.')
            print('[INFO] Backend will use CPU for processing.')
            
            # Check for NVIDIA driver
            try:
                result = subprocess.run(['nvidia-smi'], capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    print('[INFO] NVIDIA driver found but CUDA not available in PyTorch.')
                    print('[INFO] Try reinstalling PyTorch with CUDA:')
                    print('       pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121')
            except:
                pass
            
    except ImportError:
        print('[WARNING] PyTorch not installed yet.')
    except Exception as e:
        print(f'[WARNING] GPU detection error: {e}')
        print('[INFO] Backend will use CPU for processing.')
    
    return gpu_info

if __name__ == '__main__':
    detect_and_enable_gpu()
EOF

# Start the backend server
echo ""
echo -e "${BLUE}[6/6] Starting TrafficVision AI Backend Server...${NC}"
echo ""
echo "============================================================"
echo "  Backend server starting on http://localhost:5000"
echo ""
echo "  IMPORTANT: Keep this window open while using the website!"
echo ""
echo "  Once you see \"Uvicorn running on http://0.0.0.0:5000\""
echo "  go to https://trafficvision-ai-joydeep.netlify.app/"
echo "  The website will automatically detect your local backend."
echo ""
echo "  Press Ctrl+C to stop the server."
echo "============================================================"
echo ""

python app_fastapi.py
