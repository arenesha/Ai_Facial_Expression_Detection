#!/usr/bin/env bash
# ─────────────────────────────────────────────────
# Face Reaction — Start Script (Ubuntu 22.04)
# Binds on 0.0.0.0:8003
# ─────────────────────────────────────────────────
set -euo pipefail

PORT=8003
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$PROJECT_DIR"

echo "═══════════════════════════════════════════════"
echo "  Face Reaction — Starting on port $PORT"
echo "═══════════════════════════════════════════════"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Install with: sudo apt update && sudo apt install -y nodejs npm"
  exit 1
fi
echo "✓ Node.js $(node --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "→ Installing dependencies..."
  npm install
fi
echo "✓ Dependencies ready"

# Check if port is available
if ss -tlnp | grep -q ":$PORT "; then
  echo "WARNING: Port $PORT is already in use."
  echo "Kill the process using: sudo fuser -k ${PORT}/tcp"
  echo "Then re-run this script."
  exit 1
fi

MODE="${1:-dev}"

if [ "$MODE" = "production" ] || [ "$MODE" = "prod" ]; then
  echo "→ Building for production..."
  npm run build
  echo "→ Starting production preview server on 0.0.0.0:$PORT"
  npx vite preview --host 0.0.0.0 --port "$PORT" --strictPort
else
  echo "→ Starting development server on 0.0.0.0:$PORT"
  npm run dev
fi
