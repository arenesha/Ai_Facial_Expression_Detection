import React from 'react';
import { Target, Expression } from '@/types/game';

interface TargetExpressionPanelProps {
  currentTarget: Target | null;
}

// Map internal expression keys to reference labels and emojis
const EXPRESSION_MAP: Record<Expression, { label: string; emoji: string }> = {
  smile: { label: 'HAPPY', emoji: '😊' },
  sad: { label: 'SAD', emoji: '😢' },
  surprised: { label: 'SURPRISED', emoji: '😮' },
  angry: { label: 'ANGRY', emoji: '😠' },
  neutral: { label: 'NEUTRAL', emoji: '😐' },
  wink: { label: 'SILLY', emoji: '😜' },
};

export const TargetExpressionPanel: React.FC<TargetExpressionPanelProps> = ({ currentTarget }) => {
  const current = currentTarget
    ? EXPRESSION_MAP[currentTarget.expression] || { label: 'HAPPY', emoji: '😊' }
    : { label: 'HAPPY', emoji: '😊' };

  return (
    <div className="hud-panel rounded-2xl p-4 flex flex-col items-center justify-between w-full h-full relative overflow-hidden border-cyan-500/40">
      {/* Subtle corner cyber notches */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00f0ff]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00f0ff]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff]" />

      {/* Top Header */}
      <div className="w-full text-center pb-2 border-b border-cyan-500/20">
        <h3 className="font-orbitron font-bold text-xs tracking-[0.2em] text-[#00f0ff] uppercase text-glow-cyan">
          TARGET EXPRESSION
        </h3>
      </div>

      {/* Central Circular HUD Reticle */}
      <div className="relative flex items-center justify-center my-3 w-40 h-40">
        {/* Outer glowing cyan segmented ring */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00f0ff]/50 animate-spin-slow" />
        
        {/* Secondary neon pink accent arc ring */}
        <div className="absolute inset-2 rounded-full border border-[#ff007f]/40 animate-spin-slow-reverse" />
        
        {/* Inner solid HUD circle */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-b from-[#0a1b38]/70 to-[#050b1d]/90 border border-cyan-400/40 shadow-[0_0_25px_rgba(0,240,255,0.25)] flex items-center justify-center" />

        {/* Reticle tick marks */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-3 bg-[#ff007f] shadow-[0_0_6px_#ff007f]" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1 w-3 bg-[#ff007f] shadow-[0_0_6px_#ff007f]" />

        {/* Large Central Emoji */}
        <span className="relative text-7xl select-none filter drop-shadow-[0_4px_16px_rgba(255,200,0,0.4)] transform hover:scale-105 transition-transform duration-300">
          {current.emoji}
        </span>
      </div>

      {/* Match Label & Expression Name */}
      <div className="text-center pt-2 w-full border-t border-cyan-500/20 flex flex-col items-center gap-0.5">
        <span className="font-rajdhani text-xs tracking-widest text-slate-400 font-semibold uppercase">
          MATCH:
        </span>
        <span className="font-orbitron font-extrabold text-2xl tracking-wider text-[#00f0ff] text-glow-cyan">
          {current.label}
        </span>
      </div>
    </div>
  );
};
