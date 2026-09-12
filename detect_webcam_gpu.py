#!/usr/bin/env python3
"""
Real-Time Facial Expression Detection on GPU / CPU.
Runs standalone with Webcam, Video file, or RTSP stream.
Features:
- PyTorch CUDA GPU status on HUD
- High-precision facial expression classification
- Cyberpunk styled overlay
- Headless mode support for remote cloud servers
"""

import sys
import time
import argparse
import cv2
import numpy as np

try:
    import torch
    CUDA_AVAILABLE = torch.cuda.is_available()
    GPU_NAME = torch.cuda.get_device_name(0) if CUDA_AVAILABLE else "None (CPU Mode)"
except ImportError:
    CUDA_AVAILABLE = False
    GPU_NAME = "Torch Not Installed"

try:
    import mediapipe as mp
except ImportError:
    print("Error: MediaPipe is required. Please install it using: pip install mediapipe")
    sys.exit(1)

from expression_classifier import classify_from_landmarks, EXPRESSION_META

def draw_hud(frame, expression, confidence, fps, gpu_name, cuda_active, bbox=None):
    """Draws a sleek cyberpunk visual HUD on the frame."""
    h, w, _ = frame.shape
    
    # Top status bar background
    cv2.rectangle(frame, (0, 0), (w, 55), (15, 23, 42), -1)
    cv2.line(frame, (0, 55), (w, 55), (6, 182, 212), 2)
    
    # GPU & FPS info
    gpu_badge = f"GPU: {gpu_name}" if cuda_active else "RUNNING ON CPU"
    gpu_color = (0, 255, 128) if cuda_active else (160, 160, 160)
    cv2.putText(frame, gpu_badge, (20, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.6, gpu_color, 2)
    cv2.putText(frame, f"FPS: {fps:.1f}", (20, 48), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)

    # Expression info
    meta = EXPRESSION_META.get(expression, EXPRESSION_META["unknown"])
    label_text = f"EXPRESSION: {meta['label']} ({int(confidence * 100)}%)" if expression != "unknown" else "EXPRESSION: NEUTRAL"
    text_color = (0, 255, 255) if expression != "unknown" else (180, 180, 180)
    cv2.putText(frame, label_text, (w - 380, 36), cv2.FONT_HERSHEY_SIMPLEX, 0.75, text_color, 2)

    # Face bounding box
    if bbox:
        x_min, y_min, x_max, y_max = bbox
        box_color = (6, 182, 212) if expression == "unknown" else (0, 255, 128)
        # Corner lines
        corner_len = 25
        cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), box_color, 1)
        # Top-left corner
        cv2.line(frame, (x_min, y_min), (x_min + corner_len, y_min), box_color, 3)
        cv2.line(frame, (x_min, y_min), (x_min, y_min + corner_len), box_color, 3)
        # Bottom-right corner
        cv2.line(frame, (x_max, y_max), (x_max - corner_len, y_max), box_color, 3)
        cv2.line(frame, (x_max, y_max), (x_max, y_max - corner_len), box_color, 3)

    return frame

def run_detection(source=0, show_window=True, output_path=None):
    print("\n" + "=" * 60)
    print(" 🚀 Starting Facial Expression Detector")
    print(f" Source: {source}")
    print(f" CUDA GPU Acceleration: {CUDA_AVAILABLE} ({GPU_NAME})")
    print("=" * 60)

    # Try numeric webcam index or file path
    try:
        cam_id = int(source)
    except ValueError:
        cam_id = source

    cap = cv2.VideoCapture(cam_id)
    if not cap.isOpened():
        print(f"✗ Failed to open video source: {source}")
        print("👉 If you are running on a remote headless cloud GPU without a webcam:")
        print("   Run the Python API server instead: python3 gpu_server.py")
        print("   Or pass a video file: python3 detect_webcam_gpu.py --source demo.mp4")
        return

    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    writer = None
    if output_path:
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(output_path, fourcc, fps, (w, h))

    prev_time = time.time()
    frame_count = 0

    print("\n[INFO] Detection loop running. Press 'q' in video window or Ctrl+C in terminal to exit.\n")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[INFO] End of stream or failed to read frame.")
                break

            frame_count += 1
            cur_time = time.time()
            fps = 1.0 / (cur_time - prev_time) if (cur_time - prev_time) > 0 else 30.0
            prev_time = cur_time

            # Flip frame horizontally for natural selfie mirror
            if isinstance(cam_id, int):
                frame = cv2.flip(frame, 1)

            h, w, _ = frame.shape
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_frame)

            detected_exp = "unknown"
            conf = 0.0
            bbox = None

            if results.multi_face_landmarks:
                face_landmarks = results.multi_face_landmarks[0]
                classification = classify_from_landmarks(face_landmarks.landmark)
                detected_exp = classification["expression"]
                conf = classification["confidence"]

                # Calculate bounding box
                xs = [int(lm.x * w) for lm in face_landmarks.landmark]
                ys = [int(lm.y * h) for lm in face_landmarks.landmark]
                bbox = (max(0, min(xs) - 10), max(0, min(ys) - 10), min(w, max(xs) + 10), min(h, max(ys) + 10))

            hud_frame = draw_hud(frame, detected_exp, conf, fps, GPU_NAME, CUDA_AVAILABLE, bbox)

            if frame_count % 30 == 0:
                print(f"[Frame {frame_count:04d}] FPS: {fps:.1f} | GPU: {CUDA_AVAILABLE} | Detected: {detected_exp.upper()} (conf: {conf:.2f})")

            if writer:
                writer.write(hud_frame)

            if show_window:
                try:
                    cv2.imshow("Face Expression Detection - GPU Machine", hud_frame)
                    key = cv2.waitKey(1) & 0xFF
                    if key == ord('q'):
                        break
                except cv2.error:
                    # Headless display environment (no X11 / Wayland)
                    show_window = False
                    print("[INFO] No GUI display detected. Continuing in headless terminal logging mode.")

    except KeyboardInterrupt:
        print("\n[INFO] Stopped by user.")
    finally:
        cap.release()
        if writer:
            writer.release()
        cv2.destroyAllWindows()
        face_mesh.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Real-Time Facial Expression AI on GPU/CPU")
    parser.add_argument("--source", default=0, help="Webcam index (0) or path to video file")
    parser.add_argument("--no-window", action="store_true", help="Run in headless mode without GUI window")
    parser.add_argument("--output", default=None, help="Optional output video file path (.mp4)")
    args = parser.parse_args()

    run_detection(source=args.source, show_window=not args.no_window, output_path=args.output)
