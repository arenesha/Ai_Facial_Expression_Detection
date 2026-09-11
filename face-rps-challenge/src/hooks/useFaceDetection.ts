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
          outputFaceBlendshapes: true,
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

          let blendshapes: Record<string, number> | undefined = undefined;
          if (detection.faceBlendshapes && detection.faceBlendshapes.length > 0) {
            blendshapes = {};
            for (const cat of detection.faceBlendshapes[0].categories) {
              blendshapes[cat.categoryName] = cat.score;
            }
          }

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
            const raw = classifyExpression(smileRatio, mouthOpenRatio, blendshapes);
            const debounced = debouncerRef.current.push(raw);
            const finalResult = buildDetectionResult(true, debounced, smileRatio, mouthOpenRatio, blendshapes);
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

// MediaPipe Landmark Mesh Connections for Futuristic Holographic Face
const CONTOUR_JAW = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
const CONTOUR_LEFT_EYEBROW = [70, 63, 105, 66, 107];
const CONTOUR_RIGHT_EYEBROW = [336, 296, 334, 293, 300];
const CONTOUR_LEFT_EYE = [33, 160, 158, 133, 153, 144, 33];
const CONTOUR_RIGHT_EYE = [362, 385, 387, 263, 373, 380, 362];
const CONTOUR_NOSE = [168, 6, 197, 195, 5, 4, 1, 2, 98, 97, 2, 326, 327];
const CONTOUR_LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 61];
const CONTOUR_LIPS_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 78];

// Key holographic cross lines
const CROSS_MESH_PAIRS: [number, number][] = [
  [10, 168], [168, 1], [1, 2], [2, 13], [13, 14], [14, 152],
  [107, 168], [336, 168], [66, 105], [293, 334],
  [133, 168], [362, 168], [33, 234], [263, 454],
  [61, 234], [291, 454], [152, 172], [152, 397],
  [1, 61], [1, 291], [2, 98], [2, 327]
];

function drawPath(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number }>,
  indices: number[],
  w: number,
  h: number,
  closePath = false
) {
  if (indices.length < 2) return;
  ctx.beginPath();
  const first = landmarks[indices[0]];
  if (!first) return;
  ctx.moveTo(first.x * w, first.y * h);
  for (let i = 1; i < indices.length; i++) {
    const pt = landmarks[indices[i]];
    if (pt) ctx.lineTo(pt.x * w, pt.y * h);
  }
  if (closePath) ctx.closePath();
  ctx.stroke();
}

function drawFaceOverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number }>,
  w: number,
  h: number,
) {
  if (!landmarks || landmarks.length < 468) return;

  ctx.save();

  // 1. Draw glowing cyan facial mesh lines (futuristic AI mesh like Image 2)
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
  ctx.lineWidth = 1.0;
  ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
  ctx.shadowBlur = 4;

  drawPath(ctx, landmarks, CONTOUR_JAW, w, h);
  drawPath(ctx, landmarks, CONTOUR_LEFT_EYEBROW, w, h);
  drawPath(ctx, landmarks, CONTOUR_RIGHT_EYEBROW, w, h);
  drawPath(ctx, landmarks, CONTOUR_LEFT_EYE, w, h, true);
  drawPath(ctx, landmarks, CONTOUR_RIGHT_EYE, w, h, true);
  drawPath(ctx, landmarks, CONTOUR_NOSE, w, h);
  drawPath(ctx, landmarks, CONTOUR_LIPS_OUTER, w, h, true);
  drawPath(ctx, landmarks, CONTOUR_LIPS_INNER, w, h, true);

  // 2. Draw cross connecting geometric grid lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  for (const [idx1, idx2] of CROSS_MESH_PAIRS) {
    const p1 = landmarks[idx1];
    const p2 = landmarks[idx2];
    if (p1 && p2) {
      ctx.moveTo(p1.x * w, p1.y * h);
      ctx.lineTo(p2.x * w, p2.y * h);
    }
  }
  ctx.stroke();

  // 3. Draw luminous landmark node dots on key vertices
  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = 'rgba(0, 240, 255, 1)';
  ctx.shadowBlur = 6;
  const keyPoints = [10, 152, 234, 454, 1, 61, 291, 33, 263, 70, 300, 13, 14];
  for (const idx of keyPoints) {
    const pt = landmarks[idx];
    if (pt) {
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
