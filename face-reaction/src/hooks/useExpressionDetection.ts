import { useRef, useCallback, useState } from 'react';
import { FaceLandmarker } from '@mediapipe/tasks-vision';
import { DetectionResult } from '../types/game';
import { classifyFromBlendshapes, classifyFromLandmarks } from '../utils/expressionDetection';

// Consecutive stable face frames before triggering auto-start
const AUTO_START_FRAMES = 5;
// Consecutive matching expression frames to register a MATCH (2 frames = instant response ~60ms)
const REQUIRED_MATCH_FRAMES = 2;
// Minimum blendshape confidence to count as a match
const MATCH_CONFIDENCE_THRESHOLD = 0.22;

export const useExpressionDetection = (landmarker: FaceLandmarker | null) => {
  const rafRef             = useRef<number | null>(null);
  const lastVideoTimeRef   = useRef<number>(-1);
  const matchFrameCountRef = useRef<number>(0);
  const lastMatchedExprRef = useRef<string>('');
  const isRunningRef       = useRef(false);
  const faceStableFrames   = useRef(0);
  const autoStartFiredRef  = useRef(false);

  const [detection, setDetection]         = useState<DetectionResult>({ expression: 'unknown', confidence: 0 });
  const [faceCount, setFaceCount]         = useState(0);
  const [cameraStatus, setCameraStatus]   = useState<
    'OFF' | 'INITIALIZING' | 'DETECTING' | 'NO_FACE' | 'FACE_DETECTED'
  >('OFF');

  const onMatchRef     = useRef<((expr: string) => void) | null>(null);
  const onAutoStartRef = useRef<(() => void) | null>(null);
  const targetExprRef  = useRef<string>('');
  const isPlayingRef   = useRef(false);

  const setOnMatch      = useCallback((cb: (expr: string) => void) => { onMatchRef.current = cb; }, []);
  const setOnAutoStart  = useCallback((cb: () => void) => { onAutoStartRef.current = cb; }, []);

  const setTargetExpression = useCallback((expr: string) => {
    targetExprRef.current  = expr;
    matchFrameCountRef.current = 0;
    lastMatchedExprRef.current = '';
  }, []);

  const setIsPlaying = useCallback((playing: boolean) => {
    isPlayingRef.current = playing;
    if (!playing) matchFrameCountRef.current = 0;
  }, []);

  const resetAutoStart = useCallback(() => {
    autoStartFiredRef.current  = false;
    faceStableFrames.current   = 0;
  }, []);

  const startDetection = useCallback((video: HTMLVideoElement) => {
    if (!landmarker || isRunningRef.current) return;
    isRunningRef.current = true;
    setCameraStatus('DETECTING');

    const detect = () => {
      if (!isRunningRef.current) return;

      if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;

        try {
          const result = landmarker.detectForVideo(video, performance.now());
          const numFaces = result.faceLandmarks.length;

          setFaceCount(prev => (prev !== numFaces ? numFaces : prev));

          if (numFaces >= 1) {
            // ── Process first/closest face regardless of how many faces are visible ──
            // Multiple faces in the background must not break detection for the player.
            const landmarks  = result.faceLandmarks[0];
            const blendshapes = result.faceBlendshapes?.[0]?.categories ?? [];

            // Use blendshapes first (more reliable), fall back to landmarks
            const detected = blendshapes.length > 0
              ? classifyFromBlendshapes(blendshapes)
              : classifyFromLandmarks(landmarks);

            setDetection(prev => {
              if (prev.expression === detected.expression &&
                  Math.abs(prev.confidence - detected.confidence) < 0.04) return prev;
              return detected;
            });

            // Update camera status
            setCameraStatus(prev =>
              prev === 'FACE_DETECTED' ? 'FACE_DETECTED' : 'FACE_DETECTED'
            );

            // ── Auto-start counter (only before game begins) ─────────────────
            if (!isPlayingRef.current && !autoStartFiredRef.current) {
              faceStableFrames.current++;
              if (faceStableFrames.current >= AUTO_START_FRAMES && onAutoStartRef.current) {
                autoStartFiredRef.current = true;
                onAutoStartRef.current();
              }
            }

            // ── Expression match (only during game) ──────────────────────────
            if (isPlayingRef.current && onMatchRef.current && detected.expression !== 'unknown') {
              if (
                detected.expression === targetExprRef.current &&
                detected.confidence >= MATCH_CONFIDENCE_THRESHOLD
              ) {
                // Reset counter when the expression changes to the target
                if (lastMatchedExprRef.current !== detected.expression) {
                  matchFrameCountRef.current = 0;
                  lastMatchedExprRef.current = detected.expression;
                }
                matchFrameCountRef.current++;

                if (matchFrameCountRef.current >= REQUIRED_MATCH_FRAMES) {
                  matchFrameCountRef.current = 0;
                  targetExprRef.current = ''; // Clear target immediately to prevent multi-triggering on same target
                  lastMatchedExprRef.current = '';
                  if (onMatchRef.current) {
                    onMatchRef.current(detected.expression);
                  }
                }
              } else {
                // Expression no longer matches target — reset counter
                matchFrameCountRef.current = 0;
                lastMatchedExprRef.current = '';
              }
            }

          } else {
            // ── Truly no face in frame ────────────────────────────────────────
            setDetection(prev =>
              prev.expression === 'unknown' ? prev : { expression: 'unknown', confidence: 0 }
            );
            setCameraStatus('NO_FACE');
            faceStableFrames.current   = 0;
            matchFrameCountRef.current = 0;
          }
        } catch {
          // Silently swallow per-frame errors
        }
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);
  }, [landmarker]);

  const stopDetection = useCallback(() => {
    isRunningRef.current = false;
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    matchFrameCountRef.current = 0;
    faceStableFrames.current   = 0;
    setCameraStatus('OFF');
  }, []);

  return {
    detection,
    faceCount,
    cameraStatus,
    startDetection,
    stopDetection,
    setOnMatch,
    setOnAutoStart,
    setTargetExpression,
    setIsPlaying,
    resetAutoStart,
  };
};
