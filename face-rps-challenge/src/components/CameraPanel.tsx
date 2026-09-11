import React from 'react';
import type { Move, Expression, FaceDetectionResult } from '@/types/game';
import { EXPRESSION_EMOJI, EXPRESSION_LABELS, MOVE_EMOJI, MOVE_LABELS, EXPRESSION_TO_MOVE } from '@/types/game';

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  detection: FaceDetectionResult;
  cameraError: string | null;
  onRequestCamera: () => void;
  lockedMove?: Move | null;  // when move is locked after "GO!"
}

export const CameraPanel: React.FC<CameraPanelProps> = ({
  videoRef,
  canvasRef,
  detection,
  cameraError,
  onRequestCamera,
  lockedMove,
}) => {
  const expression: Expression = detection.expression ?? 'unknown';
  const move: Move | null =
    lockedMove ??
    (detection.detected && expression !== 'unknown'
      ? EXPRESSION_TO_MOVE[expression as Exclude<Expression, 'unknown'>]
      : null);

  return (
    <div className="flex flex-col gap-3">
      {/* Camera viewport */}
      <div className="relative bg-dark-800 rounded-2xl overflow-hidden border border-white/10 aspect-video">
        {cameraError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /><line x1="3" y1="3" x2="21" y2="21" />
            </svg>
            <div>
              <p className="text-white font-semibold mb-1">Camera Access Required</p>
              <p className="text-white/50 text-sm mb-4">{cameraError}</p>
              <button
                onClick={onRequestCamera}
                className="px-5 py-2 bg-accent hover:bg-accent-light text-white text-sm font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Enable Camera
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mirrored video */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
              autoPlay
              playsInline
              muted
              aria-label="Webcam feed"
            />
            {/* Landmark canvas overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: 'scaleX(-1)' }}
            />
            {/* Status pill */}
            <div className="absolute top-3 left-3">
              {detection.detected ? (
                <span className="inline-flex items-center gap-1.5 bg-win/20 border border-win/50 text-win text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-win animate-pulse" />
                  FACE DETECTED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  NO FACE
                </span>
              )}
            </div>
            {/* YOU label */}
            <div className="absolute bottom-3 left-3 text-white/40 text-xs font-semibold tracking-widest uppercase">You</div>
          </>
        )}
      </div>

      {/* Expression readout */}
      <div className="bg-dark-700/60 backdrop-blur border border-white/10 rounded-xl p-4">
        {detection.detected && expression !== 'unknown' ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest mb-0.5">Detected Expression</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>{EXPRESSION_EMOJI[expression]}</span>
                <div>
                  <div className="text-sm font-semibold text-white">{EXPRESSION_LABELS[expression]}</div>
                  <div className="text-xs text-white/40">
                    Your move:{' '}
                    <span className="text-accent font-bold">
                      {move ? `${MOVE_EMOJI[move]} ${MOVE_LABELS[move]}` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Confidence bar */}
            <div className="flex flex-col items-end gap-1 min-w-[80px]">
              <div className="text-xs text-white/40">Confidence</div>
              <div className="w-20 h-1.5 bg-dark-500 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(detection.confidence * 100)}%` }}
                />
              </div>
              <div className="text-xs font-mono text-white/60">{Math.round(detection.confidence * 100)}%</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-white/40 text-sm py-1">
            {cameraError ? 'Camera unavailable' : 'Position your face in front of the camera'}
          </div>
        )}
      </div>
    </div>
  );
};
