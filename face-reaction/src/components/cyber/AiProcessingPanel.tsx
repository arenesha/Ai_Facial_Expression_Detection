import React from 'react';

interface AiProcessingPanelProps {
  isFaceDetected: boolean;
  isPlaying: boolean;
}

export const AiProcessingPanel: React.FC<AiProcessingPanelProps> = () => {
  return (
    <div className="relative w-full h-[92px] mx-auto p-[2px] clip-cyber-chamfer bg-[#00e5ff]/80 shadow-[0_0_20px_rgba(0,229,255,0.4)]">
      <div className="relative clip-cyber-chamfer p-2 flex items-center justify-between w-full h-full bg-[#020617]/95 backdrop-blur-md overflow-hidden">
        {/* Wireframe 3D head/profile icon, left side */}
        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-xl bg-[#030817] border border-[#00e5ff]/60 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
          <img
            src="/wireframe_head.jpg"
            alt="AI Wireframe Head"
            className="w-full h-full object-cover filter contrast-125 brightness-120"
          />
          {/* Holographic Scanline Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00e5ff]/20 to-transparent pointer-events-none" />
        </div>

        {/* Right side vertical list: "DETECTING...", "ANALYSING...", "MATCHING...", "REAL TIME" */}
        <div className="relative flex flex-col justify-center gap-1.5 pl-4 flex-1">
          <div className="flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
            <span className="font-orbitron text-[9px] font-black tracking-widest text-[#00e5ff]">
              DETECTING...
            </span>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse" />
            <span className="font-orbitron text-[9px] font-black tracking-widest text-[#00e5ff]">
              ANALYSING...
            </span>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
            <span className="font-orbitron text-[9px] font-black tracking-widest text-[#00e5ff]">
              MATCHING...
            </span>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] animate-pulse" />
            <span className="font-orbitron text-[9px] font-black tracking-widest text-[#00e5ff]">
              REAL TIME
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
