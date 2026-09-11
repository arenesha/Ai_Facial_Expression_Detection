# Face Reaction — Deployment Guide (Ubuntu 22.04)

## Quick Start

```bash
# 1. Install Node.js 18+
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Clone/copy project to server
cd /path/to/face-rps-challenge

# 3. Install dependencies
npm install

# 4. Start (development mode)
chmod +x start.sh
./start.sh

# 4b. Start (production mode)
./start.sh production
```

The application will be available at:
```
http://SERVER_IP:8003
```

---

## Port Configuration

| Setting | Value |
|---------|-------|
| Port | **8003** |
| Bind address | **0.0.0.0** (all interfaces) |
| Strict port | **true** (will NOT fall back to another port) |

Configured in [`vite.config.ts`](vite.config.ts):
```ts
server: { host: '0.0.0.0', port: 8003, strictPort: true }
```

---

## Firewall (UFW)

```bash
sudo ufw allow 8003/tcp
sudo ufw reload
```

---

## GPU Support

### How face detection works in this project

Face detection runs **entirely in the browser** using [MediaPipe Face Landmarker](https://developers.google.com/mediapipe/solutions/vision/face_landmarker) via WebAssembly + WebGL/WebGPU.

- The model loads from Google's CDN in the browser
- Detection uses the browser's **WebGL GPU acceleration** (no server-side CUDA needed)
- The delegate is set to `'GPU'` in `useFaceDetection.ts` — this uses the browser's WebGL backend

**There is no server-side Python/CUDA requirement for this project.** The Vite dev server only serves static files — all ML inference happens client-side.

### Verify GPU in browser

Open browser DevTools console and check:
```javascript
// Check WebGL support
document.createElement('canvas').getContext('webgl2') ? 'WebGL2 ✓' : 'No WebGL2'
```

---

## Camera / HTTPS Requirements

Browser camera access (`navigator.mediaDevices.getUserMedia`) requires a **secure context**:

| Access method | Camera works? |
|---------------|---------------|
| `http://localhost:8003` | ✅ Yes |
| `http://127.0.0.1:8003` | ✅ Yes |
| `http://SERVER_IP:8003` | ❌ No (insecure context) |
| `https://SERVER_IP:8003` | ✅ Yes |

### For remote access, you need HTTPS. Options:

**Option A: Reverse proxy with Nginx + SSL**
```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx as reverse proxy
sudo tee /etc/nginx/sites-available/face-reaction <<EOF
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8003;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/face-reaction /etc/nginx/sites-enabled/
sudo certbot --nginx -d your-domain.com
sudo nginx -t && sudo systemctl reload nginx
```

**Option B: Chrome flag for testing (not for production)**
```
chrome://flags/#unsafely-treat-insecure-origin-as-secure
```
Add `http://SERVER_IP:8003` to the list.

---

## Process Management (systemd)

```bash
sudo tee /etc/systemd/system/face-reaction.service <<EOF
[Unit]
Description=Face Reaction App
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/path/to/face-rps-challenge
ExecStart=/usr/bin/npm run dev
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable face-reaction
sudo systemctl start face-reaction
sudo systemctl status face-reaction
```

---

## Environment Variables

No environment variables are required. All configuration is in `vite.config.ts`.

If you need to change the port:
```bash
# Edit vite.config.ts and change port: 8003 to your desired port
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8003 already in use | `sudo fuser -k 8003/tcp` |
| Camera not working | Check HTTPS setup (see above) |
| Node.js not found | Install: `sudo apt install -y nodejs` |
| npm install fails | Try: `rm -rf node_modules && npm install` |
| Build errors | Check: `npm run build` for specific errors |
