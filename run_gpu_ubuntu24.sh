#!/bin/bash
# ==============================================================================
# 🚀 Automated Python GPU Setup & Run Script for Ubuntu 24.04 LTS
# ==============================================================================

set -e

echo "=================================================================="
echo "   ⚡ Initializing Python GPU Environment (Ubuntu 24.04 LTS)"
echo "=================================================================="

# 1. Update system & install Python 3.12 dependencies
echo "[1/6] Installing Ubuntu 24.04 system dependencies & libraries..."
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv python3-dev \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev ffmpeg build-essential

# 2. Check NVIDIA GPU Drivers
echo "[2/6] Verifying NVIDIA GPU drivers..."
if command -v nvidia-smi &> /dev/null; then
    nvidia-smi
else
    echo "⚠ Warning: nvidia-smi not found. If this machine has an NVIDIA GPU, install drivers:"
    echo "  sudo apt install -y nvidia-driver-550 nvidia-utils-550 && sudo reboot"
fi

# 3. Create & activate Python virtual environment
echo "[3/6] Setting up Python virtual environment (venv)..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Created venv directory."
fi
source venv/bin/activate
pip install --upgrade pip setuptools wheel

# 4. Install PyTorch with CUDA 12.4 acceleration
echo "[4/6] Installing PyTorch with CUDA 12.4 support..."
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124

# 5. Install project requirements
echo "[5/6] Installing MediaPipe, OpenCV, FastAPI, and dependencies..."
pip install -r requirements.txt

# 6. Run GPU Check
echo "[6/6] Verifying GPU acceleration..."
python3 check_gpu.py

echo "=================================================================="
echo "🎉 Setup complete! Choose how you want to run:"
echo "------------------------------------------------------------------"
echo " 1) Run Python GPU Server (FastAPI + WebSockets + Web UI on 8003):"
echo "    python3 gpu_server.py"
echo ""
echo " 2) Run with PM2 for 24/7 background uptime:"
echo "    sudo npm install -g pm2"
echo "    pm2 start \"./venv/bin/python3 gpu_server.py\" --name \"face-gpu-server\""
echo "    pm2 save"
echo ""
echo " 3) Run standalone camera/video detector:"
echo "    python3 detect_webcam_gpu.py"
echo "=================================================================="

# Start server immediately
read -p "Do you want to start the Python GPU server right now on port 8003? [Y/n] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
    python3 gpu_server.py
fi
