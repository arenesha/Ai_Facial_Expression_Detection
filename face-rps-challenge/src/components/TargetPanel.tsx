import React from 'react';
import { CyberFrame } from './CyberFrame';
import type { TargetExpression } from '@/types/game';
import { TARGET_EXPRESSIONS } from '@/types/game';

interface TargetPanelProps {
  target: TargetExpression | null;
  isMatched: boolean;
  roundTimeLeft?: number;
}

export const TargetPanel: React.FC<TargetPanelProps> = ({ target, isMatched, roundTimeLeft }) => {
  const currentExpr = target || 'happy';
  const data = TARGET_EXPRESSIONS[currentExpr];

  return (
    <div className="flex flex-col h-full relative">
      <CyberFrame cut="all" color="cyan" className="h-full">
        <div className="flex flex-col items-center justify-between h-full relative p-5 bg-[#020718]/45 backdrop-blur-md">
          
          {/* Header Tab */}
          <div className="text-center pt-2">
            <div className="text-[11px] font-black tracking-[0.25em] text-neon-cyan uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
              TARGET EXPRESSION
            </div>
          </div>

          {/* Glowing Reticle with Emoji */}
          <div className="relative my-auto flex items-center justify-center w-48 h-48">
            {/* Concentric Target Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                {/* Outer Dashed Ring */}
                <circle cx="50" cy="50" r="46" fill="none" stroke={isMatched ? 'var(--neon-green)' : 'var(--neon-cyan)'} strokeWidth="0.75" strokeDasharray="3 3" className="animate-[spin_25s_linear_infinite]" opacity="0.7" />
                {/* Inner Ring */}
                <circle cx="50" cy="50" r="41" fill="none" stroke={isMatched ? 'var(--neon-green)' : 'var(--neon-cyan)'} strokeWidth="1.2" opacity="0.9" />
                {/* Magenta Tick Marks */}
                <path d="M50 0 L50 7 M50 93 L50 100 M0 50 L7 50 M93 50 L100 50" stroke={isMatched ? 'var(--neon-green)' : 'var(--neon-magenta)'} strokeWidth="2.5" strokeLinecap="round" />
                {/* Radial Glow */}
                <circle cx="50" cy="50" r="34" fill={isMatched ? 'rgba(0,255,136,0.15)' : 'rgba(0,240,255,0.06)'} />
              </svg>
            </div>

            {/* Radiant 3D Emoji */}
            <div className={`relative z-10 text-[88px] leading-none select-none transition-transform duration-300 drop-shadow-[0_0_20px_rgba(255,200,0,0.5)] ${isMatched ? 'scale-125 animate-bounce' : ''}`}>
              {data.emoji}
            </div>
          </div>

          {/* Match Label */}
          <div className="flex flex-col items-center gap-1 pb-3">
            <span className={`text-[11px] font-black tracking-[0.25em] uppercase ${isMatched ? 'text-[#00ff88]' : 'text-white/90'}`}>
              {isMatched ? '✔ MATCHED!' : 'MATCH:'}
            </span>
            <span className={`text-2xl font-black tracking-widest uppercase drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] ${isMatched ? 'neon-text-green' : 'neon-text-cyan'}`}>
              {data.label}
            </span>
          </div>
          
        </div>
      </CyberFrame>
    </div>
  );
};
