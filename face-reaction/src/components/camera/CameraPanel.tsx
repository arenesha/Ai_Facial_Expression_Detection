import React from 'react';
import { DetectionResult } from '@/types/game';
import { FaceOverlay } from './FaceOverlay';
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
  detection,
  faceCount,
  isReady,
  cameraStatus,
  isPlaying,
  onStartGame,
}) => {
  const isFaceDetected = faceCount === 1;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full gap-3 z-10">
      {/* ── Main Camera Viewport Frame ── */}
      <div className="relative w-full aspect-[16/10] max-w-2xl bg-[#070e24]/90 rounded-2xl overflow-hidden border-2 border-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.35)] flex items-center justify-center">
        
        {/* Top Label: CAMERA • LIVE */}
        <div className="absolute top-2.5 left-4 z-20 flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-black/60 border border-cyan-400/30">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-orbitron text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase">
            CAMERA • LIVE
          </span>
        </div>

        {/* Video stream (mirrored) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Loading Spinner when camera initializing */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050b1d]">
            <div className="w-10 h-10 border-3 border-[#00f0ff] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#00f0ff]" />
            <p className="font-orbitron text-[#00f0ff] text-xs tracking-widest uppercase animate-pulse">
              INITIALIZING CAMERA FEED…
            </p>
          </div>
        )}

        {/* Live Face Detection Overlay */}
        {isReady && (
          <FaceOverlay
            detection={detection}
            faceCount={faceCount}
            cameraStatus={cameraStatus}
          />
        )}

        {/* Outer HUD Corner Brackets */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-3 border-l-3 border-[#00f0ff] pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-3 border-r-3 border-[#00f0ff] pointer-events-none" />
        <div className="absolute bottom-10 left-2 w-6 h-6 border-b-3 border-l-3 border-[#00f0ff] pointer-events-none" />
        <div className="absolute bottom-10 right-2 w-6 h-6 border-b-3 border-r-3 border-[#00f0ff] pointer-events-none" />

        {/* Bottom Status Bar: FACE DETECTED //////// */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-5 py-1 rounded-full bg-[#051124]/90 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isFaceDetected
                ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88]'
                : 'bg-yellow-400 shadow-[0_0_8px_#facc15]'
            }`}
          />
          <span
            className={`font-orbitron text-xs font-bold tracking-widest uppercase ${
              isFaceDetected ? 'text-[#00ff88] text-glow-green' : 'text-yellow-400'
            }`}
          >
            {isFaceDetected ? 'FACE DETECTED' : 'POSITION FACE IN VIEW'}
          </span>
          <span className="font-mono text-xs font-black text-cyan-400/80 tracking-tighter ml-1 select-none">
            /////////
          </span>
        </div>
      </div>

      {/* ── Center Large Neon Gradient Action Button ── */}
      <button
        onClick={onStartGame}
        className="w-full max-w-lg py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#00d2ff] via-[#00f0ff] to-[#ff007f] text-[#050814] font-orbitron font-black text-base sm:text-lg tracking-wider uppercase flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:shadow-[0_0_45px_rgba(255,0,127,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-white/40"
      >
        <CameraIcon size={22} strokeWidth={2.6} className="text-[#050814]" />
        <span>{isPlaying ? 'RESET / RESTART ROUND' : 'START FACE RECOGNITION'}</span>
      </button>

      {/* ── Bottom Center 3 Status Cards ── */}
      <div className="flex items-center justify-center gap-3 w-full max-w-lg">
        {/* 5s PER ROUND */}
        <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#060e22]/80 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
          <Zap size={14} className="text-[#00f0ff]" />
          <span className="font-orbitron text-[10px] font-bold text-slate-200 tracking-wider">
            5s PER ROUND
          </span>
        </div>

        {/* INSTANT MATCH */}
        <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#060e22]/80 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
          <TargetIcon size={14} className="text-[#00f0ff]" />
          <span className="font-orbitron text-[10px] font-bold text-slate-200 tracking-wider">
            INSTANT MATCH
          </span>
        </div>

        {/* 100% PRIVATE */}
        <div className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#060e22]/80 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
          <Shield size={14} className="text-[#00f0ff]" />
          <span className="font-orbitron text-[10px] font-bold text-slate-200 tracking-wider">
            100% PRIVATE
          </span>
        </div>
      </div>
    </div>
  );
};
