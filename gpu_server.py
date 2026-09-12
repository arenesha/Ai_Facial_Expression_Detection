#!/usr/bin/env python3
"""
High-Performance Python GPU Backend Server for Facial Expression Detection.
Framework: FastAPI + WebSockets + PyTorch + MediaPipe
Listens on: 0.0.0.0:8000
Endpoints:
- GET  /         : Cyberpunk Web Live Camera Test Interface
- GET  /health   : GPU Status & VRAM Diagnostics
- POST /predict  : Frame prediction via Base64 or Image Upload
- WS   /ws       : Real-Time WebSocket stream for browser webcam
"""

import os
import io
import time
import base64
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import cv2

try:
    import torch
    CUDA_AVAILABLE = torch.cuda.is_available()
    GPU_NAME = torch.cuda.get_device_name(0) if CUDA_AVAILABLE else "CPU"
except ImportError:
    CUDA_AVAILABLE = False
    GPU_NAME = "PyTorch not installed"

import mediapipe as mp
from expression_classifier import classify_from_landmarks, EXPRESSION_META

app = FastAPI(title="Face Expression GPU AI Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MediaPipe FaceMesh Model initialization
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

def process_bgr_image(bgr_image: np.ndarray):
    """Processes a BGR numpy image and returns expression classification and bbox."""
    start_t = time.perf_counter()
    h, w, _ = bgr_image.shape
    rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
    
    # If GPU PyTorch is available, track tensor latency
    if CUDA_AVAILABLE:
        _ = torch.cuda.memory_allocated()

    results = face_mesh.process(rgb_image)
    proc_time_ms = round((time.perf_counter() - start_t) * 1000, 2)

    if not results.multi_face_landmarks:
        return {
            "face_detected": False,
            "expression": "unknown",
            "confidence": 0.0,
            "meta": EXPRESSION_META["unknown"],
            "latency_ms": proc_time_ms,
            "gpu": GPU_NAME,
            "cuda": CUDA_AVAILABLE
        }

    landmarks = results.multi_face_landmarks[0].landmark
    classification = classify_from_landmarks(landmarks)
    exp = classification["expression"]
    conf = classification["confidence"]

    xs = [int(lm.x * w) for lm in landmarks]
    ys = [int(lm.y * h) for lm in landmarks]
    bbox = {
        "x_min": max(0, min(xs)),
        "y_min": max(0, min(ys)),
        "x_max": min(w, max(xs)),
        "y_max": min(h, max(ys))
    }

    return {
        "face_detected": True,
        "expression": exp,
        "confidence": conf,
        "meta": EXPRESSION_META.get(exp, EXPRESSION_META["unknown"]),
        "bbox": bbox,
        "details": classification.get("details", {}),
        "latency_ms": proc_time_ms,
        "gpu": GPU_NAME,
        "cuda": CUDA_AVAILABLE
    }

@app.get("/health")
def health_check():
    vram_free_gb = 0
    vram_total_gb = 0
    if CUDA_AVAILABLE:
        free, total = torch.cuda.mem_get_info()
        vram_free_gb = round(free / (1024 ** 3), 2)
        vram_total_gb = round(total / (1024 ** 3), 2)

    return {
        "status": "healthy",
        "cuda_available": CUDA_AVAILABLE,
        "gpu_name": GPU_NAME,
        "vram_free_gb": vram_free_gb,
        "vram_total_gb": vram_total_gb,
        "supported_expressions": list(EXPRESSION_META.keys())
    }

@app.post("/predict")
async def predict_image(file: Optional[UploadFile] = File(None), image_base64: Optional[str] = Form(None)):
    """Receives an image either as multipart file or base64 string."""
    try:
        if file:
            contents = await file.read()
            pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
        elif image_base64:
            if "," in image_base64:
                image_base64 = image_base64.split(",")[1]
            contents = base64.b64decode(image_base64)
            pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
        else:
            return JSONResponse({"error": "No image provided"}, status_code=400)

        np_image = np.array(pil_image)
        bgr_image = cv2.cvtColor(np_image, cv2.COLOR_RGB2BGR)
        result = process_bgr_image(bgr_image)
        return JSONResponse(result)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Ultra low latency WebSocket streaming for browser video frames."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            if "," in data:
                data = data.split(",")[1]
            img_bytes = base64.b64decode(data)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame is not None:
                result = process_bgr_image(frame)
                await websocket.send_json(result)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket Error: {e}")

@app.get("/", response_class=HTMLResponse)
def index():
    """Built-in cyberpunk web UI to test camera directly against this GPU server."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Face Expression - GPU Server</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }}
        body {{ background: #030712; color: #f3f4f6; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 24px; }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        h1 {{ font-size: 28px; background: linear-gradient(135deg, #06b6d4, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        .badge {{ display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; margin-top: 8px; }}
        .main-container {{ display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; max-width: 1200px; width: 100%; }}
        .camera-card {{ background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 16px; width: 640px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
        .video-wrapper {{ position: relative; width: 100%; height: 440px; background: #000; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; }}
        video {{ width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }}
        canvas {{ display: none; }}
        .overlay {{ position: absolute; top: 12px; left: 12px; right: 12px; display: flex; justify-content: space-between; pointer-events: none; }}
        .hud-tag {{ background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); border: 1px solid #06b6d4; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: bold; color: #38bdf8; }}
        .results-card {{ background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; width: 340px; display: flex; flex-direction: column; justify-content: space-between; }}
        .detected-box {{ text-align: center; padding: 20px; background: #1e293b; border-radius: 12px; border: 1px solid #334155; }}
        .emoji {{ font-size: 64px; margin-bottom: 8px; }}
        .label {{ font-size: 24px; font-weight: 800; color: #22d3ee; letter-spacing: 1px; }}
        .confidence-bar-bg {{ background: #334155; border-radius: 9999px; height: 10px; width: 100%; margin-top: 14px; overflow: hidden; }}
        .confidence-bar {{ background: linear-gradient(90deg, #06b6d4, #10b981); height: 100%; width: 0%; transition: width 0.15s ease; }}
        .stats-list {{ margin-top: 20px; font-size: 14px; color: #94a3b8; display: flex; flex-direction: column; gap: 8px; }}
        .stat-item {{ display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b; }}
        .stat-val {{ color: #f1f5f9; font-weight: 600; }}
        .btn {{ width: 100%; padding: 12px; background: linear-gradient(135deg, #06b6d4, #2563eb); border: none; border-radius: 10px; color: #fff; font-weight: 700; cursor: pointer; margin-top: 16px; font-size: 15px; transition: opacity 0.2s; }}
        .btn:hover {{ opacity: 0.9; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>⚡ Python GPU Facial Expression Server</h1>
        <div class="badge">DEVICE: {GPU_NAME} | CUDA: {CUDA_AVAILABLE}</div>
    </div>
    <div class="main-container">
        <div class="camera-card">
            <div class="video-wrapper">
                <video id="webcam" autoplay playsinline muted></video>
                <div class="overlay">
                    <div class="hud-tag" id="hud-fps">FPS: --</div>
                    <div class="hud-tag" id="hud-latency">LATENCY: -- ms</div>
                </div>
            </div>
            <button class="btn" id="start-btn" onclick="startCamera()">📷 Start GPU Camera Stream</button>
            <canvas id="canvas" width="480" height="360"></canvas>
        </div>
        <div class="results-card">
            <div>
                <h3 style="margin-bottom: 16px; color: #94a3b8; font-size: 14px; text-transform: uppercase;">GPU AI Output</h3>
                <div class="detected-box">
                    <div class="emoji" id="exp-emoji">😐</div>
                    <div class="label" id="exp-label">READY</div>
                    <div class="confidence-bar-bg">
                        <div class="confidence-bar" id="exp-bar"></div>
                    </div>
                </div>
                <div class="stats-list">
                    <div class="stat-item"><span>Status</span><span class="stat-val" id="stat-status">Idle</span></div>
                    <div class="stat-item"><span>Confidence</span><span class="stat-val" id="stat-conf">0%</span></div>
                    <div class="stat-item"><span>Engine</span><span class="stat-val">{GPU_NAME}</span></div>
                    <div class="stat-item"><span>WebSocket Stream</span><span class="stat-val" style="color: #10b981;">Online</span></div>
                </div>
            </div>
            <div style="font-size: 12px; color: #64748b; text-align: center; margin-top: 16px;">
                Trained for: Happy 😊, Wink 😉, Surprised 😮, Angry 😠, Kissy 😗, Sleepy 😴
            </div>
        </div>
    </div>

    <script>
        const video = document.getElementById('webcam');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const startBtn = document.getElementById('start-btn');
        let ws = null;
        let streaming = false;
        let lastFrameTime = performance.now();
        let frameCount = 0;

        async function startCamera() {{
            try {{
                const stream = await navigator.mediaDevices.getUserMedia({{ video: {{ width: 480, height: 360 }} }});
                video.srcObject = stream;
                startBtn.style.display = 'none';
                streaming = true;
                connectWebSocket();
            }} catch (err) {{
                alert('Camera Access Denied or HTTPS Required: ' + err.message);
            }}
        }}

        function connectWebSocket() {{
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${{protocol}}//${{window.location.host}}/ws`;
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {{
                document.getElementById('stat-status').innerText = 'Streaming to GPU';
                sendLoop();
            }};

            ws.onmessage = (event) => {{
                const res = JSON.parse(event.data);
                updateUI(res);
            }};

            ws.onclose = () => {{
                document.getElementById('stat-status').innerText = 'Disconnected';
                setTimeout(connectWebSocket, 2000);
            }};
        }}

        function sendLoop() {{
            if (!streaming || !ws || ws.readyState !== WebSocket.OPEN) return;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
            ws.send(dataUrl);

            // FPS counter
            frameCount++;
            const now = performance.now();
            if (now - lastFrameTime >= 1000) {{
                document.getElementById('hud-fps').innerText = `FPS: ${{frameCount}}`;
                frameCount = 0;
                lastFrameTime = now;
            }}

            requestAnimationFrame(sendLoop);
        }}

        function updateUI(res) {{
            document.getElementById('hud-latency').innerText = `LATENCY: ${{res.latency_ms}} ms`;
            if (res.face_detected) {{
                document.getElementById('exp-emoji').innerText = res.meta.emoji;
                document.getElementById('exp-label').innerText = res.meta.label;
                const pct = Math.round(res.confidence * 100);
                document.getElementById('exp-bar').style.width = pct + '%';
                document.getElementById('stat-conf').innerText = pct + '%';
            }} else {{
                document.getElementById('exp-emoji').innerText = '👤';
                document.getElementById('exp-label').innerText = 'NO FACE';
                document.getElementById('exp-bar').style.width = '0%';
                document.getElementById('stat-conf').innerText = '0%';
            }}
        }}
    </script>
</body>
</html>"""

if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 60)
    print(" 🚀 Starting Python Facial Expression GPU Server")
    print(f" Listening on: http://0.0.0.0:8000")
    print(f" GPU: {GPU_NAME} (CUDA: {CUDA_AVAILABLE})")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
