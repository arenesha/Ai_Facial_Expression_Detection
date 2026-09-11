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
  detection,
  cameraError,
  onRequestCamera,
  matchBanner = false,
  missedBanner = false,
  lastMatchPoints = 100,
}) => {
  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute top-2 left-6 z-20">
        <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-white/70 uppercase bg-[#030612] px-2 py-0.5 border border-neon-cyan/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88] animate-pulse" />
          <span>CAMERA • LIVE</span>
        </div>
      </div>

      <CyberFrame cut="all" color="cyan" className="h-full mt-4" contentClassName="p-1">
        <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#030612]">
          {/* Match Celebration Overlay (1 full second) */}
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

          {/* Missed Overlay (800ms) */}
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
              {/* Mirrored video */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover opacity-80"
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
              {/* Scanning overlay gradient */}
              <div className="absolute inset-0 pointer-events-none z-[3]"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,240,255,0.05) 0%, transparent 40%, transparent 60%, rgba(0,240,255,0.05) 100%)',
                }}
              />
              
              {/* Clean Face Reticle Brackets Framing Center Face */}
              <div className="absolute inset-0 pointer-events-none z-[4] flex items-center justify-center">
                <div className="relative w-56 h-64">
                  {/* Top-Left Bracket */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]" />
                  {/* Top-Right Bracket */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]" />
                  {/* Bottom-Left Bracket */}
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]" />
                  {/* Bottom-Right Bracket */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-neon-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.9)]" />
                </div>
              </div>
            </>
          )}

          {/* FACE DETECTED Badge (positioned over bottom border) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[5]">
            <div className="flex items-center gap-3 bg-[#020718]/90 backdrop-blur-md px-5 py-1.5 border border-neon-cyan/80 shadow-[0_0_15px_rgba(0,240,255,0.4)]" style={{ clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%, 0 8px)' }}>
              <span className={`w-2.5 h-2.5 rounded-full ${detection.detected ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-pulse' : 'bg-cyan-400'}`} />
              <span className="text-[11px] font-black tracking-[0.2em] text-neon-cyan uppercase">
                {detection.detected ? 'FACE DETECTED' : 'FACE DETECTED'}
              </span>
              <div className="flex items-center gap-[3px] text-[#00ff88] font-mono text-xs tracking-tighter opacity-90">
                <span>////////</span>
              </div>
            </div>
          </div>
        </div>
      </CyberFrame>
    </div>
  );
};
