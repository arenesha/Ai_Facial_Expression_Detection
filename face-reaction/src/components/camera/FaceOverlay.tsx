import React from 'react';
import { DetectionResult } from '@/types/game';

interface FaceOverlayProps {
  detection: DetectionResult;
  faceCount: number;
  cameraStatus: 'OFF' | 'INITIALIZING' | 'DETECTING' | 'NO_FACE' | 'FACE_DETECTED';
}

export const FaceOverlay: React.FC<FaceOverlayProps> = ({
  faceCount,
}) => {
  const isFaceDetected = faceCount === 1;

  if (!isFaceDetected) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative w-56 h-64 flex items-center justify-center">
        {/* Subtle Cyber Landmark Dots / Face Mesh Simulation */}
        <svg className="w-full h-full opacity-60 filter drop-shadow-[0_0_6px_#00f0ff]" viewBox="0 0 200 240">
          {/* Eyebrows */}
          <path d="M 50 85 Q 70 75 90 85" stroke="#00f0ff" strokeWidth="1.5" fill="none" />
          <path d="M 110 85 Q 130 75 150 85" stroke="#00f0ff" strokeWidth="1.5" fill="none" />
          
          {/* Eyes */}
          <ellipse cx="70" cy="100" rx="12" ry="6" stroke="#00f0ff" strokeWidth="1.5" fill="none" />
          <circle cx="70" cy="100" r="2.5" fill="#00f0ff" />
          <ellipse cx="130" cy="100" rx="12" ry="6" stroke="#00f0ff" strokeWidth="1.5" fill="none" />
          <circle cx="130" cy="100" r="2.5" fill="#00f0ff" />

          {/* Nose Bridge and Tip */}
          <path d="M 100 90 L 100 135 L 90 145 L 100 148 L 110 145 L 100 135" stroke="#00f0ff" strokeWidth="1.2" fill="none" />
          
          {/* Mouth Contour */}
          <path d="M 65 170 Q 100 190 135 170 Q 100 180 65 170" stroke="#00f0ff" strokeWidth="1.5" fill="none" />
          
          {/* Face Contour Mesh Lines */}
          <path d="M 40 90 Q 35 150 100 215 Q 165 150 160 90" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          
          {/* Connecting Mesh Triangulation Nodes */}
          <circle cx="70" cy="100" r="2" fill="#00f0ff" />
          <circle cx="130" cy="100" r="2" fill="#00f0ff" />
          <circle cx="100" cy="148" r="2" fill="#00f0ff" />
          <circle cx="100" cy="175" r="2" fill="#00f0ff" />
          <circle cx="65" cy="170" r="2" fill="#00f0ff" />
          <circle cx="135" cy="170" r="2" fill="#00f0ff" />
        </svg>

        {/* Center Target Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-12 h-12 border border-cyan-400 rounded-full" />
          <div className="absolute w-4 h-[1px] bg-cyan-400" />
          <div className="absolute h-4 w-[1px] bg-cyan-400" />
        </div>
      </div>
    </div>
  );
};
