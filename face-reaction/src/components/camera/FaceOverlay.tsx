import React from 'react';
import { DetectionResult, EXPRESSIONS } from '@/types/game';

interface FaceOverlayProps {
  detection: DetectionResult;
  faceCount: number;
  cameraStatus: 'OFF' | 'INITIALIZING' | 'DETECTING' | 'NO_FACE' | 'FACE_DETECTED';
}

export const FaceOverlay: React.FC<FaceOverlayProps> = ({ detection, faceCount, cameraStatus }) => {
  // Show overlay only when exactly ONE face is present
  const isFaceDetected = faceCount === 1;
  const isMultiple = faceCount > 1;
  const expr = detection.expression;
  const exprInfo = expr !== 'unknown' ? EXPRESSIONS[expr] : null;

  const statusLabel = (() => {
    if (isMultiple) return { text: 'Multiple Faces', color: 'text-yellow-400', dot: 'bg-yellow-400' };
    switch (cameraStatus) {
      case 'FACE_DETECTED': return { text: 'Face Detected', color: 'text-green-400', dot: 'bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]' };
      case 'NO_FACE': return { text: 'No Face Detected', color: 'text-red-400', dot: 'bg-red-500' };
      case 'DETECTING': return { text: 'Detecting Face…', color: 'text-white/50', dot: 'bg-white/30 animate-pulse' };
      case 'INITIALIZING': return { text: 'Initializing…', color: 'text-white/40', dot: 'bg-white/20 animate-pulse' };
      default: return { text: 'Camera Off', color: 'text-white/30', dot: 'bg-white/20' };
    }
  })();

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
      {/* Top status */}
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusLabel.dot}`} />
        <span className={`text-xs font-semibold tracking-widest uppercase ${statusLabel.color}`}>
          {statusLabel.text}
        </span>
      </div>

      {/* Bottom: YOUR expression indicator */}
      {isFaceDetected && exprInfo && (
        <div className="flex flex-col gap-1">
          <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold pl-1">YOUR EXPRESSION</span>
          <div className="bg-black/55 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-3">
            <span className="text-2xl">{exprInfo.emoji}</span>
            <div>
              <div className="text-white font-bold text-xs tracking-wider">{exprInfo.label}</div>
            </div>
          </div>
        </div>
      )}

      {isMultiple && (
        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl px-3 py-2">
          <p className="text-yellow-400 text-xs text-center font-medium">One face only please</p>
        </div>
      )}
    </div>
  );
};
