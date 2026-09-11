import React from 'react';
import { Expression } from '@/types/game';

interface ExpressionGuideProps {
  detectedExpression: Expression | 'unknown';
}

interface GuideItem {
  id: Expression;
  label: string;
  emoji: string;
}

const GUIDE_ITEMS: GuideItem[] = [
  { id: 'smile', label: 'HAPPY', emoji: '😊' },
  { id: 'sad', label: 'SAD', emoji: '😢' },
  { id: 'surprised', label: 'SURPRISED', emoji: '😮' },
  { id: 'angry', label: 'ANGRY', emoji: '😠' },
  { id: 'neutral', label: 'NEUTRAL', emoji: '😐' },
  { id: 'wink', label: 'SILLY', emoji: '😜' },
];

export const ExpressionGuide: React.FC<ExpressionGuideProps> = ({ detectedExpression }) => {
  return (
    <div className="hud-panel rounded-2xl p-3 flex flex-col w-full h-full relative overflow-hidden border-cyan-500/40">
      {/* Corner cyber ticks */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00f0ff]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00f0ff]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00f0ff]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00f0ff]" />

      {/* Header */}
      <div className="w-full text-center pb-1.5 mb-1 border-b border-cyan-500/20">
        <h3 className="font-orbitron font-bold text-xs tracking-[0.2em] text-[#00f0ff] uppercase text-glow-cyan">
          EXPRESSION GUIDE
        </h3>
      </div>

      {/* 2x3 Grid of 6 Expressions - Images Only (no dark square boxes on inactive) */}
      <div className="grid grid-cols-3 gap-2 flex-1 items-center">
        {GUIDE_ITEMS.map((item) => {
          const isActive = detectedExpression === item.id;
          return (
            <div
              key={item.id}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#00f0ff]/15 border-2 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.7)] scale-105 z-10'
                  : 'bg-transparent border border-transparent'
              }`}
            >
              <span
                className={`text-3xl select-none mb-1 filter transition-transform duration-200 ${
                  isActive
                    ? 'scale-110 drop-shadow-[0_0_12px_rgba(0,240,255,0.9)]'
                    : 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] opacity-85 hover:opacity-100'
                }`}
              >
                {item.emoji}
              </span>
              <span
                className={`font-orbitron text-[10px] tracking-wider font-bold uppercase transition-colors ${
                  isActive ? 'text-[#00f0ff] text-glow-cyan font-black' : 'text-slate-300/80'
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
