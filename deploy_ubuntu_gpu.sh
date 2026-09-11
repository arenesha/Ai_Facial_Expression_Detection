#!/usr/bin/env bash
# ==============================================================================
# Face Reaction AI - Ubuntu 22.04 LTS (GPU Machine) Turnkey Deployment Script
# Target Port: 8003 (0.0.0.0:8003)
# Hardware: NVIDIA GPU + WebGL / MediaPipe Acceleration
# ==============================================================================

set -e

echo -e "\033[1;36m========================================================\033[0m"
echo -e "\033[1;35m🚀 DEPLOYING FACE REACTION AI ON UBUNTU 22.04 GPU MACHINE\033[0m"
echo -e "\033[1;36m========================================================\033[0m"

# 1. Check NVIDIA GPU status
echo -e "\n\033[1;33m[1/6] Checking NVIDIA GPU Acceleration...\033[0m"
if command -v nvidia-smi &> /dev/null; then
    nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv,noheader
    echo -e "\033[1;32m✔ NVIDIA GPU Detected and Active!\033[0m"
else
    echo -e "\033[1;31m⚠ Warning: 'nvidia-smi' not found. If this is a GPU machine, ensure nvidia drivers are installed:\033[0m"
    echo -e "   sudo apt install -y nvidia-driver-535 nvidia-utils-535"
fi

# 2. Update System & Install Node.js 20 LTS
echo -e "\n\033[1;33m[2/6] Setting up Node.js 20.x LTS & Essentials...\033[0m"
sudo apt-get update -y
sudo apt-get install -y curl git build-essential ufw

if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    echo "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo -e "\033[1;32m✔ Node.js version: $(node -v)\033[0m"
echo -e "\033[1;32m✔ NPM version: $(npm -v)\033[0m"

# 3. Install Global Process Manager (PM2)
echo -e "\n\033[1;33m[3/6] Installing PM2 Process Manager...\033[0m"
sudo npm install -g pm2 serve

# 4. Install Dependencies & Build
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${SCRIPT_DIR}/face-reaction"

if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
else
    cd "$SCRIPT_DIR"
fi

echo -e "\n\033[1;33m[4/6] Installing npm packages in $(pwd)...\033[0m"
npm install --legacy-peer-deps

echo -e "\n\033[1;33m[5/6] Building Production Bundle...\033[0m"
npm run build

# 5. Configure Firewall (Port 8003)
echo -e "\n\033[1;33m[6/6] Configuring Firewall & Starting Service on 0.0.0.0:8003...\033[0m"
sudo ufw allow 8003/tcp 2>/dev/null || true

# Stop previous PM2 instance if running
pm2 stop face-reaction 2>/dev/null || true
pm2 delete face-reaction 2>/dev/null || true

# Launch application on port 8003
pm2 start "npm run preview -- --host 0.0.0.0 --port 8003" --name "face-reaction"

# Save PM2 process list for auto-restart on system reboot
pm2 save
pm2 startup | tail -n 1 | bash 2>/dev/null || true

echo -e "\n\033[1;32m========================================================\033[0m"
echo -e "\033[1;32m🎉 DEPLOYMENT COMPLETE! APP RUNNING ON PORT 8003\033[0m"
echo -e "\033[1;36m• Local URL:      http://localhost:8003\033[0m"
echo -e "\033[1;36m• Network URL:    http://$(hostname -I | awk '{print $1}'):8003\033[0m"
echo -e "\033[1;35m• PM2 Status:     pm2 status\033[0m"
echo -e "\033[1;35m• PM2 Logs:       pm2 logs face-reaction\033[0m"
echo -e "\033[1;32m========================================================\033[0m"
