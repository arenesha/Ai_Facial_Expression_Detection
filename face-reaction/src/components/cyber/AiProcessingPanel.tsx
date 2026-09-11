import React from 'react';

interface AiProcessingPanelProps {
  isFaceDetected: boolean;
  isPlaying: boolean;
}

export const AiProcessingPanel: React.FC<AiProcessingPanelProps> = ({
  isFaceDetected,
  isPlaying,
}) => {
  return (
    <div className="hud-panel rounded-2xl p-3 flex items-center justify-between w-full h-full relative overflow-hidden border-cyan-500/40">
      {/* Corner cyber ticks */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00f0ff]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00f0ff]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff]" />

      {/* Holographic 3D Wireframe Head */}
      <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-cyan-500/20">
        <img
          src="/wireframe_head.jpg"
          alt="Holographic Head Wireframe"
          className="w-full h-full object-cover mix-blend-screen filter drop-shadow-[0_0_12px_rgba(0,240,255,0.6)] animate-cyber-pulse"
        />
        {/* Holographic Scanline Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f0ff]/10 to-transparent bg-[length:100%_4px] pointer-events-none" />
      </div>

      {/* Status List with Glowing Indicators */}
      <div className="flex flex-col justify-center gap-2 pl-3 flex-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isFaceDetected ? 'bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]' : 'bg-slate-500'}`} />
          <span className="font-orbitron text-[11px] font-bold tracking-wider text-slate-200">
            DETECTING...
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isFaceDetected ? 'bg-[#00f0ff] shadow-[0_0_8px_#00f0ff] animate-pulse' : 'bg-slate-500'}`} />
          <span className="font-orbitron text-[11px] font-bold tracking-wider text-slate-200">
            ANALYSING...
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]' : 'bg-slate-500'}`} />
          <span className="font-orbitron text-[11px] font-bold tracking-wider text-slate-200">
            MATCHING...
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-ping" />
          <span className="font-orbitron text-[11px] font-bold tracking-wider text-[#00ff88] text-glow-green">
            REAL TIME
          </span>
        </div>
      </div>
    </div>
  );
};
