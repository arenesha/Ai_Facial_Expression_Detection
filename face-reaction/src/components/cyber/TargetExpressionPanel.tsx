import React from 'react';
import { Target, Expression, EXPRESSIONS } from '@/types/game';

interface TargetExpressionPanelProps {
  currentTarget: Target | null;
  detectedExpression?: Expression | 'unknown';
  isMatching?: boolean;
}

export const TargetExpressionPanel: React.FC<TargetExpressionPanelProps> = ({
  currentTarget,
  detectedExpression: _detectedExpression,
  isMatching = false,
}) => {
  const current = currentTarget
    ? EXPRESSIONS[currentTarget.expression] || { label: 'HAPPY', emoji: '😊' }
    : { label: 'HAPPY', emoji: '😊' };

  const activeMatch = isMatching;

  return (
    <div className="relative w-full h-[285px] p-[2px] clip-cyber-chamfer bg-[#00e5ff]/80 shadow-[0_0_22px_rgba(0,229,255,0.45)]">
      <div
        className="relative clip-cyber-chamfer p-3 flex flex-col items-center justify-between w-full h-full bg-[#020617]/95 backdrop-blur-md overflow-hidden transition-all duration-300"
        style={activeMatch ? {
          boxShadow: '0 0 35px rgba(0,255,157,0.6), inset 0 0 20px rgba(0,255,157,0.3)',
        } : {}}
      >
        {/* Top Header */}
        <div className="w-full text-center pb-1 pt-1 flex items-center justify-center gap-1.5">
          <span className="text-[#00e5ff] text-xs">🎯</span>
          <h3 className="font-orbitron font-black text-[12px] tracking-[0.15em] uppercase text-[#00e5ff] drop-shadow-[0_0_10px_rgba(0,229,255,1)]">
            TARGET EXPRESSION
          </h3>
        </div>

        {/* Central Circular Radar-Lock Rings with 4 Glowing Star Particles */}
        <div className="relative flex items-center justify-center my-auto w-[140px] h-[140px]">
          {/* Glowing particle stars around target emoji */}
          <span className="absolute top-1 left-2 text-[#00e5ff] text-xs animate-pulse drop-shadow-[0_0_6px_#00e5ff]">✦</span>
          <span className="absolute top-2 right-2 text-[#ff2fa4] text-xs animate-pulse drop-shadow-[0_0_6px_#ff2fa4]">✦</span>
          <span className="absolute bottom-2 left-2 text-[#00e5ff] text-xs animate-pulse drop-shadow-[0_0_6px_#00e5ff]">✦</span>
          <span className="absolute bottom-1 right-2 text-[#ff2fa4] text-xs animate-pulse drop-shadow-[0_0_6px_#ff2fa4]">✦</span>

          {/* Outer Cyan Arc Ring */}
          <svg className="absolute inset-0 w-full h-full text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2.5" fill="none" strokeDasharray="52 18" strokeDashoffset="8" />
            <circle cx="50" cy="6" r="3" fill="#00e5ff" />
            <circle cx="94" cy="50" r="3" fill="#00e5ff" />
            <circle cx="50" cy="94" r="3" fill="#00e5ff" />
            <circle cx="6" cy="50" r="3" fill="#00e5ff" />
          </svg>

          {/* Outer Magenta Side Arc Brackets */}
          <svg className="absolute inset-0 w-full h-full text-[#ff2fa4] drop-shadow-[0_0_10px_#ff2fa4]" viewBox="0 0 100 100">
            <path d="M 12 34 Q 2 50 12 66" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 88 34 Q 98 50 88 66" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>

          {/* Inner Glowing Cyan Ring */}
          <div className="absolute inset-3 rounded-full border-2 border-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.9),inset_0_0_14px_rgba(0,229,255,0.4)] flex items-center justify-center bg-gradient-to-b from-[#0a1835]/90 to-[#020617]" />

          {/* Large Glowing Circular Emoji */}
          <span
            className="relative select-none filter transition-all duration-300 transform z-10"
            style={{
              fontSize: '4.8rem',
              filter: activeMatch
                ? 'drop-shadow(0 0 35px rgba(0,255,157,0.95)) drop-shadow(0 4px 20px rgba(255,200,0,0.85))'
                : 'drop-shadow(0 0 28px rgba(255,200,0,0.85)) drop-shadow(0 4px 14px rgba(0,0,0,0.7))',
            }}
          >
            {current.emoji}
          </span>
        </div>

        {/* Match Label & Expression Name */}
        <div className="text-center pt-0 w-full flex flex-col items-center gap-0">
          <span className="font-orbitron text-[10.5px] tracking-[0.15em] text-[#00e5ff] font-extrabold uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">
            MATCH:
          </span>
          <span
            className="font-orbitron font-black text-[28px] tracking-[0.05em] uppercase transition-colors duration-300 leading-tight text-[#00e5ff] drop-shadow-[0_0_15px_rgba(0,229,255,1)]"
          >
            {current.label}
          </span>
        </div>
      </div>
    </div>
  );
};
