# 🚀 Ubuntu 24.04 LTS GPU Deployment Guide

This repository contains both:
1. **Python GPU Backend (`.py`)**: High-performance PyTorch + CUDA + MediaPipe + FastAPI server running directly on your Ubuntu 24.04 NVIDIA GPU on port `8000`.
2. **React Web Game (`face-reaction`)**: Interactive cyber-themed frontend listening on port `8003`.

---

## ⚡ 1-Minute Quick Start on Ubuntu 24.04 LTS

On your Ubuntu 24.04 GPU machine, run:

```bash
# 1. Give execution permissions to scripts
chmod +x run_gpu_ubuntu24.sh deploy_ubuntu_gpu.sh start_gpu.sh

# 2. Run the automated Python GPU setup & server
./run_gpu_ubuntu24.sh
```

---

## 🐍 Option 1: Running Python Files on the GPU Machine

Ubuntu 24.04 ships with **Python 3.12**, which enforces isolated virtual environments (`venv`).

### Step 1: Install System & CUDA Libraries
```bash
sudo apt-get update -y
sudo apt-get install -y python3 python3-pip python3-venv python3-dev \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev ffmpeg build-essential
```

### Step 2: Create & Activate Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
```

### Step 3: Install PyTorch with CUDA 12.4 & Requirements
```bash
# Install PyTorch compiled for CUDA 12.4
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124

# Install OpenCV, MediaPipe, FastAPI, Uvicorn, WebSockets
pip install -r requirements.txt
```

### Step 4: Verify GPU Acceleration
```bash
python3 check_gpu.py
```
Expected output:
```text
✓ nvidia-smi command successful!
✓ PyTorch version: 2.x.x+cu124
✓ CUDA Available: True
✓ GPU Device Count: 1
  - Device [0]: NVIDIA GeForce RTX / Tesla / A10G / L4 ...
✓ GPU Tensor Matrix Multiplication test passed on CUDA!
🎉 STATUS: GPU Machine is ready for Python AI acceleration!
```

---

## 🎯 Running Python Scripts

### 1. Python GPU FastAPI + WebSocket Server (Recommended for Cloud GPU)
```bash
source venv/bin/activate
python3 gpu_server.py
```
- **Live Cyberpunk Web Camera Interface**: Open `http://<YOUR_SERVER_IP>:8000` in your browser.
- **REST Prediction Endpoint**: `POST http://<YOUR_SERVER_IP>:8000/predict`
- **Real-Time WebSocket Stream**: `ws://<YOUR_SERVER_IP>:8000/ws`
- **GPU Health Check**: `GET http://<YOUR_SERVER_IP>:8000/health`

### 2. Standalone Webcam / Video Script (Local GPU Display)
```bash
source venv/bin/activate

# For local connected webcam:
python3 detect_webcam_gpu.py --source 0

# For a video file:
python3 detect_webcam_gpu.py --source demo.mp4

# For headless cloud server without GUI window:
python3 detect_webcam_gpu.py --source 0 --no-window
```

### 3. Keep Python Server Running 24/7 (PM2 Process Manager)
```bash
sudo apt install -y nodejs npm
sudo npm install -g pm2

# Start Python GPU server in the background
pm2 start "./venv/bin/python3 gpu_server.py" --name "face-gpu-server"
pm2 save
pm2 startup
```

---

## 🌐 Option 2: Running the React Web Game (Port 8003)

If you want to run the full frontend game:
```bash
cd face-reaction
npm install --legacy-peer-deps
npm run build
pm2 start "npm run preview -- --host 0.0.0.0 --port 8003" --name "face-reaction"
pm2 save
```

---

## 🛡️ Firewall Configuration
Ensure ports `8000` (Python GPU Server) and `8003` (Web Game) are allowed:
```bash
sudo ufw allow 8000/tcp
sudo ufw allow 8003/tcp
sudo ufw reload
```
