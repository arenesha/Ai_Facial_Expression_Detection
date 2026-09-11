# AI Subject Drawing Robot

Professional end‑to‑end system that runs on an NVIDIA Jetson Orin Nano Super and draws only the selected foreground subject using a robotic arm.

## Features
- Full pipeline: image capture → subject detection → segmentation → background removal → vectorization → path planning → safety validation → simulation → real‑robot execution.
- Modular services for Jetson edge AI, FastAPI backend, and Next.js frontend.
- Three operation modes: **simulation**, **mock‑hardware**, **real‑hardware**.
- Professional industrial UI built with Next.js, TypeScript, Tailwind CSS.
- Real‑time monitoring, robot status via WebSockets, and camera verification of the final drawing.

## Repository Layout
```
ai-drawing-robot/
├── frontend/            # Next.js UI
├── backend/             # FastAPI backend & services
├── jetson/              # Edge‑AI services on Jetson
├── configs/             # YAML configuration files
├── docs/                # Documentation (README, ARCHITECTURE, etc.)
├── scripts/             # Helper scripts
├── tests/               # Automated test suite
├── .env.example         # Example env file
└── README.md            # This file
```

## Getting Started
1. **Setup Jetson** – see `docs/JETSON_SETUP.md`.
2. **Configure hardware** – edit `configs/hardware.yaml`.
3. **Run backend** – `cd backend && poetry install && uvicorn app.main:app --reload`.
4. **Run frontend** – `cd frontend && npm install && npm run dev`.
5. **Select mode** – set `MODE` in `configs/hardware.yaml` (`simulation`, `mock`, `hardware`).

For detailed architecture and integration steps, refer to the documentation in `docs/`.
