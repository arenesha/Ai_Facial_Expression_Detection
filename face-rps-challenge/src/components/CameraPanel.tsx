import React from 'react';
import { CyberFrame } from './CyberFrame';
import type { FaceDetectionResult } from '@/types/game';

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  detection: FaceDetectionResult;
  cameraError: string | null;
  onRequestCamera: () => void;
  matchBanner?: boolean;
  missedBanner?: boolean;
  lastMatchPoints?: number;
}

export const CameraPanel: React.FC<CameraPanelProps> = ({
  videoRef,
  canvasRef,
  cameraError,
  onRequestCamera,
  matchBanner = false,
  missedBanner = false,
  lastMatchPoints = 100,
}) => {
  return (
    <div className="flex flex-col h-full relative">
      <CyberFrame cut="all" color="cyan" className="h-full mt-2" contentClassName="p-1">
        <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#030612]">
          {/* Match Celebration Overlay */}
          {matchBanner && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md pointer-events-none animate-fadeUp">
              <div className="text-6xl mb-2 animate-bounce">🎉</div>
              <div className="text-3xl font-black neon-text-green tracking-widest uppercase drop-shadow-[0_0_20px_rgba(0,255,136,1)]">
                MATCHED!
              </div>
              <div className="text-lg font-black text-neon-cyan tracking-widest mt-1 drop-shadow-[0_0_10px_rgba(0,240,255,1)]">
                +{lastMatchPoints} PTS
              </div>
            </div>
          )}

          {/* Missed Overlay */}
          {missedBanner && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md pointer-events-none animate-fadeUp">
              <div className="text-5xl mb-2 animate-pulse">⏰</div>
              <div className="text-3xl font-black text-red-500 tracking-widest uppercase drop-shadow-[0_0_20px_rgba(239,68,68,1)]">
                MISSED!
              </div>
              <div className="text-sm font-bold text-white/60 tracking-widest mt-1">
                TIME EXPIRED
              </div>
            </div>
          )}
          {cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center z-10">
              <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /><line x1="3" y1="3" x2="21" y2="21" />
              </svg>
              <div>
                <p className="text-white font-semibold mb-1">Camera Access Required</p>
                <p className="text-white/50 text-sm mb-4">{cameraError}</p>
                <button onClick={onRequestCamera} className="btn-cyber text-sm !px-6 !py-2">
                  <span>Enable Camera</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mirrored clean plain video */}
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
                className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
                style={{ transform: 'scaleX(-1)' }}
              />
            </>
          )}
        </div>
      </CyberFrame>
    </div>
  );
};
