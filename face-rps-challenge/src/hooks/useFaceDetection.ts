import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceDetectionResult } from '@/types/game';
import {
  computeExpressionRatios,
  classifyExpression,
  ExpressionDebouncer,
  buildDetectionResult,
  DEFAULT_THRESHOLDS,
} from '@/utils/expressionDetection';

interface UseFaceDetectionOptions {
  enabled?: boolean;
  onResult?: (result: FaceDetectionResult) => void;
}

interface UseFaceDetectionReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  result: FaceDetectionResult;
  cameraReady: boolean;
  cameraError: string | null;
  requestCamera: () => void;
}

const WASM_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export function useFaceDetection({
  enabled = true,
  onResult,
}: UseFaceDetectionOptions = {}): UseFaceDetectionReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const mountedRef = useRef(true); // track mount state
  const streamRef = useRef<MediaStream | null>(null);
  const debouncerRef = useRef(new ExpressionDebouncer(DEFAULT_THRESHOLDS.debounceFrames));

  const [result, setResult] = useState<FaceDetectionResult>({
    detected: false,
    expression: 'unknown',
    confidence: 0,
    smileRatio: 0,
    mouthOpenRatio: 0,
  });
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Track mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initialize MediaPipe once
  useEffect(() => {
    (async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(WASM_PATH);
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        if (mountedRef.current) landmarkerRef.current = landmarker;
      } catch (err) {
        console.error('[FaceLandmarker] init error', err);
      }
    })();
  }, []); // only once

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const requestCamera = useCallback(async () => {
    if (!mountedRef.current) return;
    setCameraError(null);
    setCameraReady(false);

    // Stop any existing stream first
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      video.onloadedmetadata = async () => {
        if (!mountedRef.current) return;
        try {
          await video.play();
          if (mountedRef.current) setCameraReady(true);
        } catch (playErr) {
          console.warn('[Camera] play() error:', playErr);
          // only set error if it's not an abort (which happens on cleanup)
          if (mountedRef.current && playErr instanceof Error && !playErr.message.includes('interrupted')) {
            setCameraError('Camera playback error. Try clicking Enable Camera again.');
          }
        }
      };
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setCameraError('Camera permission denied. Please allow camera access and click Enable Camera.');
      } else if (msg.includes('in use') || msg.includes('TrackStartError')) {
        setCameraError('Camera is being used by another app. Close Teams, Zoom, or any camera app and click Enable Camera.');
      } else {
        setCameraError('Unable to access camera. Click Enable Camera to retry.');
      }
    }
  }, [stopCamera]);

  // Auto-request on mount if enabled
  useEffect(() => {
    if (enabled) requestCamera();
    return () => stopCamera();
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detection loop
  useEffect(() => {
    if (!cameraReady) return;

    let lastTime = -1;

    const detect = (timestamp: number) => {
      if (!mountedRef.current) return;
      if (!landmarkerRef.current || !videoRef.current || !canvasRef.current) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }
      const video = videoRef.current;
      if (video.readyState < 2 || video.paused) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      if (timestamp !== lastTime) {
        lastTime = timestamp;
        try {
          const detection = landmarkerRef.current.detectForVideo(video, timestamp);

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const face of detection.faceLandmarks ?? []) {
              drawFaceOverlay(ctx, face, canvas.width, canvas.height);
            }
          }

          const landmarks = detection.faceLandmarks?.[0];
          if (landmarks && landmarks.length > 0) {
            const { smileRatio, mouthOpenRatio } = computeExpressionRatios(landmarks);
            const raw = classifyExpression(smileRatio, mouthOpenRatio);
            const debounced = debouncerRef.current.push(raw);
            const finalResult = buildDetectionResult(true, debounced, smileRatio, mouthOpenRatio);
            if (mountedRef.current) {
              setResult(finalResult);
              onResult?.(finalResult);
            }
          } else {
            const notDetected = buildDetectionResult(false, 'unknown', 0, 0);
            debouncerRef.current.reset();
            if (mountedRef.current) {
              setResult(notDetected);
              onResult?.(notDetected);
            }
          }
        } catch (e) {
          // ignore frame errors
        }
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cameraReady, onResult]);

  return { videoRef, canvasRef, result, cameraReady, cameraError, requestCamera };
}

function drawFaceOverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number }>,
  w: number,
  h: number,
) {
  const xs = landmarks.map(l => l.x * w);
  const ys = landmarks.map(l => l.y * h);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const rx = (maxX - minX) / 2 + 16;
  const ry = (maxY - minY) / 2 + 16;

  ctx.save();
  ctx.strokeStyle = 'rgba(99,102,241,0.9)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.lineWidth = 3;
  const bx = cx - rx, by = cy - ry, bw = rx * 2, bh = ry * 2;
  const cs = 18;
  [
    [bx, by, cs, 0, 0, cs],
    [bx + bw, by, -cs, 0, 0, cs],
    [bx, by + bh, cs, 0, 0, -cs],
    [bx + bw, by + bh, -cs, 0, 0, -cs],
  ].forEach(([x, y, dx1, dy1, dx2, dy2]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx1, y + dy1);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx2, y + dy2);
    ctx.stroke();
  });
  ctx.restore();
}
