import React from 'react';
import { DetectionResult } from '@/types/game';
import { Camera as CameraIcon, Zap, Target as TargetIcon, Shield } from 'lucide-react';

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  detection: DetectionResult;
  faceCount: number;
  isReady: boolean;
  cameraStatus: 'OFF' | 'INITIALIZING' | 'DETECTING' | 'NO_FACE' | 'FACE_DETECTED';
  isPlaying: boolean;
  onStartGame: () => void;
}

export const CameraPanel: React.FC<CameraPanelProps> = ({
  videoRef,
  detection: _detection,
  faceCount: _faceCount,
  isReady,
  isPlaying,
  onStartGame,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full gap-2 z-10 min-h-0">
      {/* ── 4. Main Camera Viewport Frame (main focal panel, largest) ── */}
      <div className="relative w-full h-[285px] p-[1.5px] clip-cyber-chamfer bg-[#4ce3ff]/80 shadow-[0_0_24px_rgba(76,227,255,0.4)]">
        {/* Outer tech side notch decorations */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-30 pointer-events-none">
          <div className="w-1.5 h-3 bg-[#4ce3ff] shadow-[0_0_6px_#4ce3ff]" />
          <div className="w-1.5 h-3 bg-[#4ce3ff] shadow-[0_0_6px_#4ce3ff]" />
          <div className="w-1.5 h-3 bg-[#4ce3ff] shadow-[0_0_6px_#4ce3ff]" />
        </div>
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-30 pointer-events-none">
          <div className="w-1.5 h-3 bg-[#4ce3ff] shadow-[0_0_6px_#4ce3ff]" />
          <div className="w-1.5 h-3 bg-[#4ce3ff] shadow-[0_0_6px_#4ce3ff]" />
          <div className="w-1.5 h-3 bg-[#4ce3ff] shadow-[0_0_6px_#4ce3ff]" />
        </div>

        <div className="relative w-full h-full clip-cyber-chamfer bg-[#05060f]/95 flex items-center justify-center overflow-hidden">
          {/* Reference face when camera is idle */}
          {!isPlaying && (
            <img
              src="/camera_placeholder_face.jpg"
              alt="Camera Live Preview"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          )}

          {/* Video stream (mirrored) - Bright, crystal clear, 100% unobstructed plain camera feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isReady ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: 'scaleX(-1)',
              filter: 'brightness(130%) contrast(110%) saturate(108%)',
            }}
          />
        </div>
      </div>

      {/* ── Full-width gradient button below frame with chevrons ── */}
      <button
        onClick={onStartGame}
        className="w-full h-[46px] py-1.5 px-6 rounded-2xl bg-gradient-to-r from-[#00e5ff] via-[#18d9ff] to-[#ff2fa4] text-[#020617] font-orbitron font-black text-xs sm:text-[13px] tracking-widest uppercase flex items-center justify-between shadow-[0_0_28px_rgba(0,229,255,0.7),0_0_20px_rgba(255,47,164,0.6)] hover:shadow-[0_0_40px_rgba(0,229,255,0.9)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer border border-white/60"
      >
        <span className="text-[#020617] opacity-80 text-sm font-black tracking-tighter">❯❯❯</span>
        <div className="flex items-center gap-2.5">
          <CameraIcon size={20} strokeWidth={2.8} className="text-[#020617]" />
          <span>START FACE RECOGNITION</span>
        </div>
        <span className="text-[#020617] opacity-80 text-sm font-black tracking-tighter">❮❮❮</span>
      </button>

      {/* ── 3 Chips below button ── */}
      <div className="flex items-center justify-between gap-2.5 w-full h-[30px]">
        <div className="flex-1 h-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-full bg-[#020617]/90 border border-[#00e5ff]/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
          <Zap size={13} className="text-[#00e5ff]" />
          <span className="font-orbitron text-[8.5px] font-black text-white tracking-wider">
            5s PER ROUND
          </span>
        </div>

        <div className="flex-1 h-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-full bg-[#020617]/90 border border-[#00e5ff]/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
          <TargetIcon size={13} className="text-[#00e5ff]" />
          <span className="font-orbitron text-[8.5px] font-black text-white tracking-wider">
            INSTANT MATCH
          </span>
        </div>

        <div className="flex-1 h-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-full bg-[#020617]/90 border border-[#00e5ff]/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
          <Shield size={13} className="text-[#00e5ff]" />
          <span className="font-orbitron text-[8.5px] font-black text-white tracking-wider">
            100% PRIVATE
          </span>
        </div>
      </div>
    </div>
  );
};
