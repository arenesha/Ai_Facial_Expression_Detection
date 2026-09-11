# 🚀 Ubuntu 22.04 LTS GPU Machine Deployment Guide

This repository contains the complete **Face Reaction AI** & **Face RPS Challenge** applications optimized for deployment on an **Ubuntu 22.04 LTS GPU server** listening on `0.0.0.0:8003`.

---

## ⚡ Quick Deployment Command

Run the automated setup script directly on your Ubuntu 22.04 machine:

```bash
chmod +x deploy_ubuntu_gpu.sh start_gpu.sh
./deploy_ubuntu_gpu.sh
```

---

## 📋 Manual Deployment Steps

### 1. System Requirements & NVIDIA GPU Drivers
Ensure NVIDIA drivers are installed on Ubuntu 22.04:
```bash
nvidia-smi
```
If `nvidia-smi` is missing, install the drivers:
```bash
sudo apt update
sudo apt install -y nvidia-driver-535 nvidia-utils-535
sudo reboot
```

### 2. Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential git
```

### 3. Install & Build Application
```bash
cd face-reaction
npm install --legacy-peer-deps
npm run build
```

### 4. Run Server on 0.0.0.0:8003 with PM2 (24/7 Uptime)
```bash
sudo npm install -g pm2
pm2 start "npm run preview -- --host 0.0.0.0 --port 8003" --name "face-reaction"
pm2 save
pm2 startup
```

### 5. Open Firewall Port 8003
```bash
sudo ufw allow 8003/tcp
sudo ufw reload
```

---

## 🎥 Camera / WebRTC HTTPS Note
Modern web browsers (Chrome, Edge, Safari, Firefox) require **HTTPS** or `localhost` to allow camera permissions (`navigator.mediaDevices.getUserMedia`).

If accessing the game over a domain or public IP, set up an Nginx reverse proxy with SSL (Certbot Let's Encrypt):

### Sample Nginx SSL Configuration (`/etc/nginx/sites-available/face-reaction`)
```nginx
server {
    listen 80;
    server_name game.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name game.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/game.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/game.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
