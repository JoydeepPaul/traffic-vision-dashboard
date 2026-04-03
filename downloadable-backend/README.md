# TrafficVision AI - Local Backend

This folder contains everything needed to run the TrafficVision AI backend on your local machine.

## Quick Start

### Windows
1. Double-click `start.bat`
2. Wait for automatic setup (first run takes a few minutes)
3. Backend will start on http://localhost:5000
4. Go to https://trafficvision-ai-joydeep.netlify.app/ and use the system!

### macOS / Linux
1. Open Terminal in this folder
2. Run: `chmod +x start.sh && ./start.sh`
3. Wait for automatic setup
4. Backend will start on http://localhost:5000
5. Go to https://trafficvision-ai-joydeep.netlify.app/ and use the system!

## What Gets Installed

- Python virtual environment (isolated from your system Python)
- All required dependencies (PyTorch, YOLO, FastAPI, etc.)
- YOLO model (auto-downloaded on first run, ~50MB)
- GPU drivers are auto-detected (NVIDIA CUDA, AMD ROCm, Apple MPS)

## GPU Support

The setup script automatically:
- Detects your GPU (NVIDIA, AMD, or Apple Silicon)
- Enables CUDA/ROCm/MPS if available
- Shows GPU specs in the website's top-right corner
- Falls back to CPU if no GPU is found

For NVIDIA GPUs, ensure you have:
- NVIDIA drivers installed (https://www.nvidia.com/drivers)
- CUDA Toolkit (optional, PyTorch includes CUDA runtime)

### For Best GPU Performance (NVIDIA)

If GPU is not detected but you have an NVIDIA card:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

## Files Included

- `app_fastapi.py` - FastAPI backend server with GPU status API
- `pipeline.py` - Traffic analysis pipeline with YOLO + BoTSORT
- `custom-botsort.yaml` - Tracker configuration
- `requirements.txt` - Python dependencies
- `start.bat` - Windows auto-setup script
- `start.sh` - macOS/Linux auto-setup script

## How It Works

1. **Auto-Setup**: The start script creates a virtual environment and installs all dependencies
2. **GPU Detection**: Automatically detects and configures available GPU
3. **Model Download**: Downloads the YOLO model on first run
4. **Server Start**: Starts FastAPI backend on port 5000
5. **Website Connection**: The website auto-connects to your local backend

## Troubleshooting

### "Python not found"
Install Python 3.10+ from https://www.python.org/downloads/
Make sure to check "Add Python to PATH" during installation.

### GPU not detected
1. Install NVIDIA drivers: https://www.nvidia.com/drivers
2. Reinstall PyTorch with CUDA:
   ```
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

### Port 5000 already in use
Edit `app_fastapi.py` and change the port number at the bottom of the file.

### Backend shows as "Offline" on website
1. Make sure the terminal window running the backend is still open
2. Check if the server is running: visit http://localhost:5000/api/health in your browser
3. Try restarting the backend by closing the terminal and running `start.bat` again

## System Requirements

- **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Python**: 3.10 or higher
- **RAM**: 8GB minimum, 16GB recommended
- **Disk**: ~2GB for dependencies and model
- **GPU** (optional): NVIDIA GPU with 4GB+ VRAM for best performance
