#!/usr/bin/env bash
# Quick start script for running dev server on 0.0.0.0:8003 with WebGL / GPU support
cd "$(dirname "$0")/face-reaction" || exit 1
echo "🚀 Starting Face Reaction AI on 0.0.0.0:8003..."
npm run dev -- --host 0.0.0.0 --port 8003
