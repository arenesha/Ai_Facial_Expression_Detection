import React from 'react';
import { DetectionResult } from '@/types/game';
import { FaceOverlay } from './FaceOverlay';

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detection: DetectionResult;
  faceCount: number;
  isReady: boolean;
  cameraStatus: 'OFF' | 'INITIALIZING' | 'DETECTING' | 'NO_FACE' | 'FACE_DETECTED';
}

export const CameraPanel: React.FC<CameraPanelProps> = ({
  videoRef, detection, faceCount, isReady, cameraStatus,
}) => {
  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="relative bg-[#1e293b] rounded-2xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center flex-shrink-0">
        {/* Mirror the video horizontally */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Loading state */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#38bdf8] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/40 text-sm">Starting camera…</p>
          </div>
        )}

        {isReady && <FaceOverlay detection={detection} faceCount={faceCount} cameraStatus={cameraStatus} />}

        {/* Corner bracket decorations */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#38bdf8]/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#38bdf8]/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#38bdf8]/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#38bdf8]/60 rounded-br-sm pointer-events-none" />
      </div>

      <div className="text-center">
        <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">Live Camera</p>
      </div>
    </div>
  );
};
