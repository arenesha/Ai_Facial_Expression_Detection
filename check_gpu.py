#!/usr/bin/env python3
"""
GPU & Environment Diagnostic Script for Ubuntu 24.04 LTS
Verifies NVIDIA CUDA support, PyTorch GPU acceleration, and system libraries.
"""

import sys
import os
import subprocess

def print_header(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def check_nvidia_smi():
    print_header("1. Checking nvidia-smi (NVIDIA Driver)")
    try:
        output = subprocess.check_output(["nvidia-smi"], stderr=subprocess.STDOUT, text=True)
        print("✓ nvidia-smi command successful!")
        for line in output.splitlines()[:12]:
            print("  " + line)
        return True
    except FileNotFoundError:
        print("✗ nvidia-smi not found! Please install NVIDIA drivers:")
        print("  sudo apt update && sudo apt install -y nvidia-driver-550 nvidia-utils-550")
        return False
    except subprocess.CalledProcessError as e:
        print(f"✗ nvidia-smi failed: {e.output}")
        return False

def check_pytorch_cuda():
    print_header("2. Checking PyTorch CUDA Acceleration")
    try:
        import torch
        print(f"✓ PyTorch version: {torch.__version__}")
        cuda_available = torch.cuda.is_available()
        print(f"✓ CUDA Available: {cuda_available}")
        
        if cuda_available:
            device_count = torch.cuda.device_count()
            print(f"✓ GPU Device Count: {device_count}")
            for i in range(device_count):
                props = torch.cuda.get_device_properties(i)
                total_mem_gb = props.total_memory / (1024 ** 3)
                print(f"  - Device [{i}]: {props.name}")
                print(f"    Total VRAM: {total_mem_gb:.2f} GB")
                print(f"    Compute Capability: {props.major}.{props.minor}")
            
            # Simple CUDA Tensor test
            x = torch.randn(1000, 1000, device='cuda')
            y = torch.matmul(x, x)
            print("✓ GPU Tensor Matrix Multiplication test passed on CUDA!")
            return True
        else:
            print("⚠ CUDA is NOT available in PyTorch!")
            print("  Install PyTorch with CUDA support:")
            print("  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124")
            return False
    except ImportError:
        print("⚠ PyTorch is not installed. To install:")
        print("  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124")
        return False

def check_mediapipe_and_cv2():
    print_header("3. Checking OpenCV & MediaPipe")
    try:
        import cv2
        print(f"✓ OpenCV version: {cv2.__version__}")
    except ImportError:
        print("✗ OpenCV not found. Run: pip install opencv-python-headless")

    try:
        import mediapipe as mp
        print(f"✓ MediaPipe version: {mp.__version__}")
    except ImportError:
        print("✗ MediaPipe not found. Run: pip install mediapipe")

if __name__ == "__main__":
    print_header("Face Expression Detection - GPU Environment Check")
    print(f"Python Version: {sys.version}")
    
    smi_ok = check_nvidia_smi()
    torch_ok = check_pytorch_cuda()
    check_mediapipe_and_cv2()
    
    print("\n" + "=" * 60)
    if smi_ok and torch_ok:
        print("🎉 STATUS: GPU Machine is ready for Python AI acceleration!")
    else:
        print("👉 Note: Review the suggestions above to enable full GPU acceleration.")
    print("=" * 60 + "\n")
