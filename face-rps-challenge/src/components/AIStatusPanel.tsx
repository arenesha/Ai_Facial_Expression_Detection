import React from 'react';
import { CyberFrame } from './CyberFrame';

interface AIStatusPanelProps {
  isDetecting: boolean;
  faceDetected: boolean;
  isMatched: boolean;
}

export const AIStatusPanel: React.FC<AIStatusPanelProps> = ({
  isDetecting,
  faceDetected,
  isMatched,
}) => {
  const statuses = [
    { label: 'Detecting...', active: isDetecting },
    { label: 'Analysing...', active: isDetecting && faceDetected },
    { label: 'Matching...', active: isDetecting && faceDetected },
    { label: 'Real Time', active: true },
  ];

  return (
    <div className="h-[118px] relative">
      <CyberFrame cut="all" color="cyan" className="h-full">
        <div className="flex items-center gap-4 p-3 h-full bg-[#020718]/45 backdrop-blur-md">
          {/* Wireframe head SVG */}
          <div className="flex-shrink-0 relative">
            <svg
              width="72"
              height="80"
              viewBox="0 0 68 78"
              fill="none"
              className="drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]"
            >
              <ellipse cx="34" cy="32" rx="22" ry="27" stroke="rgba(0,240,255,0.7)" strokeWidth="1" fill="none" strokeDasharray="2 1" />
              <path d="M12 32 Q17 60 34 66 Q51 60 56 32" stroke="rgba(0,240,255,0.6)" strokeWidth="1" fill="none" />
              <line x1="34" y1="5" x2="34" y2="66" stroke="rgba(0,240,255,0.3)" strokeWidth="0.5" />
              <line x1="12" y1="32" x2="56" y2="32" stroke="rgba(0,240,255,0.3)" strokeWidth="0.5" />
              <circle cx="24" cy="27" r="4" stroke="rgba(0,240,255,0.8)" strokeWidth="0.8" fill="none" />
              <circle cx="44" cy="27" r="4" stroke="rgba(0,240,255,0.8)" strokeWidth="0.8" fill="none" />
              <circle cx="24" cy="27" r="1.5" fill="rgba(0,240,255,1)" />
              <circle cx="44" cy="27" r="1.5" fill="rgba(0,240,255,1)" />
              <line x1="34" y1="30" x2="34" y2="42" stroke="rgba(0,240,255,0.5)" strokeWidth="0.5" />
              <path d="M30 42 L34 44 L38 42" stroke="rgba(0,240,255,0.6)" strokeWidth="0.5" fill="none" />
              <path d="M26 48 Q34 53 42 48" stroke="rgba(0,240,255,0.7)" strokeWidth="0.8" fill="none" />
              <ellipse cx="34" cy="32" rx="15" ry="18" stroke="rgba(0,240,255,0.25)" strokeWidth="0.5" fill="none" />
              <line x1="18" y1="14" x2="50" y2="50" stroke="rgba(0,240,255,0.2)" strokeWidth="0.5" />
              <line x1="50" y1="14" x2="18" y2="50" stroke="rgba(0,240,255,0.2)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Status indicators */}
          <div className="flex flex-col gap-2 flex-1 justify-center">
            {statuses.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_rgba(0,240,255,1)]"
                  style={{ animation: 'pulse 1.5s infinite', animationDelay: `${i * 250}ms` }}
                />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-neon-cyan drop-shadow-[0_0_6px_rgba(0,240,255,0.5)]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CyberFrame>
    </div>
  );
};
